/**
 * Printable Lab Report — /print/lab-report/[id]
 *
 * Server component. The `[id]` is an ExternalTestOrder id. We fetch the
 * order with its lab partner / patient / doctor / booking, then pick the
 * latest LabReportUpload if one exists.
 *
 * Authorization:
 *   - Admin
 *   - Doctor who ordered the test (externalOrder.doctor.userId === user.id)
 *   - Patient who owns the test (externalOrder.patientId === user.id)
 *   - Lab Technician who owns the lab partner (externalOrder.labPartner.userId === user.id)
 *
 * If no report upload exists yet (order is Ordered/InProgress), we render
 * a "Report not yet uploaded" notice instead of the full report.
 *
 * The test fee + commission section is hidden from patients — only shown
 * to admin / doctor / lab technician viewers.
 *
 * Auth uses the `doctorooms_session` cookie (server-component friendly).
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
import {
  formatINR,
  formatDateTime,
  formatDate,
  makeReceiptNo,
} from '@/lib/print-utils'

export const metadata: Metadata = {
  title: 'Lab Report — Print',
}

interface PageProps {
  params: Promise<{ id: string }>
}

interface ReportParameter {
  param?: string
  value?: string
  unit?: string
  normal?: string
  abnormal?: boolean
  // tolerate extra keys gracefully
  [key: string]: unknown
}

function AuthError({ message }: { message: string }) {
  return (
    <div className="print-area">
      <div className="p-8 text-center text-rose-600">{message}</div>
    </div>
  )
}

export default async function PrintLabReportPage({ params }: PageProps) {
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

  // ─── Fetch the order + all relations ─────────────────────────────────
  // The route param is the ExternalTestOrder id. We pick the most recent
  // reportUploads entry if any (an order may have multiple uploads over time).
  const order = await db.externalTestOrder.findUnique({
    where: { id },
    include: {
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
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
          gender: true,
          mobileNo: true,
          email: true,
        },
      },
      labPartner: true,
      booking: true,
      reportUploads: {
        orderBy: { uploadedAt: 'desc' },
        take: 1,
      },
      billing: true,
    },
  })

  if (!order) {
    return <AuthError message="Lab order not found." />
  }

  // ─── Authorization ──────────────────────────────────────────────────
  const isAdmin = user.role === 'admin'
  const isOwningDoctor = order.doctor.userId === user.id
  const isOwningPatient = order.patientId === user.id
  const isOwningLabTech = order.labPartner.userId === user.id
  if (!isAdmin && !isOwningDoctor && !isOwningPatient && !isOwningLabTech) {
    return <AuthError message="Forbidden — you do not have access to this lab report." />
  }

  const upload = order.reportUploads[0] || null

  // ─── Commission % from the doctor-lab association (the order model
  //     itself doesn't store it). Used in the billing section. ─────────
  const association = await db.doctorLabAssociation.findUnique({
    where: {
      doctorId_labPartnerId: {
        doctorId: order.doctorId,
        labPartnerId: order.labPartnerId,
      },
    },
    select: { commissionPercent: true, isActive: true },
  })

  // ─── Resolve "uploaded by" name (upload.uploadedBy is a User id) ────
  let uploadedByName = ''
  if (upload) {
    const uploader = await db.user.findUnique({
      where: { id: upload.uploadedBy },
      select: { name: true },
    })
    uploadedByName = uploader?.name || ''
  }

  // ─── Letterhead — lab partner ───────────────────────────────────────
  const lab = order.labPartner
  const labAddressLines = [
    lab.address,
    [lab.city, lab.state].filter(Boolean).join(', '),
    lab.pincode,
  ].filter(Boolean)
  const labContactBits = [
    lab.mobile,
    lab.altMobile,
    lab.email,
  ].filter(Boolean)

  const letterhead = {
    name: lab.labName,
    subtitle: lab.ownerName ? `Owner: ${lab.ownerName}` : undefined,
    address: labAddressLines.length > 0 ? labAddressLines.join('\n') : undefined,
    contact: labContactBits.length > 0 ? labContactBits.join('  •  ') : undefined,
    gstNo: lab.gstNo || undefined,
    registrationNo: lab.registrationNo || undefined,
  }

  // ─── Patient + order info grid ─────────────────────────────────────
  const patient = order.patient
  const patientRows = [
    { label: 'Patient Name', value: patient.name },
    { label: 'Gender', value: patient.gender || '' },
    { label: 'Mobile', value: patient.mobileNo || '' },
    { label: 'Test Name', value: order.testName },
    { label: 'Test Type', value: order.testType || '' },
    { label: 'Urgency', value: order.urgency || 'Normal' },
    {
      label: 'Order Status',
      value: order.status,
    },
  ]

  const orderRows = [
    {
      label: 'Order No',
      value: order.orderNo,
    },
    {
      label: 'Referring Doctor',
      value: `Dr. ${order.doctor.user.name}`,
    },
    {
      label: 'Ordered On',
      value: formatDateTime(order.orderedAt),
    },
    {
      label: 'Completed On',
      value: order.completedAt ? formatDateTime(order.completedAt) : '—',
    },
    {
      label: 'Lab Partner',
      value: lab.labName,
    },
  ]

  // ─── Billing / commission section (hidden for patients) ───────────
  const showBilling = isAdmin || isOwningDoctor || isOwningLabTech
  const testFee = order.billing?.amount || order.testFee || 0
  const commissionPercent =
    order.billing?.commissionPercent || association?.commissionPercent || 10
  const commissionAmount =
    order.billing?.commissionAmount ??
    Math.round((testFee * commissionPercent) / 100)
  const labRevenue = testFee - commissionAmount

  // ─── Report parameters (parsed from upload.reportData JSON) ────────
  let parameters: ReportParameter[] = []
  let hasAbnormal = false
  if (upload) {
    try {
      const parsed = JSON.parse(upload.reportData || '[]')
      if (Array.isArray(parsed) && parsed.length > 0) {
        parameters = parsed as ReportParameter[]
        hasAbnormal = parameters.some((p) => p && p.abnormal === true)
      }
    } catch {
      // malformed JSON — render empty
    }
  }

  // ─── Render: "not yet uploaded" notice ──────────────────────────────
  if (!upload) {
    return (
      <PrintLayout
        letterhead={letterhead}
        title="LAB REPORT"
        docNo={order.orderNo}
        date={order.orderedAt}
      >
        <SectionTitle>Patient Information</SectionTitle>
        <InfoGrid rows={patientRows} />

        <SectionTitle>Order Information</SectionTitle>
        <InfoGrid rows={orderRows} />

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            border: '2px dashed #94a3b8',
            background: '#f8fafc',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: 0 }}>
            ⏳ Report Not Yet Uploaded
          </p>
          <p style={{ fontSize: '11px', color: '#475569', margin: '6px 0 0' }}>
            This lab test order is currently{' '}
            <strong>{order.status}</strong>. The lab partner will upload the
            report once the test is completed. Please check back later.
          </p>
        </div>

        <Signatures
          left="Lab Technician"
          right={`Dr. ${order.doctor.user.name}`}
        />
      </PrintLayout>
    )
  }

  // ─── Render: full report ──────────────────────────────────────────────
  const reportNo = makeReceiptNo('LAB', upload.id)
  const reportDate = upload.uploadedAt

  // ─── File embed (PDF → iframe, image → img, else link) ──────────────
  const fileUrl = upload.fileUrl
  const fileType = upload.fileType || ''
  const isPdf =
    fileType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf')
  const isImage =
    fileType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl)

  return (
    <PrintLayout
      letterhead={letterhead}
      title="LAB REPORT"
      docNo={reportNo}
      date={reportDate}
    >
      {/* Patient Information */}
      <SectionTitle>Patient Information</SectionTitle>
      <InfoGrid rows={patientRows} />

      {/* Order Information */}
      <SectionTitle>Order Information</SectionTitle>
      <InfoGrid rows={orderRows} />

      {/* Billing / commission (hidden for patient viewers) */}
      {showBilling && (
        <>
          <SectionTitle>Test Fee &amp; Commission</SectionTitle>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '12px',
            }}
          >
            <tbody>
              <tr>
                <td style={billingLabelCellStyle}>Test Fee</td>
                <td style={billingValueCellStyle}>{formatINR(testFee)}</td>
              </tr>
              <tr>
                <td style={billingLabelCellStyle}>Commission %</td>
                <td style={billingValueCellStyle}>
                  {commissionPercent}%{' '}
                  {association && !association.isActive ? '(inactive)' : ''}
                </td>
              </tr>
              <tr>
                <td style={billingLabelCellStyle}>Commission Amount</td>
                <td style={billingValueCellStyle}>
                  {formatINR(commissionAmount)}
                </td>
              </tr>
              <tr style={{ background: '#f0fdfa' }}>
                <td style={billingLabelCellStyle}>Lab Revenue (Test Fee − Commission)</td>
                <td style={{ ...billingValueCellStyle, fontWeight: 700, color: '#0d9488' }}>
                  {formatINR(labRevenue)}
                </td>
              </tr>
              {order.billing && (
                <tr>
                  <td style={billingLabelCellStyle}>Billing Payment Status</td>
                  <td style={billingValueCellStyle}>
                    {order.billing.paymentStatus}
                    {order.billing.paidAt
                      ? ` on ${formatDate(order.billing.paidAt)}`
                      : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Verified-by-doctor stamp */}
      {upload.verifiedByDoctor && (
        <div
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            border: '2px solid #0d9488',
            color: '#0d9488',
            fontWeight: 700,
            fontSize: '11px',
            borderRadius: '4px',
            margin: '8px 0',
            transform: 'rotate(-3deg)',
            letterSpacing: '0.5px',
          }}
        >
          ✓ Verified by Doctor
          {upload.verifiedAt && (
            <span style={{ fontWeight: 400, marginLeft: '6px' }}>
              {formatDate(upload.verifiedAt)}
            </span>
          )}
        </div>
      )}

      {/* Parameters table (blood-test reportData) */}
      {parameters.length > 0 && (
        <>
          <SectionTitle>Test Parameters</SectionTitle>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '12px',
            }}
          >
            <thead>
              <tr>
                <th style={paramHeaderCellStyle}>Parameter</th>
                <th style={paramHeaderCellStyle}>Value</th>
                <th style={paramHeaderCellStyle}>Unit</th>
                <th style={paramHeaderCellStyle}>Normal Range</th>
                <th style={paramHeaderCellStyle}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((p, idx) => {
                const abnormal = p.abnormal === true
                return (
                  <tr
                    key={idx}
                    style={{
                      background: abnormal ? '#fef2f2' : undefined,
                      pageBreakInside: 'avoid',
                    }}
                  >
                    <td style={{ ...paramCellStyle, fontWeight: 600, color: abnormal ? '#991b1b' : '#000' }}>
                      {p.param || '—'}
                    </td>
                    <td style={{ ...paramCellStyle, fontWeight: 600, color: abnormal ? '#991b1b' : '#000' }}>
                      {p.value ?? '—'}
                    </td>
                    <td style={paramCellStyle}>{p.unit || ''}</td>
                    <td style={paramCellStyle}>{p.normal || '—'}</td>
                    <td style={{ ...paramCellStyle, textAlign: 'center' }}>
                      {abnormal ? (
                        <span style={abnormalBadgeStyle}>Abnormal</span>
                      ) : (
                        <span style={normalBadgeStyle}>Normal</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {/* Overall abnormal flag */}
      {hasAbnormal && (
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#991b1b',
            margin: '6px 0 12px',
            padding: '6px 10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '3px',
          }}
        >
          ⚠️ One or more parameters are outside the normal range. Please
          consult the referring doctor.
        </p>
      )}

      {/* Lab remarks */}
      {upload.notes && (
        <>
          <SectionTitle>Lab Remarks</SectionTitle>
          <p
            style={{
              fontSize: '11px',
              margin: '4px 0 12px',
              color: '#000',
              whiteSpace: 'pre-line',
            }}
          >
            {upload.notes}
          </p>
        </>
      )}

      {/* Attached file */}
      {fileUrl && (
        <>
          <SectionTitle>Attached Report File</SectionTitle>
          <p style={{ fontSize: '11px', margin: '4px 0 8px', color: '#475569' }}>
            {upload.fileName || upload.fileType || 'Report file'}{' '}
            {upload.fileSize > 0 && `(${(upload.fileSize / 1024).toFixed(0)} KB)`}
          </p>

          {isPdf ? (
            <iframe
              src={fileUrl}
              title="Lab Report PDF"
              className="w-full"
              style={{ width: '100%', height: '60vh', border: '1px solid #cbd5e1' }}
            />
          ) : isImage ? (
            <img
              src={fileUrl}
              alt="Lab Report"
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                border: '1px solid #cbd5e1',
                display: 'block',
                margin: '0 auto',
              }}
            />
          ) : (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                background: '#0d9488',
                color: '#fff',
                fontSize: '11px',
                textDecoration: 'none',
                borderRadius: '3px',
              }}
            >
              Download Report File
            </a>
          )}
        </>
      )}

      {/* Uploaded-by attribution */}
      {uploadedByName && (
        <p style={{ fontSize: '10px', margin: '12px 0 0', color: '#64748b' }}>
          Report uploaded by: {uploadedByName} on {formatDateTime(upload.uploadedAt)}
        </p>
      )}

      {/* Signatures */}
      <Signatures
        left="Lab Technician"
        right={`Dr. ${order.doctor.user.name}`}
      />
    </PrintLayout>
  )
}

// ─── Shared inline styles (print-safe — inline styles survive the
//     print stylesheet's body * { visibility: hidden } rule, while
//     Tailwind classes don't always survive) ────────────────────────────

const billingLabelCellStyle: CSSProperties = {
  width: '40%',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
}

const billingValueCellStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  color: '#000',
  border: '1px solid #cbd5e1',
}

const paramHeaderCellStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#0d9488',
  border: '1px solid #0d9488',
  background: '#f0fdfa',
  textAlign: 'left',
}

const paramCellStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  color: '#000',
  border: '1px solid #cbd5e1',
  textAlign: 'left',
}

const abnormalBadgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '2px 6px',
  fontSize: '9px',
  fontWeight: 700,
  color: '#991b1b',
  background: '#fee2e2',
  border: '1px solid #fecaca',
  borderRadius: '3px',
}

const normalBadgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '2px 6px',
  fontSize: '9px',
  fontWeight: 600,
  color: '#166534',
  background: '#dcfce7',
  border: '1px solid #bbf7d0',
  borderRadius: '3px',
}
