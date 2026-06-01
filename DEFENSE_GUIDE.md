# SustainIQ — Technical Defense Guide & Presentation Script

**Engineered by Engr. Adeleke Ajibola Joshua**
**Platform:** Environmental Intelligence & Sustainable Behavioral Engineering
**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Recharts · React-Leaflet · OpenWeatherMap API

---

## 🌟 1. PROJECT OVERVIEW & THE "WHY"

### What is SustainIQ?

SustainIQ is a high-fidelity environmental intelligence platform engineered to gamify sustainable behavioral engineering at the individual consumer level. It is not a static dashboard — it is a living, reactive system that transforms abstract climate data into personalized, actionable daily habits, rewarding users with a progressive XP-based tier system as their real-world ecological impact accumulates.

### The Core Problem It Solves

The global sustainability crisis is not purely a policy failure — it is a behavioral gap. Governments and research institutions generate enormous volumes of environmental telemetry: air quality indices, carbon emission datasets, water stress indicators. But this data rarely reaches the individual in a format that motivates action.

SustainIQ bridges that gap.

It takes live public climate telemetry — specifically OpenWeatherMap's Weather API and Air Pollution API — and contextualizes it against a user's daily behavioral choices. A resident of Lagos, Nigeria, for example, can open SustainIQ and immediately see:

- The current local Air Quality Index (AQI) for their city, pulled from live satellite-grade sensor data
- How their morning commute choice (public transit vs. private car) directly offsets a measurable quantity of CO₂ in kilograms
- Where the nearest recycling hub, organic market, or solar facility is located on an interactive map
- How their cumulative impact over days and weeks earns them progression through a prestige tier system: Observer → Catalyst → Strategist → Guardian

### Why Lagos as the Default Context?

Lagos is one of the fastest-growing megacities on the African continent, with a population exceeding 15 million and some of the highest urban air pollution readings in West Africa. It represents a high-stakes, real-world use case where environmental intelligence tooling has genuine life-quality implications. SustainIQ defaults its telemetry, map coordinates, and sustainable infrastructure pins to the Lagos metropolitan area, while supporting any global city through its dynamic API layer.

### The Value Proposition in One Sentence

> SustainIQ converts raw environmental telemetry into gamified daily behavioral nudges, making sustainability measurable, rewarding, and personally meaningful for every urban citizen.

---

## 🧬 2. TECHNICAL ARCHITECTURE BREAKDOWN

### 2.1 React State Engine & LocalStorage Persistence Architecture

**File:** `src/context/SustainIQContext.tsx`

The entire application state is managed through a single centralized React Context provider — `SustainIQProvider` — which exposes a custom hook `useSustainIQ()` consumed by every component in the tree. This eliminates prop-drilling entirely and creates a single source of truth for all user data.

**What the context manages:**

| State Slice | Type | Purpose |
|---|---|---|
| `profile` | `UserProfile \| null` | Name, city, eco-focus, onboarding status |
| `stats` | `UserStats` | XP, tier index, CO₂/water/waste totals, streak, habit log |
| `habits` | `HabitItem[]` | Full 16-item habit inventory across 4 categories |
| `currentTier` | `TierInfo` | Active tier object (Observer/Catalyst/Strategist/Guardian) |
| `tierUpModal` | `{ show, tier }` | Controls the animated tier-up overlay modal |
| `isDark` | `boolean` | Global theme state — applies `.dark` class to `<html>` |
| `portfolioMode` | `boolean` | System Inspect Mode for technical tooltip overlays |

**LocalStorage Persistence Layer:**

Every state mutation immediately serializes to `localStorage` under namespaced keys:

```
siq_profile   → UserProfile JSON
siq_stats     → UserStats JSON (includes full habitLog array, badges)
siq_theme     → 'dark' | 'light'
siq_portfolio → boolean
```

On application mount, a `useEffect` hydrates all state from localStorage before the first render. This means the application survives hard browser reloads, tab closures, and system restarts with zero data loss — without requiring any backend database, authentication server, or network connection.

**Badge Engine:**

