import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearUser } from '~/redux/userSlice'
import { toast } from 'react-toastify'
import { getProductImage } from '~/utils/shoeImages'
import { productAPI } from '~/apis/index'

const ALL_PRODUCTS = [
  {
    id: 1, name: 'Nike Air Max 270', brand: 'Nike', price: 3200000, originalPrice: 4200000,
    rating: 4.8, reviews: 128, sold: 1240, stock: 35,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['new', 'sale'],
    gradient: 'from-sky-400 to-blue-600', accent: 'bg-sky-100 text-sky-700',
    description: 'Đệm khí Max 270 siêu nhẹ, êm ái suốt cả ngày dài'
  },
  {
    id: 2, name: 'Adidas Ultra Boost 22', brand: 'Adidas', price: 2850000, originalPrice: 3600000,
    rating: 4.9, reviews: 315, sold: 3870, stock: 12,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['bestseller', 'sale'],
    gradient: 'from-emerald-400 to-teal-600', accent: 'bg-emerald-100 text-emerald-700',
    description: 'Công nghệ Boost trả lại năng lượng mỗi bước chạy'
  },
  {
    id: 6, name: 'Puma RS-X Reinvention', brand: 'Puma', price: 2200000, originalPrice: 2800000,
    rating: 4.4, reviews: 76, sold: 430, stock: 20,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['new', 'sale'],
    gradient: 'from-pink-400 to-fuchsia-600', accent: 'bg-pink-100 text-pink-700',
    description: 'Thiết kế chunky bold — nổi bật giữa đám đông'
  },
  {
    id: 9, name: 'Nike React Infinity Run', brand: 'Nike', price: 3500000, originalPrice: 4000000,
    rating: 4.7, reviews: 210, sold: 980, stock: 28,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['new'],
    gradient: 'from-indigo-400 to-blue-500', accent: 'bg-indigo-100 text-indigo-700',
    description: 'Giảm chấn tối đa, bảo vệ khớp gối trong mọi địa hình'
  },
  {
    id: 10, name: 'Adidas Solarboost 5', brand: 'Adidas', price: 2600000, originalPrice: 3200000,
    rating: 4.6, reviews: 158, sold: 720, stock: 15,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['sale'],
    gradient: 'from-lime-400 to-green-500', accent: 'bg-lime-100 text-lime-700',
    description: 'Thiết kế lấy cảm hứng từ tốc độ ánh sáng mặt trời'
  },
  {
    id: 11, name: 'Asics Gel-Nimbus 25', brand: 'Asics', price: 3800000, originalPrice: 4500000,
    rating: 4.8, reviews: 94, sold: 410, stock: 22,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['new', 'sale'],
    gradient: 'from-orange-400 to-red-500', accent: 'bg-orange-100 text-orange-700',
    description: 'GEL cushioning hấp thụ va đập vượt trội'
  },
  {
    id: 12, name: 'New Balance Fresh Foam 1080', brand: 'New Balance', price: 3100000, originalPrice: 3700000,
    rating: 4.5, reviews: 173, sold: 630, stock: 40,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['bestseller'],
    gradient: 'from-yellow-400 to-amber-500', accent: 'bg-yellow-100 text-yellow-700',
    description: 'Fresh Foam cực êm, lý tưởng cho buổi chạy dài'
  },
  {
    id: 13, name: 'Brooks Ghost 15', brand: 'Brooks', price: 2900000, originalPrice: 3400000,
    rating: 4.7, reviews: 267, sold: 1100, stock: 18,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['bestseller', 'sale'],
    gradient: 'from-teal-400 to-cyan-500', accent: 'bg-teal-100 text-teal-700',
    description: 'Độ êm ái huyền thoại của Ghost — phiên bản cải tiến'
  },
  {
    id: 14, name: 'Hoka Clifton 9', brand: 'Hoka', price: 3400000, originalPrice: 3900000,
    rating: 4.6, reviews: 132, sold: 550, stock: 25,
    category: 'running', categoryLabel: 'Chạy bộ', tags: ['new'],
    gradient: 'from-purple-400 to-violet-500', accent: 'bg-purple-100 text-purple-700',
    description: 'Đế siêu dày, giảm mỏi cơ chân tối đa'
  },
  // ── LIFESTYLE ─────────────────────────────────────────────────────────────
  {
    id: 3, name: 'Jordan Air 1 Retro High', brand: 'Jordan', price: 4500000, originalPrice: 5200000,
    rating: 4.7, reviews: 89, sold: 560, stock: 8,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['new', 'bestseller'],
    gradient: 'from-red-400 to-rose-600', accent: 'bg-red-100 text-red-700',
    description: 'Huyền thoại tái sinh — biểu tượng thời trang đường phố'
  },
  {
    id: 4, name: 'New Balance 574', brand: 'New Balance', price: 1980000, originalPrice: 2500000,
    rating: 4.6, reviews: 204, sold: 890, stock: 50,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['sale'],
    gradient: 'from-violet-400 to-purple-600', accent: 'bg-violet-100 text-violet-700',
    description: 'Cổ điển, thoải mái — hoàn hảo cho phong cách casual'
  },
  {
    id: 5, name: 'Converse Chuck Taylor All Star', brand: 'Converse', price: 1200000, originalPrice: 1500000,
    rating: 4.5, reviews: 512, sold: 5200, stock: 100,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['bestseller'],
    gradient: 'from-amber-400 to-orange-500', accent: 'bg-amber-100 text-amber-700',
    description: 'Thiết kế bất hủ hơn 100 năm — không bao giờ lỗi mốt'
  },
  {
    id: 8, name: 'Reebok Classic Leather', brand: 'Reebok', price: 1750000, originalPrice: 2100000,
    rating: 4.3, reviews: 143, sold: 780, stock: 28,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['new'],
    gradient: 'from-cyan-400 to-sky-600', accent: 'bg-cyan-100 text-sky-700',
    description: 'Chất liệu da mềm cao cấp, phong cách retro tinh tế'
  },
  {
    id: 15, name: 'Nike Air Force 1 Low', brand: 'Nike', price: 2400000, originalPrice: 2900000,
    rating: 4.8, reviews: 643, sold: 6800, stock: 80,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['bestseller', 'sale'],
    gradient: 'from-gray-200 to-slate-400', accent: 'bg-gray-100 text-gray-700',
    description: 'Classic trắng tinh khôi — không bao giờ sai lầm'
  },
  {
    id: 16, name: 'Adidas Stan Smith', brand: 'Adidas', price: 1900000, originalPrice: 2300000,
    rating: 4.6, reviews: 389, sold: 3400, stock: 60,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['sale'],
    gradient: 'from-green-300 to-emerald-400', accent: 'bg-green-100 text-green-700',
    description: 'Thiết kế tối giản, sang trọng không cần cố gắng'
  },
  {
    id: 17, name: 'Puma Suede Classic', brand: 'Puma', price: 1500000, originalPrice: 1900000,
    rating: 4.4, reviews: 221, sold: 1650, stock: 45,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['sale'],
    gradient: 'from-red-300 to-rose-400', accent: 'bg-red-100 text-red-700',
    description: 'Chất da lộn mềm mại, form dáng chuẩn đẹp mọi thời đại'
  },
  {
    id: 18, name: 'New Balance 990v6', brand: 'New Balance', price: 5200000, originalPrice: 5800000,
    rating: 4.9, reviews: 76, sold: 320, stock: 15,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['new'],
    gradient: 'from-slate-400 to-zinc-600', accent: 'bg-slate-100 text-slate-700',
    description: 'Made in USA — đỉnh cao của dòng 990 huyền thoại'
  },
  {
    id: 19, name: 'Converse Run Star Hike', brand: 'Converse', price: 2100000, originalPrice: 2600000,
    rating: 4.5, reviews: 167, sold: 890, stock: 30,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['new', 'sale'],
    gradient: 'from-yellow-300 to-amber-400', accent: 'bg-yellow-100 text-yellow-700',
    description: 'Chuck Taylor gặp platform — sự kết hợp táo bạo'
  },
  {
    id: 20, name: 'Nike Dunk Low Retro', brand: 'Nike', price: 3000000, originalPrice: 3500000,
    rating: 4.7, reviews: 412, sold: 2800, stock: 22,
    category: 'lifestyle', categoryLabel: 'Lifestyle', tags: ['bestseller'],
    gradient: 'from-blue-300 to-indigo-500', accent: 'bg-blue-100 text-blue-700',
    description: 'Phục hưng hoàn hảo của huyền thoại Dunk từ thập niên 80'
  },
  // ── SKATEBOARDING ──────────────────────────────────────────────────────────
  {
    id: 7, name: 'Vans Old Skool', brand: 'Vans', price: 1450000, originalPrice: 1800000,
    rating: 4.7, reviews: 398, sold: 3100, stock: 65,
    category: 'skateboarding', categoryLabel: 'Skateboard', tags: ['bestseller'],
    gradient: 'from-slate-500 to-gray-700', accent: 'bg-slate-100 text-slate-700',
    description: 'Gắn liền với văn hóa skateboard và thời trang đường phố'
  },
  {
    id: 21, name: 'Vans Sk8-Hi', brand: 'Vans', price: 1700000, originalPrice: 2100000,
    rating: 4.6, reviews: 284, sold: 1800, stock: 42,
    category: 'skateboarding', categoryLabel: 'Skateboard', tags: ['sale'],
    gradient: 'from-gray-700 to-black', accent: 'bg-gray-100 text-gray-800',
    description: 'Cổ cao bảo vệ mắt cá, iconic side stripe không lỗi thời'
  },
  {
    id: 22, name: 'DC Shoes Court Graffik', brand: 'DC', price: 1350000, originalPrice: 1700000,
    rating: 4.4, reviews: 156, sold: 720, stock: 35,
    category: 'skateboarding', categoryLabel: 'Skateboard', tags: ['sale'],
    gradient: 'from-blue-600 to-indigo-700', accent: 'bg-blue-100 text-blue-800',
    description: 'Thiết kế chắc chắn, bền bỉ với mọi địa hình skate'
  },
  {
    id: 23, name: 'Nike SB Dunk Low Pro', brand: 'Nike', price: 2800000, originalPrice: 3300000,
    rating: 4.8, reviews: 198, sold: 1050, stock: 18,
    category: 'skateboarding', categoryLabel: 'Skateboard', tags: ['new', 'bestseller'],
    gradient: 'from-green-500 to-teal-600', accent: 'bg-green-100 text-green-700',
    description: 'SB cushioning giúp kiểm soát board tối ưu'
  },
  {
    id: 24, name: 'Emerica Reynolds 3 G6', brand: 'Emerica', price: 1600000, originalPrice: 2000000,
    rating: 4.5, reviews: 89, sold: 480, stock: 25,
    category: 'skateboarding', categoryLabel: 'Skateboard', tags: ['new', 'sale'],
    gradient: 'from-red-500 to-orange-600', accent: 'bg-red-100 text-red-700',
    description: 'Collab cùng Andrew Reynolds — cho dân chuyên nghiệp'
  }
]

