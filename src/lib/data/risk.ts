// Terralens Risk Index (TRI) v2
//
// Composite 0–100 score built on three ETCCDI climate extremes indices
// (Alexander et al. 2006, J. Geophys. Res. 111, D06106) and the NOAA
// Heat Index regression (Rothfusz 1990, NWS SR 90-23).
//
// Sub-signals and weights:
//   TX90p  — % days where Tmax > local 90th percentile          × 0.35
//   WSDI   — Warm Spell Duration Index (days in ≥6d warm spells) × 0.30
//   CDD    — Consecutive Dry Days (longest dry run)              × 0.20
//   HI     — NOAA Heat Index exceedance days (>103 °F / 39.4 °C) × 0.15
//
// TX90p and WSDI use the 90th percentile computed from the selected
// date-range itself, so the index is locally relative — a cold city is
// judged against its own climate, not a global absolute. This is the
// ETCCDI-recommended approach for intra-period analysis.
//
// Short-window caveat: with < 90 daily observations the 90th-percentile
// estimate is unstable. The badge warns the user when this is the case.
//
// Honest caveat: TRI is a research-grade heuristic useful for outreach,
// journalism and triage. It is NOT actuarial, insurance-grade, or a
// substitute for formal hazard assessment.

import type { ClimateSummary } from "./climate";

export type RiskGrade = "A" | "B" | "C" | "D" | "F";

export type RiskBreakdown = {
  score: number;
  grade: RiskGrade;
  components: {
    tx90p: number;  // normalised 0–100
    wsdi:  number;
    cdd:   number;
    hi:    number;
  };
  details: {
    p90_tmax:        number;   // °C threshold used for TX90p / WSDI
    tx90p_raw:       number;   // actual % of days above p90
    wsdi_days:       number;   // actual WSDI day count
    cdd_max:         number;   // actual longest dry run (days)
    hi_danger_days:  number;   // actual days at NOAA "Danger" level
    hi_available:    boolean;  // false when humidity data is missing
  };
  shortWindow: boolean;
  notes: string[];
};

// ---------------------------------------------------------------------------
// NOAA Heat Index — Rothfusz (1990) full regression
// T in °F, RH in percent (0–100). Returns apparent temperature in °F.
// ---------------------------------------------------------------------------
function noaaHeatIndex(tF: number, rh: number): number {
  if (tF < 80) return tF; // HI formula not meaningful below 80 °F

  // Steadman simple average — used as screening
  const simple = 0.5 * (tF + 61.0 + (tF - 68.0) * 1.2 + rh * 0.094);
  if (simple < 80) return simple;

  // Full Rothfusz regression
  let hi =
    -42.379 +
    2.04901523   * tF +
    10.14333127  * rh -
    0.22475541   * tF * rh -
    0.00683783   * tF * tF -
    0.05481717   * rh * rh +
    0.00122874   * tF * tF * rh +
    0.00085282   * tF * rh * rh -
    0.00000199   * tF * tF * rh * rh;

  // Low-humidity adjustment (Rothfusz eq. A)
  if (rh < 13 && tF >= 80 && tF <= 112) {
    hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
  }
  // High-humidity adjustment (Rothfusz eq. B)
  if (rh > 85 && tF >= 80 && tF <= 87) {
    hi += ((rh - 85) / 10) * ((87 - tF) / 5);
  }

  return hi;
}

function cToF(c: number): number { return c * 9 / 5 + 32; }

// Linear interpolation percentile on a sorted array
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (p / 100) * (sorted.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo);
}

function clamp(x: number): number {
  return Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0;
}

