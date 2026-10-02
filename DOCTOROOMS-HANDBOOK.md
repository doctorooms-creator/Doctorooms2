# 🏥 Doctorooms HMS — Complete Project Handbook

> **Purpose:** This document is the single source of truth for the Doctorooms Healthcare Management System. It explains what the project is, what's already built, how the architecture works, and how every module fits together. Read this FIRST before touching any code.
>
> **Audience:** The next AI developer (GLM 5.3) who will continue building this system.

---

## 1. What Is Doctorooms?

**Doctorooms** is a comprehensive Healthcare Management System (HMS) that automates a **real hospital's daily operations** — both OPD (Outpatient Department) and IPD (Inpatient Department). It is NOT a simple appointment booking app. It is a full hospital ERP.

Think of it as: **one doctor runs a clinic + is linked to a hospital + has an IPD ward + a lab + a pharmacy — all managed from one system.**

### Real-Life Scenario This Automates

A doctor (Dr. Rajesh Sharma) runs "Sharma Clinic" (his private OPD) AND is also linked to "City General Hospital" where he does IPD rounds. His daily flow:

1. **Morning OPD** at his clinic — patients book appointments, get tokens, wait in queue, consult, get prescriptions
2. **Afternoon IPD rounds** at City General Hospital — visits admitted patients, reviews vitals, orders tests/diet/medicines
3. **Lab tests** ordered during OPD — patient goes to lab, reports come back real-time, patient is re-queued
4. **Pharmacy** — prescription goes to pharmacist, who packs medicines, patient pays
5. **Receptionist** manages front desk — registration, booking, token, billing, re-queue when lab reports arrive

---

## 2. Tech Stack (NON-NEGOTIABLE)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 16 (App Router) | Required by sandbox |
| **Language** | TypeScript 5 | Required |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York style) | Component library |
| **Database** | Prisma ORM + SQLite (dev) / PostgreSQL (prod) | SQLite for sandbox, Postgres ready |
| **Real-time** | Socket.IO (mini-service on port 3005) | Lab notifications, queue updates |
| **State** | Zustand (client) + TanStack Query (server) | Standard stack |
| **Auth** | JWT + DB sessions (custom, NOT NextAuth) | Revocable sessions |
| **Icons** | lucide-react | Standard |
| **Animation** | framer-motion | Page transitions, hover effects |
| **Fonts** | Geist Sans + Geist Mono (next/font/google) | |

### Key Libraries (already installed)
- `@tanstack/react-query` — server state
- `zustand` — client state
- `framer-motion` — animations
- `date-fns` — date formatting
- `sonner` — toast notifications
- `next-themes` — dark/light mode
- `jsonwebtoken` — JWT
- `ioredis` — Redis client (optional, for prod)
- `@dnd-kit/*` — drag and drop (for queue reordering)
- `zod` — validation (schemas exist in `src/lib/validations/`)

### Dev Server (CRITICAL — read this or nothing works)

The sandbox has **4GB RAM** and kills processes aggressively. Rules:

1. **Use webpack, NOT Turbopack** — Turbopack uses 3.1GB and triggers OOM. Webpack uses 1.3GB.
   ```json
   "dev": "next dev -p 3000 --webpack 2>&1 | tee dev.log"
   ```
2. **V8 heap limit: 768MB** — forces aggressive GC.
   ```bash
   export NODE_OPTIONS="--max-old-space-size=768"
   ```
3. **Start with subshell pattern** — survives across sandbox command boundaries:
   ```bash
   ( cd /home/z/my-project && export NODE_OPTIONS="--max-old-space-size=768" && exec node node_modules/next/dist/bin/next dev -p 3000 --webpack ) > /home/z/my-project/dev.log 2>&1 &
   disown
   ```
4. **`.env` resets on sandbox boot** — `/start.sh` overwrites it with only `DATABASE_URL`. The code now uses `NODE_ENV !== 'production'` instead of `DEV_MODE === '1'` to survive this. But if DB is missing, recreate it (see section 8).

### `.env` File (for dev)
```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
DEV_MODE=1
NEXTAUTH_SECRET=d73065c4ab3b4c217a024b792fc35ca9f10ce61c2774cf30d1f9d2ca66f62938
NEXT_PUBLIC_SUPABASE_URL=https://fmsccgnfdjiophuyjwcv.supabase.co
SUPABASE_SECRET_KEY=sb_secret_nLQAdy50EOBQaqcFjiFjUQ_boQy1COn
SUPABASE_SERVICE_ROLE_KEY=sb_secret_nLQAdy50EOBQaqcFjiFjUQ_boQy1COn
SMS_PROVIDER=log
NOTIFICATION_SERVICE_URL=http://localhost:3005
```

