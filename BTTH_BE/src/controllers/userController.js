const path = require('path')
const multer = require('multer')
const userRepository = require('../repositories/userRepository')
const userService = require('../services/userService')

// Cấu hình multer lưu file vào uploads/avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Chỉ chấp nhận file ảnh!'))
  }
})

const uploadMiddleware = upload.single('avatar')

const handleUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body
    const updatedUser = await userService.updateUserInfo(userId, updateData)
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thông tin cá nhân thành công!',
      data: { user: updatedUser }
    })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
}

const handleUploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'error', message: 'Không có file ảnh nào được gửi lên' })
    const userId = req.user.id
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    await userRepository.updateAvatar(userId, avatarUrl)
    const updatedUser = await userRepository.findById(userId)
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật avatar thành công!',
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          phone_number: updatedUser.phone_number,
          role: updatedUser.role,
          avatar_url: updatedUser.avatar_url || null
        }
      }
    })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
}

module.exports = { handleUpdateProfile, handleUploadAvatar, uploadMiddleware }