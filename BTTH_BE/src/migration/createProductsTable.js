/**
 * Script tạo bảng `products` và seed dữ liệu mẫu (24 sản phẩm).
 * Chạy một lần: node src/migration/createProductsTable.js
 */
const pool = require('../config/db')

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255)    NOT NULL,
  brand         VARCHAR(100)    NOT NULL,
  price         BIGINT          NOT NULL,
  original_price BIGINT         NOT NULL,
  rating        DECIMAL(3,1)    NOT NULL DEFAULT 4.0,
  reviews       INT             NOT NULL DEFAULT 0,
  sold          INT             NOT NULL DEFAULT 0,
  stock         INT             NOT NULL DEFAULT 0,
  category      VARCHAR(50)     NOT NULL,
  category_label VARCHAR(100)   NOT NULL,
  tags          JSON            NOT NULL,
  gradient      VARCHAR(200)    NOT NULL,
  accent        VARCHAR(200)    NOT NULL,
  description   TEXT,
  created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

const PRODUCTS = [
  // ── RUNNING (9 sản phẩm) ─────────────────────────────────────────────────
  { name: 'Nike Air Max 270', brand: 'Nike', price: 3200000, original_price: 4200000, rating: 4.8, reviews: 128, sold: 1240, stock: 35, category: 'running', category_label: 'Chạy bộ', tags: ['new','sale'], gradient: 'from-sky-400 to-blue-600', accent: 'bg-sky-100 text-sky-700', description: 'Đệm khí Max 270 siêu nhẹ, êm ái suốt cả ngày dài' },
  { name: 'Adidas Ultra Boost 22', brand: 'Adidas', price: 2850000, original_price: 3600000, rating: 4.9, reviews: 315, sold: 3870, stock: 12, category: 'running', category_label: 'Chạy bộ', tags: ['bestseller','sale'], gradient: 'from-emerald-400 to-teal-600', accent: 'bg-emerald-100 text-emerald-700', description: 'Công nghệ Boost trả lại năng lượng mỗi bước chạy' },
  { name: 'Puma RS-X Reinvention', brand: 'Puma', price: 2200000, original_price: 2800000, rating: 4.4, reviews: 76, sold: 430, stock: 20, category: 'running', category_label: 'Chạy bộ', tags: ['new','sale'], gradient: 'from-pink-400 to-fuchsia-600', accent: 'bg-pink-100 text-pink-700', description: 'Thiết kế chunky bold — nổi bật giữa đám đông' },
  { name: 'Nike React Infinity Run', brand: 'Nike', price: 3500000, original_price: 4000000, rating: 4.7, reviews: 210, sold: 980, stock: 28, category: 'running', category_label: 'Chạy bộ', tags: ['new'], gradient: 'from-indigo-400 to-blue-500', accent: 'bg-indigo-100 text-indigo-700', description: 'Giảm chấn tối đa, bảo vệ khớp gối trong mọi địa hình' },
  { name: 'Adidas Solarboost 5', brand: 'Adidas', price: 2600000, original_price: 3200000, rating: 4.6, reviews: 158, sold: 720, stock: 15, category: 'running', category_label: 'Chạy bộ', tags: ['sale'], gradient: 'from-lime-400 to-green-500', accent: 'bg-lime-100 text-lime-700', description: 'Thiết kế lấy cảm hứng từ tốc độ ánh sáng mặt trời' },
  { name: 'Asics Gel-Nimbus 25', brand: 'Asics', price: 3800000, original_price: 4500000, rating: 4.8, reviews: 94, sold: 410, stock: 22, category: 'running', category_label: 'Chạy bộ', tags: ['new','sale'], gradient: 'from-orange-400 to-red-500', accent: 'bg-orange-100 text-orange-700', description: 'GEL cushioning hấp thụ va đập vượt trội' },
  { name: 'New Balance Fresh Foam 1080', brand: 'New Balance', price: 3100000, original_price: 3700000, rating: 4.5, reviews: 173, sold: 630, stock: 40, category: 'running', category_label: 'Chạy bộ', tags: ['bestseller'], gradient: 'from-yellow-400 to-amber-500', accent: 'bg-yellow-100 text-yellow-700', description: 'Fresh Foam cực êm, lý tưởng cho buổi chạy dài' },
  { name: 'Brooks Ghost 15', brand: 'Brooks', price: 2900000, original_price: 3400000, rating: 4.7, reviews: 267, sold: 1100, stock: 18, category: 'running', category_label: 'Chạy bộ', tags: ['bestseller','sale'], gradient: 'from-teal-400 to-cyan-500', accent: 'bg-teal-100 text-teal-700', description: 'Độ êm ái huyền thoại của Ghost — phiên bản cải tiến' },
  { name: 'Hoka Clifton 9', brand: 'Hoka', price: 3400000, original_price: 3900000, rating: 4.6, reviews: 132, sold: 550, stock: 25, category: 'running', category_label: 'Chạy bộ', tags: ['new'], gradient: 'from-purple-400 to-violet-500', accent: 'bg-purple-100 text-purple-700', description: 'Đế siêu dày, giảm mỏi cơ chân tối đa' },

  // ── LIFESTYLE (10 sản phẩm) ───────────────────────────────────────────────
  { name: 'Jordan Air 1 Retro High', brand: 'Jordan', price: 4500000, original_price: 5200000, rating: 4.7, reviews: 89, sold: 560, stock: 8, category: 'lifestyle', category_label: 'Lifestyle', tags: ['new','bestseller'], gradient: 'from-red-400 to-rose-600', accent: 'bg-red-100 text-red-700', description: 'Huyền thoại tái sinh — biểu tượng thời trang đường phố' },
  { name: 'New Balance 574', brand: 'New Balance', price: 1980000, original_price: 2500000, rating: 4.6, reviews: 204, sold: 890, stock: 50, category: 'lifestyle', category_label: 'Lifestyle', tags: ['sale'], gradient: 'from-violet-400 to-purple-600', accent: 'bg-violet-100 text-violet-700', description: 'Cổ điển, thoải mái — hoàn hảo cho phong cách casual' },
  { name: 'Converse Chuck Taylor All Star', brand: 'Converse', price: 1200000, original_price: 1500000, rating: 4.5, reviews: 512, sold: 5200, stock: 100, category: 'lifestyle', category_label: 'Lifestyle', tags: ['bestseller'], gradient: 'from-amber-400 to-orange-500', accent: 'bg-amber-100 text-amber-700', description: 'Thiết kế bất hủ hơn 100 năm — không bao giờ lỗi mốt' },
  { name: 'Reebok Classic Leather', brand: 'Reebok', price: 1750000, original_price: 2100000, rating: 4.3, reviews: 143, sold: 780, stock: 28, category: 'lifestyle', category_label: 'Lifestyle', tags: ['new'], gradient: 'from-cyan-400 to-sky-600', accent: 'bg-cyan-100 text-sky-700', description: 'Chất liệu da mềm cao cấp, phong cách retro tinh tế' },
  { name: 'Nike Air Force 1 Low', brand: 'Nike', price: 2400000, original_price: 2900000, rating: 4.8, reviews: 643, sold: 6800, stock: 80, category: 'lifestyle', category_label: 'Lifestyle', tags: ['bestseller','sale'], gradient: 'from-gray-200 to-slate-400', accent: 'bg-gray-100 text-gray-700', description: 'Classic trắng tinh khôi — không bao giờ sai lầm' },
  { name: 'Adidas Stan Smith', brand: 'Adidas', price: 1900000, original_price: 2300000, rating: 4.6, reviews: 389, sold: 3400, stock: 60, category: 'lifestyle', category_label: 'Lifestyle', tags: ['sale'], gradient: 'from-green-300 to-emerald-400', accent: 'bg-green-100 text-green-700', description: 'Thiết kế tối giản, sang trọng không cần cố gắng' },
  { name: 'Puma Suede Classic', brand: 'Puma', price: 1500000, original_price: 1900000, rating: 4.4, reviews: 221, sold: 1650, stock: 45, category: 'lifestyle', category_label: 'Lifestyle', tags: ['sale'], gradient: 'from-red-300 to-rose-400', accent: 'bg-red-100 text-red-700', description: 'Chất da lộn mềm mại, form dáng chuẩn đẹp mọi thời đại' },
  { name: 'New Balance 990v6', brand: 'New Balance', price: 5200000, original_price: 5800000, rating: 4.9, reviews: 76, sold: 320, stock: 15, category: 'lifestyle', category_label: 'Lifestyle', tags: ['new'], gradient: 'from-slate-400 to-zinc-600', accent: 'bg-slate-100 text-slate-700', description: 'Made in USA — đỉnh cao của dòng 990 huyền thoại' },
  { name: 'Converse Run Star Hike', brand: 'Converse', price: 2100000, original_price: 2600000, rating: 4.5, reviews: 167, sold: 890, stock: 30, category: 'lifestyle', category_label: 'Lifestyle', tags: ['new','sale'], gradient: 'from-yellow-300 to-amber-400', accent: 'bg-yellow-100 text-yellow-700', description: 'Chuck Taylor gặp platform — sự kết hợp táo bạo' },
  { name: 'Nike Dunk Low Retro', brand: 'Nike', price: 3000000, original_price: 3500000, rating: 4.7, reviews: 412, sold: 2800, stock: 22, category: 'lifestyle', category_label: 'Lifestyle', tags: ['bestseller'], gradient: 'from-blue-300 to-indigo-500', accent: 'bg-blue-100 text-blue-700', description: 'Phục hưng hoàn hảo của huyền thoại Dunk từ thập niên 80' },

  // ── SKATEBOARDING (5 sản phẩm) ────────────────────────────────────────────
  { name: 'Vans Old Skool', brand: 'Vans', price: 1450000, original_price: 1800000, rating: 4.7, reviews: 398, sold: 3100, stock: 65, category: 'skateboarding', category_label: 'Skateboard', tags: ['bestseller'], gradient: 'from-slate-500 to-gray-700', accent: 'bg-slate-100 text-slate-700', description: 'Gắn liền với văn hóa skateboard và thời trang đường phố' },
  { name: 'Vans Sk8-Hi', brand: 'Vans', price: 1700000, original_price: 2100000, rating: 4.6, reviews: 284, sold: 1800, stock: 42, category: 'skateboarding', category_label: 'Skateboard', tags: ['sale'], gradient: 'from-gray-700 to-black', accent: 'bg-gray-100 text-gray-800', description: 'Cổ cao bảo vệ mắt cá, iconic side stripe không lỗi thời' },
  { name: 'DC Shoes Court Graffik', brand: 'DC', price: 1350000, original_price: 1700000, rating: 4.4, reviews: 156, sold: 720, stock: 35, category: 'skateboarding', category_label: 'Skateboard', tags: ['sale'], gradient: 'from-blue-600 to-indigo-700', accent: 'bg-blue-100 text-blue-800', description: 'Thiết kế chắc chắn, bền bỉ với mọi địa hình skate' },
  { name: 'Nike SB Dunk Low Pro', brand: 'Nike', price: 2800000, original_price: 3300000, rating: 4.8, reviews: 198, sold: 1050, stock: 18, category: 'skateboarding', category_label: 'Skateboard', tags: ['new','bestseller'], gradient: 'from-green-500 to-teal-600', accent: 'bg-green-100 text-green-700', description: 'SB cushioning giúp kiểm soát board tối ưu' },
  { name: 'Emerica Reynolds 3 G6', brand: 'Emerica', price: 1600000, original_price: 2000000, rating: 4.5, reviews: 89, sold: 480, stock: 25, category: 'skateboarding', category_label: 'Skateboard', tags: ['new','sale'], gradient: 'from-red-500 to-orange-600', accent: 'bg-red-100 text-red-700', description: 'Collab cùng Andrew Reynolds — cho dân chuyên nghiệp' }
]

async function run() {
  try {
    console.log('⏳ Đang tạo bảng products...')
    await pool.query(CREATE_TABLE_SQL)
    console.log('✅ Bảng products đã sẵn sàng.')

    // Kiểm tra xem đã có dữ liệu chưa
    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM products')
    if (rows[0].cnt > 0) {
      console.log(`ℹ️  Bảng đã có ${rows[0].cnt} sản phẩm, bỏ qua seed.`)
      process.exit(0)
    }

    console.log('⏳ Đang seed dữ liệu...')
    for (const p of PRODUCTS) {
      await pool.query(
        `INSERT INTO products
          (name, brand, price, original_price, rating, reviews, sold, stock,
           category, category_label, tags, gradient, accent, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.name, p.brand, p.price, p.original_price, p.rating, p.reviews,
          p.sold, p.stock, p.category, p.category_label,
          JSON.stringify(p.tags), p.gradient, p.accent, p.description
        ]
      )
    }
    console.log(`✅ Đã seed ${PRODUCTS.length} sản phẩm thành công!`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi migration:', err.message)
    process.exit(1)
  }
}

run()
