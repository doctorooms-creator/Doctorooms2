# Doctorooms — Comprehensive Development Plan V2

> **Created:** After PostgreSQL migration to Supabase
> **Current State:** 89 models, 306 API routes, 154 pages, running on Supabase PostgreSQL
> **Goal:** Transform from "feature-complete HMS" to "production-deployed, enterprise-grade hospital system"
> **Duration:** 4 months (16 weeks)
> **Execution:** Sequential phases, each verified before proceeding

---

## CURRENT STATE ASSESSMENT

### ✅ What's Done (Working on PostgreSQL)

| Module | Coverage | Models | Status |
|--------|----------|--------|--------|
| Appointments & Queue | 95% | 4 | ✅ Complete |
| Prescriptions (6-step stepper) | 95% | 15 | ✅ Complete |
| Doctors & Clinic | 90% | 11 | ✅ Complete |
| Lab & Pathology | 90% | 6 | ✅ Complete |
| IPD (admission→discharge) | 85% | 14 | ✅ Complete |
| Patients | 85% | 8 | ✅ Complete |
| Nursing (vitals, meds, handover) | 80% | 6 | ✅ Complete + Diet UI |
| Billing (OPD + IPD) | 80% | 7 | ✅ Complete |
| Auth (session + JWT + proxy) | 80% | 2 | ✅ Hardened |
| Inventory | 60% | 4 | ✅ Functional |
| Pharmacy | 60% | 2 | ✅ Functional |
| OT | 50% | 2 | ✅ Functional |
| Expenses & Vendors | 100% | 4 | ✅ NEW — Complete |
| Audit Trails | 100% | 1 | ✅ NEW — Complete |
| Patient Consent | 100% | 1 | ✅ NEW — Complete |
| Insurance/TPA Phase 1 | 80% | 8 | ✅ NEW — Master + Pre-auth + Claims |
| Payments (Razorpay) | 90% | 1 | ✅ NEW — Test mode |
| SMS/WhatsApp | 70% | 2 | ✅ NEW — Code ready, keys needed |
| Diet Module | 100% | 1 | ✅ NEW — Complete |

### ⚠️ Technical Debt (Must Fix Before Production)

| Issue | Impact | Effort |
|-------|--------|--------|
| **Zod validation drift** | 22/306 routes use Zod (92% use raw `req.json()`) — input validation gap | M (1 week) |
| **No rate limiting** | Login endpoint vulnerable to brute force | S (1 day) |
| **OTP store in-memory** | Lost on restart, breaks multi-instance | S (2 days) |
| **Print components `any` types** | 7 print files have untyped props — no type safety | S (1 day) |
| **Cross-hospital socket leak** | Doctors get toasts for ALL hospitals' vitals | S (2 hours) |
| **No CI/CD** | No automated testing/deployment | M (3 days) |
| **Razorpay test mode** | Not production-ready | S (1 day — KYC) |
| **MSG91/Gupshup not configured** | SMS/WhatsApp code exists but no API keys | S (2 days — signup) |

### ❌ Missing Modules (0% Coverage)

| Module | Business Impact | Complexity |
|--------|----------------|------------|
| **HR/Payroll** | Critical — 40-55% of hospital expense, statutory compliance (PF/ESI) | XL |
| **Report Export (PDF/Excel)** | High — currently screen-only, no downloadable reports | M |
| **ABDM/Health ID Integration** | Medium — Indian govt mandate, future requirement | XL |
| **Blood Bank** | Medium — specialized, not all hospitals need it | L |
| **Asset/Equipment Management** | Medium — AMC/warranty tracking for medical equipment | L |
| **Multi-Branch/Chain** | Low — single hospital focus for now | L |

---

## PHASE MAP (16 Weeks)

| Phase | Module | Duration | Priority | Parallelizable |
|-------|--------|----------|----------|----------------|
| **6** | Technical Debt Cleanup | 1 week | P0 | No |
| **7** | Report Export System | 1 week | P1 | Yes (with 8) |
| **8** | HR/Payroll Module | 4 weeks | P1 | Yes (with 7) |
| **9** | Production Deployment | 1 week | P0 | No |
| **10** | Advanced Features (QR, Certificates) | 2 weeks | P2 | Yes |
| **11** | ABDM Integration (Phase 1) | 4 weeks | P2 | Yes |
| **12** | Polish & Mobile PWA | 2 weeks | P2 | Yes |
| **Buffer** | Bug fixes + testing | 1 week | — | — |

