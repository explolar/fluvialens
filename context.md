# Terralens — context

Climate intelligence platform by **WeatherEx AI**. Working folder is named `cravis` for historical reasons (see *Origin* below); the product name is **Terralens**.

---

## Origin & positioning

Terralens was originally inspired by [cravis.ai](https://cravis.ai/). On 2026-05-09 the landing was redesigned because it was tracking cravis too closely on visual identity, copy structure, and conceptual framing.

**Terralens must not read as a cravis clone.** Avoid these cravis-echo patterns:
- cyan / teal as the primary signal
- uppercase bold display headlines
- aurora cyan radial-gradient hero
- bento grid of 3–4 surface cards directly after the hero
- copy framed as *"democratising climate data"* or *"conversational agentic AI tool"*
- twin-arc / crescent brand marks

The substance (ERA5 reanalysis + NASA POWER + CMIP6 ensemble, 1981-present + 2030–2050, public APIs, no DB) is Terralens's own. The visual identity is map-first cartographic.

---

## Stack

- **Next.js 16** App Router (Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — design tokens declared in [`globals.css`](src/app/globals.css) under `@theme inline`
- **Recharts** for visualisations
- **Leaflet** + **react-leaflet** for the map
- **Groq SDK** (Llama 3.3 70B) for the agent
- **Open-Meteo** + **NASA POWER** for climate data
- No database. Caching via Next's HTTP fetch cache (1h historical, 24h projection / geocoding).

---

## Design system — map-first cartographic

### Palette (hypsometric, single signal)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0a0e14` | warm-shifted void |
| `--bg-elevated` | `#111722` | panel |
| `--bg-soft` | `#161e2c` | nested panel |
| `--fg` | `#f4ecdb` | paper cream (NOT pure white) |
| `--accent` | `#ff6b35` | signal orange — the only signal color |
| `--accent-blue` | `#4a8db8` | ocean elevation |
| `--accent-teal` | `#6b8e5a` | vegetation elevation |
| `--warm` | `#d9c79a` | sand elevation |
| `--peak` | `#f4e9d8` | snow elevation |
| `--danger` | `#c8553d` | error |

### Typography

- **Display:** Space Grotesk · 500 / 600 · mixed case · negative letter-spacing. Never uppercase the display.
- **Body:** Inter · 400 / 500.
- **Coordinates / metadata:** JetBrains Mono via the `.coord` class. Tabular numerics.

### Motifs (CSS class names — reuse, don't reinvent)

| Class | What it does |
|---|---|
| `.aurora-bg` | hypsometric atmospheric backdrop (ocean + sand + vegetation radials) |
| `.weather-bands` | faint latitude graticule horizontal lines |
| `.dot-grid` | lat/lon `+` crosshair pattern |
| `.gradient-text` | sand → orange → ocean text gradient |
| `.isolines` | concentric contour-line decoration |
| `.strata` | hypsometric horizontal layer-cake stripe (bottom-edge accent) |
| `.coord` | mono lat/lon readout |

### Components

- **Cards** are 6px radius, sharp atlas-page feel (NOT pill-rounded).
- **Buttons** are 4px radius, no glow halo (`.btn-primary` orange, `.btn-secondary` outline).
- **BrandMark** is a globe + graticule + signal pin near Mumbai.
- Section dividers are themselves cartographic: `32°N · transects` etc.
- Wordmark is lowercase: `terralens`.

---

## File map

```
src/
├── app/
│   ├── layout.tsx              # loads Inter, Space Grotesk, JetBrains Mono
│   ├── globals.css             # design tokens + utility classes (single source of truth)
│   ├── page.tsx                # landing — map-first hero, transects, strata, application, CTA
│   ├── api/
│   │   ├── chat/               # POST → agent with tool-use loop
│   │   ├── climate/            # GET  → historical (JSON or CSV)
│   │   ├── geocode/            # GET  → city → lat/lon
│   │   ├── live/               # GET  → current conditions
│   │   ├── projection/         # GET  → CMIP6 future projections
│   │   └── timeseries/
│   ├── atlas/                  # /atlas — Leaflet + historical
│   ├── projections/            # /projections — RCP/SSP scenarios
│   ├── ask/                    # /ask — chat UI
│   ├── datasets/               # /datasets — CSV builder
│   ├── developers/             # /developers — public API docs
│   ├── resources/              # /resources — methodology
│   └── stories/                # /stories + /stories/[slug]
├── components/
│   ├── charts/                 # Recharts components + theme.ts
│   ├── layout/                 # Header, Footer
│   ├── maps/                   # AtlasMap (Leaflet + India overlay)
│   ├── ui/                     # Stat, Field, Section, BrandMark, Skeleton (barrel: index.ts)
│   └── widgets/                # GeoSearch, LiveTicker, RiskBadge, TimeSlider
└── lib/
    ├── content/stories.ts      # static editorial content
    ├── data/                   # external data adapters: climate, projection, geocode, live, risk
    ├── hooks/useUrlState.ts
    └── types.ts                # GeoResult, Pin, etc.
```

---

## Conventions

1. **Design tokens are declared once, in [`globals.css`](src/app/globals.css).** Tailwind classes like `bg-bg`, `text-accent`, `border-border-soft` flow from `@theme inline` mappings — change them there, not at call sites.
2. **Reuse the utility classes above** rather than inventing new ones — that's how the entire app inherits the cartographic look.
3. **Inner pages inherit the new tokens automatically** because class names didn't change during the redesign. They aren't yet hand-tuned to the cartographic direction — improve them when you touch them.
4. **Voice:** lowercase, mono coordinates as metadata, mixed-case display headlines, "the planet, point by point". Don't write *"democratising climate data"* — that's cravis's voice.
5. **No accounts, no paywall, free in beta.** Don't add auth flows.

---

## Getting started

```bash
npm install
cp .env.local.example .env.local   # paste GROQ_API_KEY (only needed for /ask)
npm run dev                         # → http://localhost:3000
```

Get a free Groq key at <https://console.groq.com/keys>. Atlas, Projections and Datasets work without it.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the agent loop and data layer.
