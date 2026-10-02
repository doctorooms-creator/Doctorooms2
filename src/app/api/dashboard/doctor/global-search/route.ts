import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

/**
 * Global search for the doctor command palette (⌘K).
 * Searches the doctor's OWN patients by name / token number / mobile,
 * returning the latest booking context so the doctor can jump straight
 * to the patient, their prescription, or resume the Rx wizard.
 *
 * GET /api/dashboard/doctor/global-search?q=<query>
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()

    if (q.length < 1) {
      return NextResponse.json({ results: [] })
    }

    // Case-insensitive contains for SQLite
    const contains = { contains: q }

    // Latest booking per matching patient (name OR token OR mobile match).
    // tokenNumber is stored like "PEDI-004" — allow searching with or without
    // the clinic prefix by also matching the numeric tail when q is numeric.
    const isNumericTail = /^\d+$/.test(q)
    const bookings = await db.booking.findMany({
      where: {
        doctorId: doctor.id,
        userId: { not: null },
        OR: [
          { patientName: contains },
          { tokenNumber: contains },
          { user: { mobileNo: contains } },
          { user: { name: contains } },
          ...(isNumericTail
            ? [{ tokenNumber: { contains: `-${q}` } }, { tokenNumber: { contains: `#${q}` } }]
            : []),
        ],
      },
      orderBy: { bookingDate: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, profileImg: true, gender: true, mobileNo: true },
        },
      },
      take: 40, // over-fetch, then dedupe by patient below
    })

    // Dedupe by patient, keep their LATEST booking (bookings are ordered desc)
    const byPatient = new Map<
      string,
      {
        userId: string
        name: string
        accountName: string
        img: string
        gender: string
        mobile: string
        tokenNumber: string
        bookingId: string
        status: string
        bookingDate: Date
        complaint: string
        totalVisits: number
      }
    >()
    for (const b of bookings) {
      if (!b.userId || byPatient.has(b.userId)) continue
      byPatient.set(b.userId, {
        userId: b.userId,
        // The BOOKING's patientName is the actual patient being treated
        // (for pediatric visits the account holder is the parent — e.g.
        // parent "Harpreet Singh" books for child "Kabir Singh").
        name: b.patientName || b.user?.name || 'Unknown',
        accountName: b.user?.name || '',
        img: b.user?.profileImg || '',
        gender: b.user?.gender || b.gender || '',
        mobile: b.user?.mobileNo || '',
        tokenNumber: b.tokenNumber || '',
        bookingId: b.id,
        status: b.status,
        bookingDate: b.bookingDate,
        complaint: b.disease || '',
        totalVisits: 0,
      })
    }

    // Visit counts for the matched patients (single groupBy)
    const patientIds = [...byPatient.keys()]
    if (patientIds.length > 0) {
      const counts = await db.booking.groupBy({
        by: ['userId'],
        where: { doctorId: doctor.id, userId: { in: patientIds } },
        _count: { userId: true },
      })
      for (const c of counts) {
        if (c.userId) {
          const p = byPatient.get(c.userId)
          if (p) p.totalVisits = c._count.userId
        }
      }
    }

    const results = [...byPatient.values()].slice(0, 8)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Doctor global search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
