'use client'

/**
 * Admin Growth Analytics — consumes the (previously orphaned) /api/admin/analytics
 * funnel API and renders it as a proper dashboard:
 *   - KPI cards (wall views → upgrades, conversion rate, founder interest)
 *   - Daily trend area chart (last N days)
 *   - Per-source conversion horizontal bars (which upgrade trigger WORKS)
 *   - Detailed funnel table with progress bars
 * Window selector: 30 / 60 / 90 days.
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Eye,
  CreditCard,
  Sparkles,
  TrendingUp,
  RefreshCw,
  MousePointerClick,
  Filter,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface FunnelResponse {
  since: string
  totals: { type: string; source: string; count: number; lastAt: string }[]
  conversions: { source: string; viewed: number; upgraded: number; ratePct: number }[]
  daily: { date: string; wallViewed: number; wallUpgraded: number; founderInterest: number }[]
  grandTotals: { wallViewed: number; wallUpgraded: number; founderInterest: number; reportViewed: number }
}

const WINDOWS = [30, 60, 90] as const

const SOURCE_LABELS: Record<string, string> = {
  ai: 'AI Copilot wall',
  whatsapp: 'WhatsApp reminders',
  receptionist_seats: 'Receptionist seats',
  nurse_seats: 'Nurse seats',
  doctor_seats: 'Doctor seats',
  lost_revenue: 'Lost Revenue report',
  earnings_banner: 'Earnings banner',
  dashboard_banner: 'Dashboard banner',
  billing_page: 'Billing page',
}

const BAR_COLORS = [
  '#0d9488', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f97316', '#64748b',
]

const fmtDate = (d: string) => {
  try {
    return format(parseISO(d), 'dd MMM')
  } catch {
    return d
  }
}

export function AnalyticsClient() {
  const [days, setDays] = useState<(typeof WINDOWS)[number]>(30)

  const { data, isLoading, isFetching, refetch } = useQuery<FunnelResponse>({
    queryKey: ['admin-analytics', days],
    queryFn: () => fetch(`/api/admin/analytics?days=${days}`).then((r) => r.json()),
  })

  const overallRate =
    data && data.grandTotals.wallViewed > 0
      ? Math.round((data.grandTotals.wallUpgraded / data.grandTotals.wallViewed) * 1000) / 10
      : 0

  const dailyChart = data?.daily ?? []
  const conversions = data?.conversions ?? []
  const maxViewed = Math.max(1, ...conversions.map((c) => c.viewed))

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <TrendingUp className="h-6 w-6 text-teal-600" aria-hidden="true" />
            Growth Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upgrade funnel — kaunsa trigger doctors ko Pro par le ja raha hai
            {data?.since ? ` (since ${fmtDate(data.since.slice(0, 10))})` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted/50 p-0.5" role="group" aria-label="Time window">
            {WINDOWS.map((w) => (
              <button
                key={w}
                onClick={() => setDays(w)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === w
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-pressed={days === w}
              >
                {w}d
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh analytics"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-3 h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          [
            {
              icon: Eye,
              label: 'Wall Views',
              value: data?.grandTotals.wallViewed ?? 0,
              hint: 'Doctors who hit an upgrade wall',
              color: 'text-teal-600',
            },
            {
              icon: CreditCard,
              label: 'Upgrades',
              value: data?.grandTotals.wallUpgraded ?? 0,
              hint: 'Wall views that converted',
              color: 'text-emerald-600',
            },
            {
              icon: Sparkles,
              label: 'Founder Interest',
              value: data?.grandTotals.founderInterest ?? 0,
              hint: '₹4,999 lifetime plan clicks',
              color: 'text-amber-600',
            },
            {
              icon: TrendingUp,
              label: 'Conversion Rate',
              value: `${overallRate}%`,
              hint: 'Views → upgrades overall',
              color: 'text-violet-600',
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {kpi.label}
                    </span>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} aria-hidden="true" />
                  </div>
                  <p className="text-3xl font-bold tabular-nums tracking-tight">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString('en-IN') : kpi.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* ── Daily trend chart ───────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-teal-600" aria-hidden="true" />
            Daily Funnel Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : dailyChart.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <MousePointerClick className="mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Is window me koi event nahi</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upgrade walls fire hone par analytics yahan dikhega.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChart} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gViewed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gUpgraded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="gFounder" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDate}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-muted-foreground"
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    labelFormatter={(l) => fmtDate(String(l))}
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wallViewed"
                    name="Wall views"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fill="url(#gViewed)"
                  />
                  <Area
                    type="monotone"
                    dataKey="wallUpgraded"
                    name="Upgrades"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#gUpgraded)"
                  />
                  <Area
                    type="monotone"
                    dataKey="founderInterest"
                    name="Founder interest"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#gFounder)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Per-source conversions ──────────────────────────────────── */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-amber-600" aria-hidden="true" />
            Kaunsa Trigger Kaam Kar Raha Hai?
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : conversions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Conversion data abhi collect ho raha hai.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversions.map((c) => ({
                      name: SOURCE_LABELS[c.source] ?? c.source,
                      viewed: c.viewed,
                      upgraded: c.upgraded,
                    }))}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                    barSize={14}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={140}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="viewed" name="Wall views" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="upgraded" name="Upgrades" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Funnel table */}
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Trigger source</TableHead>
                      <TableHead className="text-right text-xs">Viewed</TableHead>
                      <TableHead className="text-right text-xs">Upgraded</TableHead>
                      <TableHead className="w-40 text-xs">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversions.map((c, i) => (
                      <TableRow key={c.source}>
                        <TableCell className="py-2.5 text-sm font-medium">
                          {SOURCE_LABELS[c.source] ?? c.source}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {c.viewed}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {c.upgraded}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                              role="progressbar"
                              aria-valuenow={c.ratePct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Conversion ${c.ratePct}%`}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, c.ratePct)}%`,
                                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                                }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs font-semibold tabular-nums">
                              {c.ratePct}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {conversions.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  <Badge variant="secondary" className="mr-1.5 text-[10px]">
                    Insight
                  </Badge>
                  Sabse zyada conversion rate wale trigger par double down karo — wahi messaging
                  pricing page aur WhatsApp creatives me reuse karo.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
