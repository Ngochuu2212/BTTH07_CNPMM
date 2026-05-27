import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { productAPI, cartAPI } from '~/apis/index'
import { reviewAPI } from '~/apis/index'
import { getProductImage } from '~/utils/shoeImages'
import { setCartCount } from '~/redux/cartSlice'

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
const discountPercent = (orig, sale) => Math.round(((orig - sale) / orig) * 100)

// ─── SWIPER — POOL ẢNH GÓC NHÌN KHÁC NHAU ──────────────────────────────────
const ANGLE_POOL = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80',
  'https://images.unsplash.com/photo-1556906781-9a412961d28e?w=600&q=80',
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&q=80',
]
const getProductImages = (product) => {
  const main = getProductImage(product)
  const off = (product?.id || 0) % ANGLE_POOL.length
  const extras = []
  for (let i = 1; extras.length < 3; i++) {
    const img = ANGLE_POOL[(off + i) % ANGLE_POOL.length]
    if (img !== main) extras.push(img)
  }
  return [main, ...extras]
}

// ─── STAR RATING ────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 'text-sm' }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} className={`${size} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
    ))}
  </div>
)

// ─── ẢNH SẢN PHẨM (dùng image_url nếu có, fallback gradient) ─────────────
const ProductImage = ({ product, className = '', labelClass = '' }) => {
  const [imgError, setImgError] = useState(false)
  if (product?.image_url && !imgError) {
    return (
      <img
        src={product.image_url}
        alt={product.name}
        className={className}
        onError={() => setImgError(true)}
        style={{ objectFit: 'cover' }}
      />
    )
  }
  // Fallback gradient
  return (
    <div
      className={`bg-gradient-to-br ${product?.gradient || 'from-gray-300 to-gray-500'} flex items-center justify-center ${className}`}
    >
      <span className={labelClass || 'text-6xl'}>👟</span>
    </div>
  )
}

