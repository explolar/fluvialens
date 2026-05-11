const typefaces = [
  {
    name: "Space Grotesk",
    foundry: "Florian Karsten",
    role: "Display — headings, wordmark, numerical emphasis",
    weights: "400 · 500 · 600 · 700",
    license: "OFL 1.1",
    url: "https://fonts.google.com/specimen/Space+Grotesk",
  },
  {
    name: "Inter",
    foundry: "Rasmus Andersson",
    role: "Body — running text, UI labels, navigation",
    weights: "300 · 400 · 500 · 600 · 700",
    license: "OFL 1.1",
    url: "https://fonts.google.com/specimen/Inter",
  },
  {
    name: "JetBrains Mono",
    foundry: "JetBrains",
    role: "Coordinate — lat/lon readouts, metadata, data values",
    weights: "400 · 500 · 600",
    license: "OFL 1.1",
    url: "https://fonts.google.com/specimen/JetBrains+Mono",
  },
];

const dataSources = [
  {
    name: "ERA5 reanalysis",
    provider: "ECMWF via Open-Meteo Archive API",
    coverage: "Global · 1981 – present · daily",
    resolution: "~9 km",
    note: "Primary source for historical temperature, precipitation, humidity, wind.",
  },
  {
    name: "NASA POWER",
    provider: "NASA Langley Research Center",
    coverage: "Global · 1981 – present · daily",
    resolution: "~50 km",
    note: "Secondary historical source; used for cross-validation and CSV export.",
  },
  {
    name: "CMIP6 ensemble",
    provider: "Open-Meteo Climate API",
    coverage: "Global · 2030 – 2050 · aggregated annually",
    resolution: "~25 km",
    note: "Four scenario labels (RCP 2.6 / 4.5 / 6.0 / 8.5) mapped to closest SSP CMIP6 model runs. See Scenario mapping below.",
  },
  {
    name: "Open-Meteo Geocoding",
    provider: "Open-Meteo",
    coverage: "Global cities",
    resolution: "Point",
    note: "City name → lat/lon resolution for search and agent tool-use.",
  },
  {
    name: "Open-Meteo Forecast",
    provider: "Open-Meteo",
    coverage: "Global · current conditions",
    resolution: "~5 km",
    note: "Live conditions powering the ticker on the landing page.",
  },
];

const technology = [
  { name: "Next.js 16", role: "Framework — App Router, Turbopack, HTTP cache", href: "https://nextjs.org" },
  { name: "React 19", role: "UI runtime", href: "https://react.dev" },
  { name: "TypeScript 5", role: "Type safety across the full stack", href: "https://www.typescriptlang.org" },
  { name: "Tailwind CSS v4", role: "Utility-first styling; design tokens in globals.css", href: "https://tailwindcss.com" },
  { name: "Recharts 3", role: "Climate charts — temperature, precipitation, projection overlays", href: "https://recharts.org" },
  { name: "Leaflet + react-leaflet", role: "Interactive map on the Atlas surface", href: "https://leafletjs.com" },
  { name: "Groq SDK (Llama 3.3 70B)", role: "LLM inference for the Ask Terralens agent", href: "https://console.groq.com" },
];

const scenarioMapping = [
  { label: "RCP 2.6", ssp: "SSP1-2.6", models: "MRI_AGCM3_2_S (−1 °C bias offset)", warming: "~1.5 °C by 2100" },
  { label: "RCP 4.5", ssp: "SSP2-4.5", models: "MRI_AGCM3_2_S · FGOALS_f3_H", warming: "~2.7 °C by 2100" },
  { label: "RCP 6.0", ssp: "SSP4-6.0", models: "FGOALS_f3_H · EC_Earth3P_HR", warming: "~3.1 °C by 2100" },
  { label: "RCP 8.5", ssp: "SSP5-8.5", models: "MPI_ESM1_2_XR · EC_Earth3P_HR", warming: "~4.4 °C by 2100" },
];

