/**
 * Migration: Thêm cột image_url vào bảng products
 * và cập nhật ảnh thật cho từng sản phẩm.
 * Chạy: node src/migration/addImageUrlToProducts.js
 */
const pool = require('../config/db')

const PRODUCT_IMAGES = {
  // ── RUNNING ────────────────────────────────────────────────────────────────
  'Nike Air Max 270':            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  'Adidas Ultra Boost 22':       'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=400&q=80',
  'Puma RS-X Reinvention':       'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
  'Nike React Infinity Run':     'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
  'Adidas Solarboost 5':         'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80',
  'Asics Gel-Nimbus 25':         'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=400&q=80',
  'New Balance Fresh Foam 1080': 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400&q=80',
  'Brooks Ghost 15':             'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80',
  'Hoka Clifton 9':              'https://images.unsplash.com/photo-1615487188297-5b2e4ff21c20?w=400&q=80',

  // ── LIFESTYLE ──────────────────────────────────────────────────────────────
  'Jordan Air 1 Retro High':     'https://images.unsplash.com/photo-1556906781-9a412961d28e?w=400&q=80',
  'New Balance 574':             'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80',
  'Converse Chuck Taylor All Star': 'https://images.unsplash.com/photo-1607522370775-ac82dc94302c?w=400&q=80',
  'Reebok Classic Leather':      'https://images.unsplash.com/photo-1600185364594-a6b8deba2553?w=400&q=80',
  'Nike Air Force 1 Low':        'https://images.unsplash.com/photo-1600185365483-26d0a4ea9834?w=400&q=80',
  'Adidas Stan Smith':           'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80',
  'Puma Suede Classic':          'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=400&q=80',
  'New Balance 990v6':           'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=400&q=80',
  'Converse Run Star Hike':      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80',
  'Nike Dunk Low Retro':         'https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=400&q=80',

  // ── SKATEBOARDING ──────────────────────────────────────────────────────────
  'Vans Old Skool':              'https://images.unsplash.com/photo-1620873697765-1fc67b370bbf?w=400&q=80',
  'Vans Sk8-Hi':                 'https://images.unsplash.com/photo-1583916648774-4e9c9f98b42c?w=400&q=80',
  'DC Shoes Court Graffik':      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
  'Nike SB Dunk Low Pro':        'https://images.unsplash.com/photo-1584735175097-aaefcf7b80b0?w=400&q=80',
  'Emerica Reynolds 3 G6':       'https://images.unsplash.com/photo-1578183272786-caa3bf94ce05?w=400&q=80',
}

async function run() {
  try {
    // 1. Thêm cột image_url nếu chưa có
    const [cols] = await pool.query(`SHOW COLUMNS FROM products LIKE 'image_url'`)
    if (cols.length === 0) {
      await pool.query(`ALTER TABLE products ADD COLUMN image_url VARCHAR(500) DEFAULT NULL`)
      console.log('✅ Đã thêm cột image_url vào bảng products')
    } else {
      console.log('ℹ️  Cột image_url đã tồn tại, bỏ qua ALTER TABLE')
    }

    // 2. Cập nhật image_url cho từng sản phẩm
    let updated = 0
    for (const [name, url] of Object.entries(PRODUCT_IMAGES)) {
      const [result] = await pool.query(
        `UPDATE products SET image_url = ? WHERE name = ?`,
        [url, name]
      )
      if (result.affectedRows > 0) {
        updated++
        console.log(`  ✓ ${name}`)
      } else {
        console.log(`  ⚠️  Không tìm thấy: ${name}`)
      }
    }
    console.log(`\n✅ Đã cập nhật ảnh cho ${updated}/${Object.keys(PRODUCT_IMAGES).length} sản phẩm`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi migration:', err.message)
    process.exit(1)
  }
}

run()
