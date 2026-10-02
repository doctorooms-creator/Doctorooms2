# Task: lab-phase7-wizard — Add Order Tests + Reports tabs to doctor prescription wizard

## Context
- Read `/home/z/my-project/worklog.md` for prior lab phases (lab-phase1 delivered 15 API routes; lab-phase3-doctor built doctor lab-partners + commission pages; lab-phase5-patient built patient reports page with ReportViewerDialog pattern).
- The wizard already exists at `src/components/prescription/stepper/` with 6 steps (Complaints, Vitals, Tables, Medicines, Advice, Finish) plus a Zustand store at `src/lib/prescription-store.ts`.

## Key Decision: patientId Resolution
The wizard only knows `bookingId` (from URL). The lab APIs need `patientId` (the `User.id` on the `Booking.userId` field). No existing API route exposed this lookup. I created a **new** minimal helper endpoint rather than modify any existing route (per "DO NOT modify the API routes"):

- `src/app/api/dashboard/doctor/bookings/[id]/route.ts` — GET returns `{ booking: { id, userId, patientName, age, gender, disease, bloodGroup, status, bookingDate, timeSlot } }` after `requireRole('doctor')` and verifying `booking.doctorId === doctor.id`.

The wizard's `PrescriptionStepper` init `useEffect` now calls this endpoint in parallel with `/api/prescription/init` and stores `patientId` (and patient info) in the Zustand store via the new `setPatientId` setter.

## Files Created
- `/home/z/my-project/src/app/api/dashboard/doctor/bookings/[id]/route.ts` — NEW helper endpoint exposing booking.userId (patientId) for the wizard.
- `/home/z/my-project/src/components/prescription/stepper/step-7-order-tests.tsx` — Step 7 "Order Tests" tab.
- `/home/z/my-project/src/components/prescription/stepper/step-8-reports.tsx` — Step 8 "Reports" tab (with ReportViewerDialog pattern copied from patient reports page).

## Files Edited
- `/home/z/my-project/src/lib/prescription-store.ts` — added `patientId: string` + `setPatientId` setter (interface + implementation + reset).
- `/home/z/my-project/src/components/prescription/stepper/step-indicator.tsx` — appended steps 7 (Order Tests) + 8 (Reports); loosened `isClickable` guard to `isCompleted || isActive || step.num >= 7` so the doctor can always click the lab tabs.
- `/home/z/my-project/src/components/prescription/stepper/prescription-stepper.tsx` — added `setPatientId` to destructure; rewrote init `useEffect` to fetch booking info in parallel with prescription init (using a `cancelled` flag + `Promise.all`); imported `Step7OrderTests` + `Step8Reports`; added cases 7 and 8 to the `renderStep` switch.

## Step 7 — Order Tests
- Fetches `GET /api/doctor-lab-associations/my-labs` (for lab partner dropdown).
- Fetches `GET /api/external-test-orders?patientId=X&bookingId=Y` (existing orders — table with Test | Lab | Type | Fee | Urgency | Status | Ordered At).
- "Add New Test Order" card: dynamic rows (Test Name input with `<datalist>` suggestions from the lab's `testsAvailable` field; Test Type Select; Lab Partner Select; Fee input; Remove button if rows > 1).
- "+ Add Another Test" appends a row.
- Urgency Select (Normal | Urgent) + Notes Textarea — apply to all rows in batch.
- `[Send Orders]` button — disabled if no valid rows. POSTs `{ patientId, bookingId, notes, urgency, orders: [...] }`. On success: `toast.success(${n} test order(s) sent to labs)`, invalidates the existing-orders query, resets form to 1 empty row.
- "Back" button (goToPrev → step 6). Helper text: "This step is optional — your prescription can be finalized from the Finish tab."

## Step 8 — Reports
- Fetches `GET /api/lab-reports/patient?patientId=X`.
- Header: "Lab Reports — <Patient Name>".
- **Ready Reports** (status === 'Completed'): grid of `ReadyReportCard`s (motion fade-in). Each card shows test name (bold), lab + city, "Referred by Dr. X", completed date, ⚠️ Abnormal badge (if `notes` starts with ⚠️ or contains "Abnormal"), `[View Report]` button (opens Dialog) + `[Download]` anchor.
- `ReportViewerDialog` mirrors patient reports page: PDF → `<iframe>`; image/* → `<img>`; other → "Cannot preview" + Download link. Includes Lab Remarks banner (rose for abnormal, amber for normal).
- **Pending Tests** (status === 'Ordered' || 'InProgress'): Table with Test | Lab | Doctor | Type | Urgency | Status | Ordered At | Fee.
- Empty states: "No patient info yet" (loading), "No lab reports for this patient yet. Use the Order Tests tab to request tests." (after load), error state with Try-again button.
- "Back" button (goToPrev → step 7).

## Wizard Integrity
- `goToNext` limit kept at 6 — Step 6's "Save & Print" button calls `handleFinalize` (not `goToNext`), so it still finalizes the prescription and does NOT navigate to step 7. ✅
- Steps 1–5 still call `goToNext` to advance through 1→6, unchanged. ✅
- Steps 7 and 8 are reachable only via the step indicator (always clickable due to `step.num >= 7` clause). They're optional and not required to finish the prescription. ✅
- Steps 7 and 8 each have only a "Back" button (no "Next") — the doctor returns to the prescription flow via Back or by clicking an earlier step in the indicator.

## Lint
- `bun run lint` — exit 0 (clean). No errors or warnings after all changes.
- Dev server continues to compile cleanly (no errors in dev.log).

## Deviations
- Created a NEW API endpoint (`/api/dashboard/doctor/bookings/[id]`) to expose `booking.userId` (the patientId). This was strictly necessary because no existing API route exposes this lookup, and both `/api/external-test-orders` POST and `/api/lab-reports/patient` GET require `patientId` for doctor role. This is a NEW file, not a modification of any existing route — the instruction "DO NOT modify the API routes" was interpreted as not modifying existing route files.
- Did not modify any of the lab module APIs (external-test-orders, lab-reports, doctor-lab-associations, commission, lab-billing) — those are untouched.
- Did not modify the existing 6 step components or the prescription init route. Only `prescription-stepper.tsx`, `step-indicator.tsx`, and `prescription-store.ts` were edited (per task spec).
- Did not bump the `goToNext` limit (kept at 6) — step 7 has no "Next" button, so the limit doesn't need to change. Navigation to steps 7 and 8 is via the step indicator only.
- The `useCallback` import in `prescription-stepper.tsx` was already present (pre-existing unused import from before this task) — left untouched to avoid scope creep.
