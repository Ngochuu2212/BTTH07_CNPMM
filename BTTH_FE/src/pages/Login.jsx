// src/pages/Login.jsx
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { authAPI } from '~/apis'
import { setLoading, updateUser } from '~/redux/userSlice'
import { useNavigate } from 'react-router-dom'
import Input from '~/components/Input'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const loading = useSelector(state => state.user.loading)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    dispatch(setLoading(true))
    try {
      const res = await authAPI.loginUserAPI(formData)

      // Lưu ý: Backend trả về cấu trúc { status, message, data: { token, user, redirectUrl } }
      const { token, user, redirectUrl } = res.data

      // 1. Lưu token vào localStorage
      localStorage.setItem('accessToken', token)

      // 2. Lưu thông tin user vào Redux (Đây là lúc userInfo hết bị null)
      dispatch(updateUser(user))

      toast.success('Đăng nhập thành công!')

      // 3. Điều hướng dựa trên role từ dữ liệu trả về
      if (redirectUrl) {
        navigate(redirectUrl)
      } else {
        // Phòng hờ nếu Backend không trả về URL
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/home')
      }

    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại'
      toast.error(message)
      console.error('Login Error:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-cyan-500 to-blue-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleLogin} className="flex flex-col">
          <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">Đăng Nhập</h2>

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="name@company.com"
            onChange={handleInputChange}
          />

          <div className="mb-6">
            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>

          <div className="mt-6 flex justify-between text-sm text-gray-600">
            <a href="/forgot-password" title="Quên mật khẩu?" className="hover:text-blue-600">Quên mật khẩu?</a>
            <a href="/register" className="text-blue-600 font-bold hover:underline">Tạo tài khoản mới</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login