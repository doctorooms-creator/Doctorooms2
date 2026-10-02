import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { NextRequest } from 'next/server'

// GET: List the patient's IPD admissions (active first, then historical).
// Used by the patient-facing Diet Plan page to resolve the active admission.
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admissions = await db.ipdAdmission.findMany({
      where: { userId: user.id },
      orderBy: { admissionDate: 'desc' },
      select: {
        id: true,
        admissionNo: true,
        status: true,
        admissionDate: true,
        dischargeDate: true,
        patientName: true,
        initialDiagnosis: true,
        ward: { select: { name: true, wardType: true } },
        bed: { select: { bedNumber: true, bedType: true } },
        department: { select: { name: true } },
        hospital: { select: { hospitalName: true } },
        attendingDoctor: {
          select: { user: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json({
      admissions: admissions.map((a) => ({
        id: a.id,
        admissionNo: a.admissionNo,
        status: a.status,
        admissionDate: a.admissionDate.toISOString(),
        dischargeDate: a.dischargeDate?.toISOString() || null,
        patientName: a.patientName,
        initialDiagnosis: a.initialDiagnosis,
        wardName: a.ward?.name || '',
        wardType: a.ward?.wardType || '',
        bedNumber: a.bed?.bedNumber || '',
        bedType: a.bed?.bedType || '',
        departmentName: a.department?.name || '',
        hospitalName: a.hospital?.hospitalName || '',
        attendingDoctorName: a.attendingDoctor?.user?.name || '',
      })),
    })
  } catch (error) {
    console.error('Patient admissions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
