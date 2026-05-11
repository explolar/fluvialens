import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { fetchClimate } from "@/lib/data/climate";
import { fetchProjection, type Scenario } from "@/lib/data/projection";
import { geocode } from "@/lib/data/geocode";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are Terralens, a climate-data assistant built by WeatherEx AI. You answer questions about historical, recent and projected future climate using three tools:

- geocode_location: turn a place name into lat/lon
- get_climate_data: fetch daily historical temperature and precipitation (1981–present) for a lat/lon and date range
- get_climate_projection: fetch annual projected temperature and precipitation under one of four scenarios for years between 2030 and 2050. Scenarios: rcp26 (RCP 2.6 / SSP1-2.6, Paris-aligned), rcp45 (RCP 4.5 / SSP2-4.5, middle of the road), rcp60 (RCP 6.0 / SSP4-6.0, intermediate), rcp85 (RCP 8.5 / SSP5-8.5, fossil-fuelled). When citing, mention both RCP and SSP labels.

Workflow:
1. Identify the location, timeframe, and whether the question is about the past or the future.
2. Call geocode_location for coordinates if a place was given.
3. For past/recent dates → get_climate_data. For future dates (2030–2050) → get_climate_projection with the appropriate scenario (default to RCP 8.5 unless the user asks otherwise).
4. Summarise findings in plain English. Quote the numbers (avg temp, hot days, projected warming) — do not make them up.
5. For projection answers, always state the scenario (e.g. "under RCP 8.5") and that this is from a CMIP6 model ensemble.

Keep answers under 200 words. Be concrete. If you have no data, say so.`;

const tools = [
  {
    type: "function" as const,
    function: {
      name: "geocode_location",
      description: "Find latitude/longitude for a city, region or country name.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "City, region or country name" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_climate_data",
      description:
        "Fetch daily HISTORICAL climate data (temperature, precipitation, humidity) for a lat/lon and date range, between 1981 and the present. Returns aggregated stats and a sample of points.",
      parameters: {
        type: "object",
        properties: {
          lat: { type: "number" },
          lon: { type: "number" },
          start: { type: "string", description: "ISO date YYYY-MM-DD" },
          end: { type: "string", description: "ISO date YYYY-MM-DD" },
        },
        required: ["lat", "lon", "start", "end"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_climate_projection",
      description:
        "Fetch FUTURE annual climate projections from a CMIP6 model ensemble for a lat/lon and date range. Available between 2030 and 2050. Returns yearly mean Tmax, Tmin, Tmean and total precipitation under the chosen scenario.",
      parameters: {
        type: "object",
        properties: {
          lat: { type: "number" },
          lon: { type: "number" },
          start: { type: "string", description: "ISO date YYYY-MM-DD, year 2030 or later" },
          end: { type: "string", description: "ISO date YYYY-MM-DD, year 2050 or earlier" },
          scenario: {
            type: "string",
            enum: ["rcp26", "rcp45", "rcp60", "rcp85"],
            description:
              "rcp26 (RCP 2.6 / SSP1-2.6, Paris-aligned), rcp45 (RCP 4.5 / SSP2-4.5, middle of the road), rcp60 (RCP 6.0 / SSP4-6.0, intermediate), rcp85 (RCP 8.5 / SSP5-8.5, fossil-fuel intensive)",
          },
        },
        required: ["lat", "lon", "start", "end", "scenario"],
      },
    },
  },
];

type ChatMsg = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Ask Terralens is offline. The agent is being configured — please try again shortly.",
      },
      { status: 503 },
    );
  }

  const body = await req.json();
  const userMessages: { role: "user" | "assistant"; content: string }[] =
    body.messages ?? [];

  const groq = new Groq({ apiKey });
  const messages: ChatMsg[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userMessages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const toolResults: Array<{ name: string; args: unknown; result: unknown }> = [];

  for (let step = 0; step < 4; step++) {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages as Parameters<typeof groq.chat.completions.create>[0]["messages"],
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    });

    const msg = completion.choices[0].message;
    messages.push({
      role: "assistant",
      content: msg.content ?? null,
      tool_calls: msg.tool_calls?.map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
    });

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return NextResponse.json({
        reply: msg.content ?? "",
        toolResults,
      });
    }

    for (const call of msg.tool_calls) {
      const args = safeJSON(call.function.arguments);
      let result: unknown;
      try {
        if (call.function.name === "geocode_location") {
          const r = await geocode(String(args.query ?? ""));
          result = r.slice(0, 3);
        } else if (call.function.name === "get_climate_data") {
          result = await fetchClimate(
            Number(args.lat),
            Number(args.lon),
            String(args.start),
            String(args.end),
            "open-meteo",
          );
        } else if (call.function.name === "get_climate_projection") {
          result = await fetchProjection(
            Number(args.lat),
            Number(args.lon),
            String(args.start),
            String(args.end),
            (args.scenario as Scenario) ?? "rcp85",
          );
        } else {
          result = { error: `unknown tool ${call.function.name}` };
        }
      } catch (e) {
        result = { error: e instanceof Error ? e.message : "tool error" };
      }

      toolResults.push({ name: call.function.name, args, result });

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: call.function.name,
        content: JSON.stringify(trimToolResult(result)),
      });
    }
  }

  return NextResponse.json({
    reply: "I ran out of tool steps without a final answer. Try a simpler question.",
    toolResults,
  });
}

function safeJSON(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

// Tool results can be huge (365 daily points). Trim before sending back to LLM.
function trimToolResult(r: unknown): unknown {
  if (r && typeof r === "object" && "points" in r) {
    const obj = r as { points: unknown[]; [k: string]: unknown };
    return { ...obj, points: obj.points.slice(0, 30), n_points_total: obj.points.length };
  }
  return r;
}
