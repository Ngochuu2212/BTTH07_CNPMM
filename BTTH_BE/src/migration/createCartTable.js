const pool = require('../config/db')

const createCartTable = async () => {
  const createSQL = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      product_id  INT NOT NULL,
      quantity    INT NOT NULL DEFAULT 1,
      size        VARCHAR(10) DEFAULT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_cart_item (user_id, product_id, size)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `

  try {
    await pool.query(createSQL)
    console.log('✅ Bảng cart_items đã được tạo (hoặc đã tồn tại)')
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi tạo bảng:', err.message)
    process.exit(1)
  }
}

createCartTable()
