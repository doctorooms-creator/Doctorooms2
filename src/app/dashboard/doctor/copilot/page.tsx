'use client'

/**
 * Dr. Copilot STUDIO — full-page AI workspace (ChatGPT-pattern, Phase F)
 *
 * Layout mirrors ChatGPT (2025):
 *   • Left sidebar : New chat + service list + data connectors (Connected)
 *                    + Recents (thread history, searchable) + profile
 *   • Main area    : full-bleed messages (user = soft bubble right, AI = plain
 *                    prose left with Copy/Retry toolbar), centered welcome
 *   • Composer     : rounded pill card with '+' popover (tools + connectors),
 *                    drag-drop / paste / picker uploads, disclaimer
 *
 * Talks ONLY to /api/copilot/* — every response is doctor-scoped server-side
 * (RULE #1); this page never holds a doctorId. Quick panel on other pages
 * keeps using the same legacy "" thread.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useTheme } from 'next-themes'
import {
  Sparkles, ArrowUp, Loader2, BookOpenText, BarChart3, MessageSquareText,
  FileSearch, ImagePlus, Plus, X, UploadCloud, ChevronDown, Check, Copy,
  RotateCcw, Search, Menu, Users, FlaskConical, Pill, IndianRupee, ArrowUpRight,
  SquarePen, Paperclip, Maximize2, Minimize2, type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ActionCardView } from '@/components/copilot/action-card'
import { UpgradeWallDialog, type UpgradeWallPayload } from '@/components/upgrade-wall-dialog'
import type { CopilotActionCard, CopilotChart } from '@/lib/copilot/action-card'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

// ─── Types ──────────────────────────────────────────────────────────────

interface StudioImage {
  id: string
  url: string
  name?: string
  kind?: string
}

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  citations?: string[]
  actions?: CopilotActionCard[]
  chart?: CopilotChart | null
  images?: StudioImage[]
  attachments?: StudioImage[]
  streaming?: boolean
}

interface PendingAttachment {
  id: string
  name: string
  localUrl: string
}

interface ThreadInfo {
  threadId: string
  title: string
  messageCount: number
  lastAt: string
}

type Mode = 'chat' | 'report' | 'analytics' | 'image'

const MODES: Array<{
  key: Mode
  label: string
  icon: LucideIcon
  desc: string
  placeholder: string
  suggestions: string[]
}> = [
  {
    key: 'chat',
    label: 'Ask',
    icon: MessageSquareText,
    desc: 'Apne records se sawaal-jawaab — queue, patients, RX drafts',
    placeholder: 'Kuch bhi poocho — brief, queue, analytics, RX draft…',
    suggestions: ['Next patient ka brief do', 'Aaj kitne pending hai?', 'Rahul Verma ke liye prescription likho', 'Aane wale follow-ups'],
  },
  {
    key: 'report',
    label: 'Report Lens',
    icon: FileSearch,
    desc: 'Lab report / X-ray / purani RX ki photo — AI extract + analyse',
    placeholder: 'Report image attach karo, aur poocho "kya abnormal hai?"…',
    suggestions: ['Is report mein kya abnormal hai?', 'Values table banao', '9812345678 ke records se compare karo'],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    desc: 'Practice insights + charts — earnings, load, diseases',
    placeholder: 'Poocho — "aaj ka summary", "6 month earnings trend"…',
    suggestions: ['Aaj ka practice summary do', 'Top medicines 6 months', 'Earnings trend dikhao', 'Disease split batao'],
  },
  {
    key: 'image',
    label: 'Patient Educator',
    icon: ImagePlus,
    desc: 'Patient ko samjhane ke liye illustration generate karo',
    placeholder: 'Batao kya dikhana hai — "diabetes diet plate"…',
    suggestions: ['Diabetes diet plate banao', 'Inhaler use karne ka tarika', 'Heart healthy lifestyle visual'],
  },
]

// Medical "data connectors" (ChatGPT-style integrations section).
// All of these are ALWAYS live and doctor-scoped (RULE #1) — the UI surfaces
// them so the doctor can see exactly what the copilot can access.
const CONNECTORS: Array<{
  key: string
  icon: LucideIcon
  name: string
  desc: string
  note: string
}> = [
  {
    key: 'patients',
    icon: Users,
    name: 'My Patients',
    desc: 'Aapke patients ke records',
    note: 'My Patients connected — Copilot sirf aapke hi patients dekh sakta hai.',
  },
  {
    key: 'labs',
    icon: FlaskConical,
    name: 'Lab Results',
    desc: 'Aapke ordered tests ke results',
    note: 'Lab Results connected — sirf aapke ordered tests ka data.',
  },
  {
    key: 'rx',
    icon: Pill,
    name: 'Rx History',
    desc: 'Aapki likhi prescriptions',
    note: 'Rx History connected — sirf aapki prescribed medicines.',
  },
  {
    key: 'earnings',
    icon: IndianRupee,
    name: 'Earnings',
    desc: 'Aapke consultations ka record',
    note: 'Earnings connected — sirf aapki consultation income.',
  },
]

const MAX_ATTACHMENTS = 4
const MAX_FILE_MB = 8
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

// ─── Page ────────────────────────────────────────────────────────────────

export default function CopilotStudioPage() {
  const { resolvedTheme } = useTheme()
  const cardTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  const [mode, setMode] = useState<Mode>(() => {
    // Mode survives page reloads (a reload mid-session must not silently
    // fall back to Ask and misroute an image/report request).
    if (typeof window === 'undefined') return 'chat'
    const saved = window.localStorage.getItem('copilot-studio-mode') as Mode | null
    return saved && MODES.some((m) => m.key === saved) ? saved : 'chat'
  })
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [upgradeWall, setUpgradeWall] = useState<UpgradeWallPayload | null>(null)
  const [walletSpendable, setWalletSpendable] = useState(0)
  const [pending, setPending] = useState<PendingAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [threads, setThreads] = useState<ThreadInfo[]>([])
  const [currentThread, setCurrentThread] = useState<string>(() => crypto.randomUUID())
  const [threadLoading, setThreadLoading] = useState(true)

  // New ChatGPT-pattern UI state
  const [doctorName, setDoctorName] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer
  const [plusOpen, setPlusOpen] = useState(false) // composer '+' popover
  const [plusSearch, setPlusSearch] = useState('')
  const [plusSearchSidebar, setPlusSearchSidebar] = useState('') // thread history filter
  const [copiedId, setCopiedId] = useState('')
  const [immersive, setImmersive] = useState(false) // full-screen (hide dashboard chrome)

  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem('copilot-studio-mode', mode)
    } catch {}
  }, [mode])

  const activeMode = MODES.find((m) => m.key === mode)!
  const firstName = doctorName ? doctorName.split(' ').slice(0, 2).join(' ') : 'Doctor'
  const initials = doctorName
    .split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'DR'
  const currentThreadInfo = threads.find((t) => t.threadId === currentThread)

  // Escape exits immersive mode (keyboard-friendly exit next to the button)
  useEffect(() => {
    if (!immersive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImmersive(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [immersive])

  // ── Doctor profile (greeting + sidebar card) ──
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user?.name) setDoctorName(d.user.name)
      })
      .catch(() => {})
  }, [])

  // ── Thread list ──
  const refreshThreads = useCallback(() => {
    fetch('/api/copilot/threads')
      .then((r) => (r.ok ? r.json() : { threads: [] }))
      .then((d) => setThreads(d.threads || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Load thread list; if this is a fresh mount (no messages yet) auto-open
    // the doctor's most recent thread so a page reload never loses context.
    fetch('/api/copilot/threads')
      .then((r) => (r.ok ? r.json() : { threads: [] }))
      .then((d) => {
        const list: ThreadInfo[] = d.threads || []
        setThreads(list)
        if (list.length > 0 && messages.length === 0 && !sending) {
          void openThread(list[0].threadId)
        }
      })
      .catch(() => {})
      .finally(() => setThreadLoading(false))
  }, [])

  // ── Load a thread ──
  const openThread = useCallback(
    async (threadId: string) => {
      if (sending) return
      setThreadLoading(true)
      setCurrentThread(threadId)
      setSidebarOpen(false)
      try {
        const res = await fetch(`/api/copilot/history?limit=80&threadId=${encodeURIComponent(threadId)}`)
        const data = await res.json()
        const msgs: ChatMsg[] = (data.messages || []).map((m: {
          id: string; role: string; content: string; agentName?: string;
          meta?: {
            citations?: string[]; actions?: CopilotActionCard[];
            chart?: CopilotChart; images?: StudioImage[];
            attachments?: Array<string | StudioImage>;
          };
        }) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          agentName: m.agentName,
          citations: m.meta?.citations || [],
          actions: m.meta?.actions || [],
          chart: m.meta?.chart || null,
          images: m.meta?.images || [],
          attachments: (m.meta?.attachments || []).map((a) =>
            typeof a === 'string' ? { id: a, url: `/api/copilot/attachments/${a}` } : a
          ),
        }))
        setMessages(msgs)
      } catch {
        toast.error('Thread load nahi ho payi')
      } finally {
        setThreadLoading(false)
      }
    },
    [sending]
  )

  const newChat = useCallback(() => {
    if (sending) return
    setMessages([])
    setPending((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.localUrl))
      return []
    })
    setCurrentThread(crypto.randomUUID())
    setSidebarOpen(false)
    setPlusOpen(false)
  }, [sending])

  // ── Auto-scroll ──
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, sending, pending])

  // ── Upload ──
  const uploadFiles = useCallback(
    async (files: File[]) => {
      const imgFiles = files.filter((f) => ALLOWED_TYPES.has(f.type))
      const rejected = files.length - imgFiles
      if (rejected > 0) toast.error(`${rejected} file skip — sirf JPEG/PNG/WebP images`)
      if (imgFiles.length === 0) return

      const room = MAX_ATTACHMENTS - pending.length
      if (room <= 0) {
        toast.error(`Max ${MAX_ATTACHMENTS} images per message`)
        return
      }
      const batch = imgFiles.slice(0, room)
      if (imgFiles.length > room) toast.error(`Sirf pehle ${room} images li — max ${MAX_ATTACHMENTS}`)

      setUploading(true)
      try {
        for (const f of batch) {
          if (f.size > MAX_FILE_MB * 1024 * 1024) {
            toast.error(`${f.name} — ${MAX_FILE_MB}MB se bada hai`)
            continue
          }
          const fd = new FormData()
          fd.append('file', f)
          const res = await fetch('/api/copilot/attachments', { method: 'POST', body: fd })
          const data = await res.json()
          if (res.ok && data.attachment?.id) {
            setPending((prev) => [
              ...prev,
              { id: data.attachment.id, name: data.attachment.name || f.name, localUrl: URL.createObjectURL(f) },
            ])
          } else {
            toast.error(data.error || 'Upload failed')
          }
        }
      } catch {
        toast.error('Upload failed — try again')
      } finally {
        setUploading(false)
      }
    },
    [pending.length]
  )

  const removePending = useCallback((id: string) => {
    setPending((prev) => {
      const p = prev.find((x) => x.id === id)
      if (p) URL.revokeObjectURL(p.localUrl)
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  // ── Send (SSE) ──
  const send = useCallback(
    async (text?: string, attachOverride?: StudioImage[]) => {
      const message = (text ?? input).trim()
      if (!message || sending) return

      const effectiveAttachments = attachOverride ?? pending.map((p) => ({
        id: p.id, url: `/api/copilot/attachments/${p.id}`, name: p.name, kind: 'image',
      }))

      if (mode === 'report' && effectiveAttachments.length === 0) {
        toast.error('Report Lens ke liye pehle report ki image attach karo 📎')
        return
      }

      setInput('')
      if (!attachOverride) setPending([])
      setSending(true)
      setPlusOpen(false)
      if (taRef.current) taRef.current.style.height = 'auto'

      const userMsg: ChatMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: message,
        attachments: effectiveAttachments.length > 0 ? effectiveAttachments : undefined,
      }
      const aiId = `a-${Date.now()}`
      setMessages((prev) => [...prev, userMsg, { id: aiId, role: 'assistant', content: '', streaming: true }])

      try {
        const res = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            mode,
            threadId: currentThread,
            attachmentIds: effectiveAttachments.map((a) => a.id),
          }),
        })

        if (!res.ok || !res.body) {
          // ── Plan wall (402): AI credits exhausted for this month ──
          if (res.status === 402) {
            const d = await res.json().catch(() => null)
            setMessages((prev) => prev.filter((m) => m.id !== userMsg.id && m.id !== aiId))
            if (d?.upgrade) {
              setUpgradeWall(d.upgrade as UpgradeWallPayload)
              fetch('/api/plans/me')
                .then((r) => (r.ok ? r.json() : null))
                .then((pm) => { if (pm?.wallet) setWalletSpendable(pm.wallet.spendable as number) })
                .catch(() => {})
              return
            }
          }
          throw new Error(res.status === 401 ? 'Session expired — please re-login' : 'Copilot unavailable')
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let done = false
        while (!done) {
          const { done: rdDone, value } = await reader.read()
          if (rdDone) break
          buffer += decoder.decode(value, { stream: true })
          const frames = buffer.split('\n\n')
          buffer = frames.pop() || ''
          for (const frame of frames) {
            const evLine = frame.split('\n').find((l) => l.startsWith('event:'))
            const dataLine = frame.split('\n').find((l) => l.startsWith('data:'))
            if (!evLine || !dataLine) continue
            const event = evLine.slice(6).trim()
            let payload: Record<string, unknown> = {}
            try {
              payload = JSON.parse(dataLine.slice(5).trim())
            } catch {
              continue
            }

            if (event === 'meta') {
              const citations = (payload.citations as string[]) || []
              const agent = (payload.agent as string) || ''
              setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, citations, agentName: agent } : m)))
            } else if (event === 'delta') {
              const t = (payload.text as string) || ''
              setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: m.content + t } : m)))
            } else if (event === 'action') {
              const card = payload.card as CopilotActionCard | undefined
              if (card) {
                setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, actions: [...(m.actions || []), card] } : m)))
              }
            } else if (event === 'chart') {
              const chart = payload.chart as CopilotChart | undefined
              if (chart) {
                setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, chart } : m)))
              }
            } else if (event === 'image') {
              const attachment = payload.attachment as StudioImage | undefined
              if (attachment) {
                setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, images: [...(m.images || []), attachment] } : m)))
              }
            } else if (event === 'done') {
              done = true
              setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m)))
            } else if (event === 'error') {
              const msgText = (payload.message as string) || 'Something went wrong'
              setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: msgText, streaming: false } : m)))
              done = true
            }
          }
        }
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m)))
        refreshThreads()
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, content: err instanceof Error ? err.message : 'Network error — try again', streaming: false }
              : m
          )
        )
      } finally {
        setSending(false)
      }
    },
    [input, sending, mode, pending, currentThread, refreshThreads]
  )

  // ── Retry last exchange (ChatGPT-style regenerate) ──
  const retryLast = useCallback(() => {
    if (sending) return
    const lastUserIdx = [...messages].map((m) => m.role).lastIndexOf('user')
    if (lastUserIdx === -1) return
    const lastUser = messages[lastUserIdx]
    const restored: StudioImage[] = (lastUser.attachments || []).map((a) => ({
      id: a.id, url: a.url, name: a.name, kind: a.kind,
    }))
    setMessages((prev) => prev.slice(0, lastUserIdx))
    void send(lastUser.content, restored)
  }, [messages, sending, send])

  // ── Copy message ──
  const copyMsg = useCallback(async (m: ChatMsg) => {
    try {
      await navigator.clipboard.writeText(m.content)
      setCopiedId(m.id)
      setTimeout(() => setCopiedId(''), 2000)
    } catch {
      toast.error('Copy nahi hua')
    }
  }, [])

  // ── Paste-to-attach ──
  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from((e.clipboardData as DataTransfer)?.files || [])
      if (files.length > 0) {
        e.preventDefault()
        void uploadFiles(files)
      }
    },
    [uploadFiles]
  )

  // ── '+' popover tools ──
  const plusTools: Array<{ key: string; icon: LucideIcon; title: string; desc: string; run: () => void }> = [
    {
      key: 'files',
      icon: Paperclip,
      title: 'Add photos & files',
      desc: 'Report ya image upload karo (JPEG/PNG/WebP)',
      run: () => {
        setPlusOpen(false)
        fileRef.current?.click()
      },
    },
    {
      key: 'report',
      icon: FileSearch,
      title: 'Report Lens',
      desc: 'Lab report photo — extract & analyse',
      run: () => {
        setMode('report')
        setPlusOpen(false)
        setTimeout(() => fileRef.current?.click(), 100)
      },
    },
    {
      key: 'image',
      icon: ImagePlus,
      title: 'Create image',
      desc: 'Patient education illustration banao',
      run: () => {
        setMode('image')
        setPlusOpen(false)
        setTimeout(() => taRef.current?.focus(), 100)
      },
    },
    {
      key: 'analytics',
      icon: BarChart3,
      title: 'Deep analytics',
      desc: 'Practice trends, earnings aur charts',
      run: () => {
        setMode('analytics')
        setPlusOpen(false)
        setTimeout(() => taRef.current?.focus(), 100)
      },
    },
  ]

  const plusQuery = plusSearch.trim().toLowerCase()
  const filteredTools = plusQuery
    ? plusTools.filter((t) => t.title.toLowerCase().includes(plusQuery))
    : plusTools
  const filteredConnectors = plusQuery
    ? CONNECTORS.filter((c) => c.name.toLowerCase().includes(plusQuery))
    : CONNECTORS

  const modeSuggestions = activeMode.suggestions

  // ─── Sidebar content (shared by desktop rail + mobile drawer) ─────────
  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" aria-hidden />
        </div>
        <p className="text-[15px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">Dr. Copilot</p>
        <button
          type="button"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* New chat */}
      <div className="px-2 pt-1">
        <button
          type="button"
          onClick={newChat}
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <SquarePen className="h-4 w-4 shrink-0" aria-hidden />
          New chat
        </button>
      </div>

      {/* Services */}
      <div className="mt-1 space-y-0.5 px-2">
        <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Services
        </p>
        {MODES.map((m) => {
          const Icon = m.icon
          const active = mode === m.key
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setMode(m.key)
                setSidebarOpen(false)
              }}
              aria-pressed={active}
              title={m.desc}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors',
                active
                  ? 'bg-zinc-200/90 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/70'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active && 'text-teal-600 dark:text-teal-400')} aria-hidden />
              <span className="truncate">{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Data connectors (ChatGPT-style integrations) */}
      <div className="mt-2 space-y-0.5 px-2">
        <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Connectors
        </p>
        {CONNECTORS.map((c) => {
          const Icon = c.icon
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                toast(c.note, { icon: '🔌' })
                setSidebarOpen(false)
              }}
              title={`${c.name} — connected (doctor-scoped)`}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
            >
              <Icon className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-500" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-left">{c.name}</span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
                Connected
              </span>
            </button>
          )
        })}
      </div>

      {/* Recents (thread history) */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col px-2">
        <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Recents
        </p>
        <div className="relative mx-1 mb-1.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            value={plusSearchSidebar}
            onChange={(e) => setPlusSearchSidebar(e.target.value)}
            placeholder="Search chats…"
            aria-label="Search chat history"
            className="h-8 w-full rounded-lg border border-zinc-200/80 bg-white/60 pl-8 pr-2.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-teal-400/60 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/40 dark:text-zinc-200 dark:placeholder:text-zinc-500"
          />
        </div>
        <div className="copilot-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-2">
          {threadLoading && threads.length === 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" aria-hidden />
            </div>
          )}
          {threads.length === 0 && !threadLoading && (
            <p className="px-2.5 py-3 text-center text-[11px] text-zinc-400">Abhi koi chat nahi — shuru karo 👇</p>
          )}
          {threads
            .filter((t) => !plusSearchSidebar.trim() || (t.title || '').toLowerCase().includes(plusSearchSidebar.trim().toLowerCase()))
            .map((t) => {
              const active = t.threadId === currentThread
              return (
                <button
                  key={t.threadId}
                  type="button"
                  onClick={() => openThread(t.threadId)}
                  className={cn(
                    'w-full rounded-xl px-2.5 py-2 text-left transition-colors',
                    active
                      ? 'bg-zinc-200/90 dark:bg-zinc-800'
                      : 'hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70'
                  )}
                >
                  <p className={cn('truncate text-[13px]', active ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400')}>
                    {t.title || 'New chat'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-600">
                    {t.messageCount} msgs · {new Date(t.lastAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </button>
              )
            })}
        </div>
      </div>

      {/* Profile */}
      <div className="border-t border-zinc-200/80 p-2 dark:border-zinc-800">
        <a
          href="/dashboard/doctor"
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-[11px] font-semibold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{doctorName || 'Doctor'}</span>
            <span className="block text-[11px] text-zinc-400 dark:text-zinc-600">Doctor · Dashboard</span>
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
        </a>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'flex overflow-hidden',
        immersive
          ? 'fixed inset-0 z-[60] bg-white dark:bg-zinc-950'
          : 'relative h-[calc(100dvh-8.6rem)]'
      )}
    >
        {/* Desktop sidebar (visible in normal AND immersive mode) */}
        <aside className="hidden w-[264px] shrink-0 border-r border-zinc-200/80 bg-[#f9f9f9] md:flex dark:border-zinc-800 dark:bg-zinc-900/40">
          {sidebarContent}
        </aside>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 h-full w-[282px] bg-white shadow-2xl md:hidden dark:bg-zinc-900"
              aria-label="Copilot sidebar"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main workspace ──────────────────────────────────────────── */}
      <section
        className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950"
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const files = Array.from(e.dataTransfer.files || [])
          if (files.length > 0) void uploadFiles(files)
        }}
      >
        {/* Top bar (ChatGPT-style: menu / title / mode selector / new chat) */}
        <div className="flex items-center gap-2 border-b border-zinc-200/70 px-3 py-2 dark:border-zinc-800/70">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4.5 w-4.5" aria-hidden />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {currentThreadInfo?.title || (messages.length > 0 ? 'New chat' : 'Dr. Copilot')}
          </p>

          {/* Mode selector (model-selector style) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label="Switch service mode"
              >
                <activeMode.icon className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
                {activeMode.label}
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl">
              {MODES.map((m) => {
                const Icon = m.icon
                return (
                  <DropdownMenuItem
                    key={m.key}
                    onClick={() => setMode(m.key)}
                    className="gap-3 rounded-lg py-2.5"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium">{m.label}</span>
                      <span className="block text-[11px] text-zinc-400 dark:text-zinc-600">{m.desc}</span>
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => setImmersive((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label={immersive ? 'Exit full screen' : 'Enter full screen'}
            aria-pressed={immersive}
            title={immersive ? 'Exit full screen (Esc)' : 'Full screen mode'}
          >
            {immersive ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
          </button>

          <button
            type="button"
            onClick={newChat}
            disabled={sending}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="New chat"
            title="New chat"
          >
            <SquarePen className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="copilot-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[768px] space-y-5 px-4 py-6">
            {messages.length === 0 && !threadLoading && (
              <div className="flex flex-col items-center justify-center py-14 text-center sm:py-20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                  <Sparkles className="h-6 w-6 text-white" aria-hidden />
                </div>
                <h1 className="mt-5 text-[26px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                  Namaste, {firstName} 👋
                </h1>
                <p className="mt-1.5 text-[15px] text-zinc-500 dark:text-zinc-400">Aaj kya karna hai?</p>
                <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {modeSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (mode === 'report') {
                          toast.info('Report Lens — pehle report image attach karo (+ button)')
                          return
                        }
                        void send(s)
                      }}
                      className="group flex items-start gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3.5 text-left text-[13.5px] text-zinc-600 transition-all hover:border-teal-400/60 hover:bg-teal-50/40 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:border-teal-500/50 dark:hover:bg-teal-500/5"
                    >
                      <activeMode.icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-teal-500" aria-hidden />
                      <span className="leading-snug">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {threadLoading && messages.length === 0 && (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" aria-hidden />
              </div>
            )}

            {messages.map((m, idx) => {
              const isLastAssistant = m.role === 'assistant' && idx === messages.length - 1

              if (m.role === 'user') {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="flex max-w-[78%] flex-col items-end">
                      {(m.attachments?.length || 0) > 0 && (
                        <div className="mb-1.5 flex flex-wrap justify-end gap-2">
                          {m.attachments!.map((a) => (
                            <a
                              key={a.id}
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block h-20 w-20 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                              title={a.name}
                            >
                              <img src={a.url} alt={`Uploaded report ${a.name || ''}`} className="h-full w-full object-cover" loading="lazy" />
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="rounded-3xl rounded-br-lg bg-zinc-100 px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                        {m.content}
                      </div>
                    </div>
                  </div>
                )
              }

              // ── Assistant: plain prose, no bubble (ChatGPT style) ──
              return (
                <div key={m.id} className="group flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-medium tracking-wide text-zinc-400 dark:text-zinc-600">
                      {m.agentName || 'Dr. Copilot'}
                    </p>

                    <div className="copilot-md text-[15px] leading-[1.7] text-zinc-800 dark:text-zinc-200 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-zinc-900 dark:[&_strong]:text-white [&_a]:text-teal-600 dark:[&_a]:text-teal-300 [&_a]:underline [&_a]:underline-offset-2 [&_table]:my-2.5 [&_table]:w-full [&_table]:text-left [&_table]:text-[13px] [&_th]:border-b [&_th]:border-zinc-200 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-[11px] dark:[&_th]:border-zinc-700 dark:[&_th]:text-zinc-300 [&_td]:border-b [&_td]:border-zinc-100 dark:[&_td]:border-zinc-800/60 [&_td]:px-2 [&_td]:py-1.5 [&_code]:rounded-md [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:text-[12.5px] dark:[&_code]:bg-zinc-800 dark:[&_code]:text-teal-200 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-zinc-900 dark:[&_h1]:text-white [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-900 dark:[&_h2]:text-white [&_h3]:mt-2 [&_h3]:text-[11px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:text-teal-600 dark:[&_h3]:text-teal-400 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-500 dark:[&_blockquote]:border-zinc-700 dark:[&_blockquote]:text-zinc-400">
                      <ReactMarkdown>{m.content || ''}</ReactMarkdown>
                      {m.streaming && (
                        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-teal-500 align-middle" aria-hidden />
                      )}
                    </div>

                    {/* Generated images (Patient Educator) */}
                    {!m.streaming && (m.images?.length || 0) > 0 && (
                      <div className="mt-2.5 space-y-2.5">
                        {m.images!.map((img) => (
                          <a
                            key={img.id}
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                            title={img.name || 'Generated illustration'}
                          >
                            <img src={img.url} alt={img.name || 'AI-generated medical illustration'} className="max-h-96 w-full object-contain" loading="lazy" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Citations */}
                    {!m.streaming && (m.citations?.length || 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.citations!.filter(Boolean).slice(0, 4).map((c, i) => (
                          <a
                            key={`${m.id}-c-${i}`}
                            href={`/dashboard/doctor/appointments?highlight=${encodeURIComponent(c)}`}
                            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] text-zinc-500 transition-colors hover:border-teal-400/60 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-teal-500/50 dark:hover:text-teal-300"
                          >
                            <BookOpenText className="h-2.5 w-2.5" aria-hidden />
                            {c}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Analytics chart */}
                    {!m.streaming && m.chart && <StudioChartView chart={m.chart} />}

                    {/* Approve-cards */}
                    {!m.streaming && (m.actions?.length || 0) > 0 && (
                      <div className="mt-2.5 space-y-2.5">
                        {m.actions!.map((card) => (
                          <ActionCardView
                            key={card.id}
                            card={card}
                            theme={cardTheme}
                            onDecided={(updated) =>
                              setMessages((prev) =>
                                prev.map((msg) =>
                                  msg.id === m.id
                                    ? { ...msg, actions: (msg.actions || []).map((a) => (a.id === updated.id ? updated : a)) }
                                    : msg
                                )
                              )
                            }
                          />
                        ))}
                      </div>
                    )}

                    {/* Action toolbar (Copy / Retry — ChatGPT style) */}
                    {!m.streaming && m.content && (
                      <div className="mt-2 flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => void copyMsg(m)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                          aria-label={copiedId === m.id ? 'Copied' : 'Copy message'}
                          title="Copy"
                        >
                          {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                        </button>
                        {isLastAssistant && (
                          <button
                            type="button"
                            onClick={retryLast}
                            disabled={sending}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            aria-label="Regenerate response"
                            title="Regenerate"
                          >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Streaming loading dots */}
            {sending && messages[messages.length - 1]?.streaming !== true && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden />
                </div>
                <div className="flex items-center gap-1.5 pt-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-300 dark:bg-zinc-600"
                      style={{ animationDelay: `${i * 150}ms` }}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm dark:bg-zinc-950/80"
            >
              <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-teal-400/70 bg-teal-50/80 px-12 py-9 dark:bg-teal-500/10">
                <UploadCloud className="h-8 w-8 text-teal-500" aria-hidden />
                <p className="text-sm font-medium text-teal-700 dark:text-teal-300">Report images yahan drop karo</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Composer (ChatGPT-style pill card + '+' popover) */}
        <div className="mx-auto w-full max-w-[768px] px-4 pb-[calc(0.6rem+env(safe-area-inset-bottom))]">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length > 0) void uploadFiles(files)
              e.target.value = ''
            }}
          />

          {/* Report-mode upload hint */}
          {mode === 'report' && pending.length === 0 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-teal-400/50 bg-teal-50/60 px-4 py-2.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50 dark:bg-teal-500/5 dark:text-teal-300"
            >
              <UploadCloud className="h-4 w-4" aria-hidden />
              Report image attach karo — drag &amp; drop ya paste bhi chalega
            </button>
          )}

          {/* Pending attachments */}
          {pending.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {pending.map((p) => (
                <div key={p.id} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  <img src={p.localUrl} alt={p.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePending(p.id)}
                    aria-label={`Remove ${p.name}`}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition-opacity hover:bg-black/90"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1 py-0.5 text-[9px] text-white">
                    {p.name}
                  </span>
                </div>
              ))}
              {uploading && (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" aria-hidden />
                </div>
              )}
            </div>
          )}

          <div className="relative">
            {/* The composer card */}
            <div className="flex items-end gap-1.5 rounded-[26px] border border-zinc-300/90 bg-white px-2 py-2 shadow-sm transition-shadow focus-within:border-teal-400/60 focus-within:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
              {/* '+' button → tools & connectors popover */}
              <button
                type="button"
                onClick={() => setPlusOpen((v) => !v)}
                disabled={uploading || pending.length >= MAX_ATTACHMENTS}
                aria-label="Add files and tools"
                aria-expanded={plusOpen}
                title="Add photos, files & tools"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus className="h-4.5 w-4.5" aria-hidden />
              </button>

              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  const el = e.target as HTMLTextAreaElement
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
                onPaste={onPaste}
                rows={1}
                placeholder={activeMode.placeholder}
                aria-label="Message Dr. Copilot"
                className="max-h-40 flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />

              {/* Send (ChatGPT-style circle, appears when ready) */}
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending || (!input.trim() && pending.length === 0)}
                aria-label="Send message"
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all',
                  sending || (!input.trim() && pending.length === 0)
                    ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                    : 'bg-teal-600 text-white shadow-md shadow-teal-600/25 hover:bg-teal-500'
                )}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowUp className="h-4.5 w-4.5" aria-hidden />}
              </button>
            </div>

            {/* '+' popover — tools + data connectors (ChatGPT pattern) */}
            <AnimatePresence>
              {plusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPlusOpen(false)} aria-hidden />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-[calc(100%+10px)] left-0 z-50 w-[330px] overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40"
                    role="menu"
                    aria-label="Tools and connectors"
                  >
                    <div className="copilot-scroll max-h-[340px] overflow-y-auto py-1.5">
                      <p className="px-3.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                        Tools
                      </p>
                      {filteredTools.map((t) => {
                        const Icon = t.icon
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={t.run}
                            role="menuitem"
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                              <Icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13.5px] font-medium text-zinc-800 dark:text-zinc-100">{t.title}</span>
                              <span className="block truncate text-[11.5px] text-zinc-500 dark:text-zinc-500">{t.desc}</span>
                            </span>
                          </button>
                        )
                      })}

                      {filteredConnectors.length > 0 && (
                        <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-800">
                          <p className="px-3.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                            Data connectors
                          </p>
                          {filteredConnectors.map((c) => {
                            const Icon = c.icon
                            return (
                              <button
                                key={c.key}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  toast(c.note, { icon: '🔌' })
                                  setPlusOpen(false)
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  <Icon className="h-4 w-4" aria-hidden />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[13.5px] font-medium text-zinc-800 dark:text-zinc-100">{c.name}</span>
                                  <span className="block truncate text-[11.5px] text-zinc-500 dark:text-zinc-500">{c.desc}</span>
                                </span>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
                                  Connected
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {filteredTools.length === 0 && filteredConnectors.length === 0 && (
                        <p className="px-3.5 py-4 text-center text-xs text-zinc-400">Kuch nahi mila — dusra shabd try karo</p>
                      )}
                    </div>

                    {/* Live search (ChatGPT pattern: filter at the bottom) */}
                    <div className="border-t border-zinc-100 p-2 dark:border-zinc-800">
                      <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" aria-hidden />
                        <input
                          autoFocus
                          value={plusSearch}
                          onChange={(e) => setPlusSearch(e.target.value)}
                          placeholder="Type to search tools & connectors…"
                          aria-label="Search tools and connectors"
                          className="h-8 w-full rounded-lg bg-zinc-100/70 pr-2.5 pl-8 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800/60 dark:text-zinc-200 dark:placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Disclaimer (ChatGPT pattern) */}
          <p className="mt-2 px-2 text-center text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-600">
            Copilot galat ho sakta hai — medical decisions hamesha verify karein. Data sirf aapke patients ka.
          </p>
        </div>
      </section>

      {/* Plan soft wall — AI credits exhausted (Free 50/mo) */}
      <UpgradeWallDialog
        open={!!upgradeWall}
        onOpenChange={(o) => { if (!o) setUpgradeWall(null) }}
        wall={upgradeWall}
        walletSpendable={walletSpendable}
      />
    </div>
  )
}

// ─── Analytics bar chart (theme-aware) ───────────────────────────────────

function StudioChartView({ chart }: { chart: CopilotChart }) {
  const max = Math.max(...chart.values, 1)
  return (
    <div className="mt-2.5 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
        <BarChart3 className="h-3.5 w-3.5 text-teal-500" aria-hidden />
        {chart.title}
      </p>
      <div
        className="mt-3 flex h-24 items-end gap-1.5"
        role="img"
        aria-label={`${chart.title}: ${chart.labels.map((l, i) => `${l} ${chart.values[i]}`).join(', ')}`}
      >
        {chart.values.map((v, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400">
              {chart.unit === '₹' && v > 0 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : v}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((v / max) * 100, v > 0 ? 6 : 2)}%` }}
              transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 200 }}
              className={cn('w-full rounded-t-sm', i === chart.values.length - 1 ? 'bg-gradient-to-t from-teal-600 to-emerald-400' : 'bg-zinc-300 dark:bg-zinc-700')}
            />
            <span className="truncate text-[9px] text-zinc-400 dark:text-zinc-500">{chart.labels[i]}</span>
          </div>
        ))}
      </div>
      {chart.note && <p className="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">{chart.note}</p>}
    </div>
  )
}
