"use client";

import { computeRisk, GRADE_TONE } from "@/lib/data/risk";
import type { ClimateSummary } from "@/lib/data/climate";

export function RiskBadge({ summary }: { summary: ClimateSummary }) {
  const risk = computeRisk(summary);
  const tone = GRADE_TONE[risk.grade];
  const { details } = risk;

  return (
    <div className="card p-5 relative overflow-hidden">
      {/* Grade glow */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: tone.color }}
      />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="eyebrow">Terralens Risk Index</p>
            <p className="coord text-[0.6rem] text-muted-soft mt-0.5">
              ETCCDI · Rothfusz 1990
            </p>
          </div>
          <span
            className="coord text-[0.6rem] font-bold uppercase tracking-wider mt-0.5"
            style={{ color: tone.color }}
          >
            {tone.label}
          </span>
        </div>

        {/* Grade + Score */}
        <div className="flex items-end gap-4">
          <span
            className="font-display tabular leading-none"
            style={{ fontSize: "3.5rem", color: tone.color }}
          >
            {risk.grade}
          </span>
          <div className="pb-1">
            <p className="font-display tabular text-2xl text-fg leading-none">
              {risk.score}
              <span className="text-muted-soft text-sm">/100</span>
            </p>
            <p className="mt-0.5 eyebrow text-muted-soft">composite</p>
          </div>
        </div>

        {/* Component bars */}
        <div className="space-y-2.5">
          <ComponentBar
            label="TX90p"
            title="Heat frequency"
            value={risk.components.tx90p}
            raw={`${details.tx90p_raw}% days > p90 (${details.p90_tmax}°C)`}
            color={tone.color}
          />
          <ComponentBar
            label="WSDI"
            title="Warm spells"
            value={risk.components.wsdi}
            raw={`${details.wsdi_days} days in ≥6d runs above p90`}
            color={tone.color}
          />
          <ComponentBar
            label="CDD"
            title="Dry streak"
            value={risk.components.cdd}
            raw={`${details.cdd_max} consecutive dry days`}
            color={tone.color}
          />
          <ComponentBar
            label="HI"
            title="Heat stress"
            value={risk.components.hi}
            raw={
              details.hi_available
                ? `${details.hi_danger_days} days > 103°F apparent temp`
                : "Humidity unavailable"
            }
            color={tone.color}
            dim={!details.hi_available}
          />
        </div>

        {/* Notes */}
        {risk.notes.length > 0 && (
          <ul className="space-y-1 text-xs text-muted border-t border-border-soft pt-3">
            {risk.notes.map((n) => (
              <li key={n} className="flex items-start gap-1.5">
                <span className="text-muted-soft shrink-0 mt-px">·</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Short-window warning */}
        {risk.shortWindow && (
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-warm/30 bg-warm-soft text-xs text-warm">
            <span>⚠</span>
            <span>Short window — percentile indices stabilise above 90 days.</span>
          </div>
        )}

        {/* Citations */}
        <div className="border-t border-border-soft pt-3 space-y-1">
          <p className="coord text-[0.58rem] text-muted-soft">
            TX90p · WSDI · CDD — Alexander et al. (2006) J. Geophys. Res.
          </p>
          <p className="coord text-[0.58rem] text-muted-soft">
            Heat Index — Rothfusz (1990) NOAA NWS SR 90-23
          </p>
          <p className="coord text-[0.58rem] text-muted-soft">
            Heuristic · not actuarial
          </p>
        </div>
      </div>
    </div>
  );
}

function ComponentBar({
  label,
  title,
  value,
  raw,
  color,
  dim = false,
}: {
  label: string;
  title: string;
  value: number;
  raw: string;
  color: string;
  dim?: boolean;
}) {
  return (
    <div className={dim ? "opacity-40" : ""}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="flex items-baseline gap-1.5">
          <p className="coord text-[0.6rem] font-bold" style={{ color }}>
            {label}
          </p>
          <p className="eyebrow text-[0.55rem] text-muted-soft">{title}</p>
        </div>
        <p className="coord text-[0.6rem] text-muted-soft tabular">{value}</p>
      </div>
      <div className="h-1 rounded-full bg-bg-soft overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <p className="coord text-[0.55rem] text-muted-soft mt-0.5">{raw}</p>
    </div>
  );
}
