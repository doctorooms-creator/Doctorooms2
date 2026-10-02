'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ============ Types ============

interface InventoryItem {
  id: string
  name: string
  category: string
  genericName: string
  manufacturer: string
  batchNo: string
  expiryDate: string | null
  unit: string
  unitPrice: number
  sellingPrice: number
  currentStock: number
  minStockLevel: number
  maxStockLevel: number
  reorderQty: number
  hsnCode: string
  gstPercent: number
  storeLocation: string
  status: string
  lowStock: boolean
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  'Medicine',
  'Consumable',
  'Equipment',
  'Surgical',
  'PPE',
  'Lab Reagent',
  'Stationery',
  'Other',
]

const emptyForm = {
  name: '',
  category: 'Medicine',
  genericName: '',
  manufacturer: '',
  batchNo: '',
  expiryDate: '',
  unit: '',
  unitPrice: 0,
  sellingPrice: 0,
  minStockLevel: 10,
  maxStockLevel: 1000,
  reorderQty: 100,
  hsnCode: '',
  gstPercent: 0,
  storeLocation: '',
}

// ============ Component ============

export default function InventoryItemsClient() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  // Fetch items (API returns { data, page, limit, total, totalPages })
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['inventory-items', search, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
      params.set('status', 'Active')
      params.set('limit', '100')
      const res = await fetch(`/api/inventory-items?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load items')
      return res.json()
    },
  })

  // Active items for the table
  const activeItems: InventoryItem[] = useMemo(() => {
    return (itemsData?.data || []) as InventoryItem[]
  }, [itemsData])

  const totalItems: number = itemsData?.total || activeItems.length

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const res = await fetch('/api/inventory-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create item')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Inventory item created successfully')
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      closeDialog()
    },
    onError: (err) => toast.error(err.message),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof emptyForm }) => {
      const res = await fetch(`/api/inventory-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update item')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Inventory item updated successfully')
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      closeDialog()
    },
    onError: (err) => toast.error(err.message),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory-items/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete item')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Inventory item deactivated successfully')
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      setDeleteDialogOpen(false)
      setDeletingItem(null)
    },
    onError: (err) => toast.error(err.message),
  })

  const openCreateDialog = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      category: item.category,
      genericName: item.genericName,
      manufacturer: item.manufacturer,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      unit: item.unit,
      unitPrice: item.unitPrice,
      sellingPrice: item.sellingPrice,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      reorderQty: item.reorderQty,
      hsnCode: item.hsnCode,
      gstPercent: item.gstPercent,
      storeLocation: item.storeLocation,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const handleDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Items</h1>
          <p className="text-muted-foreground">Manage your hospital inventory item master</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!isLoading && totalItems > 0 && (
            <span className="hidden rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 sm:inline-flex dark:bg-teal-950/50 dark:text-teal-300">
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </span>
          )}
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, batch, manufacturer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : activeItems.length === 0 ? (
            <div className="m-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/50 py-16 text-center dark:border-teal-800 dark:bg-teal-950/20 sm:m-6">
              <div className="rounded-full bg-teal-100 p-3 dark:bg-teal-900/50">
                <Package className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-medium">No inventory items found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {search || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you are looking for.'
                  : 'Add your first inventory item to start tracking stock, batches and reorders.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Batch</TableHead>
                    <TableHead className="hidden lg:table-cell">Unit</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Min Stock</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {activeItems.map((item, index) => {
                      const isOutOfStock = item.currentStock <= 0
                      const isLow = item.lowStock && !isOutOfStock
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15, delay: index * 0.02 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell
                            className={cn(
                              // Left-edge indicator on the first cell (a tr border
                              // would be reset by the table's
                              // [&_tr:last-child]:border-0 rule, and tr box-shadows
                              // don't paint under border-collapse)
                              isOutOfStock &&
                                'border-l-4 border-l-rose-400 dark:border-l-rose-500',
                              isLow &&
                                'border-l-4 border-l-amber-400 dark:border-l-amber-500'
                            )}
                          >
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.genericName && (
                                <div className="text-xs text-muted-foreground">{item.genericName}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                              {item.category || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-muted-foreground">{item.batchNo || '—'}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{item.unit || '—'}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            ₹{item.unitPrice.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span
                              className={cn(
                                'font-medium',
                                isOutOfStock && 'font-semibold text-rose-600 dark:text-rose-400',
                                isLow && 'font-semibold text-amber-600 dark:text-amber-400'
                              )}
                            >
                              {item.currentStock}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right tabular-nums">
                            <span
                              className={cn(
                                'text-muted-foreground',
                                isLow && 'font-medium text-amber-600 dark:text-amber-400',
                                isOutOfStock && 'font-medium text-rose-600 dark:text-rose-400'
                              )}
                            >
                              {item.minStockLevel}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isOutOfStock ? (
                              <Badge className="border-transparent bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60">
                                Out
                              </Badge>
                            ) : isLow ? (
                              <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60">
                                Low
                              </Badge>
                            ) : (
                              <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60">
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(item)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeletingItem(item)
                                  setDeleteDialogOpen(true)
                                }}
                                className="h-8 w-8 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the inventory item details.' : 'Fill in the details to add a new inventory item.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paracetamol 500mg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="genericName">Generic Name</Label>
                <Input
                  id="genericName"
                  value={form.genericName}
                  onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                  placeholder="e.g. Acetaminophen"
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  placeholder="e.g. Cipla Ltd"
                />
              </div>
              <div>
                <Label htmlFor="batchNo">Batch No</Label>
                <Input
                  id="batchNo"
                  value={form.batchNo}
                  onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                  placeholder="e.g. BN2024-001"
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g. Tablet, Bottle, Box"
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={form.minStockLevel}
                  onChange={(e) => setForm({ ...form, minStockLevel: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  min="0"
                  value={form.maxStockLevel}
                  onChange={(e) => setForm({ ...form, maxStockLevel: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="reorderQty">Reorder Quantity</Label>
                <Input
                  id="reorderQty"
                  type="number"
                  min="0"
                  value={form.reorderQty}
                  onChange={(e) => setForm({ ...form, reorderQty: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  value={form.hsnCode}
                  onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                  placeholder="e.g. 30049099"
                />
              </div>
              <div>
                <Label htmlFor="gstPercent">GST %</Label>
                <Input
                  id="gstPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.gstPercent}
                  onChange={(e) => setForm({ ...form, gstPercent: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="storeLocation">Store Location</Label>
                <Input
                  id="storeLocation"
                  value={form.storeLocation}
                  onChange={(e) => setForm({ ...form, storeLocation: e.target.value })}
                  placeholder="e.g. Warehouse A, Shelf 3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate &ldquo;{deletingItem?.name}&rdquo;? This will set the item
              status to Inactive. You can reactivate it later by editing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
