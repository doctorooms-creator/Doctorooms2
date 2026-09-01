# 📋 Doctorooms — Next Steps & Pending Work

> **Purpose:** This file lists everything that needs to be built, fixed, or improved. Items are prioritized: 🔴 = Critical, 🟡 = High, 🟢 = Medium.
>
> **Read this AFTER `DOCTOROOMS-HANDBOOK.md`.**

---

## 🔴 PRIORITY 1: Fix the 6 Prescription Wizard Bugs

The user said: **"ye prescription heart hai hamare system ka"** (this prescription is the heart of our system). These 6 bugs MUST be fixed before anything else.

The wizard is at `src/components/prescription/stepper/`. State is in `src/lib/prescription-store.ts` (Zustand).

### Bug 1: Vitals Not All Saving

**Symptom:** Doctor fills 4 vitals (weight, BP, temp, pulse) but only 2 show in the printed prescription.

**Root cause:** The vitals save API at `src/app/api/prescription/[id]/vitals/route.ts` only saves 3 fields:
```ts
await db.prescription.update({
  where: { id },
  data: {
    weight: vitals?.weight?.toString() || '',
    bp: vitals?.bp?.toString() || '',
    temperature: vitals?.temperature?.toString() || '',
    // ❌ MISSING: pulse, spo2
  },
})
```
The Prescription model has `weight`, `bp`, `temperature` but NOT `pulse`, `spo2`. These are stored as `PLabel` records (the `labels` array).

**Fix:**
1. Check the Prescription model in `prisma/schema.prisma` — does it have `pulse` and `spo2` fields? If not, ADD them:
   ```prisma
   model Prescription {
     // ... existing fields
     pulse        String @default("")  // ADD
     spo2         String @default("")  // ADD
   }
   ```
2. Update the vitals save API to include all 5 fields
3. Update the print API (`src/app/api/prescription/[id]/print/route.ts`) to return all 5 vitals
4. Update the print view (`src/components/prescription/print-view.tsx`) to display all 5 vitals
5. Run `bun run db:push` to update the database schema

**Alternative:** If you don't want to add fields to Prescription, ensure pulse/SpO2 are saved as PLabel records (check if Step 2 component sends them as labels vs vitals).

### Bug 2: Vitals Showing Under "Lab Results" Heading

**Symptom:** In the printed prescription, vitals appear under a heading called "Lab Results" instead of "Vitals".

**Root cause:** In `src/components/prescription/print-view.tsx`, line ~419:
```tsx
<h3 style={sectionTitle}>Lab Results</h3>
```
The `labels` section (which includes vital labels like BP, Temp, Pulse, SpO2) is titled "Lab Results" — but vitals should be under "Vitals".

**Fix:**
1. **Remove the "Lab Results" section entirely** from both print paths:
   - `src/components/prescription/print-view.tsx` (wizard modal)
   - `src/app/print/prescription/[id]/page.tsx` (server-rendered)
2. Merge the labels into the "Vitals" section — display all vital info (weight, BP, temp, pulse, SpO2 + any custom labels) under ONE "Vitals" heading.
3. Custom labels that are NOT vitals (e.g., "Blood Sugar", "Cholesterol") should go under a separate "Investigations" heading — NOT "Lab Results".

**Print view structure should be:**
```
[VITALS]
  Weight: 70 kg | BP: 120/80 mmHg | Temp: 98.6°F | Pulse: 72 bpm | SpO2: 98%
  + any custom vital labels (e.g., "Respiratory Rate: 18/min")

[INVESTIGATIONS]  ← only if there are non-vital labels
  Blood Sugar: 140 mg/dL | Cholesterol: 200 mg/dL

[NO "LAB RESULTS" SECTION — remove it]
```

### Bug 3: Medicines Count Mismatch

**Symptom:** Doctor adds 5 medicines in Step 4, but not all 5 show in the printed prescription.

