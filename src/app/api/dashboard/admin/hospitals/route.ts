import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const cityFilter = searchParams.get('city') || 'all'

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { hospitalName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (cityFilter !== 'all') {
      where.city = cityFilter
    }

    const [hospitals, cities] = await Promise.all([
      db.hospital.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      db.hospital.findMany({
        distinct: ['city'],
        select: { city: true },
        where: { city: { not: '' } },
      }),
    ])

    return NextResponse.json({
      hospitals: hospitals.map((h) => ({
        id: h.id,
        hospitalName: h.hospitalName,
        address: h.address,
        city: h.city,
        state: h.state,
        contactNo: h.contactNo,
        createdAt: h.createdAt,
        userName: h.user.name,
        userEmail: h.user.email,
      })),
      cities: cities.map((c) => c.city).sort(),
      total: hospitals.length,
    })
  } catch (error) {
    console.error('Admin hospitals list error:', error)
    return NextResponse.json({ error: 'Failed to load hospitals' }, { status: 500 })
  }
}
