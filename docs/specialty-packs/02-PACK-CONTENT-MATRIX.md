# 02 — PACK CONTENT MATRIX
**Question this answers:** *"Per-speciality data alag-alag kaise hoga? Pack ke andar exactly kya-kya hai?"*
**Status:** 📋 PLANNING — no development started
**Prerequisite read:** [01-DOCTOR-TAXONOMY.md](./01-DOCTOR-TAXONOMY.md) (tier codes used below)

---

## 1. Pack Anatomy — 10 Content Types → Exact Schema Mapping

Every pack is one TS file exporting a typed object. The types map 1:1 to **existing per-doctor Prisma models** (verified against `prisma/schema.prisma` this session) — this is why installation requires zero wizard changes.

| # | Content type | Prisma model (existing) | Key fields used | RX wizard step |
|---|---|---|---|---|
| 1 | Complaint **categories** | `CategoryMaster` | `name`, `nameEn` | Step 1 grouping |
| 2 | **C/Os** (chief complaints) | `CoMaster` | `coCode`, `coDetail`, `coDetailEn`, `categoryId` | Step 1 |
| 3 | Clinical **questions** | `QuestionsMaster` | `question`, `questionEn`, `explanation`, `coId` | Step 5 |
| 4 | Question **suggestions** (answers/advice) | `SuggestionsMaster` | `suggestions`, `suggestionsEn`, `questionId` | Step 5 |
| 5 | Vitals **labels** | `LabelMaster` | `label`, `labelEn`, `unit`, `showUnit` | Step 2 |
| 6 | **Findings** (diagnosis/disease groups) | `FindingsMaster` | `name`, `nameEn` | Step 3/4 |
| 7 | **Medicines** | `DoctorMedicine` | `name`, `morning/afternoon/evening` (0-2 default), `dose` (JSON dose options), `tab` (qty), `description` | Step 4 |
| 8 | Finding ↔ Medicine **links** | `FindingsMedicine` | `findingId`, `medicineId` | Step 4 "1-click Rx" |
| 9 | Clinical **table templates** | `TableTemplateMaster` | `name`, `rows`, `cols`, `headerLabel/colsLabel/footerLabel` (JSON) | Step 3 |
| 10 | **Full Rx templates** | `PrescriptionTemplate` | `name`, `diagnosis`, `medicines` (JSON), `labs` (JSON), `advice`, `followUpDays`, `isCommon` | Quick-Rx |

Optional 11th type (P3): print defaults → `POtherSetting` (header/footer), clinic-branding not medical content — leave doctor-owned.

### 1.1 Medicine entry — extended spec (critical for review)
Our `DoctorMedicine` model carries prescribing defaults. Pack entries use:
```ts
{
  name: 'Calpol 250 Suspension',        // brand+strength (doctor-facing)
  salt: 'Paracetamol 250mg/5ml',        // → stored in description
  dose: [ '5ml', '7.5ml', '10ml' ],     // weight-band options (peds pattern from pediatric-seed)
  morning: 1, afternoon: 0, evening: 1, // sane default frequency
  tab: 1,                               // dispense qty multiplier
  flags: {                              // NEW in pack meta (not a DB column — drives review + UI badge)
    pregnancy: 'safe|caution|avoid|na',
    pediatric: 'weight-based|fixed|na',
    schedule: 'H|H1|X|OTC',             // India drug schedule
    verified: false                     // flips true after MBBS review
  }
}
```
`flags` live in the pack file + `DoctorPackInstall` audit (doc 03 §5); UI surfaces ⚠ "unverified dose — confirm before printing" badge until `verified`. This is the R2 mitigation: we can ship names/links immediately, doses harden after review.

---

## 2. Size Targets by Tier

