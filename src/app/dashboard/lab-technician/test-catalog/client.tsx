'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Search,
  ListChecks,
  Droplet,
  ScanLine,
  Boxes,
  Loader2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

// ─── Types ───────────────────────────────────────────────────────────────

type TestCategory = 'Blood' | 'Radiology' | 'Pathology' | 'Other'

interface LabTestCatalogItem {
  id: string
  labPartnerId: string
  testName: string
  testCategory: string
  fee: number
  sampleType: string
  turnaroundTime: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type CatalogResponse = { tests: LabTestCatalogItem[] }

interface FormState {
  testName: string
  testCategory: TestCategory
  fee: string
  sampleType: string
  turnaroundTime: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  testName: '',
  testCategory: 'Blood',
  fee: '',
  sampleType: '',
  turnaroundTime: '',
  isActive: true,
}

const CATEGORIES: TestCategory[] = ['Blood', 'Radiology', 'Pathology', 'Other']

// ─── Helpers ──────────────────────────────────────────────────────────────

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const formatINR = (n: number) => inrFormatter.format(Number(n) || 0)

function categoryBadge(cat: string) {
  const map: Record<string, string> = {
    Blood: 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-950/40 dark:text-rose-300',
    Radiology:
      'bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 dark:bg-violet-950/40 dark:text-violet-300',
    Pathology:
      'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 dark:bg-amber-950/40 dark:text-amber-300',
    Other:
      'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-0 dark:bg-zinc-800/60 dark:text-zinc-300',
  }
  return (
    <Badge className={map[cat] || map.Other}>
      {cat}
    </Badge>
  )
}

function statusBadge(isActive: boolean) {
  return isActive ? (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 dark:bg-emerald-950/40 dark:text-emerald-300">
      Active
    </Badge>
  ) : (
    <Badge className="bg-zinc-200 text-zinc-600 hover:bg-zinc-200 border-0 dark:bg-zinc-800/60 dark:text-zinc-300">
      Inactive
    </Badge>
  )
}

// ─── Component ────────────────────────────────────────────────────────────

export default function TestCatalogClient() {
  const queryClient = useQueryClient()

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [activeOnly, setActiveOnly] = useState<boolean>(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState<string>('')

  // Build query string
  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (categoryFilter !== 'all') p.set('category', categoryFilter)
    if (activeOnly) p.set('activeOnly', 'true')
    return p.toString()
  }, [categoryFilter, activeOnly])

  const queryKey = useMemo(
    () => ['lab-test-catalog', queryParams] as const,
    [queryParams]
  )

