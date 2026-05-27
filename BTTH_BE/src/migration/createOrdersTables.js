const pool = require('../config/db')

const createOrdersTables = async () => {
  const ordersSQL = `
    CREATE TABLE IF NOT EXISTS orders (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      user_id          INT NOT NULL,
      status           ENUM('pending','confirmed','shipping','delivered','cancelled') NOT NULL DEFAULT 'pending',
      payment_method   ENUM('cod','momo','vnpay') NOT NULL DEFAULT 'cod',
      payment_status   ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
      total_amount     DECIMAL(12,0) NOT NULL DEFAULT 0,
      shipping_address JSON NOT NULL,
      note             TEXT DEFAULT NULL,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_orders_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `

  const orderItemsSQL = `
    CREATE TABLE IF NOT EXISTS order_items (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      order_id      INT NOT NULL,
      product_id    INT NOT NULL,
      product_name  VARCHAR(255) NOT NULL,
      product_brand VARCHAR(100) DEFAULT NULL,
      product_image VARCHAR(500) DEFAULT NULL,
      price         DECIMAL(12,0) NOT NULL,
      quantity      INT NOT NULL DEFAULT 1,
      size          VARCHAR(10) DEFAULT NULL,
      INDEX idx_order_items_order (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `

  try {
    await pool.query(ordersSQL)
    console.log('✅ Bảng orders đã được tạo (hoặc đã tồn tại)')
    await pool.query(orderItemsSQL)
    console.log('✅ Bảng order_items đã được tạo (hoặc đã tồn tại)')
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi tạo bảng:', err.message)
    process.exit(1)
  }
}

createOrdersTables()
