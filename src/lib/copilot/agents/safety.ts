/**
 * Dr. Copilot — SAFETY AGENT (Phase B)
 *
 * Deterministic rule checker that runs on every proposed CopilotAction
 * BEFORE it is shown to the doctor. Pure functions, ZERO LLM calls, ZERO
 * database access — all inputs are passed in, so this is trivially testable.
 *
 * Verdicts:
 *   ok      → card can be approved directly
 *   warning → card shown with amber cautions; doctor can still approve
 *   blocked → card rendered read-only (approve disabled) with reasons
 *
 * The checker is intentionally conservative: it never blocks on age/pregnancy
 * alone (those are warnings for the doctor to consider), but it does block
 * structurally invalid drafts (empty med list, impossible frequencies,
 * follow-up dates in the past).
 */

export type SafetyLevel = 'ok' | 'warning' | 'blocked'

export interface SafetyVerdict {
  level: SafetyLevel
  reasons: string[]
}

// ─── Reference tables (small, deterministic, readable) ───────────────────

const HIGH_ALERT_MEDS: { match: RegExp; label: string }[] = [
  { match: /prednis(ol|on)e/i, label: 'corticosteroid' },
  { match: /dexamethasone/i, label: 'corticosteroid' },
  { match: /methotrexate/i, label: 'methotrexate' },
  { match: /warfarin/i, label: 'warfarin' },
  { match: /insulin/i, label: 'insulin' },
  { match: /digoxin/i, label: 'digoxin' },
  { match: /tramadol|codeine|morphine/i, label: 'opioid' },
  { match: /lithium/i, label: 'lithium' },
]

const ANTIBIOTICS = /azithromycin|amoxi(illin|clav)|ciprofloxacin|levofloxacin|doxycycline|ceftriaxone|cefixime|ofloxacin|clarithromycin|metronidazole/i

/** Both members present in the same draft → interaction warning. */
const INTERACTION_PAIRS: { a: RegExp; b: RegExp; note: string }[] = [
  { a: /warfarin/i, b: /aspirin|clopidogrel/i, note: 'Warfarin + antiplatelet — bleeding risk' },
  { a: /warfarin/i, b: /ibuprofen|diclofenac|naproxen/i, note: 'Warfarin + NSAID — bleeding risk' },
  { a: /methotrexate/i, b: /ibuprofen|diclofenac|naproxen|aspirin/i, note: 'Methotrexate + NSAID — toxicity risk' },
  { a: /tramadol/i, b: /fluoxetine|sertraline|escitalopram|paroxetine/i, note: 'Tramadol + SSRI — serotonin syndrome risk' },
  { a: /spironolactone/i, b: /potassium/i, note: 'Spironolactone + potassium — hyperkalemia risk' },
  { a: /metformin/i, b: /prednis(ol|on)e|dexamethasone/i, note: 'Metformin + corticosteroid — glycemic control conflict' },
]

export interface RxDraftInput {
  kind: 'rx_draft'
  medicines: { medicine: string; dose: string; morning: number; afternoon: number; evening: number; tab: number }[]
  patientAge: number | null
  patientGender: string | null
  /** Medicines from the patient's most recent prescription by THIS doctor. */
  recentMedicines: string[]
}

export interface LabOrderInput {
  kind: 'lab_order'
  tests: string[]
}

export interface FollowupInput {
  kind: 'followup'
  dateISO: string
  todayISO: string
}

export interface TemplateInput {
  kind: 'template_save'
  medicines: string[]
}

export function checkSafety(input: RxDraftInput | LabOrderInput | FollowupInput | TemplateInput): SafetyVerdict {
  if (input.kind === 'rx_draft') return checkRx(input)
  if (input.kind === 'lab_order') return checkLab(input)
  if (input.kind === 'template_save') return checkTemplate(input)
  return checkFollowup(input)
}

// ─── template_save (Phase D — pattern agent) ───────────────────────────

function checkTemplate(input: TemplateInput): SafetyVerdict {
  const warns: string[] = []
  const blocks: string[] = []
  const meds = input.medicines.map((m) => m.trim()).filter(Boolean)

  if (meds.length === 0) blocks.push('No medicines in the pattern — nothing to save.')
  if (meds.length > 6) blocks.push('Template has more than 6 medicines — keep templates focused.')

  const seen = new Set<string>()
  for (const m of meds) {
    const key = m.toLowerCase()
    if (seen.has(key)) blocks.push(`Duplicate medicine in template: ${m}.`)
    seen.add(key)
  }

  for (const { match, label } of HIGH_ALERT_MEDS) {
    if (meds.some((m) => match.test(m))) {
      warns.push(`Template contains a high-alert medicine (${label}) — it will prefill on every use.`)
    }
  }

  if (blocks.length) return { level: 'blocked', reasons: blocks }
  if (warns.length) return { level: 'warning', reasons: warns }
  return { level: 'ok', reasons: [] }
}

// ─── rx_draft ─────────────────────────────────────────────────────────────

