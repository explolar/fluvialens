// Standard stat tile — eyebrow label above, big numeric value below.
// Used inside cards on Atlas, Projections, Developers etc.
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="eyebrow mb-1.5">{label}</p>
      <p className="font-display text-2xl tabular text-fg">{value}</p>
    </div>
  );
}

// Inline compact stat — for tight grids inside other cards (e.g. Atlas sidebar).
export function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-soft border border-border-soft px-3 py-2.5">
      <p className="eyebrow text-[0.6rem] mb-1">{label}</p>
      <p className="font-display text-base tabular text-fg">{value}</p>
    </div>
  );
}

// Hero stat — big number above, descriptive label below.
// Used in the landing-page hero stats strip.
export function HeroStat({ top, bottom }: { top: string; bottom: string }) {
  return (
    <div>
      <p className="display text-2xl md:text-3xl tabular text-fg">{top}</p>
      <p className="mt-2 text-xs text-muted leading-relaxed max-w-[14ch]">{bottom}</p>
    </div>
  );
}
