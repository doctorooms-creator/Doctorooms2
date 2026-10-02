/**
 * pediatric-seed.ts — Real-life pediatrician master data for Dr. Amit Shah's account.
 *
 * Scenario: world-class pediatrician (children's doctor) sets up their practice data
 * so they can treat patients fast in the 6-step Rx wizard.
 *
 * Seeds (ALL doctor-scoped to Dr. Amit Shah, ALL English):
 *   - Doctor profile  → Pediatrics specialization (data update, demo coherence)
 *   - Categories      → 8 pediatric complaint categories
 *   - Complaints (C/O)→ 30 chief complaints with codes, grouped by category
 *   - Questions       → clinical questions per complaint (asked in Step 5)
 *   - Suggestions     → printable advice lines per question (selected in Step 5)
 *   - Labels          → pediatric custom vitals (Height, Head Circ, Resp Rate)
 *   - Findings        → 18 diagnoses / diseases ("bimari")
 *   - Medicines       → 24 pediatric medicines with dose options & defaults
 *   - Finding ↔ Med   → the treatment links (e.g. Viral Fever → Paracetamol + ORS)
 *   - Table Templates → 6 clinical tables (growth chart, milestones, fever chart…)
 *   - Rx Templates    → 4 full prescription quick-packages
 *   - Print Settings  → branded clinic header/footer for the printed Rx
 *
 * Idempotent: wipes only THIS doctor's master rows first, then re-creates.
 * Run: bun pediatric-seed.ts
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ── Target doctor (looked up dynamically by email — sandbox-reset-proof) ──
async function resolveDoctor() {
  const user = await db.user.findFirst({ where: { email: 'amit.shah@zydus.com', role: 'doctor' } })
  if (!user) throw new Error('Dr. Amit Shah (amit.shah@zydus.com) not found — run prisma/seed-multispecialty.ts first')
  const doctor = await db.doctor.findFirst({ where: { userId: user.id } })
  if (!doctor) throw new Error('Doctor profile for Amit Shah not found')
  return { DOCTOR_ID: doctor.id, USER_ID: user.id }
}

// ══════════════════════════════════════════════════════════════
// DATA — designed as a practicing consultant pediatrician
// ══════════════════════════════════════════════════════════════

// ── 1. Categories ─────────────────────────────────────────────
const CATEGORIES = [
  { name: 'General Symptoms' },
  { name: 'Respiratory' },
  { name: 'Gastrointestinal' },
  { name: 'Skin & Allergy' },
  { name: 'Ear, Nose & Throat' },
  { name: 'Growth & Nutrition' },
  { name: 'Development & Behavior' },
  { name: 'Neonatal (0-28 days)' },
]

// ── 2. Complaints (C/O) ───────────────────────────────────────
// [coCode, detail, category]
const COMPLAINTS: [string, string, string][] = [
  // General
  ['GEN01', 'Fever', 'General Symptoms'],
  ['GEN02', 'Prolonged Fever (>14 days)', 'General Symptoms'],
  ['GEN03', 'Excessive Crying / Irritability', 'General Symptoms'],
  ['GEN04', 'Poor Feeding / Refusing Feeds', 'General Symptoms'],
  ['GEN05', 'Lethargy / Drowsy Child', 'General Symptoms'],
  ['GEN06', 'Body Ache / Muscle Pain', 'General Symptoms'],
  // Respiratory
  ['RES01', 'Dry Cough', 'Respiratory'],
  ['RES02', 'Cough with Sputum', 'Respiratory'],
  ['RES03', 'Nasal Congestion / Blocked Nose', 'Respiratory'],
  ['RES04', 'Runny Nose / Sneezing', 'Respiratory'],
  ['RES05', 'Wheezing / Noisy Breathing', 'Respiratory'],
  ['RES06', 'Rapid Breathing / Breathlessness', 'Respiratory'],
  // Gastrointestinal
  ['GAS01', 'Vomiting', 'Gastrointestinal'],
  ['GAS02', 'Loose Stools / Diarrhea', 'Gastrointestinal'],
  ['GAS03', 'Abdominal Pain / Stomach Ache', 'Gastrointestinal'],
  ['GAS04', 'Constipation', 'Gastrointestinal'],
  ['GAS05', 'Blood in Stool', 'Gastrointestinal'],
  ['GAS06', 'Infant Colic / Excessive Gas', 'Gastrointestinal'],
  // Skin & Allergy
  ['DER01', 'Skin Rash', 'Skin & Allergy'],
  ['DER02', 'Itching / Scratching', 'Skin & Allergy'],
  ['DER03', 'Insect Bite / Mosquito Bite', 'Skin & Allergy'],
  ['DER04', 'Urticaria / Allergic Rash (Hives)', 'Skin & Allergy'],
  ['DER05', 'Boil / Skin Infection', 'Skin & Allergy'],
  // ENT
  ['ENT01', 'Ear Pain', 'Ear, Nose & Throat'],
  ['ENT02', 'Ear Discharge', 'Ear, Nose & Throat'],
  ['ENT03', 'Sore Throat / Throat Pain', 'Ear, Nose & Throat'],
  ['ENT04', 'Recurrent Colds / Frequent URI', 'Ear, Nose & Throat'],
  // Growth & Nutrition
  ['NUT01', 'Poor Weight Gain / Underweight', 'Growth & Nutrition'],
  ['NUT02', 'Loss of Appetite / Picky Eating', 'Growth & Nutrition'],
  ['NUT03', 'Suspected Vitamin / Calcium Deficiency', 'Growth & Nutrition'],
  // Development & Behavior
  ['DEV01', 'Speech Delay', 'Development & Behavior'],
  ['DEV02', 'Delayed Milestones', 'Development & Behavior'],
  ['DEV03', 'Bedwetting (Enuresis)', 'Development & Behavior'],
  ['DEV04', 'Hyperactivity / Poor Attention', 'Development & Behavior'],
  // Neonatal
  ['NEO01', 'Neonatal Jaundice (Yellow Skin)', 'Neonatal (0-28 days)'],
  ['NEO02', 'Umbilical Discharge / Redness', 'Neonatal (0-28 days)'],
]

// ── 3. Questions → per complaint (what I ask the parent) ──────
// complaint code → questions → suggestions (printable advice)
const QNA: Record<string, { q: string; s: string[] }[]> = {
  GEN01: [
    {
      q: 'Fever management at home',
      s: [
        'Give Paracetamol as advised when temperature is above 100°F (37.8°C)',
        'Tepid sponging with lukewarm water during high fever',
        'Encourage plenty of fluids — water, ORS, soups and juices',
        'Dress the child in light clothing; do not over-wrap',
      ],
    },
    {
      q: 'When to revisit immediately',
      s: [
        'If fever persists beyond 3 days despite medication',
        'If child becomes lethargic, drowsy or refuses feeds',
        'If rash, persistent vomiting or fast breathing appears',
        'If child is below 3 months of age with any fever',
      ],
    },
  ],
  GEN02: [
    {
      q: 'Workup advice for prolonged fever',
      s: [
        'Complete all advised blood tests before review (CBC, urine, culture as advised)',
        'Maintain a written temperature chart 3 times a day',
        'Do not start or change antibiotics without consultation',
      ],
    },
  ],
  GEN03: [
    {
      q: 'Crying baby — how to soothe',
      s: [
        'Check common causes first — hunger, wet diaper, gas, over-stimulation',
        'Swaddling, gentle rocking and soft humming calm most babies',
        'Burp the baby well after every feed',
        'Crying with fever, vomiting or poor feeding needs same-day review',
      ],
    },
  ],
  GEN04: [
    {
      q: 'Feeding during illness',
      s: [
        'Offer small, frequent feeds — do not force feed',
        'Fluids are more important than solids during acute illness',
        'Try favorite soft foods in small portions',
        'Monitor urine output — at least 4-6 wet nappies a day',
      ],
    },
  ],
  GEN05: [
    {
      q: 'Drowsy child — warning signs',
      s: [
        'Difficult to wake, floppy body or high-pitched cry — emergency, go to hospital',
        'Check temperature and blood sugar if possible',
        'Keep the child on the side while transporting',
      ],
    },
  ],
  RES01: [
    {
      q: 'Cough care advice',
      s: [
        'Warm fluids soothe the throat; steam inhalation for older children',
        'Avoid cold drinks, ice creams and dusty environments',
        'Honey at bedtime helps night cough (only above 1 year of age)',
        'Raise the head side of the bed slightly during sleep',
      ],
    },
    {
      q: 'When to revisit',
      s: [
        'Fast breathing or chest indrawing — revisit immediately',
        'Cough lasting more than 2 weeks needs evaluation',
        'Cough with wheeze or vomiting — needs review',
      ],
    },
  ],
  RES02: [
    {
      q: 'Productive cough advice',
      s: [
        'Encourage hydration to loosen the sputum',
        'Steam inhalation twice a day (older children)',
        'Avoid smoke exposure completely — including household smoke',
      ],
    },
  ],
  RES03: [
    {
      q: 'Blocked nose care',
      s: [
        'Saline nasal drops 1-2 in each nostril before feeds and sleep',
        'Steam inhalation for older children, twice daily',
        'Elevate head side slightly during sleep',
        'Increase fluid intake',
      ],
    },
  ],
  RES04: [
    {
      q: 'Cold care advice',
      s: [
        'Saline nasal drops as needed; wipe nose gently with soft cloth',
        'Warm fluids and adequate rest',
        'Frequent hand washing for the whole family',
      ],
    },
  ],
  RES05: [
    {
      q: 'Wheezing care advice',
      s: [
        'Continue nebulization / inhalers exactly as prescribed — do not stop early',
        'Avoid smoke, dust, strong smells, incense and furry pets at home',
        'Keep the rescue medicine handy at all times',
        'Watch for fast breathing, chest indrawing or broken speech — emergency',
      ],
    },
  ],
  RES06: [
    {
      q: 'Fast breathing — red flags',
      s: [
        'Fast breathing with chest indrawing or blue lips — go to hospital immediately',
        'Count breaths in 1 full minute when the child is calm',
        'Do not self-medicate with cough suppressants',
      ],
    },
  ],
  GAS01: [
    {
      q: 'Vomiting care advice',
      s: [
        'Give ORS in small sips every 10-15 minutes',
        'Avoid solid foods for 2-3 hours, then restart with light bland diet',
        'Avoid milk and heavy or fatty foods during acute vomiting',
        'Persistent green (bile-stained) vomiting — emergency',
      ],
    },
  ],
  GAS02: [
    {
      q: 'Diarrhea care advice',
      s: [
        'Continue breastfeeding / normal diet — do not starve the child',
        'Give ORS after every loose stool (50-100 ml for under 2 years)',
        'Zinc syrup for 14 days as advised speeds recovery',
        'Wash hands with soap before every feed and after diaper change',
      ],
    },
    {
      q: 'Dehydration danger signs',
      s: [
        'Sunken eyes, dry tongue, no tears — revisit immediately',
        'Passing very little or no urine for 6-8 hours',
        'Blood in stool or high fever with diarrhea needs review',
        'Excessive sleepiness or very thirsty child — urgent review',
      ],
    },
  ],
  GAS03: [
    {
      q: 'Abdominal pain care advice',
      s: [
        'Avoid heavy, oily and spicy food',
        'Warm water sips may relieve colic',
        'Local application of a warm (not hot) cloth may soothe',
        'Severe pain, pain with vomiting or pain around the navel moving right — urgent review',
      ],
    },
  ],
  GAS04: [
    {
      q: 'Constipation advice',
      s: [
        'Increase water, fruits (papaya, pear), vegetables and whole grains',
        'Toilet routine — sit 5-10 minutes after breakfast daily',
        'Daily physical activity / active play helps bowel movement',
        'Cut down excess milk, junk food and maida products',
      ],
    },
  ],
  GAS06: [
    {
      q: 'Infant colic care advice',
      s: [
        'Burp the baby well after every feed (10-15 minutes)',
        'Gentle clockwise tummy massage',
        'Check feeding technique and correct latch',
        'Colic usually improves by 3-4 months of age — it is temporary',
      ],
    },
  ],
  DER01: [
    {
      q: 'Skin rash care advice',
      s: [
        'Keep the skin clean and dry',
        'Avoid scratching — keep nails trimmed short',
        'Use mild soap and loose cotton clothing',
        'Calamine lotion may be applied for soothing',
      ],
    },
  ],
  DER02: [
    {
      q: 'Itching care advice',
      s: [
        'Lukewarm water baths — avoid hot water',
        'Moisturize the skin immediately after bath',
        'Identify and avoid the trigger (food, dust, new soap or detergent)',
        'Antihistamine at bedtime helps night itching',
      ],
    },
  ],
  DER04: [
    {
      q: 'Allergic rash advice',
      s: [
        'Note down the suspected trigger and avoid it strictly',
        'Rash with lip/tongue swelling or breathing difficulty — EMERGENCY',
        'Cool compresses relieve acute itching',
      ],
    },
  ],
  ENT01: [
    {
      q: 'Ear care advice',
      s: [
        'Do not insert anything into the ear — no buds, no oil',
        'Do not let water enter the ear during bathing',
        'Complete the full antibiotic course if prescribed',
        'Ear pain with high fever or swelling behind the ear — urgent review',
      ],
    },
  ],
  ENT03: [
    {
      q: 'Sore throat care advice',
      s: [
        'Warm saline gargles 2-3 times a day (older children)',
        'Warm fluids; avoid cold, fried and spicy foods',
        'Soft diet is preferred for a few days',
        'Rash with sore throat or drooling with muffled voice — urgent review',
      ],
    },
  ],
  ENT04: [
    {
      q: 'Recurrent cold prevention',
      s: [
        'It is normal for toddlers to get 6-8 colds a year — immunity is building',
        'Avoid smoke exposure and crowded closed places',
        'Hand hygiene for the whole family',
        'Consider allergy/adenoid review if every cold lasts beyond 10 days',
      ],
    },
  ],
  NUT01: [
    {
      q: 'Nutritional advice for weight gain',
      s: [
        'Energy-dense diet — add ghee/butter, banana, egg, dal, paneer',
        'Give 2-3 healthy snacks between meals (not biscuits)',
        'Review the growth chart every month',
        'Deworming every 6 months (children above 2 years)',
      ],
    },
  ],
  NUT02: [
    {
      q: 'Appetite improvement advice',
      s: [
        'Fixed meal and snack timings — no grazing in between',
        'Limit milk to about 500-600 ml/day in toddlers',
        'Let the child self-feed; mealtimes without screens and force',
        'Appetite naturally dips after illness — it recovers in 1-2 weeks',
      ],
    },
  ],
  NEO01: [
    {
      q: 'Neonatal jaundice care advice',
      s: [
        'Adequate feeding — 8-12 feeds a day clears bilirubin faster',
        'Watch for deepening yellow color of palms and soles',
        'Bring the baby immediately if very sleepy, refusing feeds, or yellow below the knees',
        'Follow-up bilirubin check on the advised day — do not skip',
      ],
    },
  ],
  DEV01: [
    {
      q: 'Speech stimulation advice',
      s: [
        'Talk, read and sing with the child daily — screen-free face time',
        'No screen time below 2 years of age',
        'One word at a time, with gestures; wait for the child to respond',
        'Formal speech therapy assessment if advised — early help works best',
      ],
    },
  ],
  DEV02: [
    {
      q: 'Developmental stimulation advice',
      s: [
        'Age-appropriate play — floor time, stacking, sorting, ball play',
        'Regular developmental assessment every 3 months',
        'Celebrate small progress — consistency matters more than intensity',
      ],
    },
  ],
  DEV03: [
    {
      q: 'Bedwetting advice',
      s: [
        'No fluids 1-2 hours before bedtime',
        'Toilet visit just before sleep — every night',
        'Positive reinforcement for dry nights — NEVER punish or shame',
        'Most children outgrow it; bedwetting alarm helps after 7 years of age',
      ],
    },
  ],
}

// ── 4. Custom vitals labels (Step 2) ──────────────────────────
const LABELS = [
  { label: 'Height / Length', unit: 'cm' },
  { label: 'Head Circumference', unit: 'cm' },
  { label: 'Respiratory Rate', unit: 'per min' },
]

// ── 5. Findings (diseases/diagnoses) ──────────────────────────
const FINDINGS = [
  'Acute Viral Fever',
  'Upper Respiratory Tract Infection (URTI)',
  'Acute Tonsillopharyngitis',
  'Acute Bronchiolitis',
  'Reactive Airway Disease / Mild Asthma Exacerbation',
  'Acute Gastroenteritis — No or Mild Dehydration',
  'Viral Exanthem (Viral Rash)',
  'Acute Otitis Media',
  'Allergic Rhinitis',
  'Atopic Dermatitis (Eczema)',
  'Iron Deficiency Anemia',
  'Neonatal Hyperbilirubinemia (Physiological Jaundice)',
  'Protein-Energy Malnutrition (Underweight)',
  'Vitamin D Deficiency',
  'Intestinal Worm Infestation',
  'Functional Constipation',
  'Infant Colic',
  'Teething Trouble',
]

// ── 6. Medicines (my pediatric pharmacy) ──────────────────────
// [name, doseOptions, morning, afternoon, evening, days, description]
const MEDICINES: [string, string[], number, number, number, number, string][] = [
  ['Paracetamol Syrup 125 mg/5 ml', ['5 ml (125 mg)', '7.5 ml', '10 ml (250 mg)'], 1, 0, 1, 3, '15 mg/kg/dose; SOS if temp above 100°F; maximum 4 doses in 24 hours'],
  ['Paracetamol Drops 100 mg/ml', ['0.3 ml (30 mg)', '0.6 ml (60 mg)'], 1, 0, 1, 3, 'For infants below 1 year; 15 mg/kg/dose'],
  ['Ibuprofen Suspension 100 mg/5 ml', ['5 ml (100 mg)', '7.5 ml', '10 ml (200 mg)'], 1, 0, 1, 3, '10 mg/kg/dose every 8 hours; give strictly after food'],
  ['Amoxicillin Syrup 125 mg/5 ml', ['2.5 ml', '5 ml (125 mg)'], 1, 1, 1, 7, '25-40 mg/kg/day in 3 divided doses; complete the FULL course'],
  ['Amoxicillin + Clavulanate Dry Syrup 228.5 mg/5 ml', ['2.5 ml', '5 ml'], 1, 0, 1, 7, 'After food; complete the full 5-7 day course; mild loose stools can occur'],
  ['Azithromycin Suspension 200 mg/5 ml', ['2.5 ml (100 mg)', '5 ml (200 mg)'], 1, 0, 0, 3, '10 mg/kg once daily; empty stomach preferred; 3-5 day course'],
  ['Cefixime Suspension 50 mg/5 ml', ['5 ml (50 mg)', '10 ml (100 mg)'], 1, 0, 1, 5, '8 mg/kg/day in 2 divided doses; complete the full course'],
  ['ORS Sachet (Oral Rehydration Salts)', ['100 ml per feed', '200 ml per feed'], 1, 1, 1, 5, 'Dissolve 1 sachet in 200 ml clean water; discard remaining after 24 hours'],
  ['Zinc Sulfate Syrup 20 mg/5 ml', ['2.5 ml (10 mg)', '5 ml (20 mg)'], 0, 0, 1, 14, 'Once daily for 14 days; for babies above 6 months'],
  ['Domperidone Suspension 5 mg/5 ml', ['2.5 ml', '5 ml (5 mg)'], 1, 1, 1, 2, 'Give 15-20 minutes before feeds; maximum 3 times a day'],
  ['Ondansetron Syrup 2 mg/5 ml', ['2.5 ml (1 mg)', '5 ml (2 mg)'], 1, 0, 0, 2, '30 minutes before food; only if vomiting persists'],
  ['Cetirizine Syrup 5 mg/5 ml', ['2.5 ml (2.5 mg)', '5 ml (5 mg)'], 0, 0, 1, 5, 'Bedtime dose; may cause mild drowsiness'],
  ['Levocetirizine Syrup 2.5 mg/5 ml', ['2.5 ml', '5 ml'], 0, 0, 1, 7, 'Bedtime dose; for persistent allergic symptoms'],
  ['Montelukast Granules / Syrup 4 mg', ['1 sachet (4 mg)', '5 ml'], 0, 0, 1, 30, 'Once daily in the evening; continue for full duration — do not stop early'],
  ['Salbutamol Syrup 2 mg/5 ml', ['2.5 ml (1 mg)', '5 ml (2 mg)'], 1, 0, 1, 5, 'Every 8 hours; watch for mild tremor — usually harmless'],
  ['Ambroxol Syrup 15 mg/5 ml', ['2.5 ml', '5 ml', '10 ml'], 1, 0, 1, 5, 'After food; plenty of fluids alongside'],
  ['Lactulose Syrup 10 g/15 ml', ['5 ml', '10 ml', '15 ml'], 0, 0, 1, 14, 'Bedtime dose; adjust to achieve soft stool'],
  ['Albendazole 400 mg Chewable Tablet', ['200 mg (half tablet)', '400 mg (1 tablet)'], 0, 0, 1, 1, 'Single dose at night after food; repeat after 2 weeks; above 2 years of age'],
  ['Iron + Folic Acid Syrup', ['2.5 ml', '5 ml'], 1, 0, 1, 60, 'After food with a vitamin C source (citrus juice); avoid tea and milk nearby; stools may turn black — harmless'],
  ['Vitamin D3 Drops 400 IU/ml', ['0.5 ml (400 IU)', '1 ml (800 IU)'], 1, 0, 0, 60, 'Once daily with a feed; do not exceed the advised dose'],
  ['Multivitamin Drops / Syrup', ['0.5 ml', '5 ml'], 1, 0, 0, 30, 'Once daily after food'],
  ['Calcium + Vitamin D3 Syrup', ['2.5 ml', '5 ml'], 1, 0, 1, 30, 'After food; do not give together with iron syrup'],
  ['Calamine Lotion', ['Apply thin layer', 'Apply locally'], 0, 0, 0, 5, 'External use only; apply on clean dry skin 2-3 times a day'],
  ['Hydrocortisone Cream 1%', ['Apply thin layer'], 0, 0, 0, 7, 'Once to twice daily for not more than 7 days; avoid the face unless advised'],
  ['Nasal Saline Drops (Isotonic)', ['1-2 drops each nostril', '2 drops each nostril'], 1, 1, 1, 5, 'Before feeds and before sleep; safe even for newborns'],
  ['Simethicone Colic Drops 40 mg/0.6 ml', ['0.3 ml', '0.6 ml'], 0, 0, 1, 10, 'After feeds followed by burping'],
]

// ── 7. Finding ↔ Medicine treatment links ─────────────────────
// [finding, medicine, dose, morning, afternoon, evening, days, instructions]
const FINDING_MEDS: [string, string, string, number, number, number, number, string][] = [
  ['Acute Viral Fever', 'Paracetamol Syrup 125 mg/5 ml', '5 ml (125 mg)', 1, 0, 1, 3, 'SOS if temp above 100°F; maximum 4 doses in 24 hours'],
  ['Acute Viral Fever', 'ORS Sachet (Oral Rehydration Salts)', '100 ml per feed', 1, 1, 1, 3, 'To maintain hydration during fever'],
  ['Upper Respiratory Tract Infection (URTI)', 'Cetirizine Syrup 5 mg/5 ml', '2.5 ml (2.5 mg)', 0, 0, 1, 5, 'Bedtime dose'],
  ['Upper Respiratory Tract Infection (URTI)', 'Ambroxol Syrup 15 mg/5 ml', '2.5 ml', 1, 0, 1, 5, 'If cough present'],
  ['Upper Respiratory Tract Infection (URTI)', 'Nasal Saline Drops (Isotonic)', '1-2 drops each nostril', 1, 1, 1, 5, 'Before feeds and sleep'],
  ['Upper Respiratory Tract Infection (URTI)', 'Paracetamol Syrup 125 mg/5 ml', '5 ml (125 mg)', 1, 0, 1, 3, 'If fever or pain'],
  ['Acute Tonsillopharyngitis', 'Amoxicillin + Clavulanate Dry Syrup 228.5 mg/5 ml', '2.5 ml', 1, 0, 1, 7, 'Complete the full course even if better in 2-3 days'],
  ['Acute Tonsillopharyngitis', 'Paracetamol Syrup 125 mg/5 ml', '5 ml (125 mg)', 1, 0, 1, 3, 'For throat pain'],
  ['Acute Bronchiolitis', 'Salbutamol Syrup 2 mg/5 ml', '2.5 ml (1 mg)', 1, 0, 1, 5, 'Every 8 hours; watch for mild tremor'],
  ['Acute Bronchiolitis', 'Nasal Saline Drops (Isotonic)', '1-2 drops each nostril', 1, 1, 1, 5, 'Clear the nose before feeds'],
  ['Acute Bronchiolitis', 'Paracetamol Syrup 125 mg/5 ml', '5 ml (125 mg)', 1, 0, 1, 2, 'If fever'],
  ['Reactive Airway Disease / Mild Asthma Exacerbation', 'Salbutamol Syrup 2 mg/5 ml', '2.5 ml (1 mg)', 1, 0, 1, 5, 'Every 8 hours'],
  ['Reactive Airway Disease / Mild Asthma Exacerbation', 'Montelukast Granules / Syrup 4 mg', '1 sachet (4 mg)', 0, 0, 1, 30, 'Continue nightly for 30 days; do not stop early'],
  ['Acute Gastroenteritis — No or Mild Dehydration', 'ORS Sachet (Oral Rehydration Salts)', '100 ml per feed', 1, 1, 1, 5, 'After every loose stool; small sips repeatedly'],
  ['Acute Gastroenteritis — No or Mild Dehydration', 'Zinc Sulfate Syrup 20 mg/5 ml', '2.5 ml (10 mg)', 0, 0, 1, 14, 'Once daily for full 14 days'],
  ['Acute Gastroenteritis — No or Mild Dehydration', 'Domperidone Suspension 5 mg/5 ml', '2.5 ml', 1, 1, 1, 2, 'Only if vomiting; 15-20 min before feeds'],
  ['Viral Exanthem (Viral Rash)', 'Calamine Lotion', 'Apply thin layer', 0, 0, 0, 5, 'Twice daily on the rash'],
  ['Viral Exanthem (Viral Rash)', 'Cetirizine Syrup 5 mg/5 ml', '2.5 ml (2.5 mg)', 0, 0, 1, 5, 'If itching disturbs sleep'],
  ['Viral Exanthem (Viral Rash)', 'Paracetamol Syrup 125 mg/5 ml', '5 ml (125 mg)', 1, 0, 1, 3, 'If fever'],
  ['Acute Otitis Media', 'Amoxicillin + Clavulanate Dry Syrup 228.5 mg/5 ml', '2.5 ml', 1, 0, 1, 7, 'High dose; complete the full course'],
  ['Acute Otitis Media', 'Paracetamol Syrup 125 mg/5 ml', '5 ml (125 mg)', 1, 0, 1, 3, 'For ear pain'],
  ['Allergic Rhinitis', 'Cetirizine Syrup 5 mg/5 ml', '2.5 ml (2.5 mg)', 0, 0, 1, 14, 'Bedtime dose'],
  ['Allergic Rhinitis', 'Montelukast Granules / Syrup 4 mg', '1 sachet (4 mg)', 0, 0, 1, 30, 'Nightly; works best after 2-3 weeks of regular use'],
  ['Allergic Rhinitis', 'Nasal Saline Drops (Isotonic)', '2 drops each nostril', 1, 1, 1, 14, 'To wash off allergens'],
  ['Atopic Dermatitis (Eczema)', 'Hydrocortisone Cream 1%', 'Apply thin layer', 0, 0, 0, 7, 'Twice daily on flaring patches; maximum 7 days on the face'],
  ['Atopic Dermatitis (Eczema)', 'Cetirizine Syrup 5 mg/5 ml', '2.5 ml (2.5 mg)', 0, 0, 1, 7, 'For itching'],
  ['Iron Deficiency Anemia', 'Iron + Folic Acid Syrup', '5 ml', 1, 0, 1, 60, 'With vitamin C source; avoid tea and milk nearby; review after 8 weeks'],
  ['Neonatal Hyperbilirubinemia (Physiological Jaundice)', 'Vitamin D3 Drops 400 IU/ml', '0.5 ml (400 IU)', 1, 0, 0, 30, 'Daily supplement while on follow-up'],
  ['Protein-Energy Malnutrition (Underweight)', 'Multivitamin Drops / Syrup', '5 ml', 1, 0, 0, 30, 'Once daily after food'],
  ['Protein-Energy Malnutrition (Underweight)', 'Zinc Sulfate Syrup 20 mg/5 ml', '2.5 ml (10 mg)', 0, 0, 1, 14, 'Helps appetite recovery'],
  ['Vitamin D Deficiency', 'Vitamin D3 Drops 400 IU/ml', '1 ml (800 IU)', 1, 0, 0, 60, '800 IU daily for 8 weeks, then maintenance 400 IU'],
  ['Vitamin D Deficiency', 'Calcium + Vitamin D3 Syrup', '5 ml', 1, 0, 1, 30, 'After food'],
  ['Intestinal Worm Infestation', 'Albendazole 400 mg Chewable Tablet', '400 mg (1 tablet)', 0, 0, 1, 1, 'Single dose at night; repeat after 2 weeks'],
  ['Functional Constipation', 'Lactulose Syrup 10 g/15 ml', '5 ml', 0, 0, 1, 14, 'Bedtime; adjust to soft stool; diet changes alongside'],
  ['Infant Colic', 'Simethicone Colic Drops 40 mg/0.6 ml', '0.3 ml', 0, 0, 1, 10, 'After feeds; burp well after each dose'],
  ['Teething Trouble', 'Paracetamol Syrup 125 mg/5 ml', '2.5 ml', 1, 0, 1, 2, 'SOS for pain'],
]

// ── 8. Table templates ────────────────────────────────────────
// [name, rows, cols, headerLabel[], colsLabel[], footerLabel[], extraLabel]
const TABLE_TEMPLATES: [string, number, number, string[], string[], string[], string][] = [
  ['Growth Monitoring Chart', 4, 4, ['Visit', 'Weight (kg)', 'Height (cm)', 'Head Circ (cm)'], ['Current visit', 'Previous visit', '6 months ago', 'At birth'], [], 'Plot on WHO growth chart at every visit'],
  ['Milestone Assessment', 5, 2, ['Milestone', 'Age Achieved'], ['Head control', 'Sitting without support', 'Standing with support', 'Walking independently', 'First meaningful words'], [], ''],
  ['Feeding History', 4, 2, ['Feed Type', 'Amount / Frequency'], ['Breast milk', 'Formula / Cow milk', 'Solid foods', 'Water'], [], ''],
  ['Vaccination Due', 5, 3, ['Vaccine', 'Due Date', 'Status'], ['BCG / OPV-0 (birth)', 'Pentavalent + OPV/IPV (6,10,14 wk)', 'MMR-1 (9 months)', 'MMR-2 / DTP booster (16-24 months)', 'DTP + IPV + MMR boosters (5-6 years)'], ['Carry the immunization card at every visit'], ''],
  ['Fever Chart', 3, 3, ['Day', 'Max Temp (°F)', 'Medicine Given'], ['Day 1', 'Day 2', 'Day 3'], [], 'Record temperature 3 times a day'],
  ['Investigation Summary', 4, 3, ['Test', 'Result', 'Impression'], ['CBC with differential', 'Urine routine', 'Stool routine', 'CRP / Culture (if advised)'], [], ''],
]

// ── 9. Rx quick-packages ──────────────────────────────────────
const RX_TEMPLATES = [
  {
    name: 'Viral Fever — Child (2-5 yrs)',
    diagnosis: 'Acute Viral Fever',
    medicines: [
      { name: 'Paracetamol Syrup 125 mg/5 ml', dose: '5 ml (125 mg)', duration: '3 days', instructions: 'SOS if temp above 100°F; max 4 doses/24 hrs' },
      { name: 'ORS Sachet (Oral Rehydration Salts)', dose: '100 ml per feed', duration: '3 days', instructions: 'To maintain hydration' },
    ],
    labs: ['CBC with differential (only if fever persists beyond 3 days)'],
    advice: 'Tepid sponging during high fever. Plenty of fluids and rest. Revisit immediately if child becomes lethargic, refuses feeds, or develops rash.',
    followUpDays: 3,
    isCommon: true,
  },
  {
    name: 'Acute Gastroenteritis — Child',
    diagnosis: 'Acute Gastroenteritis — No or Mild Dehydration',
    medicines: [
      { name: 'ORS Sachet (Oral Rehydration Salts)', dose: '100 ml per feed', duration: '5 days', instructions: 'After every loose stool; small sips' },
      { name: 'Zinc Sulfate Syrup 20 mg/5 ml', dose: '2.5 ml (10 mg)', duration: '14 days', instructions: 'Once daily at bedtime' },
      { name: 'Domperidone Suspension 5 mg/5 ml', dose: '2.5 ml', duration: '2 days', instructions: 'Only if vomiting; before feeds' },
    ],
    labs: ['Stool routine and culture (if blood in stool or persistent)'],
    advice: 'Continue breastfeeding / normal diet — do not starve. Watch for dehydration: sunken eyes, dry tongue, reduced urine. Revisit immediately if blood in stool or child becomes drowsy.',
    followUpDays: 2,
    isCommon: true,
  },
  {
    name: 'Common Cold / URTI — Child',
    diagnosis: 'Upper Respiratory Tract Infection',
    medicines: [
      { name: 'Cetirizine Syrup 5 mg/5 ml', dose: '2.5 ml (2.5 mg)', duration: '5 days', instructions: 'Bedtime dose' },
      { name: 'Ambroxol Syrup 15 mg/5 ml', dose: '2.5 ml', duration: '5 days', instructions: 'If cough; after food' },
      { name: 'Nasal Saline Drops (Isotonic)', dose: '1-2 drops each nostril', duration: '5 days', instructions: 'Before feeds and sleep' },
    ],
    labs: [],
    advice: 'Warm fluids and steam (older children). Avoid cold drinks and dusty places. Revisit immediately if breathing becomes fast or child develops chest indrawing.',
    followUpDays: 5,
    isCommon: true,
  },
  {
    name: 'Wheezing — First / Acute Episode',
    diagnosis: 'Reactive Airway Disease — Mild Exacerbation',
    medicines: [
      { name: 'Salbutamol Syrup 2 mg/5 ml', dose: '2.5 ml (1 mg)', duration: '5 days', instructions: 'Every 8 hours' },
      { name: 'Montelukast Granules / Syrup 4 mg', dose: '1 sachet (4 mg)', duration: '30 days', instructions: 'Every night; do not stop early' },
    ],
    labs: [],
    advice: 'Avoid smoke, dust, incense, strong smells and furry pets at home. Complete the full course. Emergency if child speaks in broken words or chest is indrawing.',
    followUpDays: 3,
    isCommon: true,
  },
]

// ── 10. Print settings ────────────────────────────────────────
const PRINT_SETTINGS = {
  header: 'Shah Child Care Clinic — Pediatric & Neonatal OPD\nDr. Amit Shah, MBBS, MD (Pediatrics) — Consultant Pediatrician',
  footer: 'Revisit as advised • For emergencies call +91 98250 12345 (24×7) • OPD: Mon-Sat, 10 AM-1 PM & 5-8 PM • Sunday by appointment',
}

// ══════════════════════════════════════════════════════════════
// SEED LOGIC
// ══════════════════════════════════════════════════════════════

async function main() {
  console.log('Seeding pediatrician master data for Dr. Amit Shah…\n')

  const { DOCTOR_ID, USER_ID } = await resolveDoctor()
  console.log(`Target doctor → doctorId=${DOCTOR_ID} userId=${USER_ID}\n`)

  // ── Doctor profile (data update: demo coherence as pediatrician)
  await db.doctor.update({
    where: { id: DOCTOR_ID },
    data: {
      specialization: 'Pediatrics',
      education: 'MBBS, MD (Pediatrics & Neonatology)',
      registrationDetail: 'Reg. No. GMC-2011-28745 (Gujarat Medical Council)',
    },
  })
  console.log('✓ Doctor profile → Pediatrics')

  // ── Wipe this doctor's existing master rows (idempotent)
  await db.findingsMedicine.deleteMany({ where: { finding: { doctorId: DOCTOR_ID } } })
  await db.suggestionsMaster.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await db.questionsMaster.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await db.coMaster.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await db.categoryMaster.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await db.labelMaster.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await db.findingsMaster.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await db.doctorMedicine.deleteMany({ where: { userId: DOCTOR_ID } })
  await db.tableTemplateMaster.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await db.prescriptionTemplate.deleteMany({ where: { doctorId: DOCTOR_ID } })

  // ── Categories
  const catMap = new Map<string, string>()
  for (const c of CATEGORIES) {
    const row = await db.categoryMaster.create({
      data: { name: c.name, nameEn: '', status: 'Active', doctorId: DOCTOR_ID, createdById: USER_ID },
    })
    catMap.set(c.name, row.id)
  }
  console.log(`✓ ${CATEGORIES.length} categories`)

  // ── Complaints
  const coMap = new Map<string, string>() // coCode → id
  for (const [code, detail, category] of COMPLAINTS) {
    const row = await db.coMaster.create({
      data: {
        coCode: code,
        coDetail: detail,
        coDetailEn: '',
        categoryId: catMap.get(category) ?? null,
        status: 'Active',
        doctorId: DOCTOR_ID,
        createdById: USER_ID,
      },
    })
    coMap.set(code, row.id)
  }
  console.log(`✓ ${COMPLAINTS.length} complaints (C/O)`)

  // ── Questions + Suggestions
  let qCount = 0
  let sCount = 0
  for (const [coCode, questions] of Object.entries(QNA)) {
    const coId = coMap.get(coCode)
    if (!coId) continue
    for (const { q, s } of questions) {
      const qRow = await db.questionsMaster.create({
        data: {
          question: q,
          questionEn: '',
          explanation: '',
          coId,
          status: 'Active',
          doctorId: DOCTOR_ID,
          createdById: USER_ID,
        },
      })
      qCount++
      for (const text of s) {
        await db.suggestionsMaster.create({
          data: {
            questionId: qRow.id,
            suggestions: text,
            suggestionsEn: '',
            status: 'Active',
            doctorId: DOCTOR_ID,
            createdById: USER_ID,
          },
        })
        sCount++
      }
    }
  }
  console.log(`✓ ${qCount} questions, ${sCount} suggestions (advice lines)`)

  // ── Labels (custom vitals)
  for (const l of LABELS) {
    await db.labelMaster.create({
      data: {
        label: l.label,
        labelEn: '',
        unit: l.unit,
        showUnit: true,
        status: 'Active',
        doctorId: DOCTOR_ID,
        createdById: USER_ID,
      },
    })
  }
  console.log(`✓ ${LABELS.length} custom vital labels`)

  // ── Findings
  const findingMap = new Map<string, string>()
  for (const f of FINDINGS) {
    const row = await db.findingsMaster.create({
      data: { name: f, nameEn: '', status: 'Active', doctorId: DOCTOR_ID, createdById: USER_ID },
    })
    findingMap.set(f, row.id)
  }
  console.log(`✓ ${FINDINGS.length} findings (diagnoses)`)

  // ── Medicines
  const medMap = new Map<string, string>()
  for (const [name, doseOptions, morning, afternoon, evening, tab, description] of MEDICINES) {
    const row = await db.doctorMedicine.create({
      data: {
        name,
        dose: JSON.stringify(doseOptions),
        morning,
        afternoon,
        evening,
        tab,
        description,
        status: 'Active',
        userId: DOCTOR_ID, // DoctorMedicine.userId = Doctor.id
      },
    })
    medMap.set(name, row.id)
  }
  console.log(`✓ ${MEDICINES.length} medicines`)

  // ── Finding ↔ Medicine links
  let linkCount = 0
  for (const [finding, medicine, dose, morning, afternoon, evening, tab, description] of FINDING_MEDS) {
    const findingId = findingMap.get(finding)
    const medicineId = medMap.get(medicine)
    if (!findingId || !medicineId) {
      console.warn(`⚠ link skipped: ${finding} → ${medicine}`)
      continue
    }
    await db.findingsMedicine.create({
      data: { findingId, medicineId, dose, morning, afternoon, evening, tab, description },
    })
    linkCount++
  }
  console.log(`✓ ${linkCount} finding↔medicine treatment links`)

  // ── Table templates
  for (const [name, rows, cols, header, colsLabel, footer, extra] of TABLE_TEMPLATES) {
    await db.tableTemplateMaster.create({
      data: {
        name,
        rows,
        cols,
        headerLabel: JSON.stringify(header),
        colsLabel: JSON.stringify(colsLabel),
        footerLabel: JSON.stringify(footer),
        extraLabel: extra,
        status: 'Active',
        doctorId: DOCTOR_ID,
        createdById: USER_ID,
      },
    })
  }
  console.log(`✓ ${TABLE_TEMPLATES.length} table templates`)

  // ── Rx quick-packages
  for (const t of RX_TEMPLATES) {
    await db.prescriptionTemplate.create({
      data: {
        name: t.name,
        diagnosis: t.diagnosis,
        medicines: JSON.stringify(t.medicines),
        labs: JSON.stringify(t.labs),
        advice: t.advice,
        followUpDays: t.followUpDays,
        isCommon: t.isCommon,
        doctorId: DOCTOR_ID,
      },
    })
  }
  console.log(`✓ ${RX_TEMPLATES.length} Rx quick-packages`)

  // ── Print settings (upsert — doctorId is unique)
  await db.pOtherSetting.upsert({
    where: { doctorId: DOCTOR_ID },
    update: { ...PRINT_SETTINGS, showCoInPrint: true, showNextVisit: true, printLayout: 'standard' },
    create: {
      doctorId: DOCTOR_ID,
      ...PRINT_SETTINGS,
      logo: '',
      time: '{}',
      showCoInPrint: true,
      showNextVisit: true,
      printLayout: 'standard',
      createdById: USER_ID,
    },
  })
  console.log('✓ Print settings (clinic header/footer)')

  // ── Summary
  const counts = {
    categories: await db.categoryMaster.count({ where: { doctorId: DOCTOR_ID } }),
    complaints: await db.coMaster.count({ where: { doctorId: DOCTOR_ID } }),
    questions: await db.questionsMaster.count({ where: { doctorId: DOCTOR_ID } }),
    suggestions: await db.suggestionsMaster.count({ where: { doctorId: DOCTOR_ID } }),
    labels: await db.labelMaster.count({ where: { doctorId: DOCTOR_ID } }),
    findings: await db.findingsMaster.count({ where: { doctorId: DOCTOR_ID } }),
    medicines: await db.doctorMedicine.count({ where: { userId: DOCTOR_ID } }),
    findingMeds: await db.findingsMedicine.count({ where: { finding: { doctorId: DOCTOR_ID } } }),
    tableTemplates: await db.tableTemplateMaster.count({ where: { doctorId: DOCTOR_ID } }),
    rxTemplates: await db.prescriptionTemplate.count({ where: { doctorId: DOCTOR_ID } }),
  }
  console.log('\nSEED COMPLETE — Dr. Amit Shah (Pediatrics):')
  console.log(JSON.stringify(counts, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
