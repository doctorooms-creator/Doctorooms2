# Doctorooms — Next Development Plan (v3)

> **Created:** Based on deep architectural analysis of 72 models, 262 API routes, 9 role dashboards.
> **Goal:** Transform from a "strong clinical HMS" (~65% complete) into a "complete hospital enterprise system" by filling the 0% coverage modules.
> **Duration:** 3 months (12 weeks), 1 developer.
> **Execution order:** Phase 0 → 1 → 2 → 3 → 4 → 5 (strictly sequential; each phase builds on prior).

---

## PHASE OVERVIEW

| Phase | Module | Complexity | Time | Priority | Unblocks |
|-------|--------|------------|------|----------|----------|
| **0** | Immediate Fixes | S | 1 day | P0 | Billing dialog, session security |
| **1** | Diet Module UI | S | 3 days | P1 | Completes nursing workflow |
| **2** | Razorpay + SMS/WhatsApp | M | 2 weeks | P1 | Online payments, patient comms |
| **3** | Expense Management | L | 3 weeks | P1 | True P&L reporting |
| **4** | Audit Trails + Consent | M | 2 weeks | P2 | NABH compliance, DPDP Act |
| **5** | Insurance / TPA (Phase 1) | XL | 6 weeks | P1 | Cashless insurance flow |

**Total:** ~14 weeks (3.5 months) with buffer. Phases 3+4 can overlap if 2 developers.

---

## PHASE 0: IMMEDIATE FIXES (Day 1)

### 0.1 — Fix broken hospital billing dialog (P0 bug)

**Problem:** `src/app/dashboard/hospital/billing/ipd/client.tsx:96` calls `fetch('/api/ipd-admissions?status=Admitted&limit=100')` — that route does NOT exist (404). The "Generate Bill" dialog throws "Failed to load admitted patients."

**Fix:**
```typescript
// File: src/app/dashboard/hospital/billing/ipd/client.tsx
// Line 96: Change from:
const admRes = await fetch('/api/ipd-admissions?status=Admitted&limit=100')
// To:
const admRes = await fetch('/api/dashboard/receptionist/ipd?status=Admitted&limit=100')
```

Also remove the dead first fetch on line 94 (`/api/ipd-bills?status=Admitted&_forGenerate=1`) — its response is never used (shadowed by second fetch).

**Verify:** Login as Hospital → Billing → IPD → click "Generate Bill" → dialog loads admitted patient list without error.

### 0.2 — Session security hardening (P0)

**Problem:** `doctorooms_session` cookie = `user.id` (a CUID). If leaked, permanent impersonation. No session table, no revocation, no `middleware.ts`.

**Tasks:**
1. Add `Session` model to `prisma/schema.prisma`:
   ```prisma
   model Session {
     id          String   @id @default(cuid())
     token       String   @unique                    // random 64-char hex
     userId      String
     expiresAt   DateTime
     ipAddress   String   @default("")
     userAgent   String   @default("")
     createdAt   DateTime @default(now())
     revokedAt   DateTime?

     user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@index([userId])
     @@index([expiresAt])
   }
   ```
2. Add `sessions Session[]` back-relation to `User` model.
3. Run `bun run db:push`.
4. Update `src/app/api/auth/login/route.ts`:
   - After bcrypt verify, create `Session.create({ token: randomBytes(32).toString('hex'), userId, expiresAt: now+7days, ipAddress, userAgent })`
   - Set cookie `doctorooms_session = session.token` (NOT user.id)
5. Update `src/lib/api-auth.ts` `getAuthUser()`:
   - Replace `db.user.findUnique({ where: { id: sessionId } })` with:
     ```typescript
     const session = await db.session.findUnique({
       where: { token: sessionId },
       include: { user: true },
     })
     if (!session || session.expiresAt < new Date() || session.revokedAt) return null
     if (session.user.status !== 'Active') return null
     return mapUser(session.user)
     ```
6. Update `src/app/api/auth/logout/route.ts`:
   - `Session.update({ where: { token }, data: { revokedAt: new Date() } })` then clear cookie.
7. Create `src/middleware.ts` for server-side route protection:
   ```typescript
   // Protects /dashboard/* routes at the framework level (not just per-route requireRole)
   // Reads doctorooms_session cookie, checks session table, redirects to /login if invalid
   ```
   - Note: middleware runs on Edge runtime — can't use Prisma directly. Use a lightweight session lookup via `fetch('/api/auth/verify-session')` or use a JWT instead of DB-lookup session.
   - **Simpler alternative:** Use a signed JWT (no DB lookup in middleware) — `token = sign({userId, role, exp}, NEXTAUTH_SECRET)`. Middleware just verifies the signature.

**Verify:**
- Login works → cookie value is now a random token (not a CUID)
- Refresh keeps session → `/api/auth/me` returns user
- Logout → cookie cleared, session revoked in DB
- Direct cookie copy to another browser → works (until expiry), but logout revokes it

### 0.3 — Socket auth hardening

**Problem:** Mini-services trust client-declared `{userId, role}` in socket handshake. Any client can claim any identity.

**Fix:** Pass the session token in socket auth, verify server-side:
1. `src/hooks/useSocket.ts`: add `token` from cookie to `auth` payload
   ```typescript
   // Read the session cookie value (httpOnly cookies aren't accessible from JS,
   // so we need to fetch it via /api/auth/socket-token which returns a short-lived
   // signed token for socket auth)
   const socket = io('/?XTransformPort=3005', {
     auth: { socketToken: await getSocketToken() },
   })
   ```
2. Add `GET /api/auth/socket-token` route — returns a short-lived (5 min) signed JWT with `{userId, role, hospitalId}`.
3. Update `mini-services/notification-service/index.ts` middleware:
   ```typescript
   io.use((socket, next) => {
     const { socketToken } = socket.handshake.auth
     try {
       const payload = jwt.verify(socketToken, process.env.NEXTAUTH_SECRET!)
       socket.data = { userId: payload.userId, role: payload.role, hospitalId: payload.hospitalId }
       next()
     } catch {
       next(new Error('Invalid socket token'))
     }
   })
   ```

**Verify:** A client with a forged `userId` in handshake is rejected by the notification service.

---

## PHASE 1: DIET MODULE UI (Days 2-4)

**Why:** The `DietOrder` model + `/api/diet-orders` + `/api/diet-orders/[id]/stop` APIs are 100% built but **zero UI pages exist**. Lowest-hanging fruit — completes the IPD nursing workflow.