---

## 3. The 9 User Roles

| Role | `role` value | What they do |
|------|-------------|-------------|
| **Admin** | `admin` | Manage everything — doctors, hospitals, staff, billing, reports |
| **Doctor** | `doctor` | OPD consultations, IPD rounds, prescriptions, lab orders |
| **Patient** | `patient` | Book appointments, view prescriptions, lab reports, bills |
| **Hospital** | `hospital` | Manage departments, beds, staff, IPD admissions |
| **Receptionist** | `receptionist` | Front desk — registration, booking, token, billing, re-queue |
| **Assistant** | `assistant` | Pack medicines from prescriptions (pharmacy helper) |
| **Pharmacist** | `pharmacist` | Dispense medicines, manage pharmacy stock |
| **Nurse** | `nurse` | IPD vitals, medicine administration, diet orders, shift handover |
| **Lab Technician** | `lab_technician` | Accept test orders, collect samples, upload reports |

### Dev Login (all roles work in dev)
- Endpoint: `POST /api/dev-login` with `{ role, userId? }`
- Returns: `{ success, user }` + sets `doctorooms_session` (JWT) + `doctorooms_role` cookies
- Dev users (from seed): `dev-doctor`, `dev-patient`, `dev-admin`, `dev-hospital`, `dev-receptionist`, `dev-nurse`, `dev-lab-tech`, `dev-doctor-anita`, `dev-doctor-suresh`, `dev-assistant`, `dev-pharmacist`
- Password for all: `dev123` (but dev-login bypasses password — just needs role)

---

## 4. Database Schema — 99 Prisma Models

The schema is in `prisma/schema.prisma`. Key model groups:

### Core User/Doctor
- `User` — base user (id, name, email, mobileNo, role, gender, profileImg, status)
- `Doctor` — doctor profile (specialization, education, registrationDetail, fees, address, hospitalId)
- `Hospital` — hospital entity (hospitalName, address, contactNo, email, website)
- `Department` — hospital departments (name, floorNo, opdRoom, shortCode)
- `DoctorHospital` — many-to-many: doctor ↔ hospital link (designation, fees, opdTimings)
- `Receptionist`, `DoctorAssistant`, `DoctorPharmacist`, `StaffNurse`, `LabTechnician` — staff profiles

### OPD / Booking / Prescription
- `Booking` — appointment (appointmentNo, patientName, age, gender, bloodGroup, disease, status, tokenNumber, tokenOrder, bookingDate, timeSlot, bookingMode)
- `Prescription` — the prescription (bookingId, doctorId, patientName, patientAge, weight, bp, temperature, disease, description, status, nextVisit, fulfillmentStatus)
- `PCo` — chief complaints linked to prescription (coId → CoMaster)
- `PMedicine` — medicines (medicine, dose, morning, afternoon, evening, tab, description)
- `PLabel` — vital/investigation labels (label, labelEn, value, labelUnit, showUnit)
- `PSuggestion` — advice/suggestions (question, questionEn, suggestions, suggestionsEn)
- `PDignoTable` — diagnosis tables (templateId, rows, cols, headerLabel, colsLabel, footerLabel, extraLabel)
- `POtherSetting` — doctor's print settings (logo, header, fullHeader, isFullHeader, footer, showCoInPrint, showNextVisit, printLayout)

### Master Data (doctor's personal masters)
- `CoMaster` — chief complaints (coDetail, coDetailEn)
- `QuestionsMaster` — questions linked to complaints (question, questionEn, coId)
- `SuggestionsMaster` — suggestion templates linked to questions (suggestions, suggestionsEn, questionId)
- `FindingsMaster`, `FindingsMedicine` — findings + linked medicines
- `CategoryMaster` — medicine categories
- `DoctorMedicine` — doctor's personal medicine list (medicine, category, dose, description)
- `TableTemplateMaster` — diagnosis table templates
- `LabelMaster` — vital label templates
- `DiseaseMaster` — disease master
- `DoctorTypeMaster` — doctor type (e.g., "Consultant", "Visiting")
- `DoctorSchedule`, `DoctorHoliday` — schedule + holidays

