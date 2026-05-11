import Link from "next/link";
import { Stat } from "@/components/ui";

export const metadata = {
  title: "Developers · Terralens API",
  description:
    "Public REST API for climate data, projections, geocoding and live conditions. JSON or CSV.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/geocode",
    summary: "Place name → lat/lon (up to 5 candidates).",
    params: [{ name: "q", type: "string", desc: "City, region or country" }],
    example: "/api/geocode?q=Mumbai",
  },
  {
    method: "GET",
    path: "/api/climate",
    summary: "Daily historical climate (1981 – present) for a point.",
    params: [
      { name: "lat", type: "number", desc: "Latitude" },
      { name: "lon", type: "number", desc: "Longitude" },
      { name: "start", type: "YYYY-MM-DD", desc: "Window start" },
      { name: "end", type: "YYYY-MM-DD", desc: "Window end" },
      {
        name: "source",
        type: "enum",
        desc: "open-meteo · nasa-power",
      },
      { name: "format", type: "enum", desc: "json (default) · csv" },
    ],
    example:
      "/api/climate?lat=19.07&lon=72.87&start=2023-01-01&end=2023-12-31",
  },
  {
    method: "GET",
    path: "/api/projection",
    summary:
      "Annual CMIP6 future climate projection (2030 – 2050) for a point.",
    params: [
      { name: "lat", type: "number", desc: "Latitude" },
      { name: "lon", type: "number", desc: "Longitude" },
      {
        name: "start",
        type: "YYYY-MM-DD",
        desc: "Window start (year ≥ 2030)",
      },
      {
        name: "end",
        type: "YYYY-MM-DD",
        desc: "Window end (year ≤ 2050)",
      },
      {
        name: "scenario",
        type: "enum",
        desc: "rcp26 (SSP1-2.6) · rcp45 (SSP2-4.5) · rcp60 (SSP4-6.0) · rcp85 (SSP5-8.5)",
      },
      { name: "format", type: "enum", desc: "json (default) · csv" },
    ],
    example:
      "/api/projection?lat=28.61&lon=77.21&start=2040-01-01&end=2050-12-31&scenario=rcp85",
  },
  {
    method: "GET",
    path: "/api/live",
    summary: "Current conditions snapshot for a point.",
    params: [
      { name: "lat", type: "number", desc: "Latitude" },
      { name: "lon", type: "number", desc: "Longitude" },
      { name: "city", type: "string", desc: "Display name (echoed back)" },
    ],
    example: "/api/live?lat=19.07&lon=72.87&city=Mumbai",
  },
  {
    method: "POST",
    path: "/api/chat",
    summary:
      "Conversational climate agent. Returns a final reply plus the tool calls it ran.",
    params: [
      {
        name: "messages",
        type: "Array<{role,content}>",
        desc: "Conversation history (JSON body)",
      },
    ],
    example: `curl -X POST /api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"How hot will Delhi be by 2050?"}]}'`,
  },
];

export default function DevelopersPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 md:py-24">
      <p className="eyebrow mb-4">Developers · public REST API</p>
      <h1 className="display-lg text-4xl md:text-6xl">
        Build with <span className="gradient-text">Terralens.</span>
      </h1>
      <p className="mt-6 text-muted text-lg max-w-2xl leading-relaxed">
        Every surface in Terralens is powered by the same public API. No keys.
        No rate limit. JSON by default, CSV on request.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-3">
        <Stat label="Endpoints" value="5" />
        <Stat label="Response formats" value="JSON · CSV" />
        <Stat label="Cache" value="1 h · 24 h" />
      </div>

      <hr className="hairline my-16" />

      <div className="space-y-10">
        {endpoints.map((e) => (
          <article key={e.path} className="card p-7 md:p-8">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`font-mono text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                  e.method === "GET"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "bg-warm/15 text-warm border border-warm/30"
                }`}
              >
                {e.method}
              </span>
              <code className="font-mono text-base text-fg">{e.path}</code>
            </div>
            <p className="mt-3 text-muted leading-relaxed">{e.summary}</p>

            <p className="eyebrow mt-6 mb-3">Parameters</p>
            <div className="rounded-xl border border-border-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft">
                  <tr className="text-left">
                    <th className="px-4 py-2.5 eyebrow text-muted-soft font-mono">
                      Name
                    </th>
                    <th className="px-4 py-2.5 eyebrow text-muted-soft font-mono">
                      Type
                    </th>
                    <th className="px-4 py-2.5 eyebrow text-muted-soft font-mono">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {e.params.map((p) => (
                    <tr
                      key={p.name}
                      className="border-t border-border-soft hover:bg-bg-soft/40"
                    >
                      <td className="px-4 py-2.5 font-mono text-accent">{p.name}</td>
                      <td className="px-4 py-2.5 font-mono text-muted">{p.type}</td>
                      <td className="px-4 py-2.5 text-muted">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="eyebrow mt-6 mb-2">Example</p>
            <pre className="rounded-xl border border-border-soft bg-bg-soft p-4 overflow-auto font-mono text-xs leading-relaxed text-fg/90 whitespace-pre-wrap">
              {e.example}
            </pre>
          </article>
        ))}
      </div>

      <hr className="hairline my-16" />

      <div className="card p-8 md:p-10 text-center">
        <h2 className="display-lg text-2xl md:text-4xl">
          Need <span className="gradient-text">more?</span>
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          Higher rate limits, sub-daily resolution, sectoral data or an
          enterprise SLA — talk to the team.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/ask" className="btn-primary">
            Try Ask Terralens →
          </Link>
          <Link href="/atlas" className="btn-secondary">
            Open the Atlas
          </Link>
        </div>
      </div>
    </div>
  );
}

