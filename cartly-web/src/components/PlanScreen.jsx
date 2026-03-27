import { useState } from 'react'
import { Sparkles, RefreshCw, X } from 'lucide-react'
import { callOpenAI } from '../services/openaiApi'

const SYSTEM_PROMPT =
  `You are a meal suggestion assistant for a grocery app called Cartly. ` +
  `The user's top priority is HIGH PROTEIN — every single meal suggestion must have meaningful protein content. ` +
  `Rank meals from best to least recommended, weighting protein content heavily. ` +
  `Suggest ~10-12 meal ideas (mix of breakfast, lunch, dinner, snack — all high protein). ` +
  `Each meal must fall into one of three categories:\n` +
  `  "pantry_only"       — can be made entirely from the user's pantry items\n` +
  `  "pantry_plus"       — main ingredients are in the pantry; optionalIngredients lists extras that would improve the dish but are NOT required\n` +
  `  "needs_ingredients" — requires one or more items NOT in the pantry; requiredIngredients lists what must be bought\n\n` +
  `Return a JSON object with this exact shape (no markdown, no extra text):\n` +
  `{\n` +
  `  "options": [\n` +
  `    {\n` +
  `      "name": "string",\n` +
  `      "mealType": "breakfast" | "lunch" | "dinner" | "snack",\n` +
  `      "category": "pantry_only" | "pantry_plus" | "needs_ingredients",\n` +
  `      "instructions": "string (3-5 numbered steps, plain text)",\n` +
  `      "pantryUsed": ["string"],\n` +
  `      "optionalIngredients": ["string"],\n` +
  `      "requiredIngredients": ["string"],\n` +
  `      "calories": 0,\n` +
  `      "protein": 0,\n` +
  `      "carbs": 0,\n` +
  `      "fat": 0,\n` +
  `      "estimatedCost": 0\n` +
  `    }\n` +
  `  ]\n` +
  `}`

