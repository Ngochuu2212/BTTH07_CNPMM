import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { cartAPI } from '~/apis/index'
import { setCartCount } from '~/redux/cartSlice'
import { getProductImage } from '~/utils/shoeImages'

const fmt = price =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const SHIPPING_THRESHOLD = 500000
const SHIPPING_FEE = 30000

const ConfirmModal = ({ open, message, subMessage, confirmText = 'Xoá', onConfirm, onCancel }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-4 animate-[fadeInUp_0.2s_ease]">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
          🗑️
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-gray-900">Xác nhận xoá</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          {subMessage && (
            <p className="text-red-400 text-xs font-medium">{subMessage}</p>
          )}
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-lg shadow-red-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SKELETON ROW ────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex gap-4 p-4 animate-pulse">
    <div className="w-24 h-24 rounded-2xl bg-gray-200 flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
    <div className="w-24 space-y-2 py-1">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-8 bg-gray-100 rounded-xl" />
    </div>
  </div>
)

// ─── CART ITEM ROW ────────────────────────────────────────────────────────────
const CartItemRow = ({ item, onUpdateQty, onRemove, updating }) => {
  const navigate = useNavigate()
  const originalPrice = item.original_price ?? 0
  const discount = originalPrice > item.price
    ? Math.round(((originalPrice - item.price) / originalPrice) * 100)
    : 0
  const gradient = item.gradient || 'from-gray-100 to-gray-200'
  const accent = item.accent || 'bg-gray-100 text-gray-700'
  const isUpdating = updating === item.id

  return (
    <div className={`flex gap-4 p-4 transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
      {/* Ảnh */}
      <div
        className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform bg-gray-100"
        onClick={() => navigate(`/product/${item.product_id}`)}
      >
        <img
          src={getProductImage(item)}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate(`/product/${item.product_id}`)}
        >
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent}`}>
            {item.brand}
          </span>
          {item.size && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Size: {item.size}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-extrabold text-gray-900">{fmt(item.price)}</span>
          {originalPrice > item.price && (
            <span className="text-xs text-gray-400 line-through">{fmt(originalPrice)}</span>
          )}
        </div>
      </div>

      {/* Qty + Remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* Quantity control */}
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg transition"
          >
            −
          </button>
          <span className="w-10 text-center font-bold text-gray-800 text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            disabled={isUpdating}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg transition"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <span className="text-sm font-bold text-blue-600">
          {fmt(item.price * item.quantity)}
        </span>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id, item.name)}
          disabled={isUpdating}
          className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1 disabled:opacity-30"
        >
          🗑 Xoá
        </button>
      </div>
    </div>
  )
}

// ─── EMPTY CART ───────────────────────────────────────────────────────────────
const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-5">
    <span className="text-8xl">🛒</span>
    <h2 className="text-2xl font-black text-gray-700">Giỏ hàng trống</h2>
    <p className="text-gray-400 text-center max-w-xs">
      Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm sản phẩm yêu thích!
    </p>
    <Link
      to="/"
      className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition shadow-lg"
    >
      🛍️ Tiếp tục mua sắm
    </Link>
  </div>
)

