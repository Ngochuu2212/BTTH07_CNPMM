const pool = require('../config/db')

;(async () => {
  // Lấy 1 đơn hàng chưa delivered để test
  const [orders] = await pool.query(
    "SELECT o.id, o.status FROM orders o WHERE o.status NOT IN ('delivered','cancelled') LIMIT 1"
  )
  if (!orders.length) {
    console.log('Không có đơn hàng phù hợp để test (tất cả đã delivered hoặc cancelled)')
    process.exit(0)
  }
  const order = orders[0]
  console.log(`Test order #${order.id} | status hiện tại: ${order.status}`)

  // Lấy sold trước khi update
  const [items] = await pool.query(
    'SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order.id]
  )
  console.log('Sản phẩm trong đơn:', items)

  const befores = {}
  for (const item of items) {
    const [[p]] = await pool.query('SELECT id, name, sold FROM products WHERE id = ?', [item.product_id])
    befores[item.product_id] = p.sold
    console.log(`  BEFORE: ${p.name} | sold = ${p.sold}`)
  }

  // Cập nhật status sang delivered bằng SQL thuần (như user đang làm)
  await pool.query("UPDATE orders SET status = 'delivered' WHERE id = ?", [order.id])
  console.log('\nĐã UPDATE status → delivered (bằng SQL trực tiếp)\n')

  // Kiểm tra sold sau
  for (const item of items) {
    const [[p]] = await pool.query('SELECT id, name, sold FROM products WHERE id = ?', [item.product_id])
    const diff = p.sold - befores[item.product_id]
    console.log(`  AFTER: ${p.name} | sold = ${p.sold} (tăng ${diff >= 0 ? '+' : ''}${diff})`)
  }

  process.exit(0)
})().catch(e => { console.error('Lỗi:', e.message); process.exit(1) })
