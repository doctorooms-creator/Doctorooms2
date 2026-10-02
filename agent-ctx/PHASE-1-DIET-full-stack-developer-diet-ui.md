# PHASE-1-DIET — full-stack-developer (diet-ui)

## Task
Build Diet Module UI pages for the Doctorooms Hospital Management System.

## Scope Completed
1. **Sidebar update** (`src/lib/sidebar-config.ts`)
   - Added `Utensils` icon import.
   - Nurse array: inserted `Diet Orders` (`/dashboard/nurse/diet-orders`) after "Ward View", before "Shift Handover".
   - Patient array: inserted `Diet Plan` (`/dashboard/patient/diet`) after "Health Records", before "Rx Access".

2. **Shared component** (`src/components/diet/diet-dialogs.tsx` — NEW)
   - `DietOrderDialog` (new order form → `POST /api/diet-orders`) with optional `fixedAdmissionId` to lock the patient.
   - `StopDietDialog` (stop with reason → `PUT /api/diet-orders/[id]/stop`).
   - Exports `DIET_TYPES`, `MEAL_TYPES`, `DietOrder`, `PatientOption`.

3. **New API** (`src/app/api/patient/admissions/route.ts` — NEW)
   - `GET` returns the patient's IPD admissions (ward/bed/department/hospital/doctor joins) so the patient Diet page can resolve the active admission.

4. **Nurse Diet Orders page** (`src/app/dashboard/nurse/diet-orders/{page,client}.tsx` — NEW)
   - Fetches ward patients, parallel-fetches active diet orders per patient via `useQueries`.
   - Desktop table + mobile cards, stats row, new/stop dialogs, loading/error/empty states.

5. **Patient Diet page** (`src/app/dashboard/patient/diet/{page,client}.tsx` — NEW)
   - Resolves active admission, renders read-only current diet plan card + history table.

6. **Nurse patient detail — Diet tab** (`src/app/dashboard/nurse/patients/[admissionId]/client.tsx` — MODIFIED)
   - TabsList grid changed 5 → 6 columns; new "Diet" tab between Medicines and Investigations.
   - New `DietTab` sub-component (active order card, new/stop dialogs, history table).

## Verification
- `bun run lint` — 0 errors, 0 warnings.
- Dev server compiles cleanly (no errors in `dev.log`).

## Files Touched
- NEW: `src/components/diet/diet-dialogs.tsx`
- NEW: `src/app/api/patient/admissions/route.ts`
- NEW: `src/app/dashboard/nurse/diet-orders/page.tsx`
- NEW: `src/app/dashboard/nurse/diet-orders/client.tsx`
- NEW: `src/app/dashboard/patient/diet/page.tsx`
- NEW: `src/app/dashboard/patient/diet/client.tsx`
- MODIFIED: `src/lib/sidebar-config.ts`
- MODIFIED: `src/app/dashboard/nurse/patients/[admissionId]/client.tsx`

## Notes for Downstream Agents
- Query keys used: `['diet-orders', 'active'|'all', admissionId]`, `['nurse-diet-orders']`, `['patient-diet', admissionId]`, `['patient-admissions']`, `['nurse-ward-patients']`. All invalidated on create/stop.
- The patient Diet page depends on `IpdAdmission.userId` being set on the admission record — admissions created as walk-in (null userId) won't show up for patients.
- Color palette enforced: teal/emerald/amber/violet/slate/red/sky only (no indigo/blue).
