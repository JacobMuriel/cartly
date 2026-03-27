import { Map, ImageOff, AlertCircle } from 'lucide-react'

function formatPrice(cents) {
  if (cents == null) return '$—'
  return `$${(cents / 100).toFixed(2)}`
}

export default function AisleMapScreen({ cart }) {
  // Separate items with and without aisle info
  const withAisle = cart.filter((item) => item.aisleNumber != null)
  const withoutAisle = cart.filter((item) => item.aisleNumber == null)

  // Group by aisle number, sorted numerically
  const aisleGroups = withAisle.reduce((acc, item) => {
    const key = item.aisleNumber
    if (!acc[key]) {
      acc[key] = { number: item.aisleNumber, description: item.aisleDescription, items: [] }
    }
    acc[key].items.push(item)
    return acc
  }, {})

  const sortedAisles = Object.values(aisleGroups).sort((a, b) => {
    const numA = parseFloat(a.number)
    const numB = parseFloat(b.number)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return String(a.number).localeCompare(String(b.number))
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-600 pt-12 pb-4 px-4">
        <h1 className="text-white text-xl font-bold">Aisle Map</h1>
        <p className="text-green-100 text-xs mt-0.5">
          {cart.length === 0
            ? 'No items in cart'
            : `${cart.length} product${cart.length !== 1 ? 's' : ''} across ${sortedAisles.length} aisle${sortedAisles.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 py-3 space-y-3">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <Map size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No items to map</p>
            <p className="text-gray-400 text-xs mt-1">Add items to your cart first</p>
          </div>
        ) : (
          <>
            {/* Aisle groups */}
            {sortedAisles.map((group) => (
              <div key={group.number} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Aisle header */}
                <div className="bg-green-50 px-4 py-2.5 flex items-center gap-2 border-b border-green-100">
                  <div className="bg-green-600 rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{group.number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">Aisle {group.number}</p>
                    {group.description && (
                      <p className="text-xs text-green-600">{group.description}</p>
                    )}
                  </div>
                  <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 rounded-full px-2 py-0.5">
                    {group.items.reduce((s, i) => s + i.quantity, 0)} item{group.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items in this aisle */}
                <div className="divide-y divide-gray-50">
                  {group.items.map((item) => (
                    <div key={item.productId} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                          />
                        ) : null}
                        <div className={`w-full h-full items-center justify-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
                          <ImageOff size={14} className="text-gray-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        {item.brand && (
                          <p className="text-[10px] text-gray-400 truncate">{item.brand}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-[10px] text-gray-400">qty {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Items without aisle data */}
            {withoutAisle.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                  <AlertCircle size={16} className="text-gray-400 shrink-0" />
                  <p className="text-sm font-semibold text-gray-500">No aisle data</p>
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {withoutAisle.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {withoutAisle.map((item) => (
                    <div key={item.productId} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                          />
                        ) : null}
                        <div className={`w-full h-full items-center justify-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
                          <ImageOff size={14} className="text-gray-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        {item.brand && (
                          <p className="text-[10px] text-gray-400 truncate">{item.brand}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-[10px] text-gray-400">qty {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
