const pool = require('../config/db')

// ─── Lấy tất cả mã đang hoạt động ─────────────────────────────────────────────
exports.getAvailableCoupons = async (req, res) => {
  try {
    const [coupons] = await pool.query(`
      SELECT id, code, name, description, discount_type,
             discount_value, max_discount, min_order_amount,
             usage_limit, used_count, expires_at
      FROM promo_coupons
      WHERE is_active = 1
        AND expires_at > NOW()
        AND (usage_limit IS NULL OR used_count < usage_limit)
      ORDER BY expires_at ASC
    `)
    res.json({ coupons })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ─── Kiểm tra & tính toán giá trị mã giảm giá ────────────────────────────────
exports.validateCoupon = async (req, res) => {
  const { code, subtotal } = req.body

  if (!code || !subtotal) {
    return res.status(400).json({ message: 'Thiếu mã hoặc giá trị đơn hàng' })
  }

  try {
    const [[coupon]] = await pool.query(
      `SELECT * FROM promo_coupons WHERE code = ? AND is_active = 1`,
      [code.toUpperCase().trim()]
    )

    if (!coupon) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa' })
    }

    // Kiểm tra hết hạn
    if (new Date(coupon.expires_at) <= new Date()) {
      return res.status(400).json({ message: `Mã "${coupon.code}" đã hết hạn vào ${new Date(coupon.expires_at).toLocaleDateString('vi-VN')}` })
    }

    // Kiểm tra giới hạn sử dụng
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: `Mã "${coupon.code}" đã hết lượt sử dụng` })
    }

    // Kiểm tra đơn tối thiểu
    if (subtotal < coupon.min_order_amount) {
      return res.status(400).json({
        message: `Đơn hàng cần tối thiểu ${Number(coupon.min_order_amount).toLocaleString('vi-VN')}đ để dùng mã này (hiện tại: ${Number(subtotal).toLocaleString('vi-VN')}đ)`
      })
    }

    // Tính số tiền được giảm
    let discountAmount = 0
    if (coupon.discount_type === 'percent') {
      discountAmount = Math.round(subtotal * coupon.discount_value / 100)
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount)
      }
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(coupon.discount_value, subtotal)
    } else if (coupon.discount_type === 'freeship') {
      discountAmount = coupon.discount_value // = phí ship cố định
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_discount: coupon.max_discount,
      },
      discount_amount: discountAmount,
      message: `✅ Áp dụng thành công! Giảm ${Number(discountAmount).toLocaleString('vi-VN')}đ`
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}
