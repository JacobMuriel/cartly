# Cartly — Session Context

## What this app is
**Cartly** is a grocery intelligence platform. Users pick a Kroger store, search real products with live prices, build a cart, track macros and total cost, and see their list sorted by aisle for efficient in-store shopping.

## Two codebases
- **iOS (Swift/SwiftUI)** — original prototype in `/` (Xcode project, iOS 17+, SwiftData)
- **Web demo (React + Express)** — new, in `/cartly-web/` — this is the active demo build

## Web app tech stack
- React 18 (Vite)
- Tailwind CSS
- lucide-react for icons
- Express proxy server (server.js, port 3001) — required because Kroger API blocks direct browser requests (CORS)
- concurrently — runs React + Express together with one command

## Kroger API
- Base URL: https://api.kroger.com/v1
- Client ID: aislemap-bbcdrjyg
- Client Secret: emAJ53MP6mSde3Oy3M0HIvZK925GLazHqSJln3Ef
- Auth: OAuth2 client_credentials, scope: product.compact
- Token cached in memory on the proxy server, refreshed on 401
- All calls go through localhost:3001/api/* → proxy forwards to Kroger

## Screens
1. Store Picker — zip code search → Kroger /locations
2. Search — product search → Kroger /products at selected store
3. Cart / Plan — cart items, macro totals, price total
4. Aisle Map — cart items grouped and sorted by aisle number

## State
All state is in-memory React (useState/useContext). No database, no auth, no persistence yet.

Cart item shape:
{ productId, name, brand, price (cents), imageUrl, quantity, aisleNumber, calories, protein, carbs, fat }

## Run
cd cartly-web
npm install
npm run dev
→ React on :3000, Express proxy on :3001

## Next steps
- Add Spoonacular API for recipe-based meal planning
- Add macro entry from barcode scan
- Persist cart to localStorage
- Expand beyond Kroger (Instacart Developer Platform)

## Gotchas
- Kroger prices are in cents — always divide by 100 for display
- Aisle numbers come from Kroger product location data — not always populated
- Token scope must be "product.compact" — other scopes require user OAuth
- Demo zip that reliably returns Kroger stores: 60035 (Chicago suburbs) or 30301 (Atlanta)
