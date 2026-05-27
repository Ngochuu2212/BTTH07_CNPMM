const pool = require('../config/db')

const alter = async () => {
  try {
    await pool.query(`
      ALTER TABLE orders
      MODIFY COLUMN status
        ENUM('pending','confirmed','preparing','shipping','delivered','cancelled','cancel_requested')
        NOT NULL DEFAULT 'pending'
    `)
    console.log('✅ ALTER TABLE orders status ENUM done')
    process.exit(0)
  } catch (err) {
    console.error('❌', err.message)
    process.exit(1)
  }
}

alter()
