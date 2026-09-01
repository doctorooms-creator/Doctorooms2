import { NextRequest, NextResponse } from 'next/server'
import { requireRole, requireAuth, type AuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { format } from 'date-fns'

async function authorizeUser(req: NextRequest, prescription: { doctorId: string; booking: { userId: string | null } } | null): Promise<AuthUser | null> {
  if (!prescription) return null

  // Try doctor role
  const doctor = await requireRole(req, 'doctor')
  if (doctor && doctor.role === 'doctor') {
    return doctor
  }

  // Try patient role (must be the booking owner)
  const patient = await requireRole(req, 'patient')
  if (patient && prescription.booking?.userId === patient.id) {
    return patient
  }

  // Admin access
  const admin = await requireRole(req, 'admin')
  if (admin) return admin

  return null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            // userId is required for patient authorization (authorizeUser compares
            // prescription.booking.userId === patient.id) — it is NOT part of the
            // response payload below, so the PrintData contract stays unchanged.
            userId: true,
            id: true,
            patientName: true,
            age: true,
            gender: true,
            bloodGroup: true,
            weight: true,
            disease: true,
            timeSlot: true,
            bookingDate: true,
            hospitalId: true,
            departmentId: true,
            // Queue token (e.g. SHARMA-001) — generated when the patient joins
            // the queue; printed as the Patient ID so the desk can search the
            // patient by it on their next visit.
            tokenNumber: true,
            appointmentNo: true,
            // Patient contact number — printed so the clinic can reach/verify
            // the patient on follow-up visits.
            user: { select: { mobileNo: true } },
          },
        },
        doctor: {
          select: {
            id: true,
            user: {
              select: { name: true, email: true, mobileNo: true },
            },
            specialization: true,
            education: true,
            registrationDetail: true,
            city: true,
            state: true,
            address: true,
            hospitalAddress: true,
            phoneNo: true,
          },
        },
        chiefComplaints: {
          orderBy: { createdAt: 'asc' },
        },
        labels: {
          orderBy: { createdAt: 'asc' },
        },
        medicines: {
          orderBy: { createdAt: 'asc' },
        },
        suggestions: {
          orderBy: { createdAt: 'asc' },
        },
        diagnosisTables: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const user = await authorizeUser(req, prescription)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load print settings
    const settings = await db.pOtherSetting.findUnique({
      where: { doctorId: prescription.doctorId },
    })

    // Build patient info from booking
    const booking = prescription.booking
    const patient = {
      name: prescription.patientName || booking?.patientName || '',
      age: booking?.age ? String(booking.age) : prescription.patientAge || '',
      gender: booking?.gender || prescription.booking?.gender || '',
      bloodGroup: booking?.bloodGroup || prescription.booking?.bloodGroup || '',
      // Patient ID — the queue token generated when the patient entered the
      // queue (e.g. SHARMA-001). Falls back to the appointment number for
      // bookings that never joined a queue.
      id: booking?.tokenNumber || booking?.appointmentNo || '',
      // Patient contact number (from the patient's account)
      contact: booking?.user?.mobileNo || '',
    }

    // Build doctor info
    const doc = prescription.doctor
    const doctor = {
      name: doc?.user?.name || '',
      specialization: doc?.specialization || '',
      education: doc?.education || '',
      registrationDetail: doc?.registrationDetail || '',
      city: doc?.city || '',
      state: doc?.state || '',
      address: doc?.address || '',
      hospitalAddress: doc?.hospitalAddress || '',
      phoneNo: doc?.phoneNo || doc?.user?.phoneNo || '',
      mobileNo: doc?.user?.mobileNo || '',
    }

    // Fetch hospital/department info if the booking is hospital-based
    let hospitalContext: { hospitalName: string; departmentName: string; departmentFloor: string; departmentOpdRoom: string } | null = null
    if (prescription.booking?.hospitalId) {
      const hospital = await db.hospital.findUnique({
        where: { id: prescription.booking.hospitalId },
        select: { id: true, hospitalName: true },
      })
      let department = null
      if (prescription.booking.departmentId) {
        department = await db.department.findUnique({
          where: { id: prescription.booking.departmentId },
          select: { id: true, name: true, floorNo: true, opdRoom: true },
        })
      }
      if (hospital) {
        hospitalContext = {
          hospitalName: hospital.hospitalName,
          departmentName: department?.name || '',
          departmentFloor: department?.floorNo || '',
          departmentOpdRoom: department?.opdRoom || '',
        }
      }
    }

    // Load CoMaster records for complaints separately (no direct relation in schema)
    const coIds = prescription.chiefComplaints.map((pc) => pc.coId).filter(Boolean)
    const coRecords = coIds.length > 0
      ? await db.coMaster.findMany({
          where: { id: { in: coIds } },
          select: { id: true, coDetail: true, coDetailEn: true },
        })
      : []
    const coMap = new Map(coRecords.map((c) => [c.id, c]))

    // Build complaints list
    const complaints = prescription.chiefComplaints.map((pc) => {
      const co = coMap.get(pc.coId)
      return {
        coId: pc.coId,
        coDetail: co?.coDetail || '',
        coDetailEn: co?.coDetailEn || '',
      }
    })

    // Build vitals
    const vitals = {
      weight: prescription.weight || '',
      bp: prescription.bp || '',
      temperature: prescription.temperature || '',
      pulse: '', // Could be added as a label
      spo2: '',  // Could be added as a label
    }

    // Build labels
    const labels = prescription.labels.map((l) => ({
      label: l.labelEn || l.label || '',
      value: l.value || '',
      labelUnit: l.labelUnit || '',
      showUnit: l.showUnit !== false,
    }))

    // Build medicines - format dose as selectedDose string, timing as Int
    const medicines = prescription.medicines.map((m) => {
      let doseStr = m.dose || ''
      // If dose is a JSON array, parse and use first item as selected dose
      try {
        const parsed = JSON.parse(m.dose)
        if (Array.isArray(parsed) && parsed.length > 0) {
          doseStr = parsed[0] || ''
        }
      } catch {
        // dose is already a plain string, use as-is
      }
      return {
        medicine: m.medicine || '',
        dose: doseStr,
        morning: m.morning || 0,
        afternoon: m.afternoon || 0,
        evening: m.evening || 0,
        tab: m.tab || 0,
        description: m.description || '',
      }
    })

    // Build diagnosis tables - parse JSON arrays
    const tables = prescription.diagnosisTables.map((t) => {
      let headerArr: string[] = []
      let colsArr: string[] = []
      let footerArr: string[] = []
      let cellVals: Record<string, string> = {}
      try {
        headerArr = JSON.parse(t.headerLabel || '[]')
      } catch { headerArr = [] }
      try {
        colsArr = JSON.parse(t.colsLabel || '[]')
      } catch { colsArr = [] }
      try {
        footerArr = JSON.parse(t.footerLabel || '[]')
      } catch { footerArr = [] }
      try {
        const parsed = JSON.parse(t.cellValues || '{}')
        // Legacy rows may hold "[]" (array default) — only accept objects.
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          cellVals = parsed as Record<string, string>
        }
      } catch { cellVals = {} }
      return {
        rows: t.rows || 0,
        cols: t.cols || 0,
        headerLabel: headerArr,
        colsLabel: colsArr,
        footerLabel: footerArr,
        extraLabel: t.extraLabel || '',
        cellValues: cellVals,
      }
    })

    // Build suggestions (coId = complaint link, null = general advice)
    const suggestions = prescription.suggestions.map((s) => ({
      coId: s.coId || null,
      question: s.question || '',
      questionEn: s.questionEn || '',
      suggestions: s.suggestions || '',
      suggestionsEn: s.suggestionsEn || '',
    }))

    // Build settings
    const printSettings = {
      logo: settings?.logo || '',
      header: settings?.header || '',
      fullHeader: settings?.fullHeader || '',
      isFullHeader: settings?.isFullHeader || false,
      footer: settings?.footer || '',
      showCoInPrint: settings?.showCoInPrint !== false,
      showNextVisit: settings?.showNextVisit !== false,
      printLayout: settings?.printLayout || 'standard',
    }

    // Next visit
    const nextVisit = prescription.nextVisit
      ? format(new Date(prescription.nextVisit), 'dd MMM yyyy')
      : undefined

    return NextResponse.json({
      patient,
      doctor,
      hospital: hospitalContext,
      settings: printSettings,
      complaints,
      vitals,
      labels,
      medicines,
      tables,
      suggestions,
      nextVisit,
      createdAt: prescription.createdAt,
    })
  } catch (error) {
    console.error('Get print data error:', error)
    return NextResponse.json({ error: 'Failed to load print data' }, { status: 500 })
  }
}
