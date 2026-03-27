import express from 'express'
import fetch from 'node-fetch'

const app = express()
const PORT = 3001

// ─── Kroger credentials ───────────────────────────────────────────────────────
// To use real data: sign up at https://developer.kroger.com, create an app,
// and paste your Client ID and Secret below. Leave these as-is to use mock data.
const CLIENT_ID = 'aislemap-bbcdrjyg'
const CLIENT_SECRET = 'emAJ53MP6mSde3Oy3M0HIvZK925GLazHqSJln3Ef'
const KROGER_BASE = 'https://api.kroger.com/v1'

// ─── Mock data (used when Kroger credentials are invalid / during dev) ────────
// Realistic data so the full app flow can be tested without a working API key.

const MOCK_STORES = {
  '60035': [
    { locationId: 'loc-001', name: "Mariano's Fresh Market", address: '1512 N Fremont St, Chicago, IL 60622' },
    { locationId: 'loc-002', name: 'Kroger Marketplace', address: '1801 Oakwood Ave, Highland Park, IL 60035' },
    { locationId: 'loc-003', name: 'Kroger', address: '600 Central Ave, Highland Park, IL 60035' },
    { locationId: 'loc-004', name: "Pick 'n Save", address: '3500 Skokie Valley Rd, Highland Park, IL 60035' },
  ],
  '30301': [
    { locationId: 'loc-010', name: 'Kroger Marketplace Atlanta', address: '800 Dekalb Ave NE, Atlanta, GA 30307' },
    { locationId: 'loc-011', name: 'Kroger', address: '725 Ponce De Leon Ave NE, Atlanta, GA 30306' },
    { locationId: 'loc-012', name: 'Kroger', address: '1492 Ponce De Leon Ave NE, Decatur, GA 30033' },
  ],
}

// Default mock stores for any other zip
const DEFAULT_MOCK_STORES = [
  { locationId: 'loc-099', name: 'Kroger', address: '123 Main St, Anytown, USA 00000' },
  { locationId: 'loc-100', name: 'Kroger Marketplace', address: '456 Oak Ave, Anytown, USA 00000' },
]

