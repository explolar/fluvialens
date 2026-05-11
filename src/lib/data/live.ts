// Live current-conditions snapshot via Open-Meteo's forecast endpoint.

export type LiveSnapshot = {
  lat: number;
  lon: number;
  city: string;
  country?: string;
  temperature: number;
  apparent: number;
  humidity: number;
  precip: number;
  wind: number;
  weatherCode: number;
  isDay: boolean;
  observedAt: string;
};

export async function fetchLive(
  lat: number,
  lon: number,
  city: string,
  country?: string,
): Promise<LiveSnapshot> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` +
    `&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 600 } }); // 10 min cache
  if (!res.ok) throw new Error(`Open-Meteo forecast error: ${res.status}`);
  const json = await res.json();
  const c = json?.current;
  if (!c) throw new Error("No current data");

  return {
    lat,
    lon,
    city,
    country,
    temperature: c.temperature_2m,
    apparent: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    precip: c.precipitation,
    wind: c.wind_speed_10m,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    observedAt: c.time,
  };
}

// WMO weather code → short label
export function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}
