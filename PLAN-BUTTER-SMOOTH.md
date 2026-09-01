# Doctorooms — "Butter Smooth" Hospital Flow Architecture
# Act as Architect + Hospital Owner

> **Core Principle:** 10 receptionists ka kaam 2 se ho jaaye. Patient ko physical token card mile. Doctor chahe to 1 key se patient complete kare. Butter smooth.
> **Status:** PLAN ONLY — no development yet

---

## 🏥 REAL HOSPITAL OWNER'S MINDSET

### "Mera hospital mein aisa ho..."

```
1. Heavy traffic (Monday morning, 500 patients):
   - Reception pe 2 log baithe hain (10 nahi)
   - Patient aaya → naam + mobile bola → 5 second mein token mila
   - Time slot? "Nahi chahiye, sidha queue mein daalo"
   - Token slip print hui → patient ne li → waiting area mein baith gaya
   
2. Patient ko physical card mili:
   - Token: CARD-016
   - Dr. Sharma, Cardiology, Room 3
   - Position: #11
   - QR code: scan karke live position dekho
   - Patient card kho gayi? → reception se reprint (2 second)
   
3. Doctor ke paas:
   - "Next Patient" button → patient card screen pe aati hai
   - Patient ka pura history dikhta hai (last visit, meds, allergies)
   - Doctor 2 tarah se prescription bhar sakta hai:
     a. Online (6-step stepper) — tech-savvy doctors
     b. Paper pe likha → photo khincha → "Mark Complete" (1 key)
   - Doctor ko time waste nahi karna tech pe
   
4. Patient ko later:
   - SMS aaya: token, doctor, room, position
   - Phone pe live position dekh sakta hai
   - Position #3 pe SMS: "Room 3 mein aao"
   
5. Exit pe:
   - Pharmacy se davai mili
   - Feedback SMS: "Rate your visit"
   - Next appointment reminder (agar doctor ne bola)
```

---

## 🎯 5 CORE DESIGN DECISIONS

### Decision 1: Heavy Traffic = "Express Mode" (No Time Slot)

**Problem:** 500 patients Monday morning. Receptionist har patient ke liye time slot select nahi karega. That's 500 × 30 seconds = 4 hours wasted.

**Solution — Two booking lanes:**

```
┌─────────────────────────────────────────────────────────┐
│                    RECEPTION COUNTER                     │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────┐    │
│  │  EXPRESS LANE   │    │  APPOINTMENT LANE        │    │
│  │  (90% patients) │    │  (10% patients)          │    │
│  │                 │    │                         │    │
│  │  Name + Mobile  │    │  Name + Mobile + Age    │    │
│  │  ↓              │    │  + Chief Complaint      │    │
│  │  Dept (1 click) │    │  + Dept + Doctor        │    │
│  │  ↓              │    │  + Time Slot            │    │
│  │  Doctor (auto   │    │  ↓                      │    │
│  │   or 1 click)   │    │  Confirm → Token        │    │
│  │  ↓              │    │                         │    │
│  │  PRINT TOKEN    │    │  (for patients who      │    │
│  │  (3 seconds)    │    │   pre-booked online or  │    │
│  │                 │    │   want specific time)   │    │
│  └─────────────────┘    └─────────────────────────┘    │
│                                                         │
│  2 receptionists handle 500 patients in 90 minutes     │
│  (vs 10 receptionists in 3 hours with old system)      │
└─────────────────────────────────────────────────────────┘
```

**Express Lane flow (5 seconds per patient):**
```
Receptionist types: "Rahul" → auto-suggest from mobile no.
                   → "9876543210" → existing patient? auto-fill name+age+gender
                   → Select Dept: [Cardiology] (1 click)
                   → Doctor auto-assigned (shortest queue) OR select [Dr. Sharma]
                   → [PRINT TOKEN] button → slip prints → done
                   
No time slot. No age typing (auto-filled). No disease typing (patient tells doctor).
```