The `buildBadges()` function runs on every `logHabit()` and `addXP()` call. It evaluates all 8 badge condition functions against the current stats object and stamps `unlockedAt` timestamps on newly qualifying badges. This creates a reactive achievement system that requires no manual trigger.

**Tier Calculation:**

```typescript
const getTierIndex = (xp: number): number => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].minXP) return i;
  }
  return 0;
};
```

Tier boundaries: Observer (0), Catalyst (150), Strategist (450), Guardian (900). When `getTierIndex` returns a higher value than the previous tier index, the animated `TierUpModal` fires automatically.

**Theme System:**

`toggleTheme()` directly manipulates `document.documentElement.classList` — adding or removing the `dark` class — which activates Tailwind CSS's `darkMode: 'class'` strategy across all 300+ `dark:` utility variants in the component tree simultaneously.

---

### 2.2 API Telemetry Layer — Dual-Endpoint Ingestion with Fail-Safe Fallback

**File:** `src/services/api.ts`

The telemetry service is architected around two live OpenWeatherMap API endpoints:

**Endpoint 1 — Current Weather:**
```
GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric
```
Returns: temperature, feels-like, humidity, wind speed, weather condition code, and crucially — the `lat/lon` coordinates needed for the second call.

**Endpoint 2 — Air Pollution (AQI):**
```
GET https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={key}
```
Returns: AQI index (1–5 WHO scale), PM2.5, PM10, NO₂, and O₃ concentrations.

**Environment Variable Safety:**

The API key is accessed exclusively via `import.meta.env.VITE_OPENWEATHER_API_KEY` — Vite's build-time environment variable injection. This means the key is never hardcoded in source, never committed to version control, and is injected at build time by the deployment platform (Vercel environment variables).

**The Fail-Safe Mock Fallback Layer:**

```typescript
if (!apiKey || apiKey.trim() === '' || apiKey === 'your_key_here') {
  return getMockForCity(city);
}
```

Three failure conditions trigger the mock layer:
1. No API key configured (local development without `.env`)
2. Network timeout (AbortController fires after 6 seconds)
3. Non-200 HTTP response from OpenWeatherMap

When mock mode activates, the UI renders a **"Simulated Feeds Active"** badge — a subtle but honest indicator that the data is synthetic. Pre-seeded mock data exists for Lagos, Abuja, London, and New York with realistic temperature, humidity, and AQI values. The application never crashes, never shows empty states, and never exposes API errors to the end user.

---

### 2.3 Advanced Visual Mapping — React-Leaflet with Custom Marker Logic

**File:** `src/components/Map.tsx`

The Eco Infrastructure Map is built on React-Leaflet wrapping Leaflet.js, rendering OpenStreetMap tiles. Eight sustainable infrastructure coordinates are seeded for the Lagos metropolitan area across five asset categories:

| Category | Color | Examples |
|---|---|---|
| Recycling Hub | Blue `#3b82f6` | Wecyclers Lagos Hub, Alimosho Recycling Center |
| Organic Market | Emerald `#10b981` | Tejuosho Organic Market, Ikeja Organic Hub |
| Solar Facility | Amber `#f59e0b` | Lagos Solar Initiative, Eko Solar Park |
| Water Station | Cyan `#06b6d4` | Lekki Water Harvest Station |
| Eco Market | Purple `#8b5cf6` | Balogun Eco Market |

**Custom Marker Logic:**

Each marker is generated via `L.divIcon()` with a CSS teardrop shape (rotated 45° square with border-radius) colored to match its asset category. This replaces Leaflet's default blue pin with a branded, color-coded visual system that communicates asset type at a glance.

**`MapRecenter` Component:**

A lightweight child component uses the `useMap()` hook to imperatively call `map.setView()` whenever the user's city changes — ensuring the map recenters dynamically without remounting the entire `MapContainer`.

**Filter Ribbon:**

A sticky horizontal filter bar above the map allows users to isolate asset types. The `activeFilter` state drives `Array.filter()` on the assets array, and only matching markers are passed to the `MapContainer` render cycle.

---

