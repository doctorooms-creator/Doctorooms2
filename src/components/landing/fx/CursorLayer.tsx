"use client";

import { useEffect, useRef, useState } from "react";
import { onTick } from "@/lib/fx/ticker";
import { usePointerFine, useReducedMotion } from "@/hooks/use-media";

/**
 * The cursor family — a precise ivory dot that tracks the pointer
 * instantly, and a trailing ring that lerps behind it on the shared
 * ticker. Over anything marked `data-cursor="LABEL"` the ring opens and
 * speaks. Native cursor is hidden only while this layer is alive, and
 * only on fine pointers without reduced-motion.
 */
export function CursorLayer() {
  const fine = usePointerFine();
  const rm = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const enabled = fine && !rm;

  useEffect(() => {
    if (!enabled) return;

    const root = document.querySelector<HTMLElement>(".aturseva");
    root?.classList.add("aturseva-cursor-on");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      setVisible(true);

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button",
      );
      if (target) {
        const text = target.getAttribute("data-cursor");
        setLabel(text && text.length > 0 ? text : null);
        setHover(true);
      } else {
        setLabel(null);
        setHover(false);
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeaveDoc = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveDoc);

    const unsub = onTick(() => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeaveDoc);
      unsub();
      root?.classList.remove("aturseva-cursor-on");
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringScale = pressed ? 0.82 : label ? 2.1 : hover ? 1.55 : 1;

  return (
    <>
      {/* Dot — zero-lag */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90]"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s" }}
      >
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory" />
      </div>
      {/* Ring — trailing */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[89]"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}
      >
        <div
          className="relative flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/45 transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${ringScale})`,
            backgroundColor: label ? "rgba(244,242,236,0.06)" : "transparent",
          }}
        >
          {label ? (
            <span className="absolute top-full left-1/2 mt-2 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[0.24em] whitespace-nowrap text-ivory/90">
              {label}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}