**Backend:** `POST /api/express-walkin` — minimal fields:
- `patientName` (required)
- `mobileNo` (required — for auto-link + SMS)
- `departmentId` (required)
- `doctorId` (optional — if not given, auto-assign shortest queue)
- `age`, `gender`, `disease` — all optional (doctor fills later)

**Status:** `Approve` immediately. Token generated immediately. No pending step.

### Decision 2: Physical Token Card (Printable Slip)

**Problem:** AIIMS mein patient ko physical card milti hai. Digital-only nahi chalta — patient phone nahi dekh sakta (bade log, gaon se aaye log).

**Solution — Thermal Printer Token Slip:**

```
┌─────────────────────────────────────┐
│        ┌─────────────┐              │
│        │   ╔═════╗   │              │
│        │   ║CARD ║   │              │
│        │   ║ 016 ║   │              │
│        │   ╚═════╝   │              │
│        └─────────────┘              │
│                                     │
│   City General Hospital             │
│   ─────────────────────────         │
│   Token: CARD-016                   │
│   Patient: Rahul Verma              │
│   Age: 35 / Male                    │
│                                     │
│   Doctor: Dr. Anita Desai           │
│   Dept: Cardiology                  │
│   Room: OPD-3, 1st Floor            │
│                                     │
│   Queue Position: #11               │
│   Est. Wait: ~45 min                │
│                                     │
│   Date: 15 Aug 2025                 │
│   ─────────────────────────         │
│   ┌─────────────────────────┐       │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │       │
│   │ ▓▓ QR CODE ▓▓▓▓▓▓▓▓▓▓▓ │       │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │       │
│   └─────────────────────────┘       │
│   Scan to see live queue position   │
│                                     │
│   Keep this slip for consultation   │
└─────────────────────────────────────┘
         (58mm thermal paper)
```

**Implementation:**
- `POST /api/bookings/print-token/[bookingId]` — returns printable HTML
- Browser's `window.print()` with `@media print` CSS (58mm width)
- Works with any thermal printer (ESC/POS) or regular printer
- Receptionist clicks "Print Token" → slip prints in 2 seconds

**Token card contains:**
- Token number (HUGE font — readable from distance)
- Patient name, age, gender
- Doctor name + department + room number
- Queue position + estimated wait
- QR code → patient scans → live position on phone
- Hospital name + date
- "Keep this slip" instruction (in Hindi + English)

**Reprint:** Receptionist has "Reprint Token" button (search by mobile → reprint in 2 seconds if patient lost slip)

### Decision 3: Doctor's "One Key Complete" (Paper Prescription Mode)

**Problem:** Doctor ko har patient ke liye 6-step online prescription bharna padega. 50 patients × 5 min = 4 hours extra. Real doctors paper pe likhte hain, tech nahi use karte.

**Solution — Dual Prescription Mode:**

