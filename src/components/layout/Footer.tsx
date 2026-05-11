import Link from "next/link";
import { BrandMark } from "@/components/ui";
import { Wordmark } from "@/components/layout/Header";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border-soft bg-bg-elevated relative overflow-hidden">
      {/* Strata accent strip along the very top edge */}
      <div className="absolute top-0 inset-x-0 h-1 strata opacity-70" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 relative">
        {/* Coordinate strip */}
        <div className="flex items-center gap-4 mb-12 flex-wrap text-[0.7rem]">
          <span className="coord text-accent">↳ end of map</span>
          <div className="flex-1 h-px bg-border-soft min-w-12" />
          <span className="eyebrow text-muted-soft">colophon</span>
        </div>

        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display-lg text-3xl md:text-5xl">
              The planet,
              <br />
              <span className="gradient-text">point by point.</span>
            </h2>
            <p className="mt-6 tagline text-muted text-sm">
              built in india · for everywhere on earth
            </p>
            <div className="mt-10 flex items-center gap-3">
              <BrandMark size={40} />
              <div>
                <Wordmark size="lg" />
                <p className="coord text-[0.65rem] text-muted-soft mt-0.5">
                  by weatherex ai · wgs84
                </p>
              </div>
            </div>
          </div>

          <FooterCol
            title="Surfaces"
            links={[
              { href: "/atlas", label: "Atlas" },
              { href: "/projections", label: "Projections" },
              { href: "/ask", label: "Ask Terralens" },
              { href: "/datasets", label: "Datasets" },
            ]}
          />
          <FooterCol
            title="Reference"
            links={[
              { href: "/stories", label: "Stories" },
              { href: "/resources", label: "Methodology" },
              { href: "/developers", label: "Developer API" },
              { href: "/colophon", label: "Colophon" },
            ]}
          />
        </div>

        <div className="mt-20 pt-8 border-t border-border-soft flex items-center justify-center sm:justify-between flex-col sm:flex-row gap-3">
          <p className="coord text-[0.65rem] text-muted-soft">
            © {new Date().getFullYear()} · weatherex ai · all rights reserved
          </p>
          <p className="coord text-[0.65rem] text-muted-soft">
            00°00′N · 00°00′E · home
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="lg:col-span-2">
      <h4 className="eyebrow mb-5">{title}</h4>
      <ul className="space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-muted hover:text-accent transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
