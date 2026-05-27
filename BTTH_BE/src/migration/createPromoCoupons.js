/**
 * Migration: Tạo bảng promo_coupons + seed 5 mã giảm giá
 * Chạy: node src/migration/createPromoCoupons.js
 */
const pool = require('../config/db')

const run = async () => {
  const conn = await pool.getConnection()
  try {
    // ── Tạo bảng promo_coupons ─────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS promo_coupons (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        code             VARCHAR(30) NOT NULL UNIQUE,
        name             VARCHAR(100) NOT NULL,
        description      TEXT,
        discount_type    ENUM('percent','fixed','freeship') NOT NULL DEFAULT 'percent',
        discount_value   INT NOT NULL DEFAULT 0,
        max_discount     INT DEFAULT NULL,          -- giới hạn số tiền giảm tối đa (cho type=percent)
        min_order_amount INT NOT NULL DEFAULT 0,    -- đơn tối thiểu
        usage_limit      INT DEFAULT NULL,           -- NULL = không giới hạn
        used_count       INT NOT NULL DEFAULT 0,
        expires_at       DATETIME NOT NULL,
        is_active        TINYINT NOT NULL DEFAULT 1,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Bảng promo_coupons đã sẵn sàng')

    // ── Seed 5 loại phiếu giảm giá ────────────────────────────────────────
    // Xóa seed cũ nếu có để tránh duplicate
    await conn.query(`DELETE FROM promo_coupons WHERE code IN ('WELCOME10','SUMMER25','FREESHIP','VIP200K','FLASH50')`)

    await conn.query(`
      INSERT INTO promo_coupons
        (code, name, description, discount_type, discount_value, max_discount, min_order_amount, usage_limit, expires_at)
      VALUES
        -- 1. Chào mừng thành viên mới: giảm 10%, tối đa 50k, đơn từ 200k
        ('WELCOME10',
         'Chào mừng thành viên mới 🎉',
         'Giảm 10% cho đơn hàng đầu tiên của bạn. Áp dụng cho mọi sản phẩm.',
         'percent', 10, 50000, 200000, 500,
         '2026-08-31 23:59:59'),

        -- 2. Flash Sale Hè: giảm 25%, tối đa 200k, đơn từ 500k
        ('SUMMER25',
         'Flash Sale Hè 2026 ☀️',
         'Mua sắm mùa hè bùng nổ! Giảm 25% tối đa 200.000đ cho đơn từ 500k.',
         'percent', 25, 200000, 500000, 200,
         '2026-07-31 23:59:59'),

        -- 3. Miễn phí vận chuyển toàn quốc, đơn từ 150k
        ('FREESHIP',
         'Miễn phí vận chuyển 🚚',
         'Miễn toàn bộ phí vận chuyển cho đơn hàng từ 150.000đ. Không giới hạn khu vực.',
         'freeship', 30000, NULL, 150000, NULL,
         '2026-09-30 23:59:59'),

        -- 4. VIP: giảm cố định 200k, đơn từ 1 triệu
        ('VIP200K',
         'Ưu đãi VIP 👑',
         'Dành riêng cho khách hàng thân thiết. Giảm thẳng 200.000đ cho đơn từ 1 triệu.',
         'fixed', 200000, NULL, 1000000, 100,
         '2026-12-31 23:59:59'),

        -- 5. Siêu sale cuối tuần: giảm 50% tối đa 500k, đơn từ 800k, SẮP HẾT HẠN
        ('FLASH50',
         'Siêu Sale Cuối Tuần ⚡',
         'Giảm khủng 50% tối đa 500.000đ! Duy nhất cuối tuần, số lượng có hạn.',
         'percent', 50, 500000, 800000, 50,
         '2026-06-30 23:59:59')
    `)
    console.log('✅ Đã seed 5 mã giảm giá:')
    console.log('   🎉 WELCOME10  - Giảm 10% (tối đa 50k)  | Đơn từ 200k | HSD: 31/08/2026')
    console.log('   ☀️  SUMMER25  - Giảm 25% (tối đa 200k) | Đơn từ 500k | HSD: 31/07/2026')
    console.log('   🚚 FREESHIP   - Miễn phí ship (30k)     | Đơn từ 150k | HSD: 30/09/2026')
    console.log('   👑 VIP200K    - Giảm cố định 200k       | Đơn từ 1tr  | HSD: 31/12/2026')
    console.log('   ⚡ FLASH50    - Giảm 50% (tối đa 500k)  | Đơn từ 800k | HSD: 30/06/2026')
    console.log('\n🎉 Migration hoàn tất!')
  } catch (err) {
    console.error('❌ Lỗi migration:', err.message)
  } finally {
    conn.release()
    process.exit(0)
  }
}

run()
