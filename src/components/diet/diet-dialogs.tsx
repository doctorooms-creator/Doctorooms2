'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Utensils } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ============ CONSTANTS ============

export const DIET_TYPES = [
  'Regular',
  'Soft',
  'Liquid',
  'Clear Liquid',
  'Diabetic',
  'Low Salt',
  'High Protein',
  'NPO',
  'Renal',
  'Hepatic',
] as const

export const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'All',
] as const

// ============ TYPES ============

export interface DietOrder {
  id: string
  admissionId: string
  dietType: string
  mealType: string
  instructions: string
  startDate: string
  endDate: string | null
  status: string
  stoppedBy: string | null
  stoppedAt: string | null
  stoppedReason: string
  createdAt: string
}

export interface PatientOption {
  admissionId: string
  patientName: string
  bedNumber?: string
  admissionNo?: string
}

interface DietOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided (patient detail tab), the dialog is locked to this admission */
  fixedAdmissionId?: string
  /** List of admitted patients for the patient selector (nurse diet-orders page) */
  patients: PatientOption[]
}

// ============ NEW DIET ORDER DIALOG ============

export function DietOrderDialog({
  open,
  onOpenChange,
  fixedAdmissionId,
  patients,
}: DietOrderDialogProps) {
  const queryClient = useQueryClient()

  const [admissionId, setAdmissionId] = useState('')
  const [dietType, setDietType] = useState('')
  const [mealType, setMealType] = useState('')
  const [instructions, setInstructions] = useState('')

  const effectiveAdmissionId = fixedAdmissionId || admissionId

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/diet-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId: effectiveAdmissionId,
          dietType,
          mealType,
          instructions,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create diet order')
      return data
    },
    onSuccess: () => {
      toast.success('Diet order created successfully')
      queryClient.invalidateQueries({ queryKey: ['diet-orders'] })
      queryClient.invalidateQueries({ queryKey: ['nurse-diet-orders'] })
      queryClient.invalidateQueries({ queryKey: ['nurse-patient'] })
      queryClient.invalidateQueries({ queryKey: ['patient-diet'] })
      setAdmissionId('')
      setDietType('')
      setMealType('')
      setInstructions('')
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = () => {
    if (!effectiveAdmissionId) {
      toast.error('Please select a patient')
      return
    }
    if (!dietType) {
      toast.error('Please select a diet type')
      return
    }
    if (!mealType) {
      toast.error('Please select a meal type')
      return
    }
    createMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-teal-500" />
            New Diet Order
          </DialogTitle>
          <DialogDescription>
            Create a new diet order for an admitted patient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient select — hidden when fixedAdmissionId is provided */}
          {!fixedAdmissionId && (
            <div className="space-y-2">
              <Label htmlFor="diet-patient">Patient</Label>
              <Select value={admissionId} onValueChange={setAdmissionId}>
                <SelectTrigger id="diet-patient">
                  <SelectValue placeholder="Select admitted patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No admitted patients in your ward
                    </div>
                  ) : (
                    patients.map((p) => (
                      <SelectItem key={p.admissionId} value={p.admissionId}>
                        {p.patientName}
                        {p.bedNumber ? ` — Bed ${p.bedNumber}` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Diet Type */}
          <div className="space-y-2">
            <Label htmlFor="diet-type">Diet Type</Label>
            <Select value={dietType} onValueChange={setDietType}>
              <SelectTrigger id="diet-type">
                <SelectValue placeholder="Select diet type" />
              </SelectTrigger>
              <SelectContent>
                {DIET_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meal Type */}
          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger id="meal-type">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="diet-instructions">Instructions</Label>
            <Textarea
              id="diet-instructions"
              placeholder="e.g. Low sugar, no solid food after 8 PM, extra fluids..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Utensils className="mr-2 h-4 w-4" />
            )}
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ STOP DIET ORDER DIALOG ============

interface StopDietDialogProps {
  diet: DietOrder | null
  onOpenChange: (open: boolean) => void
}

export function StopDietDialog({ diet, onOpenChange }: StopDietDialogProps) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  const stopMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/diet-orders/${diet?.id}/stop`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to stop diet order')
      return data
    },
    onSuccess: () => {
      toast.success('Diet order stopped')
      queryClient.invalidateQueries({ queryKey: ['diet-orders'] })
      queryClient.invalidateQueries({ queryKey: ['nurse-diet-orders'] })
      queryClient.invalidateQueries({ queryKey: ['nurse-patient'] })
      queryClient.invalidateQueries({ queryKey: ['patient-diet'] })
      setReason('')
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) setReason('')
    onOpenChange(open)
  }

  return (
    <AlertDialog open={!!diet} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Stop Diet Order</AlertDialogTitle>
          <AlertDialogDescription>
            Stop the <strong className="text-foreground">{diet?.dietType}</strong> ({diet?.mealType}) diet order.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="stop-reason">Reason for stopping</Label>
          <Textarea
            id="stop-reason"
            placeholder="e.g. Patient discharged, diet changed, tolerance issue..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={stopMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              stopMutation.mutate()
            }}
            disabled={stopMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {stopMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Stop Diet Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
