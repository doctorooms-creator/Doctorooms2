/**
 * DR Copilot — Actions module (Phase B).
 *
 * The approve-card lifecycle:
 *   proposed (AI)  →  CopilotAction status 'pending'
 *   doctor clicks  →  POST /api/copilot/action/[id] { decision: 'approved' | 'rejected' }
 *   on approve     →  re-verify ownership + re-run safety, then execute the write
 *                     through the same Prisma models the EMR uses, fully audited.
 *
 * RULE #1 stays intact: every query filters by ctx.doctorId; the LLM never
 * touches this module — only the doctor's HTTP call does.
 */

import { db } from '@/lib/db'
import { auditCopilot } from './guard'
import { runSafetyCheck } from './agents/safety'
import type { CopilotCtx } from './types'
import type { RxDraftPayload } from './agents/rx-draft'

export type ActionKind = 'rx_draft' | 'followup'

export interface ActionView {
  id: string
  kind: ActionKind
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  payload: Record<string, unknown>
  safety: { findings: { severity: string; rule: string; message: string }[]; blocked: boolean }
  result: Record<string, unknown> | null
  createdAt: string
}

export function toActionView(a: {
  id: string
  kind: string
  status: string
  payloadJson: string
  createdAt: Date
  actedAt: Date | null
}): (ActionView & { actedAt?: string }) | null {
  let payload: Record<string, unknown> = {}
  let result: Record<string, unknown> | null = null
  try {
    const raw = JSON.parse(a.payloadJson)
    payload = raw?.payload ?? {}
    result = raw?.result ?? null
    const safety = raw?.safety ?? { findings: [], blocked: false }
    return {
      id: a.id,
      kind: a.kind as ActionKind,
      status: a.status as ActionView['status'],
      payload,
      safety,
      result,
      createdAt: a.createdAt.toISOString(),
      actedAt: a.actedAt?.toISOString(),
    }
  } catch {
    return null
  }
}

/** Create a pending action row (called by the orchestrator after safety ran). */
export async function createAction(params: {
  ctx: CopilotCtx
  kind: ActionKind
  payload: Record<string, unknown>
  safety: { findings: unknown[]; blocked: boolean }
  chatId?: string
}): Promise<string> {
  const row = await db.copilotAction.create({
    data: {
      doctorId: params.ctx.doctorId,
      chatId: params.chatId ?? null,
      kind: params.kind,
      payloadJson: JSON.stringify({ payload: params.payload, safety: params.safety, result: null }),
      status: 'pending',
    },
  })
  await auditCopilot({
    ctx: params.ctx,
    action: 'action_proposed',
    description: `Copilot proposed a ${params.kind} for approval`,
    meta: { actionId: row.id, blocked: params.safety.blocked },
  })
  return row.id
}

export interface ResolveResult {
  ok: boolean
  status: number
  action?: ActionView
  message?: string
}

/** Approve or reject. The ONLY write path for copilot drafts. */
export async function resolveAction(ctx: CopilotCtx, actionId: string, decision: 'approved' | 'rejected'): Promise<ResolveResult> {
  // the wall: id + doctorId
  const action = await db.copilotAction.findFirst({
    where: { id: actionId, doctorId: ctx.doctorId },
  })
  if (!action) return { ok: false, status: 404, message: 'Action not found' }
  if (action.status !== 'pending') {
    const view = toActionView(action)
    return { ok: false, status: 409, message: `Already ${action.status}`, action: view ?? undefined }
  }

  let stored: { payload?: Record<string, unknown>; safety?: { findings: unknown[]; blocked: boolean } } = {}
  try {
    stored = JSON.parse(action.payloadJson)
  } catch {
    return { ok: false, status: 500, message: 'Corrupted action payload' }
  }

  if (decision === 'rejected') {
    const updated = await db.copilotAction.update({
      where: { id: action.id },
      data: { status: 'rejected', actedAt: new Date() },
    })
    await auditCopilot({
      ctx,
      action: 'action_rejected',
      description: `Doctor rejected copilot ${action.kind} proposal`,
      severity: 'info',
      meta: { actionId: action.id },
    })
    return { ok: true, status: 200, action: toActionView(updated)! }
  }

  // ── APPROVE ────────────────────────────────────────────────────────────
  let result: Record<string, unknown>
  try {
    if (action.kind === 'rx_draft') {
      result = await executeRxDraft(ctx, stored.payload as unknown as RxDraftPayload)
    } else if (action.kind === 'followup') {
      result = await executeFollowup(ctx, stored.payload as unknown as { prescriptionId: string; followUpDays: number })
    } else {
      return { ok: false, status: 400, message: `Unknown action kind ${action.kind}` }
    }
  } catch (e) {
    console.error('[copilot:action] execute failed:', e)
    return { ok: false, status: 500, message: 'Could not save — nothing was written. Please use the EMR directly.' }
  }

  const updated = await db.copilotAction.update({
    where: { id: action.id },
    data: {
      status: 'approved',
      actedAt: new Date(),
      payloadJson: JSON.stringify({ ...stored, result }),
    },
  })
  await auditCopilot({
    ctx,
    action: 'action_approved',
    description: `Doctor approved copilot ${action.kind} → ${result.summary ?? 'executed'}`,
    meta: { actionId: action.id, result },
  })
  return { ok: true, status: 200, action: toActionView(updated)! }
}