**Fix:**
1. Check the medicines save API (`src/app/api/prescription/[id]/medicines/route.ts`) — ensure it saves ALL medicines sent from the frontend, not just some.
2. Check the print API (`src/app/api/prescription/[id]/print/route.ts`) — ensure it returns ALL medicines (`medicines: { orderBy: { createdAt: 'asc' } }` — should be there).
3. Check the print view — ensure it renders all medicines (`.map()` over the full array).
4. Check if the frontend (Step 4) is sending all medicines or losing some during state sync.

**Test:** Add 5 medicines in Step 4, go to Step 6 (Finish), click Print. Count medicines in the printout. All 5 should be there.

### Bug 4: Diagnosis Table Cell Values Empty

**Symptom:** Doctor fills cells in the diagnosis table (Step 3), but when viewing the saved prescription, all cells are empty (`cellValues: {}`).

**Root cause:** The tables save API (`src/app/api/prescription/[id]/tables/route.ts`) saves the table structure (rows, cols, headerLabel, colsLabel, footerLabel) but does NOT save the cell VALUES that the doctor typed.

**Fix:**
1. Add a `cellValues` field to the `PDignoTable` model in Prisma schema:
   ```prisma
   model PDignoTable {
     // existing fields...
     cellValues   String @default("{}")  // JSON string of {row-col: value}
   }
   ```
2. Update the tables save API to accept and save `cellValues`:
   ```ts
   await db.pDignoTable.createMany({
     data: tables.map((t) => ({
       prescriptionId: id,
       templateId: t.templateId || null,
       rows: ...,
       cols: ...,
       cellValues: JSON.stringify(t.cellValues || {}),  // ADD THIS
       // ...
     })),
   })
   ```
3. Update the print API to return `cellValues` (parsed from JSON).
4. Update the print view to render cell values in the table cells.
5. Update Step 3 component to send cell values to the API.
6. Run `bun run db:push`.

### Bug 5: Next Visit Date Not Saving

**Symptom:** Doctor sets a next visit date in Step 6 (Finish), but it doesn't save.

**Root cause:** The finalize API (`src/app/api/prescription/[id]/finalize/route.ts`) has the code:
```ts
const { nextVisit } = body
// ...
await db.prescription.update({
  where: { id },
  data: {
    // ...
    nextVisit: nextVisit ? new Date(nextVisit) : null,
  },
})
```
This LOOKS correct. The issue might be:
- The frontend (Step 6) is not sending `nextVisit` in the request body
- OR the date format is wrong (e.g., `dd MMM yyyy` string instead of ISO date)
- OR the field is being overwritten by another update

**Fix:**
1. Check Step 6 component (`src/components/prescription/stepper/step-6-finish.tsx`) — ensure it sends `nextVisit` as an ISO date string (e.g., `2026-09-15T00:00:00.000Z`) in the finalize POST body.
2. Check the Zustand store — ensure `nextVisit` is stored and passed to the finalize API.
3. Add console.log in the finalize API to verify what `nextVisit` value is received.
4. Verify the print API returns `nextVisit` (it does: `format(new Date(prescription.nextVisit), 'dd MMM yyyy')`).

### Bug 6: Suggestions Missing + C/O→Suggestions Mapping (THE BIG ONE)

**This is the most complex bug and needs a redesign of Step 5.**

**Current behavior:**
- Step 5 shows a generic list of questions/suggestions, NOT linked to the complaints selected in Step 1.
- Suggestions may not be saving at all.

**Desired behavior (what the user wants):**
```
Step 5: Suggestions / Advice

  ┌── C/O: Fever ──────────────────────────────────┐
  │ ☑ Take adequate rest and hydrate well           │
  │   → Drink 3+ litres water, bed rest 2-3 days   │
  │ ☑ Take PCM for fever                           │
  │   → 500mg SOS if temp > 100°F                  │
  │ ☐ Avoid cold drinks                            │
  │   → [not selected]                             │
  │ + Add custom suggestion for this complaint     │
  └────────────────────────────────────────────────┘

  ┌── C/O: Headache ────────────────────────────────┐
  │ ☑ Avoid screen time                            │
  │   → Take breaks every 20 minutes               │
  │ ☑ Take rest in dark room                        │
  │   → 30 min rest in quiet dark room              │
  │ + Add custom suggestion                        │
  └────────────────────────────────────────────────┘
```

