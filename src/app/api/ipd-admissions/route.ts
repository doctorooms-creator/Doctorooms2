import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/** Resolve hospitalId from hospital/admin/receptionist/nurse role */
async function resolveHospitalId(req: NextRequest): Promise<{ hospitalId: string; userId: string } | null> {
  let user = await requireRole(req, 'hospital')
  if (!user) user = await requireRole(req, 'admin')
  if (!user) user = await requireRole(req, 'receptionist')
  if (!user) user = await requireRole(req, 'nurse')
  if (!user) return null

  if (user.role === 'hospital' || user.role === 'admin') {
    const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
    if (!hospital) return null
    return { hospitalId: hospital.id, userId: user.id }
  }

  // receptionist — find via Receptionist table
  if (user.role === 'receptionist') {
    const receptionist = await db.receptionist.findUnique({ where: { userId: user.id } })
    if (!receptionist) return null
    return { hospitalId: receptionist.hospitalId, userId: user.id }
  }

  // nurse — find via StaffNurse table (read-only GET; needed to pick patients
  // when creating diet orders from the nurse UI)
  const nurse = await db.staffNurse.findFirst({ where: { userId: user.id }, select: { hospitalId: true } })
  if (!nurse) return null
  return { hospitalId: nurse.hospitalId, userId: user.id }
}

// GET /api/ipd-admissions — List IPD admissions with pagination & filters
export async function GET(req: NextRequest) {
  try {
    const auth = await resolveHospitalId(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { hospitalId } = auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const where: Record<string, unknown> = { hospitalId }

    if (status) where.status = status

    if (search) {
      where.OR = [
        { patientName: { contains: search } },
        { admissionNo: { contains: search } },
      ]
    }

    const [admissions, total] = await Promise.all([
      db.ipdAdmission.findMany({
        where,
        include: {
          ward: { select: { name: true } },
          bed: { select: { bedNumber: true } },
          department: { select: { name: true } },
          attendingDoctor: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { admissionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ipdAdmission.count({ where }),
    ])

    return NextResponse.json({
      admissions: admissions.map((a) => ({
        id: a.id,
        admissionNo: a.admissionNo,
        patientName: a.patientName,
        patientAge: a.patientAge,
        patientGender: a.patientGender,
        wardName: a.ward.name,
        bedNumber: a.bed?.bedNumber || '—',
        doctorName: a.attendingDoctor.user.name,
        departmentName: a.department.name,
        admissionDate: a.admissionDate.toISOString(),
        status: a.status,
        advanceAmount: a.advanceAmount,
        totalBillAmount: a.totalBillAmount,
        paymentStatus: a.paymentStatus,
        dischargeAdvised: a.dischargeAdvised,
        initialDiagnosis: a.initialDiagnosis,
        mobileNo: a.mobileNo,
        roomRentDays: a.roomRentDays,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('IPD admissions GET error:', error)
    return NextResponse.json({ error: 'Failed to load IPD admissions' }, { status: 500 })
  }
}
