/**
 * SPECIALTY REGISTRY — single source of truth for every medical
 * practitioner type we serve (see docs/specialty-packs/01-DOCTOR-TAXONOMY.md).
 *
 * Pure TypeScript constants — safe to import on client AND server.
 *
 * Consumers:
 *   - Doctor onboarding dropdown (replaces the old hardcoded list)
 *   - Admin create-doctor flows (future)
 *   - install.ts → resolvePackForSpecialization() picks the pack to install
 *
 * Rules:
 *   - `packCode` = which starter pack content exists TODAY (PACKS map).
 *     Specialties without a pack yet fall back to the GP-01 BASE pack —
 *     every new doctor gets a non-empty account, nobody ships blank.
 *   - `showInOnboarding` = appears in the onboarding dropdown. We only
 *     surface specialties whose pack exists OR that were already in the
 *     legacy 11-item list (no UX regression).
 *   - `module`-routed specialties (Pathology → Lab etc.) are NOT in the
 *     onboarding dropdown; they use other product modules.
 */

export type SpecialtyTier = 'T1' | 'T2' | 'T3' | 'BASE' | 'MODULE'

export interface SpecialtyEntry {
  /** Canonical code, e.g. 'PED-01' */
  code: string
  /** Doctor-facing display name (English — kept identical to legacy dropdown where possible) */
  name: string
  tier: SpecialtyTier
  /** Pack content available today; null = no pack yet (falls back to BASE) */
  packCode: string | null
  /** Show in doctor onboarding dropdown */
  showInOnboarding: boolean
  /** Product module for non-RX specialties */
  module?: 'lab' | 'ot' | 'physio' | 'ayush'
  /** Patient-facing aliases (future SEO for /doctors listing) */
  patientAliases?: string[]
}

