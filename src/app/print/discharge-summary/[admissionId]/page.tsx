import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { PrintLayout, InfoGrid, SectionTitle, Signatures } from '@/components/print/print-layout'
import { formatDateTime, formatDate } from '@/lib/print-utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ admissionId: string }>
}

export default async function DischargeSummaryPrintPage({ params }: PageProps) {
  const { admissionId } = await params

  // ---- Auth (server-side, cookie-based) ----
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('doctorooms_session')?.value
  if (!sessionId) {
    return <div style={{ padding: 24 }}>Unauthorized — no session.</div>
  }
  const user = await db.user.findUnique({ where: { id: sessionId } })
  if (!user || user.status !== 'Active') {
    return <div style={{ padding: 24 }}>Unauthorized.</div>
  }

  // Allowed roles: doctor (attending), patient (owner), receptionist, hospital, admin, nurse.
  const allowedRoles = ['doctor', 'patient', 'receptionist', 'hospital', 'admin', 'nurse']
  if (!allowedRoles.includes(user.role)) {
    return <div style={{ padding: 24 }}>Unauthorized — role not permitted.</div>
  }

  // ---- Fetch admission + related data ----
  const admission = await db.ipdAdmission.findUnique({
    where: { id: admissionId },
    include: {
      patient: true,
      attendingDoctor: { include: { user: true } },
      bed: { include: { ward: true } },
      hospital: true,
      doctorVisits: { orderBy: { visitDate: 'desc' }, take: 6 },
      vitalRecords: { orderBy: { recordedAt: 'desc' }, take: 10 },
      doctorOrders: { orderBy: { createdAt: 'desc' } },
      sampleCollections: { orderBy: { createdAt: 'desc' } },
      investigationReports: { orderBy: { reportDate: 'desc' } },
    },
  })

  if (!admission) {
    return <div style={{ padding: 24 }}>Admission not found.</div>
  }

  // ---- Authorization per role ----
  if (user.role === 'doctor') {
    // Must be the attending or referring doctor.
    const doctorProfile = await db.doctor.findUnique({ where: { userId: user.id } })
    if (
      !doctorProfile ||
      (doctorProfile.id !== admission.attendingDoctorId &&
        doctorProfile.id !== admission.referringDoctorId)
    ) {
      return <div style={{ padding: 24 }}>Unauthorized — not attending doctor.</div>
    }
  } else if (user.role === 'patient') {
    if (!admission.userId || admission.userId !== user.id) {
      return <div style={{ padding: 24 }}>Unauthorized — not the patient.</div>
    }
  } else if (user.role === 'receptionist') {
    const receptionist = await db.receptionist.findFirst({
      where: { userId: user.id, hospitalId: admission.hospitalId },
    })
    if (!receptionist) {
      return <div style={{ padding: 24 }}>Unauthorized — not receptionist for this hospital.</div>
    }
  } else if (user.role === 'hospital') {
    // Hospital.id is a separate cuid from User.id; look up the hospital owned by this user.
    const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
    if (!hospital || hospital.id !== admission.hospitalId) {
      return <div style={{ padding: 24 }}>Unauthorized — not this hospital.</div>
    }
  }
  // admin → always allowed
  // nurse → allowed (any nurse; production could narrow to assignments, omitted for brevity)

  // ---- Derive fields ----
  const isDischarged = admission.dischargeDate !== null
  const docTitleSuffix = isDischarged ? 'FINAL' : 'INTERIM'

  const hospital = admission.hospital
  const doctor = admission.attendingDoctor
  const patient = admission.patient

  const patientName = admission.patientName || patient?.name || '—'
  const patientAge =
    admission.patientAge > 0
      ? `${admission.patientAge} yrs`
      : admission.patientDob
      ? computeAge(admission.patientDob)
      : '—'
  const patientGender = admission.patientGender || patient?.gender || '—'

  const bedWard = admission.bed
    ? `${admission.bed.bedNumber}${admission.bed.ward ? ` / ${admission.bed.ward.name}` : ''}`
    : '—'

  const diagnosis = (isDischarged && admission.finalDiagnosis?.trim())
    ? admission.finalDiagnosis
    : admission.initialDiagnosis || '—'

  const presentingComplaints = admission.chiefComplaints || '—'

  // Treatment summary — from latest 2 doctor visits
  const recentVisits = admission.doctorVisits.slice(0, 2)
  const treatmentSummary = recentVisits
    .map((v) => {
      const parts: string[] = []
      if (v.visitDate) parts.push(formatDateTime(v.visitDate))
      if (v.currentDiagnosis) parts.push(`Dx: ${v.currentDiagnosis}`)
      if (v.examinationFindings) parts.push(`Exam: ${v.examinationFindings}`)
      if (v.advise) parts.push(`Advice: ${v.advise}`)
      return parts.join(' — ')
    })
    .filter(Boolean)
    .join('\n\n')

  // Procedures — DoctorOrder has no `type` field in the schema.
  // Deviation: surface any order whose route/instructions mentions "procedure"
  // as a soft proxy; otherwise omit gracefully.
  const procedureOrders = admission.doctorOrders.filter((o) => {
    const hay = `${o.route} ${o.instructions} ${o.drugName}`.toLowerCase()
    return hay.includes('procedure') || hay.includes('surgery') || hay.includes('operation')
  })

  // Investigations — merge sampleCollections + investigationReports.
  // The task hint suggested `sampleCollections.include.investigationReports`,
  // but the schema has no back-relation. We render them as two related tables.
  const samples = admission.sampleCollections
  const reports = admission.investigationReports

  // Course in hospital — vital record trends (already capped at 10, desc).
  // Reverse to ascending for the timeline.
  const vitalsTimeline = [...admission.vitalRecords].reverse()

  // Medications at discharge — active doctor orders.
  const activeMeds = admission.doctorOrders.filter(
    (o) => o.status === 'Active' || (!o.stoppedAt && o.status !== 'Discontinued')
  )

  // Follow-up advice — admission.followUpNotes + latest visit.advise.
  const followUpParts: string[] = []
  if (admission.followUpDate) {
    followUpParts.push(`Review on: ${formatDate(admission.followUpDate)}`)
  }
  if (admission.followUpNotes?.trim()) {
    followUpParts.push(admission.followUpNotes)
  }
  const latestAdvise = admission.doctorVisits[0]?.advise?.trim()
  if (latestAdvise) {
    followUpParts.push(`Latest visit advice: ${latestAdvise}`)
  }
  const followUpAdvice = followUpParts.length ? followUpParts.join('\n') : '—'

  // Doctor signature line.
  const doctorName = doctor?.user?.name || '—'
  const specialization = doctor?.specialization || ''
  const regNo = doctor?.registrationDetail || ''
  const doctorSigLine = [
    `Dr. ${doctorName}`,
    specialization ? specialization : '',
    regNo ? `Reg. No: ${regNo}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  // ---- Render ----
  return (
    <PrintLayout
      letterhead={{
        name: hospital?.hospitalName || 'Hospital',
        subtitle: hospital?.hospitalType || undefined,
        address: hospital?.address
          ? [hospital.address, hospital.city, hospital.state, hospital.pincode]
              .filter(Boolean)
              .join(', ')
          : undefined,
        contact: hospital?.contactNo
          ? [hospital.contactNo, hospital.email, hospital.website].filter(Boolean).join(' | ')
          : undefined,
      }}
      title={`DISCHARGE SUMMARY (${docTitleSuffix})`}
      docNo={admission.admissionNo}
      date={isDischarged ? admission.dischargeDate! : admission.admissionDate}
    >
      <InfoGrid
        rows={[
          { label: 'Patient Name', value: patientName },
          { label: 'Age', value: patientAge },
          { label: 'Gender', value: patientGender },
          { label: 'IPD No', value: admission.admissionNo },
          { label: 'Bed / Ward', value: bedWard },
          { label: 'Attending Doctor', value: doctorName + (specialization ? ` (${specialization})` : '') },
          { label: 'Admission Date', value: formatDateTime(admission.admissionDate) },
          { label: 'Discharge Date', value: isDischarged ? formatDateTime(admission.dischargeDate) : '— (still admitted)' },
          { label: 'Discharge Type', value: admission.dischargeType || '—' },
        ]}
      />

      <SectionTitle>Diagnosis</SectionTitle>
      <p style={{ fontSize: 11, margin: '4px 0', whiteSpace: 'pre-wrap' }}>{diagnosis}</p>

      <SectionTitle>Presenting Complaints</SectionTitle>
      <p style={{ fontSize: 11, margin: '4px 0', whiteSpace: 'pre-wrap' }}>{presentingComplaints}</p>

      {admission.pastHistory?.trim() && (
        <>
          <SectionTitle>Past History</SectionTitle>
          <p style={{ fontSize: 11, margin: '4px 0', whiteSpace: 'pre-wrap' }}>{admission.pastHistory}</p>
        </>
      )}

      {admission.examinationNotes?.trim() && (
        <>
          <SectionTitle>Examination Findings</SectionTitle>
          <p style={{ fontSize: 11, margin: '4px 0', whiteSpace: 'pre-wrap' }}>{admission.examinationNotes}</p>
        </>
      )}

      <SectionTitle>Treatment Summary</SectionTitle>
      <p style={{ fontSize: 11, margin: '4px 0', whiteSpace: 'pre-wrap' }}>
        {treatmentSummary || '—'}
      </p>

      {procedureOrders.length > 0 && (
        <>
          <SectionTitle>Procedures</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Item</th>
                <th style={{ width: '15%' }}>Route</th>
                <th style={{ width: '15%' }}>Dose / Frequency</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {procedureOrders.map((o) => (
                <tr key={o.id} className="avoid-break">
                  <td>{o.drugName || '—'}</td>
                  <td>{o.route || '—'}</td>
                  <td>{[o.dose, o.frequency].filter(Boolean).join(' / ') || '—'}</td>
                  <td>{o.instructions || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <SectionTitle>Investigations</SectionTitle>

      {reports.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Test</th>
              <th style={{ width: '30%' }}>Result</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '15%' }}>Date</th>
              <th style={{ width: '15%' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const resultText = safeParseResult(r.resultData)
              return (
                <tr key={r.id} className="avoid-break">
                  <td>
                    {r.testName || '—'}
                    {r.isAbnormal && (
                      <span style={{ color: '#991b1b', fontWeight: 700, marginLeft: 4 }}>⚠</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{resultText || '—'}</td>
                  <td style={{ color: r.isAbnormal ? '#991b1b' : '#166534' }}>
                    {r.isAbnormal ? 'Abnormal' : 'Normal'}
                  </td>
                  <td>{formatDate(r.reportDate)}</td>
                  <td>{r.remarks || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: 11, margin: '4px 0', color: '#475569' }}>No investigation reports on record.</p>
      )}

      {samples.length > 0 && (
        <>
          <p style={{ fontSize: 11, fontWeight: 600, margin: '8px 0 2px', color: '#475569' }}>
            Samples collected:
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Test</th>
                <th style={{ width: '20%' }}>Sample Type</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '20%' }}>Collected</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s) => (
                <tr key={s.id} className="avoid-break">
                  <td>{s.testName || '—'}</td>
                  <td>{s.sampleType || '—'}</td>
                  <td>{s.status || '—'}</td>
                  <td>{formatDateTime(s.collectedAt)}</td>
                  <td>{s.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <SectionTitle>Course in Hospital</SectionTitle>
      {vitalsTimeline.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Time</th>
              <th style={{ width: '15%' }}>Temp (°F)</th>
              <th style={{ width: '15%' }}>Pulse</th>
              <th style={{ width: '15%' }}>BP</th>
              <th style={{ width: '15%' }}>SpO2 (%)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {vitalsTimeline.map((v) => (
              <tr key={v.id} className="avoid-break">
                <td>{formatDateTime(v.recordedAt)}</td>
                <td>{v.temperature ? v.temperature.toFixed(1) : '—'}</td>
                <td>{v.pulse || '—'}</td>
                <td>{v.bpSystolic && v.bpDiastolic ? `${v.bpSystolic}/${v.bpDiastolic}` : '—'}</td>
                <td>{v.spo2 ? v.spo2.toFixed(1) : '—'}</td>
                <td>{v.remarks || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: 11, margin: '4px 0', color: '#475569' }}>No vital records captured.</p>
      )}

      <SectionTitle>Medications at Discharge</SectionTitle>
      {activeMeds.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Drug</th>
              <th style={{ width: '10%' }}>Route</th>
              <th style={{ width: '15%' }}>Dose</th>
              <th style={{ width: '15%' }}>Frequency</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {activeMeds.map((o) => (
              <tr key={o.id} className="avoid-break">
                <td>{o.drugName || '—'}</td>
                <td>{o.route || '—'}</td>
                <td>{o.dose || '—'}</td>
                <td>{o.frequency || '—'}</td>
                <td>{o.instructions || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: 11, margin: '4px 0', color: '#475569' }}>No active medications recorded.</p>
      )}

      <SectionTitle>Follow-up Advice</SectionTitle>
      <p style={{ fontSize: 11, margin: '4px 0', whiteSpace: 'pre-wrap' }}>{followUpAdvice}</p>

      {admission.dischargeSummary?.trim() && (
        <>
          <SectionTitle>Discharge Notes</SectionTitle>
          <p style={{ fontSize: 11, margin: '4px 0', whiteSpace: 'pre-wrap' }}>{admission.dischargeSummary}</p>
        </>
      )}

      <Signatures left="Patient / Attendant" right={doctorSigLine} />
    </PrintLayout>
  )
}

// ---- Helpers ----

function computeAge(dob: string | Date | null | undefined): string {
  if (!dob) return '—'
  try {
    const birth = typeof dob === 'string' ? new Date(dob) : dob
    const diff = Date.now() - birth.getTime()
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
    return years > 0 ? `${years} yrs` : '—'
  } catch {
    return '—'
  }
}

/** InvestigationReport.resultData is stored as a JSON string. Surface it readably. */
function safeParseResult(raw: string | null | undefined): string {
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'string') return parsed
    if (Array.isArray(parsed)) {
      return parsed
        .map((p: Record<string, unknown>) =>
          Object.entries(p)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        )
        .join('\n')
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    }
    return String(parsed)
  } catch {
    return raw
  }
}