// ─── BRAND ACCENT + NORMALIZE TỪ API ────────────────────────────────────────────
const BRAND_ACCENT = {
  Nike: 'bg-sky-100 text-sky-700', Adidas: 'bg-emerald-100 text-emerald-700',
  Jordan: 'bg-red-100 text-red-700', Vans: 'bg-slate-100 text-slate-700',
  Converse: 'bg-amber-100 text-amber-700', Puma: 'bg-pink-100 text-pink-700',
  Reebok: 'bg-cyan-100 text-cyan-700', 'New Balance': 'bg-yellow-100 text-yellow-700',
  Brooks: 'bg-teal-100 text-teal-700', Hoka: 'bg-purple-100 text-purple-700',
  Asics: 'bg-orange-100 text-orange-700', DC: 'bg-blue-100 text-blue-800',
  Emerica: 'bg-red-100 text-red-700'
}
const normalizeProduct = (p) => ({
  ...p,
  originalPrice: p.original_price ?? p.originalPrice ?? 0,
  categoryLabel: p.category_label ?? p.categoryLabel ?? p.category ?? '',
  tags: Array.isArray(p.tags) ? p.tags
    : (typeof p.tags === 'string' ? (() => { try { return JSON.parse(p.tags) } catch { return [] } })() : []),
  accent: p.accent || BRAND_ACCENT[p.brand] || 'bg-gray-100 text-gray-700',
  gradient: p.gradient || 'from-gray-300 to-gray-500',
  description: p.description || ''
})