```
┌─────────────────────────────────────────────────────────┐
│                  DOCTOR'S CONSULTATION                   │
│                                                         │
│  Patient: Rahul Verma (35/M)                           │
│  Token: CARD-016                                       │
│  Chief Complaint: Fever, body pain (2 days)            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Patient History (auto-loaded):                  │   │
│  │  • Last visit: 15 Jul 2025 — Hypertension f/u   │   │
│  │  • Active meds: Amlodipine 5mg OD                │   │
│  │  • Allergies: Penicillin ⚠️                       │   │
│  │  • BP: 140/90 (last visit)                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────┐    ┌────────────────────────────┐   │
│  │  DIGITAL RX    │    │  PAPER RX (Quick Mode)     │   │
│  │  (6-step       │    │                            │   │
│  │   stepper)     │    │  Doctor writes on paper:   │   │
│  │                │    │  ┌──────────────────────┐  │   │
│  │  [Start Full   │    │  │ Rx pad               │  │   │
│  │   Prescription]│    │  │ ──────────────────── │  │   │
│  │                │    │  │ Tab Paracetamol 650  │  │   │
│  │  Full digital  │    │  │ BD x 3 days          │  │   │
│  │  prescription  │    │  │ Rest + fluids         │  │   │
│  │  with all the  │    │  │ Follow-up 1 week     │  │   │
│  │  master data   │    │  └──────────────────────┘  │   │
│  │  integration    │    │                            │   │
│  │                │    │  [📸 Take Photo]           │   │
│  │  For tech-     │    │  [✓ MARK COMPLETE]         │   │
│  │  savvy doctors │    │     (one key — done!)      │   │
│  └────────────────┘    └────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  QUICK TEMPLATES (1-click full prescription):    │   │
│  │  [Viral Fever] [Hypertension f/u] [Diabetes f/u] │   │
│  │  [Acute Bronchitis] [UTI] [GERD] [Migraine]      │   │
│  │  → Adds medicines + labs + advice automatically  │   │
│  │  → Doctor just reviews + [Save]                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Three prescription modes:**

| Mode | Who | Time | How |
|------|-----|------|-----|
| **Full Digital** | Tech-savvy doctors | 3-5 min | 6-step stepper (already built) |
| **Quick Template** | Most doctors | 30 sec | 1-click template → review → save |
| **Paper + Photo** | Traditional doctors | 10 sec | Write on paper → photo → mark complete |

**Paper + Photo flow:**
```
1. Doctor writes prescription on their Rx pad (as they've done for 20 years)
2. Doctor clicks "Mark Complete" button on screen
3. (Optional) Doctor takes photo of the paper → uploads
4. System: 
   - Sets booking status = 'Finish'
   - Saves photo as prescription attachment
   - Patient gets SMS: "Prescription ready, collect from pharmacy"
   - Pharmacy sees the photo + can dispense
5. Total time: 10 seconds (or 30 sec with photo)
```

**Schema addition:**
```prisma
// Add to Prescription model:
prescriptionMode  String  @default("Digital")  // Digital, Template, Paper
paperPhotoUrl     String?                       // if Paper mode, URL of photo
paperPhotoUploadedAt DateTime?

// New model: PrescriptionTemplate (doctor's saved templates)
model PrescriptionTemplate {
  id           String   @id @default(cuid())
  doctorId     String
  name         String   // "Viral Fever", "HTN Follow-up"
  diagnosis    String   @default("")
  medicines    String   @default("[]")  // JSON: [{name, dose, timing, duration}]
  labs         String   @default("[]")  // JSON: [test names]
  advice       String   @default("")
  isCommon     Boolean  @default(false) // appears in quick-access row
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Decision 4: Doctor Dashboard — "Next Patient" Auto-Call

**Problem:** Doctor finishes patient → has to navigate to appointments page → find next → click start. Wastes 30 seconds per patient × 50 patients = 25 minutes wasted.

**Solution — Auto-Next flow:**

```
Doctor finishes Patient A (clicks "Finish"):
  ↓
Screen instantly shows:
  ┌─────────────────────────────────────────┐
  │  NEXT PATIENT                           │
  │                                         │
  │  Token: CARD-017                        │
  │  Patient: Priya Singh (28/F)            │
  │  Waiting: 45 min                        │
  │  Chief Complaint: Chest pain            │
  │                                         │
  │  ┌─────────────────────────────────┐    │
  │  │ Patient History:                │    │
  │  │ • Last visit: 2 months ago     │    │
  │  │ • Active meds: Metformin 500    │    │
  │  │ • Allergies: None               │    │
  │  │ • Recent labs: CBC (normal)     │    │
  │  └─────────────────────────────────┘    │
  │                                         │
  │  [✓ Call Patient]  [Skip]  [Transfer]   │
  └─────────────────────────────────────────┘

Doctor clicks "Call Patient":
  - Token CARD-017 flashes on TV in waiting area
  - SMS to patient: "Your turn now. Room 3."
  - Patient enters
  - Doctor clicks "Start Consultation" → full patient profile opens
```

**"Skip" button:** Patient went to bathroom? Doctor can skip → patient moved to end of queue (token reassigned).

**"Transfer" button:** Doctor realizes this is a cardiac case, not general → transfers to Cardiology with 1 click.

### Decision 5: Auto-Doctor Assignment (Load Balancing)

**Problem:** 5 doctors in General Medicine. Patient doesn't care which doctor — just wants to be seen fast. Receptionist manually picks → some doctors have 20 patients, some have 5. Unbalanced.

**Solution — Auto-assign shortest queue:**

```
Patient: "I want to see a General Medicine doctor"
Receptionist: selects "General Medicine" → doesn't select doctor
System auto-assigns:
  - Dr. A: 15 patients in queue
  - Dr. B: 8 patients in queue  ← SHORTEST
  - Dr. C: 12 patients in queue
  → Assigns to Dr. B
  → Token: GEN-009 (Dr. B's queue)
```

**API:** `POST /api/express-walkin` with `autoAssignDoctor: true`:
```typescript
// Find doctors in department with shortest active queue
const doctors = await db.doctorHospital.findMany({
  where: { departmentId, hospitalId, status: 'Active', isAvailable: true },
  include: { doctor: { include: { _count: { select: { bookings: { where: {
    bookingDate: today, status: { in: ['Approve', 'Visited'] }
  }} } } } } }
})
// Sort by queue length ascending
const shortestQueueDoctor = doctors.sort((a, b) => 
  a.doctor._count.bookings - b.doctor._count.bookings
)[0]
```

---

## 🏗️ ADDITIONAL REAL-WORLD SCENARIOS (Architect's View)

### Scenario 6: Return Patient Auto-Detection

**Real situation:** Rahul Verma 3 months pehle bhi aaya tha. Receptionist ko nahi pata. Doctor ko nahi pata. Rahul ko puri history dobara batani padti hai.

**Solution — Mobile number auto-detection:**
```
Receptionist types mobile: 9876543210
  ↓ (instant lookup)
System: "Existing patient found!"
  → Auto-fills: Rahul Verma, 35/M, [last visit: 15 May 2025]
  → Shows doctor: "Last seen by Dr. Sharma for Hypertension"
  → Doctor sees: full history, ongoing meds, lab trends

Receptionist just clicks [PRINT TOKEN] — no typing name, age, gender.
```

**Implementation:** `GET /api/patient/lookup?mobile=9876543210` — returns existing patient profile if found. Called on mobile number blur in the express lane form.

### Scenario 7: Patient Flow Tracking (Where is the patient?)

**Real situation:** Hospital admin wants to know — "Ye patient kahan hai? Reception pe register hua, waiting area mein hai, doctor ke paas hai, pharmacy mein hai?"

**Solution — Patient Flow Timeline:**
```
┌─────────────────────────────────────────────────────┐
│  Patient: Rahul Verma (CARD-016)                    │
│                                                     │
│  ● Registered       09:15 AM  (Reception)          │
│  ● In Waiting       09:16 AM  (Waiting Area)       │
│  ● Called           10:02 AM  (Doctor called)      │
│  ● In Consultation  10:05 AM  (Dr. Sharma)         │
│  ● Prescription     10:15 AM  (Digital Rx done)    │
│  ● At Pharmacy      10:18 AM  (Medicine queue)     │
│  ● Completed        10:25 AM  (Exit)               │
│                                                     │
│  Total time in hospital: 1 hour 10 min              │
│  Consultation time: 10 min                          │
│  Waiting time: 47 min                              │
└─────────────────────────────────────────────────────┘
```

**Schema addition:**
```prisma
model PatientFlowEvent {
  id          String   @id @default(cuid())
  bookingId   String
  hospitalId  String
  eventType   String   // Registered, Waiting, Called, Consulting, RxComplete, Pharmacy, Exit
  location    String   @default("") // "Reception", "Waiting Area", "OPD-3", "Pharmacy"
  timestamp   DateTime @default(now())
  
  @@index([bookingId, timestamp])
  @@index([hospitalId, timestamp])
}
```

**Admin dashboard:** Shows average patient journey time — "Today: avg 52 min per patient, 12 min waiting, 8 min consultation". Helps identify bottlenecks.

### Scenario 8: Camp Day / Bulk Registration

**Real situation:** Hospital arranges a "Free Eye Check-up Camp". 300 patients arrive in 2 hours. Normal flow will crash.

**Solution — Bulk Registration Mode:**
```
Receptionist uploads CSV: [name, mobile, age, gender] × 300 rows
  ↓
System:
  - Creates 300 bookings automatically
  - Assigns tokens sequentially (EYE-001 to EYE-300)
  - Prints 300 token slips (batch print)
  - Sends 300 SMS (if mobile provided)
  - All patients appear in doctor's queue

Time: 5 minutes (vs 2.5 hours manual)
```

**API:** `POST /api/bulk-register` — accepts CSV upload, creates bookings in bulk.

### Scenario 9: Doctor's Offline / Slow Internet Mode

**Real situation:** Tier-2/3 city hospital. Internet slow hai ya band hai. Doctor patient nahi dekh sakta.

**Solution — Offline-First PWA:**
```
- Doctor's dashboard is a PWA (already have ServiceWorker)
- Patient list cached locally on device
- Doctor can see patient details offline (from cache)
- Doctor writes prescription offline → saved locally
- When internet returns → auto-syncs to server
- Patient gets SMS when sync completes
```

**This is important for rural hospitals** — where 4G is unreliable.

### Scenario 10: Triage / Emergency Override

**Real situation:** Patient comes with chest pain. Can't wait in queue for 2 hours. Doctor needs to see immediately.

**Solution — Triage Tag:**
```
Receptionist has "EMERGENCY" button (red, prominent):
  → Click → select patient → select "Emergency"
  → Patient's token gets priority flag
  → Doctor sees RED alert on dashboard: "EMERGENCY: Patient X, chest pain"
  → Doctor can interrupt current consultation to see emergency
  
Triage levels:
  🔴 RED (Emergency) — seen immediately, interrupts queue
  🟡 YELLOW (Urgent) — next in queue (skips ahead)
  🟢 GREEN (Normal) — regular queue position
```

**Schema addition:**
```prisma
// Add to Booking model:
triageLevel  String  @default("Green")  // Red, Yellow, Green
triageNotes  String  @default("")
```

**Queue sort with triage:**
```sql
ORDER BY 
  CASE triageLevel 
    WHEN 'Red' THEN 0 
    WHEN 'Yellow' THEN 1 
    WHEN 'Green' THEN 2 
  END,
  tokenOrder ASC
```

### Scenario 11: Prescription Template Library (Quick Rx)

**Real situation:** 80% of OPD cases are the same — viral fever, hypertension follow-up, diabetes follow-up, UTI, GERD. Doctor likhta wahi hai baar baar.

**Solution — Doctor's Template Library:**
```
Doctor creates templates (one-time, 15 min setup):
  "Viral Fever" → Paracetamol 650 BD × 3 days + Rest + Fluids + CBC if fever > 5 days
  "HTN Follow-up" → Continue Amlodipine 5mg OD + BP check monthly + Salt restriction
  "UTI" → Tab Nitrofurantoin 100mg BD × 5 days + Urine R/M + Hydration
  "Acute Bronchitis" → Tab Azithromycin 500mg OD × 3 days + Cough syrup + Steam

During consultation:
  Doctor sees chief complaint: "Fever, body pain"
  → System suggests: "Similar to Viral Fever template"
  → Doctor clicks [Apply Template]
  → All medicines + advice auto-filled
  → Doctor reviews, adjusts dose if needed, [Save]
  → Time: 30 seconds (vs 3 minutes manual)
```

**This is the "butter smooth" doctor experience** — 1 click = full prescription.

### Scenario 12: Patient's Family Access (Already Exists — Optimize)

**Real situation:** Patient is in ICU. Family wants updates. They keep asking nurse every 30 min.

**Solution — Family Portal (already have FamilyAccess model):**
```
- Receptionist generates access code: "FAM-AB123"
- Gives to family: "Scan this QR or visit /family/FAM-AB123"
- Family sees:
  - Patient: Rahul Verma, Bed B1, ICU
  - Current vitals: BP 120/80, SpO2 98%, Temp 98.4°F
  - Attending doctor: Dr. Sharma
  - Last update: "Vitals recorded 10 min ago"
  - Diet: Soft diet
  - Estimated discharge: 3 days
- No login needed. Access code = 7 days validity.
```

### Scenario 13: WhatsApp Integration (Critical for India)

**Real situation:** 90% Indian patients use WhatsApp. SMS is secondary. WhatsApp pe report bhejna = patient khush.

**Solution — WhatsApp notifications:**
```
Events to send via WhatsApp:
1. Token assigned → WhatsApp message with token card image
2. Lab report ready → WhatsApp PDF of lab report
3. Discharge summary → WhatsApp PDF
4. Prescription ready → WhatsApp image of prescription
5. Follow-up reminder → "Dr. Sharma expects you tomorrow 10 AM"

Implementation: Gupshup API (already have code in notify-channels.ts)
Template approval needed (3-5 days per template)
```

### Scenario 14: Dashboard for Hospital Owner (Analytics)

**Real situation:** Hospital owner wants to know — "Aaj kitne patient aaye? Kitna revenue hua? Kaunsa doctor slow hai? Konsa department overloaded?"

**Solution — Owner's Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│  HOSPITAL OWNER DASHBOARD                               │
│                                                         │
│  Today's Overview:                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 247      │ │ ₹84,500  │ │ 12 min   │ │ 94%      │   │
│  │ Patients │ │ Revenue  │ │ Avg Wait │ │ Satisf.  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│  Department-wise load:                                  │
│  Cardiology    ████████████████ 85 patients             │
│  Orthopedics   ██████████ 52 patients                   │
│  General Med   ██████████████████████ 110 patients      │
│                                                         │
│  Doctor performance:                                    │
│  Dr. Sharma    42 patients  Avg 8 min/patient  ⭐ 4.8   │
│  Dr. Desai     38 patients  Avg 12 min/patient ⭐ 4.6   │
│  Dr. Iyer      35 patients  Avg 6 min/patient  ⭐ 4.9   │
│                                                         │
│  Peak hours:                                            │
│  9 AM ████████████████  10 AM ██████████████            │
│  11 AM ████████          12 PM ████                     │
│                                                         │
│  Alerts:                                                │
│  ⚠️ OPD-3 has 45 min wait (overloaded)                 │
│  ⚠️ Dr. Sharma's queue: 18 patients (add doctor?)      │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 BUTTER SMOOTH FLOW (Final Architecture)

```
                    ┌──────────────────────────┐
                    │   PATIENT ARRIVES        │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
        QR Kiosk           Reception              Online
        (self-service)      (express lane)        (pre-booked)
              │                  │                  │
              └────────┬─────────┘                  │
                       │                            │
              ┌────────▼─────────┐                  │
              │  BOOKING CREATED  │                  │
              │  (Express Mode)   │                  │
              │  - Name + Mobile  │                  │
              │  - Dept (1 click) │                  │
              │  - Doctor (auto)  │                  │
              │  - NO time slot   │                  │
              │  - Status: Approve│                  │
              │  - Token: GEN-009 │                  │
              └────────┬─────────┘                  │
                       │                            │
              ┌────────▼─────────┐                  │
              │  TOKEN SLIP       │                  │
              │  PRINTED          │                  │
              │  (2 seconds)      │                  │
              │  - Token: GEN-009 │                  │
              │  - Dr. Sharma     │                  │
              │  - Position: #5   │                  │
              │  - QR for live    │                  │
              │    position       │                  │
              └────────┬─────────┘                  │
                       │                            │
              ┌────────▼─────────┐                  │
              │  SMS + WhatsApp   │                  │
              │  sent to patient  │                  │
              └────────┬─────────┘                  │
                       │                            │
              ┌────────▼─────────┐                  │
              │  PATIENT IN       │                  │
              │  WAITING AREA     │                  │
              │  - Sees #5 on TV  │                  │
              │  - Phone: #5→#4   │                  │
              │  - QR scan: live  │                  │
              └────────┬─────────┘                  │
                       │ Position drops to #1        │
              ┌────────▼─────────┐                  │
              │  DOCTOR CLICKS    │                  │
              │  "CALL NEXT"      │                  │
              │  - Token GEN-009  │                  │
              │  flashes on TV    │                  │
              │  - SMS: "Come in" │                  │
              └────────┬─────────┘                  │
                       │                            │
              ┌────────▼─────────┐                  │
              │  CONSULTATION     │                  │
              │  - Patient enters │                  │
              │  - Doctor sees    │                  │
              │    full history   │                  │
              │  - Chooses mode:  │                  │
              │    a. Full Digital│                  │
              │    b. Quick Template│                │
              │    c. Paper + Photo│                 │
              │  - [MARK COMPLETE]│                  │
              │    (1 key = done) │                  │
              └────────┬─────────┘                  │
                       │                            │
              ┌────────▼─────────┐                  │
              │  PHARMACY         │                  │
              │  - Gets Rx (auto) │                  │
              │  - Dispenses      │                  │
              │  - WhatsApp: Rx   │                  │
              │    photo to pt    │                  │
              └────────┬─────────┘                  │
                       │                            │
              ┌────────▼─────────┐                  │
              │  EXIT             │                  │
              │  - Feedback SMS   │                  │
              │  - Follow-up      │                  │
              │    reminder       │                  │
              │  - Journey logged │                  │
              └──────────────────┘                  │
```

---

## 🎯 BUILD PRIORITY (Demo-Ready in 12 Days)

### Phase A: Foundation Fixes (Day 1-2) — MUST DO FIRST
| # | Task | Time |
|---|------|------|
| 1 | Wire "Call Next Patient" button | 1 hr |
| 2 | Fix token race condition (unique constraint) | 2 hr |
| 3 | Add DB indexes (3 compound indexes) | 1 hr |
| 4 | Standardize sort order (tokenOrder ASC everywhere) | 2 hr |
| 5 | Patient position display (#11 + progress bar) | 3 hr |
| 6 | Fix notification bugs (tokenOrder gt, not exact +1) | 1 hr |

### Phase B: Express Mode (Day 3-4) — HEAVY TRAFFIC SOLUTION
| # | Task | Time |
|---|------|------|
| 7 | `POST /api/express-walkin` (minimal fields, auto-doctor) | 4 hr |
| 8 | Express lane UI (mobile lookup → auto-fill → 1 click) | 4 hr |
| 9 | Token slip print (thermal printer HTML + CSS) | 3 hr |
| 10 | Reprint token (search by mobile → reprint) | 1 hr |

### Phase C: Doctor Experience (Day 5-7) — ONE KEY COMPLETE
| # | Task | Time |
|---|------|------|
| 11 | Doctor "Next Patient" auto-call screen | 4 hr |
| 12 | Patient history auto-load (last visit, meds, allergies) | 3 hr |
| 13 | "Mark Complete" one-key button (Paper mode) | 2 hr |
| 14 | Paper prescription photo upload | 2 hr |
| 15 | Prescription Template library (create + apply) | 1 day |
| 16 | Quick templates seed (Viral Fever, HTN, DM, UTI, GERD) | 2 hr |

### Phase D: QR Kiosk (Day 8-10) — SELF-SERVICE
| # | Task | Time |
|---|------|------|
| 17 | Kiosk landing page (`/kiosk/[hospitalId]`) | 2 hr |
| 18 | 5-step wizard (details → dept → doctor → slot/anytime → confirm) | 1 day |
| 19 | `POST /api/public/hospital/[hospitalId]/kiosk-book` | 4 hr |
| 20 | Kiosk status polling page (waiting → approved → token) | 3 hr |
| 21 | QR code generation page (hospital admin prints QR poster) | 2 hr |

### Phase E: Notifications + Polish (Day 11-12)
| # | Task | Time |
|---|------|------|
| 22 | Wire SMS (token assigned, position #3, turn approaching) | 4 hr |
| 23 | Triage levels (Red/Yellow/Green) + queue priority | 3 hr |
| 24 | Patient flow tracking (PatientFlowEvent) | 3 hr |
| 25 | Return patient auto-detection (mobile lookup) | 2 hr |

### Post-Demo (Nice to Have)
| # | Task | Time |
|---|------|------|
| 26 | Slot locking (zero-conflict for appointment lane) | 1 day |
| 27 | Bulk registration (camp day) | 1 day |
| 28 | Hospital owner analytics dashboard | 2 days |
| 29 | Offline PWA mode | 3 days |
| 30 | WhatsApp integration (Gupshup templates) | 2 days |

---

## 📊 DEMO SCRIPT (5 Minutes to Win AIIMS/CIMS)

```
Minute 1: "Heavy traffic scenario"
→ Show Express Lane: type "Rahul" + mobile → 1 click dept → PRINT TOKEN
→ "This took 5 seconds. 10 receptionists → 2 receptionists."

Minute 2: "Patient receives token"
→ Show printed token slip (thermal printer)
→ Show SMS on patient's phone: "Token GEN-009, Position #5"
→ Show patient scanning QR → live position on phone

Minute 3: "Doctor experience"
→ Doctor dashboard: clicks "Call Next" → patient card appears
→ Full history auto-loaded (last visit, meds, allergies)
→ Doctor clicks "Quick Template: Viral Fever" → prescription auto-filled
→ Doctor clicks "Mark Complete" → done in 30 seconds
→ "Doctor didn't type anything. One key."

Minute 4: "QR Kiosk self-service"
→ Show kiosk tablet: scan QR → fill details → choose dept → confirm
→ Receptionist sees request → approves → patient gets token SMS
→ "Zero lines. Patient self-registers."

Minute 5: "Scale proof"
→ "10 receptionists booking simultaneously — zero conflicts"
→ Show owner dashboard: 247 patients, ₹84,500 revenue, 12 min avg wait
→ "This is how AIIMS with 10 counters works. Zero double-booking. 
   Butter smooth."
```

---

## 🔑 KEY INSIGHT (Hospital Owner's Perspective)

```
OLD SYSTEM:                     NEW SYSTEM (Butter Smooth):
                                
Patient → Line → Reception      Patient → QR/Kiosk → Token → Wait → Doctor
(10 receptionists)              (2 receptionists + kiosk)
                                
Doctor → Navigate → Type Rx    Doctor → See history → 1 click → Done
(5 min per patient)            (30 sec per patient)
                                
Patient → Blind waiting        Patient → Live position → SMS updates
(anxious)                      (calm, informed)
                                
Owner → No visibility          Owner → Real-time dashboard
(guessing)                     (data-driven)
```

**The "butter smooth" promise:**
- Receptionist: 5 seconds per patient (vs 30 sec)
- Doctor: 30 seconds per prescription (vs 5 min)
- Patient: always knows their position (vs blind waiting)
- Owner: real-time visibility (vs end-of-day reports)

**10 receptionists → 2 receptionists. 500 patients in 90 minutes. Zero conflicts.**

---

## NEXT STEP

Plan is comprehensive. **Start with Phase A (Day 1-2 foundation fixes)?** These are the bugs that MUST be fixed before anything else — dead "Call Next" button, token race condition, inconsistent sort order. Then Phase B (Express Mode + Token Print) for the "heavy traffic" demo. Then Phase C (Doctor one-key complete). Then Phase D (QR Kiosk).

12 days to demo-ready. Shall I begin?
