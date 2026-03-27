import { Package, Search, CalendarDays, ShoppingCart } from 'lucide-react'

const tabs = [
  { id: 'pantry', label: 'Pantry',  Icon: Package },
  { id: 'search', label: 'Search',  Icon: Search },
  { id: 'plan',   label: 'Plan',    Icon: CalendarDays },
  { id: 'cart',   label: 'Cart',    Icon: ShoppingCart },
]

const ACTIVE_COLOR   = '#5C6E2E'
const INACTIVE_COLOR = '#9CA3AF'
const BADGE_BG       = '#5C6E2E'

export default function BottomNav({ active, onSelect, cartCount }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white flex z-50"
      style={{
        borderTop: '1px solid #E8E4DC',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        const showBadge = id === 'cart' && cartCount > 0
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} color={color} />
              {showBadge && (
                <span
                  className="absolute -top-1.5 -right-2 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
                  style={{ backgroundColor: BADGE_BG }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
