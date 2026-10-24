/**
 * GET /api/opd/search?q=… — doctor-scoped patient search for the cockpit.
 *
 * Matches: today's queue tokens (GEN-… prefix), the doctor's patients by
 * name or mobile (users who have ANY booking with this doctor). Returns
 * rows with an optional today-bookingId so the cockpit can jump straight
 * into the Rx wizard.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { todayISTStr, istDateRange } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const q = (new URL(req.url).searchParams.get('q') || '').trim()
    if (q.length < 2) return NextResponse.json({ patients: [] })

    const { start, end } = istDateRange(todayISTStr())

    // 1) Today's queue by token prefix (GEN-00… / CARD-… / EMR-…)
    const tokenHits = q.match(/^[A-Za-z]{2,4}-?\d{0,4}$/)
      ? await db.booking.findMany({
          where: {
            doctorId: doctor.id,
            bookingDate: { gte: start, lte: end },
            status: { in: ['Approve', 'Visited', 'Finish', 'NoShow'] },
            tokenNumber: { startsWith: q.toUpperCase() },
          },
          include: { user: { select: { id: true, mobileNo: true } } },
          take: 4,
        })
      : []

    // 2) The doctor's patients by mobile (exact-ish) or name (contains).
    // NOTE: no `mode: 'insensitive'` — SQLite (sandbox) doesn't support it;
    // case variants cover the real name shapes (capitalized / lower / upper).
    const isDigits = /^\d{4,}$/.test(q)
    const variants = Array.from(
      new Set([q, q.toLowerCase(), q.charAt(0).toUpperCase() + q.slice(1).toLowerCase(), q.toUpperCase()])
    )
    const users = await db.user.findMany({
      where: isDigits
        ? { mobileNo: { contains: q } }
        : { OR: variants.map((v) => ({ name: { contains: v } })) },
      select: { id: true, name: true, mobileNo: true },
      take: 8,
    })

    // Filter to users who have at least one booking with THIS doctor
    const userIds = users.map((u) => u.id)
    const bookingOwners = userIds.length
      ? await db.booking.findMany({
          where: { doctorId: doctor.id, userId: { in: userIds } },
          select: { userId: true },
          distinct: ['userId'],
        })
      : []
    const ownerSet = new Set(bookingOwners.map((b) => b.userId as string))

    // Today's booking for each matched user (for direct wizard jump)
    const todayBookings = await db.booking.findMany({
      where: {
        doctorId: doctor.id,
        bookingDate: { gte: start, lte: end },
        userId: { in: Array.from(ownerSet) },
        status: { in: ['Approve', 'Visited'] },
      },
      select: { userId: true, id: true, tokenNumber: true, status: true },
    })
    const todayByUser = new Map(todayBookings.map((b) => [b.userId as string, b]))

    const rows: {
      id: string
      name: string
      mobile: string | null
      reason: string
      bookingId: string | null
    }[] = []

    for (const t of tokenHits) {
      rows.push({
        id: t.userId || t.id,
        name: t.patientName || 'Walk-in',
        mobile: t.user?.mobileNo || null,
        reason: t.tokenNumber ? `${t.tokenNumber} today · ${t.status === 'Visited' ? 'in OPD' : t.status === 'Approve' ? 'waiting' : t.status.toLowerCase()}` : 'today',
        bookingId: t.id,
      })
    }

    for (const u of users) {
      if (!ownerSet.has(u.id)) continue
      if (rows.some((r) => r.id === u.id)) continue
      const tb = todayByUser.get(u.id)
      rows.push({
        id: u.id,
        name: u.name,
        mobile: u.mobileNo || null,
        reason: tb
          ? tb.tokenNumber
            ? `${tb.tokenNumber} today`
            : 'in today\u2019s queue'
          : 'past patient',
        bookingId: tb?.id || null,
      })
    }

    return NextResponse.json({ patients: rows.slice(0, 8) })
  } catch (error) {
    console.error('OPD search GET error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
