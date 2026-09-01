'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Receipt, RefreshCw, Wallet, CheckCircle2, Clock, TrendingUp, Eye,
} from 'lucide-react'
import { format } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ============ Types ============
interface Expense {
  id: string
  expenseNo: string
  expenseDate: string
  amount: number
  taxAmount: number
  totalAmount: number
  paymentMode: string
  status: string
  description: string
  category: { id: string; name: string; type: string }
  vendor: { id: string; name: string } | null
}

interface ExpenseSummary {
  pending: { count: number; total: number }
  approved: { count: number; total: number }
  paidThisMonth: { count: number; total: number }
  all: { count: number; total: number }
}

// ============ Component ============
export default function ExpensesClient() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [vendorId, setVendorId] = useState('all')
  const [status, setStatus] = useState('all')

  // Fetch expense categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await fetch('/api/expense-categories')
      if (!res.ok) throw new Error('Failed to load categories')
      return res.json()
    },
  })
  const categories = categoriesData?.data || []

  // Fetch vendors for filter
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors-for-filter'],
    queryFn: async () => {
      const res = await fetch('/api/vendors?limit=100')
      if (!res.ok) throw new Error('Failed to load vendors')
      return res.json()
    },
  })
  const vendors = vendorsData?.data || []

  // Fetch expenses with filters
  const { data: expensesData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['expenses', { page, fromDate, toDate, categoryId, vendorId, status }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (fromDate) params.set('fromDate', fromDate)
      if (toDate) params.set('toDate', toDate)
      if (categoryId !== 'all') params.set('categoryId', categoryId)
      if (vendorId !== 'all') params.set('vendorId', vendorId)
      if (status !== 'all') params.set('status', status)
      const res = await fetch(`/api/expenses?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load expenses')
      return res.json()
    },
  })

  const expenses: Expense[] = expensesData?.data || []
  const summary: ExpenseSummary = expensesData?.summary || {
    pending: { count: 0, total: 0 },
    approved: { count: 0, total: 0 },
    paidThisMonth: { count: 0, total: 0 },
    all: { count: 0, total: 0 },
  }
  const total = expensesData?.total || 0
  const totalPages = expensesData?.totalPages || 1

  const fmtINR = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60',
      Approved: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60',
      Paid: 'bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60',
      Cancelled: 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60',
      Rejected: 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60',
    }
    return map[s] || 'bg-muted text-muted-foreground'
  }

  const categoryChip = (name: string) => (
    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
      {name}
    </span>
  )

  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setCategoryId('all')
    setVendorId('all')
    setStatus('all')
    setPage(1)
  }

  const hasActiveFilters =
    fromDate !== '' || toDate !== '' || categoryId !== 'all' || vendorId !== 'all' || status !== 'all'

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm">
            Track, approve, and pay operating & capital expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => router.push('/dashboard/hospital/expenses/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{fmtINR(summary.pending.total)}</p>
                <p className="text-xs text-muted-foreground">{summary.pending.count} expenses</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 dark:bg-amber-950/50">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtINR(summary.approved.total)}</p>
                <p className="text-xs text-muted-foreground">{summary.approved.count} expenses</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Paid (this month)</p>
                <p className="text-2xl font-bold tabular-nums text-teal-600 dark:text-teal-400">{fmtINR(summary.paidThisMonth.total)}</p>
                <p className="text-xs text-muted-foreground">{summary.paidThisMonth.count} expenses</p>
              </div>
              <div className="rounded-lg bg-teal-50 p-2.5 dark:bg-teal-950/50">
                <Wallet className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total (all-time)</p>
                <p className="text-2xl font-bold tabular-nums">{fmtINR(summary.all.total)}</p>
                <p className="text-xs text-muted-foreground">{summary.all.count} expenses</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1) }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c: { id: string; name: string }) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Vendor</label>
              <Select value={vendorId} onValueChange={(v) => { setVendorId(v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((v: { id: string; name: string }) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : expenses.length === 0 ? (
            <div className="m-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/50 py-16 text-center dark:border-teal-800 dark:bg-teal-950/20 sm:m-6">
              <div className="rounded-full bg-teal-100 p-3 dark:bg-teal-900/50">
                <Receipt className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-medium">No expenses found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'Record your first expense to start tracking approvals and payments.'}
              </p>
              {!hasActiveFilters && (
                <Button className="mt-2" onClick={() => router.push('/dashboard/hospital/expenses/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Expense
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden lg:table-cell">Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="hidden md:table-cell text-right">Tax</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {expenses.map((e, index) => (
                        <motion.tr
                          key={e.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15, delay: index * 0.02 }}
                          className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                          onClick={() => router.push(`/dashboard/hospital/expenses/${e.id}`)}
                        >
                          <TableCell className="font-medium">{e.expenseNo}</TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(e.expenseDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            {categoryChip(e.category.name)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {e.vendor?.name || '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{fmtINR(e.amount)}</TableCell>
                          <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                            {fmtINR(e.taxAmount)}
                          </TableCell>
                          <TableCell className="text-right font-bold tabular-nums">{fmtINR(e.totalAmount)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(e.status)}`}>
                              {e.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(ev) => {
                                ev.stopPropagation()
                                router.push(`/dashboard/hospital/expenses/${e.id}`)
                              }}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: Card layout */}
              <div className="space-y-3 p-4 md:hidden">
                {expenses.map((e) => (
                  <Card
                    key={e.id}
                    className="cursor-pointer p-4 transition-shadow hover:shadow-md"
                    onClick={() => router.push(`/dashboard/hospital/expenses/${e.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-medium">{e.expenseNo}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(e.expenseDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(e.status)}`}>
                        {e.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        {categoryChip(e.category.name)}
                        {e.vendor && (
                          <p className="mt-1 text-xs text-muted-foreground">{e.vendor.name}</p>
                        )}
                      </div>
                      <p className="text-lg font-bold tabular-nums">{fmtINR(e.totalAmount)}</p>
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
            <span className="flex h-9 items-center px-3 text-sm">
              {page} / {totalPages}
            </span>
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
    </div>
  )
}