// ─── PRODUCT CARD NHỎ (Similar) ─────────────────────────────────────────────
const SimilarCard = ({ product }) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  return (
    <div
      onClick={() => { navigate(`/product/${product.id}`); window.scrollTo(0, 0) }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 cursor-pointer group"
    >
      <div className="h-40 relative overflow-hidden">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${product.gradient || 'from-gray-300 to-gray-500'} flex items-center justify-center`}>
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">👟</span>
          </div>
        )}
        {product.stock <= 10 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            Sắp hết
          </span>
        )}
      </div>
      <div className="p-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.accent || 'bg-gray-100 text-gray-700'}`}>{product.brand}</span>
        <h4 className="font-bold text-gray-800 mt-1 text-sm truncate">{product.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-gray-900 text-sm">{formatPrice(product.price)}</span>
          {product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
const SkeletonLoader = () => (
  <div className="min-h-screen bg-gray-50">
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm h-14" />
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        <div className="bg-gray-200 animate-pulse rounded-3xl h-96" />
        <div className="space-y-4">
          {[80, 60, 40, 100, 80, 60].map((w, i) => (
            <div key={i} className={`bg-gray-200 animate-pulse rounded-xl h-8 w-${w}%`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cartCount = useSelector(s => s.cart.count)

  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [addingToCart, setAddingToCart] = useState(false)
  const [mainImgError, setMainImgError] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [images, setImages] = useState([])
  const [reviewsList, setReviewsList] = useState([])
  const [reviewsAvg, setReviewsAvg] = useState(0)
  const [reviewsTotal, setReviewsTotal] = useState(0)

  // ── Fetch sản phẩm theo ID ──────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      setProduct(null)
      setSimilarProducts([])
      setQuantity(1)
      setSelectedSize(null)
      setSelectedColor(0)
      setActiveTab('description')
      setMainImgError(false)
      setActiveImg(0)
      setImages([])
      window.scrollTo(0, 0)

      try {
        // Lấy chi tiết sản phẩm
        const res = await productAPI.getProductByIdAPI(id)
        if (!res.success || !res.data) {
          setError('Không tìm thấy sản phẩm')
          return
        }
        const p = res.data
        setProduct(p)
        setImages(getProductImages(p))

        // Lấy đánh giá thực tế từ DB
        try {
          const rvRes = await reviewAPI.getProductReviewsAPI(id)
          setReviewsList(rvRes.reviews || [])
          setReviewsAvg(rvRes.avgRating || 0)
          setReviewsTotal(rvRes.totalReviews || 0)
        } catch { /* bỏ qua nếu lỗi reviews */ }

        // Lấy sản phẩm tương tự (cùng category, khác id)
        try {
          const simRes = await productAPI.getProductsAPI({ category: p.category, limit: 10 })
          if (simRes.success && simRes.data) {
            setSimilarProducts(simRes.data.filter(sp => sp.id !== p.id).slice(0, 4))
          }
        } catch { /* bỏ qua nếu lỗi similar */ }

        // Tăng lượt xem
        productAPI.incrementViewAPI(id).catch(() => {})
      } catch (err) {
        setError(err?.response?.data?.message || 'Không tìm thấy sản phẩm')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) return <SkeletonLoader />

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <span className="text-6xl">😕</span>
        <h2 className="text-2xl font-bold text-gray-700">{error || 'Không tìm thấy sản phẩm'}</h2>
        <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
          Quay về trang chủ
        </Link>
      </div>
    )
  }

  // Chuẩn bị dữ liệu từ API
  const tags = Array.isArray(product.tags) ? product.tags : []
  const sizes = product.sizes
    ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes)
    : [38, 39, 40, 41, 42, 43, 44]
  const colors = product.colors
    ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors)
    : [{ name: 'Mặc định', hex: '#6b7280' }]
  const features = product.features
    ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features)
    : []

  const stockStatus = product.stock === 0 ? 'out' : product.stock <= 10 ? 'low' : 'in'
  const originalPrice = product.original_price || product.originalPrice || 0
  const categoryLabel = product.category_label || product.categoryLabel || product.category || ''

  const handleAddToCart = async () => {
    if (!selectedSize) { toast.warning('Vui lòng chọn size!'); return }
    setAddingToCart(true)
    try {
      const res = await cartAPI.addToCartAPI({
        product_id: product.id,
        quantity,
        size: String(selectedSize)
      })
      dispatch(setCartCount(res.data?.totalCount || 0))
      toast.success(`🛒 Đã thêm "${product.name}" (Size ${selectedSize}) vào giỏ hàng!`)
    } catch {
      toast.error('Đã có lỗi, vui lòng thử lại')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    if (!selectedSize) { toast.warning('Vui lòng chọn size!'); return }
    toast.success('🎉 Đang chuyển đến trang thanh toán...')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-black text-xl text-gray-900">
            <span>👟</span> SNKRS<span className="text-blue-600">.</span>
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition">Trang chủ</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500 hover:text-blue-600 transition cursor-pointer"
            onClick={() => navigate('/')}>
            {categoryLabel}
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800 truncate max-w-xs">{product.name}</span>

          {/* Cart icon */}
          <button
            onClick={() => navigate('/cart')}
            className="ml-auto relative p-2 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
            title="Giỏ hàng"
          >
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── MAIN PRODUCT SECTION ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">

          {/* ── ẢNH SẢN PHẨM — SWIPER ──────────────────────────────────── */}
          <div className="space-y-3">
            {/* Ảnh chính + điều hướng */}
            <div className="rounded-3xl overflow-hidden shadow-xl bg-gray-100 h-96 flex items-center justify-center relative group select-none">
              <img
                src={images[activeImg] || getProductImage(product)}
                alt={`${product.name} - ảnh ${activeImg + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' }}
              />

              {/* Nút Prev */}
              {activeImg > 0 && (
                <button
                  onClick={() => setActiveImg(i => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-black text-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                >‹</button>
              )}
              {/* Nút Next */}
              {activeImg < images.length - 1 && (
                <button
                  onClick={() => setActiveImg(i => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-black text-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                >›</button>
              )}

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-2 rounded-full transition-all duration-200 ${i === activeImg ? 'bg-white w-5' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                  />
                ))}
              </div>

              {/* Đếm ảnh */}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-xl overflow-hidden h-20 border-2 transition-all duration-200 ${
                    i === activeImg
                      ? 'border-blue-500 shadow-md scale-[1.04]'
                      : 'border-gray-200 hover:border-blue-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Ảnh ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── THÔNG TIN SẢN PHẨM ─────────────────────────────────── */}
          <div className="space-y-5">

            {/* Brand + Category badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.accent || 'bg-gray-100 text-gray-700'}`}>{product.brand}</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                📂 {categoryLabel}
              </span>
              {tags.includes('new') && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">✨ Hàng mới</span>
              )}
              {tags.includes('bestseller') && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">🔥 Bán chạy</span>
              )}
              {tags.includes('sale') && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  ⚡ Giảm {discountPercent(originalPrice, product.price)}%
                </span>
              )}
            </div>

            {/* Tên sản phẩm */}
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>

            {/* Rating + Sold */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <StarRating rating={product.rating} size="text-base" />
                <span className="font-bold text-gray-800">{product.rating}</span>
                <span className="text-gray-400 text-sm">({product.reviews} đánh giá)</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-sm text-gray-500">
                <strong className="text-gray-700">{Number(product.sold).toLocaleString()}</strong> đã bán
              </span>
            </div>

            {/* Giá */}
            <div className={`${product.bgLight || 'bg-gray-50'} rounded-2xl p-4 flex items-end gap-4 border border-gray-100`}>
              <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
              {originalPrice > product.price && (
                <div className="flex flex-col">
                  <span className="text-gray-400 line-through text-sm">{formatPrice(originalPrice)}</span>
                  <span className="text-red-500 font-bold text-sm">
                    Tiết kiệm {formatPrice(originalPrice - product.price)}
                  </span>
                </div>
              )}
            </div>

            {/* Tình trạng kho */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Tình trạng:</span>
              {stockStatus === 'out' && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span> Hết hàng
                </span>
              )}
              {stockStatus === 'low' && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  Sắp hết — còn {product.stock} sản phẩm
                </span>
              )}
              {stockStatus === 'in' && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Còn hàng ({product.stock} sản phẩm)
                </span>
              )}
            </div>

            {/* Chọn màu */}
            {colors.length > 0 && (
              <div>
                <span className="text-sm font-bold text-gray-700 mb-2 block">
                  Màu sắc: <span className="font-normal text-gray-500">{colors[selectedColor]?.name}</span>
                </span>
                <div className="flex gap-2">
                  {colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(i)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${selectedColor === i ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-300'}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Chọn size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Kích cỡ:</span>
                <button className="text-xs text-blue-600 hover:underline font-medium">Bảng size →</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-xl font-bold text-sm border-2 transition-all ${
                      selectedSize === size
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-gray-400 mt-1.5">Vui lòng chọn size trước khi thêm vào giỏ</p>
              )}
            </div>

            {/* Số lượng */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-700">Số lượng:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
                  disabled={quantity >= (product.stock || 10)}
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-400">Tổng: <strong className="text-gray-700">{formatPrice(product.price * quantity)}</strong></span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={stockStatus === 'out' || addingToCart}
                className="flex-1 py-3.5 border-2 border-gray-900 text-gray-900 font-bold rounded-2xl hover:bg-gray-900 hover:text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addingToCart ? '⏳ Đang thêm...' : '🛒 Thêm vào giỏ'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={stockStatus === 'out'}
                className={`flex-1 py-3.5 ${product.accentBtn || 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                ⚡ Mua ngay
              </button>
              <button
                onClick={() => toast('❤️ Đã thêm vào yêu thích!')}
                className="w-12 h-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:border-red-400 hover:bg-red-50 transition"
              >
                🤍
              </button>
            </div>

            {/* Cam kết */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[['🚚', 'Giao hàng miễn phí', 'Đơn từ 500K'], ['🔄', 'Đổi trả 30 ngày', 'Miễn phí đổi size'], ['🛡️', 'Hàng chính hãng', '100% có tem check'], ['💬', 'Hỗ trợ 24/7', 'Chat với chúng tôi']].map(([icon, title, sub]) => (
                <div key={title} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{title}</div>
                    <div className="text-xs text-gray-400">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── TABS: Mô tả / Đặc điểm / Đánh giá ─────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-14 overflow-hidden">
          {/* Tab headers */}
          <div className="flex border-b border-gray-100">
            {[
              { key: 'description', label: '📋 Mô tả sản phẩm' },
              { key: 'features', label: '✅ Đặc điểm nổi bật' },
              { key: 'reviews', label: `⭐ Đánh giá (${reviewsTotal})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Mô tả */}
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                  {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                </p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[['🏷️', 'Thương hiệu', product.brand], ['📂', 'Danh mục', categoryLabel], ['📦', 'Còn hàng', `${product.stock} đôi`], ['🔥', 'Đã bán', `${Number(product.sold).toLocaleString()} đôi`]].map(([icon, label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-xs text-gray-400 font-medium">{label}</div>
                      <div className="font-bold text-gray-800 mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Đặc điểm */}
            {activeTab === 'features' && (
              features.length > 0 ? (
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span className="text-gray-700 font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center py-8">Chưa có thông tin đặc điểm.</p>
              )
            )}

            {/* Đánh giá */}
            {activeTab === 'reviews' && (
              <div>
                {/* Rating tổng quan */}
                <div className="flex items-center gap-8 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-center">
                    <div className="text-5xl font-black text-gray-900">{reviewsAvg > 0 ? reviewsAvg : product.rating}</div>
                    <StarRating rating={reviewsAvg > 0 ? reviewsAvg : product.rating} size="text-xl" />
                    <div className="text-sm text-gray-400 mt-1">{reviewsTotal} đánh giá</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const pct = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 6 : star === 2 ? 2 : 2
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-3">{star}</span>
                          <span className="text-amber-400 text-xs">★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-400 w-6">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Danh sách review */}
                {reviewsList.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsList.map((r) => (
                      <div key={r.id} className="border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {(r.full_name || r.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-sm">{r.full_name || r.username}</div>
                              <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('vi-VN')}</div>
                            </div>
                          </div>
                          <StarRating rating={r.rating} />
                        </div>
                        {r.comment && <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SẢN PHẨM TƯƠNG TỰ ──────────────────────────────────────── */}
        {similarProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">🔗 Sản phẩm tương tự</h2>
                <p className="text-gray-400 text-sm mt-0.5">Cùng danh mục <strong>{categoryLabel}</strong></p>
              </div>
              <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">Xem tất cả →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarProducts.map(p => <SimilarCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* ── FOOTER nhỏ ──────────────────────────────────────────────────── */}
      <footer className="mt-16 bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © 2026 SNKRS Store — <Link to="/" className="hover:text-white transition">Về trang chủ</Link>
      </footer>

    </div>
  )
}

export default ProductDetail
