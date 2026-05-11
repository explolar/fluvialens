import { NextRequest, NextResponse } from "next/server";
import { fetchClimate, toCSV } from "@/lib/data/climate";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const start = sp.get("start") ?? "2023-01-01";
  const end = sp.get("end") ?? "2023-12-31";
  const source = (sp.get("source") ?? "open-meteo") as "nasa-power" | "open-meteo";
  const format = sp.get("format") ?? "json";

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required numbers" }, { status: 400 });
  }

  try {
    const data = await fetchClimate(lat, lon, start, end, source);

    if (format === "csv") {
      const csv = toCSV(data.points);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="climate_${lat}_${lon}_${start}_${end}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
