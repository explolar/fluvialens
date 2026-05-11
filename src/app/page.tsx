import Link from "next/link";
import { LiveTicker } from "@/components/widgets/LiveTicker";
import { HeroStat } from "@/components/ui";

const transects = [
  {
    coord: "00 · OBSERVATION",
    title: "Atlas",
    href: "/atlas",
    body: "Pin any point on Earth. Forty-four years of daily temperature, precipitation, and derived extremes — drawn directly from ERA5 reanalysis and NASA POWER. Export a CSV when you're done.",
    cta: "Pin a location",
  },
  {
    coord: "01 · PROJECTION",
    title: "Projections",
    href: "/projections",
    body: "Annual climate trajectories under four RCP / SSP scenarios, from Paris-aligned to fossil-fuel intensive. CMIP6 ensemble, 2030 – 2050, anywhere on Earth. Compare two scenarios on one chart.",
    cta: "Run a scenario",
  },
  {
    coord: "02 · INTERPRETATION",
    title: "Ask Terralens",
    href: "/ask",
    body: "An agent that picks the right tool — geocode, historical fetch, projection — for the question you actually asked. Returns a sentence and the chart that proves it.",
    cta: "Open the agent",
  },
];

const strata = [
  { layer: "Reanalysis", source: "ERA5 via Open-Meteo Archive", range: "1981 — present", tint: "var(--accent-blue)" },
  { layer: "Satellite", source: "NASA POWER", range: "1981 — present", tint: "var(--accent-teal)" },
  { layer: "Projection", source: "CMIP6 ensemble", range: "2030 — 2050", tint: "var(--warm)" },
  { layer: "Geocoding", source: "Open-Meteo Geocoding", range: "Global", tint: "var(--accent)" },
];

const sectors = [
  { code: "EN", title: "Energy", desc: "Demand forecasting, asset siting, renewables planning." },
  { code: "AG", title: "Agriculture", desc: "Crop windows, drought signals, monsoon variability." },
  { code: "AV", title: "Aviation", desc: "Route resilience, climatological reference fields." },
  { code: "PP", title: "Public policy", desc: "Heat action plans, climate adaptation strategy." },
];

