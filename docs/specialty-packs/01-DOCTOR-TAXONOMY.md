# 01 — DOCTOR TAXONOMY (India)
**Question this answers:** *"Kitni categories hoti hain? MBBS, MD, Surgeon... aur surgeon ke bhi bahut types hote hain. Sab ki pehle list banana padega."*
**Status:** 📋 PLANNING — no development started
**Purpose:** The single source of truth for every medical practitioner type in India, which specialties get starter packs (and how big), and how the registration dropdown flows.

---

## 1. The 3-Layer Model (How India Actually Works)

A doctor is identified by **three layers**, not one:

```
LAYER 1 — STREAM        "Kis system of medicine ka doctor hai?"
                        Allopathy | Dental | AYUSH | Allied
LAYER 2 — DEGREE        "Kis qualification se practice karta hai?"
                        MBBS | MD | MS | DNB | DM | MCh | Diploma | BDS | MDS | BAMS | BHMS | BPT ...
LAYER 3 — SPECIALTY     "Kaunsi field me practice karta hai?"  ← THIS selects the PACK
                        Pediatrics | Orthopedics | Cardiology ... (45 total)
```

**Key insight (D-decision): The PACK is keyed to SPECIALTY, not degree.**
Why? Because the same specialty is reached via multiple degrees:
- Pediatrician = MD (Peds) OR DNB (Peds) OR DCH diploma → all three need the SAME Pediatrics pack.
- Orthopedist = MS (Ortho) OR DNB (Ortho) → same Ortho pack.
Degree matters for the doctor's public profile (education display, verification later) — NOT for content.

---

## 2. Layer 1 — Practice Streams (4)

| Stream | Regulating body | In scope for Doctorooms RX packs? |
|---|---|---|
| **Allopathy** (modern medicine) | NMC (National Medical Commission) | ✅ Primary target — ~85% of packs effort |
| **Dental** | DCI (Dental Council of India) | ✅ Yes — dentists run huge solo OPD clinics; own prescribing patterns |
| **AYUSH** (Ayurveda, Yoga/Naturopathy, Unani, Siddha, Homeopathy) | NCH / NCISM | ⏳ Tier-3, later — different prescribing paradigms (ayurvedic formulations, homeo dilutions) need separate content expertise; huge market but Phase 3+ |
| **Allied** (Physiotherapy, Optometry, Nursing practice) | PTCI etc. | ⏳ Tier-3, later — Physio needs an *exercise-prescription* module, not an Rx pack |

---

## 3. Layer 2 — Degrees Glossary (Allopathy + Dental)

| Degree | Full form | Years | Route | Notes |
|---|---|---|---|---|
| **MBBS** | Bachelor of Medicine & Surgery | 5.5 | UG → GP/family practice | The workhorse of Indian primary care; most MBBS practice as **GPs** |
| **Diploma** (2-yr PG) | DCH (child), DGO (gyn), DOMS (eye), DLO (ENT), DA (anesth), DCP (patho), DMRD (radio) | 2 | after MBBS | Very common in tier-2/3 cities; specialty practice via diploma |
| **MD** | Doctor of Medicine | 3 | PG (physician side) | Non-surgical specialties |
| **MS** | Master of Surgery | 3 | PG (surgical side) | Surgical specialties incl. OB-GYN, Ortho, ENT |
| **DNB** | Diplomate of National Board | 3 | PG (hospital-based) | **Legally equivalent to MD/MS** — treat identically for pack selection |
| **DM** | Doctorate of Medicine | 3 | Super-specialty after MD | e.g., DM Cardiology, DM Neurology |
| **MCh** | Magister Chirurgiae | 3 | Super-specialty after MS | e.g., MCh Neurosurgery, MCh Urology |
| **Fellowship** | (unofficial, e.g., RSSDI Diabetology) | 1–2 | post MBBS/MD | **Uniquely Indian pattern** — must support (see §6.3) |
| **BDS / MDS** | Bachelor/Master of Dental Surgery | 5 / 3 | dental | BDS = general dentist (huge solo-clinic segment) |

