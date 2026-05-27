const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  let token

  // Kiểm tra Token trong Header (thường gửi dạng: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Bạn cần đăng nhập để thực hiện chức năng này'
    })
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded 
    next()
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ hoặc đã hết hạn'
    })
  }
}

module.exports = { protect }