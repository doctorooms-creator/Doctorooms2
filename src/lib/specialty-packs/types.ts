/**
 * SPECIALTY STARTER PACKS — type definitions + structural validator.
 *
 * A pack is a git-versioned TS file that mirrors our per-doctor master
 * tables 1:1 (see docs/specialty-packs/02-PACK-CONTENT-MATRIX.md).
 * Installation copies these rows into the doctor's own masters inside
 * one idempotent transaction — the RX wizard never changes.
 *
 * Language convention (matches existing seeds):
 *   - `detail` / `question` / `text` / `label` / `name`  → Hindi (primary, shown in UI/print)
 *   - `detailEn` / `questionEn` / `textEn` / `labelEn` / `nameEn` → English (searchable)
 *   - Medicine names stay English (brand names).
 */

// ── Meta ────────────────────────────────────────────────────────────────

export type PackTier = 'T1' | 'T2' | 'T3' | 'BASE'

export interface PackMeta {
  /** Registry code, e.g. 'GP-01' */
  code: string
  /** Semantic version of the content (MAJOR.MINOR.PATCH) */
  version: string
  tier: PackTier
  /** Human label shown in UI, e.g. 'General Practice Starter Pack' */
  title: string
  /** MBBS/MD reviewer name — empty string = unverified-dose mode */
  reviewedBy?: string
  reviewedAt?: string
  /** Where content came from (NLEM 2023, IAP schedule, …) */
  sourceNotes?: string
}

// ── Content item types (local keys, resolved at install time) ───────────

export interface PackCategory {
  key: string
  name: string
  nameEn: string
}

export interface PackComplaint {
  code: string
  categoryKey: string
  detail: string
  detailEn: string
}

export interface PackQuestion {
  complaintCode: string
  question: string
  questionEn: string
  explanation?: string
}

export interface PackSuggestion {
  /** Index into the pack's `questions` array */
  questionIndex: number
  text: string
  textEn: string
}

export interface PackLabel {
  label: string
  labelEn: string
  unit: string
  showUnit?: boolean
}

export interface PackFinding {
  key: string
  name: string
  nameEn: string
  icd10?: string
}

/** Safety flags carried in pack meta → surfaced in UI + review sheets. */
export interface MedicineFlags {
  /** 'safe' | 'caution' | 'avoid' | 'na' */
  pregnancy: 'safe' | 'caution' | 'avoid' | 'na'
  /** 'weight-based' | 'fixed' | 'na' */
  pediatric: 'weight-based' | 'fixed' | 'na'
  /** India drug schedule: 'H' | 'H1' | 'X' | 'OTC' | 'na' */
  schedule: 'H' | 'H1' | 'X' | 'OTC' | 'na'
  /** true only after per-item MBBS review sign-off */
  verified: boolean
}

export interface PackMedicine {
  name: string
  /** Salt/composition — stored into `description` */
  salt: string
  /** Dose options shown as choices (JSON-stringified into `dose`) */
  doseOptions: string[]
  /** Default frequency (0 = none, 1 = once, 2 = twice at that slot) */
  morning: number
  afternoon: number
  evening: number
  /** Dispense quantity multiplier */
  tab: number
  flags?: MedicineFlags
}

export interface PackFindingMed {
  findingKey: string
  /** Medicine NAME — must match an entry in pack.medicines (validated). */
  medicineName: string
  /** Per-finding overrides (empty = inherit medicine defaults) */
  dose?: string
  morning?: number
  afternoon?: number
  evening?: number
  tab?: number
  description?: string
}

export interface PackTableTemplate {
  name: string
  rows: number
  cols: number
  headerLabel: string[]
  colsLabel: string[]
  footerLabel: string[]
  extraLabel?: string
}

export interface PackRxTemplate {
  name: string
  diagnosis: string
  /** Names of medicines (resolved against pack medicines at install) */
  medicines: { name: string; dose: string; duration: string; instructions?: string }[]
  labs: string[]
  advice: string
  followUpDays: number
  isCommon?: boolean
}

// ── The pack itself ─────────────────────────────────────────────────────

export interface SpecialtyPack {
  meta: PackMeta
  categories: PackCategory[]
  complaints: PackComplaint[]
  questions: PackQuestion[]
  suggestions: PackSuggestion[]
  labels: PackLabel[]
  findings: PackFinding[]
  medicines: PackMedicine[]
  findingMeds: PackFindingMed[]
  tables: PackTableTemplate[]
  rxTemplates: PackRxTemplate[]
}

