import { useState } from 'react'
import BottomNav from './components/BottomNav'
import PantryScreen from './components/PantryScreen'
import StorePickerScreen from './components/StorePickerScreen'
import SearchScreen from './components/SearchScreen'
import CartScreen from './components/CartScreen'
import PlanScreen from './components/PlanScreen'

export default function App() {
  const [activeTab, setActiveTab] = useState('pantry')
  const [selectedStore, setSelectedStore] = useState(null)
  const [cart, setCart] = useState([])

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
    pantry: <PantryScreen />,
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
    plan: <PlanScreen />,
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
