import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { todayISTRange } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export interface DoctorSevikaPatient {
  patientId: string
  patientName: string
  mobileNo: string | null
  profileImg: string | null
  activeMeds: number
  medicineNames: string[]
  weekTotal: number
  weekTaken: number
  weekMissed: number
  weekSkipped: number
  scorePct: number
  missedLast48h: number
  lastTakenAt: string | null
  flag: 'none' | 'attention' | 'critical'
}

/**
 * GET /api/dashboard/doctor/sevika/adherence
 * Doctor-side adherence board (AI-NURSE-PLAN.md §2.5, P2): every patient who
 * has ever booked with THIS doctor, with their Sevika medicine adherence.
 *
 * Escalation rule (deterministic, from the plan):
 *   - 'critical'  : ≥3 Missed doses in the last 48h  (3-consecutive-miss alert)
 *   - 'attention' : week score < 50% with ≥4 decided doses
 *   - 'none'      : otherwise
 * Sorted worst-first (critical → attention → score asc).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // 1) Distinct patients of THIS doctor (via bookings — ownership rail)
    const bookings = await db.booking.findMany({
      where: { doctorId: doctor.id, userId: { not: null } },
      distinct: ['userId'],
      include: {
        user: { select: { id: true, name: true, mobileNo: true, profileImg: true } },
      },
    })
    const patientIds = bookings.map((b) => b.userId!).filter(Boolean)
    if (patientIds.length === 0) {
      return NextResponse.json({ patients: [] })
    }

    const { start, end } = todayISTRange()
    const weekStart = new Date(start.getTime() - 6 * 24 * 60 * 60 * 1000)
    const last48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // 2) Grouped Sevika stats for all those patients in parallel
    const [activeSchedules, weekDoses, missed48h, lastTaken] = await Promise.all([
      db.sevikaSchedule.findMany({
        where: { userId: { in: patientIds }, status: 'Active' },
        select: { userId: true, medicineName: true },
        take: 800,
      }),
      db.sevikaDose.groupBy({
        by: ['userId', 'status'],
        where: {
          userId: { in: patientIds },
          dueAt: { gte: weekStart, lte: end },
          status: { in: ['Taken', 'Missed', 'Skipped'] },
        },
        _count: { _all: true },
      }),
      db.sevikaDose.groupBy({
        by: ['userId'],
        where: { userId: { in: patientIds }, status: 'Missed', dueAt: { gte: last48h } },
        _count: { _all: true },
      }),
      db.sevikaDose.groupBy({
        by: ['userId'],
        where: { userId: { in: patientIds }, status: 'Taken' },
        _max: { actionAt: true },
      }),
    ])

    // 3) Assemble per-patient rows
    const medsByUser = new Map<string, string[]>()
    for (const s of activeSchedules) {
      const list = medsByUser.get(s.userId) || []
      list.push(s.medicineName)
      medsByUser.set(s.userId, list)
    }
    const weekByUser = new Map<string, { total: number; taken: number; missed: number; skipped: number }>()
    for (const g of weekDoses) {
      const row = weekByUser.get(g.userId) || { total: 0, taken: 0, missed: 0, skipped: 0 }
      const n = g._count._all
      row.total += n
      if (g.status === 'Taken') row.taken += n
      else if (g.status === 'Missed') row.missed += n
      else if (g.status === 'Skipped') row.skipped += n
      weekByUser.set(g.userId, row)
    }
    const missedByUser = new Map(missed48h.map((g) => [g.userId, g._count._all]))
    const lastTakenByUser = new Map(lastTaken.map((g) => [g.userId, g._max.actionAt]))

    // Patients with zero Sevika data are still listed (so the doctor sees who
    // has not onboarded to the nurse yet) but filtered to the tail.
    const rows: DoctorSevikaPatient[] = bookings.map((b) => {
      const uid = b.userId!
      const meds = medsByUser.get(uid) || []
      const week = weekByUser.get(uid) || { total: 0, taken: 0, missed: 0, skipped: 0 }
      const score = week.total === 0 ? 100 : Math.round((week.taken / week.total) * 100)
      const missed48 = missedByUser.get(uid) || 0

      let flag: DoctorSevikaPatient['flag'] = 'none'
      if (missed48 >= 3) flag = 'critical'
      else if (week.total >= 4 && score < 50) flag = 'attention'

      const last = lastTakenByUser.get(uid) || null
      return {
        patientId: uid,
        patientName: b.user?.name || b.patientName || 'Patient',
        mobileNo: b.user?.mobileNo || null,
        profileImg: b.user?.profileImg || null,
        activeMeds: meds.length,
        medicineNames: meds.slice(0, 6),
        weekTotal: week.total,
        weekTaken: week.taken,
        weekMissed: week.missed,
        weekSkipped: week.skipped,
        scorePct: score,
        missedLast48h: missed48,
        lastTakenAt: last ? last.toISOString() : null,
        flag,
      }
    })

    // Worst-first sort: flagged patients on top, then ascending score, then activity
    const flagRank = { critical: 0, attention: 1, none: 2 } as const
    rows.sort((a, b) => {
      if (flagRank[a.flag] !== flagRank[b.flag]) return flagRank[a.flag] - flagRank[b.flag]
      if (a.activeMeds === 0 && b.activeMeds > 0) return 1
      if (b.activeMeds === 0 && a.activeMeds > 0) return -1
      if (a.scorePct !== b.scorePct) return a.scorePct - b.scorePct
      return b.weekTotal - a.weekTotal
    })

    const summary = {
      totalPatients: rows.length,
      onSevika: rows.filter((r) => r.activeMeds > 0).length,
      critical: rows.filter((r) => r.flag === 'critical').length,
      attention: rows.filter((r) => r.flag === 'attention').length,
      avgScore: (() => {
        const active = rows.filter((r) => r.weekTotal > 0)
        if (active.length === 0) return 0
        return Math.round(active.reduce((a, r) => a + r.scorePct, 0) / active.length)
      })(),
    }

    return NextResponse.json({ patients: rows, summary })
  } catch (err) {
    console.error('[doctor/sevika/adherence] error:', err)
    return NextResponse.json({ error: 'Failed to load adherence board' }, { status: 500 })
  }
}
