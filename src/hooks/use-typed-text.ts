"use client";

import { useEffect, useRef, useState } from "react";

interface TypedOptions {
  /** Characters per second. */
  cps?: number;
  /** Start only when this is true. */
  active?: boolean;
  /** Delay before the first character, in ms. */
  startDelay?: number;
}

/**
 * Typewriter for replayed AI speech. Punctuation gets natural pauses.
 * Under reduced-motion the full text renders instantly.
 */
export function useTypedText(
  text: string,
  { cps = 34, active = true, startDelay = 0 }: TypedOptions = {},
) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      setDone(true);
      return;
    }

    let i = 0;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      i += 1;
      setCount(i);
      if (i >= text.length) {
        setDone(true);
        return;
      }
      const ch = text[i - 1];
      const pause =
        ch === "." || ch === "!" || ch === "?"
          ? 320
          : ch === ","
            ? 160
            : ch === " "
              ? 38
              : 0;
      timer.current = setTimeout(step, 1000 / cps + pause);
    };

    timer.current = setTimeout(step, startDelay);

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, cps, active, startDelay]);

  const skip = () => {
    if (timer.current) clearTimeout(timer.current);
    setCount(text.length);
    setDone(true);
  };

  return { display: text.slice(0, count), done, skip };
}
