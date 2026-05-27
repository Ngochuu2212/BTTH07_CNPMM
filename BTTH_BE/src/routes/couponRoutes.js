const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getAvailableCoupons, validateCoupon } = require('../controllers/couponController')

router.use(protect)

router.get('/', getAvailableCoupons)          // GET  /api/coupons
router.post('/validate', validateCoupon)       // POST /api/coupons/validate

module.exports = router
