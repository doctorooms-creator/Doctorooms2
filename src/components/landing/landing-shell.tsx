"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { CursorLayer } from "@/components/landing/fx/CursorLayer";
import { GrainOverlay } from "@/components/landing/fx/GrainOverlay";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { DayBeats } from "@/components/landing/DayBeats";
import { BaariScrub } from "@/components/landing/BaariScrub";
import { DuskArc } from "@/components/landing/DuskArc";
import { Boundary } from "@/components/landing/Boundary";
import { QueueToken } from "@/components/landing/QueueToken";
import { ClosingCTA } from "@/components/landing/ClosingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

/**
 * Aturseva landing v2 — composition root.
 * Monochrome ink → ivory, Fraunces + Manrope, glass surfaces.
 * `MotionConfig reducedMotion="user"` neutralises transform animations
 * for reduced-motion visitors; continuous FX gate themselves.
 */
export function LandingShell() {
  useEffect(() => {
    document.body.classList.add("aturseva-body");
    /* Anchor links glide (nav, handoff chips, the day rail) — unless the
       visitor prefers reduced motion, in which case they jump. */
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!rm) document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.body.classList.remove("aturseva-body");
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="aturseva relative flex min-h-screen flex-col bg-ink-950 text-ivory">
        <CursorLayer />
        <GrainOverlay />
        <LandingNav />
        <main className="flex-1">
          <Hero />
          <Marquee />
          <DayBeats />
          <BaariScrub />
          <DuskArc />
          <Boundary />
          <QueueToken />
          <ClosingCTA />
        </main>
        <LandingFooter />
      </div>
    </MotionConfig>
  );
}
