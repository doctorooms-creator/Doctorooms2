/**
 * Printable Prescription — /print/prescription/[id]
 *
 * Server component. Fetches the prescription + booking + doctor + medicines +
 * labels + suggestions directly from the database (bypassing API routes for
 * print simplicity). Authorization:
 *   - Admin (any role === 'admin')
 *   - Doctor who owns the prescription (prescription.doctor.userId === user.id)
 *   - Patient who owns the booking (prescription.booking.userId === user.id)
 *
 * Auth uses the `doctorooms_session` cookie (server-component friendly) —
 * no NextRequest construction required.
 */

import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import {
  PrintLayout,
  InfoGrid,
  SectionTitle,
  Signatures,
} from '@/components/print/print-layout'
import { formatDate, makeReceiptNo } from '@/lib/print-utils'
import { verifyJwt, verifySession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Prescription — Print',
}

interface PageProps {
  params: Promise<{ id: string }>
}

function AuthError({ message }: { message: string }) {
  return (
    <div className="print-area">
      <div className="p-8 text-center text-rose-600">{message}</div>
    </div>
  )
}

export default async function PrintPrescriptionPage({ params }: PageProps) {
  const { id } = await params

  // ─── Auth via cookies (server component pattern) ────────────────────
  // The doctorooms_session cookie is a JWT carrying { userId, role, token }.
  // We verify the JWT signature, then look up the underlying DB session by
  // its `token` field — that also enforces revocation + expiry + Active status.
  const cookieStore = await cookies()
  const sessionJwt = cookieStore.get('doctorooms_session')?.value
  if (!sessionJwt) {
    return <AuthError message="Unauthorized. Please log in." />
  }
  const jwtPayload = verifyJwt(sessionJwt)
  if (!jwtPayload?.sessionToken) {
    return <AuthError message="Unauthorized. Please log in." />
  }
  const sessionInfo = await verifySession(jwtPayload.sessionToken)
  if (!sessionInfo?.user) {
    return <AuthError message="Unauthorized. Please log in." />
  }
  const user = sessionInfo.user

  // ─── Fetch prescription + all print-relevant relations ──────────────
  const prescription = await db.prescription.findUnique({
    where: { id },
    include: {
      booking: true,
      doctor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobileNo: true,
            },
          },
          otherSettings: true,
        },
      },
      medicines: { orderBy: { createdAt: 'asc' } },
      labels: { orderBy: { createdAt: 'asc' } },
      suggestions: { orderBy: { createdAt: 'asc' } },
      assistant: {
        select: { id: true, name: true, mobileNo: true },
      },
    },
  })

  if (!prescription) {
    return <AuthError message="Prescription not found." />
  }

  // ─── Authorization ──────────────────────────────────────────────────
  const isAdmin = user.role === 'admin'
  const isOwningDoctor = prescription.doctor.userId === user.id
  const isOwningPatient = !!prescription.booking?.userId && prescription.booking.userId === user.id
  if (!isAdmin && !isOwningDoctor && !isOwningPatient) {
    return (
      <AuthError message="Forbidden — you do not have access to this prescription." />
    )
  }

  // ─── Build letterhead ───────────────────────────────────────────────
  // Honors the doctor's Print Settings (POtherSetting):
  //   • isFullHeader + fullHeader is an image URL  → letterhead = <img> only
  //   • isFullHeader + fullHeader is text           → letterhead name = first line,
  //                                                  subtitle = remaining lines
  //   • isFullHeader false + header non-empty      → letterhead name = first line,
  //                                                  subtitle = remaining lines,
  //                                                  logo from `logo` field
  //   • otherwise                                  → auto-generated from doctor
  //                                                  profile + hospital info
  // ────────────────────────────────────────────────────────────────────────
  const doc = prescription.doctor
  const docUser = doc.user
  const otherSettings = doc.otherSettings

  const isImageUrl = (s: string | undefined | null): boolean => {
    if (!s) return false
    return /^(https?:\/\/|\/[^/\s]+|data:image\/)/i.test(s.trim())
  }
  const splitLines = (s: string): string[] =>
    (s || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  let letterhead: {
    name: string
    subtitle?: string
    address?: string
    contact?: string
    logoUrl?: string
    registrationNo?: string
  }

  // Hospital info (still used for fallback auto-generated letterhead)
  const hospital = prescription.doctor.hospitalId
    ? await db.hospital.findUnique({
        where: { id: prescription.doctor.hospitalId },
      })
    : null

  if (otherSettings?.isFullHeader && otherSettings.fullHeader) {
    if (isImageUrl(otherSettings.fullHeader)) {
      // Mode 1A: Doctor provided a full letterhead image — render as <img> only.
      letterhead = {
        name: '',
        logoUrl: otherSettings.fullHeader,
      }
    } else {
      // Mode 1B: Doctor typed a multi-line custom header.
      const lines = splitLines(otherSettings.fullHeader)
      letterhead = {
        name: lines[0] || `Dr. ${docUser.name}`,
        subtitle: lines.length > 1 ? lines.slice(1).join(' • ') : undefined,
        address: undefined,
        contact: undefined,
        logoUrl: undefined,
        registrationNo: doc.registrationDetail || undefined,
      }
    }
  } else if (otherSettings && otherSettings.header && otherSettings.header.trim()) {
    // Mode 2: Standard mode + doctor-supplied custom header text.
    const lines = splitLines(otherSettings.header)
    letterhead = {
      name: lines[0] || `Dr. ${docUser.name}`,
      subtitle: lines.length > 1 ? lines.slice(1).join(' • ') : undefined,
      address: undefined,
      contact: undefined,
      logoUrl: otherSettings.logo || hospital?.image || undefined,
      registrationNo: doc.registrationDetail || undefined,
    }
  } else {
    // Mode 3: Auto-generate letterhead from doctor profile + hospital.
    const letterheadName = hospital?.hospitalName || `Dr. ${docUser.name}`
    const specializationBits = [doc.specialization, doc.education].filter(Boolean)
    const letterheadSubtitle = specializationBits.join(' • ') || undefined

    const addressLines: string[] = []
    if (hospital?.address) addressLines.push(hospital.address)
    else if (doc.hospitalAddress) addressLines.push(doc.hospitalAddress)
    else if (doc.address) addressLines.push(doc.address)
    const cityState = [hospital?.city || doc.city, hospital?.state || doc.state]
      .filter(Boolean)
      .join(', ')
    if (cityState) addressLines.push(cityState)
    if (hospital?.pincode) addressLines.push(hospital.pincode)
    const letterheadAddress = addressLines.length > 0 ? addressLines.join('\n') : undefined

    const contactBits = [
      hospital?.contactNo || doc.contactNo || doc.phoneNo || docUser.mobileNo || '',
      hospital?.email,
      hospital?.website,
    ].filter(Boolean)
    const letterheadContact = contactBits.length > 0 ? contactBits.join('  •  ') : undefined

    letterhead = {
      name: letterheadName,
      subtitle: letterheadSubtitle,
      address: letterheadAddress,
      contact: letterheadContact,
      logoUrl: otherSettings?.logo || hospital?.image || undefined,
      registrationNo: doc.registrationDetail || undefined,
    }
  }

  // ─── Patient info grid ──────────────────────────────────────────────
  const booking = prescription.booking
  const patientRows = [
    {
      label: 'Patient Name',
      value: prescription.patientName || booking?.patientName || '',
    },
    {
      label: 'Age',
      value: booking?.age
        ? `${booking.age} yrs`
        : prescription.patientAge || '',
    },
    { label: 'Gender', value: booking?.gender || '' },
    { label: 'Blood Group', value: booking?.bloodGroup || '' },
    {
      label: 'Weight',
      value: prescription.weight || (booking?.weight ? `${booking.weight} kg` : ''),
    },
    { label: 'BP', value: prescription.bp || '' },
    { label: 'Temperature', value: prescription.temperature || '' },
    {
      label: 'Appointment Date',
      value: formatDate(booking?.bookingDate),
    },
    { label: 'Time Slot', value: booking?.timeSlot || '' },
  ]

  const docNo = makeReceiptNo('RX', prescription.id)

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <PrintLayout
      letterhead={letterhead}
      title="PRESCRIPTION"
      docNo={docNo}
      date={prescription.createdAt}
    >
      {/* Patient Information */}
      <SectionTitle>Patient Information</SectionTitle>
      <InfoGrid rows={patientRows} />

      {/* Chief Complaints / Diagnosis */}
      {(prescription.disease || prescription.description) && (
        <>
          <SectionTitle>Chief Complaints &amp; Diagnosis</SectionTitle>
          {prescription.disease && (
            <p style={{ fontSize: '11px', margin: '4px 0 8px', color: '#000' }}>
              <strong>Complaint / Disease:</strong> {prescription.disease}
            </p>
          )}
          {prescription.description && (
            <p style={{ fontSize: '11px', margin: '4px 0 8px', color: '#000' }}>
              <strong>Clinical Notes:</strong> {prescription.description}
            </p>
          )}
        </>
      )}

      {/* Vitals / Investigation Labels */}
      {prescription.labels.length > 0 && (
        <>
          <SectionTitle>Vitals &amp; Investigation Labels</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
            <thead>
              <tr>
                <th style={labelHeaderCellStyle}>Label</th>
                <th style={labelHeaderCellStyle}>Value</th>
                <th style={labelHeaderCellStyle}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {prescription.labels.map((l) => (
                <tr key={l.id}>
                  <td style={labelCellStyle}>{l.labelEn || l.label}</td>
                  <td style={{ ...labelCellStyle, fontWeight: 600 }}>{l.value || '—'}</td>
                  <td style={labelCellStyle}>{l.showUnit ? l.labelUnit : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Medicines (Rx) */}
      {prescription.medicines.length > 0 && (
        <>
          <SectionTitle>Medicines (℞)</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
            <thead>
              <tr>
                <th style={medHeaderCellStyle}>S.No</th>
                <th style={medHeaderCellStyle}>Medicine</th>
                <th style={medHeaderCellStyle}>Morning</th>
                <th style={medHeaderCellStyle}>Afternoon</th>
                <th style={medHeaderCellStyle}>Evening</th>
                <th style={medHeaderCellStyle}>Tab</th>
                <th style={medHeaderCellStyle}>Dose</th>
                <th style={medHeaderCellStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((m, idx) => {
                // Dose may be a JSON array string (from DoctorMedicine.dose) — pick first.
                let doseStr = m.dose || ''
                try {
                  const parsed = JSON.parse(m.dose)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    doseStr = String(parsed[0] ?? '')
                  }
                } catch {
                  // dose is already a plain string — keep as-is.
                }
                return (
                  <tr key={m.id} style={{ pageBreakInside: 'avoid' }}>
                    <td style={medCellStyle}>{idx + 1}</td>
                    <td style={{ ...medCellStyle, fontWeight: 600 }}>{m.medicine}</td>
                    <td style={medCellStyle}>{m.morning ? `${m.morning}` : '—'}</td>
                    <td style={medCellStyle}>{m.afternoon ? `${m.afternoon}` : '—'}</td>
                    <td style={medCellStyle}>{m.evening ? `${m.evening}` : '—'}</td>
                    <td style={medCellStyle}>{m.tab}</td>
                    <td style={medCellStyle}>{doseStr || '—'}</td>
                    <td style={medCellStyle}>{m.description || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {/* Advice / Suggestions */}
      {prescription.suggestions.length > 0 && (
        <>
          <SectionTitle>Advice / Suggestions</SectionTitle>
          <ol style={{ margin: '4px 0 12px', paddingLeft: '20px', fontSize: '11px', color: '#000' }}>
            {prescription.suggestions.map((s) => (
              <li key={s.id} style={{ marginBottom: '6px', pageBreakInside: 'avoid' }}>
                <strong>{s.questionEn || s.question}</strong>
                {s.suggestions && (
                  <span style={{ color: '#475569' }}> — {s.suggestions}</span>
                )}
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Follow-up */}
      {prescription.nextVisit && (
        <>
          <SectionTitle>Follow-up</SectionTitle>
          <p style={{ fontSize: '11px', margin: '4px 0 12px', color: '#000' }}>
            <strong>Next visit:</strong> {formatDate(prescription.nextVisit)}
          </p>
        </>
      )}

      {/* Assistant attribution */}
      {prescription.assistant && (
        <p style={{ fontSize: '10px', margin: '12px 0 0', color: '#64748b' }}>
          Prepared by assistant: {prescription.assistant.name}
        </p>
      )}

      {/* Signatures */}
      <Signatures
        left="Patient / Attendant"
        right={
          docUser.name
            ? `Dr. ${docUser.name}${
                doc.specialization ? '  •  ' + doc.specialization : ''
              }${doc.registrationDetail ? '  •  Reg: ' + doc.registrationDetail : ''}`
            : 'Doctor'
        }
      />
    </PrintLayout>
  )
}

// ─── Shared inline styles (print-safe — inline styles survive the
//     print stylesheet's body * { visibility: hidden } rule, while
//     Tailwind classes don't always survive) ────────────────────────────

const labelHeaderCellStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  textAlign: 'left',
}

const labelCellStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  color: '#000',
  border: '1px solid #cbd5e1',
  textAlign: 'left',
}

const medHeaderCellStyle: CSSProperties = {
  padding: '4px 6px',
  fontSize: '10px',
  fontWeight: 600,
  color: '#0d9488',
  border: '1px solid #0d9488',
  background: '#f0fdfa',
  textAlign: 'center',
}

const medCellStyle: CSSProperties = {
  padding: '4px 6px',
  fontSize: '10px',
  color: '#000',
  border: '1px solid #cbd5e1',
  textAlign: 'center',
}
