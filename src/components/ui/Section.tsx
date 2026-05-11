// Standard page section — eyebrow label + content.
// Used in /resources and inside long-scroll pages.
export function Section({
  eyebrow,
  className = "",
  children,
}: {
  eyebrow: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`mt-16 ${className}`.trim()}>
      <p className="eyebrow mb-4">{eyebrow}</p>
      {children}
    </section>
  );
}
