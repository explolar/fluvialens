// Terralens mark — surveyor's aperture crosshair.
// Outer ring + crosshair lines with center gap + filled signal dot.
// Works at 16px–64px. All geometry on a 32×32 grid.

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      aria-hidden
    >
      {/* Outer ring */}
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="var(--fg)"
        strokeWidth="1.5"
        opacity="0.9"
      />

      {/* Horizontal crosshair — gap of 5px each side of center */}
      <line x1="3"  y1="16" x2="11" y2="16" stroke="var(--fg)" strokeWidth="1.2" opacity="0.7" />
      <line x1="21" y1="16" x2="29" y2="16" stroke="var(--fg)" strokeWidth="1.2" opacity="0.7" />

      {/* Vertical crosshair — gap of 5px each side of center */}
      <line x1="16" y1="3"  x2="16" y2="11" stroke="var(--fg)" strokeWidth="1.2" opacity="0.7" />
      <line x1="16" y1="21" x2="16" y2="29" stroke="var(--fg)" strokeWidth="1.2" opacity="0.7" />

      {/* Signal dot — accent orange, the only color in the mark */}
      <circle cx="16" cy="16" r="2.5" fill="var(--accent)" />
    </svg>
  );
}