// Each product has a `keywords` array for fuzzy matching beyond name/brand.
// Add terms here that a user might realistically type to find this item.
const MOCK_PRODUCTS = [
  // ── Dairy & Eggs ──────────────────────────────────────────────────────────
  { productId: 'prod-001', name: 'Organic Whole Milk (1 gal)', brand: 'Simple Truth Organic', price: 599, aisleNumber: '12', aisleDescription: 'Dairy', calories: 150, protein: 8, carbs: 12, fat: 8, keywords: ['milk', 'dairy', 'whole milk', 'organic milk'] },
  { productId: 'prod-001b', name: '2% Reduced Fat Milk (1 gal)', brand: 'Kroger', price: 399, aisleNumber: '12', aisleDescription: 'Dairy', calories: 130, protein: 8, carbs: 13, fat: 5, keywords: ['milk', 'dairy', '2% milk', 'reduced fat milk'] },
  { productId: 'prod-001c', name: 'Oat Milk Original (52 fl oz)', brand: 'Oatly', price: 599, aisleNumber: '12', aisleDescription: 'Dairy Alternatives', calories: 120, protein: 3, carbs: 16, fat: 5, keywords: ['milk', 'oat milk', 'dairy free', 'plant based milk'] },
  { productId: 'prod-002', name: 'Large Brown Eggs (12 ct)', brand: "Pete and Gerry's", price: 649, aisleNumber: '12', aisleDescription: 'Dairy & Eggs', calories: 70, protein: 6, carbs: 0, fat: 5, keywords: ['eggs', 'egg', 'brown eggs', 'dozen'] },
  { productId: 'prod-002b', name: 'Large White Eggs (18 ct)', brand: 'Kroger', price: 499, aisleNumber: '12', aisleDescription: 'Dairy & Eggs', calories: 70, protein: 6, carbs: 0, fat: 5, keywords: ['eggs', 'egg', 'white eggs'] },
  { productId: 'prod-006', name: 'Greek Yogurt Plain Non-Fat (32 oz)', brand: 'Fage', price: 799, aisleNumber: '12', aisleDescription: 'Dairy', calories: 90, protein: 17, carbs: 6, fat: 0, keywords: ['yogurt', 'greek yogurt', 'fage', 'dairy'] },
  { productId: 'prod-006b', name: 'Greek Yogurt Vanilla (5.3 oz)', brand: 'Chobani', price: 169, aisleNumber: '12', aisleDescription: 'Dairy', calories: 120, protein: 12, carbs: 14, fat: 0, keywords: ['yogurt', 'greek yogurt', 'chobani'] },
  { productId: 'prod-ch1', name: 'Sharp Cheddar Cheese Block (8 oz)', brand: 'Tillamook', price: 499, aisleNumber: '12', aisleDescription: 'Cheese', calories: 110, protein: 7, carbs: 0, fat: 9, keywords: ['cheese', 'cheddar', 'cheddar cheese', 'block cheese'] },
  { productId: 'prod-ch2', name: 'Shredded Mozzarella (16 oz)', brand: 'Kroger', price: 399, aisleNumber: '12', aisleDescription: 'Cheese', calories: 80, protein: 6, carbs: 1, fat: 6, keywords: ['cheese', 'mozzarella', 'shredded cheese', 'pizza cheese'] },
  { productId: 'prod-bt1', name: 'Unsalted Butter (4 sticks)', brand: 'Kerrygold', price: 699, aisleNumber: '12', aisleDescription: 'Dairy', calories: 100, protein: 0, carbs: 0, fat: 11, keywords: ['butter', 'unsalted butter', 'kerrygold'] },

  // ── Nut Butters ───────────────────────────────────────────────────────────
  { productId: 'prod-009', name: 'Almond Butter Creamy (12 oz)', brand: "Justin's", price: 999, aisleNumber: '6', aisleDescription: 'Nut Butters & Jam', calories: 190, protein: 7, carbs: 7, fat: 16, keywords: ['almond butter', 'nut butter', 'butter', 'almonds'] },
  { productId: 'prod-009b', name: 'Peanut Butter Creamy (16 oz)', brand: "Jif", price: 399, aisleNumber: '6', aisleDescription: 'Nut Butters & Jam', calories: 190, protein: 8, carbs: 7, fat: 16, keywords: ['peanut butter', 'pb', 'nut butter', 'butter', 'peanut'] },
  { productId: 'prod-009c', name: 'Peanut Butter Natural Crunchy (16 oz)', brand: 'Smucker\'s', price: 449, aisleNumber: '6', aisleDescription: 'Nut Butters & Jam', calories: 200, protein: 7, carbs: 7, fat: 17, keywords: ['peanut butter', 'natural peanut butter', 'crunchy peanut butter', 'pb', 'peanut'] },
  { productId: 'prod-009d', name: 'Peanut Butter Powder (6.5 oz)', brand: 'PB2', price: 549, aisleNumber: '6', aisleDescription: 'Nut Butters & Jam', calories: 60, protein: 5, carbs: 5, fat: 2, keywords: ['peanut butter', 'pb2', 'pb powder', 'peanut powder'] },
  { productId: 'prod-009e', name: 'Strawberry Jam (18 oz)', brand: "Smucker's", price: 349, aisleNumber: '6', aisleDescription: 'Nut Butters & Jam', calories: 50, protein: 0, carbs: 13, fat: 0, keywords: ['jam', 'jelly', 'strawberry jam', 'strawberry jelly', 'preserves'] },

  // ── Bread & Bakery ────────────────────────────────────────────────────────
  { productId: 'prod-003', name: 'Whole Grain Bread (27 oz)', brand: "Dave's Killer Bread", price: 599, aisleNumber: '3', aisleDescription: 'Bread & Bakery', calories: 120, protein: 5, carbs: 22, fat: 2, keywords: ['bread', 'whole grain', 'whole wheat bread', 'sandwich bread'] },
  { productId: 'prod-003b', name: 'White Sandwich Bread (20 oz)', brand: 'Nature\'s Own', price: 399, aisleNumber: '3', aisleDescription: 'Bread & Bakery', calories: 110, protein: 4, carbs: 22, fat: 2, keywords: ['bread', 'white bread', 'sandwich bread'] },
  { productId: 'prod-003c', name: 'Sourdough Bread Loaf (24 oz)', brand: 'Boudin', price: 549, aisleNumber: '3', aisleDescription: 'Bread & Bakery', calories: 130, protein: 5, carbs: 26, fat: 1, keywords: ['bread', 'sourdough', 'sourdough bread'] },

  // ── Meat & Seafood ────────────────────────────────────────────────────────
  { productId: 'prod-004', name: 'Boneless Skinless Chicken Breast (2 lb)', brand: 'Simple Truth', price: 1299, aisleNumber: '7', aisleDescription: 'Meat & Seafood', calories: 160, protein: 30, carbs: 0, fat: 3, keywords: ['chicken', 'chicken breast', 'poultry', 'meat'] },
  { productId: 'prod-004b', name: 'Ground Beef 85/15 (1 lb)', brand: 'Kroger', price: 699, aisleNumber: '7', aisleDescription: 'Meat & Seafood', calories: 230, protein: 22, carbs: 0, fat: 15, keywords: ['beef', 'ground beef', 'hamburger', 'meat'] },
  { productId: 'prod-004c', name: 'Salmon Fillet Atlantic (1 lb)', brand: 'Simple Truth', price: 1399, aisleNumber: '7', aisleDescription: 'Meat & Seafood', calories: 200, protein: 28, carbs: 0, fat: 10, keywords: ['salmon', 'fish', 'seafood', 'atlantic salmon'] },
  { productId: 'prod-004d', name: 'Ground Turkey 93/7 (1 lb)', brand: 'Butterball', price: 699, aisleNumber: '7', aisleDescription: 'Meat & Seafood', calories: 170, protein: 22, carbs: 0, fat: 9, keywords: ['turkey', 'ground turkey', 'meat', 'poultry'] },

  // ── Produce ───────────────────────────────────────────────────────────────
  { productId: 'prod-005', name: 'Baby Spinach (5 oz)', brand: 'Earthbound Farm', price: 399, aisleNumber: '1', aisleDescription: 'Produce', calories: 20, protein: 2, carbs: 3, fat: 0, keywords: ['spinach', 'greens', 'salad', 'produce', 'vegetables'] },
  { productId: 'prod-005b', name: 'Bananas (1 lb)', brand: 'Kroger', price: 59, aisleNumber: '1', aisleDescription: 'Produce', calories: 90, protein: 1, carbs: 23, fat: 0, keywords: ['banana', 'bananas', 'fruit', 'produce'] },
  { productId: 'prod-005c', name: 'Gala Apples (3 lb bag)', brand: 'Kroger', price: 499, aisleNumber: '1', aisleDescription: 'Produce', calories: 80, protein: 0, carbs: 22, fat: 0, keywords: ['apple', 'apples', 'gala', 'fruit', 'produce'] },
  { productId: 'prod-005d', name: 'Broccoli Crowns (1 lb)', brand: 'Kroger', price: 199, aisleNumber: '1', aisleDescription: 'Produce', calories: 35, protein: 3, carbs: 7, fat: 0, keywords: ['broccoli', 'vegetables', 'produce', 'veggies'] },
  { productId: 'prod-005e', name: 'Avocado Hass (each)', brand: 'Kroger', price: 149, aisleNumber: '1', aisleDescription: 'Produce', calories: 160, protein: 2, carbs: 9, fat: 15, keywords: ['avocado', 'hass avocado', 'produce', 'fruit'] },
  { productId: 'prod-005f', name: 'Strawberries (1 lb)', brand: 'Kroger', price: 399, aisleNumber: '1', aisleDescription: 'Produce', calories: 45, protein: 1, carbs: 11, fat: 0, keywords: ['strawberry', 'strawberries', 'berries', 'fruit', 'produce'] },

  // ── Canned Goods ─────────────────────────────────────────────────────────
  { productId: 'prod-010', name: 'Black Beans (15 oz)', brand: "Bush's Best", price: 149, aisleNumber: '8', aisleDescription: 'Canned Goods', calories: 110, protein: 8, carbs: 20, fat: 0, keywords: ['beans', 'black beans', 'canned beans', 'legumes'] },
  { productId: 'prod-010b', name: 'Chickpeas Garbanzo Beans (15 oz)', brand: 'Goya', price: 129, aisleNumber: '8', aisleDescription: 'Canned Goods', calories: 120, protein: 7, carbs: 22, fat: 2, keywords: ['beans', 'chickpeas', 'garbanzo', 'canned beans', 'legumes'] },
  { productId: 'prod-010c', name: 'Diced Tomatoes (14.5 oz)', brand: 'Hunt\'s', price: 109, aisleNumber: '8', aisleDescription: 'Canned Goods', calories: 25, protein: 1, carbs: 5, fat: 0, keywords: ['tomatoes', 'diced tomatoes', 'canned tomatoes', 'tomato'] },
  { productId: 'prod-010d', name: 'Tuna in Water (5 oz)', brand: 'StarKist', price: 179, aisleNumber: '8', aisleDescription: 'Canned Goods', calories: 90, protein: 20, carbs: 0, fat: 1, keywords: ['tuna', 'canned tuna', 'fish', 'seafood'] },

  // ── Pasta, Rice & Grains ─────────────────────────────────────────────────
  { productId: 'prod-pa1', name: 'Penne Pasta (16 oz)', brand: 'Barilla', price: 199, aisleNumber: '4', aisleDescription: 'Pasta & Rice', calories: 200, protein: 7, carbs: 41, fat: 1, keywords: ['pasta', 'penne', 'noodles', 'barilla'] },
  { productId: 'prod-pa2', name: 'Spaghetti (16 oz)', brand: 'Barilla', price: 199, aisleNumber: '4', aisleDescription: 'Pasta & Rice', calories: 200, protein: 7, carbs: 41, fat: 1, keywords: ['pasta', 'spaghetti', 'noodles'] },
  { productId: 'prod-pa3', name: 'Jasmine White Rice (5 lb)', brand: 'Mahatma', price: 599, aisleNumber: '4', aisleDescription: 'Pasta & Rice', calories: 160, protein: 3, carbs: 36, fat: 0, keywords: ['rice', 'white rice', 'jasmine rice'] },
  { productId: 'prod-pa4', name: 'Brown Rice Long Grain (2 lb)', brand: 'Kroger', price: 299, aisleNumber: '4', aisleDescription: 'Pasta & Rice', calories: 150, protein: 3, carbs: 32, fat: 1, keywords: ['rice', 'brown rice', 'whole grain rice'] },
  { productId: 'prod-pa5', name: 'Quinoa Tri-Color (16 oz)', brand: 'Ancient Harvest', price: 699, aisleNumber: '4', aisleDescription: 'Pasta & Rice', calories: 160, protein: 6, carbs: 27, fat: 3, keywords: ['quinoa', 'grain', 'protein grain'] },

  // ── Breakfast & Cereal ────────────────────────────────────────────────────
  { productId: 'prod-007', name: 'Rolled Oats Old Fashioned (42 oz)', brand: 'Quaker', price: 549, aisleNumber: '5', aisleDescription: 'Cereal & Breakfast', calories: 150, protein: 5, carbs: 27, fat: 3, keywords: ['oats', 'oatmeal', 'rolled oats', 'quaker', 'breakfast', 'cereal'] },
  { productId: 'prod-007b', name: 'Cheerios Original (18 oz)', brand: 'General Mills', price: 549, aisleNumber: '5', aisleDescription: 'Cereal & Breakfast', calories: 100, protein: 3, carbs: 20, fat: 2, keywords: ['cereal', 'cheerios', 'breakfast cereal'] },
  { productId: 'prod-007c', name: 'Granola Oats & Honey (16 oz)', brand: "Nature Valley", price: 499, aisleNumber: '5', aisleDescription: 'Cereal & Breakfast', calories: 230, protein: 5, carbs: 33, fat: 8, keywords: ['granola', 'breakfast', 'cereal', 'oats'] },

  // ── Oils, Sauces & Condiments ─────────────────────────────────────────────
  { productId: 'prod-008', name: 'Extra Virgin Olive Oil (16.9 fl oz)', brand: 'California Olive Ranch', price: 1099, aisleNumber: '9', aisleDescription: 'Oils & Vinegar', calories: 120, protein: 0, carbs: 0, fat: 14, keywords: ['olive oil', 'oil', 'evoo', 'cooking oil'] },
  { productId: 'prod-sa1', name: 'Marinara Sauce (24 oz)', brand: 'Rao\'s Homemade', price: 899, aisleNumber: '9', aisleDescription: 'Sauces & Condiments', calories: 80, protein: 3, carbs: 7, fat: 6, keywords: ['marinara', 'pasta sauce', 'tomato sauce', 'sauce', 'rao'] },
  { productId: 'prod-sa2', name: 'Soy Sauce Low Sodium (10 fl oz)', brand: 'Kikkoman', price: 349, aisleNumber: '9', aisleDescription: 'International Foods', calories: 10, protein: 1, carbs: 1, fat: 0, keywords: ['soy sauce', 'soy', 'asian', 'condiment'] },

  // ── Snacks ────────────────────────────────────────────────────────────────
  { productId: 'prod-sn1', name: 'Tortilla Chips Restaurant Style (13 oz)', brand: 'Tostitos', price: 449, aisleNumber: '11', aisleDescription: 'Chips & Snacks', calories: 140, protein: 2, carbs: 18, fat: 7, keywords: ['chips', 'tortilla chips', 'tostitos', 'snacks', 'nachos'] },
  { productId: 'prod-sn2', name: 'Almonds Roasted Salted (16 oz)', brand: 'Blue Diamond', price: 999, aisleNumber: '11', aisleDescription: 'Nuts & Trail Mix', calories: 170, protein: 6, carbs: 6, fat: 15, keywords: ['almonds', 'nuts', 'snacks', 'roasted almonds'] },
  { productId: 'prod-sn3', name: 'Protein Bar Chocolate Peanut Butter (4 ct)', brand: 'RXBAR', price: 1099, aisleNumber: '11', aisleDescription: 'Protein Bars', calories: 210, protein: 12, carbs: 24, fat: 9, keywords: ['protein bar', 'bar', 'snack bar', 'rxbar', 'peanut butter bar'] },

  // ── Beverages ─────────────────────────────────────────────────────────────
  { productId: 'prod-bv1', name: 'Sparkling Water Lime (12 ct)', brand: 'LaCroix', price: 599, aisleNumber: '15', aisleDescription: 'Beverages', calories: 0, protein: 0, carbs: 0, fat: 0, keywords: ['sparkling water', 'water', 'seltzer', 'lacroix'] },
  { productId: 'prod-bv2', name: 'Orange Juice 100% (52 fl oz)', brand: "Tropicana", price: 549, aisleNumber: '15', aisleDescription: 'Beverages', calories: 110, protein: 2, carbs: 26, fat: 0, keywords: ['orange juice', 'oj', 'juice', 'tropicana'] },
  { productId: 'prod-bv3', name: 'Coffee Ground Medium Roast (12 oz)', brand: 'Folgers', price: 899, aisleNumber: '15', aisleDescription: 'Coffee & Tea', calories: 0, protein: 0, carbs: 0, fat: 0, keywords: ['coffee', 'ground coffee', 'folgers', 'medium roast'] },
]