  const { data, isLoading, error } = useQuery<CatalogResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/lab-test-catalog?${queryParams}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to load test catalog')
      }
      return res.json()
    },
  })

  // Surface fetch errors as a toast
  useEffect(() => {
    if (error) {
      toast.error((error as Error).message || 'Failed to load catalog')
    }
  }, [error])

  const tests = data?.tests ?? []

  // Client-side search filter (testName, case-insensitive)
  const filteredTests = useMemo(() => {
    if (!search.trim()) return tests
    const q = search.trim().toLowerCase()
    return tests.filter((t) => t.testName.toLowerCase().includes(q))
  }, [tests, search])

  // Stat cards (computed from full catalog fetch — ignore activeOnly filter)
  const stats = useMemo(() => {
    // Use the underlying data ignoring activeOnly/category filters by
    // computing from the most permissive fetch available. Since the query
    // keys differ per filter, we just count what's currently loaded; if the
    // user is filtering, the stats reflect filtered totals which is fine.
    const total = tests.length
    const blood = tests.filter((t) => t.testCategory === 'Blood').length
    const radiology = tests.filter((t) => t.testCategory === 'Radiology').length
    const other = tests.filter(
      (t) => t.testCategory === 'Pathology' || t.testCategory === 'Other'
    ).length
    return { total, blood, radiology, other }
  }, [tests])

  // ── Mutations ───────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      const res = await fetch('/api/lab-test-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: payload.testName,
          testCategory: payload.testCategory,
          fee: parseFloat(payload.fee) || 0,
          sampleType: payload.sampleType,
          turnaroundTime: payload.turnaroundTime,
          isActive: payload.isActive,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to create test')
      return data
    },
    onSuccess: () => {
      toast.success('Test added to your catalog')
      queryClient.invalidateQueries({ queryKey: ['lab-test-catalog'] })
      setDialogOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<FormState> }) => {
      const res = await fetch(`/api/lab-test-catalog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to update test')
      return data
    },
    onSuccess: (_data, vars) => {
      // Friendly toast depending on which field changed
      const wasActiveToggle =
        vars.payload.isActive !== undefined &&
        Object.keys(vars.payload).length === 1
      if (wasActiveToggle) {
        toast.success(
          vars.payload.isActive ? 'Test activated' : 'Test deactivated'
        )
      } else {
        toast.success('Test updated')
      }
      queryClient.invalidateQueries({ queryKey: ['lab-test-catalog'] })
      if (editingId === vars.id) setDialogOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lab-test-catalog/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to delete test')
      return data
    },
    onSuccess: () => {
      toast.success('Test removed from catalog')
      queryClient.invalidateQueries({ queryKey: ['lab-test-catalog'] })
      setDeleteId(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ── Dialog handlers ────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(t: LabTestCatalogItem) {
    setEditingId(t.id)
    setForm({
      testName: t.testName,
      testCategory: (t.testCategory as TestCategory) || 'Other',
      fee: String(t.fee ?? ''),
      sampleType: t.sampleType || '',
      turnaroundTime: t.turnaroundTime || '',
      isActive: t.isActive,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.testName.trim()) {
      toast.error('Test name is required')
      return
    }
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        payload: {
          testName: form.testName,
          testCategory: form.testCategory,
          fee: parseFloat(form.fee) || 0,
          sampleType: form.sampleType,
          turnaroundTime: form.turnaroundTime,
          isActive: form.isActive,
        },
      })
    } else {
      createMutation.mutate(form)
    }
  }

  function toggleActive(t: LabTestCatalogItem) {
    updateMutation.mutate({
      id: t.id,
      payload: { isActive: !t.isActive },
    })
  }

  function handleDelete() {
    if (!deleteId) return
    deleteMutation.mutate(deleteId)
  }

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const statCards = [
    {
      label: 'Total Tests',
      value: stats.total,
      icon: ListChecks,
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300',
    },
    {
      label: 'Blood Tests',
      value: stats.blood,
      icon: Droplet,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
    },
    {
      label: 'Radiology Tests',
      value: stats.radiology,
      icon: ScanLine,
      color:
        'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
    },
    {
      label: 'Other Tests',
      value: stats.other,
      icon: Boxes,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-teal-600" />
            Test Catalog
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the tests your lab offers + their fees
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Test
        </Button>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-tight">
                      {s.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="space-y-1.5">
                <Label
                  htmlFor="category-filter"
                  className="text-xs text-muted-foreground"
                >
                  Category
                </Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger id="category-filter" className="w-[170px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Blood">Blood</SelectItem>
                    <SelectItem value="Radiology">Radiology</SelectItem>
                    <SelectItem value="Pathology">Pathology</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="search-filter"
                  className="text-xs text-muted-foreground"
                >
                  <Search className="h-3 w-3 inline mr-1" />
                  Search
                </Label>
                <Input
                  id="search-filter"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search test name…"
                  className="w-[220px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Label
                htmlFor="active-only"
                className="text-xs text-muted-foreground"
              >
                Active Only
              </Label>
              <Switch
                id="active-only"
                checked={activeOnly}
                onCheckedChange={setActiveOnly}
              />
              {(categoryFilter !== 'all' || search.trim() || activeOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter('all')
                    setSearch('')
                    setActiveOnly(false)
                  }}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-600" />
            Tests
            {data && (
              <Badge variant="outline" className="ml-2 font-normal text-xs">
                {filteredTests.length}{' '}
                {filteredTests.length === 1 ? 'test' : 'tests'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16">
              <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">
                {tests.length === 0
                  ? 'No tests in your catalog yet'
                  : 'No tests match your filters'}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {tests.length === 0
                  ? 'Add your first test to start receiving orders via the test name suggestions.'
                  : 'Try adjusting the category, search, or active-only filter.'}
              </p>
              {tests.length === 0 && (
                <Button
                  onClick={openCreate}
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Test
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Test Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Sample Type
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Turnaround
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((t) => (
                    <TableRow key={t.id} className="border-slate-200">
                      <TableCell className="text-sm font-medium">
                        {t.testName}
                      </TableCell>
                      <TableCell>{categoryBadge(t.testCategory)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-700 dark:text-emerald-300">
                        {formatINR(t.fee)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {t.sampleType || '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {t.turnaroundTime || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {statusBadge(t.isActive)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                            onClick={() => openEdit(t)}
                            aria-label={`Edit ${t.testName}`}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={
                              t.isActive
                                ? 'h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                                : 'h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }
                            onClick={() => toggleActive(t)}
                            aria-label={
                              t.isActive
                                ? `Deactivate ${t.testName}`
                                : `Activate ${t.testName}`
                            }
                            title={
                              t.isActive ? 'Deactivate' : 'Activate'
                            }
                          >
                            {t.isActive ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => {
                              setDeleteId(t.id)
                              setDeleteName(t.testName)
                            }}
                            aria-label={`Delete ${t.testName}`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSaving) setDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-teal-600" />
              {editingId ? 'Edit Test' : 'Add New Test'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the test details below. Changes apply immediately to your catalog.'
                : 'Add a test to your lab catalog. Doctors will see these in test-name suggestions when placing orders.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="test-name">
                Test Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="test-name"
                value={form.testName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, testName: e.target.value }))
                }
                placeholder="e.g. Complete Blood Count (CBC)"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="test-category">
                Category <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.testCategory}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, testCategory: v as TestCategory }))
                }
              >
                <SelectTrigger id="test-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="test-fee">Fee (₹)</Label>
              <Input
                id="test-fee"
                type="number"
                min="0"
                step="1"
                value={form.fee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fee: e.target.value }))
                }
                placeholder="e.g. 350"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sample-type">Sample Type</Label>
              <Input
                id="sample-type"
                value={form.sampleType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sampleType: e.target.value }))
                }
                placeholder='e.g. "Whole blood", "Serum", "Urine"'
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="turnaround">Turnaround Time</Label>
              <Input
                id="turnaround"
                value={form.turnaroundTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, turnaroundTime: e.target.value }))
                }
                placeholder='e.g. "24 hours", "2 days", "Same day"'
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <Label htmlFor="is-active" className="text-sm font-medium">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive tests won&apos;t appear in doctor order suggestions
                </p>
              </div>
              <Switch
                id="is-active"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !form.testName.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSaving && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingId ? 'Save Changes' : 'Add Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!isSaving) {
            if (!open) {
              setDeleteId(null)
              setDeleteName('')
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test from catalog?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{' '}
              <span className="font-medium text-foreground">
                {deleteName}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSaving && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