**Registration cascade rule:** Degree filters which specialties are selectable — an MBBS-only registrant picks GP (default) or a fellowship specialty; an MS registrant sees surgical specialties; DM/MCh see super-specialties. (UX spec in §5.)

---

## 4. Layer 3 — THE SPECIALTY REGISTRY (45 entries)

### Tier legend
- **T1** (10): Full launch packs (~60-80 C/O, ~180 medicines) — covers ~85% of Indian OPD volume
- **T2** (11): Standard packs (~40-60 C/O, ~120 medicines) — fast-follow
- **T3** (14): Lite packs (~25 C/O, ~70 medicines) — on-demand / later phases
- **NOPACK**: practitioner maps to a different product module (Lab / OT), not the RX wizard

### 🟢 TIER 1 — Launch Packs (build first)

| Code | Specialty (display name) | Typical degrees | Pack size | In current dropdown? | Why T1 |
|---|---|---|---|---|---|
| GP-01 | **General Physician / Family Medicine** | MBBS | FULL+ | ✅ "General Physician" | Single largest prescriber segment in India; every small clinic |
| MED-01 | **Internal Medicine** | MD (Medicine), DNB | FULL | ✅ merges with "General Physician" today | Backbone of nursing-home OPDs; super-set of GP content |
| PED-01 | **Pediatrics** | MD/DNB (Peds), DCH | FULL | ✅ "Pediatrician" | ~27% of India is <14; parents = high-frequency visits; **`pediatric-seed.ts` already = 70% of this pack** |
| OBG-01 | **Obstetrics & Gynecology** | MS/DNB (OBG), DGO | FULL | ✅ "Gynecologist" | Highest-volume female OPD; ANC tracking tables; pregnancy-safe med flags needed |
| ORT-01 | **Orthopedics** | MS/DNB (Ortho) | FULL | ✅ "Orthopedist" | Massive OPD (back/knee pain capital); injury tables, calcium/D3 protocols |
| DRM-01 | **Dermatology** | MD/DNB (DVD), DDV | FULL | ✅ "Dermatologist" | Top-5 private OPD; cosmetic add-ons; **`seed-dermatology.ts` already = 60% of this pack** |
| ENT-01 | **ENT (Otorhinolaryngology)** | MS/DNB, DLO | FULL | ✅ "ENT Specialist" | Very high solo-clinic volume in smaller cities |
| SUR-01 | **General Surgery** | MS/DNB (Surgery) | FULL | ➕ add | OPD + minor-OT practice; feeds our OT module |
| DEN-01 | **Dentistry (General)** | BDS | FULL | ✅ "Dentist" | ~2.8 lakh dental clinics in India; own antibiotic/analgesic patterns |
| DIA-01 | **Diabetology** | MD + fellowship, or MBBS + RSSDI fellowship | FULL | ➕ add | **India = diabetes capital** (74M+ diabetics); diabetologists are the single busiest private-OPD niche; HbA1c flow built into labs already |

### 🟡 TIER 2 — Standard Packs (fast-follow)

