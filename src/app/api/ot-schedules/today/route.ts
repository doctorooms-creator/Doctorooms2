import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/ot-schedules/today
 *   Returns all surgeries scheduled for today, for the requesting hospital.
 *   Multi-role: admin / hospital / receptionist / doctor (doctor sees own).
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    const where: Record<string, unknown> = {
      AND: [{ scheduledDate: { gte: start } }, { scheduledDate: { lt: end } }],
    }

    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      where.surgeonId = doctor.id
    } else if (user.role === 'hospital') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!hospital) return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 })
      where.hospitalId = hospital.id
    } else if (user.role === 'receptionist') {
      // Receptionists belong to a hospital via the Receptionist table (not userId on Hospital)
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id }, select: { hospitalId: true } })
      if (!receptionist) return NextResponse.json({ error: 'Receptionist profile not found' }, { status: 404 })
      where.hospitalId = receptionist.hospitalId
    }

    const schedules = await db.otSchedule.findMany({
      where,
      orderBy: [{ scheduledDate: 'asc' }, { scheduledStartTime: 'asc' }],
      include: {
        ot: { select: { id: true, name: true, otType: true } },
        admission: { select: { id: true, admissionNo: true, patientName: true } },
        surgeon: { include: { user: { select: { id: true, name: true } } } },
      },
    })

    return NextResponse.json({ schedules, date: start.toISOString() })
  } catch (error) {
    console.error('ot-schedules/today GET error:', error)
    return NextResponse.json({ error: 'Failed to load today\'s surgeries' }, { status: 500 })
  }
}