**Flow:**
1. Step 5 reads `selectedComplaintIds` from Zustand store (set in Step 1).
2. For each complaint, fetch linked questions from `QuestionsMaster` (where `coId = complaint.coId`).
3. For each question, fetch linked suggestions from `SuggestionsMaster` (where `questionId = question.id`).
4. Display as accordion/cards — one per complaint.
5. Doctor can:
   - Toggle suggestions on/off (checkbox) — only selected ones go in the prescription.
   - Add a custom suggestion (free text) for any complaint.
6. On save: only the SELECTED suggestions + custom suggestions are saved to `PSuggestion`.

**Schema check:**
- `QuestionsMaster` has `coId` (link to CoMaster) ✅
- `SuggestionsMaster` has `questionId` (link to QuestionsMaster) ✅
- `PSuggestion` stores: `question`, `questionEn`, `suggestions`, `suggestionsEn` ✅

**Fix steps:**
1. **Redesign `src/components/prescription/stepper/step-5-suggestions.tsx`:**
   - Read `selectedComplaintIds` from store
   - Fetch questions per complaint (`/api/dashboard/doctor/prescription-settings/questions?coId={ids}`)
   - Fetch suggestions per question (`/api/dashboard/doctor/prescription-settings/suggestions`)
   - Group by complaint → display as cards/accordion
   - Each suggestion has a checkbox (selected/not)
   - "Add custom suggestion" button per complaint
   - On "Next" → call suggestions save API with `{ suggestionIds, customSuggestions }`

2. **Verify the suggestions save API** (`src/app/api/prescription/[id]/suggestions/route.ts`):
   - Accept `suggestionIds` (array of selected master suggestion IDs)
   - Accept `customSuggestions` (array of `{ question, questionEn, suggestions, suggestionsEn, coId }`)
   - Delete existing PSuggestion records for this prescription
   - Create new PSuggestion records for each selected suggestion + custom

3. **Update the print view** to show suggestions grouped by complaint:
   ```
   Advice / Suggestions:
   • For Fever:
     - Take adequate rest and hydrate well — Drink 3+ litres water
     - Take PCM for fever — 500mg SOS if temp > 100°F
   • For Headache:
     - Avoid screen time — Take breaks every 20 minutes
   ```

4. **Update the print API** to return suggestions grouped by complaint (need to link PSuggestion → coId, which may require adding a `coId` field to PSuggestion).

---

## 🟡 PRIORITY 2: Queue System Redesign

**Current state:** Basic token-based queue with `SentForTests` status. Works but needs enhancement.

**What's built:**
- `src/app/api/dashboard/doctor/queue/route.ts` — doctor's OPD queue (today's patients, sorted by tokenOrder)
- `SentForTests` status on Booking — patient leaves normal queue when sent for lab tests
- Receptionist re-queue API (`/api/dashboard/receptionist/bookings/[id]/requeue`)
- Hospital queue display page (`/dashboard/hospital/queue-display`)

**What's needed:**

### 2.1 Drag-and-Drop Queue Reordering
- Doctor/receptionist can drag patients up/down in the queue to change order
- Uses `@dnd-kit/sortable` (already installed)
- Updates `tokenOrder` field on Booking
- Real-time update to all viewers (WebSocket)

**Files to create/modify:**
- `src/app/dashboard/doctor/components/queue-list.tsx` — add drag-and-drop
- `src/app/api/dashboard/doctor/queue/reorder/route.ts` — new API to update tokenOrder

### 2.2 Priority Token System
- Emergency patients get priority tokens (e.g., "E1", "E2")
- Senior citizens get priority
- Display priority patients at top of queue

### 2.3 Real-Time Queue Display Board
- Large display page for hospital waiting area
- Shows: current serving token, next 3 tokens, average wait time
- Auto-refreshes every 5 seconds (or WebSocket push)
- Already exists at `/dashboard/hospital/queue-display` — needs polish

### 2.4 Multi-Doctor Queue Management
- Hospital view: see ALL doctors' queues side by side
- Transfer patient from one doctor to another
- Only hospital admin can do this

---

