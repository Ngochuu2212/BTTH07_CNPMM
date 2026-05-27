const bcrypt = require('bcrypt')
const userRepository = require('../repositories/userRepository')
const mailService = require('./mailService')
const { generateOTP } = require('../utils/otpGenerator')

const processNewRegistration = async (userData) => {
  const userExists = await userRepository.findByEmail(userData.email)
  
  if (userExists) {
    const error = new Error('Email đã được sử dụng trong hệ thống.')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await bcrypt.hash(userData.password, 8)
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60000)

  await mailService.sendActivationEmail(userData.email, otp)

  return await userRepository.savePendingUser(
    { ...userData, password: hashedPassword },
    otp,
    expiresAt
  )
}

module.exports = { processNewRegistration }