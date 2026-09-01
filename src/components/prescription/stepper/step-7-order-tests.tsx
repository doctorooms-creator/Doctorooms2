'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, FlaskConical, Send, AlertCircle, Building2, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { usePrescriptionStore } from '@/lib/prescription-store'
import {
  TestCatalogPicker,
  AddCustomTest,
  type CatalogLab,
  type SelectedTest,
} from './test-catalog-picker'

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface ExistingOrder {
  id: string
  orderNo?: string
  testName: string
  testType: string
  testFee: number
  status: string
  urgency: string
  orderedAt: string
  notes?: string
  labPartner: { id: string; labName: string; city: string; mobile: string } | null
  doctor?: { user: { name: string } } | null
  patient?: { id: string; name: string; gender: string; mobileNo: string } | null
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers (existing-orders card — unchanged)
// ──────────────────────────────────────────────────────────────────────────

function formatDateTime(value: string) {
  try {
    return format(new Date(value), "MMM d, yyyy 'at' h:mm a")
  } catch {
    return value
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'Completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
          Completed
        </Badge>
      )
    case 'InProgress':
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0">
          In Progress
        </Badge>
      )
    case 'Ordered':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
          Ordered
        </Badge>
      )
    case 'Cancelled':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
          Cancelled
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="border-0">
          {status}
        </Badge>
      )
  }
}

function urgencyBadge(urgency: string) {
  if (urgency === 'Urgent') {
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
        Urgent
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-0 text-muted-foreground">
      Normal
    </Badge>
  )
}

function testTypeBadge(testType: string) {
  switch (testType) {
    case 'Blood':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
          Blood
        </Badge>
      )
    case 'Radiology':
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0">
          Radiology
        </Badge>
      )
    case 'Pathology':
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0">
          Pathology
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="border-0">
          {testType || 'Other'}
        </Badge>
      )
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────