### 1.1 — Nurse Diet Orders Page

**Route:** `src/app/dashboard/nurse/diet-orders/page.tsx` + `client.tsx`

**Features:**
- Table of active diet orders for the nurse's ward (filter by `status=Active`)
- Columns: Patient Name, Bed, Diet Type, Meal Type, Instructions, Start Date, Status, Actions
- "New Diet Order" button → Dialog with form:
  - Patient select (admission dropdown, filtered to nurse's ward admitted patients)
  - Diet Type (select: Regular, Soft, Liquid, Clear Liquid, Diabetic, Low Salt, High Protein, NPO)
  - Meal Type (select: Breakfast, Lunch, Dinner, Snacks, All)
  - Instructions (textarea)
  - Start Date (default: now)
- "Stop" action per row → Dialog with stop reason → calls `PUT /api/diet-orders/[id]/stop`
- Color-coded status badges (Active=teal, Stopped=slate)

**API used:** `GET /api/diet-orders?admissionId=` (already exists), `POST /api/diet-orders` (exists), `PUT /api/diet-orders/[id]/stop` (exists)

### 1.2 — Nurse Patient Detail: Diet Tab

**Route:** `src/app/dashboard/nurse/patients/[admissionId]/client.tsx`

**Change:** Add a "Diet" tab alongside Overview/Vitals/Medicines/Investigations/History.

**Content:**
- Active diet order card (diet type, meal type, instructions, started when)
- Diet history table (all diet orders for this admission, including stopped ones)
- "New Diet Order" button (same dialog as 1.1, pre-filled with admissionId)

### 1.3 — Patient Diet View

**Route:** `src/app/dashboard/patient/diet/page.tsx` (if patient has an active IPD admission)

**Features:**
- Shows current diet plan (if patient is admitted)
- Diet history
- Read-only (patients can see but not edit)

### 1.4 — Sidebar Update

**File:** `src/lib/sidebar-config.ts`

Add to `nurse` sidebar:
```typescript
{ label: 'Diet Orders', href: '/dashboard/nurse/diet-orders', icon: Utensils },
```
(Between "Ward View" and "Shift Handover")

### 1.5 — Seed Diet Data

Update `src/scripts/seed-test-data.ts` to add 2 diet orders for the seeded IPD admission (Rahul Verma):
- Regular diet, Lunch, "Low spice, soft diet"
- Diabetic diet, All meals, "1500 kcal, 55g protein"

### Verification
- [ ] Nurse can create a diet order from the diet-orders page
- [ ] Nurse can create a diet order from the patient detail diet tab
- [ ] Nurse can stop a diet order with a reason
- [ ] Diet order appears in patient detail → Diet tab
- [ ] Patient can view their diet plan (if admitted)
- [ ] `bun run lint` passes

---

## PHASE 2: RAZORPAY + SMS/WHATSAPP (Weeks 2-3)

**Why:** Currently all payments are manual cash recording. No online payment, no SMS reminders. This is the highest patient-facing value.

### 2.1 — Schema Changes

**Add to `prisma/schema.prisma`:**

```prisma
// ============ PAYMENTS: GATEWAY TRANSACTION ============

model PaymentGatewayTransaction {
  id              String   @id @default(cuid())
  hospitalId      String
  billId          String?                    // IPD bill
  opdBillId       String?                    // OPD bill
  advanceId       String?                    // Patient advance
  bookingId       String?                    // OPD booking (for consultation fee)

  razorpayOrderId     String?  @unique
  razorpayPaymentId   String?
  razorpaySignature   String?

  amount          Float    @default(0)
  currency        String   @default("INR")
  status          String   @default("Created")
  // Created → Authorized → Captured → Failed → Refunded

  gatewayResponse String   @default("{}")    // JSON: full Razorpay response
  errorMessage    String   @default("")

  createdBy       String                     // userId who initiated
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  hospital        Hospital  @relation(fields: [hospitalId], references: [id], onDelete: Cascade)

  @@index([hospitalId, status])
  @@index([billId])
  @@index([bookingId])
}

// ============ NOTIFICATIONS: DELIVERY LOG ============

model NotificationLog {
  id              String   @id @default(cuid())
  notificationId  String?
  userId          String?                     // recipient user

  channel         String   @default("InApp")
  // InApp, SMS, WhatsApp, Email

  recipient       String   @default("")       // phone number or email
  content         String   @default("")       // message body
  templateName    String   @default("")       // which template was used

  status          String   @default("Queued")
  // Queued → Sent → Delivered → Failed

  externalId      String   @default("")       // MSG91/Razorpay message ID
  errorMessage    String   @default("")

  sentAt          DateTime?
  deliveredAt     DateTime?

  createdAt       DateTime @default(now())

  @@index([userId, channel, status])
  @@index([status, createdAt])
}

// ============ NOTIFICATION TEMPLATES ============

model NotificationTemplate {
  id              String   @id @default(cuid())
  hospitalId      String?                     // null = global template

  eventType       String   @default("")       // booking_confirmed, vital_critical, etc.
  channel         String   @default("SMS")     // SMS, WhatsApp, Email

  templateName    String   @default("")
  templateBody    String   @default("")        // with {{placeholders}}
  // e.g. "Dear {{patientName}}, your appointment with {{doctorName}} is confirmed for {{date}}. Token: {{tokenNumber}}."

  senderId        String   @default("DOCTRM")  // SMS sender ID
  whatsappTemplateId String @default("")        // approved WhatsApp template ID

  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([hospitalId, eventType, channel])
}
```

**Add back-relations** to `Hospital` model: `paymentTransactions PaymentGatewayTransaction[]`

Run `bun run db:push && bun run db:generate`.

### 2.2 — Razorpay Integration

**Install:** `bun add razorpay`

**Create `src/lib/razorpay.ts`:**
```typescript
import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createRazorpayOrder(amount: number, receipt: string, notes: Record<string, string>) {
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt,
    notes,
  })
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expected === signature
}
```

**Add to `.env`:**
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

**API Routes:**

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/payments/razorpay/create-order` | patient, receptionist, hospital | Create Razorpay order for bill/advance/consultation. Body: `{ type: 'ipd-bill' \| 'opd-bill' \| 'advance' \| 'consultation', entityId, amount }`. Returns `{ orderId, amount, currency, keyId }`. |
| POST | `/api/payments/razorpay/verify` | patient, receptionist, hospital | Verify payment signature, create `BillPayment`/`PatientAdvance` row, update `PaymentGatewayTransaction`. Body: `{ orderId, paymentId, signature, entityId }`. |
| POST | `/api/payments/razorpay/webhook` | public (Razorpay server) | Webhook for async payment status updates. Verifies webhook signature. |

**Frontend — Patient "Pay Now" flow:**

**Route:** `src/app/dashboard/patient/bills/page.tsx` (new) or extend existing health-records.

**Component:** `src/components/payment/RazorpayCheckout.tsx`
```typescript
'use client'
// Loads Razorpay checkout.js script
// On click: POST /api/payments/razorpay/create-order → get orderId
// Open Razorpay modal with options { key, amount, order_id, name, description, handler }
// On success: POST /api/payments/razorpay/verify → invalidate bill queries
// On failure: show error toast
```

**Pages to add "Pay Now" button:**
- Patient → Health Records → Bills (IPD + OPD) → "Pay Now" button per unpaid bill
- Patient → Appointments → unpaid consultation → "Pay Consultation Fee"
- Receptionist → Billing → "Collect Online" option (generates payment link sent to patient's phone)

### 2.3 — SMS / WhatsApp Integration

**Install:** `bun add msg91-sdk` (or use fetch directly to MSG91 REST API)

**Create `src/lib/notify-channels.ts`:**
```typescript
import { db } from '@/lib/db'
import { NotificationLog } from '@prisma/client'

/** Send SMS via MSG91 */
async function sendSMS(phone: string, message: string, templateName: string, userId?: string) {
  // Check if SMS is enabled for this hospital
  // Call MSG91 API: POST https://api.msg91.com/api/v5/flow/
  // Log to NotificationLog
}

/** Send WhatsApp via Gupshup API */
async function sendWhatsApp(phone: string, templateId: string, params: Record<string, string>, userId?: string) {
  // Call Gupshup API
  // Log to NotificationLog
}

/** Unified: send via all enabled channels for an event */
export async function sendNotification(
  userId: string,
  eventType: string,
  data: Record<string, string>,
  channels: ('SMS' | 'WhatsApp' | 'InApp')[]
) {
  // 1. Fetch hospital's NotificationTemplate for this eventType + channel
  // 2. Render template with data (replace {{placeholders}})
  // 3. For each channel: call sendSMS/sendWhatsApp/createNotification
  // 4. Log to NotificationLog
}
```

**Update `src/lib/emit-notification.ts` `createNotification()` helper:**
- After DB write + socket emit, check if the event has SMS/WhatsApp templates configured
- If yes, call `sendNotification()` with the patient's phone number
- Fire-and-forget (don't block API response)

**Events to wire up (with default templates):**

| Event | Channel | Recipient | Template |
|-------|---------|-----------|----------|
| `booking_confirmed` | SMS | Patient | "Dear {{patientName}}, your appointment with {{doctorName}} is confirmed for {{date}} at {{time}}. Token: {{tokenNumber}}. - {{hospitalName}}" |
| `consultation_started` | SMS | Patient | "Your consultation with {{doctorName}} has started. Please proceed to the cabin. Token: {{tokenNumber}}" |
| `vital_critical` | SMS + WhatsApp | Doctor | "CRITICAL: Patient {{patientName}} (Bed {{bedNumber}}) - {{vitalAlerts}}. Requires immediate attention." |
| `lab_result_ready` | WhatsApp | Patient | "Your lab report {{testName}} is ready. View at: {{reportUrl}}" |
| `bill_generated` | SMS | Patient | "Your hospital bill has been generated. Amount: ₹{{amount}}. Pay online: {{paymentLink}}" |
| `payment_received` | SMS | Patient | "Payment of ₹{{amount}} received. Receipt No: {{receiptNo}}. Thank you. - {{hospitalName}}" |
| `discharge_advised` | WhatsApp | Patient + Family | "Discharge summary ready for {{patientName}}. Download: {{url}}" |
| `appointment_reminder` | SMS | Patient | "Reminder: Appointment with {{doctorName}} tomorrow at {{time}}. Token: {{tokenNumber}}" |

**Cron job for appointment reminders:**
- Create `src/scripts/send-reminders.ts`
- Run daily at 8 AM IST via cron: `0 8 * * * bun run src/scripts/send-reminders.ts`
- Queries tomorrow's approved bookings, sends SMS to each patient

### 2.4 — Hospital Notification Settings Page

**Route:** `src/app/dashboard/hospital/notification-settings/page.tsx` + `client.tsx`

**Features:**
- Toggle SMS/WhatsApp on/off per event type
- Configure MSG91 API key + sender ID
- Configure Gupshup API key + template IDs
- Test send button (sends a test SMS to admin's phone)
- View NotificationLog (delivery status, failures)

### 2.5 — Sidebar Updates

Add to `hospital` sidebar:
```typescript
{
  label: 'Payments',
  href: '/dashboard/hospital/payments',
  icon: CreditCard,
  children: [
    { label: 'Gateway Settings', href: '/dashboard/hospital/payments/settings', icon: Settings },
    { label: 'Transactions', href: '/dashboard/hospital/payments/transactions', icon: Receipt },
  ],
},
{ label: 'Notification Settings', href: '/dashboard/hospital/notification-settings', icon: Bell },
```

### Verification
- [ ] Patient can pay IPD bill online via Razorpay (test mode)
- [ ] Payment success → `BillPayment` created → bill status updates to Paid
- [ ] Payment failure → error shown, no DB write
- [ ] Booking confirmation sends SMS to patient
- [ ] Critical vital sends SMS to attending doctor
- [ ] Hospital can configure SMS/WhatsApp templates
- [ ] NotificationLog shows delivery status
- [ ] `bun run lint` passes

---

## PHASE 3: EXPENSE MANAGEMENT (Weeks 4-6)

**Why:** The P&L report currently shows 100% profit (revenue only, zero expenses). Hospital owners can't see true profitability.

### 3.1 — Schema Changes

**Add to `prisma/schema.prisma`:**

```prisma
// ============ EXPENSES: VENDOR ============

model Vendor {
  id              String   @id @default(cuid())
  hospitalId      String
  name            String
  category        String   @default("")
  // Supplier, Utility, Service Provider, Contractor, Equipment
  gstNo           String   @default("")
  panNo           String   @default("")
  contactPerson   String   @default("")
  phoneNo         String   @default("")
  email           String   @default("")
  address         String   @default("")
  city            String   @default("")
  state           String   @default("")
  pincode         String   @default("")
  paymentTerms    String   @default("")       // Net 30, Net 60, Advance
  bankAccountNo   String   @default("")
  bankIfsc        String   @default("")
  status          String   @default("Active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  hospital        Hospital        @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  expenses        Expense[]
  payments        VendorPayment[]
  purchaseOrders  PurchaseOrder[]

  @@index([hospitalId, status])
}

// ============ EXPENSES: EXPENSE CATEGORY ============

model ExpenseCategory {
  id              String   @id @default(cuid())
  hospitalId      String
  name            String
  type            String   @default("Operating")
  // Operating: Salaries, Rent, Utilities, Maintenance, Consumables, Marketing
  // Capital: Equipment, Furniture, Building, Vehicles
  description     String   @default("")
  status          String   @default("Active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  hospital        Hospital  @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  expenses        Expense[]

  @@index([hospitalId, type])
}

// ============ EXPENSES: EXPENSE ============

model Expense {
  id              String   @id @default(cuid())
  hospitalId      String
  categoryId      String
  vendorId        String?
  expenseNo       String   @default("")       // EXP-2025-000001
  expenseDate     DateTime @default(now())
  amount          Float    @default(0)
  taxAmount       Float    @default(0)
  totalAmount     Float    @default(0)

  paymentMode     String   @default("Cash")
  // Cash, Bank, UPI, Cheque, NEFT
  paymentRef      String   @default("")       // cheque no, transaction id
  paymentDate     DateTime?

  description     String   @default("")
  receiptUrl      String   @default("")       // uploaded bill/receipt image

  // Cost center allocation
  costCenterType  String   @default("")       // Department, Ward, OT, General
  costCenterId    String?                       // Department.id or Ward.id

  status          String   @default("Pending")
  // Pending → Approved → Paid → Cancelled

  approvedBy      String?
  approvedAt      DateTime?
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  hospital        Hospital        @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  category        ExpenseCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  vendor          Vendor?         @relation(fields: [vendorId], references: [id], onDelete: SetNull)

  @@index([hospitalId, status])
  @@index([categoryId])
  @@index([vendorId])
  @@index([expenseDate])
}

// ============ EXPENSES: VENDOR PAYMENT ============

model VendorPayment {
  id              String   @id @default(cuid())
  hospitalId      String
  vendorId        String
  expenseId       String?                    // if paying against a specific expense

  paymentNo       String   @default("")       // VP-2025-000001
  amount          Float    @default(0)
  paymentMode     String   @default("Bank")
  paymentRef      String   @default("")
  paymentDate     DateTime @default(now())
  notes           String   @default("")

  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  hospital        Hospital @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  vendor          Vendor   @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  expense         Expense? @relation(fields: [expenseId], references: [id], onDelete: SetNull)

  @@index([hospitalId, paymentDate])
  @@index([vendorId])
}
```

**Add back-relations to `Hospital`:**
```prisma
vendors         Vendor[]
expenseCategories ExpenseCategory[]
expenses        Expense[]
vendorPayments  VendorPayment[]
```

**Add back-relation to `PurchaseOrder`:** `vendor Vendor? @relation(fields: [vendorId], references: [id], onDelete: SetNull)` + `vendorId String?` field.

Run `bun run db:push && bun run db:generate`.

### 3.2 — API Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET, POST | `/api/vendors` | hospital, admin | List/create vendors |
| GET, PUT, DELETE | `/api/vendors/[id]` | hospital, admin | CRUD single vendor |
| GET, POST | `/api/expense-categories` | hospital, admin | List/create categories |
| GET, PUT | `/api/expense-categories/[id]` | hospital, admin | Update category |
| GET, POST | `/api/expenses` | hospital, admin | List/create expenses |
| GET, PUT | `/api/expenses/[id]` | hospital, admin | Get/update expense |
| POST | `/api/expenses/[id]/approve` | hospital, admin | Approve expense |
| POST | `/api/expenses/[id]/pay` | hospital, admin | Mark as paid + create VendorPayment |
| GET, POST | `/api/vendor-payments` | hospital, admin | List/create vendor payments |
| GET | `/api/reports/financial/profit-loss` | hospital, admin | **REWRITE** — subtract expenses from revenue |
| GET | `/api/reports/financial/expense-by-category` | hospital, admin | Expense breakdown pie chart data |
| GET | `/api/reports/financial/expense-trend` | hospital, admin | Monthly expense trend line |

**Expense number generator** (add to `src/lib/expense-utils.ts`):
```typescript
export async function generateExpenseNo(hospitalId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `EXP-${year}-`
  return db.$transaction(async (tx) => {
    const count = await tx.expense.count({
      where: { hospitalId, expenseNo: { startsWith: prefix } },
    })
    return `${prefix}${String(count + 1).padStart(6, '0')}`
  })
}
```

### 3.3 — Frontend Pages

**Routes under `src/app/dashboard/hospital/expenses/`:**

| Route | File | Features |
|-------|------|----------|
| `/dashboard/hospital/expenses` | `page.tsx` + `client.tsx` | Expense list with filters (date range, category, vendor, status), pagination, summary cards (total pending, total paid this month), "New Expense" button |
| `/dashboard/hospital/expenses/new` | `page.tsx` + `client.tsx` | New expense form: category select, vendor select (optional), amount, tax, payment mode, date, description, receipt upload, cost center allocation |
| `/dashboard/hospital/expenses/[id]` | `page.tsx` + `client.tsx` | Expense detail: all fields, receipt image viewer, approve/pay buttons, audit trail |
| `/dashboard/hospital/vendors` | `page.tsx` + `client.tsx` | Vendor master list + create/edit dialog |
| `/dashboard/hospital/vendor-payments` | `page.tsx` + `client.tsx` | Vendor payment list + "Record Payment" dialog |
| `/dashboard/hospital/reports/profit-loss` | `page.tsx` + `client.tsx` | **REWRITE** existing — now shows revenue vs expenses vs net profit, with monthly comparison chart |

**Receipt upload:** Use existing Cloudinary integration (`src/lib/cloudinary.ts`) for receipt image uploads.

### 3.4 — Rewrite P&L Report

**File:** `src/app/api/reports/financial/profit-loss/route.ts` (rewrite)

```typescript
// Query parameters: fromDate, toDate, hospitalId
// Revenue: SUM(BillPayment.amount) + SUM(OpdBill.totalAmount) in date range
// Expenses: SUM(Expense.totalAmount WHERE status='Paid' AND paymentDate in range)
// Gross Profit = Revenue - Expenses
// Group by month for trend chart
// Group by category for expense breakdown
// Return: { revenue, expenses, netProfit, monthlyData: [{month, revenue, expenses, profit}], expenseByCategory: [{category, amount}] }
```

### 3.5 — Sidebar Updates

Add to `hospital` sidebar:
```typescript
{
  label: 'Expenses',
  href: '/dashboard/hospital/expenses',
  icon: Wallet,
  children: [
    { label: 'All Expenses', href: '/dashboard/hospital/expenses', icon: Receipt },
    { label: 'New Expense', href: '/dashboard/hospital/expenses/new', icon: Plus },
    { label: 'Vendors', href: '/dashboard/hospital/vendors', icon: Users },
    { label: 'Vendor Payments', href: '/dashboard/hospital/vendor-payments', icon: CreditCard },
  ],
},
```

Update `Reports` section to include "Profit & Loss" and "Expense by Category".

### 3.6 — Seed Expense Data

Update `src/scripts/seed-test-data.ts`:
- 3 vendors (pharmacy supplier, electricity board, security agency)
- 5 expense categories (Salaries, Rent, Utilities, Consumables, Maintenance)
- 10 expenses across the month (mix of Pending/Approved/Paid)
- 3 vendor payments

### Verification
- [ ] Hospital can create a vendor
- [ ] Hospital can create an expense with receipt upload
- [ ] Hospital can approve an expense
- [ ] Hospital can record a vendor payment
- [ ] P&L report shows revenue, expenses, and net profit
- [ ] Expense by category pie chart renders
- [ ] Expense trend line chart renders
- [ ] `bun run lint` passes

---

## PHASE 4: AUDIT TRAILS + CONSENT (Weeks 7-8)

**Why:** Required for NABH accreditation and DPDP Act 2023 compliance.

### 4.1 — Schema Changes

**Add to `prisma/schema.prisma`:**

```prisma
// ============ COMPLIANCE: AUDIT LOG ============

model AuditLog {
  id              String   @id @default(cuid())
  userId          String?                     // who performed the action
  userRole        String   @default("")
  userName        String   @default("")

  action          String   @default("")
  // Create, Update, Delete, View, Login, Logout

  entityType      String   @default("")       // model name: User, Booking, Prescription, etc.
  entityId        String   @default("")       // record ID

  beforeJson      String   @default("{}")     // state before change (for Update/Delete)
  afterJson       String   @default("{}")     // state after change (for Create/Update)

  ipAddress       String   @default("")
  userAgent       String   @default("")

  timestamp       DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId, timestamp])
  @@index([action, timestamp])
}

// ============ COMPLIANCE: PATIENT CONSENT ============

model PatientConsent {
  id              String   @id @default(cuid())
  admissionId     String?
  bookingId       String?
  patientId       String

  consentType     String   @default("")
  // Surgery, Anesthesia, BloodTransfusion, HIVTest, Teleconsult, General, Discharge

  documentUrl     String   @default("")       // signed consent PDF/image
  templateName    String   @default("")       // which template was used

  signedByPatient Boolean  @default(false)
  signedByWitness Boolean  @default(false)
  witnessName     String   @default("")
  witnessRelation String   @default("")       // relation to patient

  signedAt        DateTime?
  validUntil      DateTime?

  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([patientId])
  @@index([admissionId])
  @@index([consentType])
}
```

Run `bun run db:push && bun run db:generate`.

### 4.2 — Audit Log Helper

**Create `src/lib/audit.ts`:**
```typescript
import { db } from '@/lib/db'

export async function logAudit(params: {
  userId?: string
  userRole?: string
  userName?: string
  action: 'Create' | 'Update' | 'Delete' | 'View' | 'Login' | 'Logout'
  entityType: string
  entityId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  req?: NextRequest
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId || null,
        userRole: params.userRole || '',
        userName: params.userName || '',
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        beforeJson: JSON.stringify(params.before || {}),
        afterJson: JSON.stringify(params.after || {}),
        ipAddress: params.req?.headers.get('x-forwarded-for') || '',
        userAgent: params.req?.headers.get('user-agent') || '',
      },
    })
  } catch {
    // Never let audit logging break business logic
  }
}
```

### 4.3 — Wire Audit Logging into Key Routes

Add `logAudit()` calls to these high-value routes (not every route — focus on sensitive operations):

| Route | Action Logged |
|-------|---------------|
| `POST /api/auth/login` | Login (userId, ipAddress) |
| `POST /api/auth/logout` | Logout |
| `POST /api/dashboard/admin/users/[id]/status` | Update (User status change — before/after) |
| `POST /api/ipd-admissions/[id]/discharge` | Update (admission discharge — before/after) |
| `POST /api/prescription/[id]/finalize` | Update (prescription finalized) |
| `POST /api/ipd-bills/generate` | Create (bill generated) |
| `POST /api/bill-payments` | Create (payment recorded) |
| `POST /api/lab-reports/[id]/enter-result` | Update (lab result entered — before/after) |
| `DELETE /api/doctors/[id]` | Delete (doctor deleted — before state) |

### 4.4 — Audit Log Viewer

**Route:** `src/app/dashboard/admin/audit-logs/page.tsx` + `client.tsx`

**Features:**
- Filter by: date range, user, action type, entity type
- Table: Timestamp, User, Role, Action, Entity Type, Entity ID, IP Address
- Click row → expand to see before/after JSON diff
- Export to CSV button

### 4.5 — Consent Management

**API Routes:**

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET, POST | `/api/patient-consent` | doctor, receptionist, hospital | List/create consent records |
| GET | `/api/patient-consent/[id]` | doctor, receptionist, hospital, patient | Get consent detail |
| POST | `/api/patient-consent/[id]/sign` | receptionist, hospital | Mark as signed (patient + witness) |
| POST | `/api/patient-consent/[id]/revoke` | doctor, hospital | Revoke consent |

**Pages:**

| Route | Features |
|-------|----------|
| `/dashboard/hospital/consent-templates` | Configure consent template text per type (Surgery, Anesthesia, etc.) |
| `/dashboard/receptionist/consents` | List + create consent at admission time, capture patient + witness signature (can use a simple "I agree" checkbox + witness name for now; signature pad can come later) |
| `/dashboard/patient/consents` | Patient views their signed consents |

### 4.6 — Sidebar Updates

Add to `admin` sidebar:
```typescript
{ label: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: ScrollText },
```

Add to `hospital` sidebar:
```typescript
{ label: 'Consents', href: '/dashboard/hospital/consent-templates', icon: FileSignature },
```

Add to `receptionist` sidebar:
```typescript
{ label: 'Patient Consents', href: '/dashboard/receptionist/consents', icon: FileSignature },
```

### Verification
- [ ] Login/logout creates audit log entry
- [ ] User status change creates audit log with before/after
- [ | Prescription finalize creates audit log
- [ ] Admin can view and filter audit logs
- [ ] Admin can export audit logs to CSV
- [ ] Receptionist can create a surgery consent for an IPD patient
- [ ] Patient can view their signed consents
- [ ] `bun run lint` passes

---

## PHASE 5: INSURANCE / TPA MODULE — PHASE 1 (Weeks 9-14)

**Why:** 30-60% of Indian hospital revenue is insurance-driven. This is the biggest revenue-impact module.

**Phase 1 scope:** Master data + patient insurance capture + pre-authorization + claim submission. Claim settlement tracking comes in Phase 2.

### 5.1 — Schema Changes

**Add to `prisma/schema.prisma`:**

```prisma
// ============ INSURANCE: COMPANY ============

