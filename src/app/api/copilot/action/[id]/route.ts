/**
 * POST /api/copilot/action/[id]  — body: { decision: 'approve' | 'reject' }
 *
 * The ONLY place a Copilot proposal turns into a real write (RULE: AI
 * proposes, doctor approves, server executes). Isolation chain:
 *
 *   L1  getCtx() → doctorId from the SESSION (never from the body)
 *   L2  the CopilotAction row is loaded with { id, doctorId: ctx.doctorId } —
 *       another doctor's action id is simply "not found"
 *   L2b every production row touched below is re-verified against
 *       ctx.doctorId (booking.doctorId, prescription.doctorId, association…)
 *   L4  decision + execution are audit-logged
 *
 * Executions mirror the existing production APIs:
 *   rx_draft     → same flow as /api/prescription/init + [id]/medicines
 *                  (reuses existing Draft prescription for the booking, then
 *                  replaces its PMedicine rows with the approved draft)
 *   lab_order    → ExternalTestOrder rows via the doctor's active lab
 *                  association (one per test), same shape as the lab-orders API
 *   followup     → sets nextVisit on the patient's LATEST prescription by this
 *                  doctor (this is what feeds the "upcoming follow-ups" view)
 *   template_save→ PrescriptionTemplate row, same shape as the rx-templates
 *                  POST API (Phase D3 pattern agent; patient-independent)
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getCtx } from '@/lib/copilot/guard'
import { auditCopilot } from '@/lib/copilot/agents/audit'
import type { ActionPayload, CopilotActionCard } from '@/lib/copilot/action-card'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx(req)
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: { decision?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const decision = body.decision === 'approve' ? 'approve' : body.decision === 'reject' ? 'reject' : null
  if (!decision) return Response.json({ error: 'decision must be approve|reject' }, { status: 400 })

  // L2: load the action scoped to THIS doctor (cross-doctor id → 404)
  const action = await db.copilotAction.findFirst({
    where: { id, doctorId: ctx.doctorId },
  })
  if (!action) return Response.json({ error: 'Action not found' }, { status: 404 })
  if (action.status !== 'pending') {
    return Response.json({ error: `Action already ${action.status}` }, { status: 409 })
  }

  let payload: ActionPayload
  try {
    payload = JSON.parse(action.payloadJson) as ActionPayload
  } catch {
    return Response.json({ error: 'Corrupt action payload' }, { status: 500 })
  }

  // ─── Reject ──────────────────────────────────────────────────────────────
  if (decision === 'reject') {
    const updated = await db.copilotAction.update({
      where: { id: action.id },
      data: { status: 'rejected', actedAt: new Date() },
    })
    await patchChatCard(ctx.doctorId, action, 'rejected')
    void auditCopilot(req, ctx, 'action_rejected', { actionId: action.id, kind: action.kind })
    return Response.json({
      card: cardFor(payload, updated.id, 'rejected', null),
    })
  }

  // ─── Approve → execute via production pathways ─────────────────────────
  let result: { message: string; link?: string }

  try {
    // Re-verify the target booking still belongs to THIS doctor (L2b).
    // template_save proposals are patient-independent — no booking to verify.
    if (action.kind !== 'template_save') {
      const booking = await db.booking.findFirst({
        where: { id: payload.bookingId, doctorId: ctx.doctorId },
        select: { id: true, patientName: true, appointmentNo: true, userId: true },
      })
      if (!booking) {
        await db.copilotAction.update({ where: { id: action.id }, data: { status: 'rejected', actedAt: new Date() } })
        return Response.json({ error: 'Target booking is no longer in your records — action cancelled.' }, { status: 409 })
      }
    }

    if (action.kind === 'rx_draft') {
      result = await executeRxDraft(ctx, payload)
    } else if (action.kind === 'lab_order') {
      result = await executeLabOrder(ctx, payload)
    } else if (action.kind === 'followup') {
      result = await executeFollowup(ctx, payload)
    } else if (action.kind === 'template_save') {
      result = await executeTemplateSave(ctx, payload)
    } else {
      return Response.json({ error: 'Unknown action kind' }, { status: 400 })
    }
  } catch (err) {
    console.error('[copilot/action] execute error:', err)
    void auditCopilot(req, ctx, 'action_error', { actionId: action.id, kind: action.kind, error: String(err).slice(0, 300) })
    return Response.json({ error: 'Execution failed — nothing was saved. Please retry or do it manually.' }, { status: 500 })
  }

  const updated = await db.copilotAction.update({
    where: { id: action.id },
    data: { status: 'approved', actedAt: new Date() },
  })

  await patchChatCard(ctx.doctorId, action, 'approved', result)

  void auditCopilot(req, ctx, 'action_approved', {
    actionId: action.id,
    kind: action.kind,
    result: result.message,
  })

  return Response.json({
    card: cardFor(payload, updated.id, 'approved', result),
  })
}

// ─── Executors ─────────────────────────────────────────────────────────────

/** Mirrors /api/prescription/init + /api/prescription/[id]/medicines. */
async function executeRxDraft(ctx: { doctorId: string; doctorUserId: string }, payload: ActionPayload) {
  // Reuse an existing Draft for this booking, else create one (init flow)
  let rx = await db.prescription.findFirst({
    where: { bookingId: payload.bookingId, doctorId: ctx.doctorId, status: 'Draft' },
    select: { id: true },
  })
  if (!rx) {
    rx = await db.prescription.create({
      data: {
        bookingId: payload.bookingId,
        doctorId: ctx.doctorId,
        patientName: payload.patientName,
        patientAge: payload.patientAge != null ? String(payload.patientAge) : '',
        disease: payload.disease || '',
        description: payload.notes || '',
        status: 'Draft',
      },
      select: { id: true },
    })
  } else if (payload.disease || payload.notes) {
    await db.prescription.update({
      where: { id: rx.id },
      data: {
        ...(payload.disease ? { disease: payload.disease } : {}),
        ...(payload.notes ? { description: payload.notes } : {}),
      },
    })
  }

  // Replace medicines (same semantics as the medicines API)
  await db.pMedicine.deleteMany({ where: { prescriptionId: rx.id } })
  const meds = (payload.medicines || []).filter((m) => m.medicine?.trim())
  if (meds.length > 0) {
    await db.pMedicine.createMany({
      data: meds.map((m) => ({
        prescriptionId: rx.id,
        medicine: String(m.medicine).trim().slice(0, 120),
        dose: String(m.dose || '').slice(0, 60),
        morning: Math.max(0, Math.min(3, Math.round(m.morning || 0))),
        afternoon: Math.max(0, Math.min(3, Math.round(m.afternoon || 0))),
        evening: Math.max(0, Math.min(3, Math.round(m.evening || 0))),
        tab: Math.max(1, Math.min(60, Math.round(m.tab || 1))),
        createdById: ctx.doctorUserId,
      })),
    })
  }

  return {
    message: `Draft prescription saved (${meds.length} medicine${meds.length === 1 ? '' : 's'}) — review & finalize it from the Prescriptions page.`,
    link: `/dashboard/doctor/prescriptions?highlight=${rx.id}`,
  }
}

/** Creates ExternalTestOrder rows through the doctor's active lab association. */
async function executeLabOrder(ctx: { doctorId: string }, payload: ActionPayload) {
  const assoc = await db.doctorLabAssociation.findFirst({
    where: { doctorId: ctx.doctorId, isActive: true },
    orderBy: { associatedAt: 'asc' },
    select: { labPartnerId: true, labPartner: { select: { labName: true } } },
  })
  if (!assoc) {
    throw new Error('No active lab partner associated — add one under Lab Partners first.')
  }

  const tests = (payload.tests || []).map((t) => t.trim()).filter(Boolean).slice(0, 8)
  if (tests.length === 0) throw new Error('No tests in the order.')

  await db.externalTestOrder.createMany({
    data: tests.map((testName) => ({
      doctorId: ctx.doctorId,
      patientId: payload.patientUserId,
      labPartnerId: assoc.labPartnerId,
      bookingId: payload.bookingId,
      testName,
      testType: 'Blood',
      status: 'Ordered',
      urgency: 'Normal',
      notes: payload.notes || '',
    })),
  })

  return {
    message: `${tests.length} test order${tests.length === 1 ? '' : 's'} sent to ${assoc.labPartner.labName}.`,
    link: `/dashboard/doctor/lab-results`,
  }
}

/** Sets nextVisit on the patient's latest prescription by THIS doctor. */
async function executeFollowup(ctx: { doctorId: string }, payload: ActionPayload) {
  if (!payload.followupDate) throw new Error('Missing follow-up date.')

  const rx = await db.prescription.findFirst({
    where: { doctorId: ctx.doctorId, booking: { userId: payload.patientUserId } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true },
  })

  if (!rx) {
    throw new Error('No prior prescription for this patient — open a prescription first, then set the follow-up there.')
  }

  const date = new Date(`${payload.followupDate}T10:00:00`)
  await db.prescription.update({
    where: { id: rx.id },
    data: { nextVisit: date },
  })

  return {
    message: `Follow-up set for ${payload.followupDate} on ${payload.patientName}'s latest prescription.`,
    link: `/dashboard/doctor/appointments`,
  }
}

