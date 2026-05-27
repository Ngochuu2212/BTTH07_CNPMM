const authService = require('../services/authService')

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)

    const redirectUrl = result.user.role === 'admin' ? '/admin/profile' : '/'

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        ...result,
        redirectUrl
      }
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message })
  }
}

module.exports = { handleLogin }