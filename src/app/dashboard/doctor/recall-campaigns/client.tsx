'use client'

/**
 * Recall Campaigns (roadmap: dormant-patient WhatsApp recall, $0/mo).
 *
 * The doctor-side growth engine:
 *  - Step 1: pick the dormant window (30/60/90/180/custom days) → live
 *    audience preview (count + sample patients from the audience API).
 *  - Step 2: write the WhatsApp template with {{patient_name}} /
 *    {{doctor_name}} / {{clinic_name}} chips + live rendered preview.
 *  - Step 3: review → Create & Send (or save as draft). Send freezes the
 *    audience into per-patient wa.me links (no paid WhatsApp API — staff
 *    sends each via WhatsApp Web).
 *  - Results view: per-patient "Open WhatsApp" buttons + Copy all numbers +
 *    Download CSV.
 *
 * Plan gate (soft wall, lost-revenue convention): Free/Expired = audience
 * list capped at 5 + max 1 SENT campaign (teaser + first taste); Trialing /
 * Pro / Hospital = unlimited. Blocked sends render UpgradeWallDialog.
 */
import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Megaphone, Plus, Users, MessageCircle, Trash2, Send, Eye, Lock, Sparkles,
  RefreshCw, CheckCircle2, Copy, Download, ExternalLink, CalendarClock,
  Search, UserRound, AlertCircle, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { UpgradeWallDialog, UpgradeWallPayload } from '@/components/upgrade-wall-dialog'

// ─── Types (API contracts) ─────────────────────────────────────────────────
interface CampaignRow {
  id: string
  name: string
  template: string
  dormantDays: number
  status: 'DRAFT' | 'SENT'
  recipientCount: number
  createdAt: string
  sentAt: string | null
}

interface CampaignsData {
  campaigns: CampaignRow[]
  plan: { key: string; status: string; name: string }
  sentCampaignCount: number
  canSend: boolean
  gated: boolean
  upgrade: UpgradeWallPayload | null
}

interface AudiencePatient {
  patientId: string
  name: string
  phone: string
  lastVisit: string
  daysSince: number
  totalVisits: number
}

interface AudienceData {
  dormantDays: number
  count: number
  withoutPhone: number
  patients: AudiencePatient[]
  sampleSize: number
  listCapped: boolean
  gated: boolean
  canSend: boolean
  plan: { key: string; status: string; name: string }
  upgrade: UpgradeWallPayload | null
  context: { doctorName: string; clinicName: string }
}

interface RecipientRow {
  id: string
  patientId: string
  patientName: string
  phone: string
  whatsappUrl: string
  sentAt: string
}

interface CampaignDetail {
  campaign: CampaignRow & { recipients: RecipientRow[] }
}

// ─── Constants (mirror src/lib/recall.ts bounds) ───────────────────────────
const TEMPLATE_MIN = 10
const TEMPLATE_MAX = 600
const DORMANT_MIN = 7
const DORMANT_MAX = 365
const FREE_SENT_CAMPAIGN_LIMIT = 1
const DORMANT_PRESETS = [30, 60, 90, 180]

const PLACEHOLDER_CHIPS = [
  { token: '{{patient_name}}', label: 'Patient ka naam' },
  { token: '{{doctor_name}}', label: 'Aapka naam' },
  { token: '{{clinic_name}}', label: 'Clinic ka naam' },
]

const DEFAULT_TEMPLATE =
  'Namaste {{patient_name}} ji 🙏 — {{doctor_name}} ki taraf se yaad dilana. Aapki last visit kaafi time pe hui thi. Koi problem hai ya follow-up baaki hai to {{clinic_name}} mein appointment book kar lijiye. Swasth rahein!'

const dayLabel = (d: number) => (d >= 365 ? '1 saal' : d >= 30 ? `${Math.round(d / 30)} mahine` : `${d} din`)

/** Render the template locally for previews (server does the real render). */
function renderLocal(
  template: string,
  vars: { patientName: string; doctorName: string; clinicName: string }
) {
  return template
    .replace(/\{\{\s*patient_name\s*\}\}/gi, vars.patientName)
    .replace(/\{\{\s*doctor_name\s*\}\}/gi, vars.doctorName)
    .replace(/\{\{\s*clinic_name\s*\}\}/gi, vars.clinicName)
}

