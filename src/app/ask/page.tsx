"use client";

import { useState, useRef, useEffect } from "react";
import { TempChart, PrecipChart } from "@/components/charts/ClimateChart";
import type { ClimateSummary, ClimatePoint } from "@/lib/data/climate";

type Msg = { role: "user" | "assistant"; content: string };

type ToolResult = { name: string; args: unknown; result: unknown };

const examples = [
  "How hot was Mumbai in summer 2023?",
  "Projected mean temperature in Delhi 2040–2050 under RCP 8.5?",
  "Total rainfall in Bengaluru last year?",
  "Compare projected temperatures in Chennai under RCP 2.6, RCP 4.5 and RCP 8.5",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setMessages([...next, { role: "assistant", content: j.reply }]);
      setToolResults(j.toolResults ?? []);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            e instanceof Error ? `Error: ${e.message}` : "Something went wrong.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const latestClimate = [...toolResults]
    .reverse()
    .find((t) => t.name === "get_climate_data" && hasPoints(t.result));

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 md:py-20">
      <div className="mb-12">
        <p className="eyebrow mb-3">Conversational AI</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">
          Ask Terralens.
        </h1>
        <p className="mt-5 text-muted text-lg max-w-2xl leading-relaxed">
          The agent picks the right tool — geocode, historical fetch, CMIP6
          projection — based on your question, then writes you the answer with
          its sources.
        </p>
      </div>

      {messages.length === 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {examples.map((e) => (
            <button
              key={e}
              onClick={() => send(e)}
              className="card card-hover text-left px-5 py-4 text-sm group"
            >
              <span className="eyebrow text-muted-soft block mb-2">
                Try a question
              </span>
              <span className="text-fg leading-snug">{e}</span>
              <span className="mt-3 inline-block text-xs text-muted group-hover:text-fg transition">
                Run →
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-2xl ${m.role === "user" ? "ml-auto" : ""}`}
          >
            <p className="eyebrow mb-1.5 text-muted-soft">
              {m.role === "user" ? "You" : "Terralens"}
            </p>
            <div
              className={`rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-fg text-bg"
                  : "bg-bg-warm text-fg border border-border-soft"
              }`}
            >
              {m.content || (m.role === "assistant" && busy ? "…" : "")}
            </div>
          </div>
        ))}

        {busy && (
          <div className="max-w-2xl">
            <p className="eyebrow mb-1.5 text-muted-soft">Terralens</p>
            <div className="rounded-2xl px-5 py-4 text-sm bg-bg-warm border border-border-soft text-muted inline-flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-soft animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-soft animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-soft animate-bounce [animation-delay:240ms]" />
              </span>
              <span>Calling tools…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {latestClimate && <ChartsPanel result={latestClimate.result as ClimateSummary} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-12 sticky bottom-6 z-10"
      >
        <div className="card flex gap-2 p-2 shadow-[0_8px_30px_rgba(10,10,10,0.06)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about local climate…"
            className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </div>
      </form>

      {toolResults.length > 0 && (
        <details className="mt-8 text-xs">
          <summary className="cursor-pointer eyebrow text-muted-soft hover:text-muted">
            Tool calls · {toolResults.length}
          </summary>
          <pre className="mt-3 p-4 bg-bg-warm border border-border-soft rounded-lg overflow-auto max-h-64 font-mono">
            {JSON.stringify(
              toolResults.map((t) => ({ name: t.name, args: t.args })),
              null,
              2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

function ChartsPanel({ result }: { result: ClimateSummary }) {
  const points: ClimatePoint[] = result.points ?? [];
  if (points.length === 0) return null;
  return (
    <div className="mt-6 grid sm:grid-cols-2 gap-4">
      <div className="card p-5">
        <p className="eyebrow mb-3">Temperature</p>
        <TempChart data={points} />
      </div>
      <div className="card p-5">
        <p className="eyebrow mb-3">Precipitation</p>
        <PrecipChart data={points} />
      </div>
    </div>
  );
}

function hasPoints(r: unknown): boolean {
  return !!(
    r &&
    typeof r === "object" &&
    "points" in r &&
    Array.isArray((r as { points: unknown[] }).points) &&
    (r as { points: unknown[] }).points.length > 0
  );
}
