import { Section } from "@/components/ui";

export const metadata = { title: "Methodology · Terralens" };

export default function ResourcesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 md:py-24">
      <p className="eyebrow mb-3">Methodology · open by design</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight">
        How the numbers <em>are made.</em>
      </h1>
      <p className="mt-6 text-muted text-lg leading-relaxed">
        Terralens is grounded in three public datasets and one agentic loop. No
        proprietary data, no hidden modelling.
      </p>

      <hr className="hairline my-16" />

      <Section eyebrow="01 · Sources">
        <h2 className="font-display text-3xl">Data sources.</h2>
        <ul className="mt-6 space-y-4 text-muted leading-relaxed">
          <li>
            <strong className="text-fg">Open-Meteo Archive</strong> · daily
            historical temperature and precipitation back to 1981, derived from
            ERA5 reanalysis.{" "}
            <ExtLink href="https://open-meteo.com/en/docs/historical-weather-api" />
          </li>
          <li>
            <strong className="text-fg">NASA POWER</strong> · daily surface
            meteorology at ~0.5° resolution.{" "}
            <ExtLink href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/" />
          </li>
          <li>
            <strong className="text-fg">Open-Meteo Climate API</strong> ·
            high-resolution CMIP6 model runs covering 1950–2050+, used for
            future projections.{" "}
            <ExtLink href="https://open-meteo.com/en/docs/climate-api" />
          </li>
          <li>
            <strong className="text-fg">Open-Meteo Geocoding</strong> · turns a
            place name into lat/lon.
          </li>
        </ul>
      </Section>

      <Section eyebrow="02 · Derived metrics">
        <h2 className="font-display text-3xl">Derived metrics.</h2>
        <ul className="mt-6 space-y-3 text-muted leading-relaxed">
          <li>
            <strong className="text-fg">Hot days</strong> · count of days with
            Tmax ≥ 35 °C.
          </li>
          <li>
            <strong className="text-fg">Rainy days</strong> · days with
            precipitation ≥ 1 mm.
          </li>
          <li>
            <strong className="text-fg">Dry days</strong> · days with
            precipitation &lt; 1 mm.
          </li>
          <li>
            <strong className="text-fg">Avg Tmax / Tmin / Tmean</strong> ·
            arithmetic mean over valid days.
          </li>
          <li>
            <strong className="text-fg">Total precip</strong> · sum of daily
            precipitation in the window.
          </li>
        </ul>
      </Section>

      <Section eyebrow="03 · Scenarios">
        <h2 className="font-display text-3xl">RCP / SSP scenarios.</h2>
        <p className="mt-6 text-muted leading-relaxed">
          The Projections page exposes four emissions scenarios. The data is
          CMIP6 forced with SSPs underneath; we surface both labels so the
          user can match either convention they're used to.
        </p>

        <div className="mt-6 rounded-xl border border-border-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft">
              <tr className="text-left">
                <th className="px-4 py-2.5 eyebrow text-muted-soft">Terralens</th>
                <th className="px-4 py-2.5 eyebrow text-muted-soft">SSP</th>
                <th className="px-4 py-2.5 eyebrow text-muted-soft">Narrative</th>
                <th className="px-4 py-2.5 eyebrow text-muted-soft">Models used</th>
              </tr>
            </thead>
            <tbody>
              <ScenarioRow
                rcp="RCP 2.6"
                ssp="SSP1-2.6"
                narrative="Sustainability — Paris-aligned"
                models="MRI_AGCM3_2_S"
              />
              <ScenarioRow
                rcp="RCP 4.5"
                ssp="SSP2-4.5"
                narrative="Middle of the road"
                models="MRI_AGCM3_2_S, FGOALS_f3_H"
              />
              <ScenarioRow
                rcp="RCP 6.0"
                ssp="SSP4-6.0"
                narrative="Inequality"
                models="FGOALS_f3_H, EC_Earth3P_HR"
              />
              <ScenarioRow
                rcp="RCP 8.5"
                ssp="SSP5-8.5"
                narrative="Fossil-fuelled development"
                models="MPI_ESM1_2_XR, EC_Earth3P_HR"
                highlight
              />
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-muted-soft leading-relaxed">
          Note · Open-Meteo's Climate API serves CMIP6 HighResMIP runs forced
          with SSPs. The RCP / SSP equivalence is approximate — the climate
          response of CMIP6 SSP runs and CMIP5 RCP runs at the same nominal
          forcing level is similar but not identical. Fine for outreach and
          exploration; formal scientific work should cite the underlying
          CMIP6 models and SSP forcings directly.
        </p>
      </Section>

      <Section eyebrow="04 · Terralens Risk Index">
        <h2 className="font-display text-3xl">Risk Index (TRI).</h2>
        <p className="mt-6 text-muted leading-relaxed">
          The TRI is a 0–100 composite climate stress score shown on the Atlas after
          you pin a location. It blends four scientifically-grounded sub-signals,
          each normalised to 0–100 before weighting:
        </p>

        <div className="mt-6 rounded border border-border-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft">
              <tr className="text-left">
                <th className="px-4 py-2.5 eyebrow text-muted-soft">Index</th>
                <th className="px-4 py-2.5 eyebrow text-muted-soft">What it measures</th>
                <th className="px-4 py-2.5 eyebrow text-muted-soft">Weight</th>
                <th className="px-4 py-2.5 eyebrow text-muted-soft">Reference</th>
              </tr>
            </thead>
            <tbody>
              <MethodRow
                index="TX90p"
                desc="% of days where daily Tmax exceeds the local 90th percentile — locally relative, not globally absolute"
                weight="35 %"
                ref_="Alexander et al. (2006)"
              />
              <MethodRow
                index="WSDI"
                desc="Warm Spell Duration Index — total days in runs of ≥ 6 consecutive days where Tmax > local p90"
                weight="30 %"
                ref_="Alexander et al. (2006)"
              />
              <MethodRow
                index="CDD"
                desc="Consecutive Dry Days — length of the longest run of days with precipitation < 1 mm"
                weight="20 %"
                ref_="Alexander et al. (2006)"
              />
              <MethodRow
                index="HI"
                desc="NOAA Heat Index exceedance — days where the Rothfusz apparent temperature (Tmax + RH) exceeds 103 °F (39.4 °C), the 'Danger' threshold"
                weight="15 %"
                ref_="Rothfusz (1990)"
              />
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-3 text-sm text-muted leading-relaxed">
          <p>
            <strong className="text-fg">Local percentiles.</strong>{" "}
            TX90p and WSDI use the 90th percentile of Tmax computed from the
            selected date range itself. A cold city with an unusually warm
            period scores high; a hot city with a normal period scores low. This
            is the ETCCDI-recommended approach for intra-period analysis.
          </p>
          <p>
            <strong className="text-fg">Short-window caveat.</strong>{" "}
            Percentile estimates are unstable with fewer than 90 daily
            observations. The badge warns when the selected window is too short.
          </p>
          <p>
            <strong className="text-fg">Honest limits.</strong>{" "}
            TRI is a heuristic signal for outreach, journalism and triage. It is
            not actuarial, insurance-grade, or a substitute for formal hazard
            assessment.
          </p>
        </div>

        <div className="mt-6 space-y-1.5 text-xs text-muted-soft border-t border-border-soft pt-4">
          <p>
            Alexander, L. V., et al. (2006). Global observed changes in daily climate
            extremes of temperature and precipitation.{" "}
            <em>Journal of Geophysical Research: Atmospheres</em>, 111, D06106.{" "}
            <ExtLink href="https://doi.org/10.1029/2005JD006290" />
          </p>
          <p>
            Rothfusz, L. P. (1990). The heat index equation. NWS Technical
            Attachment SR 90-23. National Weather Service, Fort Worth TX.
          </p>
        </div>
      </Section>

      <Section eyebrow="05 · The agent">
        <h2 className="font-display text-3xl">Ask Terralens.</h2>
        <p className="mt-6 text-muted leading-relaxed">
          A frontier large-language model running a tool-use loop with three
          orchestrated tools:
        </p>
        <ul className="mt-4 space-y-2 text-muted leading-relaxed">
          <li>
            <span className="font-mono text-fg">geocode_location</span> · place →
            lat/lon
          </li>
          <li>
            <span className="font-mono text-fg">get_climate_data</span> ·
            historical daily, 1981 – present
          </li>
          <li>
            <span className="font-mono text-fg">get_climate_projection</span> ·
            CMIP6 yearly, 2030 – 2050
          </li>
        </ul>
        <p className="mt-4 text-muted leading-relaxed">
          The loop runs up to four steps before producing a final
          natural-language answer.
        </p>
      </Section>

      <Section eyebrow="06 · Scope">
        <h2 className="font-display text-3xl">What's not here yet.</h2>
        <ul className="mt-6 space-y-3 text-muted leading-relaxed">
          <li>Sectoral datasets — agriculture, healthcare, power — are on the roadmap.</li>
          <li>Sub-daily / hourly data is not exposed yet.</li>
          <li>No authentication or rate-limiting on the public API routes.</li>
        </ul>
      </Section>
    </div>
  );
}


