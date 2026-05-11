"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { ProjectionChart } from "@/components/charts/ProjectionChart";
import { CompareProjectionChart } from "@/components/charts/CompareProjectionChart";
import { GeoSearch } from "@/components/widgets/GeoSearch";
import { Stat, ChartSkeleton } from "@/components/ui";
import { useUrlSetter } from "@/lib/hooks/useUrlState";
import { SCENARIOS, type ProjectionSummary, type Scenario } from "@/lib/data/projection";
import type { GeoResult, Pin } from "@/lib/types";

const AtlasMap = dynamic(() => import("@/components/maps/AtlasMap"), { ssr: false });

const RANGES = [
  { id: "near", label: "2030 – 2040", start: "2030-01-01", end: "2040-12-31" },
  { id: "mid", label: "2030 – 2050", start: "2030-01-01", end: "2050-12-31" },
  { id: "late", label: "2040 – 2050", start: "2040-01-01", end: "2050-12-31" },
];

const SCENARIO_TONE: Record<Scenario, string> = {
  rcp26: "bg-accent-teal text-bg border-accent-teal",
  rcp45: "bg-accent-bright text-bg border-accent-bright",
  rcp60: "bg-accent-blue text-fg border-accent-blue",
  rcp85: "bg-warm text-bg border-warm",
};

export default function ProjectionsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectionsContent />
    </Suspense>
  );
}

const SCENARIO_IDS: Scenario[] = ["rcp26", "rcp45", "rcp60", "rcp85"];

