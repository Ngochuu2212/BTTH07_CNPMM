const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  submitReview,
  getOrderReviewStatus,
  getMyPoints,
  getProductReviews,
  usePoints
} = require('../controllers/reviewController')

// Route công khai (không cần đăng nhập)
router.get('/product/:productId', getProductReviews)

// Các route yêu cầu đăng nhập
router.use(protect)
router.post('/', submitReview)
router.get('/order/:orderId/status', getOrderReviewStatus)
router.get('/my-points', getMyPoints)
router.post('/use-points', usePoints)

module.exports = router
