"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProjectionPoint, Scenario } from "@/lib/data/projection";
import {
  CHART_GRID,
  SCENARIO_COLORS,
  cursorFill,
  legendStyle,
  tickStyle,
  tooltipStyle,
} from "./theme";

export type Series = {
  scenario: Scenario;
  label: string;
  data: ProjectionPoint[];
};

export function CompareProjectionChart({ series }: { series: Series[] }) {
  // Merge by year — recharts wants one row per x-axis tick.
  const allYears = Array.from(
    new Set(series.flatMap((s) => s.data.map((d) => d.year))),
  ).sort((a, b) => a - b);

  const merged = allYears.map((year) => {
    const row: Record<string, number | string> = { year };
    for (const s of series) {
      const pt = s.data.find((d) => d.year === year);
      if (pt) row[`tmean_${s.scenario}`] = pt.tmean_mean;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={merged} margin={{ top: 10, right: 6, left: -10, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="2 4" />
        <XAxis dataKey="year" tick={tickStyle} stroke={CHART_GRID} />
        <YAxis tick={tickStyle} unit="°" stroke={CHART_GRID} domain={["auto", "auto"]} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: cursorFill }} />
        <Legend wrapperStyle={legendStyle} iconType="line" />
        {series.map((s) => (
          <Line
            key={s.scenario}
            type="monotone"
            dataKey={`tmean_${s.scenario}`}
            stroke={SCENARIO_COLORS[s.scenario]}
            strokeWidth={2.5}
            name={s.label}
            dot={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
