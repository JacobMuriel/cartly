# AisleMap — Vision & Strategy Context

## What this is

This document captures the product vision, strategic analysis, and business plan for AisleMap. Use it as context when working on any part of the product — technical, design, or strategic.

---

## The core vision

**AisleMap is a household utility, not an app people need to be tricked into using.** It should feel like Google Maps: you open it because it's the best tool for the job, you use it, you close it. No gamification, no streaks, no manipulation.

**The mission:** Help people eat well and spend less. Free. Forever. No premium tier, no paywalled features, no dark patterns.

**The one feature nobody has built:** "Your Kroger cart this week: $87.34 · 148g protein · under budget by $12." Exact total, exact macros, before you leave the house. Every competitor has half of this sentence. Nobody has the whole thing.

**The tagline:** *If it's not on AisleMap, you overpaid.*

---

## Founder's stated priorities

- Free, always. Money is nice but must never get in the way of the product.
- Anti-addictive by design — retention comes from being genuinely useful, not from psychological tricks.
- Should feel this easy: "Hey Siri, add peanut butter to AisleMap" — even while standing in the store.
- Pissing off MFP and others who charge $80/year for a barcode scanner is fine. That's the point.
- Fully customizable without being overwhelming — don't shove features in everyone's face.
- Patent everything defensible, then eventually sell to stores/platforms.
- Use Reddit community data to understand what people actually want.

---

## The problem being solved

Current workflow for a typical macro-tracking user: MyFitnessPal (tracking) + Pinterest/blogs (recipes) + Notes app (grocery list) + store app (prices). Four apps, no integration, constant data loss at every handoff.

Existing apps fall into three isolated silos that have never been connected:
- Nutrition trackers (MyFitnessPal, Cronometer, Lose It!)
- Grocery/meal planners (AnyList, Mealime, Plan to Eat)
- Deal/commerce platforms (Ibotta, Flipp, store apps)

**MyFitnessPal** is the clearest enemy: 280M registered users, but they paywalled the barcode scanner at $79.99/year and the AI meal planner at $99.99/year. Users are furious and actively looking for alternatives.

**Jewel-Osco** (and Walmart, Kroger, Albertsons) have surprisingly good apps — shoppable recipes, nutrition info, aisle locations, AI search. The key difference: they're walled gardens locked to one chain. They optimize for the store's interests, not the shopper's. AisleMap is store-neutral by principle — that's structurally impossible for any retailer to copy.

---

## Target users

**Budget-conscious families (25–45, $40K–$80K household income):** Want to eat healthy without overspending. SNAP/EBT integration is a major underserved need here — nobody has built this well.

**College students:** Digital-native, poorly served by family-oriented apps, high virality potential (apps spread campus-to-campus). Lower monetization but important for growth phase.

**Gym-goers / macro trackers:** Already track food, already frustrated with MFP's paywall, highly vocal communities on Reddit and social. Easiest to reach, highest intent.

**The passive user (important):** People who don't think about apps like this because they don't want to pay or do extra work. AisleMap needs to be so frictionless that it works for them too.

---

## Features

### Phase 1 — Ship it (months 1–3)
- Smart shopping list with voice input ("Hey Siri, add peanut butter to AisleMap")
- Aisle map — in-store mode, items sorted by aisle number at your specific store
- Free barcode scanner for nutrition — no paywall, ever
- Live prices via Kroger API, cart total visible always
- Onboarding: one question ("what do you use this for?"), AI surfaces the right feature set per persona. Don't overwhelm people who just want a list.

### Phase 2 — Viral features (months 3–6)
- Shared grocery lists with real-time sync (couples, roommates) — this is necessity-driven virality
- Manual home inventory: "I have: chicken, rice, spinach" → AI suggests meals from what you have
- Meal planner → auto-generated grocery list mapped to real products + real prices
- SNAP-eligible item filter — major differentiator for most underserved users
- Transparent cashback offers alongside store brand alternatives

