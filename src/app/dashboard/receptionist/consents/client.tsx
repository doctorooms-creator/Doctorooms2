'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { FileSignature, Plus } from 'lucide-react'
import { toast } from 'sonner'

const CONSENT_TYPES = ['General', 'Surgery', 'Anesthesia', 'BloodTransfusion', 'HIVTest', 'Teleconsult', 'Discharge']

export function ConsentsClient() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [signConsentId, setSignConsentId] = useState<string | null>(null)
  const [witnessName, setWitnessName] = useState('')
  const [witnessRelation, setWitnessRelation] = useState('')
  const [form, setForm] = useState({ patientId: '', consentType: 'General', templateName: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['consents'],
    queryFn: async () => {
      const res = await fetch('/api/patient-consent')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/patient-consent', {
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
      toast.success('Consent created')
      setShowCreate(false)
      setForm({ patientId: '', consentType: 'General', templateName: '' })
      queryClient.invalidateQueries({ queryKey: ['consents'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const signMutation = useMutation({
    mutationFn: async (data: { id: string; witnessName: string; witnessRelation: string }) => {
      const res = await fetch(`/api/patient-consent/${data.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ witnessName: data.witnessName, witnessRelation: data.witnessRelation }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Consent signed')
      setSignConsentId(null)
      setWitnessName('')
      setWitnessRelation('')
      queryClient.invalidateQueries({ queryKey: ['consents'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-teal-600" />
            Patient Consents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage patient consent forms for procedures and treatments</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Consent
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Consent Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Witness</TableHead>
                    <TableHead>Signed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.consents?.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.patientId?.slice(0, 16)}…</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{c.consentType}</Badge>
                      </TableCell>
                      <TableCell>
                        {c.signedByPatient ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Signed</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.witnessName ? (
                          <span className="text-sm">{c.witnessName} <span className="text-muted-foreground">({c.witnessRelation})</span></span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.signedAt ? new Date(c.signedAt).toLocaleString('en-IN') : '—'}
                      </TableCell>
                      <TableCell>
                        {!c.signedByPatient && (
                          <Button size="sm" variant="outline" onClick={() => setSignConsentId(c.id)}>
                            Sign
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data?.consents?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No consents found.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Patient Consent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                placeholder="Enter patient user ID"
              />
            </div>
            <div>
              <Label>Consent Type</Label>
              <Select value={form.consentType} onValueChange={(v) => setForm({ ...form, consentType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONSENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template Name (optional)</Label>
              <Input
                value={form.templateName}
                onChange={(e) => setForm({ ...form, templateName: e.target.value })}
                placeholder="e.g. General Admission Consent Form"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.patientId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create Consent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Dialog */}
      <Dialog open={!!signConsentId} onOpenChange={(v) => !v && setSignConsentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Consent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Witness Name</Label>
              <Input value={witnessName} onChange={(e) => setWitnessName(e.target.value)} placeholder="Witness full name" />
            </div>
            <div>
              <Label>Witness Relation to Patient</Label>
              <Input value={witnessRelation} onChange={(e) => setWitnessRelation(e.target.value)} placeholder="e.g. Spouse, Son, Daughter" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignConsentId(null)}>Cancel</Button>
            <Button
              onClick={() => signConsentId && signMutation.mutate({ id: signConsentId, witnessName, witnessRelation })}
              disabled={signMutation.isPending}
            >
              {signMutation.isPending ? 'Signing…' : 'Confirm Signature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