/** Decode the rendered message back out of a wa.me link (CSV column). */
function messageFromWhatsappUrl(url: string): string {
  try {
    const idx = url.indexOf('?text=')
    if (idx === -1) return ''
    return decodeURIComponent(url.slice(idx + 6))
  } catch {
    return ''
  }
}

function maskPhone(phone: string) {
  if (phone.length < 4) return phone
  return `${phone.slice(0, 2)}•••••${phone.slice(-3)}`
}

// ─── Page ──────────────────────────────────────────────────────────────────
export function RecallCampaignsClient() {
  const queryClient = useQueryClient()

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [dormantDays, setDormantDays] = useState(90)
  const [customDays, setCustomDays] = useState('')
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [campaignName, setCampaignName] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Dialogs
  const [resultsId, setResultsId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [wallOpen, setWallOpen] = useState(false)
  const [wallPayload, setWallPayload] = useState<UpgradeWallPayload | null>(null)
  const [walletSpendable, setWalletSpendable] = useState<number | null>(null)

  // ── Queries ──
  const campaignsQuery = useQuery<CampaignsData>({
    queryKey: ['recall-campaigns'],
    queryFn: async () => {
      const r = await fetch('/api/doctor/recall-campaigns')
      if (!r.ok) throw new Error('Campaigns load nahi hue')
      return r.json()
    },
  })

  const effectiveDays = customDays ? Math.max(DORMANT_MIN, Math.min(DORMANT_MAX, Number(customDays) || 0)) : dormantDays

  const audienceQuery = useQuery<AudienceData>({
    queryKey: ['recall-audience', effectiveDays],
    queryFn: async () => {
      const r = await fetch(`/api/doctor/recall-campaigns/audience?dormantDays=${effectiveDays}`)
      if (!r.ok) throw new Error('Audience load nahi hui')
      return r.json()
    },
    enabled: wizardOpen,
  })

  const resultsQuery = useQuery<CampaignDetail>({
    queryKey: ['recall-campaign-detail', resultsId],
    queryFn: async () => {
      const r = await fetch(`/api/doctor/recall-campaigns/${resultsId}`)
      if (!r.ok) throw new Error('Results load nahi hue')
      return r.json()
    },
    enabled: !!resultsId,
  })

  // ── Mutations ──
  const openWallWith = (payload: UpgradeWallPayload | null) => {
    if (!payload) return
    if (walletSpendable === null) {
      fetch('/api/referral/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setWalletSpendable(d?.wallet?.spendable ?? 0))
        .catch(() => setWalletSpendable(0))
    }
    setWallPayload(payload)
    setWallOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; template: string; dormantDays: number }) => {
      const r = await fetch('/api/doctor/recall-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Campaign create nahi hua')
      return d.campaign as CampaignRow
    },
  })

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/doctor/recall-campaigns/${id}/send`, { method: 'POST' })
      const d = await r.json()
      if (r.status === 402) {
        // Soft wall: structured upgrade payload the dialog renders
        return { blocked: true as const, upgrade: d.upgrade as UpgradeWallPayload | null }
      }
      if (!r.ok) throw new Error(d.error || 'Send fail hua')
      return { blocked: false as const, campaign: d.campaign as CampaignRow, recipientsCreated: d.recipientsCreated as number }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/doctor/recall-campaigns/${id}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Delete fail hua')
      return d
    },
    onSuccess: () => {
      toast.success('Draft delete ho gaya')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['recall-campaigns'] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Delete fail hua'),
  })

  // ── Wizard helpers ──
  const insertPlaceholder = (token: string) => {
    const el = textareaRef.current
    if (!el) {
      setTemplate((t) => t + token)
      return
    }
    const start = el.selectionStart ?? template.length
    const end = el.selectionEnd ?? template.length
    const next = template.slice(0, start) + token + template.slice(end)
    setTemplate(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const resetWizard = () => {
    setStep(1)
    setDormantDays(90)
    setCustomDays('')
    setTemplate(DEFAULT_TEMPLATE)
    setCampaignName('')
  }

  const templateLen = template.trim().length
  const templateValid = templateLen >= TEMPLATE_MIN && templateLen <= TEMPLATE_MAX

  const audience = audienceQuery.data
  const samplePatient = audience?.patients?.[0]
  const previewPatientName = samplePatient?.name || 'Suresh Kumar'
  const previewDoctorName = audience?.context?.doctorName || 'Dr. Sharma'
  const previewClinicName = audience?.context?.clinicName || 'Sharma Clinic'
  const renderedPreview = renderLocal(template, {
    patientName: previewPatientName,
    doctorName: previewDoctorName,
    clinicName: previewClinicName,
  })

  const sendBlockedForFree = !!audience?.gated && !audience?.canSend

  const handleCreateAndSend = async () => {
    const name = campaignName.trim() || `Recall — ${dayLabel(effectiveDays)} dormant`
    try {
      const campaign = await createMutation.mutateAsync({
        name,
        template: template.trim(),
        dormantDays: effectiveDays,
      })
      const result = await sendMutation.mutateAsync(campaign.id)
      if (result.blocked) {
        toast.error('Free plan mein 1 recall campaign milta hai')
        openWallWith(result.upgrade)
        queryClient.invalidateQueries({ queryKey: ['recall-campaigns'] })
        return
      }
      toast.success(`✅ ${result.recipientsCreated} patients ke WhatsApp links ready — Notify bhi ho gaya`)
      setWizardOpen(false)
      resetWizard()
      queryClient.invalidateQueries({ queryKey: ['recall-campaigns'] })
      setResultsId(result.campaign.id)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kuch galat ho gaya')
    }
  }

  const handleSaveDraft = async () => {
    const name = campaignName.trim() || `Recall — ${dayLabel(effectiveDays)} dormant`
    try {
      await createMutation.mutateAsync({ name, template: template.trim(), dormantDays: effectiveDays })
      toast.success('Draft save ho gaya — jab chahe Send karein')
      setWizardOpen(false)
      resetWizard()
      queryClient.invalidateQueries({ queryKey: ['recall-campaigns'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Draft save fail hua')
    }
  }

  const handleDirectSend = async (campaign: CampaignRow) => {
    const result = await sendMutation.mutateAsync(campaign.id)
    if (result.blocked) {
      toast.error('Free plan mein 1 recall campaign milta hai')
      openWallWith(result.upgrade)
      return
    }
    toast.success(`✅ ${result.recipientsCreated} patients ke WhatsApp links ready`)
    queryClient.invalidateQueries({ queryKey: ['recall-campaigns'] })
    setResultsId(result.campaign.id)
  }

  // ── Results helpers ($0 flow: staff sends via WhatsApp Web manually) ──
  const recipients = resultsQuery.data?.campaign?.recipients ?? []

  const copyAllNumbers = async () => {
    if (recipients.length === 0) return
    const text = recipients.map((r) => r.phone).join(', ')
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${recipients.length} numbers copy ho gaye`)
    } catch {
      toast.error('Copy nahi hua — manually select karein')
    }
  }

  const downloadCsv = () => {
    if (recipients.length === 0) return
    const esc = (s: string) => `"${(s || '').replace(/"/g, '""')}"`
    const rows = [
      ['Name', 'Phone', 'Message'].join(','),
      ...recipients.map((r) => [esc(r.patientName), r.phone, esc(messageFromWhatsappUrl(r.whatsappUrl))].join(',')),
    ]
    const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recall-${(resultsQuery.data?.campaign?.name || 'campaign').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success('CSV download ho gaya — WhatsApp Web ke saath use karein')
  }

  // ─── Render ──
  const data = campaignsQuery.data
  const campaigns = data?.campaigns ?? []
  const busy = campaignsQuery.isLoading

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-teal-600" aria-hidden />
            Recall Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dormant patients ko WhatsApp par wapas lao — wa.me links se, ₹0 mein
          </p>
        </div>
        <Button
          onClick={() => { resetWizard(); setWizardOpen(true) }}
          className="gap-2 h-11 bg-teal-600 hover:bg-teal-700 text-white"
          aria-label="Create a new recall campaign"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Campaign
        </Button>
      </motion.div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/10">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden />
              Dormant patients = missed revenue — 3 step mein wapas lao
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: 'Audience chuno', desc: '30/60/90/180 din se zyada purani last visit wale patients auto-detect hote hain.' },
                { step: '2', title: 'Message likho', desc: '{{patient_name}} jaise placeholders — har patient ko personal message.' },
                { step: '3', title: 'WhatsApp se bhejo', desc: 'Per-patient wa.me link — ek click mein WhatsApp Web khulta hai. $0 cost.' },
              ].map((s) => (
                <div key={s.step} className="rounded-xl bg-white/70 dark:bg-gray-900/40 border border-emerald-100 dark:border-emerald-900/50 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" aria-hidden>
                      {s.step}
                    </span>
                    <p className="text-xs font-bold text-foreground">{s.title}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan banner */}
      {data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {data.gated ? (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0" aria-hidden>
                    {data.canSend ? <Megaphone className="h-5 w-5 text-white" /> : <Lock className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {data.canSend
                        ? `Free plan: aapka pehla recall campaign FREE hai (${data.sentCampaignCount}/${FREE_SENT_CAMPAIGN_LIMIT} used)`
                        : `Free plan ka 1 free campaign use ho chuka (${data.sentCampaignCount}/${FREE_SENT_CAMPAIGN_LIMIT})`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {data.canSend
                        ? 'Pro mein unlimited campaigns + poori audience list + CSV export.'
                        : 'Agla campaign bhejne ke liye Pro chahiye — ya points se activate karo.'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => openWallWith(data.upgrade ?? {
                    reason: 'recall_campaigns', used: data.sentCampaignCount, limit: FREE_SENT_CAMPAIGN_LIMIT,
                    planKey: 'free', planName: 'Free', message: 'Pro mein unlimited recall campaigns milte hain.',
                  })}
                  className="gap-2 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shrink-0"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  {data.canSend ? 'Pro dekhein' : 'Unlock Pro'}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                {data.plan.name} — unlimited recall campaigns
              </Badge>
              {data.plan.status === 'trialing' && (
                <span className="text-muted-foreground">Trial chal raha hai</span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Campaign list */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-teal-600" aria-hidden />
              Aapke campaigns {busy ? '' : `(${campaigns.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {busy ? (
              <div className="space-y-2" aria-label="Loading campaigns">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : campaignsQuery.isError ? (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" aria-hidden />
                <p className="text-sm font-medium text-foreground">Campaigns load nahi hue</p>
                <Button
                  variant="outline"
                  className="mt-3 h-11"
                  onClick={() => campaignsQuery.refetch()}
                  aria-label="Retry loading campaigns"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden /> Dobara try karein
                </Button>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4" aria-hidden>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-bold text-foreground">Abhi koi recall campaign nahi</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Aapke dormant patients (jo 30+ din se nahi aaye) wait kar rahe hain.
                  Pehla campaign banayein — audience automatically detect ho jaata hai.
                </p>
                <Button
                  onClick={() => { resetWizard(); setWizardOpen(true) }}
                  className="mt-5 gap-2 h-11 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Pehla campaign banao
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                        <TableHead className="text-xs">Campaign</TableHead>
                        <TableHead className="text-xs">Dormant window</TableHead>
                        <TableHead className="text-xs text-right">Recipients</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((c) => (
                        <TableRow key={c.id} className="group">
                          <TableCell className="max-w-[220px]">
                            <p className="text-xs font-semibold truncate">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{c.template}</p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            <CalendarClock className="h-3 w-3 inline mr-1 text-teal-600" aria-hidden />
                            {dayLabel(c.dormantDays)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold">
                            {c.status === 'SENT' ? c.recipientCount : '—'}
                          </TableCell>
                          <TableCell>
                            {c.status === 'DRAFT' ? (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-0">Draft</Badge>
                            ) : (
                              <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                                <Send className="h-3 w-3" aria-hidden /> Sent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                            {format(new Date(c.createdAt), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {c.status === 'DRAFT' ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDirectSend(c)}
                                    disabled={sendMutation.isPending}
                                    className="h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                                    aria-label={`Send campaign ${c.name}`}
                                  >
                                    {sendMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Send className="h-3.5 w-3.5" aria-hidden />}
                                    Send
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteId(c.id)}
                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    aria-label={`Delete draft ${c.name}`}
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setResultsId(c.id)}
                                  className="h-9 gap-1.5 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                                  aria-label={`View results for ${c.name}`}
                                >
                                  <Eye className="h-3.5 w-3.5" aria-hidden />
                                  Results
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {campaigns.map((c) => (
                    <div key={c.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {dayLabel(c.dormantDays)} window · {format(new Date(c.createdAt), 'dd MMM yyyy')}
                          </p>
                        </div>
                        {c.status === 'DRAFT' ? (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-0 shrink-0">Draft</Badge>
                        ) : (
                          <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-0 shrink-0">
                            <Send className="h-3 w-3" aria-hidden /> Sent
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{c.template}</p>
                      <div className="flex items-center justify-between mt-3">
                        {c.status === 'SENT' ? (
                          <span className="text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 inline mr-1 text-teal-600" aria-hidden />
                            {c.recipientCount} recipients
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Abhi send nahi hua</span>
                        )}
                        <div className="flex gap-2">
                          {c.status === 'DRAFT' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleDirectSend(c)}
                                disabled={sendMutation.isPending}
                                className="h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                                aria-label={`Send campaign ${c.name}`}
                              >
                                <Send className="h-3.5 w-3.5" aria-hidden /> Send
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteId(c.id)}
                                className="h-9 w-9 p-0 text-red-600"
                                aria-label={`Delete draft ${c.name}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setResultsId(c.id)}
                              className="h-9 gap-1.5 border-teal-200 dark:border-teal-800"
                              aria-label={`View results for ${c.name}`}
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden /> Results
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── New campaign wizard ── */}
      <Dialog open={wizardOpen} onOpenChange={(open) => { setWizardOpen(open); if (!open) resetWizard() }}>
        <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-teal-600" aria-hidden />
              Naya Recall Campaign
            </DialogTitle>
            <DialogDescription>
              Step {step} of 3 — {step === 1 ? 'audience chuniye' : step === 2 ? 'message likhiye' : 'review karke bhejiye'}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-2" aria-label={`Step ${step} of 3`}>
            {['Audience', 'Message', 'Review'].map((label, i) => {
              const n = i + 1
              const active = step === n
              const done = step > n
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <span
                    className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : active
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'
                    }`}
                    aria-hidden
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                  </span>
                  <span className={`text-[11px] font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  {n < 3 && <div className={`h-0.5 flex-1 rounded ${step > n ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'}`} aria-hidden />}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 — audience */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Dormant window — kitne din se nahi aaye?</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DORMANT_PRESETS.map((d) => {
                      const active = !customDays && dormantDays === d
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => { setDormantDays(d); setCustomDays('') }}
                          className={`h-11 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                            active
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                              : 'border-gray-200 dark:border-gray-800 text-muted-foreground hover:border-teal-300'
                          }`}
                          aria-pressed={active}
                        >
                          {d} din
                        </button>
                      )
                    })}
                    <div className="flex items-center gap-2 h-11 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-800">
                      <label htmlFor="custom-days" className="text-xs text-muted-foreground whitespace-nowrap">Custom:</label>
                      <input
                        id="custom-days"
                        type="number"
                        min={DORMANT_MIN}
                        max={DORMANT_MAX}
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        placeholder="45"
                        className="w-16 bg-transparent text-sm outline-none"
                        aria-label="Custom dormant days"
                      />
                    </div>
                  </div>
                </div>

                {/* Live audience preview */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20 p-4">
                    {audienceQuery.isLoading || !audience ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Search className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                            {dayLabel(audience.dormantDays)} se zyada purani last visit
                          </p>
                          <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                            {audience.count}
                            <span className="text-sm font-medium text-muted-foreground ml-1.5">dormant patients</span>
                          </p>
                          {audience.withoutPhone > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              +{audience.withoutPhone} bina phone ke (recall nahi ho sakte)
                            </p>
                          )}
                        </div>
                        {audience.gated && (
                          <Badge className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-0 shrink-0">
                            <Lock className="h-3 w-3" aria-hidden /> Free preview
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {audience && (
                    <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
                      {audience.count === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Is window mein koi dormant patient nahi — window bada karke dekhein (60/90/180 din)
                        </p>
                      ) : (
                        audience.patients.map((p) => (
                          <div key={p.patientId} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0" aria-hidden>
                                <UserRound className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {maskPhone(p.phone)} · {p.totalVisits} visits
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                              {p.daysSince} din pehle
                            </span>
                          </div>
                        ))
                      )}
                      {audience.listCapped && (
                        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2.5 text-[11px] text-amber-800 dark:text-amber-300">
                          <Lock className="h-3 w-3 shrink-0" aria-hidden />
                          {audience.gated
                            ? `Poori list (${audience.count} patients) Pro mein dikhti hai — par campaign sabko jaata hai`
                            : `+${audience.count - audience.sampleSize} aur patients`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-row justify-between sm:justify-between">
                  <Button variant="ghost" onClick={() => setWizardOpen(false)} className="h-11">Cancel</Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!!audience && audience.count === 0}
                    className="gap-2 h-11 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Message likho <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {/* STEP 2 — message template */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <div>
                  <Label htmlFor="recall-template" className="text-xs font-semibold">WhatsApp message</Label>
                  <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                    {PLACEHOLDER_CHIPS.map((chip) => (
                      <button
                        key={chip.token}
                        type="button"
                        onClick={() => insertPlaceholder(chip.token)}
                        className="h-8 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] font-mono text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                        aria-label={`Insert ${chip.label} placeholder ${chip.token}`}
                      >
                        {chip.token}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    id="recall-template"
                    ref={textareaRef}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    placeholder="Namaste {{patient_name}} ji…"
                    className="min-h-[120px] text-sm leading-relaxed"
                    maxLength={TEMPLATE_MAX + 200}
                    aria-describedby="template-count"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p id="template-count" className={`text-[10px] ${templateLen > TEMPLATE_MAX ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                      {templateLen}/{TEMPLATE_MAX} characters
                    </p>
                    {templateLen < TEMPLATE_MIN && <p className="text-[10px] text-amber-600">Kam se kam {TEMPLATE_MIN} characters</p>}
                  </div>
                </div>

                {/* Live rendered preview (WhatsApp bubble) */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    Preview — {samplePatient ? samplePatient.name : 'sample patient'} ko aisa dikhega:
                  </p>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-emerald-100 dark:bg-emerald-950/60 px-4 py-2.5">
                      <p className="text-[13px] text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
                        {renderedPreview || '…'}
                      </p>
                      <p className="text-[9px] text-emerald-700/70 dark:text-emerald-400/70 text-right mt-1">
                        via WhatsApp · {format(new Date(), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-row justify-between sm:justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-11 gap-1.5">
                    <ChevronLeft className="h-4 w-4" aria-hidden /> Audience
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!templateValid}
                    className="gap-2 h-11 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Review <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {/* STEP 3 — review + send */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name" className="text-xs font-semibold">Campaign ka naam (optional)</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder={`Recall — ${dayLabel(effectiveDays)} dormant`}
                    maxLength={80}
                    className="mt-1.5 h-11"
                  />
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-teal-600" aria-hidden /> Dormant window
                    </span>
                    <span className="font-semibold">{effectiveDays} din</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-teal-600" aria-hidden /> Recipients
                    </span>
                    <span className="font-semibold">
                      {audience?.count ?? '—'} patients
                      {audience?.withoutPhone ? ` (+${audience.withoutPhone} bina phone)` : ''}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-muted-foreground flex items-center gap-1.5 mb-1.5">
                      <FileText className="h-3.5 w-3.5 text-teal-600" aria-hidden /> Message
                    </span>
                    <p className="text-[11px] text-foreground bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap break-words max-h-28 overflow-y-auto">
                      {renderedPreview}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  Send karne par: har patient ke liye WhatsApp link banega + in-app notification jayega.
                  Links aap (ya staff) results page se click karke WhatsApp Web se bhejenge — zero cost.
                </p>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-11 gap-1.5 sm:mr-auto">
                    <ChevronLeft className="h-4 w-4" aria-hidden /> Message
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSaveDraft}
                    disabled={createMutation.isPending || sendMutation.isPending}
                    className="h-11"
                  >
                    Save as Draft
                  </Button>
                  {sendBlockedForFree ? (
                    <Button
                      onClick={() => openWallWith(audience?.upgrade ?? null)}
                      className="gap-2 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    >
                      <Lock className="h-4 w-4" aria-hidden />
                      Unlock Pro to send
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateAndSend}
                      disabled={createMutation.isPending || sendMutation.isPending || !audience || audience.count === 0}
                      className="gap-2 h-11 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {createMutation.isPending || sendMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden />
                      )}
                      Create & Send
                    </Button>
                  )}
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* ── Results dialog ── */}
      <Dialog open={!!resultsId} onOpenChange={(open) => { if (!open) setResultsId(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
              Campaign sent — {resultsQuery.data?.campaign?.name || '…'}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 flex-wrap">
              <Users className="h-3.5 w-3.5 text-teal-600" aria-hidden />
              {resultsQuery.data?.campaign?.recipientCount ?? '…'} recipients
              {resultsQuery.data?.campaign?.sentAt && (
                <> · {format(new Date(resultsQuery.data.campaign.sentAt), 'dd MMM yyyy, h:mm a')}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {resultsQuery.isLoading ? (
            <div className="space-y-2" aria-label="Loading results">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : resultsQuery.isError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" aria-hidden />
              <p className="text-sm text-foreground">Results load nahi hue</p>
              <Button variant="outline" className="mt-3 h-11" onClick={() => resultsQuery.refetch()}>Dobara try karein</Button>
            </div>
          ) : (
            <>
              {/* $0 flow explainer + bulk actions */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50 p-3">
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mb-2.5 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Har patient ka "Open WhatsApp" dabao → WhatsApp Web khulega, message pehle se likha hoga — bas Send dabana hai.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={copyAllNumbers} className="h-9 gap-1.5 border-emerald-200 dark:border-emerald-800">
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copy all numbers
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadCsv} className="h-9 gap-1.5 border-emerald-200 dark:border-emerald-800">
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    Download CSV
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Recipient list */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="max-h-[46vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                        <TableHead className="text-xs">Patient</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Phone</TableHead>
                        <TableHead className="text-xs text-right">WhatsApp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipients.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="max-w-[180px]">
                            <p className="text-xs font-medium truncate">{r.patientName}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[170px] sm:hidden">{r.phone}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[170px] hidden sm:block text-gray-400 dark:text-gray-500">
                              {messageFromWhatsappUrl(r.whatsappUrl).slice(0, 48)}…
                            </p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell font-mono">{r.phone}</TableCell>
                          <TableCell className="text-right">
                            {r.whatsappUrl ? (
                              <a
                                href={r.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 transition-colors"
                                aria-label={`Open WhatsApp chat with ${r.patientName}`}
                              >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                                Open
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">no link</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                In-app notifications bhi sabhi {recipients.length} patients ko bhej diye gaye hain (bell icon).
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Draft delete karein?</AlertDialogTitle>
            <AlertDialogDescription>
              Yeh draft campaign permanently delete ho jayega. Sent campaigns delete nahi hote — unka record patients ke notifications ke saath juda hua hai.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Nahi, rakhna hai</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="h-11 bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Upgrade wall ── */}
      <UpgradeWallDialog
        open={wallOpen}
        onOpenChange={setWallOpen}
        wall={wallPayload}
        walletSpendable={walletSpendable ?? 0}
        source="recall_campaigns"
      />
    </div>
  )
}
