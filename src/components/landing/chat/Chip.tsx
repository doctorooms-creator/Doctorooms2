"use client";

import type { ReactNode } from "react";

interface ChipProps {
  time: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

/**
 * A "moment chip" — one canned beat from a day with Aturseva
 * (06:30 medicine, 09:10 queue…). Selecting one re-tunes the orb and
 * replays the moment. 44px minimum touch target.
 */
export function Chip({ time, label, active = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      data-cursor="REPLAY"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "glass group inline-flex min-h-[44px] items-center gap-3 rounded-full px-4 py-2.5 text-left transition-all duration-300",
        active
          ? "border-ivory/40 bg-ivory/[0.09] shadow-[0_0_32px_rgba(244,242,236,0.07)]"
          : "hover:border-ivory/25 hover:bg-ivory/[0.05]",
      ].join(" ")}
    >
      <span
        className={[
          "font-display text-[13px] italic",
          active ? "text-ivory" : "text-silver",
        ].join(" ")}
      >
        {time}
      </span>
      <span className="h-3.5 w-px bg-ivory/15" aria-hidden />
      <span
        className={[
          "text-[12px] font-medium tracking-wide",
          active ? "text-ivory" : "text-silver/85",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}