const CATEGORIES_LIST = [
  { id: 'running', label: '🏃 Chạy bộ' },
  { id: 'lifestyle', label: '👟 Lifestyle' },
  { id: 'skateboarding', label: '🛹 Skateboard' }
]
const TAG_OPTIONS = [
  { id: 'new', label: '✨ Hàng mới' },
  { id: 'sale', label: '⚡ Đang sale' },
  { id: 'bestseller', label: '🔥 Bán chạy' }
]
const SORT_OPTIONS = [
  { value: 'default', label: '🔀 Mặc định' },
  { value: 'price-asc', label: '💰 Giá tăng dần' },
  { value: 'price-desc', label: '💎 Giá giảm dần' },
  { value: 'rating-desc', label: '⭐ Đánh giá cao nhất' },
  { value: 'reviews-desc', label: '💬 Nhiều đánh giá nhất' },
  { value: 'sold-desc', label: '🔥 Bán chạy nhất' },
  { value: 'discount-desc', label: '🏷️ Giảm giá nhiều nhất' }
]
const PRICE_PRESETS = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 1.5 triệu', min: 0, max: 1500000 },
  { label: '1.5 – 2.5 triệu', min: 1500000, max: 2500000 },
  { label: '2.5 – 4 triệu', min: 2500000, max: 4000000 },
  { label: 'Trên 4 triệu', min: 4000000, max: Infinity }
]
const INIT_FILTERS = {
  query: '',
  categories: [],
  brands: [],
  tags: [],
  priceMin: '',
  priceMax: '',
  minRating: 0,
  inStockOnly: false
}

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
const discountPct = (orig, sale) => Math.round(((orig - sale) / orig) * 100)

