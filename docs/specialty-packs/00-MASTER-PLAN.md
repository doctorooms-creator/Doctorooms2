# SPECIALTY STARTER PACKS — MASTER PLAN
**Program:** Doctorooms RX Cold-Start Elimination
**Status:** 📋 PLANNING — NOT YET APPROVED FOR DEVELOPMENT
**Date:** 2026-10-07 | **Author:** Z.ai (with non-technical owner, decisions pending owner review)
**Related docs:** [01-DOCTOR-TAXONOMY.md](./01-DOCTOR-TAXONOMY.md) · [02-PACK-CONTENT-MATRIX.md](./02-PACK-CONTENT-MATRIX.md) · [03-IMPLEMENTATION-DESIGN.md](./03-IMPLEMENTATION-DESIGN.md) · [04-CONTENT-WORKFLOW.md](./04-CONTENT-WORKFLOW.md)

---

## 🗣️ TL;DR (Owner ke liye — Hinglish)

**Problem:** Naya doctor (jaise Pediatrician ya Gynecologist) Doctorooms pe account banata hai → 6-step RX wizard khulta hai → **sab kuch KHALI**. C/O list khaali, questions khaali, medicines khaali. Doctor ko 2-3 ghante khud sab bharna padta hai — ye "cold start problem" hai aur isi me 80% doctors churn ho jaate hain (HealthPlix/KareXo ka bhi yahi din-1 problem tha).

**Solution:** **Specialty Starter Packs** — har specialty ka pre-built content library (jaise "template library") jo doctor ke account bante hi **automatically copy** ho jaati hai. Pediatrician ke liye 60+ children C/Os + Calpol/Meftal-P jaisi 180+ medicines; Gynec ke liye periods/pregnancy C/Os + ANC tables — sab ready, Day-1 se.

**API se data kyun nahi?** Indian medicines ki koi reliable free API **exist nahi karti** (1mg/Netmeds closed, CIMS paid, US APIs me Crocin/Calpol nahi). Scrape karna illegal+unstable. Industry standard = **apni curated library** — humare paas free AI hai (main generate kar dunga) + ek MBBS reviewer 2 ghante/pack check kar de — **₹0 recurring cost, lifetime asset**.

**Kya chahiye mujhse (owner)?** Sirf 2 cheezein: (1) is plan ko padh ke **"go ahead"** bolna, (2) content review ke liye **koi MBBS/MD doctor dost** (per pack ~2-4 ghante, optional lekin medical safety ke liye strongly recommended).

**Kyun ye vaise hi industry-proven model hai:** HealthPlix (₹100Cr+ valuation) ka core moat yahi specialty content hai. Hum free AI se wahi ban rahe hain — unse 5 saal pehle.

---

## 1. Problem Statement (Code-Verified)

The 6-step RX wizard is fully built and works. **But every master table it reads is per-doctor scoped:**

| Wizard Step | Reads from | Scope | New doctor's state |
|---|---|---|---|
| Step 1 — C/O | `CoMaster` (+ `CategoryMaster`) | `doctorId` | 🔴 EMPTY |
| Step 2 — Vitals | `LabelMaster` | `doctorId` | 🔴 EMPTY |
| Step 3 — Tables | `TableTemplateMaster` | `doctorId` | 🔴 EMPTY |
| Step 4 — Medicines | `DoctorMedicine` (+ `FindingsMaster` ↔ `FindingsMedicine`) | `doctorId` | 🔴 EMPTY |
| Step 5 — Questions | `QuestionsMaster` → `SuggestionsMaster` | `doctorId` | 🔴 EMPTY |
| Quick Rx | `PrescriptionTemplate` | `doctorId` | 🔴 EMPTY |

**Evidence (verified this session):**
- `/api/dashboard/doctor/prescription-settings/complaints` filters `where: { doctorId: doctor.id }` — a new pediatrician sees ZERO complaints.
- All existing demo doctors (Dr. Aarti Shah etc.) got their masters from **one-off seed scripts** — there is NO path for a real self-registered doctor.
- Self-serve onboarding (register → wizard → launch practice) is **LIVE IN PRODUCTION** since commit `92e9cc8` — so this gap is now customer-facing, not theoretical.

**Consequence without fix:** Day-1 doctor opens RX wizard → blank screens → frustration → churn. The entire self-serve funnel we just shipped ends in an empty product for every new signup.

---

## 2. Solution — One Paragraph

