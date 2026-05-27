import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearUser } from '~/redux/userSlice'
import { setCartCount } from '~/redux/cartSlice'
import { toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import { productAPI, cartAPI, wishlistAPI } from '~/apis/index'
import HorizontalCarousel from '~/components/HorizontalCarousel'
import { getProductImage, SHOE_IMAGES, DEFAULT_SHOE_IMG } from '~/utils/shoeImages'

// Chuẩn hóa field từ DB (snake_case) về camelCase cho ProductCard
const normalizeProduct = (p) => ({
  ...p,
  tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags) : []),
  originalPrice: p.original_price ?? p.originalPrice ?? 0,
  categoryLabel: p.category_label ?? p.categoryLabel ?? p.category ?? ''
})

const CATEGORIES_STATIC = [
  { id: 'all', label: '🏠 Tất cả' },
  { id: 'running', label: '🏃 Chạy bộ' },
  { id: 'lifestyle', label: '👟 Lifestyle' },
  { id: 'skateboarding', label: '🛹 Skateboard' }
]

// ─── FORMAT GIÁ TIỀN ────────────────────────────────────────────────────────
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
const discountPercent = (original, sale) => Math.round(((original - sale) / original) * 100)

// ─── PRODUCT CARD COMPONENT ──────────────────────────────────────────
const ProductCard = ({ product, onAddToCart, initialWishlisted = false }) => {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const navigate = useNavigate()
  const userInfo = useSelector(s => s.user.userInfo)

  // Sync lại khi dữ liệu wishlist từ server về
  useEffect(() => { setWishlisted(initialWishlisted) }, [initialWishlisted])

  const handleWishlistToggle = async (e) => {
    e.stopPropagation()
    if (!userInfo) { toast.warning('Vui lòng đăng nhập để lưu yêu thích!'); return }
    setWishlistLoading(true)
    try {
      const res = await wishlistAPI.toggleWishlistAPI(product.id)
      setWishlisted(res.wishlisted)
      toast(res.wishlisted ? '❤️ Đã thêm vào yêu thích!' : '💔 Đã xóa khỏi yêu thích', { autoClose: 1500 })
    } catch {
      toast.error('Có lỗi xảy ra!')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`)
    }
  }

  const originalPrice = product.original_price ?? product.originalPrice ?? 0

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
      {/* Ảnh sản phẩm */}
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="relative h-52 overflow-hidden cursor-pointer bg-gray-100">
        {/* Badge */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
          {product.tags.includes('new') && (
            <span className="px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full shadow">MỚI</span>
          )}
          {product.tags.includes('bestseller') && (
            <span className="px-2 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full shadow">🔥 HOT</span>
          )}
          {product.tags.includes('sale') && originalPrice > product.price && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow">
              -{discountPercent(originalPrice, product.price)}%
            </span>
          )}
        </div>
        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition z-10 disabled:opacity-60"
        >
          <span className="text-lg">{wishlisted ? '❤️' : '🤍'}</span>
        </button>
        {/* Shoe image - dùng image_url từ DB */}
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => {
            e.target.onerror = null
            // fallback theo tên sản phẩm thay vì cùng 1 ảnh Nike
            e.target.src = SHOE_IMAGES[product.name] || DEFAULT_SHOE_IMG
          }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-white text-gray-800 font-bold rounded-full text-sm hover:bg-gray-100 transition shadow-lg"
          >
            🛒 Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-4">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${product.accent}`}>
          {product.brand}
        </span>
        <h3
          onClick={() => navigate(`/product/${product.id}`)}
          className="font-bold text-gray-800 mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors"
        >{product.name}</h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-1">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={`text-xs ${star <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Giá */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-extrabold text-gray-900">{formatPrice(product.price)}</span>
            {originalPrice > product.price && (
              <div className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</div>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-gray-700 transition text-lg"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── COUNTDOWN TIMER ─────────────────────────────────────────────────────────
const useCountdown = (hours = 5, minutes = 30, seconds = 0) => {
  const total = hours * 3600 + minutes * 60 + seconds
  const [timeLeft, setTimeLeft] = useState(total)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const h = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const s = String(timeLeft % 60).padStart(2, '0')
  return { h, m, s }
}

const TimeBlock = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-gray-900 text-white font-mono font-extrabold text-2xl w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
      {value}
    </div>
    <span className="text-xs text-gray-400 mt-1 font-medium">{label}</span>
  </div>
)

// ─── MAIN HOMEPAGE COMPONENT ─────────────────────────────────────────────────
const HomePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userInfo } = useSelector((state) => state.user)
  const { h, m, s } = useCountdown(5, 47, 22)

  const [activeCategory, setActiveCategory] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const cartCount = useSelector(s => s.cart.count)

  // ── Fetch sản phẩm từ API (thay thế dữ liệu tĩnh) ──────────────────────────
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState(CATEGORIES_STATIC)
  const [topSellers, setTopSellers] = useState([])
  const [mostViewed, setMostViewed] = useState([])
  const [rankLoading, setRankLoading] = useState(true)
  const [wishlistIds, setWishlistIds] = useState(new Set())

  // Fetch cart count khi vào trang
  useEffect(() => {
    cartAPI.getCartAPI()
      .then(res => dispatch(setCartCount(res.data?.totalCount || 0)))
      .catch(() => {})
  }, [dispatch])

  // Fetch wishlist IDs khi user đăng nhập
  useEffect(() => {
    if (!userInfo) { setWishlistIds(new Set()); return }
    wishlistAPI.getMyWishlistAPI()
      .then(res => {
        const ids = new Set((res?.data || []).map(item => item.id))
        setWishlistIds(ids)
      })
      .catch(() => {})
  }, [userInfo])

  // Fetch sản phẩm + danh mục từ API
  useEffect(() => {
    Promise.all([
      productAPI.getProductsAPI({ limit: 24 }),
      productAPI.getCategoriesAPI()
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.success) {
          setAllProducts((prodRes.data || []).map(normalizeProduct))
        }
        if (catRes.success) {
          setCategories(catRes.data || CATEGORIES_STATIC)
        }
      })
      .catch(() => {})
      .finally(() => {})
  }, [])

  useEffect(() => {
    Promise.all([
      productAPI.getTopSellersAPI(),
      productAPI.getMostViewedAPI()
    ])
      .then(([sellRes, viewRes]) => {
        setTopSellers((sellRes.data || []).map(normalizeProduct))
        setMostViewed((viewRes.data || []).map(normalizeProduct))
      })
      .catch(() => {})
      .finally(() => setRankLoading(false))
  }, [])

  const handleAddToCart = async (product) => {
    try {
      const res = await cartAPI.addToCartAPI({ product_id: product.id, quantity: 1 })
      dispatch(setCartCount(res.data?.totalCount || 0))
      toast.success(`🛒 Đã thêm "${product.name}" vào giỏ hàng!`)
    } catch {
      toast.error('Đã có lỗi khi thêm vào giỏ hàng')
    }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
    if (e.key === 'Escape') setShowSearch(false)
  }

  const handleLogout = () => {
    dispatch(clearUser())
    toast.info('Đã đăng xuất!')
    navigate('/login')
  }

  // Lọc sản phẩm theo danh mục
  const filteredProducts = activeCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === activeCategory)

  // Phân trang Danh mục (8 sp / trang)
  const [catPage, setCatPage] = useState(1)
  const CAT_PER_PAGE = 8
  const prevCategoryRef = useRef(activeCategory)
  useEffect(() => {
    if (prevCategoryRef.current !== activeCategory) {
      prevCategoryRef.current = activeCategory
      setCatPage(1)
    }
  }, [activeCategory])
  const catTotalPages = Math.ceil(filteredProducts.length / CAT_PER_PAGE)
  const pagedFilteredProducts = filteredProducts.slice((catPage - 1) * CAT_PER_PAGE, catPage * CAT_PER_PAGE)

  const flashSaleProducts = allProducts.filter(p => p.tags.includes('sale')).slice(0, 4)
  const newArrivals = allProducts.filter(p => p.tags.includes('new')).slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">👟</span>
            <span className="text-xl font-black tracking-tight text-gray-900">SNKRS<span className="text-blue-600">.</span></span>
          </Link>

          {/* Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
            <a href="#new-arrivals" className="hover:text-blue-600 transition">Hàng mới</a>
            <a href="#best-sellers" className="hover:text-blue-600 transition">Bán chạy</a>
            <a href="#flash-sale" className="hover:text-blue-600 transition flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Flash Sale
            </a>
            <button
              onClick={() => navigate('/search')}
              className="hover:text-blue-600 transition flex items-center gap-1"
            >
              🔍 Tìm kiếm
            </button>
          </div>

          {/* Search bar expand (khi click icon) */}
          {showSearch && (
            <div className="absolute left-0 right-0 top-0 h-16 bg-white/95 backdrop-blur flex items-center px-4 gap-3 z-10">
              <span className="text-xl">🔍</span>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Tìm kiếm giày, thương hiệu..."
                className="flex-1 bg-transparent outline-none text-gray-800 text-base font-medium placeholder-gray-400"
              />
              <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search icon */}
            <button
              onClick={() => { setShowSearch(true); setSearchQuery('') }}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
              title="Tìm kiếm"
            >
              <span className="text-xl">🔍</span>
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition"
              title="Giỏ hàng"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User Avatar + Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userInfo?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700">{userInfo?.username}</span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/user/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700">
                  <span>👤</span> Hồ sơ cá nhân
                </Link>
                <Link
                  to="/orders"
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <span>📦</span> Đơn hàng của tôi
                </Link>
                <Link
                  to="/user/profile?tab=wishlist"
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <span>❤️</span> Yêu thích
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-500 font-semibold"
                >
                  <span>🚪</span> Đăng xuất
                </button>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm font-semibold text-gray-700">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>🏠 Trang chủ</Link>
            <a href="#new-arrivals" onClick={() => setMobileMenuOpen(false)}>✨ Hàng mới</a>
            <a href="#best-sellers" onClick={() => setMobileMenuOpen(false)}>🔥 Bán chạy</a>
            <a href="#flash-sale" onClick={() => setMobileMenuOpen(false)}>⚡ Flash Sale</a>
          </div>
        )}
      </nav>

      {/* ── HERO BANNER ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-gray-900 via-blue-950 to-indigo-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold text-blue-200">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Bộ sưu tập Hè 2026 đã ra mắt
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Bước chân <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                tự tin
              </span>{' '}
              hơn
            </h1>
            <p className="text-gray-300 text-lg max-w-md">
              Khám phá hơn <strong className="text-white">500+</strong> mẫu giày thể thao chính hãng từ các thương hiệu hàng đầu thế giới.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a href="#new-arrivals"
                className="px-7 py-3.5 bg-white text-gray-900 font-bold rounded-2xl hover:bg-blue-50 transition shadow-xl shadow-blue-900/30 active:scale-95"
              >
                Mua ngay →
              </a>
              <a href="#flash-sale"
                className="px-7 py-3.5 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition active:scale-95"
              >
                ⚡ Flash Sale
              </a>
            </div>
            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[['500+', 'Sản phẩm'], ['50K+', 'Khách hàng'], ['15+', 'Thương hiệu'], ['4.9★', 'Đánh giá']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="flex-1 flex justify-center items-center relative">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full flex items-center justify-center">
                <span className="text-8xl md:text-9xl drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>👟</span>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute top-4 right-0 bg-white text-gray-900 rounded-2xl px-4 py-2.5 shadow-xl text-sm font-bold">
              <div className="text-green-600">✓ Giao hàng miễn phí</div>
              <div className="text-xs text-gray-400">Đơn từ 500K</div>
            </div>
            <div className="absolute bottom-4 left-0 bg-white text-gray-900 rounded-2xl px-4 py-2.5 shadow-xl text-sm font-bold">
              <div className="text-orange-500">🔥 Giảm đến 40%</div>
              <div className="text-xs text-gray-400">Flash Sale hôm nay</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMO STRIP ────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-semibold">
          {[['🚀', 'Giao hàng nhanh 2H nội thành'], ['🔄', 'Đổi trả miễn phí 30 ngày'], ['🛡️', '100% hàng chính hãng'], ['💳', 'Thanh toán an toàn']].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-2">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* ── FLASH SALE ───────────────────────────────────────────────── */}
        <section id="flash-sale">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                ⚡ Flash Sale
                <span className="text-sm font-normal bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Giảm sốc</span>
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">Ưu đãi có hạn — đừng bỏ lỡ!</p>
            </div>
            {/* Countdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500">Kết thúc sau:</span>
              <div className="flex items-center gap-1.5">
                <TimeBlock value={h} label="Giờ" />
                <span className="text-2xl font-black text-gray-400 mb-5">:</span>
                <TimeBlock value={m} label="Phút" />
                <span className="text-2xl font-black text-gray-400 mb-5">:</span>
                <TimeBlock value={s} label="Giây" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flashSaleProducts.map(p => <ProductCard key={p.id} product={p} isFlashSale onAddToCart={handleAddToCart} initialWishlisted={wishlistIds.has(p.id)} />)}
          </div>
        </section>

        {/* ── CATEGORIES ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-gray-900">🗂️ Danh mục sản phẩm</h2>
            <Link
              to="/category/all"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="flex gap-3 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
                {cat.count != null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {pagedFilteredProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} initialWishlisted={wishlistIds.has(p.id)} />)}
          </div>

          {/* ── PHÂN TRANG DANH MỤC ────────────────────────────────── */}
          {catTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              <button
                onClick={() => setCatPage(p => Math.max(1, p - 1))}
                disabled={catPage === 1}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >‹ Trước</button>
              {Array.from({ length: catTotalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCatPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                    catPage === page
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >{page}</button>
              ))}
              <button
                onClick={() => setCatPage(p => Math.min(catTotalPages, p + 1))}
                disabled={catPage === catTotalPages}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >Sau ›</button>
              <span className="text-sm text-gray-400 ml-1">Trang {catPage}/{catTotalPages}</span>
            </div>
          )}

          {/* Link xem toàn bộ từng danh mục */}
          <div className="flex gap-3 mt-6 flex-wrap">
            {categories.filter(c => c.id !== 'all').map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                {cat.label}
                {cat.count != null && (
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">{cat.count}</span>
                )}
                <span className="text-xs text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── NEW ARRIVALS ─────────────────────────────────────────────── */}
        <section id="new-arrivals">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                ✨ Hàng mới về
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">Bộ sưu tập mới nhất vừa cập bến</p>
            </div>
            <button className="text-sm font-semibold text-blue-600 hover:underline">Xem tất cả →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} initialWishlisted={wishlistIds.has(p.id)} />)}
          </div>
        </section>

        {/* ── PROMOTIONAL BANNER ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-8 text-white flex flex-col justify-between min-h-44">
            <div>
              <div className="text-sm font-semibold text-violet-200 mb-2">🎉 Ưu đãi đặc biệt</div>
              <h3 className="text-2xl font-black mb-1">Giảm thêm 15%</h3>
              <p className="text-violet-200 text-sm">Cho đơn hàng đầu tiên với mã: <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">SNKRS15</span></p>
            </div>
            <button className="mt-4 self-start px-5 py-2.5 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition text-sm">
              Dùng ngay
            </button>
            <span className="absolute -right-4 -bottom-4 text-9xl opacity-20">👟</span>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white flex flex-col justify-between min-h-44">
            <div>
              <div className="text-sm font-semibold text-amber-100 mb-2">📱 App độc quyền</div>
              <h3 className="text-2xl font-black mb-1">Tải app — Nhận quà</h3>
              <p className="text-amber-100 text-sm">Voucher 100K cho lần mua đầu qua ứng dụng SNKRS</p>
            </div>
            <button className="mt-4 self-start px-5 py-2.5 bg-white text-orange-700 font-bold rounded-xl hover:bg-orange-50 transition text-sm">
              Tải ứng dụng
            </button>
            <span className="absolute -right-4 -bottom-4 text-9xl opacity-20">📱</span>
          </div>
        </section>

        {/* ── BEST SELLERS (API) ────────────────────────────────────── */}
        <section id="best-sellers">
          <HorizontalCarousel
            icon="🔥"
            title="Bán chạy nhất"
            subtitle="Top 10 sản phẩm được mua nhiều nhất"
            products={topSellers}
            loading={rankLoading}
            showRank={true}
            accentColor="bg-orange-500"
          />
        </section>

        {/* ── MOST VIEWED (API) ────────────────────────────────────────── */}
        <section id="most-viewed">
          <HorizontalCarousel
            icon="👁️"
            title="Xem nhiều nhất"
            subtitle="Top 10 sản phẩm được quan tâm nhiều nhất"
            products={mostViewed}
            loading={rankLoading}
            showRank={true}
            accentColor="bg-blue-600"
          />
        </section>

        {/* ── BRAND LOGOS ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-center text-lg font-bold text-gray-400 mb-8 uppercase tracking-widest">Thương hiệu chính hãng</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'Converse', 'Vans', 'Reebok'].map(brand => (
              <span key={brand} className="text-lg font-black text-gray-300 hover:text-gray-600 transition cursor-pointer tracking-tight">
                {brand.toUpperCase()}
              </span>
            ))}
          </div>
        </section>

        {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-gray-900 to-blue-950 rounded-3xl p-10 md:p-14 text-white text-center">
          <h2 className="text-3xl font-black mb-3">📬 Đăng ký nhận ưu đãi</h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Nhận thông báo về sản phẩm mới và mã giảm giá độc quyền hàng tuần.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 outline-none focus:border-blue-400 transition text-sm"
            />
            <button
              onClick={() => toast.success('🎉 Đăng ký thành công! Kiểm tra hộp thư của bạn.')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition active:scale-95 text-sm whitespace-nowrap"
            >
              Đăng ký
            </button>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👟</span>
              <span className="text-xl font-black text-white">SNKRS<span className="text-blue-400">.</span></span>
            </div>
            <p className="text-sm leading-relaxed">Cửa hàng giày thể thao chính hãng hàng đầu Việt Nam. Uy tín — Chất lượng — Phong cách.</p>
          </div>
          {[
            { title: 'Sản phẩm', links: ['Nam', 'Nữ', 'Trẻ em', 'Sale'] },
            { title: 'Hỗ trợ', links: ['Chính sách đổi trả', 'Hướng dẫn chọn size', 'Liên hệ', 'FAQ'] },
            { title: 'Theo dõi', links: ['Facebook', 'Instagram', 'TikTok', 'YouTube'] }
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-bold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map(link => (
                  <li key={link}>
                    <button
                      onClick={() => toast.info('Chức năng đang phát triển!')}
                      className="hover:text-white transition"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
          PHẠM NGỌC HỮU - 23110233
        </div>
      </footer>

    </div>
  )
}

export default HomePage
