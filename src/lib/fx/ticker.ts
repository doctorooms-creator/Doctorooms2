/**
 * Aturseva landing — shared rAF ticker.
 *
 * Every continuous landing animation (cursor lerp, magnetic pull, dot grid
 * parallax, countdown ring) subscribes to this single loop instead of
 * spawning its own requestAnimationFrame. The loop self-starts when the
 * first subscriber joins, self-stops when the last one leaves, and pauses
 * automatically while the tab is hidden.
 */

export type TickFn = (now: number, dt: number) => void;

const subscribers = new Set<TickFn>();

let rafId = 0;
let last = 0;
let running = false;

function frame(now: number): void {
  const dt = last === 0 ? 1000 / 60 : Math.min(now - last, 100);
  last = now;
  for (const fn of subscribers) fn(now, dt);
  rafId = requestAnimationFrame(frame);
}

function start(): void {
  if (running) return;
  running = true;
  last = 0;
  rafId = requestAnimationFrame(frame);
}

function stop(): void {
  if (!running) return;
  running = false;
  cancelAnimationFrame(rafId);
  last = 0;
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else if (subscribers.size > 0) {
      start();
    }
  });
}

/** Subscribe to the shared ticker. Returns an unsubscribe function. */
export function onTick(fn: TickFn): () => void {
  subscribers.add(fn);
  start();
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) stop();
  };
}
