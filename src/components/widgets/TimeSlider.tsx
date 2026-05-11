"use client";

import { useEffect, useRef, useState } from "react";
import type { YearAggregate } from "@/lib/data/climate";

const METRICS = [
  { id: "hotDays", label: "Hot days ≥35", unit: "" },
  { id: "totalPrecip", label: "Annual precip", unit: " mm" },
  { id: "avgTmax", label: "Avg Tmax", unit: " °C" },
] as const;

type MetricId = (typeof METRICS)[number]["id"];

export function TimeSlider({
  lat,
  lon,
  fromYear = 1990,
  toYear = new Date().getFullYear() - 1,
}: {
  lat: number;
  lon: number;
  fromYear?: number;
  toYear?: number;
}) {
  const [years, setYears] = useState<YearAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [metric, setMetric] = useState<MetricId>("hotDays");
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setErr(null);
    fetch(`/api/timeseries?lat=${lat}&lon=${lon}&from=${fromYear}&to=${toYear}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancel) return;
        if (j.error) throw new Error(j.error);
        setYears(j.years ?? []);
        setIdx((j.years?.length ?? 1) - 1);
      })
      .catch((e) => !cancel && setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [lat, lon, fromYear, toYear]);

  // Auto-play
  useEffect(() => {
    if (!playing || years.length === 0) return;
    playRef.current = setInterval(() => {
      setIdx((i) => {
        if (i >= years.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 250);
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [playing, years.length]);

  if (loading) {
    return (
      <div className="card p-6">
        <p className="eyebrow mb-3">Time-lapse · loading</p>
        <div className="h-32 rounded-lg bg-bg-soft animate-pulse" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="card p-6 text-sm text-danger border-danger/30 bg-danger/10">
        {err}
      </div>
    );
  }

  if (years.length === 0) return null;

  const current = years[idx];
  const value = current[metric];
  const max = Math.max(...years.map((y) => Number(y[metric] ?? 0)));
  const min = Math.min(...years.map((y) => Number(y[metric] ?? 0)));

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <p className="eyebrow">
          Time-lapse · {fromYear}–{toYear}
        </p>
        <div className="inline-flex p-1 rounded-full border border-border-strong bg-bg-soft">
          {METRICS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider transition ${
                metric === m.id ? "bg-accent text-bg" : "text-muted hover:text-fg"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-display text-5xl tabular text-fg leading-none">
          {fmt(value)}
        </span>
        <span className="text-muted-soft text-sm">
          {METRICS.find((m) => m.id === metric)?.unit}
        </span>
        <span className="ml-auto eyebrow text-accent text-base tabular">
          {current.year}
        </span>
      </div>

      <Sparkline years={years} idx={idx} metric={metric} min={min} max={max} />

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="btn-secondary text-[0.65rem] py-2 px-3"
        >
          {playing ? "Pause" : "Play ▶"}
        </button>
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
      </div>
    </div>
  );
}

function Sparkline({
  years,
  idx,
  metric,
  min,
  max,
}: {
  years: YearAggregate[];
  idx: number;
  metric: MetricId;
  min: number;
  max: number;
}) {
  const W = 600;
  const H = 60;
  const range = max - min || 1;
  const xStep = years.length > 1 ? W / (years.length - 1) : 0;

  const points = years.map((y, i) => {
    const v = Number(y[metric] ?? 0);
    const x = i * xStep;
    const yPos = H - ((v - min) / range) * (H - 8) - 4;
    return [x, yPos] as [number, number];
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <path
        d={path}
        stroke="var(--accent)"
        strokeWidth="1.5"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      {points[idx] && (
        <circle
          cx={points[idx][0]}
          cy={points[idx][1]}
          r={4}
          fill="var(--warm)"
          stroke="var(--bg)"
          strokeWidth={2}
        />
      )}
    </svg>
  );
}

function fmt(v: number | undefined): string {
  if (v === undefined || Number.isNaN(v)) return "—";
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  return v.toFixed(1);
}
