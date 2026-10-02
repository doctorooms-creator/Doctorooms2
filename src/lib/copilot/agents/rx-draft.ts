/**
 * DR Copilot — Rx-draft agent (Phase B).
 *
 * Proposes a prescription DRAFT for the doctor's own patient, built from the
 * doctor's OWN prescribing history (their medicine patterns for similar
 * diseases + patient's past meds). Output is a pending CopilotAction — the AI
 * never writes; the doctor must approve (see actions.ts).
 *
 * Guardrails:
 *  - patient resolution ONLY via the scoped repo (the doctor's own bookings)
 *  - LLM returns strict JSON; shape-validated defensively
 *  - safety engine runs before the card is created; blocks prevent approval
 */

import { chatJSON } from '../llm'
import * as repo from '../repo'
import { runSafetyCheck, type SafetyReport } from './safety'
import type { CopilotCtx } from '../types'

export interface DraftMed {
  name: string
  morning: number
  afternoon: number
  evening: number
  tab: number
  dose: string
}

export interface RxDraftPayload {
  bookingId: string
  appointmentNo: string
  patientName: string
  patientAge: number | null
  patientGender: string
  disease: string
  meds: DraftMed[]
  advice: string
  followUpDays: number | null
}

export interface DraftOutcome {
  /** null + askBack → the draft agent needs more info from the doctor */
  askBack?: string
  payload?: RxDraftPayload
  safety?: SafetyReport
  error?: string
  /** context used, for the intro sentence */
  patientLabel?: string
}

interface ResolvedTarget {
  bookingId: string
  appointmentNo: string
  patientName: string
  patientAge: number | null
  patientGender: string
  disease: string
  userId: string | null
}
export type { ResolvedTarget }

/** Resolve the patient/visit to draft against — via the doctor's own data only. */
export async function resolveTarget(ctx: CopilotCtx, query: string | undefined): Promise<ResolvedTarget | { askBack: string }> {
  const q = (query || '').trim()

  // 1) explicit appointment number in the query
  const appt = q.match(/\b[A-Z]{2,4}-\d{2,8}\b/i)?.[0]
  if (appt) {
    const b = await repo.getBookingByAppointmentNo(ctx, appt)
    if (b) return toTarget(b)
  }

  // 2) patient by name/mobile substring
  if (q) {
    const patients = await repo.searchPatients(ctx, q, 5)
    if (patients.length === 1 && patients[0]!.latestBookingId) {
      const b = await repo.getBookingByAppointmentNo(ctx, patients[0]!.latestAppointmentNo)
      if (b) return toTarget(b)
    }
    if (patients.length > 1) {
      return {
        askBack: `I found ${patients.length} patients matching "${q}" (${patients.map((p) => p.name).join(', ')}). Which one? You can also give me their mobile or appointment number.`,
      }
    }
  }

  // 3) fallback: exactly one un-visited patient on today's list → the natural "next patient"
  const today = await repo.getTodaySchedule(ctx)
  const pending = today.filter((b) => b.status === 'Pending' || b.status === 'Approve')
  if (pending.length === 1) return toTarget(pending[0]!)

  return {
    askBack:
      'Which patient should I draft for? Give me a name, mobile number, or appointment number' +
      (pending.length > 1 ? ` — e.g. ${pending.slice(0, 3).map((b) => `**${b.appointmentNo}** (${b.patientName})`).join(', ')}` : '') +
      '.',
  }
}

function toTarget(b: repo.BookingShape): ResolvedTarget {
  return {
    bookingId: b.bookingId,
    appointmentNo: b.appointmentNo,
    patientName: b.patientName,
    patientAge: b.age,
    patientGender: b.gender,
    disease: b.disease,
    userId: b.userId,
  }
}