| Code | Specialty | Typical degrees | In dropdown? | Notes |
|---|---|---|---|---|
| OPH-01 | Ophthalmology | MS/DNB/DOMS | ➕ add | Cataract capital of world; refraction + surgical workup content |
| PSY-01 | Psychiatry | MD/DNB/DPM | ✅ "Psychiatrist" | Long-duration scripts, follow-up templates needed |
| PUL-01 | Pulmonology / Respiratory Med | MD/DNB | ➕ add | Asthma/COPD capital; inhaler protocols; TB (India = 27% global TB) |
| CAR-01 | Cardiology | DM/DNB | ✅ "Cardiologist" | Huge preventive-cardio OPD; interacts with our lab/treadmill ecosystem |
| NEU-01 | Neurology | DM/DNB | ✅ "Neurologist" | Stroke/epilepsy follow-up templates |
| URO-01 | Urology | MCh/DNB | ➕ add | Stone-belt content (stones = very Indian) |
| GAS-01 | Gastroenterology | DM/DNB | ➕ add | Hepatitis/IBD/liver content |
| END-01 | Endocrinology (incl. Thyroid) | DM/DNB | ➕ add | Overlaps DIA-01 ~50%; ship after DIA learnings |
| NEP-01 | Nephrology | DM/DNB | ➕ add | CKD/anemia protocols; dialysis workups |
| REP-01 | Reproductive Medicine / IVF | Fellowship after OBG | ➕ add | Booming private niche; cycle-tracking tables |
| ONC-01 | Medical Oncology (+ palliative) | DM/DNB | ✅ "Oncologist" | Protocol-heavy; chemo-side-effect management OPD content |

### 🔵 TIER 3 — Lite Packs (on-demand, P3)

| Code | Specialty | Notes |
|---|---|---|
| PSU-01 | Plastic & Reconstructive Surgery | MCh; OPD = wound/scar/aesthetic consults |
| NSU-01 | Neurosurgery | MCh; OPD = spine consults mostly |
| CTV-01 | Cardiothoracic & Vascular Surgery | MCh; pre/post-op OPD content |
| PSU-02 | Pediatric Surgery | MCh |
| SON-01 | Surgical Oncology | MCh |
| RHE-01 | Rheumatology | DM/MD; rising (autoimmune awareness) |
| GER-01 | Geriatrics | MD/fellowship; aging-population niche |
| EME-01 | Emergency Medicine | MD (new specialty); ER documentation focus |
| PMR-01 | Physical Medicine & Rehab | MD; bridges to physio module |
| INF-01 | Infectious Diseases | DM (few centres) |
| DOR-01 | Orthodontics | MDS |
| DEN-02 | Endodontics (root canal) | MDS |
| DEN-03 | Oral & Maxillofacial Surgery | MDS |
| DEN-04 | Pedodontics (child dentistry) | MDS |

### 🟣 TIER 3 — AYUSH + Allied (later, separate content expertise)

| Code | Specialty | Notes |
|---|---|---|
| AYU-01 | Ayurveda (BAMS) | Requires classical-formulary content; own reviewer |
| HOM-01 | Homeopathy (BHMS) | Dilution-based prescribing; separate structure |
| UNA-01 | Unani (BUMS) | Smaller base |
| PHY-01 | Physiotherapy (BPT/MPT) | Needs exercise-prescription module, not Rx pack |

### ⚪ NO-PACK — these doctors map to OTHER product modules (already built!)

| Specialty | Maps to | Why no Rx pack |
|---|---|---|
| Pathology (MD/DNB/DCP) | **Lab module** (test master, reports) — shipped | They don't run prescription OPDs |
| Radiodiagnosis (MD/DNB/DMRD) | **Lab module** imaging catalogs | Same |
| Anesthesiology (MD/DNB/DA) | **OT module** (surgeries, anesthesia notes) — shipped | OT-facing, not OPD |
| Transfusion Medicine, Community Medicine | out of scope | Not private-OPD segments |

> **Product note:** these roles still register in the system (hospital staff), they just skip the RX-pack path. The onboarding wizard should route them to their module-first dashboard. This is a nice differentiator vs HealthPlix (which is OPD-only).

---

## 5. Registration UX — Degree → Specialty Cascade

Current state (shipped): flat 11-item dropdown + "Other" in doctor onboarding.
Target state (P0):