| Content type | T1 FULL | T2 STANDARD | T3 LITE | GP BASE (fallback) |
|---|---|---|---|---|
| Categories | 8–10 | 6–8 | 4–6 | 5 |
| C/Os | 60–80 | 40–60 | 25–30 | 25 |
| Questions | 120–180 | 80–120 | 40–60 | 50 |
| Suggestions | 300–500 | 200–350 | 100–150 | 120 |
| Labels (vitals) | 8–12 | 6–8 | 4–6 | 6 |
| Findings | 25–40 | 20–30 | 10–20 | 12 |
| Medicines | 150–250 | 100–150 | 50–80 | 60 |
| Finding↔Med links | 40–80 | 30–50 | 15–25 | 20 |
| Table templates | 6–10 | 4–6 | 2–3 | 3 |
| Rx templates | 4–6 | 2–4 | 1–2 | 2 |
| **≈ total rows installed** | **~800–1,200** | ~500–800 | ~250–400 | ~300 |

Sizing rationale: top ~200 medicines cover ~90% of an Indian specialty OPD's scripts; beyond 250 items a list becomes noise (risk R3) — long-tail belongs to the doctor's own additions + P3 favourites.

---

## 3. The Matrix — T1 specialties, what's DIFFERENT in each

*(This is the "multiple category ke doctors — data alag-alag" answer. Every row = curation focus unique to that specialty.)*

### GP-01 · General Physician / Family Medicine — "sab kuch, thoda thoda"
- **Categories:** General, Respiratory, GI, Fever/Infections, Musculoskeletal, Lifestyle/Metabolic, Dermatology-basics, Pediatric-basics
- **C/O flavor:** Fever, Cough, Cold, Loose Motion, Vomiting, Headache, Body Ache, Weakness, Acidity, Constipation, Joint Pain, Back Pain, Skin Rash, Urinary Burning, Weight Loss…
- **Questions:** symptom-duration/severity/red-flag screens for each (e.g., Fever → >7 days? rash? breathless? — refer flags)
- **Medicines:** the "India top-100" core (paracetamol, azithro, amoxy-clav, ORS, pantop, cetirizine, metronidazole, ibuprofen…)
- **Special tables:** chronic-disease follow-up tracker; smoking/alcohol history
- **Labels:** standard vitals + BMI-related

### MED-01 · Internal Medicine — GP + depth
- Everything in GP-01 **plus**: anemia workups, thyroid panels, hypertension staging, DM initiation (though deep DM stays in DIA-01), dengue/malaria/typhoid seasonal protocols (India-critical), multi-morbidity Rx templates
- **Tables:** BP-log, sugar-log, fever-day-chart

### PED-01 · Pediatrics — "weight is the dose"
- **Base exists:** `pediatric-seed.ts` (842 lines — 8 categories, 30 C/Os, 18 findings, 24 meds, 6 tables, 4 Rx templates) → upgrade to T1 size (60+ C/O, 180 meds)
- **C/O flavor:** poor feeding, excessive crying, wheeze, ear discharge, neonatal jaundice, not-achieving-milestones, school problems
- **UNIQUE — weight-banded dosing:** every syrup entry carries 5ml/7.5ml/10ml style options (pattern proven in seed)
- **UNIQUE labels:** Head Circumference, Respiratory Rate, Milestone check, Weight-for-age
- **UNIQUE tables:** **IAP immunization schedule** (public, govt of India + Indian Academy of Pediatrics), growth-chart grid, feeding milestones
- **Flags:** every medicine `pediatric: 'weight-based'`; antibiotics reviewed extra-hard

### OBG-01 · Obstetrics & Gynecology — "two patients in one"
- **C/O flavor:** missed periods, heavy bleeding (menorrhagia), irregular cycles, white discharge, pregnancy check-up, ANC visits, labor pains, postpartum issues, menopause symptoms, infertility evaluation
- **UNIQUE labels:** **LMP, EDD, Gravida, Para, Fundal Height, FHS (fetal heart)**
- **UNIQUE tables:** ANC visit ledger (visit no. · BP · weight · Hb · USG), menstrual calendar, contraception counseling
- **UNIQUE flags:** pregnancy category on EVERY medicine (safe/caution/avoid) — the single most safety-critical pack
- **Rx templates:** routine-ANC (iron+folic+calcium+D3), UTI-in-pregnancy, PCOS starter
- **Interlock with product:** pregnancy data feeds future high-risk flags + family-access module

