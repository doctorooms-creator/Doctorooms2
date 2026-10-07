# 03 — IMPLEMENTATION DESIGN
**Question this answers:** *"Ye system me kaise plug hoga bina kuch todhe?"*
**Status:** 📋 DESIGN ONLY — no development started (owner instruction)
**Design principle recap:** the RX wizard already reads per-doctor masters → installing a pack = writing rows into existing tables. The wizard never learns packs exist.

---

## 1. Design Principles

| # | Principle | Consequence |
|---|---|---|
| P1 | **Zero wizard changes** | No edits to stepper components; no new API contracts for steps 1–8 |
| P2 | **Packs are source code** | TS files in repo → typed, linted, PR-reviewed, git-versioned; no admin CMS |
| P3 | **Idempotent installs** | Install can crash/retry safely; never duplicates rows |
| P4 | **Append-only to doctors' data** | Never overwrite/delete a doctor's own rows; conflict → skip |
| P5 | **Version pinning** | Doctor keeps v1 forever unless they explicitly accept v1.1 |
| P6 | **Every DB write auditable** | `DoctorPackInstall` + audit-log entry per install |

---

## 2. Component 1 — Specialty Registry (code constant)

**File:** `src/lib/specialty-packs/registry.ts` (new)
**Shape (spec):**

```ts
interface SpecialtyEntry {
  code: string              // 'PED-01'
  name: string              // 'Pediatrician' (doctor-facing)
  nameHi?: string           // 'बच्चों का डॉक्टर' (patient-facing, later SEO)
  tier: 'T1' | 'T2' | 'T3'
  packAvailable: boolean    // false → dropdown hides it (falls back to GP-01)
  degrees: DegreeCode[]     // cascade filter (doc 01 §5)
  patientAliases?: string[] // 'Child Specialist' — booking-site naming
  module?: 'rx' | 'lab' | 'ot' | 'physio'   // no-pack routing (doc 01 §4)
}
```

**Consumers:**
1. Doctor onboarding wizard — replaces today's hardcoded 11-item `SPECIALIZATIONS` array (`src/app/dashboard/doctor/onboarding/client.tsx` L42) with `registry.filter(packAvailable)`. Cascade: degree select filters list; degree itself optional.
2. Admin create-doctor dialog — same list (today super-admin/hospital staff creation paths get it free).
3. Install service — maps chosen name → packCode.
4. Fallback resolver — unmatched/“Other”/blank → `GP-01`.

**Migration note:** the 11 current dropdown names map cleanly (General Physician→GP-01, Pediatrician→PED-01, Dermatologist→DRM-01, Cardiologist→CAR-01, Orthopedist→ORT-01, Gynecologist→OBG-01, ENT Specialist→ENT-01, Neurologist→NEU-01, Psychiatrist→PSY-01, Dentist→DEN-01, Oncologist→ONC-01, Other→GP-01). **Existing doctors' stored `specialization` strings must be normalized via alias map at install time** (e.g., "Gynecologist" or "Gynaecologist" → OBG-01) — spec §8 migration.

---

## 3. Component 2 — Pack Files (typed content)

**Location:** `src/lib/specialty-packs/packs/{CODE}.{slug}.ts` + `packs/shared.ts` (cross-pack constants, doc 02 §5)
**Shape (spec — mirrors schema 1:1):**

```ts
interface SpecialtyPack {
  meta: {
    code: 'PED-01'
    version: '1.0.0'
    tier: 'T1'
    reviewedBy?: string          // 'Dr. X, MBBS, MD Peds' — empty = unverified
    reviewedAt?: string
    sourceNotes?: string         // 'IAP schedule 2024, NLEM 2023'
  }
  categories: { key, name, nameEn }[]
  complaints:  { code, categoryKey, detail, detailEn }[]
  questions:   { complaintCode, question, questionEn, explanation? }[]
  suggestions: { questionIndex, text, textEn }[]
  labels:      { label, labelEn, unit, showUnit }[]
  findings:    { key, name, nameEn, icd10? }[]
  medicines:   { name, salt, doseOptions[], morning, afternoon, evening, tab,
                 flags: { pregnancy, pediatric, schedule, verified } }[]
  findingMeds: { findingKey, medicineIndex }[]
  tables:      { name, rows, cols, headerLabel[], colsLabel[], footerLabel[] }[]
  rxTemplates: { name, diagnosis, medicineIdx[], labs[], advice, followUpDays, isCommon }[]
}
```

