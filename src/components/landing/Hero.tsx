"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, RotateCcw } from "lucide-react";
import { Orb } from "@/components/landing/orb/Orb";
import { Chip } from "@/components/landing/chat/Chip";
import { ChatReplay } from "@/components/landing/chat/ChatReplay";
import { DotGrid } from "@/components/landing/fx/DotGrid";
import { HERO_MOMENTS } from "@/components/landing/moments";
import { useMagnetic } from "@/hooks/use-magnetic";

/* Orbit positions for the moment chips around the orb (lg+). */
const ORBIT: Record<string, string> = {
  morning: "left-[-4%] top-[4%]",
  queue: "right-[-6%] top-[12%]",
  vitals: "right-[-2%] bottom-[18%]",
  night: "left-[-6%] bottom-[6%]",
};

const FLOAT_DELAY: Record<string, string> = {
  morning: "0s",
  queue: "1.1s",
  vitals: "2.2s",
  night: "3.3s",
};

const rise = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replayCount, setReplayCount] = useState(0);
  const [userTouched, setUserTouched] = useState(false);
  const primaryRef = useMagnetic<HTMLAnchorElement>({ strength: 0.22, radius: 80 });
  const secondaryRef = useMagnetic<HTMLAnchorElement>({ strength: 0.16, radius: 60 });

  // If the visitor just watches, Aturseva starts working on her own.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!userTouched) setSelectedId(HERO_MOMENTS[0].id);
    }, 1500);
    return () => clearTimeout(t);
  }, [userTouched]);

  const selected = HERO_MOMENTS.find((m) => m.id === selectedId) ?? null;

  const select = (id: string) => {
    setUserTouched(true);
    setSelectedId(id);
    setReplayCount((c) => c + 1);
  };

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32 sm:pt-36">
      <DotGrid />
      {/* Ambient vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 620px at 70% 38%, rgba(244,242,236,0.045) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
        {/* ── Copy ── */}
        <div className="max-w-xl">
          <motion.div
            {...rise}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-ivory opacity-50"
                style={{ animation: "atva-pulse-ring 2.4s ease-out infinite" }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ivory" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-silver">
              AI care companion · Doctor home visits
            </span>
          </motion.div>

          <motion.h1
            {...rise}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-6 text-[clamp(2.7rem,7.2vw,5.4rem)] leading-[0.98] tracking-[-0.015em]"
          >
            The doctor visits.
            <br />
            <span className="bg-gradient-to-b from-ivory via-ivory to-silver bg-clip-text italic text-transparent">
              Aturseva stays.
            </span>
          </motion.h1>

          <motion.p
            {...rise}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-silver"
          >
            A licensed doctor at your door — and an AI care companion in your
            family&rsquo;s phone who follows the recovery hour by hour.
            She reminds. She tracks. She relays everything to your doctor.
          </motion.p>

          <motion.div
            {...rise}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              ref={primaryRef}
              href="/book"
              data-cursor="BOOK"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ivory px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-950 transition-transform will-change-transform hover:bg-white"
            >
              Book a home visit
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              ref={secondaryRef}
              href="#day"
              data-cursor="WATCH"
              className="glass inline-flex min-h-[48px] items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-ivory transition-all hover:border-ivory/30"
            >
              Watch a day with her
              <ArrowDown className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.p
            {...rise}
            transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-md text-[11px] leading-relaxed tracking-wide text-ash"
          >
            Replays shown on this page come from real product sessions.
            Diagnoses and prescriptions come only from licensed doctors.
          </motion.p>
        </div>

        {/* ── Orb + moments + replay ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[520px]"
        >
          <div className="relative">
            <Orb
              base="idle"
              forced={selected ? selected.state : null}
              className="mx-auto w-full max-w-[420px]"
            />

            {/* Orbiting moment chips (desktop) */}
            {HERO_MOMENTS.map((m, i) => (
              <div
                key={m.id}
                className={`absolute hidden lg:block ${ORBIT[m.id]}`}
                style={{
                  animation: `atva-float-y 7s ${FLOAT_DELAY[m.id]} ease-in-out infinite`,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.12 }}
                >
                  <Chip
                    time={m.time}
                    label={m.label}
                    active={selectedId === m.id}
                    onClick={() => select(m.id)}
                  />
                </motion.div>
              </div>
            ))}
          </div>

          {/* Moment chips (mobile) */}
          <div className="atva-scroll mt-5 flex snap-x gap-3 overflow-x-auto pb-2 lg:hidden">
            {HERO_MOMENTS.map((m) => (
              <div key={m.id} className="snap-start">
                <Chip
                  time={m.time}
                  label={m.label}
                  active={selectedId === m.id}
                  onClick={() => select(m.id)}
                />
              </div>
            ))}
          </div>

          {/* Replay card */}
          <div className="glass-strong mt-6 rounded-3xl p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ash">
                {selected ? `Replay · ${selected.label}` : "Replay · select a moment"}
              </span>
              <button
                type="button"
                data-cursor="REPLAY"
                aria-label="Replay moment"
                onClick={() => selectedId && setReplayCount((c) => c + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/15 text-silver transition-colors hover:border-ivory/40 hover:text-ivory"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
            {selected ? (
              <ChatReplay
                key={`${selected.id}-${replayCount}`}
                script={selected.script}
                active
                className="h-[288px] pr-1"
              />
            ) : (
              <div className="flex h-[288px] flex-col items-center justify-center gap-3 text-center">
                <span className="text-[12px] text-ash">
                  She&rsquo;s breathing. Pick a moment — or just watch.
                </span>
                <span className="text-[11px] text-ash/60">
                  The replays are canned product sessions, not live chat.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-ash">
          Scroll
        </span>
        <span
          className="block h-8 w-px bg-ivory/40"
          style={{ animation: "atva-scroll-line 2.2s ease-in-out infinite" }}
        />
      </div>
    </section>
  );
}
