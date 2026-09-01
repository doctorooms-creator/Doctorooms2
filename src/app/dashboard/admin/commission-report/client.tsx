'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  CreditCard,
  Handshake,
  Stethoscope,
  CalendarDays,
  Loader2,
  Receipt,
  Printer,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────

interface MatrixRow {
  doctorId: string
  doctorName: string
  perLab: { labName: string; tests: number; commission: number }[]
  tests: number
  commission: number
}

interface PerLabRow {
  labId: string
  labName: string
  tests: number
  revenue: number
  commission: number
  paid: number
  pending: number
}

interface PerDoctorRow {
  doctorId: string
  doctorName: string
  tests: number
  commission: number
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
  doctorName: string | null
  labName: string | null
  testName: string | null
}

interface CommissionData {
  summary: {
    totalCommission: number
    totalRevenue: number
    totalTests: number
    paid: number
    pending: number
  }
  matrix: MatrixRow[]
  perLab: PerLabRow[]
  perDoctor: PerDoctorRow[]
  recentBillings: RecentBilling[]
}

interface LabLookup {
  id: string
  labName: string
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

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function CommissionReportClient() {
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState<string>(currentMonth())
  const [payDoctor, setPayDoctor] = useState<PerDoctorRow | null>(null)
  const [payBilling, setPayBilling] = useState<RecentBilling | null>(null)
  const [txnRef, setTxnRef] = useState('')

  // ─── Queries ─────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery<CommissionData>({
    queryKey: ['admin-commission', period],
    queryFn: async () => {
      const res = await fetch(`/api/commission/admin?period=${period}`)
      if (!res.ok) throw new Error('Failed to load commission report')
      return res.json()
    },
  })

  // Lab lookup for resolving labPartnerId in matrix
  const { data: labsLookup } = useQuery<LabLookup[]>({
    queryKey: ['admin-labs-lookup'],
    queryFn: async () => {
      const res = await fetch('/api/lab-partners')
      if (!res.ok) return []
      const data = await res.json()
      return (data.partners || []).map((p: { id: string; labName: string }) => ({
        id: p.id,
        labName: p.labName,
      }))
    },
  })

  const labIdByName = useMemo(() => {
    const m = new Map<string, string>()
    for (const l of labsLookup ?? []) m.set(l.labName, l.id)
    return m
  }, [labsLookup])

  // ─── Mutations ───────────────────────────────────────────────────────
  const bulkPayMutation = useMutation({
    mutationFn: async ({
      doctorId,
      labPartnerId,
      period: p,
      transactionRef,
      notes,
    }: {
      doctorId: string
      labPartnerId: string
      period: string
      transactionRef: string
      notes: string
    }) => {
      const res = await fetch('/api/commission/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, labPartnerId, period: p, transactionRef, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to process payout')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-commission'] })
      toast.success('Commission paid out')
      setPayDoctor(null)
      setTxnRef('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const singlePayMutation = useMutation({
    mutationFn: async ({
      billingId,
      transactionRef,
    }: {
      billingId: string
      transactionRef: string
    }) => {
      const res = await fetch('/api/commission/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingId, transactionRef }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to mark as paid')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-commission'] })
      toast.success('Billing marked as Paid')
      setPayBilling(null)
      setTxnRef('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Handle bulk pay per (doctor × lab) pairs from the matrix
  async function handleBulkPayDoctor() {
    if (!payDoctor) return
    const ref = txnRef.trim() || `ADMIN-PAYOUT-${Date.now()}`
    const matrixRow = data?.matrix.find((m) => m.doctorId === payDoctor.doctorId)
    const pairs: { doctorId: string; labPartnerId: string }[] = []
    if (matrixRow) {
      for (const pl of matrixRow.perLab) {
        const lid = labIdByName.get(pl.labName)
        if (lid) pairs.push({ doctorId: payDoctor.doctorId, labPartnerId: lid })
      }
    }
    if (pairs.length === 0) {
      toast.error('No lab mappings found for this doctor')
      return
    }
    try {
      await Promise.all(
        pairs.map((p) =>
          bulkPayMutation.mutateAsync({
            doctorId: p.doctorId,
            labPartnerId: p.labPartnerId,
            period,
            transactionRef: ref,
            notes: 'Admin payout',
          })
        )
      )
    } catch {
      // error handled in mutation onError
    }
  }

  function openDoctorPayDialog(d: PerDoctorRow) {
    setPayDoctor(d)
    setTxnRef(`ADMIN-PAYOUT-${Date.now()}`)
  }

  function openBillingPayDialog(b: RecentBilling) {
    setPayBilling(b)
    setTxnRef(`PAY-${b.id.slice(-6).toUpperCase()}`)
  }

  const summary = data?.summary
  const matrix = data?.matrix ?? []
  const perLab = data?.perLab ?? []
  const perDoctor = data?.perDoctor ?? []
  const recentBillings = data?.recentBillings ?? []

  // unique lab names from matrix to build columns
  const labColumns = useMemo(() => {
    const set = new Map<string, string>()
    for (const r of matrix) {
      for (const pl of r.perLab) {
        if (!set.has(pl.labName)) set.set(pl.labName, pl.labName)
      }
    }
    return Array.from(set.values())
  }, [matrix])

  // column totals
  const columnTotals = useMemo(() => {
    const totals: Record<string, { tests: number; commission: number }> = {}
    for (const col of labColumns) {
      totals[col] = { tests: 0, commission: 0 }
    }
    for (const r of matrix) {
      for (const pl of r.perLab) {
        if (!totals[pl.labName]) totals[pl.labName] = { tests: 0, commission: 0 }
        totals[pl.labName].tests += pl.tests
        totals[pl.labName].commission += pl.commission
      }
    }
    return totals
  }, [matrix, labColumns])

  const grandTests = matrix.reduce((s, r) => s + r.tests, 0)
  const grandCommission = matrix.reduce((s, r) => s + r.commission, 0)

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-teal-600" />
            Lab Commission Report
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Doctor × Lab commission matrix with payout tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="period" className="text-sm flex items-center gap-1">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Month
          </Label>
          <Input
            id="period"
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            label: 'Total Commission',
            value: summary ? fmt(summary.totalCommission) : '—',
            icon: IndianRupee,
            color: 'bg-teal-50 text-teal-600',
          },
          {
            label: 'Total Revenue',
            value: summary ? fmt(summary.totalRevenue) : '—',
            icon: IndianRupee,
            color: 'bg-violet-50 text-violet-600',
          },
          {
            label: 'Total Tests',
            value: summary?.totalTests ?? '—',
            icon: FlaskConical,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Pending',
            value: summary ? fmt(summary.pending) : '—',
            icon: Clock,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Paid',
            value: summary ? fmt(summary.paid) : '—',
            icon: CheckCircle2,
            color: 'bg-emerald-50 text-emerald-600',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
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

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !data || matrix.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <FileCheck2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground font-medium">
              No commission data for {period}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a different month or wait for lab billings to be generated
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Matrix Table */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                Doctor × Lab Matrix
              </CardTitle>
              <CardDescription>
                Cells show <span className="font-mono">tests / commission</span> per pair
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="sticky left-0 bg-background z-10">
                        Doctor
                      </TableHead>
                      {labColumns.map((lab) => (
                        <TableHead key={lab} className="text-center min-w-[120px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs">{lab}</span>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center bg-teal-50/50">
                        Row Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matrix.map((row) => (
                      <TableRow key={row.doctorId} className="border-slate-200">
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-amber-50">
                              <Stethoscope className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <span className="text-sm">{row.doctorName}</span>
                          </div>
                        </TableCell>
                        {labColumns.map((lab) => {
                          const cell = row.perLab.find((p) => p.labName === lab)
                          if (!cell || (cell.tests === 0 && cell.commission === 0)) {
                            return (
                              <TableCell key={lab} className="text-center text-muted-foreground">
                                —
                              </TableCell>
                            )
                          }
                          return (
                            <TableCell key={lab} className="text-center">
                              <div className="flex flex-col items-center leading-tight">
                                <span className="text-xs font-mono">
                                  {cell.tests}
                                </span>
                                <span className="text-xs text-teal-700 font-medium">
                                  {fmt(cell.commission)}
                                </span>
                              </div>
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-center bg-teal-50/30">
                          <div className="flex flex-col items-center leading-tight">
                            <span className="text-xs font-mono font-bold">
                              {row.tests}
                            </span>
                            <span className="text-xs text-teal-700 font-bold">
                              {fmt(row.commission)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Column Totals */}
                    <TableRow className="border-slate-200 bg-teal-50/30 font-semibold">
                      <TableCell className="sticky left-0 bg-teal-50/30 z-10">
                        Column Total
                      </TableCell>
                      {labColumns.map((lab) => (
                        <TableCell key={lab} className="text-center">
                          <div className="flex flex-col items-center leading-tight">
                            <span className="text-xs font-mono">
                              {columnTotals[lab]?.tests ?? 0}
                            </span>
                            <span className="text-xs text-teal-700 font-bold">
                              {fmt(columnTotals[lab]?.commission ?? 0)}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center leading-tight">
                          <span className="text-xs font-mono font-bold">
                            {grandTests}
                          </span>
                          <span className="text-xs text-teal-700 font-bold">
                            {fmt(grandCommission)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Per Lab + Per Doctor breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per Lab */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Handshake className="h-5 w-5 text-teal-600" />
                  Per Lab Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Lab</TableHead>
                        <TableHead className="text-center">Tests</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perLab.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                            No lab billings
                          </TableCell>
                        </TableRow>
                      ) : (
                        perLab.map((l) => (
                          <TableRow key={l.labId} className="border-slate-200">
                            <TableCell className="font-medium text-sm">
                              {l.labName}
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
                            <TableCell className="text-right font-mono text-xs text-emerald-700">
                              {fmt(l.paid)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-amber-700">
                              {fmt(l.pending)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                asChild
                                variant="default"
                                size="sm"
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                <a
                                  href={`/print/lab-invoice/${l.labId}?period=${period}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  <span className="sr-only">Print Invoice</span>
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Per Doctor */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  Per Doctor Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Doctor</TableHead>
                        <TableHead className="text-center">Tests</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perDoctor.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            No doctor billings
                          </TableCell>
                        </TableRow>
                      ) : (
                        perDoctor.map((d) => (
                          <TableRow key={d.doctorId} className="border-slate-200">
                            <TableCell className="font-medium text-sm">
                              {d.doctorName}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs">
                              {d.tests}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold text-teal-700">
                              {fmt(d.commission)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-amber-700">
                              {fmt(d.pending)}
                            </TableCell>
                            <TableCell className="text-right">
                              {d.pending > 0 ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDoctorPayDialog(d)}
                                  className="h-7 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Pay Now
                                </Button>
                              ) : (
                                <span className="text-xs text-emerald-600">
                                  Settled
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Billings */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-600" />
                Recent Billings
              </CardTitle>
              <CardDescription>
                20 most recent lab billings — mark individual pending bills as paid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead>Doctor</TableHead>
                      <TableHead className="hidden md:table-cell">Lab</TableHead>
                      <TableHead className="hidden lg:table-cell">Test</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBillings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                          No recent billings
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentBillings.map((b) => (
                        <TableRow key={b.id} className="border-slate-200">
                          <TableCell className="font-medium text-sm">
                            {b.doctorName || '—'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {b.labName || '—'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {b.testName || '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {fmt(b.amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-teal-700">
                            {fmt(b.commissionAmount)}
                            <span className="text-muted-foreground ml-1">
                              ({b.commissionPercent}%)
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{payBadge(b.paymentStatus)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {formatDate(b.billedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {b.paymentStatus === 'Pending' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openBillingPayDialog(b)}
                                className="h-7 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                Pay
                              </Button>
                            ) : (
                              <span className="text-xs text-emerald-600">
                                {b.paidAt ? formatDate(b.paidAt) : 'Paid'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Bulk Pay AlertDialog */}
      <AlertDialog open={!!payDoctor} onOpenChange={(o) => !o && setPayDoctor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pay all pending commission for {payDoctor?.doctorName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark <strong>{fmt(payDoctor?.pending ?? 0)}</strong> across all
              associated labs for period <strong>{period}</strong> as Paid. A separate
              payment record will be created per lab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="bulkTxn">Transaction Reference</Label>
            <Input
              id="bulkTxn"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              placeholder="e.g. UPI-987654321"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleBulkPayDoctor()
              }}
              disabled={bulkPayMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {bulkPayMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Confirm Payout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Pay AlertDialog */}
      <AlertDialog open={!!payBilling} onOpenChange={(o) => !o && setPayBilling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this billing as Paid?</AlertDialogTitle>
            <AlertDialogDescription>
              Commission of <strong>{fmt(payBilling?.commissionAmount ?? 0)}</strong> for{' '}
              {payBilling?.doctorName} × {payBilling?.labName} will be marked as Paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="singleTxn">Transaction Reference</Label>
            <Input
              id="singleTxn"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              placeholder="e.g. UPI-987654321"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (!payBilling) return
                singlePayMutation.mutate({
                  billingId: payBilling.id,
                  transactionRef: txnRef.trim() || `PAY-${Date.now()}`,
                })
              }}
              disabled={singlePayMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {singlePayMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
