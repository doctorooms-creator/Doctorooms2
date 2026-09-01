# Doctor Module — Comprehensive Enhancement Plan
# From current state (18 pages, all working) → production-grade doctor portal

---

## 📋 CURRENT STATE

### What's built and working (18 pages)
- Dashboard ✅ — Stats + today's appointments
- Appointments ✅ — Patient queue + status management
- Prescriptions ✅ — 8-step wizard (Complaints → Vitals → Tables → Medicines → Advice → Finish → Order Tests → Reports)
- Rx Templates ✅ — Pre-saved templates
- Earnings ✅ — Financial dashboard
- Schedule ✅ — Weekly schedule management (fixed today)
- Patients ✅ — Patient list + detail view
- Medicine Master ✅ — Custom medicine list
- Lab Results ✅ — In-house lab results
- Lab Partners ✅ — External lab partner management (NEW)
- My Commission ✅ — Commission dashboard (NEW)
- OT Surgeries ✅ — Surgery scheduling (NEW)
- Rx Settings (8 sub-pages) ✅ — Categories, Complaints, Questions, Suggestions, Labels, Findings, Table Templates, Print Settings
- Profile ✅ — Doctor profile
- Gallery ✅ — Photos
- Posts ✅ — Blog posts
- IPD Patients ✅ — Admitted patient management

### What's broken / missing
1. **Patient History Timeline** — When a patient walks in, the doctor needs their ENTIRE medical history on ONE page: past visits, vitals, prescriptions, lab reports, diagnoses, allergies. Currently scattered across 5+ pages.
2. **No analytics** — No charts, no trends, no insights about the practice.
3. **Follow-up loop broken** — Doctor writes `nextVisit` date in prescription but there's no way to convert that into a booking or reminder.
4. **Rx Templates not usable** — Templates exist but can't be applied during a consultation in one click.
5. **Patient search is basic** — Can't search by disease, age, last visit, etc.

---

## 🗺️ BUILD PLAN (5 phases)

### Phase D1 — Patient History Timeline (Day 1-2, ~6 hrs)
**Priority: HIGHEST** — Used every single patient visit. The #1 missing feature.

**What:** A single page that shows a patient's complete medical journey in a visual timeline.

**Page:** `/dashboard/doctor/patients/[patientId]/history`