// ─── MAIN CART PAGE ───────────────────────────────────────────────────────────
const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userInfo } = useSelector(s => s.user)
  const cartCount = useSelector(s => s.cart.count)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // itemId đang xử lý
  const [clearing, setClearing] = useState(false)
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', subMessage: '', onConfirm: null })

  const openConfirm = (message, subMessage, onConfirm) =>
    setConfirmModal({ open: true, message, subMessage, onConfirm })
  const closeConfirm = () =>
    setConfirmModal({ open: false, message: '', subMessage: '', onConfirm: null })

  // ── Fetch giỏ hàng ──────────────────────────────────────────────────────
  const fetchCart = useCallback(() => {
    cartAPI.getCartAPI()
      .then(res => {
        const cartItems = res.data?.items || []
        setItems(cartItems)
        dispatch(setCartCount(res.data?.totalCount || 0))
        setCheckedItems(new Set(cartItems.map(i => i.id)))
      })
      .catch(() => { toast.error('Không thể tải giỏ hàng') })
      .finally(() => { setLoading(false) })
  }, [dispatch])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // ── Cập nhật số lượng ───────────────────────────────────────────────────
  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return
    setUpdating(itemId)
    try {
      const res = await cartAPI.updateCartItemAPI(itemId, newQty)
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i))
      dispatch(setCartCount(res.data?.totalCount || 0))
    } catch {
      toast.error('Không thể cập nhật số lượng')
    } finally {
      setUpdating(null)
    }
  }

  // ── Xoá 1 item ──────────────────────────────────────────────────────────
  const handleRemove = async (itemId, name) => {
    setUpdating(itemId)
    try {
      const res = await cartAPI.removeCartItemAPI(itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
      setCheckedItems(prev => { const s = new Set(prev); s.delete(itemId); return s })
      dispatch(setCartCount(res.data?.totalCount || 0))
      toast.success(`Đã xoá "${name}" khỏi giỏ hàng`)
    } catch {
      toast.error('Không thể xoá sản phẩm')
    } finally {
      setUpdating(null)
    }
  }

  // ── Xoá toàn bộ ─────────────────────────────────────────────────────────
  const handleClearCart = () => {
    openConfirm(
      'Bạn có chắc muốn xoá toàn bộ giỏ hàng?',
      'Hành động này không thể hoàn tác.',
      async () => {
        closeConfirm()
        setClearing(true)
    try {
      await cartAPI.clearCartAPI()
      setItems([])
      setCheckedItems(new Set())
      dispatch(setCartCount(0))
      toast.success('Đã xoá toàn bộ giỏ hàng')
    } catch {
      toast.error('Không thể xoá giỏ hàng')
    } finally {
      setClearing(false)
    }
      }
    )
  }

  // ── Toggle check item ────────────────────────────────────────────────────
  const toggleCheck = (id) => {
    setCheckedItems(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const toggleAll = () => {
    if (checkedItems.size === items.length) {
      setCheckedItems(new Set())
    } else {
      setCheckedItems(new Set(items.map(i => i.id)))
    }
  }

  // ── Tính toán đơn hàng ───────────────────────────────────────────────────
  const selectedItems = items.filter(i => checkedItems.has(i.id))
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const originalSubtotal = selectedItems.reduce((s, i) => s + (i.original_price || i.price) * i.quantity, 0)
  const savings = originalSubtotal - subtotal
  const shipping = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? SHIPPING_FEE : 0
  const total = subtotal + shipping
  const totalQty = selectedItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── CONFIRM MODAL ──────────────────────────────────────────────── */}
      <ConfirmModal
        open={confirmModal.open}
        message={confirmModal.message}
        subMessage={confirmModal.subMessage}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
            >
              ← Quay lại
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">👟</span>
              <span className="text-xl font-black tracking-tight text-gray-900">
                SNKRS<span className="text-blue-600">.</span>
              </span>
            </Link>
          </div>

          <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
            🛒 Giỏ hàng
            {cartCount > 0 && (
              <span className="text-sm bg-gray-900 text-white px-2.5 py-0.5 rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </h1>

          <div className="w-32 flex justify-end">
            <span className="text-sm text-gray-500 hidden sm:block">
              👋 {userInfo?.username}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-64 animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── DANH SÁCH SẢN PHẨM ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkedItems.size === items.length && items.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-gray-900 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Chọn tất cả ({items.length} sản phẩm)
                  </span>
                </label>
                <button
                  onClick={handleClearCart}
                  disabled={clearing}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 disabled:opacity-40 transition"
                >
                  {clearing ? '⏳' : '🗑'} Xoá tất cả
                </button>
              </div>

              {/* Items */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {items.map(item => (
                  <div key={item.id} className="flex items-start">
                    {/* Checkbox */}
                    <div className="pl-4 pt-5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={checkedItems.has(item.id)}
                        onChange={() => toggleCheck(item.id)}
                        className="w-4 h-4 accent-gray-900 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <CartItemRow
                        item={item}
                        onUpdateQty={handleUpdateQty}
                        onRemove={handleRemove}
                        updating={updating}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue shopping */}
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>

            {/* ── ORDER SUMMARY ───────────────────────────────────── */}
            <div className="space-y-4">
              {/* Free shipping progress */}
              {subtotal < SHIPPING_THRESHOLD && subtotal > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-blue-700 mb-2">
                    🚀 Mua thêm <strong>{fmt(SHIPPING_THRESHOLD - subtotal)}</strong> để được miễn phí vận chuyển!
                  </p>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {subtotal >= SHIPPING_THRESHOLD && subtotal > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm font-semibold text-green-700">
                  ✅ Bạn được <strong>miễn phí vận chuyển</strong>!
                </div>
              )}

              {/* Summary box */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4 sticky top-20">
                <h2 className="text-lg font-black text-gray-900">Tóm tắt đơn hàng</h2>

                {selectedItems.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Chưa có sản phẩm nào được chọn
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tạm tính ({totalQty} sản phẩm)</span>
                        <span className="font-semibold">{fmt(originalSubtotal)}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between text-sm text-red-500">
                          <span>Tiết kiệm</span>
                          <span className="font-semibold">-{fmt(savings)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                          {shipping === 0 ? 'Miễn phí' : fmt(shipping)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="font-black text-gray-900 text-lg">Tổng cộng</span>
                        <span className="font-black text-2xl text-gray-900">{fmt(total)}</span>
                      </div>
                      {savings > 0 && (
                        <p className="text-xs text-green-600 mt-1 text-right">
                          🎉 Bạn tiết kiệm được {fmt(savings)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          toast.warning('Vui lòng chọn ít nhất 1 sản phẩm')
                          return
                        }
                        navigate('/checkout', { state: { selectedItemIds: [...checkedItems] } })
                      }}
                      className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition active:scale-95 shadow-lg text-base"
                    >
                      Thanh toán ({totalQty})
                    </button>

                    {/* Voucher input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                      />
                      <button
                        onClick={() => toast.info('Chức năng đang phát triển!')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </>
                )}

                {/* Guarantees */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {[
                    ['🔒', 'Thanh toán bảo mật 100%'],
                    ['🔄', 'Đổi trả miễn phí 30 ngày'],
                    ['🛡️', 'Hàng chính hãng đảm bảo']
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{icon}</span><span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage
