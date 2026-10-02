import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { PrintLayout, InfoGrid, SectionTitle, Signatures } from '@/components/print/print-layout'
import { formatDateTime } from '@/lib/print-utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ admissionId: string }>
}

export default async function VitalsChartPrintPage({ params }: PageProps) {
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

  const allowedRoles = ['doctor', 'patient', 'nurse', 'receptionist', 'hospital', 'admin']
  if (!allowedRoles.includes(user.role)) {
    return <div style={{ padding: 24 }}>Unauthorized — role not permitted.</div>
  }

  // ---- Fetch admission + vital records ----
  const admission = await db.ipdAdmission.findUnique({
    where: { id: admissionId },
    include: {
      patient: true,
      bed: { include: { ward: true } },
      attendingDoctor: { include: { user: true } },
      hospital: true,
      vitalRecords: { orderBy: { recordedAt: 'asc' } },
    },
  })

  if (!admission) {
    return <div style={{ padding: 24 }}>Admission not found.</div>
  }

  // ---- Authorization per role ----
  if (user.role === 'doctor') {
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
  } else if (user.role === 'nurse') {
    // StaffNurse → check assignment to this admission (active or recent)
    const nurseProfile = await db.staffNurse.findUnique({ where: { userId: user.id } })
    if (!nurseProfile) {
      return <div style={{ padding: 24 }}>Unauthorized — no nurse profile.</div>
    }
    const assignment = await db.nursePatientAssignment.findFirst({
      where: { admissionId: admission.id, nurseId: nurseProfile.id },
    })
    if (!assignment) {
      return <div style={{ padding: 24 }}>Unauthorized — not assigned to this patient.</div>
    }
  } else if (user.role === 'receptionist') {
    const receptionist = await db.receptionist.findFirst({
      where: { userId: user.id, hospitalId: admission.hospitalId },
    })
    if (!receptionist) {
      return <div style={{ padding: 24 }}>Unauthorized — not receptionist for this hospital.</div>
    }
  } else if (user.role === 'hospital') {
    // Hospital.id is a separate cuid from User.id — look up the hospital owned by this user.
    const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
    if (!hospital || hospital.id !== admission.hospitalId) {
      return <div style={{ padding: 24 }}>Unauthorized — not this hospital.</div>
    }
  }
  // admin → always allowed

  // ---- Derive fields ----
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

  const doctorName = doctor?.user?.name || '—'
  const specialization = doctor?.specialization || ''

  const vitals = admission.vitalRecords // ordered asc
  const firstAt = vitals[0]?.recordedAt
  const lastAt = vitals[vitals.length - 1]?.recordedAt
  const dateRange =
    vitals.length === 0
      ? '—'
      : vitals.length === 1
      ? formatDateTime(firstAt)
      : `${formatDateTime(firstAt)} → ${formatDateTime(lastAt)}`

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
      title="VITALS CHART"
      docNo={admission.admissionNo}
      date={firstAt || admission.admissionDate}
    >
      <InfoGrid
        rows={[
          { label: 'Patient Name', value: patientName },
          { label: 'Age', value: patientAge },
          { label: 'Gender', value: patientGender },
          { label: 'IPD No', value: admission.admissionNo },
          { label: 'Bed / Ward', value: bedWard },
          { label: 'Attending Doctor', value: doctorName + (specialization ? ` (${specialization})` : '') },
          { label: 'Recorded Range', value: dateRange },
          { label: 'Total Records', value: String(vitals.length) },
        ]}
      />

      <SectionTitle>Vital Signs</SectionTitle>

      {vitals.length === 0 ? (
        <p style={{ fontSize: 11, margin: '4px 0', color: '#475569' }}>
          No vital records captured for this admission.
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Time</th>
              <th style={{ width: '9%' }}>Temp (°F)</th>
              <th style={{ width: '7%' }}>Pulse</th>
              <th style={{ width: '9%' }}>BP</th>
              <th style={{ width: '8%' }}>SpO2 (%)</th>
              <th style={{ width: '6%' }}>RR</th>
              <th style={{ width: '7%' }}>RBS</th>
              <th style={{ width: '8%' }}>Input (ml)</th>
              <th style={{ width: '8%' }}>Output (ml)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((v) => {
              const temp = v.temperature ? v.temperature.toFixed(1) : '—'
              const pulse = v.pulse ? String(v.pulse) : '—'
              const bp =
                v.bpSystolic && v.bpDiastolic ? `${v.bpSystolic}/${v.bpDiastolic}` : '—'
              const spo2 = v.spo2 ? v.spo2.toFixed(1) : '—'
              const rr = v.respiratoryRate ? String(v.respiratoryRate) : '—'
              const rbs = v.rbs != null ? v.rbs.toFixed(0) : '—'
              const input = v.inputMl ? v.inputMl.toFixed(0) : '—'
              // Prefer outputMl; fall back to urineMl when outputMl is 0.
              const outVal = v.outputMl && v.outputMl > 0 ? v.outputMl : v.urineMl
              const output = outVal && outVal > 0 ? outVal.toFixed(0) : '—'

              // Critical event flags (temperature > 102, spo2 < 90, pulse > 120 or < 50)
              const isCritical =
                (v.temperature && v.temperature >= 102) ||
                (v.spo2 && v.spo2 < 90) ||
                (v.pulse && (v.pulse > 120 || v.pulse < 50))

              return (
                <tr key={v.id} className="avoid-break" style={isCritical ? { background: '#fef2f2' } : undefined}>
                  <td>{formatDateTime(v.recordedAt)}</td>
                  <td style={v.temperature && v.temperature >= 102 ? { color: '#991b1b', fontWeight: 700 } : undefined}>{temp}</td>
                  <td style={v.pulse && (v.pulse > 120 || v.pulse < 50) ? { color: '#991b1b', fontWeight: 700 } : undefined}>{pulse}</td>
                  <td>{bp}</td>
                  <td style={v.spo2 && v.spo2 < 90 ? { color: '#991b1b', fontWeight: 700 } : undefined}>{spo2}</td>
                  <td>{rr}</td>
                  <td>{rbs}</td>
                  <td>{input}</td>
                  <td>{output}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{v.remarks || (isCritical ? '⚠ Critical' : '—')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {vitals.length > 0 && (
        <p style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
          Rows shaded red indicate critical readings (Temp ≥ 102°F, SpO₂ &lt; 90%, or Pulse outside 50–120 bpm).
        </p>
      )}

      <Signatures left="Nurse on Duty" right={`Dr. ${doctorName}${specialization ? `\n${specialization}` : ''}`} />
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
