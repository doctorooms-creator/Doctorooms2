import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/ot-board — Today's OT board: one card per operation theater with
 * that OT's surgeries for today. Roles: hospital / receptionist / admin.
 *
 * Response: { date: ISO, operationTheaters: [{ id, name, otType, floorNo,
 *   status, surgeries: [{ id, scheduleNo, patientName, patientAge,
 *   patientGender, admissionNo, surgeonName, surgeryName, surgeryType,
 *   scheduledStartTime, estimatedDuration, actualStartTime, actualEndTime,
 *   status, notes }] }] }
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Resolve hospitalId per role
    let hospitalId: string | null = null
    if (user.role === 'hospital') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      hospitalId = hospital?.id ?? null
    } else if (user.role === 'receptionist') {
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id }, select: { hospitalId: true } })
      hospitalId = receptionist?.hospitalId ?? null
    }
    // Admin: all hospitals (hospitalId stays null → no filter)

    if (user.role !== 'admin' && !hospitalId) {
      return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 })
    }

    // Today range (local server day)
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    // Fetch OTs + today's surgeries in parallel
    const [ots, schedules] = await Promise.all([
      db.operationTheater.findMany({
        where: hospitalId ? { hospitalId } : undefined,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, otType: true, floorNo: true, status: true },
      }),
      db.otSchedule.findMany({
        where: {
          ...(hospitalId ? { hospitalId } : {}),
          AND: [{ scheduledDate: { gte: start } }, { scheduledDate: { lt: end } }],
        },
        orderBy: [{ scheduledStartTime: 'asc' }, { createdAt: 'asc' }],
        include: {
          admission: { select: { admissionNo: true } },
          surgeon: { include: { user: { select: { name: true } } } },
        },
      }),
    ])

    // Group surgeries per OT
    const byOt = new Map<string, ReturnType<typeof mapSurgery>[]>()
    for (const s of schedules) {
      const surgery = mapSurgery(s)
      const list = byOt.get(s.otId) ?? []
      list.push(surgery)
      byOt.set(s.otId, list)
    }

    return NextResponse.json({
      date: start.toISOString(),
      operationTheaters: ots.map((ot) => ({
        id: ot.id,
        name: ot.name,
        otType: ot.otType,
        floorNo: ot.floorNo,
        status: ot.status,
        surgeries: byOt.get(ot.id) ?? [],
      })),
    })
  } catch (error) {
    console.error('ot-board GET error:', error)
    return NextResponse.json({ error: 'Failed to load OT board' }, { status: 500 })
  }
}

function mapSurgery(s: {
  id: string
  scheduleNo: string
  patientName: string
  patientAge: number
  patientGender: string
  surgeryName: string
  surgeryType: string
  scheduledStartTime: string
  estimatedDuration: number
  actualStartTime: string
  actualEndTime: string
  status: string
  notes: string
  admission: { admissionNo: string } | null
  surgeon: { user: { name: string } } | null
}) {
  return {
    id: s.id,
    scheduleNo: s.scheduleNo,
    patientName: s.patientName,
    patientAge: s.patientAge,
    patientGender: s.patientGender,
    admissionNo: s.admission?.admissionNo || '',
    surgeonName: s.surgeon?.user?.name || '',
    surgeryName: s.surgeryName,
    surgeryType: s.surgeryType,
    scheduledStartTime: s.scheduledStartTime,
    estimatedDuration: s.estimatedDuration,
    actualStartTime: s.actualStartTime,
    actualEndTime: s.actualEndTime,
    status: s.status,
    notes: s.notes,
  }
}
