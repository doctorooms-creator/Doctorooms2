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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Receipt,
  IndianRupee,
  CheckCircle2,
  Clock,
  Download,
  Handshake,
  CalendarDays,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────

interface BillingItem {
  id: string
  labPartnerId: string
  doctorId: string
  patientId: string
  amount: number
  commissionAmount: number
  commissionPercent: number
  paymentStatus: string
  billedAt: string
  paidAt: string | null
  transactionRef: string
  notes: string
  labPartner: {
    id: string
    labName: string
    city: string
    ownerName: string
  }
  doctor: {
    user: {
      id: string
      name: string
    }
  }
  externalOrder: {
    id: string
    orderNo: string
    testName: string
    testType: string
    patient: {
      id: string
      name: string
      mobileNo: string
    }
  } | null
}

interface BillingReport {
  billings: BillingItem[]
  summary: {
    totalRevenue: number
    totalCommission: number
    labRevenue: number
    paidCommission: number
    pendingCommission: number
    totalBills: number
  }
}

interface LabOption {
  id: string
  labName: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

const formatDate = (d: string | null) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statusBadge(status: string) {
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

function exportCsv(billings: BillingItem[]) {
  if (!billings.length) {
    toast.info('No billings to export')
    return
  }
  const headers = [
    'Bill Date',
    'Lab',
    'Doctor',
    'Patient',
    'Test',
    'Amount',
    'Commission %',
    'Commission Amount',
    'Lab Revenue',
    'Status',
    'Paid At',
    'Transaction Ref',
  ]
  const rows = billings.map((b) => [
    new Date(b.billedAt).toLocaleString('en-IN'),
    b.labPartner?.labName || '',
    b.doctor?.user?.name || '',
    b.externalOrder?.patient?.name || '',
    b.externalOrder?.testName || '',
    b.amount,
    b.commissionPercent,
    b.commissionAmount,
    b.amount - b.commissionAmount,
    b.paymentStatus,
    b.paidAt ? new Date(b.paidAt).toLocaleString('en-IN') : '',
    b.transactionRef || '',
  ])
  const csv = [headers, ...rows]
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? '')
          return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lab-billing-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('CSV exported')
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function LabBillingReportClient() {
  const [status, setStatus] = useState<string>('all')
  const [period, setPeriod] = useState<string>('')
  const [labPartnerId, setLabPartnerId] = useState<string>('all')

  // Build query params
  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (status !== 'all') p.set('status', status)
    if (period) p.set('period', period)
    if (labPartnerId !== 'all') p.set('labPartnerId', labPartnerId)
    return p.toString()
  }, [status, period, labPartnerId])

  // Fetch billings
  const { data, isLoading } = useQuery<BillingReport>({
    queryKey: ['lab-billing-report', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/lab-billing/report?${queryParams}`)
      if (!res.ok) throw new Error('Failed to load billing report')
      return res.json()
    },
  })

  // Fetch lab partners for filter dropdown
  const { data: labsData } = useQuery<{ partners: LabOption[] }>({
    queryKey: ['lab-billing-labs'],
    queryFn: async () => {
      const res = await fetch('/api/lab-partners')
      if (!res.ok) throw new Error('Failed to load labs')
      return res.json()
    },
  })

  const billings = data?.billings ?? []
  const summary = data?.summary
  const labs = labsData?.partners ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-teal-600" />
            Lab Billing Report
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All lab billing records with commission and payout status
          </p>
        </div>
        <Button
          onClick={() => exportCsv(billings)}
          disabled={!billings.length}
          variant="outline"
          className="border-teal-200 text-teal-700 hover:bg-teal-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            label: 'Total Bills',
            value: summary?.totalBills ?? '—',
            icon: Receipt,
            color: 'bg-teal-50 text-teal-600',
          },
          {
            label: 'Total Revenue',
            value: summary ? fmt(summary.totalRevenue) : '—',
            icon: IndianRupee,
            color: 'bg-violet-50 text-violet-600',
          },
          {
            label: 'Commission',
            value: summary ? fmt(summary.totalCommission) : '—',
            icon: IndianRupee,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Lab Revenue',
            value: summary ? fmt(summary.labRevenue) : '—',
            icon: Handshake,
            color: 'bg-teal-50 text-teal-600',
          },
          {
            label: 'Paid',
            value: summary ? fmt(summary.paidCommission) : '—',
            icon: CheckCircle2,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Pending',
            value: summary ? fmt(summary.pendingCommission) : '—',
            icon: Clock,
            color: 'bg-amber-50 text-amber-600',
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

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="space-y-1.5">
                <Label htmlFor="status-filter" className="text-xs text-muted-foreground">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status-filter" className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lab-filter" className="text-xs text-muted-foreground">
                  Lab Partner
                </Label>
                <Select value={labPartnerId} onValueChange={setLabPartnerId}>
                  <SelectTrigger id="lab-filter" className="w-[200px]">
                    <Handshake className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Labs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Labs</SelectItem>
                    {labs.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.labName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="period-filter" className="text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 inline mr-1" />
                  Month
                </Label>
                <Input
                  id="period-filter"
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-[170px]"
                />
              </div>
            </div>
            {(status !== 'all' || period || labPartnerId !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatus('all')
                  setPeriod('')
                  setLabPartnerId('all')
                }}
                className="text-muted-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billings Table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-teal-600" />
            Billings
            {data && (
              <Badge variant="outline" className="ml-2 font-normal text-xs">
                {billings.length} {billings.length === 1 ? 'record' : 'records'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : billings.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">
                No billings found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting filters or wait for lab tests to be completed
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="hidden lg:table-cell">Bill Date</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="hidden md:table-cell">Patient</TableHead>
                    <TableHead className="hidden xl:table-cell">Test</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Comm %</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Lab Rev</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Paid At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billings.map((b) => (
                    <TableRow key={b.id} className="border-slate-200">
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDate(b.billedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {b.labPartner?.labName || '—'}
                          </span>
                          {b.labPartner?.city && (
                            <span className="text-xs text-muted-foreground">
                              {b.labPartner.city}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {b.doctor?.user?.name || '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {b.externalOrder?.patient?.name || '—'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {b.externalOrder?.testName || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {fmt(b.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {b.commissionPercent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-teal-700">
                        {fmt(b.commissionAmount)}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell font-mono text-sm text-violet-700">
                        {fmt(b.amount - b.commissionAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {statusBadge(b.paymentStatus)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {b.paymentStatus === 'Paid' && b.paidAt
                          ? formatDate(b.paidAt)
                          : '—'}
                        {b.transactionRef && b.paymentStatus === 'Paid' && (
                          <div className="text-[10px] text-emerald-600 truncate max-w-[140px]">
                            {b.transactionRef}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
