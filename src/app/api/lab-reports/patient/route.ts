import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/lab-reports/patient
 *   Patient: list all MY lab reports (uploads from external test orders)
 *   PLUS internal hospital LabReports (any status) in `hospitalReports`.
 *
 * GET /api/lab-reports/patient?patientId=xxx
 *   Doctor: pass ?patientId to view a specific patient's reports
 *   (external uploads + internal hospital reports).
 *
 * NOTE: `reports` keeps its original shape (LabReportUpload list) — do not
 * change it; other consumers (prescription wizard step 8, view-reports
 * dialog, sidebar badge) depend on it. `hospitalReports` is additive.
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'patient')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    let patientId = searchParams.get('patientId') || ''

    if (user.role === 'patient') {
      patientId = user.id
    } else if (user.role === 'doctor') {
      if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 })
    }

    // If doctor, verify patient belongs to them (has a booking or external order with them)
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      const myOrder = await db.externalTestOrder.findFirst({
        where: { patientId, doctorId: doctor.id },
        select: { id: true },
      })
      const myBooking = await db.booking.findFirst({
        where: { userId: patientId, doctorId: doctor.id },
        select: { id: true },
      })
      if (!myOrder && !myBooking) {
        return NextResponse.json({ error: 'Patient not under your care' }, { status: 403 })
      }
    }

    const reports = await db.labReportUpload.findMany({
      where: {
        externalOrder: { patientId },
      },
      orderBy: { uploadedAt: 'desc' },
      include: {
        externalOrder: {
          select: {
            id: true,
            orderNo: true,
            testName: true,
            testType: true,
            testFee: true,
            status: true,
            urgency: true,
            orderedAt: true,
            completedAt: true,
            notes: true,
            doctor: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
        labPartner: { select: { id: true, labName: true, city: true, mobile: true } },
      },
    })

    // SECURITY (P3.1 + P3.2): Strip the raw fileUrl from the response.
    // Replace with a proxy URL that goes through the authenticated API route.
    // The raw Cloudinary/Supabase URL is never exposed to the client.
    const sanitizedReports = reports.map((r) => {
      const { fileUrl: _stripped, ...rest } = r
      return {
        ...rest,
        fileProxyUrl: r.id ? `/api/lab-reports/${r.id}/file` : null,
        fileDownloadUrl: r.id ? `/api/lab-reports/${r.id}/file?download=true` : null,
      }
    })

    // Internal hospital lab reports (doctor-ordered tests processed by the
    // hospital's own lab). ALL statuses so patients can follow progress
    // Ordered → SampleCollected → ResultEntered → Verified.
    // Relations used (verified against prisma/schema.prisma): LabReport →
    // testMaster (LabTestMaster), parameterValues (LabParameterValue) →
    // testParameter (LabTestParameter), hospital (Hospital), verifiedBy
    // (LabTechnician) → user (User). Booking has NO department relation —
    // nothing from Booking is selected here.
    const hospitalReportRows = await db.labReport.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        testMaster: { select: { name: true, shortCode: true, category: true } },
        parameterValues: {
          include: {
            testParameter: {
              select: {
                paramName: true,
                shortCode: true,
                unit: true,
                normalMaleMin: true,
                normalMaleMax: true,
                normalFemaleMin: true,
                normalFemaleMax: true,
                normalChildMin: true,
                normalChildMax: true,
              },
            },
          },
          orderBy: { testParameter: { sortOrder: 'asc' } },
        },
        hospital: { select: { hospitalName: true } },
        verifiedBy: { select: { user: { select: { name: true } } } },
      },
    })

    // `hospital.name` alias mirrors the round-5 fix in
    // /api/lab-reports/[id]/route.ts — clients render `hospital.name`.
    const hospitalReports = hospitalReportRows.map((r) => ({
      ...r,
      hospital: r.hospital
        ? { ...r.hospital, name: r.hospital.hospitalName }
        : null,
    }))

    return NextResponse.json({ reports: sanitizedReports, hospitalReports })
  } catch (error) {
    console.error('lab-reports/patient GET error:', error)
    return NextResponse.json({ error: 'Failed to load patient reports' }, { status: 500 })
  }
}
