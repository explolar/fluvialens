// Labelled form field with our standard eyebrow style.
// Pair with <input className="input-field"> or <select className="input-field">.
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
