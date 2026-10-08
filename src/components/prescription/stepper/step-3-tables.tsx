'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Grid3X3, Table2, X, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { usePrescriptionStore, type TableData } from '@/lib/prescription-store'
import { saveRxSection, patchRxCache, RX_DATA_STALE, rxDataKey } from '@/lib/rx-save'

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function emptyCellKey(r: number, c: number) {
  return `${r}-${c}`
}

export function Step3Tables() {
  const prescriptionId = usePrescriptionStore((s) => s.prescriptionId)
  const tables = usePrescriptionStore((s) => s.tables)
  const setTables = usePrescriptionStore((s) => s.setTables)
  const addTable = usePrescriptionStore((s) => s.addTable)
  const removeTable = usePrescriptionStore((s) => s.removeTable)
  const updateTable = usePrescriptionStore((s) => s.updateTable)
  const isSaving = usePrescriptionStore((s) => s.isSaving)
  const setIsSaving = usePrescriptionStore((s) => s.setIsSaving)
  const markStepCompleted = usePrescriptionStore((s) => s.markStepCompleted)
  const goToNext = usePrescriptionStore((s) => s.goToNext)
  const goToPrev = usePrescriptionStore((s) => s.goToPrev)
  const queryClient = useQueryClient()

  const [templateId, setTemplateId] = useState('')
  // Tracks whether saved tables are still being fetched from the prescription
  // (draft resume). While true, the step shows skeletons instead of an empty
  // canvas so the doctor never thinks their saved tables vanished.
  const [loadingExisting, setLoadingExisting] = useState(true)

  // Fetch table templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['rx-table-templates'],
    staleTime: 5 * 60 * 1000, // P4-F
    queryFn: () =>
      fetch('/api/dashboard/doctor/prescription-settings/table-templates?status=Active').then((r) => r.json()),
  })

  const templates = (templatesData?.templates || []) as Array<{
    id: string
    name: string
    rows: number
    cols: number
    headerLabel: string
    colsLabel: string
    footerLabel: string
    extraLabel: string
  }>

  // Load existing tables from prescription
  // P4-F: reads through the SHARED query cache key — deduped across steps
  // (was: a raw fetch per step mount). The tables.length > 0 guard keeps
  // unsaved in-progress tables from being clobbered. P4-G: staleTime +
  // cache PATCHES on save keep it fresh with zero refetches.
  const { data: rxData } = useQuery<{ prescription?: { diagnosisTables?: Array<Record<string, unknown>> } }>({
    queryKey: rxDataKey(prescriptionId),
    queryFn: () => fetch(`/api/prescription/${prescriptionId}`).then((r) => r.json()),
    enabled: !!prescriptionId,
    staleTime: RX_DATA_STALE,
  })

  useEffect(() => {
    if (!prescriptionId) {
      setLoadingExisting(false)
      return
    }
    if (tables.length > 0) {
      setLoadingExisting(false)
      return
    }
    // Full Rx still loading — keep the skeleton up.
    if (!rxData) return
    const dt = rxData?.prescription?.diagnosisTables || []
    if (dt.length === 0) {
      setLoadingExisting(false)
      return
    }
    const parsed: TableData[] = dt.map((t: Record<string, unknown>) => {
      let headerLabel: string[] = []
      let colsLabel: string[] = []
      let footerLabel: string[] = []
      try { headerLabel = JSON.parse(String(t.headerLabel || '[]')) } catch { /* empty */ }
      try { colsLabel = JSON.parse(String(t.colsLabel || '[]')) } catch { /* empty */ }
      try { footerLabel = JSON.parse(String(t.footerLabel || '[]')) } catch { /* empty */ }

      // Saved cell values — JSON object keyed "row-col" (e.g. "0-1").
      // Legacy rows may hold "[]" (array default); only accept objects.
      let savedCells: Record<string, string> = {}
      try {
        const parsedCells = JSON.parse(String(t.cellValues || '{}'))
        if (parsedCells && typeof parsedCells === 'object' && !Array.isArray(parsedCells)) {
          savedCells = parsedCells as Record<string, string>
        }
      } catch { /* empty */ }

      const cellValues: Record<string, string> = {}
      const rows = Number(t.rows) || 1
      const cols = Number(t.cols) || 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = emptyCellKey(r, c)
          cellValues[key] = typeof savedCells[key] === 'string' ? savedCells[key] : ''
        }
      }

      return {
        id: String(t.id),
        templateId: String(t.templateId || ''),
        name: '',
        rows,
        cols,
        headerLabel,
        colsLabel,
        cellValues,
        footerLabel,
        extraLabel: String(t.extraLabel || ''),
      }
    })
    setTables(parsed)
    setLoadingExisting(false)
  }, [prescriptionId, tables.length, rxData, setTables])

  const handleAddEmpty = () => {
    addTable({
      id: generateId(),
      name: 'Custom Table',
      rows: 3,
      cols: 2,
      headerLabel: ['Parameter', 'Value'],
      colsLabel: [],
      cellValues: {},
      footerLabel: [],
      extraLabel: '',
    })
  }

  const handleAddFromTemplate = () => {
    if (!templateId) return
    const tmpl = templates.find((t) => t.id === templateId)
    if (!tmpl) return
    let headerLabel: string[] = []
    let colsLabel: string[] = []
    let footerLabel: string[] = []
    try { headerLabel = JSON.parse(tmpl.headerLabel || '[]') } catch { /* empty */ }
    try { colsLabel = JSON.parse(tmpl.colsLabel || '[]') } catch { /* empty */ }
    try { footerLabel = JSON.parse(tmpl.footerLabel || '[]') } catch { /* empty */ }

    const cellValues: Record<string, string> = {}
    for (let r = 0; r < tmpl.rows; r++) {
      for (let c = 0; c < tmpl.cols; c++) {
        cellValues[emptyCellKey(r, c)] = ''
      }
    }

    addTable({
      id: generateId(),
      templateId: tmpl.id,
      name: tmpl.name,
      rows: tmpl.rows,
      cols: tmpl.cols,
      headerLabel,
      colsLabel,
      cellValues,
      footerLabel,
      extraLabel: tmpl.extraLabel,
    })
    setTemplateId('')
    toast.success(`Table "${tmpl.name}" added`)
  }

  const updateCell = (tableIdx: number, key: string, value: string) => {
    const table = tables[tableIdx]
    if (!table) return
    const newCells = { ...table.cellValues, [key]: value }
    updateTable(tableIdx, { cellValues: newCells })
  }

  const addRow = (tableIdx: number) => {
    const table = tables[tableIdx]
    if (!table) return
    const newRows = table.rows + 1
    const newCells = { ...table.cellValues }
    for (let c = 0; c < table.cols; c++) {
      newCells[emptyCellKey(newRows - 1, c)] = ''
    }
    const newColsLabel = [...table.colsLabel, '']
    updateTable(tableIdx, { rows: newRows, cellValues: newCells, colsLabel: newColsLabel })
  }

  const removeRow = (tableIdx: number) => {
    const table = tables[tableIdx]
    if (!table || table.rows <= 1) return
    const newRows = table.rows - 1
    const newCells = { ...table.cellValues }
    for (let c = 0; c < table.cols; c++) {
      delete newCells[emptyCellKey(newRows, c)]
    }
    const newColsLabel = table.colsLabel.slice(0, -1)
    updateTable(tableIdx, { rows: newRows, cellValues: newCells, colsLabel: newColsLabel })
  }

  const addCol = (tableIdx: number) => {
    const table = tables[tableIdx]
    if (!table) return
    const newCols = table.cols + 1
    const newCells = { ...table.cellValues }
    const newHeaderLabel = [...table.headerLabel, '']
    for (let r = 0; r < table.rows; r++) {
      newCells[emptyCellKey(r, newCols - 1)] = ''
    }
    updateTable(tableIdx, { cols: newCols, cellValues: newCells, headerLabel: newHeaderLabel })
  }

  const removeCol = (tableIdx: number) => {
    const table = tables[tableIdx]
    if (!table || table.cols <= 1) return
    const newCols = table.cols - 1
    const newCells = { ...table.cellValues }
    const newHeaderLabel = table.headerLabel.slice(0, -1)
    for (let r = 0; r < table.rows; r++) {
      delete newCells[emptyCellKey(r, newCols)]
    }
    updateTable(tableIdx, { cols: newCols, cellValues: newCells, headerLabel: newHeaderLabel })
  }

  // Save mutation — P4-G: single transactional batch endpoint; saved rows
  // are PATCHED straight into the shared cache (no invalidation → no
  // full-Rx refetch behind the transition).
  const saveMutation = useMutation({
    mutationFn: () => saveRxSection(prescriptionId || '', { tables }),
    onSuccess: (res) => {
      patchRxCache(queryClient, prescriptionId, res)
      markStepCompleted(3)
      toast.success('Tables saved')
      goToNext()
    },
    onError: () => toast.error('Failed to save tables'),
  })

  const handleSave = () => {
    setIsSaving(true)
    saveMutation.mutate(undefined, { onSettled: () => setIsSaving(false) })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Add Table Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleAddEmpty} disabled={loadingExisting}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Empty Table
        </Button>
        <div className="flex items-center gap-2">
          {templatesLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="From Template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.length === 0 && <SelectItem value="none" disabled>No templates</SelectItem>}
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddFromTemplate}
            disabled={!templateId || templatesLoading}
          >
            <Table2 className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Saved tables loading skeleton (draft resume) — never show an empty
          canvas while the prescription fetch is still in flight */}
      {loadingExisting && tables.length === 0 && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-7 flex-1" />
                  <Skeleton className="h-7 flex-1" />
                  <Skeleton className="h-7 flex-1" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 flex-1" />
                  <Skeleton className="h-7 flex-1" />
                  <Skeleton className="h-7 flex-1" />
                </div>
              </div>
            </div>
          ))}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Grid3X3 className="h-3.5 w-3.5 animate-pulse text-teal-600 dark:text-teal-400" />
            Loading saved tables…
          </p>
        </div>
      )}

      {/* Tables */}
      <AnimatePresence mode="popLayout">
        {tables.map((table, tIdx) => (
          <motion.div
            key={table.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {table.name || `Table ${tIdx + 1}`}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addRow(tIdx)}>
                    <PlusCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(tIdx)} disabled={table.rows <= 1}>
                    <MinusCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addCol(tIdx)}>
                    <PlusCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCol(tIdx)} disabled={table.cols <= 1}>
                    <MinusCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => removeTable(tIdx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {table.extraLabel && (
                  <p className="text-xs font-medium mb-2 text-muted-foreground">{table.extraLabel}</p>
                )}
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {table.headerLabel.map((h, ci) => (
                        <th
                          key={ci}
                          className="border border-border bg-muted/50 px-2 py-1.5 text-left font-medium text-xs"
                        >
                          <Input
                            value={h}
                            onChange={(e) => {
                              const newH = [...table.headerLabel]
                              newH[ci] = e.target.value
                              updateTable(tIdx, { headerLabel: newH })
                            }}
                            className="h-6 text-xs bg-transparent border-0 p-0 focus-visible:ring-0"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: table.rows }).map((_, ri) => (
                      <tr key={ri}>
                        <td className="border border-border bg-muted/30 px-1 w-28">
                          <Input
                            value={table.colsLabel[ri] || ''}
                            onChange={(e) => {
                              const newL = [...table.colsLabel]
                              newL[ri] = e.target.value
                              updateTable(tIdx, { colsLabel: newL })
                            }}
                            className="h-7 text-xs bg-transparent border-0 p-1 focus-visible:ring-0"
                            placeholder="Row label"
                          />
                        </td>
                        {Array.from({ length: table.cols - 1 }).map((_, ci) => {
                          const colIdx = ci + 1
                          const key = emptyCellKey(ri, colIdx)
                          return (
                            <td key={ci} className="border border-border px-1">
                              <Input
                                value={table.cellValues[key] || ''}
                                onChange={(e) => updateCell(tIdx, key, e.target.value)}
                                className="h-7 text-xs bg-transparent border-0 p-1 focus-visible:ring-0"
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                  {table.footerLabel.length > 0 && (
                    <tfoot>
                      <tr>
                        <td
                          colSpan={table.cols}
                          className="border border-border bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground"
                        >
                          {table.footerLabel.map((f, fi) => (
                            <span key={fi}>{f}</span>
                          )).reduce((acc, elem, i) => {
                            return i === 0 ? [elem] : [...acc, ' | ', elem]
                          }, <></>)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {tables.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No tables added. Add an empty table or use a template.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={goToPrev}>Back</Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || saveMutation.isPending}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isSaving || saveMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            <>Save & Continue</>
          )}
        </Button>
      </div>
    </motion.div>
  )
}