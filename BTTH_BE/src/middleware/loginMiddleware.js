const rateLimit = require('express-rate-limit')

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    status: 'error',
    message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Vui lòng nhập đầy đủ email và mật khẩu'
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Định dạng email không hợp lệ'
    })
  }

  next()
}

module.exports = { loginRateLimiter, validateLoginInput }