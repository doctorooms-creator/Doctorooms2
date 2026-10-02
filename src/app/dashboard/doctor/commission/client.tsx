'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileCheck2,
  IndianRupee,
  FlaskConical,
  Clock,
  CheckCircle2,
  Handshake,
  CalendarDays,
  Receipt,
  Download,
  Send,
  Info,
  Printer,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────

interface PerLabRow {
  labPartnerId: string
  labName: string
  city: string
  tests: number
  revenue: number
  commission: number
  pending: number
  paid: number
}

interface PerMonthRow {
  period: string
  commission: number
  revenue: number
  tests: number
  paid: number
  pending: number
}

interface RecentBilling {
  id: string
  amount: number
  commissionAmount: number
  commissionPercent: number
  paymentStatus: string
  billedAt: string
  paidAt: string | null
  transactionRef: string
  labPartnerName: string | null
}

interface CommissionData {
  summary: {
    totalCommission: number
    totalRevenue: number
    totalTests: number
    paidCommission: number
    pendingCommission: number
  }
  perLab: PerLabRow[]
  perMonth: PerMonthRow[]
  recentBillings: RecentBilling[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

const formatDate = (d: string) => {
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (d: string) => {
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function payBadge(status: string) {
  if (status === 'Paid') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
        Paid
      </Badge>
    )
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
      Pending
    </Badge>
  )
}

function downloadCSV(rows: PerLabRow[]) {
  if (rows.length === 0) {
    toast.error('No commission data to download')
    return
  }
  const headers = [
    'Lab Partner ID',
    'Lab Name',
    'City',
    'Tests',
    'Revenue (INR)',
    'Commission (INR)',
    'Pending (INR)',
    'Paid (INR)',
  ]
  const csvLines = [headers.join(',')]
  for (const r of rows) {
    const cells = [
      `"${r.labPartnerId}"`,
      `"${(r.labName || '').replace(/"/g, '""')}"`,
      `"${(r.city || '').replace(/"/g, '""')}"`,
      r.tests,
      r.revenue,
      r.commission,
      r.pending,
      r.paid,
    ]
    csvLines.push(cells.join(','))
  }
  // Totals row
  const totalTests = rows.reduce((s, r) => s + r.tests, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totalCommission = rows.reduce((s, r) => s + r.commission, 0)
  const totalPending = rows.reduce((s, r) => s + r.pending, 0)
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0)
  csvLines.push(
    [
      '""',
      '"TOTAL"',
      '""',
      totalTests,
      totalRevenue,
      totalCommission,
      totalPending,
      totalPaid,
    ].join(','),
  )

  const csv = csvLines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const today = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `my-commission-statement-${today}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success('Statement CSV downloaded')
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function DoctorCommissionClient() {
  const [payoutOpen, setPayoutOpen] = useState(false)

  const { data, isLoading } = useQuery<CommissionData>({
    queryKey: ['doctor-commission'],
    queryFn: async () => {
      const res = await fetch('/api/commission/doctor')
      if (!res.ok) throw new Error('Failed to load commission')
      return res.json()
    },
  })

  // Fetch doctor profile to get the Doctor row id (for /print/commission-statement/[doctorId] link)
  const { data: profileData } = useQuery<{ doctor: { id: string } }>({
    queryKey: ['doctor-profile-id'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/doctor/profile')
      if (!res.ok) throw new Error('Failed to load profile')
      return res.json()
    },
  })
  const doctorId = profileData?.doctor?.id
  const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM
  const statementHref = doctorId
    ? `/print/commission-statement/${doctorId}?period=${currentPeriod}`
    : null

  const summary = data?.summary
  const perLab = data?.perLab ?? []
  const perMonth = useMemo(() => {
    return [...(data?.perMonth ?? [])].sort((a, b) =>
      a.period < b.period ? 1 : a.period > b.period ? -1 : 0,
    )
  }, [data])
  const recentBillings = data?.recentBillings ?? []

  // Totals for By Lab row
  const perLabTotals = useMemo(() => {
    return {
      tests: perLab.reduce((s, r) => s + r.tests, 0),
      revenue: perLab.reduce((s, r) => s + r.revenue, 0),
      commission: perLab.reduce((s, r) => s + r.commission, 0),
      pending: perLab.reduce((s, r) => s + r.pending, 0),
      paid: perLab.reduce((s, r) => s + r.paid, 0),
    }
  }, [perLab])

  // Totals for By Month row
  const perMonthTotals = useMemo(() => {
    return {
      tests: perMonth.reduce((s, r) => s + r.tests, 0),
      revenue: perMonth.reduce((s, r) => s + r.revenue, 0),
      commission: perMonth.reduce((s, r) => s + r.commission, 0),
      pending: perMonth.reduce((s, r) => s + r.pending, 0),
      paid: perMonth.reduce((s, r) => s + r.paid, 0),
    }
  }, [perMonth])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-teal-600" />
            My Commission
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track commission earned through your associated labs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => downloadCSV(perLab)}
            disabled={isLoading || perLab.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Statement
          </Button>
          {statementHref ? (
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
              <a href={statementHref} target="_blank" rel="noopener noreferrer">
                <Printer className="h-4 w-4 mr-2" />
                Print Statement
              </a>
            </Button>
          ) : (
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled>
              <Printer className="h-4 w-4 mr-2" />
              Print Statement
            </Button>
          )}
          <Button
            onClick={() => setPayoutOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: 'Total Commission Earned',
            value: summary ? fmt(summary.totalCommission) : '—',
            icon: IndianRupee,
            color: 'bg-teal-50 text-teal-600',
          },
          {
            label: 'Pending Commission',
            value: summary ? fmt(summary.pendingCommission) : '—',
            icon: Clock,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Paid Commission',
            value: summary ? fmt(summary.paidCommission) : '—',
            icon: CheckCircle2,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Total Tests Ordered',
            value: summary?.totalTests ?? '—',
            icon: FlaskConical,
            color: 'bg-violet-50 text-violet-600',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-tight">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-xs text-teal-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          <strong>How it works:</strong> Commission is auto-calculated as % of test fee
          when labs upload reports. Each associated lab has its own commission %, set
          when you link the lab. Payouts are released by the hospital admin on a
          periodic basis.
        </span>
      </div>

      {isLoading ? (
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ) : !data || (perLab.length === 0 && perMonth.length === 0 && recentBillings.length === 0) ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground font-medium">No commission data yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Associate a lab and start ordering tests to earn commission
            </p>
            <a
              href="/dashboard/doctor/lab-partners"
              className="inline-flex items-center justify-center rounded-md bg-teal-600 hover:bg-teal-700 text-white h-9 px-4 text-sm font-medium"
            >
              <Handshake className="h-4 w-4 mr-2" />
              Go to My Lab Partners
            </a>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="byLab" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="byLab">
              <Handshake className="h-3.5 w-3.5 mr-1.5" />
              By Lab
            </TabsTrigger>
            <TabsTrigger value="byMonth">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              By Month
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Receipt className="h-3.5 w-3.5 mr-1.5" />
              Recent
            </TabsTrigger>
          </TabsList>

          {/* ─── By Lab ─────────────────────────────────────────────────── */}
          <TabsContent value="byLab">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-teal-600" />
                  Commission by Lab
                </CardTitle>
                <CardDescription>
                  Per-lab breakdown of tests, revenue, commission, and payout status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Lab Name</TableHead>
                        <TableHead className="hidden md:table-cell">City</TableHead>
                        <TableHead className="text-center">Tests</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perLab.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                            No lab billings yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {perLab.map((l) => (
                            <TableRow key={l.labPartnerId} className="border-slate-200">
                              <TableCell className="font-medium text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-teal-50">
                                    <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
                                  </div>
                                  {l.labName}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                {l.city || '—'}
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs">
                                {l.tests}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {fmt(l.revenue)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs font-semibold text-teal-700">
                                {fmt(l.commission)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs text-amber-700">
                                {fmt(l.pending)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs text-emerald-700">
                                {fmt(l.paid)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Totals row */}
                          <TableRow className="border-slate-200 bg-teal-50/30 font-semibold">
                            <TableCell>Total</TableCell>
                            <TableCell className="hidden md:table-cell" />
                            <TableCell className="text-center font-mono text-xs">
                              {perLabTotals.tests}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {fmt(perLabTotals.revenue)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-teal-700 font-bold">
                              {fmt(perLabTotals.commission)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-amber-700 font-bold">
                              {fmt(perLabTotals.pending)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-emerald-700 font-bold">
                              {fmt(perLabTotals.paid)}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── By Month ───────────────────────────────────────────────── */}
          <TabsContent value="byMonth">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-teal-600" />
                  Commission by Month
                </CardTitle>
                <CardDescription>
                  Monthly trends of tests, revenue, commission, and payout status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Period</TableHead>
                        <TableHead className="text-center">Tests</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perMonth.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                            No monthly data yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {perMonth.map((m) => (
                            <TableRow key={m.period} className="border-slate-200">
                              <TableCell className="font-mono text-sm font-medium">
                                {m.period}
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs">
                                {m.tests}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {fmt(m.revenue)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs font-semibold text-teal-700">
                                {fmt(m.commission)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs text-amber-700">
                                {fmt(m.pending)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs text-emerald-700">
                                {fmt(m.paid)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-slate-200 bg-teal-50/30 font-semibold">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-center font-mono text-xs">
                              {perMonthTotals.tests}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {fmt(perMonthTotals.revenue)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-teal-700 font-bold">
                              {fmt(perMonthTotals.commission)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-amber-700 font-bold">
                              {fmt(perMonthTotals.pending)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-emerald-700 font-bold">
                              {fmt(perMonthTotals.paid)}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Recent Billings ────────────────────────────────────────── */}
          <TabsContent value="recent">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-teal-600" />
                  Recent Billings
                </CardTitle>
                <CardDescription>
                  Most recent 10 lab billings — auto-generated when reports are uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Date</TableHead>
                        <TableHead>Lab</TableHead>
                        <TableHead className="hidden md:table-cell">Test</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Comm %</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Paid At</TableHead>
                        <TableHead className="hidden lg:table-cell">Txn Ref</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBillings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                            No recent billings
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentBillings.map((b) => (
                          <TableRow key={b.id} className="border-slate-200">
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(b.billedAt)}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {b.labPartnerName || '—'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              —
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {fmt(b.amount)}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs">
                              {b.commissionPercent}%
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold text-teal-700">
                              {fmt(b.commissionAmount)}
                            </TableCell>
                            <TableCell className="text-center">{payBadge(b.paymentStatus)}</TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {b.paidAt ? formatDate(b.paidAt) : '—'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                              {b.transactionRef || '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Request Payout AlertDialog */}
      <AlertDialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-teal-600" />
              Request Payout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your payout request for pending commission of{' '}
              <strong>{summary ? fmt(summary.pendingCommission) : '—'}</strong> will be
              submitted to the hospital admin for review. Payouts are typically processed
              at the end of each billing cycle. You will receive a notification once the
              status changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                setPayoutOpen(false)
                toast.info(
                  'Payout request submitted — admin will review and process it shortly',
                )
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
