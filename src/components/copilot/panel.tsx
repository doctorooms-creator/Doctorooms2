'use client'

/**
 * Dr. Copilot — slide-in AI sandbox panel (dark theme).
 *
 * Talks ONLY to /api/copilot/* (session-authenticated). All data shown
 * comes back doctor-scoped from the server; this component has no
 * doctorId of its own to leak.
 *
 * Streaming: consumes the SSE stream from POST /api/copilot/chat
 * (events: meta → delta* → done | error) and renders tokens live.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Sparkles, X, SendHorizonal, Loader2, BookOpenText, ShieldCheck, RotateCcw, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ActionCardView } from '@/components/copilot/action-card'
import type { CopilotActionCard, CopilotChart } from '@/lib/copilot/action-card'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  citations?: string[]
  actions?: CopilotActionCard[]
  chart?: CopilotChart | null
  streaming?: boolean
}

const SUGGESTIONS = [
  'Next patient ka brief do',
  'Aaj kitne pending hai?',
  'Practice analytics dikhao',
  'Meri prescribing pattern batao',
  'Rahul Verma ke liye prescription likho',
  'Aane wale follow-ups',
]

export function CopilotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [historyReady, setHistoryReady] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Load history on first open.
  // Race guard: if a send started while history was loading, KEEP the
  // in-flight messages (append history before them) instead of clobbering.
  useEffect(() => {
    if (!open || historyLoaded) return
    setHistoryLoaded(true)
    fetch('/api/copilot/history?limit=40')
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((data) => {
        const msgs: ChatMsg[] = (data.messages || []).map((m: { id: string; role: string; content: string; agentName?: string; meta?: { citations?: string[]; actions?: CopilotActionCard[]; chart?: CopilotChart } }) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          agentName: m.agentName,
          citations: m.meta?.citations || [],
          actions: m.meta?.actions || [],
          chart: m.meta?.chart || null,
        }))
        setMessages((prev) => {
          const inFlight = prev.filter((m) => m.id.startsWith('u-') || m.id.startsWith('a-'))
          return inFlight.length > 0 ? [...msgs, ...inFlight] : msgs
        })
      })
      .catch(() => {})
      .finally(() => setHistoryReady(true))
  }, [open, historyLoaded])

  // Auto-scroll to newest
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, sending])

  const send = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim()
      if (!message || sending) return
      setInput('')
      setSending(true)

      const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: message }
      const aiId = `a-${Date.now()}`
      setMessages((prev) => [...prev, userMsg, { id: aiId, role: 'assistant', content: '', streaming: true }])

      try {
        const res = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        })

        if (!res.ok || !res.body) {
          throw new Error(res.status === 401 ? 'Session expired — please re-login' : 'Copilot unavailable')
        }

        // Parse SSE stream
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
    [input, sending]
  )

  const reset = useCallback(() => {
    if (sending) return
    setMessages([])
  }, [sending])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed z-50 flex flex-col bg-zinc-950 text-zinc-100 shadow-2xl',
              'inset-0 rounded-none', // mobile: full screen
              'md:inset-y-4 md:right-4 md:left-auto md:w-[420px] md:rounded-2xl md:border md:border-zinc-800'
            )}
            role="dialog"
            aria-label="Dr. Copilot AI assistant"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                <Sparkles className="h-4.5 w-4.5 text-white" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">Dr. Copilot</p>
                <p className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" aria-hidden />
                  Sirf aapke records · AI propose, aap approve
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                disabled={sending}
                title="Clear chat"
                className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close"
                className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="copilot-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {historyReady && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30">
                    <Sparkles className="h-6 w-6 text-teal-400" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Namaskar Doctor 👋</p>
                    <p className="mt-1 max-w-[280px] text-xs text-zinc-400">
                      Main aapke hi clinic ke records se jawab deta hoon — queue, patients, prescriptions, analytics.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-teal-500/60 hover:text-teal-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!historyReady && messages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-600" aria-hidden />
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[88%]', m.role === 'user' ? 'text-right' : 'text-left')}>
                    <div
                      className={cn(
                        'inline-block rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        m.role === 'user'
                          ? 'rounded-br-md bg-teal-600 text-white'
                          : 'rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-100'
                      )}
                    >
                      {m.role === 'assistant' ? (
                        <div className="copilot-md [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:text-white">
                          <ReactMarkdown>{m.content || '…'}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                      {m.streaming && m.role === 'assistant' && (
                        <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-teal-400 align-middle" aria-hidden />
                      )}
                    </div>
                    {/* Citations */}
                    {m.role === 'assistant' && !m.streaming && (m.citations?.length || 0) > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {m.citations!.filter(Boolean).slice(0, 4).map((c, i) => (
                          <a
                            key={`${m.id}-c-${i}`}
                            href={`/dashboard/doctor/appointments?highlight=${encodeURIComponent(c)}`}
                            className="inline-flex items-center gap-1 rounded-full border border-zinc-700/70 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400 transition-colors hover:border-teal-500/60 hover:text-teal-300"
                          >
                            <BookOpenText className="h-2.5 w-2.5" aria-hidden />
                            {c}
                          </a>
                        ))}
                      </div>
                    )}
                    {/* Analytics chart (Phase D2) */}
                    {m.role === 'assistant' && !m.streaming && m.chart && <CopilotChartView chart={m.chart} />}

                    {/* Approve-cards (Phase B) */}
                    {m.role === 'assistant' && !m.streaming && (m.actions?.length || 0) > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.actions!.map((card) => (
                          <ActionCardView
                            key={card.id}
                            card={card}
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
                  </div>
                </div>
              ))}

              {sending && messages[messages.length - 1]?.streaming !== true && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"
                        style={{ animationDelay: `${i * 150}ms` }}
                        aria-hidden
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <div className="flex items-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-teal-500/60">
                <textarea
                  ref={taRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    const el = e.target as HTMLTextAreaElement
                    el.style.height = 'auto'
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                      if (taRef.current) taRef.current.style.height = 'auto'
                    }
                  }}
                  rows={1}
                  placeholder="Kuch bhi poocho — brief, queue, analytics, RX draft…"
                  aria-label="Message Dr. Copilot"
                  className="max-h-[120px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
                <Button
                  size="icon"
                  onClick={() => {
                    send()
                    if (taRef.current) taRef.current.style.height = 'auto'
                  }}
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  className="h-9 w-9 shrink-0 rounded-lg bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-40"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <SendHorizonal className="h-4 w-4" aria-hidden />}
                </Button>
              </div>
              <p className="mt-2 px-2 text-center text-[10px] leading-relaxed text-zinc-600">
                AI assistance · data sirf aapke patients ka · medical decision hamesha doctor ka
              </p>
            </div>
              </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Analytics bar chart (Phase D2) ─────────────────────────────────────

function CopilotChartView({ chart }: { chart: CopilotChart }) {
  const max = Math.max(...chart.values, 1)
  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
        <BarChart3 className="h-3 w-3 text-teal-400" aria-hidden />
        {chart.title}
      </p>
      <div
        className="mt-2.5 flex h-24 items-end gap-1.5"
        role="img"
        aria-label={`${chart.title}: ${chart.labels.map((l, i) => `${l} ${chart.values[i]}`).join(', ')}`}
      >
        {chart.values.map((v, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-[9px] font-medium text-zinc-400">
              {chart.unit === '₹' && v > 0 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : v}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((v / max) * 100, v > 0 ? 6 : 2)}%` }}
              transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 200 }}
              className={cn(
                'w-full rounded-t-sm',
                i === chart.values.length - 1
                  ? 'bg-gradient-to-t from-teal-600 to-emerald-400'
                  : 'bg-zinc-700'
              )}
            />
            <span className="truncate text-[9px] text-zinc-500">{chart.labels[i]}</span>
          </div>
        ))}
      </div>
      {chart.note && <p className="mt-1.5 text-[10px] text-zinc-500">{chart.note}</p>}
    </div>
  )
}
