import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// ============ GET: Available beds ============
export async function GET(req: NextRequest) {
  try {
    // Allow receptionist (via Receptionist profile) AND hospital role (via
    // Hospital profile) — the shared bed-transfer page is used by both.
    const user = await requireRole(req, 'receptionist')
    let hospitalId: string | null = null
    if (user) {
      const receptionist = await db.receptionist.findFirst({
        where: { userId: user.id },
        select: { hospitalId: true },
      })
      if (receptionist) hospitalId = receptionist.hospitalId
    } else {
      const hospitalUser = await requireRole(req, 'hospital')
      if (hospitalUser) {
        const hospital = await db.hospital.findUnique({
          where: { userId: hospitalUser.id },
          select: { id: true },
        })
        if (hospital) hospitalId = hospital.id
      }
    }

    if (!hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const wardId = searchParams.get('wardId') || ''

    // Build where clause for beds
    const bedWhere: Record<string, unknown> = {
      ward: { hospitalId },
      status: 'Available',
    }

    if (wardId) {
      bedWhere.wardId = wardId
    }

    // Fetch available beds with ward info
    const beds = await db.bed.findMany({
      where: bedWhere,
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            wardType: true,
            floorNo: true,
          },
        },
      },
      orderBy: [{ ward: { name: 'asc' } }, { bedNumber: 'asc' }],
    })

    // Group beds by ward
    const wardGroups: Record<string, { ward: typeof beds[0]['ward']; beds: typeof beds }> = {}
    for (const bed of beds) {
      const wardIdKey = bed.wardId
      if (!wardGroups[wardIdKey]) {
        wardGroups[wardIdKey] = { ward: bed.ward, beds: [] }
      }
      wardGroups[wardIdKey].beds.push(bed)
    }

    const formattedBeds = beds.map((b) => ({
      id: b.id,
      bedNumber: b.bedNumber,
      bedType: b.bedType,
      dailyRate: b.dailyRate,
      wardId: b.ward.id,
      wardName: b.ward.name,
      wardType: b.ward.wardType,
      floorNo: b.ward.floorNo,
    }))

    // Full bed map (ALL statuses) so the bed-transfer page can render the
    // complete ward·bed grid with colored chips (Available/Occupied/Maintenance).
    const allBeds = await db.bed.findMany({
      where: wardId ? { wardId } : { ward: { hospitalId } },
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            wardType: true,
            floorNo: true,
          },
        },
      },
      orderBy: [{ ward: { name: 'asc' } }, { bedNumber: 'asc' }],
    })

    return NextResponse.json({
      beds: formattedBeds,
      allBeds: allBeds.map((b) => ({
        id: b.id,
        bedNumber: b.bedNumber,
        bedType: b.bedType,
        status: b.status,
        dailyRate: b.dailyRate,
        wardId: b.ward.id,
        wardName: b.ward.name,
        wardType: b.ward.wardType,
        floorNo: b.ward.floorNo,
      })),
      wardGroups: Object.entries(wardGroups).map(([id, group]) => ({
        wardId: id,
        wardName: group.ward.name,
        wardType: group.ward.wardType,
        floorNo: group.ward.floorNo,
        availableCount: group.beds.length,
        beds: group.beds.map((b) => ({
          id: b.id,
          bedNumber: b.bedNumber,
          bedType: b.bedType,
          dailyRate: b.dailyRate,
        })),
      })),
    })
  } catch (error) {
    console.error('Available beds error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
