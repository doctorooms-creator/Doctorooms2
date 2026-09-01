'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuthStore } from '@/lib/auth-store'
import {
  Bell,
  MessageSquare,
  Smartphone,
  Mail,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Send,
  Loader2,
  FileText,
  Globe,
  Settings as SettingsIcon,
} from 'lucide-react'

// ============ Types ============

interface ChannelStatusResponse {
  sms: { configured: boolean; provider: string; envVar: string }
  whatsapp: { configured: boolean; provider: string; envVars: string[] }
}

interface NotificationLogEntry {
  id: string
  channel: string
  recipient: string
  content: string
  templateName: string
  status: string
  errorMessage: string
  sentAt: string | null
  createdAt: string
}

interface NotificationTemplate {
  id: string
  hospitalId: string | null
  isGlobal: boolean
  eventType: string
  channel: string
  templateName: string
  templateBody: string
  senderId: string
  whatsappTemplateId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============ Constants ============

const EVENT_TYPES = [
  { value: 'booking_confirmed', label: 'Booking Confirmed', vars: ['patientName', 'doctorName', 'date', 'time', 'hospitalName'] },
  { value: 'consultation_started', label: 'Consultation Started', vars: ['patientName', 'doctorName', 'tokenNo', 'hospitalName'] },
  { value: 'vital_critical', label: 'Vital Critical', vars: ['patientName', 'vitalType', 'vitalValue', 'wardName', 'bedNo'] },
  { value: 'lab_result_ready', label: 'Lab Result Ready', vars: ['patientName', 'testName', 'hospitalName'] },
  { value: 'bill_generated', label: 'Bill Generated', vars: ['patientName', 'billNo', 'amount', 'hospitalName'] },
  { value: 'payment_received', label: 'Payment Received', vars: ['patientName', 'amount', 'receiptNo', 'hospitalName'] },
  { value: 'discharge_advised', label: 'Discharge Advised', vars: ['patientName', 'doctorName', 'hospitalName'] },
  { value: 'appointment_reminder', label: 'Appointment Reminder', vars: ['patientName', 'doctorName', 'date', 'time', 'hospitalName'] },
] as const

const CHANNELS = [
  { value: 'SMS', label: 'SMS', icon: Smartphone },
  { value: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'Email', label: 'Email', icon: Mail },
] as const

// ============ Helpers ============

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Sent':
    case 'Delivered':
      return (
        <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-3 w-3 mr-1" /> {status}
        </Badge>
      )
    case 'Failed':
      return (
        <Badge variant="outline" className="border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/30">
          <XCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>
      )
    case 'Queued':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <Loader2 className="h-3 w-3 mr-1" /> Queued
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getChannelBadge(channel: string) {
  const cfg = CHANNELS.find((c) => c.value === channel)
  const Icon = cfg?.icon ?? Bell
  const colorClass =
    channel === 'SMS'
      ? 'border-teal-500 text-teal-700 bg-teal-50 dark:bg-teal-950/30'
      : channel === 'WhatsApp'
      ? 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
      : channel === 'Email'
      ? 'border-violet-500 text-violet-700 bg-violet-50 dark:bg-violet-950/30'
      : ''
  return (
    <Badge variant="outline" className={colorClass}>
      <Icon className="h-3 w-3 mr-1" /> {channel}
    </Badge>
  )
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

// ============ Component ============

export default function NotificationSettingsClient() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [tab, setTab] = useState('channels')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
            <Bell className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Notification Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure SMS / WhatsApp channels, manage templates, and test delivery
            </p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
          <TabsTrigger value="channels"><Smartphone className="h-4 w-4" /> Channels</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-4 w-4" /> Templates</TabsTrigger>
          <TabsTrigger value="test"><Send className="h-4 w-4" /> Test Send</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-4">
          <ChannelsTab />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="test" className="mt-4">
          <TestSendTab defaultPhone={user?.mobileNo || ''} onSent={() => {
            void queryClient.invalidateQueries({ queryKey: ['notification-logs'] })
          }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Tab 1: Channels ────────────────────────────────────────────────

function ChannelsTab() {
  const queryClient = useQueryClient()

  const { data: status, isLoading: statusLoading, refetch: refetchStatus, isFetching: statusFetching } = useQuery<ChannelStatusResponse>({
    queryKey: ['notification-channel-status'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/channel-status')
      if (!res.ok) throw new Error('Failed to load channel status')
      return res.json()
    },
  })

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs, isFetching: logsFetching } = useQuery<{ logs: NotificationLogEntry[] }>({
    queryKey: ['notification-logs'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/logs?limit=10')
      if (!res.ok) throw new Error('Failed to load notification logs')
      return res.json()
    },
  })

  const handleRefresh = () => {
    void refetchStatus()
    void refetchLogs()
    void queryClient.invalidateQueries({ queryKey: ['notification-logs'] })
    toast.success('Status refreshed')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={statusFetching || logsFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${(statusFetching || logsFetching) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Channel status cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChannelCard
          title="SMS Gateway"
          description="Transactional SMS via MSG91"
          icon={<Smartphone className="h-5 w-5 text-teal-600" />}
          loading={statusLoading}
          configured={status?.sms.configured}
          envVars={['MSG91_API_KEY']}
          provider="MSG91"
        />
        <ChannelCard
          title="WhatsApp Gateway"
          description="WhatsApp Business messages via Gupshup"
          icon={<MessageSquare className="h-5 w-5 text-teal-600" />}
          loading={statusLoading}
          configured={status?.whatsapp.configured}
          envVars={['GUPSHUP_API_KEY', 'GUPSHUP_SOURCE_NUMBER']}
          provider="Gupshup"
        />
      </div>

      {/* Env config note */}
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
        <div className="flex gap-3">
          <SettingsIcon className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-teal-900 dark:text-teal-100">Environment Configuration</p>
            <p className="text-teal-700 dark:text-teal-300 text-xs">
              Configure <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 rounded">MSG91_API_KEY</code> and{' '}
              <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 rounded">GUPSHUP_API_KEY</code>{' '}
              in your <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 rounded">.env</code> file.
              Restart the server after editing environment variables.
            </p>
          </div>
        </div>
      </div>

      {/* Recent logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-teal-600" />
            Recent Notification Logs
          </CardTitle>
          <CardDescription>Last 10 notifications sent from your hospital</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {logsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !logsData?.logs || logsData.logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No notifications sent yet</p>
              <p className="text-xs mt-1">Triggered events will appear here</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Date</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[160px]">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>{getChannelBadge(log.channel)}</TableCell>
                      <TableCell className="text-sm font-mono">{log.recipient || '—'}</TableCell>
                      <TableCell className="text-sm">{log.templateName || '—'}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-xs text-rose-600 dark:text-rose-400">
                        {log.errorMessage ? truncate(log.errorMessage, 60) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ChannelCard({
  title,
  description,
  icon,
  loading,
  configured,
  envVars,
  provider,
}: {
  title: string
  description: string
  icon: React.ReactNode
  loading: boolean
  configured: boolean | undefined
  envVars: string[]
  provider: string
}) {
  return (
    <Card className={configured ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : configured ? (
            <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-3 w-3 mr-1" /> Not Configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Provider</span>
          <span className="font-medium">{provider}</span>
        </div>
        <Separator />
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Required environment variables</span>
          <div className="flex flex-wrap gap-2">
            {envVars.map((v) => (
              <code
                key={v}
                className="font-mono text-xs bg-muted px-2 py-1 rounded border"
              >
                {v}
              </code>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Tab 2: Templates ───────────────────────────────────────────────

interface TemplateFormState {
  eventType: string
  channel: string
  templateName: string
  templateBody: string
  senderId: string
  whatsappTemplateId: string
  isActive: boolean
}

const EMPTY_FORM: TemplateFormState = {
  eventType: 'booking_confirmed',
  channel: 'SMS',
  templateName: '',
  templateBody: '',
  senderId: 'DOCTRM',
  whatsappTemplateId: '',
  isActive: true,
}

function TemplatesTab() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: tplData, isLoading, refetch, isFetching } = useQuery<{ templates: NotificationTemplate[] }>({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/templates')
      if (!res.ok) throw new Error('Failed to load templates')
      return res.json()
    },
  })

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (t: NotificationTemplate) => {
    setForm({
      eventType: t.eventType,
      channel: t.channel,
      templateName: t.templateName,
      templateBody: t.templateBody,
      senderId: t.senderId || 'DOCTRM',
      whatsappTemplateId: t.whatsappTemplateId || '',
      isActive: t.isActive,
    })
    setEditingId(t.id)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.templateName.trim()) {
      toast.error('Template name is required')
      return
    }
    if (!form.templateBody.trim()) {
      toast.error('Template body is required')
      return
    }
    setSubmitting(true)
    try {
      const url = editingId
        ? `/api/notifications/templates/${editingId}`
        : '/api/notifications/templates'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || `Failed to ${editingId ? 'update' : 'create'} template`)
        return
      }
      toast.success(editingId ? 'Template updated' : 'Template created')
      setDialogOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (t: NotificationTemplate) => {
    // Optimistic update
    const prev = tplData?.templates
    if (prev) {
      queryClient.setQueryData(['notification-templates'], {
        templates: prev.map((x) => x.id === t.id ? { ...x, isActive: !t.isActive } : x),
      })
    }
    try {
      const res = await fetch(`/api/notifications/templates/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !t.isActive }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to toggle template')
        // Revert
        void refetch()
      }
    } catch {
      toast.error('Network error')
      void refetch()
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/notifications/templates/${deleteId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete template')
        return
      }
      toast.success('Template deleted')
      setDeleteId(null)
      void queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(false)
    }
  }

  const templates = useMemo(() => tplData?.templates ?? [], [tplData])

  const availableVars = useMemo(() => {
    const ev = EVENT_TYPES.find((e) => e.value === form.eventType)
    return ev?.vars ?? []
  }, [form.eventType])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Notification Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage message templates for each event type and channel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No notification templates yet</p>
              <p className="text-xs mt-1">Click "New Template" to create one</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y">
              {templates.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{t.templateName}</span>
                        {getChannelBadge(t.channel)}
                        <Badge variant="outline" className="border-teal-500 text-teal-700 bg-teal-50 dark:bg-teal-950/30">
                          {EVENT_TYPES.find((e) => e.value === t.eventType)?.label ?? t.eventType}
                        </Badge>
                        {t.isGlobal && (
                          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                            <Globe className="h-3 w-3 mr-1" /> Global
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                        {t.templateBody}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>Sender: <code className="font-mono">{t.senderId || 'DOCTRM'}</code></span>
                        {t.whatsappTemplateId && (
                          <span>WA ID: <code className="font-mono">{t.whatsappTemplateId}</code></span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={t.isActive}
                          onCheckedChange={() => handleToggleActive(t)}
                          disabled={t.isGlobal}
                          aria-label="Toggle template active"
                        />
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(t)}
                        className="h-8 w-8"
                        aria-label="Edit template"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!t.isGlobal && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(t.id)}
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          aria-label="Delete template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Template' : 'New Notification Template'}</DialogTitle>
            <DialogDescription>
              Define the message body with{' '}
              <code className="font-mono text-xs bg-muted px-1 rounded">{'{{variables}}'}</code>{' '}
              placeholders that will be replaced when the event fires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="event-type">Event Type</Label>
                <Select
                  value={form.eventType}
                  onValueChange={(v) => setForm({ ...form, eventType: v })}
                >
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="channel">Channel</Label>
                <Select
                  value={form.channel}
                  onValueChange={(v) => setForm({ ...form, channel: v })}
                >
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g. Booking confirmation SMS"
                value={form.templateName}
                onChange={(e) => setForm({ ...form, templateName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="template-body">Template Body</Label>
                <span className="text-[10px] text-muted-foreground">
                  {form.templateBody.length} chars
                </span>
              </div>
              <Textarea
                id="template-body"
                rows={5}
                placeholder={
                  availableVars.length
                    ? `Dear {{${availableVars[0]}}}, your appointment with {{${availableVars[1]}}} is confirmed for {{${availableVars[2] || 'date'}}}.`
                    : 'Type your message here. Use {{variable}} placeholders.'
                }
                value={form.templateBody}
                onChange={(e) => setForm({ ...form, templateBody: e.target.value })}
                className="font-mono text-sm"
              />
              {availableVars.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground self-center">Available vars:</span>
                  {availableVars.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, templateBody: `${form.templateBody}{{${v}}}` })}
                      className="font-mono text-[10px] bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded px-1.5 py-0.5 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sender-id">Sender ID</Label>
                <Input
                  id="sender-id"
                  placeholder="DOCTRM"
                  value={form.senderId}
                  onChange={(e) => setForm({ ...form, senderId: e.target.value })}
                  maxLength={6}
                />
                <p className="text-[10px] text-muted-foreground">6-character sender ID (SMS)</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wa-id">WhatsApp Template ID</Label>
                <Input
                  id="wa-id"
                  placeholder="optional"
                  value={form.whatsappTemplateId}
                  onChange={(e) => setForm({ ...form, whatsappTemplateId: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground">Gupshup template ID (WhatsApp only)</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
              <div>
                <Label htmlFor="active-switch" className="text-sm font-medium cursor-pointer">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">Inactive templates will not be sent</p>
              </div>
              <Switch
                id="active-switch"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The template will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Tab 3: Test Send ───────────────────────────────────────────────

function TestSendTab({ defaultPhone, onSent }: { defaultPhone: string; onSent: () => void }) {
  const [phone, setPhone] = useState(defaultPhone)
  const [message, setMessage] = useState('Test message from Doctorooms — notification system is working.')
  const [sending, setSending] = useState(false)

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Send failed')
      }
      return data as { success: boolean; error?: string }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Test SMS sent', {
          description: `Recipient: ${phone}`,
        })
        onSent()
      } else {
        toast.error('SMS send failed', {
          description: data.error || 'Unknown error',
        })
      }
    },
    onError: (err: Error) => {
      toast.error('SMS send failed', { description: err.message })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      toast.error('Phone number is required')
      return
    }
    if (!message.trim()) {
      toast.error('Message is required')
      return
    }
    setSending(true)
    sendMutation.mutate(undefined, {
      onSettled: () => setSending(false),
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-teal-600" />
            Send Test SMS
          </CardTitle>
          <CardDescription>
            Send a one-off SMS to verify your MSG91 configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Default: your hospital&apos;s contact number
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">Message</Label>
                <span className="text-[10px] text-muted-foreground">{message.length} chars</span>
              </div>
              <Textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Test SMS</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-teal-600" />
            How It Works
          </CardTitle>
          <CardDescription>What happens when you click "Send Test SMS"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0">1</span>
            <p>The server validates your phone number and message, then calls MSG91&apos;s transactional SMS API.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0">2</span>
            <p>The result is recorded as a row in <code className="font-mono text-xs bg-muted px-1 rounded">NotificationLog</code> with status <span className="text-emerald-600">Sent</span> or <span className="text-rose-600">Failed</span>.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0">3</span>
            <p>Switch to the <strong>Channels</strong> tab to see this send appear in the recent logs table.</p>
          </div>
          <Separator />
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Test sends use real SMS credits. Each message is billed at MSG91&apos;s transactional rate.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
