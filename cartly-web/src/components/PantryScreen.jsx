const PANTRY = [
  {
    category: 'Pantry Staples',
    items: [
      { name: 'Barilla Penne Pasta', amount: 'About ½ box left', status: 'stocked' },
      { name: "Rao's Marinara Sauce", amount: 'About ¼ jar left', status: 'use-soon' },
      { name: 'Olive Oil', amount: 'About ¼ bottle left', status: 'use-soon' },
      { name: 'Garlic Powder', amount: 'Well stocked', status: 'stocked' },
      { name: 'Onion Powder', amount: 'Well stocked', status: 'stocked' },
      { name: 'Smoked Paprika', amount: 'Running low', status: 'low' },
      { name: 'Red Pepper Flakes', amount: 'Well stocked', status: 'stocked' },
      { name: 'Kosher Salt', amount: 'Well stocked', status: 'stocked' },
      { name: 'Black Pepper', amount: 'Running low', status: 'low' },
      { name: 'Chicken Broth', amount: '1 full carton', status: 'stocked' },
      { name: 'Canned Chickpeas', amount: '2 cans', status: 'stocked' },
      { name: 'Jasmine Rice', amount: 'About ⅓ bag left', status: 'low' },
    ],
  },
  {
    category: 'Produce',
    items: [
      { name: 'Baby Spinach', amount: 'Small amount left', status: 'use-soon' },
      { name: 'Cherry Tomatoes', amount: 'Handful left', status: 'use-soon' },
      { name: 'Yellow Onion', amount: '1 left', status: 'low' },
      { name: 'Russet Potatoes', amount: '3 left', status: 'stocked' },
    ],
  },
  {
    category: 'Dairy & Eggs',
    items: [
      { name: 'Eggs', amount: '4 left', status: 'low' },
      { name: 'Parmesan Cheese', amount: 'Small amount left', status: 'use-soon' },
      { name: 'Greek Yogurt', amount: '1 container', status: 'use-soon' },
    ],
  },
  {
    category: 'Frozen',
    items: [
      { name: 'Frozen Broccoli', amount: 'About half a bag', status: 'stocked' },
    ],
  },
]

const STATUS_CONFIG = {
  'use-soon': { label: 'Use soon', bg: '#FEF3C7', color: '#92400E' },
  low:        { label: 'Low',      bg: '#FEE2E2', color: '#991B1B' },
  stocked:    { label: 'Stocked',  bg: '#DCFCE7', color: '#166534' },
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 leading-5"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

export default function PantryScreen() {
  // Count items that need attention (use-soon or low)
  const needsAttention = PANTRY.flatMap(g => g.items).filter(
    i => i.status === 'use-soon' || i.status === 'low'
  ).length

  return (
    <div className="flex flex-col h-full">
      {/* Minimal header — no green bar */}
      <div className="px-4 pt-12 pb-4" style={{ backgroundColor: '#FAFAF8' }}>
        <h1
          className="tracking-tight leading-tight"
          style={{ color: '#2C2A24', fontSize: '1.625rem', fontWeight: 600 }}
        >
          Cartly
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
          Your kitchen, organized
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-24 px-4"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        {/* Summary chip */}
        {needsAttention > 0 && (
          <div
            className="flex items-center gap-2 rounded-[14px] p-3 mb-5 border"
            style={{ backgroundColor: '#FEF9F0', borderColor: '#F0E6CC' }}
          >
            <span className="text-base">⚠️</span>
            <p className="text-xs font-medium" style={{ color: '#92400E' }}>
              {needsAttention} item{needsAttention !== 1 ? 's' : ''} need attention — use soon or running low
            </p>
          </div>
        )}

        {/* Category sections */}
        {PANTRY.map(({ category, items }) => (
          <div key={category} className="mb-6">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.1em] px-1 mb-2"
              style={{ color: '#A09880' }}
            >
              {category}
            </p>
            <div
              className="rounded-[14px] overflow-hidden"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center px-4 py-3 gap-3"
                  style={idx < items.length - 1 ? { borderBottom: '1px solid #F0EDE6' } : {}}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{ color: '#2C2A24' }}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
                      {item.amount}
                    </p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
