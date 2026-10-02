# Doctorooms — Comprehensive Testing Plan
# One-by-one portal-wise end-to-end testing

---

## 📋 TESTING STRATEGY

### Approach
For each role (patient first, then doctor, lab tech, admin, hospital, receptionist, nurse, pharmacist, assistant), we will:
1. **Login** as that role via the dev-mode role picker.
2. **Visit each sidebar page** and verify:
   - Page renders without errors (no console errors, no blank screen).
   - Stats/data are populated (not "0" or empty when there's seeded data).
   - Filters, search, tabs work.
3. **Test critical interactions** — buttons, forms, dialogs, mutations.
4. **Verify cross-cutting concerns**:
   - Real-time notifications fire when actions happen in another session.
   - Print buttons open A4 print routes correctly.
   - Audit log entries are persisted when the role takes actions.
   - Sidebar badges update live when socket events arrive.
5. **Capture bugs** in a checklist, fix them, re-verify.

### Tooling
- **Agent Browser** (`agent-browser` CLI) — automated page navigation + snapshot + click/fill.
- Two parallel sessions (`--session patient` and `--session doctor`) for real-time push tests.
- Direct `curl` for API verification when UI testing is awkward.
- Direct DB queries via `bun -e` for audit log verification.

### Test data state (already seeded)
- 3 lab partners (City Diagnostics, Apex Radiology, Sun Diagnostic).
- 10+ external test orders across 4 statuses.
- 5+ lab report uploads (some abnormal).
- 5+ lab billings (paid + pending).
- 4 OT surgeries (Scheduled/InProgress/Completed).
- 4 diet orders (Active/Stopped).
- 1 IPD admission (Rahul Verma, B1 / General Ward, Dr. Anita Desai).
- 1 prescription for Rahul Verma (Viral Fever — 3 meds, 3 labels, 2 suggestions).
- 2 bookings for Rahul Verma (clinic + hospital OPD).
- 12 wards + beds, 12 inventory items, 5 lab test masters.
- Multiple audit log entries from previous tests.

### Pre-flight checklist (before each portal test)
- [ ] Dev server running on port 3000 — `curl -o /dev/null -w "%{http_code}" http://localhost:3000/` returns 200.
- [ ] Notification-service running on port 3005 — `curl http://localhost:3005/stats` returns valid JSON.
- [ ] `DEV_MODE=1` in `.env` (re-add if missing — happens after restarts).
- [ ] `bun run lint` clean.

---

## 🧪 PHASE T1 — PATIENT PORTAL (start here)

**Login as**: Rahul Verma (dev-patient) — button "Rahul Verma Clinic + Hospital visits" on /login.
**Expected redirect**: `/dashboard/patient`.

### T1.1 — Dashboard
- [ ] Visit `/dashboard/patient`.
- [ ] Verify 3-4 stat cards render (Upcoming Appointments, Past Visits, Active Prescriptions, Lab Reports count).
- [ ] Verify "Upcoming Appointments" list shows the 2 seeded bookings (CLINIC-0001 + GEN-0001).
- [ ] Verify no console errors.

### T1.2 — Appointments
- [ ] Visit `/dashboard/patient/appointments`.
- [ ] Verify the list shows both bookings.
- [ ] Click the "View" / "Detail" action on a booking → verify the detail page renders with booking info + doctor info + status.
- [ ] Verify "Book New Appointment" CTA is visible.

### T1.3 — Book New Appointment (full booking flow)
- [ ] Visit `/dashboard/patient/book/[doctorId]` (use any doctor id).
- [ ] Verify the doctor profile renders (name, specialization, fees).
- [ ] **NEW**: Verify the "Online" green dot is visible next to the doctor's name (the OnlineDoctorDot component — should be grey/muted if no doctor is logged in, green if a doctor is currently connected).
- [ ] Pick a date + time slot → "Confirm Booking" → verify success toast.
- [ ] Verify the new booking appears in `/dashboard/patient/appointments`.

### T1.4 — Health Records
- [ ] Visit `/dashboard/patient/health-records`.
- [ ] Verify the page renders (medical documents list / upload form).
- [ ] If empty state, verify friendly empty card with CTA.

### T1.5 — Lab Reports (NEW MODULE)
- [ ] Visit `/dashboard/patient/reports`.
- [ ] Verify 3 stat cards (Total / Ready / Pending) render with correct counts.
- [ ] Verify "Reports Ready" section shows 5 cards (CT Scan Head, X-Ray Chest, Thyroid Profile, Vitamin B12, Urine Routine).
- [ ] Verify each card has: Test name (bold), Lab name + city, "Referred by Dr. X" line, Completed date, View Report + Print + Download buttons.
- [ ] Verify one card has the ⚠️ Abnormal badge (the CBC with Hb=8.5 abnormal flag — or whichever was uploaded as abnormal).
- [ ] Click "View Report" on CT Scan Head card → verify Report Viewer Dialog opens with:
  - Header: test name + lab + date + doctor.
  - Inline viewer: PDF iframe OR image OR fallback message.
  - Lab remarks banner.
  - Download + Close buttons.
- [ ] Click "Print" on a card → verify a new browser tab opens `/print/lab-report/[id]` → renders A4-styled content (lab letterhead, patient info, test details, signatures) → auto-fires print dialog.

### T1.6 — Prescription Access (Rx Access)
- [ ] Visit `/dashboard/patient/prescription-access`.
- [ ] Verify the page renders (list of Rx access requests).
- [ ] If there's an existing approved request, verify the prescription details render (medicines, vitals, advice).
- [ ] If empty, verify the "Request Access" CTA → opens a dialog to pick a doctor.

### T1.7 — Blog
- [ ] Visit `/dashboard/patient/blog`.
- [ ] Verify list of blog posts renders.
- [ ] Visit `/dashboard/patient/blog/new` → verify the post-creation form renders (title + body + publish).
- [ ] Visit `/dashboard/patient/blog/[id]/edit` (if any post exists) → verify form prefilled.

### T1.8 — Feedback
- [ ] Visit `/dashboard/patient/feedback`.
- [ ] Verify feedback form renders (rating + comments).
- [ ] Submit a test feedback → verify success toast.

### T1.9 — Notifications (NEW — should have entries from lab + OT modules)
- [ ] Visit `/dashboard/patient/notifications`.
- [ ] Verify the page shows the notifications list — should have entries for:
  - Lab Report Ready (CBC, KFT, etc.) — multiple entries.
  - OT Scheduled (Cataract Surgery) — 1 entry.
- [ ] Verify "Mark All Read" button works.
- [ ] Verify the bell icon in the header shows the unread count badge.

### T1.10 — Profile + Settings
- [ ] Visit `/dashboard/patient/profile`.
- [ ] Verify profile info renders (name, mobile, email, etc.).
- [ ] Edit profile → save → verify success.
- [ ] Visit `/dashboard/patient/settings` → verify settings tabs render.

### T1.11 — Notification Preferences (NEW MODULE)
- [ ] Click the bell icon in the header → dropdown should have a "Preferences" button.
- [ ] Click "Preferences" → verify redirect to `/dashboard/notifications/preferences`.
- [ ] Verify 4 cards render: Sound Settings (with Test Sound button + Master Sound + Critical Chime switches), Muted Events (22 event checkboxes), Email Digest, Browser Push.
- [ ] Toggle "Master Sound" off → Save → verify toast.success.
- [ ] Click "Test Sound" button → verify the chime plays (audio context resumed — check console for chime logs).
- [ ] Mute one event type (e.g. "Queue Updated") → Save → verify success.

### T1.12 — Real-time push test (CRITICAL — patient + another role)
- [ ] Open patient in one browser session via `agent-browser --session patient`.
- [ ] Open lab tech (Amit Kumar) in another session via `agent-browser --session labtech`.
- [ ] Lab tech uploads a new report via curl (POST /api/external-test-orders/[id]/upload-report).
- [ ] Within 2-3 seconds, the patient should see:
  - Toast "Lab Report Ready — [test name] from [lab name]".
  - Chime plays (if not muted + critical + sound enabled).
  - `/dashboard/patient/reports` sidebar badge ticks +1.
  - `/dashboard/patient/notifications` shows the new entry.

### T1.13 — Audit log entries
- [ ] When the patient logs in, an audit log entry is created (action=login, entityType=auth, entityId=dev-patient).
- [ ] Verify via `bun -e` direct DB query that the entry exists.

### T1.14 — Print route verification (patient-accessible)
- [ ] Visit `/print/lab-report/[anyOrderId]` directly while logged in as patient.
- [ ] Verify A4 lab report renders with hospital letterhead + patient info + test details + signatures.
- [ ] Verify auto-print dialog fires (or Print button works).

---

## 🧪 PHASE T2 — DOCTOR PORTAL

**Login as**: Dr. Rajesh Sharma (dev-doctor) — button "Dr. Rajesh Sharma General Physician".
**Expected redirect**: `/dashboard/doctor`.

### T2.1 — Dashboard
- [ ] Visit `/dashboard/doctor`.
- [ ] Verify stat cards (Today's Appointments, Patients, Earnings, etc.).
- [ ] Verify "Today's Queue" shows the 2 bookings for today (CLINIC-0001 at 10:00, GEN-0001 at 11:30).

### T2.2 — Appointments
- [ ] Visit `/dashboard/doctor/appointments`.
- [ ] Verify the list + filters work.
- [ ] Click "Start Consultation" on a booking → verify the prescription wizard opens.

### T2.3 — Prescription Wizard (NEW: 8 steps now — was 6)
- [ ] Open `/dashboard/doctor/prescriptions/new?bookingId=cmsuypgel00b1wuxsryb0skh6`.
- [ ] Verify step indicator shows 8 tabs: 1 Complaints / 2 Vitals / 3 Tables / 4 Medicines / 5 Advice / 6 Finish / **7 Order Tests (NEW)** / **8 Reports (NEW)**.
- [ ] Verify steps 7 + 8 are always-clickable (not gated by completing earlier steps).
- [ ] Click "7 Order Tests":
  - Verify "Order Lab Tests for Rahul Verma" heading.
  - Verify "Existing Test Orders" section shows ALL patient's prior orders (not just this booking's).
  - Verify "Add New Test Order" form has Test Name + Type + Lab Select + Fee + Urgency + Notes + "Send Orders" button.
  - Add a test (e.g. "LFT" → City Diagnostics → ₹400) → click Send Orders → verify toast "1 test order(s) sent to labs".
- [ ] Click "8 Reports":
  - Verify "Lab Reports — Rahul Verma" heading.
  - Verify "Ready Reports" grid shows all completed reports for this patient.
  - Click "View Report" → verify Report Viewer Dialog opens with inline PDF/image viewer.

### T2.4 — Prescriptions list + detail + Print (NEW Print button)
- [ ] Visit `/dashboard/doctor/prescriptions`.
- [ ] Verify list of prescriptions.
- [ ] Click a prescription → verify detail page renders.
- [ ] Verify **"Print Prescription"** button → click → new tab opens `/print/prescription/[id]` → A4 prescription renders with letterhead + medicines + signatures.

### T2.5 — Lab Partners (NEW MODULE)
- [ ] Visit `/dashboard/doctor/lab-partners`.
- [ ] Verify 3 associated labs render (City Diagnostics 10%, Apex Radiology 12%, Sun Diagnostic 8%).
- [ ] Verify stat cards (Total Labs, Total Tests, Total Reports).
- [ ] Click "Add Lab Partner" → verify dialog with 2 tabs (Register New / Link Existing).
- [ ] Test "Edit Commission" dialog → change commission % → Save → verify toast + table updates.

### T2.6 — My Commission (NEW MODULE)
- [ ] Visit `/dashboard/doctor/commission`.
- [ ] Verify 4 stat cards (Total Commission, Pending, Paid, Total Tests).
- [ ] Verify 3 tabs (By Lab / By Month / Recent).
- [ ] Verify "By Lab" table shows per-lab breakdown with totals row.
- [ ] Verify **"Print Statement"** button → opens `/print/commission-statement/[doctorId]?period=YYYY-MM` in new tab.
- [ ] Verify "Request Payout" button → opens AlertDialog → click → verify toast.info (since admin must approve).

### T2.7 — OT Surgeries (NEW MODULE)
- [ ] Login as Dr. Suresh Iyer (dev-doctor-suresh) instead — he's the surgeon on the seeded OT schedules.
- [ ] Visit `/dashboard/doctor/ot-surgeries`.
- [ ] Verify the table shows surgeries where surgeonId = Dr. Suresh's doctor.id.
- [ ] Verify status badges (Scheduled=amber, InProgress=violet, Completed=emerald).
- [ ] Verify per-row actions: Start (if Scheduled) / Complete (if InProgress) / Cancel / **Print (NEW)**.
- [ ] Click "Print" → new tab opens `/print/ot-surgery/[id]` → A4 OT consent/report renders.

### T2.8 — IPD Patients
- [ ] Visit `/dashboard/doctor/ipd`.
- [ ] Verify the IPD admissions list.
- [ ] Click an admission → detail page → verify vitals table, doctor orders, visits, sample collections, etc.

### T2.9 — Other pages (smoke test)
- [ ] Visit each: /earnings, /schedule, /patients, /medicines, /lab-results, /rx-templates, /prescription-settings/*, /profile, /gallery, /posts. Verify each renders without errors.

### T2.10 — Real-time push test (doctor receives)
- [ ] Doctor + lab tech in parallel sessions.
- [ ] Lab tech accepts an order → doctor's browser should toast "Lab Order Accepted".
- [ ] Lab tech uploads report → doctor's browser should toast "Lab Report Ready" + chime plays (critical event).
- [ ] Admin pays commission → doctor's browser should toast "Commission Paid" + chime.

---

## 🧪 PHASE T3 — LAB TECHNICIAN PORTAL (Lab Partner)

**Login as**: Amit Kumar (dev-lab-tech = City Diagnostics) — button "Amit Kumar Pathology lab".
**Expected redirect**: `/dashboard/lab-technician`.

### T3.1 — Dashboard
- [ ] Visit `/dashboard/lab-technician`.
- [ ] Verify stat cards (Today's Orders, Completed Tests, Pending Reports, Revenue).

### T3.2 — Incoming Orders (NEW MODULE)
- [ ] Visit `/dashboard/lab-technician/incoming-orders`.
- [ ] Verify 4-5 orders render (mix of Ordered + InProgress + Completed for City Diagnostics).
- [ ] Verify tabs: All / New / In Progress / Completed / Cancelled with counts.
- [ ] Verify per-row actions: Accept (Ordered), Reject (Ordered), Upload Report (InProgress), View (Completed).
- [ ] Verify **sidebar badge** shows live count of Ordered orders (ticks when new order arrives).
- [ ] Click "Accept" on an Ordered row → verify status changes to InProgress + "Upload Report" button appears.
- [ ] Click "Reject" → verify AlertDialog with reason textarea → submit → verify status changes to Cancelled.

### T3.3 — Order Detail + Upload Report (NEW MODULE)
- [ ] Click "Upload Report" on an InProgress order → verify detail page.
- [ ] Verify patient info card, order info card, test fee + commission card.
- [ ] Verify Upload Report form: File input (PDF/JPG/etc.) + Remarks + Abnormal checkbox + reportData JSON textarea + Submit.
- [ ] Submit with a real test file → verify:
  - Toast "Report uploaded. Lab billing auto-generated."
  - LabBilling row auto-created with commissionAmount.
  - Status changes to Completed.
  - Real-time emit fires to doctor + patient.
  - Patient receives SMS (verified via dev log `[SMS/log]` entry).
  - Audit log entry persisted (action=create, entityType=lab_report_upload).
- [ ] Verify **"Print Report"** button is enabled only when status=Completed.

### T3.4 — Test Catalog (NEW MODULE)
- [ ] Visit `/dashboard/lab-technician/test-catalog`.
- [ ] Verify the page renders with stat cards + filter bar + table.
- [ ] Verify any previously-added tests appear.
- [ ] Click "Add Test" → fill form (Test Name + Category + Fee + Sample Type + Turnaround + Active switch) → Save → verify row appears in table.
- [ ] Test Edit / Deactivate / Delete row actions.

### T3.5 — Billing
- [ ] Visit `/dashboard/lab-technician/billing`.
- [ ] Verify 5 stat cards (Total Bills, Total Revenue, Lab Revenue, Commission Paid, Commission Pending).
- [ ] Verify filters (status + period).
- [ ] Verify billing table with all columns.
- [ ] Click "Export CSV" → verify file downloads.

### T3.6 — Worklist + Result Entry + Reports (existing — smoke test)
- [ ] Visit `/dashboard/lab-technician/worklist`, `/result-entry`, `/reports`, `/profile`. Verify each renders.

### T3.7 — Real-time push test (lab tech receives)
- [ ] Doctor + lab tech in parallel sessions.
- [ ] Doctor orders a new test via wizard → lab tech's "Incoming Orders" sidebar badge ticks +1 within 2s.
- [ ] Lab tech's browser toasts "New Lab Test Order — Dr. X ordered [test] for [patient]".
- [ ] Lab tech's dashboard stats refresh.

### T3.8 — Audit log entries
- [ ] When the lab tech uploads a report → audit log entry persisted with severity=critical if isAbnormal=true, info otherwise.
- [ ] Verify via direct DB query.

---

## 🧪 PHASE T4 — ADMIN PORTAL

**Login as**: Admin User (dev-admin) — button "Admin User Full platform control".

### T4.1 — Dashboard + Users + Doctors + Hospitals (existing — smoke test)
- [ ] Visit each main admin page: /dashboard/admin, /users, /doctors, /hospitals, /appointments, /wards, /nurses, /charge-categories, /billing/*, /reports/revenue, /blog, /inquiries, /settings. Verify each renders.

### T4.2 — Lab Partners (NEW MODULE)
- [ ] Visit `/dashboard/admin/lab-partners`.
- [ ] Verify 3 lab partners render in the table (Sun Diagnostic, Apex Radiology, City Diagnostics).
- [ ] Verify stat cards (Total Labs, Active, Total Tests Done, Total Reports).
- [ ] Verify search + status filter work.
- [ ] Click a lab partner → detail page → verify editable form + Associated Doctors list + Stats card.

### T4.3 — Commission Report (NEW MODULE)
- [ ] Visit `/dashboard/admin/commission-report`.
- [ ] Verify the doctor × lab matrix renders.
- [ ] Verify Per Lab + Per Doctor breakdown tables.
- [ ] Verify "Pay Now" buttons on pending payouts → click → AlertDialog with transactionRef input → submit → verify status changes to Paid.
- [ ] Verify **"Print Invoice"** buttons per lab row → click → opens `/print/lab-invoice/[labPartnerId]?period=YYYY-MM`.

### T4.4 — Lab Billing (NEW MODULE)
- [ ] Visit `/dashboard/admin/lab-billing`.
- [ ] Verify 6 stat cards render.
- [ ] Verify filters (status + period + labPartnerId).
- [ ] Verify billing table with all columns.
- [ ] Click "Export CSV" → verify file downloads.

### T4.5 — Audit Logs (NEW MODULE)
- [ ] Visit `/dashboard/admin/audit-logs`.
- [ ] Verify 4 stat cards (Total Logs 7d, Critical 7d, Warnings 7d, Active Users 24h).
- [ ] Verify sticky filter bar (search + Action + Entity Type + Severity + date range + Clear Filters).
- [ ] Verify paginated table renders all entries (login, logout, OT schedule create, etc.).
- [ ] Verify row click → detail Dialog with all fields + parsed JSON.
- [ ] Verify pagination works (Prev / Next / page-size selector).
- [ ] Verify severity badges (info=zinc, warning=amber, critical=rose).

### T4.6 — Audit log wiring verification
- [ ] Login → audit entry persisted (action=login, severity=info).
- [ ] Trigger various admin actions → verify each creates an audit entry (admin can see them in the Audit Logs page).

---

## 🧪 PHASE T5 — HOSPITAL PORTAL

**Login as**: City General Hospital (dev-hospital).

### T5.1 — Dashboard + Doctors + Departments + Appointments (existing — smoke test)

### T5.2 — Operation Theater (NEW MODULE — partially existing)
- [ ] Visit `/dashboard/hospital/ot`.
- [ ] Verify "OT Board" tab shows OTs with status (Available/In-Use/Maintenance).
- [ ] Verify "All Schedules" tab shows all OT schedules.
- [ ] Verify the InProgress OT (Cholecystectomy today 11:00) shows the OT as In-Use.
- [ ] Verify Add OT button works.
- [ ] Verify per-schedule actions (Start / Complete / Cancel) work.

### T5.3 — Diet Orders (NEW MODULE)
- [ ] Visit `/dashboard/hospital/diet-orders`.
- [ ] Verify 4 seeded diet orders render (Soft Diet, Diabetic Diet, NPO Stopped, High-Protein).
- [ ] Verify stat cards (Active, Stopped Today, NPO Alerts, Today's New).
- [ ] Click "Add Diet Order" → verify dialog with admission select + diet type + meal type + instructions + dates.
- [ ] Add a new diet order → verify toast + table updates.
- [ ] Click "Stop" on an Active order → AlertDialog with reason textarea → submit → verify status changes.
- [ ] Click "Print" on a row → opens `/print/diet-orders/[admissionId]` → A4 Diet Chart renders.

### T5.4 — Bed Transfer (existing — verify works)
- [ ] Visit `/dashboard/hospital/bed-transfer`.
- [ ] Verify the transfer form renders (admission select + target bed select + reason).
- [ ] If a transfer can be done without breaking things, attempt one — verify the bed status changes.

### T5.5 — IPD Admissions + Billing + Inventory + Lab + Reports
- [ ] Smoke test each existing hospital page.

---

## 🧪 PHASE T6 — RECEPTIONIST PORTAL

**Login as**: Meera Joshi (dev-receptionist).

### T6.1 — Dashboard + Appointments + Walk-in + Queue + Pending Bookings (existing — smoke test)

### T6.2 — IPD Admissions (verify admit flow works)
- [ ] Visit `/dashboard/receptionist/ipd`.
- [ ] Verify list of admissions.
- [ ] Click "Admit Patient" → verify the admit form renders with all fields (name, age, gender, bed select, doctor select, etc.).

### T6.3 — Diet Orders (NEW — shared page with hospital)
- [ ] Visit `/dashboard/receptionist/diet-orders`.
- [ ] Verify the same UI as hospital renders (receptionist can view + add diet orders for their hospital).

### T6.4 — Billing + Charge Master + Reports
- [ ] Smoke test each existing receptionist page.

### T6.5 — Print route verification (receptionist-accessible)
- [ ] Visit `/print/opd-bill/[id]` (any OPD bill) → verify A4 bill renders.
- [ ] Visit `/print/ipd-bill/[id]` (any IPD admission) → verify A4 IPD bill renders.

---

## 🧪 PHASE T7 — NURSE PORTAL

**Login as**: Priya Sharma (dev-nurse).

### T7.1 — Dashboard + My Patients + Ward View + Shift Handover (existing — smoke test)

### T7.2 — Diet Orders (NEW — shared page)
- [ ] Visit `/dashboard/nurse/diet-orders`.
- [ ] Verify the same UI as hospital renders (nurse can view diet orders for the ward).

### T7.3 — Vitals entry (existing — verify)
- [ ] Visit `/dashboard/nurse/patients/[admissionId]` (Rahul Verma).
- [ ] Verify the vitals entry form renders.
- [ ] Add a new vital record → verify it appears in the table + emits `vital-recorded` to doctor.

---

## 🧪 PHASE T8 — PHARMACIST + ASSISTANT (small portals — smoke test)

### T8.1 — Pharmacist
- [ ] Login as Kavitha Devi (dev-pharmacist).
- [ ] Visit /dashboard/pharmacist, /prescriptions, /medicines. Verify each renders.

### T8.2 — Assistant
- [ ] Login as Vikram Patel (dev-assistant).
- [ ] Visit /dashboard/assistant, /appointments, /patients, /prescription-queue. Verify each renders.

---

## 🧪 PHASE T9 — CROSS-CUTTING TESTS

### T9.1 — Real-time push (lab module loop)
- [ ] Open patient + doctor + lab tech in 3 parallel sessions.
- [ ] Doctor orders test → lab tech's sidebar badge ticks +1 + toast.
- [ ] Lab tech accepts → doctor's wizard "Existing Orders" list auto-refreshes + toast.
- [ ] Lab tech uploads report → doctor + patient both toast + chime + sidebar badges tick.
- [ ] Admin pays commission → doctor toast + chime + SMS to doctor's phone (via log provider).

### T9.2 — Print routes (all 9 templates)
- [ ] Visit each print route via direct URL with authed cookie:
  - `/print/prescription/[id]`
  - `/print/lab-report/[id]`
  - `/print/opd-bill/[id]`
  - `/print/ipd-bill/[admissionId]`
  - `/print/discharge-summary/[admissionId]`
  - `/print/vitals/[admissionId]`
  - `/print/commission-statement/[doctorId]?period=YYYY-MM`
  - `/print/lab-invoice/[labPartnerId]?period=YYYY-MM`
  - `/print/ot-surgery/[scheduleId]`
  - `/print/diet-orders/[admissionId]`
- [ ] Verify each returns 200 + renders A4 content with letterhead + appropriate title + signatures.

### T9.3 — SMS gateway (dev mode = log provider)
- [ ] Trigger an `external-report-uploaded` event with `isAbnormal=true` → verify dev log shows `[SMS/log]` line with patient's phone + message including ⚠️.
- [ ] Trigger a `commission-paid` event → verify dev log shows doctor's phone + payout message.
- [ ] Toggle SMS_PROVIDER env var (if credentials available) — verify provider switch.

### T9.4 — Audit log integrity
- [ ] Trigger each of these actions + verify audit entries are persisted:
  - Login (auth/login, info)
  - Logout (auth/logout, info)
  - Create lab test order (external_test_order/create, info)
  - Accept lab order (external_test_order/status_change, info)
  - Reject lab order (external_test_order/status_change, warning)
  - Upload lab report (lab_report_upload/create, info or critical if abnormal)
  - Pay commission (commission_payment/create, critical)
  - Schedule OT (ot_schedule/create, critical)
  - Start OT (ot_schedule/status_change, info)
  - Complete OT (ot_schedule/status_change, info)
  - Cancel OT (ot_schedule/status_change, warning)
  - Create diet order (diet_order/create, info)
  - Stop diet order (diet_order/status_change, info)
- [ ] Admin's Audit Logs page shows all these entries with proper severity badges.

### T9.5 — Notification preferences + chime
- [ ] Patient mutes "external-report-uploaded" → lab uploads report → patient sees no toast (but query still invalidates).
- [ ] Patient unmutes → next report → toast shows again.
- [ ] Patient toggles Master Sound off → no chime plays on critical events.
- [ ] Patient toggles Critical Chime Only on → chime plays on critical events only.

### T9.6 — Auth + security
- [ ] Logout → verify httpOnly cookies cleared → redirect to /login.
- [ ] Visit a protected dashboard route without auth → verify redirect to /login.
- [ ] Visit a print route without auth → verify "Unauthorized" message.
- [ ] Cross-role access (patient tries /dashboard/admin) → verify Forbidden or redirect.

### T9.7 — Edge cases
- [ ] Empty states — visit pages with no data → verify friendly empty cards.
- [ ] Loading states — verify Skeletons during fetch.
- [ ] Error states — simulate API failure (kill mini-service) → verify graceful error messages.
- [ ] Mobile viewport — set viewport 375×812 → verify responsive layout.
- [ ] Dark mode toggle → verify all pages render correctly.

---

## 📋 BUG TRIAGE TEMPLATE

For each bug found, capture:
```
- Phase: T1.5
- Page: /dashboard/patient/reports
- Steps to reproduce: ...
- Expected: ...
- Actual: ...
- Severity: Blocker / Major / Minor / Cosmetic
- Console errors: ...
- Screenshot: (if relevant)
- Fix priority: P0 / P1 / P2
```

---

## 🎯 EXECUTION PLAN

I'll execute the phases in order:
1. **T1 (Patient)** — start here, most user-facing.
2. **T2 (Doctor)** — second-most user-facing, complex wizard.
3. **T3 (Lab Tech)** — newly-built module, verify thoroughly.
4. **T4 (Admin)** — audit logs + commission + lab partners.
5. **T5 (Hospital)** — OT + Diet Orders.
6. **T6 (Receptionist)** — smoke test + IPD admit.
7. **T7 (Nurse)** — smoke test + vitals.
8. **T8 (Pharmacist + Assistant)** — quick smoke.
9. **T9 (Cross-cutting)** — real-time, print, SMS, audit, prefs.

After each phase, I'll:
- Run `bun run lint` to catch any regressions.
- Append a "Phase TX results" entry to worklog.md.
- Fix bugs immediately (don't defer).
- Move to next phase only when current is clean.

**Estimated time**: 4-6 hours total across all phases.
**Output**: A clean testing checklist with all bugs found + fixed.

---

*Status: Ready to execute. Start with Phase T1 — Patient Portal.*
