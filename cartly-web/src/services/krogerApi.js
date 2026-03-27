// Relative URL — Vite proxies /api/* to the Express server.
// This works both from desktop browser and from a phone on the same WiFi.
const PROXY_BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function apiFetch(path) {
  const res = await fetch(`${PROXY_BASE}${path}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

/**
 * Search Kroger store locations by zip code.
 * Returns array of { locationId, name, address }
 */
export async function searchStores(zip) {
  const data = await apiFetch(
    `/locations?filter.zipCode=${encodeURIComponent(zip)}&filter.limit=10`
  )
  const locations = data.data ?? []
  return locations.map((loc) => ({
    locationId: loc.locationId,
    name: loc.name,
    address: [
      loc.address?.addressLine1,
      loc.address?.city,
      loc.address?.state,
      loc.address?.zipCode,
    ]
      .filter(Boolean)
      .join(', '),
  }))
}

/**
 * Search Kroger products at a given store.
 * Returns array of cart-item-shaped objects (quantities default to 0).
 */
export async function searchProducts(term, locationId) {
  const data = await apiFetch(
    `/products?filter.term=${encodeURIComponent(term)}&filter.locationId=${locationId}&filter.limit=20`
  )
  const products = data.data ?? []

  return products.map((p) => {
    // Pick the first available item/price
    const item = p.items?.[0] ?? {}
    const priceInfo = item.price ?? {}
    // Kroger returns price as decimal dollars in the price object — convert to cents for storage
    const priceCents = priceInfo.regular != null
      ? Math.round(priceInfo.regular * 100)
      : null

    // Nutrition — may not be present
    const nutrition = p.items?.[0]?.nutrition ?? {}
    const nutrients = nutrition.facts ?? []
    const findNutrient = (name) =>
      nutrients.find((n) => n.name?.toLowerCase().includes(name))?.amount ?? 0

    // Aisle location
    const aisleNumber = p.aisleLocations?.[0]?.number ?? null
    const aisleDescription = p.aisleLocations?.[0]?.description ?? null

    // Images — prefer "medium" front image
    const images = p.images ?? []
    const frontImages = images.find((img) => img.perspective === 'front')
    const imageUrl =
      frontImages?.sizes?.find((s) => s.size === 'medium')?.url ??
      frontImages?.sizes?.[0]?.url ??
      images[0]?.sizes?.[0]?.url ??
      null

    return {
      productId: p.productId,
      name: p.description ?? 'Unknown Product',
      brand: p.brand ?? '',
      price: priceCents,
      imageUrl,
      quantity: 0,
      aisleNumber,
      aisleDescription,
      calories: findNutrient('calorie'),
      protein: findNutrient('protein'),
      carbs: findNutrient('carbohydrate'),
      fat: findNutrient('fat'),
    }
  })
}