function getMockProducts(term) {
  const words = term.toLowerCase().trim().split(/\s+/)
  return MOCK_PRODUCTS.filter((p) => {
    const searchable = [p.name, p.brand, ...(p.keywords ?? [])].join(' ').toLowerCase()
    // Every word in the search must appear somewhere in the searchable text
    return words.every((word) => searchable.includes(word))
  })
}

function getMockStores(zip) {
  const trimmed = zip.trim()
  return MOCK_STORES[trimmed] ?? DEFAULT_MOCK_STORES
}

// ─── Kroger OAuth token (with fallback to mock mode on failure) ───────────────

let tokenCache = { token: null, expiresAt: 0 }
let useMockData = false  // set true permanently once credentials fail

async function getToken() {
  if (useMockData) throw new Error('mock mode')

  const now = Date.now()
  if (tokenCache.token && tokenCache.expiresAt - now > 60_000) {
    return tokenCache.token
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${KROGER_BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!res.ok) {
    useMockData = true
    console.warn(`⚠️  Kroger credentials invalid — switching to mock data mode.`)
    console.warn(`   To use live data: update CLIENT_ID/CLIENT_SECRET in server.js`)
    console.warn(`   Get credentials at: https://developer.kroger.com`)
    throw new Error('mock mode')
  }

  const data = await res.json()
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }
  return tokenCache.token
}

