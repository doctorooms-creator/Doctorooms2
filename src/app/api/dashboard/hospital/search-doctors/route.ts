import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    if (search.length < 2) {
      return NextResponse.json({ doctors: [] })
    }

    // Search by doctor's user name - returns Doctor.id (not User.id).
    // Global platform scope is BY DESIGN: this powers the "Add Doctor" link
    // flow, which must find doctors already registered anywhere on Doctorooms.
    const selectShape = {
      id: true, // Doctor.id - this is what DoctorHospital.doctorId needs
      userId: true,
      specialization: true,
      city: true,
      registrationDetail: true,
      user: {
        select: {
          name: true,
          profileImg: true,
          email: true,
        },
      },
    }

    // Prefix-priority: names that START with the search term come first, then
    // any remaining contains-matches (incl. email), merged & deduped, capped
    // at 10 total. Skips the second query entirely when the first fills up.
    // The second startsWith clause handles the "Dr. " honorific stored in
    // most names (searching "rajesh" prefixes "Dr. Rajesh Kumar").
    const prefixMatches = await db.doctor.findMany({
      where: {
        user: {
          role: 'doctor',
          status: 'Active',
          OR: [
            { name: { startsWith: search, mode: 'insensitive' } },
            { name: { startsWith: `Dr. ${search}`, mode: 'insensitive' } },
          ],
        },
      },
      select: selectShape,
      orderBy: { user: { name: 'asc' } },
      take: 10,
    })

    const doctors = [...prefixMatches]
    if (doctors.length < 10) {
      const seen = new Set(doctors.map((d) => d.id))
      const containsMatches = await db.doctor.findMany({
        where: {
          user: {
            role: 'doctor',
            status: 'Active',
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        select: selectShape,
        orderBy: { user: { name: 'asc' } },
        take: 10,
      })
      for (const d of containsMatches) {
        if (doctors.length >= 10) break
        if (!seen.has(d.id)) {
          doctors.push(d)
          seen.add(d.id)
        }
      }
    }

    return NextResponse.json({
      doctors: doctors.map((d) => ({
        id: d.id, // Doctor.id
        userId: d.userId, // User.id
        name: d.user.name,
        profileImg: d.user.profileImg,
        email: d.user.email,
        specialization: d.specialization,
        city: d.city || '',
        registrationDetail: d.registrationDetail || '',
      })),
    })
  } catch (error) {
    console.error('Search doctors error:', error)
    return NextResponse.json({ doctors: [] }, { status: 500 })
  }
}
