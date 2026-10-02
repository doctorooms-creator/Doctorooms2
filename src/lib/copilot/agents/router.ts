/**
 * DR Copilot — Router agent.
 * Classifies the doctor's message into an intent + extracts a search slot.
 *
 * Hybrid strategy: deterministic regex fast-paths for the common, unambiguous
 * asks (fast + free), LLM classification for everything else. The router NEVER
 * touches the database — it only picks which scoped repo reads happen next.
 */

import { chatJSON } from '../llm'
import type { CopilotCtx, CopilotIntent, RouterResult } from '../types'

const APPT_NO = /\b[A-Z]{2,4}-\d{2,6}\b/i // GEN-014, APT-000123 …
const MOBILE = /\b[6-9]\d{9}\b/

/** Deterministic fast paths. */
function fastPath(msg: string): RouterResult | null {
  const m = msg.trim().toLowerCase()

  if (/^(hi|hello|hey|namaste|good (morning|afternoon|evening))\b/.test(m) && m.length < 40) {
    return { intent: 'chitchat', reason: 'greeting' }
  }
  if (/(what can you do|your capabilities|help me|how do you work|who are you)/.test(m)) {
    return { intent: 'capabilities', reason: 'capabilities question' }
  }
  if (/\b(today|my day|right now|current(ly)?|this morning|this evening)\b/.test(m) &&
      /\b(schedule|appointments?|patients?|queue|list|day|visits?|bookings?|opd)\b/.test(m)) {
    return { intent: 'my_day', reason: 'today + schedule keywords' }
  }
  if (/\b(how many|count|stats?|total|busy|trend|this week|this month)\b/.test(m) &&
      /\b(patients?|appointments?|visits?|bookings?|prescriptions?|rx)\b/.test(m)) {
    return { intent: 'analytics', reason: 'aggregation keywords' }
  }

  if (/(draft|prepare|write|make|create|suggest)\b[^\n]{0,40}\b(prescription|rx|script|medicines?|medication)/i.test(msg) ||
      /\b(prescription|rx)\b[^\n]{0,20}\b(draft|for (my )?next patient)\b/i.test(msg)) {
    return { intent: 'rx_draft', query: extractNameSlot(msg), reason: 'draft prescription keywords' }
  }
  if (/\b(follow-?up|followup|review visit|next visit)\b/.test(m) && /\b(schedule|set|plan|book|remind|propose|when)\b/.test(m)) {
    return { intent: 'followup', query: extractNameSlot(msg), reason: 'followup keywords' }
  }
  const appt = msg.match(APPT_NO)
  if (appt) return { intent: 'patient_lookup', query: appt[0], reason: 'appointment number detected' }
  const mob = msg.match(MOBILE)
  if (mob && /(patient|history|details|records?|who is|find|show)/i.test(m)) {
    return { intent: 'patient_lookup', query: mob[0], reason: 'mobile number detected' }
  }
  if (/\b(last|recent|latest)\b.*\b(patient|visit|appointment)s?\b/.test(m)) {
    return { intent: 'patient_lookup', reason: 'recent patients' }
  }
  if (/\b(prescriptions?|rx|medicines?|medication)\b/.test(m) &&
      /\b(last|recent|latest|history|search|find|show|list|for)\b/.test(m)) {
    const nameSlot = extractNameSlot(msg)
    return { intent: 'rx_history', query: nameSlot, reason: 'prescription keywords' }
  }
  if (/\b(summarize|summary|brief|recap|catch me up)\b/.test(m)) {
    return { intent: 'summary', query: extractNameSlot(msg), reason: 'summary keyword' }
  }
  if (/\b(patient|history of|details of|records? of)\b/.test(m)) {
    return { intent: 'patient_lookup', query: extractNameSlot(msg), reason: 'patient keywords' }
  }
  return null
}

/** Pull a probable person name out of phrases like "history of Rahul Verma". */
function extractNameSlot(msg: string): string | undefined {
  const of = msg.match(/\b(?:of|for|about|named?)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})/)
  if (of) return of[1]
  return undefined
}

/** LLM fallback classification. */
async function llmRoute(ctx: CopilotCtx, msg: string): Promise<RouterResult> {
  const system = `You are the intent router of DR Copilot, an assistant scoped to ONE doctor's own clinic data.
Classify the doctor's message into exactly one intent:
- my_day: asking about today's schedule, queue, current patients
- patient_lookup: asking about a specific patient/appointment (by name, mobile, or appointment no)
- rx_history: asking about prescriptions/medications written by the doctor
- summary: asking for a summary/recap of a patient or the day
- analytics: counts, statistics, trends over the doctor's own data
- rx_draft: asking to DRAFT/PREPARE/WRITE a new prescription ("draft rx for Rahul", "prepare a prescription for my next patient")
- followup: asking to schedule/propose a follow-up visit date
- capabilities: asking what the copilot can do
- chitchat: greetings or anything unrelated to clinic data

Reply with ONLY a JSON object: {"intent":"...","query":"<optional search term like a patient name / mobile / appointment no>","reason":"<short>"}
Today is ${ctx.todayIST} (IST). The doctor is ${ctx.doctorName}.`

  const out = await chatJSON<RouterResult>([
    { role: 'system', content: system },
    { role: 'user', content: msg.slice(0, 600) },
  ])
  const valid: CopilotIntent[] = ['my_day', 'patient_lookup', 'rx_history', 'summary', 'analytics', 'rx_draft', 'followup', 'capabilities', 'chitchat']
  if (!out?.intent || !valid.includes(out.intent)) {
    return { intent: 'chitchat', reason: 'router fallback (unparsed intent)' }
  }
  return { intent: out.intent, query: out.query?.slice(0, 120) || undefined, reason: out.reason }
}

export async function route(ctx: CopilotCtx, message: string): Promise<RouterResult> {
  return fastPath(message) ?? llmRoute(ctx, message)
}
