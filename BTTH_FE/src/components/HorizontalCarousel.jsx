import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductImage } from '~/utils/shoeImages'
import { toast } from 'react-toastify'

const fmt = price =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const discountPct = (orig, sale) => Math.round(((orig - sale) / orig) * 100)

const rankBadgeClass = rank => {
  if (rank === 1) return 'bg-yellow-400 text-white'
  if (rank === 2) return 'bg-gray-300 text-gray-700'
  if (rank === 3) return 'bg-amber-600 text-white'
  return 'bg-white/80 text-gray-600'
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse flex-shrink-0 w-[220px]">
    <div className="h-44 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex justify-between pt-1">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-7 w-7 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
)

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const CarouselCard = ({ product, rank }) => {
  const navigate = useNavigate()
  const tags = Array.isArray(product.tags) ? product.tags : []
  const originalPrice = product.original_price ?? product.originalPrice
  const discount = originalPrice > product.price ? discountPct(originalPrice, product.price) : 0
  const gradient = product.gradient || 'from-gray-100 to-gray-200'
  const accent = product.accent || 'bg-gray-100 text-gray-700'

  const handleAdd = e => {
    e.stopPropagation()
    toast.success(`🛒 Đã thêm "${product.name}"!`)
  }

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden flex-shrink-0 w-[220px] flex flex-col cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }}
        />
        {rank != null && (
          <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${rankBadgeClass(rank)}`}>
            {rank}
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
            -{discount}%
          </span>
        )}
        {tags.includes('bestseller') && rank == null && (
          <span className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
            🔥
          </span>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <button
            onClick={handleAdd}
            className="px-4 py-1.5 bg-white text-gray-800 font-bold rounded-full text-xs hover:bg-gray-100 transition shadow"
          >
            🛒 Thêm giỏ
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full self-start mb-1 ${accent}`}>
          {product.brand}
        </span>
        <h4 className="font-bold text-gray-800 text-xs leading-snug line-clamp-2 flex-1 mb-1">
          {product.name}
        </h4>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={`text-xs ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400">({(product.reviews || 0).toLocaleString()})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-sm font-extrabold text-gray-900">{fmt(product.price)}</div>
            {originalPrice > product.price && (
              <div className="text-xs text-gray-400 line-through leading-none">{fmt(originalPrice)}</div>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="w-7 h-7 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition text-sm font-bold flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── HORIZONTAL CAROUSEL ─────────────────────────────────────────────────────
/**
 * Props:
 *  - title      : string
 *  - subtitle   : string
 *  - icon       : string (emoji)
 *  - products   : array
 *  - loading    : boolean
 *  - showRank   : boolean — hiện số thứ tự #1 #2 ...
 *  - accentColor: string tailwind bg class cho dot active  (mặc định 'bg-gray-900')
 *  - viewAllTo  : string — route href nút "Xem tất cả"
 */
const HorizontalCarousel = ({
  title,
  subtitle,
  icon,
  products = [],
  loading = false,
  showRank = false,
  accentColor = 'bg-gray-900',
  viewAllTo
}) => {
  const trackRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [cardsPerPage, setCardsPerPage] = useState(4)
  const CARD_WIDTH = 220
  const GAP = 20

  // Tính số card vừa hiển thị theo chiều rộng container
  const recalcCards = useCallback(() => {
    if (!trackRef.current) return
    const containerW = trackRef.current.parentElement?.clientWidth || 900
    const count = Math.max(1, Math.floor((containerW + GAP) / (CARD_WIDTH + GAP)))
    setCardsPerPage(count)
    setCurrentPage(0)
  }, [])

  useEffect(() => {
    recalcCards()
    const ro = new ResizeObserver(recalcCards)
    if (trackRef.current?.parentElement) ro.observe(trackRef.current.parentElement)
    return () => ro.disconnect()
  }, [recalcCards])

  const totalItems = loading ? 8 : products.length
  const totalPages = Math.max(1, Math.ceil(totalItems / cardsPerPage))

  const goTo = page => {
    const clamped = Math.max(0, Math.min(page, totalPages - 1))
    setCurrentPage(clamped)
    if (trackRef.current) {
      const offset = clamped * cardsPerPage * (CARD_WIDTH + GAP)
      trackRef.current.style.transform = `translateX(-${offset}px)`
    }
  }

  const prev = () => goTo(currentPage - 1)
  const next = () => goTo(currentPage + 1)

  // Swipe support
  const touchStartX = useRef(null)
  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = e => {
    if (touchStartX.current == null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  const displayItems = loading
    ? Array.from({ length: 8 }).map((_, i) => ({ _skeleton: true, id: `sk-${i}` }))
    : products

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>{icon}</span> {title}
          </h2>
          {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Arrow buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={prev}
              disabled={currentPage === 0}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >‹</button>
            <button
              onClick={next}
              disabled={currentPage >= totalPages - 1}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >›</button>
          </div>
          {viewAllTo && (
            <a href={viewAllTo} className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap">
              Xem tất cả →
            </a>
          )}
        </div>
      </div>

      {/* Carousel track */}
      <div
        className="overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ gap: `${GAP}px` }}
        >
          {displayItems.map((p, idx) =>
            p._skeleton
              ? <SkeletonCard key={p.id} />
              : <CarouselCard key={p.id} product={p} rank={showRank ? idx + 1 : null} />
          )}
        </div>
      </div>

      {/* Dot pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentPage
                  ? `w-6 h-2.5 ${accentColor}`
                  : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!loading && products.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${accentColor} rounded-full transition-all duration-500`}
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {currentPage + 1} / {totalPages}
          </span>
        </div>
      )}
    </section>
  )
}

export default HorizontalCarousel
