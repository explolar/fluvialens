import { NextRequest, NextResponse } from "next/server";
import { fetchProjection, projectionToCSV, type Scenario } from "@/lib/data/projection";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const start = sp.get("start") ?? "2030-01-01";
  const end = sp.get("end") ?? "2050-12-31";
  const scenario = (sp.get("scenario") ?? "rcp85") as Scenario;
  const format = sp.get("format") ?? "json";

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required numbers" }, { status: 400 });
  }
  if (!["rcp26", "rcp45", "rcp60", "rcp85"].includes(scenario)) {
    return NextResponse.json(
      { error: "scenario must be one of rcp26, rcp45, rcp60, rcp85" },
      { status: 400 },
    );
  }
  // Open-Meteo Climate API uses HighResMIP runs which end in 2050.
  const endYear = Number(end.slice(0, 4));
  const startYear = Number(start.slice(0, 4));
  if (endYear > 2050 || startYear < 1950) {
    return NextResponse.json(
      {
        error:
          "Projection range must be between 1950 and 2050 (HighResMIP CMIP6 ensemble limit).",
      },
      { status: 400 },
    );
  }

  try {
    const data = await fetchProjection(lat, lon, start, end, scenario);

    if (format === "csv") {
      const csv = projectionToCSV(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="projection_${scenario}_${lat}_${lon}_${start}_${end}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
