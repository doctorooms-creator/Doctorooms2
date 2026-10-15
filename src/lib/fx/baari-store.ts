/**
 * Live BAARI token store — a tiny synchronous pub/sub.
 *
 * BaariScrub publishes { token, turn } as the pinned scrub runs; the day
 * rail inside the Boundary section subscribes so the "02/06 · QUEUE LIVE"
 * card mirrors the live token anywhere on the page. No framework state
 * needed — one module, two listeners max, updated at most once a frame.
 */

export interface BaariSnapshot {
  token: number;
  turn: boolean;
}

/** Final state — what markup/no-JS/RM always show. */
const FINAL: BaariSnapshot = { token: 1, turn: true };

let state: BaariSnapshot = FINAL;
const listeners = new Set<() => void>();

export function setBaari(token: number, turn: boolean): void {
  const next: BaariSnapshot = { token, turn };
  if (next.token === state.token && next.turn === state.turn) return;
  state = next;
  listeners.forEach((l) => l());
}

export function subscribeBaari(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBaariSnapshot(): BaariSnapshot {
  return state;
}

/** Server/hydration snapshot — the final state, always stable. */
export function getBaariServerSnapshot(): BaariSnapshot {
  return FINAL;
}
