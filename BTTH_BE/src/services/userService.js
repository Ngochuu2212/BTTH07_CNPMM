const userRepository = require('../repositories/userRepository')
const bcrypt = require('bcrypt')

const updateUserInfo = async (userId, updateData) => {
  // 1. Lấy thông tin hiện tại của user để giữ lại các trường không thay đổi
  const currentUser = await userRepository.findById(userId)
  if (!currentUser) throw new Error('Người dùng không tồn tại')

  // 2. Chuẩn bị dữ liệu mới (nếu client không gửi trường nào thì giữ lại giá trị cũ)
  const finalData = {
    username: updateData.username || currentUser.username,
    full_name: updateData.full_name || currentUser.full_name,
    phone_number: updateData.phone_number || currentUser.phone_number,
    password: currentUser.password // Mặc định dùng pass cũ
  }

  // 3. Nếu có mật khẩu mới, hãy mã hóa nó
  if (updateData.password) {
    finalData.password = await bcrypt.hash(updateData.password, 8)
  }

  await userRepository.updateProfile(userId, finalData)

  // Lấy lại thông tin user mới nhất để trả về FE
  const updatedUser = await userRepository.findById(userId)
  return {
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    full_name: updatedUser.full_name,
    phone_number: updatedUser.phone_number,
    role: updatedUser.role,
    avatar_url: updatedUser.avatar_url || null
  }
}

module.exports = { updateUserInfo }