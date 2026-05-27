import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '~/components/ProtectedRoute'
import Login from '~/pages/Login'
import Register from '~/pages/Register'
import AdminDashboard from '~/pages/AdminDashboard'
import Home from '~/pages/Home'
import HomePage from '~/pages/HomePage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ForgotPassword from '~/pages/ForgotPassword'
import ProductDetail from '~/pages/ProductDetail'
import SearchPage from '~/pages/SearchPage'
import CategoryPage from '~/pages/CategoryPage'
import CartPage from '~/pages/CartPage'
import CheckoutPage from '~/pages/CheckoutPage'
import OrdersPage from '~/pages/OrdersPage'
import OrderDetailPage from '~/pages/OrderDetailPage'

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Trang chủ bán hàng - sau khi login */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <HomePage />
          </ProtectedRoute>
        } />

        {/* Trang tìm kiếm */}
        <Route path="/search" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <SearchPage />
          </ProtectedRoute>
        } />

        {/* Trang chi tiết sản phẩm */}
        <Route path="/product/:id" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <ProductDetail />
          </ProtectedRoute>
        } />

        {/* Trang danh mục sản phẩm theo từng loại */}
        <Route path="/category/:categoryId" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <CategoryPage />
          </ProtectedRoute>
        } />
        <Route path="/category" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <CategoryPage />
          </ProtectedRoute>
        } />

        {/* Trang giỏ hàng */}
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <CartPage />
          </ProtectedRoute>
        } />

        {/* Trang thanh toán */}
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <CheckoutPage />
          </ProtectedRoute>
        } />

        {/* Trang đơn hàng */}
        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <OrderDetailPage />
          </ProtectedRoute>
        } />

        {/* Route Profile dành cho User */}
        <Route path="/user/profile" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Home />
          </ProtectedRoute>
        } />

        {/* Route Profile CHỈ dành cho Admin */}
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Mặc định quay về login nếu không khớp route nào */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App