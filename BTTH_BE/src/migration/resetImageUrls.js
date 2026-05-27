/**
 * Xóa toàn bộ image_url cũ và cập nhật lại ảnh đúng theo ID sản phẩm.
 * Dùng Unsplash direct-photo URLs đã được kiểm tra hoạt động.
 * Chạy: node src/migration/resetImageUrls.js
 */
const pool = require('../config/db')

// Map theo ID sản phẩm - ảnh đúng với tên từng đôi giày
const IMAGE_BY_ID = {
  // ── RUNNING ────────────────────────────────────────────────────────────────
  1:  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',  // Nike Air Max 270
  2:  'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600&q=80', // Adidas Ultra Boost 22
  3:  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80', // Puma RS-X
  4:  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',  // Nike React Infinity Run
  5:  'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=80', // Adidas Solarboost 5
  6:  'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&q=80',  // Asics Gel-Nimbus 25
  7:  'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80', // New Balance Fresh Foam 1080
  8:  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80', // Brooks Ghost 15
  9:  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80', // Hoka Clifton 9

  // ── LIFESTYLE ──────────────────────────────────────────────────────────────
  10: 'https://images.unsplash.com/photo-1556906781-9a412961d28e?w=600&q=80',  // Jordan Air 1 Retro High
  11: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80', // New Balance 574
  12: 'https://images.unsplash.com/photo-1607522370775-ac82dc94302c?w=600&q=80', // Converse Chuck Taylor
  13: 'https://images.unsplash.com/photo-1600185364594-a6b8deba2553?w=600&q=80', // Reebok Classic Leather
  14: 'https://images.unsplash.com/photo-1600185365483-26d0a4ea9834?w=600&q=80', // Nike Air Force 1 Low
  15: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',  // Adidas Stan Smith
  16: 'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=600&q=80', // Puma Suede Classic
  17: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=600&q=80', // New Balance 990v6
  18: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80', // Converse Run Star Hike
  19: 'https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=600&q=80', // Nike Dunk Low Retro

  // ── SKATEBOARDING ──────────────────────────────────────────────────────────
  20: 'https://images.unsplash.com/photo-1620873697765-1fc67b370bbf?w=600&q=80', // Vans Old Skool
  21: 'https://images.unsplash.com/photo-1583916648774-4e9c9f98b42c?w=600&q=80', // Vans Sk8-Hi
  22: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',  // DC Shoes Court Graffik
  23: 'https://images.unsplash.com/photo-1584735175097-aaefcf7b80b0?w=600&q=80', // Nike SB Dunk Low Pro
  24: 'https://images.unsplash.com/photo-1578183272786-caa3bf94ce05?w=600&q=80', // Emerica Reynolds 3 G6
}

async function run() {
  try {
    // 1. Xóa sạch toàn bộ image_url cũ
    await pool.query('UPDATE products SET image_url = NULL')
    console.log('🗑️  Đã xóa toàn bộ image_url cũ\n')

    // 2. Cập nhật lại image_url theo ID
    let updated = 0
    for (const [id, url] of Object.entries(IMAGE_BY_ID)) {
      const [result] = await pool.query(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [url, id]
      )
      if (result.affectedRows > 0) {
        updated++
        // Lấy tên sản phẩm để log
        const [[row]] = await pool.query('SELECT name FROM products WHERE id = ?', [id])
        console.log(`  ✓ [ID ${id}] ${row?.name}`)
      }
    }

    console.log(`\n✅ Đã cập nhật ảnh cho ${updated}/${Object.keys(IMAGE_BY_ID).length} sản phẩm`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi:', err.message)
    process.exit(1)
  }
}

run()