## 🟡 PRIORITY 3: IPD System Flow (complete the daily routine)

**Current state:** Models exist (IpdAdmission, Ward, Bed, VitalRecord, DoctorOrder, etc.) and some pages exist, but the DAILY FLOW is incomplete.

**What's built:**
- Doctor IPD list page (`/dashboard/doctor/ipd`)
- Doctor IPD patient detail page (`/dashboard/doctor/ipd/patients/[admissionId]`)
- Nurse patient detail page (`/dashboard/nurse/patients/[admissionId]`)
- Receptionist IPD page + billing
- Admin IPD billing

**What's needed (the daily routine):**

### 3.1 Admission Flow
1. Receptionist creates IpdAdmission (patient, ward, bed, admitting doctor, advance)
2. Bed status → "Occupied"
3. Assign nurse to patient (NursePatientAssignment)
4. Print admission slip

### 3.2 Daily Vitals (Nurse)
- Nurse opens patient → "Record Vitals" button
- Form: temperature, BP, pulse, SpO2, weight, respiratory rate
- Saves to VitalRecord with nurseId + recordedAt
- Auto-generated vitals chart (line chart showing trend)
- Morning (6 AM), Afternoon (2 PM), Evening (10 PM) — 3 times daily

### 3.3 Doctor Round (Morning)
- Doctor opens patient → "Add Visit Note" button
- Form: visit notes, general condition, treatment plan
- Saves to DoctorVisit
- Doctor can see all vitals + lab reports + previous visit notes

### 3.4 Doctor Orders (from round)
- Doctor can create orders: Diet, Medicine, Lab, Test, Other
- Each order has: orderType, orderText, status (Pending/Completed), priority
- Nurse sees pending orders → executes them
- For Diet: nurse fills breakfast/lunch/dinner (DietOrder)
- For Medicine: nurse administers → MedicineAdministration record
- For Lab: lab tech sees → collects sample → uploads report
- Order status changes: Pending → In Progress → Completed

### 3.5 Lab Integration for IPD
- IPD lab orders create ExternalTestOrder (same as OPD)
- Reports come back → linked to IpdAdmission
- Doctor sees reports in patient detail page

### 3.6 Shift Handover
- Outgoing nurse creates handover note
- Selects incoming nurse
- Writes: patient status, pending tasks, warnings
- Incoming nurse acknowledges

### 3.7 Discharge Flow
1. Doctor marks patient "Fit for Discharge"
2. Generate discharge summary:
   - Admission reason
   - Diagnosis
   - Treatment given (medicines, procedures)
   - Condition at discharge
   - Advice on discharge
   - Follow-up date
3. Generate IPD bill:
   - Room charges (per day × days, based on ward type)
   - Procedure charges
   - Lab charges
   - Medicine charges
   - Doctor fees (visit count × fee)
   - Nursing charges
   - + GST/taxes
4. Patient pays → bed freed → discharge

**Files to create:**
- `src/app/api/dashboard/nurse/vitals/route.ts` — record vitals
- `src/app/api/dashboard/doctor/ipd/[admissionId]/visit/route.ts` — add visit note
- `src/app/api/dashboard/doctor/ipd/[admissionId]/orders/route.ts` — create orders
- `src/app/api/dashboard/nurse/orders/[orderId]/execute/route.ts` — execute order
- `src/app/api/dashboard/nurse/handover/route.ts` — shift handover
- `src/app/api/dashboard/doctor/ipd/[admissionId]/discharge/route.ts` — discharge
- `src/app/print/discharge-summary/[admissionId]/page.tsx` — discharge summary print (may exist)

---

## 🟢 PRIORITY 4: Testing & QA

### 4.1 Playwright E2E Tests
- Config exists at `tests/e2e/` (7 patient journey tests + 6 security tests)
- Need more tests:
  - Full OPD flow (login → book → consult → prescribe → print)
  - Full IPD flow (admit → vitals → rounds → discharge)
  - Lab flow (order → accept → upload → view)
  - Pharmacy flow (prescription → pack → bill)
  - All 9 role logins

### 4.2 k6 Load Tests
- Script exists at `tests/load/`
- Need tests for: login, dashboard, prescription save, lab order