export const SPECIALTY_REGISTRY: SpecialtyEntry[] = [
  // ── BASE ──────────────────────────────────────────────────────────────
  {
    code: 'GP-01',
    name: 'General Physician',
    tier: 'BASE',
    packCode: 'GP-01',
    showInOnboarding: true,
    patientAliases: ['Family Doctor', 'General Practitioner'],
  },

  // ── TIER 1 (launch packs) ─────────────────────────────────────────────
  {
    code: 'MED-01',
    name: 'Internal Medicine Specialist',
    tier: 'T1',
    packCode: 'MED-01',
    showInOnboarding: true,
    patientAliases: ['Physician'],
  },
  {
    code: 'PED-01',
    name: 'Pediatrician',
    tier: 'T1',
    packCode: 'PED-01',
    showInOnboarding: true,
    patientAliases: ['Child Specialist'],
  },
  {
    code: 'OBG-01',
    name: 'Gynecologist',
    tier: 'T1',
    packCode: 'OBG-01',
    showInOnboarding: true,
    patientAliases: ['Gynecologist & Obstetrician', 'Lady Doctor'],
  },
  {
    code: 'ORT-01',
    name: 'Orthopedist',
    tier: 'T1',
    packCode: 'ORT-01',
    showInOnboarding: true,
    patientAliases: ['Bone Doctor', 'Orthopedic Surgeon'],
  },
  {
    code: 'DRM-01',
    name: 'Dermatologist',
    tier: 'T1',
    packCode: 'DRM-01',
    showInOnboarding: true,
    patientAliases: ['Skin Specialist'],
  },
  {
    code: 'ENT-01',
    name: 'ENT Specialist',
    tier: 'T1',
    packCode: 'ENT-01',
    showInOnboarding: true,
    patientAliases: ['Ear Nose Throat Doctor'],
  },
  {
    code: 'SUR-01',
    name: 'General Surgeon',
    tier: 'T1',
    packCode: 'SUR-01',
    showInOnboarding: true,
    patientAliases: ['Surgeon'],
  },
  {
    code: 'DEN-01',
    name: 'Dentist',
    tier: 'T1',
    packCode: 'DEN-01',
    showInOnboarding: true,
    patientAliases: ['Dental Surgeon'],
  },
  {
    code: 'DIA-01',
    name: 'Diabetologist',
    tier: 'T1',
    packCode: 'DIA-01',
    showInOnboarding: true,
    patientAliases: ['Diabetes Doctor', 'Sugar Doctor'],
  },

  // ── TIER 2 (standard packs, fast-follow) ──────────────────────────────
  {
    code: 'OPH-01',
    name: 'Ophthalmologist',
    tier: 'T2',
    packCode: 'OPH-01',
    showInOnboarding: true,
    patientAliases: ['Eye Specialist'],
  },
  {
    code: 'PSY-01',
    name: 'Psychiatrist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: true,
  },
  {
    code: 'PUL-01',
    name: 'Pulmonologist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: false,
    patientAliases: ['Chest Specialist'],
  },
  {
    code: 'CAR-01',
    name: 'Cardiologist',
    tier: 'T2',
    packCode: 'CAR-01',
    showInOnboarding: true,
    patientAliases: ['Heart Doctor'],
  },
  {
    code: 'NEU-01',
    name: 'Neurologist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: true,
    patientAliases: ['Nerve Specialist', 'Brain Doctor'],
  },
  {
    code: 'URO-01',
    name: 'Urologist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: false,
    patientAliases: ['Kidney & Urinary Specialist'],
  },
  {
    code: 'GAS-01',
    name: 'Gastroenterologist',
    tier: 'T2',
    packCode: 'GAS-01',
    showInOnboarding: true,
    patientAliases: ['Stomach Specialist'],
  },
  {
    code: 'END-01',
    name: 'Endocrinologist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: false,
    patientAliases: ['Thyroid & Hormone Specialist'],
  },
  {
    code: 'NEP-01',
    name: 'Nephrologist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: false,
    patientAliases: ['Kidney Specialist'],
  },
  {
    code: 'REP-01',
    name: 'IVF & Fertility Specialist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: false,
  },
  {
    code: 'ONC-01',
    name: 'Oncologist',
    tier: 'T2',
    packCode: null,
    showInOnboarding: true,
    patientAliases: ['Cancer Specialist'],
  },

  // ── TIER 3 (lite packs, on-demand) ────────────────────────────────────
  { code: 'PSU-01', name: 'Plastic Surgeon', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'NSU-01', name: 'Neurosurgeon', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'CTV-01', name: 'Cardiothoracic Surgeon', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'PSU-02', name: 'Pediatric Surgeon', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'SON-01', name: 'Surgical Oncologist', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'RHE-01', name: 'Rheumatologist', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'GER-01', name: 'Geriatrician', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'EME-01', name: 'Emergency Medicine Specialist', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'PMR-01', name: 'Physical Medicine & Rehab Specialist', tier: 'T3', packCode: null, showInOnboarding: false, module: 'physio' },
  { code: 'INF-01', name: 'Infectious Disease Specialist', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'DOR-01', name: 'Orthodontist', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'DEN-02', name: 'Endodontist (Root Canal)', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'DEN-03', name: 'Oral & Maxillofacial Surgeon', tier: 'T3', packCode: null, showInOnboarding: false },
  { code: 'DEN-04', name: 'Pedodontist (Child Dentist)', tier: 'T3', packCode: null, showInOnboarding: false },

  // ── AYUSH / Allied (module routing, later phases) ─────────────────────
  { code: 'AYU-01', name: 'Ayurvedic Doctor (BAMS)', tier: 'T3', packCode: null, showInOnboarding: false, module: 'ayush' },
  { code: 'HOM-01', name: 'Homeopath (BHMS)', tier: 'T3', packCode: null, showInOnboarding: false, module: 'ayush' },
  { code: 'UNA-01', name: 'Unani Doctor (BUMS)', tier: 'T3', packCode: null, showInOnboarding: false, module: 'ayush' },
  { code: 'PHY-01', name: 'Physiotherapist (BPT)', tier: 'T3', packCode: null, showInOnboarding: false, module: 'physio' },

  // ── MODULE-ROUTED (no RX pack — these live in Lab/OT modules) ─────────
  { code: 'PTH-01', name: 'Pathologist', tier: 'MODULE', packCode: null, showInOnboarding: false, module: 'lab' },
  { code: 'RAD-01', name: 'Radiologist', tier: 'MODULE', packCode: null, showInOnboarding: false, module: 'lab' },
  { code: 'ANE-01', name: 'Anesthesiologist', tier: 'MODULE', packCode: null, showInOnboarding: false, module: 'ot' },
  { code: 'TRF-01', name: 'Transfusion Medicine Specialist', tier: 'MODULE', packCode: null, showInOnboarding: false, module: 'lab' },
]