---

## PHASE 6: TECHNICAL DEBT CLEANUP (Week 1)

### 6.1 — Zod Validation Backfill (P0)

**Problem:** 284 of 306 API routes use raw `await req.json()` with no schema validation.

**Approach:** Create Zod schemas for the highest-risk modules first.

**Priority order (by data sensitivity):**

| Module | Routes | Schema File | Risk |
|--------|--------|-------------|------|
| Prescription (init, finalize, medicines, vitals) | 8 | `validations/prescription.ts` (new) | High — clinical data |
| Doctor dashboard (appointments, schedule, IPD) | 12 | `validations/doctor.ts` (new) | High |
| Nurse (vitals, medicines, investigations) | 8 | `validations/nurse.ts` (new) | High — clinical |
| Receptionist (walk-in, bookings, IPD admit) | 10 | `validations/receptionist.ts` (new) | Medium |
| Admin (users, wards, nurses, settings) | 6 | `validations/admin.ts` (new) | Medium |
| Auth (login, register, forgot-password) | 4 | `validations/auth.ts` (new) | High — security |
| Hospital (departments, doctors, inquiries) | 6 | `validations/hospital.ts` (new) | Medium |

**Pattern for each route:**
```typescript
// Before (insecure):
const body = await req.json()
if (!body.field) return NextResponse.json({ error: 'Missing field' }, { status: 400 })

// After (validated):
const body = await req.json()
const v = validateBody(createPrescriptionSchema, body)
if (!v.success) return v.error
const { field1, field2 } = v.data
```

**Deliverable:** All 306 routes use Zod validation. `bun run lint` passes.

### 6.2 — Rate Limiting (P0)

**Install:** `bun add @upstash/ratelimit @upstash/redis`

**Create `src/lib/rate-limit.ts`:**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Free tier: 10,000 requests/day
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min per IP
  analytics: true,
})