### Phase 3 — The moat (months 6–12)
- AI meal optimizer: multi-constraint (macros + budget + what's on sale + pantry items). This is the technically hard thing nobody else has.
- Instacart Developer Platform integration for multi-retailer coverage (Jewel, Target, Aldi, etc.)
- Pantry photo scan (after manual inventory is stable and trusted)
- "I just used these" logging → inventory auto-updates, suggestions improve over time
- User feature request queue — Reddit-style upvoting, AI triages, founder decides

### Customization philosophy
- Never shove customization at users — ask once during onboarding, set the right defaults
- College student sees: budget tracker + simple list
- Macro tracker sees: nutrition dashboard + macro targets
- Family sees: meal planner + shared list + SNAP filter
- Same app underneath, personalized surface area on top
- Store-level customization too — works at Jewel, Kroger, Target, Aldi — so stores want to partner rather than block

---

## Real risks and honest responses

**"Jewel and Walmart already do a lot of this."**
True — they're better than most people realize. But they're locked to one chain, they optimize for their own sales (delivery, store brands, promotions), and none of them combine macros + price totals + store neutrality into one product. The white space is narrower than the original research suggested but it still exists.

**"The ingredient-to-SKU mapping is brutally hard."**
"2 boneless chicken breasts" → exact product at your Kroger with today's price is an NLP + data pipeline problem. Getting it wrong breaks trust fast. Start with explicit product selection, don't auto-infer everything. User corrections become the training data that builds the moat.

**"Free + no ads = what's the business model?"**
Ibotta-style transparent cashback. Brands pay per verified redemption (~$1/redemption). The key rule: never hide the cheaper option. Show "Tyson has $1.50 cashback" alongside "store brand saves $2.10 more" — user chooses. Grocery delivery affiliate fees (Instacart, $2–10 per new customer) for users who opt into delivery. Never push delivery over in-store. Never recommend a product because it pays more.

**"Home inventory via photo is harder than it sounds."**
True. Bad lighting, partial labels, occlusion = garbage output = broken trust. Don't launch this in phase 1. Manual inventory ("I have: chicken, rice, spinach") is fast enough and reliable. Photo scan is phase 3 once the core is trusted.

**"Patenting 'the combination of features' won't hold up."**
Software patents on feature combinations are expensive and hard to enforce. Patent the specific technical innovations: the multi-constraint meal optimization algorithm, novel UI patterns in the pantry-to-cart workflow. The real moat is the proprietary user data graph — purchase history + preference data + home inventory patterns. That's inimitable without being on the consumer side.

**"SNAP integration is complicated."**
Correct — SNAP-eligible filtering requires knowing exactly which product categories qualify. Phase 2 or 3 feature. Worth building because nobody has done it well and it serves the most underserved demographic.

---

## Business model (free user, brands pay)

**Primary: Transparent CPG cashback**
Join Ibotta Performance Network as a publisher. Brands pay ~$1 per verified redemption. Surface offers next to (not instead of) store brand alternatives. User always sees the full picture.

**Secondary: Grocery affiliate commissions**
Users who want delivery can order through the app. Earn $2–10 per new Instacart customer referred. Optional — the app works identically for in-store shoppers. Never push delivery over in-store.

**Long-term: B2B data licensing**
After 500K+ users, sell aggregated (never individual) shopping behavior data to regional grocers. "Here's what your shoppers in zip 60657 are price-sensitive about this month." No individual user data ever sold.

**Exit path: Patent + acquisition**
File patents on the multi-constraint optimizer and novel UI patterns. Target acquirers: major grocery chains wanting consumer-side data, health platforms (insurance, nutrition), or a company like Instacart wanting neutral consumer trust.

**Revenue estimates:**
- 100K MAU (year 1): ~$800K–$1.5M/yr
- 500K MAU (year 2): ~$4M–$7.5M/yr
- 1M MAU (year 3): ~$8M–$20M/yr
- Honey comparison: $4B acquisition at 17M users, same basic mechanic (affiliate/cashback at point of purchase decision)

**What never happens:** No subscription. No premium tier. No interrupting ads. No selling individual user data. No steering users toward sponsored products without full transparency.

---

## Go-to-market

**Not paid influencers — Reddit seeding.** Post the app as a genuine solution to real threads in:
- r/EatCheapAndHealthy (3.7M members)
- r/mealprepsunday (1.5M)
- r/personalfinance
- r/SNAP

Don't advertise. Be helpful. Let the product earn word-of-mouth.

**The necessity-driven viral loop:** Shared grocery lists require both people to have the app. Couples and roommates are the natural K-factor. Make "invite your partner" a core onboarding step.

**The shareable moment:** The weekly summary card — "$84 · 7 dinners · 145g protein avg" — should be clean enough that people screenshot it without being asked. That's the organic TikTok/Instagram content.

**The Siri hook:** Promote "Hey Siri, add [item] to AisleMap" heavily in early marketing. It's a genuine differentiator and it's demonstrable in 5 seconds.

---

## The real moat

Not the features — any well-funded team can copy features. The moat is the **proprietary food-price-nutrition graph**: what users buy, at which stores, at what price, against what nutritional outcome, from what pantry starting point, over time.

Instacart has the commerce data but not the health data. MyFitnessPal has the nutrition data but not the commerce data. Only AisleMap sits at the intersection — and only because it has the home inventory loop that neither competitor has incentive to build.

Every "I just used these" log, every pantry scan, every week of meal planning deepens this dataset in a way that compounds. After six months of use, AisleMap knows a household's true consumption patterns, real budget elasticity, and taste preferences better than any survey could capture. That's the asset that gets acquired.

---

## Key API integrations

1. **Instacart Developer Platform** — richest product catalog (1B+ items, 85K stores), real-time pricing, multi-retailer. Highest priority partnership.
2. **Kroger API** — launch-day real pricing and aisle data at 2,800 stores. Most developer-friendly grocery API.
3. **Ibotta Performance Network** — CPG cashback revenue without charging users.
4. **Spoonacular API** — recipe-nutrition data backbone, ingredient-to-product mapping.

---

## What to avoid

- Gamification (streaks, badges, daily challenges) — retention from quality, not manipulation
- Overwhelming users with features — persona-based onboarding, progressive disclosure
- Pushing delivery over in-store shopping
- Hiding cheaper store-brand alternatives behind sponsored products
- Any paywall on any core feature
- Making the app feel like it wants something from the user
