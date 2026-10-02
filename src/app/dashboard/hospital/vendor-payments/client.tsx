'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CreditCard, Loader2, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ============ Types ============
interface VendorPayment {
  id: string
  hospitalId: string
  vendorId: string
  expenseId: string | null
  paymentNo: string
  amount: number
  paymentMode: string
  paymentRef: string
  paymentDate: string
  notes: string
  createdAt: string
  vendor?: { id: string; name: string; category: string }
  expense?: { id: string; expenseNo: string; totalAmount: number } | null
}

interface Vendor {
  id: string
  name: string
  category: string
  status: string
}

interface Expense {
  id: string
  expenseNo: string
  totalAmount: number
  status: string
  vendorId: string | null
}

const PAYMENT_MODES = ['Cash', 'Bank', 'UPI', 'Cheque', 'NEFT']

const emptyForm = {
  vendorId: '',
  expenseId: '',
  amount: 0,
  paymentMode: 'Bank',
  paymentRef: '',
  paymentDate: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
}

const fmtINR = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

// ============ Component ============
export default function VendorPaymentsClient() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [vendorSearch, setVendorSearch] = useState('')

  // Fetch payments
  const { data: paymentsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['vendor-payments', page],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/vendor-payments?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load vendor payments')
      return res.json()
    },
  })

  // Fetch vendors for the dialog (status=Active)
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors-for-payment', vendorSearch],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('status', 'Active')
      params.set('limit', '50')
      if (vendorSearch) params.set('search', vendorSearch)
      const res = await fetch(`/api/vendors?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load vendors')
      return res.json()
    },
  })
  const vendors: Vendor[] = vendorsData?.data || []

  // Fetch expenses for selected vendor (Approved status, to be paid)
  const { data: vendorExpensesData } = useQuery({
    queryKey: ['vendor-expenses', form.vendorId],
    queryFn: async () => {
      const res = await fetch(`/api/expenses?vendorId=${form.vendorId}&status=Approved&limit=50`)
      if (!res.ok) throw new Error('Failed to load vendor expenses')
      return res.json()
    },
    enabled: !!form.vendorId,
  })
  const vendorExpenses: Expense[] = vendorExpensesData?.data || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const payload: Record<string, unknown> = {
        vendorId: data.vendorId,
        amount: Number(data.amount),
        paymentMode: data.paymentMode,
        paymentRef: data.paymentRef,
        paymentDate: data.paymentDate,
        notes: data.notes,
      }
      if (data.expenseId && data.expenseId !== 'none') payload.expenseId = data.expenseId
      const res = await fetch('/api/vendor-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create payment')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Vendor payment recorded successfully')
      queryClient.invalidateQueries({ queryKey: ['vendor-payments'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      closeDialog()
    },
    onError: (err) => toast.error(err.message),
  })

  const openDialog = () => {
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setForm(emptyForm)
    setVendorSearch('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vendorId) {
      toast.error('Please select a vendor')
      return
    }
    if (form.amount <= 0) {
      toast.error('Amount must be greater than zero')
      return
    }
    createMutation.mutate(form)
  }

  const payments: VendorPayment[] = paymentsData?.data || []
  const total = paymentsData?.total || 0
  const totalPages = paymentsData?.totalPages || 1

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Payments</h1>
          <p className="text-muted-foreground text-sm">
            Record and track payments made to vendors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openDialog} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Payments
            </p>
            <p className="text-2xl font-bold text-teal-600">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Amount (page)
            </p>
            <p className="text-2xl font-bold text-emerald-600">{fmtINR(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Page
            </p>
            <p className="text-2xl font-bold">
              {page}<span className="text-base text-muted-foreground"> / {totalPages}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-medium">No vendor payments yet</h3>
              <p className="text-sm text-muted-foreground">
                Click "Record Payment" to log a payment to a vendor.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment No</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="hidden lg:table-cell">Expense</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden md:table-cell">Mode</TableHead>
                      <TableHead className="hidden lg:table-cell">Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {payments.map((p, index) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15, delay: index * 0.02 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">{p.paymentNo}</TableCell>
                          <TableCell>
                            <div className="font-medium">{p.vendor?.name || '—'}</div>
                            {p.vendor?.category && (
                              <div className="text-xs text-muted-foreground">{p.vendor.category}</div>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {p.expense ? (
                              <Badge variant="secondary">{p.expense.expenseNo}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">On-account</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {format(new Date(p.paymentDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">{p.paymentMode}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {p.paymentRef || '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-emerald-600">
                            {fmtINR(p.amount)}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: Card layout */}
              <div className="space-y-3 p-4 md:hidden">
                {payments.map((p) => (
                  <Card key={p.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-medium">{p.paymentNo}</p>
                        <p className="text-sm text-muted-foreground">{p.vendor?.name || '—'}</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{fmtINR(p.amount)}</p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div>Date: {format(new Date(p.paymentDate), 'dd MMM yyyy')}</div>
                      <div>Mode: {p.paymentMode}</div>
                      <div>Ref: {p.paymentRef || '—'}</div>
                      <div>
                        {p.expense ? `Expense: ${p.expense.expenseNo}` : 'On-account'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Record Vendor Payment</DialogTitle>
            <DialogDescription>
              Log a payment made to a vendor. Optionally link to an existing approved expense.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vendor select with search */}
            <div className="space-y-2">
              <Label htmlFor="vendor-search">Search Vendor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="vendor-search"
                  placeholder="Type to search vendors..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="vendorId">Vendor *</Label>
              <Select
                value={form.vendorId}
                onValueChange={(v) => setForm({ ...form, vendorId: v, expenseId: '' })}
              >
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} {v.category ? `(${v.category})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional: link to an Approved expense */}
            {form.vendorId && (
              <div>
                <Label htmlFor="expenseId">Link to Expense (optional)</Label>
                <Select
                  value={form.expenseId}
                  onValueChange={(v) => {
                    const exp = vendorExpenses.find((e) => e.id === v)
                    setForm({
                      ...form,
                      expenseId: v,
                      amount: exp ? exp.totalAmount : form.amount,
                    })
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="On-account (no specific expense)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">On-account (no specific expense)</SelectItem>
                    {vendorExpenses.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.expenseNo} — {fmtINR(e.totalAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vendorExpenses.length === 0 && form.vendorId && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    No approved expenses found for this vendor.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select
                  value={form.paymentMode}
                  onValueChange={(v) => setForm({ ...form, paymentMode: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentRef">Payment Reference</Label>
                <Input
                  id="paymentRef"
                  value={form.paymentRef}
                  onChange={(e) => setForm({ ...form, paymentRef: e.target.value })}
                  placeholder="UTR / Cheque no."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
