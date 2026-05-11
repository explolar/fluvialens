import { NextRequest, NextResponse } from "next/server";
import { fetchLive } from "@/lib/data/live";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const city = sp.get("city") ?? "Unknown";
  const country = sp.get("country") ?? undefined;

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  try {
    const data = await fetchLive(lat, lon, city, country);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
