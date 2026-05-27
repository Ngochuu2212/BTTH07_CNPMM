/**
 * Tạo MySQL TRIGGER: khi orders.status chuyển sang 'delivered'
 * → tự động cộng số lượng bán (sold) cho từng sản phẩm trong order_items
 * Chạy: node src/migration/createDeliveredTrigger.js
 */
const pool = require('../config/db')

async function run() {
  const conn = await pool.getConnection()
  try {
    // Xóa trigger cũ nếu tồn tại
    await conn.query('DROP TRIGGER IF EXISTS trg_order_delivered')

    // Tạo trigger mới
    await conn.query(`
      CREATE TRIGGER trg_order_delivered
      AFTER UPDATE ON orders
      FOR EACH ROW
      BEGIN
        IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
          UPDATE products p
          JOIN order_items oi ON oi.product_id = p.id
          SET p.sold = p.sold + oi.quantity
          WHERE oi.order_id = NEW.id;
        END IF;
      END
    `)

    console.log('✅ Trigger trg_order_delivered đã được tạo thành công!')
    console.log('   Mỗi khi status đơn hàng chuyển thành "delivered",')
    console.log('   products.sold sẽ tự động tăng theo số lượng trong đơn.')
  } catch (err) {
    console.error('❌ Lỗi:', err.message)
  } finally {
    conn.release()
    process.exit(0)
  }
}

run()
