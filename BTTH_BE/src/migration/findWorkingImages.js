/**
 * Test danh sách Unsplash photo ID candidate để tìm những cái hoạt động (200)
 * Chạy: node src/migration/findWorkingImages.js
 */
const https = require('https')

const CANDIDATES = [
  // Đã xác nhận hoạt động
  'photo-1542291026-7eec264c27ff',
  'photo-1560769629-975ec94e6a86',
  'photo-1491553895911-0055eca6402d',
  'photo-1605348532760-6753d2c43329',
  'photo-1562183241-b937e95585b6',
  'photo-1587563871167-1ee9c731aefb',
  'photo-1595950653106-6c9ebd614d3a',
  'photo-1606107557195-0e29a4b5b4aa',
  'photo-1539185441755-769473a23570',
  'photo-1544441893-675973e31985',
  'photo-1605408499391-6368c628ef42',
  'photo-1564415315949-7a0c4c73aab4',
  'photo-1525966222134-fcfa99b8ae77',
  'photo-1597248881519-db089d3744a5',
  'photo-1549298916-b41d501d3772',
  // Candidates mới cần test
  'photo-1460353581641-37baddab0fa2',
  'photo-1514989940723-e8e51635b782',
  'photo-1515955656352-a1fa3ffcd111',
  'photo-1461049630846-f04c75b57eaa',
  'photo-1600269452121-4f2416e55c28',
  'photo-1553062407-98eeb64c6a62',
  'photo-1571945153237-4929e783af4a',
  'photo-1481538434879-f3a51ced7b32',
  'photo-1511556532299-8f662fc26c06',
  'photo-1476330398798-c30d92e70f99',
  'photo-1624006389438-c03488175975',
  'photo-1512374382149-233c42b6a83b',
  'photo-1466037190933-7abe4f5ca4c6',
  'photo-1519058082700-08a0b56da9b4',
  'photo-1531310197839-ccf54634509e',
  'photo-1613515376380-4f3e37dc9d56',
  'photo-1576334762229-6de1a5f5e70c',
  'photo-1628253747716-0c4f5c90fdda',
  'photo-1558769132-cb1aea458c5e',
  'photo-1537984822441-cff330075342',
  'photo-1626379801357-537c0a174ac5',
]

const working = []
let done = 0

console.log(`🔍 Đang test ${CANDIDATES.length} photo IDs...\n`)

CANDIDATES.forEach(id => {
  const path = `/${id}?w=400&q=80`
  https.get({
    hostname: 'images.unsplash.com',
    path,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  }, res => {
    const ok = res.statusCode >= 200 && res.statusCode < 400
    if (ok) {
      working.push(id)
      console.log(`✅ ${id}`)
    } else {
      console.log(`❌ ${id} (${res.statusCode})`)
    }
    done++
    if (done === CANDIDATES.length) {
      console.log(`\n📋 WORKING IDs (${working.length}/${CANDIDATES.length}):`)
      working.forEach(w => console.log(`  '${w}',`))
    }
  }).on('error', () => {
    console.log(`❌ ${id} (ERROR)`)
    done++
    if (done === CANDIDATES.length) {
      console.log(`\n📋 WORKING IDs (${working.length}/${CANDIDATES.length}):`)
      working.forEach(w => console.log(`  '${w}',`))
    }
  })
})
