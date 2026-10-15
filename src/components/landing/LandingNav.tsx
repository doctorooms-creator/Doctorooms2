"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useMagnetic } from "@/hooks/use-magnetic";

const NAV_LINKS = [
  { href: "#day", label: "A day with her" },
  { href: "#queue", label: "Your number" },
  { href: "#book", label: "Book" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const ctaRef = useMagnetic<HTMLAnchorElement>({ strength: 0.22, radius: 70 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong border-b border-ivory/10 py-3"
          : "border-b border-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Aturseva home"
        >
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

        <nav className="hidden items-center gap-8 md:flex" aria-label="Landing">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[12px] font-medium uppercase tracking-[0.18em] text-silver/80 transition-colors hover:text-ivory"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <Link
          ref={ctaRef}
          href="/book"
          data-cursor="BOOK"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-ivory px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-950 transition-transform will-change-transform hover:bg-white"
        >
          Book a home visit
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
