"use client";

const BARS = [
  { rest: 3, peak: 12, dur: 1.05, delay: 0 },
  { rest: 5, peak: 18, dur: 0.85, delay: 0.12 },
  { rest: 4, peak: 22, dur: 0.95, delay: 0.05 },
  { rest: 5, peak: 15, dur: 0.75, delay: 0.18 },
  { rest: 3, peak: 10, dur: 1.1, delay: 0.08 },
];

/**
 * Five-bar voice waveform. While `active`, bars breathe at staggered
 * tempos (CSS keyframes — no JS loop). At rest they sit at their rest
 * heights. Reduced-motion is neutralised globally in globals.css.
 */
export function VoiceWave({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex h-5 items-center gap-[3px]"
      aria-hidden
    >
      {BARS.map((b, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-ivory/85"
          style={{
            height: active ? `${b.peak}px` : `${b.rest}px`,
            transformOrigin: "center",
            animation: active
              ? `atva-wave ${b.dur}s ${b.delay}s ease-in-out infinite`
              : undefined,
            transition: "height 0.4s ease",
          }}
        />
      ))}
    </span>
  );
}
