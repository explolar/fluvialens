import type { GeoResult } from "@/lib/types";

export type { GeoResult };

export async function geocode(q: string): Promise<GeoResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
  const json = await res.json();
  return (json?.results ?? []).map(
    (r: {
      name: string;
      country?: string;
      admin1?: string;
      latitude: number;
      longitude: number;
    }) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      lat: r.latitude,
      lon: r.longitude,
    }),
  );
}
