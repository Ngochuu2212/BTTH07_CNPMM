import { createSlice } from '@reduxjs/toolkit'

// Hàm trợ giúp để lấy dữ liệu an toàn từ localStorage
const getInitialUserInfo = () => {
  const savedUser = localStorage.getItem('userInfo')
  // Kiểm tra nếu không có dữ liệu hoặc dữ liệu là chuỗi "undefined" (lỗi do lưu sai)
  if (!savedUser || savedUser === 'undefined') {
    return null
  }
  try {
    return JSON.parse(savedUser)
  } catch (error) {
    // Nếu dữ liệu bị hỏng không parse được thì xóa luôn và trả về null
    localStorage.removeItem('userInfo')
    return null
  }
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: getInitialUserInfo(),
    loading: false
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    updateUser: (state, action) => {
      state.userInfo = action.payload
      // Luôn đảm bảo lưu dữ liệu đã được stringify
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    },
    clearUser: (state) => {
      state.userInfo = null
      localStorage.removeItem('userInfo')
      localStorage.removeItem('accessToken')
    }
  }
})

export const { setLoading, updateUser, clearUser } = userSlice.actions
export default userSlice.reducer