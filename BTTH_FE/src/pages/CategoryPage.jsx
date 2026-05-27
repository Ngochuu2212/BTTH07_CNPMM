import { useState, useEffect, useReducer, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearUser } from '~/redux/userSlice'
import { toast } from 'react-toastify'
import { productAPI } from '~/apis/index'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8

const CATEGORY_META = {
  all: { label: '🏠 Tất cả sản phẩm', emoji: '👟', color: 'from-gray-700 to-gray-900' },
  running: { label: '🏃 Giày chạy bộ', emoji: '🏃', color: 'from-sky-500 to-blue-700' },
  lifestyle: { label: '👟 Lifestyle', emoji: '✨', color: 'from-violet-500 to-purple-700' },
  skateboarding: { label: '🛹 Skateboarding', emoji: '🛹', color: 'from-slate-500 to-gray-700' }
}

const SORT_OPTIONS = [
  { value: 'default', label: '🔀 Mặc định' },
  { value: 'price-asc', label: '💰 Giá tăng dần' },
  { value: 'price-desc', label: '💎 Giá giảm dần' },
  { value: 'rating-desc', label: '⭐ Đánh giá cao nhất' },
  { value: 'sold-desc', label: '🔥 Bán chạy nhất' }
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = price =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const discountPct = (orig, sale) => Math.round(((orig - sale) / orig) * 100)

// ─── REDUCER cho trạng thái danh sách sản phẩm ───────────────────────────────
const initListState = {
  products: [],
  page: 2,
  hasMore: true,
  loading: false,
  initialLoading: true,
  total: 0
}

function listReducer(state, action) {
  switch (action.type) {
  case 'RESET':
    return { ...initListState }
  case 'FETCH_START':
    return { ...state, loading: true }
  case 'FETCH_SUCCESS': {
    const data = action.append ? [...state.products, ...action.payload.data] : action.payload.data
    return {
      ...state,
      loading: false,
      initialLoading: false,
      products: data,
      total: action.payload.total,
      hasMore: action.payload.hasMore,
      page: action.payload.nextPage
    }
  }
  case 'FETCH_ERROR':
    return { ...state, loading: false, initialLoading: false }
  default:
    return state
  }
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-12 bg-gray-100 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
)

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState(false)
  const tags = Array.isArray(product.tags) ? product.tags : []
  const discount = product.original_price > product.price
    ? discountPct(product.original_price, product.price) : 0

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className={`relative h-48 bg-gradient-to-br ${product.gradient} flex items-center justify-center flex-shrink-0`}>
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {tags.includes('new') && (
            <span className="px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full shadow">MỚI</span>
          )}
          {tags.includes('bestseller') && (
            <span className="px-2 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full shadow">🔥 HOT</span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow">-{discount}%</span>
          )}
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            setWishlist(w => !w)
            toast(wishlist ? 'Đã xoá khỏi yêu thích' : '❤️ Đã thêm vào yêu thích', { autoClose: 1500 })
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition"
        >
          <span className="text-lg">{wishlist ? '❤️' : '🤍'}</span>
        </button>
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Sắp hết
          </span>
        )}
        <span className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300 select-none">👟</span>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <button
            onClick={e => { e.stopPropagation(); toast.success(`🛒 Đã thêm "${product.name}" vào giỏ!`) }}
            className="px-5 py-2 bg-white text-gray-800 font-bold rounded-full text-sm hover:bg-gray-100 transition shadow-lg"
          >
            🛒 Thêm vào giỏ
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.accent}`}>{product.brand}</span>
          <span className="text-xs text-gray-400">{product.category_label}</span>
        </div>
        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 leading-snug flex-1">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-3 line-clamp-1">{product.description}</p>
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={`text-xs ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700">{Number(product.rating).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviews?.toLocaleString()})</span>
          {product.sold > 0 && (
            <span className="text-xs text-gray-300 ml-1">• {product.sold?.toLocaleString()} đã bán</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-base font-extrabold text-gray-900">{fmt(product.price)}</div>
            {product.original_price > product.price && (
              <div className="text-xs text-gray-400 line-through">{fmt(product.original_price)}</div>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); toast.success(`🛒 Đã thêm "${product.name}" vào giỏ!`) }}
            className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition text-lg font-bold flex-shrink-0"
          >+</button>
        </div>
      </div>
    </div>
  )
}

