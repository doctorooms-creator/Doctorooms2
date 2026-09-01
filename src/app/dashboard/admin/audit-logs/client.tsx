'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ScrollText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  Copy,
  Eye,
  Loader2,
  Activity,
  Users,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDateTime } from '@/lib/print-utils'

// ─── Types ───────────────────────────────────────────────────────────────

interface AuditLogEntry {
  id: string
  userId?: string | null
  userRole: string
  userName: string
  action: string
  entityType: string
  entityId: string
  description: string
  beforeJson: string
  afterJson: string
  metadata: string
  ipAddress: string
  userAgent: string
  severity: string
  hospitalId?: string | null
  timestamp: string
}

interface AuditLogFilters {
  actions: string[]
  entityTypes: string[]
  severities: string[]
}

interface AuditLogResponse {
  logs: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  filters: AuditLogFilters
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function startOfDayISO(daysAgo: number): string {
  // returns ISO string for `daysAgo` days back at start of day local time
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function hoursAgoISO(hoursAgo: number): string {
  const d = new Date()
  d.setHours(d.getHours() - hoursAgo)
  return d.toISOString()
}

function severityBadge(severity: string) {
  const map: Record<string, string> = {
    info: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-0 dark:bg-zinc-800/60 dark:text-zinc-300',
    warning:
      'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 dark:bg-amber-950/40 dark:text-amber-300',
    critical:
      'bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-950/40 dark:text-rose-300',
  }
  return (
    <Badge className={map[severity] || map.info}>
      {severity || 'info'}
    </Badge>
  )
}

function actionBadge(action: string) {
  const map: Record<string, string> = {
    create:
      'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 dark:bg-emerald-950/40 dark:text-emerald-300',
    update:
      'bg-teal-100 text-teal-700 hover:bg-teal-100 border-0 dark:bg-teal-950/40 dark:text-teal-300',
    delete:
      'bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-950/40 dark:text-rose-300',
    status_change:
      'bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 dark:bg-violet-950/40 dark:text-violet-300',
    login: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-0 dark:bg-zinc-800/60 dark:text-zinc-300',
    logout: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-0 dark:bg-zinc-800/60 dark:text-zinc-300',
  }
  return (
    <Badge className={map[action] || map.login}>
      {action || '—'}
    </Badge>
  )
}

function roleBadge(role: string) {
  if (!role) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
      {role}
    </span>
  )
}

function truncate(s: string | null | undefined, max = 8): string {
  if (!s) return '—'
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function prettyJson(raw: string | null | undefined): string {
  if (!raw) return '{}'
  try {
    const parsed = JSON.parse(raw)
    if (Object.keys(parsed).length === 0) return '{}'
    return JSON.stringify(parsed, null, 2)
  } catch {
    return raw
  }
}

function hasMetadata(log: AuditLogEntry): boolean {
  const before = prettyJson(log.beforeJson)
  const after = prettyJson(log.afterJson)
  const meta = prettyJson(log.metadata)
  return (
    before !== '{}' || after !== '{}' || meta !== '{}' || log.ipAddress || log.userAgent
  )
}

// ─── Component ────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

export default function AuditLogsClient() {
  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Row detail dialog
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  // Debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, actionFilter, entityTypeFilter, severityFilter, startDate, endDate, pageSize])

  // Build query string
  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    p.set('page', String(page))
    p.set('pageSize', String(pageSize))
    if (debouncedSearch) p.set('search', debouncedSearch)
    if (actionFilter !== 'all') p.set('action', actionFilter)
    if (entityTypeFilter !== 'all') p.set('entityType', entityTypeFilter)
    if (severityFilter !== 'all') p.set('severity', severityFilter)
    if (startDate) {
      // Treat as start-of-day
      const d = new Date(startDate + 'T00:00:00')
      if (!isNaN(d.getTime())) p.set('startDate', d.toISOString())
    }
    if (endDate) {
      // Treat as end-of-day
      const d = new Date(endDate + 'T23:59:59')
      if (!isNaN(d.getTime())) p.set('endDate', d.toISOString())
    }
    return p.toString()
  }, [page, pageSize, debouncedSearch, actionFilter, entityTypeFilter, severityFilter, startDate, endDate])

