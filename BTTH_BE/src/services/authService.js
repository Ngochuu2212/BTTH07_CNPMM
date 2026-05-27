const userRepository = require('../repositories/userRepository')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email)
  if (!user) {
    const error = new Error('Email hoặc mật khẩu không chính xác')
    error.statusCode = 401
    throw error
  }

  if (!user.is_active) {
    const error = new Error('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.')
    error.statusCode = 403
    throw error
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không chính xác')
    error.statusCode = 401
    throw error
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' })

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  }
}

module.exports = { login }