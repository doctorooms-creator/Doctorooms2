'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Search,
  Calendar,
  Pill,
  Eye,
  Thermometer,
  Weight,
  Activity,
  Droplets,
  Package,
  CheckCircle2,
  MoreHorizontal,
  Filter,
  Hash,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { mergeVitalsWithLabels } from '@/lib/prescription-labels'

interface PMedicine {
  id: string
  medicine: string
  morning: boolean
  afternoon: boolean
  evening: boolean
  tab: number
  dose: string
  description: string
}

interface PLabel {
  id: string
  label: string
  labelEn?: string
  value: string
  labelUnit: string
  showUnit?: boolean
}

interface Prescription {
  id: string
  patientName: string
  patientAge?: string
  patientGender?: string
  tokenNumber?: string
  appointmentNo?: string
  disease: string
  weight?: string
  bp?: string
  temperature?: string
  description?: string
  createdAt: string
  medicines: PMedicine[]
  labels: PLabel[]
  doctorName?: string
  departmentName?: string
  hospitalName?: string
  fulfillmentStatus?: string
  packedBy?: string
  packedAt?: string | null
  packedByName?: string
  doctorId?: string
  departmentId?: string
}

interface PrescriptionsResponse {
  isHospitalMode: boolean
  prescriptions: Prescription[]
  fulfillmentStats?: Record<string, number>
}

export default function PharmacistPrescriptionsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null)

  // Vitals + custom labels merged the same way the prescription print merges
  // them: vital-named labels (Pulse Rate, SpO2…) fill empty vital slots,
  // duplicates drop, the rest are additional measurements.
  const mergedSelected = useMemo(
    () =>
      selectedRx
        ? mergeVitalsWithLabels(
            { weight: selectedRx.weight || '', bp: selectedRx.bp || '', temperature: selectedRx.temperature || '' },
            selectedRx.labels
          )
        : null,
    [selectedRx]
  )

  // Hospital mode filters
  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const handleSearch = (value: string) => {
    setSearch(value)
    setTimeout(() => setDebouncedSearch(value), 300)
  }

  const { data, isLoading } = useQuery<PrescriptionsResponse>({
    queryKey: ['pharmacist-prescriptions', debouncedSearch, filterDoctor, filterDept, filterStatus],
    queryFn: () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (filterDoctor) params.set('doctorId', filterDoctor)
      if (filterDept) params.set('departmentId', filterDept)
      if (filterStatus) params.set('fulfillmentStatus', filterStatus)
      return fetch(`/api/dashboard/pharmacist/prescriptions?${params.toString()}`, { credentials: 'include' })
        .then((r) => r.json())
    },
  })

  const isHospitalMode = data?.isHospitalMode ?? false

  // Extract unique doctors and departments from prescription data for filter dropdowns
  const prescriptionsList = data?.prescriptions ?? []
  const doctors = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    for (const rx of prescriptionsList) {
      if (rx.doctorId && rx.doctorName && !map.has(rx.doctorId)) {
        map.set(rx.doctorId, { id: rx.doctorId, name: rx.doctorName })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [prescriptionsList])
  const departments = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    for (const rx of prescriptionsList) {
      if (rx.departmentId && rx.departmentName && !map.has(rx.departmentId)) {
        map.set(rx.departmentId, { id: rx.departmentId, name: rx.departmentName })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [prescriptionsList])

  const fulfillMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/dashboard/pharmacist/prescriptions/${id}/fulfill`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-prescriptions'] })
      toast.success('Prescription updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleView = (rx: Prescription) => {
    setSelectedRx(rx)
    setViewOpen(true)
  }

  const getFulfillmentBadge = (status?: string) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            Pending
          </Badge>
        )
      case 'Packed':
        return (
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800">
            <Package className="mr-1 h-3 w-3" />
            Packed
          </Badge>
        )
      case 'Dispensed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Dispensed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or Patient ID (e.g. SHARMA-001)..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isHospitalMode && (
          <Badge variant="outline" className="w-fit border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400">
            <Filter className="mr-1 h-3 w-3" />
            Hospital Mode
          </Badge>
        )}
      </div>

      {/* Hospital mode filter bar */}
      {isHospitalMode && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          <Select value={filterDoctor || '__all__'} onValueChange={(v) => setFilterDoctor(v === '__all__' ? '' : v)}>
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder="All Doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Doctors</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDept || '__all__'} onValueChange={(v) => setFilterDept(v === '__all__' ? '' : v)}>
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus || '__all__'} onValueChange={(v) => setFilterStatus(v === '__all__' ? '' : v)}>
            <SelectTrigger size="sm" className="w-[170px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Packed">Packed</SelectItem>
              <SelectItem value="Dispensed">Dispensed</SelectItem>
            </SelectContent>
          </Select>
          {(filterDoctor || filterDept || filterStatus) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setFilterDoctor(''); setFilterDept(''); setFilterStatus('') }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Prescription cards */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="h-5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && data?.prescriptions?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">No prescriptions found</p>
          <p className="text-sm mt-1">Prescriptions will appear here once the doctor creates them.</p>
        </div>
      )}

      {!isLoading && data?.prescriptions && data.prescriptions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.prescriptions.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className="group cursor-pointer transition-all hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700"
                onClick={() => handleView(rx)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Hospital mode: doctor & department badge */}
                      {isHospitalMode && rx.doctorName && (
                        <Badge
                          variant="outline"
                          className="mb-1.5 border-teal-300 bg-teal-50 text-teal-700 text-[10px] dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                        >
                          {rx.doctorName}{rx.departmentName ? ` · ${rx.departmentName}` : ''}
                        </Badge>
                      )}
                      <p className="font-semibold text-sm">{rx.patientName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(rx.createdAt), 'MMM d, yyyy')}
                        {rx.patientAge && <span>· Age: {rx.patientAge}</span>}
                      </div>
                      {/* Patient ID — queue token from the printed prescription */}
                      {rx.tokenNumber && (
                        <Badge
                          variant="outline"
                          className="mt-1.5 border-teal-300 bg-teal-50 font-mono text-[10px] text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                        >
                          <Hash className="mr-0.5 h-3 w-3" />
                          {rx.tokenNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isHospitalMode && getFulfillmentBadge(rx.fulfillmentStatus)}
                      {rx.fulfillmentStatus !== 'Dispensed' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-teal-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                fulfillMutation.mutate({ id: rx.id, status: 'Packed' })
                              }}
                              disabled={fulfillMutation.isPending}
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Mark as Packed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                fulfillMutation.mutate({ id: rx.id, status: 'Dispensed' })
                              }}
                              disabled={fulfillMutation.isPending}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Dispensed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-teal-600 hover:text-teal-700 dark:text-teal-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleView(rx)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View prescription for {rx.patientName}</span>
                      </Button>
                    </div>
                  </div>

                  {rx.disease && (
                    <Badge variant="secondary" className="text-xs">{rx.disease}</Badge>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Pill className="h-3 w-3" /> {rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}
                    </span>
                    {rx.labels.length > 0 && (
                      <span>{rx.labels.length} label{rx.labels.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {rx.medicines.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rx.medicines.slice(0, 3).map((m) => (
                        <Badge key={m.id} variant="outline" className="text-[10px]">
                          {m.medicine}
                        </Badge>
                      ))}
                      {rx.medicines.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{rx.medicines.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {rx.packedByName && rx.packedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      Packed by {rx.packedByName} at {format(new Date(rx.packedAt), 'h:mm a')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* View prescription dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-5 pt-2">
              {/* Patient info */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {isHospitalMode && selectedRx.doctorName && (
                      <Badge
                        variant="outline"
                        className="mb-2 border-teal-300 bg-teal-50 text-teal-700 text-xs dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                      >
                        {selectedRx.doctorName}{selectedRx.departmentName ? ` · ${selectedRx.departmentName}` : ''}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg">{selectedRx.patientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedRx.createdAt), 'MMMM d, yyyy · h:mm a')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {selectedRx.tokenNumber && (
                        <Badge
                          variant="outline"
                          className="border-teal-300 bg-teal-50 font-mono text-xs text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                        >
                          <Hash className="mr-1 h-3 w-3" />
                          {selectedRx.tokenNumber}
                        </Badge>
                      )}
                      {selectedRx.patientGender && (
                        <Badge variant="outline" className="text-xs">{selectedRx.patientGender}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {selectedRx.patientAge && (
                      <Badge variant="outline">Age: {selectedRx.patientAge}</Badge>
                    )}
                    {getFulfillmentBadge(selectedRx.fulfillmentStatus)}
                  </div>
                </div>

                {selectedRx.disease && (
                  <div>
                    <p className="text-sm text-muted-foreground">Diagnosis</p>
                    <p className="text-sm font-medium">{selectedRx.disease}</p>
                  </div>
                )}

                {/* Vitals & measurements — merged like the prescription print */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {mergedSelected?.vitals.weight && (
                    <div className="rounded-md bg-muted p-2.5 text-center">
                      <Weight className="mx-auto h-4 w-4 text-teal-500" />
                      <p className="mt-1 text-xs text-muted-foreground">Weight</p>
                      <p className="text-sm font-semibold">{mergedSelected.vitals.weight} kg</p>
                    </div>
                  )}
                  {mergedSelected?.vitals.bp && (
                    <div className="rounded-md bg-muted p-2.5 text-center">
                      <Activity className="mx-auto h-4 w-4 text-teal-500" />
                      <p className="mt-1 text-xs text-muted-foreground">BP</p>
                      <p className="text-sm font-semibold">{mergedSelected.vitals.bp}</p>
                    </div>
                  )}
                  {mergedSelected?.vitals.temperature && (
                    <div className="rounded-md bg-muted p-2.5 text-center">
                      <Thermometer className="mx-auto h-4 w-4 text-teal-500" />
                      <p className="mt-1 text-xs text-muted-foreground">Temp</p>
                      <p className="text-sm font-semibold">{mergedSelected.vitals.temperature}°F</p>
                    </div>
                  )}
                  {mergedSelected?.vitals.pulse && (
                    <div className="rounded-md bg-muted p-2.5 text-center">
                      <Activity className="mx-auto h-4 w-4 text-teal-500" />
                      <p className="mt-1 text-xs text-muted-foreground">Pulse</p>
                      <p className="text-sm font-semibold">{mergedSelected.vitals.pulse} bpm</p>
                    </div>
                  )}
                  {mergedSelected?.vitals.spo2 && (
                    <div className="rounded-md bg-muted p-2.5 text-center">
                      <Activity className="mx-auto h-4 w-4 text-teal-500" />
                      <p className="mt-1 text-xs text-muted-foreground">SpO2</p>
                      <p className="text-sm font-semibold">{mergedSelected.vitals.spo2}%</p>
                    </div>
                  )}
                  {(mergedSelected?.extraLabels.filter((l) => l.value && String(l.value).trim() !== '').length || 0) > 0 && (
                    <div className="rounded-md bg-muted p-2.5 text-center">
                      <Droplets className="mx-auto h-4 w-4 text-teal-500" />
                      <p className="mt-1 text-xs text-muted-foreground">Measurements</p>
                      <p className="text-sm font-semibold">{mergedSelected?.extraLabels.filter((l) => l.value && String(l.value).trim() !== '').length}</p>
                    </div>
                  )}
                </div>

                {/* Packed info in dialog */}
                {selectedRx.packedByName && selectedRx.packedAt && (
                  <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    <span>
                      Packed by <span className="font-medium text-foreground">{selectedRx.packedByName}</span>{' '}
                      at {format(new Date(selectedRx.packedAt), 'MMMM d, yyyy · h:mm a')}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedRx.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm rounded-lg bg-muted p-3">{selectedRx.description}</p>
                </div>
              )}

              {/* Additional measurements — custom labels that are NOT common vitals */}
              {(mergedSelected?.extraLabels.filter((l) => l.value && String(l.value).trim() !== '').length || 0) > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Additional Measurements</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mergedSelected!.extraLabels.filter((l) => l.value && String(l.value).trim() !== '').map((l, i) => (
                      <div key={`${l.labelEn || l.label}-${i}`} className="rounded-lg border border-border p-2.5">
                        <p className="text-xs text-muted-foreground">{l.labelEn || l.label}</p>
                        <p className="text-sm font-medium">
                          {l.value}{l.showUnit !== false && l.labelUnit ? ` ${l.labelUnit}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {selectedRx.medicines.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Medicines</p>
                  <div className="space-y-2">
                    {selectedRx.medicines.map((m) => (
                      <div key={m.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{m.medicine}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{m.tab} tab{m.tab !== 1 ? 's' : ''}</span>
                              {m.dose && (
                                <Badge variant="outline" className="text-[10px]">{m.dose}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {m.morning && (
                              <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                                M
                              </span>
                            )}
                            {m.afternoon && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                                A
                              </span>
                            )}
                            {m.evening && (
                              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-400">
                                E
                              </span>
                            )}
                          </div>
                        </div>
                        {m.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground">{m.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fulfillment actions in dialog — available in BOTH modes so the
                  pharmacy can instantly pack & dispatch from the popup */}
              {selectedRx.fulfillmentStatus !== 'Dispensed' && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">Actions:</span>
                  {selectedRx.fulfillmentStatus !== 'Packed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-teal-600 border-teal-300 hover:bg-teal-50 dark:text-teal-400 dark:border-teal-700"
                      onClick={() => fulfillMutation.mutate({ id: selectedRx.id, status: 'Packed' })}
                      disabled={fulfillMutation.isPending}
                    >
                      <Package className="mr-1.5 h-3.5 w-3.5" />
                      Mark as Packed
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    onClick={() => fulfillMutation.mutate({ id: selectedRx.id, status: 'Dispensed' })}
                    disabled={fulfillMutation.isPending}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Dispatch / Dispense
                  </Button>
                </div>
              )}
              {selectedRx.fulfillmentStatus === 'Dispensed' && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Dispensed — medicines handed over to the patient
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
