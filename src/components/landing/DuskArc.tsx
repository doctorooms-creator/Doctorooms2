"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Ban, Check, Soup, Utensils } from "lucide-react";
import { StaticOrb } from "@/components/landing/orb/Orb";
import { useReducedMotion } from "@/hooks/use-media";

/* ── Beat 5 — the afternoon arc ────────────────────────────────────────
   The visit ends; the watch continues. A pinned scrub walks one Monday
   afternoon into night: kiosk QR check-in → the sun sets across a
   hairline horizon → the 7:00 PM diet nudge arrives → the orb dims to
   night mode. Stars come out; the stage deepens.
   Trust boundary: markup ships the FINAL state (checked in, diet sent,
   night fallen) for RM/no-JS. The engine rewinds on mount for motion
   users; the kiosk resets for everyone with JS — it's a tap, not a
   tween, so reduced-motion visitors still get to check in.            */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 12:40 PM → 7:00 PM across the scrub; freezes at 7:00. */
function duskClock(p: number): string {
  if (p >= 0.85) return "7:00 PM";
  const t = clamp01((p - 0.06) / 0.79);
  const minutes = 12 * 60 + 40 + Math.round(380 * t);
  const h24 = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const h = h24 > 12 ? h24 - 12 : h24;
  return `${h}:${String(mm).padStart(2, "0")} PM`;
}

/* Deterministic star field (same on server and client). */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const STARS = (() => {
  const rnd = mulberry32(1907);
  return Array.from({ length: 26 }, () => ({
    x: +(rnd() * 100).toFixed(2),
    y: +(rnd() * 58).toFixed(2),
    s: +(0.8 + rnd() * 1.5).toFixed(2),
    o: +(0.3 + rnd() * 0.55).toFixed(2),
    d: `${(rnd() * 4).toFixed(2)}s`,
  }));
})();

/* Fallback QR tile pattern (before the real QR renders). */
const PATTERN = [
  1,1,1,0,1,0, 1,0,1,0,0,1, 1,0,1,1,0,1, 0,1,0,1,1,0, 1,1,0,0,1,0, 0,1,1,0,1,1,
];

type CheckState = "waiting" | "scanning" | "done";

const DIET_ROWS = [
  { icon: Soup, label: "Light khichdi + curd", logged: "logged 7:02 PM" },
  { icon: Utensils, label: "Vegetable soup, no salt", logged: "logged 7:04 PM" },
];

