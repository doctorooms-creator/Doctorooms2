'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Utensils,
  UtensilsCrossed,
  Salad,
  Plus,
  Pencil,
  PowerOff,
  Printer,
  Search,
  Loader2,
  Activity,
  CalendarClock,
  Ban,
  CalendarPlus,
  BedDouble,
} from 'lucide-react'

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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { formatDate } from '@/lib/print-utils'

// ─── Constants ───────────────────────────────────────────────────────────

const DIET_TYPES = [
  'Soft Diet',
  'Liquid Diet',
  'Regular Diet',
  'Diabetic Diet',
  'Cardiac Diet',
  'High-Protein Diet',
  'Renal Diet',
  'Low-Sodium Diet',
  'NPO (Nil by mouth)',
  'Nasogastric (NG tube feed)',
] as const

const MEAL_TYPES = [
  'All Meals',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'Nasogastric',
] as const

// ─── Types ───────────────────────────────────────────────────────────────

interface AdmissionLite {
  id: string
  admissionNo: string
  patientName: string
  bedNumber?: string
  wardName?: string
  doctorName?: string
}

interface DietOrderRow {
  id: string
  admissionId: string
  dietType: string
  mealType: string
  instructions: string
  startDate: string
  endDate: string | null
  status: string
  stoppedBy?: string | null
  stoppedAt?: string | null
  stoppedReason?: string
  createdAt: string
  admission?: {
    id: string
    admissionNo: string
    patientName: string
    patientAge?: number
    patientGender?: string
    bed?: { bedNumber: string; ward?: { name: string } } | null
  } | null
}

interface FormState {
  admissionId: string
  dietType: string
  mealType: string
  instructions: string
  startDate: string
  endDate: string
}

