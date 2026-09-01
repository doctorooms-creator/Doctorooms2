'use client'

import { useId, useMemo, useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, ChevronDown, FlaskConical, Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────────────────────────────────────
// Public types (shared by step-7 and the order-tests dialog)
// ──────────────────────────────────────────────────────────────────────────

export interface CatalogTest {
  id: string
  testName: string
  testCategory: string
  fee: number
  sampleType?: string
  turnaroundTime?: string
}

export interface CatalogLab {
  id: string
  labName: string
  city?: string
  specializations?: string
  testsAvailable?: string
  catalog?: CatalogTest[]
}

export interface SelectedTest {
  key: string
  testName: string
  testType: string
  testFee: number
  labPartnerId: string
  labName: string
  turnaroundTime?: string
  custom?: boolean
}

export interface TestCatalogPickerProps {
  labs: CatalogLab[]
  selected: SelectedTest[]
  onChange: (next: SelectedTest[]) => void
}

// ──────────────────────────────────────────────────────────────────────────
// Internal types + helpers
// ──────────────────────────────────────────────────────────────────────────

/** One browsable row in the flattened test list. */
interface FlatTest {
  key: string // `${labId}:${testName.toLowerCase()}` — stable identity per lab+test
  labId: string
  labName: string
  testName: string
  testCategory: string // normalized: Blood | Radiology | Pathology | Other
  fee: number
  sampleType?: string
  turnaroundTime?: string
  fromCatalog: boolean
}

const CATEGORY_FILTERS = ['All', 'Blood', 'Radiology', 'Pathology', 'Other'] as const
type CategoryFilter = (typeof CATEGORY_FILTERS)[number]

/**
 * Parse a lab's testsAvailable field. The field is a free-form string in the
 * schema — it may be a JSON array ("[\"CBC\", \"LFT\"]") or a comma/newline
 * separated list ("CBC, LFT, X-Ray Chest"). We handle both gracefully.
 */
export function parseTestsAvailable(raw: string | undefined | null): string[] {
  if (!raw) return []
  const trimmed = raw.trim()
  if (!trimmed) return []
  // Try JSON parse first (the schema default is "[]")
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed
        .map((s) => String(s).trim())
        .filter(Boolean)
    }
  } catch {
    // not JSON — fall through to delimiter split
  }
  // Split by comma or newline
  return trimmed
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Normalize whatever category string the catalog returns to a known bucket. */
function normalizeCategory(raw: string | undefined | null): string {
  const c = (raw || '').trim().toLowerCase()
  if (c === 'blood') return 'Blood'
  if (c === 'radiology') return 'Radiology'
  if (c === 'pathology') return 'Pathology'
  return 'Other'
}

/**
 * Flatten all labs' catalogs into one browsable list.
 *
 * Merge strategy (per spec):
 * - Catalog rows are primary (only active rows are used when the flag exists).
 * - Labs with NO active catalog rows fall back to their legacy `testsAvailable`
 *   string (JSON array or comma/newline list) — those rows get fee 0 and
 *   category 'Other'.
 * - Dedup per lab by testName (case-insensitive); the catalog row always wins.
 */
function buildFlatTests(labs: CatalogLab[]): FlatTest[] {
  const rows: FlatTest[] = []
  for (const lab of labs) {
    if (!lab || !lab.id) continue
    const seen = new Set<string>()
    const catalog = Array.isArray(lab.catalog) ? lab.catalog : []
    for (const t of catalog) {
      if (!t || typeof t.testName !== 'string') continue
      // Defensive: the API may mark catalog rows inactive
      const inactive = (t as CatalogTest & { isActive?: boolean }).isActive === false
      if (inactive) continue
      const name = t.testName.trim()
      if (!name) continue
      const k = name.toLowerCase()
      if (seen.has(k)) continue // catalog row wins over an earlier catalog dupe
      seen.add(k)
      rows.push({
        key: `${lab.id}:${k}`,
        labId: lab.id,
        labName: lab.labName,
        testName: name,
        testCategory: normalizeCategory(t.testCategory),
        fee: Number(t.fee) || 0,
        sampleType: t.sampleType,
        turnaroundTime: t.turnaroundTime,
        fromCatalog: true,
      })
    }
    // Legacy fallback: no active catalog rows → derive from testsAvailable
    if (seen.size === 0) {
      for (const name of parseTestsAvailable(lab.testsAvailable)) {
        const k = name.toLowerCase()
        if (seen.has(k)) continue
        seen.add(k)
        rows.push({
          key: `${lab.id}:${k}`,
          labId: lab.id,
          labName: lab.labName,
          testName: name,
          testCategory: 'Other',
          fee: 0,
          fromCatalog: false,
        })
      }
    }
  }
  return rows
}

