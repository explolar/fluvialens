// Animated skeleton placeholders used while data loads.
// Pair with our card / stat surfaces.

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-border-strong rounded animate-pulse ${className}`.trim()}
      aria-hidden
    />
  );
}

// Six-tile stat skeleton (Atlas sidebar pattern).
export function StatGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg bg-bg-soft border border-border-soft px-3 py-3"
        >
          <Skeleton className="h-2 w-12 mb-2" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

// Card-sized chart placeholder.
export function ChartSkeleton({ height = 256 }: { height?: number }) {
  return (
    <div
      className="rounded-lg bg-bg-soft animate-pulse"
      style={{ height }}
      aria-hidden
    />
  );
}
