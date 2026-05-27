import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { orderAPI, reviewAPI } from '~/apis/index'
import StatusBadge from '~/components/StatusBadge'

const CANCEL_WINDOW_MS = 30 * 60 * 1000 // 30 phut

const TIMELINE_STEPS = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered']
const TIMELINE_LABELS = {
  pending: { label: 'Don hang moi', icon: '📦' },
  confirmed: { label: 'Da xac nhan', icon: '✅' },
  preparing: { label: 'Dang chuan bi', icon: '🔧' },
  shipping: { label: 'Dang giao', icon: '🚚' },
  delivered: { label: 'Da giao', icon: '🎉' }
}
const PAYMENT_MAP = { cod: 'COD (Thanh toan khi nhan)', momo: 'MoMo', vnpay: 'VNPay' }

// Anh fallback theo ten san pham (dung khi product_image chua duoc luu)
const SHOE_IMAGES = {
  'Nike Air Max 270':            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
  'Adidas Ultra Boost 22':       'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=300&q=80',
  'Puma RS-X Reinvention':       'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=300&q=80',
  'Nike React Infinity Run':     'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&q=80',
  'Adidas Solarboost 5':         'https://images.unsplash.com/photo-1539185441755-769473a23570?w=300&q=80',
  'Asics Gel-Nimbus 25':         'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=300&q=80',
  'New Balance Fresh Foam 1080': 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=300&q=80',
  'Brooks Ghost 15':             'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&q=80',
  'Hoka Clifton 9':              'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&q=80',
  'Jordan Air 1 Retro High':     'https://images.unsplash.com/photo-1556906781-9a412961d28e?w=300&q=80',
  'New Balance 574':             'https://images.unsplash.com/photo-1539185441755-769473a23570?w=300&q=80',
  'Converse Chuck Taylor All Star': 'https://images.unsplash.com/photo-1607522370775-ac82dc94302c?w=300&q=80',
  'Reebok Classic Leather':      'https://images.unsplash.com/photo-1600185364594-a6b8deba2553?w=300&q=80',
  'Nike Air Force 1 Low':        'https://images.unsplash.com/photo-1600185365483-26d0a4ea9834?w=300&q=80',
  'Adidas Stan Smith':           'https://images.unsplash.com/photo-1544441893-675973e31985?w=300&q=80',
  'Puma Suede Classic':          'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=300&q=80',
  'New Balance 990v6':           'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=300&q=80',
  'Converse Run Star Hike':      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&q=80',
  'Nike Dunk Low Retro':         'https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=300&q=80',
  'Vans Old Skool':              'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&q=80',
  'Vans Sk8-Hi':                 'https://images.unsplash.com/photo-1583916648774-4e9c9f98b42c?w=300&q=80',
  'DC Shoes Court Graffik':      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&q=80',
  'Nike SB Dunk Low Pro':        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
  'Emerica Reynolds 3 G6':       'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=300&q=80'
}