export function DuskArc() {
  const sectionRef = useRef<HTMLElement>(null);
  const rm = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* SSR + RM + no-JS ship the final state (night has fallen). */
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

  /* Kiosk: ships done; JS resets to interactive (a tap, not a tween). */
  const [check, setCheck] = useState<CheckState>("done");
  useEffect(() => {
    setCheck("waiting");
  }, []);
  const tapCheckIn = () => {
    if (check !== "waiting") return;
    setCheck("scanning");
    window.setTimeout(() => setCheck("done"), 900);
  };

  /* Real QR, client-side. */
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL("ATURSEVA-OPD · CHECK-IN · DR. S. · 12:40 PM", {
          margin: 1,
          width: 200,
          color: { dark: "#0a0b0d", light: "#f4f2ec" },
        }),
      )
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        /* fallback pattern stays */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Dusk derived state. */
  const t = clamp01((p - 0.08) / 0.74); // sun travel 0.08 → 0.82
  const sink = clamp01((p - 0.82) / 0.18); // sun below horizon
  const night = p >= 0.75;
  const dietActive = p >= 0.6;
  const starsOpacity = clamp01((p - 0.55) / 0.3) * 0.55;
  const nightWash = clamp01((p - 0.45) / 0.4) * 0.8;
  const dayGlow = 1 - clamp01(p * 1.4);
  const sunX = 4 + t * 84; // % across the horizon
  const sunY = -Math.sin(t * Math.PI) * 54 + sink * 34; // rise, arc, set
  const sunOpacity = Math.max(0.05, 1 - t * 0.7 - sink * 0.25);
  const orbDim = 0.9 - clamp01((p - 0.5) / 0.5) * 0.45;

  const checkedIn = check === "done";
  const scanning = check === "scanning";

  return (
    <section
      id="dusk"
      ref={sectionRef}
      aria-label="The afternoon arc — kiosk check-in, dusk, and the evening diet nudge, replayed as you scroll"
      className={`relative scroll-mt-0 ${
        rm ? "py-24 sm:py-32" : "h-[220vh] sm:h-[240vh]"
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          rm ? "" : "sticky top-0 flex h-[100svh] flex-col justify-center"
        }`}
      >
        {/* Day glow — fades as the afternoon passes */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: dayGlow,
            background:
              "radial-gradient(760px 420px at 50% 18%, rgba(244,242,236,0.06) 0%, transparent 65%)",
          }}
        />
        {/* Night wash — the stage deepens */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#050608]"
          style={{ opacity: nightWash }}
        />
        {/* Stars */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: starsOpacity }}
        >
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-ivory"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.s}px`,
                height: `${s.s}px`,
                opacity: s.o,
                animation: rm ? undefined : `atva-twinkle ${3 + (i % 5)}s ${s.d} ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div
          data-cursor="SCROLL"
          className={`relative mx-auto flex w-full max-w-5xl flex-col px-5 sm:px-8 ${
            rm ? "py-6" : ""
          }`}
        >
          {/* Eyebrow */}
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-ash">
            <span>City Care Clinic · OPD</span>
            <span aria-hidden className="text-ash/50">—</span>
            <span className="tabular-nums">{duskClock(p)}</span>
            <span aria-hidden className="hidden text-ash/50 sm:inline">—</span>
            <span className="hidden sm:inline">afternoon into evening</span>
          </p>

          <h2 className="font-display mt-3 text-center text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.05] tracking-[-0.01em]">
            The visit ends.
            <br />
            <span className="bg-gradient-to-b from-ivory to-silver bg-clip-text italic text-transparent">
              The watch continues.
            </span>
          </h2>

          {/* Horizon — the sun sets across it; the orb rides the right end */}
          <div className="relative mx-auto mt-5 w-full max-w-3xl sm:mt-10">
            <div className="relative h-[84px] overflow-hidden sm:h-[104px]">
              {/* Orb cameo — dims to night */}
              <div
                className="absolute right-[2%] top-0 w-14 transition-opacity duration-700 sm:w-16"
                style={{ opacity: orbDim }}
              >
                <StaticOrb />
                <p className="mt-1 text-center text-[8.5px] font-semibold uppercase tracking-[0.2em] text-ash">
                  {night ? "night mode on" : "7:00 · nudge"}
                </p>
              </div>
              {/* The sun */}
              <span
                aria-hidden
                className="absolute bottom-[26px] block h-3.5 w-3.5 rounded-full bg-ivory shadow-[0_0_18px_5px_rgba(244,242,236,0.35)]"
                style={{
                  left: `${sunX}%`,
                  transform: `translate(-50%, ${sunY}px)`,
                  opacity: sunOpacity,
                  transition: "opacity 120ms linear",
                }}
              />
              {/* The horizon hairline */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[26px] h-px bg-ivory/12"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.2em] text-ash/70">
              <span>12:40 PM · checked in</span>
              <span className="hidden sm:inline">the afternoon passes</span>
              <span>7:00 PM · diet nudge</span>
            </div>
          </div>

          {/* The two cards */}
          <div className="mt-4 grid items-stretch gap-3.5 sm:mt-8 sm:gap-5 lg:grid-cols-2">
            {/* ── Kiosk check-in card ── */}
            <div
              data-cursor="CHECK IN"
              className="glass-strong relative flex flex-col rounded-3xl p-3.5 text-left sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ash">
                  Self check-in · Kiosk 02
                </span>
                <motion.span
                  key={checkedIn ? "in" : "wait"}
                  initial={{ rotateX: rm ? 0 : -55, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: rm ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-flex min-h-[24px] items-center rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] ${
                    checkedIn
                      ? "bg-ivory text-ink-950"
                      : "border border-ivory/20 text-silver"
                  }`}
                >
                  {checkedIn ? "Checked in · 12:40 PM" : "Waiting · token #12"}
                </motion.span>
              </div>

              <div className="mt-3 flex items-center gap-4 sm:mt-5 sm:gap-5">
                <div className="shrink-0 rounded-2xl border border-ivory/10 bg-ink-950/90 p-2 sm:p-2.5">
                  <div className="relative h-[76px] w-[76px] overflow-hidden rounded-xl bg-ivory p-1.5 sm:h-[96px] sm:w-[96px]">
                    {qr ? (
                      <img
                        src={qr}
                        alt="Clinic check-in QR code"
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="grid h-full w-full grid-cols-6 gap-[1.5px]">
                        {PATTERN.map((on, i) => (
                          <span
                            key={i}
                            className={on ? "bg-ink-950" : "bg-transparent"}
                          />
                        ))}
                      </div>
                    )}
                    {scanning ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-1 top-0 h-[2px] bg-ink-950/70"
                        style={{ animation: "atva-scan-y 0.9s linear forwards" }}
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 text-center text-[8px] uppercase tracking-[0.22em] text-ash">
                    Scan at the kiosk
                  </p>
                </div>

                <div className="min-w-0">
                  <motion.p
                    key={checkedIn ? "done" : "wait"}
                    initial={{ opacity: 0, y: rm ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: rm ? 0 : 0.35 }}
                    className="text-[13px] leading-snug text-ivory/90"
                  >
                    {checkedIn
                      ? "Check-in ho gaya — Dr. S. ki live list par aa gaye."
                      : "QR check-in — ek tap ka kaam."}
                  </motion.p>
                  <p className="mt-2 text-[11px] leading-relaxed text-ash">
                    Token #12 · Dr. S., MD — Internal Medicine
                  </p>
                  <p className="mt-1 hidden text-[9.5px] tracking-wide text-ash/60 sm:block">
                    Illustrative QR · representative visit
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={tapCheckIn}
                disabled={check !== "waiting"}
                aria-pressed={checkedIn}
                className={`mt-3.5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors sm:mt-5 ${
                  checkedIn
                    ? "border border-ivory/25 bg-ivory/[0.06] text-silver"
                    : "bg-ivory text-ink-950 hover:bg-white"
                } ${scanning ? "animate-pulse" : ""}`}
              >
                {checkedIn ? (
                  <>
                    <Check className="h-4 w-4" /> Checked in
                  </>
                ) : scanning ? (
                  "Checking in…"
                ) : (
                  "Tap to check in"
                )}
              </button>
            </div>

            {/* ── Evening diet nudge card ── */}
            <motion.div
              animate={{
                opacity: dietActive || rm ? 1 : 0.45,
                y: dietActive || rm ? 0 : 8,
              }}
              transition={{ duration: rm ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative flex flex-col rounded-3xl p-3.5 text-left sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ash">
                  Evening diet · 7:00 PM
                </span>
                <span
                  className={`inline-flex min-h-[24px] items-center rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 ${
                    dietActive
                      ? "bg-ivory text-ink-950"
                      : "border border-ivory/20 text-silver"
                  }`}
                >
                  {dietActive ? "Sent · 7:00 PM" : "Scheduled · 7:00 PM"}
                </span>
              </div>

              {/* The voice bubble — or its waiting placeholder */}
              {dietActive || rm ? (
                <div className="mt-3 flex gap-3 sm:mt-5">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ivory/20 bg-ivory/[0.05] font-display text-[13px] italic text-ivory/90"
                  >
                    A
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-ivory/10 bg-ivory/[0.04] px-4 py-2.5">
                    <p className="text-[13px] leading-relaxed text-ivory/90">
                      Doctor ne diet batayi — shaam 7 baje, yaad rakha.
                    </p>
                    <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-ash">
                      Aturseva · voice · 7:00 PM
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 px-1 text-[12px] italic leading-relaxed text-ash sm:mt-5">
                  She&rsquo;ll speak at 7:00 PM — the plan the doctor left.
                </p>
              )}

              {/* Diet rows */}
              <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                {DIET_ROWS.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ivory/10 bg-ivory/[0.02] px-3.5 py-2 sm:py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2.5 text-[12.5px] text-silver">
                      <row.icon className="h-3.5 w-3.5 shrink-0 text-silver/60" />
                      {row.label}
                    </span>
                    {dietActive || rm ? (
                      <span className="shrink-0 rounded-full border border-ivory/25 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-ivory/85">
                        {row.logged}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] tracking-wide text-ash/50">
                        pending
                      </span>
                    )}
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-ivory/15 px-3.5 py-2 sm:py-2.5">
                  <span className="flex min-w-0 items-center gap-2.5 text-[12.5px] text-ash">
                    <Ban className="h-3.5 w-3.5 shrink-0 text-ash/70" />
                    No fried snacks tonight
                  </span>
                  <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.18em] text-ash/70">
                    avoid
                  </span>
                </li>
              </ul>

              {/* Doctor footer — desktop only (mobile is compact) */}
              <div className="hairline-t mt-3 hidden items-center gap-3 pt-3.5 sm:mt-4 sm:flex sm:pt-4">
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ivory/20 bg-ivory/[0.05] font-display text-[13px] italic text-ivory/90"
                >
                  S
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] text-silver">
                    Dr. S., MD — Internal Medicine
                  </p>
                  <p className="text-[10px] text-ash">Diet set at today&rsquo;s visit</p>
                </div>
                <span className="ml-auto hidden shrink-0 rounded-full border border-ivory/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/90 sm:inline-flex">
                  Doctor-set plan
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
