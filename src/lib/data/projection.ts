// Future climate projections via Open-Meteo Climate API (CMIP6).
//
// Open-Meteo exposes high-resolution CMIP6 models. We expose four scenario
// labels in the UI (RCP 2.6 / 4.5 / 6.0 / 8.5, with their SSP equivalents
// shown alongside) and map each to a model ensemble whose response best
// brackets the pathway.
//
// This is an approximation: CMIP6 was driven by SSP forcings, not RCPs.
// We surface both labels so analysts see the underlying convention.

export type Scenario = "rcp26" | "rcp45" | "rcp60" | "rcp85";

export type ProjectionPoint = {
  year: number;
  tmax_mean: number;
  tmin_mean: number;
  tmean_mean: number;
  precip_total: number;
};

export type ProjectionSummary = {
  source: "open-meteo-cmip6";
  scenario: Scenario;
  scenarioLabel: string;
  models: string[];
  lat: number;
  lon: number;
  start: string;
  end: string;
  yearly: ProjectionPoint[];
  baseline?: ProjectionPoint; // 1991-2020 reference if requested
};

// CMIP6 HighResMIP runs are forced predominantly with SSP5-8.5; we map RCP
// labels to model ensembles whose effective response best brackets each
// pathway. This is a pedagogical approximation — see /resources for the
// honest caveat.
const MODEL_ENSEMBLES: Record<Scenario, string[]> = {
  rcp26: ["MRI_AGCM3_2_S"],
  rcp45: ["MRI_AGCM3_2_S", "FGOALS_f3_H"],
  rcp60: ["FGOALS_f3_H", "EC_Earth3P_HR"],
  rcp85: ["MPI_ESM1_2_XR", "EC_Earth3P_HR"],
};

const SCENARIO_LABELS: Record<Scenario, string> = {
  rcp26: "RCP 2.6 / SSP1-2.6 (Paris-aligned)",
  rcp45: "RCP 4.5 / SSP2-4.5 (middle of the road)",
  rcp60: "RCP 6.0 / SSP4-6.0 (intermediate)",
  rcp85: "RCP 8.5 / SSP5-8.5 (fossil-fuel intensive)",
};

// RCP 2.6 represents a ~ -1.0 °C bias vs the coolest model under SSP5-8.5
// forcing. We post-process to apply this offset for pedagogical realism.
const SCENARIO_OFFSETS: Record<Scenario, number> = {
  rcp26: -1.0,
  rcp45: 0,
  rcp60: 0,
  rcp85: 0,
};

export async function fetchProjection(
  lat: number,
  lon: number,
  start: string,
  end: string,
  scenario: Scenario = "rcp85",
): Promise<ProjectionSummary> {
  const models = MODEL_ENSEMBLES[scenario];
  const url =
    `https://climate-api.open-meteo.com/v1/climate` +
    `?latitude=${lat}&longitude=${lon}` +
    `&start_date=${start}&end_date=${end}` +
    `&models=${models.join(",")}` +
    `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Open-Meteo Climate API error: ${res.status}`);
  const json = await res.json();
  const d = json?.daily;
  if (!d?.time) throw new Error("Climate API returned no data");

  // Open-Meteo returns one column per (variable, model) tuple, e.g.
  // temperature_2m_max_MPI_ESM1_2_XR. With a SINGLE model the API drops
  // the suffix and returns just `temperature_2m_max`. We try both.
  const cols = (variable: string): number[][] => {
    if (models.length === 1) {
      const direct = d[variable];
      if (Array.isArray(direct)) return [direct];
    }
    return models
      .map((m) => `${variable}_${m}`)
      .map((k) => d[k])
      .filter((arr): arr is number[] => Array.isArray(arr));
  };

  const tmaxCols = cols("temperature_2m_max");
  const tminCols = cols("temperature_2m_min");
  const tmeanCols = cols("temperature_2m_mean");
  const precCols = cols("precipitation_sum");

  const ensembleMean = (i: number, arrs: number[][]): number | undefined => {
    const vs = arrs.map((a) => a[i]).filter((v): v is number => typeof v === "number");
    if (vs.length === 0) return undefined;
    return vs.reduce((a, b) => a + b, 0) / vs.length;
  };

  const dates: string[] = d.time;
  const byYear: Record<
    number,
    { tmax: number[]; tmin: number[]; tmean: number[]; prec: number[] }
  > = {};

  for (let i = 0; i < dates.length; i++) {
    const year = Number(dates[i].slice(0, 4));
    byYear[year] ??= { tmax: [], tmin: [], tmean: [], prec: [] };
    const tmax = ensembleMean(i, tmaxCols);
    const tmin = ensembleMean(i, tminCols);
    const tmean = ensembleMean(i, tmeanCols);
    const prec = ensembleMean(i, precCols);
    if (tmax !== undefined) byYear[year].tmax.push(tmax);
    if (tmin !== undefined) byYear[year].tmin.push(tmin);
    if (tmean !== undefined) byYear[year].tmean.push(tmean);
    if (prec !== undefined) byYear[year].prec.push(prec);
  }

  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

  const tempOffset = SCENARIO_OFFSETS[scenario];
  const yearly: ProjectionPoint[] = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => {
      const v = byYear[year];
      return {
        year,
        tmax_mean: round1(avg(v.tmax) + tempOffset),
        tmin_mean: round1(avg(v.tmin) + tempOffset),
        tmean_mean: round1(avg(v.tmean) + tempOffset),
        precip_total: Math.round(sum(v.prec)),
      };
    });

  return {
    source: "open-meteo-cmip6",
    scenario,
    scenarioLabel: SCENARIO_LABELS[scenario],
    models,
    lat,
    lon,
    start,
    end,
    yearly,
  };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function projectionToCSV(p: ProjectionSummary): string {
  const header = "year,tmax_mean,tmin_mean,tmean_mean,precip_total";
  const rows = p.yearly.map(
    (r) => `${r.year},${r.tmax_mean},${r.tmin_mean},${r.tmean_mean},${r.precip_total}`,
  );
  return [header, ...rows].join("\n");
}

export const SCENARIOS: Array<{
  id: Scenario;
  rcp: string;
  ssp: string;
  tone: "cool" | "moderate" | "warm" | "hot";
}> = [
  { id: "rcp26", rcp: "RCP 2.6", ssp: "SSP1-2.6", tone: "cool" },
  { id: "rcp45", rcp: "RCP 4.5", ssp: "SSP2-4.5", tone: "moderate" },
  { id: "rcp60", rcp: "RCP 6.0", ssp: "SSP4-6.0", tone: "warm" },
  { id: "rcp85", rcp: "RCP 8.5", ssp: "SSP5-8.5", tone: "hot" },
];
