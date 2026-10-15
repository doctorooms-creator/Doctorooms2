'use client'

/**
 * Aturseva — AI nurse chat panel (floating quick-access).
 *
 * FAB (bottom-right) → right Sheet with streaming chat. History is PERSISTED
 * server-side (AtursevaConversation) and shared with the full chat window at
 * /dashboard/patient/aturseva — opening the sheet loads the same thread.
 *
 * SSE protocol: delta / action (rich card) / done / error.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Loader2, MessageCircle, Send, Sparkles, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface ActionCard {
  type: string
  title: string
  data: Record<string, unknown>
}

interface ChatMsg {
  id: string
  role: 'user' | 'aturseva' | 'action'
  content: string
  action?: ActionCard
  streaming?: boolean
}

const QUICK_CHIPS = [
  'Aaj ki dawaiyaan kaunsi hain?',
  'Mera booking approve hua?',
  'Achhe doctor dikhao',
]

function ActionCardBody({ action }: { action: ActionCard }) {
  if (action.type === 'doctor-search') {
    const doctors = (action.data.doctors as { id: string; name: string; specialization: string; city: string; fees: number }[]) || []
    return (
      <div className="space-y-2">
        {doctors.slice(0, 4).map((d) => (
          <Link
            key={d.id}
            href={`/dashboard/patient/book/${d.id}`}
            className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-left transition-colors hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30"
          >
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">{d.name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {d.specialization}
                {d.city ? ` · ${d.city}` : ''}
              </span>
            </span>
            <span className="ml-2 shrink-0 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
              ₹{d.fees}
            </span>
          </Link>
        ))}
      </div>
    )
  }

  if (action.type === 'bookings-status') {
    const bookings = (action.data.bookings as { id: string; doctor: string; dateIST: string; timeSlot: string; status: string; statusHi: string }[]) || []
    return (
      <div className="space-y-1.5">
        {bookings.slice(0, 4).map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
            <span className="min-w-0 text-[11px]">
              <span className="block truncate font-semibold">{b.doctor}</span>
              <span className="text-muted-foreground">
                {b.dateIST} {b.timeSlot && `· ${b.timeSlot}`}
              </span>
            </span>
            <Badge
              variant="outline"
              className={cn(
                'ml-2 shrink-0 text-[10px]',
                b.status === 'Approve' && 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
                b.status === 'Pending' && 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
              )}
            >
              {b.statusHi}
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  if (action.type === 'queue-position') {
    const d = action.data
    const token = d.tokenNumber as string | undefined
    return (
      <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5">
        {token ? (
          <>
            <span className="text-[11px] text-muted-foreground">
              {(d.doctor as string) || ''}
              <span className="block">Aapki position</span>
            </span>
            <span className="text-right">
              <span className="block text-lg font-bold text-teal-700 dark:text-teal-400">#{token}</span>
              <span className="text-[10px] text-muted-foreground">
                {Number(d.patientsAhead) > 0 ? `${d.patientsAhead} pehle · ~${d.estimatedWaitMinutes} min` : 'Aapki baari!'}
              </span>
            </span>
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground">{(d.note as string) || action.title}</span>
        )}
      </div>
    )
  }

  return <p className="text-[11px] text-muted-foreground">{action.title}</p>
}

export default function SevikaChatButton() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [loaded, setLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load the shared persisted history once, when the sheet is first opened.
  useEffect(() => {
    if (!open || loaded) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/patient/aturseva/chat')
        if (!res.ok) return
        const data = (await res.json()) as {
          greeting?: string | null
          messages?: { id: string; role: 'user' | 'aturseva' | 'action'; content: string; actionJson?: { type: string; title: string; data: Record<string, unknown> } }[]
        }
        if (cancelled) return
        const history: ChatMsg[] = (data.messages || []).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          ...(m.actionJson
            ? { action: { type: m.actionJson.type, title: m.actionJson.title, data: m.actionJson.data } }
            : {}),
        }))
        if (history.length === 0 && data.greeting) {
          history.push({ id: 'greeting', role: 'aturseva', content: data.greeting })
        }
        setMessages(history)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, loaded])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  const send = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim()
      if (!message || sending) return
      setInput('')
      setSending(true)

      const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: message }
      const aiId = `a-${Date.now()}`
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'greeting'),
        userMsg,
        { id: aiId, role: 'aturseva', content: '', streaming: true },
      ])

      try {
        // History lives server-side now — only the new message is sent.
        const res = await fetch('/api/dashboard/patient/aturseva/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        })

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}))
          throw new Error(
            res.status === 401
              ? 'Session expired — dobara login kariye'
              : (data as { error?: string }).error || 'Aturseva abhi available nahi hai'
          )
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

            if (event === 'delta') {
              const t = (payload.text as string) || ''
              setMessages((prev) =>
                prev.map((m) => (m.id === aiId ? { ...m, content: m.content + t } : m))
              )
            } else if (event === 'action') {
              // Rich card arrives before the narrated answer — insert it above the streaming bubble.
              const card: ActionCard = {
                type: (payload.type as string) || '',
                title: (payload.title as string) || '',
                data: (payload.data as Record<string, unknown>) || {},
              }
              setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === aiId)
                const actionMsg: ChatMsg = {
                  id: (payload.id as string) || `act-${Date.now()}`,
                  role: 'action',
                  content: '',
                  action: card,
                }
                if (idx === -1) return [...prev, actionMsg]
                return [...prev.slice(0, idx), actionMsg, ...prev.slice(idx)]
              })
            } else if (event === 'done') {
              done = true
              setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m)))
            } else if (event === 'error') {
              const msgText = (payload.message as string) || 'Kuch dikkat aayi'
              setMessages((prev) =>
                prev.map((m) => (m.id === aiId ? { ...m, content: msgText, streaming: false } : m))
              )
              done = true
            }
          }
        }
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m)))
      } catch (err) {
        const msgText = err instanceof Error ? err.message : 'Kuch dikkat aayi'
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: msgText, streaming: false } : m))
        )
        toast.error(msgText)
      } finally {
        setSending(false)
      }
    },
    [input, sending]
  )

  const showChips = messages.filter((m) => m.role === 'user').length === 0 && !sending

  return (
    <>
      {/* ── Floating nurse button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="aturseva-chat-fab"
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            aria-label="Aturseva se baat karein — AI nurse chat"
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-teal-600 pl-4 pr-5 text-white shadow-lg shadow-teal-600/30 transition-transform hover:scale-105 hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Stethoscope className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-teal-600 bg-emerald-400" />
            </span>
            <span className="hidden text-sm font-semibold sm:inline">Aturseva se poochhein</span>
            <span className="sm:hidden text-sm font-semibold">Poochhein</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat sheet ── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b bg-gradient-to-br from-teal-50 to-white px-4 py-3 dark:from-teal-950/40 dark:to-background">
            <SheetTitle className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm">
                <Stethoscope className="h-6 w-6" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-400" />
              </span>
              <span>
                <span className="flex items-center gap-2 text-lg font-bold">
                  Aturseva
                  <Badge className="border-teal-300 bg-teal-50 text-[10px] text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400">
                    <Sparkles className="mr-0.5 h-3 w-3" /> AI Nurse
                  </Badge>
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Dawai, diet, appointments aur queue — sab yaad hai
                </span>
              </span>
              <Link
                href="/dashboard/patient/aturseva"
                className="ml-auto flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-400"
                aria-label="Poori chat window kholein"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Poori chat
              </Link>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Aturseva AI nurse se chat karein — dawai reminders, appointments, queue aur diet ke bare me
            </SheetDescription>
          </SheetHeader>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="sevika-chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4"
            style={{ maxHeight: 'calc(100vh - 11rem)' }}
            role="log"
            aria-live="polite"
          >
            {messages.map((m) =>
              m.role === 'action' && m.action ? (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-9 max-w-[90%]"
                >
                  <div className="rounded-2xl rounded-tl-md border border-teal-200 bg-teal-50/60 p-2.5 dark:border-teal-900 dark:bg-teal-950/30">
                    <p className="mb-1.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300">
                      {m.action.title}
                    </p>
                    <ActionCardBody action={m.action} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {m.role === 'aturseva' && (
                    <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm dark:bg-teal-900/50">
                      🩺
                    </span>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                      m.role === 'user'
                        ? 'rounded-br-md bg-teal-600 text-white'
                        : 'rounded-bl-md border bg-muted/60 text-foreground'
                    )}
                  >
                    {m.content || (m.streaming ? (
                      <span className="flex items-center gap-1 py-0.5" aria-label="Aturseva type kar rahi hai">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:300ms]" />
                      </span>
                    ) : null)}
                  </div>
                </motion.div>
              )
            )}

            {showChips && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => send(chip)}
                    className="rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400 dark:hover:bg-teal-900/40"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-background px-3 py-3">
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void send()
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
                rows={1}
                maxLength={1000}
                placeholder="Aturseva se kuch bhi poochhein…"
                aria-label="Aturseva ko message likhein"
                className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-teal-500"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 112)}px`
                }}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Message bhejein"
                disabled={sending || !input.trim()}
                className="h-11 w-11 shrink-0 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              Aturseva AI jaankari deti hai — dawai/dose change par doctor se poochhein.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
