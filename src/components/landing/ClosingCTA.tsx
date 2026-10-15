"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMagnetic } from "@/hooks/use-magnetic";

export function ClosingCTA() {
  const primaryRef = useMagnetic<HTMLAnchorElement>({ strength: 0.22, radius: 80 });
  const secondaryRef = useMagnetic<HTMLAnchorElement>({ strength: 0.15, radius: 60 });

  return (
    <section id="book" className="relative scroll-mt-24 py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(720px 420px at 50% 55%, rgba(244,242,236,0.05) 0%, transparent 68%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl px-5 text-center sm:px-8"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ash">
          Bring her home
        </p>
        <h2 className="font-display mt-5 text-[clamp(2.2rem,5.4vw,4rem)] leading-[1.02] tracking-[-0.015em]">
          The doctor for the hour.
          <br />
          <span className="bg-gradient-to-b from-ivory to-silver bg-clip-text italic text-transparent">
            Aturseva for always.
          </span>
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            ref={primaryRef}
            href="/book"
            data-cursor="BOOK"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ivory px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-950 transition-transform will-change-transform hover:bg-white"
          >
            Book a home visit
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            ref={secondaryRef}
            href="/contact"
            className="glass inline-flex min-h-[48px] items-center rounded-full px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:border-ivory/30"
          >
            Talk to our care team
          </Link>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-[11.5px] leading-relaxed tracking-wide text-ash">
          Aturseva is an AI care companion — she reminds, tracks, and relays.
          She does not diagnose, prescribe, or replace your doctor. Every
          medical decision stays with licensed physicians.
        </p>
      </motion.div>
    </section>
  );
}