// ─── Express ──────────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/api', async (req, res) => {
  const path = req.url  // e.g. /locations?filter.zipCode=60035

  // ── Mock mode: intercept before touching Kroger ──
  if (useMockData) {
    return serveMock(path, res)
  }

  const attemptRequest = async (isRetry = false) => {
    let token
    try {
      token = await getToken()
    } catch {
      // getToken set useMockData=true; fall through to mock
      return serveMock(path, res)
    }

    let krogerRes
    try {
      krogerRes = await fetch(`${KROGER_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (err) {
      return res.status(502).json({ error: 'Kroger request failed', detail: err.message })
    }

    if (krogerRes.status === 401 && !isRetry) {
      tokenCache = { token: null, expiresAt: 0 }
      return attemptRequest(true)
    }

    // If still unauthorized after retry, fall back to mock
    if (krogerRes.status === 401) {
      useMockData = true
      return serveMock(path, res)
    }

    const body = await krogerRes.text()
    res.status(krogerRes.status)
    res.setHeader('Content-Type', krogerRes.headers.get('content-type') || 'application/json')
    res.send(body)
  }

  await attemptRequest()
})

// ─── Mock response builder ────────────────────────────────────────────────────

function serveMock(path, res) {
  const url = new URL(`http://x${path}`)

  if (path.startsWith('/locations')) {
    const zip = url.searchParams.get('filter.zipCode') ?? ''
    const stores = getMockStores(zip)
    // Mimic Kroger /locations response shape
    return res.json({
      data: stores.map((s) => ({
        locationId: s.locationId,
        name: s.name,
        address: {
          addressLine1: s.address.split(',')[0]?.trim() ?? '',
          city: s.address.split(',')[1]?.trim() ?? '',
          state: s.address.split(',')[2]?.trim().split(' ')[0] ?? '',
          zipCode: s.address.split(',')[2]?.trim().split(' ')[1] ?? '',
        },
      })),
    })
  }

  if (path.startsWith('/products')) {
    const term = url.searchParams.get('filter.term') ?? ''
    const products = getMockProducts(term)
    // Mimic Kroger /products response shape
    return res.json({
      data: products.map((p) => ({
        productId: p.productId,
        description: p.name,
        brand: p.brand,
        images: [],
        aisleLocations: p.aisleNumber
          ? [{ number: p.aisleNumber, description: p.aisleDescription }]
          : [],
        items: [
          {
            price: { regular: p.price / 100 },
            nutrition: {
              facts: [
                { name: 'Calories', amount: p.calories },
                { name: 'Protein', amount: p.protein },
                { name: 'Total Carbohydrate', amount: p.carbs },
                { name: 'Total Fat', amount: p.fat },
              ],
            },
          },
        ],
      })),
    })
  }

  res.status(404).json({ error: 'Unknown mock endpoint' })
}

app.listen(PORT, () => {
  console.log(`Cartly proxy running on http://localhost:${PORT}`)
})
