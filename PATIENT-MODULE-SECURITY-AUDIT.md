# Doctorooms Patient Module — Complete Technical Discovery & Security Audit

**Audit date:** 19 Aug 2026
**Auditor:** Z.ai Code (Explore agent — read-only analysis, no code changes)
**Project root:** `/home/z/my-project`
**Stack:** Next.js 16 App Router + Prisma + SQLite + Tailwind + shadcn/ui + Cloudinary + Jitsi Meet + Socket.io mini-service

---

## ⚠️ HEADLINE FINDINGS

The Patient Module has a working feature set for the basic patient journey (search doctors → book → wait → consult → view records). However, the security posture is **critically inadequate for a healthcare application**. The most severe issues are:

1. **CRITICAL — DEV_MODE=1 is live in `.env`** — anyone can become any role by setting a `doctorooms_role=admin` cookie.
2. **CRITICAL — Session cookie IS the User ID** — no real session tokens, no revocation, forged-cookie account takeover if user ID leaks (and user IDs appear in URLs).
3. **CRITICAL — Stored XSS via patient blog posts** — `dangerouslySetInnerHTML` renders raw HTML; patients can publish scripts that execute in any visitor's browser (including admin's).
4. **CRITICAL — Public Jitsi SaaS video consultation** — no auth check on room access, third-party processes PHI, no BAA.
5. **HIGH — Public Cloudinary URLs for medical files** — once a patient downloads a file, the URL is permanent and accessible by anyone who learns it.
6. **HIGH — Service worker caches ALL `/api/*` responses** — PII (profile, medical docs, lab reports, prescriptions) persists in CacheStorage after logout on shared devices.
7. **HIGH — No rate limiting anywhere** — login, OTP, forgot-password, booking — all unbounded.
8. **HIGH — Hardcoded JWT secret fallback** in `src/lib/session.ts:17` — `'doctorooms-dev-secret-change-in-production'` is in the source code.
9. **HIGH — Race condition in booking POST** — no DB unique constraint on (doctorId, bookingDate, timeSlot); two patients can book the same slot simultaneously.
10. **HIGH — No audit logging on patient actions** — only login/logout is logged. The 14 audit-wired routes are all hospital/doctor-side. Patient actions are invisible to auditors.

**Overall QA readiness score: 10/100 for production readiness** — this codebase CANNOT be deployed to production as-is for a healthcare application.

---

## Section 1 — PATIENT MODULE FEATURE INVENTORY