// ─── CHECKBOX ITEM ────────────────────────────────────────────────────────────
const CheckItem = ({ checked, onChange, label, count }) => (
  <div
    className="flex items-center justify-between gap-2 py-1.5 cursor-pointer group"
    onClick={onChange}
  >
    <div className="flex items-center gap-2.5">
      <div className={`w-[18px] h-[18px] rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
        checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
      }`}>
        {checked && <span className="text-white text-xs leading-none">✓</span>}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{count}</span>
    )}
  </div>
)

// ─── FILTER CHIP ──────────────────────────────────────────────────────────────
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-red-500 transition font-bold text-sm leading-none"
    >×</button>
  </span>
)

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
const ResultCard = ({ product }) => {
  const navigate = useNavigate()
  const discount = product.originalPrice > product.price
    ? discountPct(product.originalPrice, product.price) : 0

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            -{discount}%
          </span>
        )}
        {product.tags.includes('bestseller') && (
          <span className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            🔥 HOT
          </span>
        )}
        {product.stock <= 10 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Sắp hết
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.accent}`}>{product.brand}</span>
          <span className="text-xs text-gray-400">{product.categoryLabel}</span>
        </div>
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm leading-snug flex-1">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-3 line-clamp-1">{product.description}</p>
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={`text-xs ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
          <span className="text-xs text-gray-300 ml-1">• {product.sold?.toLocaleString()} đã bán</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-base font-extrabold text-gray-900">{fmt(product.price)}</div>
            {product.originalPrice > product.price && (
              <div className="text-xs text-gray-400 line-through">{fmt(product.originalPrice)}</div>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); toast.success(`🛒 Đã thêm "${product.name}" vào giỏ!`) }}
            className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition text-lg font-bold"
          >+</button>
        </div>
      </div>
    </div>
  )
}

