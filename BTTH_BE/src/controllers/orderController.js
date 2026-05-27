const pool = require('../config/db')

// ─── HELPER: Tự động xác nhận đơn hàng sau 30 phút ──────────────────────────
const autoConfirmOldOrders = async (userId) => {
  await pool.query(`
    UPDATE orders
    SET status = 'confirmed'
    WHERE user_id = ?
      AND status = 'pending'
      AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 30
  `, [userId])
}

// ─── HELPER: Kiểm tra điều kiện hủy đơn ─────────────────────────────────────
const checkCancelEligibility = (order) => {
  const diffMins = (Date.now() - new Date(order.created_at)) / 60000

  if (['delivered', 'cancelled', 'cancel_requested'].includes(order.status)) {
    return { canCancel: false, isRequestOnly: false, reason: 'Đơn hàng không thể hủy ở trạng thái này' }
  }
  if (order.status === 'shipping') {
    return { canCancel: false, isRequestOnly: false, reason: 'Không thể hủy đơn hàng đang giao' }
  }
  if (order.status === 'preparing') {
    return { canCancel: true, isRequestOnly: true, reason: null }
  }
  // pending hoặc confirmed: trong 30 phút
  if (diffMins > 30) {
    return { canCancel: false, isRequestOnly: false, reason: 'Đã quá 30 phút, không thể hủy đơn hàng' }
  }
  return { canCancel: true, isRequestOnly: false, reason: null }
}

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const statusFilter = req.query.status || null

  try {
    await autoConfirmOldOrders(userId)

    let whereClause = 'WHERE o.user_id = ?'
    const queryParams = [userId]
    if (statusFilter && statusFilter !== 'all') {
      whereClause += ' AND o.status = ?'
      queryParams.push(statusFilter)
    }

    const [orders] = await pool.query(
      `SELECT o.*,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_brand', oi.product_brand,
            'price', oi.price,
            'quantity', oi.quantity,
            'size', oi.size,
            'product_image', p.image_url
          )
        ) FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id) AS items
       FROM orders o
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o ${whereClause}`,
      queryParams
    )

    const [statusCounts] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM orders WHERE user_id = ? GROUP BY status`,
      [userId]
    )

    const parsed = orders.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []),
      cancelEligibility: checkCancelEligibility(o)
    }))

    res.json({
      orders: parsed,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusCounts: Object.fromEntries(statusCounts.map(s => [s.status, Number(s.count)]))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ─── GET ORDER BY ID ──────────────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  try {
    await autoConfirmOldOrders(userId)

    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

    const [items] = await pool.query(
      `SELECT oi.*, p.image_url AS product_image
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [id]
    )
    const cancelEligibility = checkCancelEligibility(order)
    res.json({ order: { ...order, items }, cancelEligibility })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const userId = req.user.id
  const {
    payment_method = 'cod',
    shipping_address,
    note = '',
    selected_item_ids,  // optional: array of cart_item ids; if omitted → use all
    coupon_code = null  // mã giảm giá (promo_coupons)
  } = req.body

  if (!shipping_address || !shipping_address.name || !shipping_address.phone || !shipping_address.address) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin giao hàng' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // 1. Lấy cart items
    let cartQuery = `
      SELECT ci.*, p.name AS product_name, p.brand AS product_brand,
             p.price, p.image_url AS product_image
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?`
    const params = [userId]

    if (selected_item_ids && selected_item_ids.length > 0) {
      cartQuery += ` AND ci.id IN (${selected_item_ids.map(() => '?').join(',')})`
      params.push(...selected_item_ids)
    }

    const [cartItems] = await conn.query(cartQuery, params)
    if (cartItems.length === 0) {
      await conn.rollback()
      return res.status(400).json({ message: 'Giỏ hàng trống hoặc sản phẩm không tồn tại' })
    }

    // 2. Tính tổng tiền
    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // 2b. Áp dụng mã giảm giá nếu có
    let couponDiscount = 0
    let validCoupon = null
    if (coupon_code) {
      const [[coupon]] = await conn.query(
        `SELECT * FROM promo_coupons WHERE code = ? AND is_active = 1 AND expires_at > NOW()
           AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [coupon_code.toUpperCase().trim()]
      )
      if (coupon && subtotal >= coupon.min_order_amount) {
        validCoupon = coupon
        if (coupon.discount_type === 'percent') {
          couponDiscount = Math.round(subtotal * coupon.discount_value / 100)
          if (coupon.max_discount) couponDiscount = Math.min(couponDiscount, coupon.max_discount)
        } else if (coupon.discount_type === 'fixed') {
          couponDiscount = Math.min(coupon.discount_value, subtotal)
        } else if (coupon.discount_type === 'freeship') {
          couponDiscount = coupon.discount_value // giảm phí ship
        }
      }
    }
    const total_amount = Math.max(0, subtotal - (validCoupon?.discount_type !== 'freeship' ? couponDiscount : 0))

    // 3. Tạo đơn hàng
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, payment_method, total_amount, shipping_address, note)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, payment_method, total_amount, JSON.stringify(shipping_address), note]
    )
    const orderId = orderResult.insertId

    // 4. Tạo order_items — dùng individual inserts để tránh lỗi VALUES ? với promise pool
    for (const i of cartItems) {
      await conn.query(
        `INSERT INTO order_items
           (order_id, product_id, product_name, product_brand, price, quantity, size)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, i.product_id, i.product_name, i.product_brand || null,
          i.price, i.quantity, i.size || null]
      )
    }

    // 4b. Tăng used_count của coupon
    if (validCoupon) {
      await conn.query('UPDATE promo_coupons SET used_count = used_count + 1 WHERE id = ?', [validCoupon.id])
    }

    // 5. Xoá cart items đã order
    if (selected_item_ids && selected_item_ids.length > 0) {
      await conn.query(
        `DELETE FROM cart_items WHERE id IN (${selected_item_ids.map(() => '?').join(',')}) AND user_id = ?`,
        [...selected_item_ids, userId]
      )
    } else {
      await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId])
    }

    await conn.commit()

    // 6. Trả về đơn hàng mới
    const [[newOrder]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId])
    const [orderItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId])

    // Tính cart count còn lại
    const [[{ remainCount }]] = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) AS remainCount FROM cart_items WHERE user_id = ?',
      [userId]
    )

    res.status(201).json({ order: { ...newOrder, items: orderItems }, cartCount: Number(remainCount) })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng' })
  } finally {
    conn.release()
  }
}

