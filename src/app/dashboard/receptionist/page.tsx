'use client'

/**
 * ONE-FORM BOOKING HOME — "Reception's single desk"
 * (Founder-approved redesign, Oct 2026 — see worklog `home-redesign-analysis`.)
 *
 * The receptionist's #1 job is registering patients. This home page IS the
 * booking form — no navigation, no mode picking, no scrolling marathon:
 *
 *   SMART FIELD (one input, the system decides):
 *     • digits  → mobile lookup → existing patient auto-fills (locked card)
 *                 10 digits + no match → new-patient name row (auto register)
 *     • letters → patient-name search (autocomplete cards) — ignoring the
 *                 suggestions books a Quick walk-in with the typed name
 *
 *   DEPARTMENT / DOCTOR: single tap chips — auto-locked when only 1 exists;
 *                         otherwise the desk remembers the LAST-USED pairing
 *                         (per receptionist, persisted in User.settingsJson)
 *                         and pre-selects it with a "last used" hint
 *   EMERGENCY: always-visible 1-tap toggle
 *   AUTO-PRINT: optional toggle — prints every token slip automatically the
 *               moment a booking confirms (hidden same-origin iframe → the
 *               print-token page prints itself; survives popup blockers)
 *   SUBMIT: "Add to Queue" — Enter anywhere submits
 *   AUTO-RESET: after booking, token flashes ~5s, then the form silently
 *               clears and focus returns to the smart field (zero button
 *               presses between patients — reception has no time).
 *
 * Advanced flows (express auto-doctor, future slot booking, video consult)
 * remain on /dashboard/receptionist/booking — linked as "Advanced Booking".
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Baby,
  Bone,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Heart,
  History,
  ListOrdered,
  Loader2,
  MapPin,
  Microscope,
  Phone,
  Pill,
  Printer,
  RotateCcw,
  Scissors,
  Search,
  Siren,
  Stethoscope,
  UserRound,
  Users,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────

interface PatientMatch {
  id: string
  name: string
  mobileNo: string
  gender: string | null
  age: number | null
  lastVisit: string | null
  totalVisits: number
  profileImg: string | null
}

interface ScheduleDoctor {
  id: string
  name: string
  profileImg: string | null
  specialization: string | null
  designation: string
  fees: number
}

interface ScheduleDepartment {
  department: { id: string; name: string; shortCode: string; icon: string }
  doctors: ScheduleDoctor[]
}

interface QueueItem {
  id: string
  appointmentNo: string
  patientName: string
  patientImg: string | null
  disease: string
  timeSlot: string | null
  status: string
  doctorName: string
  tokenNumber: string | null
  queuePosition: number
}

interface ReceptionistStats {
  isHospitalMode?: boolean
  todayAppointments: number
  todayVisited: number
  pendingApprovals: number
  doctor: { id: string; name: string; profileImg: string | null; specialization: string; contactNo: string; hospitalAddress: string } | null
  hospital: { hospitalName: string; address: string; city: string; state: string; contactNo: string } | null
  todayAppointmentsList: {
    id: string
    appointmentNo: string
    patientName: string
    patientImg: string | null
    doctorName?: string
    date: string
    status: string
    disease: string
    charge: number
  }[]
}

interface BookingResult {
  success: boolean
  linkedExisting?: boolean
  booking: {
    id: string
    appointmentNo: string
    patientName: string
    doctorName: string
    departmentName: string | null
    tokenNumber: string
    queuePosition: number
    charge: number
    isEmergency: boolean
    visitDate: string
    timeSlot: string
  }
}

// ─── Department icon + tint helpers (shared with old dashboard) ─────────

const departmentIconMap: Record<string, LucideIcon> = {
  CARD: Heart, NEUR: Brain, ORTH: Bone, OPTH: Eye, GYNE: Baby, PED: Baby,
  PATH: Microscope, RAD: Activity, ENT: Stethoscope, SURG: Scissors,
  GEN: Stethoscope, PHAR: Pill, DERMA: Eye, DENT: Bone, PSYC: Brain,
  ONCO: Activity, NEPH: Activity, GASTRO: Stethoscope, PULM: Activity,
  UROL: Stethoscope,
}

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  Approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  Visited: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  Canceled: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  Finish: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
}

const AUTO_RESET_MS = 5000

/** Per-receptionist desk memory (User.settingsJson.receptionBookingPrefs) */
type BookingPrefs = {
  departmentId?: string
  doctorId?: string
  autoPrint?: boolean
}

