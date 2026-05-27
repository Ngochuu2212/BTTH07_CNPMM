const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getProducts, getProductById, getCategories, getTopSellers, getMostViewed, incrementView } = require('../controllers/productController')

// Cần đăng nhập để xem sản phẩm
router.get('/',              protect, getProducts)
router.get('/categories',    protect, getCategories)
router.get('/top-sellers',   protect, getTopSellers)
router.get('/most-viewed',   protect, getMostViewed)
router.get('/:id',           protect, getProductById)
router.post('/:id/view',     protect, incrementView)

module.exports = router
