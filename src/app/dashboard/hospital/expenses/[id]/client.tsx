'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Loader2, CheckCircle2, CreditCard, FileText, Building2, Calendar,
  IndianRupee, Receipt, Tag, User, ImageOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PAYMENT_MODES = ['Cash', 'Bank', 'UPI', 'Cheque', 'NEFT']

interface ExpenseData {
  id: string
  expenseNo: string
  expenseDate: string
  amount: number
  taxAmount: number
  totalAmount: number
  paymentMode: string
  paymentRef: string
  paymentDate: string | null
  description: string
  receiptUrl: string
  costCenterType: string
  costCenterId: string | null
  status: string
  approvedBy: string | null
  approvedAt: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  category: { id: string; name: string; type: string; description?: string }
  vendor: { id: string; name: string; category?: string; phoneNo?: string; email?: string } | null
  payments: Array<{
    id: string
    paymentNo: string
    amount: number
    paymentMode: string
    paymentRef: string
    paymentDate: string
    notes: string
  }>
}

const fmtINR = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const statusBadgeClass = (s: string) => {
  switch (s) {
    case 'Pending':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
    case 'Approved':
      return 'bg-teal-100 text-teal-800 hover:bg-teal-200'
    case 'Paid':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
    case 'Cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default function ExpenseDetailClient({ expenseId }: { expenseId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [payForm, setPayForm] = useState({
    paymentMode: 'Bank',
    paymentRef: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
  })

  // Fetch expense detail
  const { data, isLoading, isError } = useQuery({
    queryKey: ['expense-detail', expenseId],
    queryFn: async () => {
      const res = await fetch(`/api/expenses/${expenseId}`)
      if (!res.ok) throw new Error('Failed to load expense')
      return res.json()
    },
  })

  const expense = data?.data as ExpenseData | undefined

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/expenses/${expenseId}/approve`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to approve expense')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Expense approved successfully')
      queryClient.invalidateQueries({ queryKey: ['expense-detail', expenseId] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
    onError: (err) => toast.error(err.message),
  })

  // Pay mutation
  const payMutation = useMutation({
    mutationFn: async (payload: typeof payForm) => {
      const res = await fetch(`/api/expenses/${expenseId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to mark expense as paid')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Expense marked as paid')
      queryClient.invalidateQueries({ queryKey: ['expense-detail', expenseId] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-payments'] })
      setPayDialogOpen(false)
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !expense) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center p-4 md:p-6">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="text-lg font-medium">Expense not found</h3>
        <Button className="mt-4" onClick={() => router.push('/dashboard/hospital/expenses')}>
          Back to list
        </Button>
      </div>
    )
  }

  const timeline = [
    {
      label: 'Created',
      date: expense.createdAt,
      done: true,
      icon: FileText,
      color: 'bg-teal-600',
    },
    {
      label: 'Approved',
      date: expense.approvedAt,
      done: ['Approved', 'Paid'].includes(expense.status),
      icon: CheckCircle2,
      color: 'bg-amber-600',
    },
    {
      label: 'Paid',
      date: expense.paymentDate,
      done: expense.status === 'Paid',
      icon: CreditCard,
      color: 'bg-emerald-600',
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/hospital/expenses')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
              {expense.expenseNo}
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(expense.status)}`}>
                {expense.status}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Created on {format(new Date(expense.createdAt), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {expense.status === 'Pending' && (
            <Button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {approveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          )}
          {expense.status === 'Approved' && (
            <Button
              onClick={() => setPayDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Amount summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-4xl font-bold text-emerald-600">{fmtINR(expense.totalAmount)}</p>
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span>Base: {fmtINR(expense.amount)}</span>
                  <span>Tax: {fmtINR(expense.taxAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details grid */}
          <Card>
            <CardHeader><CardTitle className="text-base">Expense Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Tag className="h-4 w-4" />}
                  label="Category"
                  value={
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{expense.category.name}</Badge>
                      <span className="text-xs text-muted-foreground">{expense.category.type}</span>
                    </div>
                  }
                />
                <DetailItem
                  icon={<Building2 className="h-4 w-4" />}
                  label="Vendor"
                  value={expense.vendor ? expense.vendor.name : '—'}
                />
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Expense Date"
                  value={format(new Date(expense.expenseDate), 'dd MMM yyyy')}
                />
                <DetailItem
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Payment Mode"
                  value={<Badge variant="outline">{expense.paymentMode}</Badge>}
                />
                <DetailItem
                  icon={<Receipt className="h-4 w-4" />}
                  label="Payment Reference"
                  value={expense.paymentRef || '—'}
                />
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Payment Date"
                  value={expense.paymentDate ? format(new Date(expense.paymentDate), 'dd MMM yyyy') : '—'}
                />
                <DetailItem
                  icon={<Building2 className="h-4 w-4" />}
                  label="Cost Center"
                  value={expense.costCenterType ? `${expense.costCenterType}` : '—'}
                />
                <DetailItem
                  icon={<User className="h-4 w-4" />}
                  label="Approved By"
                  value={expense.approvedBy ? format(new Date(expense.approvedAt!), 'dd MMM yyyy') : '—'}
                />
              </div>
              {expense.description && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm">{expense.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor payments for this expense */}
          {expense.payments.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Linked Vendor Payments</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expense.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-medium">{p.paymentNo}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(p.paymentDate), 'dd MMM yyyy')} · {p.paymentMode}
                          {p.paymentRef && ` · ${p.paymentRef}`}
                        </p>
                        {p.notes && <p className="mt-1 text-xs italic text-muted-foreground">{p.notes}</p>}
                      </div>
                      <span className="font-bold text-emerald-600">{fmtINR(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Receipt viewer */}
          <Card>
            <CardHeader><CardTitle className="text-base">Receipt</CardTitle></CardHeader>
            <CardContent>
              {expense.receiptUrl ? (
                <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={expense.receiptUrl}
                    alt="Receipt"
                    className="w-full rounded-lg border object-contain transition-transform hover:scale-105"
                    style={{ maxHeight: 300 }}
                  />
                  <p className="mt-2 text-center text-xs text-muted-foreground">Click to open full size</p>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
                  <ImageOff className="h-10 w-10 opacity-50" />
                  <p className="text-sm">No receipt attached</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Status Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-6">
                {timeline.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                          step.done ? step.color : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-medium ${step.done ? '' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        {step.date ? (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(step.date), 'dd MMM yyyy, hh:mm a')}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Pending</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created by</span>
                <span className="font-medium">{expense.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium">{format(new Date(expense.updatedAt), 'dd MMM yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Expense as Paid</DialogTitle>
            <DialogDescription>
              Record the payment details. {expense.vendor ? `A vendor payment to ${expense.vendor.name} will be created automatically.` : ''}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              payMutation.mutate(payForm)
            }}
            className="space-y-4"
          >
            <div>
              <Label>Amount to Pay</Label>
              <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 font-bold text-emerald-600">
                {fmtINR(expense.totalAmount)}
              </div>
            </div>
            <div>
              <Label htmlFor="payMode">Payment Mode</Label>
              <Select value={payForm.paymentMode} onValueChange={(v) => setPayForm({ ...payForm, paymentMode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payRef">Payment Reference</Label>
              <Input
                id="payRef"
                value={payForm.paymentRef}
                onChange={(e) => setPayForm({ ...payForm, paymentRef: e.target.value })}
                placeholder="UTR / Cheque no."
              />
            </div>
            <div>
              <Label htmlFor="payDate">Payment Date</Label>
              <Input
                id="payDate"
                type="date"
                value={payForm.paymentDate}
                onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={payMutation.isPending}>
                {payMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IndianRupee className="mr-2 h-4 w-4" />}
                Confirm Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  )
}
