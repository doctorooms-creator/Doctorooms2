/**
 * Dr. Copilot — Intent Router
 *
 * LLM call #1: classify what the doctor asked + extract arguments.
 * The router NEVER fetches data — it only picks which scoped repo
 * function the deterministic layer (agents/query.ts) should run.
 * Falls back to 'general' on any parse trouble (safe: no data → no leak).
 */

import { chatComplete } from './llm'
import type { CopilotCtx } from './guard'

export type CopilotIntent =
  | 'action_request' // draft rx / order labs / schedule follow-up (Phase B)
  | 'pre_visit_brief' // next patient brief (Phase D1)
  | 'analytics' // practice analytics / trends (Phase D2)
  | 'rx_pattern' // prescribing pattern analysis + template proposal (Phase D3)
  | 'queue_stats' // aaj ka queue / kitne pending / total
  | 'booking_by_token' // token se booking (SHARMA-013, GEN-001…)
  | 'booking_by_appointment' // appointment ID se booking
  | 'patient_summary' // mobile se poori history summary
  | 'patient_search_name' // naam se patient (isko doctor ne dekha hai)
  | 'recent_rx' // haal ki prescriptions
  | 'top_medicines' // sabse zyada likhi dawaiyan
  | 'earnings' // is mahine ki kamai / booking count
  | 'disease_split' // disease-wise distribution
  | 'followups' // aane wale follow-ups
  | 'general' // greeting / chit-chat / anything else

export interface RouterResult {
  intent: CopilotIntent
  mobile?: string
  token?: string
  appointmentNo?: string
  name?: string
  limit?: number
}

const INTENTS: CopilotIntent[] = [
  'action_request',
  'pre_visit_brief',
  'analytics',
  'rx_pattern',
  'queue_stats',
  'booking_by_token',
  'booking_by_appointment',
  'patient_summary',
  'patient_search_name',
  'recent_rx',
  'top_medicines',
  'earnings',
  'disease_split',
  'followups',
  'general',
]

const ROUTER_PROMPT = `You classify a doctor's message for their clinic AI assistant. Reply with ONLY a JSON object, no markdown fences, in this exact shape:

{"intent":"<one of the list>","mobile":"","token":"","appointmentNo":"","name":"","limit":0}

Intent list:
- action_request: doctor asks you to DO something — draft/write a prescription, order lab tests, or schedule a follow-up (e.g. "prescription likho", "draft rx for Rahul", "CBC order karo", "follow up next week"). Also extract the patient reference (mobile/name/token/appointmentNo) like the intents below.
- pre_visit_brief: doctor wants the NEXT patient's pre-visit brief/context — "next patient", "agli patient", "next patient brief/summary/kaun hai", "pre-visit brief", "DERM-001 ka brief" → put the token in "token" if a specific queue token (LETTERS-digits) is mentioned
- analytics: practice-level analytics/trends/insights — "analytics", "practice overview", "monthly trend", "last 3 months stats", "insights", "no-show rate", "new vs repeat patients", "busiest day"
- rx_pattern: prescribing pattern analysis or template creation from history — "meri prescribing pattern", "common combos", "medicine combination pattern", "template banao/suggest karo", "pattern dikhao"
- queue_stats: asks about today's queue/tokens/pending/total patients today
- booking_by_token: mentions a queue token like SHARMA-013, GEN-001, EMR-004 (letters-dash-digits) → put it in "token"
- booking_by_appointment: mentions an appointment ID like DR-12345678, APT-..., DOC-... → put it in "appointmentNo"
- patient_summary: asks about a patient by MOBILE NUMBER (10 digits) or asks full history/summary by phone → put digits in "mobile"
- patient_search_name: asks to find patient(s) by NAME → put name in "name"
- recent_rx: asks about recent prescriptions written
- top_medicines: asks which medicines are prescribed most
- earnings: asks about fees/revenue/earnings this month
- disease_split: asks disease-wise breakdown/distribution
- followups: asks about upcoming follow-up visits
- general: greetings, thanks, capability questions, or anything unmatched

Rules: extract only what is present; leave others empty; limit is a number 1-25 (default 10). If a message contains BOTH a mobile number and something else, prefer patient_summary — EXCEPT when the doctor asks to draft/order/schedule, then prefer action_request. "Next patient" without other specifics → pre_visit_brief. A message about "pattern" with medicines/templates → rx_pattern; a message about overall stats/trends/months → analytics.`

