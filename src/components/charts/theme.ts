// Shared visual tokens for all Recharts components.
// Keeps a single source of truth for chart palette, type, and tooltip styling.

import type { Scenario } from "@/lib/data/projection";

export const CHART_TEXT = "#94a3b8";
export const CHART_GRID = "rgba(255,255,255,0.08)";

// Variable colors — used across single, projection, and compare charts.
export const COLORS = {
  tmax: "#ffb84d", // warm amber — extreme/heat
  tmean: "#00d4f5", // bright cyan — accent
  tmin: "#3080ff", // electric blue — cool
  precip: "#00d294", // teal-green — water
} as const;

// Per-scenario stroke colors for the Compare chart.
export const SCENARIO_COLORS: Record<Scenario, string> = {
  rcp26: "#00d294",
  rcp45: "#00d4f5",
  rcp60: "#3080ff",
  rcp85: "#ffb84d",
};

export const tickStyle = {
  fontSize: 10,
  fill: CHART_TEXT,
  fontFamily: "var(--font-mono), monospace",
};

export const tooltipStyle = {
  background: "#0b1424",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: 12,
  fontSize: 12,
  fontFamily: "var(--font-sans), Nunito, sans-serif",
  padding: "10px 14px",
  color: "#ffffff",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
};

export const legendStyle = {
  fontSize: 11,
  fontFamily: "var(--font-mono), monospace",
  color: CHART_TEXT,
};

export const cursorFill = "rgba(255,255,255,0.04)";
