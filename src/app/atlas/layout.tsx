import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlas · Terralens",
  description:
    "Click anywhere on Earth and fetch 44 years of daily climate data — temperature, precipitation, hot-day counts.",
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