### IPD (Inpatient)
- `IpdAdmission` — admission record (patientName, admissionNo, wardId, bedId, doctorId, admittingDoctorId, admissionDate, dischargeDate, status, advanceAmount)
- `Ward` — ward (name, type: General/Private/ICU, charges)
- `Bed` — bed (bedNo, wardId, status: Available/Occupied/Maintenance)
- `VitalRecord` — daily vitals (admissionId, nurseId, temperature, bp, pulse, spo2, weight, recordedAt)
- `DoctorOrder` — doctor's orders for IPD patient (admissionId, orderType: Diet/Medicine/Lab/Test/Other, orderText, status)
- `MedicineAdministration` — nurse administers medicine (admissionId, medicineName, dose, time, nurseId)
- `SampleCollection` — lab sample collection for IPD patient
- `InvestigationReport` — lab report for IPD patient
- `DoctorVisit` — doctor round notes (admissionId, visitDate, notes, doctorId)
- `ShiftHandover` — nurse shift handover (admissionId, fromNurseId, toNurseId, notes)
- `BedTransfer` — bed transfer log
- `DietOrder` — diet orders (admissionId, breakfast, lunch, dinner, dietType)

### Lab / Diagnostics
- `LabPartner` — external lab partner (name, contactNo, email, commission)
- `DoctorLabAssociation` — doctor ↔ lab partner link
- `ExternalTestOrder` — test ordered to external lab (bookingId, labPartnerId, status: Pending/Accepted/Rejected/Completed, testNames)
- `LabReportUpload` — uploaded report file
- `LabBilling` — lab billing
- `CommissionPayment` — commission tracking
- `LabTestMaster`, `LabTestParameter`, `LabTestCatalog` — test definitions
- `LabReport`, `LabParameterValue` — lab results

### OT (Operation Theater)
- `OperationTheater` — OT room (name, status)
- `OtSchedule` — surgery scheduled (admissionId, otId, surgeryName, surgeon, date, status)

### Billing
- `OpdBill` — OPD bill
- `IpdBill` — IPD bill (admissionId, totalAmount, paidAmount)
- `BillLineItem` — line items (billId, chargeItem, amount)
- `BillPayment` — payments (billId, amount, paymentMode)
- `PatientAdvance` — advance payment
- `ChargeCategory`, `ChargeItem` — charge definitions

### Inventory / Pharmacy
- `InventoryItem` — item master (name, unit, stockQty, minStockLevel)
- `StockMovement` — stock in/out log
- `PurchaseOrder`, `PurchaseOrderItem` — PO
- `Vendor`, `VendorPayment` — vendor management

### Insurance
- `InsuranceCompany`, `TpaMaster` — insurance companies + TPAs
- `PatientInsurancePolicy` — patient's insurance policy
- `InsurancePreAuth`, `InsuranceClaim`, `ClaimLineItem`, `InsuranceDoc` — claims

### Security / System
- `Session` — DB-persisted sessions (token, userId, expiresAt, revokedAt, ipAddress, userAgent)
- `AuditLog` — audit trail (userId, userRole, action, entityType, entityId, description, severity, metadata, ipAddress, userAgent)
- `Notification`, `NotificationLog`, `NotificationTemplate`, `NotificationPreference` — notifications
- `OtpCode` — OTP codes
- `PatientConsent` — consent records
- `PaymentGatewayTransaction` — payment gateway
- `SystemSettings` — global settings
- `PrescriptionTemplate` — saved prescription templates
- `FamilyAccess` — family portal access
- `MedicalDocument` — patient medical documents
- `PrescriptionAccessRequest` — request access to another doctor's prescription

---

## 5. Project Structure