export default function Home() {
  return (
    <div>
      {/* ============================================================ */}
      {/* HERO — map-first                                             */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden border-b border-border-soft">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 weather-bands opacity-70 pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 md:pt-32 pb-24">
          {/* Coordinate header strip */}
          <div className="flex items-center justify-between mb-16 flex-wrap gap-3 text-[0.7rem]">
            <span className="coord text-muted">
              <span className="text-accent">●</span>{" "}
              <span className="text-fg/90">19.0760°N</span>{" "}
              <span className="text-muted-soft">·</span>{" "}
              <span className="text-fg/90">72.8777°E</span>{" "}
              <span className="text-muted-soft">/</span>{" "}
              MUMBAI · YESTERDAY 14:00 IST
            </span>
            <span className="eyebrow">↳ descend to local</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left: headline + copy */}
            <div className="lg:col-span-7">
              <h1 className="display-xl text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] max-w-[12ch]">
                The planet,
                <br />
                <span className="gradient-text">point by</span>
                <br />
                point.
              </h1>

              <p className="mt-10 text-fg/80 text-lg md:text-xl max-w-xl leading-relaxed">
                Daily climate observations since 1981. Annual projections to 2050.
                And an agent that knows how to read the map.
              </p>

              <p className="mt-6 tagline text-muted-soft text-sm">
                terralens · by weatherex ai · built in india
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/atlas" className="btn-primary">
                  Pin a location
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1.5v9m0 0L3.5 7M7 10.5L10.5 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link href="/ask" className="btn-secondary">
                  Ask Terralens
                </Link>
              </div>
            </div>

            {/* Right: cartographic globe */}
            <div className="lg:col-span-5 relative">
              <Globe />
            </div>
          </div>

          {/* Live ticker */}
          <div className="mt-20">
            <LiveTicker />
          </div>

          {/* Quantitative summary, mono coordinate style */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 max-w-4xl">
            <HeroStat top="44 yrs" bottom="of daily climate observations" />
            <HeroStat top="2030 – 2050" bottom="projection horizon, annual" />
            <HeroStat top="4 scenarios" bottom="RCP 2.6 · 4.5 · 6.0 · 8.5" />
            <HeroStat top="~9 km" bottom="ERA5 grid resolution" />
          </div>
        </div>

        {/* Hypsometric stratum at the bottom edge of the hero */}
        <div className="absolute bottom-0 inset-x-0 h-1 strata opacity-70" />
      </section>

      {/* ============================================================ */}
      {/* TRANSECTS — three surfaces as ground sections                */}
      {/* ============================================================ */}
      <section className="border-b border-border-soft">
        <SectionDivider lat="32°N" label="Transects · how the platform reads the terrain" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
          <h2 className="display-lg text-3xl md:text-5xl max-w-2xl mb-4">
            Three instruments.
            <br />
            <span className="gradient-text">One coordinate.</span>
          </h2>
          <p className="text-muted max-w-xl">
            Pick a point. The platform reads it three ways — what it was, what it
            will be, and what that means in plain English.
          </p>

          <div className="mt-16 space-y-px bg-border-soft border border-border-soft rounded-md overflow-hidden">
            {transects.map((t, i) => (
              <Link
                key={t.title}
                href={t.href}
                className="group grid lg:grid-cols-12 gap-6 lg:gap-10 items-center bg-bg-elevated hover:bg-bg-soft transition px-6 md:px-10 py-10 md:py-14"
              >
                <div className="lg:col-span-2">
                  <p className="coord text-[0.7rem] text-muted-soft">{t.coord}</p>
                  <p className="mt-3 text-2xl md:text-3xl font-display font-semibold tracking-tight text-fg group-hover:text-accent transition">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <h3 className="display text-2xl md:text-3xl">{t.title}</h3>
                  <p className="mt-3 text-muted leading-relaxed max-w-2xl">
                    {t.body}
                  </p>
                </div>
                <div className="lg:col-span-3 flex lg:justify-end">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-fg group-hover:text-accent transition">
                    {t.cta}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7h8m0 0L7.5 3.5M11 7L7.5 10.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                {/* Per-row transect motif */}
                <div className="lg:col-span-12 -mb-2 -mx-6 md:-mx-10 mt-2">
                  <Transect index={i} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STRATA — data layers presented as elevation strata            */}
      {/* ============================================================ */}
      <section className="bg-bg-elevated border-b border-border-soft">
        <SectionDivider lat="22°N" label="Strata · what lies beneath" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <h2 className="display-lg text-3xl md:text-5xl">
                Open data,
                <br />
                <span className="gradient-text">layered like rock.</span>
              </h2>
              <p className="mt-6 text-muted leading-relaxed max-w-md">
                No proprietary lock-in. Every number Terralens shows is sourced
                from a public, citable dataset — and you can pull the CSV yourself.
              </p>
              <Link href="/datasets" className="mt-8 inline-flex btn-secondary">
                Browse the catalog →
              </Link>
            </div>

            <div className="lg:col-span-7">
              <ol className="space-y-px border border-border-soft rounded-md overflow-hidden">
                {strata.map((s) => (
                  <li
                    key={s.layer}
                    className="flex items-stretch bg-bg group hover:bg-bg-soft transition"
                  >
                    <span
                      className="w-1.5"
                      style={{ background: s.tint }}
                      aria-hidden
                    />
                    <div className="flex-1 grid grid-cols-12 gap-3 items-center px-6 py-5">
                      <p className="col-span-4 display text-base">{s.layer}</p>
                      <p className="col-span-5 text-sm text-muted">{s.source}</p>
                      <p className="col-span-3 coord text-[0.7rem] text-muted-soft text-right">
                        {s.range}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* APPLICATION — sectors                                         */}
      {/* ============================================================ */}
      <section className="border-b border-border-soft">
        <SectionDivider lat="14°N" label="Application · who reads this map" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
          <h2 className="display-lg text-3xl md:text-5xl max-w-3xl">
            For operators of
            <br />
            <span className="gradient-text">weather-sensitive systems.</span>
          </h2>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border-soft border border-border-soft rounded-md overflow-hidden">
            {sectors.map((s) => (
              <div
                key={s.code}
                className="bg-bg p-7 hover:bg-bg-soft transition relative isolines"
              >
                <p className="coord text-[0.7rem] text-muted-soft">SECTOR / {s.code}</p>
                <h4 className="mt-3 display text-xl text-fg">{s.title}</h4>
                <p className="mt-3 text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA                                                          */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 aurora-bg opacity-80" />
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-1 strata opacity-80" />

          <div className="relative p-10 md:p-20 text-center">
            <p className="eyebrow mb-5">Start anywhere — Mumbai, Manaus, Mombasa</p>
            <h2 className="display-lg text-3xl md:text-5xl max-w-3xl mx-auto">
              Ask the climate <span className="gradient-text">a coordinate.</span>
            </h2>
            <p className="mt-6 text-muted max-w-xl mx-auto">
              No accounts. No paywall. Free while in beta.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link href="/ask" className="btn-primary">
                Open Ask Terralens →
              </Link>
              <Link href="/atlas" className="btn-secondary">
                Open the Atlas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function SectionDivider({ lat, label }: { lat: string; label: string }) {
  return (
    <div className="border-b border-border-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-12 flex items-center gap-6">
        <span className="coord text-[0.7rem] text-accent">{lat}</span>
        <div className="flex-1 h-px bg-border-soft" />
        <span className="eyebrow">{label}</span>
      </div>
    </div>
  );
}

/* Cartographic globe — graticule sphere with pulsing pins.
   Pure SVG, pure CSS, no JS. */
function Globe() {
  const pins = [
    { x: 162, y: 138, label: "MUM" },     // ~Mumbai
    { x: 178, y: 110, label: "DEL" },     // ~Delhi
    { x: 168, y: 158, label: "BLR" },     // ~Bangalore
    { x: 200, y: 130, label: "SHA" },     // ~Shanghai
    { x: 100, y: 105, label: "PAR" },     // ~Paris
    { x: 70,  y: 145, label: "LIM" },     // ~Lima
  ];

  return (
    <div className="relative aspect-square max-w-md mx-auto lg:ml-auto">
      <svg viewBox="0 0 280 280" className="w-full h-full" aria-hidden>
        <defs>
          <radialGradient id="hypso" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="var(--peak)" stopOpacity="0.18" />
            <stop offset="35%" stopColor="var(--warm)" stopOpacity="0.10" />
            <stop offset="65%" stopColor="var(--accent-teal)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0.20" />
          </radialGradient>
          <radialGradient id="globeShade" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(244,236,219,0.12)" />
            <stop offset="60%" stopColor="rgba(244,236,219,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>
        </defs>

        {/* Sphere fill */}
        <circle cx="140" cy="140" r="118" fill="url(#hypso)" />
        <circle cx="140" cy="140" r="118" fill="url(#globeShade)" />

        {/* Globe outline */}
        <circle
          cx="140"
          cy="140"
          r="118"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1"
        />

        {/* Parallels (latitude) */}
        {[0.18, 0.42, 0.65, 0.85].map((p, i) => (
          <ellipse
            key={`par-${i}`}
            cx="140"
            cy={140 - 118 + p * 236}
            rx={Math.sqrt(118 * 118 - (118 - p * 236) ** 2)}
            ry={Math.sqrt(118 * 118 - (118 - p * 236) ** 2) * 0.18}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            opacity="0.55"
          />
        ))}
        {/* Equator emphasized */}
        <ellipse
          cx="140"
          cy="140"
          rx="118"
          ry="22"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.8"
          opacity="0.55"
        />

        {/* Meridians (longitude) — render as ellipses with varying rx */}
        {[0.2, 0.45, 0.7, 0.92].map((m, i) => (
          <ellipse
            key={`mer-${i}`}
            cx="140"
            cy="140"
            rx={118 * Math.cos((m - 0.5) * Math.PI)}
            ry="118"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            opacity="0.5"
          />
        ))}
        {/* Prime meridian emphasized */}
        <line
          x1="140"
          y1="22"
          x2="140"
          y2="258"
          stroke="var(--accent)"
          strokeWidth="0.8"
          opacity="0.45"
        />

        {/* Pins */}
        {pins.map((pin, i) => (
          <g key={pin.label}>
            <circle
              cx={pin.x}
              cy={pin.y}
              r="6"
              fill="var(--accent)"
              opacity="0.18"
            >
              <animate
                attributeName="r"
                from="3"
                to="9"
                dur="2.4s"
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.4"
                to="0"
                dur="2.4s"
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={pin.x} cy={pin.y} r="2.2" fill="var(--accent)" />
          </g>
        ))}
      </svg>

    </div>
  );
}

/* Per-transect contour graphic — three different terrain profiles. */
function Transect({ index }: { index: number }) {
  const profiles = [
    "M0,40 L40,38 L80,32 L120,28 L160,22 L200,18 L240,16 L280,12 L320,18 L360,28 L400,32 L440,30 L480,26 L520,20 L560,18 L600,22 L640,26 L680,30 L720,28 L760,24 L800,22",
    "M0,30 L40,28 L80,32 L120,38 L160,42 L200,40 L240,36 L280,28 L320,22 L360,18 L400,16 L440,18 L480,22 L520,26 L560,30 L600,34 L640,38 L680,40 L720,42 L760,44 L800,46",
    "M0,20 L40,24 L80,28 L120,30 L160,34 L200,38 L240,40 L280,42 L320,40 L360,36 L400,30 L440,24 L480,20 L520,18 L560,22 L600,28 L640,34 L680,40 L720,44 L760,46 L800,48",
  ];
  return (
    <svg
      viewBox="0 0 800 60"
      preserveAspectRatio="none"
      className="w-full h-12 opacity-60"
      aria-hidden
    >
      <path
        d={profiles[index % profiles.length]}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1"
      />
      <path
        d={profiles[(index + 1) % profiles.length]}
        fill="none"
        stroke="var(--warm)"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d={profiles[(index + 2) % profiles.length]}
        fill="none"
        stroke="var(--accent-blue)"
        strokeWidth="0.8"
        opacity="0.4"
      />
    </svg>
  );
}
