import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    count: 0 // tổng số lượng sản phẩm trong giỏ
  },
  reducers: {
    setCartCount: (state, action) => {
      state.count = action.payload
    },
    incrementCart: (state, action) => {
      state.count += (action.payload ?? 1)
    },
    decrementCart: (state, action) => {
      state.count = Math.max(0, state.count - (action.payload ?? 1))
    },
    resetCart: (state) => {
      state.count = 0
    }
  }
})

export const { setCartCount, incrementCart, decrementCart, resetCart } = cartSlice.actions
export default cartSlice.reducer
