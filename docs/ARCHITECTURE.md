# Architecture

A short tour of how the pieces fit together.

## Data flow

```
                        ┌─────────────────────┐
   user clicks map ─►   │   Atlas page (RSC)  │  ──┐
                        └─────────────────────┘    │
                                                    ▼
                        ┌─────────────────────┐    GET /api/climate
   user picks scenario ►│  Projections page   │  ──►   /api/projection
                        └─────────────────────┘    │
                                                    ▼
                        ┌─────────────────────┐    │  Next.js fetch cache
   user types question ►│  Ask Terralens UI   │  ──┤  (1h historical, 24h projection)
                        └────────┬────────────┘    ▼
                                 │            ┌─────────────────┐
                                 ▼            │  src/lib/*      │
                          POST /api/chat ───► │  - climate.ts   │
                                              │  - projection.ts│
                                              │  - geocode.ts   │
                                              └────────┬────────┘
                                                       ▼
                                              External public APIs:
                                              - Open-Meteo Archive (ERA5)
                                              - Open-Meteo Climate (CMIP6)
                                              - NASA POWER
                                              - Open-Meteo Geocoding
```

## The agent (Ask Terralens)

`src/app/api/chat/route.ts` runs an agentic loop:

1. **System prompt** sets Terralens's role and the available tools.
2. **Tool-call loop** (max 4 steps): send messages → frontier LLM returns either a final answer or a tool call → execute tool → append result → repeat.
3. **Tools available**:
   - `geocode_location(query)` → city → lat/lon
   - `get_climate_data(lat, lon, start, end)` → historical daily, 1981-present
   - `get_climate_projection(lat, lon, start, end, scenario)` → annual CMIP6 projections, 2030-2050
4. **Result trimming**: historical results contain up to 365 daily points; we send only the first 30 + a count to the LLM to keep context lean. Projections (≤21 yearly points) are sent in full.

The chat UI in `src/app/ask/page.tsx` reads the returned `toolResults` to auto-render charts inline whenever a `get_climate_data` call yielded points — the agent never has to format chart data itself.

## Data layer

Each module under `src/lib/data/` is a thin wrapper around one public API; `src/lib/content/` holds static content; `src/lib/types.ts` holds shared domain types.

- `src/lib/data/climate.ts` — historical (Open-Meteo Archive + NASA POWER), shared `ClimatePoint` type, derived metrics (hot days, rainy days, etc.), `toCSV()` exporter.
- `src/lib/data/projection.ts` — CMIP6 ensemble. Maps `rcp26`/`rcp45`/`rcp60`/`rcp85` → model lists, fetches daily data, aggregates to yearly mean.
- `src/lib/data/geocode.ts` — Open-Meteo geocoding.
- `src/lib/data/live.ts` — Open-Meteo current conditions for the live ticker.
- `src/lib/content/stories.ts` — static editorial content (placeholder for a future CMS).
- `src/lib/types.ts` — shared `GeoResult` and `Pin` types.

API routes (`src/app/api/*/route.ts`) are thin glue: parse query params, call the lib function, return JSON or CSV. They live in the App Router, run on Node.js for the chat route to support its server-side LLM SDK.

## Scenario → model ensemble mapping

Open-Meteo's Climate API serves CMIP6 high-resolution models forced with SSPs. We expose four RCP/SSP labels in the UI and map each to a model ensemble whose effective warming is closest to that pathway:

| UI label | SSP | Models used |
|---|---|---|
| RCP 2.6 | SSP1-2.6 | `MRI_AGCM3_2_S` (with -1 °C bias offset) |
| RCP 4.5 | SSP2-4.5 | `MRI_AGCM3_2_S`, `FGOALS_f3_H` |
| RCP 6.0 | SSP4-6.0 | `FGOALS_f3_H`, `EC_Earth3P_HR` |
| RCP 8.5 | SSP5-8.5 | `MPI_ESM1_2_XR`, `EC_Earth3P_HR` |

Each lat/lon query fetches all models in the ensemble; we then take a per-day arithmetic mean and aggregate to yearly. This is an approximation, not a research-grade scenario reproduction. See `/resources` for the user-facing caveat.

## Caching

Next.js applies its built-in fetch cache via `next: { revalidate }`:

- Historical climate fetches → 1 hour
- Projection fetches → 24 hours
- Geocoding → 24 hours

This means a popular city/date combination only hits the upstream API once per revalidation window across all users.

## Adding a new feature

| Want to | Add |
|---|---|
| Reuse a UI primitive (Stat, Field, Section, Skeleton, BrandMark) | Import from `@/components/ui` |
| Reuse the city search | `import { GeoSearch } from "@/components/widgets/GeoSearch"` |
| Show a new chart type | New file in `src/components/charts/` — pull tokens from `theme.ts` |
| Wrap a new climate API | New file in `src/lib/data/` + matching `src/app/api/<name>/route.ts` |
| Give the agent a new tool | Add a tool definition + handler in `src/app/api/chat/route.ts`, update the system prompt |
| Add an editorial story | New entry in the `stories` array in `src/lib/content/stories.ts` |
| Add a new top-level page | New folder under `src/app/<route>/page.tsx`, link in `src/components/layout/Header.tsx`, route metadata via a sibling `layout.tsx`, sitemap entry |
