const pool = require('../config/db')

/**
 * GET /api/products
 * Query params:
 *   - page     : số trang (mặc định 1)
 *   - limit    : số sản phẩm/trang (mặc định 8)
 *   - category : 'all' | 'running' | 'lifestyle' | 'skateboarding' (mặc định 'all')
 *   - sort     : 'default' | 'price-asc' | 'price-desc' | 'rating-desc' | 'sold-desc'
 */
const getProducts = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1)
    const limit    = Math.min(50, Math.max(1, parseInt(req.query.limit) || 8))
    const category = req.query.category || 'all'
    const sort     = req.query.sort || 'default'
    const offset   = (page - 1) * limit

    // ── WHERE ─────────────────────────────────────────────────────────────
    const whereParams = []
    let   whereSql    = ''
    if (category !== 'all') {
      whereSql = 'WHERE category = ?'
      whereParams.push(category)
    }

    // ── ORDER BY ──────────────────────────────────────────────────────────
    const ORDER_MAP = {
      'price-asc'   : 'price ASC',
      'price-desc'  : 'price DESC',
      'rating-desc' : 'rating DESC, reviews DESC',
      'sold-desc'   : 'sold DESC'
    }
    const orderSql = `ORDER BY ${ORDER_MAP[sort] || 'id ASC'}`

    // ── QUERIES ───────────────────────────────────────────────────────────
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM products ${whereSql}`,
      whereParams
    )
    const total = countRows[0].total

    const [rows] = await pool.query(
      `SELECT * FROM products ${whereSql} ${orderSql} LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    )

    // Parse tags JSON (MySQL trả về string)
    const products = rows.map(p => ({
      ...p,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags
    }))

    return res.json({
      success : true,
      data    : products,
      pagination: {
        page,
        limit,
        total,
        totalPages : Math.ceil(total / limit),
        hasMore    : page * limit < total
      }
    })
  } catch (err) {
    console.error('[productController] getProducts:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/products/categories
 * Trả về danh sách danh mục kèm số lượng sản phẩm
 */
const getCategories = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT category, category_label, COUNT(*) AS count
       FROM products
       GROUP BY category, category_label
       ORDER BY count DESC`
    )
    const [totalRow] = await pool.query('SELECT COUNT(*) AS count FROM products')
    const result = [
      { id: 'all', label: '🏠 Tất cả', count: totalRow[0].count },
      ...rows.map(r => ({ id: r.category, label: r.category_label, count: r.count }))
    ]
    return res.json({ success: true, data: result })
  } catch (err) {
    console.error('[productController] getCategories:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/products/top-sellers
 * Trả về top 10 sản phẩm bán chạy nhất (sắp xếp theo sold DESC)
 */
const getTopSellers = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products ORDER BY sold DESC LIMIT 10'
    )
    const data = rows.map(p => ({
      ...p,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags
    }))
    return res.json({ success: true, data })
  } catch (err) {
    console.error('[productController] getTopSellers:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/products/most-viewed
 * Trả về top 10 sản phẩm được xem nhiều nhất (sắp xếp theo views DESC)
 */
const getMostViewed = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products ORDER BY views DESC LIMIT 10'
    )
    const data = rows.map(p => ({
      ...p,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags
    }))
    return res.json({ success: true, data })
  } catch (err) {
    console.error('[productController] getMostViewed:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/products/:id
 * Lấy chi tiết 1 sản phẩm theo ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })
    }

    // Đếm số lượng bình luận thực tế từ bảng reviews
    const [[reviewRow]] = await pool.query(
      'SELECT COUNT(*) AS review_count, ROUND(AVG(rating), 1) AS avg_rating FROM reviews WHERE product_id = ?', [id]
    )

    // Kiểm tra wishlist
    let is_wishlisted = false
    if (req.user) {
      const [wRows] = await pool.query(
        'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, id]
      )
      is_wishlisted = wRows.length > 0
    }

    const product = {
      ...rows[0],
      tags: typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : rows[0].tags,
      review_count: reviewRow.review_count || 0,
      avg_rating: reviewRow.avg_rating || 0,
      is_wishlisted
    }
    return res.json({ success: true, data: product })
  } catch (err) {
    console.error('[productController] getProductById:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/products/:id/view
 * Tăng lượt xem của sản phẩm lên 1
 */
const incrementView = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('UPDATE products SET views = views + 1 WHERE id = ?', [id])
    // Ghi lịch sử xem nếu user đã đăng nhập
    if (req.user) {
      await pool.query(`
        INSERT INTO view_history (user_id, product_id, viewed_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE viewed_at = NOW()
      `, [req.user.id, id])
    }
    return res.json({ success: true })
  } catch (err) {
    console.error('[productController] incrementView:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getProducts, getProductById, getCategories, getTopSellers, getMostViewed, incrementView }
