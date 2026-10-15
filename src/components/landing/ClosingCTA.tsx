"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useReducedMotion } from "@/hooks/use-media";

/* ── The rotating close (I-T-60) ───────────────────────────────────────
   "Aturseva aapke [dawai/token/diet/doctor] ke saath hai."
   Ships as the complete enumeration (RM / no-JS read everything);
   motion visitors get the typed rotation once it scrolls into view.     */

const WORDS = ["dawai", "token", "diet", "doctor"] as const;
const ENUMERATION = "dawai, token, diet aur doctor";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function RotatingClose() {
  const rm = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: "-12% 0px -12% 0px" });

  /* Mount flag — until JS is alive (or under RM) the complete
     enumeration ships, so nothing is ever hidden from no-JS/RM. */
  const [mounted, setMounted] = useState(false);
  useIsoLayoutEffect(() => {
    if (!rm) setMounted(true);
  }, [rm]);

  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">(
    "typing",
  );

  const word = WORDS[idx];

  /* type → hold → delete → next word, only while in view. */
  useEffect(() => {
    if (!mounted || !inView || rm) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (count < word.length) {
        t = setTimeout(() => setCount((c) => c + 1), 72);
      } else {
        t = setTimeout(() => setPhase("holding"), 380);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), 1500);
    } else {
      if (count > 0) {
        t = setTimeout(() => setCount((c) => c - 1), 36);
      } else {
        t = setTimeout(() => {
          setIdx((i) => (i + 1) % WORDS.length);
          setPhase("typing");
        }, 260);
      }
    }
    return () => clearTimeout(t);
  }, [mounted, inView, rm, phase, count, word]);

  const rotating = mounted && !rm;

  return (
    <span
      ref={ref}
      className="bg-gradient-to-b from-ivory to-silver bg-clip-text italic text-transparent"
    >
      Aturseva aapke{" "}
      {rotating ? (
        <>
          <span className="text-ivory" aria-hidden>
            {word.slice(0, count)}
          </span>
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[0.82em] w-[2px] translate-y-[0.08em] bg-ivory/80"
            style={{ animation: "atva-caret 0.9s steps(1) infinite" }}
          />
          <span className="sr-only">{ENUMERATION}</span>
        </>
      ) : (
        <span className="text-ivory">{ENUMERATION}</span>
      )}{" "}
      ke saath hai.
    </span>
  );
}

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
        <h2 className="font-display mt-5 text-[clamp(2.2rem,5.4vw,4rem)] leading-[1.06] tracking-[-0.015em]">
          The doctor for the hour.
          <br />
          <RotatingClose />
        </h2>
        <p className="mt-4 text-[11.5px] tracking-wide text-ash">
          — with your medicine, your token, your diet, your doctor.
        </p>

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
            data-cursor="TALK"
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
