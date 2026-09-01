'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Receipt,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Building2,
  Stethoscope,
} from 'lucide-react'

import RazorpayCheckout from '@/components/payment/RazorpayCheckout'

// ============ Types ============

interface IpdPayment {
  id: string
  receiptNo: string
  amount: number
  paymentMethod: string
  paymentDate: string
}

interface IpdBill {
  id: string
  billNo: string
  status: string
  totalAmount: number
  netPayable: number
  advanceAdjusted: number
  discountAmount: number
  paidAmount: number
  balance: number
  generatedAt: string | null
  finalizedAt: string | null
  createdAt: string
  admissionNo: string
  patientName: string
  hospitalName: string
  wardName: string
  payments: IpdPayment[]
}

interface OpdBill {
  id: string
  receiptNo: string
  totalAmount: number
  paymentMethod: string
  paymentDate: string
  status: string
  createdAt: string
  patientName: string
  doctorName: string
  hospitalName: string
}

interface GatewayTransaction {
  id: string
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  amount: number
  currency: string
  status: string
  errorMessage: string
  createdAt: string
  updatedAt: string
}

interface PatientBillsResponse {
  ipdBills: IpdBill[]
  opdBills: OpdBill[]
  gatewayTransactions: GatewayTransaction[]
}

// ============ Helpers ============

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function getBillStatusBadge(status: string) {
  switch (status) {
    case 'Paid':
      return (
        <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
        </Badge>
      )
    case 'PartiallyPaid':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <Clock className="h-3 w-3 mr-1" /> Partial
        </Badge>
      )
    case 'Draft':
      return (
        <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <Clock className="h-3 w-3 mr-1" /> Draft
        </Badge>
      )
    case 'Final':
      return (
        <Badge variant="outline" className="border-teal-500 text-teal-700 bg-teal-50 dark:bg-teal-950/30">
          <AlertCircle className="h-3 w-3 mr-1" /> Final
        </Badge>
      )
    case 'Failed':
      return (
        <Badge variant="outline" className="border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/30">
          <AlertCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getGatewayStatusBadge(status: string) {
  switch (status) {
    case 'Captured':
      return (
        <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">
          Captured
        </Badge>
      )
    case 'Created':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30">
          Pending
        </Badge>
      )
    case 'Failed':
      return (
        <Badge variant="outline" className="border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/30">
          Failed
        </Badge>
      )
    case 'Refunded':
      return (
        <Badge variant="outline" className="border-violet-500 text-violet-700 bg-violet-50 dark:bg-violet-950/30">
          Refunded
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// ============ Component ============

export default function PatientBillsClient() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch, isFetching } = useQuery<PatientBillsResponse>({
    queryKey: ['patient-bills'],
    queryFn: async () => {
      const res = await fetch('/api/patient/bills')
      if (!res.ok) throw new Error('Failed to load bills')
      return res.json()
    },
  })

  const ipdBills = data?.ipdBills || []
  const opdBills = data?.opdBills || []
  const gatewayTransactions = data?.gatewayTransactions || []

  const totalOutstanding = ipdBills
    .filter((b) => b.status !== 'Paid' && b.status !== 'Draft')
    .reduce((sum, b) => sum + b.balance, 0)

  const totalPaid = ipdBills.reduce((sum, b) => sum + b.paidAmount, 0)
  const paidBillCount = ipdBills.filter((b) => b.status === 'Paid').length

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success(`Payment successful!`, {
      description: `Razorpay payment ID: ${paymentId}`,
    })
    queryClient.invalidateQueries({ queryKey: ['patient-bills'] })
  }

  const handlePaymentError = (message: string) => {
    if (message === 'Payment cancelled') {
      toast.info('Payment cancelled')
    } else {
      toast.error('Payment failed', { description: message })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
            <Receipt className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">My Bills &amp; Payments</h1>
            <p className="text-sm text-muted-foreground">View and pay your hospital bills online</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-teal-200 dark:border-teal-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-teal-600" />
              <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
            </div>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {formatCurrency(totalOutstanding)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-medium text-muted-foreground">Total Paid</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-violet-600" />
              <p className="text-xs font-medium text-muted-foreground">Bills Settled</p>
            </div>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {paidBillCount} / {ipdBills.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* IPD Bills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-teal-600" />
            IPD Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : ipdBills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No IPD bills yet</p>
            </div>
          ) : (
            <div className="max-h-[36rem] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {ipdBills.map((bill) => {
                  const canPay =
                    (bill.status === 'Final' || bill.status === 'PartiallyPaid') &&
                    bill.balance > 0
                  return (
                    <motion.div
                      key={bill.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b last:border-b-0 p-4 sm:p-5 hover:bg-muted/30 transition-colors"
                    >
                      {/* Top row */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-50">
                              {bill.billNo}
                            </span>
                            {getBillStatusBadge(bill.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {bill.hospitalName || '—'}
                            </span>
                            {bill.wardName && (
                              <span className="inline-flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                {bill.wardName}
                              </span>
                            )}
                            <span>Admission: {bill.admissionNo}</span>
                            <span>Generated: {formatDate(bill.generatedAt)}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Net Payable</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                            {formatCurrency(bill.netPayable)}
                          </p>
                        </div>
                      </div>

                      {/* Amounts grid */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-muted/40 rounded p-2">
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-semibold">{formatCurrency(bill.totalAmount)}</p>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <p className="text-muted-foreground">Already Paid</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(bill.paidAmount)}
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <p className="text-muted-foreground">Advance Adjusted</p>
                          <p className="font-semibold">{formatCurrency(bill.advanceAdjusted)}</p>
                        </div>
                        <div className="bg-teal-50 dark:bg-teal-950/30 rounded p-2">
                          <p className="text-muted-foreground">Balance Due</p>
                          <p className="font-bold text-teal-700 dark:text-teal-300">
                            {formatCurrency(bill.balance)}
                          </p>
                        </div>
                      </div>

                      {/* Payments history + Pay button */}
                      {bill.payments.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div className="text-xs">
                            <p className="font-medium text-muted-foreground mb-1">
                              Payment History ({bill.payments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {bill.payments.map((p) => (
                                <span
                                  key={p.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                                >
                                  <CreditCard className="h-3 w-3" />
                                  {p.paymentMethod} · {formatCurrency(p.amount)} · {formatDate(p.paymentDate)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {canPay && (
                        <div className="mt-3 flex justify-end">
                          <RazorpayCheckout
                            type="ipd-bill"
                            entityId={bill.id}
                            amount={bill.balance}
                            description={`IPD Bill ${bill.billNo} — ${bill.hospitalName}`}
                            label="Pay Balance"
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                        </div>
                      )}

                      {bill.status === 'Draft' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Draft bill — payment will be available once finalized by the hospital.</span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OPD Bills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            OPD Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : opdBills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No OPD bills yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opdBills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-sm">{b.receiptNo}</TableCell>
                      <TableCell>{b.doctorName || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.hospitalName || '—'}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(b.totalAmount)}</TableCell>
                      <TableCell className="text-sm">{b.paymentMethod}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(b.paymentDate)}</TableCell>
                      <TableCell>{getBillStatusBadge(b.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Online Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-teal-600" />
            Recent Online Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : gatewayTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No online transactions yet</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gatewayTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">
                        {t.razorpayOrderId || '—'}
                        {t.razorpayPaymentId && (
                          <span className="block text-muted-foreground">{t.razorpayPaymentId}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                      <TableCell>{getGatewayStatusBadge(t.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help link */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          Need help with a bill?{' '}
          <Link href="/dashboard/patient/appointments" className="text-teal-600 hover:underline inline-flex items-center">
            Contact the hospital <ChevronRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  )
}
