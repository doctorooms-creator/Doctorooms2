'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  FlaskConical,
  PlusCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Inbox,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ─── Types ───────────────────────────────────────────────────────────────

interface Patient {
  id: string
  name: string
  gender?: string
  mobileNo?: string
}

interface DoctorUser {
  id: string
  name: string
  specialization?: string
}

interface Doctor {
  user: DoctorUser
}

interface OrderRow {
  id: string
  orderNo: string
  testName: string
  testType: string
  testFee: number
  commissionPercent: number
  status: string
  urgency: string
  notes?: string
  orderedAt: string
  patient: Patient
  doctor: Doctor
}

type OrdersResponse = { orders: OrderRow[] }

// ─── Helpers ──────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case 'Ordered':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 dark:bg-amber-950/50 dark:text-amber-400">
          Ordered
        </Badge>
      )
    case 'InProgress':
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 dark:bg-violet-950/50 dark:text-violet-400">
          In Progress
        </Badge>
      )
    case 'Completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 dark:bg-emerald-950/50 dark:text-emerald-400">
          Completed
        </Badge>
      )
    case 'Cancelled':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-950/50 dark:text-rose-400">
          Cancelled
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function urgencyBadge(urgency: string) {
  if (urgency === 'Urgent') {
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-950/50 dark:text-rose-400">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Urgent
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
      Normal
    </Badge>
  )
}

function formatDateTime(d: string) {
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Component ────────────────────────────────────────────────────────────

export default function IncomingOrdersClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading, refetch, isFetching } = useQuery<OrdersResponse>({
    queryKey: ['lab-incoming-orders'],
    queryFn: async () => {
      const res = await fetch('/api/external-test-orders')
      if (!res.ok) throw new Error('Failed to load incoming orders')
      return res.json()
    },
    refetchInterval: 30000,
  })

  const allOrders = data?.orders ?? []

  const counts = useMemo(() => {
    return {
      total: allOrders.length,
      new: allOrders.filter((o) => o.status === 'Ordered').length,
      inProgress: allOrders.filter((o) => o.status === 'InProgress').length,
      completed: allOrders.filter((o) => o.status === 'Completed').length,
      cancelled: allOrders.filter((o) => o.status === 'Cancelled').length,
    }
  }, [allOrders])

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return allOrders
    if (activeTab === 'new') return allOrders.filter((o) => o.status === 'Ordered')
    if (activeTab === 'in-progress') return allOrders.filter((o) => o.status === 'InProgress')
    if (activeTab === 'completed') return allOrders.filter((o) => o.status === 'Completed')
    if (activeTab === 'cancelled') return allOrders.filter((o) => o.status === 'Cancelled')
    return allOrders
  }, [activeTab, allOrders])

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/external-test-orders/${id}/accept`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to accept order')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Order accepted. Status now In Progress.')
      queryClient.invalidateQueries({ queryKey: ['lab-incoming-orders'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/external-test-orders/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to reject order')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Order rejected.')
      queryClient.invalidateQueries({ queryKey: ['lab-incoming-orders'] })
      setRejectId(null)
      setRejectReason('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function getActions(order: OrderRow) {
    if (order.status === 'Ordered') {
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            disabled={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate(order.id)}
          >
            {acceptMutation.isPending && acceptMutation.variables === order.id ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
            onClick={() => {
              setRejectId(order.id)
              setRejectReason('')
            }}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Reject
          </Button>
        </div>
      )
    }
    if (order.status === 'InProgress') {
      return (
        <Button
          size="sm"
          className="h-7 px-2 text-xs bg-violet-600 hover:bg-violet-700"
          onClick={() => router.push(`/dashboard/lab-technician/orders/${order.id}`)}
        >
          <PlusCircle className="mr-1 h-3 w-3" />
          Upload Report
        </Button>
      )
    }
    if (order.status === 'Completed') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={() => router.push(`/dashboard/lab-technician/orders/${order.id}`)}
        >
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>
      )
    }
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const statCards = [
    { label: 'Total Orders', value: counts.total, icon: ClipboardList, color: 'bg-teal-50 text-teal-600' },
    { label: 'New', value: counts.new, icon: Inbox, color: 'bg-amber-50 text-amber-600' },
    { label: 'In Progress', value: counts.inProgress, icon: FlaskConical, color: 'bg-violet-50 text-violet-600' },
    { label: 'Completed', value: counts.completed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Incoming Test Orders</h1>
          <p className="text-sm text-muted-foreground">
            Accept, reject and upload reports for orders routed to your lab
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-1 h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-tight">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-1.5">
            All ({counts.total})
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-1.5">
            New ({counts.new})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-1.5">
            In Progress ({counts.inProgress})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            Completed ({counts.completed})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-1.5">
            Cancelled ({counts.cancelled})
          </TabsTrigger>
        </TabsList>

        {/* Orders Table */}
        <Card className="mt-4 border-slate-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No orders in this view</p>
                <p className="text-xs text-muted-foreground mt-1">
                  New test orders routed to your lab will appear here
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 bg-muted/30">
                      <TableHead className="w-[140px]">Order No</TableHead>
                      <TableHead className="min-w-[160px]">Patient</TableHead>
                      <TableHead className="hidden md:table-cell">Gender</TableHead>
                      <TableHead className="min-w-[180px]">Test Name</TableHead>
                      <TableHead className="hidden lg:table-cell">Test Type</TableHead>
                      <TableHead className="hidden md:table-cell">Doctor</TableHead>
                      <TableHead className="hidden md:table-cell">Urgency</TableHead>
                      <TableHead className="hidden lg:table-cell">Ordered At</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-slate-200">
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {order.orderNo?.slice(-8) || '—'}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 text-left text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline"
                              >
                                <UserIcon className="h-3 w-3 text-muted-foreground" />
                                {order.patient?.name || 'Unknown'}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">{order.patient?.name}</p>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <p>
                                    <span className="font-medium text-foreground">Gender:</span>{' '}
                                    {order.patient?.gender || '—'}
                                  </p>
                                  <p>
                                    <span className="font-medium text-foreground">Mobile:</span>{' '}
                                    {order.patient?.mobileNo || '—'}
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {order.patient?.gender || '—'}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {order.testName || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {order.testType || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          <div>
                            <p className="text-sm">{order.doctor?.user?.name || '—'}</p>
                            {order.doctor?.specialization && (
                              <p className="text-xs text-muted-foreground">
                                {order.doctor.specialization}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {urgencyBadge(order.urgency)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          <div>
                            <p>{timeAgo(order.orderedAt)}</p>
                            <p className="text-[10px] opacity-70">
                              {formatDateTime(order.orderedAt)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {statusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-right">{getActions(order)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Reject Dialog */}
      <AlertDialog
        open={!!rejectId}
        onOpenChange={(open) => {
          if (!open) {
            setRejectId(null)
            setRejectReason('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this test order?</AlertDialogTitle>
            <AlertDialogDescription>
              The order will be marked as Cancelled. The patient and doctor will be notified.
              Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              Reason
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Required equipment unavailable, sample cannot be processed, etc."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={rejectMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                if (rejectId) {
                  rejectMutation.mutate({ id: rejectId, reason: rejectReason })
                }
              }}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