### 4.3 Manual Test Checklist
- [ ] Login as each of the 9 roles
- [ ] Doctor: create prescription with all 6 steps → verify print
- [ ] Doctor: order lab tests → verify SentForTests status
- [ ] Lab tech: accept order → upload report → verify notification
- [ ] Receptionist: re-queue SentForTests patient → verify back in queue
- [ ] Nurse: record IPD vitals → verify in patient chart
- [ ] Doctor: IPD round → add visit note → create orders
- [ ] Patient: view own prescriptions + lab reports
- [ ] Admin: view all billing + audit logs

---

## 🟢 PRIORITY 5: Production Deployment

### 5.1 PostgreSQL Migration
- Migration script exists: `src/scripts/migrate-to-postgres.ts`
- Schema switch: `prisma/schema.prisma` provider sqlite → postgresql
- Steps in `DEPLOYMENT.md`

### 5.2 Redis for Sessions
- Redis wrapper exists: `src/lib/redis.ts`
- Rate limiting already Redis-ready
- Sessions still use DB (fast enough for now) — wire Redis when scaling

### 5.3 Environment Variables (production)
- See `.env.example` for all required vars
- NEVER commit `.env` (gitignored)
- In production: `NODE_ENV=production`, `DEV_MODE` empty, real `NEXTAUTH_SECRET`, real `DATABASE_URL` (Postgres)

### 5.4 Monitoring
- Sentry stub exists (`src/lib/sentry.ts`) — add `SENTRY_DSN` to activate
- Error boundary exists (`src/app/dashboard/error.tsx`)

---

## 📊 Summary Table

| Priority | Item | Effort | Status |
|----------|------|--------|--------|
| 🔴 1 | Bug 1: Vitals not all saving | Small (schema + API) | Not started |
| 🔴 1 | Bug 2: "Lab Results" heading | Small (print view edit) | Not started |
| 🔴 1 | Bug 3: Medicines count mismatch | Small (verify API) | Not started |
| 🔴 1 | Bug 4: Table cell values empty | Medium (schema + API + UI) | Not started |
| 🔴 1 | Bug 5: Next visit date | Small (verify frontend) | Not started |
| 🔴 1 | Bug 6: Suggestions redesign | Large (full Step 5 redesign) | Not started |
| 🟡 2 | Queue drag-and-drop | Medium | Not started |
| 🟡 2 | Queue priority tokens | Small | Not started |
| 🟡 2 | Queue display board | Small (polish existing) | Not started |
| 🟡 3 | IPD admission flow | Medium | Partial (models exist) |
| 🟡 3 | IPD daily vitals | Medium | Partial (page exists, no API) |
| 🟡 3 | IPD doctor rounds | Medium | Partial (page exists, no API) |
| 🟡 3 | IPD doctor orders | Medium | Not started |
| 🟡 3 | IPD shift handover | Small | Not started |
| 🟡 3 | IPD discharge + bill | Large | Partial (billing exists) |
| 🟢 4 | Playwright tests | Medium | Partial (13 exist) |
| 🟢 4 | k6 load tests | Small | Partial (1 exists) |
| 🟢 4 | Manual test checklist | Small | Not started |
| 🟢 5 | PostgreSQL migration | Medium | Ready (script exists) |
| 🟢 5 | Redis for sessions | Small | Ready (wrapper exists) |
| 🟢 5 | Production env setup | Small | Ready (.env.example) |
| 🟢 5 | Sentry monitoring | Small | Ready (stub exists) |

---

## 🎯 Recommended Order of Work

1. **Week 1:** Fix all 6 prescription bugs (Priority 1) — this unblocks the core workflow
2. **Week 2:** Queue system enhancements (Priority 2) — improves OPD efficiency
3. **Week 3-4:** IPD system flow (Priority 3) — completes the hospital automation
4. **Week 5:** Testing & QA (Priority 4) — ensure everything works end-to-end
5. **Week 6:** Production deployment (Priority 5) — go live

---

*End of NEXT-STEPS. Read GLM-PROMPT.md for the prompt to give the next AI.*
