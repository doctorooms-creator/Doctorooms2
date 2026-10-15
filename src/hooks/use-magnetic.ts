"use client";

import { useEffect, useRef } from "react";
import { onTick } from "@/lib/fx/ticker";

interface MagneticOptions {
  /** 0–1, how far the element travels toward the pointer. */
  strength?: number;
  /** Extra grab radius around the element, in px. */
  radius?: number;
}

/**
 * Antigravity-style magnetic pull. Attach the returned ref to any
 * element; when a fine pointer comes near, the element drifts toward it
 * (lerped on the shared ticker) and springs back on leave.
 * No-ops entirely on coarse pointers and reduced-motion.
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.32,
  radius = 110,
}: MagneticOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let engaged = false;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const reach = radius + Math.max(r.width, r.height) / 2;
      if (dist < reach) {
        engaged = true;
        targetX = dx * strength;
        targetY = dy * strength;
      } else if (engaged) {
        engaged = false;
        targetX = 0;
        targetY = 0;
      }
    };

    const onLeave = () => {
      engaged = false;
      targetX = 0;
      targetY = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);

    const unsub = onTick(() => {
      const dx = targetX - curX;
      const dy = targetY - curY;
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
        // Converged — snap exactly and stop touching the style so the
        // element reads as stable (to automation and to the browser).
        if (el.style.transform !== "") {
          curX = targetX;
          curY = targetY;
          el.style.transform =
            targetX === 0 && targetY === 0
              ? ""
              : `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0)`;
        }
        return;
      }
      curX += dx * 0.14;
      curY += dy * 0.14;
      el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      unsub();
      el.style.transform = "";
    };
  }, [strength, radius]);

  return ref;
}
