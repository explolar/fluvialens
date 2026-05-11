import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon — Terralens",
  description:
    "Typefaces, data sources, technology and attribution. How Terralens was made.",
};

export default function ColophonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
