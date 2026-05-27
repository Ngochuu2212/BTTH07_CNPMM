const db = require('../config/db')

const addAvatarUrlToUsers = async () => {
  try {
    // Kiểm tra cột đã tồn tại chưa
    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url'
    `)
    if (cols.length > 0) {
      console.log('✅ Cột avatar_url đã tồn tại, bỏ qua migration.')
    } else {
      await db.execute(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL DEFAULT NULL`)
      console.log('✅ Đã thêm cột avatar_url vào bảng users.')
    }
  } catch (err) {
    console.error('❌ Lỗi migration avatar_url:', err.message)
  } finally {
    process.exit(0)
  }
}

addAvatarUrlToUsers()