// ─── executors (same models the EMR writes) ─────────────────────────────────

async function executeRxDraft(ctx: CopilotCtx, p: RxDraftPayload): Promise<Record<string, unknown>> {
  if (!p?.bookingId || !Array.isArray(p.meds) || p.meds.length === 0) {
    throw new Error('invalid rx payload')
  }

  // ownership re-check of the booking (never trust stored payload alone)
  const booking = await db.booking.findFirst({
    where: { id: p.bookingId, doctorId: ctx.doctorId },
    select: { id: true, appointmentNo: true, patientName: true, user: { select: { name: true } } },
  })
  if (!booking) throw new Error('booking not found for this doctor')

  // safety re-run server-side at approve time (meds may have been tampered in DB)
  const report = runSafetyCheck({
    meds: p.meds.map((m) => ({ name: m.name, morning: m.morning, afternoon: m.afternoon, evening: m.evening, tab: m.tab })),
    patient: { name: p.patientName ?? '', age: p.patientAge ?? null, gender: p.patientGender ?? '' },
    doctorKnownMeds: [],
    patientLatestMeds: [],
  })
  if (report.blocked) {
    throw new Error(`safety block at approve time: ${report.findings.filter((f) => f.severity === 'block').map((f) => f.message).join('; ')}`)
  }

  const followUp = p.followUpDays && p.followUpDays > 0 ? new Date(Date.now() + p.followUpDays * 864e5) : null

  const rx = await db.prescription.create({
    data: {
      bookingId: booking.id,
      doctorId: ctx.doctorId,
      patientName: booking.patientName || booking.user?.name || p.patientName || '',
      patientAge: p.patientAge !== null && p.patientAge !== undefined ? String(p.patientAge) : '',
      disease: p.disease || '',
      weight: '',
      bp: '',
      temperature: '',
      description: `[Copilot draft — review before printing] ${p.advice || ''}`.slice(0, 500),
      status: 'Draft',
      nextVisit: followUp,
      medicines: {
        create: p.meds.map((m) => ({
          medicine: m.name.slice(0, 120),
          morning: Math.max(0, Math.min(2, Number(m.morning) || 0)),
          afternoon: Math.max(0, Math.min(2, Number(m.afternoon) || 0)),
          evening: Math.max(0, Math.min(2, Number(m.evening) || 0)),
          tab: Math.max(1, Math.min(4, Number(m.tab) || 1)),
          dose: (m.dose || '').slice(0, 60),
          createdById: ctx.doctorUserId,
        })),
      },
    },
    include: { medicines: true },
  })

  return {
    summary: `Draft prescription ${rx.id.slice(-6)} created (${rx.medicines.length} medicines)`,
    prescriptionId: rx.id,
    medicinesCount: rx.medicines.length,
  }
}

async function executeFollowup(ctx: CopilotCtx, p: { prescriptionId: string; followUpDays: number }): Promise<Record<string, unknown>> {
  if (!p?.prescriptionId) throw new Error('invalid followup payload')

  // ownership re-check
  const rx = await db.prescription.findFirst({
    where: { id: p.prescriptionId, doctorId: ctx.doctorId },
    select: { id: true, nextVisit: true, booking: { select: { appointmentNo: true } } },
  })
  if (!rx) throw new Error('prescription not found for this doctor')

  const days = Math.max(1, Math.min(365, Number(p.followUpDays) || 14))
  const nextVisit = new Date(Date.now() + days * 864e5)

  await db.prescription.update({ where: { id: rx.id }, data: { nextVisit } })

  return {
    summary: `Follow-up set for ${nextVisit.toISOString().slice(0, 10)} on prescription of ${rx.booking.appointmentNo}`,
    prescriptionId: rx.id,
    nextVisit: nextVisit.toISOString(),
  }
}

/** Fetch one action (scoped) for the panel's lazy status refresh. */
export async function getAction(ctx: CopilotCtx, actionId: string): Promise<ActionView | null> {
  const a = await db.copilotAction.findFirst({ where: { id: actionId, doctorId: ctx.doctorId } })
  return a ? toActionView(a) : null
}
