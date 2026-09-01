'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Send, CheckCircle2, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/print-utils'

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  Submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  UnderReview: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PartiallyApproved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Settled: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

export function ClaimDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [settleForm, setSettleForm] = useState({ settlementAmount: '', settlementRef: '', notes: '' })
  const [showSettle, setShowSettle] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['claim-detail', id],
    queryFn: async () => {
      const res = await fetch(`/api/insurance/claims/${id}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/insurance/claims/${id}/submit`, { method: 'POST' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed') }
      return res.json()
    },
    onSuccess: () => { toast.success('Claim submitted'); queryClient.invalidateQueries({ queryKey: ['claim-detail', id] }) },
    onError: (err: Error) => toast.error(err.message),
  })

  const settleMutation = useMutation({
    mutationFn: async (data: typeof settleForm) => {
      const res = await fetch(`/api/insurance/claims/${id}/settle`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed') }
      return res.json()
    },
    onSuccess: () => { toast.success('Claim settled'); setShowSettle(false); queryClient.invalidateQueries({ queryKey: ['claim-detail', id] }) },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) return <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>

  const c = data?.claim
  if (!c) return <div className="p-6 text-center text-muted-foreground">Claim not found</div>

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/hospital/insurance/claims')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {c.claimNo}
            <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
          </h1>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><span className="text-xs text-muted-foreground">CLAIMED</span><p className="text-xl font-bold">{formatCurrency(c.claimAmount)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-xs text-muted-foreground">PATIENT SHARE</span><p className="text-xl font-bold text-amber-600">{formatCurrency(c.patientPayable)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-xs text-muted-foreground">TPA SHARE</span><p className="text-xl font-bold text-emerald-600">{formatCurrency(c.tpaPayable)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-xs text-muted-foreground">SETTLED</span><p className="text-xl font-bold text-teal-600">{formatCurrency(c.settlementAmount)}</p></CardContent></Card>
      </div>

      {/* Patient & Policy */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-base">Patient</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{c.policy?.patient?.name || c.admission?.patientName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Admission</span><span className="font-mono text-xs">{c.admission?.admissionNo}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Bill No</span><span className="font-mono text-xs">{c.bill?.billNo}</span></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Policy</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium">{c.policy?.company?.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">TPA</span><span>{c.policy?.tpa?.name || 'Direct'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Policy No</span><span className="font-mono text-xs">{c.policy?.policyNo}</span></div>
          {c.preAuth && <div className="flex justify-between"><span className="text-muted-foreground">Pre-Auth</span><span className="font-mono text-xs">{c.preAuth.preAuthNo} ({c.preAuth.status})</span></div>}
        </CardContent></Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader><CardTitle className="text-base">Claim Line Items</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Item</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Claimed</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3">Allowed</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Deduction Reason</th>
                </tr>
              </thead>
              <tbody>
                {c.lineItems?.map((li: any) => (
                  <tr key={li.id} className="border-b">
                    <td className="p-3 text-sm">{li.itemName}</td>
                    <td className="p-3 text-right text-sm font-medium">{formatCurrency(li.claimedAmount)}</td>
                    <td className="p-3 text-right text-sm">{li.allowedAmount > 0 ? formatCurrency(li.allowedAmount) : '—'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{li.deductionReason || '—'}</td>
                  </tr>
                ))}
                {c.lineItems?.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No line items</td></tr>
                )}
              </tbody>
              {c.lineItems?.length > 0 && (
                <tfoot className="border-t bg-muted/50">
                  <tr>
                    <td className="p-3 font-medium">Total</td>
                    <td className="p-3 text-right font-bold">{formatCurrency(c.lineItems.reduce((s: number, li: any) => s + li.claimedAmount, 0))}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(c.lineItems.reduce((s: number, li: any) => s + li.allowedAmount, 0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {c.status === 'Draft' && (
          <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
            <Send className="h-4 w-4 mr-2" /> {submitMutation.isPending ? 'Submitting…' : 'Submit Claim'}
          </Button>
        )}
        {['Submitted', 'UnderReview', 'Approved', 'PartiallyApproved'].includes(c.status) && !showSettle && (
          <Button onClick={() => setShowSettle(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Record Settlement
          </Button>
        )}
        <Button variant="outline" onClick={() => router.push('/dashboard/hospital/insurance/claims')}>Back to List</Button>
      </div>

      {/* Settlement Form */}
      {showSettle && (
        <Card>
          <CardHeader><CardTitle className="text-base">Record Settlement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Settlement Amount (₹)</Label><Input type="number" value={settleForm.settlementAmount} onChange={(e) => setSettleForm({ ...settleForm, settlementAmount: e.target.value })} placeholder={String(c.tpaPayable)} /></div>
              <div><Label>Settlement Reference</Label><Input value={settleForm.settlementRef} onChange={(e) => setSettleForm({ ...settleForm, settlementRef: e.target.value })} placeholder="e.g. TPA-UTR-12345" /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={settleForm.notes} onChange={(e) => setSettleForm({ ...settleForm, notes: e.target.value })} rows={2} /></div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSettle(false)}>Cancel</Button>
              <Button onClick={() => settleMutation.mutate(settleForm)} disabled={settleMutation.isPending}>
                {settleMutation.isPending ? 'Saving…' : 'Confirm Settlement'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
