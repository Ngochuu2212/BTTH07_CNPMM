/**
 * Gán ảnh UNIQUE cho từng sản phẩm — mỗi ID một URL riêng, không trùng.
 * Tất cả URL dưới đây đã được verify 200 OK.
 * Chạy: node src/migration/assignUniqueImages.js
 */
const pool = require('../config/db')

const UNIQUE_IMAGE_BY_ID = {
  // ── RUNNING (ID 1-9) ──────────────────────────────────────────────────────
  1:  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',   // Nike Air Max 270      - Nike đỏ nổi bật
  2:  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80', // Adidas Ultra Boost 22 - Adidas trắng
  3:  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80', // Puma RS-X Reinvention  - Giày chunky
  4:  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',   // Nike React Infinity Run - Sneakers màu
  5:  'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=80', // Adidas Solarboost 5   - Adidas running
  6:  'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&q=80',   // Asics Gel-Nimbus 25    - Giày thể thao
  7:  'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80', // New Balance Fresh Foam - NB màu xanh
  8:  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80', // Brooks Ghost 15        - Running shoe
  9:  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80', // Hoka Clifton 9         - Thick sole shoe

  // ── LIFESTYLE (ID 10-19) ──────────────────────────────────────────────────
  10: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80', // Jordan Air 1 Retro High - High top
  11: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80', // New Balance 574         - NB retro
  12: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80', // Converse Chuck Taylor   - Canvas shoe
  13: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80', // Reebok Classic Leather  - Leather shoe
  14: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',   // Nike Air Force 1 Low    - White clean
  15: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80', // Adidas Stan Smith       - Stan smith
  16: 'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=600&q=80', // Puma Suede Classic      - Puma suede
  17: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=600&q=80', // New Balance 990v6       - NB grey
  18: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',   // Converse Run Star Hike  - Platform
  19: 'https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=600&q=80', // Nike Dunk Low Retro     - Dunk colorway

  // ── SKATEBOARDING (ID 20-24) ──────────────────────────────────────────────
  20: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',   // Vans Old Skool          - Vans low
  21: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80', // Vans Sk8-Hi             - High top skate
  22: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80', // DC Shoes Court Graffik  - Skate shoe
  23: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',   // Nike SB Dunk Low Pro    - SB dunk
  24: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=80', // Emerica Reynolds 3 G6  - Skate shoe
}

async function run() {
  try {
    // Xóa sạch trước
    await pool.query('UPDATE products SET image_url = NULL')
    console.log('🗑️  Đã xóa image_url cũ\n')

    // Gán ảnh unique cho từng ID
    let updated = 0
    for (const [id, url] of Object.entries(UNIQUE_IMAGE_BY_ID)) {
      const [[row]] = await pool.query('SELECT name FROM products WHERE id = ?', [id])
      await pool.query('UPDATE products SET image_url = ? WHERE id = ?', [url, id])
      updated++
      console.log(`  ✓ [ID ${String(id).padStart(2)}] ${row?.name}`)
    }

    console.log(`\n✅ Đã gán ảnh unique cho ${updated}/24 sản phẩm`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi:', err.message)
    process.exit(1)
  }
}

run()
