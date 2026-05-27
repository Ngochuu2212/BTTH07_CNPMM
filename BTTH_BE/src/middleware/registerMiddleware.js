const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')

const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { 
    status: 429, 
    message: 'Bạn đã thực hiện quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 15 phút' 
  },
  standardHeaders: true,
  legacyHeaders: false
})

const validateRegisterInput = [
  body('username')
    .trim()
    .notEmpty().withMessage('Tên người dùng không được để trống')
    .isLength({ min: 3 }).withMessage('Tên người dùng phải có ít nhất 3 ký tự'),
    
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
      })
    }
    next() 
  }
]

module.exports = { registerRateLimiter, validateRegisterInput }