```
/home/z/my-project/
├── prisma/
│   ├── schema.prisma              # 99 models — THE schema
│   ├── seed.ts                    # main seed (has a bug — don't use)
│   └── seed-multispecialty.ts     # multispecialty seed
├── src/
│   ├── app/
│   │   ├── api/                   # 351 API routes
│   │   │   ├── dashboard/         # role-specific APIs
│   │   │   │   ├── doctor/        # doctor APIs (stats, queue, appointments, etc.)
│   │   │   │   ├── receptionist/   # receptionist APIs
│   │   │   │   ├── nurse/         # nurse APIs
│   │   │   │   ├── lab-technician/ # lab tech APIs
│   │   │   │   └── admin/         # admin APIs
│   │   │   ├── prescription/      # prescription CRUD
│   │   │   │   ├── init/          # create draft
│   │   │   │   └── [id]/
│   │   │   │       ├── vitals/    # Bug 1, 2 target
│   │   │   │       ├── tables/    # Bug 4 target
│   │   │   │       ├── medicines/
│   │   │   │       ├── complaints/
│   │   │   │       ├── suggestions/ # Bug 6 target
│   │   │   │       ├── finalize/  # Bug 5 target (nextVisit)
│   │   │   │       └── print/     # print data API
│   │   │   ├── auth/              # login, logout, me, register
│   │   │   └── dev-login/          # dev-only login
│   │   ├── dashboard/             # 173 dashboard pages
│   │   │   ├── doctor/            # doctor dashboard + subpages
│   │   │   ├── patient/
│   │   │   ├── admin/
│   │   │   ├── hospital/
│   │   │   ├── receptionist/
│   │   │   ├── nurse/
│   │   │   ├── lab-technician/
│   │   │   ├── assistant/
│   │   │   ├── pharmacist/
│   │   │   └── layout.tsx         # shared layout (sidebar + header + sticky footer)
│   │   ├── print/                 # server-rendered print pages
│   │   │   ├── prescription/[id]/  # prescription print
│   │   │   ├── lab-report/[id]/
│   │   │   ├── opd-bill/[id]/
│   │   │   ├── ipd-bill/[id]/
│   │   │   ├── discharge-summary/[id]/
│   │   │   ├── diet-orders/[id]/
│   │   │   └── lab-invoice/[id]/
│   │   └── page.tsx               # landing page (only user-visible route)
│   ├── components/
│   │   ├── prescription/
│   │   │   ├── print-view.tsx     # wizard print modal (3 header modes fixed)
│   │   │   └── stepper/
│   │   │       ├── prescription-stepper.tsx  # main wizard
│   │   │       ├── step-indicator.tsx
│   │   │       ├── step-1-complaints.tsx     # C/O selection
│   │   │       ├── step-2-vitals.tsx         # vitals + labels
│   │   │       ├── step-3-tables.tsx        # diagnosis tables
│   │   │       ├── step-4-medicines.tsx     # medicines
│   │   │       ├── step-5-suggestions.tsx   # suggestions (Bug 6 — needs redesign)
│   │   │       ├── step-6-finish.tsx        # finalize + print
│   │   │       ├── step-7-order-tests.tsx   # lab tab
│   │   │       ├── step-8-reports.tsx       # reports tab
│   │   │       ├── order-tests-dialog.tsx  # independent dialog
│   │   │       └── view-reports-dialog.tsx  # independent dialog
│   │   ├── dashboard/             # sidebar, header, stat-card, footer
│   │   ├── print/                 # PrintLayout, PrintOnMount
│   │   └── ui/                    # shadcn/ui components (DO NOT recreate)
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── session.ts             # JWT + DB session (createSession, verifySession, verifyJwt)
│   │   ├── api-auth.ts            # requireRole, requireAuth, getAuthUser, DEV_USERS
│   │   ├── prescription-store.ts  # Zustand store for wizard state
│   │   ├── auth-store.ts          # Zustand store for auth
│   │   ├── rate-limit.ts          # rate limiting (Redis or in-memory)
│   │   ├── audit-log.ts           # logAction() helper
│   │   ├── socket.ts              # Socket.IO client
│   │   ├── emit-notification.ts   # server-side emit helper
│   │   ├── validations/           # Zod schemas
│   │   ├── print-utils.ts         # format, receipt no helpers
│   │   └── date-utils.ts          # IST date helpers
│   ├── proxy.ts                   # middleware (auth + security headers)
│   └── scripts/                   # seed scripts
│       └── seed-test-data.ts     # THE seed to use (11 dev users, hospitals, bookings)
├── mini-services/
│   ├── notification-service/      # Socket.IO on port 3005 (real-time)
│   └── chat-service/             # chat on another port
├── package.json
├── .env                           # gitignored (has real secrets)
├── .env.example                   # has placeholders
└── .zscripts/dev.sh               # custom dev startup script
```

---

## 6. What's Already Built (detailed)

### ✅ Authentication & Security
- JWT + DB-persisted sessions (revocable)
- Dev-login endpoint for testing
- Role-based access control (`requireRole`)
- Rate limiting (Redis-ready, in-memory fallback)
- Security headers (CSP, X-Frame-Options, etc.)
- Audit logging (`logAction()` in 23+ API routes)
- Medical data security (consent, access requests)

