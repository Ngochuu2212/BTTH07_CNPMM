/**
 * Migration: Tạo bảng reviews, user_points, coupons
 * Chạy: node src/migration/createReviewTables.js
 */
const pool = require('../config/db')

const run = async () => {
  const conn = await pool.getConnection()
  try {
    // ── 1. Bảng reviews ──────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        order_id    INT NOT NULL,
        product_id  INT NOT NULL,
        rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_review (user_id, order_id, product_id),
        FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
        FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Bảng reviews đã sẵn sàng')

    // ── 2. Bảng user_points (lịch sử điểm tích lũy) ──────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_points (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        points     INT NOT NULL DEFAULT 0,
        source     VARCHAR(50) NOT NULL DEFAULT 'review',
        ref_id     INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Bảng user_points đã sẵn sàng')

    // ── 3. Bảng coupons (mã giảm giá thưởng) ─────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id                INT AUTO_INCREMENT PRIMARY KEY,
        user_id           INT NOT NULL,
        code              VARCHAR(20) NOT NULL UNIQUE,
        discount_percent  INT NOT NULL DEFAULT 10,
        min_order_amount  INT NOT NULL DEFAULT 200000,
        is_used           TINYINT NOT NULL DEFAULT 0,
        expires_at        TIMESTAMP NOT NULL,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Bảng coupons đã sẵn sàng')

    console.log('\n🎉 Migration hoàn tất!')
  } catch (err) {
    console.error('❌ Lỗi migration:', err.message)
  } finally {
    conn.release()
    process.exit()
  }
}

run()
