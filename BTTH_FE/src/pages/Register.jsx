import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { authAPI } from '~/apis'
import { setLoading } from '~/redux/userSlice'
import Input from '~/components/Input'

const Register = () => {
  const dispatch = useDispatch()
  const loading = useSelector(state => state.user.loading)

  const [isOTPStep, setIsOTPStep] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [otp, setOtp] = useState('')

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    dispatch(setLoading(true))
    try {
      const res = await authAPI.registerUserAPI(formData)
      toast.success(res.message)
      setIsOTPStep(true)
    } catch (error) {
      console.error('Register Error:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    dispatch(setLoading(true))
    try {
      const res = await authAPI.verifyOTPAPI({ email: formData.email, otp })
      toast.success(res.message)
      window.location.href = '/login'
    } catch (error) {
      console.error('Verify OTP Error:', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Class dùng chung cho Input để gọn code
  const inputClass = 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white mb-4'
  const buttonClass = 'w-full py-3 rounded-lg font-bold text-white transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-cyan-500 to-blue-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {!isOTPStep ? (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col">
            <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-2">Tạo tài khoản</h2>
            <p className="text-gray-500 text-center mb-8">Bắt đầu hành trình của bạn ngay hôm nay</p>

            <Input name="username" label="Tên người dùng" placeholder="Tên người dùng" onChange={handleInputChange} />
            <Input name="email" type="email" label="Địa chỉ Email" placeholder="example@email.com" onChange={handleInputChange} />
            <Input name="password" type="password" label="Mật khẩu" placeholder="Ít nhất 6 ký tự" onChange={handleInputChange} />

            <button type="submit" disabled={loading} className={`${buttonClass} bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg`}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : <span className="hover:underline">Đăng ký ngay</span>}
            </button>
            <p className="text-center mt-6 text-sm text-gray-600">
              Đã có tài khoản? <a href="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="flex flex-col">
            <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-2">Xác thực OTP</h2>
            <p className="text-gray-500 text-center mb-6 text-sm">
              Chúng tôi đã gửi mã xác nhận đến <span className="font-semibold text-blue-600">{formData.email}</span>
            </p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`${inputClass} text-center text-2xl tracking-widest font-mono`}
              placeholder="000000"
              maxLength="6"
              required
            />
            <button type="submit" disabled={loading} className={`${buttonClass} bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg`}>
              {loading ? 'Đang xác nhận...' : 'Xác nhận mã OTP'}
            </button>
            <button
              type="button"
              onClick={() => setIsOTPStep(false)}
              className="mt-4 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Quay lại chỉnh sửa thông tin
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Register