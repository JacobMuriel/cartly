import { CalendarDays } from 'lucide-react'

export default function PlanScreen() {
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
          Meal Plan
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
          Plan your week
        </p>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center pb-24 px-8">
        <div
          className="rounded-full p-6 mb-5"
          style={{ backgroundColor: '#F0F3E8' }}
        >
          <CalendarDays size={40} style={{ color: '#5C6E2E' }} />
        </div>
        <p
          className="text-base font-semibold text-center"
          style={{ color: '#2C2A24' }}
        >
          Meal planning coming soon
        </p>
        <p
          className="text-sm mt-2 text-center leading-relaxed"
          style={{ color: '#A09880' }}
        >
          Build weekly meal plans from your pantry inventory and weekly grocery haul. Smart suggestions based on what's about to expire.
        </p>
      </div>
    </div>
  )
}
