"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer spotlight. Writes `--sx` / `--sy` (element-relative px) as the
 * pointer moves over the element, for use in radial-gradient backgrounds:
 *
 *   background: radial-gradient(320px at var(--sx, 50%) var(--sy, 50%), ...)
 *
 * No-ops on coarse pointers.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - r.left}px`);
      el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return ref;
}
