const express = require('express')
const router = express.Router()
const verifyController = require('../controllers/verifyController')
const registerController = require('../controllers/registerController')
const forgotPasswordController = require('../controllers/forgotPasswordController')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const { registerRateLimiter, validateRegisterInput } = require('../middleware/registerMiddleware')
const { loginRateLimiter, validateLoginInput } = require('../middleware/loginMiddleware')

router.post('/register', 
    registerRateLimiter,      
    validateRegisterInput,   
    registerController.handleRegistration
)

router.post('/verify-otp', verifyController.handleVerifyOTP)

router.post('/forgot-password', forgotPasswordController.handleForgotPassword)

router.post('/reset-password', forgotPasswordController.handleResetPassword)

router.post('/login', 
  loginRateLimiter, 
  validateLoginInput, 
  authController.handleLogin
)

router.put('/update-profile', protect, userController.handleUpdateProfile)
router.post('/upload-avatar', protect, userController.uploadMiddleware, userController.handleUploadAvatar)
module.exports = router