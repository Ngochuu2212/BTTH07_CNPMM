const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  adminUpdateOrderStatus
} = require('../controllers/orderController')

router.use(protect)

router.get('/', getMyOrders)
router.get('/:id', getOrderById)
router.post('/', createOrder)
router.patch('/:id/cancel', cancelOrder)
router.patch('/:id/status', adminUpdateOrderStatus)

module.exports = router
