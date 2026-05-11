"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ClimateSummary } from "@/lib/data/climate";
import { TempChart, PrecipChart } from "@/components/charts/ClimateChart";
import { Field, CompactStat, StatGridSkeleton } from "@/components/ui";
import { RiskBadge } from "@/components/widgets/RiskBadge";
import { TimeSlider } from "@/components/widgets/TimeSlider";
import { useUrlSetter } from "@/lib/hooks/useUrlState";
import { useSearchParams } from "next/navigation";

const AtlasMap = dynamic(() => import("@/components/maps/AtlasMap"), { ssr: false });

export default function AtlasPage() {
  return (
    <Suspense fallback={null}>
      <AtlasContent />
    </Suspense>
  );
}

function AtlasContent() {
  const sp = useSearchParams();
  const setUrl = useUrlSetter();

  const initialLat = sp.get("lat") ? Number(sp.get("lat")) : null;
  const initialLon = sp.get("lon") ? Number(sp.get("lon")) : null;

  const [pin, setPin] = useState<{ lat: number; lon: number; label?: string } | null>(
    initialLat !== null && initialLon !== null && !Number.isNaN(initialLat) && !Number.isNaN(initialLon)
      ? { lat: initialLat, lon: initialLon }
      : null,
  );
  const [start, setStart] = useState(sp.get("start") ?? "2023-01-01");
  const [end, setEnd] = useState(sp.get("end") ?? "2023-12-31");
  const [data, setData] = useState<ClimateSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ranInitial = useRef(false);
  useEffect(() => {
    if (ranInitial.current) return;
    ranInitial.current = true;
    if (pin) loadData(pin.lat, pin.lon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData(lat: number, lon: number) {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(
        `/api/climate?lat=${lat}&lon=${lon}&start=${start}&end=${end}&source=open-meteo`,
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

  function onPick(lat: number, lon: number) {
    const next = { lat, lon };
    setPin(next);
    setUrl({ lat: lat.toFixed(4), lon: lon.toFixed(4) });
    loadData(lat, lon);
  }

  function applyDates() {
    setUrl({ start, end });
    if (pin) loadData(pin.lat, pin.lon);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="eyebrow mb-3">Interactive map</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Atlas.</h1>
        <p className="mt-5 text-muted text-lg max-w-2xl leading-relaxed">
          Click anywhere on Earth to fetch daily climate data — temperature,
          precipitation, hot-day counts — for that point.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-end mb-6">
        <Field label="Start">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input-field"
          />
        </Field>
        <Field label="End">
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="input-field"
          />
        </Field>
        <button
          onClick={applyDates}
          disabled={!pin || loading}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Loading…" : "Apply"}
        </button>
        {pin && (
          <button onClick={copyLink} className="btn-secondary">
            {copied ? "Copied ✓" : "Copy link ↗"}
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[520px] card overflow-hidden">
          <AtlasMap center={[20, 78]} pin={pin} onPick={onPick} />
        </div>

        <aside className="card p-6">
          <p className="eyebrow mb-2">Selected point</p>
          {pin ? (
            <p className="font-display text-2xl tabular">
              {pin.lat.toFixed(3)}, {pin.lon.toFixed(3)}
            </p>
          ) : (
            <p className="text-sm text-muted">Click anywhere on the map.</p>
          )}

          {err && (
            <div className="mt-4 px-3 py-2 rounded-lg border border-danger/30 bg-danger/5 text-sm text-danger">
              {err}
            </div>
          )}

          {loading && !data && <div className="mt-6"><StatGridSkeleton count={6} /></div>}

          {data && (
            <div className="mt-6 grid grid-cols-2 gap-2.5 text-sm">
              <CompactStat label="Avg Tmax" value={fmt(data.stats.avgTmax, "°C")} />
              <CompactStat label="Avg Tmin" value={fmt(data.stats.avgTmin, "°C")} />
              <CompactStat label="Total precip" value={fmt(data.stats.totalPrecip, "mm")} />
              <CompactStat label="Hot days ≥35" value={`${data.stats.hotDays ?? 0}`} />
              <CompactStat label="Rainy ≥1mm" value={`${data.stats.rainyDays ?? 0}`} />
              <CompactStat label="Dry days" value={`${data.stats.dryDays ?? 0}`} />
            </div>
          )}

          {pin && (
            <a
              href={`/api/climate?lat=${pin.lat}&lon=${pin.lon}&start=${start}&end=${end}&source=open-meteo&format=csv`}
              className="mt-6 btn-secondary w-full justify-center"
            >
              Download CSV ↓
            </a>
          )}
        </aside>
      </div>

      {data && data.points.length > 0 && (
        <>
          <div className="mt-8 grid lg:grid-cols-3 gap-4">
            <RiskBadge summary={data} />
            <div className="card p-6 lg:col-span-2">
              <p className="eyebrow mb-3">Temperature · daily</p>
              <TempChart data={data.points} />
            </div>
          </div>
          <div className="mt-4 card p-6">
            <p className="eyebrow mb-3">Precipitation · daily</p>
            <PrecipChart data={data.points} />
          </div>
          {pin && <div className="mt-4"><TimeSlider lat={pin.lat} lon={pin.lon} /></div>}
        </>
      )}
    </div>
  );
}

function fmt(v: number | undefined, unit: string): string {
  if (v === undefined || v === null || Number.isNaN(v)) return "—";
  return `${v.toFixed(1)} ${unit}`;
}