/** Build the proposal via LLM from the doctor's own history. */
export async function proposeDraft(
  ctx: CopilotCtx,
  target: ResolvedTarget,
  instruction: string
): Promise<{ payload: RxDraftPayload; safety: SafetyReport } | { error: string }> {
  // scoped context: THIS patient's history with THIS doctor + doctor's recent rx
  const history = target.userId ? await repo.getPatientHistory(ctx, target.userId) : null
  const lastRxMeds = history?.flatMap((v) => v.prescriptions.map((rx) => rx.medicines.map((m) => m.name)))?.flat() ?? []
  const recentRx = await repo.getRecentPrescriptions(ctx, 20)

  // doctor's most-used medicines (frequency-ranked, own history only)
  const freq = new Map<string, number>()
  for (const rx of recentRx) for (const m of rx.medicines) freq.set(m.name, (freq.get(m.name) ?? 0) + 1)
  const topMeds = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([n]) => n)

  const similar = recentRx
    .filter((rx) => rx.disease && target.disease && rx.disease.toLowerCase().slice(0, 12) === target.disease.toLowerCase().slice(0, 12))
    .slice(0, 3)

  const system = `You draft prescription PROPOSALS for Dr. ${ctx.doctorName} inside Doctorooms. A proposal is ONLY a suggestion the doctor must approve.

HARD RULES:
- Prefer medicines from "DOCTOR_TOP_MEDS" and "SIMILAR_PAST_RX" — this doctor's own patterns. You may still propose a standard medicine if the history has nothing suitable, but keep it conservative and common (Indian OPD generics).
- 1–5 medicines. Standard adult dosing. Use the exact name format the doctor uses.
- Dose pattern is morning/afternoon/evening as 0 or 1 (number of units), tab = units per dose.
- reply with ONLY a JSON object, no prose:
{"medicines":[{"name":"...","morning":1,"afternoon":0,"evening":1,"tab":1,"dose":"e.g. after food"}],
 "advice":"2-3 short sentences of general advice",
 "followUpDays":14}`

  const user = `PATIENT: ${target.patientName}, ${target.patientAge ?? '?'}y ${target.patientGender || ''}
VISIT DISEASE: ${target.disease || '(not recorded — infer from history)'}
DOCTOR_INSTRUCTION: ${instruction || '(none — follow your usual pattern for this disease)'}

DOCTOR_TOP_MEDS: ${topMeds.join('; ') || '(none yet)'}
SIMILAR_PAST_RX (same doctor): ${similar.map((s) => `${s.appointmentNo} ${s.patientName} [${s.disease}]: ${s.medicines.map((m) => `${m.name} ${m.morning}-${m.afternoon}-${m.evening}`).join(', ')}`).join(' | ') || '(none)'}
PATIENT_LAST_MEDS (by this doctor): ${lastRxMeds.slice(0, 10).join('; ') || '(first visit)'}`

  let parsed: { medicines?: unknown; advice?: unknown; followUpDays?: unknown }
  try {
    parsed = await chatJSON<{ medicines?: unknown; advice?: unknown; followUpDays?: unknown }>([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ])
  } catch (e) {
    return { error: 'My drafting engine returned something I could not read. Please try wording it differently.' }
  }

  // defensive shape validation
  if (!Array.isArray(parsed.medicines) || parsed.medicines.length === 0) {
    return { error: 'The draft came back without medicines — please describe what you want to treat.' }
  }
  const meds: DraftMed[] = []
  for (const raw of parsed.medicines.slice(0, 7)) {
    const m = raw as Record<string, unknown>
    const name = typeof m.name === 'string' ? m.name.trim().slice(0, 90) : ''
    if (!name) continue
    meds.push({
      name,
      morning: num01(m.morning),
      afternoon: num01(m.afternoon),
      evening: num01(m.evening),
      tab: clampInt(m.tab, 1, 4, 1),
      dose: typeof m.dose === 'string' ? m.dose.slice(0, 60) : '',
    })
  }
  if (meds.length === 0) return { error: 'The draft had no usable medicines — please try again.' }

  const payload: RxDraftPayload = {
    bookingId: target.bookingId,
    appointmentNo: target.appointmentNo,
    patientName: target.patientName,
    patientAge: target.patientAge,
    patientGender: target.patientGender,
    disease: target.disease,
    meds,
    advice: typeof parsed.advice === 'string' ? parsed.advice.slice(0, 500) : '',
    followUpDays: clampInt(parsed.followUpDays, 1, 180, 14),
  }

  const safety = runSafetyCheck({
    meds: payload.meds,
    patient: { name: payload.patientName, age: payload.patientAge, gender: payload.patientGender },
    doctorKnownMeds: topMeds,
    patientLatestMeds: lastRxMeds,
  })

  return { payload, safety }
}

function num01(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? (n > 1 ? 1 : n) : 0
}
function clampInt(v: unknown, min: number, max: number, dflt: number): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return dflt
  return Math.min(max, Math.max(min, Math.round(n)))
}
