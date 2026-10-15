"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bubble } from "./Bubble";
import { TypingDots } from "./TypingDots";
import { VoiceBubble } from "./VoiceBubble";

/* ── Script model ──────────────────────────────────────────────────────
   The landing never offers free-form AI chat. It replays canned
   scripts assembled from real product sessions. The engine below walks
   a script with natural typing/voice beats.                                */

export type ReplayStep =
  | { kind: "system"; text: string }
  | { kind: "typing"; ms?: number }
  | { kind: "voice"; text: string }
  | { kind: "msg"; from: "ai" | "patient"; text: string; time?: string }
  | { kind: "pause"; ms: number };

type RenderItem =
  | { key: number; type: "system"; text: string }
  | { key: number; type: "msg"; from: "ai" | "patient"; text: string; time?: string }
  | { key: number; type: "voice"; text: string }
  | { key: number; type: "typing" };

interface ChatReplayProps {
  script: ReplayStep[];
  /** Playback runs only while true. */
  active: boolean;
  onDone?: () => void;
  className?: string;
}

/** Estimated ms for a voice line to finish typing (cps = 30 + 240ms lead). */
function voiceDuration(text: string): number {
  return 240 + (text.length / 30) * 1000 * 1.12 + 480;
}

export function ChatReplay({ script, active, onDone, className = "" }: ChatReplayProps) {
  const [items, setItems] = useState<RenderItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    setItems([]);

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (rm) {
      // Static transcript — full content, zero motion.
      let key = 0;
      const transcript: RenderItem[] = script
        .filter((s) => s.kind !== "typing" && s.kind !== "pause")
        .map((s) => {
          key += 1;
          if (s.kind === "system") return { key, type: "system" as const, text: s.text };
          if (s.kind === "voice") return { key, type: "voice" as const, text: s.text };
          return {
            key,
            type: "msg" as const,
            from: s.from,
            text: s.text,
            time: s.time,
          };
        });
      setItems(transcript);
      onDoneRef.current?.();
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let rendered: RenderItem[] = [];
    let key = 0;
    let clock = 0;

    const at = (delay: number, fn: () => void) => {
      clock += delay;
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          fn();
        }, clock),
      );
    };

    for (const step of script) {
      switch (step.kind) {
        case "system": {
          key += 1;
          const item: RenderItem = { key, type: "system", text: step.text };
          at(430, () => {
            rendered = [...rendered, item];
            setItems(rendered);
          });
          break;
        }
        case "typing": {
          key += 1;
          const typing: RenderItem = { key, type: "typing" };
          at(240, () => {
            rendered = [...rendered, typing];
            setItems(rendered);
          });
          at(step.ms ?? 950, () => {
            rendered = rendered.filter((i) => i !== typing);
            setItems(rendered);
          });
          break;
        }
        case "voice": {
          key += 1;
          const item: RenderItem = { key, type: "voice", text: step.text };
          at(180, () => {
            rendered = [...rendered, item];
            setItems(rendered);
          });
          // Voice typing runs on its own; advance after it lands.
          at(voiceDuration(step.text), () => undefined);
          break;
        }
        case "msg": {
          key += 1;
          const item: RenderItem = {
            key,
            type: "msg",
            from: step.from,
            text: step.text,
            time: step.time,
          };
          at(230, () => {
            rendered = [...rendered, item];
            setItems(rendered);
          });
          break;
        }
        case "pause": {
          at(step.ms, () => undefined);
          break;
        }
      }
    }

    at(650, () => onDoneRef.current?.());

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [active, script]);

  // Keep the newest line in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: rm ? "auto" : "smooth" });
  }, [items.length]);

  return (
    <div
      ref={scrollRef}
      className={`atva-scroll flex min-h-[120px] flex-col gap-2.5 overflow-y-auto ${className}`}
      aria-live="polite"
    >
      {items.map((item) => {
        if (item.type === "typing") {
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex"
            >
              <TypingDots />
            </motion.div>
          );
        }
        if (item.type === "system") {
          return (
            <Bubble key={item.key} variant="system">
              {item.text}
            </Bubble>
          );
        }
        if (item.type === "voice") {
          return <VoiceBubble key={item.key} text={item.text} generation={0} />;
        }
        return (
          <Bubble key={item.key} variant={item.from} time={item.time}>
            {item.text}
          </Bubble>
        );
      })}
    </div>
  );
}