const getShoeImage = (item) => item.product_image || SHOE_IMAGES[item.product_name] || null

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const fmtDate = (d) => new Date(d).toLocaleString('vi-VN')

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [eligibility, setEligibility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [countdown, setCountdown] = useState(null) // seconds remaining
  const timerRef = useRef(null)

  // ── State đánh giá ──────────────────────────────────────────────────────
  const [reviewedIds, setReviewedIds]     = useState([])   // product_id đã review
  const [totalPoints, setTotalPoints]     = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewItem, setReviewItem]       = useState(null) // item đang review
  const [reviewRating, setReviewRating]   = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [rewardPopup, setRewardPopup]     = useState(null) // { points, coupon }

  useEffect(() => {
    orderAPI.getOrderByIdAPI(id)
      .then(data => {
        setOrder(data.order)
        setEligibility(data.cancelEligibility)
        setLoading(false)
        // Load review status nếu đơn đã giao
        if (data.order?.status === 'delivered') {
          reviewAPI.getOrderReviewStatusAPI(data.order.id)
            .then(r => {
              setReviewedIds(r.reviewed_product_ids || [])
              setTotalPoints(r.total_points || 0)
            })
            .catch(() => {})
        }
      })
      .catch(() => {
        toast.error('Khong the tai don hang')
        setLoading(false)
      })
  }, [id])

  // Countdown timer
  useEffect(() => {
    if (!order || !eligibility?.canCancel) return
    const createdAt = new Date(order.created_at).getTime()
    const deadline = createdAt + CANCEL_WINDOW_MS
    const tick = () => {
      const remaining = Math.floor((deadline - Date.now()) / 1000)
      if (remaining <= 0) {
        setCountdown(0)
        setEligibility(prev => ({ ...prev, canCancel: false, reason: 'Da qua 30 phut khong the huy' }))
        clearInterval(timerRef.current)
      } else {
        setCountdown(remaining)
      }
    }
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, eligibility?.canCancel])

  const handleCancel = () => {
    setCancelling(true)
    orderAPI.cancelOrderAPI(id, reason)
      .then(data => {
        toast.success(data.message || 'Da huy don hang')
        setShowModal(false)
        setOrder(prev => ({ ...prev, status: data.status }))
        setEligibility({ canCancel: false, isRequestOnly: false, reason: '' })
      })
      .catch(err => toast.error(err?.response?.data?.message || 'Co loi xay ra'))
      .finally(() => setCancelling(false))
  }

  const openReviewModal = (item) => {
    setReviewItem(item)
    setReviewRating(5)
    setReviewComment('')
    setShowReviewModal(true)
  }

  const handleSubmitReview = async () => {
    if (!reviewItem) return
    setSubmittingReview(true)
    try {
      const res = await reviewAPI.submitReviewAPI({
        order_id:   order.id,
        product_id: reviewItem.product_id,
        rating:     reviewRating,
        comment:    reviewComment
      })
      setReviewedIds(prev => [...prev, reviewItem.product_id])
      setTotalPoints(res.total_points)
      setShowReviewModal(false)
      setRewardPopup({ points: res.points_earned, coupon: res.coupon })
      setTimeout(() => setRewardPopup(null), 6000)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi khi gửi đánh giá')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bold text-lg">Dang tai...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-2xl font-black text-gray-900">Khong tim thay don hang</p>
        <Link to="/orders" className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold">Quay lai</Link>
      </div>
    )
  }

  const currentStep = TIMELINE_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'cancel_requested'

  const getShippingText = () => {
    try {
      const addr = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address
      return `${addr.name} | ${addr.phone} | ${addr.address}`
    } catch {
      return String(order.shipping_address || '')
    }
  }
  const shippingText = getShippingText()

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* MODAL HUY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-black text-center text-gray-900">
              {eligibility?.isRequestOnly ? 'Gui yeu cau huy don' : 'Huy don hang'}
            </h2>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ly do huy (tuy chon)..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >Quay lai</button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className={`flex-1 py-3 rounded-2xl text-white font-black disabled:opacity-50 ${eligibility?.isRequestOnly ? 'bg-orange-500' : 'bg-red-500'}`}
              >{cancelling ? 'Dang xu ly...' : eligibility?.isRequestOnly ? 'Gui yeu cau' : 'Huy don'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐÁNH GIÁ */}
      {showReviewModal && reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-black text-center text-gray-900">⭐ Đánh giá sản phẩm</h2>
            <p className="text-center text-sm text-gray-500 font-semibold">{reviewItem.product_name}</p>

            {/* Chọn số sao */}
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    star <= reviewRating ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                >★</button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400">
              {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'][reviewRating]}
            </p>

            {/* Nhận xét */}
            <textarea
              rows={3}
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Nhận xét của bạn về sản phẩm (tùy chọn)..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />

            <p className="text-xs text-center text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">
              🎁 Đánh giá ngay để nhận +50 điểm tích lũy!
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              >Hủy</button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black disabled:opacity-50"
              >{submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
            </div>
          </div>
        </div>
      )}

      {/* REWARD POPUP */}
      {rewardPopup && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-200 rounded-3xl shadow-2xl p-5 max-w-xs">
          <p className="font-black text-gray-900 text-base mb-1">🎉 Cảm ơn bạn đã đánh giá!</p>
          <p className="text-sm text-emerald-600 font-bold">+{rewardPopup.points} điểm tích lũy</p>
          <p className="text-xs text-gray-400 mt-0.5">Tổng điểm: <strong className="text-emerald-600">{totalPoints} điểm</strong> ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPoints * 500)}</p>
          <p className="text-xs text-gray-400 mt-1">Dùng điểm để giảm giá ở trang thanh toán nhé!</p>
          <button onClick={() => setRewardPopup(null)} className="mt-3 text-xs text-gray-400 hover:text-gray-600">Đóng ×</button>
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/orders')} className="text-sm text-gray-500 hover:text-gray-900 font-bold">
            ← Don hang
          </button>
          <span className="font-black text-gray-900">Chi tiet don #{order.id}</span>
          <Link to="/" className="text-sm text-blue-600 font-bold">Trang chu</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* STATUS + NUT HUY */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <StatusBadge status={order.status} />
            <p className="text-xs text-gray-400">Dat luc: {fmtDate(order.created_at)}</p>
          </div>
          {eligibility?.canCancel && (
            <div className="flex items-center gap-3">
              {countdown !== null && countdown > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2.5 rounded-2xl">
                  <span className="text-lg animate-pulse">⏱</span>
                  <p className="text-xs text-orange-400 font-semibold uppercase tracking-wide">Con lai de huy:</p>
                  <p className="text-base font-black text-orange-500 tabular-nums">{String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}</p>
                </div>
              )}
              <button
                onClick={() => setShowModal(true)}
                className={`px-6 py-3 rounded-2xl text-white font-black text-sm ${eligibility.isRequestOnly ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {eligibility.isRequestOnly ? 'Gui yeu cau huy' : 'Huy don hang'}
              </button>
            </div>
          )}
          {!eligibility?.canCancel && eligibility?.reason && (
            <p className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-2xl">{eligibility.reason}</p>
          )}
        </div>

        {/* TIMELINE */}
        {!isCancelled && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-black text-gray-700 mb-6">Trang thai don hang</p>
            <div className="flex justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 z-0" />
              {TIMELINE_STEPS.map((key, idx) => {
                const done = idx <= currentStep
                const active = idx === currentStep
                const s = TIMELINE_LABELS[key]
                return (
                  <div key={key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl ${active ? 'bg-gray-900 border-gray-900 text-white' : done ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}`}>
                      {done && !active ? <span className="text-green-500 text-xl font-black">✓</span> : s.icon}
                    </div>
                    <p className={`text-[10px] font-bold text-center leading-tight w-16 ${active ? 'text-gray-900' : done ? 'text-green-600' : 'text-gray-300'}`}>
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SAN PHAM */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-black text-gray-700">San pham da dat</p>
            {order.status === 'delivered' && totalPoints > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ⭐ {totalPoints} điểm tích lũy
              </span>
            )}
          </div>
          {(order.items || []).map((item, i) => {
            const alreadyReviewed = reviewedIds.includes(item.product_id)
            return (
              <div key={i} className="px-6 py-4 flex items-start gap-4 border-b border-gray-50 last:border-0">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
                  {getShoeImage(item)
                    ? <img
                      src={getShoeImage(item)}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80' }}
                    />
                    : <span className="text-3xl flex items-center justify-center h-full">👟</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-gray-900 truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-400">{item.product_brand}</p>
                  <div className="flex gap-2 mt-0.5">
                    {item.size && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg font-semibold text-gray-500">Size {item.size}</span>}
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                  </div>
                  {/* Nút đánh giá — chỉ hiện khi đơn đã giao */}
                  {order.status === 'delivered' && (
                    alreadyReviewed
                      ? <p className="mt-2 text-xs text-yellow-500 font-bold">⭐ Đã đánh giá</p>
                      : <button
                          onClick={() => openReviewModal(item)}
                          className="mt-2 text-xs font-black text-white bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                        >✍️ Đánh giá & nhận điểm</button>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-sm text-gray-900">{fmt(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-400">{fmt(item.price)}/cap</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* THONG TIN */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3 text-sm">
          <p className="font-black text-gray-700 mb-2">Thong tin don hang</p>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400 flex-shrink-0">Thanh toan</span>
            <span className="font-bold text-gray-700 text-right">{PAYMENT_MAP[order.payment_method] || order.payment_method}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400 flex-shrink-0">Giao hang</span>
            <span className="font-bold text-gray-700 text-right">{shippingText}</span>
          </div>
          {order.note ? (
            <div className="flex justify-between gap-4">
              <span className="text-gray-400 flex-shrink-0">Ghi chu</span>
              <span className="text-gray-500 italic text-right">{order.note}</span>
            </div>
          ) : null}
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-black text-gray-900">Tong cong</span>
            <span className="text-xl font-black text-gray-900">{fmt(order.total_amount)}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <Link to="/" className="flex-1 py-4 text-center border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 text-sm">
            Tiep tuc mua sam
          </Link>
          <Link to="/orders" className="flex-1 py-4 text-center bg-gray-900 text-white rounded-2xl font-black hover:bg-blue-600 text-sm">
            Tat ca don hang
          </Link>
        </div>

      </div>
    </div>
  )
}

export default OrderDetailPage