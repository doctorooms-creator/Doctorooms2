'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FileText, Plus, Trash2, Edit, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  diagnosis: string
  medicines: any[]
  labs: any[]
  advice: string
  followUpDays: number
  isCommon: boolean
  createdAt: string
}

export function RxTemplatesClient() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    diagnosis: '',
    medicinesText: '', // JSON-like: one per line: "Paracetamol 650 | 1-0-1 | 3 days"
    labsText: '', // one per line
    advice: '',
    followUpDays: 7,
    isCommon: false,
  })

  const { data, isLoading } = useQuery<{ templates: Template[] }>({
    queryKey: ['rx-templates'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/doctor/rx-templates')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const medicines = data.medicinesText
        .split('\n')
        .filter((l: string) => l.trim())
        .map((line: string) => {
          const [name, dose, duration] = line.split('|').map((s) => s.trim())
          return { name, dose: dose || '', duration: duration || '', instructions: '' }
        })
      const labs = data.labsText.split('\n').filter((l: string) => l.trim())

      const payload = {
        name: data.name,
        diagnosis: data.diagnosis,
        medicines,
        labs,
        advice: data.advice,
        followUpDays: parseInt(data.followUpDays) || 7,
        isCommon: data.isCommon,
      }

      if (editingId) {
        const res = await fetch(`/api/dashboard/doctor/rx-templates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } else {
        const res = await fetch('/api/dashboard/doctor/rx-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed')
        return res.json()
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Template updated' : 'Template created')
      setShowForm(false)
      setEditingId(null)
      setForm({ name: '', diagnosis: '', medicinesText: '', labsText: '', advice: '', followUpDays: 7, isCommon: false })
      queryClient.invalidateQueries({ queryKey: ['rx-templates'] })
    },
    onError: () => toast.error('Failed to save template'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dashboard/doctor/rx-templates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Template deleted')
      queryClient.invalidateQueries({ queryKey: ['rx-templates'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleEdit = (t: Template) => {
    setEditingId(t.id)
    setForm({
      name: t.name,
      diagnosis: t.diagnosis,
      medicinesText: t.medicines.map((m: any) => `${m.name} | ${m.dose} | ${m.duration}`).join('\n'),
      labsText: t.labs.join('\n'),
      advice: t.advice,
      followUpDays: t.followUpDays,
      isCommon: t.isCommon,
    })
    setShowForm(true)
  }

  const templates = data?.templates || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Prescription Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">1-click prescriptions for common cases — saves 3+ minutes per patient</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: '', diagnosis: '', medicinesText: '', labsText: '', advice: '', followUpDays: 7, isCommon: false }); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      {/* Common templates quick-access */}
      {templates.filter((t) => t.isCommon).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" /> Quick Access
          </h2>
          <div className="flex flex-wrap gap-2">
            {templates.filter((t) => t.isCommon).map((t) => (
              <Badge key={t.id} className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1.5 text-sm cursor-pointer hover:bg-amber-200" onClick={() => handleEdit(t)}>
                {t.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Templates list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium">No templates yet</p>
              <p className="text-sm mt-1">Create templates for common cases like Viral Fever, HTN Follow-up, etc.</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="divide-y max-h-[60vh] overflow-y-auto">
              {templates.map((t) => (
                <div key={t.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{t.name}</h3>
                        {t.isCommon && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                      </div>
                      {t.diagnosis && <p className="text-xs text-muted-foreground mb-1">Dx: {t.diagnosis}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.medicines.slice(0, 4).map((m: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{m.name}</Badge>
                        ))}
                        {t.medicines.length > 4 && <Badge variant="outline" className="text-[10px]">+{t.medicines.length - 4} more</Badge>}
                        {t.labs.length > 0 && <Badge variant="outline" className="text-[10px] bg-violet-50">{t.labs.length} labs</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Follow-up: {t.followUpDays} days</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(t)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Template' : 'New Prescription Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Viral Fever, HTN Follow-up" />
            </div>
            <div>
              <Label>Diagnosis</Label>
              <Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Viral Fever with body ache" />
            </div>
            <div>
              <Label>Medicines (one per line: Name | Dose | Duration)</Label>
              <Textarea
                value={form.medicinesText}
                onChange={(e) => setForm({ ...form, medicinesText: e.target.value })}
                placeholder={"Paracetamol 650 | 1-0-1 | 3 days\nCetirizine 10 | 0-0-1 | 5 days\nVitamin C | 1-1-1 | 7 days"}
                rows={4}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>Lab Tests (one per line, optional)</Label>
              <Textarea
                value={form.labsText}
                onChange={(e) => setForm({ ...form, labsText: e.target.value })}
                placeholder={"CBC\nESR"}
                rows={2}
              />
            </div>
            <div>
              <Label>Advice</Label>
              <Textarea
                value={form.advice}
                onChange={(e) => setForm({ ...form, advice: e.target.value })}
                placeholder="Rest, plenty of fluids, avoid cold drinks"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Follow-up (days)</Label>
                <Input type="number" value={form.followUpDays} onChange={(e) => setForm({ ...form, followUpDays: e.target.value })} />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch checked={form.isCommon} onCheckedChange={(v) => setForm({ ...form, isCommon: v })} />
                <Label className="cursor-pointer">Quick Access</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name.trim() || saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