Keys are **local** to the file (e.g., `complaintCode: 'GEN01'`); install resolves them to real cuids at write time. Two-stage export (`pack` object + `validatePack(pack)` type-guard) so a malformed pack **fails compile/lint — never reaches DB**.

**Pack count guard:** `Object.keys(PACKS).length === registry.filter(t => t.packAvailable).length` asserted in a unit-less sanity script (doc 04 §3 validation gate).

---

## 4. Component 3 — New Prisma Model (the ONLY schema change)

```prisma
model DoctorPackInstall {
  id            String   @id @default(cuid())
  doctorId      String
  packCode      String            // 'PED-01'
  packVersion   String            // '1.0.0'
  status        String   @default("Installed")  // Installed | Superseded | RolledBack
  counts        String   @default("{}")         // JSON: {complaints: 72, medicines: 182, ...}
  installedById String?                           // null = system (onboarding); else admin userId
  installedAt   DateTime @default(now())
  doctor        Doctor   @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  @@unique([doctorId, packCode])
  @@index([packCode])
}
```

- One row per (doctor, packCode) — reinstall of same code = **update** (version bump via explicit consent flow only, P3).
- **Migration path:** `bun run db:push` (additive table; zero impact on existing rows). Both sandbox PG (5433) and Supabase prod get it in the next deploy window — additive, safe, no downtime.
- Realtime mini-service has its own prisma schema — **no relation needed** there (packs never touch realtime).

---

## 5. Component 4 — Install Service (the heart)

**File:** `src/lib/specialty-packs/install.ts` (new, server-only)
**Algorithm (spec):**

```
installPack({ doctorId, packCode, installedById? })
  1. Resolve Doctor row (userId → doctor.id). 404 if none.
  2. Look up existing DoctorPackInstall(doctorId, packCode):
     - exists && status = Installed → return { alreadyInstalled } (idempotent — P3)
  3. Load pack from PACKS[packCode]; run validatePack() (defense in depth).
  4. BEGIN TRANSACTION:
     a. createMany CategoryMaster      → capture id-map {categoryKey → id}
     b. createMany CoMaster             (resolve categoryKey via map)
     c. createMany QuestionsMaster      (resolve complaintCode → coId)
     d. createMany SuggestionsMaster    (resolve questionIndex → questionId)
     e. createMany LabelMaster
     f. createMany FindingsMaster       (store findingKey → id)
     g. createMany DoctorMedicine       (userId = doctor.userId; description = salt + flag note)
     h. createMany FindingsMedicine     (resolve both sides)
     i. createMany TableTemplateMaster  (JSON-stringify label arrays)
     j. createMany PrescriptionTemplate (resolve medicineIdx → embedded medicine JSON)
     k. upsert DoctorPackInstall row (counts from createMany results)
     l. audit-log entry: action 'PACK_INSTALL', meta {packCode, version, counts}
  COMMIT → return counts
  5. On ANY failure → ROLLBACK (transaction) → surface error, retry-safe (step 2 blocks dupes)
```

**Conflict policy (P4 — append-only):** doctor already has rows (e.g., seeded demo doctor or 2nd pack)? Install **skips** items whose natural key collides:
- C/O: same `coCode` + doctorId
- Medicine: same `name` (case-insensitive) + doctorId
- Everything else: category/question names — dedupe by exact name match
Skip-count returned and shown in UI ("12 of 182 medicines skipped — you already had them").

**Performance:** worst case T1 ≈ 1,200 rows across 10 `createMany` calls, single transaction, pgbouncer-compatible (Supabase pooler) — **well under 2s**; runs post-onboarding-redirect, not blocking login.

---

## 6. Trigger Points & UX Specs

