import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'

/**
 * SMART PATIENT SEARCH — powers the One-Form Booking Home's smart field.
 *
 * GET /api/dashboard/receptionist/patient-search?q=<mobile digits | name>
 *
 *   • q all digits  → mobileNo contains search (mobile-lookup flow)
 *   • q with letters → name contains search (SQLite LIKE is ASCII
 *                      case-insensitive — good enough for Indian names)
 *
 * Each match carries visit intelligence scoped to THIS receptionist's desk
 * (hospital bookings in hospital mode, own-doctor bookings in clinic mode):
 *   totalVisits, lastVisit, and the age from the latest visit — so the
 * auto-filled patient card is genuinely "sab field bhar jayenge".
 *
 * Patients WITH past visits here sort first — the receptionist's regulars
 * surface at the top of the dropdown.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receptionist = await db.receptionist.findFirst({
      where: { userId: user.id },
      select: { doctorId: true, hospitalId: true },
    })
    if (!receptionist) {
      return NextResponse.json({ error: 'No desk linked to this receptionist' }, { status: 404 })
    }
    const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').trim()
    if (q.length < 2) return NextResponse.json({ matches: [] })

    const isDigits = /^[0-9]+$/.test(q)
    // Guard: a 1-digit query with letters is fine for names, digits need >=3
    if (isDigits && q.length < 3) return NextResponse.json({ matches: [] })

    // ── 1. Candidate users (role=patient, mobile or name contains q) ──
    const where = isDigits
      ? { role: 'patient', mobileNo: { contains: q } }
      : { role: 'patient', name: { contains: q } }

    const candidates = await db.user.findMany({
      where,
      select: { id: true, name: true, mobileNo: true, gender: true, profileImg: true },
      take: 24,
      orderBy: { updatedAt: 'desc' },
    })
    if (candidates.length === 0) return NextResponse.json({ matches: [] })

    // ── 2. Visit intelligence scoped to this desk (groupBy = one query) ──
    const ids = candidates.map((c) => c.id)
    const scopeWhere = isHospitalMode
      ? { userId: { in: ids }, hospitalId: receptionist.hospitalId! }
      : { userId: { in: ids }, doctorId: receptionist.doctorId! }

    const visitAgg = await db.booking.groupBy({
      by: ['userId'],
      where: scopeWhere,
      _count: { _all: true },
      _max: { bookingDate: true },
    })
    const visitMap = new Map(visitAgg.map((v) => [v.userId, { count: v._count._all, last: v._max.bookingDate }]))

    // Regulars of THIS desk first, then most recently active patients
    const ranked = candidates
      .map((c) => ({ ...c, visits: visitMap.get(c.id)?.count ?? 0 }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8)

    // ── 3. Latest booking's age per top candidate (fills the age field) ──
    const latest = await Promise.all(
      ranked.map((c) =>
        db.booking.findFirst({
          where: { userId: c.id, ...(isHospitalMode ? { hospitalId: receptionist.hospitalId! } : { doctorId: receptionist.doctorId! }) },
          orderBy: { bookingDate: 'desc' },
          select: { age: true, bookingDate: true },
        })
      )
    )

    const matches = ranked.map((c, i) => ({
      id: c.id,
      name: c.name,
      mobileNo: c.mobileNo ?? '',
      gender: c.gender ?? null,
      age: latest[i]?.age ?? null,
      lastVisit: latest[i]?.bookingDate?.toISOString() ?? null,
      totalVisits: c.visits,
      profileImg: c.profileImg ?? null,
    }))

    return NextResponse.json({ matches })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
