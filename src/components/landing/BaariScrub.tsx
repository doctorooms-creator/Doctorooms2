"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, Bell, Footprints } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-media";

/* ── The BAARI scrub — the signature beat ──────────────────────────────
   The section pins for ~2.4 screens. Your token counts down 12 → 1 as
   you scroll, then flips to "aap ki baari" with a leave-now alert.
   Markup ships the FINAL state (RM / no-JS see the complete story);
   the engine rewinds to #12 on mount for motion users.                   */

const START_TOKEN = 12;
/** Progress window across which the token counts 12 → 1. */
const COUNT_END = 0.74;
/** Progress at which the turn fires. */
const TURN_AT = 0.74;
/** Wall-clock span of the replayed wait. */
const WAIT_MINUTES = 12;

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function tokenAt(p: number): number {
  if (p >= COUNT_END) return 1;
  const norm = Math.min(Math.max((p - 0.06) / (COUNT_END - 0.06), 0), 1);
  return Math.max(1, Math.min(START_TOKEN, Math.ceil(START_TOKEN - (START_TOKEN - 1) * norm)));
}

function clockAt(p: number): string {
  /* The wait is over at the turn — the clock stops there. */
  if (p >= TURN_AT) return "09:22";
  const m = Math.round(WAIT_MINUTES * Math.min(Math.max(p, 0), 1));
  const total = 9 * 60 + 10 + m;
  const h = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function captionFor(token: number): { line: string; sub: string } {
  if (token >= 9)
    return { line: "Stay home.", sub: "She's counting every move ahead of you." };
  if (token >= 4)
    return { line: "The queue is moving.", sub: "Tea's still warm. Don't rush." };
  return { line: "Almost there.", sub: "Slippers on. She'll say the word." };
}

const RAIL = [
  { at: 0, time: "09:10", label: "Scanned" },
  { at: 0.3, time: "09:16", label: "Counting" },
  { at: 0.56, time: "09:20", label: "Slippers on" },
  { at: TURN_AT, time: "09:22", label: "Your turn" },
];

export function BaariScrub() {
  const sectionRef = useRef<HTMLElement>(null);
  const rm = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* SSR + RM + no-JS ship the final state; the engine rewinds on mount.
     (useReducedMotion starts false before its media effect runs, so when
     RM flips on we explicitly restore the finale.) */
  const [p, setP] = useState(1);

  useIsoLayoutEffect(() => {
    if (rm) {
      setP(1);
      return;
    }
    setP(scrollYProgress.get());
  }, [rm, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!rm) setP(v);
  });

  const turn = p >= TURN_AT;
  const token = tokenAt(p);
  const ahead = turn ? 0 : token - 1;
  const est = ahead * 2.2;
  const caption = captionFor(token);
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const showHint = !rm && p < 0.035;

  return (
    <section
      id="baari"
      ref={sectionRef}
      aria-label="The wait, replayed — your queue token counts down as you scroll"
      className={`relative scroll-mt-0 ${
        rm ? "py-24 sm:py-32" : "h-[200vh] sm:h-[240vh]"
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          rm ? "" : "sticky top-0 flex h-screen flex-col items-center justify-center"
        }`}
      >
        {/* Stage ambience */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(720px 480px at 50% 42%, rgba(244,242,236,0.045) 0%, transparent 68%)",
          }}
        />
        {/* Ghost token watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className="font-display select-none italic leading-none text-ivory/[0.035]"
            style={{ fontSize: "min(46vw, 560px)", transform: "translateY(-4%)" }}
          >
            #{turn ? "01" : String(token).padStart(2, "0")}
          </span>
        </div>

        <div
          data-cursor="SCROLL"
          className={`relative flex w-full max-w-4xl flex-col items-center px-5 text-center sm:px-8 ${
            rm ? "py-10" : ""
          }`}
        >
          {/* Eyebrow */}
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-ash">
            <span>City Care Clinic · OPD</span>
            <span aria-hidden className="text-ash/50">—</span>
            <span className="tabular-nums">{clockAt(p)}</span>
            <span aria-hidden className="text-ash/50">—</span>
            <span>replayed at scroll-speed</span>
          </p>

          {/* The token / the turn — keyed remounts act as the flip */}
          <div className="mt-8 flex min-h-[clamp(180px,26vh,240px)] items-center justify-center sm:mt-10">
            {turn ? (
              <motion.div
                key="turn"
                initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-ash">
                  Token 01 · called in
                </span>
                <span className="font-display mt-3 text-[clamp(2.8rem,8vw,5.6rem)] italic leading-[1.02] tracking-[-0.01em]">
                  <span className="bg-gradient-to-b from-ivory to-silver bg-clip-text text-transparent">
                    aap ki baari
                  </span>
                </span>
                <span className="mt-2 text-[12px] tracking-wide text-silver/80">
                  it&rsquo;s your turn
                </span>
              </motion.div>
            ) : (
              <motion.div
                key={`token-${token}`}
                initial={{ opacity: 0.35, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-ash">
                  Your token
                </span>
                <span className="font-display mt-1 flex items-start leading-[0.86] tracking-[-0.03em] text-ivory">
                  <span className="mt-[0.35em] text-[clamp(1.6rem,4vw,3rem)] italic text-silver/70">
                    #
                  </span>
                  <span
                    className="text-[clamp(6.5rem,17vw,12.5rem)] tabular-nums"
                    style={{ animation: "atva-token-glow 3.2s ease-in-out infinite" }}
                  >
                    {String(token).padStart(2, "0")}
                  </span>
                </span>
                <span className="mt-3 text-[13px] text-silver">
                  {ahead} ahead · about {Math.max(1, Math.round(est))} min
                </span>
              </motion.div>
            )}
          </div>

          {/* Status line */}
          <div className="mt-2 flex min-h-[64px] flex-col items-center justify-start sm:min-h-[56px]">
            <motion.p
              key={turn ? "t" : token}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-[14.5px] leading-relaxed text-silver"
            >
              {turn ? (
                <>
                  <span className="text-ivory">Baari! Ab niklo.</span>{" "}
                  <span className="text-silver/85">
                    Leave now — the clinic is a four-minute walk.
                  </span>
                </>
              ) : (
                <>
                  <span className="text-ivory/90">{caption.line}</span>{" "}
                  <span className="text-silver/75">{caption.sub}</span>
                </>
              )}
            </motion.p>
          </div>

          {/* The leave-now alert — final state ships visible (RM/no-JS) */}
          <motion.div
            initial={false}
            animate={{
              opacity: turn ? 1 : 0,
              y: turn ? 0 : 18,
              scale: turn ? 1 : 0.96,
            }}
            transition={{ duration: rm ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ pointerEvents: turn ? "auto" : "none" }}
            className="glass-strong mt-6 flex w-full max-w-md items-center gap-4 rounded-2xl p-4 text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ivory/25 bg-ivory/[0.06]">
              <Bell className="h-[18px] w-[18px] text-ivory" />
              {!rm ? (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-ivory/30"
                  style={{ animation: "atva-pulse-ring 1.8s ease-out infinite" }}
                />
              ) : null}
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-ivory">
                Aturseva is calling you in
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] leading-relaxed text-silver/85">
                <Footprints className="h-3.5 w-3.5 shrink-0 text-silver/70" />
                Four-minute walk · she&rsquo;ll stay on the line until you&rsquo;re seen
              </p>
            </div>
            <span className="glass ml-auto shrink-0 rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-ash">
              Speaking
            </span>
          </motion.div>

          {/* Scroll hint — only at the very top for motion users */}
          <AnimatePresence>
            {showHint ? (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-10 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-ash"
              >
                <ArrowDown
                  className="h-3.5 w-3.5 animate-bounce"
                  style={{ animationDuration: "1.6s" }}
                />
                scroll — the queue moves
              </motion.p>
            ) : null}
          </AnimatePresence>

          {/* Checkpoint rail */}
          <div className={`relative mt-12 w-full max-w-2xl ${rm ? "" : "sm:mt-14"}`}>
            <div className="relative h-px w-full bg-ivory/12">
              <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left bg-ivory/70"
                style={{ scaleX: rm ? 1 : fillScale }}
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1">
              {RAIL.map((cp) => {
                const active = p >= cp.at - 0.001;
                return (
                  <div
                    key={cp.label}
                    className={`flex flex-col items-center gap-1 text-center transition-colors duration-500 ${
                      active ? "text-ivory/90" : "text-ash/60"
                    }`}
                  >
                    <span
                      className={`mb-1 h-1.5 w-1.5 rounded-full border transition-all duration-500 ${
                        active
                          ? "border-ivory bg-ivory shadow-[0_0_10px_rgba(244,242,236,0.5)]"
                          : "border-ash/60 bg-transparent"
                      }`}
                    />
                    <span className="font-display text-[13px] italic tabular-nums">
                      {cp.time}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
                      {cp.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
