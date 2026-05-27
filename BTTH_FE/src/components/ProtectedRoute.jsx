import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userInfo } = useSelector((state) => state.user)

  if (!userInfo) {
    // Chưa đăng nhập thì đá về login
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    // Đã đăng nhập nhưng sai Role (ví dụ User muốn vào Admin)
    return <Navigate to="/unauthorized" replace />
  }

  return children
}