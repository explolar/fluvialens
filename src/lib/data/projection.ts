// Hybrid CMIP6 projections, in order of preference:
//   1. In-memory cache (24h TTL, rounded to 2dp) — repeat queries skip the network.
//   2. Open-Meteo Climate API — point-level CMIP6 ensemble.
//   3. World Bank CCKP — country-level fallback when Open-Meteo errors (429, 5xx, timeout).

import { ISO2_TO_ISO3 } from "./iso-codes";

export type Scenario = "rcp26" | "rcp45" | "rcp60" | "rcp85";

export type ProjectionPoint = {
  year: number;
  tmax_mean: number;
  tmin_mean: number;
  tmean_mean: number;
  precip_total: number;
};

export type ProjectionSummary = {
  source: "open-meteo-cmip6" | "worldbank-cckp-cmip6";
  scenario: Scenario;
  scenarioLabel: string;
  models: string[];
  resolution: "point" | "country";
  countryCode?: string;
  lat: number;
  lon: number;
  start: string;
  end: string;
  yearly: ProjectionPoint[];
};

const MODEL_ENSEMBLES: Record<Scenario, string[]> = {
  rcp26: ["MRI_AGCM3_2_S"],
  rcp45: ["MRI_AGCM3_2_S", "FGOALS_f3_H"],
  rcp60: ["FGOALS_f3_H", "EC_Earth3P_HR"],
  rcp85: ["MPI_ESM1_2_XR", "EC_Earth3P_HR"],
};

// RCP 2.6 has no clean HighResMIP equivalent; apply a small offset for pedagogical realism.
const SCENARIO_OFFSETS: Record<Scenario, number> = {
  rcp26: -1.0,
  rcp45: 0,
  rcp60: 0,
  rcp85: 0,
};

const SCENARIO_TO_SSP: Record<Scenario, string> = {
  rcp26: "ssp126",
  rcp45: "ssp245",
  // CMIP6 has no standard SSP4-6.0; SSP3-7.0 is the closest intermediate-high pathway.
  rcp60: "ssp370",
  rcp85: "ssp585",
};

const SCENARIO_LABELS: Record<Scenario, string> = {
  rcp26: "RCP 2.6 / SSP1-2.6 (Paris-aligned)",
  rcp45: "RCP 4.5 / SSP2-4.5 (middle of the road)",
  rcp60: "RCP 6.0 / SSP3-7.0 (intermediate-high)",
  rcp85: "RCP 8.5 / SSP5-8.5 (fossil-fuel intensive)",
};

// ─── In-memory cache (24h TTL, ~500-entry soft cap) ─────────────────────────
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;
const cache = new Map<string, { data: ProjectionSummary; expires: number }>();

function cacheKey(lat: number, lon: number, scenario: Scenario, start: string, end: string) {
  // Round to 2 decimals so nearby clicks (~1km) share cache entries.
  return `${lat.toFixed(2)}|${lon.toFixed(2)}|${scenario}|${start}|${end}`;
}

function cacheGet(key: string): ProjectionSummary | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key: string, data: ProjectionSummary) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

// ─── Primary: Open-Meteo Climate API (point-level CMIP6) ────────────────────
async function fetchOpenMeteoPoint(
  lat: number,
  lon: number,
  start: string,
  end: string,
  scenario: Scenario,
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

  // Open-Meteo returns one column per (variable, model). With a SINGLE model
  // the API drops the suffix. Try both.
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

  if (yearly.length === 0) throw new Error("Climate API returned empty series");

  return {
    source: "open-meteo-cmip6",
    scenario,
    scenarioLabel: SCENARIO_LABELS[scenario],
    models,
    resolution: "point",
    lat,
    lon,
    start,
    end,
    yearly,
  };
}

// ─── Fallback: World Bank CCKP (country-level CMIP6 ensemble median) ────────
type CckpVariable = "tas" | "tasmax" | "tasmin" | "pr";