/** Lab badge colour, keyed off the test's category (palette-safe). */
function categoryBadgeClass(testCategory: string): string {
  switch (testCategory) {
    case 'Blood':
      return 'bg-teal-100 text-teal-700 hover:bg-teal-100 border-0 dark:bg-teal-950/40 dark:text-teal-400'
    case 'Radiology':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 dark:bg-amber-950/40 dark:text-amber-400'
    case 'Pathology':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 dark:bg-emerald-950/40 dark:text-emerald-400'
    default:
      return 'border-0' // secondary variant
  }
}

// ──────────────────────────────────────────────────────────────────────────
// TestCatalogPicker
// ──────────────────────────────────────────────────────────────────────────

export function TestCatalogPicker({ labs, selected, onChange }: TestCatalogPickerProps) {
  const uid = useId()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [labFilter, setLabFilter] = useState<string>('all')

  // Flatten labs → browsable rows (catalog first, legacy testsAvailable fallback)
  const allTests = useMemo(() => buildFlatTests(labs), [labs])

  const hasFilters = search.trim() !== '' || category !== 'All' || labFilter !== 'all'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allTests.filter((t) => {
      if (category !== 'All' && t.testCategory !== category) return false
      if (labFilter !== 'all' && t.labId !== labFilter) return false
      if (q && !`${t.testName} ${t.labName}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [allTests, category, labFilter, search])

  const isSelected = (key: string) => selected.some((s) => s.key === key)

  const toggle = (row: FlatTest) => {
    if (isSelected(row.key)) {
      onChange(selected.filter((s) => s.key !== row.key))
    } else {
      onChange([
        ...selected,
        {
          key: row.key,
          testName: row.testName,
          testType: row.testCategory,
          testFee: row.fee,
          labPartnerId: row.labId,
          labName: row.labName,
          turnaroundTime: row.turnaroundTime,
        },
      ])
    }
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setLabFilter('all')
  }

  // ── Empty state: no associated labs at all ──
  if (labs.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="font-medium text-foreground">No lab partners associated yet</p>
        <p className="mt-1">
          Associate labs from the{' '}
          <span className="font-medium text-foreground">My Lab Partners</span>{' '}
          page — their test catalogs will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Intro line + selected count */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Pick tests only — each test is auto-routed to its own lab.
        </p>
        {selected.length > 0 && (
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0 dark:bg-teal-950/40 dark:text-teal-400">
            {selected.length} selected
          </Badge>
        )}
      </div>

      {/* Filters (sticky-ish header area above the scroll list) */}
      <div className="space-y-2 pb-3 border-b">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests or labs…"
              aria-label="Search tests or labs"
              className="pl-9 pr-8 h-11"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={labFilter} onValueChange={setLabFilter}>
            <SelectTrigger aria-label="Filter by lab" className="h-11 w-full">
              <SelectValue placeholder="All labs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All labs</SelectItem>
              {labs.map((lab) => (
                <SelectItem key={lab.id} value={lab.id}>
                  {lab.labName}
                  {lab.city ? <span className="text-muted-foreground ml-1">· {lab.city}</span> : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {CATEGORY_FILTERS.map((c) => {
            const active = category === c
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className={cn(
                  'min-h-11 rounded-full border px-3.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-teal-600 bg-teal-600 text-white hover:bg-teal-700'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {/* Test list */}
      {allTests.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-foreground">No tests listed yet</p>
          <p className="mt-1">
            Your associated labs haven&apos;t published a test catalog. You can
            still add a custom test below.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-foreground">No tests match your filters</p>
          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 h-10">
            <X className="mr-1 h-3.5 w-3.5" /> Clear filters
          </Button>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1 pr-1">
          {filtered.map((row, idx) => {
            const checked = isSelected(row.key)
            const cbId = `${uid}-cb-${idx}`
            const metaParts = [
              row.testCategory,
              row.sampleType,
              row.turnaroundTime,
            ].filter(Boolean)
            return (
              <label
                key={row.key}
                htmlFor={cbId}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                  checked
                    ? 'border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/40'
                    : 'border-transparent hover:bg-muted/50'
                )}
              >
                <Checkbox
                  id={cbId}
                  checked={checked}
                  onCheckedChange={() => toggle(row)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium break-words">{row.testName}</span>
                    <Badge
                      variant={row.testCategory === 'Other' ? 'secondary' : 'default'}
                      className={cn('text-[10px] px-1.5 py-0 max-w-[160px]', categoryBadgeClass(row.testCategory))}
                    >
                      <span className="truncate">{row.labName}</span>
                    </Badge>
                  </div>
                  {metaParts.length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {metaParts.join(' · ')}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold shrink-0 tabular-nums',
                    row.fee === 0 && !row.fromCatalog ? 'text-muted-foreground' : ''
                  )}
                  title={row.fee === 0 && !row.fromCatalog ? 'Fee not set — use “Add custom test” to specify' : undefined}
                >
                  ₹{row.fee.toLocaleString('en-IN')}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// AddCustomTest — small collapsible fallback for tests not in any catalog.
// Shared by step-7 and the order-tests dialog.
// ──────────────────────────────────────────────────────────────────────────

export interface AddCustomTestProps {
  labs: CatalogLab[]
  /** Returns true when a row with this key is already selected (blocks dupes). */
  isDuplicate: (key: string) => boolean
  onAdd: (test: SelectedTest) => void
}

export function AddCustomTest({ labs, isDuplicate, onAdd }: AddCustomTestProps) {
  const uid = useId()
  const [open, setOpen] = useState(false)
  const [testName, setTestName] = useState('')
  const [testType, setTestType] = useState('Other')
  const [testFee, setTestFee] = useState('')
  const [labId, setLabId] = useState('')

  if (labs.length === 0) return null

  const handleAdd = () => {
    const name = testName.trim()
    if (!name) {
      toast.error('Enter a test name')
      return
    }
    if (!labId) {
      toast.error('Select a lab for this test')
      return
    }
    const lab = labs.find((l) => l.id === labId)
    if (!lab) return
    const key = `${labId}:${name.toLowerCase()}`
    if (isDuplicate(key)) {
      toast.error('This test is already added for that lab')
      return
    }
    onAdd({
      key,
      testName: name,
      testType,
      testFee: Number(testFee) || 0,
      labPartnerId: labId,
      labName: lab.labName,
      custom: true,
    })
    // Reset the form but keep the section open so several tests can be added
    setTestName('')
    setTestFee('')
    setTestType('Other')
    setLabId('')
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full border-dashed h-10">
          <Plus className="mr-1 h-4 w-4" />
          Add custom test (not in catalog)
          <ChevronDown
            className={cn('ml-auto h-4 w-4 transition-transform', open && 'rotate-180')}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end p-3 rounded-lg border border-border bg-card/50">
          <div className="col-span-2 sm:col-span-4 space-y-1">
            <label htmlFor={`${uid}-name`} className="text-xs text-muted-foreground">
              Test name
            </label>
            <Input
              id={`${uid}-name`}
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. D-Dimer"
              className="h-10"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor={`${uid}-type`} className="text-xs text-muted-foreground">
              Type
            </label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger id={`${uid}-type`} className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Blood">Blood</SelectItem>
                <SelectItem value="Radiology">Radiology</SelectItem>
                <SelectItem value="Pathology">Pathology</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor={`${uid}-fee`} className="text-xs text-muted-foreground">
              Fee (₹)
            </label>
            <Input
              id={`${uid}-fee`}
              type="number"
              min={0}
              value={testFee}
              onChange={(e) => setTestFee(e.target.value)}
              placeholder="0"
              className="h-10"
            />
          </div>
          <div className="col-span-2 sm:col-span-4 space-y-1">
            <label htmlFor={`${uid}-lab`} className="text-xs text-muted-foreground">
              Lab
            </label>
            <Select value={labId} onValueChange={setLabId}>
              <SelectTrigger id={`${uid}-lab`} className="h-10 w-full">
                <SelectValue placeholder="Select lab" />
              </SelectTrigger>
              <SelectContent>
                {labs.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id}>
                    {lab.labName}
                    {lab.city ? <span className="text-muted-foreground ml-1">· {lab.city}</span> : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={handleAdd} className="h-10 px-4 bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-1 h-4 w-4" />
            Add Test
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
