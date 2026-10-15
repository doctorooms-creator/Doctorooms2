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
              {/* Night orb — the day ends; she&rsquo;s still on */}
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="ml-1 h-6 w-6"
                role="img"
              >
                <circle cx="12" cy="12" r="10" fill="none" stroke="#f4f2ec" strokeOpacity="0.22" />
                <circle cx="12" cy="12" r="6.2" fill="#f4f2ec" fillOpacity="0.16" />
                <circle cx="9.8" cy="9.2" r="1.9" fill="#f4f2ec" fillOpacity="0.5" />
              </svg>
            </Link>
            <p className="font-display mt-3 text-lg italic text-silver/80">
              Care that stays.
            </p>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.2em] text-ash/70">
              The day ends · she&rsquo;s still on
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
