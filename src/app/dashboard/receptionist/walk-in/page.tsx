'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlotGrid, type SlotInventory } from '@/components/reception/slot-grid'
import {
  UserPlus,
  Loader2,
  Clock,
  UserRound,
  Video,
  Users,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  Building2,
  Filter,
  CheckCircle2,
  Siren,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ============ Types ============

interface QueueItem {
  id: string
  appointmentNo: string
  patientName: string
  patientImg: string | null
  disease: string
  timeSlot: string | null
  bookingMode: string
  bookingType: string
  createdAt: string
  status: string
  queuePosition: number
  // Hospital mode fields
  doctorId?: string
  doctorName?: string
  departmentId?: string | null
  tokenNumber?: string | null
  tokenOrder?: number
}

interface QueueData {
 date: string
  totalInQueue: number
  queue: QueueItem[]
  opdLimit?: number
  opdCompletedToday: number
  isHospitalMode?: boolean
}

interface ScheduleSlot {
  day: string
  timeSlots: string[]
  startTime: string
  endTime: string
  slotDuration: number
}

interface DoctorScheduleEntry {
  id: string
  name: string
  profileImg: string | null
  specialization: string
  designation: string
  fees: number
  schedules: (ScheduleSlot | null)[]
}

interface Department {
  department: {
    id: string
    name: string
    shortCode: string
    icon: string
  }
  doctors: DoctorScheduleEntry[]
}

interface ExistingPatient {
  id: string
  name: string
  gender?: string | null
  mobileNo?: string | null
}

// ============ Constants ============

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

// ============ Component ============

export default function WalkInPage() {
  const queryClient = useQueryClient()
  const queueRef = useRef<HTMLDivElement>(null)

  // Form state
  const [patientName, setPatientName] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [disease, setDisease] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [bookingMode, setBookingMode] = useState<string>('InPerson')
  const [isEmergency, setIsEmergency] = useState(false)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)

  // ── Existing-patient lookup by mobile (CTO Plan Phase 4) ──
  // Best-effort: debounce ~600ms after ≥6 chars, hit the existing
  // express-walkin lookup endpoint, then surface an inline hint.
  const [mobileLookup, setMobileLookup] = useState<{
    ran: boolean
    found: boolean
    patient?: ExistingPatient
  }>({ ran: false, found: false })

  useEffect(() => {
    const num = mobileNo.trim()
    if (num.length < 6) {
      setMobileLookup({ ran: false, found: false })
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/dashboard/receptionist/express-walkin?mobile=${encodeURIComponent(num)}`
        )
        if (!res.ok) {
          // best-effort — never surface lookup failures
          setMobileLookup({ ran: false, found: false })
          return
        }
        const data = await res.json()
        if (data?.found && data.patient?.id) {
          const patient: ExistingPatient = data.patient
          setMobileLookup({ ran: true, found: true, patient })
          // Prefill only when the receptionist hasn't typed their own values
          setPatientName((prev) => (prev.trim() === '' ? patient.name : prev))
          setGender((prev) =>
            prev === '' && patient.gender ? patient.gender : prev
          )
        } else {
          setMobileLookup({ ran: true, found: false })
        }
      } catch {
        // lookup is best-effort — silently ignore
      }
    }, 600)
    return () => clearTimeout(t)
  }, [mobileNo])

  // Hospital mode state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [queueDoctorFilter, setQueueDoctorFilter] = useState<string>('all')

  // Fetch today's queue (returns isHospitalMode flag)
  const { data: queueData, isLoading: queueLoading } = useQuery<QueueData>({
    queryKey: ['walkin-queue'],
    queryFn: () =>
      fetch('/api/dashboard/receptionist/walk-in').then((r) => r.json()),
    refetchInterval: 15_000,
  })

  const isHospitalMode = queueData?.isHospitalMode === true

  // Fetch departments & doctors for hospital mode
  const { data: hospitalScheduleData, isLoading: hospitalScheduleLoading } = useQuery<{
    isHospitalMode: boolean
    departments: Department[]
    todayName: string
  }>({
    queryKey: ['walkin-hospital-schedule'],
    queryFn: () =>
      fetch('/api/dashboard/receptionist/schedule').then((r) => r.json()),
    enabled: isHospitalMode,
  })

  const departments = hospitalScheduleData?.departments ?? []

  // Get selected department's doctors
  const departmentDoctors = useMemo(() => {
    if (!selectedDepartmentId) return []
    const dept = departments.find(
      (d) => d.department.id === selectedDepartmentId
    )
    return dept?.doctors ?? []
  }, [departments, selectedDepartmentId])

  // Fetch clinic-mode doctor schedule (gives us the linked doctor's id for
  // the live slot inventory)
  const { data: clinicScheduleResponse, isLoading: clinicScheduleLoading } =
    useQuery<{
      doctor?: { id: string; name: string }
      schedules: (ScheduleSlot | null)[]
      todayName: string
    }>({
      queryKey: ['walkin-doctor-schedule'],
      queryFn: () =>
        fetch('/api/dashboard/receptionist/schedule').then((r) => r.json()),
      enabled: !isHospitalMode,
    })

  // ── Live slot inventory (CTO Plan Phase 2, item 2c) ──
  // Today's date in IST (YYYY-MM-DD) — the same timezone the slot API and
  // queue endpoints use. Recomputed every render so a page left open past
  // midnight IST rolls over on the next poll.
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Calcutta',
  }).format(new Date())

  // Resolve the doctor whose slots we show: clinic mode → the linked
  // doctor, hospital mode → the doctor selected in the form.
  const slotDoctorId = isHospitalMode
    ? selectedDoctorId
    : (clinicScheduleResponse?.doctor?.id ?? '')

  const {
    data: slotInventory,
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots,
  } = useQuery<SlotInventory>({
    queryKey: ['slot-inventory', slotDoctorId, todayStr],
    queryFn: async () => {
      const res = await fetch(
        `/api/slots?doctorId=${encodeURIComponent(slotDoctorId)}&date=${todayStr}`
      )
      if (!res.ok) {
        throw new Error('Failed to load slot inventory')
      }
      return res.json() as Promise<SlotInventory>
    },
    enabled: !!slotDoctorId,
    refetchInterval: 15_000, // matches queue polling
  })

  // Slot-selection bookkeeping. `timeSlot` stays '' for "queue tail" so the
  // submit body (timeSlot || null) keeps making the backend stamp
  // currentTimeIST(). `queueTailPicked` records an explicit tail choice so
  // auto-select never overrides it; `autoPickedSlot` drives the
  // "Auto: next free slot" hint chip.
  const [queueTailPicked, setQueueTailPicked] = useState(false)
  const [autoPickedSlot, setAutoPickedSlot] = useState(false)

  const resetSlotSelection = useCallback(() => {
    setTimeSlot('')
    setQueueTailPicked(false)
    setAutoPickedSlot(false)
  }, [])

  const handleSlotSelect = useCallback((time: string) => {
    setTimeSlot(time)
    setQueueTailPicked(time === '')
    setAutoPickedSlot(false) // manual choice overrides the auto hint
  }, [])

  // Auto-select "next free": when the inventory loads and the current
  // selection is empty or no longer valid (taken/past/not in the list —
  // e.g. another receptionist claimed it between polls), fall back to the
  // next free slot. Guards: never overrides an explicit "queue tail"
  // choice, and only fires while the current value is empty/invalid, so a
  // valid user selection is never fought.
  useEffect(() => {
    if (!slotInventory || !slotDoctorId) return
    if (queueTailPicked) return
    const next = slotInventory.nextFreeSlot
    if (!next) return
    const current = slotInventory.slots.find((s) => s.time === timeSlot)
    if (!timeSlot || current?.status !== 'free') {
      setTimeSlot(next)
      setAutoPickedSlot(true)
    }
  }, [slotInventory, slotDoctorId, timeSlot, queueTailPicked])

  // Walk-in mutation
  const walkInMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch('/api/dashboard/receptionist/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.success) {
        if (isHospitalMode && result.booking?.tokenNumber) {
          toast.success(
            `Token ${result.booking.tokenNumber} assigned! Queue #${result.queuePosition}`
          )
        } else {
          toast.success(
            `Patient added to queue #${result.queuePosition}!`
          )
        }
        setLastAddedId(result.booking.id)
        // Reset form
        setPatientName('')
        setMobileNo('')
        setGender('')
        setAge('')
        setDisease('')
        resetSlotSelection() // also re-arms "next free slot" auto-pick
        setBookingMode('InPerson')
        setIsEmergency(false)
        // Reset hospital mode selections
        setSelectedDepartmentId('')
        setSelectedDoctorId('')
        // Invalidate and refetch queue
        queryClient.invalidateQueries({ queryKey: ['walkin-queue'] })
        // Refresh the live slot grid (the booked slot now shows as taken)
        queryClient.invalidateQueries({ queryKey: ['slot-inventory'] })
        queryClient.invalidateQueries({ queryKey: ['receptionist-stats'] })
        queryClient.invalidateQueries({
          queryKey: ['receptionist-appointments'],
        })
        // Scroll to queue after a tick
        setTimeout(() => {
          queueRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 300)
      } else {
        toast.error(result.error || 'Failed to register patient')
        // Slot conflicts (e.g. "Time slot 10:30 is already booked", 409 from
        // the race-safe claim) — refresh the live grid so the newly taken
        // slot shows as booked
        if (result.error && /slot/i.test(result.error)) {
          queryClient.invalidateQueries({ queryKey: ['slot-inventory'] })
        }
      }
    },
    onError: (err: Error) => {
      toast.error(
        err?.message && /slot/i.test(err.message)
          ? err.message
          : 'Failed to register walk-in patient'
      )
      // Our slot view may be stale after a failed submit — refresh the grid
      queryClient.invalidateQueries({ queryKey: ['slot-inventory'] })
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!patientName.trim() || !disease.trim()) {
        toast.error('Patient name and disease/reason are required')
        return
      }
      if (isHospitalMode && (!selectedDepartmentId || !selectedDoctorId)) {
        toast.error('Please select both department and doctor')
        return
      }

      const body: Record<string, unknown> = {
        patientName: patientName.trim(),
        mobileNo: mobileNo.trim(),
        gender,
        age: age ? parseInt(age, 10) : null,
        disease: disease.trim(),
        timeSlot: timeSlot || null,
        bookingMode,
        isEmergency,
      }

      if (isHospitalMode) {
        body.departmentId = selectedDepartmentId
        body.doctorId = selectedDoctorId
      }

      walkInMutation.mutate(body)
    },
    [
      patientName,
      mobileNo,
      gender,
      age,
      disease,
      timeSlot,
      bookingMode,
      isEmergency,
      walkInMutation,
      isHospitalMode,
      selectedDepartmentId,
      selectedDoctorId,
    ]
  )

  const isSubmitting = walkInMutation.isPending
  const queue = queueData?.queue ?? []
  const opdLimit = queueData?.opdLimit ?? 0
  const totalInQueue = queueData?.totalInQueue ?? 0
  const opdCompletedToday = queueData?.opdCompletedToday ?? 0

  // Filtered queue for hospital mode
  const filteredQueue = useMemo(() => {
    if (!isHospitalMode || queueDoctorFilter === 'all') return queue
    return queue.filter((item) => item.doctorId === queueDoctorFilter)
  }, [queue, isHospitalMode, queueDoctorFilter])

  // Unique doctors in queue for filter dropdown
  const queueDoctorOptions = useMemo(() => {
    if (!isHospitalMode) return []
    const seen = new Map<string, string>()
    for (const item of queue) {
      if (item.doctorId && item.doctorName) {
        seen.set(item.doctorId, item.doctorName)
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({
      id,
      name,
    }))
  }, [queue, isHospitalMode])

  // Check if form is valid for submit
  const canSubmit =
    patientName.trim() &&
    disease.trim() &&
    (!isHospitalMode || (selectedDepartmentId && selectedDoctorId))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40">
          <UserPlus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Walk-in Registration
          </h2>
          <p className="text-sm text-muted-foreground">
            {isHospitalMode
              ? 'Register walk-in patients to a department and doctor'
              : 'Register walk-in patients directly to the queue'}
          </p>
        </div>
        {isHospitalMode && (
          <Badge className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400">
            <Building2 className="mr-1 h-3 w-3" />
            Hospital Mode
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* ============ LEFT: Registration Form ============ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* ── Hospital Mode: Department + Doctor Selection ── */}
                {isHospitalMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {/* Department Select */}
                    <div className="space-y-1">
                      <Label
                        htmlFor="department"
                        className="text-xs font-medium"
                      >
                        <Building2 className="mr-1 inline h-3 w-3" />
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedDepartmentId}
                        onValueChange={(val) => {
                          setSelectedDepartmentId(val)
                          setSelectedDoctorId('')
                          resetSlotSelection()
                        }}
                        disabled={
                          isSubmitting || hospitalScheduleLoading
                        }
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.length === 0 &&
                            !hospitalScheduleLoading && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                No departments available
                              </div>
                            )}
                          {hospitalScheduleLoading && (
                            <div className="flex items-center gap-2 px-2 py-1.5">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-xs text-muted-foreground">
                                Loading departments...
                              </span>
                            </div>
                          )}
                          {departments.map((dept) => (
                            <SelectItem
                              key={dept.department.id}
                              value={dept.department.id}
                            >
                              <span className="flex items-center gap-2">
                                {dept.department.icon && (
                                  <span>{dept.department.icon}</span>
                                )}
                                <span className="font-medium">
                                  {dept.department.name}
                                </span>
                                {dept.department.shortCode && (
                                  <span className="text-muted-foreground">
                                    ({dept.department.shortCode})
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Doctor Select */}
                    <div className="space-y-1">
                      <Label
                        htmlFor="doctor"
                        className="text-xs font-medium"
                      >
                        <Stethoscope className="mr-1 inline h-3 w-3" />
                        Doctor <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedDoctorId}
                        onValueChange={(val) => {
                          setSelectedDoctorId(val)
                          resetSlotSelection()
                        }}
                        disabled={
                          isSubmitting || !selectedDepartmentId
                        }
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder={
                            selectedDepartmentId
                              ? 'Select doctor'
                              : 'Select a department first'
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentDoctors.length === 0 &&
                            selectedDepartmentId && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                No doctors in this department
                              </div>
                            )}
                          {departmentDoctors.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              <span className="flex items-center gap-2">
                                <span className="font-medium">
                                  {doc.name}
                                </span>
                                {doc.specialization && (
                                  <span className="text-xs text-muted-foreground">
                                    {doc.specialization}
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Patient Details
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </motion.div>
                )}

                {/* Patient Name */}
                <div className="space-y-1">
                  <Label htmlFor="patientName" className="text-xs font-medium">
                    Patient Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    placeholder="Full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                    className="h-9"
                  />
                </div>

                {/* Mobile + Gender row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="mobileNo" className="text-xs font-medium">
                      Mobile No.
                    </Label>
                    <Input
                      id="mobileNo"
                      placeholder="Phone number"
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      disabled={isSubmitting}
                      className="h-9"
                    />
                    {/* Existing-patient lookup hint (Phase 4) */}
                    {mobileLookup.found && mobileLookup.patient ? (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 px-2.5 py-2 text-[11px] leading-snug text-emerald-700 dark:text-emerald-400"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          Existing patient:{' '}
                          <span className="font-semibold">
                            {mobileLookup.patient.name}
                          </span>
                          {mobileLookup.patient.gender
                            ? ` (${mobileLookup.patient.gender})`
                            : ''}
                          — booking will be linked to their account
                        </span>
                      </motion.div>
                    ) : mobileLookup.ran &&
                      !mobileLookup.found &&
                      mobileNo.trim().length >= 6 ? (
                      <p className="text-[11px] text-muted-foreground">
                        New patient — details will be saved with this booking
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gender" className="text-xs font-medium">
                      Gender
                    </Label>
                    <Select
                      value={gender}
                      onValueChange={setGender}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <Label htmlFor="age" className="text-xs font-medium">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    min={0}
                    max={150}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>

                {/* Disease/Reason */}
                <div className="space-y-1">
                  <Label htmlFor="disease" className="text-xs font-medium">
                    Disease / Reason <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="disease"
                    placeholder="e.g. Fever, Headache, Check-up"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>

                {/* Time Slot — live slot grid (optional) */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Time Slot{' '}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  {isHospitalMode && !selectedDoctorId ? (
                    <p className="text-xs italic text-muted-foreground">
                      Select a doctor to see live slot availability
                    </p>
                  ) : (
                    <SlotGrid
                      inventory={slotInventory}
                      isLoading={
                        slotsLoading ||
                        (!isHospitalMode && clinicScheduleLoading)
                      }
                      isError={slotsError}
                      onRetry={() => refetchSlots()}
                      selectedTime={timeSlot}
                      onSelect={handleSlotSelect}
                      autoHint={autoPickedSlot}
                      disabled={isSubmitting}
                    />
                  )}
                </div>

                {/* Booking Mode Toggle */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Booking Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        bookingMode === 'InPerson' ? 'default' : 'outline'
                      }
                      size="sm"
                      className={cn(
                        'flex-1 gap-1.5 h-9',
                        bookingMode === 'InPerson' &&
                          'bg-teal-600 text-white hover:bg-teal-700'
                      )}
                      onClick={() => setBookingMode('InPerson')}
                      disabled={isSubmitting}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      In Person
                    </Button>
                    <Button
                      type="button"
                      variant={
                        bookingMode === 'VideoCall' ? 'default' : 'outline'
                      }
                      size="sm"
                      className={cn(
                        'flex-1 gap-1.5 h-9',
                        bookingMode === 'VideoCall' &&
                          'bg-teal-600 text-white hover:bg-teal-700'
                      )}
                      onClick={() => setBookingMode('VideoCall')}
                      disabled={isSubmitting}
                    >
                      <Video className="h-3.5 w-3.5" />
                      Video Call
                    </Button>
                  </div>
                </div>

                {/* Emergency toggle (Phase 4 — queue-top insert) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Priority</Label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEmergency}
                    disabled={isSubmitting}
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
                      Emergency bookings skip slot checks and go to the front of
                      the queue.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="w-full gap-2 bg-teal-600 text-white hover:bg-teal-700 h-10 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add to Queue
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============ RIGHT: Today's Queue ============ */}
        <motion.div
          ref={queueRef}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Today&apos;s Queue</CardTitle>
                  {isHospitalMode ? (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    >
                      {filteredQueue.length} patients
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
                    >
                      {totalInQueue}/{opdLimit}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw
                    className={cn(
                      'h-3.5 w-3.5',
                      queueLoading && 'animate-spin'
                    )}
                  />
                  <span>Auto-refresh 15s</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Hospital mode: Doctor filter dropdown */}
              {isHospitalMode && queueDoctorOptions.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select
                      value={queueDoctorFilter}
                      onValueChange={setQueueDoctorFilter}
                    >
                      <SelectTrigger className="h-8 w-full max-w-xs text-xs">
                        <SelectValue placeholder="Filter by doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Doctors ({queue.length})
                        </SelectItem>
                        {queueDoctorOptions.map((doc) => {
                          const count = queue.filter(
                            (q) => q.doctorId === doc.id
                          ).length
                          return (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.name} ({count})
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* OPD progress bar (clinic mode only) */}
              {!isHospitalMode && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Completed: {opdCompletedToday}</span>
                    <span>In Queue: {totalInQueue}</span>
                    <span>Limit: {opdLimit}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-teal-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          ((opdCompletedToday + totalInQueue) / opdLimit) * 100,
                          100
                        )}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Hospital mode summary */}
              {isHospitalMode && (
                <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Completed: {opdCompletedToday}</span>
                  <span>In Queue: {filteredQueue.length}</span>
                </div>
              )}

              {/* Queue list */}
              {queueLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                    >
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                      </div>
                      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {queueDoctorFilter !== 'all'
                      ? 'No patients for this doctor'
                      : 'No patients in queue'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Walk-in patients will appear here
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {filteredQueue.map((item) => {
                      const isJustAdded = item.id === lastAddedId
                      const ModeIcon =
                        item.bookingMode === 'VideoCall'
                          ? Video
                          : UserRound

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={
                            isJustAdded
                              ? {
                                  opacity: 0,
                                  scale: 0.95,
                                  y: -10,
                                }
                              : { opacity: 0, y: 10 }
                          }
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            backgroundColor: isJustAdded
                              ? 'rgba(20, 184, 166, 0.08)'
                              : 'transparent',
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                            y: -10,
                          }}
                          transition={{
                            layout: {
                              type: 'spring',
                              stiffness: 350,
                              damping: 30,
                            },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 },
                            backgroundColor: {
                              duration: 2,
                              delay: 1,
                            },
                          }}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                            isJustAdded
                              ? 'border-teal-300 dark:border-teal-700'
                              : 'border-border/50 hover:border-border',
                            item.status === 'Visited' && 'opacity-60'
                          )}
                        >
                          {/* Queue position / Token badge (amber — palette rule: teal/emerald/amber/rose only) */}
                          {isHospitalMode && item.tokenNumber ? (
                            <div className="flex h-8 shrink-0 items-center justify-center rounded-md bg-amber-100 px-2 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                              {item.tokenNumber}
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                              {item.queuePosition}
                            </div>
                          )}

                          {/* Patient info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {item.patientName}
                              </p>
                              {item.bookingType === 'By Receptionist' && (
                                <Badge
                                  variant="outline"
                                  className="h-4 shrink-0 px-1.5 text-[10px] font-normal text-teal-600 dark:text-teal-400"
                                >
                                  Walk-in
                                </Badge>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              {/* Hospital mode: show doctor name */}
                              {isHospitalMode && item.doctorName && (
                                <span className="flex shrink-0 items-center gap-0.5 font-medium text-amber-600 dark:text-amber-400">
                                  <Stethoscope className="h-3 w-3" />
                                  {item.doctorName}
                                </span>
                              )}
                              {item.disease && (
                                <span className="truncate max-w-[140px]">
                                  {item.disease}
                                </span>
                              )}
                              {item.timeSlot && (
                                <span className="flex shrink-0 items-center gap-0.5">
                                  <Clock className="h-3 w-3" />
                                  {item.timeSlot}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status + Mode */}
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px]',
                                item.status === 'Approve'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                              )}
                            >
                              {item.status === 'Approve'
                                ? 'Waiting'
                                : 'In Consultation'}
                            </Badge>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ModeIcon className="h-3 w-3" />
                              <span className="text-[10px]">
                                {item.bookingMode === 'VideoCall'
                                  ? 'Video'
                                  : 'In-Person'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
