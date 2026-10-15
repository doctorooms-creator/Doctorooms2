"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useInView } from "framer-motion";
import {
  BellRing,
  Check,
  FileText,
  Megaphone,
  QrCode,
  ScanLine,
  Soup,
  Stethoscope,
  X,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-media";
import { useSpotlight } from "@/hooks/use-spotlight";
import {
  getBaariServerSnapshot,
  getBaariSnapshot,
  subscribeBaari,
} from "@/lib/fx/baari-store";

/* ── Beat 6 — the honest close ─────────────────────────────────────────
   "Dose doctor badalega." / "Main yaad rakhungi." The deliberate,
   word-by-word boundary statement; the doctor's mirror (what the week
   looks like from the other side); and the 01/06…06/06 rail that
   remembers the whole day told above. The rail's QUEUE LIVE card is
   wired to the live BAARI token — scroll back up and watch it count.  */

const EASE = [0.22, 1, 0.36, 1] as const;

const BOUNDARY_WORDS = ["The", "dose,", "the", "doctor", "changes."];

const NEVER = [
  "changes a dose",
  "suggests a medicine",
  "guesses at a diagnosis",
];

const ALWAYS = [
  "remembers every dose",
  "reminds at the right hour",
  "records, and relays it to your doctor",
];

/* ── Adherence ring geometry ── */
const R = 76;
const SEG_GAP = 8 / 360; // 8° gap between segments
const SEG = 1 / 7 - SEG_GAP; // fraction of circumference per segment
const TAKEN = [true, true, true, true, true, false, false];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function segOffset(i: number): number {
  /* Start each segment at its slice, nudged past the gap, opening at 12h. */
  return i / 7 + SEG_GAP / 2 - 0.25;
}

/* ── Doctor mirror panel ── */

function DoctorMirror() {
  const rm = useReducedMotion();
  const ringRef = useRef<HTMLDivElement>(null);
  const ringInView = useInView(ringRef, { once: true, margin: "-15% 0px" });
  const [hot, setHot] = useState<number | null>(null);

  /* Centre counter — ships 72 (final), counts 0 → 72 in view. */
  const [pct, setPct] = useState(72);
  useEffect(() => {
    if (!ringInView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPct(72);
      return;
    }
    const controls = animate(0, 72, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setPct(Math.round(v)),
    });
    return () => controls.stop();
  }, [ringInView]);

  return (
    <div
      data-cursor="HER VIEW"
      className="glass-strong flex flex-col rounded-3xl p-5 text-left sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ash">
          Dr. S. Rao · patient view
        </span>
        <span className="rounded-full border border-dashed border-ivory/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-silver">
          Representative
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:gap-7">
        {/* The 7-segment adherence ring */}
        <div ref={ringRef} className="relative h-[170px] w-[170px] shrink-0">
          <svg viewBox="0 0 170 170" className="h-full w-full" role="img" aria-label="Adherence ring — 5 of 7 days with the dose taken">
            {TAKEN.map((taken, i) => {
              const isHot = hot === i;
              const recede = hot !== null && hot !== i && taken;
              return (
                <motion.circle
                  key={i}
                  cx={85}
                  cy={85}
                  r={R}
                  fill="none"
                  stroke={
                    isHot
                      ? "rgba(244,242,236,0.95)"
                      : taken
                        ? "rgba(244,242,236,0.9)"
                        : "rgba(244,242,236,0.14)"
                  }
                  strokeWidth={isHot ? 9 : 6.5}
                  strokeLinecap="round"
                  className={`${recede ? "opacity-40" : "opacity-100"} [transition:opacity_250ms_ease,filter_250ms_ease,stroke_250ms_ease]`}
                  filter={isHot ? "drop-shadow(0 0 7px rgba(244,242,236,0.5))" : undefined}
                  initial={{ pathLength: rm ? SEG : 0, pathOffset: segOffset(i) }}
                  whileInView={{ pathLength: SEG, pathOffset: segOffset(i) }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{
                    duration: rm ? 0 : 0.9,
                    delay: rm ? 0 : 0.25 + i * 0.13,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              );
            })}
          </svg>
          {/* Centre — the counting percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[34px] italic leading-none tabular-nums text-ivory">
              {pct}%
            </span>
            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-ash">
              reported regularity
            </span>
          </div>
        </div>

        {/* What the doctor reads */}
        <div className="min-w-0">
          <p className="font-display text-[17px] leading-snug text-ivory sm:text-[19px]">
            Doctor ko bhi dikhti hai aapki regularity — ilaaj behtar.
          </p>
          <p className="mt-2.5 text-[12px] leading-relaxed text-silver/85">
            Your doctor opens one weekly report — not a phone-call
            reconstruction of the week. The record Aturseva kept becomes
            the context the dose change is made on.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-ivory/85">
            <FileText className="h-3.5 w-3.5 text-silver/70" />
            5 of 7 days · weekly report
          </p>
        </div>
      </div>

      {/* Day chips — hover / tap lights the matching ring segment */}
      <div
        className="mt-5 flex flex-wrap items-center gap-2"
        onMouseLeave={() => setHot(null)}
      >
        {DAYS.map((d, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHot(i)}
            onFocus={() => setHot(i)}
            onClick={() => setHot(i)}
            aria-pressed={TAKEN[i]}
            aria-label={`Day ${i + 1} of 7 — ${TAKEN[i] ? "dose taken" : "dose not taken"}`}
            className={`flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-300 ${
              hot === i
                ? "border-ivory/50 bg-ivory/[0.08]"
                : "border-ivory/12 bg-ivory/[0.02] hover:border-ivory/30"
            }`}
          >
            <span className="text-[11px] font-medium text-silver">{d}</span>
            <span
              className={`h-1 w-1 rounded-full ${
                TAKEN[i] ? "bg-ivory" : "border border-ash/60"
              }`}
            />
          </button>
        ))}
        <p className="ml-1 hidden text-[10px] leading-relaxed text-ash/70 sm:block">
          Tap a day — the ring
          <br />
          remembers it.
        </p>
      </div>
    </div>
  );
}

/* ── Day rail ── */

const RAIL = [
  { n: "01/06", icon: BellRing, title: "Morning dose", sub: "06:30 · voice", tag: "Reminder on", href: "#day" },
  { n: "02/06", icon: QrCode, title: "Token at home", sub: "", tag: "Queue live", href: "#baari", live: true },
  { n: "03/06", icon: Megaphone, title: "Baari! Ab niklo.", sub: "09:22 · leave now", tag: "Turn called", href: "#baari" },
  { n: "04/06", icon: ScanLine, title: "Kiosk check-in", sub: "12:40 · one tap", tag: "Checked in", href: "#dusk" },
  { n: "05/06", icon: Soup, title: "Evening diet", sub: "7:00 PM · doctor-set", tag: "Diet on", href: "#dusk" },
  { n: "06/06", icon: Stethoscope, title: "Doctor sees all", sub: "5 of 7 days", tag: "Loop closed", href: "#boundary" },
];

function DayRail() {
  const baari = useSyncExternalStore(
    subscribeBaari,
    getBaariSnapshot,
    getBaariServerSnapshot,
  );
  const tokenLine = baari.turn
    ? "0 · aap ki baari"
    : `#${String(baari.token).padStart(2, "0")} · aap ka token`;

  return (
    <div className="mt-16 sm:mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl tracking-[-0.01em] text-ivory sm:text-2xl">
          The whole day, on one rail.
        </h3>
        <p className="text-[11px] tracking-wide text-ash">
          Six beats · one Monday · she was there for all of them
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {RAIL.map((card) => (
          <a
            key={card.n}
            href={card.href}
            className="glass group flex flex-col rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ivory/25"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ash">
                {card.n}
              </span>
              <card.icon className="h-4 w-4 text-silver/60 transition-colors duration-300 group-hover:text-ivory" />
            </div>
            <p className="font-display mt-2.5 text-[15px] leading-tight text-ivory">
              {card.title}
            </p>
            <p className="mt-1 min-h-[16px] text-[10.5px] leading-snug tabular-nums text-ash">
              {card.live ? tokenLine : card.sub}
            </p>
            <span className="mt-3 inline-flex w-fit rounded-full border border-ivory/15 px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-silver">
              {card.tag}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Section ── */

export function Boundary() {
  const rm = useReducedMotion();
  const sectionRef = useSpotlight<HTMLElement>();

  return (
    <section id="boundary" ref={sectionRef} className="relative scroll-mt-24 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(640px 400px at var(--sx, 50%) var(--sy, 24%), rgba(244,242,236,0.035) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* The boundary statement — word by word, unhurried */}
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ash">
            The honest part
          </p>
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: rm ? 0 : 0.22 } },
            }}
            className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.06] tracking-[-0.01em]"
          >
            {BOUNDARY_WORDS.map((w) => (
              <motion.span
                key={w}
                variants={{
                  hidden: { opacity: 0, y: rm ? 0 : 14, filter: "blur(5px)" },
                  show: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: rm ? 0 : 0.75, ease: EASE },
                  },
                }}
                className="inline-block"
              >
                {w}&nbsp;
              </motion.span>
            ))}
            <br />
            <motion.span
              variants={{
                hidden: { opacity: 0, y: rm ? 0 : 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: rm ? 0 : 1.1, ease: EASE },
                },
              }}
              className="mt-1 inline-block bg-gradient-to-b from-ivory to-silver bg-clip-text italic text-transparent"
            >
              Main yaad rakhungi.
            </motion.span>
          </motion.h2>
          <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-silver">
            The doctor changes the dose; Aturseva keeps the record and the
            reminder — so nothing is ever decided on a guess.{" "}
            <span className="text-ash">
              She is the memory. The judgement stays with your physician.
            </span>
          </p>
        </div>

        {/* Trust panel + doctor mirror */}
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-[0.92fr_1.08fr] sm:gap-6">
          {/* Where the line sits */}
          <div className="glass flex flex-col rounded-3xl p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ash">
              Where the line sits
            </p>

            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ash/70">
              She never
            </p>
            <ul className="mt-3 space-y-3">
              {NEVER.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[13px] text-silver/90">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-ivory/25">
                    <X className="h-3 w-3 text-ash" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="hairline-t mt-5 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ash/70">
                She always
              </p>
              <ul className="mt-3 space-y-3">
                {ALWAYS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[13px] text-ivory/90">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ivory/30 bg-ivory/[0.06]">
                      <Check className="h-3 w-3 text-ivory" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-auto pt-6 text-[11px] leading-relaxed tracking-wide text-ash">
              Every medical decision stays with licensed physicians.
              Aturseva is the memory and the nudge — never the judgement.
            </p>
          </div>

          {/* The doctor's mirror */}
          <DoctorMirror />
        </div>

        {/* The day rail */}
        <DayRail />
      </div>
    </section>
  );
}
