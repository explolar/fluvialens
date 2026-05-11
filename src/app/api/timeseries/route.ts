import { NextRequest, NextResponse } from "next/server";
import { fetchTimeSeries } from "@/lib/data/climate";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const from = Number(sp.get("from") ?? 1990);
  const to = Number(sp.get("to") ?? new Date().getFullYear() - 1);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }
  if (from < 1981 || to < from) {
    return NextResponse.json(
      { error: "Invalid year range — from must be ≥ 1981 and ≤ to" },
      { status: 400 },
    );
  }

  try {
    const data = await fetchTimeSeries(lat, lon, from, to);
    return NextResponse.json({ lat, lon, from, to, years: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