### ORT-01 · Orthopedics — "pain & mobility"
- **C/O flavor:** back pain, knee pain, neck pain, shoulder pain, sports injury, swelling after fall, stiffness, numbness (radiculopathy), fracture follow-up, plaster removal
- **UNIQUE tables:** ROM (range-of-motion) grid, ortho exam checklist (look-feel-move), physio-exercise plan (bridges to PHY module later)
- **Medicines:** NSAIDs+gastric-protection combos, calcium/D3/bisphosphonate protocols, muscle relaxants, topical options
- **Rx templates:** acute-lumbago, post-fracture-healing, arthritis-care

### DRM-01 · Dermatology — "look & local treat"
- **Base exists:** `scripts/seed-dermatology.ts` (929 lines, **Gujarati-bilingual** — reuse as reference, ship En/Hi) → upgrade to T1 size
- **C/O flavor:** acne, hairfall, fungal infection (ringworm — huge in India), pigmentation, urticaria, eczema, psoriasis, vitiligo consult
- **UNIQUE pattern:** site-of-lesion + duration + itching questions; photo-friendly (our gallery module)
- **Medicines:** topical steroid ladder, antifungals (incl. itraconazole protocols), minoxidil patterns, isotretinoin (**schedule H + pregnancy-avoid flag — mandatory review**)

### ENT-01 · ENT — "small city workhorse"
- **C/O flavor:** ear pain, ear discharge, hearing loss, blocked nose, sinusitis, sore throat, tonsillitis, vertigo, nasal bleeding, snoring
- **UNIQUE tables:** ear-exam findings, audiometry referral grid, nasal-endosmy findings
- **Medicines:** nasal steroid sprays, ear drops (quinoline vs amine), vertigo protocols (betahistine)

### SUR-01 · General Surgery — "OPD feeds the OT"
- **C/O flavor:** lump anywhere (hernia/lipoma/breast), appendicitis history, gallstone pain, piles/fissure/fistula, varicose veins, wound care, hydrocele
- **UNIQUE interlock:** pre-op checklists feed our **OT module** (surgery booking exists) — pack includes pre-op Rx templates (bowel prep, antibiotic prophylaxis placeholder)
- **Tables:** wound-assessment grid, hernia-exam checklist
- **Flags:** bowel-prep meds schedule H

### DEN-01 · Dentistry — "its own pharmacology world"
- **C/O flavor:** toothache, sensitivity, swollen gums, bleeding gums, wisdom-tooth pain, bad breath, cavity, denture problems, jaw pain (TMJ)
- **UNIQUE:** dental dosing = shorter courses (3/5-day amoxy), heavy topical content (chlorhexidine, lignocaine gel), dental anxiety questions
- **Tables:** dental-chart grid (tooth-by-tooth), treatment-plan table — UNIQUE to DEN pack
- **Rx templates:** root-canal-course, extraction-post-op, gum-disease-course

### DIA-01 · Diabetology — "India's #1 private niche"
- **C/O flavor:** known-DM checkup, sugar high/low, tingling-feet (neuropathy), burning feet, tiredness+thirst, blurring vision (referral), foot ulcer, thyroid consult co-mingled
- **UNIQUE labels:** FBS, PPBS, HbA1c (target), urine sugar/ketones
- **UNIQUE tables:** sugar-log (fasting/PP, weekly), insulin-titration grid, foot-exam checklist
- **Medicines:** metformin ladder → sulfonylurea → SGLT2/DPP4/GLP1 overview, insulin types, neuropathy protocols
- **Interlock:** our lab module already has HbA1c flow; Rx templates suggest labs (`labs` JSON field exists in `PrescriptionTemplate`)

