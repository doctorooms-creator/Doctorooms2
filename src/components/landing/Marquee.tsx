"use client";

const ITEMS = [
  "Doctor, clinic or video",
  "Medicine reminders",
  "Live queue number",
  "Daily check-ins",
  "Attender portal",
  "Lab reports on your phone",
  "Care log for your doctor",
  "Dose-missed alerts",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="hairline-t hairline-b relative overflow-hidden py-5" aria-label="What's included">
      <div
        className="flex w-max items-center gap-10 whitespace-nowrap"
        style={{ animation: "atva-marquee 36s linear infinite" }}
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10" aria-hidden={i >= ITEMS.length}>
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-silver/55">
              {item}
            </span>
            <span className="h-1 w-1 rounded-full bg-ivory/25" aria-hidden />
          </span>
        ))}
      </div>
      {/* Edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24"
        style={{ background: "linear-gradient(to right, #0a0b0d, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24"
        style={{ background: "linear-gradient(to left, #0a0b0d, transparent)" }}
      />
    </div>
  );
}
