/**
 * Prescription vitals/labels classification helpers.
 *
 * The prescription wizard's Step 2 ("Vitals") captures BOTH the 5 common
 * vitals (weight, BP, temperature, pulse, SpO2) AND the doctor's custom
 * label measurements. Historically the print layout rendered every custom
 * label under a "LAB RESULTS" heading — which is wrong: lab reports come
 * from the lab module, and everything entered in Step 2 is a vital or an
 * in-clinic measurement.
 *
 * These helpers merge custom labels back into the vitals:
 *  - a label whose name matches a common vital (e.g. "Pulse Rate") fills
 *    that vital's slot when the common field is empty (pulse/SpO2 are only
 *    ever stored as labels);
 *  - a label duplicating an already-filled common vital is dropped, so the
 *    print never shows "Weight" twice;
 *  - everything else (Respiratory Rate, RBS, HbA1c, Height, BMI…) renders
 *    as an additional measurement chip INSIDE the Vitals section.
 */

export interface VitalFields {
  weight: string
  bp: string
  temperature: string
  pulse: string
  spo2: string
}

export interface LabelLike {
  label?: string
  labelEn?: string
  value?: string
  labelUnit?: string
  showUnit?: boolean
}

export interface MergedVitals {
  vitals: VitalFields
  /** Labels that are NOT one of the 5 common vitals (render as extra chips). */
  extraLabels: LabelLike[]
  /** Labels consumed while merging (filled an empty vital slot or were duplicates). */
  consumedLabels: LabelLike[]
}

/** Normalized names (lowercase, alphanumeric only) each vital answers to. */
const VITAL_SYNONYMS: Record<keyof VitalFields, Set<string>> = {
  weight: new Set(['weight', 'wt', 'bodyweight', 'mass']),
  bp: new Set(['bp', 'bloodpressure', 'bloodpressurebp', 'systolic', 'arterialpressure']),
  temperature: new Set(['temperature', 'temp', 'bodytemperature', 'fever']),
  pulse: new Set(['pulse', 'pulserate', 'heartrate', 'hr', 'heartratebpm', 'radialpulse']),
  spo2: new Set(['spo2', 'sp02', 'oxygensaturation', 'o2saturation', 'sao2', 'oxygen', 'sats', 'saturation']),
}

/** lowercase → strip parenthetical qualifiers → keep alphanumerics only. */
function normalizeName(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Match a label's display names (English first, then native) to one of the
 * 5 common vitals. Returns the vital key, or null for genuine custom
 * measurements (Respiratory Rate, RBS, Height, BMI, …).
 */
export function matchVitalLabel(l: { label?: string; labelEn?: string }): keyof VitalFields | null {
  const names = [l.labelEn, l.label].filter(Boolean).map((n) => normalizeName(String(n)))
  if (names.length === 0) return null
  for (const key of Object.keys(VITAL_SYNONYMS) as Array<keyof VitalFields>) {
    const synonyms = VITAL_SYNONYMS[key]
    if (names.some((n) => n.length > 0 && synonyms.has(n))) return key
  }
  return null
}

function hasValue(v: unknown): boolean {
  return typeof v === 'string' ? v.trim() !== '' : Boolean(v)
}

/**
 * Merge prescription labels into the common vitals.
 *
 * - Labels with no value are ignored entirely (they are empty wizard slots).
 * - A vital-named label fills its vital slot when that slot is empty
 *   (pulse/SpO2 only ever exist as labels) — it then renders with the
 *   standard chip formatting (e.g. "Pulse: 88 bpm").
 * - A vital-named label whose slot is already filled is dropped as a
 *   duplicate (the canonical common vital wins — no double "Weight").
 * - All other valued labels are returned as `extraLabels`.
 */
export function mergeVitalsWithLabels(vitals: Partial<VitalFields>, labels: LabelLike[] | null | undefined): MergedVitals {
  const merged: VitalFields = {
    weight: String(vitals?.weight || ''),
    bp: String(vitals?.bp || ''),
    temperature: String(vitals?.temperature || ''),
    pulse: String(vitals?.pulse || ''),
    spo2: String(vitals?.spo2 || ''),
  }
  const extraLabels: LabelLike[] = []
  const consumedLabels: LabelLike[] = []

  for (const l of labels || []) {
    if (!l || !hasValue(l.value)) continue
    const key = matchVitalLabel(l)
    if (key) {
      if (!hasValue(merged[key])) {
        merged[key] = String(l.value).trim()
      }
      // Slot already filled by the common vital → duplicate, drop the label.
      consumedLabels.push(l)
    } else {
      extraLabels.push(l)
    }
  }

  return { vitals: merged, extraLabels, consumedLabels }
}
