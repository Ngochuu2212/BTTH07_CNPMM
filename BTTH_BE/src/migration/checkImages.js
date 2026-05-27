const https = require('https')
const pool = require('../config/db')

pool.query('SELECT id, name, image_url FROM products ORDER BY id').then(([rows]) => {
  let checked = 0
  rows.forEach(r => {
    try {
      const urlObj = new URL(r.image_url)
      https.get({
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }, res => {
        const ok = res.statusCode >= 200 && res.statusCode < 400
        console.log(ok ? '✅' : '❌', `[ID ${r.id}]`, r.name, `=> ${res.statusCode}`)
        checked++
        if (checked === rows.length) { pool.end(); }
      }).on('error', err => {
        console.log('❌', `[ID ${r.id}]`, r.name, `=> ERROR: ${err.message}`)
        checked++
        if (checked === rows.length) { pool.end(); }
      })
    } catch (e) {
      console.log('❌', `[ID ${r.id}]`, r.name, `=> INVALID URL`)
      checked++
      if (checked === rows.length) { pool.end(); }
    }
  })
}).catch(e => { console.error(e.message); process.exit(1) })