| # | Trigger | UX | Notes |
|---|---|---|---|
| T1 | **Onboarding "Launch My Practice"** (shipped wizard, last step) | Install runs server-side inside the existing `POST /api/dashboard/onboarding` completion handler → success toast: **"🎉 Pediatrics starter pack installed — 72 complaints, 182 medicines ready"** | Primary path. No new screen. |
| T2 | **Registration completion** (patient/hospital/doctor register API) | Doctor self-signup already creates Doctor via onboarding only — so T1 covers it; T2 is a no-op safety net if registration someday creates doctors directly | Defensive |
| T3 | **Admin-created doctor** (hospital admin / super admin staff flow) | Same silent install + toast in staff-creation dialog response | Reuses unified staff API |
| T4 | **Existing doctors (pre-pack era)** | Empty-state banner inside Prescription Settings pages: "Aapka account khaali hai — <Specialty> starter pack install karein (1 click)" → button calls `POST /api/dashboard/doctor/packs/install` | New tiny route; shows counts after |
| T5 | **RX wizard empty-state guard** (P1 polish) | If Step 1 fetches < 5 complaints → inline card: "Starter pack install karein?" deep-links to T4 | Catches doctors who skipped onboarding |

**Empty-state banner design (T4/T5) — copy spec (Hinglish, owner-approved tone):**
- Title: "Apni specialty ka ready-made library lagayein"
- Sub: "72 complaints · 180 medicines · 40+ questions — 1 click me. Aap baad me sab customize kar sakte hain."
- CTA: "Install Pediatrics Pack" → success state replaces banner with version chip ("Pack v1.0 · 182 medicines")

**Settings surface (P3 preview):** Prescription Settings gets a "Starter Pack" section: current version chip, item counts, "Check for updates" (compares registry latest), "Report a problem" (feedback loop → admin queue).

---

## 7. Multi-Pack & Specialty-Change Rules

- Doctor changes specialty in profile → **new pack installs alongside** (old pack rows remain; doctor deletes at will). Rationale: dual-qualified doctors (doc 01 §6.2) and zero destructive ops (P4).
- `@@unique(doctorId, packCode)` permits one row per pack — e.g., MED-01 + DIA-01 both live.
- P3 "Add another specialty's pack" UI = same install endpoint, different code.

---

## 8. Rollout & Rollback Plan

| Step | Action | Risk |
|---|---|---|
| 1 | Registry + types + GP-01 pack only → sandbox | none (additive) |
| 2 | `db:push` sandbox (5433) → E2E: register pediatric demo doctor → verify 72 C/Os visible in wizard via agent-browser | low |
| 3 | Install route + T4 banner → sandbox QA (screens) | low |
| 4 | Supabase prod `db:push` (additive table — safe during traffic) | **low, additive-only** |
| 5 | Deploy pack files (code) → prod verify with throwaway QA account | low |
| 6 | Add remaining T1 packs one PR each (review-gated, doc 04) | content risk only |

**Rollback =** set `DoctorPackInstall.status = 'RolledBack'` + delete rows `WHERE` created-by that install (all rows written by install carry `createdById = <system/pack>` convention — actually they carry `createdById` of installer or a reserved `PACK_SYSTEM` marker; deletion script joins install record). App code rolls forward trivially (packs are code).

---

## 9. What This Design Deliberately Does NOT Build (scope guards)

| Not now | Why | When |
|---|---|---|
| Admin CMS for pack editing | D2 — git is the CMS | never (revisit only if non-dev editors join) |
| Global/shared master tables | D3 — breaks per-doctor editing | never |
| Auto-updates to installed packs | D4 — silent medical changes | P3 explicit consent flow |
| AI runtime prescribing suggestions | Liability + plan separation | P4 Pro tier (LLM skill, clearly-labeled assist) |
| Pack analytics dashboard | Nice-to-have | P3 (simple counts first: which items get used) |

---

**Next:** who writes the content, how it's validated, and the medical review gate → [04-CONTENT-WORKFLOW.md](./04-CONTENT-WORKFLOW.md)