export function Step7OrderTests() {
  const patientId = usePrescriptionStore((s) => s.patientId)
  const patientName = usePrescriptionStore((s) => s.patientName)
  const bookingId = usePrescriptionStore((s) => s.bookingId)
  const goToPrev = usePrescriptionStore((s) => s.goToPrev)
  const queryClient = useQueryClient()

  const [selected, setSelected] = useState<SelectedTest[]>([])
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent'>('Normal')
  const [notes, setNotes] = useState('')

  // Fetch this doctor's associated labs WITH their test catalogs (the catalog
  // drives the picker; testsAvailable is the legacy fallback handled inside
  // the picker). The API is being extended in parallel — a missing `catalog`
  // field is treated as an empty list.
  const { data: labsData, isLoading: labsLoading } = useQuery<{ labs: CatalogLab[] }>({
    queryKey: ['rx-my-labs-catalog'],
    queryFn: () =>
      fetch('/api/doctor-lab-associations/my-labs?includeCatalog=true').then((r) => {
        if (!r.ok) throw new Error('Failed to load labs')
        return r.json()
      }),
  })

  const labs = useMemo(() => labsData?.labs || [], [labsData])

  // Fetch this patient's existing test orders across ALL bookings (not just this
  // visit) — the doctor needs to see pending tests so they don't re-order the
  // same thing. The API filters by patientId + role; the bookingId param is
  // deliberately omitted so historical orders without bookingId also appear.
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: ExistingOrder[] }>({
    queryKey: ['rx-existing-test-orders', patientId],
    queryFn: () =>
      fetch(
        `/api/external-test-orders?patientId=${encodeURIComponent(patientId)}`
      ).then((r) => {
        if (!r.ok) throw new Error('Failed to load existing orders')
        return r.json()
      }),
    enabled: !!patientId,
    // Keep the current list visible while a background refetch (socket
    // invalidation / after submitting an order) runs — no skeleton flash.
    placeholderData: keepPreviousData,
  })

  const existingOrders = ordersData?.orders || []

  // Group the selected tests by lab — this is the routing preview:
  // Lab X gets its tests, Lab Y gets its tests, one POST handles all.
  const groupedByLab = useMemo(() => {
    const map = new Map<
      string,
      { labId: string; labName: string; tests: SelectedTest[]; subtotal: number }
    >()
    for (const t of selected) {
      const g = map.get(t.labPartnerId)
      if (g) {
        g.tests.push(t)
        g.subtotal += t.testFee || 0
      } else {
        map.set(t.labPartnerId, {
          labId: t.labPartnerId,
          labName: t.labName,
          tests: [t],
          subtotal: t.testFee || 0,
        })
      }
    }
    return Array.from(map.values())
  }, [selected])

  const grandTotal = useMemo(
    () => selected.reduce((sum, t) => sum + (t.testFee || 0), 0),
    [selected]
  )

  const canSubmit = selected.length > 0 && !!patientId

  // Submit mutation — one POST; the API validates the doctor↔lab association
  // per row and notifies each lab (grouped) server-side.
  const submitMutation = useMutation({
    mutationFn: () =>
      fetch('/api/external-test-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          bookingId,
          notes,
          urgency,
          orders: selected.map((t) => ({
            testName: t.testName,
            testType: t.testType,
            testFee: t.testFee,
            labPartnerId: t.labPartnerId,
          })),
        }),
      }).then((r) => {
        if (!r.ok) {
          return r
            .json()
            .catch(() => ({}))
            .then((d: { error?: string }) => {
              throw new Error(d.error || 'Failed to send test orders')
            })
        }
        return r.json()
      }),
    onSuccess: () => {
      toast.success(`${selected.length} test order(s) sent to labs`)
      queryClient.invalidateQueries({
        queryKey: ['rx-existing-test-orders', patientId],
      })
      // Move the patient out of the active consultation queue (same intent as
      // the Order Tests dialog) — fire-and-forget, only when we have a booking.
      // NOTE: the old dialog PATCHed /bookings/[id]/status which silently 404'd;
      // the real endpoint is PUT /appointments/[id]/status.
      if (bookingId) {
        fetch(`/api/dashboard/doctor/appointments/${bookingId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'SentForTests' }),
        }).catch(() => {})
      }
      // Reset form
      setSelected([])
      setUrgency('Normal')
      setNotes('')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to send test orders'),
  })

  const removeSelected = (key: string) =>
    setSelected((prev) => prev.filter((t) => t.key !== key))

  const handleSubmit = () => {
    if (!selected.length) {
      toast.error('Select at least one test from the catalog')
      return
    }
    if (!patientId) {
      toast.error('Patient info not loaded yet — please wait a moment')
      return
    }
    submitMutation.mutate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <h2 className="text-lg font-semibold">
          Order Lab Tests
          {patientName && (
            <span className="text-muted-foreground font-normal">
              {' '}for {patientName}
            </span>
          )}
        </h2>
      </div>

      {!patientId && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>Loading patient information…</p>
        </div>
      )}

      {/* Existing Orders Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Existing Test Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          ) : existingOrders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <FlaskConical className="h-6 w-6 mx-auto mb-2 opacity-40" />
              No test orders yet for this patient.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-[160px]">Test</TableHead>
                    <TableHead className="min-w-[140px]">Lab</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[80px] text-right">Fee</TableHead>
                    <TableHead className="min-w-[90px]">Urgency</TableHead>
                    <TableHead className="min-w-[110px]">Status</TableHead>
                    <TableHead className="min-w-[140px]">Ordered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingOrders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{o.testName}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium text-foreground/80">
                            {o.labPartner?.labName || '—'}
                          </p>
                          {o.labPartner?.city && (
                            <p className="text-muted-foreground">
                              {o.labPartner.city}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{testTypeBadge(o.testType)}</TableCell>
                      <TableCell className="text-right font-medium text-xs">
                        {'₹' + (o.testFee || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{urgencyBadge(o.urgency)}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(o.orderedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Test Order Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Add New Test Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {labsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-md" />
              ))}
            </div>
          ) : labs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-40" />
              You haven&apos;t associated any lab partners yet. Visit the{' '}
              <span className="font-medium text-foreground">My Lab Partners</span>{' '}
              page to add one first.
            </div>
          ) : (
            <>
              {/* Catalog-driven test picker */}
              <TestCatalogPicker
                labs={labs}
                selected={selected}
                onChange={setSelected}
              />

              {/* Selected tests — grouped by lab so the routing is visible */}
              {selected.length > 0 && (
                <div className="rounded-lg border border-teal-200 bg-teal-50/60 dark:border-teal-900 dark:bg-teal-950/20 p-3 space-y-3">
                  <p className="text-xs font-medium text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    Selected tests — auto-routed per lab
                  </p>
                  {groupedByLab.map((g) => (
                    <div key={g.labId} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">
                          {g.labName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {g.tests.length} test{g.tests.length === 1 ? '' : 's'} · ₹
                          {g.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {g.tests.map((t) => (
                            <motion.span
                              key={t.key}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.15 }}
                            >
                              <button
                                type="button"
                                onClick={() => removeSelected(t.key)}
                                aria-label={`Remove ${t.testName} from ${t.labName}`}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-teal-200 bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:border-rose-300 hover:bg-rose-50 dark:border-teal-800 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
                              >
                                {t.testName}
                                <span className="text-muted-foreground">
                                  ₹{(t.testFee || 0).toLocaleString('en-IN')}
                                </span>
                                {t.custom && (
                                  <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                    custom
                                  </span>
                                )}
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-teal-200 dark:border-teal-900 text-sm">
                    <span className="font-medium">
                      Total · {selected.length} test{selected.length === 1 ? '' : 's'} to{' '}
                      {groupedByLab.length} lab{groupedByLab.length === 1 ? '' : 's'}
                    </span>
                    <span className="font-semibold">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Custom test fallback */}
              <AddCustomTest
                labs={labs}
                isDuplicate={(key) => selected.some((s) => s.key === key)}
                onAdd={(t) => setSelected((prev) => [...prev, t])}
              />

              {/* Urgency + Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Urgency (applies to all)
                  </label>
                  <Select
                    value={urgency}
                    onValueChange={(v) =>
                      setUrgency(v as 'Normal' | 'Urgent')
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Clinical notes for the lab — sent with all orders in this batch"
                    className="min-h-[60px] text-sm"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {selected.length} test{selected.length === 1 ? '' : 's'} ready to send
                  {groupedByLab.length > 0 && (
                    <span>
                      {' '}· routed to {groupedByLab.length} lab
                      {groupedByLab.length === 1 ? '' : 's'}
                    </span>
                  )}
                  {urgency === 'Urgent' && (
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      {' '}· marked Urgent
                    </span>
                  )}
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
                >
                  {submitMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Orders
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t">
        <Button variant="outline" onClick={goToPrev}>
          Back
        </Button>
        <p className="text-xs text-muted-foreground">
          This step is optional — your prescription can be finalized from the
          Finish tab.
        </p>
      </div>
    </motion.div>
  )
}
