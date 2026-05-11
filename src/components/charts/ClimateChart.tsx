"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { ClimatePoint } from "@/lib/data/climate";
import {
  CHART_GRID,
  COLORS,
  cursorFill,
  legendStyle,
  tickStyle,
  tooltipStyle,
} from "./theme";

const chartMargin = { top: 6, right: 6, left: -10, bottom: 0 };

export function TempChart({ data }: { data: ClimatePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={chartMargin}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="2 4" />
        <XAxis dataKey="date" tick={tickStyle} minTickGap={30} stroke={CHART_GRID} />
        <YAxis tick={tickStyle} unit="°" stroke={CHART_GRID} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={legendStyle} iconType="line" />
        <Line type="monotone" dataKey="tmax" stroke={COLORS.tmax} strokeWidth={1.75} name="Tmax" dot={false} />
        <Line type="monotone" dataKey="tmean" stroke={COLORS.tmean} strokeWidth={1.75} name="Tmean" dot={false} />
        <Line type="monotone" dataKey="tmin" stroke={COLORS.tmin} strokeWidth={1.75} name="Tmin" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PrecipChart({ data }: { data: ClimatePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={chartMargin}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="2 4" />
        <XAxis dataKey="date" tick={tickStyle} minTickGap={30} stroke={CHART_GRID} />
        <YAxis tick={tickStyle} unit=" mm" stroke={CHART_GRID} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: cursorFill }} />
        <Bar dataKey="precip" fill={COLORS.precip} name="Precipitation" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