// ─── LIST ITEM ────────────────────────────────────────────────────────────────
const ProductListItem = ({ product }) => {
  const navigate = useNavigate()
  const tags = Array.isArray(product.tags) ? product.tags : []
  const discount = product.original_price > product.price
    ? discountPct(product.original_price, product.price) : 0

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 p-4 group hover:border-blue-100"
    >
      <div className={`w-28 h-28 flex-shrink-0 bg-gradient-to-br ${product.gradient} rounded-xl flex items-center justify-center`}>
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">👟</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.accent}`}>{product.brand}</span>
          <span className="text-xs text-gray-400 self-center">{product.category_label}</span>
          {tags.includes('sale') && discount > 0 && (
            <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">-{discount}% OFF</span>
          )}
        </div>
        <h4 className="font-bold text-gray-800 mb-0.5 truncate">{product.name}</h4>
        <p className="text-xs text-gray-400 mb-2 line-clamp-1">{product.description}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={`text-xs ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
            <span className="text-xs text-gray-500 ml-0.5">
              {Number(product.rating).toFixed(1)} ({product.reviews?.toLocaleString()})
            </span>
          </div>
          <span className="text-xs text-gray-400">• {product.sold?.toLocaleString()} đã bán</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right flex flex-col justify-between">
        <div>
          <div className="text-base font-extrabold text-gray-900">{fmt(product.price)}</div>
          {product.original_price > product.price && (
            <div className="text-xs text-gray-400 line-through">{fmt(product.original_price)}</div>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); toast.success(`🛒 Đã thêm "${product.name}" vào giỏ!`) }}
          className="mt-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition"
        >
          Thêm giỏ
        </button>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const CategoryPage = () => {
  const { categoryId = 'all' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const reduxDispatch = useDispatch()
  const { userInfo } = useSelector(s => s.user)

  const [listState, dispatch] = useReducer(listReducer, initListState)
  const { products, page, hasMore, loading, initialLoading, total } = listState

  const [categories, setCategories] = useState([])
  const [sort, setSort] = useState(searchParams.get('sort') || 'default')
  const [viewMode, setViewMode] = useState('grid')

  const sentinelRef = useRef(null)
  const inFlightRef = useRef(false)

  const activeMeta = CATEGORY_META[categoryId] || CATEGORY_META['all']

  // ── Load danh mục ──────────────────────────────────────────────────────────
  useEffect(() => {
    productAPI.getCategoriesAPI()
      .then(res => { if (res.success) setCategories(res.data) })
      .catch(() => {})
  }, [])

  // ── Fetch một trang (dùng async để dispatch không gọi setState trực tiếp) ──
  const fetchPage = useCallback(async (pageNum, append) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    dispatch({ type: 'FETCH_START' })
    try {
      const res = await productAPI.getProductsAPI({
        page: pageNum,
        limit: PAGE_SIZE,
        category: categoryId,
        sort
      })
      if (res.success) {
        dispatch({
          type: 'FETCH_SUCCESS',
          append,
          payload: {
            data: res.data,
            total: res.pagination.total,
            hasMore: res.pagination.hasMore,
            nextPage: pageNum + 1
          }
        })
      }
    } catch (err) {
      toast.error('Không thể tải sản phẩm: ' + err.message)
      dispatch({ type: 'FETCH_ERROR' })
    } finally {
      inFlightRef.current = false
    }
  }, [categoryId, sort])

  // ── Reset + tải trang 1 khi đổi category / sort ───────────────────────────
  useEffect(() => {
    dispatch({ type: 'RESET' })
    fetchPage(1, false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, sort])

  // ── IntersectionObserver — tự load thêm khi kéo đến sentinel ─────────────
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !inFlightRef.current && !initialLoading) {
          fetchPage(page, true)
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, page, fetchPage, initialLoading])

  const handleSortChange = e => {
    const val = e.target.value
    setSort(val)
    setSearchParams(val !== 'default' ? { sort: val } : {})
  }

  const handleLogout = () => {
    reduxDispatch(clearUser())
    toast.info('Đã đăng xuất!')
    navigate('/login')
  }

  // Danh sách tabs: dùng dữ liệu từ API nếu có, fallback dùng CATEGORY_META
  const tabList = categories.length > 0
    ? categories
    : Object.entries(CATEGORY_META).map(([id, meta]) => ({ id, label: meta.label, count: null }))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-black text-xl text-gray-900 flex-shrink-0">
            <span>👟</span> SNKRS<span className="text-blue-600">.</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-1 min-w-0">
            <Link to="/" className="hover:text-blue-600 transition flex-shrink-0">Trang chủ</Link>
            <span className="text-gray-300">›</span>
            <span className="font-semibold text-gray-800 truncate">{activeMeta.label}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/search')}
              className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
              title="Tìm kiếm"
            >
              🔍
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userInfo?.username?.charAt(0)?.toUpperCase()}
                </div>
              </button>
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">🏠 Trang chủ</Link>
                <Link to="/search" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">🔍 Tìm kiếm</Link>
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
        </div>
      </nav>

      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${activeMeta.color} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-2">{activeMeta.label}</h1>
            <p className="text-white/70 text-sm">
              {initialLoading ? 'Đang tải...' : `${total} sản phẩm`}
            </p>
          </div>
          <span className="text-6xl opacity-80">{activeMeta.emoji}</span>
        </div>
      </div>

      {/* ── CATEGORY TABS ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {tabList.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  categoryId === cat.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label}
                {cat.count != null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    categoryId === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-gray-500">
            {initialLoading
              ? 'Đang tải...'
              : (
                <span>
                  Hiển thị <strong className="text-gray-800">{products.length}</strong> /{' '}
                  <strong className="text-gray-800">{total}</strong> sản phẩm
                </span>
              )
            }
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sort}
                onChange={handleSortChange}
                className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white outline-none focus:border-blue-400 transition appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
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

        {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-7xl mb-4">📭</span>
            <h3 className="text-xl font-black text-gray-700 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-400 mb-6">Danh mục này chưa có sản phẩm.</p>
            <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
              🏠 Về trang chủ
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
            {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(p => <ProductListItem key={p.id} product={p} />)}
            {loading && (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* ── SENTINEL — IntersectionObserver attach point ──────────────────── */}
        {!initialLoading && products.length > 0 && (
          <div ref={sentinelRef} className="py-8 flex flex-col items-center gap-3">
            {loading && (
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Đang tải thêm sản phẩm...</span>
              </div>
            )}
            {!hasMore && (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <span className="text-2xl">🎉</span>
                <p className="text-sm font-medium">
                  Bạn đã xem hết <strong className="text-gray-600">{total}</strong> sản phẩm!
                </p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="mt-2 px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-700"
                >
                  ↑ Lên đầu trang
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
