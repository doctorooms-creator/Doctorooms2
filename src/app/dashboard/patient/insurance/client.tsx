'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Shield, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/print-utils'

export function PatientInsuranceClient() {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    companyId: '',
    policyNo: '',
    policyType: 'Individual',
    memberName: '',
    memberRelation: 'Self',
    sumInsured: '',
    copayPercent: '0',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
  })

  const { data: policiesData, isLoading } = useQuery({
    queryKey: ['my-policies'],
    queryFn: async () => {
      const res = await fetch('/api/patient-insurance')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const { data: companiesData } = useQuery({
    queryKey: ['insurance-companies'],
    queryFn: async () => {
      const res = await fetch('/api/insurance/companies')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/patient-insurance', {
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
      toast.success('Insurance policy added')
      setShowAdd(false)
      setForm({ ...form, companyId: '', policyNo: '', sumInsured: '' })
      queryClient.invalidateQueries({ queryKey: ['my-policies'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const policies = policiesData?.policies || []
  const companies = companiesData?.companies || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            My Insurance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your health insurance policies</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Policy
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : policies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">No insurance policies on record.</p>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((p: any) => {
            const isValid = p.validTo ? new Date(p.validTo) > new Date() : true
            return (
              <Card key={p.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.company?.name || 'Insurance'}</CardTitle>
                    {isValid ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertCircle className="h-3 w-3 mr-1" /> Expired
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Policy No</span>
                    <span className="font-mono">{p.policyNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{p.policyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sum Insured</span>
                    <span className="font-medium">{formatCurrency(p.sumInsured)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Copay</span>
                    <span>{p.copayPercent}%</span>
                  </div>
                  {p.tpa && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TPA</span>
                      <span>{p.tpa.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span>{p.validTo ? new Date(p.validTo).toLocaleDateString('en-IN') : 'Lifetime'}</span>
                  </div>
                  {p.company?.cashlessSupported && (
                    <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 mt-2">
                      Cashless Available
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Policy Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Insurance Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Insurance Company</Label>
              <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v })}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Policy Number</Label>
              <Input value={form.policyNo} onChange={(e) => setForm({ ...form, policyNo: e.target.value })} placeholder="e.g. STAR/2025/00123456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Policy Type</Label>
                <Select value={form.policyType} onValueChange={(v) => setForm({ ...form, policyType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Group">Group</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sum Insured (₹)</Label>
                <Input type="number" value={form.sumInsured} onChange={(e) => setForm({ ...form, sumInsured: e.target.value })} placeholder="500000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Copay (%)</Label>
                <Input type="number" value={form.copayPercent} onChange={(e) => setForm({ ...form, copayPercent: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button
              onClick={() => addMutation.mutate(form)}
              disabled={!form.companyId || !form.policyNo || addMutation.isPending}
            >
              {addMutation.isPending ? 'Adding…' : 'Add Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
