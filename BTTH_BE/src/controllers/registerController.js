const registerService = require('../services/registerService')

const handleRegistration = async (req, res) => {
  try {
    await registerService.processNewRegistration(req.body)
    
    res.status(201).json({ 
      status: 'success',
      message: 'Đăng ký thành công! Một mã OTP đã được gửi đến email của bạn để kích hoạt tài khoản.' 
    })

  } catch (error) {
    const statusCode = error.statusCode || 500
    
    res.status(statusCode).json({ 
      status: 'error',
      message: error.message || 'Đã có lỗi xảy ra trong quá trình đăng ký'
    })
  }
}

module.exports = { handleRegistration }