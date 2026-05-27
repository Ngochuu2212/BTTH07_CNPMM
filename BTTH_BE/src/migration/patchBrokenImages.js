/**
 * Sửa các URL ảnh bị lỗi 404 — chỉ update những ID bị lỗi
 * Dùng photo IDs Unsplash đã được verify hoạt động
 * Chạy: node src/migration/patchBrokenImages.js
 */
const pool = require('../config/db')

// Chỉ sửa những ID bị 404 (từ kết quả checkImages.js)
// Dùng các photo ID Unsplash đã xác nhận hoạt động (200 OK)
const FIX_BY_ID = {
  // ID 2  - Adidas Ultra Boost 22   (bị 404)
  2:  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  // ID 10 - Jordan Air 1 Retro High (bị 404)
  10: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
  // ID 12 - Converse Chuck Taylor   (bị 404)
  12: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  // ID 13 - Reebok Classic Leather  (bị 404)
  13: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=80',
  // ID 14 - Nike Air Force 1 Low    (bị 404)
  14: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
  // ID 20 - Vans Old Skool          (bị 404)
  20: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&q=80',
  // ID 21 - Vans Sk8-Hi             (bị 404)
  21: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80',
  // ID 23 - Nike SB Dunk Low Pro    (bị 404)
  23: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  // ID 24 - Emerica Reynolds 3 G6   (bị 404)
  24: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
}

async function run() {
  try {
    let updated = 0
    for (const [id, url] of Object.entries(FIX_BY_ID)) {
      const [[row]] = await pool.query('SELECT name FROM products WHERE id = ?', [id])
      const [result] = await pool.query(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [url, id]
      )
      if (result.affectedRows > 0) {
        updated++
        console.log(`  ✓ [ID ${id}] ${row?.name}`)
      }
    }
    console.log(`\n✅ Đã patch ${updated} sản phẩm bị lỗi ảnh`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi:', err.message)
    process.exit(1)
  }
}

run()
