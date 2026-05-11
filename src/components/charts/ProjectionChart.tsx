"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProjectionPoint } from "@/lib/data/projection";
import {
  CHART_GRID,
  COLORS,
  cursorFill,
  legendStyle,
  tickStyle,
  tooltipStyle,
} from "./theme";

export function ProjectionChart({ data }: { data: ProjectionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="2 4" />
        <XAxis dataKey="year" tick={tickStyle} stroke={CHART_GRID} />
        <YAxis
          yAxisId="t"
          orientation="left"
          tick={tickStyle}
          unit="°"
          stroke={CHART_GRID}
          domain={["auto", "auto"]}
        />
        <YAxis
          yAxisId="p"
          orientation="right"
          tick={tickStyle}
          unit=" mm"
          stroke={CHART_GRID}
          domain={[0, "auto"]}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: cursorFill }} />
        <Legend wrapperStyle={legendStyle} iconType="line" />
        <Bar
          yAxisId="p"
          dataKey="precip_total"
          fill={COLORS.precip}
          name="Annual precip"
          opacity={0.5}
          radius={[2, 2, 0, 0]}
        />
        <Line yAxisId="t" type="monotone" dataKey="tmax_mean" stroke={COLORS.tmax} name="Tmax (annual mean)" dot={false} strokeWidth={2} />
        <Line yAxisId="t" type="monotone" dataKey="tmean_mean" stroke={COLORS.tmean} name="Tmean (annual mean)" dot={false} strokeWidth={2} />
        <Line yAxisId="t" type="monotone" dataKey="tmin_mean" stroke={COLORS.tmin} name="Tmin (annual mean)" dot={false} strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
