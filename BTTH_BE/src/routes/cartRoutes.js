const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController')

// GET    /api/cart           — Lấy giỏ hàng
router.get('/',            protect, getCart)

// POST   /api/cart           — Thêm sản phẩm vào giỏ
router.post('/',           protect, addToCart)

// PUT    /api/cart/:itemId   — Cập nhật số lượng item
router.put('/:itemId',     protect, updateQuantity)

// DELETE /api/cart/:itemId   — Xoá 1 item
router.delete('/:itemId',  protect, removeFromCart)

// DELETE /api/cart           — Xoá toàn bộ giỏ hàng
router.delete('/',         protect, clearCart)

module.exports = router