### 2.4 Analytics Engine — Recharts Data Visualization

**File:** `src/components/Analytics.tsx`

Three chart types visualize different dimensions of user impact:

- **AreaChart** — Plots the last 7 days of impact score and XP earned. Data is computed in `useMemo` by scanning `stats.habitLog` entries against the last 7 calendar dates, aggregating impact as a weighted formula: `co2 × 10 + water × 0.1 + waste × 0.01 + xp`.
- **RadarChart** — Maps performance across 5 eco-disciplines (Carbon, Water, Waste, Streak, Engagement) on a 0–100 normalized scale, giving a visual fingerprint of the user's sustainability profile.
- **BarChart** — Shows habit count per category (Transport, Energy, Waste, Diet) with per-category color coding via Recharts `<Cell>` components.

Chart tooltip styles adapt to the active theme — dark background in dark mode, white in light mode — via the `mkTooltip(isDark)` factory function that reads `isDark` from context.

---

### 2.5 AI Assistant — Domain-Locked Environmental Intelligence

**File:** `src/components/Assistant.tsx`

The AI Assistant is a disciplined, rule-based conversational engine with three hardcoded behavioral constraints:

**Constraint 1 — Creator Attribution:**
Any query matching 25+ creator/origin patterns ("who made you", "who built this", "who are you", etc.) triggers an explicit attribution response crediting **Engr. Adeleke Ajibola Joshua** as the creator of SustainIQ.

**Constraint 2 — Onboarding Welcome:**
The initial message is hardcoded into `useState` initialization — it fires on component mount and states the creator attribution, platform purpose, and three actionable next steps for the user.

**Constraint 3 — Domain Lock:**
Two classifier functions enforce topic boundaries:
- `isExplicitlyOffTopic()` — detects 40+ non-environmental keywords (programming, math, entertainment, cooking, finance)
- `isOnTopic()` — an 80+ keyword allowlist prevents false positives

Off-topic responses render in an amber-tinted bubble with a `ShieldAlert` "Domain restriction applied" badge. The redirect message states: *"I am programmed exclusively to assist you with environmental geography and sustainable development."*

The knowledge base covers 8 deep domains: Carbon & Climate, Hydrology, Waste & Circular Economy, Renewable Energy, Environmental Geography & Ecosystems, Sustainable Food Systems, Air Quality, and the SustainIQ Platform Guide.

---

## 🎙️ 3. STEP-BY-STEP VOICEOVER SCRIPT (CAPCUT TIMELINE READY)

> **Recording Notes:** Speak at a calm, confident pace. Each timestamp is a guideline — adjust to your natural delivery. Screen should be visible and cursor movements should be deliberate and slow.

---

### ⏱️ 0:00 – 0:45 | Onboarding & Dashboard Introduction

**[Screen: Show the Onboarding screen — step 1]**

> "Welcome to SustainIQ — an environmental intelligence platform I engineered to bridge the gap between raw climate data and everyday sustainable action.
>
> When a new user lands on the platform, they're greeted by this glassmorphic onboarding gateway. I'll enter my name here..."

**[Type a name, click Continue]**

> "...then set my city — I'll use Lagos, Nigeria, which is the platform's primary context given its urban air quality challenges..."

**[Type Lagos, click Continue]**

> "...and finally, I select my primary eco-focus. I'll go with Reduce Carbon."

**[Select Reduce Carbon, click Launch Dashboard]**

> "The dashboard loads instantly — no server round-trip, no loading spinner. All state is managed client-side through a centralized React Context engine backed by LocalStorage persistence."

**[Pause on the dashboard — point to the weather and AQI cards]**

> "Notice the live telemetry cards at the top — current temperature, humidity, wind speed, and the Air Quality Index for Lagos, pulled directly from the OpenWeatherMap API."

---

### ⏱️ 0:45 – 1:45 | Gamification & Habits Matrix

**[Screen: Scroll down to the Habit Logger section]**

> "Now let's talk about the core behavioral engine. SustainIQ's habit inventory contains sixteen eco-actions across four categories — Transport, Energy, Waste, and Diet."

