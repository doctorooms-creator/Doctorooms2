"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/book", label: "Book a visit" },
  { href: "/doctors", label: "Find doctors" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/blog", label: "Health notes" },
];

export function LandingFooter() {
  return (
    <footer className="hairline-t mt-auto safe-area-bottom">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label="Aturseva home">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-ivory opacity-50"
                  style={{ animation: "atva-pulse-ring 2.6s ease-out infinite" }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ivory" />
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.34em] text-ivory">
                Aturseva
              </span>
            </Link>
            <p className="font-display mt-3 text-lg italic text-silver/80">
              Care that stays.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="min-h-[44px] inline-flex items-center text-[12px] font-medium uppercase tracking-[0.16em] text-silver/75 transition-colors hover:text-ivory"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hairline-t mt-10 flex flex-col gap-3 pt-6 text-[11px] tracking-wide text-ash/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Aturseva · A Doctorooms product</p>
          <p className="inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-ivory opacity-40"
                style={{ animation: "atva-pulse-ring 2.8s ease-out infinite" }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ivory" />
            </span>
            Somewhere, Aturseva is breathing.
          </p>
        </div>
      </div>
    </footer>
  );
}
