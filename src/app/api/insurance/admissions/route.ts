import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/** Resolve hospitalId from hospital/admin/receptionist role */
async function resolveHospital(req: NextRequest) {
  let user = await requireRole(req, 'hospital')
  if (!user) user = await requireRole(req, 'admin')
  if (!user) user = await requireRole(req, 'receptionist')
  if (!user) return null

  if (user.role === 'hospital' || user.role === 'admin') {
    const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
    if (!hospital) return null
    return { hospitalId: hospital.id, userId: user.id, role: user.role }
  }

  const receptionist = await db.receptionist.findUnique({ where: { userId: user.id } })
  if (!receptionist) return null
  return { hospitalId: receptionist.hospitalId, userId: user.id, role: user.role }
}

// GET /api/insurance/admissions — list admitted patients with insurance policies (for new pre-auth/claim form)
export async function GET(req: NextRequest) {
  try {
    const auth = await resolveHospital(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { hospitalId } = auth

    const { searchParams } = new URL(req.url)
    const includeDischarged = searchParams.get('includeDischarged') === 'true'
    const search = searchParams.get('search') || undefined

    // Build where clause
    const where: Record<string, unknown> = {
      hospitalId,
      insuranceType: { not: 'Cash' },
    }
    if (!includeDischarged) {
      where.status = 'Admitted'
    }
    if (search) {
      where.OR = [
        { patientName: { contains: search } },
        { admissionNo: { contains: search } },
      ]
    }

    const admissions = await db.ipdAdmission.findMany({
      where,
      orderBy: { admissionDate: 'desc' },
      take: 100,
      include: {
        ward: { select: { name: true } },
        bed: { select: { bedNumber: true } },
        department: { select: { name: true } },
        attendingDoctor: { select: { user: { select: { name: true } } } },
        insurancePolicy: {
          include: {
            company: { select: { id: true, name: true, code: true } },
            tpa: { select: { id: true, name: true, code: true } },
          },
        },
        bill: { select: { id: true, billNo: true, netPayable: true, status: true } },
      },
    })

    return NextResponse.json({
      admissions: admissions.map((a) => ({
        id: a.id,
        admissionNo: a.admissionNo,
        patientName: a.patientName,
        patientAge: a.patientAge,
        patientGender: a.patientGender,
        patientId: a.userId,
        wardName: a.ward.name,
        bedNumber: a.bed?.bedNumber || '—',
        departmentName: a.department.name,
        attendingDoctorName: a.attendingDoctor?.user.name || null,
        admissionDate: a.admissionDate.toISOString(),
        initialDiagnosis: a.initialDiagnosis,
        status: a.status,
        insuranceType: a.insuranceType,
        insurancePolicyId: a.insurancePolicyId,
        insurancePolicy: a.insurancePolicy ? {
          id: a.insurancePolicy.id,
          policyNo: a.insurancePolicy.policyNo,
          policyType: a.insurancePolicy.policyType,
          memberName: a.insurancePolicy.memberName,
          sumInsured: a.insurancePolicy.sumInsured,
          copayPercent: a.insurancePolicy.copayPercent,
          roomRentLimit: a.insurancePolicy.roomRentLimit,
          validFrom: a.insurancePolicy.validFrom.toISOString(),
          validTo: a.insurancePolicy.validTo?.toISOString() || null,
          status: a.insurancePolicy.status,
          companyName: a.insurancePolicy.company.name,
          companyCode: a.insurancePolicy.company.code,
          tpaId: a.insurancePolicy.tpa?.id || null,
          tpaName: a.insurancePolicy.tpa?.name || null,
        } : null,
        bill: a.bill ? {
          id: a.bill.id,
          billNo: a.bill.billNo,
          netPayable: a.bill.netPayable,
          status: a.bill.status,
        } : null,
      })),
    })
  } catch (error) {
    console.error('Insurance admissions GET error:', error)
    return NextResponse.json({ error: 'Failed to load admissions' }, { status: 500 })
  }
}