const todayStr = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const EMPTY_FORM: FormState = {
  admissionId: '',
  dietType: 'Soft Diet',
  mealType: 'All Meals',
  instructions: '',
  startDate: todayStr(),
  endDate: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Diet type with a small icon in a soft teal circle (amber for NPO alerts). */
function dietTypeCell(dietType: string) {
  const dt = dietType.toLowerCase()
  const isNpo = dt.includes('npo') || dt.includes('nil')
  const therapeutic =
    dt.includes('diabetic') ||
    dt.includes('renal') ||
    dt.includes('cardiac') ||
    dt.includes('protein') ||
    dt.includes('sodium')
  const Icon = isNpo ? Ban : therapeutic ? Salad : UtensilsCrossed
  const circle = isNpo
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
    : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${circle}`}
        aria-hidden="true"
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-sm font-medium">{dietType}</span>
    </div>
  )
}

/** Soft rounded-full status chip with a tiny dot. */
function statusBadge(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        Active
      </span>
    )
  }
  if (s === 'stopped') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
        Stopped
      </span>
    )
  }
  // Paused / On-hold / any other non-terminal status
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      {status}
    </span>
  )
}

function isSameDay(iso: string | null | undefined): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function isToday(iso: string): boolean {
  return isSameDay(iso)
}

function truncate(s: string, max = 60): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function admissionLabel(a: AdmissionLite): string {
  const bedWard =
    a.bedNumber || a.wardName
      ? ` (${a.bedNumber || '—'}/${a.wardName || '—'})`
      : ''
  return `${a.admissionNo} — ${a.patientName}${bedWard}`
}

// ─── Component ────────────────────────────────────────────────────────────

export default function DietOrdersClient() {
  const queryClient = useQueryClient()

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [search, setSearch] = useState<string>('')

  // Dialog state (shared for Add + Edit)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // Stop confirmation state
  const [stopId, setStopId] = useState<string | null>(null)
  const [stopReason, setStopReason] = useState<string>('')

  // ── Build query params ────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'All') p.set('status', statusFilter)
    return p.toString()
  }, [statusFilter])

  const queryKey = useMemo(
    () => ['diet-orders', queryParams] as const,
    [queryParams]
  )

  const { data, isLoading, error } = useQuery<{ dietOrders: DietOrderRow[] }>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/diet-orders?${queryParams}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to load diet orders')
      }
      return res.json()
    },
  })

  useEffect(() => {
    if (error) {
      toast.error((error as Error).message || 'Failed to load diet orders')
    }
  }, [error])

  const orders = data?.dietOrders ?? []

  // Client-side search filter (patient name + admissionNo)
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      const name = o.admission?.patientName || ''
      const no = o.admission?.admissionNo || ''
      const diet = o.dietType || ''
      return (
        name.toLowerCase().includes(q) ||
        no.toLowerCase().includes(q) ||
        diet.toLowerCase().includes(q)
      )
    })
  }, [orders, search])

  // Stat cards — compute from the underlying fetch (which already
  // respects the status filter for the in-page list, but the stat cards
  // show "across the loaded set" totals).
  const stats = useMemo(() => {
    const totalActive = orders.filter((o) => o.status === 'Active').length
    const stoppedToday = orders.filter(
      (o) => o.status === 'Stopped' && isToday(o.stoppedAt || '')
    ).length
    const npoCount = orders.filter(
      (o) =>
        o.status === 'Active' &&
        (o.dietType.toLowerCase().includes('npo') ||
          o.dietType.toLowerCase().includes('nil'))
    ).length
    const todayNew = orders.filter((o) => isToday(o.createdAt)).length
    return { totalActive, stoppedToday, npoCount, todayNew }
  }, [orders])

  // ── Mutations ────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      const res = await fetch('/api/diet-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId: payload.admissionId,
          dietType: payload.dietType,
          mealType: payload.mealType,
          instructions: payload.instructions,
          startDate: payload.startDate ? new Date(payload.startDate).toISOString() : undefined,
          endDate: payload.endDate ? new Date(payload.endDate).toISOString() : undefined,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to create diet order')
      return d
    },
    onSuccess: () => {
      toast.success('Diet order added')
      queryClient.invalidateQueries({ queryKey: ['diet-orders'] })
      setDialogOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<FormState>
    }) => {
      const res = await fetch(`/api/diet-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietType: payload.dietType,
          mealType: payload.mealType,
          instructions: payload.instructions,
          endDate: payload.endDate ? new Date(payload.endDate).toISOString() : undefined,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to update diet order')
      return d
    },
    onSuccess: () => {
      toast.success('Diet order updated')
      queryClient.invalidateQueries({ queryKey: ['diet-orders'] })
      setDialogOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const stopMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/diet-orders/${id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to stop diet order')
      return d
    },
    onSuccess: () => {
      toast.success('Diet order stopped')
      queryClient.invalidateQueries({ queryKey: ['diet-orders'] })
      setStopId(null)
      setStopReason('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ── Admissions fetch for the Add/Edit dialog ─────────────────────────
  // Primary source: the round-7 /api/ipd-admissions endpoint (works for
  // hospital, receptionist AND nurse — each resolved to their hospital).
  // If it 401s or returns nothing we fall back to the legacy role endpoints,
  // and finally to a free-form text input where the user can type/paste an
  // admission ID (same pattern as the OT client).
  const { data: admissionsData, isLoading: admissionsLoading } = useQuery<
    AdmissionLite[]
  >({
    queryKey: ['diet-orders-admissions'],
    queryFn: async () => {
      // Primary: shared IPD admissions endpoint (hospital/receptionist/nurse)
      try {
        const r = await fetch(
          '/api/ipd-admissions?status=Admitted&limit=200',
          { cache: 'no-store' }
        )
        if (r.ok) {
          const d = await r.json()
          const arr: AdmissionLite[] = (d.admissions || []).map(
            (a: Record<string, unknown>) => ({
              id: a.id as string,
              admissionNo: a.admissionNo as string,
              patientName: a.patientName as string,
              bedNumber: a.bedNumber as string | undefined,
              wardName: a.wardName as string | undefined,
              doctorName: a.doctorName as string | undefined,
            })
          )
          if (arr.length > 0) return arr
        }
      } catch {
        // fall through
      }
      // Fallback 1: receptionist IPD endpoint
      try {
        const r = await fetch(
          '/api/dashboard/receptionist/ipd?status=Admitted&limit=200',
          { cache: 'no-store' }
        )
        if (r.ok) {
          const d = await r.json()
          const arr: AdmissionLite[] = (d.admissions || []).map(
            (a: Record<string, unknown>) => ({
              id: a.id as string,
              admissionNo: a.admissionNo as string,
              patientName: a.patientName as string,
              bedNumber: a.bedNumber as string | undefined,
              wardName: a.wardName as string | undefined,
            })
          )
          if (arr.length > 0) return arr
        }
      } catch {
        // fall through
      }
      // Fallback 2: doctor IPD endpoint
      try {
        const r = await fetch(
          '/api/dashboard/doctor/ipd?status=Admitted&limit=200',
          { cache: 'no-store' }
        )
        if (r.ok) {
          const d = await r.json()
          const arr: AdmissionLite[] = (d.patients || []).map(
            (a: Record<string, unknown>) => ({
              id: a.id as string,
              admissionNo: a.admissionNo as string,
              patientName: a.patientName as string,
              bedNumber: a.bedNumber as string | undefined,
              wardName: a.wardName as string | undefined,
            })
          )
          if (arr.length > 0) return arr
        }
      } catch {
        // fall through
      }
      return []
    },
    enabled: dialogOpen,
  })

  const admissions = admissionsData ?? []

  // ── Dialog handlers ──────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
      startDate: todayStr(),
    })
    setDialogOpen(true)
  }

  function openEdit(o: DietOrderRow) {
    setEditingId(o.id)
    setForm({
      admissionId: o.admissionId,
      dietType: DIET_TYPES.includes(o.dietType as (typeof DIET_TYPES)[number])
        ? o.dietType
        : 'Soft Diet',
      mealType: MEAL_TYPES.includes(o.mealType as (typeof MEAL_TYPES)[number])
        ? o.mealType
        : 'All Meals',
      instructions: o.instructions || '',
      startDate: o.startDate ? o.startDate.slice(0, 10) : todayStr(),
      endDate: o.endDate ? o.endDate.slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.admissionId.trim()) {
      toast.error('Please choose an admission')
      return
    }
    if (!form.dietType.trim()) {
      toast.error('Diet type is required')
      return
    }
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        payload: {
          dietType: form.dietType,
          mealType: form.mealType,
          instructions: form.instructions,
          endDate: form.endDate,
        },
      })
    } else {
      createMutation.mutate(form)
    }
  }

  function openStop(o: DietOrderRow) {
    setStopId(o.id)
    setStopReason('')
  }

  function handleStop() {
    if (!stopId) return
    stopMutation.mutate({ id: stopId, reason: stopReason })
  }

  function handlePrint(o: DietOrderRow) {
    if (!o.admissionId) {
      toast.error('No admission linked to this diet order')
      return
    }
    window.open(`/print/diet-orders/${o.admissionId}`, '_blank', 'noopener')
  }

  const isSaving =
    createMutation.isPending || updateMutation.isPending || stopMutation.isPending

  const statCards = [
    {
      label: 'Active Diet Orders',
      value: stats.totalActive,
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    {
      label: 'Stopped Today',
      value: stats.stoppedToday,
      icon: Ban,
      color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300',
    },
    {
      label: 'NPO Alerts',
      value: stats.npoCount,
      icon: Utensils,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    },
    {
      label: "Today's New Orders",
      value: stats.todayNew,
      icon: CalendarPlus,
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Utensils className="h-6 w-6 text-teal-600" />
            Diet Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage patient diets — soft / diabetic / NPO / regular / high-protein
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Diet Order
        </Button>
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
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-tight">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="space-y-1.5">
                <Label
                  htmlFor="status-filter"
                  className="text-xs text-muted-foreground"
                >
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter" className="w-[170px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Stopped">Stopped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="search-filter"
                  className="text-xs text-muted-foreground"
                >
                  <Search className="h-3 w-3 inline mr-1" />
                  Search
                </Label>
                <Input
                  id="search-filter"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Patient name / IPD No / diet…"
                  className="w-[260px]"
                />
              </div>
            </div>

            {(
              statusFilter !== 'All' || search.trim()
            ) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('All')
                  setSearch('')
                }}
                className="text-muted-foreground self-end sm:self-auto"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-teal-600" />
            Diet Orders
            {data && (
              <Badge variant="outline" className="ml-2 font-normal text-xs">
                {filteredOrders.length}{' '}
                {filteredOrders.length === 1 ? 'order' : 'orders'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/50 px-6 py-12 text-center dark:border-teal-800 dark:bg-teal-950/20">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
                <UtensilsCrossed className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="font-semibold text-teal-900 dark:text-teal-100">
                {orders.length === 0
                  ? 'No diet orders yet'
                  : 'No diet orders match your filters'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                {orders.length === 0
                  ? 'Add a diet order to specify meal plans — soft, diabetic, NPO and more — for admitted patients.'
                  : 'Try adjusting the status filter or search term.'}
              </p>
              {orders.length === 0 && (
                <Button
                  onClick={openCreate}
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Diet Order
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-800">
                    <TableHead>Patient</TableHead>
                    <TableHead>Diet Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Meal Type
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Instructions
                    </TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="hidden md:table-cell">
                      End Date
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Stopped At / Reason
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => {
                    const bed = o.admission?.bed
                    const bedWard = bed
                      ? `${bed.bedNumber}${
                          bed.ward ? ` / ${bed.ward.name}` : ''
                        }`
                      : '—'
                    const instructionsShort = truncate(o.instructions || '', 50)
                    return (
                      <TableRow key={o.id} className="border-slate-200 dark:border-slate-800">
                        <TableCell className="text-sm">
                          <div className="font-medium">
                            {o.admission?.patientName || '—'}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {o.admission?.admissionNo || '—'} · {bedWard}
                          </div>
                        </TableCell>
                        <TableCell>{dietTypeCell(o.dietType)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {o.mealType || '—'}
                        </TableCell>
                        <TableCell
                          className="hidden lg:table-cell text-sm text-muted-foreground"
                          title={o.instructions || ''}
                        >
                          {instructionsShort || '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(o.startDate)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {o.endDate ? formatDate(o.endDate) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          {statusBadge(o.status)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {o.status === 'Stopped' ? (
                            <div>
                              <div>{o.stoppedAt ? formatDate(o.stoppedAt) : '—'}</div>
                              {o.stoppedReason && (
                                <div className="italic">“{truncate(o.stoppedReason, 60)}”</div>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            {o.status === 'Active' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40"
                                  onClick={() => openEdit(o)}
                                  aria-label="Edit diet order"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40"
                                  onClick={() => openStop(o)}
                                  aria-label="Stop diet order"
                                  title="Stop"
                                >
                                  <PowerOff className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40"
                              onClick={() => handlePrint(o)}
                              aria-label="Print diet chart"
                              title="Print Diet Chart"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSaving) setDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-teal-600" />
              {editingId ? 'Edit Diet Order' : 'Add Diet Order'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the diet type, meal slot, instructions or end date. The admission cannot be changed after creation.'
                : 'Specify a diet plan for an admitted patient. Soft / liquid / diabetic / NPO / regular / high-protein etc.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Admission picker — Select when admissions list is available,
                free-form Input when the user's role doesn't have access to
                the admissions list endpoint. */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="admission">
                Admission{' '}
                <span className="text-rose-500">*</span>
              </Label>
              {!editingId ? (
                admissions.length > 0 ? (
                  <>
                    <Select
                      value={form.admissionId}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, admissionId: v }))
                      }
                    >
                      <SelectTrigger id="admission" className="w-full">
                        <SelectValue
                          placeholder={
                            admissionsLoading
                              ? 'Loading admissions…'
                              : 'Select admitted patient'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="max-h-72 overflow-y-auto">
                          {admissions.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {admissionLabel(a)}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    {/* Contextual hint for the selected admission
                        (ward · bed · attending doctor) — same pattern as the
                        OT Schedule Surgery dialog. */}
                    {(() => {
                      const adm = admissions.find(
                        (a) => a.id === form.admissionId
                      )
                      if (!adm) return null
                      return (
                        <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                          <BedDouble className="h-3 w-3 shrink-0 text-teal-600 dark:text-teal-400" />
                          {adm.wardName || '—'} · Bed {adm.bedNumber || '—'}
                          {adm.doctorName ? ` · Attending: ${adm.doctorName}` : ''}
                        </p>
                      )
                    })()}
                  </>
                ) : admissionsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading admissions…
                  </div>
                ) : (
                  <Input
                    id="admission"
                    value={form.admissionId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        admissionId: e.target.value,
                      }))
                    }
                    placeholder="Paste admission ID (e.g. cmabc…)"
                    className="font-mono text-xs"
                  />
                )
              ) : (
                <Input
                  id="admission"
                  value={form.admissionId}
                  disabled
                  className="font-mono text-xs bg-muted/40"
                />
              )}
              <p className="text-xs text-muted-foreground">
                {editingId
                  ? 'Linked admission (cannot be changed).'
                  : admissions.length > 0
                  ? 'Choose from currently admitted patients.'
                  : 'No admissions list endpoint is available for your role — paste the admission ID instead.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diet-type">
                Diet Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.dietType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, dietType: v }))
                }
              >
                <SelectTrigger id="diet-type" className="w-full">
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent>
                  {DIET_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select
                value={form.mealType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, mealType: v }))
                }
              >
                <SelectTrigger id="meal-type" className="w-full">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={form.instructions}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instructions: e.target.value }))
                }
                placeholder='e.g. "Low salt. Avoid spicy. 2L water daily."'
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start-date">
                <CalendarClock className="h-3 w-3 inline mr-1" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-date">End Date (optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                placeholder="Auto-stop on this date"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving || !form.admissionId.trim() || !form.dietType.trim()
              }
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSaving && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingId ? 'Save Changes' : 'Add Diet Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stop confirmation */}
      <AlertDialog
        open={!!stopId}
        onOpenChange={(open) => {
          if (!isSaving && !open) {
            setStopId(null)
            setStopReason('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop this diet order?</AlertDialogTitle>
            <AlertDialogDescription>
              The order will be marked as <strong>Stopped</strong> and the
              patient&apos;s current diet plan will end. Please record a reason
              (e.g. &ldquo;Patient tolerating oral feeds&rdquo;,
              &ldquo;Switched to regular diet&rdquo;).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="stop-reason" className="text-sm">
              Reason (optional)
            </Label>
            <Textarea
              id="stop-reason"
              value={stopReason}
              onChange={(e) => setStopReason(e.target.value)}
              placeholder='e.g. "Tolerating oral feeds; switched to Soft Diet"'
              rows={3}
              disabled={isSaving}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStop}
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSaving && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Stop Diet Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
