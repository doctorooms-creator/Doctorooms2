"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useTypedText } from "@/hooks/use-typed-text";
import { VoiceWave } from "./VoiceWave";

interface VoiceBubbleProps {
  text: string;
  /** Replay generation counter — bump to replay. */
  generation: number;
  onDone?: () => void;
}

/**
 * A replayed voice message: waveform + the sentence typed out at
 * speaking pace, the way the product reads it aloud. Click the sentence
 * (or the replay control) to skip straight to the end.
 */
export function VoiceBubble({ text, generation, onDone }: VoiceBubbleProps) {
  const { display, done, skip } = useTypedText(text, {
    cps: 30,
    active: true,
    startDelay: 240,
  });

  useEffect(() => {
    if (done) onDone?.();
  }, [done, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full flex-col items-start"
    >
      <div className="glass max-w-[86%] rounded-2xl rounded-bl-md px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <VoiceWave active={!done} />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ash">
            {done ? "voice · sent" : "speaking"}
          </span>
          <button
            type="button"
            data-cursor="REPLAY"
            aria-label="Replay voice message"
            onClick={(e) => {
              e.stopPropagation();
              skip();
            }}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-ivory/15 text-silver transition-colors hover:border-ivory/40 hover:text-ivory"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
        <p
          key={generation}
          className="mt-2 min-h-[2.6em] cursor-default text-[13px] leading-relaxed text-ivory/90"
          onClick={skip}
        >
          &ldquo;{display}
          {!done && (
            <span
              className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-ivory/80"
              style={{ animation: "atva-caret 0.9s step-end infinite" }}
            />
          )}
          {done ? "\u201D" : ""}
        </p>
      </div>
      <span className="mt-1 px-1 text-[10px] tracking-wide text-ash/70">
        Aturseva · voice
      </span>
    </motion.div>
  );
}
