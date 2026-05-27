const userRepository = require('../repositories/userRepository')
const mailService = require('./mailService')
const { generateOTP } = require('../utils/otpGenerator')
const bcrypt = require('bcrypt')

const requestPasswordReset = async (email) => {
  // 1. Kiểm tra người dùng có tồn tại không
  const user = await userRepository.findByEmail(email)
  if (!user) {
    const error = new Error('Email không tồn tại trong hệ thống')
    error.statusCode = 404
    throw error
  }

  // 2. Tạo mã OTP 6 số và thời gian hết hạn (10 phút)
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60000)

  // 3. Lưu OTP vào database
  await userRepository.updateOTPByEmail(email, otp, expiresAt)

  // 4. Gửi email (Gửi ngầm không dùng await để nhanh hơn)
  mailService.sendActivationEmail(email, otp).catch(err => console.error('Lỗi gửi mail quên mật khẩu:', err))

  return true
}

const resetPassword = async (email, otp, newPassword) => {
  const user = await userRepository.findByEmail(email)

  // 1. Kiểm tra người dùng và mã OTP
  if (!user || user.otp_code !== otp) {
    const error = new Error('Mã OTP không chính xác hoặc không tồn tại')
    error.statusCode = 400
    throw error
  }

  // 2. Kiểm tra thời hạn OTP
  if (new Date() > new Date(user.otp_expires_at)) {
    const error = new Error('Mã OTP đã hết hạn, vui lòng yêu cầu mã mới')
    error.statusCode = 400
    throw error
  }

  // 3. Mã hóa mật khẩu mới (Salt rounds = 10)
  const hashedPassword = await bcrypt.hash(newPassword, 8)

  // 4. Lưu vào database
  return await userRepository.resetPassword(email, hashedPassword)
}

module.exports = { requestPasswordReset, resetPassword }