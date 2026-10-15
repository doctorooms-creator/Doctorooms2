"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { ORB_STATES, type OrbStateId } from "./orb-states";
import { useReducedMotion } from "@/hooks/use-media";

const OrbCanvas = dynamic(() => import("./OrbCanvas"), {
  ssr: false,
  loading: () => <StaticOrb />,
});

/* ── Static orb: reduced-motion fallback, loading & WebGL-failure state ── */

export function StaticOrb() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-label="Aturseva orb — resting"
    >
      <defs>
        <radialGradient id="atva-core" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#f4f2ec" stopOpacity="0.9" />
          <stop offset="38%" stopColor="#8f8b81" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#0e1013" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#f4f2ec" strokeOpacity="0.1" strokeDasharray="1 5" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="#f4f2ec" strokeOpacity="0.14" />
      <circle cx="100" cy="100" r="62" fill="url(#atva-core)" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#f4f2ec" strokeOpacity="0.28" />
      <ellipse cx="82" cy="76" rx="16" ry="9" fill="#f4f2ec" opacity="0.35" transform="rotate(-24 82 76)" />
    </svg>
  );
}

/* ── WebGL error boundary ────────────────────────────────────────────── */

class OrbBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // WebGL unavailable — the static orb is the designed fallback.
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ── Orb ───────────────────────────────────────────────────────────────
   Priority of the visible state:
     forced (parent, e.g. a replay is playing)
       > attentive (a fine pointer is near the orb)
       > base (ambient per-section state)                                  */

interface OrbProps {
  base?: OrbStateId;
  forced?: OrbStateId | null;
  className?: string;
}

export function Orb({ base = "idle", forced = null, className = "" }: OrbProps) {
  const rm = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || rm) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(e.clientX - cx, e.clientY - cy);
      setNear(d < Math.max(r.width, r.height) * 0.72);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rm]);

  const state: OrbStateId = forced ?? (near ? "attentive" : base);
  const cfg = ORB_STATES[state];

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-square select-none ${className}`}
    >
      {/* Glow bed */}
      <div
        aria-hidden
        className="absolute inset-[-18%] rounded-full blur-3xl transition-opacity duration-700"
        style={{
          opacity: cfg.glow,
          background:
            "radial-gradient(circle at 50% 44%, rgba(244,242,236,0.16) 0%, rgba(244,242,236,0.05) 42%, transparent 70%)",
        }}
      />
      {/* Orb body */}
      <div className="absolute inset-0" aria-hidden>
        {rm ? (
          <StaticOrb />
        ) : (
          <OrbBoundary fallback={<StaticOrb />}>
            <OrbCanvas state={state} />
          </OrbBoundary>
        )}
      </div>
      {/* State chip */}
      <div className="absolute inset-x-0 -bottom-2 flex justify-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-silver">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-ivory opacity-60"
              style={{
                animation: rm ? undefined : "atva-pulse-ring 2.4s ease-out infinite",
              }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ivory" />
          </span>
          Aturseva · {cfg.label}
        </span>
      </div>
    </div>
  );
}
