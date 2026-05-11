import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datasets · Terralens",
  description:
    "Browse the climate dataset catalog and build a custom CSV by city, date range and source.",
};

export default function DatasetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
