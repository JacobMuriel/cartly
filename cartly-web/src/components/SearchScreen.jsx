import { useState } from 'react'
import { Search, Plus, Check, Loader2, MapPin, ImageOff } from 'lucide-react'
import { searchProducts } from '../services/krogerApi'

const OLIVE = '#5C6E2E'
const OLIVE_LIGHT = '#F0F3E8'

function formatPrice(cents) {
  if (cents == null) return 'N/A'
  return `$${(cents / 100).toFixed(2)}`
}

function ProductCard({ product, inCart, onAdd }) {
  return (
    <div
      className="rounded-[14px] p-3 flex gap-3"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
    >
      {/* Image */}
      <div
        className="w-16 h-16 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: '#F5F4F0' }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div className={`w-full h-full items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
          <ImageOff size={20} className="text-gray-300" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {product.brand ? (
          <p
            className="text-[10px] font-semibold uppercase tracking-wide truncate"
            style={{ color: OLIVE }}
          >
            {product.brand}
          </p>
        ) : null}
        <p className="text-sm font-medium leading-tight line-clamp-2" style={{ color: '#2C2A24' }}>
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-base font-bold" style={{ color: '#2C2A24' }}>
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => onAdd(product)}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
            style={
              inCart
                ? { backgroundColor: OLIVE_LIGHT, color: OLIVE }
                : { backgroundColor: OLIVE, color: '#FFFFFF' }
            }
          >
            {inCart ? <Check size={13} /> : <Plus size={13} />}
            {inCart ? 'Added' : 'Add'}
          </button>
        </div>
        {product.calories > 0 && (
          <p className="text-[10px] mt-1" style={{ color: '#A09880' }}>
            {product.calories} cal · {product.protein}g protein · {product.carbs}g carbs · {product.fat}g fat
          </p>
        )}
        {product.aisleNumber && (
          <p className="text-[10px]" style={{ color: '#A09880' }}>Aisle {product.aisleNumber}</p>
        )}
      </div>
    </div>
  )
}

export default function SearchScreen({ selectedStore, cart, onAddToCart, onChangeStore }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || !selectedStore) return
    setLoading(true)
    setError(null)
    setResults([])
    setSearched(true)
    try {
      const products = await searchProducts(trimmed, selectedStore.locationId)
      setResults(products)
    } catch (err) {
      setError('Search failed. Make sure the proxy server is running.')
    } finally {
      setLoading(false)
    }
  }

  const cartIds = new Set(cart.map((item) => item.productId))

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Minimal header */}
      <div
        className="px-4 pt-12 pb-4 border-b"
        style={{ backgroundColor: '#FAFAF8', borderColor: '#E8E4DC' }}
      >
        <h1
          className="leading-tight"
          style={{ color: '#2C2A24', fontSize: '1.375rem', fontWeight: 600 }}
        >
          Search Products
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
          Browse your Kroger store
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Sticky search + store bar */}
        <div
          className="px-4 pt-3 pb-3 sticky top-0 z-10 border-b"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
        >
          {/* Store row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={12} style={{ color: OLIVE, flexShrink: 0 }} />
              <p className="text-xs font-medium truncate" style={{ color: '#2C2A24' }}>
                {selectedStore.name}
              </p>
            </div>
            <button
              onClick={onChangeStore}
              className="text-xs font-semibold shrink-0 ml-2 transition-opacity active:opacity-60"
              style={{ color: OLIVE }}
            >
              Change
            </button>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groceries…"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{
                border: '1px solid #E8E4DC',
                color: '#2C2A24',
                backgroundColor: '#FAFAF8',
              }}
              onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${OLIVE}40`)}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-xl px-4 py-2.5 flex items-center gap-1.5 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: OLIVE, color: '#FFFFFF' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </form>
        </div>

        <div className="px-4 py-3 space-y-2.5">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin" style={{ color: OLIVE }} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-[14px] p-4" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Results */}
          {results.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              inCart={cartIds.has(product.productId)}
              onAdd={onAddToCart}
            />
          ))}

          {/* Empty state after search */}
          {searched && !loading && results.length === 0 && !error && (
            <div className="text-center py-12">
              <Search size={40} className="mx-auto mb-3" style={{ color: '#D1CBC0' }} />
              <p className="text-sm font-medium" style={{ color: '#6B6560' }}>No products found</p>
              <p className="text-xs mt-1" style={{ color: '#A09880' }}>Try a different search term</p>
            </div>
          )}

          {/* Idle state */}
          {!searched && !loading && (
            <div className="text-center py-12">
              <Search size={40} className="mx-auto mb-3" style={{ color: '#D1CBC0' }} />
              <p className="text-sm font-medium" style={{ color: '#6B6560' }}>Search for any grocery item</p>
              <p className="text-xs mt-1" style={{ color: '#A09880' }}>Prices are live from your store</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
