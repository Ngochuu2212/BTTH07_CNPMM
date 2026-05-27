const pool = require('../config/db')
async function run() {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='views'"
  )
  if (rows[0].cnt > 0) {
    console.log('Column views already exists')
  } else {
    await pool.query('ALTER TABLE products ADD COLUMN views INT NOT NULL DEFAULT 0')
    console.log('Added column views')
  }
  // Seed một số views giả để demo
  await pool.query("UPDATE products SET views = FLOOR(500 + RAND() * 9500)")
  console.log('Seeded random views')
  process.exit(0)
}
run().catch(e => { console.error(e.message); process.exit(1) })