```
Step: "Aapki qualification?"                    → DEGREE dropdown (grouped)
   MBBS ─┬─ General Practice / Family Medicine          (GP-01)
         ├─ Fellowship specialty…                       (DIA-01 etc.)
         └─ (more in future)
   MD/DNB ── Internal Medicine · Pediatrics · Dermatology · Psychiatry · Pulmonology …
   MS/DNB ── General Surgery · Obst & Gyn · Ortho · ENT · Ophthalmology …
   DM/MCh ── Cardiology · Neurology · Urology · Gastro … (super-specialties)
   Diploma─ Child Health (DCH→Peds) · Gyn (DGO→OBG) · ENT (DLO) · Ophthal (DOMS)…
   BDS/MDS ─ Dentistry (general) · Orthodontics · Endodontics…
   BAMS/BHMS/BPT → AYUSH/Allied track (module choice, P3)
        │
        ▼
Step: "Kaunsi specialty?"                      → SPECIALTY dropdown (filtered by degree)
        │
        ▼
Pack auto-installs on "Launch My Practice"     (see doc 03 §6)
```

Rules:
1. **Degree is optional** at first (doctor may skip); if skipped, specialty dropdown shows ALL specialties (flat, searchable). Non-medical owners of solo practices often don't know degree nuance — don't force it.
2. **"Other"** remains → falls back to **GP-01 base pack** (see §6.1 fallback chain).
3. Existing doctors (registered before P0) see a **one-click "Install starter pack"** banner (doc 03 §6.3).
4. Specialty is **editable later** from profile (re-install = separate pack alongside, never auto-delete — doc 03 §7).

---

## 6. Edge Cases & Indian Specialties of Specialness

### 6.1 Fallback chain
```
Doctor.specialization = "Pediatrician"        → PED-01 pack
Doctor.specialization = "Cardiac Surgeon"     → closest match CTV-01 (lite) + GP-01 base
Doctor.specialization = "Other / custom text" → GP-01 BASE pack (25 common C/Os, 60 core medicines)
no specialization                             → GP-01 BASE pack + prompt to pick specialty
```

### 6.2 Dual-qualified doctors (MD + e.g., Diabetology fellowship)
Pick ONE primary specialty for the pack. The pack is additive anyway — doctor can import a second pack later from settings (P3: "Add another specialty's pack").

### 6.3 The Fellowship Reality (very Indian)
Lakhs of MBBS/MD doctors practice high-volume niches (Diabetology, Sonology, Cosmetology, Emergency) through 1-yr fellowships, not DM/MCh. Our registry must list these as first-class specialties (DIA-01 today; COSMO/USG candidates for T2/T3 later) — otherwise a huge paying segment can't identify themselves. Competitors ignore this; we shouldn't.

### 6.4 Display name vs pack code
Public site (`/doctors`, booking pages) shows friendly names ("Child Specialist", "महिला रोग विशेषज्ञ" style for patient SEO); the registry keeps canonical codes. Patient-facing naming pass is a separate small task (SEO win).

### 6.5 ICD alignment
`FindingsMaster` items will carry an optional `icd10Code` field in pack files (doc 02 §3.6) — free ICD-10 snapshot offline, aligned with WHO; future analytics/insurance claims readiness (our insurance module exists).

---

## 7. Count Summary (the direct answer)

> **Streams: 4 · Degrees: 15+ · Specialties total: 45**
> - T1 full packs: **10** (launch)
> - T2 standard: **11** (fast-follow)
> - T3 lite: **14 + 4 AYUSH/Allied** (on-demand)
> - No-pack (other modules): 4
> - Every specialty that appears in the registration dropdown at launch will have **at least a lite pack same-day** — dropdown will only expose specialties whose pack exists (rest behind "Other").

**Cross-reference:** pack sizes per tier → [02-PACK-CONTENT-MATRIX.md](./02-PACK-CONTENT-MATRIX.md) · install mechanism → [03-IMPLEMENTATION-DESIGN.md](./03-IMPLEMENTATION-DESIGN.md) · content pipeline → [04-CONTENT-WORKFLOW.md](./04-CONTENT-WORKFLOW.md)