// ─── ADMIN: Cập nhật trạng thái đơn hàng + tự động +1 sold khi delivered ─────────
exports.adminUpdateOrderStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const allowedStatuses = ['confirmed', 'preparing', 'shipping', 'delivered', 'cancelled']

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
  }

  try {
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id])
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id])

    // +1 sold cho từng sản phẩm trong đơn khi chuyển sang delivered
    if (status === 'delivered' && order.status !== 'delivered') {
      const [items] = await pool.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]
      )
      for (const item of items) {
        await pool.query(
          'UPDATE products SET sold = sold + ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }
    }

    res.json({ message: 'Cập nhật trạng thái thành công', status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ─── CANCEL ORDER ──────────────────────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  const { reason = '' } = req.body

  try {
    const [[order]] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

    const { canCancel, isRequestOnly, reason: errReason } = checkCancelEligibility(order)
    if (!canCancel) return res.status(400).json({ message: errReason })

    const newStatus = isRequestOnly ? 'cancel_requested' : 'cancelled'
    const noteUpdate = reason
      ? `${order.note ? order.note + '\n' : ''}[Lý do hủy]: ${reason}`
      : order.note

    await pool.query(
      'UPDATE orders SET status = ?, note = ? WHERE id = ?',
      [newStatus, noteUpdate, id]
    )

    res.json({
      message: isRequestOnly ? 'Đã gửi yêu cầu hủy đơn hàng đến shop' : 'Đã hủy đơn hàng thành công',
      status: newStatus
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}