### ✅ Prescription Wizard (6 steps + 2 independent buttons)
The wizard is the HEART of the system. Located at `/dashboard/doctor/prescriptions/new?bookingId={id}` or `/dashboard/doctor/prescriptions/{id}`.

**Flow:**
```
Step 1: C/O (Chief Complaints)     → select complaints from CoMaster
Step 2: Vitals                       → weight, BP, temp + custom labels
Step 3: Tables                       → diagnosis tables (rows × cols grid)
Step 4: Medicines                    → from DoctorMedicine master
Step 5: Suggestions                  → advice per complaint (BUGGY — needs redesign)
Step 6: Finish                       → review + print + finalize
   ↑
   ├── [Order Tests] button (independent) → sends to lab, marks "SentForTests"
   └── [View Reports] button (independent) → shows lab reports for this patient
```

**State management:** Zustand store (`src/lib/prescription-store.ts`) holds: prescriptionId, bookingId, patientId, patientInfo, currentStep, selectedComplaintIds, vitals, labelValues, tableData, medicines, selectedSuggestionIds, customSuggestions.

**Print view:** `src/components/prescription/print-view.tsx` (wizard modal) + `src/app/print/prescription/[id]/page.tsx` (server-rendered). Both support 3 header modes:
1. Full header image (doctor uploads letterhead PNG) → `<img>`
2. Custom header text (doctor types multi-line) → styled text letterhead
3. Auto-generate from doctor profile (name, specialization, education, reg no)

### ✅ Lab Module (complete)
- 15 API routes for lab operations
- External test ordering (doctor → lab partner → lab tech accepts → sample → report → upload)
- Real-time WebSocket notifications (order placed, accepted, rejected, report uploaded)
- Lab billing + commission tracking
- 8 print templates (lab report, lab invoice, etc.)
- Patient reports viewer page
- Lab technician dashboard (incoming orders, accept/reject, upload)

### ✅ Real-time Notifications
- Mini-service on port 3005 (Socket.IO)
- Events: `external-test-ordered`, `external-test-accepted`, `external-test-rejected`, `external-report-uploaded`, queue updates, bed status changes
- Frontend: `RealtimeNotification` component + sidebar badges + sound chime
- Wizard auto-refreshes lab tabs when events arrive

### ✅ OT (Operation Theater) Module
- OT scheduling API
- Surgery print template
- 3 demo surgeries seeded

### ✅ Diet Orders
- 3 API routes
- 3 role variants (doctor, nurse, dietitian) sharing one client component
- Print template

### ✅ Billing
- OPD billing (receptionist + admin)
- IPD billing (receptionist + admin)
- Charge categories + items
- Bill line items + payments

### ✅ Audit Logs + Notification Preferences
- Audit log page (admin)
- Notification preferences per user (sound, email, push)
- Sound chime for real-time alerts

