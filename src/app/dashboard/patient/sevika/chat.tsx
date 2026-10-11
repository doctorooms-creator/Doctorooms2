'use client'

/**
 * Sevika — AI Nurse chat panel (P3).
 *
 * Floating "ask your nurse" button (bottom-right) → right Sheet with a
 * streaming chat. SSE consumption mirrors the Dr. Copilot panel
 * (event: delta / done / error). Conversation history lives client-side
 * and is echoed back per request (bounded to 8 turns by the API).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageCircle, Send, Sparkles, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

const WELCOME: ChatMsg = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Namaste 🙏 Main Sevika hoon — aapki AI nurse. Aaj ki dawai, diet plan, ya reminder ke bare me kuch bhi poochh lijiye.',
}

const QUICK_CHIPS = [
  'Aaj ki dawaiyaan kaunsi hain?',
  'Meri streak kaisi chal rahi hai?',
  'Diet me kya khaun?',
]

export default function SevikaChatButton() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep the latest message pinned into view while streaming.
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
        ...prev,
        userMsg,
        { id: aiId, role: 'assistant', content: '', streaming: true },
      ])

      // Bounded history echo (last 8 real turns, roles sanitised server-side too)
      const history = [...messages, userMsg]
        .filter((m) => m.id !== 'welcome' && m.content.trim())
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }))

      try {
        const res = await fetch('/api/dashboard/patient/sevika/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history }),
        })

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}))
          throw new Error(
            res.status === 401
              ? 'Session expired — dobara login kariye'
              : (data as { error?: string }).error || 'Sevika abhi available nahi hai'
          )
        }

        // Parse SSE stream (same protocol as the copilot panel)
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
    [input, messages, sending]
  )

  const showChips = messages.length <= 1 && !sending

  return (
    <>
      {/* ── Floating nurse button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="sevika-chat-fab"
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            aria-label="Sevika se baat karein — AI nurse chat"
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-teal-600 pl-4 pr-5 text-white shadow-lg shadow-teal-600/30 transition-transform hover:scale-105 hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Stethoscope className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-teal-600 bg-emerald-400" />
            </span>
            <span className="hidden text-sm font-semibold sm:inline">Sevika se poochhein</span>
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
                  Sevika
                  <Badge className="border-teal-300 bg-teal-50 text-[10px] text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400">
                    <Sparkles className="mr-0.5 h-3 w-3" /> AI Nurse
                  </Badge>
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Online — aapki dawai, diet aur reminders ki jaankari
                </span>
              </span>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Sevika AI nurse se chat karein — dawai reminders, adherence aur diet ke bare me
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
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role === 'assistant' && (
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
                    <span className="flex items-center gap-1 py-0.5" aria-label="Sevika type kar rahi hai">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:300ms]" />
                    </span>
                  ) : null)}
                </div>
              </motion.div>
            ))}

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
                placeholder="Sevika se kuch bhi poochhein…"
                aria-label="Sevika ko message likhein"
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
              Sevika AI jaankari deti hai — dawai/dose change par doctor se poochhein.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
