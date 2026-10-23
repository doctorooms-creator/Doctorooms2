'use client'

/**
 * UNIFIED BOOKING DESK — "One Booking Desk, 3 modes"
 * (Reception Panel P2, owner-approved founder design.)
 *
 * ONE surface replaces the three legacy booking pages:
 *   STEP 1 — Patient:   Mobile Lookup · Register New · Quick Name
 *   STEP 2 — Visit:     Department → associated Doctor (founder core flow)
 *   STEP 3 — When:      Today–Queue · Today–Express · Book Slot (future date)
 *
 * Every confirmed booking gets a UNIFORM {DEPT}-{NNN} token (EMR- only for
 * emergencies), a printable token slip, a stamped charge, and notifications —
 * regardless of mode. Queue page / TV board / doctor queue stay untouched and
 * simply pick the new bookings up.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Printer,
  RotateCcw,
  Search,
  Siren,
  Stethoscope,
  UserPlus,
  Users,
  Video,
  Wallet,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SlotGrid, type SlotInventory } from '@/components/reception/slot-grid'

// ─── Types ──────────────────────────────────────────────────────────────

type PatientMode = 'lookup' | 'register' | 'quick'
type VisitMode = 'walkin' | 'express' | 'scheduled'

interface ExistingPatient {
  id: string
  name: string
  gender: string | null
  mobileNo: string
}

interface ScheduleDoctor {
  id: string
  name: string
  profileImg: string | null
  specialization: string | null
  designation: string
  fees: number
  schedules: unknown[]
}

interface ScheduleDepartment {
  department: { id: string; name: string; shortCode: string; icon: string }
  doctors: ScheduleDoctor[]
}

interface QueueResponse {
  isHospitalMode: boolean
  totalInQueue: number
}

interface BookingResult {
  success: boolean
  linkedExisting?: boolean
  booking: {
    id: string
    appointmentNo: string
    patientName: string
    disease: string
    timeSlot: string
    bookingMode: string
    status: string
    isEmergency: boolean
    visitDate: string
    doctorId: string
    doctorName: string
    departmentName: string | null
    departmentShortCode: string | null
    floorNo: number | null
    opdRoom: string | null
    tokenNumber: string
    tokenOrder: number
    queuePosition: number
    charge: number
  }
  opdCount: number
  opdLimit: number
}

const todayISTStr = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Calcutta' }).format(new Date())

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// ─── Page ───────────────────────────────────────────────────────────────

export default function NewBookingPage() {
  const queryClient = useQueryClient()
  const resultRef = useRef<HTMLDivElement>(null)

  // ── Step 1: patient identity ──
  const [patientMode, setPatientMode] = useState<PatientMode>('lookup')
  const [mobileNo, setMobileNo] = useState('')
  const [patientName, setPatientName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [disease, setDisease] = useState('')
  // Register-new extras (demographics land on the booking record)
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [relationWithMe, setRelationWithMe] = useState('')

  // ── Step 2: visit (founder core flow — dept → associated doctor) ──
  const [departmentId, setDepartmentId] = useState('')
  const [doctorId, setDoctorId] = useState('')

  // ── Step 3: when ──
  const [visitMode, setVisitMode] = useState<VisitMode>('walkin')
  const [visitDate, setVisitDate] = useState(todayISTStr())
  const [timeSlot, setTimeSlot] = useState('')
  const [bookingMode, setBookingMode] = useState<'InPerson' | 'VideoCall'>('InPerson')
  const [isEmergency, setIsEmergency] = useState(false)

  // ── Result ──
  const [result, setResult] = useState<BookingResult | null>(null)

  // ── Mode discovery (queue GET tells us hospital vs clinic) ──
  const { data: queueData, isLoading: modeLoading } = useQuery<QueueResponse>({
    queryKey: ['walkin-queue'],
    queryFn: () => fetch('/api/dashboard/receptionist/walk-in').then((r) => r.json()),
    refetchInterval: 30_000,
  })
  const isHospitalMode = queueData?.isHospitalMode === true

  // ── Departments + doctors (hospital mode) / fixed doctor (clinic mode) ──
  const { data: scheduleData, isLoading: scheduleLoading } = useQuery<{
    isHospitalMode: boolean
    departments: ScheduleDepartment[]
    todayName: string
    doctor?: { id: string; name: string; profileImg: string | null; specialization: string | null }
  }>({
    queryKey: ['walkin-hospital-schedule'],
    queryFn: () => fetch('/api/dashboard/receptionist/schedule').then((r) => r.json()),
  })

  const departments = useMemo(() => scheduleData?.departments ?? [], [scheduleData])
  const clinicDoctor = scheduleData?.doctor ?? null

  // Cascading doctors of the selected department (founder flow)
  const departmentDoctors = useMemo(() => {
    if (!departmentId) return []
    const dept = departments.find((d) => d.department.id === departmentId)
    return dept?.doctors ?? []
  }, [departments, departmentId])

  const selectedDoctor = useMemo(
    () => departmentDoctors.find((d) => d.id === doctorId) ?? null,
    [departmentDoctors, doctorId]
  )

  // The doctor whose slot grid we show: express auto-assigns (no grid),
  // clinic mode → the linked doctor, hospital mode → the chosen doctor.
  const slotDoctorId = isHospitalMode ? doctorId : (clinicDoctor?.id ?? '')

  // ── Existing-patient lookup by mobile (debounced by react-query key) ──
  const { data: lookupData, isFetching: lookupLoading } = useQuery({
    queryKey: ['patient-lookup', mobileNo],
    queryFn: async (): Promise<{ found: boolean; patient?: ExistingPatient }> => {
      if (mobileNo.trim().length < 6) return { found: false }
      const res = await fetch(
        `/api/dashboard/receptionist/express-walkin?mobile=${encodeURIComponent(mobileNo.trim())}`
      )
      if (!res.ok) return { found: false }
      return res.json()
    },
    enabled: mobileNo.trim().length >= 6,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (lookupData?.found && lookupData.patient) {
      // Prefill only what the receptionist hasn't typed themselves
      setPatientName((prev) => (prev.trim() === '' ? lookupData.patient!.name : prev))
      setGender((prev) =>
        prev === '' && lookupData.patient!.gender ? lookupData.patient!.gender : prev
      )
    }
  }, [lookupData])

  // ── Live slot inventory for the selected doctor + chosen date ──
  const {
    data: slotInventory,
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots,
  } = useQuery<SlotInventory>({
    queryKey: ['slot-inventory', slotDoctorId, visitDate],
    queryFn: async () => {
      const res = await fetch(
        `/api/slots?doctorId=${encodeURIComponent(slotDoctorId)}&date=${visitDate}`
      )
      if (!res.ok) throw new Error('Failed to load slot inventory')
      return res.json() as Promise<SlotInventory>
    },
    enabled:
      visitMode !== 'express' &&
      !!slotDoctorId &&
      (visitMode === 'scheduled' ? !!visitDate : true),
    refetchInterval: 15_000,
  })

  // Auto-pick "next free slot" while nothing is chosen (walk-in convenience).
  // Scheduled mode requires an explicit choice — never auto-picks.
  useEffect(() => {
    if (!slotInventory || !slotDoctorId || visitMode === 'scheduled') return
    const next = slotInventory.nextFreeSlot
    if (!next) return
    const current = slotInventory.slots.find((s) => s.time === timeSlot)
    if (!timeSlot || current?.status !== 'free') {
      setTimeSlot(next)
    }
  }, [slotInventory, slotDoctorId, timeSlot, visitMode])

  // ── Mode resets: keep the form coherent when switches happen ──
  const switchPatientMode = useCallback((mode: PatientMode) => {
    setPatientMode(mode)
    if (mode !== 'register') {
      setDateOfBirth('')
      setBloodGroup('')
      setWeight('')
      setHeight('')
      setRelationWithMe('')
    }
  }, [])

  const switchVisitMode = useCallback((mode: VisitMode) => {
    setVisitMode(mode)
    setTimeSlot('')
    setIsEmergency(false)
    if (mode === 'express') {
      // Express = auto doctor; the receptionist's explicit choice is dropped
      setDoctorId('')
    }
    if (mode !== 'scheduled') {
      setVisitDate(todayISTStr())
    }
  }, [])

  const onDepartmentChange = useCallback((id: string) => {
    setDepartmentId(id)
    setDoctorId('') // cascading reset — doctors depend on the department
    setTimeSlot('')
  }, [])

  // ── Submit ──
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
      toast.success(
        data.booking.tokenNumber
          ? `Token ${data.booking.tokenNumber} assigned — Queue #${data.booking.queuePosition || '—'}`
          : 'Booking confirmed'
      )
      queryClient.invalidateQueries({ queryKey: ['walkin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['slot-inventory'] })
      queryClient.invalidateQueries({ queryKey: ['receptionist-stats'] })
      queryClient.invalidateQueries({ queryKey: ['receptionist-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['patient-lookup'] })
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      if (/slot/i.test(err.message)) {
        queryClient.invalidateQueries({ queryKey: ['slot-inventory'] })
      }
    },
  })

  const resetForm = useCallback(() => {
    setResult(null)
    setMobileNo('')
    setPatientName('')
    setGender('')
    setAge('')
    setDisease('')
    setDateOfBirth('')
    setBloodGroup('')
    setWeight('')
    setHeight('')
    setRelationWithMe('')
    setDepartmentId('')
    setDoctorId('')
    setTimeSlot('')
    setBookingMode('InPerson')
    setIsEmergency(false)
    setVisitDate(todayISTStr())
    setVisitMode('walkin')
  }, [])

  // ── Client-side validation ──
  const missingPatientName = !patientName.trim()
  const missingDisease = visitMode === 'walkin' && !disease.trim()
  const missingVisit =
    isHospitalMode && !departmentId
      ? 'Select a department'
      : isHospitalMode && visitMode !== 'express' && !doctorId
        ? 'Select a doctor'
        : visitMode === 'scheduled' && !timeSlot
          ? 'Pick a time slot'
          : null
  const missingMobile =
    patientMode !== 'quick' && mobileNo.trim().length < 10
      ? 'Enter the 10-digit mobile number'
      : null

  const canSubmit =
    !missingPatientName && !missingDisease && !missingVisit && !missingMobile && !createMutation.isPending

  const handleSubmit = () => {
    if (missingPatientName || missingDisease || missingVisit || missingMobile) {
      toast.error(missingPatientName || missingDisease || missingVisit || missingMobile)
      return
    }
    createMutation.mutate({
      patientMode,
      patientName,
      mobileNo: mobileNo.trim() || undefined,
      gender: gender || undefined,
      age: age || undefined,
      ...(patientMode === 'register'
        ? {
            dateOfBirth: dateOfBirth || undefined,
            bloodGroup: bloodGroup || undefined,
            weight: weight || undefined,
            height: height || undefined,
            relationWithMe: relationWithMe || undefined,
          }
        : {}),
      visitMode,
      departmentId: isHospitalMode ? departmentId : undefined,
      doctorId: isHospitalMode && visitMode !== 'express' ? doctorId : undefined,
      visitDate,
      timeSlot: timeSlot || undefined,
      bookingMode: visitMode === 'express' ? 'InPerson' : bookingMode,
      isEmergency,
      disease: disease.trim() || undefined,
    })
  }

  // ─── Render ────────────────────────────────────────────────────────────

  const submitLabel =
    visitMode === 'express' ? 'PRINT TOKEN' : visitMode === 'scheduled' ? 'Confirm Booking' : 'Add to Queue'
  const SubmitIcon = visitMode === 'express' ? Printer : visitMode === 'scheduled' ? CalendarPlus : UserPlus

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="h-6 w-6 text-teal-600" />
            New Appointment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            One booking desk — walk-in, express and future slots, uniform tokens
            {isHospitalMode ? '' : ' for your doctor'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
            {isHospitalMode ? 'Hospital Mode' : 'Clinic Mode'}
          </Badge>
          {queueData && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {queueData.totalInQueue} in queue today
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ─── LEFT: booking form ─── */}
        <div className="space-y-6">
          {/* STEP 1 — Patient */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  1
                </span>
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient-type selector */}
              <div role="tablist" aria-label="Patient type" className="grid grid-cols-3 gap-2 rounded-lg bg-muted/60 p-1">
                {(
                  [
                    { key: 'lookup', label: 'Mobile Lookup', icon: Search },
                    { key: 'register', label: 'Register New', icon: UserPlus },
                    { key: 'quick', label: 'Quick Name', icon: Zap },
                  ] as const
                ).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={patientMode === key}
                    onClick={() => switchPatientMode(key)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors',
                      patientMode === key
                        ? 'bg-background shadow-sm text-teal-700 dark:text-teal-400'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Mobile (lookup + register) */}
              {patientMode !== 'quick' && (
                <div>
                  <Label className="text-xs">
                    Mobile Number {patientMode === 'lookup' ? '(auto-detects patient)' : ''}
                  </Label>
                  <div className="relative">
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="pr-10"
                      aria-label="Patient mobile number"
                    />
                    {lookupLoading && mobileNo.length >= 6 && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {lookupData?.found && !lookupLoading && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  {lookupData?.found && lookupData.patient && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Existing patient: {lookupData.patient.name} — booking will be linked
                    </motion.p>
                  )}
                  {patientMode === 'lookup' &&
                    mobileNo.trim().length >= 10 &&
                    lookupData &&
                    !lookupData.found &&
                    !lookupLoading && (
                      <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                        No patient found on this number — switch to &quot;Register New&quot; or continue
                        with &quot;Quick Name&quot;.
                      </p>
                    )}
                </div>
              )}

              {/* Name / age / gender */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2">
                  <Label className="text-xs">Patient Name *</Label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full name"
                    aria-label="Patient name"
                  />
                </div>
                <div>
                  <Label className="text-xs">Age</Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="35"
                    min={0}
                    max={120}
                    aria-label="Patient age"
                  />
                </div>
                <div>
                  <Label className="text-xs">Gender</Label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Patient gender"
                  >
                    <option value="">—</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Register-new demographics */}
              {patientMode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 overflow-hidden rounded-lg border border-dashed p-3"
                >
                  <p className="text-xs text-muted-foreground">
                    A patient account is created (mobile is the login key) — extra details are
                    optional and stored on the booking.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs">Date of Birth</Label>
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={todayISTStr()}
                        aria-label="Date of birth"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Blood Group</Label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        aria-label="Blood group"
                      >
                        <option value="">—</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Relation</Label>
                      <Input
                        value={relationWithMe}
                        onChange={(e) => setRelationWithMe(e.target.value)}
                        placeholder="Self / Son / …"
                        aria-label="Relation with patient"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height (cm)</Label>
                      <Input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="170"
                        min={0}
                        aria-label="Height in cm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="65"
                        min={0}
                        aria-label="Weight in kg"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2 — Visit: dept → doctor (founder core flow) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  2
                </span>
                Visit — Department &amp; Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modeLoading || scheduleLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-2/3" />
                </div>
              ) : isHospitalMode ? (
                <>
                  <div>
                    <Label className="text-xs">Department *</Label>
                    <select
                      value={departmentId}
                      onChange={(e) => onDepartmentChange(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label="Department"
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.department.id} value={d.department.id}>
                          {d.department.name}
                          {d.department.shortCode ? ` (${d.department.shortCode})` : ''}
                        </option>
                      ))}
                    </select>
                    {visitMode !== 'express' && departments.length > 0 && !departmentId && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Pick the department first — its doctors load below (hospital flow).
                      </p>
                    )}
                  </div>

                  {visitMode === 'express' ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                      <Zap className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        Express mode auto-assigns the <b>least-busy available doctor</b> of the
                        selected department (holidays skipped). No doctor picker, no slot — just the
                        token.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs">Doctor *</Label>
                      {departmentId && departmentDoctors.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          No active doctors in this department.
                        </p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {departmentDoctors.map((doc) => (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => {
                                setDoctorId(doc.id)
                                setTimeSlot('')
                              }}
                              aria-pressed={doctorId === doc.id}
                              disabled={!departmentId}
                              className={cn(
                                'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                                doctorId === doc.id
                                  ? 'border-teal-500 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/40'
                                  : 'border-input hover:bg-muted/50'
                              )}
                            >
                              <Avatar className="h-9 w-9 shrink-0">
                                <AvatarImage src={doc.profileImg || undefined} alt={doc.name} />
                                <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 text-xs">
                                  {doc.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{doc.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {doc.designation || doc.specialization || 'Doctor'}
                                </p>
                              </div>
                              <Badge variant="secondary" className="shrink-0 gap-0.5">
                                <Wallet className="h-3 w-3" />₹{doc.fees ?? 0}
                              </Badge>
                            </button>
                          ))}
                          {departmentId === '' && (
                            <p className="text-xs text-muted-foreground col-span-2 py-2">
                              Select a department to see its doctors.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Clinic mode — the receptionist's own doctor, fixed */
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={clinicDoctor?.profileImg || undefined}
                      alt={clinicDoctor?.name || 'Doctor'}
                    />
                    <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                      {(clinicDoctor?.name || 'D').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {clinicDoctor?.name || 'Your doctor'}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (fixed — clinic mode)
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {clinicDoctor?.specialization || 'Doctor'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 3 — When */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  3
                </span>
                When &amp; Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visit-mode selector */}
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { key: 'walkin', label: 'Today — Queue', icon: Users, hint: 'Optional slot or queue tail' },
                    ...(isHospitalMode
                      ? [{ key: 'express', label: 'Today — Express', icon: Zap, hint: '5-second rush mode' }]
                      : []),
                    { key: 'scheduled', label: 'Book Slot', icon: CalendarPlus, hint: 'Today or future date' },
                  ] as const
                ).map(({ key, label, icon: Icon, hint }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={visitMode === key}
                    onClick={() => switchVisitMode(key)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                      visitMode === key
                        ? 'border-teal-500 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/40'
                        : 'border-input hover:bg-muted/50'
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          visitMode === key ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'
                        )}
                      />
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                  </button>
                ))}
              </div>

              {/* Scheduled: date picker */}
              {visitMode === 'scheduled' && (
                <div>
                  <Label className="text-xs">Visit Date *</Label>
                  <Input
                    type="date"
                    value={visitDate}
                    min={todayISTStr()}
                    onChange={(e) => {
                      setVisitDate(e.target.value)
                      setTimeSlot('')
                    }}
                    className="w-full sm:w-56"
                    aria-label="Visit date"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Future-dated bookings get their token NOW — it counts against that
                    day&apos;s queue.
                  </p>
                </div>
              )}

              {/* Slot grid (walk-in today + scheduled) */}
              {visitMode !== 'express' && (
                <div className="space-y-2">
                  <Label className="text-xs">
                    Time Slot{' '}
                    {visitMode === 'scheduled' ? '*' : '(optional — queue tail allowed)'}
                  </Label>
                  <SlotGrid
                    inventory={slotInventory}
                    isLoading={slotsLoading}
                    isError={slotsError}
                    onRetry={refetchSlots}
                    selectedTime={timeSlot}
                    onSelect={setTimeSlot}
                    autoHint={false}
                    disabled={!slotDoctorId || createMutation.isPending}
                    queueTailHidden={visitMode === 'scheduled'}
                  />
                </div>
              )}

              {/* Emergency toggle — today's queue only */}
              {visitMode === 'walkin' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority</Label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEmergency}
                    disabled={createMutation.isPending}
                    onClick={() => setIsEmergency((v) => !v)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md border px-3 h-9 text-xs font-medium transition-colors',
                      isEmergency
                        ? 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'border-input bg-background text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/30'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-7 shrink-0 items-center rounded-full border border-transparent transition-colors',
                        isEmergency ? 'bg-rose-500' : 'bg-muted-foreground/30'
                      )}
                    >
                      <span
                        className={cn(
                          'h-3 w-3 rounded-full bg-white shadow transition-transform',
                          isEmergency ? 'translate-x-3.5' : 'translate-x-0.5'
                        )}
                      />
                    </span>
                    <Siren className="h-3.5 w-3.5" aria-hidden="true" />
                    Emergency — insert at queue top (EMR token)
                  </button>
                  {isEmergency && (
                    <p className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                      <Siren className="h-3 w-3 shrink-0" aria-hidden="true" />
                      Emergency bookings skip slot checks and go to the front of the queue.
                    </p>
                  )}
                </div>
              )}

              {/* InPerson / Video toggle */}
              {visitMode !== 'express' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Consultation Type</Label>
                  <div className="grid grid-cols-2 gap-2 sm:w-72">
                    {(
                      [
                        { key: 'InPerson', label: 'In Person', icon: Stethoscope },
                        { key: 'VideoCall', label: 'Video Call', icon: Video },
                      ] as const
                    ).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={bookingMode === key}
                        onClick={() => setBookingMode(key)}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-md border px-3 h-9 text-xs font-medium transition-colors',
                          bookingMode === key
                            ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-300'
                            : 'border-input text-muted-foreground hover:bg-muted/50'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Disease / reason */}
              <div>
                <Label className="text-xs">
                  Chief Complaint {visitMode === 'walkin' ? '*' : '(optional)'}
                </Label>
                <Input
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  placeholder="Fever, chest pain, follow-up…"
                  aria-label="Chief complaint"
                />
              </div>

              {/* Charge preview */}
              {selectedDoctor && visitMode !== 'express' && (
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5" /> OPD charge
                  </span>
                  <span className="font-semibold">₹{selectedDoctor.fees ?? 0}</span>
                </div>
              )}

              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-base font-semibold"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <SubmitIcon className="h-5 w-5 mr-2" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT: result / token slip panel ─── */}
        <div ref={resultRef} className="xl:sticky xl:top-4 h-fit">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.booking.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <Card className="border-2 border-teal-300 dark:border-teal-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-teal-700 dark:text-teal-400">
                      <CheckCircle2 className="h-5 w-5" />
                      Booking Confirmed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.linkedExisting && (
                      <p className="text-xs rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-2">
                        Mobile already registered — the booking was linked to the existing patient
                        account (no duplicate created).
                      </p>
                    )}

                    <div className="text-center py-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Token Number
                      </p>
                      <p className="text-4xl font-bold font-mono text-teal-700 dark:text-teal-300 mt-1">
                        {result.booking.tokenNumber || '—'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                        {result.booking.queuePosition > 0 && (
                          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                            Queue Position: #{result.booking.queuePosition}
                          </Badge>
                        )}
                        {result.booking.isEmergency && (
                          <Badge className="gap-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                            <Siren className="h-3 w-3" />
                            EMERGENCY
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {result.booking.visitDate}
                          {result.booking.timeSlot ? ` · ${result.booking.timeSlot}` : ''}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Patient</span>
                        <span className="font-medium text-right">{result.booking.patientName}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Doctor</span>
                        <span className="font-medium text-right">{result.booking.doctorName}</span>
                      </div>
                      {result.booking.departmentName && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Department</span>
                          <span className="text-right">{result.booking.departmentName}</span>
                        </div>
                      )}
                      {(result.booking.opdRoom || result.booking.floorNo !== null) && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Location</span>
                          <span className="text-right">
                            {result.booking.opdRoom || '—'}
                            {result.booking.floorNo !== null ? ` · Floor ${result.booking.floorNo}` : ''}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Ref No</span>
                        <span className="font-mono text-xs text-right">
                          {result.booking.appointmentNo}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Charge</span>
                        <span className="font-semibold text-right">₹{result.booking.charge ?? 0}</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Button
                        onClick={() =>
                          window.open(
                            `/bookings/print-token/${result.booking.id}`,
                            '_blank',
                            'width=400,height=600'
                          )
                        }
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Token Slip
                      </Button>
                      <Button onClick={resetForm} variant="outline" className="w-full">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Book Another Patient
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="hidden xl:block">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium">Token slip preview</p>
                  <p className="text-xs mt-1">
                    Every confirmed booking — walk-in, express or future slot — issues a uniform{' '}
                    <span className="font-mono">{`{DEPT}-NNN`}</span> token, printable here.
                  </p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
