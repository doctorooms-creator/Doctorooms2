import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * PUBLIC: List departments for a hospital (for kiosk department selection).
 * No auth required — only shows department names + icons + floor info.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  try {
    const { hospitalId } = await params

    const departments = await db.department.findMany({
      where: { hospitalId, status: 'Active' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        nameHi: true,
        icon: true,
        floorNo: true,
        opdRoom: true,
        shortCode: true,
        _count: {
          select: {
            doctorLinks: {
              where: { status: 'Active', isAvailable: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        nameHi: d.nameHi,
        icon: d.icon,
        floorNo: d.floorNo,
        opdRoom: d.opdRoom,
        shortCode: d.shortCode,
        doctorCount: d._count.doctorLinks,
      })),
    })
  } catch (error) {
    console.error('Public departments error:', error)
    return NextResponse.json({ error: 'Failed to load departments' }, { status: 500 })
  }
}