// ─── Page ───────────────────────────────────────────────────────────────

export default function ReceptionistHomePage() {
  const queryClient = useQueryClient()
  const smartInputRef = useRef<HTMLInputElement>(null)
  const complaintInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const resultCardRef = useRef<HTMLDivElement>(null)
  const autoResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [resetCountdown, setResetCountdown] = useState(0)

  // ── Smart field state ──
  const [smart, setSmart] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientMatch | null>(null)
  const [showMatches, setShowMatches] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  // ── New-patient fields (register / quick) ──
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newGender, setNewGender] = useState('')

  // ── Visit fields ──
  const [departmentId, setDepartmentId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [disease, setDisease] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)

  // ── Result flash ──
  const [result, setResult] = useState<BookingResult | null>(null)

  // ── Desk memory: last-used dept/doctor + auto-print (persisted per receptionist) ──
  const [autoPrint, setAutoPrint] = useState(false)
  const [deptFromPrefs, setDeptFromPrefs] = useState(false) // shows "last used" hint
  const prefsApplied = useRef(false)
  const { data: prefsData } = useQuery<{ prefs: BookingPrefs }>({
    queryKey: ['booking-prefs'],
    queryFn: () =>
      fetch('/api/dashboard/receptionist/booking-preferences')
        .then((r) => (r.ok ? r.json() : { prefs: {} as BookingPrefs }))
        .catch(() => ({ prefs: {} as BookingPrefs })),
    staleTime: Infinity,
    retry: 1,
  })
  const savePrefs = useCallback((updates: BookingPrefs) => {
    fetch('/api/dashboard/receptionist/booking-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {}) // desk memory is best-effort, never blocks a booking
  }, [])

  // ── Data: stats / schedule / live queue ──
  const { data: stats } = useQuery<ReceptionistStats>({
    queryKey: ['receptionist-stats'],
    queryFn: () => fetch('/api/dashboard/receptionist/stats').then((r) => r.json()),
  })

  const { data: queueData } = useQuery<{
    isHospitalMode: boolean
    totalInQueue: number
    opdCompletedToday: number
    queue: QueueItem[]
  }>({
    queryKey: ['walkin-queue'],
    queryFn: () => fetch('/api/dashboard/receptionist/walk-in').then((r) => r.json()),
    refetchInterval: 20_000,
  })

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery<{
    isHospitalMode: boolean
    departments: ScheduleDepartment[]
    doctor?: { id: string; name: string; profileImg: string | null; specialization: string | null }
  }>({
    queryKey: ['walkin-hospital-schedule'],
    queryFn: () => fetch('/api/dashboard/receptionist/schedule').then((r) => r.json()),
  })

  const isHospitalMode = scheduleData?.isHospitalMode ?? queueData?.isHospitalMode === true
  const departments = useMemo(() => scheduleData?.departments ?? [], [scheduleData])

  const departmentDoctors = useMemo(() => {
    if (!departmentId) return []
    return departments.find((d) => d.department.id === departmentId)?.doctors ?? []
  }, [departments, departmentId])

  const selectedDoctor = useMemo(
    () => departmentDoctors.find((d) => d.id === doctorId) ?? null,
    [departmentDoctors, doctorId]
  )
  // ── Smart search (debounced by react-query key) ──
  const trimmedSmart = smart.trim()
  const isDigitMode = trimmedSmart.length > 0 && /^[0-9]+$/.test(trimmedSmart)
  const searchReady = !selectedPatient && trimmedSmart.length >= 2 && !result

  const { data: searchData, isFetching: searchLoading } = useQuery({
    queryKey: ['patient-search', trimmedSmart],
    queryFn: async (): Promise<{ matches: PatientMatch[] }> => {
      const res = await fetch(
        `/api/dashboard/receptionist/patient-search?q=${encodeURIComponent(trimmedSmart)}`
      )
      if (!res.ok) return { matches: [] }
      return res.json()
    },
    enabled: searchReady,
    staleTime: 15_000,
  })
  const matches = useMemo(() => searchData?.matches ?? [], [searchData])

  // Auto-select an EXACT mobile match (the "one keystroke flow" for regulars)
  useEffect(() => {
    if (!isDigitMode || trimmedSmart.length < 10 || selectedPatient || searchLoading) return
    const exact = matches.filter((m) => m.mobileNo === trimmedSmart)
    if (exact.length === 1) {
      setSelectedPatient(exact[0])
      setShowMatches(false)
      // Nudge focus to the next empty required field
      setTimeout(() => complaintInputRef.current?.focus(), 60)
    }
  }, [isDigitMode, trimmedSmart, matches, selectedPatient, searchLoading])

  // ── Auto-lock single department / single doctor (founder rule) ──
  useEffect(() => {
    if (!isHospitalMode) return
    if (departments.length === 1 && departmentId !== departments[0].department.id) {
      setDepartmentId(departments[0].department.id)
    }
  }, [isHospitalMode, departments, departmentId])

  useEffect(() => {
    if (departmentDoctors.length === 1 && doctorId !== departmentDoctors[0].id) {
      setDoctorId(departmentDoctors[0].id)
    }
  }, [departmentDoctors, doctorId])

  // ── Desk memory: apply last-used department + doctor ONCE after schedule loads.
  // (Founder's single-option auto-lock above still wins for 1-dept/1-doctor setups —
  // same value anyway; for multi-option desks this pre-selects yesterday's pairing
  // so the regular booking is dept-less: type mobile → complaint → Enter.) ──
  useEffect(() => {
    if (prefsApplied.current || !isHospitalMode || scheduleLoading || !prefsData) return
    prefsApplied.current = true
    const prefs = prefsData.prefs
    if (typeof prefs.autoPrint === 'boolean') setAutoPrint(prefs.autoPrint)
    if (prefs.departmentId && departments.length > 1) {
      const dept = departments.find((d) => d.department.id === prefs.departmentId)
      if (dept) {
        setDepartmentId(dept.department.id)
        setDeptFromPrefs(true)
        if (prefs.doctorId && dept.doctors.some((doc) => doc.id === prefs.doctorId)) {
          setDoctorId(prefs.doctorId)
        }
      }
    }
  }, [isHospitalMode, scheduleLoading, prefsData, departments])

  // ── Submit (declared BEFORE derived validation to avoid TDZ) ──
  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>): Promise<BookingResult> => {
      const res = await fetch('/api/dashboard/receptionist/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create booking')
      return data as BookingResult
    },
    onSuccess: (data) => {
      setResult(data)
      setResetCountdown(AUTO_RESET_MS / 1000)
      toast.success(
        data.booking.tokenNumber
          ? `Token ${data.booking.tokenNumber} — Queue #${data.booking.queuePosition || '—'}`
          : 'Booking confirmed'
      )
      queryClient.invalidateQueries({ queryKey: ['walkin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['receptionist-stats'] })
      // Desk memory: remember this desk's dept/doctor pairing (best-effort)
      if (isHospitalMode && departmentId) {
        savePrefs({ departmentId, doctorId: doctorId || undefined })
      }
      // Auto-print: hidden same-origin iframe — the print-token page prints itself,
      // so this survives popup blockers (no window.open outside a user gesture).
      if (autoPrint && data.booking.id) {
        const iframe = document.createElement('iframe')
        iframe.src = `/bookings/print-token/${data.booking.id}`
        iframe.title = 'Token slip print'
        iframe.setAttribute('aria-hidden', 'true')
        iframe.style.position = 'fixed'
        iframe.style.right = '0'
        iframe.style.bottom = '0'
        iframe.style.width = '1px'
        iframe.style.height = '1px'
        iframe.style.opacity = '0'
        iframe.style.border = '0'
        iframe.onload = () => setTimeout(() => iframe.remove(), 6000)
        document.body.appendChild(iframe)
      }
      setTimeout(() => resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // ── Derived mode + validation (createMutation already declared above) ──
  const mobileForSubmit = selectedPatient?.mobileNo ?? (isDigitMode && trimmedSmart.length >= 10 ? trimmedSmart : '')
  const effectiveName = selectedPatient?.name ?? (isDigitMode ? newName.trim() : trimmedSmart)
  const patientMode: 'existing' | 'register' | 'quick' = selectedPatient
    ? 'existing'
    : mobileForSubmit
      ? 'register'
      : 'quick'

  const missingName = !effectiveName
  const missingDisease = !disease.trim()
  const missingVisit = isHospitalMode
    ? !departmentId
      ? 'Select department'
      : !doctorId
        ? 'Select doctor'
        : null
    : null
  const canSubmit =
    !missingName && !missingDisease && !missingVisit && !createMutation.isPending && !result

  const handleSubmit = useCallback(() => {
    if (result) return
    if (missingName) {
      if (isDigitMode) {
        toast.error('Enter the patient name')
        nameInputRef.current?.focus()
      } else {
        toast.error('Type the patient name or mobile number')
        smartInputRef.current?.focus()
      }
      return
    }
    if (missingVisit) {
      toast.error(missingVisit)
      return
    }
    if (missingDisease) {
      toast.error('Enter the chief complaint (required for walk-in)')
      complaintInputRef.current?.focus()
      return
    }
    createMutation.mutate({
      patientMode,
      patientName: effectiveName,
      mobileNo: mobileForSubmit || undefined,
      gender: selectedPatient?.gender || newGender || undefined,
      age: selectedPatient?.age?.toString() || newAge || undefined,
      visitMode: 'walkin',
      departmentId: isHospitalMode ? departmentId : undefined,
      doctorId: isHospitalMode ? doctorId : undefined,
      visitDate: undefined, // server defaults to today
      bookingMode: 'InPerson',
      isEmergency,
      disease: disease.trim(),
    })
  }, [result, missingName, missingVisit, missingDisease, isDigitMode, patientMode, effectiveName, mobileForSubmit, selectedPatient, newGender, newAge, isHospitalMode, departmentId, doctorId, isEmergency, disease, createMutation])

  // ── AUTO-RESET: silent loop back to a fresh form (founder: no button press) ──
  const resetForm = useCallback(() => {
    if (autoResetTimer.current) {
      clearTimeout(autoResetTimer.current)
      autoResetTimer.current = null
    }
    setResult(null)
    setResetCountdown(0)
    setSmart('')
    setSelectedPatient(null)
    setShowMatches(false)
    setHighlightIndex(0)
    setNewName('')
    setNewAge('')
    setNewGender('')
    setDisease('')
    setIsEmergency(false)
    // department / doctor survive — they are the desk's default context
    queryClient.removeQueries({ queryKey: ['patient-search'] })
    setTimeout(() => smartInputRef.current?.focus(), 50)
  }, [queryClient])

  useEffect(() => {
    if (!result) {
      if (autoResetTimer.current) {
        clearTimeout(autoResetTimer.current)
        autoResetTimer.current = null
      }
      return
    }
    // countdown ticks
    const tick = setInterval(() => {
      setResetCountdown((c) => (c > 1 ? c - 1 : 0))
    }, 1000)
    autoResetTimer.current = setTimeout(() => {
      resetForm()
    }, AUTO_RESET_MS)
    return () => {
      clearInterval(tick)
      if (autoResetTimer.current) clearTimeout(autoResetTimer.current)
    }
  }, [result, resetForm])

  // Global keyboard: Enter submits (unless browsing matches), Esc resets flash
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && result) {
        resetForm()
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, resetForm])

  // ── Smart field handlers ──
  const onSmartChange = (value: string) => {
    // Pure digits → mobile-lookup mode; any letters → patient-name mode.
    // The search API treats both — the smart field never blocks typing.
    setSmart(value)
    if (selectedPatient) setSelectedPatient(null) // editing again → unlock
    setShowMatches(value.trim().length >= 2)
    setHighlightIndex(0)
  }

  const pickMatch = (m: PatientMatch) => {
    setSelectedPatient(m)
    setSmart(m.mobileNo || m.name)
    setShowMatches(false)
    setTimeout(() => complaintInputRef.current?.focus(), 60)
  }

  const clearPatient = () => {
    setSelectedPatient(null)
    setSmart('')
    setNewName('')
    setNewAge('')
    setNewGender('')
    setTimeout(() => smartInputRef.current?.focus(), 40)
  }

  // ── Queue rail helpers ──
  const queue = queueData?.queue ?? []
  const nowServing = queue.find((q) => q.status === 'Visited') ?? null
  const waitingCount = queue.filter((q) => q.status === 'Approve').length

  // ═══ RENDER ═══

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* ── Compact desk header: hospital + live pills ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
            <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">
              {stats?.hospital?.hospitalName ?? (stats?.doctor ? `Dr. ${stats.doctor.name}` : 'My Clinic')}
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {stats?.hospital?.contactNo && (
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{stats.hospital.contactNo}</span>
              )}
              {stats?.hospital?.city && (
                <span className="hidden items-center gap-1 sm:flex"><MapPin className="h-3 w-3" />{stats.hospital.city}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {stats?.todayAppointments ?? 0} today
          </Badge>
          <Badge variant="secondary" className="gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {stats?.todayVisited ?? 0} visited
          </Badge>
          <Badge variant="secondary" className="gap-1.5 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
            <ClipboardCheck className="h-3.5 w-3.5" />
            {stats?.pendingApprovals ?? 0} pending
          </Badge>
          <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Users className="h-3.5 w-3.5" />
            {waitingCount} in queue
          </Badge>
        </div>
      </div>

      {/* ── MAIN GRID: booking desk + live queue ── */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT — the one form */}
        <Card className="border-2 border-teal-200/70 shadow-sm dark:border-teal-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <Zap className="h-4 w-4" />
                </span>
                Register Patient
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                mobile or name → rest is automatic
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {result ? (
                /* ── RESULT FLASH — auto-resets, no button needed ── */
                <motion.div
                  key={result.booking.id}
                  ref={resultCardRef}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl bg-teal-50 py-6 text-center dark:bg-teal-950/30">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Booking confirmed — token
                    </p>
                    <p className="mt-1 font-mono text-5xl font-bold text-teal-700 dark:text-teal-300">
                      {result.booking.tokenNumber || '—'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                        Queue #{result.booking.queuePosition || '—'}
                      </Badge>
                      {result.booking.isEmergency && (
                        <Badge className="gap-1 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                          <Siren className="h-3 w-3" /> EMERGENCY
                        </Badge>
                      )}
                      <Badge variant="outline">{result.booking.patientName}</Badge>
                      <Badge variant="outline">{result.booking.doctorName}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Charge</span>
                    <span className="font-semibold">₹{result.booking.charge ?? 0}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      onClick={() =>
                        window.open(
                          `/bookings/print-token/${result.booking.id}`,
                          '_blank',
                          'width=400,height=600'
                        )
                      }
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Printer className="h-4 w-4" />
                      Print Token
                    </Button>
                    <Button onClick={resetForm} variant="outline">
                      <RotateCcw className="h-4 w-4" />
                      Next patient (now)
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {autoPrint && (
                      <span className="mr-1 inline-flex items-center gap-1 font-medium text-teal-600 dark:text-teal-400">
                        <Printer className="h-3 w-3" /> slip sent to printer ·
                      </span>
                    )}
                    Auto-resetting in {resetCountdown}s — you can keep working, just start typing
                    <span className="sr-only">. Press escape to reset now.</span>
                  </p>
                </motion.div>
              ) : (
                /* ── THE ONE FORM ── */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit()
                  }}
                  className="space-y-4"
                >
                  {/* SMART FIELD */}
                  <div className="relative">
                    <Label htmlFor="smart-field" className="text-xs font-medium">
                      Mobile number or patient name
                    </Label>
                    <div className="relative mt-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="smart-field"
                        ref={smartInputRef}
                        autoFocus
                        value={selectedPatient ? selectedPatient.mobileNo || selectedPatient.name : smart}
                        onChange={(e) => onSmartChange(e.target.value)}
                        onFocus={() => {
                          if (!selectedPatient && smart.trim().length >= 2) setShowMatches(true)
                        }}
                        onBlur={() => setTimeout(() => setShowMatches(false), 180)}
                        onKeyDown={(e) => {
                          if (!showMatches || matches.length === 0) return
                          if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            setHighlightIndex((i) => (i + 1) % matches.length)
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            setHighlightIndex((i) => (i - 1 + matches.length) % matches.length)
                          } else if (e.key === 'Enter' && highlightIndex >= 0 && matches[highlightIndex]) {
                            e.preventDefault()
                            pickMatch(matches[highlightIndex])
                          }
                        }}
                        type={isDigitMode ? 'tel' : 'text'}
                        inputMode={isDigitMode ? 'numeric' : 'text'}
                        placeholder="e.g. 9876543210 or Ramesh…"
                        disabled={!!selectedPatient && !!selectedPatient.mobileNo}
                        className="h-12 pl-9 pr-10 text-base font-medium transition-shadow focus-visible:border-teal-400 focus-visible:ring-teal-400/50 disabled:cursor-default disabled:opacity-100"
                        aria-label="Patient mobile number or name search"
                        aria-expanded={showMatches && matches.length > 0}
                        role="combobox"
                        aria-controls="smart-matches"
                      />
                      {selectedPatient ? (
                        <button
                          type="button"
                          onClick={clearPatient}
                          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Clear patient and start over"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : searchLoading ? (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      ) : (
                        isDigitMode &&
                        trimmedSmart.length === 10 &&
                        matches.length === 0 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                            New
                          </span>
                        )
                      )}
                    </div>

                    {/* Match dropdown (name / partial-mobile search) */}
                    {showMatches && !selectedPatient && matches.length > 0 && (
                      <motion.ul
                        id="smart-matches"
                        role="listbox"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg"
                      >
                        {matches.map((m, i) => (
                          <li key={m.id} role="option" aria-selected={i === highlightIndex}>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault() // keep input focus logic intact
                                pickMatch(m)
                              }}
                              onMouseEnter={() => setHighlightIndex(i)}
                              className={cn(
                                'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                                i === highlightIndex ? 'bg-teal-50 dark:bg-teal-950/40' : 'hover:bg-muted/60'
                              )}
                            >
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={getAvatarDisplayUrl(m.profileImg)} alt={m.name} />
                                <AvatarFallback className="bg-teal-100 text-xs text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                                  {m.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">{m.name}</span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {m.mobileNo || 'no mobile'} · {m.gender || '—'}
                                  {m.age != null ? ` · ${m.age}y` : ''}
                                </span>
                              </span>
                              <span className="shrink-0 text-right">
                                <span className="block text-xs font-semibold text-teal-600 dark:text-teal-400">
                                  {m.totalVisits > 0 ? `${m.totalVisits} visits` : '1st visit'}
                                </span>
                                {m.lastVisit && (
                                  <span className="block text-[10px] text-muted-foreground">
                                    last {new Date(m.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                              </span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </div>

                  {/* PATIENT CARD — existing (auto-filled, locked) */}
                  {selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 dark:border-teal-800 dark:bg-teal-950/30"
                      aria-live="polite"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={getAvatarDisplayUrl(selectedPatient.profileImg)} alt={selectedPatient.name} />
                          <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                            {selectedPatient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                            {selectedPatient.name}
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-label="Existing patient verified" />
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {selectedPatient.mobileNo || 'no mobile'}
                            {selectedPatient.gender ? ` · ${selectedPatient.gender}` : ''}
                            {selectedPatient.age != null ? ` · ${selectedPatient.age}y` : ''}
                            {selectedPatient.totalVisits > 0
                              ? ` · ${selectedPatient.totalVisits} past visit${selectedPatient.totalVisits > 1 ? 's' : ''}`
                              : ' · first visit here'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearPatient}
                          className="h-8 px-2 text-xs text-muted-foreground"
                        >
                          Change
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* NEW PATIENT ROW — mobile given, no match → register */}
                  {!selectedPatient && isDigitMode && trimmedSmart.length >= 10 && matches.length === 0 && !searchLoading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
                        New patient — will be registered automatically with this mobile
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        <div className="col-span-6 sm:col-span-3">
                          <Label htmlFor="new-name" className="text-xs">Patient name *</Label>
                          <Input
                            id="new-name"
                            ref={nameInputRef}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Full name"
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <Label htmlFor="new-age" className="text-xs">Age</Label>
                          <Input
                            id="new-age"
                            type="number"
                            min={0}
                            max={120}
                            value={newAge}
                            onChange={(e) => setNewAge(e.target.value)}
                            placeholder="35"
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <Label htmlFor="new-gender" className="text-xs">Gender</Label>
                          <select
                            id="new-gender"
                            value={newGender}
                            onChange={(e) => setNewGender(e.target.value)}
                            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">—</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* QUICK MODE HINT — name typed, no match picked */}
                  {!selectedPatient && !isDigitMode && trimmedSmart.length >= 2 && matches.length === 0 && !searchLoading && (
                    <p className="text-xs text-muted-foreground">
                      Booking walk-in as <b>{trimmedSmart}</b> — quick entry, no account needed.
                    </p>
                  )}

                  {/* DEPARTMENT chips — auto-locked when single */}
                  {isHospitalMode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Department *</Label>
                        {departments.length === 1 ? (
                          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] text-teal-600 dark:text-teal-400">
                            <CheckCircle2 className="h-3 w-3" /> auto-selected
                          </Badge>
                        ) : deptFromPrefs ? (
                          <button
                            type="button"
                            onClick={() => {
                              // Clear the remembered pairing for this desk
                              setDeptFromPrefs(false)
                              setDepartmentId('')
                              setDoctorId('')
                              savePrefs({ departmentId: '', doctorId: '' }) // '' = explicit clear
                            }}
                            title="Clear remembered department (click to pick fresh)"
                            className="inline-flex h-5 items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-1.5 text-[10px] font-medium text-violet-600 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400 dark:hover:bg-violet-900/40"
                          >
                            <History className="h-3 w-3" /> last used
                            <X className="h-2.5 w-2.5" />
                          </button>
                        ) : null}
                      </div>
                      {scheduleLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {departments.map((d) => {
                            const Icon = departmentIconMap[d.department.shortCode?.toUpperCase() || ''] ?? Stethoscope
                            const active = departmentId === d.department.id
                            return (
                              <button
                                key={d.department.id}
                                type="button"
                                onClick={() => {
                                  setDepartmentId(d.department.id)
                                  setDoctorId('') // cascade reset
                                  setDeptFromPrefs(false) // manual pick overrides memory
                                }}
                                aria-pressed={active}
                                className={cn(
                                  'flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
                                  active
                                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-300'
                                    : 'border-input text-muted-foreground hover:border-teal-300 hover:bg-teal-50/40 hover:text-foreground dark:hover:border-teal-700'
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {d.department.name}
                                {d.department.shortCode && (
                                  <span className={cn(
                                    'rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide',
                                    active ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-muted'
                                  )}>
                                    {d.department.shortCode}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DOCTOR chips — auto-locked when single */}
                  {isHospitalMode && departmentId && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Doctor *</Label>
                        {departmentDoctors.length === 1 && (
                          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] text-teal-600 dark:text-teal-400">
                            <CheckCircle2 className="h-3 w-3" /> auto-selected
                          </Badge>
                        )}
                      </div>
                      {departmentDoctors.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No active doctors in this department.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {departmentDoctors.map((doc) => {
                            const active = doctorId === doc.id
                            return (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => setDoctorId(doc.id)}
                                aria-pressed={active}
                                className={cn(
                                  'flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition-all',
                                  active
                                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-300'
                                    : 'border-input text-muted-foreground hover:border-teal-300 hover:bg-teal-50/40 hover:text-foreground dark:hover:border-teal-700'
                                )}
                              >
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={getAvatarDisplayUrl(doc.profileImg)} alt={doc.name} />
                                  <AvatarFallback className="bg-teal-100 text-[11px] text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                                    {doc.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                                <span className={cn(
                                  'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                                  active ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-muted'
                                )}>
                                  ₹{doc.fees ?? 0}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* COMPLAINT + EMERGENCY + SUBMIT */}
                  <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                    <div>
                      <Label htmlFor="complaint" className="text-xs">
                        Chief complaint *
                      </Label>
                      <Input
                        id="complaint"
                        ref={complaintInputRef}
                        value={disease}
                        onChange={(e) => setDisease(e.target.value)}
                        placeholder="Fever, chest pain, follow-up…"
                        className="mt-1"
                        aria-label="Chief complaint"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEmergency((v) => !v)}
                          aria-pressed={isEmergency}
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all',
                            isEmergency
                              ? 'border-rose-500 bg-rose-500 text-white shadow-sm'
                              : 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40'
                          )}
                        >
                          <Siren className="h-4 w-4" />
                          Emergency{isEmergency ? ' — queue top' : ''}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !autoPrint
                            setAutoPrint(next)
                            savePrefs({ autoPrint: next })
                          }}
                          aria-pressed={autoPrint}
                          title="Automatically print every token slip the moment a booking is confirmed"
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
                            autoPrint
                              ? 'border-teal-500 bg-teal-600 text-white shadow-sm'
                              : 'border-input text-muted-foreground hover:border-teal-300 hover:bg-teal-50/40 hover:text-foreground dark:hover:border-teal-700'
                          )}
                        >
                          <Printer className="h-4 w-4" />
                          Auto-print{autoPrint ? ' on' : ''}
                        </button>
                      </div>
                      {isHospitalMode && selectedDoctor && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Wallet className="h-3.5 w-3.5" />
                          OPD ₹{selectedDoctor.fees ?? 0}
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="h-12 w-full bg-teal-600 text-base font-semibold hover:bg-teal-700"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <UserRound className="h-5 w-5" />
                          Add to Queue
                          <kbd className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">⏎</kbd>
                        </>
                      )}
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      Need a future slot, express auto-doctor or video consult?{' '}
                      <Link
                        href="/dashboard/receptionist/booking"
                        className="font-medium text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
                      >
                        Advanced Booking →
                      </Link>
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* RIGHT — live queue rail */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Live Queue
              </span>
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {waitingCount} waiting
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {nowServing && (
              <div className="mx-3 mb-2 rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Now serving
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-xl font-bold text-teal-700 dark:text-teal-300">
                    {nowServing.tokenNumber || '—'}
                  </span>
                  <span className="min-w-0 text-right">
                    <span className="block truncate text-sm font-medium">{nowServing.patientName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{nowServing.doctorName}</span>
                  </span>
                </div>
              </div>
            )}
            <div className="max-h-96 overflow-y-auto px-3 pb-2 [scrollbar-width:thin]">
              {queue.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Queue is empty — next booking appears here instantly
                </p>
              )}
              <ul className="space-y-1">
                {queue.map((q) => (
                  <li
                    key={q.id}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors',
                      q.status === 'Visited' ? 'bg-teal-50/70 dark:bg-teal-950/20' : 'hover:bg-muted/50'
                    )}
                  >
                    <span className="w-16 shrink-0 font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                      {q.tokenNumber || q.appointmentNo.slice(-4)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{q.patientName}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {q.doctorName}
                        {q.disease ? ` · ${q.disease}` : ''}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        statusColors[q.status] ?? 'bg-muted text-muted-foreground'
                      )}
                    >
                      {q.status === 'Visited' ? 'In OPD' : `#${q.queuePosition}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
              <span>{queueData?.opdCompletedToday ?? 0} completed today</span>
              <Link
                href="/dashboard/receptionist/queue"
                className="flex items-center gap-1 font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                Full queue <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Today's appointments (compact) ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Today&apos;s Appointments</CardTitle>
          <Link href="/dashboard/receptionist/appointments">
            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 dark:text-teal-400">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {(stats?.todayAppointmentsList ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No appointments yet — the desk is ready
              </p>
            )}
            {(stats?.todayAppointmentsList ?? []).map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={getAvatarDisplayUrl(appt.patientImg)} alt={appt.patientName} />
                  <AvatarFallback className="bg-teal-100 text-xs text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                    {appt.patientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{appt.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(appt.date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    {isHospitalMode && appt.doctorName ? ` · ${appt.doctorName}` : ''}
                    {appt.disease ? ` · ${appt.disease}` : ''}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    statusColors[appt.status] ?? 'bg-muted text-muted-foreground'
                  )}
                >
                  {appt.status}
                </span>
                <span className="shrink-0 text-sm font-semibold">₹{appt.charge.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
