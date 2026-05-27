/**
 * Cập nhật image_url bằng Unsplash Source API (source.unsplash.com)
 * — URL theo keyword, luôn hoạt động, không bao giờ 404
 * Chạy: node src/migration/fixImageUrls.js
 */
const pool = require('../config/db')

// source.unsplash.com/featured/{width}x{height}/?{keyword}
// => Unsplash tự chọn ảnh đẹp nhất phù hợp với keyword, luôn trả về ảnh thật
const IMAGE_BY_ID = {
  // ── RUNNING ────────────────────────────────────────────────────────────────
  1:  'https://source.unsplash.com/featured/600x600/?nike,air-max,sneaker',
  2:  'https://source.unsplash.com/featured/600x600/?adidas,ultraboost,running-shoe',
  3:  'https://source.unsplash.com/featured/600x600/?puma,chunky,sneaker',
  4:  'https://source.unsplash.com/featured/600x600/?nike,react,running',
  5:  'https://source.unsplash.com/featured/600x600/?adidas,running-shoe,sport',
  6:  'https://source.unsplash.com/featured/600x600/?asics,running,gel',
  7:  'https://source.unsplash.com/featured/600x600/?new-balance,running,foam',
  8:  'https://source.unsplash.com/featured/600x600/?brooks,ghost,running-shoe',
  9:  'https://source.unsplash.com/featured/600x600/?hoka,thick-sole,trail-shoe',

  // ── LIFESTYLE ──────────────────────────────────────────────────────────────
  10: 'https://source.unsplash.com/featured/600x600/?jordan,air-jordan,high-top',
  11: 'https://source.unsplash.com/featured/600x600/?new-balance,574,retro-sneaker',
  12: 'https://source.unsplash.com/featured/600x600/?converse,chuck-taylor,canvas',
  13: 'https://source.unsplash.com/featured/600x600/?reebok,classic,leather-shoe',
  14: 'https://source.unsplash.com/featured/600x600/?nike,air-force-1,white-sneaker',
  15: 'https://source.unsplash.com/featured/600x600/?adidas,stan-smith,white-green',
  16: 'https://source.unsplash.com/featured/600x600/?puma,suede,sneaker',
  17: 'https://source.unsplash.com/featured/600x600/?new-balance,990,grey-sneaker',
  18: 'https://source.unsplash.com/featured/600x600/?converse,platform,chunky',
  19: 'https://source.unsplash.com/featured/600x600/?nike,dunk,low-sneaker',

  // ── SKATEBOARDING ──────────────────────────────────────────────────────────
  20: 'https://source.unsplash.com/featured/600x600/?vans,old-skool,skateboard',
  21: 'https://source.unsplash.com/featured/600x600/?vans,sk8-hi,high-top',
  22: 'https://source.unsplash.com/featured/600x600/?dc-shoes,skate,sport',
  23: 'https://source.unsplash.com/featured/600x600/?nike,sb-dunk,skate-shoe',
  24: 'https://source.unsplash.com/featured/600x600/?emerica,skate,street-shoe',
}

async function run() {
  try {
    let updated = 0
    for (const [id, url] of Object.entries(IMAGE_BY_ID)) {
      const [result] = await pool.query(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [url, id]
      )
      if (result.affectedRows > 0) {
        updated++
        const [[row]] = await pool.query('SELECT name FROM products WHERE id = ?', [id])
        console.log(`  ✓ [ID ${id}] ${row?.name}`)
      }
    }
    console.log(`\n✅ Đã cập nhật ${updated}/24 sản phẩm với URL mới`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi:', err.message)
    process.exit(1)
  }
}

run()
