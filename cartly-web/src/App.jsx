import { useState } from 'react'
import BottomNav from './components/BottomNav'
import PantryScreen from './components/PantryScreen'
import StorePickerScreen from './components/StorePickerScreen'
import SearchScreen from './components/SearchScreen'
import CartScreen from './components/CartScreen'
import PlanScreen from './components/PlanScreen'

// Pantry lives here so both PantryScreen (voice updates) and PlanScreen
// (meal planner reads inventory) share the same source of truth.
const INITIAL_PANTRY = [
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

export default function App() {
  const [activeTab, setActiveTab] = useState('pantry')
  const [selectedStore, setSelectedStore] = useState(null)
  const [cart, setCart] = useState([])
  const [pantry, setPantry] = useState(INITIAL_PANTRY)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function handleAddToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  function handleUpdateQuantity(productId, newQty) {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId))
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity: newQty } : item
        )
      )
    }
  }

  function handleRemove(productId) {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  function handleSelectStore(store) {
    setSelectedStore(store)
    setActiveTab('search')
  }

  // Called from SearchScreen when user wants to change the selected store
  function handleChangeStore() {
    setSelectedStore(null)
    // Tab stays 'search' — it will now render the store picker
  }

  const screens = {
    pantry: <PantryScreen pantry={pantry} setPantry={setPantry} />,
    // Show store picker if no store selected, otherwise show product search
    search: selectedStore ? (
      <SearchScreen
        selectedStore={selectedStore}
        cart={cart}
        onAddToCart={handleAddToCart}
        onChangeStore={handleChangeStore}
      />
    ) : (
      <StorePickerScreen
        selectedStore={selectedStore}
        onSelectStore={handleSelectStore}
      />
    ),
    plan: (
      <PlanScreen
        pantry={pantry}
      />
    ),
    cart: (
      <CartScreen
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />
    ),
  }

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {screens[activeTab]}
      </div>
      <BottomNav active={activeTab} onSelect={setActiveTab} cartCount={cartCount} />
    </div>
  )
}
