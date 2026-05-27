const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getMyWishlist, toggleWishlist, checkWishlist, getViewHistory } = require('../controllers/wishlistController')

router.use(protect)

router.get('/', getMyWishlist)
router.get('/history', getViewHistory)
router.get('/check/:productId', checkWishlist)
router.post('/:productId', toggleWishlist)

module.exports = router
