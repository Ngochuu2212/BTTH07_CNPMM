const pool = require('../config/db')

const POINTS_PER_REVIEW = 50   // Điểm thưởng mỗi lần đánh giá

// ─── POST /api/reviews  ───────────────────────────────────────────────────────
// Gửi đánh giá (chỉ được đánh giá đơn hàng đã giao - status = delivered)
exports.submitReview = async (req, res) => {
  const userId = req.user.id
  const { order_id, product_id, rating, comment = '' } = req.body

  // Validate đầu vào
  if (!order_id || !product_id || !rating) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đánh giá' })
  }
  const ratingNum = parseInt(rating)
  if (ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5 sao' })
  }

  try {
    // 1. Kiểm tra đơn hàng thuộc user và đã giao
    const [[order]] = await pool.query(
      'SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = "delivered"',
      [order_id, userId]
    )
    if (!order) {
      return res.status(403).json({ message: 'Chỉ có thể đánh giá đơn hàng đã được giao thành công' })
    }

    // 2. Kiểm tra sản phẩm có thuộc đơn hàng này không
    const [[item]] = await pool.query(
      'SELECT id FROM order_items WHERE order_id = ? AND product_id = ?',
      [order_id, product_id]
    )
    if (!item) {
      return res.status(400).json({ message: 'Sản phẩm không thuộc đơn hàng này' })
    }

    // 3. Kiểm tra đã đánh giá chưa
    const [[existing]] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND order_id = ? AND product_id = ?',
      [userId, order_id, product_id]
    )
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi' })
    }

    // 4. Lưu đánh giá
    const [reviewResult] = await pool.query(
      'INSERT INTO reviews (user_id, order_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, order_id, product_id, ratingNum, comment.trim()]
    )

    // 5. Cộng điểm tích lũy
    await pool.query(
      'INSERT INTO user_points (user_id, points, source, ref_id) VALUES (?, ?, "review", ?)',
      [userId, POINTS_PER_REVIEW, reviewResult.insertId]
    )

    // 6. Lấy tổng điểm hiện tại
    const [[{ totalPoints }]] = await pool.query(
      'SELECT COALESCE(SUM(points), 0) AS totalPoints FROM user_points WHERE user_id = ?',
      [userId]
    )

    res.status(201).json({
      message: 'Cảm ơn bạn đã đánh giá!',
      points_earned: POINTS_PER_REVIEW,
      total_points: Number(totalPoints)
    })
  } catch (err) {
    console.error('submitReview error:', err)
    res.status(500).json({ message: 'Lỗi server khi gửi đánh giá' })
  }
}

// ─── GET /api/reviews/order/:orderId/status ───────────────────────────────────
// Kiểm tra user đã đánh giá sản phẩm nào trong đơn hàng rồi
exports.getOrderReviewStatus = async (req, res) => {
  const userId  = req.user.id
  const { orderId } = req.params
  try {
    const [reviewed] = await pool.query(
      'SELECT product_id FROM reviews WHERE user_id = ? AND order_id = ?',
      [userId, orderId]
    )
    const [[{ totalPoints }]] = await pool.query(
      'SELECT COALESCE(SUM(points), 0) AS totalPoints FROM user_points WHERE user_id = ?',
      [userId]
    )
    res.json({
      reviewed_product_ids: reviewed.map(r => r.product_id),
      total_points: Number(totalPoints)
    })
  } catch (err) {
    console.error('getOrderReviewStatus error:', err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ─── GET /api/reviews/my-points ───────────────────────────────────────────────
// Lấy tổng điểm tích lũy
exports.getMyPoints = async (req, res) => {
  const userId = req.user.id
  try {
    const [[{ totalPoints }]] = await pool.query(
      'SELECT COALESCE(SUM(points), 0) AS totalPoints FROM user_points WHERE user_id = ?',
      [userId]
    )
    res.json({ total_points: Number(totalPoints) })
  } catch (err) {
    console.error('getMyPoints error:', err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ─── POST /api/reviews/use-points ────────────────────────────────────────────
// Trừ điểm khi sử dụng cho đơn hàng
exports.usePoints = async (req, res) => {
  const userId = req.user.id
  const { points_used, order_id } = req.body
  if (!points_used || points_used <= 0) {
    return res.status(400).json({ message: 'Số điểm không hợp lệ' })
  }
  try {
    const [[{ totalPoints }]] = await pool.query(
      'SELECT COALESCE(SUM(points), 0) AS totalPoints FROM user_points WHERE user_id = ?',
      [userId]
    )
    if (Number(totalPoints) < points_used) {
      return res.status(400).json({ message: 'Không đủ điểm để sử dụng' })
    }
    await pool.query(
      'INSERT INTO user_points (user_id, points, source, ref_id) VALUES (?, ?, "order", ?)',
      [userId, -points_used, order_id || null]
    )
    res.json({ remaining_points: Number(totalPoints) - points_used })
  } catch (err) {
    console.error('usePoints error:', err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

// ─── GET /api/reviews/product/:productId ─────────────────────────────────────
// Lấy tất cả đánh giá của 1 sản phẩm (công khai, không cần đăng nhập)
exports.getProductReviews = async (req, res) => {
  const { productId } = req.params
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.username, u.full_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [productId]
    )
    const [[{ avgRating, totalReviews }]] = await pool.query(
      `SELECT ROUND(AVG(rating), 1) AS avgRating, COUNT(*) AS totalReviews
       FROM reviews WHERE product_id = ?`,
      [productId]
    )
    res.json({
      reviews,
      avgRating: Number(avgRating || 0),
      totalReviews: Number(totalReviews)
    })
  } catch (err) {
    console.error('getProductReviews error:', err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}
