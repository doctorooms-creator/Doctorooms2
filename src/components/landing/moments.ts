import type { OrbStateId } from "@/components/landing/orb/orb-states";
import type { ReplayStep } from "@/components/landing/chat/ChatReplay";

/**
 * Canned replay moments — assembled from real product session patterns.
 * The landing replays these; it never offers free-form AI chat, and no
 * moment ever shows Aturseva diagnosing or prescribing (doctor's job).
 */

export interface Moment {
  id: string;
  time: string;
  label: string;
  state: OrbStateId;
  script: ReplayStep[];
}

export const HERO_MOMENTS: Moment[] = [
  {
    id: "morning",
    time: "06:30",
    label: "Morning medicine",
    state: "speaking",
    script: [
      { kind: "system", text: "06:30 · Monday · replay from a real session" },
      {
        kind: "voice",
        text: "Amma, it's 6:30 — time for your BP tablet. The strip is on the side table.",
      },
      { kind: "msg", from: "patient", text: "Taken, beta. Making tea now.", time: "06:31" },
      {
        kind: "msg",
        from: "ai",
        text: "Good. Telma 40 marked as taken. Next on today's plan: your sugar reading at 8:00 — I'll remind you.",
        time: "06:31",
      },
      { kind: "system", text: "Care log updated · visible to Dr. Rao" },
    ],
  },
  {
    id: "queue",
    time: "09:10",
    label: "Your queue number, at home",
    state: "vigilant",
    script: [
      { kind: "system", text: "09:10 · you scanned the clinic QR from home" },
      {
        kind: "msg",
        from: "ai",
        text: "You're number 7. Three ahead of you — about 12 minutes. Stay home; I'll tell you when to leave.",
        time: "09:10",
      },
      { kind: "msg", from: "patient", text: "On my way.", time: "09:11" },
      { kind: "system", text: "Queue synced live · City Care Clinic OPD" },
    ],
  },
  {
    id: "vitals",
    time: "14:00",
    label: "Vitals check-in",
    state: "attentive",
    script: [
      { kind: "system", text: "14:00 · vitals check-in" },
      {
        kind: "msg",
        from: "ai",
        text: "Good afternoon, Amma. How is the sugar feeling after lunch?",
        time: "14:00",
      },
      { kind: "msg", from: "patient", text: "A little shaky, actually.", time: "14:01" },
      {
        kind: "msg",
        from: "ai",
        text: "Noted — logged. Dr. Rao asked for a 2 pm reading; the glucometer is in the kitchen drawer. I'll walk you through it.",
        time: "14:01",
      },
      { kind: "system", text: "Vitals relayed · flagged to Dr. Rao" },
    ],
  },
  {
    id: "night",
    time: "21:30",
    label: "Night watch",
    state: "night",
    script: [
      { kind: "system", text: "21:30 · night mode" },
      {
        kind: "voice",
        text: "Dinner was light tonight — that's Dr. Rao's advice working. Sleep well, Amma. I'll wake you at 6:30.",
      },
      { kind: "system", text: "Night mode on · monitoring continues" },
    ],
  },
];

/** Beat 2 of the Day section — the queue scan, replayed. Leads into #baari. */
export const QUEUE_SCRIPT: ReplayStep[] = [
  { kind: "system", text: "09:10 · Monday · you scanned the clinic QR from home" },
  { kind: "typing", ms: 900 },
  {
    kind: "msg",
    from: "ai",
    text: "You're number 12. Eleven ahead of you — about 25 minutes. Stay home; I'll tell you when to leave.",
    time: "09:10",
  },
  { kind: "typing", ms: 700 },
  { kind: "msg", from: "patient", text: "Achha. Tea is on the stove.", time: "09:11" },
  { kind: "system", text: "Queue synced live · City Care Clinic OPD" },
];

/** Beat 4 of the Day section — the afternoon vitals check, replayed. */
export const VITALS_SCRIPT: ReplayStep[] = [
  { kind: "system", text: "14:00 · Monday · vitals check-in" },
  { kind: "typing", ms: 800 },
  {
    kind: "msg",
    from: "ai",
    text: "Good afternoon, Amma. How is the sugar feeling after lunch?",
    time: "14:00",
  },
  { kind: "typing", ms: 1000 },
  { kind: "msg", from: "patient", text: "A little shaky, actually.", time: "14:01" },
  { kind: "typing", ms: 1300 },
  {
    kind: "msg",
    from: "ai",
    text: "Noted — logged. Dr. Rao asked for a 2 pm reading; the glucometer is in the kitchen drawer. I'll walk you through it.",
    time: "14:01",
  },
  { kind: "system", text: "Vitals relayed · flagged to Dr. Rao" },
];

/** Beat 1 of the Day section — the fully-live morning replay. */
export const MORNING_SCRIPT: ReplayStep[] = [
  { kind: "system", text: "06:30 · Monday" },
  {
    kind: "voice",
    text: "Amma, it's 6:30 — time for your BP tablet. The strip is on the side table.",
  },
  { kind: "typing", ms: 900 },
  { kind: "msg", from: "patient", text: "Taken, beta. Making tea now.", time: "06:31" },
  { kind: "typing", ms: 1200 },
  {
    kind: "msg",
    from: "ai",
    text: "Good. Telma 40 marked as taken. Next on today's plan: your sugar reading at 8:00 — I'll remind you.",
    time: "06:31",
  },
  { kind: "system", text: "Care log updated · visible to Dr. Rao" },
];
