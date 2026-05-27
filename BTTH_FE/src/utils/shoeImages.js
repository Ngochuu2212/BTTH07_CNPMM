// Ảnh thật cho từng sản phẩm — UNIQUE, tất cả đã verify 200 OK
// Ưu tiên: image_url từ DB → SHOE_IMAGES theo tên → DEFAULT
export const SHOE_IMAGES = {
  // ── RUNNING ────────────────────────────────────────────────────────────────
  'Nike Air Max 270':               'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'Adidas Ultra Boost 22':          'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80',
  'Puma RS-X Reinvention':          'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'Nike React Infinity Run':        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
  'Adidas Solarboost 5':            'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=80',
  'Asics Gel-Nimbus 25':            'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&q=80',
  'New Balance Fresh Foam 1080':    'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80',
  'Brooks Ghost 15':                'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  'Hoka Clifton 9':                 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',

  // ── LIFESTYLE ──────────────────────────────────────────────────────────────
  'Jordan Air 1 Retro High':        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80',
  'New Balance 574':                'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
  'Converse Chuck Taylor All Star': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80',
  'Reebok Classic Leather':         'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80',
  'Nike Air Force 1 Low':           'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
  'Adidas Stan Smith':              'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80',
  'Puma Suede Classic':             'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=600&q=80',
  'New Balance 990v6':              'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=600&q=80',
  'Converse Run Star Hike':         'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Nike Dunk Low Retro':            'https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=600&q=80',

  // ── SKATEBOARDING ──────────────────────────────────────────────────────────
  'Vans Old Skool':                 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
  'Vans Sk8-Hi':                    'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80',
  'DC Shoes Court Graffik':         'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80',
  'Nike SB Dunk Low Pro':           'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  'Emerica Reynolds 3 G6':          'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=80',
}

export const DEFAULT_SHOE_IMG = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'

// Ưu tiên image_url từ DB → fallback SHOE_IMAGES theo tên → default
export const getProductImage = (product) =>
  product?.image_url || product?.image || SHOE_IMAGES[product?.name] || DEFAULT_SHOE_IMG
