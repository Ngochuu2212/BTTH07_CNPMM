import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearUser, updateUser, setLoading } from '~/redux/userSlice'
import { authAPI } from '~/apis'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { userInfo, loading } = useSelector((state) => state.user)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: userInfo?.username || '',
    full_name: userInfo?.full_name || '',
    phone_number: userInfo?.phone_number || ''
  })

  const handleLogout = () => {
    dispatch(clearUser())
    toast.info('Đã đăng xuất!')
    window.location.href = '/login'
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    dispatch(setLoading(true))
    try {
      const res = await authAPI.updateProfileAPI(formData)
      if (res.data && res.data.user) {
        dispatch(updateUser(res.data.user))
        toast.success(res.message || 'Cập nhật thành công!')
        setIsEditing(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật hồ sơ')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all mb-4'

  return (
    <div className="min-h-screen bg-linear-to-tr from-slate-100 to-rose-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🛡️ Bảng điều khiển Admin
          </h1>
          <button onClick={handleLogout} className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg font-medium transition flex items-center gap-2">
            🚪 Đăng xuất
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cột trái: Card cá nhân */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-linear-to-br from-rose-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                  {userInfo?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-6 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{userInfo?.full_name || userInfo?.username}</h2>
              <p className="text-gray-500 text-sm mb-6">@{userInfo?.username}</p>
              <span className="px-4 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold uppercase tracking-widest border border-rose-100">
                👑 {userInfo?.role}
              </span>
            </div>
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold text-gray-800">Thông tin Admin</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-200 active:scale-95"
                  >
                    ✏️ Chỉnh sửa hồ sơ
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">

                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                    {isEditing ? (
                      <input type="text" value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className={inputClass} placeholder="Nhập họ và tên" />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 mb-6 border border-gray-100">{userInfo?.full_name || '—'}</div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                    {isEditing ? (
                      <input type="text" value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className={inputClass} placeholder="Nhập số điện thoại" />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 mb-6 border border-gray-100">{userInfo?.phone_number || '—'}</div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-2">Tên người dùng</label>
                    {isEditing ? (
                      <input type="text" value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={inputClass} placeholder="Nhập username" />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 mb-6 border border-gray-100">{userInfo?.username}</div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-2">Email</label>
                    <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 mb-6 border border-gray-100 cursor-not-allowed">
                      {userInfo?.email}
                    </div>
                  </div>

                </div>

                {isEditing && (
                  <div className="flex gap-4 mt-4">
                    <button type="submit" disabled={loading}
                      className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition shadow-lg disabled:opacity-50">
                      {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">
                      Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard