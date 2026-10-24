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
 *
 * Phase D (OPD Cockpit 04 §2.5): + patient allergies (settingsJson v1),
 * + pulse/SpO₂ in the vitals trend (from Rx PLabel rows), + recent lab
 * reports with values/abnormal flags/previous-value deltas, + repeat-visit
 * pattern flag for the "Repeat Last Rx" suggestion chip.
 */

import { NextRequest } from 'next/server'
import { getCtx } from '@/lib/copilot/guard'
import * as repo from '@/lib/copilot/repo'
import { auditCopilot } from '@/lib/copilot/agents/audit'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Parse the v1 free-text allergy from User.settingsJson (D7). */
function parseAllergies(settingsJson: string | null | undefined): string | null {
  if (!settingsJson) return null
  try {
    const parsed = JSON.parse(settingsJson) as { allergies?: unknown }
    return typeof parsed.allergies === 'string' && parsed.allergies.trim() ? parsed.allergies.trim() : null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const ctx = await getCtx(req)
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await params

  // L2: doctor-scoped booking lookup (cross-doctor id → 404)
  const booking = await repo.findBookingById(ctx, bookingId)
  if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 })

  const history = booking.userId ? await repo.patientHistoryByUserId(ctx, booking.userId) : null
  const stats = booking.userId ? await repo.patientVisitStats(ctx, booking.userId) : null

  // "Past visits" = real visits only: Finished/NoShow'd/seen bookings BEFORE
  // this one. A FUTURE booking (follow-up already scheduled — common for
  // chronic patients) is not history, and neither is an unapproved Pending.
  // Today's booking is also not a past visit of itself.
  const priorVisits = (history?.visits || []).filter(
    (v) =>
      v.bookingId !== booking.id &&
      ['Finish', 'NoShow', 'Visited'].includes(v.status) &&
      v.date.getTime() <= Date.now()
  )
  const lastVisit = priorVisits[0] || null
  const lastRx = lastVisit?.prescription || null

  const pastVisitCount = priorVisits.length

  // ── Phase D: patient allergies (settingsJson v1 — merge-safe key) ──
  let allergies: string | null = null
  if (booking.userId) {
    const patientUser = await db.user.findUnique({
      where: { id: booking.userId },
      select: { settingsJson: true },
    })
    allergies = parseAllergies(patientUser?.settingsJson)
  }

  // ── Phase D: pulse/SpO₂ from the Rx label rows of past visits ──
  const rxIds = priorVisits.map((v) => v.prescription?.id).filter(Boolean) as string[]
  const labelRows = rxIds.length
    ? await db.pLabel.findMany({
        where: { prescriptionId: { in: rxIds } },
        select: { prescriptionId: true, label: true, labelEn: true, value: true },
      })
    : []
  const pulseOf = (rxId: string) =>
    labelRows.find((l) => l.prescriptionId === rxId && /pulse/i.test(l.labelEn || l.label))?.value || null
  const spo2Of = (rxId: string) =>
    labelRows.find((l) => l.prescriptionId === rxId && /spo2|sp[o₂o]?2/i.test(l.labelEn || l.label))?.value || null

  // ── Phase D: recent lab reports (this doctor, this patient) with deltas ──
  // Deduped to the LATEST report per test — the delta line already carries
  // the previous value, so repeating the same test row adds noise, not truth.
  const reports: {
    id: string
    testName: string
    date: string
    value: string | null
    unit: string | null
    flag: 'normal' | 'abnormal' | null
    previousValue: string | null
    previousDate: string | null
  }[] = []
  if (booking.userId) {
    const labReports = await db.labReport.findMany({
      where: {
        patientId: booking.userId,
        doctorId: ctx.doctorId,
        status: { in: ['ResultEntered', 'Verified'] },
      },
      include: {
        testMaster: { select: { name: true } },
        parameterValues: {
          include: { testParameter: { select: { paramName: true, unit: true } } },
        },
      },
      orderBy: { resultEnteredAt: 'desc' },
      take: 6,
    })
    for (const r of labReports) {
      const testName = r.testMaster?.name || 'Lab test'
      if (reports.some((x) => x.testName === testName)) continue
      const filled = r.parameterValues.filter((p) => p.value && p.value.trim())
      if (filled.length === 0) continue
      const headline = filled.find((p) => p.isAbnormal) || filled[0]
      const anyAbnormal = filled.some((p) => p.isAbnormal)

      // Delta: the previous report of the same test for this patient.
      let previousValue: string | null = null
      let previousDate: string | null = null
      try {
        const prev = await db.labReport.findFirst({
          where: {
            patientId: booking.userId,
            testMasterId: r.testMasterId,
            resultEnteredAt: { lt: r.resultEnteredAt || r.createdAt },
            parameterValues: { some: { value: { not: '' } } },
          },
          include: { parameterValues: true },
          orderBy: { resultEnteredAt: 'desc' },
        })
        const prevParam = prev?.parameterValues.find(
          (p) => p.testParameterId === headline.testParameterId && p.value && p.value.trim()
        )
        if (prev && prevParam) {
          previousValue = prevParam.value
          previousDate = (prev.resultEnteredAt || prev.createdAt).toISOString().slice(0, 10)
        }
      } catch {
        // A delta miss never hides the report itself.
      }

      reports.push({
        id: r.id,
        testName: r.testMaster?.name || 'Lab test',
        date: (r.resultEnteredAt || r.createdAt).toISOString().slice(0, 10),
        value: headline.value,
        unit: headline.testParameter?.unit || null,
        flag: anyAbnormal ? 'abnormal' : 'normal',
        previousValue,
        previousDate,
      })
    }
  }

  // ── Phase D: repeat-visit pattern (drives the Repeat-Rx suggestion) ──
  let repeatRx: { eligible: boolean; reason: string | null } = { eligible: false, reason: null }
  if (lastVisit && lastRx && lastRx.medicines.length > 0) {
    const days = Math.floor((Date.now() - lastVisit.date.getTime()) / 86400000)
    if (days <= 30) {
      repeatRx = {
        eligible: true,
        reason:
          days <= 1
            ? 'Seen yesterday — same episode'
            : `Last treated ${days} days ago — follow-up pattern`,
      }
    } else if (pastVisitCount >= 3) {
      repeatRx = { eligible: true, reason: `${pastVisitCount} visits — chronic pattern` }
    }
  }

  // Deterministic alerts (same rules as agents/brief.ts)
  const alerts: string[] = []
  if (booking.isEmergency) alerts.push('EMERGENCY case — prioritise.')
  if (allergies) alerts.push(`Allergies: ${allergies} — verify before prescribing.`)
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
    allergies,
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
          pulse: lastVisit.prescription ? pulseOf(lastVisit.prescription.id) : null,
          spo2: lastVisit.prescription ? spo2Of(lastVisit.prescription.id) : null,
          notes: lastRx?.description || null,
          nextVisitDue: lastRx?.nextVisit?.toISOString().slice(0, 10) || null,
        }
      : null,
    vitalsTrend: priorVisits
      .filter((v) => v.prescription?.bp || v.prescription?.weight || v.prescription?.id)
      .slice(0, 4)
      .reverse()
      .map((v) => ({
        date: v.date.toISOString().slice(0, 10),
        bp: v.prescription?.bp || null,
        weight: v.prescription?.weight || null,
        pulse: v.prescription ? pulseOf(v.prescription.id) : null,
        spo2: v.prescription ? spo2Of(v.prescription.id) : null,
      })),
    reports,
    repeatRx,
  })
}
