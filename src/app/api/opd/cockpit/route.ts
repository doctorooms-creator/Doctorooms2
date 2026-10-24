/**
 * GET /api/opd/cockpit — the Doctor "Dashboard 2" aggregate.
 *
 * ONE poll → ONE truth for the whole cockpit screen (04 §2.1).
 * Doctor-scoped via session (requireRole doctor — same guard family as the
 * other doctor APIs). Composes EXISTING query logic: queue (FIFO + emergency
 * tier via slotAwareSort), sent-for-tests, LabReport inbox, pending-approval
 * count, video-upcoming, drafts. No business logic is duplicated — only
 * reads. Every stat is COMPUTED here; the screen never invents a number.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { todayISTStr, istDateRange } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'
import { readAutoAdvanceCookie } from '@/lib/queue-lifecycle'

export const dynamic = 'force-dynamic'

// OPD close default (IST) — used only when the doctor's OPD timings can't
// be parsed; display-honesty fallback, never silently hidden.
const DEFAULT_CLOSE = '14:00'

function parseCloseFromTimings(timings?: string | null): string {
  if (!timings) return DEFAULT_CLOSE
  // Look for the last time-like token in "9:00 AM - 2:00 PM" style strings.
  const matches = timings.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])?/g)
  if (!matches || matches.length === 0) return DEFAULT_CLOSE
  const last = matches[matches.length - 1]
  const m = /^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/.exec(last.trim())
  if (!m) return DEFAULT_CLOSE
  let h = parseInt(m[1], 10)
  const min = m[2]
  const mer = m[3]?.toLowerCase()
  if (mer === 'pm' && h < 12) h += 12
  if (mer === 'am' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${min}`
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      include: { user: { select: { name: true, profileImg: true } } },
    })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const dateStr = todayISTStr()
    const { start, end } = istDateRange(dateStr)
    const now = new Date()

    // Scope: primary active hospital link (same pick as the doctor queue API).
    const doctorHospitalLink = await db.doctorHospital.findFirst({
      where: { doctorId: doctor.id, status: 'Active' },
      include: {
        department: { select: { name: true, shortCode: true, floorNo: true, opdRoom: true } },
        hospital: { select: { id: true, hospitalName: true } },
      },
    })

    // ── Queue (Approve / Visited / Finish / NoShow for the day) ──
    const bookings = await db.booking.findMany({
      where: {
        doctorId: doctor.id,
        bookingDate: { gte: start, lte: end },
        status: { in: ['Approve', 'Visited', 'Finish', 'NoShow'] },
      },
      include: { user: { select: { name: true, profileImg: true } } },
    })

    const sorted = slotAwareSort(bookings)

    const queue = sorted.map((b) => ({
      id: b.id,
      tokenNumber: b.tokenNumber || null,
      tokenOrder: b.tokenOrder || 0,
      patientName: b.patientName || b.user?.name || 'Walk-in',
      patientImg: b.user?.profileImg || null,
      age: b.age ?? null,
      gender: b.gender || null,
      disease: b.disease || '',
      timeSlot: b.timeSlot || '',
      status: b.status as 'Approve' | 'Visited' | 'Finish' | 'NoShow',
      bookingType: b.bookingType || 'By Self',
      bookingMode: b.bookingMode || 'InPerson',
      videoRoomId: b.videoRoomId || '',
      isEmergency: b.isEmergency || false,
      // updatedAt tracks the last status flip → calledAt approximation for
      // Visited rows; waitingSeconds uses createdAt for Approve rows.
      calledAt: b.status === 'Visited' || b.status === 'NoShow' ? b.updatedAt.toISOString() : null,
      waitingSeconds: Math.max(0, Math.floor((now.getTime() - b.createdAt.getTime()) / 1000)),
    }))

    // ── Stats — every figure computed, zero hardcoding ──
    const done = queue.filter((q) => q.status === 'Finish').length
    const waiting = queue.filter((q) => q.status === 'Approve').length
    const inConsultation = queue.filter((q) => q.status === 'Visited').length
    const noShows = queue.filter((q) => q.status === 'NoShow').length
    const backlogMinutes = waiting * 8 // ~8 min per consult, honest estimate

    const visited = sorted.filter((b) => b.status === 'Visited')
    const currentServing = visited.length
      ? {
          id: visited[visited.length - 1].id,
          tokenNumber: visited[visited.length - 1].tokenNumber || null,
          patientName:
            visited[visited.length - 1].patientName || visited[visited.length - 1].user?.name || 'Walk-in',
          calledAt: visited[visited.length - 1].updatedAt.toISOString(),
          bookingMode: visited[visited.length - 1].bookingMode || 'InPerson',
          videoRoomId: visited[visited.length - 1].videoRoomId || '',
        }
      : null

    const nextWaiting = sorted.find((b) => b.status === 'Approve')
    const nextUp = nextWaiting
      ? {
          id: nextWaiting.id,
          tokenNumber: nextWaiting.tokenNumber || null,
          patientName: nextWaiting.patientName || nextWaiting.user?.name || 'Walk-in',
          isEmergency: nextWaiting.isEmergency || false,
          bookingMode: nextWaiting.bookingMode || 'InPerson',
        }
      : null

    // ── Reports inbox (Phase D fills values/deltas; counts + names now) ──
    const labReports = await db.labReport.findMany({
      where: {
        doctorId: doctor.id,
        status: { in: ['Completed', 'Verified'] },
        // recent: last 7 days (old reports shouldn't haunt the cockpit)
        resultEnteredAt: { gte: new Date(now.getTime() - 7 * 86400000) },
      },
      include: { testMaster: { select: { name: true } } },
      orderBy: { resultEnteredAt: 'desc' },
      take: 10,
    })

    const reportsInbox = labReports.map((r) => ({
      labReportId: r.id,
      patientName: r.patientName,
      testName: r.testMaster?.name || 'Lab test',
      value: null,
      unit: null,
      flag: null,
      previousValue: null,
      previousDate: null,
      readyAt: r.resultEnteredAt?.toISOString() || r.updatedAt.toISOString(),
    }))

    // ── Pending approvals (S1/S13 — the queue-completeness truth) ──
    const pendingApprovals = await db.booking.count({
      where: {
        doctorId: doctor.id,
        bookingDate: { gte: start, lte: end },
        status: 'Pending',
      },
    })

    // ── Drafts open (interrupted consults — S9's yellow strip) ──
    const drafts = await db.prescription.findMany({
      where: {
        doctorId: doctor.id,
        status: 'Draft',
        booking: { bookingDate: { gte: start, lte: end } },
      },
      include: { booking: { select: { patientName: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })
    const draftsOpen = drafts.map((d) => ({
      bookingId: d.bookingId,
      patientName: d.booking?.patientName || d.patientName || 'Patient',
      updatedAt: d.updatedAt.toISOString(),
    }))

    // ── Video upcoming (S10 — T-10min chip) ──
    let videoUpcoming: {
      bookingId: string
      patientName: string
      timeSlot: string
      minutesUntil: number
    } | null = null
    const videoWaiting = sorted.filter(
      (b) => b.status === 'Approve' && b.bookingMode === 'VideoCall' && b.timeSlot
    )
    for (const v of videoWaiting) {
      const [h, m] = v.timeSlot.split(':').map((x) => parseInt(x, 10))
      if (!Number.isFinite(h)) continue
      // IST "now" for slot comparison
      const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      const slot = new Date(istNow)
      slot.setHours(h, Number.isFinite(m) ? m : 0, 0, 0)
      const minutesUntil = Math.round((slot.getTime() - istNow.getTime()) / 60000)
      if (minutesUntil >= 0 && minutesUntil <= 10) {
        videoUpcoming = {
          bookingId: v.id,
          patientName: v.patientName || v.user?.name || 'Patient',
          timeSlot: v.timeSlot,
          minutesUntil,
        }
        break
      }
    }

    // ── autoAdvance setting (Phase C — cookie v1, default ON) ──
    const autoAdvance = readAutoAdvanceCookie(req)

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        name: doctor.user.name,
        specialization: doctor.specialization || '',
        profileImg: doctor.user.profileImg || null,
        queuePaused: doctor.queuePaused || false,
      },
      scope: {
        hospitalName: doctorHospitalLink?.hospital.hospitalName || null,
        departmentName: doctorHospitalLink?.department.name || null,
        shortCode: doctorHospitalLink?.department.shortCode || null,
        floorNo: doctorHospitalLink?.department.floorNo || null,
        opdRoom: doctorHospitalLink?.department.opdRoom || null,
        opdTimings: doctorHospitalLink?.opdTimings || null,
        closesAt: parseCloseFromTimings(doctorHospitalLink?.opdTimings),
      },
      date: dateStr,
      queue,
      stats: { done, waiting, inConsultation, backlogMinutes, noShows },
      currentServing,
      nextUp,
      reportsInbox,
      pendingApprovals,
      draftsOpen,
      videoUpcoming,
      autoAdvance,
    })
  } catch (error) {
    console.error('OPD cockpit GET error:', error)
    return NextResponse.json({ error: 'Failed to load cockpit' }, { status: 500 })
  }
}