**Sections (top to bottom):**
1. **Patient Header Card** — Name, age, gender, blood group, mobile, photo, total visits, last visit date
2. **Quick Stats Row** (4 cards) — Total Visits, Total Prescriptions, Total Lab Reports, Abnormal Reports Count
3. **Allergies + Medications Card** — Known allergies (from PLabel "Allergy"), current medications (latest prescription's PMedicine list)
4. **Vital Trends Card** — Line chart showing BP, Temp, Pulse, SpO2 trends across visits (uses PLabel data from prescriptions)
5. **Timeline (main section)** — Reverse-chronological list of all medical events:
   - Each visit: date, complaint, diagnosis, medicines prescribed, vitals recorded, lab reports uploaded
   - Each lab report: test name, lab, date, abnormal flag, link to view/download
   - Each prescription: clickable to open full prescription detail
   - Each IPD admission (if any): admission date, ward, bed, discharge date
   - Each OT surgery (if any): surgery name, date, status
6. **Filter Bar** — Filter by type (Visits / Lab Reports / Prescriptions / IPD / OT) + date range
7. **Export Button** — "Export History PDF" → opens `/print/patient-history/[patientId]`

**API:** `GET /api/dashboard/doctor/patients/[patientId]/history`
- Returns: patient info + all bookings (with prescriptions) + all lab reports (external + in-house) + all IPD admissions + all OT schedules + vital trends (parsed from PLabel)
- Authorization: doctor must have had a booking with this patient OR has an active DoctorLabAssociation + the patient has an ExternalTestOrder from this doctor

**Print route:** `/print/patient-history/[patientId]`
- A4 patient history document with all events listed chronologically

---

### Phase D2 — Doctor Analytics Dashboard (Day 2-3, ~5 hrs)
**Priority: HIGH** — Helps doctors understand their practice + make data-driven decisions.

**What:** Replace the current basic dashboard with a rich analytics dashboard.

**Page:** Modify `/dashboard/doctor` (existing dashboard page)

**Sections:**
1. **Today's Overview** (existing — keep) — Today's appointments count, pending patients, completed visits
2. **Revenue Chart** — Bar chart: daily revenue for last 30 days (from OPdBill + prescription fees)
3. **Patient Demographics** — Pie chart: gender distribution + age groups (0-18, 19-40, 41-60, 60+) of all patients
4. **Top 5 Diagnoses** — Horizontal bar chart: most common diseases (from Booking.disease + Prescription.disease)
5. **Top 5 Medicines** — Horizontal bar chart: most prescribed medicines (from PMedicine)
6. **Monthly Trends** — Line chart: patients per month for last 12 months
7. **Lab Commission Summary** — Total commission earned, pending vs paid (links to commission page)
8. **Quick Actions** — 4 buttons: New Prescription, View Patients, Lab Partners, Schedule

**API:** `GET /api/dashboard/doctor/analytics`
- Returns: revenue data (30 days), demographics, top diagnoses, top medicines, monthly trends, commission summary
- Uses Promise.all for parallel queries

**Charts:** Use `recharts` library (already installed? if not, `bun add recharts`)
- Bar charts for revenue + top diagnoses/medicines
- Pie chart for demographics
- Line chart for monthly trends

---

### Phase D3 — Follow-up Scheduling (Day 3, ~3 hrs)
**Priority: HIGH** — Closes the patient care loop. Currently the doctor writes `nextVisit` but nothing happens.

**What:** When a doctor finalizes a prescription with a `nextVisit` date, the system:
1. Shows a "Follow-up Due" badge on the patient's card in the appointments list
2. Allows the doctor to book a follow-up appointment in 1 click
3. Sends a reminder notification to the patient (SMS via the existing SMS gateway)

**Changes:**
1. **Prescription wizard Step 6 (Finish)** — When `nextVisit` is set, show a "Book Follow-up" button after finalization. Clicking it calls `POST /api/patient/bookings` with the nextVisit date + same doctor + same patient + `bookingType: 'Follow-up'`.
2. **Appointments list** — Add a "Follow-ups Due" tab showing patients whose `nextVisit` date is today or past due but haven't booked yet.
3. **Patient notification** — When follow-up is booked, emit `appointment-confirmed` notification + SMS to patient.
4. **Dashboard widget** — Show count of follow-ups due today on the dashboard.

**API:** `GET /api/dashboard/doctor/followups`
- Returns: prescriptions with nextVisit <= today+7 days where no subsequent booking exists
- Groups by: overdue (nextVisit < today), due today, upcoming (nextVisit <= today+7)

---

### Phase D4 — Quick Rx from Template (Day 4, ~4 hrs)
**Priority: MEDIUM** — Speeds up consultations for common cases (fever, cold, diabetes follow-up, etc.).

**What:** In the prescription wizard Step 1 (Complaints), add a "Load Template" dropdown. Selecting a template auto-fills: complaints, medicines, labels, suggestions, and table data.

**Changes:**
1. **Step 1 (Complaints)** — Add a "Quick Template" Select at the top. Options: doctor's saved RxTemplates. On select, calls `GET /api/dashboard/doctor/rx-templates/[id]` and populates the wizard's Zustand store with the template data.
2. **Confirmation** — After loading a template, show a toast "Template loaded — review and adjust before finalizing". The doctor reviews each step and clicks Finish.
3. **Template management** — Already exists at `/dashboard/doctor/rx-templates`. Add a "Preview" button to see what the template will populate.

**API:** `GET /api/dashboard/doctor/rx-templates/[id]` (already exists — verify it returns full template data with medicines/labels/suggestions)

---

### Phase D5 — Patient Advanced Search (Day 4-5, ~3 hrs)
**Priority: MEDIUM** — Find patients quickly by disease, age, gender, last visit.

**What:** Enhanced patient list with advanced filters + a patient search bar on the dashboard.

**Changes:**
1. **Patients page** (`/dashboard/doctor/patients`) — Add filter bar:
   - Search by name / mobile (existing)
   - Filter by disease (Select dropdown populated from distinct Booking.disease values)
   - Filter by age range (min/max number inputs)
   - Filter by gender (Select: All / Male / Female)
   - Filter by last visit (date range picker)
   - Sort by: Name / Last Visit / Total Visits
2. **Dashboard search** — Add a search bar on the dashboard that quick-links to the patients page with filters applied.
3. **Pagination** — 20 patients per page with pagination controls (same pattern as patient appointments P4.6).

**API:** Modify `GET /api/dashboard/doctor/patients` to support `?disease=&minAge=&maxAge=&gender=&fromDate=&toDate=&sort=&page=&pageSize=`

---

## 📁 FILE MANIFEST

### New files (8)
| File | Purpose |
|------|---------|
| `src/app/dashboard/doctor/patients/[patientId]/history/page.tsx` | Patient history timeline page |
| `src/app/dashboard/doctor/patients/[patientId]/history/client.tsx` | Interactive timeline UI |
| `src/app/api/dashboard/doctor/patients/[patientId]/history/route.ts` | Patient history API |
| `src/app/print/patient-history/[patientId]/page.tsx` | Printable patient history |
| `src/app/dashboard/doctor/analytics/client.tsx` | Analytics charts UI |
| `src/app/api/dashboard/doctor/analytics/route.ts` | Analytics data API |
| `src/app/api/dashboard/doctor/followups/route.ts` | Follow-up due API |
| `src/app/dashboard/doctor/followups/page.tsx` + `client.tsx` | Follow-up due page |

### Modified files (6)
| File | Change |
|------|--------|
| `src/app/dashboard/doctor/page.tsx` + `client.tsx` | Add analytics charts + follow-up widget |
| `src/app/dashboard/doctor/patients/page.tsx` + `client.tsx` | Add advanced filters + pagination |
| `src/app/api/dashboard/doctor/patients/route.ts` | Add filter params + pagination |
| `src/components/prescription/stepper/step-6-finish.tsx` | Add "Book Follow-up" button when nextVisit is set |
| `src/components/prescription/stepper/step-1-complaints.tsx` | Add "Quick Template" dropdown |
| `src/app/dashboard/doctor/appointments/client.tsx` | Add "Follow-ups Due" tab |

---

## 🎯 BUILD ORDER

1. **D1: Patient History Timeline** (Day 1-2) — Highest impact, used every visit
2. **D2: Doctor Analytics** (Day 2-3) — Visual insights, professional dashboard
3. **D3: Follow-up Scheduling** (Day 3) — Closes the patient care loop
4. **D4: Quick Rx from Template** (Day 4) — Speeds up consultations
5. **D5: Patient Advanced Search** (Day 4-5) — Find patients fast

**Total: ~5 days, ~21 hours**

---

*Status: Ready to execute. Start with Phase D1 — Patient History Timeline.*