function checkRx(input: RxDraftInput): SafetyVerdict {
  const warns: string[] = []
  const blocks: string[] = []
  const meds = input.medicines

  if (meds.length === 0) blocks.push('No medicines in the draft.')
  if (meds.length > 10) blocks.push('More than 10 medicines in one prescription is not allowed.')

  const seen = new Map<string, number>()
  for (const m of meds) {
    const name = m.medicine.trim()
    if (!name) blocks.push('A medicine row has an empty name.')

    const daily = (m.morning || 0) + (m.afternoon || 0) + (m.evening || 0)
    if (daily > 3) blocks.push(`${name || '(unnamed)'}: ${daily} doses/day exceeds 3.`)
    if (m.morning < 0 || m.afternoon < 0 || m.evening < 0) blocks.push(`${name || '(unnamed)'}: negative dose count.`)
    if (m.tab > 60) blocks.push(`${name || '(unnamed)'}: quantity ${m.tab} tabs looks wrong.`)
    if (m.tab <= 0) warns.push(`${name}: quantity is 0 — confirm tablet count.`)

    const key = name.toLowerCase()
    if (key && seen.has(key)) blocks.push(`Duplicate medicine in draft: ${name}.`)
    if (key) seen.set(key, (seen.get(key) || 0) + 1)
  }

  // Age / population cautions (warnings, not blocks — doctor decides)
  if (input.patientAge != null && input.patientAge < 12) {
    warns.push(`Patient is ${input.patientAge}y (paediatric) — verify paediatric dosing.`)
  }
  if (input.patientAge != null && input.patientAge >= 65) {
    warns.push('Patient is ≥65y — consider renal function and dose reduction.')
  }
  const isFemale = (input.patientGender || '').toLowerCase().startsWith('f')
  if (isFemale && input.patientAge != null && input.patientAge >= 15 && input.patientAge <= 45) {
    warns.push('Female patient 15–45y — confirm pregnancy/lactation status before prescribing.')
  }

  // High-alert medicines present in the DRAFT
  const draftNames = meds.map((m) => m.medicine)
  for (const h of HIGH_ALERT_MEDS) {
    if (draftNames.some((n) => h.match.test(n))) {
      warns.push(`High-alert medicine (${h.label}) — double-check dose & duration.`)
    }
  }

  // Interaction pairs within the draft
  for (const pair of INTERACTION_PAIRS) {
    const hasA = draftNames.some((n) => pair.a.test(n))
    const hasB = draftNames.some((n) => pair.b.test(n))
    if (hasA && hasB) warns.push(`Interaction: ${pair.note}.`)
  }

  // Duplicate therapy vs the patient's most recent Rx (this doctor's records)
  for (const n of draftNames) {
    const dup = input.recentMedicines.find((r) => r.toLowerCase().includes(n.toLowerCase().split(' ')[0]) && n.length > 3)
    if (dup) warns.push(`Duplicate therapy: ${n} was also in the last prescription (${dup}).`)
  }

  // Antibiotic stewardship: draft antibiotic while a recent Rx already had one
  const draftHasAbx = draftNames.some((n) => ANTIBIOTICS.test(n))
  const recentHasAbx = input.recentMedicines.some((r) => ANTIBIOTICS.test(r))
  if (draftHasAbx && recentHasAbx) {
    warns.push('Antibiotic course started shortly after a previous one — confirm indication.')
  }

  return verdict(blocks, warns)
}

// ─── lab_order ────────────────────────────────────────────────────────────

function checkLab(input: LabOrderInput): SafetyVerdict {
  const warns: string[] = []
  const blocks: string[] = []
  const tests = input.tests.map((t) => t.trim()).filter(Boolean)

  if (tests.length === 0) blocks.push('No tests in the order.')
  if (tests.length > 8) blocks.push('More than 8 tests in one order is not allowed.')
  const dupes = tests.filter((t, i) => tests.indexOf(t) !== i)
  if (dupes.length) blocks.push(`Duplicate tests: ${[...new Set(dupes)].join(', ')}.`)

  return verdict(blocks, warns)
}

// ─── followup ─────────────────────────────────────────────────────────────

function checkFollowup(input: FollowupInput): SafetyVerdict {
  const warns: string[] = []
  const blocks: string[] = []

  const date = new Date(`${input.dateISO}T00:00:00`)
  const today = new Date(`${input.todayISO}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    blocks.push('Invalid follow-up date.')
  } else {
    if (date < today) blocks.push('Follow-up date is in the past.')
    const maxAhead = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000)
    if (date > maxAhead) blocks.push('Follow-up date is more than 180 days ahead.')
  }

  return verdict(blocks, warns)
}

// ─── helper ───────────────────────────────────────────────────────────────

function verdict(blocks: string[], warns: string[]): SafetyVerdict {
  if (blocks.length > 0) return { level: 'blocked', reasons: blocks }
  if (warns.length > 0) return { level: 'warning', reasons: warns }
  return { level: 'ok', reasons: [] }
}
