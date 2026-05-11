export type Story = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  body: string;
  tag: string;
};

export const stories: Story[] = [
  {
    slug: "rising-heat-stress-in-indian-cities",
    title: "Rising heat stress in Indian cities",
    excerpt:
      "Hot days have nearly doubled in most metros over the last four decades. Here is what the data says.",
    date: "2026-04-12",
    author: "Terralens Editorial",
    tag: "Heat",
    body: `Across major Indian cities, the count of days with maximum temperature above 35 °C has trended up sharply since the 1980s. Reanalysis data from ERA5 (via Open-Meteo) shows the increase is sharpest in the post-2000 period.

You can verify this for any city using the Atlas — pin a location, set the date range to a full year, and read off the "hot days" count.

This story is a placeholder — wire it to a CMS or markdown files when you're ready.`,
  },
  {
    slug: "monsoon-variability-bengaluru",
    title: "Monsoon variability over Bengaluru",
    excerpt:
      "Inter-annual rainfall variation has widened. We pulled 40 years of daily totals to show it.",
    date: "2026-03-28",
    author: "Terralens Editorial",
    tag: "Rainfall",
    body: `Bengaluru's southwest monsoon (Jun–Sep) totals show year-to-year swings that have grown wider since 2010. Daily totals from the ERA5 reanalysis make this trend visible.

Try this in Ask Terralens: "What was the total rainfall in Bengaluru in 2018 vs 2023?"`,
  },
  {
    slug: "decoding-rcp-scenarios",
    title: "Decoding RCP and SSP scenarios",
    excerpt:
      "What the four emissions pathways actually represent — and how to read Terralens projections.",
    date: "2026-03-10",
    author: "Terralens Editorial",
    tag: "Methodology",
    body: `Representative Concentration Pathways (RCPs) describe the radiative forcing trajectory the climate is asked to respond to. Shared Socioeconomic Pathways (SSPs) are the modern CMIP6 equivalent — same idea, different vocabulary.

Terralens exposes four scenarios spanning the plausible range of futures: RCP 2.6 / SSP1-2.6 (Paris-aligned), RCP 4.5 / SSP2-4.5 (middle of the road), RCP 6.0 / SSP4-6.0 (intermediate) and RCP 8.5 / SSP5-8.5 (fossil-fuel intensive).

Picking a scenario on the Projections page swaps the model ensemble feeding the chart. Compare mode lets you overlay any combination — useful for showing how decisively the choice between Paris-aligned and a fossil baseline diverges by 2050.

Try this in Ask Terralens: "Compare projected temperature in Delhi between 2040 and 2050 under RCP 2.6 and RCP 8.5."`,
  },
  {
    slug: "how-terralens-reads-the-climate",
    title: "How Terralens reads the climate",
    excerpt:
      "A short tour of the data sources and derived metrics powering every answer.",
    date: "2026-03-05",
    author: "Terralens Editorial",
    tag: "Methodology",
    body: `Every answer Terralens gives is grounded in public datasets: ERA5 reanalysis and NASA POWER for the past, and a CMIP6 model ensemble for the future. Daily values flow through a small set of derived metrics — hot days, rainy days, dry spells — and into the chat agent, the Atlas or the Projections page, depending on how you ask.

Open the Atlas, pin a location, and you can verify any number Terralens reports: the underlying CSV is one click away.`,
  },
];

export function getStory(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}
