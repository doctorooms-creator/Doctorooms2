'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Pill, Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, Layers, Sunrise, Sun, Moon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Medicine {
  id: string
  name: string
  morning: string
  afternoon: string
  evening: string
  dose: string | string[] | null
  tab: number
  description: string
  status: string
}

interface MedicineFormData {
  name: string
  morning: string
  afternoon: string
  evening: string
  dose: string
  tab: number
  description: string
  status: string
}

const emptyForm: MedicineFormData = {
  name: '',
  morning: '',
  afternoon: '',
  evening: '',
  dose: '',
  tab: 1,
  description: '',
  status: 'Active',
}

/** Parse a medicine's dose field into a list of dosage option strings.
 *  Handles JSON-array strings (["75mg","150mg"]), pre-parsed arrays, plain
 *  strings and null/undefined gracefully. */
function parseDoses(dose: string | string[] | null | undefined): string[] {
  if (!dose) return []
  if (Array.isArray(dose)) {
    return dose.map((d) => String(d).trim()).filter(Boolean)
  }
  const trimmed = dose.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map((d) => String(d).trim()).filter(Boolean)
      }
      if (parsed !== null && parsed !== undefined) return [String(parsed)]
      return []
    } catch {
      // Not valid JSON — fall through and treat as a plain string
    }
  }
  return [trimmed]
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-teal-600 bg-teal-600 text-white hover:bg-teal-700 dark:border-teal-500 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-600'
          : 'border-border bg-card text-muted-foreground hover:border-teal-300 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:text-teal-400'
      )}
    >
      {children}
    </button>
  )
}

type StatusFilter = 'all' | 'Active' | 'Inactive'
type SlotFilter = 'all' | 'morning' | 'afternoon' | 'evening'