/**
 * Legacy/variant strings → canonical entry name. Handles doctors
 * registered before the registry existed (stored free-text values).
 */
export const SPECIALTY_ALIASES: Record<string, string> = {
  // legacy dropdown values (exact current strings)
  'general physician': 'General Physician',
  'general practitioner': 'General Physician',
  'family medicine': 'General Physician',
  'general medicine': 'Internal Medicine Specialist',
  physician: 'Internal Medicine Specialist',
  mbbs: 'General Physician',
  pediatrician: 'Pediatrician',
  paediatrician: 'Pediatrician',
  'child specialist': 'Pediatrician',
  gynecologist: 'Gynecologist',
  gynaecologist: 'Gynecologist',
  'gynecologist & obstetrician': 'Gynecologist',
  'obstetrician & gynecologist': 'Gynecologist',
  obg: 'Gynecologist',
  'obs & gyn': 'Gynecologist',
  orthopedist: 'Orthopedist',
  orthopaedist: 'Orthopedist',
  'orthopedic surgeon': 'Orthopedist',
  'bone doctor': 'Orthopedist',
  dermatologist: 'Dermatologist',
  'skin specialist': 'Dermatologist',
  'ent specialist': 'ENT Specialist',
  ent: 'ENT Specialist',
  'general surgeon': 'General Surgeon',
  surgeon: 'General Surgeon',
  dentist: 'Dentist',
  'dental surgeon': 'Dentist',
  diabetologist: 'Diabetologist',
  'diabetes specialist': 'Diabetologist',
  cardiologist: 'Cardiologist',
  'heart specialist': 'Cardiologist',
  neurologist: 'Neurologist',
  psychiatrist: 'Psychiatrist',
  oncologist: 'Oncologist',
  'cancer specialist': 'Oncologist',
  ophthalmologist: 'Ophthalmologist',
  'eye specialist': 'Ophthalmologist',
  pulmonologist: 'Pulmonologist',
  'chest specialist': 'Pulmonologist',
}

/** Specialties shown in the doctor onboarding dropdown (ordered). */
export function onboardingSpecialties(): SpecialtyEntry[] {
  return SPECIALTY_REGISTRY.filter((s) => s.showInOnboarding)
}

/** Case-insensitive + alias-aware lookup by any stored/display string. */
export function findSpecialty(input: string): SpecialtyEntry | null {
  const raw = (input || '').trim().toLowerCase()
  if (!raw) return null

  // 1. direct code match
  const byCode = SPECIALTY_REGISTRY.find((s) => s.code.toLowerCase() === raw)
  if (byCode) return byCode

  // 2. canonical name match
  const byName = SPECIALTY_REGISTRY.find((s) => s.name.toLowerCase() === raw)
  if (byName) return byName

  // 3. alias table
  const canonical = SPECIALTY_ALIASES[raw]
  if (canonical) {
    return SPECIALTY_REGISTRY.find((s) => s.name.toLowerCase() === canonical.toLowerCase()) || null
  }

  // 4. fuzzy contains (e.g. "Consultant Pediatrician" typed manually)
  const fuzzy = SPECIALTY_REGISTRY.find(
    (s) => s.name.toLowerCase().includes(raw) || raw.includes(s.name.toLowerCase())
  )
  if (fuzzy) return fuzzy

  return null
}

/**
 * Fallback chain (docs/specialty-packs/01-DOCTOR-TAXONOMY.md §6.1):
 *   exact specialty pack → GP-01 BASE pack.
 * Always resolves — every doctor gets content.
 */
export function resolvePackCode(specialization: string): string {
  const entry = findSpecialty(specialization)
  if (entry?.packCode) return entry.packCode
  return 'GP-01'
}
