const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
})

const sendActivationEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Shoes Management" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mã OTP kích hoạt tài khoản người dùng',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
        <h2 style="color: #2c3e50; text-align: center;">Xác thực đăng ký tài khoản</h2>
        <p>Chào bạn,</p>
        <p>Bạn đang thực hiện đăng ký tài khoản tại <b>Hệ thống Quản lý Giày Dép</b>. Mã OTP của bạn là:</p>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #e74c3c; border-radius: 5px;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">Mã này có hiệu lực trong vòng <b>10 phút</b>. Vui lòng không cung cấp mã này cho bất kỳ ai khác.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #7f8c8d; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
      </div>
    `
  }

  return await transporter.sendMail(mailOptions)
}

module.exports = { sendActivationEmail }
