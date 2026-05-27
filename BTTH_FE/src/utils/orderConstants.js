export const STATUS_CONFIG = {
  pending: { label: 'Đơn hàng mới', icon: '📦', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  confirmed: { label: 'Đã xác nhận', icon: '✅', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
  preparing: { label: 'Đang chuẩn bị hàng', icon: '🔧', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-400' },
  shipping: { label: 'Đang giao hàng', icon: '🚚', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  delivered: { label: 'Đã giao thành công', icon: '🎉', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400' },
  cancelled: { label: 'Đã hủy', icon: '❌', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
  cancel_requested: { label: 'Yêu cầu hủy', icon: '⚠️', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' }
}

export const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Đơn mới' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'preparing', label: 'Chuẩn bị' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'cancel_requested', label: 'Yêu cầu hủy' }
]

export const PAYMENT_LABELS = { cod: 'COD', momo: 'MoMo', vnpay: 'VNPay' }

export const fmt = price =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

export const fmtDate = d =>
  new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
