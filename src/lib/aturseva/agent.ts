/**
 * Aturseva Agent — L3 system prompt + streaming turn runner.
 *
 * Turn flow (single-call fast path; tool path = 2 calls):
 *   1. persist user message (done by the route)
 *   2. stream LLM #1 — if the reply begins with the exact `[[TOOL]]` token,
 *      swallow it, parse the tool call, execute (ownership-scoped), persist
 *      an `action` message, emit SSE `action`, then stream LLM #2 with the
 *      TOOL RESULT block appended → that answer is persisted as the reply
 *   3. otherwise the buffered prefix is flushed and the stream passes through
 *
 * Safety rails (extended for Phase 2):
 *   data-block-only knowledge, NEVER dose changes/diagnosis, read-only tools
 *   + prepare_booking (validate-only — the WRITE happens exclusively through
 *   the patient-pressed Confirm button on the card → POST /aturseva/book),
 *   and the model must NEVER fabricate a tool call for data it already has
 *   in the block.
 */

import { executeTool, TOOL_CATALOGUE, type ActionResult, type ToolCall, type ToolContext } from './tools'

export interface AtursevaLLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ─── L3: system prompt ──────────────────────────────────────────────────────

export function buildAtursevaSystemPrompt(patientName: string, dataBlock: string): string {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  })
  return [
    'You are "Aturseva" — a warm, experienced Indian nurse AND personal health saathi inside the patient\u2019s own health app (Aturseva, a Doctorooms product). You chat with THE PATIENT directly. You are the patient\u2019s primary interface: discovery, appointments, queue, medicines, diet — sab aapke through.',
    '',
    'HARD RULES (never break these):',
    '1. You can ONLY use facts present in the DATA BLOCK below, the chat history, or TOOL RESULTS given to you. If something is not there, either call a tool or say you don\u2019t have it in today\u2019s records — never invent medicines, times, doctors, or counts.',
    '2. You NEVER suggest starting, stopping, or changing any medicine or dose. Those decisions belong to their doctor. If asked: "Ye aapke doctor se poochhna zaroori hai — main dose change nahi kar sakti."',
    '3. You NEVER diagnose. Symptoms → empathy + common-sense self-care (rest, water, light food) + suggest the right doctor/specialist. If symptoms sound serious (chest pain, breathlessness, bleeding, high fever with confusion), tell them to seek immediate care.',
    '4. Missed dose? No guilt-tripping, ever — "der se lene me bhi faida hai" + mention the 2-hour catch-up option when a recent miss is in the DATA BLOCK.',
    '5. Booking via chat: doctor → get_doctor_slots → patient picks slot + reason → prepare_booking (confirm card). Booking happens ONLY when the patient presses Confirm on the card — until the BOOKING CREATED confirmation arrives, never say it is booked. You can NEVER cancel bookings — guide them to the Appointments page.',
    '6. Celebrate adherence wins warmly (streaks, good score) — you are proud of them.',
    '7. Never say you are an AI model; you are Aturseva.',
    '',
    'LANGUAGE: Reply in the same language the patient writes — natural Hinglish by default (Roman script), pure English if they write English. Medicine names stay in English.',
    '',
    'FORMAT: 2–4 short lines, warm and personal like a caring nurse. One tiny bullet list ONLY when listing medicines/doctors. At most 1 emoji.',
    '',
    `PATIENT: ${patientName}. Aaj (IST) ${today} hai.`,
    '',
    '─── DATA BLOCK (your ONLY source of truth — live as of now) ───',
    dataBlock || '(no data available today)',
    '─── END DATA BLOCK ───',
    '',
    TOOL_CATALOGUE,
    '',
    'TOOL PROTOCOL (streaming-safe):',
    '- If the patient asks for something a TOOL provides (doctor search, their bookings, live queue) AND the DATA BLOCK does not already contain the answer, your ENTIRE reply must be exactly one line:',
    '  [[TOOL]]{"tool":"<name>","args":{...}}',
    '  …and NOTHING else — no greeting, no explanation. The system will run the tool and ask you again.',
    '- Cards are created ONLY by tools. NEVER write [CARD …], [[TOOL]], raw JSON blocks, or any bracket-format in your own reply — that is protocol garbage the patient must never see. If a tool is needed, the WHOLE reply is the [[TOOL]] line above.',
    '- Do NOT call a tool for data already in the DATA BLOCK (e.g. today\u2019s doses are there — answer directly).',
    '- Do NOT invent tool names or args. Keep args minimal (only what the patient specified).',
    '- After a TOOL RESULT is provided, answer the patient warmly USING those results (2–4 lines), and reference the card ("list upar card me hai") instead of repeating every field.',
    '- History me (SELF-CONTEXT … system notes) sirf reference hain — unka format/content apne jawab me kabhi copy na karein.',
  ].join('\n')
}

