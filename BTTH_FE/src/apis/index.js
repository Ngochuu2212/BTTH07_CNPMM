import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { API_ROOT } from '~/utils/constants'

/**
 * Đăng ký tài khoản mới
 * @param {Object} data: { username, email, password }
 */
const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/auth/register`, data)
  return response.data
}

/**
 * Xác thực OTP kích hoạt tài khoản
 * @param {Object} data: { email, otp }
 */
const verifyOTPAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/auth/verify-otp`, data)
  return response.data
}

/**
 * Quên mật khẩu - Gửi yêu cầu lấy OTP
 * @param {string} email
 */
const forgotPasswordAPI = async (email) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/auth/forgot-password`, { email })
  return response.data
}

/**
 * Quên mật khẩu - Đặt lại mật khẩu mới
 * @param {Object} data: { email, otp, newPassword }
 */
const resetPasswordAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/auth/reset-password`, data)
  return response.data
}

const loginUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/auth/login`, data)
  return response.data
}

const updateProfileAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/api/auth/update-profile`, data)
  return response.data
}

const uploadAvatarAPI = async (formData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/auth/upload-avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const authAPI = {
  registerUserAPI,
  verifyOTPAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
  loginUserAPI,
  updateProfileAPI,
  uploadAvatarAPI
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lấy danh sách sản phẩm có phân trang & lọc theo danh mục
 * @param {Object} params - { page, limit, category, sort }
 */
const getProductsAPI = async (params = {}) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/products`, { params })
  return response.data
}

/**
 * Lấy danh sách danh mục kèm số lượng sản phẩm
 */
const getCategoriesAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/products/categories`)
  return response.data
}

const getTopSellersAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/products/top-sellers`)
  return response.data
}

const getMostViewedAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/products/most-viewed`)
  return response.data
}

const getProductByIdAPI = async (productId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/products/${productId}`)
  return response.data
}

const incrementViewAPI = async (productId) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/products/${productId}/view`)
  return response.data
}

export const productAPI = {
  getProductsAPI,
  getProductByIdAPI,
  getCategoriesAPI,
  getTopSellersAPI,
  getMostViewedAPI,
  incrementViewAPI
}

// ═══════════════════════════════════════════════════════════════════════════
// CART API
// ═══════════════════════════════════════════════════════════════════════════

/** Lấy giỏ hàng của user hiện tại */
const getCartAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/cart`)
  return response.data
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {Object} data - { product_id, quantity?, size? }
 */
const addToCartAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/cart`, data)
  return response.data
}

/**
 * Cập nhật số lượng 1 item
 * @param {number} itemId - ID của cart_item
 * @param {number} quantity - Số lượng mới
 */
const updateCartItemAPI = async (itemId, quantity) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/api/cart/${itemId}`, { quantity })
  return response.data
}

/**
 * Xoá 1 item khỏi giỏ
 * @param {number} itemId - ID của cart_item
 */
const removeCartItemAPI = async (itemId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/api/cart/${itemId}`)
  return response.data
}

/** Xoá toàn bộ giỏ hàng */
const clearCartAPI = async () => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/api/cart`)
  return response.data
}

export const cartAPI = {
  getCartAPI,
  addToCartAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER API
// ═══════════════════════════════════════════════════════════════════════════

/** Tạo đơn hàng mới từ giỏ hàng */
const createOrderAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/orders`, data)
  return response.data
}

/** Lấy danh sách đơn hàng của người dùng */
const getMyOrdersAPI = async (params = {}) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/orders`, { params })
  return response.data
}

/** Lấy chi tiết 1 đơn hàng */
const getOrderByIdAPI = async (id) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/orders/${id}`)
  return response.data
}

/** Huỷ đơn hàng (kèm lý do) */
const cancelOrderAPI = async (id, reason = '') => {
  const response = await authorizedAxiosInstance.patch(`${API_ROOT}/api/orders/${id}/cancel`, { reason })
  return response.data
}

/** [Admin] Cập nhật trạng thái đơn hàng */
const adminUpdateOrderStatusAPI = async (id, status) => {
  const response = await authorizedAxiosInstance.patch(`${API_ROOT}/api/orders/${id}/status`, { status })
  return response.data
}

export const orderAPI = {
  createOrderAPI,
  getMyOrdersAPI,
  getOrderByIdAPI,
  cancelOrderAPI,
  adminUpdateOrderStatusAPI
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW API
// ═══════════════════════════════════════════════════════════════════════════

/** Gửi đánh giá sản phẩm (order phải có status = delivered) */
const submitReviewAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/reviews`, data)
  return response.data
}

/** Kiểm tra user đã review sản phẩm nào trong đơn hàng rồi */
const getOrderReviewStatusAPI = async (orderId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/reviews/order/${orderId}/status`)
  return response.data
}

/** Lấy tổng điểm tích lũy + danh sách mã giảm giá còn hiệu lực */
const getMyPointsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/reviews/my-points`)
  return response.data
}

/** Lấy tất cả đánh giá của 1 sản phẩm (công khai) */
const getProductReviewsAPI = async (productId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/reviews/product/${productId}`)
  return response.data
}

/** Sử dụng điểm tích lũy cho đơn hàng */
const usePointsAPI = async ({ points_used, order_id }) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/reviews/use-points`, { points_used, order_id })
  return response.data
}

export const reviewAPI = {
  submitReviewAPI,
  getOrderReviewStatusAPI,
  getMyPointsAPI,
  getProductReviewsAPI,
  usePointsAPI
}

// ═══════════════════════════════════════════════════════════════════════════
// WISHLIST API
// ═══════════════════════════════════════════════════════════════════════════

const getMyWishlistAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/wishlist`)
  return response.data
}

const toggleWishlistAPI = async (productId) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/wishlist/${productId}`)
  return response.data
}

const checkWishlistAPI = async (productId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/wishlist/check/${productId}`)
  return response.data
}

const getViewHistoryAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/wishlist/history`)
  return response.data
}

// ═══════════════════════════════════════════════════════════════════════════
// COUPON API
// ═══════════════════════════════════════════════════════════════════════════

/** Lấy danh sách mã đang hoạt động */
const getAvailableCouponsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/api/coupons`)
  return response.data
}

/** Kiểm tra mã giảm giá + tính số tiền được giảm */
const validateCouponAPI = async (code, subtotal) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/api/coupons/validate`, { code, subtotal })
  return response.data
}

export const couponAPI = { getAvailableCouponsAPI, validateCouponAPI }

export const wishlistAPI = {
  getMyWishlistAPI,
  toggleWishlistAPI,
  checkWishlistAPI,
  getViewHistoryAPI
}
