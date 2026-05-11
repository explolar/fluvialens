"use client";

import { useEffect, useState } from "react";
import type { LiveSnapshot } from "@/lib/data/live";
import { weatherLabel } from "@/lib/data/live";

const CITIES = [
  { city: "Mumbai", country: "India", lat: 19.07, lon: 72.87 },
  { city: "Delhi", country: "India", lat: 28.61, lon: 77.21 },
  { city: "Bengaluru", country: "India", lat: 12.97, lon: 77.59 },
  { city: "Chennai", country: "India", lat: 13.08, lon: 80.27 },
  { city: "Kolkata", country: "India", lat: 22.57, lon: 88.36 },
  { city: "Hyderabad", country: "India", lat: 17.39, lon: 78.49 },
];

export function LiveTicker() {
  const [snapshots, setSnapshots] = useState<LiveSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      CITIES.map((c) =>
        fetch(`/api/live?lat=${c.lat}&lon=${c.lon}&city=${c.city}&country=${c.country}`)
          .then((r) => r.json())
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      setSnapshots(results.filter((r): r is LiveSnapshot => r && !r.error));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <p className="eyebrow">Live · loading 6 cities</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CITIES.map((c) => (
            <div key={c.city} className="rounded-lg bg-bg-soft border border-border-soft p-4">
              <div className="h-3 w-16 bg-border-strong rounded mb-3 animate-pulse" />
              <div className="h-7 w-12 bg-border-strong rounded mb-2 animate-pulse" />
              <div className="h-2 w-20 bg-border-strong rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (snapshots.length === 0) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
          <p className="eyebrow text-accent-teal">Live · current conditions</p>
        </div>
        <p className="eyebrow text-muted-soft">{snapshots.length} cities</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {snapshots.map((s) => (
          <div
            key={s.city}
            className="rounded-lg bg-bg-soft border border-border-soft p-4 hover:border-accent/50 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-fg uppercase tracking-wider">{s.city}</p>
              <span className="text-[0.6rem] font-mono uppercase tracking-wider text-muted-soft">
                {s.isDay ? "Day" : "Night"}
              </span>
            </div>
            <p className="font-display text-3xl tabular text-fg">
              {Math.round(s.temperature)}°
            </p>
            <div className="mt-2 flex items-center gap-2 text-[0.65rem] text-muted">
              <span className="text-accent">{weatherLabel(s.weatherCode)}</span>
              <span className="text-muted-soft">·</span>
              <span className="tabular">RH {Math.round(s.humidity)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
