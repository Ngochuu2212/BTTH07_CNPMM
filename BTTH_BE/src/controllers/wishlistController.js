const db = require('../config/db')

const parseProduct = (p) => ({
  ...p,
  tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || [])
})

/** GET /api/wishlist — lấy danh sách sản phẩm yêu thích */
const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user.id
    const [rows] = await db.execute(`
      SELECT p.*, w.created_at AS wishlisted_at
      FROM wishlists w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId])
    res.json({ status: 'success', data: rows.map(parseProduct) })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

/** POST /api/wishlist/:productId — toggle yêu thích (thêm/bỏ) */
const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId } = req.params

    const [existing] = await db.execute(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )

    if (existing.length > 0) {
      await db.execute('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId])
      res.json({ status: 'success', wishlisted: false, message: 'Đã xóa khỏi danh sách yêu thích' })
    } else {
      await db.execute('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, productId])
      res.json({ status: 'success', wishlisted: true, message: 'Đã thêm vào danh sách yêu thích' })
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

/** GET /api/wishlist/check/:productId — kiểm tra sản phẩm có trong wishlist không */
const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId } = req.params
    const [rows] = await db.execute(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )
    res.json({ status: 'success', wishlisted: rows.length > 0 })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

/** GET /api/wishlist/history — lịch sử sản phẩm đã xem */
const getViewHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const [rows] = await db.execute(`
      SELECT p.*, vh.viewed_at
      FROM view_history vh
      JOIN products p ON p.id = vh.product_id
      WHERE vh.user_id = ?
      ORDER BY vh.viewed_at DESC
      LIMIT 20
    `, [userId])
    res.json({ status: 'success', data: rows.map(parseProduct) })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

module.exports = { getMyWishlist, toggleWishlist, checkWishlist, getViewHistory }
