/**
 * Dr. Copilot — PRE-VISIT BRIEF AGENT (Phase D1)
 *
 * Deterministic builder that assembles a scannable pre-visit brief for the
 * next patient in TODAY's queue (or a specific booking). All data comes from
 * the scoped repo (L2) — history is THIS doctor's visits only. The LLM only
 * narrates the brief from this data block (L3); every number is real.
 *
 * Same engine powers GET /api/copilot/brief/[bookingId] (plan §API-5) so the
 * future "Call Next → auto-brief" hook reuses the exact same shape.
 */

import * as repo from '../repo'
import type { CopilotCtx } from '../guard'
import type { RouterResult } from '../router'

export interface BriefData {
  agentName: 'brief'
  dataBlock: string
  citations: string[]
}

export async function buildPreVisitBrief(ctx: CopilotCtx, intent: RouterResult): Promise<BriefData> {
  // Which booking? A token from the message, else the next waiting patient.
  let booking: repo.WaitingBooking | null = null
  if (intent.token) booking = await repo.findBookingByToken(ctx, intent.token)
  if (!booking) booking = await repo.nextWaitingBooking(ctx)

  if (!booking) {
    return {
      agentName: 'brief',
      dataBlock: [
        'NO PATIENT WAITING.',
        'There are no pending/approved bookings left in today\'s queue for this doctor.',
        'Reply briefly: queue is done for today (or nobody waiting), and offer to brief on any specific token/appointment ID.',
      ].join('\n'),
      citations: [],
    }
  }

  // History + stats for this patient (scoped to THIS doctor)
  const history = booking.userId ? await repo.patientHistoryByUserId(ctx, booking.userId) : null
  const stats = booking.userId ? await repo.patientVisitStats(ctx, booking.userId) : null

  const lines: string[] = []
  lines.push(
    `TODAY'S PATIENT (pre-visit brief): ${booking.patientName} — token ${booking.tokenNumber || '—'}, appointment ${booking.appointmentNo}, status ${booking.status}${booking.isEmergency ? ' [EMERGENCY]' : ''}.`
  )
  lines.push(
    `Today's complaint: ${booking.disease || 'not stated'}${booking.description ? ` — "${booking.description.slice(0, 200)}"` : ''}. Age ${booking.age ?? '—'}, ${booking.gender || '—'}, ${booking.bookingType} booking.`
  )

  // ── Alerts (deterministic) ────────────────────────────────────────────
  const alerts: string[] = []
  if (booking.isEmergency) alerts.push('EMERGENCY case — prioritise.')
  if (stats && stats.noShow >= 2) alerts.push(`${stats.noShow} past no-shows — confirm attendance.`)

  const priorVisits = (history?.visits || []).filter((v) => v.bookingId !== booking.id)
  const lastVisit = priorVisits[0]

  if (!lastVisit) {
    alerts.push('FIRST VISIT with this doctor — no past records to lean on.')
  } else {
    const days = Math.floor((Date.now() - lastVisit.date.getTime()) / 86400000)
    if (days <= 1) alerts.push(`Seen yesterday (${lastVisit.date.toISOString().slice(0, 10)}) — same episode, check what was given.`)
    else if (days > 365) alerts.push(`Last seen ${days} days ago (~${Math.round(days / 30)} months) — old chart, re-confirm history.`)
    const nextVisit = lastVisit.prescription?.nextVisit
    if (nextVisit && nextVisit < new Date()) {
      const overdue = Math.floor((Date.now() - nextVisit.getTime()) / 86400000)
      alerts.push(`Follow-up was due ${nextVisit.toISOString().slice(0, 10)} — overdue by ${overdue} day(s).`)
    }
  }

  lines.push(alerts.length ? `ALERTS: ${alerts.join(' ')}` : 'ALERTS: none.')

  // ── Past context ──────────────────────────────────────────────────────
  if (lastVisit) {
    lines.push(`PATIENT RECORD (this doctor only): ${priorVisits.length} past visit(s), last on ${lastVisit.date.toISOString().slice(0, 10)} for ${lastVisit.prescription?.disease || lastVisit.disease || '—'}.`)
    const rx = lastVisit.prescription
    if (rx) {
      if (rx.medicines.length) {
        lines.push(
          `Last prescription: ${rx.medicines.map((m) => `${m.medicine}${m.dose ? ` (${m.dose})` : ''}`).join(', ')}.`
        )
      }
      const vitals: string[] = []
      if (rx.bp) vitals.push(`BP ${rx.bp}`)
      if (rx.weight) vitals.push(`wt ${rx.weight}kg`)
      if (rx.temperature) vitals.push(`temp ${rx.temperature}`)
      if (vitals.length) lines.push(`Last vitals: ${vitals.join(' · ')}.`)
      if (rx.description) lines.push(`Last notes: "${rx.description.slice(0, 200)}".`)
    }
    // vitals trend (older → newer)
    const trend = priorVisits
      .filter((v) => v.prescription?.bp || v.prescription?.weight)
      .slice(0, 4)
      .reverse()
    if (trend.length >= 2) {
      lines.push(
        `Vitals trend: ${trend.map((v) => `${v.date.toISOString().slice(0, 10)} BP ${v.prescription!.bp || '—'}/wt ${v.prescription!.weight || '—'}`).join(' → ')}.`
      )
    }
  }

  lines.push(
    'Narrate this as a crisp pre-visit brief the doctor can scan in 10 seconds: 1) who is next + today\'s complaint, 2) alerts in one line (⚠ prefix each), 3) relevant past context (last visit, meds given, vitals). IMPORTANT: narrate ONLY about the patient in this data block — never any other patient name, number or medicine from elsewhere. Keep it under ~120 words. No questions back.'
  )

  return { agentName: 'brief', dataBlock: lines.join('\n'), citations: [booking.appointmentNo] }
}
