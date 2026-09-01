/**
 * GET /api/copilot/brief/[bookingId]
 *
 * Deterministic pre-visit brief (Phase D1, plan §API-5). Returns structured
 * JSON (no LLM) so the future "Call Next → auto-brief" queue hook can render
 * a brief card without streaming. Same data as the chat brief agent.
 *
 * Isolation: L1 getCtx (session doctor), L2 booking + history + stats all
 * loaded through scoped repo functions with ctx.doctorId filters — another
 * doctor's bookingId simply resolves to 404.
 */

import { NextRequest } from 'next/server'
import { getCtx } from '@/lib/copilot/guard'
import * as repo from '@/lib/copilot/repo'
import { auditCopilot } from '@/lib/copilot/agents/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const ctx = await getCtx(req)
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await params

  // L2: doctor-scoped booking lookup (cross-doctor id → 404)
  const booking = await repo.findBookingById(ctx, bookingId)
  if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 })

  const history = booking.userId ? await repo.patientHistoryByUserId(ctx, booking.userId) : null
  const stats = booking.userId ? await repo.patientVisitStats(ctx, booking.userId) : null

  const priorVisits = (history?.visits || []).filter((v) => v.bookingId !== booking.id)
  const lastVisit = priorVisits[0] || null
  const lastRx = lastVisit?.prescription || null

  // "Past visits" = completed visits BEFORE this one (today's booking is not a past visit)
  const pastVisitCount = priorVisits.length

  // Deterministic alerts (same rules as agents/brief.ts)
  const alerts: string[] = []
  if (booking.isEmergency) alerts.push('EMERGENCY case — prioritise.')
  if (stats && stats.noShow >= 2) alerts.push(`${stats.noShow} past no-shows — confirm attendance.`)
  if (!lastVisit) {
    alerts.push('First visit with this doctor — no past records.')
  } else {
    const days = Math.floor((Date.now() - lastVisit.date.getTime()) / 86400000)
    if (days <= 1) alerts.push('Seen yesterday — same episode, check what was given.')
    else if (days > 365) alerts.push(`Last seen ${days} days ago — old chart, re-confirm history.`)
    const nv = lastRx?.nextVisit
    if (nv && nv < new Date()) {
      alerts.push(`Follow-up was due ${nv.toISOString().slice(0, 10)} — overdue.`)
    }
  }

  void auditCopilot(req, ctx, 'brief_fetched', { bookingId: booking.id })

  return Response.json({
    booking: {
      id: booking.id,
      appointmentNo: booking.appointmentNo,
      tokenNumber: booking.tokenNumber,
      patientName: booking.patientName,
      disease: booking.disease,
      description: booking.description,
      status: booking.status,
      isEmergency: booking.isEmergency,
      age: booking.age,
      gender: booking.gender,
      bookingType: booking.bookingType,
    },
    stats: stats
      ? {
          totalVisits: pastVisitCount,
          noShow: stats.noShow,
          lastVisit: lastVisit ? lastVisit.date.toISOString().slice(0, 10) : null,
        }
      : null,
    alerts,
    lastVisit: lastVisit
      ? {
          date: lastVisit.date.toISOString().slice(0, 10),
          appointmentNo: lastVisit.appointmentNo,
          diagnosis: lastRx?.disease || lastVisit.disease || null,
          medicines: lastRx ? lastRx.medicines.map((m) => `${m.medicine}${m.dose ? ` (${m.dose})` : ''}`) : [],
          bp: lastRx?.bp || null,
          weight: lastRx?.weight || null,
          temperature: lastRx?.temperature || null,
          notes: lastRx?.description || null,
          nextVisitDue: lastRx?.nextVisit?.toISOString().slice(0, 10) || null,
        }
      : null,
    vitalsTrend: priorVisits
      .filter((v) => v.prescription?.bp || v.prescription?.weight)
      .slice(0, 4)
      .reverse()
      .map((v) => ({
        date: v.date.toISOString().slice(0, 10),
        bp: v.prescription?.bp || null,
        weight: v.prescription?.weight || null,
      })),
  })
}
