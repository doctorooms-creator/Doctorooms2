/**
 * Printable OPD Bill — /print/opd-bill/[id]
 *
 * Server component. Fetches the OPD bill + booking + doctor + hospital
 * directly from the database. Authorization:
 *   - Admin (any role === 'admin')
 *   - Doctor who owns the bill (bill.booking.doctor.userId === user.id)
 *   - Patient who owns the booking (bill.booking.userId === user.id
 *     OR bill.patientId === user.id)
 *   - Receptionist/Hospital staff of the owning hospital
 *
 * Auth uses the `doctorooms_session` cookie (server-component friendly).
 * [id] URL param = OpdBill.id.
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
import { formatINR, formatDateTime, formatDate, statusColor } from '@/lib/print-utils'

export const metadata: Metadata = {
  title: 'OPD Bill — Print',
}

export const dynamic = 'force-dynamic'

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

export default async function PrintOpdBillPage({ params }: PageProps) {
  const { id } = await params

  // ─── Auth via cookies (server component pattern) ────────────────────
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('doctorooms_session')?.value
  if (!sessionId) {
    return <AuthError message="Unauthorized. Please log in." />
  }
  const user = await db.user.findUnique({ where: { id: sessionId } })
  if (!user || user.status !== 'Active') {
    return <AuthError message="Unauthorized. Please log in." />
  }

  // ─── Fetch OPD bill + booking + doctor + hospital ──────────────────
  // Note: Doctor has no `name` field — the doctor's display name lives
  // on the related User record (`doctor.user.name`). Similarly,
  // `specialization` (not `speciality`) is the Doctor column.
  const bill = await db.opdBill.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          id: true,
          appointmentNo: true,
          patientName: true,
          age: true,
          gender: true,
          disease: true,
          bookingDate: true,
          timeSlot: true,
          status: true,
          userId: true,
          doctorId: true,
          doctor: {
            select: {
              id: true,
              userId: true,
              specialization: true,
              user: { select: { id: true, name: true } },
            },
          },
          user: { select: { id: true, name: true, mobileNo: true } },
        },
      },
      hospital: true,
      patient: { select: { id: true, name: true, mobileNo: true } },
    },
  })

  if (!bill) {
    return <AuthError message="OPD bill not found." />
  }

  // ─── Authorization ──────────────────────────────────────────────────
  const isAdmin = user.role === 'admin'
  const isOwningPatient =
    (bill.patientId != null && bill.patientId === user.id) ||
    (bill.booking.userId != null && bill.booking.userId === user.id)

  let isOwningDoctor = false
  if (!isAdmin && !isOwningPatient && user.role === 'doctor') {
    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    isOwningDoctor =
      !!doctor && bill.booking.doctorId === doctor.id
  }

  let isBillingRole = false
  if (!isAdmin && !isOwningPatient && !isOwningDoctor) {
    if (user.role === 'hospital') {
      const h = await db.hospital.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      isBillingRole = !!h && h.id === bill.hospitalId
    } else if (user.role === 'receptionist') {
      const r = await db.receptionist.findUnique({
        where: { userId: user.id },
        select: { hospitalId: true },
      })
      isBillingRole = !!r && r.hospitalId === bill.hospitalId
    }
  }

  if (!isAdmin && !isOwningPatient && !isOwningDoctor && !isBillingRole) {
    return (
      <AuthError message="Forbidden — you do not have access to this bill." />
    )
  }

  // ─── Build letterhead from hospital ─────────────────────────────────
  // NOTE: Hospital model has no `gstNo` field — GST row in footer is
  // skipped automatically by PrintLayout when gstNo is undefined.
  const h = bill.hospital
  const addressBits = [h.address, h.city, h.state, h.pincode].filter(Boolean)
  const contactBits = [h.contactNo, h.email, h.website].filter(Boolean)
  const letterhead = {
    name: h.hospitalName || 'Hospital',
    subtitle:
      h.hospitalType && h.hospitalType !== 'Multi-Specialty'
        ? h.hospitalType
        : h.accreditation || undefined,
    address: addressBits.length > 0 ? addressBits.join(', ') : undefined,
    contact: contactBits.length > 0 ? contactBits.join('  •  ') : undefined,
    logoUrl: h.image || undefined,
  }

  // ─── Build line items from bill amount fields ──────────────────────
  // OpdBill has no `lineItems` relation — amounts are stored as
  // flat fields (consultationFee, labAmount, medicineAmount, otherAmount).
  // We render one row per non-zero amount.
  type Item = {
    sno: number
    description: string
    qty: number
    rate: number
    amount: number
  }
  const items: Item[] = []
  let sno = 1
  if (bill.consultationFee > 0) {
    items.push({
      sno: sno++,
      description: 'Consultation Fee',
      qty: 1,
      rate: bill.consultationFee,
      amount: bill.consultationFee,
    })
  }
  if (bill.labAmount > 0) {
    items.push({
      sno: sno++,
      description: 'Laboratory Charges',
      qty: 1,
      rate: bill.labAmount,
      amount: bill.labAmount,
    })
  }
  if (bill.medicineAmount > 0) {
    items.push({
      sno: sno++,
      description: 'Medicine Charges',
      qty: 1,
      rate: bill.medicineAmount,
      amount: bill.medicineAmount,
    })
  }
  if (bill.otherAmount > 0) {
    items.push({
      sno: sno++,
      description: 'Other Charges',
      qty: 1,
      rate: bill.otherAmount,
      amount: bill.otherAmount,
    })
  }
  // If all amounts are zero (edge case), still show one zero row so the
  // table isn't empty.
  if (items.length === 0) {
    items.push({
      sno: 1,
      description: 'Consultation Fee',
      qty: 1,
      rate: 0,
      amount: 0,
    })
  }

  // ─── Doctor display name ───────────────────────────────────────────
  const doctorUser = bill.booking.doctor?.user
  const doctorName = doctorUser?.name ? `Dr. ${doctorUser.name}` : '—'
  const doctorSpec = bill.booking.doctor?.specialization
  const doctorLabel = doctorSpec ? `${doctorName}  •  ${doctorSpec}` : doctorName

  // ─── Payment status badge ──────────────────────────────────────────
  const status = bill.status || 'Paid'
  const sc = statusColor(status)

  // ─── Visit date label ──────────────────────────────────────────────
  const visitDate = bill.booking.bookingDate
    ? `${formatDate(bill.booking.bookingDate)}${
        bill.booking.timeSlot ? '  •  ' + bill.booking.timeSlot : ''
      }`
    : '—'

  // ─── Patient info rows ─────────────────────────────────────────────
  const patientRows = [
    { label: 'Patient Name', value: bill.booking.patientName || '—' },
    {
      label: 'Age',
      value: bill.booking.age != null ? `${bill.booking.age} yrs` : '—',
    },
    { label: 'Gender', value: bill.booking.gender || '—' },
    { label: 'Doctor', value: doctorLabel },
    { label: 'Booking No', value: bill.booking.appointmentNo || '—' },
    { label: 'Visit Date', value: visitDate },
  ]

  return (
    <PrintLayout
      letterhead={letterhead}
      title="OPD BILL"
      docNo={bill.receiptNo}
      date={bill.paymentDate}
    >
      {/* Patient Information */}
      <SectionTitle>Patient Information</SectionTitle>
      <InfoGrid rows={patientRows} />

      {/* Service Items */}
      <SectionTitle>Service Items</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            <th style={itemHeaderCellStyle}>S.No</th>
            <th style={itemHeaderCellStyle}>Description</th>
            <th style={{ ...itemHeaderCellStyle, width: '60px', textAlign: 'center' }}>Qty</th>
            <th style={{ ...itemHeaderCellStyle, width: '110px', textAlign: 'right' }}>Rate</th>
            <th style={{ ...itemHeaderCellStyle, width: '110px', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.sno} style={{ pageBreakInside: 'avoid' }}>
              <td style={itemCellStyle}>{it.sno}</td>
              <td style={{ ...itemCellStyle, fontWeight: 500 }}>{it.description}</td>
              <td style={{ ...itemCellStyle, textAlign: 'center' }}>{it.qty}</td>
              <td style={{ ...itemCellStyle, textAlign: 'right' }}>{formatINR(it.rate)}</td>
              <td style={{ ...itemCellStyle, textAlign: 'right', fontWeight: 600 }}>
                {formatINR(it.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <table style={{ width: '320px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={summaryCellStyle}>Sub Total</td>
              <td style={{ ...summaryCellStyle, textAlign: 'right' }}>
                {formatINR(bill.subtotal)}
              </td>
            </tr>
            {bill.discountAmount > 0 && (
              <tr>
                <td style={summaryCellStyle}>Discount</td>
                <td style={{ ...summaryCellStyle, textAlign: 'right' }}>
                  − {formatINR(bill.discountAmount)}
                </td>
              </tr>
            )}
            {bill.taxAmount > 0 && (
              <tr>
                <td style={summaryCellStyle}>Tax</td>
                <td style={{ ...summaryCellStyle, textAlign: 'right' }}>
                  {formatINR(bill.taxAmount)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #000' }}>
              <td style={{ ...summaryCellStyle, paddingTop: '6px', fontWeight: 700 }}>
                Net Amount
              </td>
              <td
                style={{
                  ...summaryCellStyle,
                  paddingTop: '6px',
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {formatINR(bill.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment status + payment method */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >
        <div style={{ fontSize: '11px', color: '#475569' }}>
          Payment Method: <strong>{bill.paymentMethod || 'Cash'}</strong>
          {bill.paymentRef && <span>  •  Ref: {bill.paymentRef}</span>}
          {bill.paymentDate && (
            <span>  •  Paid: {formatDateTime(bill.paymentDate)}</span>
          )}
        </div>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '4px',
            background: sc.bg,
            color: sc.text,
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.5px',
          }}
        >
          {status.toUpperCase()}
        </div>
      </div>

      {/* Signatures */}
      <Signatures left="Patient Signature" right="Authorized Signatory" />
    </PrintLayout>
  )
}

// ─── Shared inline styles (print-safe — inline styles survive the
//     print stylesheet's body * { visibility: hidden } rule, while
//     Tailwind classes don't always survive) ────────────────────────────

const itemHeaderCellStyle: CSSProperties = {
  padding: '6px 8px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#0d9488',
  border: '1px solid #0d9488',
  background: '#f0fdfa',
  textAlign: 'left',
}

const itemCellStyle: CSSProperties = {
  padding: '6px 8px',
  fontSize: '11px',
  color: '#000',
  border: '1px solid #cbd5e1',
  textAlign: 'left',
}

const summaryCellStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  color: '#000',
  border: 'none',
}
