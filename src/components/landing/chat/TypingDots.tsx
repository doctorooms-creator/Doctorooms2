"use client";

/** Three settling dots — the "she is composing" beat between replays. */
export function TypingDots({ className = "" }: { className?: string }) {
  return (
    <div
      className={`glass inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-3 ${className}`}
      role="status"
      aria-label="Aturseva is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ivory"
          style={{
            animation: `atva-dot-bounce 1.1s ${i * 0.16}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
