/**
 * Printable IPD Bill (Final Settlement) — /print/ipd-bill/[id]
 *
 * Server component. Fetches the IPD admission + its (optional) bill +
 * patient + bed/ward + attending doctor + hospital directly from the
 * database. Authorization:
 *   - Admin (any role === 'admin')
 *   - Doctor who is the attending physician (admission.attendingDoctor.userId === user.id)
 *   - Patient who owns the admission (admission.userId === user.id)
 *   - Receptionist/Hospital staff of the owning hospital
 *
 * Auth uses the `doctorooms_session` cookie (server-component friendly).
 *
 * [id] URL param = IpdAdmission.id (the admission id, NOT the bill id).
 * The bill is loaded via the `admission.bill` relation — if the bill
 * hasn't been generated yet, the page falls back to a notice view that
 * still shows the admission's bed / doctor / dates. This mirrors the
 * spec's explicit instruction to fetch via `db.ipdAdmission.findUnique`.
 */

import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { Fragment } from 'react'
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
  title: 'IPD Bill — Print',
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

export default async function PrintIpdBillPage({ params }: PageProps) {
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

  // ─── Fetch IPD admission + its bill ─────────────────────────────────
  // NOTE: The spec called the bill's line-items relation `bill.charges`,
  // but the actual Prisma relation name is `bill.lineItems`. We use the
  // correct schema field name here. BillLineItem also has no `createdAt`
  // column (only `date`), so we order by `date: 'asc'`.
  // NOTE: Doctor has no direct `hospital` relation (only `hospitalId`)
  // and no `name` field — the doctor's display name lives on
  // `doctor.user.name`. The admission itself carries the `hospital`
  // relation, which we use for the letterhead (no need for
  // `doctor.hospital`).
  const admission = await db.ipdAdmission.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, mobileNo: true } },
      bed: { include: { ward: true } },
      attendingDoctor: {
        select: {
          id: true,
          userId: true,
          specialization: true,
          user: { select: { id: true, name: true } },
        },
      },
      hospital: true,
      bill: {
        include: {
          lineItems: {
            include: {
              chargeItem: { include: { category: true } },
            },
            orderBy: { date: 'asc' },
          },
          payments: { orderBy: { createdAt: 'desc' } },
        },
      },
    },
  })

  if (!admission) {
    return <AuthError message="IPD admission not found." />
  }

  // ─── Authorization ──────────────────────────────────────────────────
  const isAdmin = user.role === 'admin'
  const isOwningPatient =
    admission.userId != null && admission.userId === user.id

  let isAttendingDoctor = false
  if (!isAdmin && !isOwningPatient && user.role === 'doctor') {
    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    isAttendingDoctor =
      !!doctor && admission.attendingDoctorId === doctor.id
  }

  let isBillingRole = false
  if (!isAdmin && !isOwningPatient && !isAttendingDoctor) {
    if (user.role === 'hospital') {
      const h = await db.hospital.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      isBillingRole = !!h && h.id === admission.hospitalId
    } else if (user.role === 'receptionist') {
      const r = await db.receptionist.findUnique({
        where: { userId: user.id },
        select: { hospitalId: true },
      })
      isBillingRole = !!r && r.hospitalId === admission.hospitalId
    }
  }

  if (!isAdmin && !isOwningPatient && !isAttendingDoctor && !isBillingRole) {
    return (
      <AuthError message="Forbidden — you do not have access to this bill." />
    )
  }

  // ─── Build letterhead from admission.hospital ──────────────────────
  // NOTE: Hospital model has no `gstNo` field — GST row in footer is
  // skipped automatically by PrintLayout when gstNo is undefined.
  const h = admission.hospital
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

  // ─── Doctor display name ───────────────────────────────────────────
  const docUser = admission.attendingDoctor?.user
  const doctorName = docUser?.name ? `Dr. ${docUser.name}` : '—'
  const doctorSpec = admission.attendingDoctor?.specialization
  const doctorLabel = doctorSpec
    ? `${doctorName}  •  ${doctorSpec}`
    : doctorName

  // ─── Bed + Ward label ──────────────────────────────────────────────
  const bed = admission.bed
  const bedLabel = bed
    ? `${bed.bedNumber || '—'}${bed.ward?.name ? '  •  ' + bed.ward.name : ''}${
        bed.ward?.wardType ? ' (' + bed.ward.wardType + ')' : ''
      }`
    : '—'

  // ─── Patient info rows ─────────────────────────────────────────────
  const patientRows = [
    { label: 'Patient Name', value: admission.patientName || '—' },
    {
      label: 'Age',
      value: admission.patientAge
        ? `${admission.patientAge} yrs`
        : '—',
    },
    { label: 'Gender', value: admission.patientGender || '—' },
    { label: 'IPD No', value: admission.admissionNo || '—' },
    { label: 'Bed / Ward', value: bedLabel },
    { label: 'Doctor', value: doctorLabel },
    {
      label: 'Admission Date',
      value: formatDateTime(admission.admissionDate),
    },
    {
      label: 'Discharge Date',
      value: admission.dischargeDate
        ? formatDateTime(admission.dischargeDate)
        : '—',
    },
  ]

  // ─── DEVIATION FALLBACK: no bill generated yet ─────────────────────
  const bill = admission.bill
  if (!bill) {
    return (
      <PrintLayout
        letterhead={letterhead}
        title="IPD BILL"
        docNo={admission.admissionNo}
        date={admission.admissionDate}
      >
        <SectionTitle>Patient Information</SectionTitle>
        <InfoGrid rows={patientRows} />

        <div
          style={{
            margin: '24px 0',
            padding: '20px',
            textAlign: 'center',
            background: '#fef3c7',
            color: '#92400e',
            border: '1px dashed #92400e',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Bill not yet generated for this admission.
          <div style={{ marginTop: '6px', fontWeight: 400, fontSize: '11px' }}>
            Estimated amount: {formatINR(admission.estimatedBill)}  •  Advance
            paid: {formatINR(admission.advanceAmount)}  •  Status:{' '}
            {admission.paymentStatus || 'Pending'}
          </div>
        </div>

        <Signatures left="Patient / Attendant" right="Authorized Signatory" />
      </PrintLayout>
    )
  }

  // ─── Group bill line items by category ────────────────────────────
  // Each line item has an optional `chargeItem` → `category` (ChargeCategory).
  // We group by category.name (falling back to "Other" for ad-hoc items).
  // Room Rent is a separate virtual amount on the bill itself — render
  // it first under its own "Room Rent" category.
  type GroupedItem = {
    sno: number
    description: string
    qty: number
    rate: number
    amount: number
  }
  const grouped: Record<string, GroupedItem[]> = {}
  let sno = 1

  if (bill.roomRentAmount > 0) {
    const catName = 'Room Rent'
    grouped[catName] = []
    const days = admission.roomRentDays || 1
    grouped[catName].push({
      sno: sno++,
      description: `Room Rent (${days} day${days > 1 ? 's' : ''})`,
      qty: days,
      rate: bill.roomRentAmount / days,
      amount: bill.roomRentAmount,
    })
  }

  for (const li of bill.lineItems) {
    const catName = li.chargeItem?.category?.name || 'Other Charges'
    if (!grouped[catName]) grouped[catName] = []
    grouped[catName].push({
      sno: sno++,
      description:
        li.chargeItem?.name || li.itemName || 'Charge',
      qty: li.quantity,
      rate: li.rate,
      amount: li.amount,
    })
  }

  // ─── Status badge ──────────────────────────────────────────────────
  const status = bill.status || 'Draft'
  const sc = statusColor(status)

  // ─── Advances ──────────────────────────────────────────────────────
  // IpdBill has `advanceAdjusted` (Float) — that's the amount rolled into
  // this settlement. Admission also has `advanceAmount` (Float, total
  // advances collected). We show whichever is > 0.
  const advanceUsed =
    bill.advanceAdjusted > 0
      ? bill.advanceAdjusted
      : admission.advanceAmount || 0

  // ─── Last payment record (for reference) ───────────────────────────
  const lastPayment = bill.payments[0]

  return (
    <PrintLayout
      letterhead={letterhead}
      title="FINAL SETTLEMENT"
      docNo={bill.billNo}
      date={bill.finalizedAt || bill.generatedAt || bill.createdAt}
    >
      {/* Patient Information */}
      <SectionTitle>Patient Information</SectionTitle>
      <InfoGrid rows={patientRows} />

      {/* Itemized Charges */}
      <SectionTitle>Itemized Charges</SectionTitle>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}
      >
        <thead>
          <tr>
            <th style={itemHeaderCellStyle} colSpan={1}>
              S.No
            </th>
            <th style={{ ...itemHeaderCellStyle, width: '150px' }}>
              Charge Category
            </th>
            <th style={itemHeaderCellStyle}>Charge Item</th>
            <th style={{ ...itemHeaderCellStyle, width: '60px', textAlign: 'center' }}>
              Qty
            </th>
            <th style={{ ...itemHeaderCellStyle, width: '110px', textAlign: 'right' }}>
              Rate
            </th>
            <th style={{ ...itemHeaderCellStyle, width: '110px', textAlign: 'right' }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([catName, items]) => {
            const catSubtotal = items.reduce((s, i) => s + i.amount, 0)
            return (
              <Fragment key={catName}>
                {items.map((it, idx) => (
                  <tr key={`${catName}-${idx}`} style={{ pageBreakInside: 'avoid' }}>
                    <td style={itemCellStyle}>{it.sno}</td>
                    <td style={itemCellStyle}>
                      {idx === 0 ? <strong>{catName}</strong> : ''}
                    </td>
                    <td style={{ ...itemCellStyle, fontWeight: 500 }}>
                      {it.description}
                    </td>
                    <td style={{ ...itemCellStyle, textAlign: 'center' }}>
                      {it.qty}
                    </td>
                    <td style={{ ...itemCellStyle, textAlign: 'right' }}>
                      {formatINR(it.rate)}
                    </td>
                    <td style={{ ...itemCellStyle, textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(it.amount)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc' }}>
                  <td style={subtotalCellStyle} colSpan={5}>
                    Subtotal — {catName}
                  </td>
                  <td style={{ ...subtotalCellStyle, textAlign: 'right' }}>
                    {formatINR(catSubtotal)}
                  </td>
                </tr>
              </Fragment>
            )
          })}
          {Object.keys(grouped).length === 0 && (
            <tr>
              <td style={itemCellStyle} colSpan={6}>
                No charge items recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Grand Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <table style={{ width: '340px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={summaryCellStyle}>Total Charges</td>
              <td style={{ ...summaryCellStyle, textAlign: 'right' }}>
                {formatINR(bill.totalAmount)}
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
            {advanceUsed > 0 && (
              <tr>
                <td style={summaryCellStyle}>Advance Paid</td>
                <td style={{ ...summaryCellStyle, textAlign: 'right' }}>
                  − {formatINR(advanceUsed)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #000' }}>
              <td style={{ ...summaryCellStyle, paddingTop: '6px', fontWeight: 700 }}>
                Net Payable
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
                {formatINR(bill.netPayable)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status + meta */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >
        <div style={{ fontSize: '11px', color: '#475569' }}>
          Bill Generated: {bill.generatedAt ? formatDate(bill.generatedAt) : '—'}
          {bill.finalizedAt && (
            <span>  •  Finalized: {formatDate(bill.finalizedAt)}</span>
          )}
          {lastPayment && (
            <span>
              {' '}
              •  Last Payment: {formatINR(lastPayment.amount)} via{' '}
              {lastPayment.paymentMethod}
              {lastPayment.paymentDate
                ? ` on ${formatDate(lastPayment.paymentDate)}`
                : ''}
            </span>
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
      <Signatures left="Patient / Attendant" right="Authorized Signatory" />
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

const subtotalCellStyle: CSSProperties = {
  padding: '6px 8px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  border: '1px solid #cbd5e1',
  textAlign: 'right',
}

const summaryCellStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  color: '#000',
  border: 'none',
}
