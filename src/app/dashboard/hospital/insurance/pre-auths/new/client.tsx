'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'

export function NewPreAuthClient() {
  const router = useRouter()
  const [form, setForm] = useState({
    admissionId: '',
    policyId: '',
    requestedAmount: '',
    diagnosis: '',
    procedures: '',
    estimatedDays: '1',
  })

  // Fetch admitted patients (via receptionist IPD endpoint which is hospital-scoped)
  const { data: admissionsData } = useQuery({
    queryKey: ['admitted-patients-for-preauth'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/receptionist/ipd?status=Admitted&limit=100')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const admissions = admissionsData?.admissions || admissionsData?.data || []

  // Fetch policies for the selected patient
  const selectedAdmission = admissions.find((a: any) => a.id === form.admissionId)
  const { data: policiesData } = useQuery({
    queryKey: ['patient-policies', selectedAdmission?.userId],
    queryFn: async () => {
      if (!selectedAdmission?.userId) return { policies: [] }
      const res = await fetch(`/api/patient-insurance?patientId=${selectedAdmission.userId}`)
      if (!res.ok) return { policies: [] }
      return res.json()
    },
    enabled: !!selectedAdmission?.userId,
  })

  const policies = policiesData?.policies || []

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/insurance/pre-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          procedures: data.procedures ? data.procedures.split(',').map((s: string) => s.trim()) : [],
          requestedAmount: parseFloat(data.requestedAmount) || 0,
          estimatedDays: parseInt(data.estimatedDays) || 1,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(`Pre-auth created: ${data.preAuth.preAuthNo}`)
      router.push(`/dashboard/hospital/insurance/pre-auths/${data.preAuth.id}`)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-teal-600" /> New Pre-Authorization
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Request insurance pre-approval for a patient</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Patient & Policy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Admitted Patient</Label>
            <Select value={form.admissionId} onValueChange={(v) => setForm({ ...form, admissionId: v, policyId: '' })}>
              <SelectTrigger><SelectValue placeholder="Select admitted patient" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {admissions.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.patientName} — {a.admissionNo} ({a.wardName} / {a.bedNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.admissionId && policies.length > 0 && (
            <div>
              <Label>Insurance Policy</Label>
              <Select value={form.policyId} onValueChange={(v) => setForm({ ...form, policyId: v })}>
                <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                <SelectContent>
                  {policies.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.company?.name} — {p.policyNo} (₹{p.sumInsured?.toLocaleString('en-IN')}, {p.copayPercent}% copay)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.admissionId && policies.length === 0 && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-700 dark:text-amber-400">
              This patient has no active insurance policy. Add one from Patient → My Insurance first.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Clinical Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Diagnosis</Label>
            <Textarea
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              placeholder="e.g. Acute Gastroenteritis with dehydration"
              rows={2}
            />
          </div>
          <div>
            <Label>Planned Procedures (comma-separated)</Label>
            <Input
              value={form.procedures}
              onChange={(e) => setForm({ ...form, procedures: e.target.value })}
              placeholder="e.g. IV Fluids, Blood Test, Ultrasound"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estimated Amount (₹)</Label>
              <Input type="number" value={form.requestedAmount} onChange={(e) => setForm({ ...form, requestedAmount: e.target.value })} placeholder="50000" />
            </div>
            <div>
              <Label>Estimated Days</Label>
              <Input type="number" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} placeholder="3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button
          onClick={() => createMutation.mutate(form)}
          disabled={!form.admissionId || !form.policyId || !form.requestedAmount || createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating…' : 'Create Pre-Auth'}
        </Button>
      </div>
    </div>
  )
}
