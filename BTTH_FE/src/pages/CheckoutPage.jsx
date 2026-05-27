import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { cartAPI, orderAPI, reviewAPI } from '~/apis/index'
import { setCartCount } from '~/redux/cartSlice'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = price =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const SHIPPING_THRESHOLD = 500000
const SHIPPING_FEE = 30000

const STATUS_LABELS = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã huỷ', color: 'bg-red-100 text-red-700' }
}

const PAYMENT_METHODS = [
  {
    id: 'cod',
    icon: '🚚',
    name: 'Thanh toán khi nhận hàng',
    shortName: 'COD',
    desc: 'Trả tiền mặt khi shipper giao hàng đến tay bạn',
    badge: 'Miễn phí',
    badgeColor: 'text-green-600 bg-green-50'
  },
  {
    id: 'momo',
    icon: '💜',
    name: 'Ví MoMo',
    shortName: 'MoMo',
    desc: 'Thanh toán qua ví điện tử MoMo — nhanh, tiện, an toàn',
    badge: 'Giảm thêm 5%',
    badgeColor: 'text-pink-600 bg-pink-50'
  },
  {
    id: 'vnpay',
    icon: '🏦',
    name: 'VNPay',
    shortName: 'VNPay',
    desc: 'Thanh toán qua cổng VNPay — thẻ ATM, Visa, Mastercard',
    badge: 'Bảo mật cao',
    badgeColor: 'text-blue-600 bg-blue-50'
  }
]

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
const StepIndicator = ({ step }) => (
  <div className="flex items-center gap-2 justify-center mb-8">
    {['Thông tin giao hàng', 'Thanh toán', 'Xác nhận'].map((label, idx) => {
      const s = idx + 1
      const active = step === s
      const done = step > s
      return (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black
            ${done ? 'bg-green-500 text-white' : active ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
            {done ? '✓' : s}
          </div>
          <span className={`text-sm font-semibold hidden sm:block
            ${active ? 'text-gray-900' : done ? 'text-green-600' : 'text-gray-400'}`}>
            {label}
          </span>
          {idx < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
        </div>
      )
    })}
  </div>
)

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo } = useSelector(s => s.user)

  // Pre-selected items passed from CartPage (optional)
  const preSelectedIds = location.state?.selectedItemIds || null

  const [step, setStep] = useState(1)
  const [cartItems, setCartItems] = useState([])
  const [selectedIds, setSelectedIds] = useState(null)
  const [loadingCart, setLoadingCart] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  // Shipping form
  const [form, setForm] = useState({
    name: userInfo?.username || '',
    phone: '',
    address: '',
    city: '',
    note: ''
  })
  const [errors, setErrors] = useState({})

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Điểm tích lũy
  const [availablePoints, setAvailablePoints] = useState(0)
  const [usePoints, setUsePoints] = useState(false)

  // MoMo QR mock state
  const [showMomoQR, setShowMomoQR] = useState(false)
  const [momoCountdown, setMomoCountdown] = useState(0)
  // VNPay QR mock state
  const [showVnpayQR, setShowVnpayQR] = useState(false)
  const [vnpayCountdown, setVnpayCountdown] = useState(0)

  // ── Fetch cart ─────────────────────────────────────────────────────────
  const fetchCart = useCallback(() => {
    cartAPI.getCartAPI()
      .then(res => {
        const items = res.data?.items || []
        setCartItems(items)
        // Use pre-selected if provided, else use all
        setSelectedIds(preSelectedIds || items.map(i => i.id))
      })
      .catch(() => toast.error('Không thể tải giỏ hàng'))
      .finally(() => setLoadingCart(false))
  }, [preSelectedIds])

  useEffect(() => { fetchCart() }, [fetchCart])

  // Fetch điểm tích lũy
  useEffect(() => {
    if (userInfo) {
      reviewAPI.getMyPointsAPI()
        .then(r => setAvailablePoints(r.total_points || 0))
        .catch(() => {})
    }
  }, [userInfo])

  // MoMo countdown
  useEffect(() => {
    if (momoCountdown <= 0) return
    const t = setTimeout(() => setMomoCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [momoCountdown])

  // VNPay countdown
  useEffect(() => {
    if (vnpayCountdown <= 0) return
    const t = setTimeout(() => setVnpayCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [vnpayCountdown])

  // ── Selected items ─────────────────────────────────────────────────────
  const selectedItems = selectedIds
    ? cartItems.filter(i => selectedIds.includes(i.id))
    : cartItems

  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = paymentMethod === 'momo' ? Math.round(subtotal * 0.05) : 0
  const shipping = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? SHIPPING_FEE : 0
  // Mỗi điểm = 500đ, chỉ giảm tối đa 50% giá trị đơn
  const POINT_VALUE = 500
  const maxPointDiscount = Math.floor(subtotal * 0.5)
  const pointsDiscount = usePoints ? Math.min(availablePoints * POINT_VALUE, maxPointDiscount) : 0
  const pointsUsed = usePoints ? Math.ceil(pointsDiscount / POINT_VALUE) : 0
  const total = subtotal - discount - pointsDiscount + shipping
  const totalQty = selectedItems.reduce((s, i) => s + i.quantity, 0)

  // ── Form validation ────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^(0|\+84)[0-9]{9}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ'
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ'
    if (!form.city.trim()) e.city = 'Vui lòng chọn thành phố'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFormChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // ── Step navigation ────────────────────────────────────────────────────
  const goToStep2 = () => {
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Place order ────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    // MoMo: show QR first
    if (paymentMethod === 'momo' && !showMomoQR) {
      setShowMomoQR(true)
      setMomoCountdown(300)
      return
    }
    // VNPay: show QR first
    if (paymentMethod === 'vnpay' && !showVnpayQR) {
      setShowVnpayQR(true)
      setVnpayCountdown(300)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        payment_method: paymentMethod,
        shipping_address: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim()
        },
        note: form.note.trim(),
        ...(selectedIds ? { selected_item_ids: selectedIds } : {})
      }

      const data = await orderAPI.createOrderAPI(payload)
      dispatch(setCartCount(data.cartCount || 0))
      // Trừ điểm nếu user chọn dùng điểm
      if (usePoints && pointsUsed > 0) {
        reviewAPI.usePointsAPI({ points_used: pointsUsed, order_id: data.order?.id }).catch(() => {})
        setAvailablePoints(prev => prev - pointsUsed)
      }
      setPlacedOrder(data.order)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast.success('🎉 Đặt hàng thành công!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đặt hàng thất bại, thử lại sau')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-5xl">⏳</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">👟</span>
            <span className="text-xl font-black tracking-tight text-gray-900">
              SNKRS<span className="text-blue-600">.</span>
            </span>
          </Link>
          <h1 className="text-lg font-black text-gray-900">🧾 Thanh toán</h1>
          <button
            onClick={() => navigate('/cart')}
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            ← Giỏ hàng
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <StepIndicator step={step} />

        {/* ═══ STEP 3: ORDER SUCCESS ═══════════════════════════════════ */}
        {step === 3 && placedOrder && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-5xl animate-bounce">
              🎉
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h2>
              <p className="text-gray-500">Cảm ơn bạn đã mua sắm tại SNKRS</p>
            </div>

            {/* Order info card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-lg p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mã đơn hàng</span>
                <span className="font-black text-gray-900">#{placedOrder.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Trạng thái</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_LABELS[placedOrder.status]?.color}`}>
                  {STATUS_LABELS[placedOrder.status]?.label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phương thức</span>
                <span className="font-semibold text-gray-900 uppercase">{placedOrder.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng tiền</span>
                <span className="font-black text-blue-600 text-base">{fmt(placedOrder.total_amount)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">Giao đến: </span>
                {(() => {
                  try {
                    const addr = typeof placedOrder.shipping_address === 'string'
                      ? JSON.parse(placedOrder.shipping_address)
                      : placedOrder.shipping_address
                    return `${addr.name} · ${addr.phone} · ${addr.address}, ${addr.city}`
                  } catch { return '' }
                })()}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition shadow"
              >
                🛍️ Tiếp tục mua sắm
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-gray-900 transition"
              >
                📦 Xem đơn hàng
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 1 + 2 LAYOUT ═══════════════════════════════════════ */}
        {step < 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: FORM ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* STEP 1: Shipping form */}
              {step === 1 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    📍 Thông tin giao hàng
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Họ và tên *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => handleFormChange('name', e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={`w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition
                          ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Số điện thoại *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => handleFormChange('phone', e.target.value)}
                        placeholder="0901234567"
                        className={`w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition
                          ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'}`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Địa chỉ *</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={e => handleFormChange('address', e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                        className={`w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition
                          ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'}`}
                      />
                      {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Tỉnh / Thành phố *</label>
                      <select
                        value={form.city}
                        onChange={e => handleFormChange('city', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition bg-white
                          ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'}`}
                      >
                        <option value="">-- Chọn thành phố --</option>
                        {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
                          'Biên Hòa', 'Nha Trang', 'Huế', 'Đà Lạt', 'Vũng Tàu',
                          'Quy Nhơn', 'Buôn Ma Thuột', 'Thái Nguyên', 'Nam Định', 'Vinh'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                    </div>

                    {/* Note */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Ghi chú (tuỳ chọn)</label>
                      <input
                        type="text"
                        value={form.note}
                        onChange={e => handleFormChange('note', e.target.value)}
                        placeholder="Giao giờ hành chính, gọi trước..."
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-gray-900 text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    onClick={goToStep2}
                    className="w-full py-4 bg-gray-900 hover:bg-blue-600 text-white font-black rounded-2xl transition shadow-lg text-base"
                  >
                    Tiếp theo → Chọn thanh toán
                  </button>
                </div>
              )}

              {/* STEP 2: Payment method */}
              {step === 2 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setStep(1); setShowMomoQR(false); setShowVnpayQR(false) }}
                      className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
                    >
                      ←
                    </button>
                    <h2 className="text-xl font-black text-gray-900">💳 Phương thức thanh toán</h2>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map(method => (
                      <button
                        key={method.id}
                        onClick={() => { setPaymentMethod(method.id); setShowMomoQR(false); setShowVnpayQR(false) }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${paymentMethod === method.id ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <span className="text-3xl flex-shrink-0">{method.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-gray-900">{method.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${method.badgeColor}`}>
                              {method.badge}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">{method.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                          ${paymentMethod === method.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                          {paymentMethod === method.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* MoMo QR — Chuyển khoản Agribank */}
                  {paymentMethod === 'momo' && showMomoQR && (
                    <div className="bg-pink-50 border-2 border-pink-200 rounded-3xl p-6 flex flex-col items-center gap-4">
                      <p className="font-black text-pink-700 text-lg">💜 Quét QR chuyển khoản MoMo</p>
                      <div className="bg-white rounded-2xl p-3 shadow border border-pink-100">
                        <img
                          src={`https://img.vietqr.io/image/970405-6501205236130-compact2.png?amount=${total}&addInfo=SNKRS+Thanh+toan+don+hang&accountName=PHAM%20NGOC%20HUU`}
                          alt="Agribank QR"
                          className="w-56 h-56 object-contain"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm text-gray-500">Ngân hàng: <strong>Agribank</strong></p>
                        <p className="text-sm text-gray-500">STK: <strong className="text-gray-900 tracking-widest">6501205236130</strong></p>
                        <p className="text-sm text-gray-500">Chủ TK: <strong className="text-gray-900">PHAM NGOC HUU</strong></p>
                        <p className="font-black text-pink-600 text-xl mt-1">{fmt(total)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Hết hạn sau</p>
                        <p className="text-3xl font-black text-pink-600 tabular-nums">
                          {String(Math.floor(momoCountdown / 60)).padStart(2, '0')}:
                          {String(momoCountdown % 60).padStart(2, '0')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        Mở app MoMo hoặc ngân hàng → Quét mã → Xác nhận đúng số tiền → Nhấn &quot;Xác nhận đặt hàng&quot; để hoàn tất.
                      </p>
                    </div>
                  )}

                  {/* VNPay QR — Chuyển khoản Agribank */}
                  {paymentMethod === 'vnpay' && showVnpayQR && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 flex flex-col items-center gap-4">
                      <p className="font-black text-blue-700 text-lg">🏦 Quét QR chuyển khoản VNPay</p>
                      <div className="bg-white rounded-2xl p-3 shadow border border-blue-100">
                        <img
                          src={`https://img.vietqr.io/image/970405-6501205236130-compact2.png?amount=${total}&addInfo=SNKRS+Thanh+toan+don+hang&accountName=PHAM%20NGOC%20HUU`}
                          alt="Agribank QR"
                          className="w-56 h-56 object-contain"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm text-gray-500">Ngân hàng: <strong>Agribank</strong></p>
                        <p className="text-sm text-gray-500">STK: <strong className="text-gray-900 tracking-widest">6501205236130</strong></p>
                        <p className="text-sm text-gray-500">Chủ TK: <strong className="text-gray-900">PHAM NGOC HUU</strong></p>
                        <p className="font-black text-blue-600 text-xl mt-1">{fmt(total)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Hết hạn sau</p>
                        <p className="text-3xl font-black text-blue-600 tabular-nums">
                          {String(Math.floor(vnpayCountdown / 60)).padStart(2, '0')}:
                          {String(vnpayCountdown % 60).padStart(2, '0')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        Mở app ngân hàng → Quét mã → Xác nhận đúng số tiền → Nhấn &quot;Xác nhận đặt hàng&quot; để hoàn tất.
                      </p>
                    </div>
                  )}

                  {/* VNPay info — before showing QR */}
                  {paymentMethod === 'vnpay' && !showVnpayQR && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 flex items-center gap-4">
                      <span className="text-4xl">🏦</span>
                      <div>
                        <p className="font-black text-blue-800">Thanh toán qua VNPay</p>
                        <p className="text-sm text-blue-600">
                          Nhấn &quot;Mở QR VNPay&quot; để hiển thị mã QR thanh toán qua app ngân hàng.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className={`w-full py-4 font-black rounded-2xl transition shadow-lg text-base text-white ${submitting ? 'bg-gray-400 cursor-not-allowed' : paymentMethod === 'momo' && !showMomoQR ? 'bg-pink-500 hover:bg-pink-600' : paymentMethod === 'vnpay' && !showVnpayQR ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-blue-600'}`}
                  >
                    {submitting
                      ? '⏳ Đang xử lý...'
                      : paymentMethod === 'momo' && !showMomoQR
                        ? '💜 Mở QR MoMo'
                        : paymentMethod === 'vnpay' && !showVnpayQR
                          ? '🏦 Mở QR VNPay'
                          : `🎉 Xác nhận đặt hàng · ${fmt(total)}`
                    }
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: ORDER SUMMARY ────────────────────────────────── */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="font-black text-gray-900 text-lg">
                  🛍️ Đơn hàng ({totalQty} sản phẩm)
                </h3>

                {/* Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image_url || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={e => { e.target.src = '/placeholder.png' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.brand}{item.size ? ` · Size ${item.size}` : ''} · x{item.quantity}
                        </p>
                        <p className="text-sm font-black text-gray-900">{fmt(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-100" />

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-pink-600 font-semibold">
                      <span>🎁 Ưu đãi MoMo (-5%)</span>
                      <span>-{fmt(discount)}</span>
                    </div>
                  )}

                  {/* Toggle dùng điểm */}
                  {availablePoints > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-emerald-700">⭐ Điểm tích lũy</p>
                          <p className="text-xs text-emerald-500">{availablePoints} điểm ≈ {fmt(availablePoints * POINT_VALUE)}</p>
                        </div>
                        {/* Toggle Switch */}
                        <button
                          onClick={() => setUsePoints(p => !p)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            usePoints ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            usePoints ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      {usePoints && (
                        <div className="flex justify-between text-emerald-700 font-semibold text-sm border-t border-emerald-200 pt-2">
                          <span>Giảm từ điểm ({pointsUsed} điểm)</span>
                          <span>-{fmt(pointsDiscount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Vận chuyển</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? '🆓 Miễn phí' : fmt(shipping)}
                    </span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between text-lg font-black text-gray-900 pt-1">
                    <span>Tổng cộng</span>
                    <span className="text-blue-600">{fmt(total)}</span>
                  </div>
                </div>

                {/* Free ship progress */}
                {shipping > 0 && (
                  <div className="bg-blue-50 rounded-2xl p-3 space-y-1.5">
                    <p className="text-xs text-blue-700 font-semibold">
                      Mua thêm {fmt(SHIPPING_THRESHOLD - subtotal)} để được miễn phí vận chuyển 🚀
                    </p>
                    <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery info */}
              {step === 2 && form.name && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-2">
                  <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                    📍 Giao đến
                  </h3>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p className="font-semibold text-gray-900">{form.name} · {form.phone}</p>
                    <p>{form.address}</p>
                    <p>{form.city}</p>
                    {form.note && <p className="text-gray-400 italic">📝 {form.note}</p>}
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage
