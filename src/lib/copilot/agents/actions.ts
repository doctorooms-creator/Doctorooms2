/**
 * Dr. Copilot — ACTION AGENT (Phase B)
 *
 * Turns the doctor's request ("Rahul ke liye prescription likho…") into a
 * PENDING CopilotAction row + an approve-card for the panel.
 *
 * The AI NEVER writes to the database here — it only PROPOSES. The actual
 * write happens exclusively in /api/copilot/action/[id] when the doctor taps
 * Approve, and even then every row is re-verified against ctx.doctorId
 * before touching a production table.
 *
 * Isolation: the patient is resolved ONLY through scoped repo functions
 * (patientHistoryByMobile / ByName / findBookingByToken / ByAppointmentNo).
 * A patient this doctor never treated resolves to null → no card is created
 * and the assistant says the patient was not found in this doctor's records.
 */

import { db } from '@/lib/db'
import * as repo from '../repo'
import type { CopilotCtx } from '../guard'
import { chatComplete } from '../llm'
import { checkSafety } from './safety'
import type { ActionDraft, ActionPayload, CopilotActionCard, CopilotActionKind } from '../action-card'

// ─── 1. Extract the draft (LLM: structure only) ──────────────────────────

const EXTRACT_PROMPT = `You extract a clinical ACTION request from a doctor's message to their clinic AI assistant. Reply with ONLY a JSON object, no markdown fences.

Shape:
{"kind":"rx_draft|lab_order|followup","mobile":"","name":"","token":"","appointmentNo":"","disease":"","notes":"","medicines":[{"medicine":"","dose":"","morning":0,"afternoon":0,"evening":0,"tab":0}],"tests":[""],"followupDate":""}

Kind rules:
- rx_draft: doctor asks to write/draft/prepare a prescription ("prescription likho", "likho rx", "draft prescription for…"). Extract every medicine mentioned into medicines[] (name, dose string like "650mg", morning/afternoon/evening as 0/1/2 per day, tab = total quantity/days supply; guess tab = days when doctor says "5 days").
- lab_order: doctor asks to order lab tests ("test karao", "order CBC", "labs book karo"). Extract test names into tests[].
- followup: doctor asks to schedule a follow-up ("follow up next week", "review after 10 days"). Put the date in followupDate — absolute "YYYY-MM-DD" when given, otherwise "+Nd" (N days from today).

Patient reference: copy the mobile number (10 digits), patient name, queue token (LETTERS-digits like DERM-001), or appointment ID exactly as it appears in the message. Leave others empty.

Rules: never invent medicines, tests or dates that are not in the message; numbers must be plain integers; keep medicine names in English.`

export async function extractActionDraft(message: string): Promise<ActionDraft | null> {
  try {
    const raw = await chatComplete([
      { role: 'system', content: EXTRACT_PROMPT },
      { role: 'user', content: message.slice(0, 2000) },
    ])
    const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    if (!jsonStr) return null
    const parsed = JSON.parse(jsonStr) as Partial<ActionDraft> & { patientRef?: ActionDraft['patientRef'] }

    const kind = parsed.kind as CopilotActionKind | undefined
    if (kind !== 'rx_draft' && kind !== 'lab_order' && kind !== 'followup') return null

    // Flatten legacy shape: extraction may put refs at top level
    const p = (parsed.patientRef || {}) as ActionDraft['patientRef']
    const draft: ActionDraft = {
      kind,
      patientRef: {
        mobile: cleanDigits(parsed.mobile || p.mobile),
        name: cleanStr(parsed.name || p.name),
        token: cleanToken(parsed.token || p.token),
        appointmentNo: cleanStr(parsed.appointmentNo || p.appointmentNo),
      },
      disease: cleanStr(parsed.disease),
      notes: cleanStr(parsed.notes),
    }

    if (kind === 'rx_draft') {
      draft.medicines = (Array.isArray(parsed.medicines) ? parsed.medicines : [])
        .map((m) => ({
          medicine: cleanStr(m.medicine),
          dose: cleanStr(m.dose),
          morning: clampInt(m.morning, 0, 3),
          afternoon: clampInt(m.afternoon, 0, 3),
          evening: clampInt(m.evening, 0, 3),
          tab: clampInt(m.tab, 0, 60) || 1,
        }))
        .filter((m) => m.medicine.length > 1)
    }
    if (kind === 'lab_order') {
      draft.tests = (Array.isArray(parsed.tests) ? parsed.tests : []).map((t) => cleanStr(t)).filter((t) => t.length > 1).slice(0, 8)
    }
    if (kind === 'followup') {
      draft.followupDate = cleanStr(parsed.followupDate)
    }
    return draft
  } catch {
    return null
  }
}

// ─── 2. Resolve patient + booking (SCOPED — isolation boundary) ───────────

interface ResolvedPatient {
  payload: ActionPayload
  recentMedicines: string[]
  latestPrescriptionId: string | null
}

export async function resolveScoped(ctx: CopilotCtx, draft: ActionDraft): Promise<ResolvedPatient | null> {
  const ref = draft.patientRef

  let history: repo.PatientHistory | null = null

  // 1) by mobile (most precise)
  if (ref.mobile) history = await repo.patientHistoryByMobile(ctx, ref.mobile)

  // 2) by name (only matches patients THIS doctor has bookings with)
  if (!history && ref.name) {
    const results = await repo.patientHistoryByName(ctx, ref.name)
    history = results.length > 0 ? results[0] : null
  }

  // 3) by today's queue token → booking (doctor-scoped) → its patient user
  if (!history && ref.token) {
    const b = await repo.findBookingByToken(ctx, ref.token)
    if (b?.userId) history = await repo.patientHistoryByUserId(ctx, b.userId)
  }

  // 4) by appointment no (doctor-scoped) → its patient user
  if (!history && ref.appointmentNo) {
    const b = await repo.findBookingByAppointmentNo(ctx, ref.appointmentNo)
    if (b?.userId) history = await repo.patientHistoryByUserId(ctx, b.userId)
  }

  if (!history) return null // never treated by THIS doctor → not found (isolation)

  const latestVisit = history.visits[0]
  if (!latestVisit) return null

  const payload: ActionPayload = {
    kind: draft.kind,
    bookingId: latestVisit.bookingId,
    appointmentNo: latestVisit.appointmentNo,
    patientName: history.patient.name,
    patientMobile: history.patient.mobileNo,
    patientAge: latestVisit.age,
    patientGender: history.patient.gender,
    patientUserId: history.patient.id,
    disease: draft.disease || latestVisit.disease || '',
    notes: draft.notes || '',
  }

  const recentMedicines: string[] = []
  let latestPrescriptionId: string | null = null
  for (const v of history.visits) {
    if (v.prescription) {
      latestPrescriptionId = v.prescription.id
      for (const m of v.prescription.medicines) recentMedicines.push(m.medicine)
      break
    }
  }

  return { payload, recentMedicines, latestPrescriptionId }
}

// ─── 3. Build + persist the pending action ───────────────────────────────

export interface PreparedAction {
  card: CopilotActionCard
  /** Narration hints for the LLM answer. */
  dataBlock: string
}

export async function prepareAction(
  ctx: CopilotCtx,
  draft: ActionDraft,
  chatId: string | null,
  resolved: ResolvedPatient
): Promise<PreparedAction> {
  const payload = resolved.payload

  // Follow-up date normalisation (+Nd → absolute)
  if (draft.kind === 'followup') {
    const abs = resolveFollowupDate(draft.followupDate || '+7d', ctx.todayIST)
    payload.followupDate = abs
  }
  if (draft.kind === 'rx_draft') payload.medicines = draft.medicines || []
  if (draft.kind === 'lab_order') payload.tests = draft.tests || []

  // Safety check (deterministic)
  const safety = checkSafety(
    draft.kind === 'rx_draft'
      ? {
          kind: 'rx_draft',
          medicines: payload.medicines || [],
          patientAge: payload.patientAge,
          patientGender: payload.patientGender,
          recentMedicines: resolved.recentMedicines,
        }
      : draft.kind === 'lab_order'
        ? { kind: 'lab_order', tests: payload.tests || [] }
        : { kind: 'followup', dateISO: payload.followupDate || '', todayISO: ctx.todayIST }
  )

  // Persist PENDING action (doctor-scoped)
  const action = await db.copilotAction.create({
    data: {
      doctorId: ctx.doctorId,
      chatId,
      kind: draft.kind,
      payloadJson: JSON.stringify(payload),
      status: 'pending',
    },
  })

  const card: CopilotActionCard = {
    id: action.id,
    kind: draft.kind,
    status: 'pending',
    patientName: payload.patientName,
    appointmentNo: payload.appointmentNo,
    summary: cardSummary(draft.kind, payload),
    items: cardItems(draft.kind, payload),
    safety,
  }

  const dataBlock = [
    `PROPOSED ACTION (pending doctor approval — you cannot execute anything yourself):`,
    `- kind: ${draft.kind}`,
    `- patient: ${payload.patientName} (${payload.patientMobile}), latest visit ${payload.appointmentNo}`,
    `- summary: ${card.summary}`,
    draft.kind === 'rx_draft' ? `- medicines: ${(payload.medicines || []).map((m) => `${m.medicine} ${m.dose} ${m.morning}-${m.afternoon}-${m.evening} ×${m.tab}`).join('; ')}` : '',
    draft.kind === 'lab_order' ? `- tests: ${(payload.tests || []).join(', ')}` : '',
    draft.kind === 'followup' ? `- follow-up date: ${payload.followupDate}` : '',
    `- safety check: ${safety.level}${safety.reasons.length ? ` — ${safety.reasons.join(' | ')}` : ''}`,
    'Present the proposed action briefly and neutrally. If safety level is "blocked", clearly tell the doctor the card is disabled and why. If "warning", list the cautions. Remind that nothing is saved until they tap Approve. Do NOT ask them to approve if blocked.',
  ]
    .filter(Boolean)
    .join('\n')

  return { card, dataBlock }
}

function resolveFollowupDate(spec: string, todayISO: string): string {
  const rel = /^\+(\d+)\s*d?$/i.exec(spec.trim())
  if (rel) {
    const d = new Date(`${todayISO}T00:00:00`)
    d.setDate(d.getDate() + Math.min(parseInt(rel[1], 10), 180))
    return d.toISOString().slice(0, 10)
  }
  const abs = new Date(`${spec}T00:00:00`)
  if (!Number.isNaN(abs.getTime())) return spec.slice(0, 10)
  const fallback = new Date(`${todayISO}T00:00:00`)
  fallback.setDate(fallback.getDate() + 7)
  return fallback.toISOString().slice(0, 10)
}

function cardSummary(kind: CopilotActionKind, p: ActionPayload): string {
  if (kind === 'rx_draft') return `Draft prescription — ${(p.medicines || []).length} medicine(s)${p.disease ? ` for ${p.disease}` : ''}`
  if (kind === 'lab_order') return `Lab order — ${(p.tests || []).length} test(s)`
  return `Follow-up on ${p.followupDate}`
}

function cardItems(kind: CopilotActionKind, p: ActionPayload): string[] {
  if (kind === 'rx_draft') {
    return (p.medicines || []).map(
      (m) => `${m.medicine}${m.dose ? ` · ${m.dose}` : ''} · ${m.morning}-${m.afternoon}-${m.evening} · ×${m.tab}`
    )
  }
  if (kind === 'lab_order') return p.tests || []
  const items = [`Date: ${p.followupDate}`]
  if (p.notes) items.push(`Note: ${p.notes}`)
  return items
}

// ─── helpers ──────────────────────────────────────────────────────────────

function cleanStr(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, 120) : ''
}
function cleanDigits(v: unknown): string {
  if (typeof v !== 'string') return ''
  const d = v.replace(/\D/g, '')
  return d.length >= 4 && d.length <= 15 ? d : ''
}
function cleanToken(v: unknown): string {
  if (typeof v !== 'string') return ''
  const t = v.trim().toUpperCase()
  return /^[A-Z]{2,8}-\d{1,4}$/.test(t) ? t : ''
}
function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}
