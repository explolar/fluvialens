import type { MetadataRoute } from "next";
import { stories } from "@/lib/content/stories";

const SITE = "https://terralens.weatherex.ai"; // change when domain is live

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/",
    "/atlas",
    "/projections",
    "/ask",
    "/datasets",
    "/stories",
    "/resources",
    "/developers",
    "/colophon",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE}${path}`,
      lastModified: now,
      changeFrequency: (path === "/" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority: path === "/" ? 1 : 0.7,
    })),
    ...stories.map((s) => ({
      url: `${SITE}/stories/${s.slug}`,
      lastModified: new Date(s.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