model InsuranceCompany {
  id              String   @id @default(cuid())
  name            String
  code            String   @unique            // "STAR", "HDFCERGO", "ICICILOMBARD"
  type            String   @default("General")
  // General, Health, TPA
  contactNo       String   @default("")
  email           String   @default("")
  website         String   @default("")
  cashlessSupported Boolean @default(false)
  status          String   @default("Active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tpas            TpaMaster[]
  policies        PatientInsurancePolicy[]
  claims          InsuranceClaim[]

  @@index([status])
}

// ============ INSURANCE: TPA ============

model TpaMaster {
  id              String   @id @default(cuid())
  companyId       String
  name            String
  code            String   @default("")
  contactNo       String   @default("")
  email           String   @default("")
  preAuthEmail    String   @default("")       // for sending pre-auth requests
  preAuthApiUrl   String   @default("")       // if TPA has an API
  status          String   @default("Active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  company         InsuranceCompany @relation(fields: [companyId], references: [id], onDelete: Cascade)
  policies        PatientInsurancePolicy[]
  claims          InsuranceClaim[]

  @@index([companyId, status])
}

// ============ INSURANCE: PATIENT POLICY ============

model PatientInsurancePolicy {
  id              String   @id @default(cuid())
  patientId       String                     // User.id (patient)
  companyId       String
  tpaId           String?
  policyNo        String   @default("")
  policyType      String   @default("")
  // Individual, Family, Group, Corporate, CGHS, ESIC
  memberName      String   @default("")       // name on the policy (may differ from patient)
  memberRelation  String   @default("")       // Self, Spouse, Child, Parent
  sumInsured      Float    @default(0)
  copayPercent    Float    @default(0)        // patient's copay percentage
  roomRentLimit   Float    @default(0)        // max room rent per day covered
  validFrom       DateTime
  validTo         DateTime?
  status          String   @default("Active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  patient         User             @relation(fields: [patientId], references: [id], onDelete: Cascade)
  company         InsuranceCompany @relation(fields: [companyId], references: [id], onDelete: Restrict)
  tpa             TpaMaster?       @relation(fields: [tpaId], references: [id], onDelete: SetNull)
  preAuths        InsurancePreAuth[]
  claims          InsuranceClaim[]

  @@index([patientId, status])
  @@index([companyId])
}

// ============ INSURANCE: PRE-AUTHORIZATION ============

model InsurancePreAuth {
  id              String   @id @default(cuid())
  preAuthNo       String   @default("")       // PA-2025-000001
  admissionId     String
  policyId        String
  hospitalId      String

  requestedAmount Float    @default(0)
  approvedAmount  Float    @default(0)
  status          String   @default("Pending")
  // Pending → Submitted → Approved → PartiallyApproved → Rejected → Cancelled

  diagnosis       String   @default("")       // initial diagnosis for pre-auth
  procedures      String   @default("[]")     // JSON: planned procedures
  estimatedDays   Int      @default(1)

  submittedAt     DateTime?
  submittedBy     String?
  responseAt      DateTime?
  responseNotes   String   @default("")
  rejectionReason String   @default("")

  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  admission       IpdAdmission      @relation(fields: [admissionId], references: [id], onDelete: Cascade)
  policy          PatientInsurancePolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  hospital        Hospital          @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  claim           InsuranceClaim?

  @@index([admissionId])
  @@index([policyId, status])
  @@index([hospitalId, status])
}

// ============ INSURANCE: CLAIM ============

model InsuranceClaim {
  id              String   @id @default(cuid())
  claimNo         String   @default("")       // CLM-2025-000001
  admissionId     String
  billId          String                     // IpdBill.id
  policyId        String
  hospitalId      String
  tpaId           String?
  preAuthId       String?  @unique

  claimAmount     Float    @default(0)        // amount claimed from insurance
  approvedAmount  Float    @default(0)        // amount approved by TPA
  patientPayable  Float    @default(0)        // patient's share (copay + deductions)
  tpaPayable      Float    @default(0)        // insurance company's share

  status          String   @default("Draft")
  // Draft → Submitted → UnderReview → Approved → PartiallyApproved → Rejected → Settled

  submissionDate  DateTime?
  settlementDate  DateTime?
  settlementAmount Float   @default(0)        // actual amount received from TPA
  settlementRef   String   @default("")       // TPA payment reference

  deductions      String   @default("[]")     // JSON: [{item, claimedAmount, allowedAmount, deductionReason}]
  notes           String   @default("")

  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  admission       IpdAdmission      @relation(fields: [admissionId], references: [id], onDelete: Cascade)
  bill            IpdBill           @relation(fields: [billId], references: [id], onDelete: Restrict)
  policy          PatientInsurancePolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  hospital        Hospital          @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  tpa             TpaMaster?        @relation(fields: [tpaId], references: [id], onDelete: SetNull)
  preAuth         InsurancePreAuth? @relation(fields: [preAuthId], references: [id], onDelete: SetNull)
  lineItems       ClaimLineItem[]
  documents       InsuranceDoc[]

  @@index([admissionId])
  @@index([policyId, status])
  @@index([hospitalId, status])
  @@index([tpaId, status])
}

// ============ INSURANCE: CLAIM LINE ITEM ============

model ClaimLineItem {
  id              String   @id @default(cuid())
  claimId         String
  billLineItemId  String?                     // corresponding IpdBill line item

  itemName        String   @default("")
  claimedAmount   Float    @default(0)
  allowedAmount   Float    @default(0)
  deductionReason String   @default("")       // why TPA deducted (non-payable, limit exceeded, etc.)

  claim           InsuranceClaim @relation(fields: [claimId], references: [id], onDelete: Cascade)

  @@index([claimId])
}

// ============ INSURANCE: CLAIM DOCUMENT ============

model InsuranceDoc {
  id              String   @id @default(cuid())
  claimId         String
  docType         String   @default("")
  // PreAuth, ClaimForm, DischargeSummary, LabReport, Invoice, IDProof, PolicyCopy
  fileUrl         String   @default("")
  fileName        String   @default("")
  uploadedBy      String
  createdAt       DateTime @default(now())

  claim           InsuranceClaim @relation(fields: [claimId], references: [id], onDelete: Cascade)

  @@index([claimId])
}
```

**Add back-relations:**
- `User`: `insurancePolicies PatientInsurancePolicy[]`
- `IpdAdmission`: `preAuths InsurancePreAuth[]`, `insuranceClaims InsuranceClaim[]`
- `IpdBill`: `insuranceClaims InsuranceClaim[]`
- `Hospital`: `preAuths InsurancePreAuth[]`, `insuranceClaims InsuranceClaim[]`

**Add fields to `IpdAdmission`:**
```prisma
  insurancePolicyId String?                    // link to patient's policy for this admission
  insuranceType     String   @default("Cash")  // Cash, Insurance, TPA, CGHS, ESIC
  preAuthStatus     String   @default("")      // "", Pending, Approved, Rejected
```

Run `bun run db:push && bun run db:generate`.

### 5.2 — Seed Insurance Master Data

**Create `src/scripts/seed-insurance.ts`:**

Pre-populate `InsuranceCompany` + `TpaMaster` with major Indian insurers:
- Star Health Insurance
- HDFC ERGO General Insurance
- ICICI Lombard General Insurance
- Bajaj Allianz General Insurance
- Niva Bupa Health Insurance
- Medi Assist (TPA)
- Raksha TPA
- Vidal Health TPA
- Heritage Health TPA

### 5.3 — API Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET, POST | `/api/insurance/companies` | admin, hospital | List/create insurance companies (admin seeds, hospital views) |
| GET, PUT | `/api/insurance/companies/[id]` | admin | Update company |
| GET, POST | `/api/insurance/tpas` | admin, hospital | List/create TPAs |
| GET, PUT | `/api/insurance/tpas/[id]` | admin | Update TPA |
| GET, POST | `/api/patient-insurance` | patient, receptionist, hospital | List/create patient policies |
| GET, PUT | `/api/patient-insurance/[id]` | patient, receptionist, hospital | Get/update policy |
| GET, POST | `/api/insurance/pre-auth` | receptionist, hospital | List/create pre-auth |
| GET | `/api/insurance/pre-auth/[id]` | receptionist, hospital | Get pre-auth detail |
| POST | `/api/insurance/pre-auth/[id]/submit` | receptionist, hospital | Submit pre-auth to TPA |
| POST | `/api/insurance/pre-auth/[id]/respond` | hospital | Record TPA response (approved/rejected) |
| GET, POST | `/api/insurance/claims` | receptionist, hospital | List/create claims |
| GET | `/api/insurance/claims/[id]` | receptionist, hospital | Get claim detail |
| POST | `/api/insurance/claims/[id]/submit` | receptionist, hospital | Submit claim to TPA |
| POST | `/api/insurance/claims/[id]/settle` | hospital | Record settlement |
| POST | `/api/insurance/claims/[id]/documents` | receptionist, hospital | Upload claim document |
| GET | `/api/reports/insurance/tpa-outstanding` | hospital, admin | TPA-wise outstanding aging report |

### 5.4 — Frontend Pages

**Routes under `src/app/dashboard/hospital/insurance/`:**

| Route | Features |
|-------|----------|
| `/dashboard/hospital/insurance` | Insurance dashboard: active claims count, pending pre-auths, TPA outstanding summary |
| `/dashboard/hospital/insurance/companies` | List of insurance companies + TPAs (read-only for hospital, admin can edit) |
| `/dashboard/hospital/insurance/policies` | Patient insurance policies list (search by patient name / policy no) |
| `/dashboard/hospital/insurance/pre-auths` | Pre-auth list with status filter, "New Pre-Auth" button |
| `/dashboard/hospital/insurance/pre-auths/new` | Create pre-auth form: select admission → auto-load patient's policy → enter diagnosis, procedures, estimated amount → submit |
| `/dashboard/hospital/insurance/pre-auths/[id]` | Pre-auth detail: status timeline, TPA response form |
| `/dashboard/hospital/insurance/claims` | Claims list with status filter |
| `/dashboard/hospital/insurance/claims/[id]` | Claim detail: line items with claimed vs allowed, deduction reasons, document upload, settlement form |
| `/dashboard/hospital/insurance/reports/tpa-outstanding` | TPA-wise outstanding aging report (0-30, 31-60, 60-90, 90+ days) |

**Routes under `src/app/dashboard/patient/insurance/`:**

| Route | Features |
|-------|----------|
| `/dashboard/patient/insurance` | Patient's insurance policies list + "Add Policy" button |
| `/dashboard/patient/insurance/new` | Add insurance policy form: select company, enter policy no, sum insured, validity |

### 5.5 — IPD Admission Integration

**Update `src/app/api/dashboard/receptionist/ipd/admit/route.ts`:**
- Add `insurancePolicyId` and `insuranceType` to the admission form
- If `insuranceType !== 'Cash'`, require a policy selection
- After admission, if insurance: prompt for pre-auth creation

**Update `src/app/dashboard/receptionist/ipd/admit/client.tsx`:**
- Add "Insurance Details" section to the admit form
- Radio: Cash / Insurance / TPA / CGHS / ESIC
- If Insurance/TPA: show policy selector (patient's active policies) + "Add New Policy" link

### 5.6 — Bill Integration

**Update `src/app/api/ipd-bills/route.ts` POST (bill generation):**
- If admission has `insurancePolicyId`:
  - Compute `patientPayable` and `insurancePayable` based on copay percent
  - Create `InsuranceClaim` in Draft status linked to the bill
  - The claim line items mirror the bill line items with `claimedAmount = lineItem.amount`

**Update `IpdBill` response to include:**
- `patientPayable` (patient's share after copay)
- `insurancePayable` (insurance company's share)
- `claimId` (if insurance claim exists)

### 5.7 — Sidebar Updates

Add to `hospital` sidebar:
```typescript
{
  label: 'Insurance',
  href: '/dashboard/hospital/insurance',
  icon: Shield,
  children: [
    { label: 'Dashboard', href: '/dashboard/hospital/insurance', icon: LayoutDashboard },
    { label: 'Companies', href: '/dashboard/hospital/insurance/companies', icon: Building2 },
    { label: 'Policies', href: '/dashboard/hospital/insurance/policies', icon: FileText },
    { label: 'Pre-Auths', href: '/dashboard/hospital/insurance/pre-auths', icon: ClipboardCheck },
    { label: 'Claims', href: '/dashboard/hospital/insurance/claims', icon: Receipt },
    { label: 'TPA Outstanding', href: '/dashboard/hospital/insurance/reports/tpa-outstanding', icon: TrendingUp },
  ],
},
```

Add to `patient` sidebar:
```typescript
{ label: 'My Insurance', href: '/dashboard/patient/insurance', icon: Shield },
```

### Verification
- [ ] Admin can seed insurance companies + TPAs
- [ ] Patient can add their insurance policy
- [ ] Receptionist can select insurance during IPD admission
- [ ] Hospital can create a pre-auth for an insured admission
- [ ] Hospital can submit a claim after bill generation
- [ ] Hospital can record TPA response (approve/reject)
- [ ] Hospital can record claim settlement
- [ ] TPA outstanding report shows aging buckets
- [ ] Bill shows patient share vs insurance share
- [ ] `bun run lint` passes

---

## EXECUTION CHECKLIST

### Week 1 (Phase 0 + start Phase 1)
- [ ] Fix billing 404 bug (0.1)
- [ ] Add Session model + migrate auth to token-based (0.2)
- [ ] Harden socket auth (0.3)
- [ ] Build nurse diet-orders page (1.1)
- [ ] Add diet tab to patient detail (1.2)
- [ ] Add patient diet view (1.3)
- [ ] Update sidebar + seed (1.4, 1.5)

### Weeks 2-3 (Phase 2: Razorpay + SMS)
- [ ] Add PaymentGatewayTransaction + NotificationLog + NotificationTemplate models
- [ ] Install + configure Razorpay SDK
- [ ] Build create-order + verify + webhook API routes
- [ ] Build RazorpayCheckout component
- [ ] Add "Pay Now" to patient bills/appointments
- [ ] Install + configure MSG91/Gupshup
- [ ] Build notify-channels.ts (sendSMS, sendWhatsApp)
- [ ] Wire 8 event templates into createNotification()
- [ ] Build hospital notification settings page
- [ ] Create send-reminders cron script

### Weeks 4-6 (Phase 3: Expenses)
- [ ] Add Vendor + ExpenseCategory + Expense + VendorPayment models
- [ ] Build all expense API routes
- [ ] Build expense list + new + detail pages
- [ ] Build vendor master + vendor payments pages
- [ ] Rewrite P&L report to include expenses
- [ ] Add expense-by-category and expense-trend reports
- [ ] Seed expense data

### Weeks 7-8 (Phase 4: Audit + Consent)
- [ ] Add AuditLog + PatientConsent models
- [ ] Build audit.ts helper
- [ ] Wire audit logging into 9 key routes
- [ ] Build admin audit log viewer with CSV export
- [ ] Build consent API routes
- [ ] Build consent templates page (hospital)
- [ ] Build consent capture page (receptionist)
- [ ] Build patient consent view

### Weeks 9-14 (Phase 5: Insurance/TPA)
- [ ] Add 8 insurance models + fields to IpdAdmission
- [ ] Create seed-insurance.ts with major Indian insurers
- [ ] Build company + TPA CRUD APIs
- [ ] Build patient policy CRUD APIs
- [ ] Build pre-auth APIs (create, submit, respond)
- [ ] Build claim APIs (create, submit, settle, documents)
- [ ] Build insurance dashboard page
- [ ] Build pre-auth list + new + detail pages
- [ ] Build claim list + detail pages
- [ ] Build TPA outstanding report
- [ ] Build patient insurance policy page
- [ ] Integrate insurance into IPD admission form
- [ ] Integrate insurance into bill generation
- [ ] Seed a test insurance claim end-to-end

### Final Verification (after all phases)
- [ ] `bun run lint` passes
- [ ] `bun run db:push` succeeds
- [ ] All seed scripts run cleanly
- [ ] Agent Browser: every new page renders without error
- [ ] Agent Browser: each flow works end-to-end (pay a bill, create an expense, file a claim)
- [ ] No 500 errors in dev.log across all flows

---

## DEPENDENCIES & RISKS

### External service dependencies
| Service | Phase | Setup time | Cost |
|---------|-------|------------|------|
| Razorpay (test mode) | 2 | 1 day (signup + KYC) | Free test account |
| MSG91 SMS | 2 | 1 day (signup + sender ID approval) | ₹0.20/SMS |
| Gupshup WhatsApp | 2 | 3-5 days (WhatsApp template approval) | ₹0.50-0.80/message |
| Cloudinary | (already configured) | — | Free tier OK |

### Technical risks
1. **Razorpay webhook reliability** — if the webhook is delayed, the patient's bill won't update. Mitigation: also verify on frontend callback (not just webhook).
2. **MSG91 sender ID approval** — takes 1-2 days. Mitigation: use the default sender ID initially.
3. **WhatsApp template approval** — takes 3-5 days per template. Mitigation: start Phase 2 with SMS only, add WhatsApp once templates are approved.
4. **Insurance TPA API integration** — most Indian TPAs don't have public APIs. Mitigation: Phase 1 is manual submission + response recording. API automation is a future Phase 2.
5. **Schema migration on existing data** — adding `insurancePolicyId` to `IpdAdmission` is nullable, so existing admissions won't break. Run `db:push --accept-data-loss` carefully.

### What's explicitly NOT in this plan (deferred to Phase 2)
- Claim settlement automation (TPA API integration)
- HR/Payroll module (XL complexity, needs PF/ESI statutory knowledge)
- Blood Bank module (specialized cold-chain tracking)
- Asset/Equipment management (AMC/warranty tracking)
- ABDM/FHIR integration (complex interop standard)
- Multi-branch/chain management
- Mobile app APIs
