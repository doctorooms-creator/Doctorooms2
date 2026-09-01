'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  RefreshCw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, PieChart,
} from 'lucide-react'
import { format, subMonths } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts'

interface PlData {
  fromDate: string
  toDate: string
  revenue: number
  expenses: number
  netProfit: number
  profitMargin: number
  monthlyData: Array<{ month: string; revenue: number; expenses: number; profit: number }>
  expenseByCategory: Array<{ category: string; amount: number }>
}

const PIE_COLORS = ['#0d9488', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const fmtK = (n: number) =>
  Math.abs(n) >= 10000000
    ? `₹${(n / 10000000).toFixed(2)}Cr`
    : Math.abs(n) >= 100000
    ? `₹${(n / 100000).toFixed(2)}L`
    : Math.abs(n) >= 1000
    ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n.toFixed(0)}`

export default function ProfitLossClient() {
  const now = new Date()
  const [fromDate, setFromDate] = useState(format(subMonths(now, 5), 'yyyy-MM-dd'))
  const [toDate, setToDate] = useState(format(now, 'yyyy-MM-dd'))

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['pnl-report', fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('fromDate', fromDate)
      params.set('toDate', toDate)
      const res = await fetch(`/api/reports/financial/profit-loss?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load P&L report')
      return res.json()
    },
  })

  const pl = data as PlData | undefined

  // Memoised chart data
  const chartData = useMemo(() => pl?.monthlyData || [], [pl])
  const pieData = useMemo(
    () => (pl?.expenseByCategory || []).map((d) => ({ name: d.category, value: d.amount })),
    [pl]
  )
  const totalPieValue = pieData.reduce((s, d) => s + d.value, 0)

  const setQuickRange = (months: number) => {
    setFromDate(format(subMonths(now, months - 1), 'yyyy-MM-dd'))
    setToDate(format(now, 'yyyy-MM-dd'))
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profit & Loss Report</h1>
          <p className="text-muted-foreground text-sm">
            Compare revenue, expenses, and net profit across a date range
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Date range filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div>
              <Label htmlFor="fromDate" className="text-xs">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="toDate" className="text-xs">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickRange(1)}>This Month</Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(3)}>3M</Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(6)}>6M</Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(12)}>1Y</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Total Revenue</p>
                <p className={`text-2xl font-bold text-emerald-600 ${isLoading ? 'opacity-0' : ''}`}>
                  {pl ? fmt(pl.revenue) : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Total Expenses</p>
                <p className={`text-2xl font-bold text-rose-600 ${isLoading ? 'opacity-0' : ''}`}>
                  {pl ? fmt(pl.expenses) : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5">
                <ArrowDownRight className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Net Profit</p>
                <p className={`text-2xl font-bold ${(pl?.netProfit ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'} ${isLoading ? 'opacity-0' : ''}`}>
                  {pl ? fmt(pl.netProfit) : '—'}
                </p>
                <p className="text-muted-foreground text-xs">Margin: {pl?.profitMargin ?? 0}%</p>
              </div>
              <div className={`rounded-lg p-2.5 ${(pl?.netProfit ?? 0) >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                {(pl?.netProfit ?? 0) >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-rose-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly comparison bar chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-teal-600" /> Monthly Comparison — Revenue vs Expenses vs Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              No data for the selected range
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => fmtK(Number(v))} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value: number, name: string) => [fmt(value), name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense by category pie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <PieChart className="h-4 w-4 text-amber-600" /> Expense by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : pieData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No paid expenses in the selected range
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: { name: string; value: number }) =>
                        `${entry.name}: ${((entry.value / totalPieValue) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => fmt(value)} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense by category list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4 text-rose-600" /> Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            ) : (
              <div className="space-y-2">
                {pl?.expenseByCategory.map((c, i) => (
                  <div key={c.category} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="flex-1">{c.category}</span>
                    <span className="font-medium">{fmt(c.amount)}</span>
                    <span className="w-12 text-right text-xs text-muted-foreground">
                      {totalPieValue > 0 ? ((c.amount / totalPieValue) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly breakdown table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pl?.monthlyData.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell className="font-medium">{m.month}</TableCell>
                      <TableCell className="text-right text-emerald-600">{fmt(m.revenue)}</TableCell>
                      <TableCell className="text-right text-rose-600">{fmt(m.expenses)}</TableCell>
                      <TableCell className={`text-right font-bold ${m.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fmt(m.profit)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : '0.0'}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {pl && (
                    <TableRow className="border-t-2 bg-muted/50 font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right text-emerald-600">{fmt(pl.revenue)}</TableCell>
                      <TableCell className="text-right text-rose-600">{fmt(pl.expenses)}</TableCell>
                      <TableCell className={`text-right ${pl.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fmt(pl.netProfit)}
                      </TableCell>
                      <TableCell className="text-right text-xs">{pl.profitMargin}%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