/** Cheap deterministic fast-path for obvious action requests (no LLM call). */
const ACTION_FASTPATH = [
  /prescription\s+(likh|banao|bana|draft|prepare|start|create)/i,
  /(likh|draft|banao|prepare)\s+(a\s+)?(rx|prescription)/i,
  /\brx\s+(likh|banao|draft|prepare)/i,
  /(lab|test|blood test|pathology)\w*\s*(order|karao|karo|book|bhej|send|karwao)/i,
  /order\s+(cbc|lipid|hba1c|thyroid|blood|urine|test|lab)/i,
  /follow\s?-?\s?up\s+(schedule|set|book|fix|rakho|banao|kar)/i,
  /(next visit|review)\s+(schedule|set|book|fix|rakho)/i,
]

/** Fast-paths for the Phase D intents (checked BEFORE action, order matters). */
const BRIEF_FASTPATH = [
  /\b(pre.?visit|visit)\s*brief\b/i,
  /\bbrief\b.*\b(patient|visit|next|queue)\b/i,
  /\b(next|agli|agla|agli)\s+(patient|appointment|booking|case)\b/i,
]
const PATTERN_FASTPATH = [
  /(prescrib\w*|prescription|rx|medicine|med)\s*(pattern|combo|combination)s?/i,
  /template\s*(banao|bana|save|create|suggest|suggest karo|dikha)/i,
  /\bpattern\b.*\b(dikhao|batao|analy|kya)/i,
]
const ANALYTICS_FASTPATH = [
  /\banalytics\b/i,
  /\binsights?\b/i,
  /practice\s+(stats|statistics|overview|report)/i,
  /(monthly|month)\s*(trend|overview|summary|stats|report)/i,
  /last\s+\d+\s*(month|mahine|mahina|maheene)/i,
  /(no.?show|no show)\s*(rate|kitne|stats)/i,
  /(new|repeat)\s+(vs\.?\s*)?(patient|visit)/i,
  /busiest\s+(day|weekday)/i,
]

export async function classifyIntent(message: string, _ctx: CopilotCtx): Promise<RouterResult> {
  // Fast path: Phase D intents first (highest precision, e.g. "prescribing pattern" ≠ prescription draft)
  const briefHit = BRIEF_FASTPATH.some((re) => re.test(message))
  const patternHit = PATTERN_FASTPATH.some((re) => re.test(message))
  const analyticsHit = ANALYTICS_FASTPATH.some((re) => re.test(message))
  if (briefHit || patternHit || analyticsHit) {
    // Priority: brief > pattern > analytics when multiple match by accident
    const result: RouterResult = {
      intent: briefHit ? 'pre_visit_brief' : patternHit ? 'rx_pattern' : 'analytics',
    }
    const token = message.match(/\b([A-Za-z]{2,8})-(\d{1,4})\b/)
    if (token) result.token = `${token[1]}-${token[2]}`.toUpperCase()
    return result
  }

  // Fast path: obvious action verbs skip the LLM router call entirely
  if (ACTION_FASTPATH.some((re) => re.test(message))) {
    const result: RouterResult = { intent: 'action_request' }
    const mobile = message.match(/\b[6-9]\d{9}\b/)
    if (mobile) result.mobile = mobile[0]
    const token = message.match(/\b[A-Z]{2,8}-\d{1,4}\b/)
    if (token) result.token = token[0]
    return result
  }

  const fallback: RouterResult = { intent: 'general' }
  try {
    const raw = await chatComplete([
      { role: 'system', content: ROUTER_PROMPT },
      { role: 'user', content: message.slice(0, 2000) },
    ])
    const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    if (!jsonStr) return fallback
    const parsed = JSON.parse(jsonStr) as Partial<RouterResult>
    if (!parsed.intent || !INTENTS.includes(parsed.intent)) return fallback
    const result: RouterResult = { intent: parsed.intent }
    if (parsed.mobile && /\d{4,}/.test(String(parsed.mobile))) {
      const digits = String(parsed.mobile).replace(/\D/g, '')
      if (digits.length >= 4) result.mobile = digits
    }
    if (parsed.token && /^[A-Za-z]{2,8}-\d{1,4}$/.test(String(parsed.token).trim())) {
      result.token = String(parsed.token).trim().toUpperCase()
    }
    if (parsed.appointmentNo && String(parsed.appointmentNo).trim().length >= 3) {
      result.appointmentNo = String(parsed.appointmentNo).trim()
    }
    if (parsed.name && String(parsed.name).trim().length >= 2) {
      result.name = String(parsed.name).trim()
    }
    const limitNum = Number(parsed.limit)
    if (Number.isFinite(limitNum) && limitNum > 0) result.limit = Math.min(limitNum, 25)
    return result
  } catch {
    return fallback
  }
}
