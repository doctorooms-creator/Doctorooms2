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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Send, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/print-utils'

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Submitted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PartiallyApproved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function PreAuthDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [responseForm, setResponseForm] = useState({
    status: 'Approved',
    approvedAmount: '',
    responseNotes: '',
    rejectionReason: '',
  })
  const [showResponse, setShowResponse] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['pre-auth-detail', id],
    queryFn: async () => {
      const res = await fetch(`/api/insurance/pre-auth/${id}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/insurance/pre-auth/${id}/submit`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Pre-auth submitted to TPA')
      queryClient.invalidateQueries({ queryKey: ['pre-auth-detail', id] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const respondMutation = useMutation({
    mutationFn: async (data: typeof responseForm) => {
      const res = await fetch(`/api/insurance/pre-auth/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Response recorded')
      setShowResponse(false)
      queryClient.invalidateQueries({ queryKey: ['pre-auth-detail', id] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) {
    return <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
  }

  const pa = data?.preAuth
  if (!pa) return <div className="p-6 text-center text-muted-foreground">Pre-auth not found</div>

  const timeline = [
    { label: 'Created', date: pa.createdAt, done: true },
    { label: 'Submitted to TPA', date: pa.submittedAt, done: !!pa.submittedAt },
    { label: 'TPA Response', date: pa.responseAt, done: !!pa.responseAt },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/hospital/insurance/pre-auths')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {pa.preAuthNo}
            <Badge className={STATUS_COLORS[pa.status]}>{pa.status}</Badge>
          </h1>
        </div>
      </div>

      {/* Patient & Policy Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Patient</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{pa.admission?.patientName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Admission No</span><span className="font-mono text-xs">{pa.admission?.admissionNo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Age/Gender</span><span>{pa.admission?.patientAge}y / {pa.admission?.patientGender}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Diagnosis</span><span className="text-right">{pa.admission?.initialDiagnosis || pa.diagnosis}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Insurance Policy</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium">{pa.policy?.company?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TPA</span><span>{pa.policy?.tpa?.name || 'Direct'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Policy No</span><span className="font-mono text-xs">{pa.policy?.policyNo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sum Insured</span><span className="font-medium">{formatCurrency(pa.policy?.sumInsured || 0)}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Request Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><span className="text-xs text-muted-foreground">Requested Amount</span><p className="text-lg font-bold">{formatCurrency(pa.requestedAmount)}</p></div>
            <div><span className="text-xs text-muted-foreground">Approved Amount</span><p className="text-lg font-bold text-emerald-600">{pa.approvedAmount > 0 ? formatCurrency(pa.approvedAmount) : '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Estimated Days</span><p className="text-lg font-bold">{pa.estimatedDays}</p></div>
            <div><span className="text-xs text-muted-foreground">Procedures</span><p className="text-sm">{(() => { try { return JSON.parse(pa.procedures).join(', ') || '—' } catch { return '—' } })()}</p></div>
          </div>
          {pa.responseNotes && (
            <div className="rounded-md bg-muted p-3 text-sm"><span className="font-medium">TPA Notes: </span>{pa.responseNotes}</div>
          )}
          {pa.rejectionReason && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400"><span className="font-medium">Rejection Reason: </span>{pa.rejectionReason}</div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Status Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {timeline.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex flex-col items-center ${step.done ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'}`}>
                    {step.done ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <span className="text-xs mt-1">{step.label}</span>
                  {step.date && <span className="text-xs text-muted-foreground">{new Date(step.date).toLocaleDateString('en-IN')}</span>}
                </div>
                {i < timeline.length - 1 && <div className={`w-12 h-0.5 mx-1 ${step.done ? 'bg-emerald-300' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {pa.status === 'Pending' && (
          <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
            <Send className="h-4 w-4 mr-2" /> {submitMutation.isPending ? 'Submitting…' : 'Submit to TPA'}
          </Button>
        )}
        {pa.status === 'Submitted' && !showResponse && (
          <Button onClick={() => setShowResponse(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Record TPA Response
          </Button>
        )}
        <Button variant="outline" onClick={() => router.push('/dashboard/hospital/insurance/pre-auths')}>Back to List</Button>
      </div>

      {/* Response Form */}
      {showResponse && (
        <Card>
          <CardHeader><CardTitle className="text-base">Record TPA Response</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Response Status</Label>
              <Select value={responseForm.status} onValueChange={(v) => setResponseForm({ ...responseForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="PartiallyApproved">Partially Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {responseForm.status !== 'Rejected' && (
              <div>
                <Label>Approved Amount (₹)</Label>
                <Input type="number" value={responseForm.approvedAmount} onChange={(e) => setResponseForm({ ...responseForm, approvedAmount: e.target.value })} placeholder={String(pa.requestedAmount)} />
              </div>
            )}
            {responseForm.status === 'Rejected' && (
              <div>
                <Label>Rejection Reason</Label>
                <Textarea value={responseForm.rejectionReason} onChange={(e) => setResponseForm({ ...responseForm, rejectionReason: e.target.value })} rows={2} />
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea value={responseForm.responseNotes} onChange={(e) => setResponseForm({ ...responseForm, responseNotes: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowResponse(false)}>Cancel</Button>
              <Button onClick={() => respondMutation.mutate(responseForm)} disabled={respondMutation.isPending}>
                {respondMutation.isPending ? 'Saving…' : 'Save Response'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
