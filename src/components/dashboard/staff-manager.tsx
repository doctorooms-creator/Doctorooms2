'use client'

/**
 * StaffManager — self-serve staff management for hospital admins + solo
 * doctors (clinic owners). Until now only the platform super-admin could
 * create staff; this component drives the new hospital-scoped
 * /api/dashboard/staff endpoints.
 *
 *  - Unified list (receptionists, nurses, pharmacists, assistants, doctors)
 *    with seat chips (teal under limit · amber AT limit) + filter tabs.
 *  - Add Staff dialog with per-role conditional fields + password generator.
 *  - Plan seat walls (HTTP 402 { upgrade }) render the shared
 *    UpgradeWallDialog — the same flow as recall-campaigns.
 *  - Block / Unblock with AlertDialog confirm.
 *
 * Palette: teal / emerald / amber only (badges may use violet/rose per role).
 */
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Users, Plus, Search, RefreshCw, AlertCircle, ShieldBan, ShieldCheck,
  UserPlus, Sparkles, Dices, Mail, Phone, Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { UpgradeWallDialog, type UpgradeWallPayload } from '@/components/upgrade-wall-dialog'

// ─── Types (API contracts) ─────────────────────────────────────────────────

type StaffRole = 'receptionist' | 'nurse' | 'pharmacist' | 'assistant' | 'doctor'

interface StaffMember {
  userId: string
  name: string
  email: string
  role: StaffRole
  gender: string
  status: string
  mobileNo: string
  profileImg: string
  createdAt: string
  departmentName?: string | null
  doctorName?: string | null
  designation?: string | null
  employeeId?: string | null
  qualification?: string | null
  shift?: string | null
  wardName?: string | null
}

interface SeatInfo { used: number; limit: number }

interface StaffData {
  staff: StaffMember[]
  counts: { receptionists: number; nurses: number; pharmacists: number; assistants: number; doctors: number }
  seats: {
    planKey: string
    planName: string
    receptionistSeats: SeatInfo
    nurseSeats: SeatInfo
    doctorSeats: SeatInfo
  }
  departments: { id: string; name: string }[]
}

interface AddFormState {
  role: StaffRole
  name: string
  email: string
  password: string
  gender: string
  mobileNo: string
  departmentId: string
  doctorEmail: string
  qualification: string
  shift: string
  employeeId: string
}

const EMPTY_FORM: AddFormState = {
  role: 'receptionist',
  name: '',
  email: '',
  password: '',
  gender: 'Male',
  mobileNo: '',
  departmentId: '',
  doctorEmail: '',
  qualification: '',
  shift: 'Morning',
  employeeId: '',
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ROLE_TABS: { key: string; label: string; countKey: keyof StaffData['counts'] }[] = [
  { key: '', label: 'All', countKey: 'receptionists' }, // special-cased below
  { key: 'receptionist', label: 'Receptionists', countKey: 'receptionists' },
  { key: 'nurse', label: 'Nurses', countKey: 'nurses' },
  { key: 'pharmacist', label: 'Pharmacists', countKey: 'pharmacists' },
  { key: 'assistant', label: 'Assistants', countKey: 'assistants' },
  { key: 'doctor', label: 'Doctors', countKey: 'doctors' },
]

const ROLE_LABELS: Record<StaffRole, string> = {
  receptionist: 'Receptionist',
  nurse: 'Nurse',
  pharmacist: 'Pharmacist',
  assistant: 'Assistant',
  doctor: 'Doctor',
}

const ROLE_BADGES: Record<StaffRole, string> = {
  receptionist: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  nurse: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  pharmacist: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  assistant: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  doctor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
}

const STATUS_BADGES: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  Block: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
}

// Static plan facts (plans.ts is server-only — db import). Matches PLANS limits.
const SEAT_HINTS: Record<StaffRole, string> = {
  receptionist: 'Free plan: 1 receptionist seat · Pro: 3 · Hospital Pro: 15',
  nurse: 'Free plan: 1 nurse seat · Pro: 3 · Hospital Pro: 15',
  doctor: 'Free plan: 1 doctor seat · Pro: 3 · Hospital Pro: 10',
  pharmacist: 'No seat limit for pharmacists on any plan',
  assistant: 'No seat limit for assistants on any plan',
}

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%'

function generatePassword(length = 10): string {
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  return Array.from(values, (v) => PASSWORD_CHARS[v % PASSWORD_CHARS.length]).join('')
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  )
}