// ── Structural validator (runs at install + in lint-time sanity script) ─

export interface PackValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
}

export function validatePack(pack: SpecialtyPack): PackValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const m = pack.meta

  if (!m.code || !m.version || !m.tier || !m.title) {
    errors.push('meta: code/version/tier/title are required')
  }

  // Uniqueness
  const catKeys = new Set<string>()
  for (const c of pack.categories) {
    if (!c.key) errors.push(`category missing key: ${JSON.stringify(c)}`)
    if (catKeys.has(c.key)) errors.push(`duplicate category key: ${c.key}`)
    catKeys.add(c.key)
  }

  const coCodes = new Set<string>()
  for (const c of pack.complaints) {
    if (!c.code) errors.push(`complaint missing code: ${c.detailEn || c.detail}`)
    if (coCodes.has(c.code)) errors.push(`duplicate complaint code: ${c.code}`)
    coCodes.add(c.code)
    if (!catKeys.has(c.categoryKey)) {
      errors.push(`complaint ${c.code} references unknown categoryKey: ${c.categoryKey}`)
    }
  }

  const medNames = new Set<string>()
  pack.medicines.forEach((med, idx) => {
    if (!med.name) errors.push(`medicine[${idx}] missing name`)
    const lower = med.name.toLowerCase()
    if (medNames.has(lower)) errors.push(`duplicate medicine name (case-insensitive): ${med.name}`)
    medNames.add(lower)
    if (!med.doseOptions.length && !med.flags?.verified) {
      warnings.push(`medicine ${med.name}: no dose options and unverified — doctor will enter dose manually`)
    }
  })

  // Link integrity
  const findingKeys = new Set(pack.findings.map((f) => f.key))
  for (const f of pack.findings) {
    if (!f.key) errors.push(`finding missing key: ${f.nameEn || f.name}`)
  }

  pack.questions.forEach((q, idx) => {
    if (!coCodes.has(q.complaintCode)) {
      errors.push(`question[${idx}] references unknown complaintCode: ${q.complaintCode}`)
    }
  })

  pack.suggestions.forEach((s, idx) => {
    const q = pack.questions[s.questionIndex]
    if (!q) {
      errors.push(
        `suggestion[${idx}] references out-of-range questionIndex: ${s.questionIndex}`
      )
    } else if (!s.text || !s.textEn) {
      warnings.push(`suggestion for "${q.questionEn}" missing bilingual text`)
    }
  })

  pack.findingMeds.forEach((fm, idx) => {
    if (!findingKeys.has(fm.findingKey)) {
      errors.push(`findingMeds[${idx}] references unknown findingKey: ${fm.findingKey}`)
    }
    if (!fm.medicineName || !medNames.has(fm.medicineName.toLowerCase())) {
      errors.push(
        `findingMeds[${idx}] references unknown medicineName: ${fm.medicineName}`
      )
    }
  })

  pack.rxTemplates.forEach((t, idx) => {
    for (const med of t.medicines) {
      if (!medNames.has(med.name.toLowerCase())) {
        errors.push(`rxTemplate[${idx}] "${t.name}" references unknown medicine: ${med.name}`)
      }
    }
  })

  // Volume sanity (bloat guard)
  if (pack.complaints.length > 120) warnings.push(`complaints count ${pack.complaints.length} unusually high`)
  if (pack.medicines.length > 300) warnings.push(`medicines count ${pack.medicines.length} unusually high`)

  return { ok: errors.length === 0, errors, warnings }
}

/** Item counts for install receipts / banners. */
export function packCounts(pack: SpecialtyPack) {
  return {
    categories: pack.categories.length,
    complaints: pack.complaints.length,
    questions: pack.questions.length,
    suggestions: pack.suggestions.length,
    labels: pack.labels.length,
    findings: pack.findings.length,
    medicines: pack.medicines.length,
    findingMeds: pack.findingMeds.length,
    tables: pack.tables.length,
    rxTemplates: pack.rxTemplates.length,
  }
}

/** One-line summary for toasts: "25 complaints · 62 medicines · 50 questions". */
export function packSummary(pack: SpecialtyPack): string {
  const c = packCounts(pack)
  return `${c.complaints} complaints · ${c.medicines} medicines · ${c.questions} questions`
}
