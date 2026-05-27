const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

// Import các file routes
const authRoutes    = require('./src/routes/authRoutes')
const productRoutes = require('./src/routes/productRoutes')
const cartRoutes    = require('./src/routes/cartRoutes')
const orderRoutes   = require('./src/routes/orderRoutes')
const reviewRoutes  = require('./src/routes/reviewRoutes')

const app = express()

// Cấu hình CORS cho phép FE (React) kết nối
app.use(cors({
  origin: process.env.FE_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Serve static files (avatars, v.v.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Middleware xử lý dữ liệu JSON từ request body
app.use(express.json())

app.use(express.urlencoded({ extended: true }))

// Cấu hình URL cơ sở cho phần Auth
app.use('/api/auth', authRoutes)

// Cấu hình URL cơ sở cho Products
app.use('/api/products', productRoutes)

// Cấu hình URL cơ sở cho Cart
app.use('/api/cart', cartRoutes)

// Cấu hình URL cơ sở cho Orders
app.use('/api/orders', orderRoutes)

// Cấu hình URL cơ sở cho Reviews
app.use('/api/reviews', reviewRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`)
})