function detailLine(s: StaffMember): string | null {
  switch (s.role) {
    case 'receptionist':
      return s.departmentName || 'Front desk'
    case 'nurse':
      return [s.qualification, s.shift, s.wardName].filter(Boolean).join(' · ') || 'Staff Nurse'
    case 'assistant':
      return s.doctorName ? `Assists ${s.doctorName}` : 'Doctor assistant'
    case 'doctor':
      return s.designation || 'Consultant'
    default:
      return 'Pharmacy'
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StaffManager({ mode }: { mode: 'hospital' | 'doctor' }) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Add-staff dialog
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM)

  // Block/unblock confirm
  const [blockTarget, setBlockTarget] = useState<StaffMember | null>(null)

  // Upgrade wall dialog (402 { upgrade } payload — recall-campaigns convention)
  const [wallOpen, setWallOpen] = useState(false)
  const [wallPayload, setWallPayload] = useState<UpgradeWallPayload | null>(null)
  const [walletSpendable, setWalletSpendable] = useState<number | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // ── Queries ──
  const staffQuery = useQuery<StaffData, Error>({
    queryKey: ['dashboard-staff', mode, activeTab, debouncedSearch],
    queryFn: async () => {
      const url = new URL('/api/dashboard/staff', window.location.origin)
      if (activeTab) url.searchParams.set('role', activeTab)
      if (debouncedSearch) url.searchParams.set('search', debouncedSearch)
      const r = await fetch(url.toString())
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Staff load nahi hue')
      return d as StaffData
    },
  })

  const data = staffQuery.data
  const staff = data?.staff ?? []
  const seats = data?.seats
  const totalStaff =
    data && data.counts
      ? data.counts.receptionists + data.counts.nurses + data.counts.pharmacists +
        data.counts.assistants + data.counts.doctors
      : 0

  const openWallWith = (payload: UpgradeWallPayload | null) => {
    if (!payload) return
    // Wallet is a doctor-only referral feature — lazily fetch for doctors only
    if (mode === 'doctor' && walletSpendable === null) {
      fetch('/api/referral/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setWalletSpendable(d?.wallet?.spendable ?? 0))
        .catch(() => setWalletSpendable(0))
    }
    setWallPayload(payload)
    setWallOpen(true)
  }

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const r = await fetch('/api/dashboard/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (r.status === 402) {
        // Soft wall: structured upgrade payload the dialog renders
        return { blocked: true as const, upgrade: d.upgrade as UpgradeWallPayload | null, error: d.error }
      }
      if (!r.ok) throw new Error(d.error || 'Staff create nahi hua')
      return { blocked: false as const, created: d as { userId: string; name: string; role: string } }
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'Active' | 'Block' }) => {
      const r = await fetch(`/api/dashboard/staff/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Status update fail hua')
      return d as { userId: string; status: string }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'Block' ? 'Staff member blocked' : 'Staff member activated')
      setBlockTarget(null)
      queryClient.invalidateQueries({ queryKey: ['dashboard-staff'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // ── Handlers ──
  const resetForm = () => setForm(EMPTY_FORM)

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error('Naam, email aur 6+ character ka password zaroori hai')
      return
    }
    if (form.role === 'assistant' && mode === 'hospital' && !form.doctorEmail.trim()) {
      toast.error('Assistant ke liye doctor ka email chahiye')
      return
    }

    const payload: Record<string, unknown> = {
      role: form.role,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      gender: form.gender,
      mobileNo: form.mobileNo.trim(),
    }
    if (form.role === 'receptionist' && form.departmentId) payload.departmentId = form.departmentId
    if (form.role === 'assistant' && mode === 'hospital') payload.doctorEmail = form.doctorEmail.trim()
    if (form.role === 'nurse') {
      if (form.qualification.trim()) payload.qualification = form.qualification.trim()
      if (form.employeeId.trim()) payload.employeeId = form.employeeId.trim()
      payload.shift = form.shift
    }

    const result = await createMutation.mutateAsync(payload)
    if (result.blocked) {
      // Seat wall → UpgradeWallDialog (growth-celebration framing)
      toast.error('Seat limit reached — plan upgrade dekhiye')
      setAddOpen(false)
      openWallWith(result.upgrade)
      queryClient.invalidateQueries({ queryKey: ['dashboard-staff'] })
      return
    }
    toast.success(`✅ ${ROLE_LABELS[form.role as StaffRole]} added — ${result.created.name}`)
    setAddOpen(false)
    resetForm()
    queryClient.invalidateQueries({ queryKey: ['dashboard-staff'] })
  }

  const confirmToggle = () => {
    if (!blockTarget) return
    toggleStatusMutation.mutate({
      userId: blockTarget.userId,
      status: blockTarget.status === 'Active' ? 'Block' : 'Active',
    })
  }

  const busy = staffQuery.isLoading
  const isDoctor = mode === 'doctor'
  const seatChips: { label: string; info: SeatInfo }[] = seats
    ? [
        { label: 'Receptionists', info: seats.receptionistSeats },
        { label: 'Nurses', info: seats.nurseSeats },
        { label: 'Doctors', info: seats.doctorSeats },
      ]
    : []

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" aria-hidden />
            {isDoctor ? 'My Staff' : 'Staff Management'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            {isDoctor
              ? 'Apni clinic ke receptionists, nurses aur assistants khud manage karein — admin ke bina.'
              : 'Hospital staff khud banayein aur manage karein — receptionists, nurses, pharmacists, assistants aur doctors.'}
          </p>
          {seats && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="gap-1 border-0 bg-teal-600 text-white">
                <Sparkles className="h-3 w-3" aria-hidden />
                {seats.planName} plan
              </Badge>
              {seatChips.map((c) => {
                const atLimit = c.info.used >= c.info.limit
                return (
                  <Badge
                    key={c.label}
                    className={`gap-1 border-0 ${
                      atLimit
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300'
                    }`}
                    title={`${c.label}: ${c.info.used}/${c.info.limit} seats in use`}
                  >
                    {c.label} {c.info.used}/{c.info.limit}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
        <Button
          onClick={() => { resetForm(); setAddOpen(true) }}
          className="shrink-0 h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          aria-label="Add staff member"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add Staff
        </Button>
      </motion.div>

      {/* Staff list card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex flex-wrap items-center gap-3 justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-teal-600" aria-hidden />
                Staff members {busy ? '' : `(${totalStaff})`}
              </span>
              <div className="relative w-full sm:w-64 order-first sm:order-last">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Naam ya email search karein…"
                  className="pl-9 h-11"
                  aria-label="Search staff by name or email"
                />
              </div>
            </CardTitle>

            {/* Filter tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-11 w-full flex-wrap justify-start overflow-x-auto max-w-full">
                {ROLE_TABS.map((t) => {
                  const count = t.key === '' ? totalStaff : (data?.counts?.[t.countKey] ?? 0)
                  return (
                    <TabsTrigger
                      key={t.key || 'all'}
                      value={t.key}
                      className="gap-1.5 h-9"
                      aria-label={`Filter by ${t.label}`}
                    >
                      {t.label}
                      <span className="text-[10px] rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-muted-foreground">
                        {count}
                      </span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {busy ? (
              <div className="space-y-2" aria-label="Loading staff">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : staffQuery.isError ? (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" aria-hidden />
                <p className="text-sm font-medium text-foreground">Staff load nahi hue</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {staffQuery.error instanceof Error ? staffQuery.error.message : 'Kuch galat ho gaya'}
                </p>
                <Button
                  variant="outline"
                  className="mt-3 h-11"
                  onClick={() => staffQuery.refetch()}
                  aria-label="Retry loading staff"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden /> Dobara try karein
                </Button>
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4"
                  aria-hidden
                >
                  <Users className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-bold text-foreground">
                  {debouncedSearch || activeTab ? 'Koi staff match nahi hua' : 'Abhi koi staff nahi hai'}
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {debouncedSearch || activeTab
                    ? 'Filter ya search change karke dekhein.'
                    : 'Receptionist, nurse, pharmacist ya assistant add karke apni team digital banayein.'}
                </p>
                {!debouncedSearch && !activeTab && (
                  <Button
                    onClick={() => { resetForm(); setAddOpen(true) }}
                    className="mt-5 gap-2 h-11 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Pehla staff add karein
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                          <TableHead className="text-xs">Staff</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">Contact</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Joined</TableHead>
                          <TableHead className="text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.map((s) => (
                          <TableRow key={`${s.role}-${s.userId}`} className="group">
                            <TableCell className="max-w-[240px]">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-9 w-9" aria-hidden>
                                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 text-teal-700 dark:text-teal-300">
                                    {getInitials(s.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate">{s.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{s.email}</p>
                                  {detailLine(s) && (
                                    <p className="text-[10px] text-muted-foreground/80 truncate">
                                      {detailLine(s)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border-0 ${ROLE_BADGES[s.role]}`}>
                                {ROLE_LABELS[s.role]}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" aria-hidden />
                                {s.mobileNo || '—'}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border-0 ${STATUS_BADGES[s.status] ?? STATUS_BADGES.Pending}`}>
                                {s.status === 'Active' ? 'Active' : s.status === 'Block' ? 'Blocked' : s.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                              {format(new Date(s.createdAt), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              {s.status === 'Active' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setBlockTarget(s)}
                                  disabled={toggleStatusMutation.isPending}
                                  className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/40"
                                  aria-label={`Block ${s.name}`}
                                >
                                  <ShieldBan className="h-3.5 w-3.5" aria-hidden />
                                  Block
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setBlockTarget(s)}
                                  disabled={toggleStatusMutation.isPending}
                                  className="h-9 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/40"
                                  aria-label={`Unblock ${s.name}`}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                                  Unblock
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden max-h-[28rem] overflow-y-auto custom-scrollbar space-y-3 pr-1">
                  {staff.map((s) => (
                    <div
                      key={`${s.role}-${s.userId}`}
                      className="rounded-xl border border-gray-100 dark:border-gray-800 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-10 w-10 shrink-0" aria-hidden>
                            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 text-teal-700 dark:text-teal-300">
                              {getInitials(s.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{s.email}</p>
                          </div>
                        </div>
                        <Badge className={`border-0 shrink-0 ${STATUS_BADGES[s.status] ?? STATUS_BADGES.Pending}`}>
                          {s.status === 'Active' ? 'Active' : s.status === 'Block' ? 'Blocked' : s.status}
                        </Badge>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 mt-2.5">
                        <Badge className={`border-0 ${ROLE_BADGES[s.role]}`}>{ROLE_LABELS[s.role]}</Badge>
                        {detailLine(s) && (
                          <span className="text-[10px] text-muted-foreground truncate">{detailLine(s)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 gap-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 min-w-0">
                          <Phone className="h-3 w-3 shrink-0" aria-hidden />
                          {s.mobileNo || '—'} · {format(new Date(s.createdAt), 'dd MMM yyyy')}
                        </span>
                        {s.status === 'Active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBlockTarget(s)}
                            disabled={toggleStatusMutation.isPending}
                            className="h-9 gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40 shrink-0"
                            aria-label={`Block ${s.name}`}
                          >
                            <ShieldBan className="h-3.5 w-3.5" aria-hidden /> Block
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBlockTarget(s)}
                            disabled={toggleStatusMutation.isPending}
                            className="h-9 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/40 shrink-0"
                            aria-label={`Unblock ${s.name}`}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Unblock
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Add Staff dialog ── */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm() }}>
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-teal-600" aria-hidden />
              Add Staff Member
            </DialogTitle>
            <DialogDescription>
              {isDoctor
                ? 'Naya staff account banayein — wo turant aapki clinic se jud jaayega.'
                : 'Naya staff account banayein — wo turant is hospital se jud jaayega.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="space-y-4">
            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="staff-role">Role *</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as StaffRole }))}
              >
                <SelectTrigger id="staff-role" className="h-11" aria-label="Staff role">
                  <SelectValue placeholder="Role chuniye" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist" className="py-2.5">Receptionist</SelectItem>
                  <SelectItem value="nurse" className="py-2.5">Nurse</SelectItem>
                  <SelectItem value="pharmacist" className="py-2.5">Pharmacist</SelectItem>
                  <SelectItem value="assistant" className="py-2.5">Assistant</SelectItem>
                  <SelectItem value="doctor" className="py-2.5">Associate Doctor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <Lock className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" aria-hidden />
                <span>
                  {SEAT_HINTS[form.role]}
                  {seats && form.role === 'receptionist' && ` · Abhi ${seats.receptionistSeats.used}/${seats.receptionistSeats.limit} in use`}
                  {seats && form.role === 'nurse' && ` · Abhi ${seats.nurseSeats.used}/${seats.nurseSeats.limit} in use`}
                  {seats && form.role === 'doctor' && ` · Abhi ${seats.doctorSeats.used}/${seats.doctorSeats.limit} in use`}
                </span>
              </p>
            </div>

            {/* Name + Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name *</Label>
                <Input
                  id="staff-name"
                  placeholder="e.g. Sunita Rao"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-gender">Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger id="staff-gender" className="h-11" aria-label="Gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="py-2.5">Male</SelectItem>
                    <SelectItem value="Female" className="py-2.5">Female</SelectItem>
                    <SelectItem value="Other" className="py-2.5">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email + Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="name@clinic.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-mobile">Mobile No.</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="staff-mobile"
                    type="tel"
                    placeholder="98765 43210"
                    value={form.mobileNo}
                    onChange={(e) => setForm((f) => ({ ...f, mobileNo: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Receptionist: department */}
            <AnimatePresence initial={false}>
              {form.role === 'receptionist' && (data?.departments?.length ?? 0) > 0 && (
                <motion.div
                  key="dept"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1">
                    <Label htmlFor="staff-dept">Department</Label>
                    <Select
                      value={form.departmentId}
                      onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}
                    >
                      <SelectTrigger id="staff-dept" className="h-11" aria-label="Department">
                        <SelectValue placeholder="Koi bhi department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="py-2.5">No department</SelectItem>
                        {data?.departments.map((d) => (
                          <SelectItem key={d.id} value={d.id} className="py-2.5">
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nurse: qualification + shift + employeeId */}
            <AnimatePresence initial={false}>
              {form.role === 'nurse' && (
                <motion.div
                  key="nurse"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2">
                      <Label htmlFor="staff-qual">Qualification</Label>
                      <Input
                        id="staff-qual"
                        placeholder="e.g. B.Sc Nursing / GNM"
                        value={form.qualification}
                        onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staff-shift">Shift</Label>
                      <Select
                        value={form.shift}
                        onValueChange={(v) => setForm((f) => ({ ...f, shift: v }))}
                      >
                        <SelectTrigger id="staff-shift" className="h-11" aria-label="Shift">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning" className="py-2.5">Morning</SelectItem>
                          <SelectItem value="Evening" className="py-2.5">Evening</SelectItem>
                          <SelectItem value="Night" className="py-2.5">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="staff-empid">Employee ID (optional)</Label>
                      <Input
                        id="staff-empid"
                        placeholder="Auto-generated if empty"
                        value={form.employeeId}
                        onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Assistant: doctor link */}
            <AnimatePresence initial={false}>
              {form.role === 'assistant' && (
                <motion.div
                  key="assistant"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1">
                    {isDoctor ? (
                      <p className="text-xs text-muted-foreground rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 p-3">
                        Yeh assistant seedha aapki clinic se jud jaayega — koi extra detail nahi chahiye.
                      </p>
                    ) : (
                      <>
                        <Label htmlFor="staff-doctoremail">Doctor&apos;s Email *</Label>
                        <Input
                          id="staff-doctoremail"
                          type="email"
                          placeholder="doctor@hospital.com"
                          value={form.doctorEmail}
                          onChange={(e) => setForm((f) => ({ ...f, doctorEmail: e.target.value }))}
                          className="h-11"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Assistant kis doctor ke saath kaam karega — us doctor ka registered email likhein.
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="staff-password">Password *</Label>
              <div className="flex gap-2">
                <Input
                  id="staff-password"
                  type="text"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="h-11"
                  required
                  minLength={6}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}
                  className="h-11 gap-1.5 shrink-0 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                  aria-label="Generate a strong password"
                >
                  <Dices className="h-4 w-4" aria-hidden />
                  Generate
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Yeh password staff ko dein — wo isi se login karega aur apna password change kar sakta hai.
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setAddOpen(false); resetForm() }}
                disabled={createMutation.isPending}
                className="h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                {createMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                    Creating…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" aria-hidden />
                    Create {ROLE_LABELS[form.role]}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Block / Unblock confirm ── */}
      <AlertDialog open={!!blockTarget} onOpenChange={(open) => !open && setBlockTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.status === 'Active' ? 'Block staff member' : 'Unblock staff member'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.status === 'Active' ? (
                <>
                  <span className="font-semibold">{blockTarget?.name}</span> ko block karne ke baad wo login
                  nahi kar payega. Account wapas activate kiya ja sakta hai.
                </>
              ) : (
                <>
                  <span className="font-semibold">{blockTarget?.name}</span> ko active karein? Wo wapas login
                  kar payega.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // keep the dialog open until the mutation settles
                confirmToggle()
              }}
              disabled={toggleStatusMutation.isPending}
              className={
                blockTarget?.status === 'Active'
                  ? 'h-11 bg-red-600 hover:bg-red-700 focus:ring-red-600'
                  : 'h-11 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600'
              }
            >
              {toggleStatusMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> Updating…
                </span>
              ) : blockTarget?.status === 'Active' ? (
                'Block'
              ) : (
                'Unblock'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Upgrade wall (seat limit · HTTP 402 { upgrade }) ── */}
      <UpgradeWallDialog
        open={wallOpen}
        onOpenChange={setWallOpen}
        wall={wallPayload}
        walletSpendable={mode === 'doctor' ? (walletSpendable ?? 0) : 0}
        mode="self"
        source={mode === 'doctor' ? 'staff_seats_doctor' : 'staff_seats_hospital'}
      />
    </div>
  )
}