function ProjectionsContent() {
  const sp = useSearchParams();
  const setUrl = useUrlSetter();

  const initialLat = sp.get("lat") ? Number(sp.get("lat")) : null;
  const initialLon = sp.get("lon") ? Number(sp.get("lon")) : null;
  const initialScenario = (sp.get("scenario") as Scenario) ?? "rcp85";
  const initialMode = sp.get("mode") === "compare";

  const [pin, setPin] = useState<Pin | null>(
    initialLat !== null && initialLon !== null && !Number.isNaN(initialLat) && !Number.isNaN(initialLon)
      ? { lat: initialLat, lon: initialLon }
      : null,
  );
  const [scenario, setScenario] = useState<Scenario>(
    SCENARIO_IDS.includes(initialScenario) ? initialScenario : "rcp85",
  );
  const [start, setStart] = useState(sp.get("start") ?? "2030-01-01");
  const [end, setEnd] = useState(sp.get("end") ?? "2050-12-31");
  const [data, setData] = useState<ProjectionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Compare-mode state
  const [compareMode, setCompareMode] = useState(initialMode);
  const [compareScenarios, setCompareScenarios] = useState<Scenario[]>([
    "rcp26",
    "rcp45",
    "rcp85",
  ]);
  const [compareData, setCompareData] = useState<ProjectionSummary[] | null>(null);

  // Auto-load if URL had coordinates
  const ranInitial = useRef(false);
  useEffect(() => {
    if (ranInitial.current) return;
    ranInitial.current = true;
    if (pin) loadProjection(pin.lat, pin.lon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function loadProjection(lat: number, lon: number) {
    setLoading(true);
    setErr(null);
    if (compareMode) {
      setCompareData(null);
      try {
        const all = await Promise.all(
          compareScenarios.map((s) =>
            fetch(
              `/api/projection?lat=${lat}&lon=${lon}&start=${start}&end=${end}&scenario=${s}`,
            ).then((r) => r.json()),
          ),
        );
        if (all.some((r) => r.error)) throw new Error("One or more scenarios failed");
        setCompareData(all);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    } else {
      setData(null);
      try {
        const r = await fetch(
          `/api/projection?lat=${lat}&lon=${lon}&start=${start}&end=${end}&scenario=${scenario}`,
        );
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Failed");
        setData(j);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
  }

  function onPick(lat: number, lon: number) {
    setPin({ lat, lon });
    setUrl({ lat: lat.toFixed(4), lon: lon.toFixed(4) });
    loadProjection(lat, lon);
  }

  function pickResult(r: GeoResult) {
    setPin({ lat: r.lat, lon: r.lon, label: r.name });
    setUrl({ lat: r.lat.toFixed(4), lon: r.lon.toFixed(4) });
    loadProjection(r.lat, r.lon);
  }

  function toggleCompareScenario(s: Scenario) {
    setCompareScenarios((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="eyebrow mb-3">CMIP6 ensemble · 2030 – 2050</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Projections.</h1>
        <p className="mt-5 text-muted text-lg max-w-2xl leading-relaxed">
          Annual climate trajectories under four emissions scenarios — from{" "}
          <span className="text-accent-teal">RCP 2.6 / SSP1-2.6</span>{" "}
          (Paris-aligned) to{" "}
          <span className="text-warm">RCP 8.5 / SSP5-8.5</span>{" "}
          (fossil-fuel intensive).
        </p>
      </div>

      {/* Mode toggle + share */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex p-1 rounded-full border border-border-strong bg-bg-soft">
          <button
            onClick={() => {
              setCompareMode(false);
              setUrl({ mode: null });
              if (pin) loadProjection(pin.lat, pin.lon);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              !compareMode ? "bg-accent text-bg" : "text-muted"
            }`}
          >
            Single
          </button>
          <button
            onClick={() => {
              setCompareMode(true);
              setUrl({ mode: "compare" });
              if (pin) loadProjection(pin.lat, pin.lon);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              compareMode ? "bg-accent text-bg" : "text-muted"
            }`}
          >
            Compare scenarios
          </button>
        </div>
        {pin && (
          <button onClick={copyLink} className="btn-secondary text-[0.7rem]">
            {copied ? "Copied ✓" : "Copy link ↗"}
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <GeoSearch onPick={pickResult} selected={pin} />

          <div className="h-[460px] card overflow-hidden">
            <AtlasMap center={[20, 78]} pin={pin} onPick={onPick} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Scenario picker — single mode */}
          {!compareMode && (
            <div className="card p-6">
              <p className="eyebrow mb-3">Scenario</p>
              <div className="grid grid-cols-2 gap-2">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setScenario(s.id);
                      setUrl({ scenario: s.id });
                      if (pin) loadProjection(pin.lat, pin.lon);
                    }}
                    className={`px-3 py-2.5 rounded-lg border transition ${
                      scenario === s.id
                        ? SCENARIO_TONE[s.id]
                        : "bg-bg-soft text-muted border-border-strong hover:text-fg"
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-wider">
                      {s.rcp}
                    </span>
                    <span className="block font-mono text-[0.6rem] tracking-wider opacity-70 mt-0.5">
                      {s.ssp}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted leading-relaxed">
                {scenarioDesc(scenario)}
              </p>
            </div>
          )}

          {/* Scenario picker — compare mode */}
          {compareMode && (
            <div className="card p-6">
              <p className="eyebrow mb-3">Scenarios to compare</p>
              <div className="grid grid-cols-2 gap-2">
                {SCENARIOS.map((s) => {
                  const active = compareScenarios.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        toggleCompareScenario(s.id);
                        if (pin) loadProjection(pin.lat, pin.lon);
                      }}
                      className={`px-3 py-2.5 rounded-lg border transition ${
                        active
                          ? SCENARIO_TONE[s.id]
                          : "bg-bg-soft text-muted border-border-strong hover:text-fg"
                      }`}
                    >
                      <span className="block text-xs font-bold uppercase tracking-wider">
                        {active ? "✓ " : ""}
                        {s.rcp}
                      </span>
                      <span className="block font-mono text-[0.6rem] tracking-wider opacity-70 mt-0.5">
                        {s.ssp}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted leading-relaxed">
                Toggle two or more scenarios to overlay them on one chart.
              </p>
            </div>
          )}

          <div className="card p-6">
            <p className="eyebrow mb-3">Range</p>
            <div className="grid grid-cols-3 gap-2">
              {RANGES.map((r) => {
                const active = r.start === start && r.end === end;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setStart(r.start);
                      setEnd(r.end);
                      setUrl({ start: r.start, end: r.end });
                      if (pin) loadProjection(pin.lat, pin.lon);
                    }}
                    className={`px-2 py-2.5 rounded-lg border text-[0.65rem] font-bold uppercase tracking-wider transition tabular ${
                      active
                        ? "bg-fg text-bg border-fg"
                        : "bg-bg-soft text-muted border-border-strong hover:text-fg"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {pin && (
            <div className="card p-6 text-sm">
              <p className="eyebrow mb-2">Selected point</p>
              <p className="font-display text-xl tabular">
                {pin.lat.toFixed(3)}, {pin.lon.toFixed(3)}
              </p>
              {pin.label && <p className="text-muted mt-1">{pin.label}</p>}
              {!compareMode && (
                <a
                  href={`/api/projection?lat=${pin.lat}&lon=${pin.lon}&start=${start}&end=${end}&scenario=${scenario}&format=csv`}
                  className="mt-5 btn-secondary w-full justify-center"
                >
                  Download CSV ↓
                </a>
              )}
            </div>
          )}

          {err && (
            <div className="card border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              {err}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-8 card p-6">
          <p className="eyebrow text-muted-soft mb-4">Loading projection ensemble…</p>
          <ChartSkeleton height={256} />
        </div>
      )}

      {!loading && !compareMode && data && data.yearly.length > 0 && (
        <SingleResult data={data} />
      )}

      {!loading && compareMode && compareData && compareData.length > 0 && (
        <CompareResult series={compareData} />
      )}
    </div>
  );
}

function SingleResult({ data }: { data: ProjectionSummary }) {
  return (
    <>
      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="eyebrow">{data.scenarioLabel}</p>
              <ResolutionBadge data={data} />
            </div>
            <h3 className="mt-1 font-display text-2xl">Annual climate projection</h3>
          </div>
          <span className="eyebrow text-muted-soft">
            {data.models.length} CMIP6 model{data.models.length > 1 ? "s" : ""} ·{" "}
            {data.yearly.length} years
          </span>
        </div>
        <ProjectionChart data={data.yearly} />
      </div>

      <div className="mt-4 grid sm:grid-cols-4 gap-3 text-sm">
        <Stat label="Mean Tmax" value={`${avg(data.yearly.map((p) => p.tmax_mean))} °C`} />
        <Stat label="Mean Tmin" value={`${avg(data.yearly.map((p) => p.tmin_mean))} °C`} />
        <Stat label="Mean Tmean" value={`${avg(data.yearly.map((p) => p.tmean_mean))} °C`} />
        <Stat
          label="Annual precip"
          value={`${Math.round(avg(data.yearly.map((p) => p.precip_total)))} mm`}
        />
      </div>
    </>
  );
}

function CompareResult({ series }: { series: ProjectionSummary[] }) {
  const seriesForChart = series.map((s) => ({
    scenario: s.scenario,
    label: s.scenarioLabel.split(" (")[0],
    data: s.yearly,
  }));

  return (
    <>
      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <p className="eyebrow text-accent">Compare · annual mean temperature</p>
            <h3 className="mt-1 font-display text-2xl">{series.length} scenarios overlaid</h3>
          </div>
          <span className="eyebrow text-muted-soft">{series[0]?.yearly.length} years</span>
        </div>
        <CompareProjectionChart series={seriesForChart} />
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {series.map((s) => (
          <div key={s.scenario} className="card p-4">
            <p className="eyebrow mb-1">{s.scenarioLabel.split(" (")[0]}</p>
            <p className="font-display text-2xl tabular">
              {avg(s.yearly.map((p) => p.tmean_mean))} °C
            </p>
            <p className="mt-1 text-xs text-muted">avg Tmean over window</p>
          </div>
        ))}
      </div>
    </>
  );
}

function ResolutionBadge({ data }: { data: ProjectionSummary }) {
  if (data.resolution === "point") {
    return (
      <span
        title="High-resolution CMIP6 HighResMIP ensemble at exact coordinates (Open-Meteo)."
        className="coord text-[0.6rem] px-1.5 py-0.5 rounded-sm border border-accent/40 text-accent bg-accent-soft"
      >
        POINT
      </span>
    );
  }
  return (
    <span
      title={`Country-level CMIP6 ensemble median${data.countryCode ? ` for ${data.countryCode}` : ""} (World Bank CCKP). Point-level source was unavailable.`}
      className="coord text-[0.6rem] px-1.5 py-0.5 rounded-sm border border-warm/40 text-warm bg-warm/10"
    >
      COUNTRY · {data.countryCode ?? "?"}
    </span>
  );
}

function avg(xs: number[]): number {
  if (xs.length === 0) return 0;
  return Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10;
}

function scenarioDesc(s: Scenario): string {
  switch (s) {
    case "rcp26":
      return "Paris-aligned. Aggressive emissions cuts; warming kept near 1.8 °C by 2100.";
    case "rcp45":
      return "Stabilisation. Emissions peak around 2040, then decline.";
    case "rcp60":
      return "Intermediate. Slow stabilisation late this century.";
    case "rcp85":
      return "Fossil-fuel intensive. Continued high emissions baseline.";
  }
}
