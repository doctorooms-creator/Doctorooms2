import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns'
import { getEffectivePlan, getHospitalIdForUser, buildUpgradeWall } from '@/lib/plans'
import { maskName } from '@/lib/referral'

/**
 * GET /api/dashboard/doctor/lost-revenue?period=week|month
 *
 * THE conversion weapon (PRICING-STRATEGY §3.3 wall #4, §6):
 * makes no-show pain numerical. Free sees the headline totals (teaser);
 * Pro gets the full breakdown (dates, slots, recoverable ₹ per no-show).
 *
 * Zero-charge no-shows (staff didn't record a fee) are estimated using the
 * doctor's average completed-consultation fee from the last 90 days —
 * the report stays honest by splitting recordedTotal vs estimatedTotal.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') === 'week' ? 'week' : 'month'

    const now = new Date()
    const rangeStart = period === 'week' ? startOfWeek(now, { weekStartsOn: 1 }) : startOfMonth(now)
    const rangeEnd = period === 'week' ? endOfWeek(now, { weekStartsOn: 1 }) : endOfMonth(now)

    // No-shows in the period + doctor's average completed fee (90d baseline)
    const [noShows, canceled, finished] = await Promise.all([
      db.booking.findMany({
        where: { doctorId: doctor.id, status: 'NoShow', bookingDate: { gte: rangeStart, lte: rangeEnd } },
        orderBy: { bookingDate: 'desc' },
        select: { id: true, bookingDate: true, timeSlot: true, patientName: true, appointmentCharge: true, disease: true },
      }),
      db.booking.count({
        where: { doctorId: doctor.id, status: 'Canceled', bookingDate: { gte: rangeStart, lte: rangeEnd } },
      }),
      db.booking.findMany({
        where: {
          doctorId: doctor.id,
          status: 'Finish',
          appointmentCharge: { gt: 0 },
          bookingDate: { gte: new Date(now.getTime() - 90 * 86400000) },
        },
        select: { appointmentCharge: true },
      }),
    ])

    const avgFee = finished.length > 0 ? Math.round(finished.reduce((s, b) => s + b.appointmentCharge, 0) / finished.length) : 0

    const withFee = noShows.filter((b) => (b.appointmentCharge || 0) > 0)
    const zeroFee = noShows.filter((b) => (b.appointmentCharge || 0) <= 0)
    const recordedTotal = withFee.reduce((s, b) => s + (b.appointmentCharge || 0), 0)
    const estimatedTotal = zeroFee.length * avgFee
    const lostTotal = recordedTotal + estimatedTotal
    const recoverableEstimate = Math.round(lostTotal * 0.8)

    // Plan gating: Free = headline totals only (teaser); Pro = full breakdown
    const hospitalId = await getHospitalIdForUser({ id: user.id, role: 'doctor' })
    const eff = hospitalId
      ? await getEffectivePlan(hospitalId)
      : { planKey: 'free' as const, plan: { features: { lostRevenueReport: false } }, status: 'free' as const }
    const gated = !eff.plan.features.lostRevenueReport

    // Day-by-day trend (both plans see the trend shape — the pain must be visible)
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd })
    const nsMap = new Map<string, { lost: number; count: number }>()
    for (const d of days) nsMap.set(format(d, 'yyyy-MM-dd'), { lost: 0, count: 0 })
    for (const b of noShows) {
      const key = format(new Date(b.bookingDate), 'yyyy-MM-dd')
      const row = nsMap.get(key)
      if (row) {
        row.lost += (b.appointmentCharge || 0) > 0 ? b.appointmentCharge : avgFee
        row.count += 1
      }
    }
    const byDay = days.map((d) => {
      const key = format(d, 'yyyy-MM-dd')
      const row = nsMap.get(key)!
      return { date: key, label: format(d, period === 'week' ? 'EEE' : 'd MMM'), lost: Math.round(row.lost), count: row.count }
    })

    const base = {
      period,
      noShowCount: noShows.length,
      canceledCount: canceled,
      avgFee,
      recordedTotal,
      estimatedTotal,
      estimatedCount: zeroFee.length,
      lostTotal,
      recoverableEstimate,
      byDay,
      plan: { key: eff.planKey, status: eff.status },
      gated,
    }

    if (gated) {
      // Teaser: totals visible, breakdown withheld behind the Pro wall (§3.3 #4)
      return NextResponse.json({
        ...base,
        breakdown: null,
        upgrade: buildUpgradeWall('lost_revenue', noShows.length, 0, eff.planKey),
      })
    }

    // Pro: full breakdown — every no-show with date, slot, masked patient, fee, disease
    const breakdown = noShows.map((b) => ({
      id: b.id,
      bookingDate: b.bookingDate,
      timeSlot: b.timeSlot || '—',
      patientName: maskName(b.patientName || 'Walk-in'),
      appointmentCharge: (b.appointmentCharge || 0) > 0 ? b.appointmentCharge : avgFee,
      estimated: (b.appointmentCharge || 0) <= 0,
      disease: b.disease || '—',
    }))

    return NextResponse.json({ ...base, breakdown, upgrade: null })
  } catch (error) {
    console.error('[lost-revenue] error:', error)
    return NextResponse.json({ error: 'Failed to load lost revenue report' }, { status: 500 })
  }
}
