const pool = require('../config/db')

// ─── GET CART ─────────────────────────────────────────────────────────────────
// GET /api/cart
// Lấy toàn bộ items trong giỏ của user hiện tại, JOIN với bảng products
const getCart = async (req, res) => {
  const userId = req.user.id
  try {
    const [rows] = await pool.query(
      `SELECT
         ci.id,
         ci.product_id,
         ci.quantity,
         ci.size,
         ci.created_at,
         p.name,
         p.brand,
         p.price,
         p.original_price,
         p.image_url,
         p.gradient,
         p.accent,
         p.stock,
         p.rating,
         p.reviews,
         p.sold
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId]
    )

    const totalCount = rows.reduce((sum, r) => sum + r.quantity, 0)

    return res.status(200).json({
      status: 'success',
      data: { items: rows, totalCount }
    })
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message })
  }
}

// ─── ADD TO CART ──────────────────────────────────────────────────────────────
// POST /api/cart
// Body: { product_id, quantity?, size? }
// Nếu item đã tồn tại (same product + size) thì cộng thêm quantity
const addToCart = async (req, res) => {
  const userId = req.user.id
  const { product_id, quantity = 1, size = null } = req.body

  if (!product_id) {
    return res.status(400).json({ status: 'error', message: 'Thiếu product_id' })
  }

  try {
    // Kiểm tra sản phẩm tồn tại
    const [products] = await pool.query('SELECT id, stock FROM products WHERE id = ?', [product_id])
    if (products.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' })
    }

    // INSERT hoặc cộng quantity nếu đã có
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity, size)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         quantity  = quantity + VALUES(quantity),
         updated_at = NOW()`,
      [userId, product_id, quantity, size]
    )

    // Trả về tổng số lượng item trong giỏ
    const [[{ total }]] = await pool.query(
      'SELECT SUM(quantity) AS total FROM cart_items WHERE user_id = ?',
      [userId]
    )

    return res.status(200).json({
      status: 'success',
      message: 'Đã thêm vào giỏ hàng',
      data: { totalCount: total || 0 }
    })
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message })
  }
}

// ─── UPDATE QUANTITY ──────────────────────────────────────────────────────────
// PUT /api/cart/:itemId
// Body: { quantity }
const updateQuantity = async (req, res) => {
  const userId  = req.user.id
  const itemId  = req.params.itemId
  const { quantity } = req.body

  if (!quantity || quantity < 1) {
    return res.status(400).json({ status: 'error', message: 'Số lượng phải >= 1' })
  }

  try {
    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [quantity, itemId, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy item trong giỏ' })
    }

    const [[{ total }]] = await pool.query(
      'SELECT SUM(quantity) AS total FROM cart_items WHERE user_id = ?',
      [userId]
    )

    return res.status(200).json({
      status: 'success',
      message: 'Đã cập nhật số lượng',
      data: { totalCount: total || 0 }
    })
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message })
  }
}

// ─── REMOVE ITEM ──────────────────────────────────────────────────────────────
// DELETE /api/cart/:itemId
const removeFromCart = async (req, res) => {
  const userId = req.user.id
  const itemId = req.params.itemId

  try {
    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy item trong giỏ' })
    }

    const [[{ total }]] = await pool.query(
      'SELECT SUM(quantity) AS total FROM cart_items WHERE user_id = ?',
      [userId]
    )

    return res.status(200).json({
      status: 'success',
      message: 'Đã xoá sản phẩm khỏi giỏ hàng',
      data: { totalCount: total || 0 }
    })
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message })
  }
}

// ─── CLEAR CART ───────────────────────────────────────────────────────────────
// DELETE /api/cart
const clearCart = async (req, res) => {
  const userId = req.user.id

  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId])
    return res.status(200).json({
      status: 'success',
      message: 'Đã xoá toàn bộ giỏ hàng',
      data: { totalCount: 0 }
    })
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message })
  }
}

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart }
