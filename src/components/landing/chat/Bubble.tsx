"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type BubbleVariant = "ai" | "patient" | "system";

interface BubbleProps {
  variant: BubbleVariant;
  children: ReactNode;
  time?: string;
  className?: string;
}

/**
 * A single replayed message. The landing only ever *replays* canned
 * product conversations — `from`/`time` labels make that explicit.
 */
export function Bubble({ variant, children, time, className = "" }: BubbleProps) {
  if (variant === "system") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`my-3 flex items-center gap-3 ${className}`}
      >
        <span className="h-px flex-1 bg-ivory/10" />
        <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-ash">
          {children}
        </span>
        <span className="h-px flex-1 bg-ivory/10" />
      </motion.div>
    );
  }

  const isAi = variant === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex w-full flex-col ${isAi ? "items-start" : "items-end"} ${className}`}
    >
      <div
        className={[
          "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
          isAi
            ? "glass rounded-bl-md text-ivory/90"
            : "rounded-br-md border border-ivory/10 bg-ivory/[0.07] text-silver",
        ].join(" ")}
      >
        {children}
      </div>
      {time ? (
        <span className="mt-1 px-1 text-[10px] tracking-wide text-ash/70">
          {isAi ? "Aturseva" : "You"} · {time}
        </span>
      ) : null}
    </motion.div>
  );
}
