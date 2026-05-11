import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projections · Terralens",
  description:
    "Annual climate trajectories under RCP 2.6, 4.5, 6.0 and 8.5 from a CMIP6 ensemble. 2030 – 2050.",
};

export default function ProjectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
