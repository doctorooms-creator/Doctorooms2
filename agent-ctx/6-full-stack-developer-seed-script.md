# Agent Work Record — Task 6

- **Task ID:** 6
- **Agent:** full-stack-developer (seed-script)
- **Task:** Write comprehensive `src/scripts/seed-test-data.ts` for Doctorooms HMS

## Files Read (Pre-Work)
- `prisma/schema.prisma` (1721 lines, 72 models) — full schema understood
- `src/lib/api-auth.ts` — DEV_USERS (11 hardcoded dev users)
- `scripts/seed-demo-users.ts`, `scripts/seed-dermatology.ts` — pattern reference
- `src/lib/date-utils.ts` — IST helpers
- `worklog.md` — prior work context

## File Written
- `/home/z/my-project/src/scripts/seed-test-data.ts` (≈860 lines)

## Work Log
1. Read all 72 Prisma models to map every FK and required field.
2. Designed FK-safe deletion order (40+ tables, children-first).
3. Wrote the seed script in one comprehensive `main()` function with try/catch + `db.$disconnect()`.
4. Ran the script — first run succeeded with no errors.
5. Re-ran the script to verify idempotency (clear-all-then-create pattern) — succeeded.
6. Wrote a temporary verification script that counted every seeded table and verified all 11 dev users exist with `status: 'Active'`.
7. Removed the verification script (was a one-off check, not a deliverable).
8. Ran `bun run lint` — 0 errors.

## Stage Summary
The seed script `src/scripts/seed-test-data.ts` runs successfully via `bun run src/scripts/seed-test-data.ts`. It clears all existing data first (deleteMany in correct FK order), then creates the following test data:

### CLINIC SIDE (Sharma Clinic — owner `dev-doctor`)
- **11 Users** (all `status: Active`, bcrypt-hashed password `dev123`):
  `dev-admin`, `dev-doctor`, `dev-doctor-anita`, `dev-doctor-suresh`, `dev-receptionist`, `dev-assistant`, `dev-pharmacist`, `dev-hospital`, `dev-nurse`, `dev-lab-tech`, `dev-patient`.
- **2 Hospitals**: Sharma Clinic (Bengaluru, Clinic), City General Hospital (Bengaluru, Multi-Specialty, NABH, 150 beds).
- **3 Doctors**: Dr. Rajesh Sharma (General Physician, fees ₹500), Dr. Anita Desai (General Medicine, fees ₹700), Dr. Suresh Iyer (Cardiologist, fees ₹1200).
- **3 Departments** at City General: General Medicine (GEN), Orthopedics (ORT), Cardiology (CAR).
- **2 DoctorHospital links**: Dr. Anita → General Medicine, Dr. Suresh → Cardiology.
- **1 Receptionist** (Meera Joshi → Sharma Clinic + Dr. Sharma), **1 DoctorAssistant** (Vikram Patel → Dr. Sharma), **1 DoctorPharmacist** (Kavitha Devi → Dr. Sharma, DL No. KA-B-21-987654).
- **1 StaffNurse** (Priya Sharma, BSc Nursing, Morning shift, General Ward), **1 LabTechnician** (Amit Kumar, BSc MLT, Clinical Pathology).
- **3 Wards + 15 Beds**: General Ward (B1–B8, ₹800/day), Private Room (P1–P4, ₹2500/day), ICU (I1–I3, ₹5000/day).
- **6 DoctorSchedule** rows (Mon–Sat, 09:00–13:00, 30-min slots × 8 per day).
- **16 DoctorMedicine** rows (Paracetamol, Amoxicillin, Omeprazole, Metformin, Amlodipine, Azithromycin, Cetirizine, Ibuprofen, Pantoprazole, Ciprofloxacin, Ranitidine, Ofloxacin, Diclofenac, Levocetirizine, Roxithromycin, Aspirin) with dose arrays + timing.
- **8 CategoryMaster** (Fever, Pain, Infection, Respiratory, GI, Diabetes, Hypertension, Skin).
- **8 FindingsMaster** (Viral Fever, UTI, Acute Bronchitis, GERD, Type 2 Diabetes, Hypertension, Migraine, Asthma) + **14 FindingsMedicine** links.
- **8 CoMaster** (Headache, Fever, Cough, Abdominal Pain, Chest Pain, Body Pain, Sore Throat, Dizziness) linked to categories.
- **17 QuestionsMaster** + **19 SuggestionsMaster** (2–3 questions per complaint).
- **9 LabelMaster** (Weight, BP, Temperature, Pulse, SpO2, Respiratory Rate, RBS, Blood Sugar, HbA1c) with units.
- **3 TableTemplateMaster** (Systemic Examination, Cardiovascular Exam, Respiratory Exam).
- **1 POtherSetting** (prescription print config for Dr. Sharma).
- **5 LabTestMaster** (CBC, Lipid Profile, LFT, KFT, Urine Routine) + **21 LabTestParameter** with male/female/child normal ranges + units.
- **4 ChargeCategory** + **13 ChargeItem** (Room Rent × 3, Consultation × 3, Lab × 5, Procedure × 2).
- **12 InventoryItem** (IV fluids, antibiotics, surgical items, consumables with expiry dates).
- **1 OperationTheater** (OT 1 — Main, Major).
- **1 SystemSettings** singleton (City General Hospital configured).

### TEST DATA (Rahul Verma, dev-patient)
- **2 Bookings** (both `status: Approve`, today):
  - Clinic booking `CLINIC-0001` with Dr. Sharma at 10:00.
  - Hospital OPD booking `GEN-0001` with Dr. Anita at City General / General Medicine dept at 11:30.
- **1 Prescription** for the clinic booking (Viral Fever):
  - **3 PMedicine** (Paracetamol, Ibuprofen, Cetirizine) with proper timing & days.
  - **3 PLabel** (BP 120/80, Temperature 101.2°F, Pulse 88).
  - **2 PSuggestion** (rest/hydration, diet advice).
- **1 IpdAdmission** `IPD-2025-0001` (Rahul Verma, B1 of General Ward, Dr. Anita attending, diagnosis Acute Gastroenteritis). Bed B1 marked as **Occupied**.
- **4 VitalRecord** at 10:00, 12:00, 14:00, 16:00 today (Temp, Pulse, SpO2, BP, RR, RBS, I/O).
- **3 DoctorOrder** (Normal Saline IV STAT, Ondansetron IV BD, Pantoprazole IV OD).
- **1 SampleCollection** (CBC, Blood, collected 10:15, sent to lab 10:30, status SentToLab).
- **1 InvestigationReport** (CBC results with abnormal flag, reviewed by Dr. Anita at 13:00).
- **1 DoctorVisit** (11:00 — examination findings, diagnosis, new orders, advice).

## Verification
- Seed ran successfully on first execution (`bun run src/scripts/seed-test-data.ts`) — no errors.
- Re-ran to verify idempotency — succeeded (clear-all + recreate pattern works).
- All 11 dev user IDs exist with `status: 'Active'` (matches `DEV_USERS` in `api-auth.ts`).
- Bed B1 of General Ward correctly marked `Occupied`.
- Both bookings have `status: 'Approve'` and `bookingDate = today`.
- `bun run lint` — CLEAN (0 errors).

## How to Use
```bash
bun run src/scripts/seed-test-data.ts
```
All dev logins use password `dev123`. Login works through `/api/dev-login` and `getAuthUser` (which falls back to DB lookup by role cookie in dev mode).