**[Click the Transport filter]**

> "I'll filter to Transport habits. Each card shows the title, description, XP reward, and the exact environmental impact — in kilograms of CO₂ averted, liters of water conserved, or grams of waste diverted."

**[Click "Public Transit Commute"]**

> "I just logged a public transit commute. Watch the XP counter in the sidebar — it just incremented by fifteen points. The CO₂ metric updated in real time."

**[Click two or three more habits rapidly]**

> "Every log is immediately persisted to LocalStorage. If I close this tab right now and reopen it, every metric, every badge, every XP point is still here."

**[Navigate to Metrics page]**

> "The Metrics view gives me a full breakdown — CO₂ averted, water conserved, waste diverted — alongside my tier progression ladder and badge collection."

**[Point to the tier progress bar]**

> "I'm currently in the Observer tier. As I accumulate XP, I'll cross into Catalyst at one-fifty, Strategist at four-fifty, and Guardian at nine hundred. Each tier unlock triggers an animated overlay modal."

---

### ⏱️ 1:45 – 2:45 | Telemetry & Eco-Maps

**[Navigate to Analytics page]**

> "The Analytics Center visualizes my impact over time using three Recharts components. This Area Chart plots my weekly efficiency gains — impact score and XP earned per day. The Radar Chart maps my performance across five eco-disciplines simultaneously."

**[Point to the Radar Chart]**

> "You can see my Carbon and Engagement scores are climbing, while Water and Waste still have room to grow. This gives me a clear visual fingerprint of where to focus."

**[Navigate to Eco Map page]**

> "Now the Eco Infrastructure Map — built on React-Leaflet with OpenStreetMap tiles, centered on Lagos."

**[Point to the map pins]**

> "Eight sustainable infrastructure locations are pinned across the city — recycling hubs, organic markets, solar facilities, water harvesting stations, and eco markets. Each marker is color-coded by category using custom Leaflet divIcon logic."

**[Click the Recycling filter button]**

> "The filter ribbon lets me isolate by asset type. I'll click Recycling — the map instantly filters to show only recycling drop-off points. This is pure client-side state — no API call, instant response."

**[Click Solar filter, then All]**

> "Solar facilities. And back to All. The map recenters dynamically based on the user's city — if I had entered London during onboarding, these coordinates would shift to London's sustainable infrastructure."

---

### ⏱️ 2:45 – End | AI Assistant & Sign Out

**[Navigate to AI Assistant page]**

> "Finally — the SustainIQ AI Assistant. This is a domain-locked environmental intelligence engine with a strict system personality."

**[Point to the welcome message]**

> "The first message is hardcoded on mount — it introduces the assistant, attributes its engineering to me, and immediately prompts the user with actionable next steps."

**[Type: "who created you?" in the input and send]**

> "Watch what happens when I ask who created this. The assistant explicitly attributes itself to Engr. Adeleke Ajibola Joshua as the engineer of the SustainIQ platform."

**[Type: "tell me a recipe" and send]**

> "Now I'll ask something completely off-topic — a cooking recipe. The domain lock fires immediately."

**[Point to the amber bubble response]**

> "The response comes back in an amber-tinted bubble with a domain restriction badge — 'I am programmed exclusively to assist you with environmental geography and sustainable development.' The assistant pulls the conversation back to its niche every single time."

**[Type: "what is the impact of deforestation on rainfall?" and send]**

> "But ask it something genuinely environmental — like the impact of deforestation on rainfall patterns — and it delivers a detailed, accurate response covering ecosystem geography and hydrology."

**[Navigate back to Dashboard, click Sign Out in sidebar]**

> "To close out — the Sign Out flow. Clicking Sign Out triggers a confirmation modal before destroying the session."

**[Click Sign Out, show the modal]**

> "This modal prevents accidental data loss. On confirmation, the profile and metrics are cleared from LocalStorage and the application returns cleanly to the onboarding gateway — ready for the next user."

**[Click Sign Out in the modal — onboarding screen appears]**

> "SustainIQ. Environmental intelligence, gamified. Built to make sustainability measurable, rewarding, and personally meaningful — one habit at a time."