// ---------------------------------------------------------------------------
// Main computation
// ---------------------------------------------------------------------------
export function computeRisk(summary: ClimateSummary): RiskBreakdown {
  const { points } = summary;

  // Only process days that have a Tmax reading
  const vp = points.filter((p) => p.tmax !== undefined);
  const n  = vp.length;
  const shortWindow = n < 90;

  // ── TX90p & WSDI ──────────────────────────────────────────────────────────
  const tmaxSorted = vp.map((p) => p.tmax!).sort((a, b) => a - b);
  const p90 = n > 0 ? percentile(tmaxSorted, 90) : 35;

  // TX90p: fraction of days where Tmax exceeds local p90
  const aboveP90 = vp.filter((p) => p.tmax! > p90).length;
  const tx90p_raw = n > 0 ? (aboveP90 / n) * 100 : 0;
  // Normalise: 50 % of days above p90 → score 100
  const tx90p_norm = clamp((tx90p_raw / 50) * 100);

  // WSDI: count days belonging to runs of ≥6 consecutive Tmax > p90
  let wsdi_days = 0;
  let run = 0;
  for (const p of vp) {
    if (p.tmax! > p90) {
      run++;
    } else {
      if (run >= 6) wsdi_days += run;
      run = 0;
    }
  }
  if (run >= 6) wsdi_days += run;
  // Normalise: 30 % of the window in warm spells → score 100
  const wsdi_pct  = n > 0 ? (wsdi_days / n) * 100 : 0;
  const wsdi_norm = clamp((wsdi_pct / 30) * 100);

  // ── CDD — Consecutive Dry Days ────────────────────────────────────────────
  const pp = points.filter((p) => p.precip !== undefined);
  let maxCDD = 0, curCDD = 0;
  for (const p of pp) {
    if ((p.precip ?? 0) < 1) { curCDD++; maxCDD = Math.max(maxCDD, curCDD); }
    else curCDD = 0;
  }
  // Normalise: 60 consecutive dry days → score 100
  const cdd_norm = clamp((maxCDD / 60) * 100);

  // ── NOAA Heat Index exceedance ────────────────────────────────────────────
  const hiPoints       = vp.filter((p) => p.humidity !== undefined);
  const hi_available   = hiPoints.length > 0;
  let hi_danger_days   = 0;
  for (const p of hiPoints) {
    const hi = noaaHeatIndex(cToF(p.tmax!), p.humidity!);
    if (hi >= 103) hi_danger_days++; // NOAA "Danger" threshold
  }
  const hiN       = hiPoints.length || 1;
  const hi_pct    = (hi_danger_days / hiN) * 100;
  // Normalise: 30 % of days in Danger → score 100
  const hi_norm   = clamp((hi_pct / 30) * 100);

  // ── Composite TRI ─────────────────────────────────────────────────────────
  const score = Math.round(
    0.35 * tx90p_norm +
    0.30 * wsdi_norm  +
    0.20 * cdd_norm   +
    0.15 * hi_norm,
  );

  const grade = scoreToGrade(score);

  // ── Narrative notes ───────────────────────────────────────────────────────
  const notes: string[] = [];
  if (tx90p_raw > 15)
    notes.push(`TX90p ${tx90p_raw.toFixed(0)} % — above-normal heat frequency`);
  if (wsdi_days >= 6)
    notes.push(`WSDI ${wsdi_days} days in sustained warm spells (≥ 6-day runs)`);
  if (maxCDD >= 14)
    notes.push(`CDD ${maxCDD} — longest dry run in window`);
  if (hi_danger_days > 0)
    notes.push(`${hi_danger_days} day${hi_danger_days > 1 ? "s" : ""} at NOAA "Danger" apparent temperature (> 103 °F)`);
  if (!hi_available)
    notes.push("Humidity unavailable — Heat Index component set to 0");
  if (notes.length === 0)
    notes.push("No significant climate stress signals detected in this window.");
  if (shortWindow)
    notes.push(`Window is ${n} days — percentile estimates stabilise above 90 days.`);

  return {
    score,
    grade,
    components: {
      tx90p: Math.round(tx90p_norm),
      wsdi:  Math.round(wsdi_norm),
      cdd:   Math.round(cdd_norm),
      hi:    Math.round(hi_norm),
    },
    details: {
      p90_tmax:       Math.round(p90 * 10) / 10,
      tx90p_raw:      Math.round(tx90p_raw * 10) / 10,
      wsdi_days,
      cdd_max:        maxCDD,
      hi_danger_days,
      hi_available,
    },
    shortWindow,
    notes,
  };
}

function scoreToGrade(score: number): RiskGrade {
  if (score >= 80) return "F";
  if (score >= 60) return "D";
  if (score >= 40) return "C";
  if (score >= 20) return "B";
  return "A";
}

export const GRADE_TONE: Record<RiskGrade, { label: string; color: string }> = {
  A: { label: "Low",           color: "var(--accent-teal)" },
  B: { label: "Moderate-low",  color: "var(--accent-bright)" },
  C: { label: "Moderate",      color: "var(--accent-blue)" },
  D: { label: "High",          color: "var(--warm)" },
  F: { label: "Extreme",       color: "var(--danger)" },
};
