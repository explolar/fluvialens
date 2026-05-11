"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui";
import { GeoSearch } from "@/components/widgets/GeoSearch";
import type { GeoResult } from "@/lib/types";

const datasetCatalog = [
  {
    id: "historical-temp",
    title: "Historical Temperature & Precipitation",
    period: "1981 – present",
    source: "Open-Meteo · ERA5 reanalysis",
    desc: "Daily max/min/mean temperature, precipitation and humidity. Reanalysis-grade.",
    vars: ["tmax", "tmin", "tmean", "precip", "humidity"],
    href: "/atlas",
    cta: "Open in Atlas",
  },
  {
    id: "nasa-power",
    title: "NASA POWER Surface Climate",
    period: "1981 – present",
    source: "NASA Langley · POWER",
    desc: "Daily solar / meteorological parameters at ~0.5° resolution. Good for renewables and agriculture.",
    vars: ["T2M_MAX", "T2M_MIN", "T2M", "PRECTOTCORR", "RH2M"],
    href: "/atlas",
    cta: "Open in Atlas",
  },
  {
    id: "extreme-heat",
    title: "Extreme Heat (derived)",
    period: "Computed",
    source: "Derived · ERA5",
    desc: "Hot-day counts (Tmax ≥ 35 °C), heatwave durations. Computed from historical reanalysis.",
    vars: ["hot_days", "heatwave_days"],
    href: "/atlas",
    cta: "Open in Atlas",
  },
  {
    id: "rainfall-extremes",
    title: "Rainfall Extremes (derived)",
    period: "Computed",
    source: "Derived · ERA5",
    desc: "Rainy days, dry spells, max 1-day precipitation. Computed on the fly.",
    vars: ["rainy_days", "dry_days", "rx1day"],
    href: "/atlas",
    cta: "Open in Atlas",
  },
  {
    id: "cmip6-projection",
    title: "CMIP6 Future Projection",
    period: "2030 – 2050",
    source: "Open-Meteo · Climate API",
    desc: "Annual mean temperature and precipitation under RCP 2.6 – 8.5 from a CMIP6 model ensemble.",
    vars: ["tmax_mean", "tmin_mean", "tmean_mean", "precip_total", "scenario"],
    href: "/projections",
    cta: "Open in Projections",
  },
];

export default function DatasetsPage() {
  const [chosen, setChosen] = useState<GeoResult | null>(null);
  const [start, setStart] = useState("2023-01-01");
  const [end, setEnd] = useState("2023-12-31");
  const [source, setSource] = useState<"open-meteo" | "nasa-power">("open-meteo");

  const downloadUrl = chosen
    ? `/api/climate?lat=${chosen.lat}&lon=${chosen.lon}&start=${start}&end=${end}&source=${source}&format=csv`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="eyebrow mb-3">Open data · public APIs</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Datasets.</h1>
        <p className="mt-5 text-muted text-lg max-w-2xl leading-relaxed">
          Browse the catalog and build a custom CSV by city, date range and
          source. No login. No paywall.
        </p>
      </div>

      {/* Builder */}
      <section className="card p-8 md:p-10">
        <p className="eyebrow mb-3">Build · CSV download</p>
        <h2 className="font-display text-3xl">Pick a place and a window.</h2>

        <div className="mt-6">
          <GeoSearch
            placeholder="Mumbai, Bengaluru, Delhi…"
            onPick={setChosen}
            selected={chosen}
          />
        </div>

        {chosen && (
          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            <Field label="Start date">
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="End date">
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Source">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as "open-meteo" | "nasa-power")}
                className="input-field"
              >
                <option value="open-meteo">Open-Meteo · ERA5</option>
                <option value="nasa-power">NASA POWER</option>
              </select>
            </Field>
          </div>
        )}

        {downloadUrl && (
          <a href={downloadUrl} className="mt-8 btn-primary">
            Download CSV ↓
          </a>
        )}
      </section>

      {/* Catalog */}
      <section className="mt-24">
        <p className="eyebrow mb-3">Catalog</p>
        <h2 className="font-display text-4xl tracking-tight">
          Five datasets, <em>two clicks</em> away.
        </h2>

        <div className="mt-8 grid lg:grid-cols-2 gap-4">
          {datasetCatalog.map((d) => (
            <Link key={d.id} href={d.href} className="card card-hover p-7 group block">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl leading-tight">{d.title}</h3>
                <span className="shrink-0 eyebrow text-muted-soft">{d.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted leading-relaxed">{d.desc}</p>
              <p className="mt-4 eyebrow text-muted-soft">{d.source}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.vars.map((v) => (
                  <span
                    key={v}
                    className="font-mono text-[0.65rem] px-2 py-0.5 rounded border border-border-soft text-muted"
                  >
                    {v}
                  </span>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent group-hover:gap-3 transition-all">
                {d.cta}
                <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

