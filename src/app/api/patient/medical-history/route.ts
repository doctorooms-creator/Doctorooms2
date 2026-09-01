import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/patient/medical-history
 *
 * Unified timeline of a patient's medical events:
 *   - appointments (Booking)
 *   - prescriptions (Prescription, resolved via booking.userId)
 *   - internal hospital lab reports (LabReport)
 *   - IPD admissions (IpdAdmission)
 *
 * Returns a normalized, date-desc event list (capped at 100) plus summary
 * counts. Patients with no data get empty arrays, not errors.
 *
 * Field notes (verified against prisma/schema.prisma):
 *   - Booking has NO `hospital` relation (plain hospitalId FK) → hospital
 *     names are resolved with a separate lookup.
 *   - Prescription has no direct patient FK → joined through booking.userId.
 *   - LabReport.patientId and IpdAdmission.userId reference the User id.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [bookings, prescriptions, labReports, admissions] = await Promise.all([
      db.booking.findMany({
        where: { userId: user.id },
        orderBy: { bookingDate: 'desc' },
        select: {
          id: true,
          status: true,
          bookingDate: true,
          timeSlot: true,
          disease: true,
          bookingMode: true,
          hospitalId: true,
          doctor: {
            select: {
              specialization: true,
              user: { select: { name: true } },
            },
          },
        },
      }),
      db.prescription.findMany({
        where: { booking: { userId: user.id } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          fulfillmentStatus: true,
          createdAt: true,
          disease: true,
          doctor: { select: { user: { select: { name: true } } } },
          medicines: { select: { medicine: true } },
          booking: { select: { disease: true } },
        },
      }),
      db.labReport.findMany({
        where: { patientId: user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reportNo: true,
          status: true,
          createdAt: true,
          testMaster: { select: { name: true, shortCode: true } },
          hospital: { select: { hospitalName: true } },
        },
      }),
      db.ipdAdmission.findMany({
        where: { userId: user.id },
        orderBy: { admissionDate: 'desc' },
        select: {
          id: true,
          admissionNo: true,
          status: true,
          admissionDate: true,
          dischargeDate: true,
          initialDiagnosis: true,
          finalDiagnosis: true,
          ward: { select: { name: true } },
          bed: { select: { bedNumber: true } },
          hospital: { select: { hospitalName: true } },
        },
      }),
    ])

    // Booking → hospital name (Booking has only a plain hospitalId FK).
    const hospitalIds = Array.from(
      new Set(bookings.map((b) => b.hospitalId).filter((v): v is string => !!v))
    )
    const hospitalRows = hospitalIds.length
      ? await db.hospital.findMany({
          where: { id: { in: hospitalIds } },
          select: { id: true, hospitalName: true },
        })
      : []
    const hospitalNameById = new Map(hospitalRows.map((h) => [h.id, h.hospitalName]))

    type EventType = 'appointment' | 'prescription' | 'lab_report' | 'ipd_admission'
    interface TimelineEvent {
      id: string
      type: EventType
      title: string
      description: string
      date: string
      status: string
    }

    const events: TimelineEvent[] = []

    for (const b of bookings) {
      const doctorName = b.doctor?.user?.name || 'your doctor'
      const hospitalName = b.hospitalId ? hospitalNameById.get(b.hospitalId) || '' : ''
      const bits: string[] = []
      if (b.disease) bits.push(b.disease)
      if (b.timeSlot) bits.push(b.timeSlot)
      if (hospitalName) bits.push(hospitalName)
      events.push({
        id: `appointment-${b.id}`,
        type: 'appointment',
        title: `Appointment with ${doctorName}`,
        description: bits.join(' · '),
        date: b.bookingDate.toISOString(),
        status: b.status || 'Pending',
      })
    }

    for (const p of prescriptions) {
      const doctorName = p.doctor?.user?.name || 'your doctor'
      const medCount = p.medicines.length
      const disease = p.disease || p.booking?.disease || ''
      const bits: string[] = []
      if (medCount > 0) bits.push(`${medCount} medicine${medCount === 1 ? '' : 's'}`)
      if (disease) bits.push(disease)
      events.push({
        id: `prescription-${p.id}`,
        type: 'prescription',
        title: `Prescription from ${doctorName}`,
        description: bits.join(' · '),
        date: p.createdAt.toISOString(),
        status:
          p.status === 'Draft'
            ? 'Draft'
            : p.fulfillmentStatus || p.status || 'Active',
      })
    }

    for (const r of labReports) {
      const testName = r.testMaster?.name || 'Lab test'
      const shortCode = r.testMaster?.shortCode || ''
      const hospitalName = r.hospital?.hospitalName || ''
      const bits: string[] = []
      if (r.reportNo) bits.push(r.reportNo)
      if (hospitalName) bits.push(hospitalName)
      events.push({
        id: `lab-report-${r.id}`,
        type: 'lab_report',
        title: shortCode ? `${shortCode} — ${testName}` : testName,
        description: bits.join(' · '),
        date: r.createdAt.toISOString(),
        status: r.status || 'Ordered',
      })
    }

    for (const a of admissions) {
      const wardName = a.ward?.name || 'ward'
      const bedNumber = a.bed?.bedNumber || ''
      const hospitalName = a.hospital?.hospitalName || ''
      const diagnosis =
        a.status === 'Discharged' && a.finalDiagnosis
          ? a.finalDiagnosis
          : a.initialDiagnosis
      const bits: string[] = []
      if (bedNumber) bits.push(`${wardName} · Bed ${bedNumber}`)
      else bits.push(wardName)
      if (hospitalName) bits.push(hospitalName)
      if (diagnosis) bits.push(diagnosis)
      events.push({
        id: `ipd-admission-${a.id}`,
        type: 'ipd_admission',
        title: `Hospital Stay ${a.admissionNo}`,
        description: bits.join(' · '),
        date: (a.dischargeDate && a.status === 'Discharged' ? a.dischargeDate : a.admissionDate).toISOString(),
        status: a.status || 'Admitted',
      })
    }

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const capped = events.slice(0, 100)

    return NextResponse.json({
      events: capped,
      summary: {
        total: events.length,
        appointments: bookings.length,
        prescriptions: prescriptions.length,
        labReports: labReports.length,
        admissions: admissions.length,
      },
    })
  } catch (error) {
    console.error('Patient medical-history GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