// ─── Tool-call parsing ──────────────────────────────────────────────────────

const TOOL_PREFIX = '[[TOOL]]'

export function parseToolCall(raw: string): ToolCall | null {
  const trimmed = raw.trim()

  // Primary protocol: [[TOOL]]{"tool":"name","args":{...}}
  if (trimmed.startsWith(TOOL_PREFIX)) {
    const rest = trimmed.slice(TOOL_PREFIX.length).trim()
    const first = rest.indexOf('{')
    const last = rest.lastIndexOf('}')
    if (first !== -1 && last > first) {
      try {
        const json = JSON.parse(rest.slice(first, last + 1))
        if (typeof json?.tool !== 'string') return null
        return { tool: json.tool, args: typeof json.args === 'object' && json.args ? json.args : {} }
      } catch {
        return null
      }
    }
    return null
  }

  // Defensive protocol (observed in the wild): the model sometimes MIMICS the
  // card-note format instead — “[CARD prepare_booking] {…}”. Parse it as the
  // tool call it is clearly trying to make, so the intent still executes.
  // Accepts args JSON directly, or the echoed card shape {title, data} (unwrap).
  const cardMatch = /^\[CARD\s+([a-zA-Z_]+)\]\s*([\s\S]+)$/.exec(trimmed)
  if (cardMatch) {
    const tool = cardMatch[1].toLowerCase()
    const rest = cardMatch[2].trim()
    const first = rest.indexOf('{')
    const last = rest.lastIndexOf('}')
    if (first !== -1 && last > first) {
      try {
        let json: unknown = JSON.parse(rest.slice(first, last + 1))
        if (json && typeof json === 'object') {
          const obj = json as Record<string, unknown>
          if (typeof obj.tool === 'string') {
            return { tool: obj.tool, args: obj.args && typeof obj.args === 'object' ? (obj.args as Record<string, unknown>) : {} }
          }
          // Echoed persisted card shape {title, data} → the data IS the args.
          if (obj.data && typeof obj.data === 'object' && typeof obj.title === 'string') {
            json = obj.data
          }
          return { tool, args: json as Record<string, unknown> }
        }
      } catch {
        return null
      }
    }
  }

  return null
}

// ─── LLM plumbing (same singleton + SSE protocol as sevika/chat.ts) ─────────

let zaiPromise: Promise<typeof import('z-ai-web-dev-sdk').default> | null = null

async function getLLM() {
  if (!zaiPromise) {
    zaiPromise = (async () => {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      return ZAI.create()
    })()
  }
  return zaiPromise
}

async function* streamLLM(messages: AtursevaLLMMessage[]): AsyncGenerator<string> {
  const zai = await getLLM()
  const res = await zai.chat.completions.create({
    messages,
    stream: true,
    thinking: { type: 'disabled' },
  })

  if (res && typeof (res as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function') {
    let buffer = ''
    for await (const chunk of res as AsyncIterable<Uint8Array>) {
      const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk)
      buffer += text
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const json = JSON.parse(payload)
          const delta: string =
            json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content ?? ''
          if (delta) yield delta
        } catch {
          // partial/keepalive line — ignore
        }
      }
    }
  } else {
    const content = (res as { choices?: { message?: { content?: string } }[] })?.choices?.[0]
      ?.message?.content
    if (content) yield content
  }
}

// ─── Turn runner ────────────────────────────────────────────────────────────

export interface TurnEmit {
  delta: (text: string) => void
  action: (result: ActionResult & { id: string }) => void
}

/**
 * Runs one agent turn. Emits deltas/actions through `emit`; returns the final
 * assistant text (for persistence) and the executed actions (already persisted
 * by the route via the `action` callback contract — here we only emit).
 *
 * `toolCtx` carries per-request context (e.g. the patient's shared GPS
 * location) that some tools need (find_nearby_doctors).
 */