export default function PharmacistMedicinesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<MedicineFormData>(emptyForm)

  const queryClient = useQueryClient()

  // Debounce the search input so typing doesn't fire an API request per keystroke
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading } = useQuery<{ medicines: Medicine[] }>({
    queryKey: ['pharmacist-medicines', search],
    queryFn: () =>
      fetch(
        `/api/dashboard/pharmacist/medicines?search=${encodeURIComponent(search)}`
      ).then((r) => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: (body: MedicineFormData) =>
      fetch('/api/dashboard/pharmacist/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-medicines'] })
      toast.success('Medicine added successfully')
      closeDialog()
    },
    onError: () => {
      toast.error('Failed to add medicine')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: MedicineFormData }) =>
      fetch('/api/dashboard/pharmacist/medicines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-medicines'] })
      toast.success('Medicine updated successfully')
      closeDialog()
    },
    onError: () => {
      toast.error('Failed to update medicine')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch('/api/dashboard/pharmacist/medicines', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-medicines'] })
      toast.success('Medicine deleted successfully')
      setDeleteOpen(false)
      setDeletingId(null)
    },
    onError: () => {
      toast.error('Failed to delete medicine')
    },
  })

  const medicines = data?.medicines ?? []

  // Summary intelligence (scoped to the current search results)
  const totalMedicines = medicines.length
  const activeCount = medicines.filter((m) => m.status === 'Active').length
  const inactiveCount = totalMedicines - activeCount
  const multiDoseCount = medicines.filter((m) => parseDoses(m.dose).length >= 2).length

  // Client-side category filters (status + dispensing schedule)
  const filteredMedicines = medicines.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (slotFilter !== 'all' && !(Number(m[slotFilter]) > 0)) return false
    return true
  })
  const hasActiveFilters =
    statusFilter !== 'all' || slotFilter !== 'all' || search !== ''

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (med: Medicine) => {
    setEditingId(med.id)
    setForm({
      name: med.name,
      morning: med.morning,
      afternoon: med.afternoon,
      evening: med.evening,
      dose: Array.isArray(med.dose) ? med.dose.join(', ') : med.dose || '',
      tab: med.tab,
      description: med.description,
      status: med.status,
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId)
    }
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Medicine name is required')
      return
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, body: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by medicine name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Medicines"
          value={totalMedicines}
          icon={Pill}
          gradient="from-teal-500 to-teal-600"
          iconBg="bg-teal-100 dark:bg-teal-900/50"
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={CheckCircle2}
          gradient="from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-100 dark:bg-emerald-900/50"
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          icon={XCircle}
          gradient="from-rose-500 to-rose-600"
          iconBg="bg-rose-100 dark:bg-rose-900/50"
        />
        <StatCard
          title="Multi-dose"
          value={multiDoseCount}
          icon={Layers}
          gradient="from-amber-500 to-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-900/50"
        />
      </div>

      {/* Category filters: status + dispensing schedule */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Status</span>
        <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
          All
        </FilterChip>
        <FilterChip active={statusFilter === 'Active'} onClick={() => setStatusFilter('Active')}>
          Active
        </FilterChip>
        <FilterChip active={statusFilter === 'Inactive'} onClick={() => setStatusFilter('Inactive')}>
          Inactive
        </FilterChip>
        <div className="hidden h-4 w-px bg-border sm:block" />
        <span className="text-xs font-medium text-muted-foreground">Schedule</span>
        <FilterChip active={slotFilter === 'all'} onClick={() => setSlotFilter('all')}>
          Any time
        </FilterChip>
        <FilterChip active={slotFilter === 'morning'} onClick={() => setSlotFilter('morning')}>
          <Sunrise className="h-3 w-3" />
          Morning
        </FilterChip>
        <FilterChip active={slotFilter === 'afternoon'} onClick={() => setSlotFilter('afternoon')}>
          <Sun className="h-3 w-3" />
          Afternoon
        </FilterChip>
        <FilterChip active={slotFilter === 'evening'} onClick={() => setSlotFilter('evening')}>
          <Moon className="h-3 w-3" />
          Evening
        </FilterChip>
        {hasActiveFilters && medicines.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Showing {filteredMedicines.length} of {medicines.length}
          </span>
        )}
      </div>

      {/* Medicine table or empty state */}
      {!isLoading && filteredMedicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 px-6 py-14 text-center dark:border-teal-700 dark:bg-teal-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
            <Pill className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-3 font-medium">
            {medicines.length === 0 ? 'No medicines yet' : 'No medicines match your filters'}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {medicines.length === 0
              ? 'Add your first medicine to start building the dispensing master.'
              : 'Try a different search term or switch back the status and schedule filters.'}
          </p>
        </div>
      ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead className="text-center">Morning</TableHead>
                <TableHead className="text-center">Afternoon</TableHead>
                <TableHead className="text-center">Evening</TableHead>
                <TableHead className="text-center">Dosage</TableHead>
                <TableHead className="text-center">Tabs</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-28 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="mx-auto h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="mx-auto h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="mx-auto h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="mx-auto h-4 w-10 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="mx-auto h-4 w-8 animate-pulse rounded bg-muted" /></TableCell>
                    <TableCell><div className="mx-auto h-5 w-14 animate-pulse rounded-full bg-muted" /></TableCell>
                    <TableCell><div className="ml-auto h-8 w-16 animate-pulse rounded bg-muted" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredMedicines.map((med, i) => {
                  const doses = parseDoses(med.dose)
                  return (
                  <motion.tr
                    key={med.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-teal-500" />
                        <div>
                          <p className="text-sm font-medium">{med.name}</p>
                          {med.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{med.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {med.morning ? (
                        <span className="inline-flex items-center rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                          {med.morning}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {med.afternoon ? (
                        <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                          {med.afternoon}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {med.evening ? (
                        <span className="inline-flex items-center rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/50 dark:text-rose-400">
                          {med.evening}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {doses.length > 0 ? (
                        <span className="flex flex-wrap justify-center gap-1">
                          {doses.map((d) => (
                            <span
                              key={d}
                              className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
                            >
                              {d}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">{med.tab}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          med.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400'
                        )}
                      >
                        {med.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/50"
                          onClick={() => openEdit(med)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                          onClick={() => handleDelete(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Add/Edit medicine dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medicine Name *</Label>
              <Input
                id="med-name"
                placeholder="e.g. Paracetamol 500mg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="med-morning">Morning</Label>
                <Input
                  id="med-morning"
                  placeholder="e.g. 1"
                  value={form.morning}
                  onChange={(e) => setForm({ ...form, morning: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-afternoon">Afternoon</Label>
                <Input
                  id="med-afternoon"
                  placeholder="e.g. 1"
                  value={form.afternoon}
                  onChange={(e) => setForm({ ...form, afternoon: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-evening">Evening</Label>
                <Input
                  id="med-evening"
                  placeholder="e.g. 1"
                  value={form.evening}
                  onChange={(e) => setForm({ ...form, evening: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="med-dose">Dosage</Label>
                <Input
                  id="med-dose"
                  placeholder="e.g. After meal"
                  value={form.dose}
                  onChange={(e) => setForm({ ...form, dose: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-tab">Tabs</Label>
                <Input
                  id="med-tab"
                  type="number"
                  min={1}
                  value={form.tab}
                  onChange={(e) => setForm({ ...form, tab: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="med-desc">Description</Label>
              <Textarea
                id="med-desc"
                placeholder="Additional notes about this medicine..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            {editingId && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Switch
                  checked={form.status === 'Active'}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, status: checked ? 'Active' : 'Inactive' })
                  }
                />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground">
                    {form.status === 'Active' ? 'Active — visible in inventory' : 'Inactive — hidden from inventory'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {isPending
                  ? editingId ? 'Updating...' : 'Adding...'
                  : editingId ? 'Update Medicine' : 'Add Medicine'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medicine? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
