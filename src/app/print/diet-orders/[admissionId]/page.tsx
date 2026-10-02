import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import {
  PrintLayout,
  InfoGrid,
  SectionTitle,
  Signatures,
} from '@/components/print/print-layout'
import { formatDate, formatDateTime } from '@/lib/print-utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ admissionId: string }>
}

/**
 * /print/diet-orders/[admissionId]
 *   Printable Diet Chart for a single admission — lists ALL diet orders
 *   (active + stopped) plus a "Current Active" summary for the kitchen.
 *   Accessible to any active-logged-in role (admin/doctor/hospital/
 *   receptionist/nurse).
 */
export default async function DietOrdersPrintPage({ params }: PageProps) {
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

  const allowedRoles = ['admin', 'doctor', 'hospital', 'receptionist', 'nurse']
  if (!allowedRoles.includes(user.role)) {
    return <div style={{ padding: 24 }}>Unauthorized — role not permitted.</div>
  }

  // ---- Fetch admission + all diet orders ----
  const admission = await db.ipdAdmission.findUnique({
    where: { id: admissionId },
    include: {
      patient: true,
      bed: { include: { ward: true } },
      attendingDoctor: { include: { user: true } },
      hospital: true,
      dietOrders: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!admission) {
    return <div style={{ padding: 24 }}>Admission not found.</div>
  }

  // ---- Per-role authorization ----
  if (user.role === 'doctor') {
    const doctorProfile = await db.doctor.findUnique({
      where: { userId: user.id },
    })
    if (
      !doctorProfile ||
      (doctorProfile.id !== admission.attendingDoctorId &&
        doctorProfile.id !== admission.referringDoctorId)
    ) {
      return <div style={{ padding: 24 }}>Unauthorized — not attending doctor.</div>
    }
  } else if (user.role === 'receptionist') {
    const receptionist = await db.receptionist.findFirst({
      where: { userId: user.id, hospitalId: admission.hospitalId },
    })
    if (!receptionist) {
      return <div style={{ padding: 24 }}>Unauthorized — not receptionist for this hospital.</div>
    }
  } else if (user.role === 'hospital') {
    const hospital = await db.hospital.findUnique({
      where: { userId: user.id },
    })
    if (!hospital || hospital.id !== admission.hospitalId) {
      return <div style={{ padding: 24 }}>Unauthorized — not this hospital.</div>
    }
  } else if (user.role === 'nurse') {
    const nurse = await db.staffNurse.findUnique({
      where: { userId: user.id },
    })
    if (!nurse || nurse.hospitalId !== admission.hospitalId) {
      return (
        <div style={{ padding: 24 }}>
          Unauthorized — not assigned to this hospital.
        </div>
      )
    }
  }
  // admin → always allowed

  // ---- Derive display fields ----
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
    ? `${admission.bed.bedNumber}${
        admission.bed.ward ? ` / ${admission.bed.ward.name}` : ''
      }`
    : '—'

  const doctorName = doctor?.user?.name || '—'
  const specialization = doctor?.specialization || ''

  const orders = admission.dietOrders
  const activeOrders = orders.filter((o) => o.status === 'Active')

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
          ? [hospital.contactNo, hospital.email, hospital.website]
              .filter(Boolean)
              .join(' | ')
          : undefined,
      }}
      title="DIET CHART"
      docNo={admission.admissionNo}
      date={admission.admissionDate}
    >
      <InfoGrid
        rows={[
          { label: 'Patient Name', value: patientName },
          { label: 'Age', value: patientAge },
          { label: 'Gender', value: patientGender },
          { label: 'IPD No', value: admission.admissionNo },
          { label: 'Bed / Ward', value: bedWard },
          {
            label: 'Attending Doctor',
            value:
              doctorName +
              (specialization ? ` (${specialization})` : ''),
          },
        ]}
      />

      <SectionTitle>Diet Orders</SectionTitle>

      {orders.length === 0 ? (
        <p style={{ fontSize: 11, margin: '4px 0', color: '#475569' }}>
          No diet orders have been recorded for this admission.
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ width: '16%' }}>Diet Type</th>
              <th style={{ width: '12%' }}>Meal Type</th>
              <th>Instructions</th>
              <th style={{ width: '11%' }}>Start Date</th>
              <th style={{ width: '11%' }}>End Date</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '20%' }}>Stopped Reason</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isActive = o.status === 'Active'
              return (
                <tr key={o.id} className="avoid-break">
                  <td style={{ fontWeight: 600 }}>{o.dietType || '—'}</td>
                  <td>{o.mealType || '—'}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>
                    {o.instructions || '—'}
                  </td>
                  <td>{formatDate(o.startDate)}</td>
                  <td>{formatDate(o.endDate)}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        borderRadius: 3,
                        fontSize: 10,
                        fontWeight: 600,
                        background: isActive ? '#dcfce7' : '#f1f5f9',
                        color: isActive ? '#166534' : '#475569',
                      }}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>
                    {o.status === 'Stopped' ? (
                      <span>
                        {o.stoppedReason ||
                          `(stopped ${formatDateTime(o.stoppedAt)})`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <SectionTitle>Current Active Diet Orders</SectionTitle>

      {activeOrders.length === 0 ? (
        <p style={{ fontSize: 11, margin: '4px 0', color: '#475569' }}>
          No active diet orders. Patient may be NPO or has been discharged from
          diet monitoring.
        </p>
      ) : (
        <ul
          style={{
            margin: '4px 0 8px',
            paddingLeft: 18,
            fontSize: 11,
            lineHeight: 1.6,
          }}
        >
          {activeOrders.map((o) => (
            <li key={o.id} className="avoid-break">
              <strong>{o.dietType}</strong>
              {o.mealType ? ` · ${o.mealType}` : ''}
              {o.instructions ? ` — ${o.instructions}` : ''}
              {o.endDate ? ` (until ${formatDate(o.endDate)})` : ''}
            </li>
          ))}
        </ul>
      )}

      <p style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
        For the kitchen / dietician — please honour the diet types listed above
        for each meal. Confirm any changes with the attending doctor before
        modifying the patient&apos;s diet plan.
      </p>

      <Signatures
        left="Dietitian / Nurse"
        right={`Dr. ${doctorName}${specialization ? `\n${specialization}` : ''}`}
      />
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