function MethodRow({
  index,
  desc,
  weight,
  ref_,
}: {
  index: string;
  desc: string;
  weight: string;
  ref_: string;
}) {
  return (
    <tr className="border-t border-border-soft hover:bg-bg-soft/40">
      <td className="px-4 py-3 font-mono text-sm text-accent font-bold align-top">{index}</td>
      <td className="px-4 py-3 text-muted text-sm leading-relaxed align-top">{desc}</td>
      <td className="px-4 py-3 coord text-[0.7rem] text-fg align-top whitespace-nowrap">{weight}</td>
      <td className="px-4 py-3 text-xs text-muted-soft align-top">{ref_}</td>
    </tr>
  );
}

function ScenarioRow({
  rcp,
  ssp,
  narrative,
  models,
  highlight,
}: {
  rcp: string;
  ssp: string;
  narrative: string;
  models: string;
  highlight?: boolean;
}) {
  return (
    <tr
      className={`border-t border-border-soft ${
        highlight ? "bg-warm/5" : "hover:bg-bg-soft/40"
      }`}
    >
      <td
        className={`px-4 py-3 font-bold ${highlight ? "text-warm" : "text-fg"}`}
      >
        {rcp}
      </td>
      <td className="px-4 py-3 font-mono text-accent">{ssp}</td>
      <td className="px-4 py-3 text-muted text-sm">{narrative}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted">{models}</td>
    </tr>
  );
}

function ExtLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-fg underline underline-offset-2 hover:text-accent"
    >
      docs ↗
    </a>
  );
}
