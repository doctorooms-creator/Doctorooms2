'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Zap, Printer, UserPlus, Loader2, CheckCircle2, Siren } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ExpressWalkinClient() {
  const queryClient = useQueryClient()
  const [mobile, setMobile] = useState('')
  const [patientName, setPatientName] = useState('')
  const [gender, setGender] = useState('Male')
  const [age, setAge] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [disease, setDisease] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)
  const [lastToken, setLastToken] = useState<any>(null)

  const { data: lookupData, isLoading: lookupLoading } = useQuery({
    queryKey: ['patient-lookup', mobile],
    queryFn: async () => {
      if (mobile.length < 10) return { found: false }
      const res = await fetch(`/api/dashboard/receptionist/express-walkin?mobile=${encodeURIComponent(mobile)}`)
      if (!res.ok) return { found: false }
      return res.json()
    },
    enabled: mobile.length >= 10,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (lookupData?.found && lookupData.patient) {
      setPatientName(lookupData.patient.name)
      setGender(lookupData.patient.gender || 'Male')
    }
  }, [lookupData])

  const { data: deptData } = useQuery({
    queryKey: ['express-departments'],
    queryFn: async () => { const res = await fetch('/api/dashboard/receptionist/departments'); if (!res.ok) return { departments: [] }; return res.json() },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/dashboard/receptionist/express-walkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed') }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(`Token ${data.booking.tokenNumber} assigned — Position #${data.booking.queuePosition}`)
      setLastToken(data.booking)
      queryClient.invalidateQueries({ queryKey: ['walk-in-queue'] })
      setMobile(''); setPatientName(''); setGender('Male'); setAge(''); setDisease(''); setIsEmergency(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const departments = deptData?.departments || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-amber-500" />Express Walk-in</h1>
          <p className="text-sm text-muted-foreground mt-1">Heavy traffic mode — 5 seconds per patient</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-sm px-3 py-1">Express</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-5 w-5 text-teal-600" />Quick Registration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Mobile Number (auto-detect patient)</Label>
              <div className="relative">
                <Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/[^0-9+ ]/g, ''))} placeholder="9876543210" className="pr-10" />
                {lookupLoading && mobile.length >= 10 && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                {lookupData?.found && !lookupLoading && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500" />}
              </div>
              {lookupData?.found && lookupData.patient && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />Existing patient: {lookupData.patient.name} — auto-filled
                </motion.div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1"><Label className="text-xs">Patient Name *</Label><Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Full name" /></div>
              <div><Label className="text-xs">Age</Label><Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="35" /></div>
              <div><Label className="text-xs">Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">M</SelectItem><SelectItem value="Female">F</SelectItem><SelectItem value="Other">O</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label className="text-xs">Department *</Label><Select value={departmentId} onValueChange={setDepartmentId}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent className="max-h-60">{departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}{d.shortCode ? ` (${d.shortCode})` : ''}</SelectItem>)}</SelectContent></Select></div>
            {/* Emergency toggle (Phase 4 — queue-top insert) */}
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <button
                type="button"
                role="switch"
                aria-checked={isEmergency}
                disabled={createMutation.isPending}
                onClick={() => setIsEmergency((v) => !v)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md border px-3 h-9 text-xs font-medium transition-colors',
                  isEmergency
                    ? 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'border-input bg-background text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/30'
                )}
              >
                <span className={cn('flex h-4 w-7 shrink-0 items-center rounded-full border border-transparent transition-colors', isEmergency ? 'bg-rose-500' : 'bg-muted-foreground/30')}>
                  <span className={cn('h-3 w-3 rounded-full bg-white shadow transition-transform', isEmergency ? 'translate-x-3.5' : 'translate-x-0.5')} />
                </span>
                <Siren className="h-3.5 w-3.5" aria-hidden="true" />
                Emergency — insert at queue top (EMR token)
              </button>
              {isEmergency && (
                <p className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                  <Siren className="h-3 w-3 shrink-0" aria-hidden="true" />
                  Emergency bookings skip slot checks and go to the front of the queue.
                </p>
              )}
            </div>
            <div><Label className="text-xs">Chief Complaint (optional)</Label><Input value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="Fever, chest pain, etc." /></div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-base font-semibold" disabled={!patientName.trim() || !departmentId || createMutation.isPending} onClick={() => createMutation.mutate({ patientName, mobileNo: mobile, gender, age: age || undefined, disease: disease || undefined, departmentId, isEmergency })}>
              {createMutation.isPending ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Creating...</> : <><Printer className="h-5 w-5 mr-2" />PRINT TOKEN</>}
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {lastToken ? (
            <motion.div key={lastToken.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="border-2 border-teal-300 dark:border-teal-700">
                <CardHeader><CardTitle className="text-base flex items-center gap-2 text-teal-700 dark:text-teal-400"><CheckCircle2 className="h-5 w-5" />Token Generated</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Token Number</p>
                    <p className="text-4xl font-bold font-mono text-teal-700 dark:text-teal-300 mt-1">{lastToken.tokenNumber}</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">Queue Position: #{lastToken.queuePosition}</Badge>
                      {lastToken.isEmergency && (
                        <Badge className="gap-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"><Siren className="h-3 w-3" />EMERGENCY</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{lastToken.patientName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span>{lastToken.departmentName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span>{lastToken.opdRoom || '—'}</span></div>
                  </div>
                  <Button onClick={() => window.open(`/bookings/print-token/${lastToken.id}`, '_blank', 'width=400,height=600')} className="w-full" variant="outline"><Printer className="h-4 w-4 mr-2" />Print Token Slip</Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center text-muted-foreground py-12"><Printer className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" /><p className="text-sm">Token slip will appear here after registration</p></CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
