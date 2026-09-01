/**
 * Print route — MONTHLY LAB INVOICE (Admin → Lab Partner).
 * URL: /print/lab-invoice/[labPartnerId]?period=YYYY-MM
 *
 * Authorization: admin only.
 *
 * The letterhead is the LAB's (the lab is the invoice recipient);
 * the bill-from is Doctorooms HMS platform (admin).
 *
 * Server component — fetches directly from Prisma (no API hop).
 */
import { cookies } from 'next/headers'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import {
  PrintLayout,
  SectionTitle,
  Signatures,
  type Letterhead,
} from '@/components/print/print-layout'
import { formatINR, formatDate, formatPeriod } from '@/lib/print-utils'

export const metadata = {
  title: 'Lab Invoice — Doctorooms',
}

interface PageProps {
  params: Promise<{ labPartnerId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LabInvoicePage({
  params,
  searchParams,
}: PageProps) {
  // --- Auth (admin only) ---
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('doctorooms_session')?.value
  if (!sessionId) {
    return <div style={{ padding: 40 }}>Unauthorized — please log in.</div>
  }
  const user = await db.user.findUnique({ where: { id: sessionId } })
  if (!user || user.status !== 'Active' || user.role !== 'admin') {
    return <div style={{ padding: 40 }}>Unauthorized — admin access required.</div>
  }

  const { labPartnerId } = await params
  const sp = await searchParams
  const period =
    typeof sp.period === 'string' && sp.period
      ? sp.period
      : format(new Date(), 'yyyy-MM')

  // Parse YYYY-MM into month boundaries.
  const [y, m] = period.split('-').map(Number)
  if (!y || !m || m < 1 || m > 12) {
    return (
      <div style={{ padding: 40 }}>
        Invalid period <code>{period}</code>. Use ?period=YYYY-MM.
      </div>
    )
  }
  const startOfMonth = new Date(y, m - 1, 1)
  const startOfNextMonth = new Date(y, m, 1)

  // --- Fetch lab partner ---
  const labPartner = await db.labPartner.findUnique({
    where: { id: labPartnerId },
  })
  if (!labPartner) {
    return <div style={{ padding: 40 }}>Lab partner not found.</div>
  }

  // --- Fetch all billings for this lab in the period ---
  const billings = await db.labBilling.findMany({
    where: {
      labPartnerId,
      billedAt: { gte: startOfMonth, lt: startOfNextMonth },
    },
    include: {
      doctor: { include: { user: { select: { id: true, name: true } } } },
      externalOrder: {
        select: {
          id: true,
          orderNo: true,
          testName: true,
          patient: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { billedAt: 'asc' },
  })

  // --- Group by doctor for per-doctor subtotals ---
  type Row = (typeof billings)[number]
  const byDoctor = new Map<
    string,
    { doctorName: string; rows: Row[] }
  >()
  for (const b of billings) {
    const key = b.doctorId
    if (!byDoctor.has(key)) {
      byDoctor.set(key, {
        doctorName: b.doctor?.user?.name || 'Unknown Doctor',
        rows: [],
      })
    }
    byDoctor.get(key)!.rows.push(b)
  }

  // --- Grand totals ---
  const totalTests = billings.length
  const totalRevenue = billings.reduce((s, b) => s + b.amount, 0)
  const totalCommission = billings.reduce(
    (s, b) => s + b.commissionAmount,
    0,
  )
  const netPayable = totalRevenue - totalCommission

  // --- Letterhead: lab partner's letterhead (lab is the recipient) ---
  const fullAddress = [
    labPartner.address,
    [labPartner.city, labPartner.state, labPartner.pincode]
      .filter(Boolean)
      .join(', '),
  ]
    .filter(Boolean)
    .join(', ')
  const contactLine = [labPartner.mobile, labPartner.email]
    .filter(Boolean)
    .join(' | ')
  const letterhead: Letterhead = {
    name: labPartner.labName,
    subtitle: labPartner.ownerName ? `Proprietor: ${labPartner.ownerName}` : undefined,
    address: fullAddress || undefined,
    contact: contactLine || undefined,
    gstNo: labPartner.gstNo || undefined,
    registrationNo: labPartner.registrationNo || undefined,
  }

  // Invoice number: INV-LAB-XXXXXX-YYYYMM (last 6 of labPartnerId)
  const invoiceNo = `INV-LAB-${labPartnerId
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-6)
    .toUpperCase()}-${period.replace('-', '')}`

  return (
    <PrintLayout
      letterhead={letterhead}
      title="MONTHLY INVOICE"
      docNo={invoiceNo}
      date={new Date()}
    >
      {/* Bill From / Bill To grid */}
      <SectionTitle>Bill From / Bill To</SectionTitle>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            flex: 1,
            border: '1px solid #cbd5e1',
            padding: 8,
            fontSize: 11,
            background: '#f8fafc',
          }}
        >
          <p
            style={{
              fontWeight: 700,
              margin: '0 0 4px',
              color: '#0d9488',
            }}
          >
            Bill From (Service Provider)
          </p>
          <p style={{ margin: '1px 0', fontWeight: 600 }}>Doctorooms HMS</p>
          <p style={{ margin: '1px 0', color: '#475569' }}>
            Hospital Management Platform
          </p>
          <p style={{ margin: '1px 0', color: '#475569' }}>
            Admin Office, India
          </p>
          <p style={{ margin: '1px 0', color: '#475569' }}>
            Email: admin@doctorooms.com
          </p>
          <p style={{ margin: '1px 0', color: '#475569' }}>
            Invoice No: <strong>{invoiceNo}</strong>
          </p>
        </div>
        <div
          style={{
            flex: 1,
            border: '1px solid #cbd5e1',
            padding: 8,
            fontSize: 11,
          }}
        >
          <p
            style={{
              fontWeight: 700,
              margin: '0 0 4px',
              color: '#0d9488',
            }}
          >
            Bill To (Lab Partner)
          </p>
          <p style={{ margin: '1px 0', fontWeight: 600 }}>
            {labPartner.labName}
          </p>
          {labPartner.ownerName && (
            <p style={{ margin: '1px 0', color: '#475569' }}>
              Proprietor: {labPartner.ownerName}
            </p>
          )}
          {fullAddress && (
            <p style={{ margin: '1px 0', color: '#475569' }}>{fullAddress}</p>
          )}
          {labPartner.mobile && (
            <p style={{ margin: '1px 0', color: '#475569' }}>
              Mobile: {labPartner.mobile}
            </p>
          )}
          {labPartner.email && (
            <p style={{ margin: '1px 0', color: '#475569' }}>
              Email: {labPartner.email}
            </p>
          )}
          {labPartner.gstNo && (
            <p style={{ margin: '1px 0', color: '#475569' }}>
              GST: {labPartner.gstNo}
            </p>
          )}
          {labPartner.registrationNo && (
            <p style={{ margin: '1px 0', color: '#475569' }}>
              Reg: {labPartner.registrationNo}
            </p>
          )}
        </div>
      </div>

      {/* Invoice summary box (top-right) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 14,
        }}
      >
        <table style={{ width: '60%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr className="avoid-break">
              <td
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Total Tests
              </td>
              <td
                style={{
                  border: '1px solid #cbd5e1',
                  padding: '4px 8px',
                  fontSize: 11,
                  textAlign: 'right',
                }}
              >
                {totalTests}
              </td>
            </tr>
            <tr className="avoid-break">
              <td
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Total Revenue
              </td>
              <td
                style={{
                  border: '1px solid #cbd5e1',
                  padding: '4px 8px',
                  fontSize: 11,
                  textAlign: 'right',
                }}
              >
                {formatINR(totalRevenue)}
              </td>
            </tr>
            <tr className="avoid-break">
              <td
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Commission Deducted
              </td>
              <td
                style={{
                  border: '1px solid #cbd5e1',
                  padding: '4px 8px',
                  fontSize: 11,
                  textAlign: 'right',
                }}
              >
                {formatINR(totalCommission)}
              </td>
            </tr>
            <tr className="avoid-break" style={{ fontWeight: 700 }}>
              <td
                style={{
                  border: '1px solid #0d9488',
                  background: '#f0fdfa',
                  padding: '6px 8px',
                  fontSize: 12,
                  color: '#0d9488',
                }}
              >
                Net Payable to Lab
              </td>
              <td
                style={{
                  border: '1px solid #0d9488',
                  background: '#f0fdfa',
                  padding: '6px 8px',
                  fontSize: 12,
                  color: '#0d9488',
                  textAlign: 'right',
                }}
              >
                {formatINR(netPayable)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed line items grouped by doctor */}
      <SectionTitle>Line Items (grouped by doctor)</SectionTitle>

      {byDoctor.size === 0 && (
        <p
          style={{
            fontSize: 11,
            color: '#475569',
            padding: '8px 0',
            fontStyle: 'italic',
          }}
        >
          No billings found for {labPartner.labName} in {formatPeriod(period)}.
        </p>
      )}

      {Array.from(byDoctor.entries()).map(([docId, group], gi) => {
        const subTotalTests = group.rows.length
        const subTotalRevenue = group.rows.reduce((s, b) => s + b.amount, 0)
        const subTotalCommission = group.rows.reduce(
          (s, b) => s + b.commissionAmount,
          0,
        )
        const subLabRevenue = subTotalRevenue - subTotalCommission

        return (
          <div key={docId} style={{ marginBottom: 14 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                margin: '6px 0 4px',
                color: '#0d9488',
              }}
            >
              {gi + 1}. {group.doctorName}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>S.No</th>
                  <th style={{ width: '12%' }}>Date</th>
                  <th style={{ width: '18%' }}>Patient</th>
                  <th style={{ width: '23%' }}>Test</th>
                  <th style={{ width: '11%', textAlign: 'right' }}>Test Fee</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Comm %</th>
                  <th
                    style={{ width: '11%', textAlign: 'right' }}
                  >
                    Commission
                  </th>
                  <th
                    style={{ width: '12%', textAlign: 'right' }}
                  >
                    Lab Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((b, i) => (
                  <tr key={b.id} className="avoid-break">
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{formatDate(b.billedAt)}</td>
                    <td>{b.externalOrder?.patient?.name || '—'}</td>
                    <td>{b.externalOrder?.testName || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{formatINR(b.amount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {b.commissionPercent}%
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {formatINR(b.commissionAmount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {formatINR(b.amount - b.commissionAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr
                  className="avoid-break"
                  style={{ fontWeight: 700, background: '#f8fafc' }}
                >
                  <td colSpan={4} style={{ textAlign: 'right' }}>
                    Subtotal ({subTotalTests} tests):
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatINR(subTotalRevenue)}
                  </td>
                  <td />
                  <td style={{ textAlign: 'right' }}>
                    {formatINR(subTotalCommission)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatINR(subLabRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      })}

      {/* Grand totals */}
      <SectionTitle>Grand Totals</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr
            className="avoid-break"
            style={{ fontWeight: 700, background: '#f0fdfa' }}
          >
            <td style={{ padding: '6px 8px', border: '1px solid #0d9488' }}>
              Total Tests
            </td>
            <td
              style={{
                padding: '6px 8px',
                border: '1px solid #0d9488',
                textAlign: 'right',
              }}
            >
              {totalTests}
            </td>
            <td style={{ padding: '6px 8px', border: '1px solid #0d9488' }}>
              Total Revenue
            </td>
            <td
              style={{
                padding: '6px 8px',
                border: '1px solid #0d9488',
                textAlign: 'right',
              }}
            >
              {formatINR(totalRevenue)}
            </td>
          </tr>
          <tr
            className="avoid-break"
            style={{ fontWeight: 700, background: '#f0fdfa' }}
          >
            <td style={{ padding: '6px 8px', border: '1px solid #0d9488' }}>
              Commission Deducted
            </td>
            <td
              style={{
                padding: '6px 8px',
                border: '1px solid #0d9488',
                textAlign: 'right',
              }}
            >
              {formatINR(totalCommission)}
            </td>
            <td style={{ padding: '6px 8px', border: '1px solid #0d9488' }}>
              Net Payable to Lab
            </td>
            <td
              style={{
                padding: '6px 8px',
                border: '1px solid #0d9488',
                textAlign: 'right',
              }}
            >
              {formatINR(netPayable)}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: 10, color: '#475569', marginTop: 12 }}>
        <strong>Payment Instructions:</strong> The net payable amount of{' '}
        <strong>{formatINR(netPayable)}</strong> will be credited to the lab&apos;s
        registered bank account within <strong>7 working days</strong> from the
        invoice date. For any discrepancy, please contact the Doctorooms HMS
        admin within 7 days of receipt. This is a system-generated invoice and
        does not require a physical signature for validation.
      </p>

      <Signatures
        left="For Doctorooms HMS (Admin)"
        right={`For ${labPartner.labName} (Authorized Signatory)`}
      />
    </PrintLayout>
  )
}