// ─── FILTER PANEL (tách riêng, nhận props) ────────────────────────────────────
const FilterPanel = ({ filters, setFilters, toggleArray, clearAllFilters, activeChips, allProducts: apList }) => {
  const productList = apList?.length ? apList : ALL_PRODUCTS
  const brands = useMemo(() => [...new Set(productList.map(p => p.brand))].sort(), [productList])
  const brandCounts = useMemo(() =>
    brands.reduce((acc, b) => { acc[b] = productList.filter(p => p.brand === b).length; return acc }, {}),
  [brands, productList])
  const catCounts = useMemo(() =>
    CATEGORIES_LIST.reduce((acc, c) => { acc[c.id] = productList.filter(p => p.category === c.id).length; return acc }, {}),
  [productList])

  return (
    <div className="space-y-6 text-sm">

      {/* Danh mục */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          🗂️ Danh mục
          {filters.categories.length > 0 && (
            <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {filters.categories.length}
            </span>
          )}
        </h3>
        {CATEGORIES_LIST.map(cat => (
          <CheckItem
            key={cat.id}
            checked={filters.categories.includes(cat.id)}
            onChange={() => toggleArray('categories', cat.id)}
            label={cat.label}
            count={catCounts[cat.id]}
          />
        ))}
      </div>

      <hr className="border-gray-100" />

      {/* Thương hiệu */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          🏷️ Thương hiệu
          {filters.brands.length > 0 && (
            <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {filters.brands.length}
            </span>
          )}
        </h3>
        {brands.map(b => (
          <CheckItem
            key={b}
            checked={filters.brands.includes(b)}
            onChange={() => toggleArray('brands', b)}
            label={b}
            count={brandCounts[b]}
          />
        ))}
      </div>

      <hr className="border-gray-100" />

      {/* Khoảng giá */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">💰 Khoảng giá</h3>
        <div className="space-y-1.5 mb-3">
          {PRICE_PRESETS.map(preset => {
            const isAll = preset.min === 0 && preset.max === Infinity
            const isActive = isAll
              ? filters.priceMin === '' && filters.priceMax === ''
              : Number(filters.priceMin) === preset.min &&
                (preset.max === Infinity ? filters.priceMax === '' : Number(filters.priceMax) === preset.max)
            return (
              <button
                key={preset.label}
                onClick={() => setFilters(f => ({
                  ...f,
                  priceMin: preset.min === 0 ? '' : String(preset.min),
                  priceMax: preset.max === Infinity ? '' : String(preset.max)
                }))}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Từ"
            value={filters.priceMin}
            onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400 transition"
          />
          <span className="text-gray-400 text-xs flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Đến"
            value={filters.priceMax}
            onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400 transition"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Tags */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">🔖 Nhãn sản phẩm</h3>
        {TAG_OPTIONS.map(tag => (
          <CheckItem
            key={tag.id}
            checked={filters.tags.includes(tag.id)}
            onChange={() => toggleArray('tags', tag.id)}
            label={tag.label}
          />
        ))}
      </div>

      <hr className="border-gray-100" />

      {/* Rating tối thiểu */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">⭐ Đánh giá tối thiểu</h3>
        <div className="space-y-1.5">
          {[0, 4, 4.3, 4.5, 4.7].map(val => (
            <button
              key={val}
              onClick={() => setFilters(f => ({ ...f, minRating: val }))}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                filters.minRating === val
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              {val === 0 ? (
                <span>Tất cả</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={s <= val ? 'text-amber-400' : 'text-gray-200'}>★</span>
                    ))}
                  </span>
                  <span>từ {val}</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Toggle còn hàng */}
      <div>
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setFilters(f => ({ ...f, inStockOnly: !f.inStockOnly }))}
        >
          <div className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${
            filters.inStockOnly ? 'bg-blue-600' : 'bg-gray-200'
          }`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
              filters.inStockOnly ? 'left-5' : 'left-1'
            }`}></div>
          </div>
          <span className={`text-sm font-medium ${filters.inStockOnly ? 'text-blue-700' : 'text-gray-600'}`}>
            📦 Chỉ hiện còn hàng
          </span>
        </div>
      </div>

      {/* Clear all */}
      {activeChips.length > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2.5 border-2 border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition text-sm"
        >
          🗑️ Xoá tất cả bộ lọc
        </button>
      )}
    </div>
  )
}

// ─── MAIN SEARCH PAGE ─────────────────────────────────────────────────────────
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo } = useSelector(s => s.user)

  const [filters, setFilters] = useState({
    ...INIT_FILTERS,
    query: searchParams.get('q') || ''
  })
  const [sort, setSort] = useState('default')
  const [inputQuery, setInputQuery] = useState(searchParams.get('q') || '')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [pagination, setPagination] = useState({ hash: '', page: 1 })
  const [allProducts, setAllProducts] = useState([])
  const ITEMS_PER_PAGE = 9

  // Debounce input → cập nhật filter + URL
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => ({ ...f, query: inputQuery }))
      const params = new URLSearchParams()
      if (inputQuery) params.set('q', inputQuery)
      setSearchParams(params, { replace: true })
    }, 350)
    return () => clearTimeout(t)
  }, [inputQuery, setSearchParams])

  const toggleArray = useCallback((key, value) => {
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter(v => v !== value)
        : [...f[key], value]
    }))
  }, [])

  // ── Fetch tất cả sản phẩm từ API (gọi 1 lần khi mount) ───────────────────
  useEffect(() => {
    productAPI.getProductsAPI({ limit: 100 })
      .then(res => {
        if (res?.success && Array.isArray(res.data))
          setAllProducts(res.data.map(normalizeProduct))
      })
      .catch(() => { /* fallback về ALL_PRODUCTS tĩnh nếu API lỗi */ })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(INIT_FILTERS)
    setInputQuery('')
    setSort('default')
    setSearchParams({})
  }, [setSearchParams])

  // Filtering + sorting
  const results = useMemo(() => {
    let list = [...(allProducts.length ? allProducts : ALL_PRODUCTS)]

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      )
    }
    if (filters.categories.length > 0)
      list = list.filter(p => filters.categories.includes(p.category))
    if (filters.brands.length > 0)
      list = list.filter(p => filters.brands.includes(p.brand))
    if (filters.tags.length > 0)
      list = list.filter(p => filters.tags.every(t => p.tags.includes(t)))

    const minP = filters.priceMin !== '' ? Number(filters.priceMin) : 0
    const maxP = filters.priceMax !== '' ? Number(filters.priceMax) : Infinity
    list = list.filter(p => p.price >= minP && p.price <= maxP)

    if (filters.minRating > 0) list = list.filter(p => p.rating >= filters.minRating)
    if (filters.inStockOnly) list = list.filter(p => p.stock > 0)

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'rating-desc') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'reviews-desc') list.sort((a, b) => b.reviews - a.reviews)
    else if (sort === 'sold-desc') list.sort((a, b) => (b.sold || 0) - (a.sold || 0))
    else if (sort === 'discount-desc')
      list.sort((a, b) => discountPct(b.originalPrice, b.price) - discountPct(a.originalPrice, a.price))

    return list
  }, [filters, sort, allProducts])

  // Derive currentPage: tự reset về 1 khi filter/sort thay đổi
  const filterHash = JSON.stringify(filters) + sort
  const currentPage = pagination.hash === filterHash ? pagination.page : 1
  const setCurrentPage = (page) => setPagination({ hash: filterHash, page })

  // Phân trang
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE)
  const paginatedResults = results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Chips tóm tắt các filter đang active
  const activeChips = useMemo(() => {
    const chips = []
    if (filters.query) chips.push({ label: `🔍 "${filters.query}"`, key: 'query' })
    filters.categories.forEach(c => {
      const found = CATEGORIES_LIST.find(x => x.id === c)
      chips.push({ label: found?.label || c, key: 'cat', value: c })
    })
    filters.brands.forEach(b => chips.push({ label: `🏷️ ${b}`, key: 'brand', value: b }))
    filters.tags.forEach(t => {
      const found = TAG_OPTIONS.find(x => x.id === t)
      chips.push({ label: found?.label || t, key: 'tag', value: t })
    })
    if (filters.priceMin) chips.push({ label: `Từ ${fmt(filters.priceMin)}`, key: 'priceMin' })
    if (filters.priceMax) chips.push({ label: `Đến ${fmt(filters.priceMax)}`, key: 'priceMax' })
    if (filters.minRating > 0) chips.push({ label: `⭐ ≥ ${filters.minRating}`, key: 'minRating' })
    if (filters.inStockOnly) chips.push({ label: '📦 Còn hàng', key: 'inStockOnly' })
    return chips
  }, [filters])

  const removeChip = chip => {
    if (chip.key === 'query') { setFilters(f => ({ ...f, query: '' })); setInputQuery('') }
    else if (chip.key === 'cat') toggleArray('categories', chip.value)
    else if (chip.key === 'brand') toggleArray('brands', chip.value)
    else if (chip.key === 'tag') toggleArray('tags', chip.value)
    else if (chip.key === 'priceMin') setFilters(f => ({ ...f, priceMin: '' }))
    else if (chip.key === 'priceMax') setFilters(f => ({ ...f, priceMax: '' }))
    else if (chip.key === 'minRating') setFilters(f => ({ ...f, minRating: 0 }))
    else if (chip.key === 'inStockOnly') setFilters(f => ({ ...f, inStockOnly: false }))
  }

  const handleLogout = () => {
    dispatch(clearUser())
    toast.info('Đã đăng xuất!')
    navigate('/login')
  }

  const filterPanelProps = { filters, setFilters, toggleArray, clearAllFilters, activeChips, allProducts }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-black text-xl text-gray-900 flex-shrink-0">
            <span>👟</span> SNKRS<span className="text-blue-600">.</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setInputQuery('')}
              placeholder="Tìm kiếm giày, thương hiệu, danh mục..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none text-sm transition-all"
              autoFocus
            />
            {inputQuery && (
              <button
                onClick={() => setInputQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
              >×</button>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative group flex-shrink-0">
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userInfo?.username?.charAt(0)?.toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-gray-700">{userInfo?.username}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <Link to="/" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">🏠 Trang chủ</Link>
              <Link to="/user/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">👤 Hồ sơ</Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-500 font-semibold"
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── HEADER ROW ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {filters.query ? `Kết quả cho "${filters.query}"` : '🔍 Tìm kiếm & Lọc sản phẩm'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Tìm thấy <strong className="text-gray-700">{results.length}</strong> / {allProducts.length || ALL_PRODUCTS.length} sản phẩm
              {activeChips.length > 0 && ` — ${activeChips.length} bộ lọc đang áp dụng`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden relative flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <span>⚙️</span> Bộ lọc
              {activeChips.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white outline-none focus:border-blue-400 transition appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>

            {/* View mode toggle */}
            <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm transition ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >⊞</button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm transition ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >☰</button>
            </div>
          </div>
        </div>

        {/* ── ACTIVE FILTER CHIPS ───────────────────────────────────── */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
            <span className="text-xs font-bold text-gray-500 self-center mr-1">Bộ lọc:</span>
            {activeChips.map((chip, i) => (
              <FilterChip key={i} label={chip.label} onRemove={() => removeChip(chip)} />
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-red-500 hover:underline self-center ml-1"
            >
              Xoá tất cả
            </button>
          </div>
        )}

        <div className="flex gap-6">

          {/* ── SIDEBAR (desktop) ────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900">⚙️ Bộ lọc</h2>
                {activeChips.length > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {activeChips.length}
                  </span>
                )}
              </div>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* ── MOBILE FILTER DRAWER ─────────────────────────────────── */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <h2 className="font-black text-gray-900">⚙️ Bộ lọc</h2>
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg"
                  >×</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                  <FilterPanel {...filterPanelProps} />
                </div>
                <div className="p-4 border-t border-gray-100 bg-white">
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition"
                  >
                    Xem {results.length} kết quả →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── KẾT QUẢ ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-7xl mb-4">😕</span>
                <h3 className="text-xl font-black text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-400 mb-6 max-w-sm">
                  Thử thay đổi từ khoá hoặc bỏ bớt điều kiện lọc.
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                  >🔄 Xoá bộ lọc</button>
                  <Link
                    to="/"
                    className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                  >🏠 Về trang chủ</Link>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedResults.map(p => <ResultCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 p-4 group hover:border-blue-100"
                  >
                    <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.accent}`}>{p.brand}</span>
                        <span className="text-xs text-gray-400 self-center">{p.categoryLabel}</span>
                        {p.tags.includes('sale') && (
                          <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            -{discountPct(p.originalPrice, p.price)}% OFF
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-800 mb-0.5 truncate">{p.name}</h4>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`text-xs ${s <= Math.round(p.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                          ))}
                          <span className="text-xs text-gray-500 ml-0.5">{p.rating} ({p.reviews})</span>
                        </div>
                        <span className="text-xs text-gray-400">• {p.sold?.toLocaleString()} đã bán</span>
                        {p.stock <= 10 && p.stock > 0 && (
                          <span className="text-xs font-bold text-orange-500">Sắp hết hàng</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right flex flex-col justify-between">
                      <div>
                        <div className="text-lg font-extrabold text-gray-900">{fmt(p.price)}</div>
                        {p.originalPrice > p.price && (
                          <div className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</div>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); toast.success(`🛒 Đã thêm "${p.name}" vào giỏ!`) }}
                        className="mt-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition"
                      >Thêm giỏ</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── PHÂN TRANG ─────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >«</button>
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`dot-${idx}`} className="px-2 text-gray-400">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => { setCurrentPage(item); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                          currentPage === item
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >{item}</button>
                    )
                  )
                }
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >›</button>
                <button
                  onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >»</button>
                <span className="text-sm text-gray-400 ml-2">
                  Trang {currentPage}/{totalPages} • {results.length} sản phẩm
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
