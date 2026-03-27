import { useState } from 'react'
import { Search, MapPin, ChevronRight, Loader2 } from 'lucide-react'
import { searchStores } from '../services/krogerApi'

const OLIVE = '#5C6E2E'
const OLIVE_LIGHT = '#F0F3E8'

export default function StorePickerScreen({ selectedStore, onSelectStore }) {
  const [zip, setZip] = useState('')
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    const trimmed = zip.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setStores([])
    setSearched(true)
    try {
      const results = await searchStores(trimmed)
      setStores(results)
    } catch (err) {
      setError('Could not load stores. Make sure the proxy server is running.')
    } finally {
      setLoading(false)
    }
  }

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
          Choose a Store
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
          Find a Kroger near you
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {/* Search form */}
        <div
          className="rounded-[14px] p-4 mb-4"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: '#2C2A24' }}>
            Search by zip code
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="Enter zip code"
              maxLength={5}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{
                border: '1px solid #E8E4DC',
                backgroundColor: '#FAFAF8',
                color: '#2C2A24',
              }}
              onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${OLIVE}40`)}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
            />
            <button
              type="submit"
              disabled={loading || zip.trim().length < 5}
              className="rounded-xl px-4 py-2.5 flex items-center gap-1.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform text-white"
              style={{ backgroundColor: OLIVE }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Searching' : 'Search'}
            </button>
          </form>
          <p className="text-xs mt-2" style={{ color: '#A09880' }}>
            Try 60035 (Chicago) or 30301 (Atlanta)
          </p>
        </div>

        {/* Currently selected store */}
        {selectedStore && (
          <div
            className="rounded-[14px] p-4 mb-4 flex items-start gap-3"
            style={{ backgroundColor: OLIVE_LIGHT, border: `1px solid ${OLIVE}30` }}
          >
            <div
              className="rounded-full p-1.5 mt-0.5 shrink-0"
              style={{ backgroundColor: OLIVE }}
            >
              <MapPin size={14} color="#FFFFFF" />
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: OLIVE }}
              >
                Selected store
              </p>
              <p className="text-sm font-semibold truncate" style={{ color: '#2C2A24' }}>
                {selectedStore.name}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6B6560' }}>
                {selectedStore.address}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-[14px] p-4 mb-4"
            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {stores.length > 0 && (
          <div className="space-y-2">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.1em] px-1"
              style={{ color: '#A09880' }}
            >
              {stores.length} store{stores.length !== 1 ? 's' : ''} found
            </p>
            {stores.map((store) => {
              const isSelected = selectedStore?.locationId === store.locationId
              return (
                <button
                  key={store.locationId}
                  onClick={() => onSelectStore(store)}
                  className="w-full text-left rounded-[14px] p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: isSelected ? `2px solid ${OLIVE}` : '1px solid #E8E4DC',
                  }}
                >
                  <div
                    className="rounded-full p-2 shrink-0"
                    style={{ backgroundColor: isSelected ? OLIVE : '#F5F4F0' }}
                  >
                    <MapPin
                      size={16}
                      color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#2C2A24' }}>
                      {store.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#A09880' }}>
                      {store.address}
                    </p>
                  </div>
                  {isSelected ? (
                    <span className="text-xs font-semibold shrink-0" style={{ color: OLIVE }}>
                      Selected
                    </span>
                  ) : (
                    <ChevronRight size={16} color="#C8C2B8" className="shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && stores.length === 0 && !error && (
          <div className="text-center py-12">
            <MapPin size={40} className="mx-auto mb-3" style={{ color: '#D1CBC0' }} />
            <p className="text-sm font-medium" style={{ color: '#6B6560' }}>No stores found</p>
            <p className="text-xs mt-1" style={{ color: '#A09880' }}>Try a different zip code</p>
          </div>
        )}
      </div>
    </div>
  )
}
