export type ClimatePoint = {
  date: string;
  tmax?: number;
  tmin?: number;
  tmean?: number;
  precip?: number;
  humidity?: number;
};

export type ClimateSummary = {
  source: "nasa-power" | "open-meteo";
  lat: number;
  lon: number;
  start: string;
  end: string;
  points: ClimatePoint[];
  stats: {
    avgTmean?: number;
    avgTmax?: number;
    avgTmin?: number;
    totalPrecip?: number;
    hotDays?: number;
    dryDays?: number;
    rainyDays?: number;
  };
};

const ymd = (d: string) => d.replace(/-/g, "");

export async function fetchNasaPower(
  lat: number,
  lon: number,
  start: string,
  end: string,
): Promise<ClimateSummary> {
  const params = "T2M_MAX,T2M_MIN,T2M,PRECTOTCORR,RH2M";
  const url =
    `https://power.larc.nasa.gov/api/temporal/daily/point` +
    `?parameters=${params}&community=RE` +
    `&latitude=${lat}&longitude=${lon}` +
    `&start=${ymd(start)}&end=${ymd(end)}&format=JSON`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`NASA POWER error: ${res.status}`);
  const json = await res.json();
  const p = json?.properties?.parameter ?? {};
  const dates = Object.keys(p.T2M ?? p.T2M_MAX ?? {});

  const points: ClimatePoint[] = dates.map((d) => {
    const isoDate = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    return {
      date: isoDate,
      tmax: clean(p.T2M_MAX?.[d]),
      tmin: clean(p.T2M_MIN?.[d]),
      tmean: clean(p.T2M?.[d]),
      precip: clean(p.PRECTOTCORR?.[d]),
      humidity: clean(p.RH2M?.[d]),
    };
  });

  return {
    source: "nasa-power",
    lat,
    lon,
    start,
    end,
    points,
    stats: computeStats(points),
  };
}

export async function fetchOpenMeteo(
  lat: number,
  lon: number,
  start: string,
  end: string,
): Promise<ClimateSummary> {
  const url =
    `https://archive-api.open-meteo.com/v1/archive` +
    `?latitude=${lat}&longitude=${lon}` +
    `&start_date=${start}&end_date=${end}` +
    `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean` +
    `&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const json = await res.json();
  const d = json?.daily;
  if (!d?.time) throw new Error("Open-Meteo returned no data");

  const points: ClimatePoint[] = d.time.map((date: string, i: number) => ({
    date,
    tmax: d.temperature_2m_max?.[i] ?? undefined,
    tmin: d.temperature_2m_min?.[i] ?? undefined,
    tmean: d.temperature_2m_mean?.[i] ?? undefined,
    precip: d.precipitation_sum?.[i] ?? undefined,
    humidity: d.relative_humidity_2m_mean?.[i] ?? undefined,
  }));

  return {
    source: "open-meteo",
    lat,
    lon,
    start,
    end,
    points,
    stats: computeStats(points),
  };
}

export async function fetchClimate(
  lat: number,
  lon: number,
  start: string,
  end: string,
  source: "nasa-power" | "open-meteo" = "open-meteo",
): Promise<ClimateSummary> {
  if (source === "nasa-power") return fetchNasaPower(lat, lon, start, end);
  return fetchOpenMeteo(lat, lon, start, end);
}

function clean(v: number | undefined): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (v === -999 || v < -990) return undefined;
  return v;
}

function computeStats(points: ClimatePoint[]) {
  const valid = points.filter((p) => p.tmean !== undefined);
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined;

  const tmaxs = points.map((p) => p.tmax).filter((v): v is number => v !== undefined);
  const tmins = points.map((p) => p.tmin).filter((v): v is number => v !== undefined);
  const tmeans = points.map((p) => p.tmean).filter((v): v is number => v !== undefined);
  const precs = points.map((p) => p.precip).filter((v): v is number => v !== undefined);

  const hotDays = tmaxs.filter((t) => t >= 35).length;
  const rainyDays = precs.filter((p) => p >= 1).length;
  const dryDays = precs.filter((p) => p < 1).length;

  return {
    avgTmean: avg(tmeans),
    avgTmax: avg(tmaxs),
    avgTmin: avg(tmins),
    totalPrecip: precs.reduce((a, b) => a + b, 0),
    hotDays,
    dryDays,
    rainyDays,
    nValid: valid.length,
  };
}

export type YearAggregate = {
  year: number;
  hotDays: number;
  rainyDays: number;
  dryDays: number;
  avgTmax?: number;
  avgTmin?: number;
  totalPrecip: number;
};

/**
 * Fetch a long history (multi-decade) and aggregate to one row per year.
 * Used by the Atlas time-slider.
 */
export async function fetchTimeSeries(
  lat: number,
  lon: number,
  fromYear: number,
  toYear: number,
): Promise<YearAggregate[]> {
  const start = `${fromYear}-01-01`;
  const end = `${toYear}-12-31`;
  const summary = await fetchOpenMeteo(lat, lon, start, end);

  const byYear: Record<number, ClimatePoint[]> = {};
  for (const p of summary.points) {
    const y = Number(p.date.slice(0, 4));
    (byYear[y] ??= []).push(p);
  }

  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined;

  return Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => {
      const pts = byYear[year];
      const tmaxs = pts.map((p) => p.tmax).filter((v): v is number => v !== undefined);
      const tmins = pts.map((p) => p.tmin).filter((v): v is number => v !== undefined);
      const precs = pts.map((p) => p.precip).filter((v): v is number => v !== undefined);
      return {
        year,
        hotDays: tmaxs.filter((t) => t >= 35).length,
        rainyDays: precs.filter((p) => p >= 1).length,
        dryDays: precs.filter((p) => p < 1).length,
        avgTmax: avg(tmaxs),
        avgTmin: avg(tmins),
        totalPrecip: Math.round(precs.reduce((a, b) => a + b, 0)),
      };
    });
}

export function toCSV(points: ClimatePoint[]): string {
  const header = "date,tmax,tmin,tmean,precip,humidity";
  const rows = points.map(
    (p) =>
      `${p.date},${p.tmax ?? ""},${p.tmin ?? ""},${p.tmean ?? ""},${p.precip ?? ""},${p.humidity ?? ""}`,
  );
  return [header, ...rows].join("\n");
}
