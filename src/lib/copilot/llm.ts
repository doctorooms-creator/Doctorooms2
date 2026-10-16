/**
 * Dr. Copilot — LLM layer (L3: context firewall)
 *
 * The system prompt bakes in the isolation rules: the model is told it has
 * NO access beyond the data block prepared by the scoped repo (L2), and that
 * data for patients not treated by this doctor simply does not exist.
 *
 * All model I/O is delegated to the app-wide provider layer
 * (`@/lib/ai/provider`): z-ai-web-dev-sdk in the sandbox, any
 * OpenAI-compatible public provider (LLM_* env vars) in production.
 *
 * No client code may import this module (server-only by convention and by
 * placement under src/lib/copilot, consumed only by API routes).
 */

import type { CopilotCtx } from './guard'
import { completeChat, streamChatCompletion } from '@/lib/ai/provider'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
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
  return completeChat(messages)
}

/**
 * Streaming completion — yields text deltas.
 * Delegates to the app-wide provider (SDK SSE stream in sandbox, OpenAI-
 * compatible stream in production — same delta shape either way).
 */
export async function* streamChat(messages: LLMMessage[]): AsyncGenerator<string> {
  yield* streamChatCompletion(messages)
}