const CATEGORY_META = {
  pantry_only: {
    label: 'Current Pantry Has All Ingredients',
    tagBg: '#DCFCE7',
    tagColor: '#166534',
    headerBg: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  pantry_plus: {
    label: 'Pantry + Optional Extras',
    tagBg: '#FEF9C3',
    tagColor: '#713F12',
    headerBg: '#FEFCE8',
    borderColor: '#FDE68A',
  },
  needs_ingredients: {
    label: 'Needs Ingredients',
    tagBg: '#FEE2E2',
    tagColor: '#991B1B',
    headerBg: '#FFF5F5',
    borderColor: '#FECACA',
  },
}

// Modal shown when a card is tapped
function MealModal({ option, onClose }) {
  const meta = CATEGORY_META[option.category] ?? CATEGORY_META.needs_ingredients

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      {/* Sheet — stop propagation so tapping inside doesn't close */}
      <div
        className="w-full max-h-[85dvh] overflow-y-auto rounded-t-[24px] pb-10"
        style={{ backgroundColor: '#FAFAF8' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#D4CDC2' }} />
        </div>

        {/* Header band */}
        <div
          className="px-5 pt-3 pb-4"
          style={{ backgroundColor: meta.headerBg, borderBottom: `1px solid ${meta.borderColor}` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold leading-snug" style={{ color: '#2C2A24' }}>
                {option.name}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#E8E4DC', color: '#6B6455' }}
                >
                  {option.mealType}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: meta.tagBg, color: meta.tagColor }}
                >
                  {meta.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
              style={{ backgroundColor: '#E8E4DC' }}
            >
              <X size={14} style={{ color: '#6B6455' }} />
            </button>
          </div>

          {/* Macro grid */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Calories', value: option.calories, unit: '' },
              { label: 'Protein',  value: option.protein,  unit: 'g' },
              { label: 'Carbs',    value: option.carbs,    unit: 'g' },
              { label: 'Fat',      value: option.fat,      unit: 'g' },
            ].map(({ label, value, unit }) => (
              <div
                key={label}
                className="rounded-[10px] py-2 px-1 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
              >
                <p className="text-[9px] font-medium uppercase tracking-wide mb-0.5" style={{ color: '#A09880' }}>
                  {label}
                </p>
                <p className="text-sm font-bold" style={{ color: '#2C2A24' }}>
                  {value ?? '—'}<span className="text-[10px] font-normal">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pt-4 space-y-4">

          {/* Pantry items used */}
          {option.pantryUsed?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: '#A09880' }}>
                From your pantry
              </p>
              <div className="flex flex-wrap gap-1.5">
                {option.pantryUsed.map(item => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optional extras */}
          {option.optionalIngredients?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: '#A09880' }}>
                Optional — not required, but would improve it
              </p>
              <div className="flex flex-wrap gap-1.5">
                {option.optionalIngredients.map(item => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#FEF9C3', color: '#713F12' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required missing ingredients */}
          {option.requiredIngredients?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: '#A09880' }}>
                You'll need to buy
              </p>
              <div className="flex flex-wrap gap-1.5">
                {option.requiredIngredients.map(item => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#E8E4DC' }} />

          {/* Instructions */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: '#A09880' }}>
              How to make it
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#2C2A24' }}>
              {option.instructions}
            </p>
          </div>

          {option.estimatedCost > 0 && (
            <p className="text-xs" style={{ color: '#A09880' }}>
              Estimated cost: ~${Number(option.estimatedCost).toFixed(2)}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}

function MealCard({ option, rank, onTap }) {
  const meta = CATEGORY_META[option.category] ?? CATEGORY_META.needs_ingredients

  return (
    <button
      onClick={onTap}
      className="w-full text-left rounded-[14px] mb-3 overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${meta.borderColor}` }}
    >
      <div className="px-4 py-3 flex items-start gap-3" style={{ backgroundColor: meta.headerBg }}>
        {/* Rank badge */}
        <span
          className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ backgroundColor: '#E8E4DC', color: '#A09880' }}
        >
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          {/* Name + category tag */}
          <div className="flex items-start gap-2 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: '#2C2A24' }}>
              {option.name}
            </p>
          </div>
          <span
            className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: meta.tagBg, color: meta.tagColor }}
          >
            {meta.label}
          </span>

          {/* Macros row */}
          <div className="flex gap-3 mt-2">
            {[
              { label: 'Cal',     value: option.calories, unit: '' },
              { label: 'Protein', value: option.protein,  unit: 'g' },
              { label: 'Carbs',   value: option.carbs,    unit: 'g' },
              { label: 'Fat',     value: option.fat,      unit: 'g' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="text-center">
                <p className="text-[9px]" style={{ color: '#A09880' }}>{label}</p>
                <p className="text-xs font-bold" style={{ color: '#2C2A24' }}>
                  {value ?? '—'}{unit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Meal type pill — right side */}
        <span
          className="shrink-0 text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full tracking-wide mt-0.5"
          style={{ backgroundColor: '#E8E4DC', color: '#6B6455' }}
        >
          {option.mealType}
        </span>
      </div>
    </button>
  )
}

export default function PlanScreen({ pantry }) {
  const [options, setOptions] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  const pantryItemNames = pantry?.flatMap(g => g.items.map(i => i.name)) ?? []

  async function generateOptions() {
    setIsGenerating(true)
    setError(null)
    setSelected(null)

    const userPrompt =
      `My pantry currently has: ${pantryItemNames.length > 0 ? pantryItemNames.join(', ') : 'nothing yet'}.\n\n` +
      `Suggest high-protein meal options I could make. Every suggestion must have solid protein content. ` +
      `Rank them from best to least recommended (protein content is the top factor). ` +
      `Include a mix of pantry-only meals, meals that work with optional additions, and meals that need extra ingredients.`

    try {
      const raw = await callOpenAI(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        0.7
      )
      const parsed = JSON.parse(raw)
      setOptions(parsed.options ?? [])
    } catch (err) {
      setError(err.message ?? 'Something went wrong generating meal options.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-4 border-b"
        style={{ backgroundColor: '#FAFAF8', borderColor: '#E8E4DC' }}
      >
        <h1
          className="leading-tight"
          style={{ color: '#2C2A24', fontSize: '1.375rem', fontWeight: 600 }}
        >
          Meal Ideas
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
          High-protein suggestions ranked by your pantry
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Legend */}
        <div
          className="rounded-[14px] p-3 mb-4 flex flex-wrap gap-x-4 gap-y-1.5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
        >
          {Object.values(CATEGORY_META).map(meta => (
            <div key={meta.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ backgroundColor: meta.tagBg, border: `1px solid ${meta.borderColor}` }}
              />
              <span className="text-[11px]" style={{ color: '#A09880' }}>{meta.label}</span>
            </div>
          ))}
        </div>

        {/* Generate / regenerate button */}
        <button
          onClick={generateOptions}
          disabled={isGenerating}
          className="w-full rounded-[14px] py-4 flex items-center justify-center gap-2.5 mb-4"
          style={{
            backgroundColor: options ? '#F0F3E8' : '#5C6E2E',
            border: options ? '1px solid #D4DCB8' : 'none',
            opacity: isGenerating ? 0.75 : 1,
          }}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={17} className="animate-spin" style={{ color: options ? '#5C6E2E' : '#FFFFFF' }} />
              <span className="font-semibold text-sm" style={{ color: options ? '#5C6E2E' : '#FFFFFF' }}>
                Finding meal ideas…
              </span>
            </>
          ) : options ? (
            <>
              <RefreshCw size={17} style={{ color: '#5C6E2E' }} />
              <span className="font-semibold text-sm" style={{ color: '#5C6E2E' }}>Regenerate ideas</span>
            </>
          ) : (
            <>
              <Sparkles size={17} className="text-white" />
              <span className="text-white font-semibold text-sm">Generate meal ideas</span>
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div
            className="rounded-[14px] p-4 mb-4"
            style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>Couldn't generate ideas</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#B91C1C' }}>{error}</p>
          </div>
        )}

        {options?.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: '#A09880' }}>No options returned — try again.</p>
        )}

        {options?.map((option, i) => (
          <MealCard
            key={`${option.name}-${i}`}
            option={option}
            rank={i + 1}
            onTap={() => setSelected(option)}
          />
        ))}

      </div>

      {/* Modal */}
      {selected && <MealModal option={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
