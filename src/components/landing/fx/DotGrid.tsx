"use client";

import { useEffect, useRef } from "react";
import { onTick } from "@/lib/fx/ticker";

interface DotGridProps {
  className?: string;
  /** Grid spacing in CSS px. */
  spacing?: number;
  /** Falloff radius of the pointer light, in CSS px. */
  radius?: number;
}

/**
 * Ambient dot field. Dots brighten in a soft falloff around the pointer
 * and the whole field drifts a few px with pointer parallax — one draw
 * pass on the shared ticker, dirty-flag gated. Static under RM.
 */
export function DotGrid({ className = "", spacing = 30, radius = 300 }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };

    let px = w / 2;
    let py = h / 2;
    let tx = px;
    let ty = py;
    let ox = 0;
    let oy = 0;
    let dirty = true;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const step = spacing;
      for (let x = step / 2; x < w + step; x += step) {
        for (let y = step / 2; y < h + step; y += step) {
          const dx = x + ox - px;
          const dy = y + oy - py;
          const dist = Math.hypot(dx, dy);
          const fall = Math.max(0, 1 - dist / radius);
          const alpha = 0.045 + fall * fall * 0.34;
          if (alpha <= 0.046) continue;
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(244,242,236,${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }
      dirty = false;
    };

    if (rm || !fine) {
      // Static field, centred light, no listeners.
      const ro = new ResizeObserver(() => {
        resize();
        draw();
      });
      ro.observe(canvas);
      resize();
      draw();
      return () => ro.disconnect();
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = e.clientX - r.left;
      const ny = e.clientY - r.top;
      if (Math.abs(nx - tx) > 1.5 || Math.abs(ny - ty) > 1.5) {
        tx = nx;
        ty = ny;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();

    const unsub = onTick(() => {
      // Lerp the light and the parallax offset toward targets.
      const dx = tx - px;
      const dy = ty - py;
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        px += dx * 0.08;
        py += dy * 0.08;
        dirty = true;
      }
      // Parallax: dots drift opposite the light, scaled down.
      const tox = -(tx - w / 2) * 0.02;
      const toy = -(ty - h / 2) * 0.02;
      if (Math.abs(tox - ox) > 0.2 || Math.abs(toy - oy) > 0.2) {
        ox += (tox - ox) * 0.06;
        oy += (toy - oy) * 0.06;
        dirty = true;
      }
      if (dirty) draw();
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      unsub();
    };
  }, [spacing, radius]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
