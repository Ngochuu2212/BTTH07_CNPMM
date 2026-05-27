const forgotPasswordService = require('../services/forgotPasswordService')

const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp email' })
    }

    await forgotPasswordService.requestPasswordReset(email)

    res.status(200).json({
      status: 'success',
      message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.'
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    })
  }
}

const handleResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập đầy đủ email, mã OTP và mật khẩu mới'
      })
    }

    await forgotPasswordService.resetPassword(email, otp, newPassword)

    res.status(200).json({
      status: 'success',
      message: 'Mật khẩu đã được thay đổi thành công! Bạn có thể đăng nhập bằng mật khẩu mới.'
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    })
  }
}

module.exports = { handleForgotPassword, handleResetPassword }