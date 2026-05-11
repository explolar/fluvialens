"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/ui";

const nav = [
  { href: "/atlas", label: "Atlas" },
  { href: "/projections", label: "Projections" },
  { href: "/ask", label: "Ask" },
  { href: "/datasets", label: "Datasets" },
  { href: "/stories", label: "Stories" },
  { href: "/developers", label: "API" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-border-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandMark size={26} />
          <Wordmark />
          <span className="hidden sm:inline-block coord text-[0.58rem] text-muted-soft border-l border-border-soft pl-2.5 ml-0.5">
            wgs84
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-sm">
          {nav.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded-sm text-[0.85rem] font-medium transition ${
                  active
                    ? "text-accent bg-accent-soft"
                    : "text-muted hover:text-fg hover:bg-bg-soft"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/ask" className="btn-primary text-[0.75rem]">
            Ask
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 6h6m0 0L6 3m3 3L6 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-sm border border-border-strong text-fg hover:bg-bg-soft transition"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 top-16 z-40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        />
        <nav
          className={`relative bg-bg-elevated border-b border-border-soft transition-transform duration-200 ${
            open ? "translate-y-0" : "-translate-y-2"
          }`}
        >
          <div className="px-6 py-6 space-y-1">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-sm text-base font-medium transition ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:text-fg hover:bg-bg-soft"
                  }`}
                >
                  <span>{n.label}</span>
                  <span className="text-muted-soft">→</span>
                </Link>
              );
            })}
            <hr className="hairline my-3" />
            <p className="px-4 py-2 coord text-[0.65rem] text-muted-soft">
              terralens · wgs84 · the planet, point by point
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Wordmark({ size = "base" }: { size?: "sm" | "base" | "lg" }) {
  const scale = size === "lg" ? 1.25 : size === "sm" ? 0.82 : 1;

  return (
    <span
      className="select-none inline-flex items-baseline"
      aria-label="TerraLens"
    >
      {/* Terra — Playfair Display italic serif, title-case, cream */}
      <span
        style={{
          fontFamily: "var(--font-serif), 'Playfair Display', Georgia, serif",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: `${Math.round(20 * scale)}px`,
          letterSpacing: "-0.01em",
          color: "var(--fg)",
          lineHeight: 1,
        }}
      >
        Terra
      </span>

      {/* Lens — Space Grotesk bold geometric sans, title-case, accent orange */}
      <span
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', system-ui, sans-serif",
          fontWeight: 700,
          fontStyle: "normal",
          fontSize: `${Math.round(20 * scale)}px`,
          letterSpacing: "-0.045em",
          color: "var(--accent)",
          lineHeight: 1,
        }}
      >
        Lens
      </span>
    </span>
  );
}

function MenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 4h10M2 7h10M2 10h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 3l8 8M11 3l-8 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
