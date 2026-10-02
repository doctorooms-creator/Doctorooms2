import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { logCreate } from '@/lib/audit-log'

/**
 * GET /api/diet-orders
 *   Doctor, Hospital, Receptionist, Nurse, Admin: list diet orders.
 *   Query: ?admissionId=...&status=Active|Stopped|All&hospitalId=...
 *   Role scoping: hospital/receptionist/nurse → their hospital only; doctor → own orders; admin → all.
 *
 * POST /api/diet-orders
 *   Doctor, Hospital, Receptionist, Nurse: create a new diet order.
 *   Body: {
 *     admissionId, hospitalId?,
 *     dietType (e.g. "Soft Diet", "Liquid Diet", "Diabetic Diet", "NPO", "Regular"),
 *     mealType (e.g. "Breakfast", "Lunch", "Dinner", "All Meals", "Nasogastric"),
 *     instructions (e.g. "Low salt. Avoid spicy food. 2L water daily."),
 *     startDate? (ISO, default now),
 *     endDate? (ISO, optional — auto-stop date)
 *   }
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'nurse')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const admissionId = searchParams.get('admissionId') || ''
    const status = searchParams.get('status') || ''
    const hospitalId = searchParams.get('hospitalId') || ''

    const where: Record<string, unknown> = {}
    if (admissionId) where.admissionId = admissionId
    if (status && status !== 'All') where.status = status

    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      where.orderedById = doctor.id
    } else if (user.role === 'hospital') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!hospital) return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 })
      where.hospitalId = hospital.id
    } else if (user.role === 'receptionist') {
      // Receptionists belong to a hospital via the Receptionist table (not userId on Hospital)
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id }, select: { hospitalId: true } })
      if (!receptionist) return NextResponse.json({ error: 'Receptionist profile not found' }, { status: 404 })
      where.hospitalId = receptionist.hospitalId
    } else if (user.role === 'nurse') {
      // Nurses belong to a hospital via the StaffNurse table
      const nurse = await db.staffNurse.findFirst({ where: { userId: user.id }, select: { hospitalId: true } })
      if (!nurse) return NextResponse.json({ error: 'Nurse profile not found' }, { status: 404 })
      where.hospitalId = nurse.hospitalId
    } else if (user.role === 'admin' && hospitalId) {
      where.hospitalId = hospitalId
    }

    const orders = await db.dietOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        admission: {
          select: {
            id: true,
            admissionNo: true,
            patientName: true,
            patientAge: true,
            patientGender: true,
            bed: { include: { ward: true } },
          },
        },
      },
    })

    return NextResponse.json({ dietOrders: orders })
  } catch (error) {
    console.error('diet-orders GET error:', error)
    return NextResponse.json({ error: 'Failed to load diet orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'nurse')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { admissionId, hospitalId: bodyHospitalId, dietType, mealType, instructions, startDate, endDate } = body

    if (!admissionId || !dietType) {
      return NextResponse.json({ error: 'admissionId and dietType are required' }, { status: 400 })
    }

    // Verify admission exists
    const admission = await db.ipdAdmission.findUnique({
      where: { id: admissionId },
      select: { id: true, hospitalId: true, patientName: true },
    })
    if (!admission) return NextResponse.json({ error: 'Admission not found' }, { status: 404 })

    // Resolve hospitalId
    let hospitalId = bodyHospitalId || admission.hospitalId
    if (!hospitalId && (user.role === 'hospital' || user.role === 'receptionist')) {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      hospitalId = hospital?.id
    }
    if (!hospitalId && user.role === 'receptionist') {
      // Receptionists live in the Receptionist table (hospital via Receptionist.hospitalId)
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id }, select: { hospitalId: true } })
      hospitalId = receptionist?.hospitalId
    }
    if (!hospitalId && user.role === 'nurse') {
      // Nurses live in the StaffNurse table (hospital via StaffNurse.hospitalId)
      const nurse = await db.staffNurse.findFirst({ where: { userId: user.id }, select: { hospitalId: true } })
      hospitalId = nurse?.hospitalId
    }
    if (!hospitalId) {
      return NextResponse.json({ error: 'Could not resolve hospitalId' }, { status: 400 })
    }

    // Resolve orderedById (the user placing the order — for doctors, use Doctor.id; for others, use User.id)
    let orderedById = user.id
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      orderedById = doctor.id
    }

    // Stop any prior ACTIVE diet orders for this admission (only one active at a time per mealType)
    // — actually, keep it simple: allow multiple active orders (e.g. different mealTypes). Document the
    // assumption.

    const order = await db.dietOrder.create({
      data: {
        admissionId,
        hospitalId,
        orderedById,
        dietType: dietType.trim(),
        mealType: mealType || 'All Meals',
        instructions: instructions || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: 'Active',
      },
      include: {
        admission: { select: { id: true, patientName: true, admissionNo: true } },
      },
    })

    // Audit log: diet order placed
    try {
      await logCreate(
        'diet_order',
        order.id,
        user,
        `Ordered diet "${order.dietType}" (${order.mealType}) for ${admission.patientName}`,
        {
          dietType: order.dietType,
          mealType: order.mealType,
          admissionId,
          hospitalId,
        }
      )
    } catch (auditErr) {
      console.error('[audit-log] diet-order create capture failed:', auditErr)
    }

    return NextResponse.json({ dietOrder: order }, { status: 201 })
  } catch (error) {
    console.error('diet-orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create diet order' }, { status: 500 })
  }
}
