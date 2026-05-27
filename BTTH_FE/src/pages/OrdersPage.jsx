import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { orderAPI } from '~/apis/index'
import { STATUS_TABS, PAYMENT_LABELS, fmt, fmtDate } from '~/utils/orderConstants'
import StatusBadge from '~/components/StatusBadge'

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
const getShoeImage = (item) => item?.product_image || SHOE_IMAGES[item?.product_name] || null

const OrderCard = ({ order }) => {
  const navigate = useNavigate()
  const firstItem = order.items?.[0]
  const extraCount = (order.items?.length || 1) - 1

  return (
    <div
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      <div className="p-5 flex flex-col sm:flex-row gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-2xl flex-shrink-0 bg-gray-100 overflow-hidden">
            {getShoeImage(firstItem)
              ? <img
                  src={getShoeImage(firstItem)}
                  alt={firstItem?.product_name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80' }}
                />
              : <span className="text-2xl flex items-center justify-center h-full">👟</span>
            }
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-black text-gray-900 text-sm truncate">
              {firstItem?.product_name || 'San pham'}
            </p>
            {firstItem?.product_brand && (
              <p className="text-xs text-gray-400">{firstItem.product_brand}</p>
            )}
            {extraCount > 0 && (
              <p className="text-xs text-blue-500 font-semibold">+{extraCount} san pham khac</p>
            )}
            <p className="text-xs text-gray-400">{fmtDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
          <StatusBadge status={order.status} />
          <div className="text-right">
            <p className="font-black text-gray-900 text-base">{fmt(order.total_amount)}</p>
            <p className="text-xs text-gray-400">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-50 px-5 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-400">Ma don <span className="font-bold text-gray-600">#{order.id}</span></p>
        <span className="text-xs text-blue-600 font-semibold">Xem chi tiet →</span>
      </div>
    </div>
  )
}

const OrdersPage = () => {
  const navigate = useNavigate()
  const cartCount = useSelector(s => s.cart?.count || 0)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusCounts, setStatusCounts] = useState({})

  useEffect(() => {
    let cancelled = false
    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true)
        return orderAPI.getMyOrdersAPI({ status: activeTab, page, limit: 8 })
      })
      .then(data => {
        if (cancelled) return
        setOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
        setStatusCounts(data.statusCounts || {})
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        toast.error('Khong the tai danh sach don hang')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [activeTab, page])

  const totalAll = Object.values(statusCounts).reduce((s, v) => s + v, 0)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500 text-sm">← Quay lai</button>
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-xl">👟</span>
              <span className="text-lg font-black text-gray-900">SNKRS<span className="text-blue-600">.</span></span>
            </Link>
          </div>
          <h1 className="text-base font-black text-gray-900">📦 Đơn hàng của tôi</h1>
          <button onClick={() => navigate('/cart')} className="relative p-2 hover:bg-gray-100 rounded-xl transition">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto">
            {STATUS_TABS.map(tab => {
              const count = tab.key === 'all' ? totalAll : (statusCounts[tab.key] || 0)
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1) }}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition ${active ? 'border-gray-900 text-gray-900 bg-gray-50' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-5 animate-pulse flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="space-y-2 w-24">
                  <div className="h-6 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center gap-4">
            <div className="text-6xl">📭</div>
            <p className="text-xl font-black text-gray-900">Chua co don hang nao</p>
            <p className="text-gray-400 text-sm text-center">
              {activeTab === 'all' ? 'Ban chua dat don hang nao.' : 'Khong co don hang o trang thai nay.'}
            </p>
            <Link to="/" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition">
              🛍️ Mua sam ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition">← Truoc</button>
            <span className="text-sm text-gray-500 font-semibold px-2">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition">Tiep →</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage