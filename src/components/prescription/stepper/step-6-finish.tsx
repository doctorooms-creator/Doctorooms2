'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Printer, User, Activity, Pill, Lightbulb, Grid3X3, AlertCircle, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { usePrescriptionStore } from '@/lib/prescription-store'
import { mergeVitalsWithLabels } from '@/lib/prescription-labels'

interface RxData {
  id: string
  patientName: string
  patientAge: string
  weight: string
  bp: string
  temperature: string
  status: string
  nextVisit: string | null
  booking: {
    patientName: string
    gender: string
    bloodGroup: string
    disease: string
    timeSlot: string
    bookingDate: string
  }
  doctor: {
    user: { name: string; contactNo: string; phoneNo: string }
    specialization: string
    address: string
    city: string
    state: string
    registrationDetail: string
  }
  chiefComplaints: Array<{ coId: string; co: { id: string; coDetail: string; coDetailEn: string } | null }>
  labels: Array<{ label: string; labelEn: string; value: string; labelUnit: string; showUnit: boolean }>
  medicines: Array<{ medicine: string; dose: string; morning: number; afternoon: number; evening: number; tab: number; description: string }>
  suggestions: Array<{ coId: string | null; question: string; questionEn: string; suggestions: string; suggestionsEn: string }>
  diagnosisTables: Array<{
    rows: number
    cols: number
    headerLabel: string
    colsLabel: string
    footerLabel: string
    extraLabel: string
    cellValues: string | null
  }>
}

export function Step6Finish({ onPrint }: { onPrint: (rxId: string) => void }) {
  const prescriptionId = usePrescriptionStore((s) => s.prescriptionId)
  const nextVisit = usePrescriptionStore((s) => s.nextVisit)
  const setNextVisit = usePrescriptionStore((s) => s.setNextVisit)
  const isSaving = usePrescriptionStore((s) => s.isSaving)
  const setIsSaving = usePrescriptionStore((s) => s.setIsSaving)
  const goToPrev = usePrescriptionStore((s) => s.goToPrev)
  const queryClient = useQueryClient()
  const [calOpen, setCalOpen] = useState(false)

  const { data, isLoading, isError } = useQuery<{ prescription: RxData }>({
    queryKey: ['rx-prescription-data', prescriptionId],
    queryFn: () => fetch(`/api/prescription/${prescriptionId}`).then((r) => r.json()),
    enabled: !!prescriptionId,
    refetchOnWindowFocus: false,
  })

  const rx = data?.prescription

  // Set next visit from loaded data
  useEffect(() => {
    if (rx?.nextVisit && !nextVisit) {
      setNextVisit(new Date(rx.nextVisit))
    }
  }, [rx?.nextVisit, nextVisit, setNextVisit])

  // Finalize mutation
  const finalizeMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/prescription/${prescriptionId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextVisit: nextVisit ? nextVisit.toISOString() : null,
        }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rx-prescription-data'] })
      toast.success('Prescription finalized!')
      onPrint(prescriptionId || '')
    },
    onError: () => toast.error('Failed to finalize prescription'),
  })

  const handleFinalize = () => {
    setIsSaving(true)
    finalizeMutation.mutate(undefined, { onSettled: () => setIsSaving(false) })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError || !rx) {
    return (
      <div className="flex items-center gap-2 p-6 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <p>Failed to load prescription data.</p>
      </div>
    )
  }

  const complaints = rx.chiefComplaints || []
  // Step 2 captures common vitals AND custom labels — preview them merged the
  // same way the print renders them (vital-named labels fill pulse/SpO2 slots;
  // duplicates of filled slots are dropped; the rest are extra measurements).
  const { vitals: mergedVitals, extraLabels } = mergeVitalsWithLabels(
    { weight: rx.weight, bp: rx.bp, temperature: rx.temperature },
    rx.labels || []
  )
  const hasVitals = mergedVitals.weight || mergedVitals.bp || mergedVitals.temperature || mergedVitals.pulse || mergedVitals.spo2 || extraLabels.length > 0
  const medicines = rx.medicines || []
  const suggestions = rx.suggestions || []
  const tables = rx.diagnosisTables || []

  const parseJson = (str: string): string[] => {
    try { const p = JSON.parse(str); return Array.isArray(p) ? p : [] }
    catch { return [] }
  }

  // Cell values — JSON object keyed "row-col" (same format as Step 3's
  // emptyCellKey(r, c)). Legacy rows may hold "[]"; only objects are valid.
  const parseCells = (str: string | null): Record<string, string> => {
    try {
      const p = JSON.parse(str || '{}')
      return p && typeof p === 'object' && !Array.isArray(p) ? p : {}
    } catch { return {} }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Patient Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> <strong>{rx.patientName || rx.booking?.patientName || '-'}</strong></div>
            <div><span className="text-muted-foreground">Age:</span> <strong>{rx.patientAge || '-'}</strong></div>
            <div><span className="text-muted-foreground">Gender:</span> <strong>{rx.booking?.gender || '-'}</strong></div>
            <div><span className="text-muted-foreground">Blood Group:</span> <strong>{rx.booking?.bloodGroup || '-'}</strong></div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints */}
      {complaints.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Chief Complaints (C/O)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {complaints.map((c, i) => (
                <Badge key={i} variant="secondary" className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300">
                  {c.co?.coDetailEn || c.co?.coDetail || '-'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vitals & Measurements — common vitals + custom labels, merged like the print */}
      {hasVitals && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Vitals & Measurements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 text-sm">
              {mergedVitals.weight && <Badge variant="outline">Wt: {mergedVitals.weight} kg</Badge>}
              {mergedVitals.bp && <Badge variant="outline">BP: {mergedVitals.bp}</Badge>}
              {mergedVitals.temperature && <Badge variant="outline">Temp: {mergedVitals.temperature}°F</Badge>}
              {mergedVitals.pulse && <Badge variant="outline">Pulse: {mergedVitals.pulse} bpm</Badge>}
              {mergedVitals.spo2 && <Badge variant="outline">SpO2: {mergedVitals.spo2}%</Badge>}
              {extraLabels.map((l, i) => (
                <Badge key={i} variant="outline">
                  {l.labelEn || l.label}: {l.value}{l.showUnit && l.labelUnit ? ` ${l.labelUnit}` : ''}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnosis Tables */}
      {tables.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Diagnosis Tables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-x-auto">
            {tables.map((t, ti) => {
              const hLabels = parseJson(t.headerLabel)
              const cLabels = parseJson(t.colsLabel)
              const fLabels = parseJson(t.footerLabel)
              const cells = parseCells(t.cellValues)
              const rows = Math.max(1, Number(t.rows) || 1)
              const cols = Math.max(1, Number(t.cols) || 1)
              return (
                <div key={ti}>
                  {t.extraLabel && <p className="text-xs font-medium mb-1 text-muted-foreground">{t.extraLabel}</p>}
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        {hLabels.map((h, ci) => (
                          <th
                            key={ci}
                            className="border border-teal-200 bg-teal-50 px-2 py-1 text-left font-semibold text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-200"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Col 0 is the row-label column (colsLabel[r]); value
                          cells are cols 1..cols-1 keyed "r-c" — same geometry
                          as the Step 3 editor grid. */}
                      {Array.from({ length: rows }).map((_, ri) => (
                        <tr key={ri} className={ri % 2 === 1 ? 'bg-muted/30 dark:bg-muted/20' : undefined}>
                          <td className="border border-border bg-muted/40 px-2 py-1 font-medium dark:bg-muted/30">
                            {cLabels[ri] || <span className="text-muted-foreground">—</span>}
                          </td>
                          {Array.from({ length: cols - 1 }).map((_, ci) => {
                            const value = cells[`${ri}-${ci + 1}`]
                            return (
                              <td key={ci} className="border border-border px-2 py-1">
                                {value && value.trim() !== '' ? (
                                  value
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                    {fLabels.length > 0 && (
                      <tfoot>
                        <tr>
                          <td
                            colSpan={cols}
                            className="border border-border bg-muted/30 px-2 py-1 text-muted-foreground"
                          >
                            {fLabels.join(' | ')}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Medicines */}
      {medicines.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pill className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Medicines ({medicines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-1 pr-3">#</th>
                  <th className="pb-1 pr-3">Medicine</th>
                  <th className="pb-1 pr-3">Dose</th>
                  <th className="pb-1 pr-2 text-center">M</th>
                  <th className="pb-1 pr-2 text-center">A</th>
                  <th className="pb-1 pr-2 text-center">E</th>
                  <th className="pb-1 pr-3 text-center">Days</th>
                  <th className="pb-1">Notes</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="py-1.5 pr-3 text-muted-foreground">{i + 1}</td>
                    <td className="py-1.5 pr-3 font-medium">{m.medicine}</td>
                    <td className="py-1.5 pr-3">{m.dose || '-'}</td>
                    <td className="py-1.5 pr-2 text-center">{m.morning || '-'}</td>
                    <td className="py-1.5 pr-2 text-center">{m.afternoon || '-'}</td>
                    <td className="py-1.5 pr-2 text-center">{m.evening || '-'}</td>
                    <td className="py-1.5 pr-3 text-center">{m.tab}</td>
                    <td className="py-1.5">{m.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Suggestions — grouped complaint-wise (mirrors Step 5 sections);
          legacy rows without coId fall under "General Advice". */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Advice ({suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              // coId -> complaint name (from this Rx's chief complaints)
              const coNameMap = new Map<string, { coDetail: string; coDetailEn: string }>()
              for (const c of complaints) {
                if (c.coId && c.co) {
                  coNameMap.set(c.coId, { coDetail: c.co.coDetail, coDetailEn: c.co.coDetailEn })
                }
              }
              const general = suggestions.filter((s) => !s.coId)
              const other = suggestions.filter((s) => s.coId && !coNameMap.has(s.coId))
              const sections: Array<{
                key: string
                name: string
                nameEn: string
                general?: boolean
                items: typeof suggestions
              }> = []
              for (const [coId, names] of coNameMap) {
                const items = suggestions.filter((s) => s.coId === coId)
                if (items.length > 0) {
                  sections.push({ key: coId, name: names.coDetail, nameEn: names.coDetailEn, items })
                }
              }
              if (other.length > 0) {
                sections.push({ key: '__other__', name: 'Other Advice', nameEn: '', items: other })
              }
              if (general.length > 0) {
                sections.push({ key: '__general__', name: 'General Advice', nameEn: '', general: true, items: general })
              }
              return sections.map((sec) => (
                <div key={sec.key}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full ' +
                        (sec.general
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300')
                      }
                    >
                      {sec.general ? (
                        <Lightbulb className="h-3 w-3" />
                      ) : (
                        <Stethoscope className="h-3 w-3" />
                      )}
                    </span>
                    <p
                      className={
                        'text-xs font-semibold ' +
                        (sec.general
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-teal-700 dark:text-teal-300')
                      }
                    >
                      {sec.name}
                      {sec.nameEn && (
                        <span className="font-normal text-muted-foreground"> ({sec.nameEn})</span>
                      )}
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {sec.items.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className={
                            sec.general
                              ? 'mt-0.5 text-amber-600 dark:text-amber-400'
                              : 'mt-0.5 text-teal-600 dark:text-teal-400'
                          }
                        >
                          -
                        </span>
                        <span className="min-w-0 break-words">{s.suggestionsEn || s.suggestions}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            })()}
          </CardContent>
        </Card>
      )}

      {/* Next Visit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Next Visit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('h-9 justify-start text-left font-normal', !nextVisit && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextVisit ? format(nextVisit, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextVisit || undefined}
                  onSelect={(d) => { setNextVisit(d || null); setCalOpen(false) }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {nextVisit && (
              <Button variant="ghost" size="sm" onClick={() => setNextVisit(null)} className="text-xs text-muted-foreground">
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={goToPrev}>Back</Button>
        <Button
          onClick={handleFinalize}
          disabled={isSaving || finalizeMutation.isPending}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isSaving || finalizeMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Finalizing...
            </span>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              Save & Print
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
