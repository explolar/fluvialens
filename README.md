# Terralens

Climate Intelligence Platform by **WeatherEx AI**.

A conversational, agentic AI that brings local climate data — historical observations and future projections — into one platform for policy, research and communication.

---

## Features

| Surface | What it does |
|---|---|
| **Atlas** | Click anywhere on the world map → fetch daily historical climate (1981–present) → charts + CSV |
| **Projections** | Pick a city + scenario (RCP 2.6 / 4.5 / 6.0 / 8.5, with SSP equivalents) → annual climate trajectory 2030–2050 from a CMIP6 ensemble. Compare scenarios on one chart. |
| **Ask Terralens** | LLM-powered chat (Llama 3.3 70B via Groq). The agent picks tools — geocode, historical data, future projection — based on your question |
| **Datasets** | Browse the catalog, build custom CSVs by city + date range + source |
| **Stories** | Editorial features grounded in the data |
| **Resources** | Methodology, data sources, scenario mapping |

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Recharts** for visualisations
- **Leaflet** + **react-leaflet** for the map
- **Groq SDK** for the Llama agent (free tier)
- **Open-Meteo** + **NASA POWER** as climate data sources

No database. All data is fetched live from public APIs and cached by Next.js's HTTP cache.

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure

Copy the env template and add your free Groq API key:

```bash
cp .env.local.example .env.local
# then edit .env.local and paste your key
```

Get a key at <https://console.groq.com/keys> — required only for **Ask Terralens**. The Atlas, Projections and Datasets pages work without it.

### 3. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Project structure

```
terralens/
├── docs/
│   └── ARCHITECTURE.md         # how the pieces fit together
├── public/                     # static assets (incl. india-outline.geojson)
├── src/
│   ├── app/                    # routes — App Router
│   │   ├── api/                # public REST endpoints
│   │   │   ├── chat/           # POST → agent with tool-use
│   │   │   ├── climate/        # GET  → historical climate (JSON or CSV)
│   │   │   ├── geocode/        # GET  → city → lat/lon
│   │   │   ├── live/           # GET  → current conditions
│   │   │   └── projection/     # GET  → CMIP6 future projections
│   │   ├── ask/                # /ask — chat UI
│   │   ├── atlas/              # /atlas — map + historical
│   │   ├── datasets/           # /datasets — browse + build CSV
│   │   ├── developers/         # /developers — public API docs
│   │   ├── projections/        # /projections — RCP/SSP scenarios
│   │   ├── resources/          # /resources — methodology
│   │   ├── stories/            # /stories + /stories/[slug]
│   │   ├── robots.ts           # /robots.txt
│   │   ├── sitemap.ts          # /sitemap.xml
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # landing page
│   ├── components/
│   │   ├── charts/             # Recharts components + shared theme.ts
│   │   ├── layout/             # Header, Footer
│   │   ├── maps/               # AtlasMap (Leaflet + India overlay)
│   │   ├── ui/                 # primitives: Stat, Field, Section,
│   │   │                       #   BrandMark, Skeleton (barrel: index.ts)
│   │   └── widgets/            # composite widgets: GeoSearch, LiveTicker
│   └── lib/
│       ├── content/
│       │   └── stories.ts      # static editorial content
│       ├── data/               # external data adapters
│       │   ├── climate.ts      # ERA5 (Open-Meteo) + NASA POWER
│       │   ├── geocode.ts      # Open-Meteo Geocoding
│       │   ├── live.ts         # Open-Meteo current conditions
│       │   └── projection.ts   # Open-Meteo Climate API (CMIP6)
│       └── types.ts            # shared domain types (GeoResult, Pin)
├── .env.local.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the agent and data layer fit together.

---

## API reference

All routes are public, no auth, JSON unless `format=csv` is passed.

### `GET /api/geocode?q=Mumbai`

Open-Meteo geocoding. Returns up to 5 matches with lat/lon.

### `GET /api/climate?lat=&lon=&start=&end=&source=&format=`

Daily historical climate for a point.

- `start`, `end` — `YYYY-MM-DD`, default last year
- `source` — `open-meteo` (default) or `nasa-power`
- `format` — `json` (default) or `csv`

### `GET /api/projection?lat=&lon=&start=&end=&scenario=&format=`

Annual future projections from a CMIP6 ensemble.

- `start`, `end` — `YYYY-MM-DD`, between 2030 and 2050
- `scenario` — `rcp26` (SSP1-2.6) · `rcp45` (SSP2-4.5) · `rcp60` (SSP4-6.0) · `rcp85` (SSP5-8.5)
- `format` — `json` (default) or `csv`

### `POST /api/chat`

Body: `{ messages: [{ role: "user"|"assistant", content: string }] }`.
Returns `{ reply: string, toolResults: [...] }`. Requires `GROQ_API_KEY`.

---

## Scenario mapping (honest caveat)

Open-Meteo's climate API serves CMIP6 model runs forced with SSPs. Terralens labels them as the closest-equivalent **RCP 4.5** and **RCP 8.5** for accessibility — fine for outreach and exploration. Formal scientific work should cite the underlying CMIP6 models and SSP forcings directly. See `/resources` for details.

---

## License

Proprietary — © WeatherEx AI. All rights reserved.
