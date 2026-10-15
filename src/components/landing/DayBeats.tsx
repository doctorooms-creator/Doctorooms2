"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Stethoscope, Activity, FileText, Moon, QrCode } from "lucide-react";
import { ChatReplay } from "@/components/landing/chat/ChatReplay";
import { MORNING_SCRIPT } from "@/components/landing/moments";
import { ORB_STATES, ORB_STATE_ORDER } from "@/components/landing/orb/orb-states";
import { useSpotlight } from "@/hooks/use-spotlight";

/* ── Beat model ─────────────────────────────────────────────────────── */

interface Beat {
  time: string;
  title: string;
  line: string;
  state: (typeof ORB_STATE_ORDER)[number];
}

const BEATS: Beat[] = [
  {
    time: "06:30",
    title: "She wakes her first.",
    line: "A voice reminder for the BP tablet — logged the moment it's taken.",
    state: "speaking",
  },
  {
    time: "09:10",
    title: "The queue that follows you.",
    line: "Scan the clinic QR from your sofa. Your number counts down at home.",
    state: "vigilant",
  },
  {
    time: "11:00",
    title: "The doctor arrives.",
    line: "A licensed physician at your door — exam, diagnosis, prescription.",
    state: "attentive",
  },
  {
    time: "14:00",
    title: "Vitals, logged & relayed.",
    line: "She checks in, nudges the reading, and flags anything unusual.",
    state: "vigilant",
  },
  {
    time: "18:30",
    title: "The handover you don't see.",
    line: "The day's events, summarised for your doctor's evening review.",
    state: "attentive",
  },
  {
    time: "21:30",
    title: "Goodnight. Not goodbye.",
    line: "Night mode — slower, dimmer, still watching. Tomorrow is planned.",
    state: "night",
  },
];

/* ── Miniature previews for the non-live beats ──────────────────────── */

function BeatPreview({ index }: { index: number }) {
  if (index === 1) {
    return (
      <div className="mt-4 flex items-center justify-end gap-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ash">
          3 ahead · ~12 min
        </span>
        <span className="font-display text-5xl italic text-ivory/90">#07</span>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="mt-4 flex items-center gap-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 bg-ivory/5 font-display text-sm italic">
          SR
        </span>
        <div className="text-[12px] leading-snug">
          <p className="text-ivory/90">Dr. S. Rao · General Medicine</p>
          <p className="text-ash">At your door · Rx written today</p>
        </div>
        <Stethoscope className="ml-auto h-4 w-4 text-silver/60" />
      </div>
    );
  }
  if (index === 3) {
    return (
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
        <span className="text-ivory/85">
          BP <span className="font-display italic">128/82</span>
        </span>
        <span className="text-ivory/85">
          Sugar <span className="font-display italic">156</span>
        </span>
        <span className="text-ivory/85">
          Temp <span className="font-display italic">98.4°F</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-ash">
          <Activity className="h-3.5 w-3.5" /> relayed to Dr. Rao
        </span>
      </div>
    );
  }
  if (index === 4) {
    return (
      <div className="mt-4 flex items-center gap-3 text-[12px] text-silver">
        <FileText className="h-4 w-4 text-silver/60" />
        <span>
          Evening brief → Dr. Rao · <span className="text-ivory/85">6 events</span> ·{" "}
          <span className="text-ivory/85">1 flag</span>
        </span>
      </div>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-3 text-[12px] text-silver">
      <Moon className="h-4 w-4 text-silver/60" />
      <span>
        Night mode on · monitoring continues · wake-up set for{" "}
        <span className="text-ivory/85">06:30</span>
      </span>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────────── */

export function DayBeats() {
  const liveRef = useRef<HTMLDivElement>(null);
  const liveInView = useInView(liveRef, { margin: "-24% 0px -24% 0px" });
  const sectionRef = useSpotlight<HTMLElement>();

  return (
    <section
      id="day"
      ref={sectionRef}
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      {/* Section spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(560px 380px at var(--sx, 50%) var(--sy, 20%), rgba(244,242,236,0.035) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ash">
            A day with Aturseva
          </p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.04] tracking-[-0.01em]">
            She never clocks out.
          </h2>
          <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-silver">
            Six beats from one ordinary Monday. Every interaction below is
            replayed from the product — nothing improvised, nothing
            free-form.
          </p>

          {/* Orb state legend */}
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {ORB_STATE_ORDER.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-ash"
                title={ORB_STATES[id].caption}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `rgba(244,242,236,${0.25 + ORB_STATES[id].rim * 0.7})` }}
                />
                {ORB_STATES[id].label}
              </span>
            ))}
          </div>
        </div>

        {/* Beats */}
        <ol className="mt-16 space-y-5">
          {BEATS.map((beat, i) => {
            const live = i === 0;
            return (
              <motion.li
                key={beat.time}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[64px_1fr] gap-4 sm:grid-cols-[110px_1fr] sm:gap-8"
              >
                <div className="pt-5 text-right sm:pt-6">
                  <span className="font-display text-lg italic text-silver/80 sm:text-2xl">
                    {beat.time}
                  </span>
                </div>

                <div className="glass relative overflow-hidden rounded-3xl p-5 transition-colors duration-500 hover:border-ivory/20 sm:p-6">
                  {/* Left rail: the beat's orb state */}
                  <span
                    aria-hidden
                    className="absolute inset-y-5 left-0 w-px"
                    style={{
                      background: `linear-gradient(to bottom, transparent, rgba(244,242,236,${0.18 + ORB_STATES[beat.state].rim * 0.5}), transparent)`,
                    }}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl tracking-[-0.01em] text-ivory sm:text-2xl">
                        {beat.title}
                      </h3>
                      <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-silver/85">
                        {beat.line}
                      </p>
                    </div>
                    <span className="glass shrink-0 rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-ash">
                      {ORB_STATES[beat.state].label}
                    </span>
                  </div>

                  {live ? (
                    <div
                      ref={liveRef}
                      className="mt-5 rounded-2xl border border-ivory/10 bg-ink-950/60 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ash">
                          <QrCode className="h-3.5 w-3.5" />
                          Live replay · session 0847
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-ash/60">
                          {liveInView ? "playing" : "paused"}
                        </span>
                      </div>
                      <ChatReplay
                        script={MORNING_SCRIPT}
                        active={liveInView}
                        className="h-[300px] pr-1"
                      />
                    </div>
                  ) : (
                    <BeatPreview index={i} />
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