| Feature | Status | Frontend | Backend | DB tables | Auth | AuthZ | Notes |
|---|---|---|---|---|---|---|---|
| Patient registration | IMPLEMENTED | `src/app/register/page.tsx` | `src/app/api/auth/register/route.ts` | User | None | Role allowlist (line 13): patient + hospital only | Password hashed bcrypt 10 rounds (line 38); status set to `Active` immediately (line 47) — no email verification |
| Login (real email/password) | IMPLEMENTED but bypassed in dev | `src/app/login/page.tsx` | `src/app/api/auth/login/route.ts` | User, (Session table EXISTS but UNUSED) | None | bcrypt compare (line 27) | Login page is a DEV-MODE ROLE PICKER that POSTs to `/api/dev-login` (page.tsx line 186); real `/api/auth/login` exists but is **not reachable from the UI** |
| Logout | IMPLEMENTED | `src/app/dashboard/layout.tsx:81` | `src/app/api/auth/logout/route.ts` | AuditLog | `getAuthUser` | None | Just clears cookies (lines 28-29); no Session table invalidation because Session table not used |
| OTP | PARTIALLY IMPLEMENTED | `src/app/forgot-password/page.tsx` | `src/app/api/auth/verify-otp/route.ts`, `src/lib/otp-store.ts` | (none — in-memory) | None | None | In-memory `Map` (`otp-store.ts:11`) — lost on server restart; OTP logged to console (`forgot-password/route.ts:27`); NO retry limit; NO rate limit; forgot-password client expects `data.otp` in response (forgot-password/page.tsx:104) but server only returns `success`/`message` — so `data.otp` is `undefined` |
| Password change | IMPLEMENTED | `src/app/dashboard/change-password/page.tsx` | `src/app/api/user/change-password/route.ts` | User | `requireAuth` | None | Verifies current password (line 47); min 6 chars (line 26); no audit log; no session invalidation after change |
| Forgot password | PARTIALLY IMPLEMENTED | `src/app/forgot-password/page.tsx` | `src/app/api/auth/forgot-password/route.ts` | User, in-memory OTP | None | None | Reveals user existence (line 18-23 returns 404 if email not found); OTP printed to server logs (line 27) |
| Reset password | IMPLEMENTED | `src/app/forgot-password/page.tsx` | `src/app/api/auth/reset-password/route.ts` | User, in-memory OTP | `isOtpVerified` check (line 25) | None | Clears OTP after use (line 38); no rate limit |
| Profile (edit) | IMPLEMENTED | `src/app/dashboard/patient/profile/page.tsx` | `src/app/api/patient/profile/route.ts` (GET/PUT) | User | `requireRole('patient')` | userId from auth user | Only `name`, `mobileNo`, `gender` editable; email read-only |
| Personal info / Contact info / Emergency contact | PARTIALLY IMPLEMENTED | (no dedicated UI) | — | User (name, mobileNo, email, gender); IpdAdmission has contactPersonName/Mobile/Relation, address, etc. | — | — | No emergency contact field on `User`. Emergency contact lives only on `IpdAdmission` (collected by receptionist at IPD admission). NOT patient-editable. |
| Patient preferences | PARTIALLY IMPLEMENTED | `src/app/dashboard/patient/settings/page.tsx` | `src/app/api/patient/settings/route.ts` | User.settingsJson | `requireRole('patient')` | Self | Only 3 boolean toggles (emailNotifications, bookingReminders, marketingEmails). These preferences are NOT actually consulted when sending notifications. |
| Doctor discovery | IMPLEMENTED | `src/app/page.tsx:436` ("Find a Doctor"); `src/app/doctors/page.tsx` | `src/app/api/doctors/route.ts` | User, Doctor, DoctorRating | None (public) | None | Pagination + filters (search/specialization/city/state) |
| Doctor search | IMPLEMENTED | `src/app/doctors/page.tsx` | `src/app/api/doctors/route.ts:5-143` | User, Doctor, DoctorRating | None | None | See Section 17 for N+1 concerns (lines 38-76 fire 4 separate queries) |
| Doctor filtering | IMPLEMENTED | same | same | same | None | None | `?specialization=`, `?city=`, `?state=` supported (lines 26-36) |
| Doctor profile (public) | IMPLEMENTED | `src/app/doctors/[id]/page.tsx` | `src/app/api/doctors/[id]/route.ts` | User, Doctor, DoctorSchedule, DoctorRating, Booking | None | None | Leaks doctor's email publicly (`route.ts:121` returns `email: user.email`) |
| Doctor availability | IMPLEMENTED | `src/app/dashboard/patient/book/[doctorId]/page.tsx` | `src/app/api/doctors/[id]/schedule/route.ts`; `src/app/api/patient/bookings/slots-availability/route.ts` | DoctorSchedule, DoctorHoliday, Booking | schedule = public; slots-availability = `requireAuth` | None | `DoctorSchedule.timeSlots` stored as JSON string of pre-computed slots |
| Appointment booking | IMPLEMENTED (with race condition) | `src/app/dashboard/patient/book/[doctorId]/page.tsx` | `src/app/api/patient/bookings/route.ts` (POST) | Booking, Notification | `requireRole('patient')` | Self (userId on booking) | Race condition: `findFirst` conflict-check (line 102) then `create` (line 123) — no transaction, no DB unique constraint. See Section 11. |
| Reschedule | NOT IMPLEMENTED | — | — | — | — | — | No code paths found in `src/`. Searched: `grep -ri reschedule src/` returns no matches. |
| Cancellation | IMPLEMENTED | `src/app/dashboard/patient/appointments/page.tsx:122` | `src/app/api/patient/bookings/[id]/cancel/route.ts` (PATCH) | Booking, Notification | `requireRole('patient')` | Ownership check (line 31) | Allowed only from `['Pending', 'Approve']` (line 36) |
| Appointment history | IMPLEMENTED | `src/app/dashboard/patient/appointments/page.tsx` | `src/app/api/dashboard/patient/appointments/route.ts` | Booking, Doctor, Prescription | `requireRole('patient')` | Self (userId filter, line 20) | Pagination missing (returns all bookings); status filter via `?status=` |
| Reminders | PARTIALLY IMPLEMENTED | — | `src/lib/emit-notification.ts` + `src/lib/notify-channels.ts` | Notification, NotificationLog | — | — | Templates exist for `appointment-confirmed`, `queue-turn-approaching` (`notify-channels.ts:76-85`) but **no scheduled reminder job** — no cron, no queue, no "X minutes before appointment" trigger found in `src/` |
| Waiting / queue | IMPLEMENTED | `src/app/dashboard/patient/appointments/[id]/page.tsx` (queue section) | `src/app/api/patient/bookings/queue/route.ts` | Booking | `requireAuth` | Ownership check (line 39) | Auto-polling every 30s (`appointments/[id]/page.tsx:426`); uses `tokenOrder` for ordering |
| Consultation | IMPLEMENTED | (no dedicated page; covered via appointment detail) | Booking model with `bookingMode` (`InPerson` / `VideoCall`) | Booking | — | — | BookingMode validation in `patient/bookings/route.ts:24` |
| Video consultation | PARTIALLY IMPLEMENTED | `src/app/dashboard/video-call/[roomId]/page.tsx` | (none — uses Jitsi Meet iframe) | Booking.videoRoomId | Client-side `/api/auth/me` check only (page.tsx line 76) | NONE | Uses **public Jitsi Meet** (`https://meet.jit.si/${roomId}` — line 88 of page.tsx). RoomId IS the Jitsi room name. **Anyone with the URL joins the call.** No token authentication. No recording controls. Third-party service processes audio/video. |
| Chat | IMPLEMENTED | `src/app/dashboard/patient/appointments/[id]/page.tsx` (chat section) | `src/app/api/bookings/[bookingId]/chat/route.ts` (GET/POST) | BookingChat | `requireAuth` | Per-role + ownership check (lines 38-44, 108-132) | Good authorization model — patient/doctor/receptionist each checked |
| Prescriptions | PARTIALLY IMPLEMENTED | `src/app/dashboard/patient/appointments/[id]/page.tsx` (renders prescriptions) | `src/app/api/dashboard/patient/prescriptions/route.ts` (GET) | Prescription, PMedicine, PLabel, PSuggestion, Booking | `requireRole('patient')` | Self via `booking.userId` (line 17) | Only prescriptions linked to Visited/Finish bookings returned. Patient cannot create prescriptions (correct). Rx access request flow IS implemented (`/api/prescription-access/*`) |
| Medical records | IMPLEMENTED | `src/app/dashboard/patient/health-records/page.tsx` | `src/app/api/patient/medical-documents/route.ts` (GET/POST); `/[id]/route.ts` (PUT/DELETE); `/[id]/download/route.ts` (GET) | MedicalDocument | `requireRole('patient')` | Ownership check on every operation (lines 45, 74, 22 of respective files) | Upload allows PDF/JPG/PNG/DOC/DOCX ≤5MB; **filename sanitization regex** `[^a-zA-Z0-9._-]` → `_` (line 104); **download returns raw Cloudinary/Supabase public URL** — see Section 10 |
| Lab reports (external) | IMPLEMENTED | `src/app/dashboard/patient/reports/client.tsx` | `src/app/api/lab-reports/patient/route.ts` | LabReportUpload, ExternalTestOrder, LabPartner, Doctor | `requireRole('patient')` OR `requireRole('doctor')` | Patient auto-scoped to self (`patientId = user.id` line 22); doctor must have order/booking with patient (lines 28-42) | Returns `fileUrl` (Cloudinary public URL) in response — client renders via `<a href={fileUrl}>` (reports/client.tsx ~line 588) — public, no signed URLs |
| Lab reports (in-house) | NOT IMPLEMENTED (for patient view) | — | `src/app/api/lab-reports/route.ts` (hospital-side only) | LabReport, LabTestMaster | Hospital roles only | — | In-house `LabReport` model exists but patient has no API to view their own in-house lab reports. Patients only see external `LabReportUpload` rows |
| Documents upload/download | IMPLEMENTED | (medical-documents UI) | (medical-documents routes) | MedicalDocument | As above | As above | See file security section |
| Health history | NOT IMPLEMENTED | — | — | — | — | — | No `PatientProfile`, `HealthRecord`, or standing `medicalHistory` field. Only `IpdAdmission.pastHistory` (text) + `IpdAdmission.drugHistory` (text) captured at IPD admission by doctor. Patient has no UI to enter health history. |
| Allergies | NOT IMPLEMENTED (as a structured field) | — | — | — | — | — | Only captured as free text in `IpdAdmission.habits.allergy` (JSON string, edited by doctor in IPD) or as a `PLabel` value in a prescription. No dedicated Allergy model. |
| Medications (standing list) | NOT IMPLEMENTED | — | — | — | — | — | Only `PMedicine` (prescription medicines) — per-prescription, not a standing patient medications list. `IpdAdmission.drugHistory` is a free-text field. `DoctorMedicine` is the doctor's medicine master, not patient-specific. |
| Diagnoses | PARTIALLY IMPLEMENTED | — | — | `Booking.disease` (free text patient-entered); `Prescription.disease` (doctor-entered); `IpdAdmission.initialDiagnosis`/`finalDiagnosis` | — | — | No structured diagnosis codes (ICD-10 etc.); all free text |
| Vitals | NOT IMPLEMENTED (patient-viewable) | — | `src/app/api/dashboard/nurse/patients/[admissionId]/vitals/route.ts` (nurse-only) | VitalRecord | Nurse only | — | `VitalRecord` exists but patient has no API or UI to view their own vitals |
| Payments (patient-initiated) | NOT IMPLEMENTED | — | — | — | — | — | No patient-initiated payment flow exists. `PaymentGatewayTransaction` model exists in schema but **no API route creates one** (grep `paymentGatewayTransaction` → only seed scripts). `OpdBill`/`IpdBill`/`BillPayment` are all created by receptionist/hospital roles. Patients have no payment endpoint. |
| Payment history | NOT IMPLEMENTED (patient-side) | — | — | — | — | — | Patients have no API to view their own bills/payments. `OpdBill` print route `/print/opd-bill/[id]` is patient-accessible (page.tsx line 102) but patient has no listing endpoint. |
| Refunds | NOT IMPLEMENTED | — | — | — | — | — | No refund API anywhere. Search `refund` in `src/api` → no matches. |
| Invoices/receipts | PARTIALLY IMPLEMENTED | `src/app/print/opd-bill/[id]/page.tsx` (printable OPD bill) | `src/app/api/opd-bills/route.ts` (hospital creates); `/api/billing/receipt/[type]/[id]/route.ts` (fetch) | OpdBill, IpdBill, BillPayment | Print route: patient ownership check (page.tsx line 102); receipt API: `getAuthUser` only | — | Patient can print own OPD bill. No patient-side listing of own bills. |
| Notifications | IMPLEMENTED | `src/app/dashboard/patient/notifications/page.tsx` | `src/app/api/patient/notifications/route.ts`; `/[id]/read/route.ts`; `/read-all/route.ts`; `/api/notifications/unread-count/route.ts` | Notification | `requireRole('patient')` (patient-specific) / `getAuthUser` (generic) | Ownership check on individual notification (line 26 of `[id]/read`) | Pagination supported on patient list (lines 13-15) |
| Reviews/ratings | IMPLEMENTED | `src/app/dashboard/patient/feedback/page.tsx` | `src/app/api/patient/feedback/route.ts` (GET/POST); `/check/route.ts` | DoctorRating, Booking | `requireRole('patient')` | Self (patientId = user.id line 119) | One rating per booking (line 78-100 checks for existing); legacy "no bookingId" path also exists (line 104) |
| Favorites / bookmark | NOT IMPLEMENTED | — | — | — | — | — | No `Favorite` model; no API; no UI |
| Search history | NOT IMPLEMENTED | — | — | — | — | — | Not stored |
| Account settings | PARTIALLY IMPLEMENTED | `src/app/dashboard/patient/settings/page.tsx` | `src/app/api/patient/settings/route.ts` | User.settingsJson | `requireRole('patient')` | Self | 3 email/reminder toggles (which aren't honored); theme switcher (client-only); change-password link. No account-level settings (deletion, export, sessions, etc.) |
| Privacy settings | NOT IMPLEMENTED | (Settings page mentions "Privacy" card but it's just static text — `settings/page.tsx:138-161`) | — | — | — | — | No actual privacy controls. Card text says "We never share your medical data" — but no consent management, no data export, no viewing logs of who accessed patient data |
| Account deletion/deactivation | PARTIALLY IMPLEMENTED | — | `src/app/api/dashboard/admin/users/[id]/route.ts` (DELETE — admin only); `/status/route.ts` (PUT — admin sets Active/Block/Pending) | User | `requireRole('admin')` (status route — but DELETE route has no null-check, see Section 4) | Admin only | Hard delete (line 22 `db.user.delete`); no soft-delete; no patient self-service; no "right to be forgotten" flow |
| Support/help | PARTIALLY IMPLEMENTED | `src/app/contact/page.tsx` | `src/app/api/contact/route.ts` | HospitalInquiry | None | None | Public contact form; no rate limit; no auth required; no patient-side ticket tracking |

---

## Section 2 — PATIENT USER JOURNEY

| Step | Frontend | API | DB Write | Notes |
|---|---|---|---|---|
| 1. Registration | `/register` (3-step wizard) | `POST /api/auth/register` (`route.ts:5`) | `db.user.create` (line 39) | bcrypt hash, role allowlist, status=Active immediately |
| 2. Login | `/login` (role picker!) | `POST /api/dev-login` (page.tsx line 186) | `db.session.create` via `createSession` (dev-login route line 59); AuditLog `login` | **Inconsistency**: login PAGE uses dev-login. Real `/api/auth/login` is unreachable from UI and stores User ID directly as cookie. |
| 3. Profile setup | `/dashboard/patient/profile` | `GET /api/patient/profile`; `PUT /api/patient/profile` | `db.user.update` (line 50) | Only name/mobile/gender editable |
| 4. Doctor discovery | `/` (home) → `/doctors` | `GET /api/doctors?...` | (read-only) | 4 separate queries fired in parallel (line 38-76) |
| 5. Doctor selection | `/doctors/[id]` | `GET /api/doctors/[id]` | (read-only) | Returns doctor's email publicly |
| 6. Slot selection | `/dashboard/patient/book/[doctorId]` | `GET /api/doctors/[id]/schedule`; `GET /api/patient/bookings/slots-availability?doctorId=...&date=...` | (read-only) | Slot statuses computed client-side from bookings |
| 7. Appointment booking | same page | `POST /api/patient/bookings` (`route.ts:6`) | `db.booking.create` (line 123); 3× `db.notification.create` (patient, doctor, receptionist) | **Race condition** (see Section 11) |
| 8. Payment | (none — no patient payment flow) | — | — | **NOT IMPLEMENTED** — patient never pays online; payment is collected in-clinic by receptionist via `/api/opd-bills` POST or `/api/bill-payments` POST |
| 9. Confirmation | (notification) | (notifications emitted by booking POST) | `db.notification` rows | No email/SMS confirmation sent for booking creation |
| 10. Waiting room | `/dashboard/patient/appointments/[id]` (queue section) | `GET /api/patient/bookings/queue?bookingId=...` (polled every 30s) | (read-only) | Token number assigned by receptionist's `/api/dashboard/receptionist/bookings/[id]/approve` route (calls `generateTokenNumber` from `token-utils.ts`) |
| 11. Consultation | (doctor marks status=Visited via `/api/dashboard/receptionist/bookings/[id]/status`) | — | `db.booking.update` (status=Visited) | Patient sees status flip via polling |
| 12. Prescription/Records | `/dashboard/patient/appointments/[id]` (prescriptions section) | `GET /api/dashboard/patient/appointments/[id]` (includes prescriptions) | (read-only) | Returns full prescription with medicines/labels/suggestions |
| 13. Follow-up | (none — no follow-up scheduling) | — | — | NOT IMPLEMENTED — `Prescription.nextVisit` field exists but no patient UI to book follow-up from a prescription |
| 14. Appointment history | `/dashboard/patient/appointments` | `GET /api/dashboard/patient/appointments` | (read-only) | Returns ALL bookings (no pagination) — performance risk for long-term patients |

---

## Section 3 — AUTHENTICATION ARCHITECTURE

### Files inspected
- `src/app/api/auth/login/route.ts` (105 lines)
- `src/app/api/auth/logout/route.ts` (31 lines)
- `src/app/api/auth/me/route.ts` (31 lines)
- `src/app/api/auth/verify-otp/route.ts` (35 lines)
- `src/app/api/auth/forgot-password/route.ts` (39 lines)
- `src/app/api/auth/reset-password/route.ts` (51 lines)
- `src/app/api/dev-login/route.ts` (113 lines)
- `src/lib/api-auth.ts` (190 lines)
- `src/lib/auth-store.ts` (37 lines — Zustand client store)
- `src/lib/session.ts` (100 lines — exists but UNUSED by production login)
- `src/app/login/page.tsx` (387 lines — DEV role picker)

### Auth provider/system
**Custom.** No NextAuth, no Supabase Auth, no Clerk. The implementation is split-brained:

1. **Production login** (`/api/auth/login`) sets `doctorooms_session = user.id` directly (line 64) — i.e. **the session cookie IS the user ID**. There is NO session token, NO DB Session row, NO JWT. The `Session` table exists in `prisma/schema.prisma:1556-1571` but **the production login route never writes to it**.

2. **Dev login** (`/api/dev-login`) DOES use `createSession()` (dev-login route line 59) which creates a real `Session` row + a JWT. The JWT is set as the `doctorooms_session` cookie (dev-login route line 72).

3. **`getAuthUser`** in `api-auth.ts:26-81` reads the `doctorooms_session` cookie and tries `db.user.findUnique({ where: { id: sessionId } })` (line 33). **This treats the cookie as a User ID — it would FAIL if the cookie were a real JWT** (because JWT is not a cuid). So `getAuthUser` only works for the production-login flow, not the dev-login flow. (In practice, dev mode falls through to the role-cookie fallback at line 56-77.)

### Email/password hashing
**bcrypt** with 10 rounds — `bcrypt.hash(password, 10)` at `register/route.ts:38` and `reset-password/route.ts:32`. Password compared with `bcrypt.compare` at `login/route.ts:27`.

### OTP mechanism
- 6-digit numeric OTP generated with `Math.random()` (`otp-store.ts:14`)
- **Stored in-memory in a `Map`** (`otp-store.ts:11`) — **not Redis, not DB**
- 5-minute expiry (`otp-store.ts:15`)
- **OTP is logged to the server console**: `console.log('[DEV] OTP for', email.toLowerCase(), ':', otp)` (`forgot-password/route.ts:27`)
- **No retry limit** — `verifyOTP` returns false but doesn't lock out after N failures
- **No rate limiting** on the `forgot-password` endpoint — an attacker can spam OTPs
- The forgot-password CLIENT (`forgot-password/page.tsx:104`) sets `setServerOtp(data.otp)` — but the server only returns `{success, message}`, NOT `otp`. So `data.otp` is `undefined` and the toast says `OTP sent! (Demo: undefined)`. The feature is **broken** in production-like use; only works because the OTP is also logged to console.

### Social login
**NOT IMPLEMENTED.** No Google/GitHub/Facebook OAuth. No `Account` table.

### JWT
- `src/lib/session.ts:46-50` uses `jsonwebtoken` with HS256
- Secret: `process.env.NEXTAUTH_SECRET || 'doctorooms-dev-secret-change-in-production'` (`session.ts:17`) — **HARDCODED FALLBACK SECRET in source code**
- Expiry: 7 days (`session.ts:14` — `JWT_DURATION_S = 7 * 24 * 60 * 60`)
- **NOTE:** This JWT mechanism is ONLY issued by `/api/dev-login`. The production `/api/auth/login` route does NOT issue a JWT.

### Edge proxy JWT verification
- `src/proxy.ts:53-64` `decodeJwt` — **DOES NOT VERIFY SIGNATURE**. Only decodes structure + checks `exp`. Comment admits: "signature not verified on Edge; API routes do the full verification with DB lookup".
- But the API routes do NOT verify the JWT signature either — `getAuthUser` treats the cookie as a User ID and looks up the User directly.

### Session cookies
- Name: `doctorooms_session` + `doctorooms_role` (two cookies)
- `httpOnly: true` (good) — `login/route.ts:65`, `dev-login/route.ts:73`
- `secure: process.env.NODE_ENV === 'production'` (so NOT secure in dev) — `login/route.ts:66`
- `sameSite: 'lax'` — `login/route.ts:67`
- `maxAge: 60*60*24*7` (7 days) — `login/route.ts:68`
- `path: '/'`

### Refresh tokens
**NOT IMPLEMENTED.** Single 7-day cookie. No refresh flow.

### Access token lifetime
Effectively 7 days (the cookie maxAge). No sliding window, no idle timeout.

### Logout implementation
`logout/route.ts` just clears the cookies with `maxAge: 0` (lines 28-29). Because production login does NOT create a `Session` row, there is nothing to revoke. Even if dev-login created a Session row, `logout` does NOT call `revokeSession()` from `session.ts:80-90` — so dev-login sessions **stay alive in the DB** after logout (only the cookie is gone).

### Multiple-device login
**Allowed and NOT tracked.** Production login: any number of devices can log in as the same user; each gets the same `doctorooms_session = user.id` cookie. No way to list or revoke other sessions.

### Concurrent sessions
**Not restricted.** Same as above.

### Password reset mechanism
OTP-based (see above). Token-based would require a DB table — there isn't one.

### OTP generation + expiration + retry limits + rate limiting
- Generation: `Math.floor(100000 + Math.random() * 900000)` (6-digit) — `otp-store.ts:14`. `Math.random()` is **NOT cryptographically secure**; should use `crypto.randomInt()`.
- Expiration: 5 minutes — `otp-store.ts:15`
- Retry limits: **NONE**. `verifyOTP` returns true/false but doesn't count attempts.
- Rate limiting: **NONE** on `/api/auth/forgot-password`, `/api/auth/verify-otp`, `/api/auth/reset-password`.

### Login attempt limits + account lockout + brute-force protection
**NONE.** `/api/auth/login` has no counter, no lockout, no rate limit, no IP-based throttling. bcrypt is the only defense (offline attack still feasible at ~100s of guesses/sec offline, but online attack against the live endpoint is bounded only by network speed).

### Session invalidation
- Production login: impossible — there's no Session row to revoke. To invalidate a user, admin must change the user's status to `Block` (and `getAuthUser` checks `user.status === 'Active'` at line 37 of `api-auth.ts`).
- Dev-login: Session row exists but `logout` route doesn't revoke it.

### Token rotation
**NOT IMPLEMENTED.** Cookie value never changes during a session.

### Device tracking (UserAgent? IP?)
- **Production login**: NOT tracked (no Session row, no audit metadata).
- **Dev login**: tracks IP + UA in the Session row (`session.ts:40-41`) AND in audit log (`dev-login/route.ts:57-58`).
- **Audit log**: `login` action stores `metadata: { method: 'password' }` — NO IP or UA captured (`login/route.ts:91`).

### Suspicious login detection
**NOT IMPLEMENTED.** No geolocation, no new-device alerts, no impossible-travel detection.

---

## Section 4 — AUTHORIZATION / RBAC

### `src/lib/api-auth.ts` reading

```ts
// line 24
const DEV_MODE = process.env.NODE_ENV !== 'production' && process.env.DEV_MODE === '1'

// line 26-81 — getAuthUser
// 1) Reads `doctorooms_session` cookie
// 2) Looks up User by ID (treating cookie AS the user ID)
// 3) If found + Active → returns user
// 4) If DEV_MODE → reads `doctorooms_role` cookie, finds FIRST active user with that role
// 5) If still no match → returns hardcoded DEV_USERS[role]
```

**Critical**: in dev mode, ANY unauthenticated request with `doctorooms_role=patient` cookie set will authenticate as the **first active patient user in the database** (line 59-72). With `doctorooms_role=admin`, an attacker becomes the first active admin. This is checked **before** the DB lookup fails — actually it's checked AFTER, but the dev fallback at line 56-77 fires whenever the DB lookup returns null OR throws.

The `.env` file at the project root contains `DEV_MODE=1` (line 2-3). So **this fallback is LIVE in the running dev server.**

`requireRole` (line 84-92) calls `getAuthUser` then checks `user.role.toLowerCase() === role.toLowerCase()`. No further checks.

`requireAuth` (line 95-97) just calls `getAuthUser`.

There is **no resource-level authorization helper** — every route hand-rolls its ownership check.

### Patient-facing API route inventory

| Route | Method | Auth | Role check | Ownership check | Returns when unauthorized |
|---|---|---|---|---|---|
| `/api/patient/profile` | GET, PUT | `requireRole('patient')` | Yes | Self-scoped (`where: { id: user.id }`) | 401 |
| `/api/patient/avatar` | POST | `requireRole('patient')` | Yes | Self-scoped | 401 |
| `/api/patient/settings` | GET, PUT | `requireRole('patient')` | Yes | Self-scoped | 401 |
| `/api/patient/bookings` | POST | `requireRole('patient')` | Yes | Self (booking.userId = user.id at line 127) | 401 |
| `/api/patient/bookings/check-slot` | GET | `requireAuth` (ANY authed role) | None | None — slot data is generic | 401 |
| `/api/patient/bookings/slots-availability` | GET | `requireAuth` | None | None | 401 |
| `/api/patient/bookings/queue` | GET | `requireAuth` | None | **Yes** — line 39: `if (booking.userId !== user.id) return 401` | 401 |
| `/api/patient/bookings/[id]/cancel` | PATCH | `requireRole('patient')` | Yes | **Yes** — line 31: `if (booking.userId !== user.id) return 401` | 401 |
| `/api/patient/medical-documents` | GET, POST | `requireRole('patient')` | Yes | Self-scoped | 401 |
| `/api/patient/medical-documents/[id]` | PUT, DELETE | `requireRole('patient')` | Yes | **Yes** — line 45 / line 74: `if (!doc || doc.patientId !== user.id) return 404` | 404 (NOT 403) |
| `/api/patient/medical-documents/[id]/download` | GET | `requireRole('patient')` | Yes | **Yes** — line 22: `if (!doc || doc.patientId !== user.id) return 404` | 404 |
| `/api/patient/notifications` | GET | `requireRole('patient')` | Yes | Self-scoped (`where: { userId: user.id }`) | 401 |
| `/api/patient/notifications/[id]/read` | PATCH | `requireRole('patient')` | Yes | **Yes** — line 26: `if (notification.userId !== user.id) return 401` | 401 |
| `/api/patient/notifications/read-all` | PATCH | `requireRole('patient')` | Yes | Self-scoped updateMany | 401 |
| `/api/patient/feedback` | GET, POST | `requireRole('patient')` | Yes | Self-scoped (`patientId: user.id` line 119; bookingId-filtered on update line 79) | 401 |
| `/api/patient/feedback/check` | GET | `requireRole('patient')` | Yes | Self-scoped | 401 |
| `/api/patient/posts` | GET, POST | `requireRole('patient')` | Yes | Self-scoped | 401 |
| `/api/patient/posts/[id]` | GET, PUT, DELETE | `requireRole('patient')` | Yes | **Yes** — line 40 / 67 / 108: `if (!post || post.authorId !== user.id) return 404` | 404 |
| `/api/dashboard/patient/appointments` | GET | `requireRole('patient')` | Yes | Self-scoped (`where: { userId: user.id }` line 20) | 401 |
| `/api/dashboard/patient/appointments/[id]` | GET | `requireRole('patient')` | Yes | **Yes** — line 43: `if (!booking || booking.userId !== user.id) return 404` | 404 |
| `/api/dashboard/patient/prescriptions` | GET | `requireRole('patient')` | Yes | Self-scoped via `booking.userId` (line 17) | 401 |
| `/api/dashboard/patient/stats` | GET | `requireRole('patient')` | Yes | Self-scoped | 401 |
| `/api/notifications/[id]/read` | PUT | `getAuthUser` (ANY role) | None | **Yes** — line 26: `if (notification.userId !== authUser.id) return 401` | 401 |
| `/api/notifications/read-all` | PATCH | `getAuthUser` | None | Self-scoped (`where: { userId: authUser.id }`) | 401 |
| `/api/notifications/unread-count` | GET | (not read — assume `getAuthUser`) | — | — | (need to verify) |
| `/api/notification-preferences` | GET, PUT | `requireAuth` (ANY role) | None | Self-scoped via `userId: user.id` (line 26, 73) | 401 |
| `/api/bookings/[bookingId]/chat` | GET, POST | `requireAuth` (ANY role) | Per-role branch (POST line 108-132) | **Yes** — line 38-44 checks isPatient/isDoctor/isReceptionist | 401 (POST) / 403 (GET line 42) |
| `/api/lab-reports/patient` | GET | `requireRole('patient')` OR `requireRole('doctor')` | Per-role branch | Patient self-scoped (line 22); doctor must have order/booking with patient (lines 28-42) | 401 / 403 |
| `/api/prescription-access/request` | POST | `requireRole('doctor')` | Yes | Verifies prescription.booking.userId === patientId (line 49-58) | 401 |
| `/api/prescription-access/[id]/respond` | POST, DELETE | `requireRole('patient')` | Yes | **Yes** — line 52: `if (accessRequest.patientId !== user.id) return 403` | 403 |
| `/api/prescription-access/requests` | GET | `requireRole('patient')` | Yes | Self-scoped (`where: { patientId: user.id }` line 20) | 401 |
| `/api/prescription-access/granted` | GET | `requireRole('doctor')` | Yes | Self-scoped via `requestingDoctorId: doctor.id` | 401 |
| `/api/doctors` | GET | **NONE (public)** | — | — | — |
| `/api/doctors/[id]` | GET | **NONE (public)** | — | — | — |
| `/api/doctors/[id]/schedule` | GET | **NONE (public)** | — | — | — |
| `/api/hospitals` | GET | **NONE (public)** | — | — | — |
| `/api/contact` | POST | **NONE (public)** | — | — | — |
| `/api/auth/me` | GET | `getAuthUser` + dev fallback | — | — | 401 |
| `/api/online-doctors` | GET | `requireAuth` | None | None (proxies to mini-service) | 401 |

### IDOR Risk Assessment

- **Patient accessing another patient's bookings**: SAFE — every route that takes a booking ID checks `booking.userId !== user.id` and returns 404. BUT note: 404 (not 403) is returned, which **leaks information** (attacker can't distinguish "doesn't exist" from "belongs to someone else" — actually this is GOOD for security; it's the right behavior).
- **Patient accessing another patient's medical documents**:SAFE — line 22 of download route checks `doc.patientId !== user.id`. Returns 404. BUT: the actual medical files are stored as **public Cloudinary/Supabase URLs** (Section 10) — so if Patient A learns Patient B's `fileUrl`, they can download it directly without going through the API. The IDOR is on the URL itself, not the API.
- **Patient accessing another patient's lab reports**: SAFE at API level — patient self-scoped. Same Cloudinary URL exposure problem.
- **Patient accessing another patient's prescriptions**: SAFE — prescription-access request flow requires patient approval. Patient listing route filters by `booking.userId === user.id`.
- **Patient accessing doctor/hospital/admin data**: LIMITED — patients can view public doctor profiles and public hospital pages. They cannot access doctor/hospital/admin dashboards (proxy.ts blocks `/dashboard/doctor/*` for patient cookies — but again, only via JWT decode which doesn't verify signature).
- **Patient accessing staff data (nurse, receptionist, pharmacist, assistant)**: NOT EXPOSED — there are no patient-facing APIs that return staff info beyond the doctor's name/avatar in booking context.

### HTTP status when unauthorized
- **401 Unauthorized** is returned by most routes when no auth or wrong role.
- **403 Forbidden** is returned in only two places: `/api/bookings/[id]/chat` GET (line 43) and `/api/prescription-access/[id]/respond` (line 53).
- **404 Not Found** is returned for ownership failures — this is correct IDOR-resistant behavior.

### Critical authorization bypass — the dev-mode fallback
`src/lib/api-auth.ts:56-77`:
```
if (DEV_MODE) {
  if (roleCookie) {
    // Try to find the first Active user with that role
    const realUser = await db.user.findFirst({ where: { role: roleCookie, status: 'Active' } })
    if (realUser) return realUser
    // Else fall back to hardcoded DEV_USERS
    return getDevUser(roleCookie)
  }
}
```

`.env` has `DEV_MODE=1`. Therefore on the running dev server, ANY HTTP request that includes `Cookie: doctorooms_role=admin` will be authenticated as the first Active admin user — without needing a password, without needing a session cookie, without anything. This is a **CRITICAL auth bypass**.

Even in production (where `NODE_ENV=production` and the DEV_MODE check is false), the `doctorooms_session` cookie IS the User ID. If an attacker can guess or leak a user's ID (cuids are 24 chars of base36 — ~1.4×10^36 entropy, so not brute-forceable), they can forge a cookie and bypass auth entirely. Cuids appear in URLs (`/api/doctors/[id]`), so they are observable. A leaked user ID + a forged cookie = full account takeover with no password check.

---

*(Sections 5-22 omitted from this summary file — see the full audit transcript in the conversation history for the complete API inventory, database architecture, security architecture, medical data & privacy, audit logging, file security, appointment system, payment system, video consultation, notification system, error handling, edge cases, performance, frontend testing, cross-browser testing, top 10 risks, missing security controls, and final QA readiness assessment.)*

---

## Section 22 — FINAL QA READINESS ASSESSMENT (Summary)

### Scores (0-100)

| Category | Score | Rationale |
|---|---|---|
| **Functional readiness** | 55 | Core patient journey works. Major gaps: no patient-side payment, no reschedule, no follow-up, no account self-deletion, no email verification, no in-house lab report viewing. Bug: forgot-password client expects `data.otp` from server but server doesn't return it. |
| **Security readiness** | 15 | CRITICAL dev-mode auth bypass is LIVE. Session cookie = User ID. Stored XSS via patient blog. Public Cloudinary URLs. Hardcoded JWT fallback. No rate limiting. No security headers. Service worker caches PII. Public Jitsi video. Race condition in booking. No audit logging on patient actions. |
| **Privacy readiness** | 25 | Medical data in plain SQLite. Files in public Cloudinary buckets. PII cached in service worker. Audit log descriptions contain patient names. No consent management. No data export. No right-to-be-forgotten flow. No DPA/BAA with Jitsi. |
| **API readiness** | 50 | Most CRUD endpoints exist. No patient-side payment/refund. No idempotency. No rate limiting. Inconsistent error codes. No audit logging on patient routes. Some bugs (forgot-password client; doctor specialization/name field mismatches). |
| **Database readiness** | 45 | Schema reasonable. Missing critical unique constraint on Booking(doctorId, bookingDate, timeSlot). Missing indexes. No soft-delete. No retention policy. SQLite unsuitable for >500 concurrent users. No RLS — app-layer isolation only. |
| **Audit/logging readiness** | 10 | AuditLog table + helpers exist. Only 14 routes wire audit calls — NONE are patient routes. No IP/UA captured. No login failure logging. No medical record access logging. No payment logging. Patient activity invisible to auditors. |
| **Performance readiness** | 40 | Most queries reasonable. Some missing indexes. No pagination on appointments/prescriptions. Sequential queries where parallel better. SQLite won't scale beyond ~500 concurrent users. Service worker caching causes stale-data bugs. |
| **Production readiness** | 10 | DEV_MODE=1 in .env. .env has DUPLICATE `DEV_MODE=1` lines (line 2 and 3). Hardcoded JWT secret fallback. No HTTPS enforcement in code. No security headers. Service worker PII caching. Public Jitsi. Public Cloudinary URLs. No rate limiting. No monitoring/alerting. **CANNOT be deployed to production as-is for a healthcare application.** |

### BLOCKERS BEFORE PRODUCTION (must fix — 15 items)

1. **Remove DEV_MODE=1 from `.env`** + remove the dev-mode fallback in `api-auth.ts:56-77` + `/api/auth/me` dev fallback + proxy dev bypass.
2. **Replace User-ID-as-cookie with real session tokens** using the existing `createSession()` from `session.ts`. Update `getAuthUser` to call `verifySession(token)`.
3. **Remove the hardcoded JWT secret fallback** in `session.ts:17` — fail fast if `NEXTAUTH_SECRET` is unset.
4. **Sanitize blog post content** server-side (DOMPurify) OR switch to markdown rendering.
5. **Remove patient ability to set Post.status='Published'** directly — require admin review.
6. **Replace Jitsi SaaS with self-hosted Jitsi + JWT auth** OR a HIPAA-compliant video provider.
7. **Use signed Cloudinary/Supabase URLs** for medical files (short expiration).
8. **Stop service worker from caching `/api/*`** (`sw.ts:45-58`).
9. **Add `@@unique([doctorId, bookingDate, timeSlot, status])`** to Booking schema.
10. **Add rate limiting** middleware on `/api/auth/*`, `/api/contact`, `/api/patient/bookings`.
11. **Add security headers** (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy) via `proxy.ts`.
12. **Stop logging OTP to console** (`forgot-password/route.ts:27`).
13. **Add email verification** on registration (don't set status=Active until verified).
14. **Add audit logging** to all patient routes (booking create/cancel, medical document upload/download/delete, profile update, password change, prescription-access respond).
15. **Move OTP store from in-memory to Redis or DB table** (so it survives restarts and is shareable across instances).

### HIGH PRIORITY FIXES (should fix — 22 items)
1. Add rate limiting on all auth + booking endpoints.
2. Add brute-force protection (lockout after N failed login attempts).
3. Add CSRF tokens (or move to `sameSite=strict`).
4. Add file magic-byte verification (not just MIME).
5. Add malware scanning on uploaded files.
6. Add lab report file type restriction (currently accepts ANY type).
7. Add rate limiting on `/api/auth/forgot-password` + return same response regardless of email existence.
8. Add retry limits on `/api/auth/verify-otp`.
9. Add `error.tsx` error boundaries at the dashboard level.
10. Add pagination to `/api/dashboard/patient/appointments` and `/prescriptions`.
11. Add indexes on `Doctor.specialization/city/state`, `MedicalDocument.patientId`, `Post.authorId`.
12. Add audit log IP/UA capture in all `logAction` calls.
13. Add audit log retention policy (e.g. 7 years for HIPAA, then archive).
14. Add password reset email (real SMTP) instead of console.log OTP.
15. Add session invalidation on password change.
16. Add past-date validation on booking POST.
17. Add same-day cutoff (can't book a slot that ended).
18. Add no-show auto-cancellation (cron job).
19. Stop `/api/doctors/[id]` from leaking email — return only non-sensitive fields publicly.
20. Fix the `forgot-password` client to not expect `data.otp` (it's undefined).
21. Fix the doctor `specialization` selection in `/api/prescription-access/requests/route.ts:39` — `User` doesn't have `specialization` (it's on `Doctor`).
22. Fix the doctor `name` selection in `/api/opd-bills/route.ts:83` — `Doctor` doesn't have `name` (it's on `User`).

### MEDIUM PRIORITY FIXES (improvements — 20 items)
1. Add patient-side payment flow (Razorpay/Stripe) for online booking.
2. Add refund flow.
3. Add reschedule feature.
4. Add follow-up scheduling from a prescription.
5. Add patient-facing in-house lab reports view.
6. Add patient-facing vitals view.
7. Add standing medications list (`PatientMedication` model).
8. Add structured allergies field.
9. Add structured diagnoses (ICD-10 codes).
10. Add account self-deletion (GDPR right to be forgotten).
11. Add data export (GDPR portability).
12. Add consent management.
13. Add notification preference honoring in `createNotification`.
14. Add notification retry mechanism (exponential backoff).
15. Add idempotency keys on POST routes.
16. Switch from SQLite to PostgreSQL for production.
17. Add Redis for sessions + OTP store + rate limiting.
18. Add Sentry/Bugsnag error reporting.
19. Add ARIA labels + keyboard navigation.
20. Add error boundaries.

### LOW PRIORITY IMPROVEMENTS (nice-to-have — 15 items)
1. Add favorites/bookmarks for doctors.
2. Add search history (with opt-out).
3. Add privacy settings UI (actual controls, not just static text).
4. Add iOS Safari Web Notifications workaround (push subscription).
5. Add WebRTC network-failure recovery for video calls.
6. Add timezone selection for international patients.
7. Add multi-language support (Hindi/Marathi).
8. Add appointment reminders (cron-based).
9. Add "consultation started" / "consultation ended" events.
10. Add patient feedback analytics (anonymous aggregate).
11. Add patient onboarding flow.
12. Add patient education content (linked blog posts by disease).
13. Add family member accounts (linked patient profiles).
14. Add insurance claim tracking for patients.
15. Add care plan / treatment timeline visualization.

---

## Summary

The Patient Module has a working feature set for the basic patient journey (search doctors → book → wait → consult → view records). However, the security posture is **critically inadequate for a healthcare application**. The most severe issues are:

1. **DEV_MODE=1 is live** — anyone can become any role with a cookie.
2. **Session cookie IS the User ID** — no real session tokens, no revocation.
3. **Stored XSS via patient blog posts** — patient can run scripts in any visitor's browser.
4. **Public Jitsi video calls** — no auth, no privacy, third-party PHI processing.
5. **Public Cloudinary URLs for medical files** — leaked URLs = leaked medical records.
6. **Service worker caches all API responses** — PII persists after logout on shared devices.
7. **No rate limiting + no brute-force protection** — login is unbounded.
8. **Hardcoded JWT secret fallback** in source code.
9. **Race condition in booking** — no DB unique constraint.
10. **No audit logging on patient actions** — only login/logout is logged.

**Recommendation**: Do not deploy to production. Address the 15 BLOCKERS before any production deployment. For a healthcare application handling PHI, the current implementation falls far short of HIPAA / DPDPAA / GDPR requirements.

---

*End of audit report. This document was generated by Z.ai Code's Explore agent on 19 Aug 2026 by directly inspecting the source code at `/home/z/my-project`. No code was modified during this audit. For sections 5-21 (full API inventory, database architecture, security architecture, medical data & privacy, audit logging, file security, appointment system, payment system, video consultation, notification system, error handling, edge cases, performance, frontend testing, cross-browser testing, top 10 risks, and missing security controls), see the complete audit transcript in the conversation history — they were too detailed to fit in a single file.*
