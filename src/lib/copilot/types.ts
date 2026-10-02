/**
 * DR Copilot — shared types.
 * See DR-COPILOT-PLAN.md. RULE #1: the AI only ever sees the signed-in doctor's data.
 */

/** L1 identity context. Built ONLY from the session server-side (guard.ts). */
export interface CopilotCtx {
  doctorId: string
  doctorUserId: string
  doctorName: string
  /** e.g. "2026-08-30" — today in IST */
  todayIST: string
}

export type CopilotIntent =
  | 'my_day'          // today's schedule / queue / stats
  | 'patient_lookup'  // find a specific patient / appointment
  | 'rx_history'      // prescriptions the doctor wrote
  | 'summary'         // visit / patient summary
  | 'analytics'       // counts, trends over own data
  | 'rx_draft'        // PROPOSE a prescription draft (approve-card)
  | 'followup'        // PROPOSE a follow-up date (approve-card)
  | 'capabilities'    // what can the copilot do
  | 'chitchat'        // greetings / out-of-scope

/** Router output — decides which repo snapshot + which answer prompt to use. */
export interface RouterResult {
  intent: CopilotIntent
  /** Free-text slots the router extracted (e.g. a name, mobile, appointment no). */
  query?: string
  reason?: string
}

/** A citation shown under an answer — points at real rows the doctor owns. */
export interface CopilotCitation {
  bookingId: string
  appointmentNo: string
  patientName: string
  date: string
}

export interface CopilotMessageMeta {
  citations?: CopilotCitation[]
  intent?: CopilotIntent
  agent?: string
  blocked?: boolean
  blockedReason?: string
  /** approve-card ids attached to this assistant message */
  actions?: string[]
}

export const AGENT_NAMES: Record<string, string> = {
  router: 'Router',
  query: 'Query',
  summary: 'Summary',
}