// Strict limiter for auth endpoints
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 login attempts/min
})
```

**Apply to:**
- `/api/auth/login` — 5 attempts/minute per IP
- `/api/auth/forgot-password` — 3 attempts/minute per IP
- `/api/auth/register` — 5 attempts/minute per IP
- All `/api/*` routes — 100 requests/minute per user (general protection)

### 6.3 — OTP Store to Database (P0)

**Problem:** `src/lib/otp-store.ts` is in-memory — lost on restart, breaks multi-instance.

**Add `OtpRecord` model:**
```prisma
model OtpRecord {
  id        String   @id @default(cuid())
  email     String
  otp       String
  purpose   String   @default("forgot-password") // forgot-password, email-verify
  expiresAt DateTime
  usedAt    DateTime?
  attempts  Int      @default(0)
  createdAt DateTime @default(now())

  @@index([email, purpose])
  @@index([expiresAt])
}
```

**Rewrite `src/lib/otp-store.ts`:**
- `storeOtp(email, otp)` → `db.otpRecord.create()`
- `verifyOtp(email, otp)` → `db.otpRecord.findFirst()` + check expiry + increment attempts
- Auto-delete records older than 1 hour (cleanup job)

### 6.4 — Print Component Type Safety (P1)

**Problem:** 7 print components use `any` for all props.

**Create `src/types/print.ts`:**
```typescript
export interface PrintBillData {
  billNo: string
  billDate: string
  patientName: string
  patientAge: number
  patientGender: string
  // ... all fields
}

export interface PrintDoctorData {
  name: string
  specialization: string
  regNo: string
  // ...
}

export interface PrintHospitalData {
  hospitalName: string
  address: string
  contactNo: string
  // ...
}
```

**Update all 7 print components:**
- `OpdBillPrint.tsx` — props: `{ bill: PrintBillData, booking: PrintBookingData, doctor: PrintDoctorData, hospital: PrintHospitalData }`
- `IpdBillPrint.tsx` — same pattern
- `PaymentReceiptPrint.tsx`
- `AdvanceReceiptPrint.tsx`
- `LabReportPrint.tsx`
- `LabReportConsolidatedPrint.tsx`
- `DischargeSummaryPrint.tsx`

### 6.5 — Cross-Hospital Socket Leak Fix (P1)

**Problem:** `emitNotification('vital-recorded', [roleRoom('doctor'), hospitalRoom(hospitalId)])` broadcasts to ALL doctors across ALL hospitals.

**Fix in `src/lib/emit-notification.ts`:**
- Remove `roleRoom('doctor')` from vital/lab/bill events
- Use ONLY `hospitalRoom(hospitalId)` + `userRoom(attendingDoctorId)` for targeted delivery
- Keep `roleRoom` only for hospital-wide broadcasts (new-admission, low-stock-alert)

### 6.6 — CI/CD Pipeline (P1)

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run db:generate
      - name: Type check
        run: bunx tsc --noEmit
```

**Verification:** GitHub Actions runs on every push, fails PR if lint/type errors.

---

## PHASE 7: REPORT EXPORT SYSTEM (Week 2)

### 7.1 — PDF Report Engine

**Install:** `bun add @react-pdf/renderer`

**Create `src/lib/report-pdf.ts`:**
```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Reusable PDF components for hospital reports
// - Header with hospital logo + name
// - Footer with page numbers + generated date
// - Table component for tabular data
// - Summary card component
```

**Report types to build:**

| Report | Trigger | Content |
|--------|---------|---------|
| Revenue Summary PDF | Hospital → Reports → Revenue → "Download PDF" | Monthly revenue, payment methods, department-wise, top doctors |
| IPD Census Report PDF | Hospital → Reports → IPD → "Download PDF" | Admissions, discharges, bed occupancy, ALOS |
| Lab Worklist PDF | Lab Tech → Reports → "Download PDF" | All lab tests by status, date range |
| Expense Summary PDF | Hospital → Expenses → "Download PDF" | Expenses by category, vendor, status |
| Insurance Claim Summary PDF | Hospital → Insurance → "Download PDF" | Claims by TPA, status, aging |
| Patient Discharge Summary PDF | Hospital → IPD → Patient → "Download" | Full discharge summary with vitals, diagnosis, treatment |

### 7.2 — Excel Export

**Install:** `bun add exceljs`

**Create `src/lib/report-excel.ts`:**
```typescript
import ExcelJS from 'exceljs'

// Generic function: takes array of objects + column definitions → returns Excel buffer
export async function generateExcel(
  data: Record<string, unknown>[],
  columns: { header: string, key: string, width?: number }[],
  sheetName: string
): Promise<Buffer>
```

**API endpoints:**
- `GET /api/reports/revenue/summary/export?format=pdf` → PDF
- `GET /api/reports/revenue/summary/export?format=excel` → Excel
- `GET /api/reports/ipd/summary/export?format=pdf`
- `GET /api/reports/financial/profit-loss/export?format=pdf`
- `GET /api/audit-logs/export?format=excel` (already CSV, add Excel)

### 7.3 — Scheduled Reports (Cron)

**Create `src/scripts/scheduled-reports.ts`:**
- Daily: Revenue summary email to hospital admin
- Weekly: IPD census + bed occupancy
- Monthly: P&L statement, expense breakdown, insurance claim status

**Cron setup (on deployment server):**
```bash
# Daily at 9 AM IST
0 9 * * * cd /app && bun run src/scripts/scheduled-reports.ts daily

# Weekly on Monday at 9 AM
0 9 * * 1 cd /app && bun run src/scripts/scheduled-reports.ts weekly

# Monthly on 1st at 9 AM
0 9 1 * * cd /app && bun run src/scripts/scheduled-reports.ts monthly
```

---

## PHASE 8: HR/PAYROLL MODULE (Weeks 3-6)

**Why:** Largest cost center (40-55% of hospital expense). Currently no employee roster, no salary, no payslip. Required for PF/ESI statutory compliance.

### 8.1 — Schema (7 new models)

```prisma
model Employee {
  id              String   @id @default(cuid())
  hospitalId      String
  userId          String?  @unique  // link to User if they have a login
  employeeId      String   @unique  // EMP-001
  designation     String
  departmentId    String?
  wardId          String?
  joiningDate     DateTime
  exitDate        DateTime?
  status          String   @default("Active") // Active, OnLeave, Resigned, Terminated
  employmentType  String   @default("Full-time") // Full-time, Part-time, Contract, Consultant
  bankAccountNo   String   @default("")
  bankIfsc        String   @default("")
  pfNo            String   @default("")  // Provident Fund
  esiNo           String   @default("")  // Employee State Insurance
  panNo           String   @default("")
  uanNo           String   @default("")  // Universal Account Number (PF)
  salaryStructure SalaryStructure?
  attendances     Attendance[]
  leaveRequests   LeaveRequest[]
  payslips        Payslip[]
  shiftRotas      ShiftRota[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  hospital        Hospital @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([hospitalId, status])
}

model SalaryStructure {
  id              String   @id @default(cuid())
  employeeId      String   @unique
  basic           Float    @default(0)
  hra             Float    @default(0)  // House Rent Allowance
  conveyance      Float    @default(0)
  specialAllowance Float   @default(0)
  medicalAllowance Float   @default(0)
  totalEarnings   Float    @default(0)
  pfDeduction     Float    @default(0)  // 12% of basic (employee share)
  esiDeduction    Float    @default(0)  // 0.75% of gross (employee share)
  taxDeduction    Float    @default(0)  // TDS
  totalDeductions Float    @default(0)
  netPay          Float    @default(0)
  effectiveFrom   DateTime
  effectiveTo     DateTime?
  createdAt       DateTime @default(now())

  employee        Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
}

model PayrollRun {
  id              String   @id @default(cuid())
  hospitalId      String
  month           Int      // 1-12
  year            Int
  status          String   @default("Draft") // Draft, Processed, Paid
  processedAt     DateTime?
  processedBy     String?
  totalGross      Float    @default(0)
  totalDeductions Float    @default(0)
  totalNetPay     Float    @default(0)
  employeeCount   Int      @default(0)
  createdAt       DateTime @default(now())

  hospital        Hospital  @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  payslips        Payslip[]

  @@unique([hospitalId, month, year])
}

model Payslip {
  id              String   @id @default(cuid())
  payrollRunId    String
  employeeId      String
  grossEarnings   Float    @default(0)
  pfContribution  Float    @default(0)
  esiContribution Float    @default(0)
  taxDeducted     Float    @default(0)
  totalDeductions Float    @default(0)
  netPay          Float    @default(0)
  lopDays         Int      @default(0)  // Loss of Pay days
  presentDays     Int      @default(0)
  totalDays       Int      @default(30)
  status          String   @default("Generated") // Generated, Paid
  paidAt          DateTime?
  createdAt       DateTime @default(now())

  payrollRun      PayrollRun @relation(fields: [payrollRunId], references: [id], onDelete: Cascade)
  employee        Employee   @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([payrollRunId])
  @@index([employeeId])
}

model Attendance {
  id              String   @id @default(cuid())
  employeeId      String
  date            DateTime
  status          String   @default("Present") // Present, HalfDay, Absent, Leave, Holiday, WeekOff
  checkIn         DateTime?
  checkOut        DateTime?
  workHours       Float    @default(0)
  overtimeHours   Float    @default(0)
  notes           String   @default("")
  createdAt       DateTime @default(now())

  employee        Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@unique([employeeId, date])
  @@index([employeeId, date])
}

model LeaveRequest {
  id              String   @id @default(cuid())
  employeeId      String
  fromDate        DateTime
  toDate          DateTime
  days            Int
  leaveType       String   @default("Casual") // Casual, Sick, Earned, Unpaid, Maternity
  reason          String   @default("")
  status          String   @default("Pending") // Pending, Approved, Rejected
  approverId      String?
  approvedAt      DateTime?
  createdAt       DateTime @default(now())

  employee        Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId, status])
}

model ShiftRota {
  id              String   @id @default(cuid())
  employeeId      String
  shiftDate       DateTime
  shiftType       String   @default("Morning") // Morning, Evening, Night
  startTime       String   @default("07:00")
  endTime         String   @default("15:00")
  notes           String   @default("")
  createdAt       DateTime @default(now())

  employee        Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@unique([employeeId, shiftDate])
  @@index([employeeId, shiftDate])
}
```

### 8.2 — API Routes (16 new)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/employees` | GET, POST | List/create employees |
| `/api/employees/[id]` | GET, PUT, DELETE | CRUD employee |
| `/api/salary-structures` | GET, POST | List/create salary |
| `/api/salary-structures/[id]` | PUT | Update salary |
| `/api/payroll/run` | POST | Process monthly payroll (creates Payslips for all active employees) |
| `/api/payroll/[id]` | GET | Get payroll run detail |
| `/api/payroll/[id]/payslips` | GET | List payslips in a run |
| `/api/payroll/payslips/[id]` | GET | Get single payslip |
| `/api/payroll/payslips/[id]/pdf` | GET | Download payslip PDF |
| `/api/attendance` | GET, POST | List/mark attendance |
| `/api/attendance/bulk` | POST | Bulk mark attendance (CSV import) |
| `/api/leave-requests` | GET, POST | List/apply leave |
| `/api/leave-requests/[id]/approve` | POST | Approve/reject leave |
| `/api/shift-rota` | GET, POST | List/create shift schedule |
| `/api/reports/hr/attendance-summary` | GET | Attendance report |
| `/api/reports/hr/payroll-summary` | GET | Payroll summary report |

### 8.3 — Frontend Pages (10 new)

| Route | Features |
|-------|----------|
| `/dashboard/hospital/hr/employees` | Employee roster with search, department filter, status |
| `/dashboard/hospital/hr/employees/new` | Add employee form (personal, bank, PF/ESI, designation) |
| `/dashboard/hospital/hr/employees/[id]` | Employee detail with salary, attendance, payslips, leave history |
| `/dashboard/hospital/hr/salary` | Salary structure management |
| `/dashboard/hospital/hr/attendance` | Monthly attendance grid (calendar view), bulk mark |
| `/dashboard/hospital/hr/leaves` | Leave requests list with approve/reject |
| `/dashboard/hospital/hr/payroll` | Payroll runs list, "Run Payroll" button (select month → auto-generate payslips) |
| `/dashboard/hospital/hr/payroll/[id]` | Payroll run detail with all payslips, "Download All" PDF |
| `/dashboard/hospital/hr/payslips/[id]` | Single payslip view + PDF download |
| `/dashboard/hospital/hr/shift-rota` | Weekly shift schedule grid (Morning/Evening/Night) |

### 8.4 — Payroll Processing Logic

```
Run Payroll (month, year):
  1. Fetch all active employees for this hospital
  2. For each employee:
     a. Fetch salary structure (basic, hra, etc.)
     b. Fetch attendance for the month → count present/absent/leave days
     c. Compute LOP days = absent + unpaid leave
     d. Compute gross = totalEarnings × (presentDays / totalDays)
     e. Compute PF = 12% of basic (if basic < ₹15,000/month — statutory)
     f. Compute ESI = 0.75% of gross (if gross < ₹21,000/month — statutory)
     g. Compute TDS = based on tax slab (simplified)
     h. netPay = gross - PF - ESI - TDS
     i. Create Payslip record
  3. Update PayrollRun totals + status = 'Processed'
  4. Generate PDF payslips for all employees
```

### 8.5 — Statutory Compliance (India-specific)

- **PF (Provident Fund):** 12% of basic (employee) + 12% (employer) — if basic < ₹15,000/month, mandatory for orgs with 20+ employees
- **ESI (Employee State Insurance):** 0.75% (employee) + 3.25% (employer) — if gross < ₹21,000/month, mandatory for orgs with 10+ employees
- **Professional Tax:** State-specific (₹200/month in most states)
- **TDS (Tax Deducted at Source):** Based on income tax slabs (simplified — actual calculation needs Form 16, investments, etc.)

### 8.6 — Payslip PDF Template

**Create `src/components/print/PayslipPrint.tsx`:**
- Hospital header (name, address, logo)
- Employee details (name, employee ID, designation, department, PAN, PF no, bank account)
- Earnings table (Basic, HRA, Conveyance, Special, Medical → Total)
- Deductions table (PF, ESI, TDS, Professional Tax → Total)
- Net Pay (in words: "Rupees Fifty Thousand Only")
- Month/Year, Pay Date
- Signature line

---

## PHASE 9: PRODUCTION DEPLOYMENT (Week 7)

### 9.1 — Pre-deployment Checklist

- [ ] `bun run lint` passes (0 errors)
- [ ] `bunx tsc --noEmit` passes (0 type errors)
- [ ] All env vars documented in `.env.example`
- [ ] No console.log in production code (except error logging)
- [ ] No hardcoded localhost URLs
- [ ] All API routes have try/catch
- [ ] All API routes have auth checks
- [ ] CORS configured for production domain

### 9.2 — Razorpay Production Setup

1. Complete Razorpay KYC (PAN, business registration, bank account)
2. Switch from test keys to live keys:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxx  # from Razorpay dashboard
   ```
3. Configure webhook URL in Razorpay dashboard:
   ```
   https://yourdomain.com/api/payments/razorpay/webhook
   ```
4. Test with ₹1 transaction, then refund

### 9.3 — MSG91 SMS Setup

1. Sign up at MSG91 (₹0.20/SMS, ~₹500 for 2500 SMS)
2. Get API key from dashboard
3. Register sender ID (e.g., "DOCTRM") — takes 1-2 days approval
4. Add to `.env`:
   ```env
   MSG91_API_KEY=xxxxx
   ```
5. Test send from Hospital → Notification Settings → Test Send

### 9.4 — Gupshup WhatsApp Setup

1. Sign up at Gupshup (WhatsApp Business API)
2. Get API key + source number
3. Submit WhatsApp template for approval (3-5 days per template)
4. Add to `.env`:
   ```env
   GUPSHUP_API_KEY=xxxxx
   GUPSHUP_SOURCE_NUMBER=91XXXXXXXXXX
   GUPSHUP_APP_NAME=Doctorooms
   ```
5. Templates to submit: appointment_confirmation, lab_report_ready, discharge_summary, payment_receipt

### 9.5 — Deploy to Vercel (Recommended for Next.js)

```bash
# 1. Push to GitHub
git add . && git commit -m "Production ready"
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com → New Project → Import from GitHub
# - Set environment variables (copy from .env, change to production values)
# - Deploy

# 3. Configure custom domain (optional)
# - Add CNAME record → Vercel provides instructions
# - Enable HTTPS (automatic with Vercel)
```

**Vercel environment variables to set:**
- `DATABASE_URL` = Supabase pooler URL (port 6543 for serverless)
- `DEV_MODE` = (leave empty for production)
- `NEXTAUTH_SECRET` = generate new secret (`openssl rand -hex 32`)
- `NEXTAUTH_URL` = `https://yourdomain.com`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` = live keys
- `RAZORPAY_WEBHOOK_SECRET` = from dashboard
- `MSG91_API_KEY` = from MSG91
- `GUPSHUP_API_KEY` / `GUPSHUP_SOURCE_NUMBER` / `GUPSHUP_APP_NAME`
- All `SUPABASE_*` keys

### 9.6 — Mini-services Deployment

The notification and chat services can't run on Vercel (they're persistent Socket.IO servers). Options:

**Option A: Railway (Recommended — easiest)**
```bash
# Deploy notification-service
cd mini-services/notification-service
# Create new Railway project, set PORT env, deploy

# Deploy chat-service
cd mini-services/chat-service
# Same process
```

**Option B: VPS (DigitalOcean / Hetzner)**
```bash
# Use PM2 process manager
npm install -g pm2
pm2 start mini-services/notification-service/index.ts --name notif
pm2 start mini-services/chat-service/index.ts --name chat
pm2 startup
pm2 save
```

**Update frontend socket URLs for production:**
- The `XTransformPort` pattern works with Caddy gateway
- For production, configure your reverse proxy (nginx/Caddy) to route `/socket.io/?port=3005` to the notification service

### 9.7 — Database Backup Strategy

**Supabase automatic backups:**
- Daily snapshots (7-day retention on free tier)
- Point-in-time recovery (paid tier)

**Manual backup script:**
```bash
# scripts/backup-db.sh
pg_dump $DATABASE_URL > backups/doctorooms-$(date +%Y%m%d).sql
# Upload to S3/Google Drive
```

**Cron:**
```bash
0 2 * * * cd /app && ./scripts/backup-db.sh
```

---

## PHASE 10: ADVANCED FEATURES (Weeks 8-9)

### 10.1 — QR Code Patient ID

**Install:** `bun add qrcode`

**Add to `IpdAdmission`:**
```prisma
qrCode      String   @default("")  // QR data: admission ID
```

**Features:**
- Generate QR code on admission (encodes admission ID)
- Print QR on patient wristband + file cover
- Scan QR to instantly pull up patient in nurse/receptionist dashboard
- QR reader component (uses device camera via `html5-qrcode` library)

### 10.2 — Certificate Templates

**Add `MedicalCertificate` model:**
```prisma
model MedicalCertificate {
  id          String   @id @default(cuid())
  patientId   String
  doctorId    String
  hospitalId  String
  type        String   // Medical, Fitness, Disability, Death, Birth
  issuedDate  DateTime @default(now())
  validFrom   DateTime
  validTo     DateTime?
  content     String   @default("")  // certificate body text
  diagnosis   String   @default("")
  remarks     String   @default("")
  createdAt   DateTime @default(now())
}
```

**Pages:**
- Doctor → Certificates → New (select patient, type, fill details) → Generate PDF
- Patient → My Certificates → Download

### 10.3 — Package / Tariff Management

**Add `SurgeryPackage` model:**
```prisma
model SurgeryPackage {
  id          String   @id @default(cuid())
  hospitalId  String
  name        String   // "Cardiac Bypass Package", "Maternity Package"
  category    String   // Surgery, Maternity, Health Checkup
  totalAmount Float    @default(0)
  includes    String   @default("[]")  // JSON: ["Surgeon fee", "OT charges", "Room rent", "Medicines"]
  excludes    String   @default("[]")  // JSON: ["Implants", "Blood", "ICU stay >3 days"]
  validFrom   DateTime
  validTo     DateTime?
  status      String   @default("Active")
}
```

**Pages:** Hospital → Packages → List/create/edit, link to billing (auto-create bill line items from package)

---

## PHASE 11: ABDM INTEGRATION (Weeks 10-13)

**What:** Ayushman Bharat Digital Mission — India's national health infrastructure. Connect to the ABDM network so patient records can be linked via Health ID.

### 11.1 — ABDM Health ID Linking

**Add `AbhaRecord` model:**
```prisma
model AbhaRecord {
  id              String   @id @default(cuid())
  patientId       String   @unique
  abhaNumber      String   @unique  // 14-digit Health ID
  abhaAddress     String   @default("")  // username@abdm
  nameAsPerAbha   String   @default("")
  genderAsPerAbha String   @default("")
  dobAsPerAbha    DateTime?
  mobileAsPerAbha String   @default("")
  linkedAt        DateTime @default(now())
  createdAt       DateTime @default(now())

  patient         User     @relation(fields: [patientId], references: [id], onDelete: Cascade)
}
```

### 11.2 — ABDM API Integration

**Create `src/lib/abdm.ts`:**
- `createAbha()` — Generate new Health ID via ABDM API
- `linkAbha(abhaNumber)` — Link existing Health ID to patient
- `fetchPatientRecords(abhaNumber)` — Pull records from ABDM network
- `pushRecord(abhaNumber, record)` — Push prescription/lab report to ABDM

**API routes:**
- `POST /api/abdm/create-abha` — Generate Health ID
- `POST /api/abdm/link-abha` — Link existing Health ID to patient
- `GET /api/abdm/records/[abhaNumber]` — Fetch patient's ABDM records
- `POST /api/abdm/push-prescription/[prescriptionId]` — Push to ABDM

**Pages:**
- Patient → My Health ID → Create/Link ABHA
- Doctor → Prescription → "Push to ABDM" button (after finalizing)

### 11.3 — FHIR R4 Compatibility (Future)

Convert internal data models to FHIR R4 resources for interoperability:
- `Patient` → FHIR Patient resource
- `Prescription` → FHIR MedicationRequest
- `LabReport` → FHIR DiagnosticReport
- `VitalRecord` → FHIR Observation

---

## PHASE 12: POLISH & MOBILE PWA (Weeks 14-15)

### 12.1 — PWA Optimization

- [ ] Service worker caching strategy (currently basic)
- [ ] Offline-first for critical pages (nurse vitals, doctor queue)
- [ ] Push notifications (web push API)
- [ ] Installable on mobile (already have manifest.json)
- [ ] App icons for all sizes

### 12.2 — Mobile App Shell

- [ ] Bottom navigation for all roles (currently only nurse/pharmacist/lab-tech)
- [ ] Pull-to-refresh on all list pages
- [ ] Swipeable list items (already have SwipeableItem component)
- [ ] Touch-optimized forms (bigger inputs, better keyboards)

### 12.3 — Dark Mode Polish

- [ ] Audit all pages for dark mode contrast
- [ ] Fix any white-on-white or black-on-black issues
- [ ] Add system preference detection (already have next-themes)
- [ ] Per-user theme preference (store in `User.settingsJson`)

### 12.4 — Accessibility (WCAG 2.1 AA)

- [ ] All interactive elements keyboard accessible
- [ ] Screen reader labels on all form fields
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] ARIA roles on complex widgets (tables, dialogs, tabs)

### 12.5 — Performance Optimization

- [ ] Lazy-load heavy components (charts, print templates)
- [ ] Image optimization (next/image for all avatars/gallery)
- [ ] Database query optimization (add missing indexes based on EXPLAIN ANALYZE)
- [ ] Bundle analysis (`bun run build` → check bundle size)
- [ ] Code splitting per dashboard route

---

## EXECUTION CHECKLIST

### Week 1: Technical Debt (Phase 6)
- [ ] 6.1 Zod backfill (priority modules)
- [ ] 6.2 Rate limiting (Upstash Redis)
- [ ] 6.3 OTP store to database
- [ ] 6.4 Print component types
- [ ] 6.5 Socket leak fix
- [ ] 6.6 CI/CD pipeline

### Week 2: Report Export (Phase 7)
- [ ] 7.1 PDF report engine (@react-pdf/renderer)
- [ ] 7.2 Excel export (exceljs)
- [ ] 7.3 Scheduled reports (cron)

### Weeks 3-6: HR/Payroll (Phase 8)
- [ ] 8.1 Schema (7 models)
- [ ] 8.2 API routes (16)
- [ ] 8.3 Frontend pages (10)
- [ ] 8.4 Payroll processing logic
- [ ] 8.5 Statutory compliance (PF/ESI/TDS)
- [ ] 8.6 Payslip PDF

### Week 7: Production Deploy (Phase 9)
- [ ] 9.1 Pre-deployment checklist
- [ ] 9.2 Razorpay production
- [ ] 9.3 MSG91 setup
- [ ] 9.4 Gupshup WhatsApp
- [ ] 9.5 Vercel deploy
- [ ] 9.6 Mini-services deploy (Railway)
- [ ] 9.7 Backup strategy

### Weeks 8-9: Advanced Features (Phase 10)
- [ ] 10.1 QR code patient ID
- [ ] 10.2 Certificate templates
- [ ] 10.3 Package/tariff management

### Weeks 10-13: ABDM (Phase 11)
- [ ] 11.1 Health ID linking
- [ ] 11.2 ABDM API integration
- [ ] 11.3 FHIR compatibility (stretch)

### Weeks 14-15: Polish (Phase 12)
- [ ] 12.1 PWA optimization
- [ ] 12.2 Mobile app shell
- [ ] 12.3 Dark mode polish
- [ ] 12.4 Accessibility audit
- [ ] 12.5 Performance optimization

### Week 16: Buffer
- [ ] Bug fixes
- [ ] User testing
- [ ] Documentation
- [ ] Final production verification

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| ABDM API approval takes long | High | Medium | Start Phase 11 early, parallel with 8-9 |
| MSG91 sender ID rejection | Medium | Low | Use default sender ID, apply for custom later |
| Razorpay KYC delays | Medium | High | Start KYC immediately (Week 1), use test mode until approved |
| HR statutory complexity (PF/ESI) | High | High | Consult with CA, keep calculations simplified for V1 |
| PostgreSQL connection limits (Supabase free tier = 60) | Medium | Medium | Use connection pooler (PgBouncer), monitor connections |
| Vercel serverless timeout (10s on free tier) | Medium | Medium | Keep heavy queries optimized, consider Railway for long-running |

---

## SUCCESS METRICS

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| Hospital onboarded | 1 (pilot) | 5 |
| Daily active users | 20 | 100 |
| Appointments/month | 500 | 2000 |
| IPD admissions/month | 50 | 200 |
| Online payments/month | ₹2L | ₹10L |
| Insurance claims/month | 10 | 50 |
| System uptime | 99% | 99.5% |
| Page load time | < 3s | < 2s |

---

## DOCUMENTATION PLAN

| Document | Purpose | When |
|----------|---------|------|
| `DEPLOYMENT.md` | Step-by-step production deploy guide | Phase 9 |
| `API.md` | API reference for all 320+ routes | Phase 9 |
| `USER_MANUAL.md` | End-user guide for each role | Phase 12 |
| `HR_COMPLIANCE.md` | PF/ESI/TDS calculation details | Phase 8 |
| `ABDM_INTEGRATION.md` | Health ID setup guide | Phase 11 |

---

## WHAT TO START WITH (Tomorrow)

**Immediate next session:**
1. Phase 6.1 — Zod validation backfill (start with prescription + auth routes)
2. Phase 6.3 — OTP store to database (quick security win)
3. Phase 6.5 — Socket leak fix (2-hour fix, high impact)

These are the highest-impact, lowest-effort items that improve security and reliability immediately.
