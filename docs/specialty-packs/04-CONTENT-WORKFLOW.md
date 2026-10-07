# 04 — CONTENT WORKFLOW (Generation · Validation · Medical Review · Versioning)
**Question this answers:** *"Content kaun banayega, kaise safe rahega, aur baad me update kaise hoga?"*
**Status:** 📋 PLANNING — no development started
**Hard rule baked in:** AI drafts, humans verify doses. Nothing dose-bearing ships live without a sign-off (decision D7 / risk R1).

---

## 1. The Pipeline (one pack's life)

```
[1] DRAFT          AI (this agent) writes pack TS file offline
      │            sources: NLEM 2023 · WHO EML · IAP/FOGSI public schedules ·
      │            ICD-10 codes · top-brand public knowledge · existing seeds
      ▼
[2] STRUCTURE      pack compiled → TypeScript types + validatePack() must pass
      ▼
[3] AUTO-VALIDATE  script checks (§3): links, dupes, dose format, flags present
      ▼
[4] HUMAN REVIEW   MBBS/MD reviewer works the checklist (§4) in a review sheet
      │            (generated CSV/sheet from the pack file — no review tool to build)
      ▼
[5] SIGN-OFF       reviewer name+date stamped into pack meta.reviewedBy/At
      │            medicines' flags.verified = true (per-item, not all-or-nothing)
      ▼
[6] VERSION+MERGE  PR to repo → code review (me) → merge → deploy
      ▼
[7] INSTALL        new doctors get it automatically; existing via banner (doc 03 §6)
      ▼
[8] MAINTAIN       quarterly pass + user feedback loop (§6)
```

**Launch-order rule:** a pack may ship to the dropdown **before [5]** only in *unverified-dose mode* (doc 02 §1.1 `verified:false` → UI badge + no dose defaults). C/Os, questions, labels, tables have no dosing risk and always ship reviewed-by-structure only.

---

## 2. Who Does What (roles)

| Role | Who | Work per T1 pack |
|---|---|---|
| **Content drafter** | AI (me) | 1 working session: draft ~1,000 items + structure + self-QA |
| **Medical reviewer** | Owner's MBBS/MD contact (per-specialty ideal, any-MBBS acceptable for GP/MED) | 2–4 hours using the review sheet + checklist |
| **Owner** | Product owner | Reads sign-offs, green-lights merge (5 min/pack) |
| **Engineer** | Me | PR, deploy, install QA (agent-browser E2E) |

**Reviewer recruitment note (owner action):** 10 T1 packs × 3 hrs ≈ **30 hours of doctor time total**. One helpful MBBS friend covers GP/MED/ENT/DEN/SUR; OBG + PED ideally need the matching specialist (safety-critical packs). Fallback if nobody found: ship unverified-dose mode (R2) — packs still valuable (C/Os/questions/tables), doses fill when reviewer arrives.

---

## 3. Automated Validation Gate (script spec — runs before review)

| Check | Rule |
|---|---|
| Schema | `validatePack()` type-guard passes |
| Uniqueness | complaint codes unique in-pack; medicine names unique in-pack (case-insensitive) |
| Link integrity | every question's complaintCode exists; every findingMeds index in range; every rxTemplate medicineIdx in range |
| Dose format | all doseOptions non-empty strings, or empty array + verified:false |
| Flag completeness | OBG-relevant meds have pregnancy flag ≠ na; PED meds have pediatric flag; schedule-H meds have schedule flag (isotretinoin, etc.) |
| Bilingual | every patient-printable item (suggestions) has non-empty text + textEn |
| Volume sanity | counts within tier envelope (doc 02 §2) — warn if > 130% (bloat guard) |
| Banned/controversial screen | hardcoded list → e.g., nimesulide in peds < 12 (India controversy), fixed-dose combos banned by CDSCO, phenylpropanolamine — flags for reviewer attention, not auto-block |

Output: pass/fail report → reviewer sheet only generated on pass.

---

## 4. Human Review Protocol (the safety gate)

**Reviewer sheet (auto-generated per pack):** CSV/Sheet columns — item type · code · English · Hindi · dose options · defaults (morn/aft/eve) · flags · "OK / EDIT / REMOVE" · reviewer notes. Medicines sheet gets extra columns: salt, pregnancy, pediatric, schedule.

**Checklist (what the reviewer is actually verifying):**

