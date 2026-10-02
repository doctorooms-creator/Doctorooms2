import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/operation-theaters
 *   Admin, hospital, receptionist: list all OTs for the requesting hospital.
 *   Admin (no hospitalId filter): lists all OTs across all hospitals.
 *   Query: ?hospitalId=... (admin only — hospital users auto-filtered to their own)
 *
 * POST /api/operation-theaters
 *   Admin or hospital: create a new OperationTheater.
 *   Body: { name, otType (Major|Minor), floorNo, status, hospitalId }
 */
export async function GET(req: NextRequest) {
  try {
    // Multi-role access: admin OR hospital OR receptionist
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const queryHospitalId = searchParams.get('hospitalId') || ''

    // Hospital users can only see their own hospital's OTs
    let hospitalId = queryHospitalId
    if (user.role === 'hospital' || user.role === 'receptionist') {
      // Resolve via User → Hospital (userId is unique on Hospital)
      const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!hospital) return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 })
      hospitalId = hospital.id
    } else if (!hospitalId) {
      // Admin without filter → list all (could paginate; for now return all)
    }

    const where: Record<string, unknown> = {}
    if (hospitalId) where.hospitalId = hospitalId

    const ots = await db.operationTheater.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { schedules: true } },
      },
    })

    return NextResponse.json({ operationTheaters: ots })
  } catch (error) {
    console.error('operation-theaters GET error:', error)
    return NextResponse.json({ error: 'Failed to load operation theaters' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, otType, floorNo, status, hospitalId: bodyHospitalId } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Resolve hospitalId
    let hospitalId = bodyHospitalId
    if (!hospitalId && (user.role === 'hospital' || user.role === 'admin')) {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      hospitalId = hospital?.id
    }
    if (!hospitalId) {
      return NextResponse.json({ error: 'hospitalId is required (or be logged in as a hospital user)' }, { status: 400 })
    }

    const ot = await db.operationTheater.create({
      data: {
        name: name.trim(),
        otType: ['Major', 'Minor'].includes(otType) ? otType : 'Major',
        floorNo: floorNo || '',
        status: ['Available', 'In-Use', 'Maintenance'].includes(status) ? status : 'Available',
        hospitalId,
      },
    })

    return NextResponse.json({ operationTheater: ot }, { status: 201 })
  } catch (error) {
    console.error('operation-theaters POST error:', error)
    return NextResponse.json({ error: 'Failed to create operation theater' }, { status: 500 })
  }
}
