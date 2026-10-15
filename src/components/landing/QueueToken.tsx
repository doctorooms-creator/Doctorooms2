"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { onTick } from "@/lib/fx/ticker";
import { useMagnetic } from "@/hooks/use-magnetic";

/* Total demo countdown: 12:00. Ticks at 12x so a full loop takes 60s. */
const TOTAL = 720;
const SPEED = 12;

const CLAIMS = [
  "Scan once at the clinic QR — the number follows you home",
  "Live countdown — three ahead of you, about twelve minutes",
  "She calls you in — leave home at the right moment, not early",
  "Works on Amma's phone too — family access, no app to learn",
];

/* Fallback QR tile pattern (used until/if the real QR renders). */
const PATTERN = [
  1,1,1,0,1,0,1, 0,1,0,1,0,0,1, 1,0,1,1,1,0,1, 1,0,0,1,0,1,0,
  0,1,1,0,1,1,0, 1,0,1,0,0,1,1, 0,1,0,1,1,0,1, 1,1,0,0,1,0,0,
  1,0,1,1,0,1,1, 0,1,0,1,0,1,0, 1,1,0,0,1,1,1, 0,0,1,1,0,1,0,
  1,0,1,0,1,0,1,
];

function formatClock(rem: number): string {
  const m = Math.floor(rem / 60);
  const s = Math.floor(rem % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function aheadOf(rem: number): number {
  return Math.max(0, Math.ceil(rem / 240));
}

export function QueueToken() {
  const [remaining, setRemaining] = useState(TOTAL);
  const [turn, setTurn] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const turnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accelerated countdown on the shared ticker. Loop: 12:00 → your turn → reset.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let rem = TOTAL;
    const unsub = onTick((_, dt) => {
      if (turnTimer.current) return;
      rem -= (dt / 1000) * SPEED;
      if (rem <= 0) {
        rem = TOTAL;
        setRemaining(0);
        setTurn(true);
        turnTimer.current = setTimeout(() => {
          turnTimer.current = null;
          setTurn(false);
          setRemaining(TOTAL);
        }, 4200);
        return;
      }
      setRemaining(rem);
    });
    return () => {
      unsub();
      if (turnTimer.current) clearTimeout(turnTimer.current);
      turnTimer.current = null;
    };
  }, []);

  // Real QR (client-side, dynamically imported — keeps the bundle honest).
  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(
          "ATURSEVA-OPD · TOKEN 07 · CITY CARE CLINIC",
          {
            margin: 1,
            width: 240,
            color: { dark: "#0a0b0d", light: "#f4f2ec" },
          },
        ),
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

  const rem = turn ? 0 : remaining;
  const progress = rem / TOTAL; // 1 → full ring, 0 → empty
  const ahead = aheadOf(rem);
  const R = 62;
  const C = 2 * Math.PI * R;

  const cardRef = useMagnetic<HTMLDivElement>({ strength: 0.05, radius: 160 });

  return (
    <section id="queue" className="relative scroll-mt-24 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 480px at 28% 45%, rgba(244,242,236,0.04) 0%, transparent 68%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:gap-20">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ash">
            The number that belongs to you
          </p>
          <h2 className="font-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.04] tracking-[-0.01em]">
            Your queue number lives
            <br />
            <span className="italic text-silver">in your pocket.</span>
          </h2>
          <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-silver">
            Paper tokens get lost. TV boards get ignored. Aturseva puts the
            queue itself on your phone — scanned once, counting down live,
            calling you in when it&rsquo;s your turn.
          </p>
          <ul className="mt-8 space-y-4">
            {CLAIMS.map((c) => (
              <li key={c} className="flex items-start gap-3.5 text-[13.5px] leading-relaxed text-silver/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ivory/25">
                  <Check className="h-3 w-3 text-ivory/85" />
                </span>
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[11px] leading-relaxed tracking-wide text-ash">
            Works at every clinic on Aturseva — the token is yours, not the
            counter&rsquo;s.
          </p>
        </motion.div>

        {/* Token card */}
        <motion.div
          initial={{ opacity: 0, y: 32, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -2 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[340px]"
        >
          <div
            ref={cardRef}
            data-cursor="YOURS"
            className="glass-strong relative overflow-hidden rounded-[28px] p-7 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] transition-transform will-change-transform sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ash">
                City Care Clinic · OPD
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full bg-ivory opacity-50"
                    style={{ animation: "atva-pulse-ring 2s ease-out infinite" }}
                  />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ivory" />
                </span>
                Live
              </span>
            </div>

            {/* Number */}
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-ash">
                  Your number
                </p>
                <p className="font-display mt-1 text-[84px] leading-[0.9] tracking-[-0.02em] text-ivory">
                  #07
                </p>
              </div>
              <div className="pb-2 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-ash">
                  Ahead of you
                </p>
                <p className="font-display mt-1 text-3xl italic text-silver">
                  {turn ? "—" : ahead}
                </p>
              </div>
            </div>

            {/* Countdown ring */}
            <div className="mt-6 flex items-center gap-6">
              <svg viewBox="0 0 140 140" className="h-[130px] w-[130px] shrink-0" role="img" aria-label={`Countdown ${formatClock(rem)} remaining`}>
                <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(244,242,236,0.1)" strokeWidth="2" />
                <circle
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke="#f4f2ec"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                  transform="rotate(-90 70 70)"
                  style={{ transition: "stroke-dashoffset 0.6s linear" }}
                />
                <text
                  x="70"
                  y="66"
                  textAnchor="middle"
                  fill="#f4f2ec"
                  fontSize="20"
                  fontFamily="var(--font-fraunces), Georgia, serif"
                  fontStyle="italic"
                >
                  {turn ? "now" : formatClock(rem)}
                </text>
                <text x="70" y="86" textAnchor="middle" fill="rgba(183,178,167,0.8)" fontSize="8.5" letterSpacing="2.4">
                  {turn ? "YOUR TURN" : "MIN:SEC"}
                </text>
              </svg>

              {/* Status column */}
              <div className="min-w-0 space-y-3">
                <p className={`text-[12px] leading-snug ${turn ? "text-ivory" : "text-silver/90"}`}>
                  {turn ? (
                    <>
                      It&rsquo;s your turn.
                      <br />
                      Aturseva is calling you in.
                    </>
                  ) : ahead > 0 ? (
                    <>
                      Stay home.
                      <br />
                      <span className="text-ash">She&rsquo;ll say when to leave.</span>
                    </>
                  ) : (
                    <>
                      Time to leave —
                      <br />
                      <span className="text-ash">a 4-minute walk.</span>
                    </>
                  )}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ash/70">
                  Synced · just now
                </p>
              </div>
            </div>

            {/* QR */}
            <div className="hairline-t mt-6 flex items-center gap-4 pt-5">
              <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ivory p-1.5">
                {qr ? (
                  <img src={qr} alt="Clinic QR code" className="h-full w-full" />
                ) : (
                  <div className="grid h-full w-full grid-cols-7 gap-[1.5px]">
                    {PATTERN.map((on, i) => (
                      <span
                        key={i}
                        className={on ? "bg-ink-950" : "bg-transparent"}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-ash">
                Scan once at the clinic — or don&rsquo;t.
                <br />
                It&rsquo;s already yours.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