1. **Doses & frequencies** — defaults and options match standard Indian formularies for adult (and weight bands for PED). *This is 80% of the value of review.*
2. **Durations** — antibiotic course lengths sane (3/5/7-day conventions); no indefinite defaults.
3. **Pregnancy safety** — every OBG/DIA/PSY medicine's pregnancy flag matches current practice (safe/caution/avoid).
4. **Pediatric weight-banding** — syrups' dose options map to weight bands correctly.
5. **Red-flag questions present** — chest pain → ECG referral; fever > 7 days → workup; headache with vomiting → referral. (These prevent our content from *delaying* care.)
6. **Deprecations** — nothing withdrawn/banned by CDSCO; nothing from the §3 banned screen.
7. **Advice language** — printed suggestions are harmless + helpful (patient-facing Hindi checked for tone).
8. **Nothing beyond scope** — no procedure instructions, no second-guessing clinical judgment; pack is *documentation speed*, not decision-making.

**Sign-off record (stamped into pack meta):**
```
reviewedBy: 'Dr. <name>, <qualification>'
reviewedAt: '2026-10-__'
itemsEdited: 14   itemsRemoved: 2   (from review sheet diff)
```
Per-item `verified:true` only for medicines the reviewer explicitly OK'd — partial verification is honest verification.

---

## 5. Source Register (what content is built FROM — all free/licensed-clean)

| Source | Use | License reality |
|---|---|---|
| **NLEM 2023** (India National Essential Medicines) | medicine molecule backbone (~400) | govt publication, free |
| **WHO EML 2023** | cross-check essentiality | free |
| **ICD-10** (WHO) snapshot | findings codes | free offline use |
| **IAP Immunization Schedule** | PED tables | publicly published guideline |
| **FOGSI guidance** (public) | OBG ANC templates | publicly published guideline |
| **NTEP (TB) guidelines** | PUL pack references | govt, public |
| Brand names (Crocin/Calpol/…) | medicine naming | factual public knowledge; **no scraping** — top-brand lists compiled from general knowledge, reviewer sanity-checks |
| Existing seeds | PED/DRM pack starting content | ours |

**Explicitly NOT used:** CIMS/MIMS (paid), 1mg/Netmeds scraping (ToS), any dataset of unclear provenance.

---

## 6. Versioning & Maintenance

**Version scheme:** `MAJOR.MINOR.PATCH`
- MAJOR — content model change / > 30% rewrite → requires re-review
- MINOR — additions (new C/Os/meds) → reviewer delta-check only
- PATCH — corrections from feedback → owner-approved

**Update flow (P3, spec only):** settings shows "Pack v1.1 available — see what changed" → diff view (registry holds change notes) → doctor accepts → new rows appended (never auto-edit their edits).

**Cadence:** quarterly sweep — CDSCO bans, seasonal additions (dengue season items), feedback backlog. Each sweep = one PR + reviewer delta.

**Feedback loop (P3):** per-item "⚠ Report" in settings → admin queue (reuse audit-log pattern) → triage weekly → PATCH release. Until P3: WhatsApp/feedback form (manual, fine at current scale).

---

## 7. Effort & Schedule (realistic, part-time)

| Milestone | Dev | Content | Calendar |
|---|---|---|---|
| P0 machinery | 1.5 d | — | week 1 |
| GP-01 pilot pack (validate whole pipeline end-to-end) | 0.5 d | 1 d draft | week 1–2 |
| OBG + PED (safety-critical, need specialist review) | — | 2 d draft + review scheduling | week 2–4 (reviewer-dependent) |
| Remaining 7 T1 packs | 1 d hardening | ~1 d each drafting | weeks 3–6 |
| T2 wave (11 packs, standard size) | 1 d | 0.5–1 d each | weeks 6–10 |
| **Go-live (T1 live for all new signups)** | | | **~week 4–6** (T1 packs land progressively; dropdown exposes each as it merges) |

**Total owner cost: ₹0.** Reviewer cost: ~30 doctor-hours T1 (relationship capital, not cash).

---

## 8. Legal Positioning Notes (product copy guidance)

- Packs are marketed as **"starting templates"** — the product's job is *speed of documentation*, not clinical advice. Disclaimer appears: at install toast, in settings pack section, in review-sheet sign-off.
- Every printed Rx remains the doctor's own document (they can/should edit) — same legal position as a blank template notebook, just pre-filled.
- No auto-updates = no silent change to a doctor's prescribing surface (auditable).
- Issue-report loop + version trail = demonstrable diligence.

---

**Program index:** [00-MASTER-PLAN.md](./00-MASTER-PLAN.md) · [01-DOCTOR-TAXONOMY.md](./01-DOCTOR-TAXONOMY.md) · [02-PACK-CONTENT-MATRIX.md](./02-PACK-CONTENT-MATRIX.md) · [03-IMPLEMENTATION-DESIGN.md](./03-IMPLEMENTATION-DESIGN.md) · this doc
