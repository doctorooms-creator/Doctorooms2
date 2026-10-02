/**
 * Print route — COMMISSION STATEMENT (per-doctor, monthly).
 * URL: /print/commission-statement/[doctorId]?period=YYYY-MM
 *
 * Authorization:
 *   - The doctor themselves (session user.id === doctor.userId)
 *   - Admin
 * Not allowed for anyone else.
 *
 * Server component — fetches directly from Prisma (no API hop).
 */
import { cookies } from 'next/headers'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import {
  PrintLayout,
  InfoGrid,
  SectionTitle,
  Signatures,
  type Letterhead,
} from '@/components/print/print-layout'
import {
  formatINR,
  formatDate,
  formatPeriod,
  statusColor,
} from '@/lib/print-utils'

export const metadata = {
  title: 'Commission Statement — Doctorooms',
}

interface PageProps {
  params: Promise<{ doctorId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CommissionStatementPage({
  params,
  searchParams,
}: PageProps) {
  // --- Auth (cookie-based, server-side) ---
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('doctorooms_session')?.value
  if (!sessionId) {
    return <div style={{ padding: 40 }}>Unauthorized — please log in.</div>
  }
  const user = await db.user.findUnique({ where: { id: sessionId } })
  if (!user || user.status !== 'Active') {
    return <div style={{ padding: 40 }}>Unauthorized — user not active.</div>
  }

  const { doctorId } = await params
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

  // --- Fetch the doctor + their user profile ---
  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: { select: { id: true, name: true, email: true, mobileNo: true } },
    },
  })
  if (!doctor) {
    return <div style={{ padding: 40 }}>Doctor not found.</div>
  }

  // Authorization: admin OR the doctor themselves.
  if (user.role !== 'admin' && doctor.userId !== user.id) {
    return <div style={{ padding: 40 }}>Unauthorized — access denied.</div>
  }

  // --- Fetch all lab billings for the doctor in this period ---
  const billings = await db.labBilling.findMany({
    where: {
      doctorId,
      billedAt: { gte: startOfMonth, lt: startOfNextMonth },
    },
    include: {
      labPartner: {
        select: { id: true, labName: true, city: true, ownerName: true },
      },
      externalOrder: {
        select: {
          id: true,
          orderNo: true,
          testName: true,
          testType: true,
          patient: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { billedAt: 'asc' },
  })

  // --- Group by lab partner for per-lab breakdown ---
  type Row = (typeof billings)[number]
  const byLab = new Map<
    string,
    { labName: string; city: string; rows: Row[] }
  >()
  for (const b of billings) {
    const key = b.labPartnerId
    if (!byLab.has(key)) {
      byLab.set(key, {
        labName: b.labPartner?.labName || 'Unknown Lab',
        city: b.labPartner?.city || '',
        rows: [],
      })
    }
    byLab.get(key)!.rows.push(b)
  }

  // --- Grand totals ---
  const totalTests = billings.length
  const totalRevenue = billings.reduce((s, b) => s + b.amount, 0)
  const totalCommission = billings.reduce((s, b) => s + b.commissionAmount, 0)
  const paidCommission = billings
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((s, b) => s + b.commissionAmount, 0)
  const pendingCommission = billings
    .filter((b) => b.paymentStatus === 'Pending')
    .reduce((s, b) => s + b.commissionAmount, 0)

  // --- Letterhead: prefer doctor's clinic/hospital info, else generic Doctorooms HMS ---
  const doctorAddressParts = [
    doctor.hospitalAddress || doctor.address,
    [doctor.city, doctor.state].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(', ')
  const doctorContact = doctor.contactNo || doctor.phoneNo || undefined
  const letterhead: Letterhead = {
    name: doctor.user?.name || 'Doctorooms HMS',
    subtitle:
      doctor.specialization || 'Physician',
    address: doctorAddressParts || undefined,
    contact: doctorContact,
    registrationNo: doctor.registrationDetail || undefined,
  }

  // Statement number: COMM-XXXXXX-YYYYMM (last 6 of doctorId)
  const statementNo = `COMM-${doctorId
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-6)
    .toUpperCase()}-${period.replace('-', '')}`

  return (
    <PrintLayout
      letterhead={letterhead}
      title="COMMISSION STATEMENT"
      docNo={statementNo}
      date={new Date()}
    >
      <InfoGrid
        rows={[
          { label: 'Doctor Name', value: doctor.user?.name || '' },
          { label: 'Specialization', value: doctor.specialization || '' },
          { label: 'Registration No', value: doctor.registrationDetail || '' },
          { label: 'Statement Period', value: formatPeriod(period) },
          { label: 'Statement Date', value: formatDate(new Date()) },
        ]}
      />

      <SectionTitle>Per-Lab Breakdown</SectionTitle>

      {byLab.size === 0 && (
        <p
          style={{
            fontSize: 11,
            color: '#475569',
            padding: '8px 0',
            fontStyle: 'italic',
          }}
        >
          No lab billing records found for {formatPeriod(period)}.
        </p>
      )}

      {Array.from(byLab.entries()).map(([labId, group]) => {
        const subTotalTests = group.rows.length
        const subTotalRevenue = group.rows.reduce((s, b) => s + b.amount, 0)
        const subTotalCommission = group.rows.reduce(
          (s, b) => s + b.commissionAmount,
          0,
        )
        const subPaid = group.rows
          .filter((b) => b.paymentStatus === 'Paid')
          .reduce((s, b) => s + b.commissionAmount, 0)
        const subPending = group.rows
          .filter((b) => b.paymentStatus === 'Pending')
          .reduce((s, b) => s + b.commissionAmount, 0)

        return (
          <div key={labId} style={{ marginBottom: 14 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                margin: '6px 0 4px',
                color: '#0d9488',
              }}
            >
              {group.labName}
              {group.city ? `, ${group.city}` : ''}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '22%' }}>Test</th>
                  <th style={{ width: '18%' }}>Patient</th>
                  <th style={{ width: '12%' }}>Date</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Revenue</th>
                  <th style={{ width: '9%', textAlign: 'center' }}>Comm %</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Commission</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((b, i) => {
                  const sc = statusColor(b.paymentStatus)
                  return (
                    <tr key={b.id} className="avoid-break">
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td>{b.externalOrder?.testName || '—'}</td>
                      <td>{b.externalOrder?.patient?.name || '—'}</td>
                      <td>{formatDate(b.billedAt)}</td>
                      <td style={{ textAlign: 'right' }}>{formatINR(b.amount)}</td>
                      <td style={{ textAlign: 'center' }}>{b.commissionPercent}%</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatINR(b.commissionAmount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.text,
                            padding: '1px 6px',
                            borderRadius: 3,
                            fontSize: 10,
                          }}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr
                  className="avoid-break"
                  style={{ fontWeight: 700, background: '#f8fafc' }}
                >
                  <td
                    colSpan={4}
                    style={{ textAlign: 'right' }}
                  >
                    Subtotal ({subTotalTests} tests):
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatINR(subTotalRevenue)}</td>
                  <td />
                  <td style={{ textAlign: 'right' }}>
                    {formatINR(subTotalCommission)}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 9 }}>
                    <div>Paid: {formatINR(subPaid)}</div>
                    <div>Pending: {formatINR(subPending)}</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      })}

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
              Total Commission
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
              Paid / Pending
            </td>
            <td
              style={{
                padding: '6px 8px',
                border: '1px solid #0d9488',
                textAlign: 'right',
              }}
            >
              {formatINR(paidCommission)} / {formatINR(pendingCommission)}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: 9, color: '#64748b', marginTop: 10 }}>
        <strong>Payment Status Legend:</strong> &quot;Paid&quot; = commission
        already settled by the lab / admin to the doctor for that test order.
        &quot;Pending&quot; = commission accrued but not yet released.
        Subtotals are shown per lab partner. This statement is generated
        monthly; please review and report any discrepancies within 7 days to
        the platform admin.
      </p>

      <Signatures
        left="Doctor's Acknowledgement"
        right="Authorized by Admin"
      />
    </PrintLayout>
  )
}
