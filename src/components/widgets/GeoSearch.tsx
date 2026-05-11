"use client";

import { useState } from "react";
import type { GeoResult } from "@/lib/types";

export function GeoSearch({
  placeholder = "Search a city, e.g. Mumbai",
  onPick,
  selected,
}: {
  placeholder?: string;
  onPick: (r: GeoResult) => void;
  selected?: { lat: number; lon: number } | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const j = await r.json();
      setResults(j.results ?? []);
    } finally {
      setBusy(false);
    }
  }

  const isSelected = (r: GeoResult) =>
    selected && selected.lat === r.lat && selected.lon === r.lon;

  return (
    <div className="space-y-3">
      <div className="card flex gap-2 p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm focus:outline-none text-fg placeholder:text-muted-soft"
        />
        <button
          onClick={search}
          disabled={busy}
          className="btn-primary disabled:opacity-50"
        >
          {busy ? "…" : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="grid gap-1">
          {results.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button
                onClick={() => onPick(r)}
                className={`card card-hover w-full text-left px-4 py-3 text-sm ${
                  isSelected(r) ? "border-accent" : ""
                }`}
              >
                <span className="font-bold text-fg">{r.name}</span>{" "}
                <span className="text-muted">
                  {[r.admin1, r.country].filter(Boolean).join(", ")} ·{" "}
                  <span className="tabular">
                    {r.lat.toFixed(2)}, {r.lon.toFixed(2)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