  const queryKey = useMemo(
    () => ['audit-logs', queryParams] as const,
    [queryParams]
  )

  const { data, isLoading, error, isFetching } = useQuery<AuditLogResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/audit-logs?${queryParams}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to load audit logs')
      }
      return res.json()
    },
    placeholderData: keepPreviousData,
  })

  // Surface fetch errors as a toast
  useEffect(() => {
    if (error) {
      toast.error((error as Error).message || 'Failed to load audit logs')
    }
  }, [error])

  // ── Stats queries (last 7 days / 24h) ───────────────────────────────────

  const sevenDaysAgoISO = useMemo(() => startOfDayISO(7), [])
  const twentyFourHoursAgoISO = useMemo(() => hoursAgoISO(24), [])

  const totalStatsQ = useQuery<AuditLogResponse>({
    queryKey: ['audit-logs-stat', 'total', sevenDaysAgoISO] as const,
    queryFn: async () => {
      const res = await fetch(
        `/api/audit-logs?pageSize=1&page=1&startDate=${encodeURIComponent(sevenDaysAgoISO)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to load total')
      return res.json()
    },
  })

  const criticalStatsQ = useQuery<AuditLogResponse>({
    queryKey: ['audit-logs-stat', 'critical', sevenDaysAgoISO] as const,
    queryFn: async () => {
      const res = await fetch(
        `/api/audit-logs?pageSize=1&page=1&severity=critical&startDate=${encodeURIComponent(sevenDaysAgoISO)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to load critical')
      return res.json()
    },
  })

  const warningStatsQ = useQuery<AuditLogResponse>({
    queryKey: ['audit-logs-stat', 'warning', sevenDaysAgoISO] as const,
    queryFn: async () => {
      const res = await fetch(
        `/api/audit-logs?pageSize=1&page=1&severity=warning&startDate=${encodeURIComponent(sevenDaysAgoISO)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to load warning')
      return res.json()
    },
  })

  const activeUsersQ = useQuery<AuditLogResponse>({
    queryKey: ['audit-logs-stat', 'active-users', twentyFourHoursAgoISO] as const,
    queryFn: async () => {
      const res = await fetch(
        `/api/audit-logs?pageSize=200&page=1&startDate=${encodeURIComponent(twentyFourHoursAgoISO)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to load active users')
      return res.json()
    },
  })

  const activeUserCount = useMemo(() => {
    const logs = activeUsersQ.data?.logs ?? []
    const ids = new Set<string>()
    for (const l of logs) {
      if (l.userId) ids.add(l.userId)
    }
    return ids.size
  }, [activeUsersQ.data])

  const hasActiveFilters =
    !!debouncedSearch ||
    actionFilter !== 'all' ||
    entityTypeFilter !== 'all' ||
    severityFilter !== 'all' ||
    !!startDate ||
    !!endDate

  function clearFilters() {
    setSearch('')
    setActionFilter('all')
    setEntityTypeFilter('all')
    setSeverityFilter('all')
    setStartDate('')
    setEndDate('')
  }

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'))
  }

  // Action options: known set + any extras from API filters
  const actionOptions = useMemo(() => {
    const known = ['create', 'update', 'delete', 'status_change', 'login', 'logout']
    const extra = (data?.filters.actions || []).filter((a) => !known.includes(a))
    return [...known, ...extra]
  }, [data?.filters.actions])

  const entityTypeOptions = data?.filters.entityTypes || []
  const severityOptions = useMemo(() => {
    const known = ['info', 'warning', 'critical']
    const extra = (data?.filters.severities || []).filter((s) => !known.includes(s))
    return [...known, ...extra]
  }, [data?.filters.severities])

  // Stat cards
  const statCards = [
    {
      label: 'Total Logs (7d)',
      value: totalStatsQ.data?.total ?? '—',
      icon: ScrollText,
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300',
      loading: totalStatsQ.isLoading,
    },
    {
      label: 'Critical (7d)',
      value: criticalStatsQ.data?.total ?? '—',
      icon: AlertCircle,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
      loading: criticalStatsQ.isLoading,
    },
    {
      label: 'Warnings (7d)',
      value: warningStatsQ.data?.total ?? '—',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
      loading: warningStatsQ.isLoading,
    },
    {
      label: 'Active Users (24h)',
      value: activeUserCount || '—',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
      loading: activeUsersQ.isLoading,
    },
  ]

  const logs = data?.logs ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? page

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-teal-600" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track every action across the platform — who did what, when, with what context.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-tight">
                      {s.loading ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        s.value
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-20">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {/* Search */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="audit-search"
                    className="text-xs text-muted-foreground"
                  >
                    <Search className="h-3 w-3 inline mr-1" />
                    Search
                  </Label>
                  <Input
                    id="audit-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by user or description…"
                    className="w-full sm:w-[240px]"
                  />
                </div>

                {/* Action */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="audit-action"
                    className="text-xs text-muted-foreground"
                  >
                    Action
                  </Label>
                  <Select
                    value={actionFilter}
                    onValueChange={setActionFilter}
                  >
                    <SelectTrigger id="audit-action" className="w-full sm:w-[160px]">
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actionOptions.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Type */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="audit-entity"
                    className="text-xs text-muted-foreground"
                  >
                    Entity Type
                  </Label>
                  <Select
                    value={entityTypeFilter}
                    onValueChange={setEntityTypeFilter}
                  >
                    <SelectTrigger id="audit-entity" className="w-full sm:w-[170px]">
                      <SelectValue placeholder="All Entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {entityTypeOptions.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="audit-severity"
                    className="text-xs text-muted-foreground"
                  >
                    Severity
                  </Label>
                  <Select
                    value={severityFilter}
                    onValueChange={setSeverityFilter}
                  >
                    <SelectTrigger id="audit-severity" className="w-full sm:w-[140px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {severityOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date range */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="audit-start"
                    className="text-xs text-muted-foreground"
                  >
                    Start Date
                  </Label>
                  <Input
                    id="audit-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-[160px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="audit-end"
                    className="text-xs text-muted-foreground"
                  >
                    End Date
                  </Label>
                  <Input
                    id="audit-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-[160px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear Filters
                  </Button>
                )}
                <Badge
                  variant="outline"
                  className="font-normal text-xs hidden sm:inline-flex"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {total} {total === 1 ? 'log' : 'logs'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {isLoading && !data ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">
                No audit logs match the current filters.
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Try widening the date range or clearing your filters.
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="min-w-[150px]">Timestamp</TableHead>
                    <TableHead className="min-w-[180px]">User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead className="min-w-[240px]">Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-center">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-slate-200 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {log.userName || '—'}
                          </span>
                          {roleBadge(log.userRole)}
                        </div>
                      </TableCell>
                      <TableCell>{actionBadge(log.action)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.entityType || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1">
                          <span
                            className="text-xs font-mono text-muted-foreground"
                            title={log.entityId}
                          >
                            {truncate(log.entityId, 10) || '—'}
                          </span>
                          {log.entityId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(log.entityId)
                              }}
                              className="text-muted-foreground hover:text-teal-600 transition-colors p-1"
                              aria-label="Copy entity ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="line-clamp-2">{log.description || '—'}</span>
                      </TableCell>
                      <TableCell>{severityBadge(log.severity)}</TableCell>
                      <TableCell className="text-center">
                        {hasMetadata(log) ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-teal-600 transition-colors p-1.5 rounded-md hover:bg-muted/60"
                                aria-label="View metadata"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[420px] max-h-[400px] overflow-y-auto"
                              align="center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="space-y-3">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Metadata Snapshot
                                </div>
                                <JsonBlock
                                  label="Before"
                                  raw={log.beforeJson}
                                />
                                <JsonBlock
                                  label="After"
                                  raw={log.afterJson}
                                />
                                <JsonBlock
                                  label="Metadata"
                                  raw={log.metadata}
                                />
                                {log.ipAddress && (
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">IP:</span>{' '}
                                    <span className="font-mono">{log.ipAddress}</span>
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
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

      {/* Pagination footer */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
              <span className="font-semibold text-foreground">{totalPages}</span>{' '}
              <span className="text-muted-foreground">({total} total)</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Full-log detail dialog */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      >
        <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              Audit Log Entry
            </DialogTitle>
            <DialogDescription>
              Full detail of a single audit log entry, captured at{' '}
              {selectedLog ? formatDateTime(selectedLog.timestamp) : '—'}.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <DetailItem label="Log ID">
                  <span className="font-mono text-xs">{selectedLog.id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedLog.id)}
                    className="text-muted-foreground hover:text-teal-600 transition-colors ml-1 inline-flex"
                    aria-label="Copy log ID"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </DetailItem>
                <DetailItem label="Timestamp">
                  {formatDateTime(selectedLog.timestamp)}
                </DetailItem>
                <DetailItem label="Severity">
                  {severityBadge(selectedLog.severity)}
                </DetailItem>
                <DetailItem label="Action">
                  {actionBadge(selectedLog.action)}
                </DetailItem>
                <DetailItem label="User Name">
                  {selectedLog.userName || '—'}
                </DetailItem>
                <DetailItem label="User Role">
                  {roleBadge(selectedLog.userRole)}
                </DetailItem>
                <DetailItem label="User ID">
                  {selectedLog.userId ? (
                    <span className="font-mono text-xs">{selectedLog.userId}</span>
                  ) : (
                    <span className="text-muted-foreground">system</span>
                  )}
                </DetailItem>
                <DetailItem label="Hospital ID">
                  {selectedLog.hospitalId ? (
                    <span className="font-mono text-xs">{selectedLog.hospitalId}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DetailItem>
                <DetailItem label="Entity Type">
                  {selectedLog.entityType || '—'}
                </DetailItem>
                <DetailItem label="Entity ID">
                  {selectedLog.entityId ? (
                    <span className="font-mono text-xs">{selectedLog.entityId}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DetailItem>
                <DetailItem label="IP Address">
                  {selectedLog.ipAddress ? (
                    <span className="font-mono text-xs">{selectedLog.ipAddress}</span>
                  ) : (
                    '—'
                  )}
                </DetailItem>
                <DetailItem label="User Agent">
                  <span className="text-xs text-muted-foreground break-all line-clamp-2">
                    {selectedLog.userAgent || '—'}
                  </span>
                </DetailItem>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Description
                </div>
                <p className="text-sm leading-relaxed">
                  {selectedLog.description || '—'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <JsonBlock
                  label="Before"
                  raw={selectedLog.beforeJson}
                  expanded
                />
                <JsonBlock
                  label="After"
                  raw={selectedLog.afterJson}
                  expanded
                />
                <JsonBlock
                  label="Metadata"
                  raw={selectedLog.metadata}
                  expanded
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────

function DetailItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function JsonBlock({
  label,
  raw,
  expanded = false,
}: {
  label: string
  raw: string | null | undefined
  expanded?: boolean
}) {
  const text = prettyJson(raw)
  const isEmpty = text === '{}'
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      {isEmpty ? (
        <span className="text-xs text-muted-foreground italic">empty</span>
      ) : (
        <pre
          className={`text-xs font-mono bg-muted/60 dark:bg-muted/30 rounded-md border border-border p-3 overflow-x-auto ${
            expanded ? 'max-h-[280px] overflow-y-auto' : 'max-h-[160px] overflow-y-auto'
          }`}
        >
          {text}
        </pre>
      )}
    </div>
  )
}