export async function runAtursevaTurn(
  messages: AtursevaLLMMessage[],
  userId: string,
  emit: TurnEmit,
  toolCtx: ToolContext = {}
): Promise<{ reply: string; actions: (ActionResult & { id: string })[] }> {
  // Pass 1 — stream with a small prefix buffer to detect a tool call.
  // Two protocol prefixes are watched: the primary [[TOOL]] and the defensive
  // [CARD …] mimicry (both parse to a tool call — see parseToolCall).
  let collected = ''
  let flushed = false
  const actions: (ActionResult & { id: string })[] = []

  const flush = () => {
    if (!flushed && collected) {
      emit.delta(collected)
      flushed = true
    }
  }

  for await (const delta of streamLLM(messages)) {
    collected += delta
    if (!flushed) {
      const t = collected.trimStart().toUpperCase()
      const isTool = t.startsWith('[[TOOL]]')
      const isCard = t.startsWith('[CARD')
      if (isTool || isCard) {
        // swallow everything — likely a tool call; keep collecting silently
        continue
      }
      const couldBePrefix = t.length < 8 && (t === '' || t.startsWith('['))
      if (couldBePrefix) {
        continue // ambiguous bracket start — wait for more chars
      }
      flush()
    } else {
      emit.delta(delta)
    }
  }

  const call = parseToolCall(collected)
  if (!call) {
    // Malformed tool call? Never leak the raw protocol garbage to the patient.
    if (/^\[\[TOOL\]|^\[CARD/i.test(collected.trim())) {
      const fallback =
        'Ek minute — main ye jaankari abhi la nahi pa rahi. Thodi der baad dobara poochh lijiye. 🩺'
      emit.delta(fallback)
      return { reply: fallback, actions }
    }
    flush()
    return { reply: collected, actions }
  }

  // Tool path — execute, emit the card (only when the tool SUCCEEDED), then
  // answer with results (LLM #2). Failed tools (bad args, taken slot, missing
  // reason…) produce NO card: the error is fed to the model so it can recover
  // conversationally (ask, apologise, suggest alternatives).
  const outcome = await executeTool(userId, call, toolCtx)

  if (!outcome.ok) {
    const toolResultBlock = [
      '─── TOOL RESULT (fresh, authoritative) ───',
      `TOOL: ${call.tool}`,
      `ERROR: ${outcome.error}`,
      '─── END TOOL RESULT ───',
      'Is ERROR ko patient ko simple, warm bhasha me batayein (2–3 line, koi card nahi bana). Agar ERROR me missing information ka bola hai (reason/date/location), to patient se wahi cheez poochh lijiye. Agar slot/doctor unavailable hai to alternative suggest karein.',
    ].join('\n')

    const secondMessages: AtursevaLLMMessage[] = [
      ...messages,
      { role: 'assistant', content: collected.trim() }, // the tool call itself
      { role: 'user', content: toolResultBlock }, // tool error injected (system contract)
    ]

    let reply = ''
    for await (const delta of streamLLM(secondMessages)) {
      reply += delta
      emit.delta(delta)
    }
    if (!reply.trim()) {
      reply = 'Ek minute — ye jaankari abhi la nahi pa rahi. Thoda detail me batayein, main dobara try karti hoon. 🩺'
      emit.delta(reply)
    }
    return { reply, actions }
  }

  const result = outcome.result
  const actionId = `act-${Date.now()}`
  const actionMessage = { ...result, id: actionId }
  actions.push(actionMessage)
  emit.action(actionMessage)

  const toolResultBlock = [
    '─── TOOL RESULT (fresh, authoritative) ───',
    `TOOL: ${call.tool}`,
    `TITLE: ${result.title}`,
    JSON.stringify(result.data, null, 1),
    '─── END TOOL RESULT ───',
    'Ab is RESULT ko use karke patient ko warm, concise (2–4 line) jawab dein. Card me jo hai use repeat mat kariye — patient ko card dikh raha hai.',
  ].join('\n')

  const secondMessages: AtursevaLLMMessage[] = [
    ...messages,
    { role: 'assistant', content: collected.trim() }, // the tool call itself
    { role: 'user', content: toolResultBlock }, // tool result injected (system contract)
  ]

  let reply = ''
  for await (const delta of streamLLM(secondMessages)) {
    reply += delta
    emit.delta(delta)
  }

  if (!reply.trim()) {
    // graceful fallback: narrate the card title
    reply = `${result.title} — poori detail upar card me hai. 🩺`
    emit.delta(reply)
  }

  return { reply, actions }
}