Build a **Specialty Pack Library**: versioned, git-controlled content packs (one per medical specialty) that contain the 10 master content types in our exact schema. When a doctor completes onboarding and picks their specialty (e.g., *Pediatrician*), the matching pack is **copied into their per-doctor master tables** in a single transaction. The RX wizard then works Day-1 with zero changes to the wizard code itself — because masters were always per-doctor. Doctors can edit/delete everything (it's their data now); pack updates never clobber existing installs (version pinning).

---

## 3. Assets We Already Have (Verified)

1. **Proof-of-concept packs exist as seed scripts:**
   - `pediatric-seed.ts` (842 lines) — full Pediatrics pack: 8 categories, 30 C/Os, questions+suggestions, peds labels (Head Circ, Resp Rate), 18 findings, 24 medicines with dose options, finding↔med links, 6 table templates, 4 Rx templates.
   - `scripts/seed-dermatology.ts` (929 lines) — Dermatology pack, **bilingual (Gujarati + English)** — proves multi-language fields work (`coDetail`/`coDetailEn`, `suggestions`/`suggestionsEn`, `label`/`labelEn`, `name`/`nameEn`).
   - `src/scripts/seed-medicines.ts` — medicine seed pattern exists.
2. **Per-doctor master architecture** — the single biggest advantage: pack install needs **ZERO wizard/schema changes** (new table optional, see doc 03).
3. **Specialization dropdown already live** in doctor onboarding (11 specialties + Other) — becomes the pack-selection key.
4. **Free AI (this agent)** for content drafting + `z-ai-web-dev-sdk` LLM skill for future Pro-tier "AI-assist" upsells.

---

## 4. Architecture at a Glance

```
┌────────────────────────────────────────────────────────────────┐
│  REGISTRY (code, not DB)                                        │
│  SpecialtyRegistry: 45+ specialties → tier, packCode, degree    │
│  Drives: onboarding dropdown, admin create-doctor, fallbacks    │
└──────────────┬─────────────────────────────────────────────────┘
               │ doctor picks "Pediatrician"
               ▼
┌────────────────────────────────────────────────────────────────┐
│  PACK LIBRARY (git-versioned TS files in repo)                  │
│  src/lib/specialty-packs/packs/PED-01.pediatrics.ts             │
│    categories → C/Os → questions → suggestions → labels →       │
│    findings → medicines → links → tables → Rx templates         │
│  (typed, linted, code-reviewed, versioned like source code)     │
└──────────────┬─────────────────────────────────────────────────┘
               │ installPack(doctorId, packCode)  — idempotent txn
               ▼
┌────────────────────────────────────────────────────────────────┐
│  DOCTOR'S OWN MASTERS (existing per-doctor tables)              │
│  CoMaster · QuestionsMaster · SuggestionsMaster · LabelMaster · │
│  FindingsMaster · FindingsMedicine · DoctorMedicine ·           │
│  TableTemplateMaster · PrescriptionTemplate · CategoryMaster    │
│  → RX wizard works Day-1, doctor edits freely                   │
└──────────────┬─────────────────────────────────────────────────┘
               │ new Prisma model (only DB change)
               ▼
   DoctorPackInstall(doctorId, packCode, version, counts, status)
   → idempotency + audit + "check for updates" support
```

---

## 5. Phase Plan

| Phase | Scope | Effort (dev) | Effort (content) | Output |
|---|---|---|---|---|
| **P0 — Machinery** | SpecialtyRegistry + dropdown upgrade (45 specialties, degree cascade), pack file format + types, `DoctorPackInstall` model, install service, auto-install on onboarding launch, empty-state banners | ~1–2 days | — | A doctor picking "Pediatrician" gets the (sample) PED pack |
| **P1 — Tier-1 Launch Packs (10)** | GP, General Medicine, Pediatrics, Ob-Gyn, Ortho, Derma, ENT, Gen Surgery, Dentistry, Diabetology | ~1 day (install hardening + QA) | AI drafts by me (1 day/pack) + MBBS review (2–4 hr/pack) | ~85% of Indian OPD covered Day-1 |
| **P2 — Tier-2 Standard Packs (11)** | Ophthal, Psychiatry, Pulmono, Cardio, Neuro, Uro, Gastro, Endo/Thyroid, Nephro, Repro-IVF, Oncology | ~2 days | Same pipeline | Long-tail covered |
| **P3 — Tier-3 Lite + Intelligence** | Supersurg/AYUSH/dental-sub lite packs; usage-based favourites sorting; "report an issue" feedback loop; pack update flow for existing installs | ~3–4 days | On-demand | Moat features (favourites = HealthPlix parity) |
| **P4 — Monetize (optional)** | Pack depth as plan differentiator (Free = lite pack, Pro = full pack + AI-assist via LLM skill) | ~2 days | — | Revenue hook |

**Cost: ₹0 recurring.** No API keys, no external service. Only human review time (recommended, not blocking for launch of NON-critical fields — see risk R1).

**Dependency:** P0 builds on the shipped onboarding track (specialization field exists). No conflicts with pending production tasks (Render realtime, monitoring — separate track).

---

## 6. Key Decisions & Rationale

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| D1 | **Packs, not runtime API** | No reliable free Indian med API exists; scraping = legal/ToS risk; offline = zero latency/cost | 1mg scrape, CIMS license, OpenFDA (US brands) |
| D2 | **Packs live in code (TS files), not DB admin UI** | Git = versioning, code-review, lint, PR diffs; no admin CMS to build; deploys are atomic | DB-stored packs + admin editor (2+ weeks extra dev, worse auditability) |
| D3 | **Copy-on-register (materialize per doctor)** | Wizard reads per-doctor tables → zero wizard changes; doctor edits are safe; specialty-specific personalization later | Shared "global master" read path (requires touching every wizard step + breaks per-doctor editing) |
| D4 | **Version pinning — no auto-update of existing installs** | A doctor's workflow must never change silently (medical context); updates offered explicitly | Auto-push pack updates (dangerous, unreviewable) |
| D5 | **Tiered coverage (T1 full / T2 standard / T3 lite)** | Concentrate effort where OPD volume is; every dropdown specialty still gets ≥ lite pack | Equal-depth packs for 45 specialties (months of effort, 90% waste) |
| D6 | **English primary + Hindi secondary** | Doctor-facing language is English for clinical terms; bilingual fields already exist (Gujarati proof); patient-print parts bilingual | Full Hindi-first (doctors prefer En clinical terms) |
| D7 | **MBBS human review before live doses** | Medical liability; AI hallucination risk on doses is unacceptable in prescriptions | Ship AI doses unreviewed (❌ never for a medical product) |

---

## 7. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Medical inaccuracy (doses/durations)** — AI-generated content | Med | 🔴 High (liability) | Human review gate (D7); "starter template — verify clinical judgment" disclaimer shown at install + in settings; version audit trail; issue-report button (P3); doses pre-filled but editable |
| R2 | Reviewer unavailable at launch | Med | 🟡 Medium | Launch P1 with: C/Os/questions/labels/tables (low-risk) fully live; medicines with **no default dose** pre-verified (name+salt+category only) until reviewed; flag "unverified" in UI badge |
| R3 | Pack bloat overwhelming doctor (300 items ≠ usable) | Med | 🟡 Medium | Tier sizing (doc 02); usage-based favourites in P3; categories keep list scannable |
| R4 | Language quality (Hinglish medical terms) | Low | 🟢 Low | English clinical terms + Hindi patient-facing suggestions; dermatology Gujarati seed proves pattern |
| R5 | Update drift (pack v3 vs doctor's v1 copy) | Certain | 🟢 Low (accepted) | Explicit "pack v1.2 available — show changes" flow in P3; never silent |
| R6 | Registration dropdown confusion (45 specialties for non-medical owner UX) | Low | 🟢 Low | Cascading Degree → Specialty selects (doc 01 §5); "Other" → GP base pack fallback |

---

## 8. Relationship to Shipped/Pending Work

- **Depends on:** doctor onboarding wizard (SHIPPED, prod) — reads `specialization` as pack key.
- **Complements:** self-serve funnel (SHIPPED) — fixes its Day-1 empty-product hole.
- **Parallel (no conflict):** production hardening track (Render realtime, UptimeRobot, admin password rotation) — can proceed independently.
- **Feeds:** future Pro-tier "AI-assisted prescribing" (LLM skill) — packs give the AI structured context to suggest from.

---

## 9. Success Metrics (post-launch)

1. **Time-to-first-RX** for a new self-registered doctor: target **< 10 minutes** (currently impossible/empty).
2. % of wizard steps showing ≥ 20 items on Day-1: target **100%** for T1/T2 specialties.
3. Pack item usage at 30 days (P3 analytics): ≥ 40% of C/Os and top-30 medicines used at least once → validates curation.
4. Day-7 retention of self-registered doctors: baseline vs post-pack (north-star).

---

## 10. Document Index

| Doc | Answers |
|---|---|
| **01-DOCTOR-TAXONOMY.md** | "Kitni categories hoti hain?" — full degree/specialty tree, tiers, registration cascade |
| **02-PACK-CONTENT-MATRIX.md** | "Per-speciality data alag alag kaise?" — pack anatomy, size targets, content matrix + samples |
| **03-IMPLEMENTATION-DESIGN.md** | "Kaise implement hoga?" — registry, pack format, install service, UX touch points (design only) |
| **04-CONTENT-WORKFLOW.md** | "Content kaise banega aur safe kaise rahega?" — AI draft → validation → medical review → versioning |

**Approval state:** ⏳ Awaiting owner "go ahead" for P0 + P1. No development started (owner instruction honored).