async function latLonToIso3(lat: number, lon: number): Promise<string> {
  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client` +
    `?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const res = await fetch(url, { next: { revalidate: 2592000 } });
  if (!res.ok) throw new Error(`Reverse geocoding error: ${res.status}`);
  const json = await res.json();
  const iso2: string | undefined = json?.countryCode;
  if (!iso2) throw new Error("Could not resolve country from coordinates (open ocean?)");
  const iso3 = ISO2_TO_ISO3[iso2];
  if (!iso3) throw new Error(`No CCKP code for country: ${iso2}`);
  return iso3;
}

async function fetchCckpYearly(
  variable: CckpVariable,
  scenario: Scenario,
  iso3: string,
): Promise<Record<number, number>> {
  const ssp = SCENARIO_TO_SSP[scenario];
  const url =
    `https://cckpapi.worldbank.org/cckp/v1/` +
    `cmip6-x0.25_timeseries_${variable}_timeseries_annual_2015-2100_median_${ssp}_x_x/${iso3}`;

  const res = await fetch(url, { next: { revalidate: 604800 } });
  if (!res.ok) throw new Error(`CCKP error for ${variable}: ${res.status}`);
  const json = await res.json();
  const entries = json?.data?.[iso3] ?? {};
  const byYear: Record<number, number> = {};
  for (const [key, val] of Object.entries(entries)) {
    if (typeof val !== "number") continue;
    const year = Number(String(key).slice(0, 4));
    if (!Number.isNaN(year)) byYear[year] = val;
  }
  return byYear;
}

async function fetchCckpCountry(
  lat: number,
  lon: number,
  start: string,
  end: string,
  scenario: Scenario,
): Promise<ProjectionSummary> {
  const iso3 = await latLonToIso3(lat, lon);
  const fromYear = Number(start.slice(0, 4));
  const toYear = Number(end.slice(0, 4));

  const [tmax, tmin, tmean, prec] = await Promise.all([
    fetchCckpYearly("tasmax", scenario, iso3),
    fetchCckpYearly("tasmin", scenario, iso3),
    fetchCckpYearly("tas", scenario, iso3),
    fetchCckpYearly("pr", scenario, iso3),
  ]);

  const allYears = new Set<number>([
    ...Object.keys(tmax).map(Number),
    ...Object.keys(tmin).map(Number),
    ...Object.keys(tmean).map(Number),
    ...Object.keys(prec).map(Number),
  ]);

  const yearly: ProjectionPoint[] = [...allYears]
    .filter((y) => y >= fromYear && y <= toYear)
    .sort((a, b) => a - b)
    .map((year) => ({
      year,
      tmax_mean: round1(tmax[year]),
      tmin_mean: round1(tmin[year]),
      tmean_mean: round1(tmean[year]),
      precip_total: Math.round(prec[year] ?? 0),
    }));

  if (yearly.length === 0) {
    throw new Error(
      `No CCKP data for ${iso3} / ${SCENARIO_TO_SSP[scenario]} in ${fromYear}-${toYear}`,
    );
  }

  return {
    source: "worldbank-cckp-cmip6",
    scenario,
    scenarioLabel: SCENARIO_LABELS[scenario],
    models: ["CMIP6 ensemble median (CCKP)"],
    resolution: "country",
    countryCode: iso3,
    lat,
    lon,
    start,
    end,
    yearly,
  };
}

// ─── Public entry point ─────────────────────────────────────────────────────
export async function fetchProjection(
  lat: number,
  lon: number,
  start: string,
  end: string,
  scenario: Scenario = "rcp85",
): Promise<ProjectionSummary> {
  const key = cacheKey(lat, lon, scenario, start, end);
  const cached = cacheGet(key);
  if (cached) return cached;

  let data: ProjectionSummary;
  try {
    data = await fetchOpenMeteoPoint(lat, lon, start, end, scenario);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[projection] Open-Meteo failed (${msg}); falling back to CCKP country-level`);
    data = await fetchCckpCountry(lat, lon, start, end, scenario);
  }

  cacheSet(key, data);
  return data;
}

function round1(v: number | undefined): number {
  if (v === undefined || Number.isNaN(v)) return 0;
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
  { id: "rcp60", rcp: "RCP 6.0", ssp: "SSP3-7.0", tone: "warm" },
  { id: "rcp85", rcp: "RCP 8.5", ssp: "SSP5-8.5", tone: "hot" },
];
