/**
 * Dr. Copilot — Approve-Card shared types (Phase B + D)
 *
 * PURE TYPES ONLY — no imports. Safe to import from both server modules
 * (agents/actions.ts, api routes) and the client panel component.
 *
 * Data flow (RULE #1 preserved end-to-end):
 *   doctor message → extractActionDraft (LLM, structure only)
 *   → patient resolved via SCOPED repo (ctx.doctorId filter)
 *   → checkSafety (deterministic) → CopilotAction row (pending)
 *   → card shown → doctor taps Approve → /api/copilot/action/[id]
 *   → server re-verifies ownership and writes through PRODUCTION pathways.
 *
 * Phase D adds kind 'template_save' (pattern agent proposes an Rx template
 * from the doctor's own prescribing history — no patient involved).
 */

export type CopilotActionKind = 'rx_draft' | 'lab_order' | 'followup' | 'template_save'

export interface ActionMedicine {
  medicine: string
  dose: string
  morning: number
  afternoon: number
  evening: number
  tab: number
}

/** What the LLM extracts from the doctor's message (structure only, no DB). */
export interface ActionDraft {
  kind: CopilotActionKind
  patientRef: {
    mobile?: string
    name?: string
    token?: string
    appointmentNo?: string
  }
  disease?: string
  notes?: string
  // rx_draft
  medicines?: ActionMedicine[]
  // lab_order
  tests?: string[]
  // followup — 'YYYY-MM-DD' or '+Nd' relative
  followupDate?: string
}

/** Structured payload persisted in CopilotAction.payloadJson. */
export interface ActionPayload {
  kind: CopilotActionKind
  bookingId: string
  appointmentNo: string
  patientName: string
  patientMobile: string
  patientAge: number | null
  patientGender: string | null
  patientUserId: string
  disease: string
  // rx_draft
  medicines?: ActionMedicine[]
  // lab_order
  tests?: string[]
  // followup — absolute 'YYYY-MM-DD'
  followupDate?: string
  notes?: string
  // template_save (Phase D pattern agent) — patient fields are placeholders
  templateName?: string
  templateDiagnosis?: string
  templateFollowUpDays?: number
  /** How many past prescriptions used this exact medicine combo. */
  templateUseCount?: number
}

/** Chart payload for the analytics agent (SSE event `chart`, persisted in meta). */
export interface CopilotChart {
  title: string
  labels: string[]
  values: number[]
  /** e.g. '₹' for revenue, '' for counts */
  unit?: string
  /** Short takeaway rendered under the chart (deterministic, from repo data). */
  note?: string
}

/** Card shape sent over SSE, stored in metaJson.actions[], rendered by panel. */
export interface CopilotActionCard {
  id: string
  kind: CopilotActionKind
  status: 'pending' | 'approved' | 'rejected'
  patientName: string
  appointmentNo: string
  summary: string
  items: string[]
  safety: {
    level: 'ok' | 'warning' | 'blocked'
    reasons: string[]
  }
  /** Filled after execution — shown on approved cards. */
  result?: {
    message: string
    link?: string
  }
}
