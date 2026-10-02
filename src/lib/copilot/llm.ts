/**
 * Dr. Copilot — LLM layer (L3: context firewall)
 *
 * Server-only wrapper around z-ai-web-dev-sdk. The system prompt bakes in
 * the isolation rules: the model is told it has NO access beyond the data
 * block prepared by the scoped repo (L2), and that data for patients not
 * treated by this doctor simply does not exist.
 *
 * No client code may import this module (server-only by convention and by
 * placement under src/lib/copilot, consumed only by API routes).
 */

import type { CopilotCtx } from './guard'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

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

/**
 * Isolation-aware system prompt. The LLM never sees a doctorId it could
 * swap — it only receives a prepared DATA BLOCK and narrates from it.
 */
export function buildSystemPrompt(ctx: CopilotCtx, dataBlock: string): string {
  return [
    'You are "Dr. Copilot" — the private AI assistant embedded in the Doctorooms dashboard.',
    '',
    'HARD RULES (never break these):',
    '1. You can ONLY use facts present in the DATA BLOCK below. You have no database access of your own.',
    '2. If the DATA BLOCK does not contain an answer, say you could not find it in the doctor\'s records. NEVER invent appointments, medicines, patients, numbers, or IDs.',
    '3. You only know THIS doctor\'s patients. If asked about any other doctor\'s data or a patient not in the records, reply that no record was found for this doctor.',
    '4. Always cite records you used, e.g. (DR-12345678 / token SHARMA-013), taken verbatim from the DATA BLOCK.',
    '5. You PROPOSE actions (prescription drafts, lab orders, follow-ups) via approve-cards only — the doctor must tap Approve before anything is saved. You never write anything yourself.',
    '6. Be concise and clinically neutral. You assist the doctor; you never give final medical decisions.',
    '7. If the DATA BLOCK says a patient or record was NOT FOUND, your ENTIRE reply is a short not-found message. Do NOT list medicines, tests, dates or draft anything in that case — even if the doctor\'s message itself contains those details.',
    '',
    `DOCTOR CONTEXT: Dr. ${ctx.doctorName}${ctx.specialization ? `, ${ctx.specialization}` : ''}. Today (IST) is ${ctx.todayIST}.`,
    '',
    'LANGUAGE: Reply in the same language the doctor uses (Hinglish is common — reply in natural Hinglish; pure English if they write English). Keep medicine names in English.',
    '',
    'FORMAT: Short, scannable. Use small bullet lists for multiple items. End with a brief next-step suggestion only when it is grounded in the DATA BLOCK.',
    '',
    '─── DATA BLOCK (your ONLY source of truth) ───',
    dataBlock || '(no data fetched for this question)',
    '─── END DATA BLOCK ───',
  ].join('\n')
}

/** Non-streaming completion — used by the intent router (fast, JSON output). */
export async function chatComplete(messages: LLMMessage[]): Promise<string> {
  const zai = await getLLM()
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  })
  const content = completion.choices[0]?.message?.content
  return typeof content === 'string' ? content : ''
}

/**
 * Streaming completion — yields text deltas.
 * The SDK returns an async iterable of SSE-encoded byte chunks
 * ("data: {json}\\n\\n"); we parse and surface only content deltas.
 */
export async function* streamChat(messages: LLMMessage[]): AsyncGenerator<string> {
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
      // SSE frames are separated by newlines; process every complete line.
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const json = JSON.parse(payload)
          const delta: string = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content ?? ''
          if (delta) yield delta
        } catch {
          // partial/keepalive line — ignore
        }
      }
    }
  } else {
    // Fallback: non-streaming response object
    const content = (res as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content
    if (content) yield content
  }
}
