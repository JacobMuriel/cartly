import { Minus, Plus, Trash2, ShoppingCart, ImageOff } from 'lucide-react'

const OLIVE = '#5C6E2E'
const OLIVE_LIGHT = '#F0F3E8'

function formatPrice(cents) {
  if (cents == null) return '$—'
  return `$${(cents / 100).toFixed(2)}`
}

function MacroPill({ label, value, unit, bg }) {
  return (
    <div
      className="flex-1 rounded-[14px] p-2.5 text-center"
      style={{ backgroundColor: bg }}
    >
      <p className="text-lg font-bold" style={{ color: '#2C2A24' }}>{Math.round(value)}</p>
      <p className="text-[10px] font-medium leading-tight" style={{ color: '#6B6560' }}>
        {unit}<br />{label}
      </p>
    </div>
  )
}

export default function CartScreen({ cart, onUpdateQuantity, onRemove }) {
  const totalPrice = cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)

  const totalMacros = cart.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories ?? 0) * item.quantity,
      protein:  acc.protein  + (item.protein  ?? 0) * item.quantity,
      carbs:    acc.carbs    + (item.carbs    ?? 0) * item.quantity,
      fat:      acc.fat      + (item.fat      ?? 0) * item.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const hasMacros = cart.some((item) => item.calories > 0)

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

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
          Cart
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
          {cart.length === 0
            ? 'Your cart is empty'
            : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="rounded-full p-6 mx-auto mb-5 w-fit"
              style={{ backgroundColor: '#F5F4F0' }}
            >
              <ShoppingCart size={40} style={{ color: '#C8C2B8' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#6B6560' }}>Your cart is empty</p>
            <p className="text-xs mt-1" style={{ color: '#A09880' }}>
              Search for products to add them here
            </p>
          </div>
        ) : (
          <div className="px-4 py-3 space-y-3">
            {/* Totals card */}
            <div
              className="rounded-[14px] p-4"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: '#6B6560' }}>Total</p>
                <p className="text-2xl font-bold" style={{ color: '#2C2A24' }}>
                  {formatPrice(totalPrice)}
                </p>
              </div>

              {hasMacros && (
                <>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: '#A09880' }}
                  >
                    Macros per serving
                  </p>
                  <div className="flex gap-2">
                    <MacroPill label="Calories" value={totalMacros.calories} unit="kcal" bg="#FFF7ED" />
                    <MacroPill label="Protein"  value={totalMacros.protein}  unit="g"    bg="#EFF6FF" />
                    <MacroPill label="Carbs"    value={totalMacros.carbs}    unit="g"    bg="#FEFCE8" />
                    <MacroPill label="Fat"      value={totalMacros.fat}      unit="g"    bg="#FFF1F2" />
                  </div>
                </>
              )}
            </div>

            {/* Section label */}
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.1em] px-1"
              style={{ color: '#A09880' }}
            >
              Items
            </p>

            {/* Cart items */}
            {cart.map((item) => (
              <div
                key={item.productId}
                className="rounded-[14px] p-3 flex gap-3"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
              >
                {/* Image */}
                <div
                  className="w-14 h-14 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: '#F5F4F0' }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                  ) : null}
                  <div className={`w-full h-full items-center justify-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
                    <ImageOff size={18} className="text-gray-300" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {item.brand ? (
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wide truncate"
                      style={{ color: OLIVE }}
                    >
                      {item.brand}
                    </p>
                  ) : null}
                  <p className="text-sm font-medium leading-tight line-clamp-2" style={{ color: '#2C2A24' }}>
                    {item.name}
                  </p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#2C2A24' }}>
                    {formatPrice(item.price)}
                    {item.quantity > 1 && (
                      <span className="text-xs font-normal ml-1" style={{ color: '#A09880' }}>
                        × {item.quantity} = {formatPrice(item.price * item.quantity)}
                      </span>
                    )}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div
                      className="flex items-center gap-2 rounded-xl p-1"
                      style={{ backgroundColor: '#F5F4F0' }}
                    >
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm active:scale-90 transition-transform"
                        style={{ color: '#6B6560' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold" style={{ color: '#2C2A24' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg shadow-sm text-white active:scale-90 transition-transform"
                        style={{ backgroundColor: OLIVE }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(item.productId)}
                      className="p-1.5 rounded-xl transition-all active:scale-90"
                      style={{ color: '#C8C2B8' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C2B8')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
