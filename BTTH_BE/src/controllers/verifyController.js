const verifyService = require('../services/verifyService')

const handleVerifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body
    
    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng cung cấp đầy đủ Email và mã OTP'
      })
    }

    await verifyService.verifyOTP(email, otp)

    res.status(200).json({
      status: 'success',
      message: 'Kích hoạt tài khoản thành công!'
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    })
  }
}

module.exports = { handleVerifyOTP }