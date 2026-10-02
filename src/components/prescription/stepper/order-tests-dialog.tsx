'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, FlaskConical, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  TestCatalogPicker,
  AddCustomTest,
  type CatalogLab,
  type SelectedTest,
} from './test-catalog-picker'

interface OrderTestsDialogProps {
  open: boolean
  onClose: () => void
  bookingId: string
}

// Palette-safe dot colours, one per lab (cycled)
const LAB_DOT_COLORS = ['bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

export function OrderTestsDialog({ open, onClose, bookingId }: OrderTestsDialogProps) {
  const [selected, setSelected] = useState<SelectedTest[]>([])
  const [urgency, setUrgency] = useState('Normal')
  const [notes, setNotes] = useState('')

  // Fetch doctor's associated labs WITH their test catalogs (same cache as the
  // wizard's Step 7). A missing `catalog` field is treated as empty.
  const { data: labsData, isLoading: labsLoading } = useQuery<{ labs: CatalogLab[] }>({
    queryKey: ['rx-my-labs-catalog'],
    queryFn: () =>
      fetch('/api/doctor-lab-associations/my-labs?includeCatalog=true').then((r) => {
        if (!r.ok) throw new Error('Failed to load labs')
        return r.json()
      }),
    enabled: open,
  })

  const labs = useMemo(() => labsData?.labs || [], [labsData])

  // Fetch patient info from booking
  const { data: bookingData } = useQuery<{ booking: { userId: string; patientName: string } }>({
    queryKey: ['booking', bookingId],
    queryFn: () => fetch(`/api/dashboard/doctor/bookings/${bookingId}`).then((r) => r.json()),
    enabled: open && !!bookingId,
  })

  const patientId = bookingData?.booking?.userId || ''
  const patientName = bookingData?.booking?.patientName || 'Patient'

  const labDot = (labId: string) => {
    const idx = labs.findIndex((l) => l.id === labId)
    return LAB_DOT_COLORS[(idx >= 0 ? idx : 0) % LAB_DOT_COLORS.length]
  }

  const total = useMemo(
    () => selected.reduce((sum, t) => sum + (t.testFee || 0), 0),
    [selected]
  )
  const labCount = useMemo(
    () => new Set(selected.map((t) => t.labPartnerId)).size,
    [selected]
  )

  const removeSelected = (key: string) =>
    setSelected((prev) => prev.filter((t) => t.key !== key))

  // Send orders mutation — one POST; the API groups per lab and notifies each
  const sendOrdersMutation = useMutation({
    mutationFn: async () => {
      if (selected.length === 0) throw new Error('Select at least one test')

      const res = await fetch('/api/external-test-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          bookingId,
          urgency,
          notes,
          orders: selected.map((t) => ({
            testName: t.testName,
            testType: t.testType,
            testFee: t.testFee,
            labPartnerId: t.labPartnerId,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send orders')
      }
      return res.json()
    },
    onSuccess: (data) => {
      const count = data.orders?.length || 0
      toast.success(`${count} test order(s) sent to labs. Patient moved to "Sent for Tests".`)

      // Update booking status to "SentForTests" so patient moves out of normal queue.
      // NOTE: the previous PATCH to /bookings/[id]/status silently 404'd (no such
      // route); the real endpoint is PUT /appointments/[id]/status.
      fetch(`/api/dashboard/doctor/appointments/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SentForTests' }),
      }).catch(() => {})

      // Reset form
      setSelected([])
      setUrgency('Normal')
      setNotes('')
      onClose()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Order Tests for {patientName}
          </DialogTitle>
        </DialogHeader>

        {/* Urgency + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Urgency</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Notes for Lab (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasting sample needed"
              className="mt-1"
            />
          </div>
        </div>

        {/* Catalog-driven test picker */}
        {labsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-10 w-2/3 rounded-full" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        ) : (
          <div className="space-y-3">
            <TestCatalogPicker labs={labs} selected={selected} onChange={setSelected} />

            {/* Compact selected summary — chips with a per-lab coloured dot */}
            {selected.length > 0 && (
              <div className="rounded-lg border bg-muted/30 dark:bg-muted/20 p-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((t) => (
                    <span
                      key={t.key}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium"
                    >
                      <span
                        className={cn('h-2 w-2 rounded-full shrink-0', labDot(t.labPartnerId))}
                        aria-hidden="true"
                      />
                      {t.testName}
                      {t.custom && (
                        <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          custom
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSelected(t.key)}
                        aria-label={`Remove ${t.testName} from ${t.labName}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-rose-500 dark:hover:text-rose-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Auto-routed to {labCount} lab{labCount === 1 ? '' : 's'}
                  </span>
                  <span className="font-semibold">
                    Total ₹{total.toLocaleString('en-IN')}
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
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => sendOrdersMutation.mutate()}
            disabled={sendOrdersMutation.isPending || !patientId || selected.length === 0}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {sendOrdersMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Send Orders to Labs
          </Button>
        </DialogFooter>

        {!patientId && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
            ⚠ This patient doesn&apos;t have a registered account. Orders can only be sent for registered patients.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
