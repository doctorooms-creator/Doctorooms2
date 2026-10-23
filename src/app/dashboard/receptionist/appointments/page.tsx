'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  CalendarDays,
  CalendarClock,
  Search,
  Clock,
  UserCheck,
  UserX,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  Stethoscope,
  Printer,
  MessageCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppointmentChat from '@/components/receptionist/appointment-chat'
import { cn } from '@/lib/utils'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import { toast } from 'sonner'

interface ReceptionistAppointment {
  id: string
  appointmentNo: string
  patientName: string
  patientImg: string | null
  patientUserId: string | null
  doctorName: string
  doctorImg: string | null
  doctorId: string
  doctorSpecialization: string | null
  date: string
  timeSlot: string
  status: string
  charge: number
  disease: string
  bookingType: string
  createdAt: string
  tokenNumber?: string | null
}

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  Approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  Visited: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  Canceled: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  Finish: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
  Extend: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400',
}

const statusIcons: Record<string, typeof Clock> = {
  Pending: Clock,
  Approve: UserCheck,
  Visited: UserCheck,
  Canceled: UserX,
  Finish: UserCheck,
  Extend: Clock,
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approve', label: 'Approved' },
  // 'Visited' is the TRANSIENT in-consultation state (doctor pressed
  // "Call Next"); 'Finish' is the completed visit — labels match the
  // doctor/queue pages so reception stops hunting for "visited" patients
  // in the wrong tab (owner PDF-audit feedback).
  { value: 'Visited', label: 'In Consultation' },
  { value: 'Finish', label: 'Completed' },
  { value: 'Canceled', label: 'Canceled' },
]

export default function ReceptionistAppointmentsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'extend' | 'visited' | 'complete' | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTab, setDetailTab] = useState('details')
  const [selectedAppt, setSelectedAppt] = useState<ReceptionistAppointment | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{
    appointments: ReceptionistAppointment[]
    statusCounts: Record<string, number>
    doctor: { id: string; name: string; fees: number } | null
    isHospitalMode?: boolean
    departments?: Array<{ id: string; name: string; shortCode: string }>
  }>({
    queryKey: ['receptionist-appointments', statusFilter, search, fromDate, toDate],
    queryFn: () =>
      fetch(
        `/api/dashboard/receptionist/appointments?status=${statusFilter}&search=${encodeURIComponent(search)}${fromDate ? `&from=${fromDate}` : ''}${toDate ? `&to=${toDate}` : ''}`
      ).then((r) => r.json()),
    refetchInterval: 10000,
  })

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: string
    }) =>
      fetch(`/api/dashboard/receptionist/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['receptionist-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['receptionist-stats'] })
      const toastMap: Record<string, string> = {
        Approve: 'Appointment approved',
        Canceled: 'Appointment rejected',
        Extend: 'Appointment extended',
        Visited: 'Appointment marked as visited',
        Finish: 'Visit completed — queue slot freed',
        NoShow: 'Marked as no-show',
      }
      toast.success(toastMap[variables.status] || 'Appointment updated')
    },
    onError: () => {
      toast.error('Failed to update appointment')
    },
  })

  const handleStatusAction = (id: string, action: 'approve' | 'reject' | 'extend' | 'visited' | 'complete') => {
    setSelectedId(id)
    setConfirmAction(action)
    setConfirmOpen(true)
  }

  const confirmStatusChange = () => {
    if (selectedId && confirmAction) {
      const statusMap: Record<string, string> = {
        approve: 'Approve',
        reject: 'Canceled',
        extend: 'Extend',
        visited: 'Visited',
        complete: 'Finish',
      }
      statusMutation.mutate({
        id: selectedId,
        status: statusMap[confirmAction],
      })
    }
    setConfirmOpen(false)
    setSelectedId(null)
    setConfirmAction(null)
  }

  const appointments = data?.appointments ?? []
  const statusCounts = data?.statusCounts ?? {}
  const doctor = data?.doctor

  // Get today's date as YYYY-MM-DD for the date input min
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      {/* Header with new appointment button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="from" className="text-sm text-muted-foreground whitespace-nowrap">From</Label>
            <Input id="from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="to" className="text-sm text-muted-foreground whitespace-nowrap">To</Label>
            <Input id="to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-40" />
          </div>
          {(fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setFromDate(''); setToDate('') }} className="text-xs text-muted-foreground">
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Booking is unified — one desk for walk-in, express and slots */}
        <Button
          className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700"
          onClick={() => router.push('/dashboard/receptionist/booking')}
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {tabs.map((tab) => {
            const count =
              tab.value === 'all'
                ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
                : statusCounts[tab.value] || 0
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  statusFilter === tab.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'text-xs',
                    statusFilter === tab.value
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patient or appointment #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                    <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                    <TableCell><div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="ml-auto h-8 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  </TableRow>
                ))
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <CalendarDays className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {search || statusFilter !== 'all' || fromDate || toDate
                        ? 'No appointments match your filters'
                        : 'No appointments yet'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appt, i) => {
                  const StatusIcon = statusIcons[appt.status] || Clock
                  const canPendingActions = appt.status === 'Pending'
                  const canApproveActions = appt.status === 'Approve'
                  return (
                    <motion.tr
                      key={appt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={getAvatarDisplayUrl(appt.patientImg)} />
                            <AvatarFallback className="text-xs">
                              {appt.patientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p
                              className="text-sm font-medium cursor-pointer hover:underline hover:text-teal-600 dark:hover:text-teal-400"
                              onClick={() => { setSelectedAppt(appt); setDetailOpen(true) }}
                            >
                              {appt.patientName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              {appt.appointmentNo}
                              {appt.tokenNumber && (
                                <span className="inline-flex items-center rounded-sm bg-teal-50 px-1 font-mono text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                                  {appt.tokenNumber}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {format(new Date(appt.date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {appt.timeSlot
                              ? <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{appt.timeSlot}</span>
                              : <span className="text-muted-foreground/60">No slot</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{appt.bookingType}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            statusColors[appt.status] || 'bg-gray-100 text-gray-700'
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {appt.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{appt.charge.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right">
                        {canPendingActions && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50"
                              onClick={() => handleStatusAction(appt.id, 'approve')}
                              title="Approve"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/50"
                              onClick={() => handleStatusAction(appt.id, 'extend')}
                              title="Extend"
                            >
                              <CalendarClock className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                              onClick={() => handleStatusAction(appt.id, 'reject')}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {canApproveActions && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/50"
                              onClick={() => handleStatusAction(appt.id, 'visited')}
                              title="Mark Visited"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                              onClick={() => handleStatusAction(appt.id, 'reject')}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {/* Real-life consultation lifecycle (PDF-audit Issue 4):
                            "In Consultation" rows need a desk-side escape hatch
                            to close the visit if the doctor's Save & Print never
                            landed (crash / stepped out / legacy flow). */}
                        {appt.status === 'Visited' && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50"
                              onClick={() => handleStatusAction(appt.id, 'complete')}
                              title="Complete Visit"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </motion.tr>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setDetailTab('details') }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <div className="space-y-4">
                  {/* Status + Appointment # */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      statusColors[selectedAppt.status] || 'bg-gray-100 text-gray-700'
                    )}>
                      {selectedAppt.status}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedAppt.tokenNumber && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-950/40"
                          onClick={() =>
                            window.open(
                              `/bookings/print-token/${selectedAppt.id}`,
                              '_blank',
                              'width=400,height=600'
                            )
                          }
                          title="Print the OPD token slip"
                        >
                          <Printer className="h-3 w-3" />
                          {selectedAppt.tokenNumber}
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">{selectedAppt.appointmentNo}</span>
                    </div>
                  </div>

                  {/* Patient info card */}
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarDisplayUrl(selectedAppt.patientImg)} />
                        <AvatarFallback>{selectedAppt.patientName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{selectedAppt.patientName}</p>
                    </div>
                    <p className="text-sm">Disease: {selectedAppt.disease || '—'}</p>
                    <p className="text-sm">Type: {selectedAppt.bookingType}</p>
                  </div>

                  {/* Doctor info */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Doctor</p>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-teal-600" />
                      <p className="text-sm font-medium">{selectedAppt.doctorName}</p>
                    </div>
                    {selectedAppt.doctorSpecialization && (
                      <p className="text-xs text-muted-foreground mt-1">{selectedAppt.doctorSpecialization}</p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{format(new Date(selectedAppt.date), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Time Slot</p>
                      <p className="text-sm font-medium">
                        {selectedAppt.timeSlot
                          ? selectedAppt.timeSlot
                          : <span className="text-muted-foreground/60">Walk-in</span>}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="text-sm font-medium">₹{selectedAppt.charge.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{format(new Date(selectedAppt.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-4">
                <AppointmentChat
                  bookingId={selectedAppt.id}
                  bookingStatus={selectedAppt.status}
                  otherPartyName={selectedAppt.patientName}
                  hasLinkedPatient={!!selectedAppt.patientUserId}
                  isOpen={detailOpen && detailTab === 'chat'}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'approve' && 'Approve Appointment'}
              {confirmAction === 'reject' && 'Reject Appointment'}
              {confirmAction === 'extend' && 'Extend Appointment'}
              {confirmAction === 'visited' && 'Mark as Visited'}
              {confirmAction === 'complete' && 'Complete Visit'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'approve' &&
                'Are you sure you want to approve this appointment? The patient will be notified.'}
              {confirmAction === 'reject' &&
                'Are you sure you want to reject this appointment? The patient will be notified.'}
              {confirmAction === 'extend' &&
                'Are you sure you want to extend this appointment? The patient will be notified.'}
              {confirmAction === 'visited' &&
                'Are you sure you want to mark this appointment as visited? The patient will be notified.'}
              {confirmAction === 'complete' &&
                'Close this consultation as completed? The queue slot frees immediately and the patient is notified.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={cn(
                (confirmAction === 'approve') &&
                  'bg-emerald-600 hover:bg-emerald-700',
                (confirmAction === 'reject') &&
                  'bg-red-600 hover:bg-red-700',
                (confirmAction === 'extend') &&
                  'bg-violet-600 hover:bg-violet-700',
                (confirmAction === 'visited') &&
                  'bg-teal-600 hover:bg-teal-700',
                (confirmAction === 'complete') &&
                  'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {confirmAction === 'approve' && 'Approve'}
              {confirmAction === 'reject' && 'Reject'}
              {confirmAction === 'extend' && 'Extend'}
              {confirmAction === 'visited' && 'Mark Visited'}
              {confirmAction === 'complete' && 'Complete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