export default function ColophonPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      {/* Header */}
      <div className="mb-16">
        <p className="coord text-[0.7rem] text-accent mb-4">↳ end of map</p>
        <h1 className="display-xl text-4xl md:text-6xl">Colophon</h1>
        <p className="mt-6 text-muted max-w-xl leading-relaxed">
          How this atlas was made — typefaces, data sources, technology and
          the honest caveats behind the numbers.
        </p>
      </div>

      {/* Typefaces */}
      <ColophonSection label="01" title="Typefaces">
        <div className="space-y-px border border-border-soft rounded-md overflow-hidden">
          {typefaces.map((t) => (
            <div
              key={t.name}
              className="bg-bg-elevated hover:bg-bg-soft transition px-6 py-5 grid md:grid-cols-12 gap-3"
            >
              <div className="md:col-span-4">
                <p className="font-display font-semibold text-fg">{t.name}</p>
                <p className="coord text-[0.65rem] text-muted-soft mt-1">
                  {t.foundry}
                </p>
              </div>
              <div className="md:col-span-5">
                <p className="text-sm text-muted">{t.role}</p>
                <p className="coord text-[0.65rem] text-muted-soft mt-1">
                  {t.weights}
                </p>
              </div>
              <div className="md:col-span-3 flex md:justify-end items-start">
                <span className="coord text-[0.65rem] text-muted-soft border border-border-strong rounded px-2 py-1">
                  {t.license}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ColophonSection>

      {/* Data sources */}
      <ColophonSection label="02" title="Data sources">
        <div className="space-y-4">
          {dataSources.map((d) => (
            <div key={d.name} className="card p-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-display font-semibold text-fg">{d.name}</p>
                  <p className="coord text-[0.65rem] text-accent mt-1">
                    {d.provider}
                  </p>
                </div>
                <div className="text-right">
                  <p className="coord text-[0.65rem] text-muted-soft">
                    {d.coverage}
                  </p>
                  <p className="coord text-[0.65rem] text-muted-soft mt-0.5">
                    resolution · {d.resolution}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted leading-relaxed">{d.note}</p>
            </div>
          ))}
        </div>
      </ColophonSection>

      {/* Scenario mapping */}
      <ColophonSection label="03" title="Scenario mapping">
        <div className="card p-6 mb-4">
          <p className="text-sm text-muted leading-relaxed">
            Open-Meteo's Climate API serves CMIP6 high-resolution model runs
            forced with SSPs. Terralens exposes four RCP labels in the UI for
            accessibility and maps each to the model ensemble whose effective
            warming is closest to that pathway. This is an approximation —
            formal scientific work should cite the underlying CMIP6 models and
            SSP forcings directly.
          </p>
        </div>
        <div className="space-y-px border border-border-soft rounded-md overflow-hidden">
          {scenarioMapping.map((s, i) => {
            const tints = ["var(--accent-teal)", "var(--accent-blue)", "var(--warm)", "var(--accent)"];
            return (
              <div
                key={s.label}
                className="bg-bg-elevated hover:bg-bg-soft transition flex items-stretch"
              >
                <span className="w-1" style={{ background: tints[i] }} aria-hidden />
                <div className="flex-1 px-6 py-4 grid md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-2">
                    <p className="coord text-sm text-fg font-semibold">{s.label}</p>
                    <p className="coord text-[0.65rem] text-muted-soft mt-0.5">{s.ssp}</p>
                  </div>
                  <p className="md:col-span-6 text-sm text-muted">{s.models}</p>
                  <p className="md:col-span-4 coord text-[0.65rem] text-muted-soft md:text-right">
                    {s.warming}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ColophonSection>

      {/* Technology */}
      <ColophonSection label="04" title="Technology">
        <div className="space-y-px border border-border-soft rounded-md overflow-hidden">
          {technology.map((t) => (
            <div
              key={t.name}
              className="bg-bg-elevated hover:bg-bg-soft transition px-6 py-4 grid md:grid-cols-12 gap-3 items-center"
            >
              <p className="md:col-span-4 font-display font-medium text-fg text-sm">
                {t.name}
              </p>
              <p className="md:col-span-8 text-sm text-muted">{t.role}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-soft">
          No database. All climate data is fetched live from public APIs and
          cached by Next.js (1 h for historical, 24 h for projections and
          geocoding).
        </p>
      </ColophonSection>

      {/* Imprint */}
      <ColophonSection label="05" title="Imprint">
        <div className="card p-6 space-y-3">
          <Row label="product" value="Terralens" />
          <hr className="hairline" />
          <Row label="publisher" value="WeatherEx AI" />
          <hr className="hairline" />
          <Row label="built in" value="India" />
          <hr className="hairline" />
          <Row label="projection" value="WGS 84 (EPSG:4326)" />
          <hr className="hairline" />
          <Row label="first published" value="2026" />
          <hr className="hairline" />
          <Row label="licence" value="Proprietary — © WeatherEx AI. All rights reserved." />
        </div>
      </ColophonSection>

      {/* End mark */}
      <div className="mt-24 flex items-center gap-4">
        <div className="flex-1 h-px bg-border-soft" />
        <p className="coord text-[0.65rem] text-muted-soft">
          00°00′N · 00°00′E
        </p>
      </div>
    </div>
  );
}

function ColophonSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="flex items-center gap-4 mb-6">
        <p className="coord text-[0.65rem] text-accent">{label}</p>
        <div className="flex-1 h-px bg-border-soft" />
        <h2 className="display text-xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-baseline">
      <p className="col-span-4 eyebrow">{label}</p>
      <p className="col-span-8 text-sm text-fg">{value}</p>
    </div>
  );
}