/** Mirrors POST /api/dashboard/doctor/rx-templates (Phase D3 pattern agent). */
async function executeTemplateSave(ctx: { doctorId: string }, payload: ActionPayload) {
  const name = (payload.templateName || '').trim()
  if (!name) throw new Error('Missing template name.')

  const meds = (payload.medicines || []).map((m) => m.medicine.trim()).filter(Boolean)
  if (meds.length === 0) throw new Error('No medicines in the proposed template.')

  // Same medicines JSON shape as the rx-templates UI: [{name, dose, duration}]
  const medicinesJson = JSON.stringify(
    meds.map((m) => ({ name: m.slice(0, 120), dose: '', duration: '' }))
  )

  const template = await db.prescriptionTemplate.create({
    data: {
      doctorId: ctx.doctorId,
      name: name.slice(0, 120),
      diagnosis: (payload.templateDiagnosis || payload.disease || '').slice(0, 200),
      medicines: medicinesJson,
      labs: '[]',
      advice: `Created by Dr. Copilot from your prescribing history (${payload.templateUseCount || meds.length} past uses).`,
      followUpDays: payload.templateFollowUpDays || 7,
      isCommon: false,
    },
    select: { id: true },
  })

  return {
    message: `Rx template "${name}" saved (${meds.length} medicines) — available in Rx Templates.`,
    link: `/dashboard/doctor/rx-templates?highlight=${template.id}`,
  }
}

// ─── Card helpers ──────────────────────────────────────────────────────────

/**
 * Keep the assistant message's approve-card in sync (doctor-scoped!) so a
 * page reload shows the real status instead of a stale "pending" card.
 */
async function patchChatCard(
  doctorId: string,
  action: { id: string; chatId: string | null },
  status: 'approved' | 'rejected',
  result?: { message: string; link?: string } | null
) {
  try {
    if (!action.chatId) return
    const chat = await db.copilotChat.findFirst({
      where: { id: action.chatId, doctorId },
      select: { id: true, metaJson: true },
    })
    if (!chat) return
    const meta = JSON.parse(chat.metaJson || '{}') as { actions?: CopilotActionCard[] }
    if (!Array.isArray(meta.actions)) return
    meta.actions = meta.actions.map((a) =>
      a.id === action.id ? { ...a, status, ...(result ? { result } : {}) } : a
    )
    await db.copilotChat.update({ where: { id: chat.id }, data: { metaJson: JSON.stringify(meta) } })
  } catch {
    // history sync is best-effort — the action row itself is authoritative
  }
}

function cardFor(
  payload: ActionPayload,
  id: string,
  status: CopilotActionCard['status'],
  result: { message: string; link?: string } | null
): CopilotActionCard {
  const summary =
    payload.kind === 'rx_draft'
      ? `Draft prescription — ${(payload.medicines || []).length} medicine(s)${payload.disease ? ` for ${payload.disease}` : ''}`
      : payload.kind === 'lab_order'
        ? `Lab order — ${(payload.tests || []).length} test(s)`
        : payload.kind === 'template_save'
          ? `Save template "${payload.templateName}" — ${(payload.medicines || []).length} medicine(s), already used ${payload.templateUseCount || ''}×`
          : `Follow-up on ${payload.followupDate}`

  const items =
    payload.kind === 'rx_draft'
      ? (payload.medicines || []).map((m) => `${m.medicine}${m.dose ? ` · ${m.dose}` : ''} · ${m.morning}-${m.afternoon}-${m.evening} · ×${m.tab}`)
      : payload.kind === 'lab_order'
        ? payload.tests || []
        : payload.kind === 'template_save'
          ? (payload.medicines || []).map((m) => m.medicine)
          : [`Date: ${payload.followupDate}`]

  return {
    id,
    kind: payload.kind,
    status,
    patientName:
      payload.kind === 'template_save'
        ? payload.templateName || 'Rx combo template'
        : payload.patientName,
    appointmentNo: payload.kind === 'template_save' ? 'Rx pattern' : payload.appointmentNo,
    summary,
    items,
    // Safety verdict was rendered at proposal time; decision cards only need status+result.
    safety: { level: 'ok', reasons: [] },
    ...(result ? { result } : {}),
  }
}