### ✅ Production Readiness (Phases 1-5)
- Phase 1: Stop-the-bleed fixes (15 quick wins)
- Phase 2: Auth overhaul (8 sub-tasks)
- Phase 3: Medical data security (5 sub-tasks)
- Phase 4: Observability + testing (Playwright + k6 + Sentry stub)
- Phase 5: PostgreSQL migration script + Redis wrapper (code ready, infra is user's job)

### ✅ GitHub Repository
- Pushed to: `https://github.com/doctorooms-creator/Doctorooms2`
- 999 files, no secrets (all redacted), `.env.example` included

### ✅ Sticky Footer
- All dashboard pages have a sticky footer ("Doctorooms · Your Health, Our Priority · © 2026 · v1.0.0 · Built with ❤ for healthcare")
- No blank space at bottom

---

## 7. What's NOT Built / Has Bugs (see NEXT-STEPS.md for details)

### 🔴 6 Prescription Wizard Bugs (CRITICAL — user said "ye prescription heart hai hamare system ka")
1. Vitals not all saving (4 filled, only 2 show in print)
2. Vitals showing under "Lab Results" heading in print (should be under "Vitals" only)
3. Medicines count mismatch (5 added, not all show in print)
4. Diagnosis table cell values empty (`cellValues: {}` from API)
5. Next Visit date not saving in finalize API
6. Suggestions not saving + C/O→Suggestions mapping needs redesign (Step 5 must show complaints from Step 1, doctor adds suggestions per complaint, selects which to include)

### 🟡 Queue System Redesign (decided, not built)
- Current: basic token-based queue with SentForTests status
- Needed: drag-and-drop reordering, priority tokens, real-time display board, multi-doctor queue management

### 🟡 IPD System Flow (designed, partially built)
- Built: IpdAdmission, Ward, Bed, VitalRecord, DoctorOrder, MedicineAdministration, DoctorVisit, ShiftHandover, BedTransfer, DietOrder
- Built pages: doctor IPD list + patient detail, nurse patient detail, receptionist IPD + billing, admin billing
- Needed: complete daily flow (admission → vitals → rounds → orders → discharge → bill), discharge summary, IPD dashboard

### 🟡 Testing
- Playwright config exists (7 patient journey tests + 6 security tests)
- k6 load test exists
- But not comprehensive — need more coverage

---

## 8. How to Restart Everything (if sandbox resets)

### If `.env` is missing/reset:
```bash
printf 'DATABASE_URL=file:/home/z/my-project/db/custom.db\nDEV_MODE=1\nNEXTAUTH_SECRET=d73065c4ab3b4c217a024b792fc35ca9f10ce61c2774cf30d1f9d2ca66f62938\nNEXT_PUBLIC_SUPABASE_URL=https://fmsccgnfdjiophuyjwcv.supabase.co\nSUPABASE_SECRET_KEY=sb_secret_nLQAdy50EOBQaqcFjiFjUQ_boQy1COn\nSUPABASE_SERVICE_ROLE_KEY=sb_secret_nLQAdy50EOBQaqcFjiFjUQ_boQy1COn\nSMS_PROVIDER=log\nNOTIFICATION_SERVICE_URL=http://localhost:3005\n' > /home/z/my-project/.env
```

### If `db/` directory is missing:
```bash
cd /home/z/my-project
mkdir -p db
bun run db:push              # creates all 99 tables
npx tsx src/scripts/seed-test-data.ts  # seeds 11 dev users + test data
```

### If dev server is dead:
```bash
cd /home/z/my-project
pkill -9 -f "next" 2>/dev/null; sleep 2
( cd /home/z/my-project && export NODE_OPTIONS="--max-old-space-size=768" && exec node node_modules/next/dist/bin/next dev -p 3000 --webpack ) > /home/z/my-project/dev.log 2>&1 &
disown
# Wait for ready
for i in $(seq 1 40); do sleep 1; curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && break; done
sleep 3
```

### If mini-service is dead:
```bash
cd /home/z/my-project/mini-services/notification-service
bun run dev &  # port 3005, auto-restart on file change
```

### Verify everything works:
```bash
curl -s -o /dev/null -w "Home: %{http_code}\n" http://localhost:3000/
curl -s -X POST http://localhost:3000/api/dev-login -H "Content-Type: application/json" -d '{"role":"doctor","userId":"dev-doctor"}' -w "\nLogin: %{http_code}\n"
```

---

## 9. Coding Conventions (MUST follow)

1. **TypeScript throughout** — strict typing, no `any` without reason
2. **API routes**: use `requireRole(req, 'role')` for auth, always wrap in try/catch, return JSON
3. **Components**: `'use client'` for interactive, no `'use client'` for server components
4. **Styling**: Tailwind CSS + shadcn/ui — NO custom CSS, NO indigo/blue colors (user preference)
5. **Icons**: lucide-react only (if an icon doesn't exist, find an alternative — don't use wrong names)
6. **Database**: `import { db } from '@/lib/db'` — never `new PrismaClient()` directly
7. **Real-time**: use `emitNotification()` helper — fire-and-forget, never block
8. **Audit**: use `logAction()` for all sensitive operations
9. **Validation**: Zod schemas in `src/lib/validations/` — validate all POST/PUT bodies
10. **Print**: inline styles for print components (Tailwind classes don't survive print CSS `body * { visibility: hidden }`)
11. **Prisma**: schema primitive types can NOT be lists (use JSON strings for arrays)
12. **Footer**: sticky footer on all dashboard pages (already in layout)
13. **API URLs**: relative paths only (NO `http://localhost:3000`), use `?XTransformPort=` for cross-service
14. **Never** write test code unless asked

---

## 10. Key Files to Read First (before starting any work)

1. **This file** — `DOCTOROOMS-HANDBOOK.md`
2. `prisma/schema.prisma` — the 99 models (the source of truth for data)
3. `src/lib/prescription-store.ts` — the wizard state (Zustand)
4. `src/components/prescription/stepper/prescription-stepper.tsx` — the wizard main
5. `src/components/prescription/print-view.tsx` — the print modal
6. `src/app/print/prescription/[id]/page.tsx` — the server-rendered print
7. `src/app/api/dashboard/doctor/queue/route.ts` — the queue API
8. `worklog.md` — the full history of what was done (63+ stage summaries)
9. `NEXT-STEPS.md` — what needs to be built next
10. `GLM-PROMPT.md` — the prompt for the next AI session

---

## 11. The Real Hospital Flow (think like a doctor)

This is how a REAL hospital runs. The system must automate exactly this:

### OPD Flow (Outpatient)
```
Patient walks in
  → Receptionist registers (name, age, gender, mobile)
  → Book appointment (select doctor, date, time slot)
  → Generate token number (auto-increment per doctor per day)
  → Patient waits in queue (display board shows current serving)

Doctor calls patient (token X)
  → Step 1: "Kya takleef hai?" → Patient tells complaints
  → Doctor selects C/O from master (fever, headache, body pain — multiple)
  → Step 2: Nurse takes vitals (BP, temp, weight, pulse, SpO2)
  → Doctor reviews vitals, decides if lab tests needed
  → If tests needed: [Order Tests] button → selects tests → sends to lab
  → Patient status → "SentForTests" (leaves normal queue)
  → Lab processes tests → uploads reports
  → Real-time notification → Receptionist sees reports arrived
  → Receptionist re-queues patient (adds back to doctor's queue)
  → Doctor sees patient again (with reports)
  → Step 3: Fill diagnosis tables (e.g., for fever: cause, duration, severity)
  → Step 4: Prescribe medicines (from doctor's medicine master)
  → Step 5: Give suggestions PER COMPLAINT:
      • For fever → "Take rest, drink fluids"
      • For headache → "Avoid screen time, take PCM"
      • Doctor selects which suggestions to include in prescription
  → Step 6: Set next visit date → Finalize prescription
  → Print prescription → Patient takes to pharmacy
  → Pharmacist/Assistant packs medicines → Patient pays → Leaves
```

### IPD Flow (Inpatient)
```
Patient admitted (from OPD or emergency)
  → Receptionist creates IpdAdmission (patient, ward, bed, doctor, advance)
  → Bed status → Occupied
  → Nurse assigned to patient

Daily IPD routine:
  Morning (6 AM):
    → Nurse takes vitals (temp, BP, pulse, SpO2)
    → Nurse records in VitalRecord
  Morning (9 AM) — Doctor round:
    → Doctor visits each IPD patient (DoctorVisit)
    → Reviews vitals + lab reports
    → Writes orders:
      • Diet order (breakfast, lunch, dinner — normal/diabetic/soft)
      • Medicine order (which medicines, dose, frequency)
      • Lab order (which tests)
      • Other orders (IV fluid, oxygen, etc.)
    → Nurse receives orders → administers medicines (MedicineAdministration)
    → Lab collects samples (SampleCollection)

  Afternoon:
    → Lab processes → uploads reports (InvestigationReport)
    → Real-time notification to doctor

  Evening (6 PM):
    → Nurse takes vitals again
    → Shift handover (ShiftHandover — outgoing nurse briefs incoming)

Discharge:
  → Doctor decides patient is fit
  → Discharge summary (admission reason, treatment, condition, advice)
  → Generate IPD bill:
      • Room charges (per day × days)
      • Procedure charges
      • Lab charges
      • Medicine charges
      • Doctor fees
      • Nursing charges
      • + taxes
  → Patient pays → Bed freed → Discharge
```

### Lab Flow
```
Doctor orders tests (from OPD or IPD)
  → ExternalTestOrder created (status: Pending)
  → Real-time notification to lab partner/technician
Lab technician:
  → Sees incoming order
  → Accepts (status: Accepted) OR Rejects
  → Collects sample
  → Processes test
  → Generates report (PDF + digital values)
  → Uploads report (LabReportUpload)
  → Status: Completed
  → Real-time notification to doctor + patient
Doctor:
  → Sees report (in prescription wizard [View Reports] or IPD patient detail)
  → Reviews and takes action
Billing:
  → LabBilling created (test charges, commission to doctor/lab)
  → CommissionPayment tracked
```

### Pharmacy Flow
```
Prescription finalized by doctor
  → Goes to pharmacy queue
Assistant:
  → Sees pending prescriptions
  → Opens prescription
  → Checks medicine stock
  → Packs medicines (marks each medicine as packed)
  → Marks prescription as "packed"
Pharmacist:
  → Reviews packed prescription
  → Generates bill (medicine charges)
  → Patient pays
  → Stock auto-deducted
```

### Receptionist Flow
```
Morning setup:
  → Login → see today's appointments
  → Check which doctors are available
Walk-in patient:
  → Register (or find existing by mobile)
  → Book appointment
  → Generate token
  → Add to queue
SentForTests patient:
  → When lab reports arrive (notification)
  → Re-queue patient to doctor's queue
Billing:
  → Generate OPD bill (consultation + procedures)
  → Collect payment
IPD:
  → Create admission
  → Collect advance
  → On discharge → generate IPD bill
```

---

## 12. Critical Rules (from experience — DO NOT repeat mistakes)

1. **`createdById` is NOT a field on Prescription model** — don't add it to `db.prescription.create()`
2. **`PCo` model has no `co` relation to `CoMaster`** — only `coId`. Fetch CoMaster records manually + merge.
3. **`User` model has no `specialization`** (it's on Doctor), no `contactNo`/`phoneNo` (use `mobileNo`)
4. **`ListClock` icon doesn't exist** — use `Clock4`
5. **Order Tests dialog**: URL is `/appointments/` (not `/bookings/`), method is `PUT` (not `PATCH`)
6. **Booking dates**: set to IST start of day (not UTC midnight) — API checks IST range
7. **`LabTestMaster` API** returns `testMasters` key, not `tests`
8. **Print view**: `body * { visibility: hidden }` in print CSS means only inline styles survive — don't use Tailwind classes for print components
9. **Prisma schema**: primitive types can NOT be lists — use `String` with JSON.stringify for arrays
10. **`.env` resets** on sandbox boot — code uses `NODE_ENV` not `DEV_MODE` to survive this
11. **Database** can disappear on sandbox reset — always have `db:push` + seed ready
12. **Server dies** if started without subshell pattern — use `( cd ... && exec node ... ) & disown`
13. **OOM kill** if using Turbopack — always use `--webpack` + `--max-old-space-size=768`
14. **Never** write `http://localhost:3000` in fetch calls — use relative paths only
15. **Footer** must be sticky — already in dashboard layout, don't break it

---

## 13. Worklog History (63+ completed tasks)

The `worklog.md` file has 3300+ lines documenting every task. Key milestones:

1. **PWA/Mobile** — Phase 8C complete
2. **Missing items** — 12 items created (91% → 100% plan)
3. **Billing** — All billing pages + APIs complete
4. **Family Portal + WebSocket** — Phase 7 + 8
5. **Critical gaps** — 7 critical gaps fixed
6. **Schema FK & Data Integrity** — onDelete, indexes, updatedAt
7. **Zod Validation** — schemas for all API routes
8. **WebSocket** — emit-notification.ts + 18 routes wired
9. **Pagination** — 6 unbounded list endpoints paginated
10. **Feature inventory** — comprehensive audit
11. **Seed data** — seed-test-data.ts (11 dev users)
12. **Lab Module** — 8 phases (schema, admin, patient, doctor, labtech, seed, wizard, verify)
13. **Real-time Notifications** — 5 phases (backend, lab, system, frontend, verify)
14. **Print Engine** — Phase P1 (foundation)
15. **Lab Polish** — 3 quick wins
16. **OT Module** — 5 API routes + print + seed
17. **Diet Orders** — 3 role variants + print
18. **Audit Logs** — audit page + notification preferences + sound chime
19. **Production Readiness** — Phase 1-5 (stop-bleeding, auth, medical security, observability, storage migration)
20. **Supabase migration attempt** — sandbox blocked port 5432, reverted to SQLite
21. **Prescription header fix** — 3 modes (image, text, auto-generate)
22. **Dashboard sticky footer** — fixed blank space
23. **Web not working fixes** — server restart patterns
24. **Login 404 permanent fix** — NODE_ENV instead of DEV_MODE
25. **GitHub push** — code on github.com/doctorooms-creator/Doctorooms2

---

*End of Handbook. Read NEXT-STEPS.md for what to build next.*