---

## 4. T2 / T3 briefs (one-liners of uniqueness)

| Code | Unique flavor |
|---|---|
| OPH-01 | Vision-chart tables; cataract pre-op workup; glucoma drops (schedule H, review) |
| PSY-01 | Long-duration scripts; MSE (mental-status-exam) table; follow-up-interval templates |
| PUL-01 | Inhaler-technique questions; TB workup (NTEP-aligned); smoking-cessation advice library |
| CAR-01 | Chest-pain red-flag triage questions; ECG-referral; statin/BP protocols |
| NEU-01 | Seizure-diary tables; stroke follow-up; headache red-flags |
| URO-01 | Stone-belt (north India) protocols; LUTS questions; PSA counseling |
| GAS-01 | Hepatitis-panel ordering; IBS-pattern questions; liver-diet advice |
| END-01 | Thyroid-profile interpretation grids; dose-adjustment tables |
| NEP-01 | CKD-staging table; anemia protocols; dialysis-workup |
| REP-01 | Cycle-day tables; IVF-step templates; couple-workup checklists |
| ONC-01 | Chemo-side-effect management; pain-ladder (WHO); palliative advice |
| T3 set | Same structure, curated ~25 highest-frequency C/Os of that specialty |

---

## 5. Cross-Pack Shared Content (DRY strategy)

To avoid 10× duplication, these blocks are shared constants imported by multiple packs:
- **COMMON-QUESTIONS:** duration/severity/associated/red-flag question stems (~40)
- **CORE-MEDS-100:** the India top-100 prescribing set (same salts used by GP/MED/PED-dosing-variant)
- **STANDARD-VITALS:** Temp/Pulse/BP/RR/SpO2/Weight/Height/BMI label block
- **RED-FLAGS-GENERAL:** referral-trigger suggestion lines

Pack files import from `packs/shared.ts` — git-diffable, one fix propagates everywhere.

---

## 6. Language Plan per Field (bilingual reality)

| Field | English (primary) | Hindi (secondary) | Notes |
|---|---|---|---|
| C/O `coDetail` / `coDetailEn` | Fever | बुखार | Doctor searches English; print shows doctor's choice |
| Question `question` / `questionEn` | Fever kitne din se hai? | Since when fever? | Ask-aloud = Hindi-natural |
| Suggestion `suggestions` / `suggestionsEn` | खाना हल्का रखें, पानी खूब पिएं | Eat light, drink plenty fluids | PRINTED for patient → Hindi-first here |
| Medicine `name` | Calpol 250 Susp | — | Brand names stay English |
| Labels | वजन (Weight) pattern | | unit-bearing |

(Rationale D6 — doctor UI English, patient print bilingual. Gujarati/Telugu/Tamil extensible later per-region — fields already exist, proven by derma seed.)

---

## 7. Content Volume Master Table (build order = review priority)

| Priority | Pack | Target rows | Review focus |
|---|---|---|---|
| 1 | OBG-01 | ~1,000 | pregnancy flags — hardest review |
| 2 | PED-01 | ~1,000 | weight-dosing + antibiotics |
| 3 | DIA-01 | ~900 | insulin/dose-titration |
| 4 | GP-01 | ~1,100 | breadth of top-100 meds |
| 5 | MED-01 | ~1,100 | = GP + infectious disease |
| 6 | ORT-01 | ~850 | NSAID combos, elderly |
| 7 | DRM-01 | ~900 | isotretinoin/steroid ladder |
| 8 | ENT-01 | ~800 | drops + vertigo |
| 9 | SUR-01 | ~800 | pre-op templates |
| 10 | DEN-01 | ~800 | short-course antibiotics |

**Next:** how this installs into the system without touching the wizard → [03-IMPLEMENTATION-DESIGN.md](./03-IMPLEMENTATION-DESIGN.md)