---

## 📋 4. EXAMINER Q&A PREPARATION

**Q: Why did you choose React Context over Redux or Zustand?**
> The application's state complexity does not justify the boilerplate overhead of Redux. Context with `useCallback`-memoized updaters provides the same single-source-of-truth architecture with zero additional dependencies. For a portfolio-grade SPA of this scope, it is the architecturally correct choice.

**Q: How does the application handle API key security?**
> The OpenWeatherMap key is accessed exclusively via `import.meta.env.VITE_OPENWEATHER_API_KEY` — Vite's build-time environment injection. The key is never in source code, never committed to version control, and is injected by the deployment platform at build time. The fail-safe mock layer ensures the application functions fully without any key present.

**Q: What happens if the user clears their browser storage?**
> The application detects the absence of `siq_profile` in localStorage on mount and redirects to the onboarding gateway. All state resets to defaults. This is by design — the application is stateless at the server level and fully self-contained in the browser.

**Q: How is the dark/light theme implemented technically?**
> Tailwind CSS's `darkMode: 'class'` strategy is configured in `tailwind.config.js`. The `toggleTheme()` function in context directly manipulates `document.documentElement.classList`, adding or removing the `dark` class. This single DOM operation activates all 300+ `dark:` utility variants across the entire component tree simultaneously, with a 300ms CSS transition on background and text colors.

**Q: Why Leaflet over Google Maps or Mapbox?**
> Leaflet with OpenStreetMap tiles is fully open-source, requires no API key, has no usage billing, and is production-ready for this use case. React-Leaflet provides idiomatic React bindings. For a sustainability platform, using open-source mapping infrastructure is also philosophically consistent with the platform's values.

**Q: How does the AI assistant enforce its domain constraints?**
> Two classifier functions — `isExplicitlyOffTopic()` and `isOnTopic()` — run against every user query before the knowledge base lookup. The off-topic classifier contains 40+ keyword patterns across non-environmental domains. The on-topic allowlist contains 80+ environmental keywords. The combination prevents both false positives (blocking legitimate eco-queries) and false negatives (allowing off-topic queries through). Creator attribution queries are handled by a separate `isCreatorQuery()` classifier with 25+ pattern matches, running at highest priority before either domain check.

---

## 🗂️ 5. FILE STRUCTURE REFERENCE

```
SustainIQ/
├── index.html                          # Emerald leaf SVG favicon, SustainIQ title
├── package.json                        # Dependencies: React, Leaflet, Recharts, Lucide
├── tailwind.config.js                  # darkMode: 'class' enabled
├── vite.config.ts                      # Vite build configuration
├── .env.example                        # VITE_OPENWEATHER_API_KEY template
└── src/
    ├── App.tsx                         # Root layout, page routing, TierUpModal
    ├── main.tsx                        # React DOM entry point
    ├── index.css                       # Leaflet CSS import, Tailwind directives
    ├── context/
    │   └── SustainIQContext.tsx        # Global state, theme, auth, habits, tiers
    ├── services/
    │   └── api.ts                      # OpenWeatherMap dual-endpoint + mock fallback
    └── components/
        ├── Onboarding.tsx              # 3-step glassmorphic onboarding gateway
        ├── Sidebar.tsx                 # Navigation, theme toggle, sign out
        ├── Dashboard.tsx               # Telemetry cards, habit logger, badges
        ├── Metrics.tsx                 # Impact metrics, tier ladder, activity log
        ├── Analytics.tsx               # AreaChart, RadarChart, BarChart
        ├── Map.tsx                     # React-Leaflet eco-infrastructure map
        ├── Challenges.tsx              # XP multiplier sprint challenges
        ├── Assistant.tsx               # Domain-locked AI assistant
        ├── TierUpModal.tsx             # Animated tier progression overlay
        └── SignOutModal.tsx            # Session destruction confirmation modal
```

---

*Document prepared for technical defense and portfolio presentation of SustainIQ.*
*Engineered by Engr. Adeleke Ajibola Joshua.*
