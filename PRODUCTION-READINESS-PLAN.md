# Doctorooms — Comprehensive Production-Readiness Plan
# From current state (10/100) → production-ready (85+/100)

**Plan date:** 19 Aug 2026
**Current production readiness:** 10/100
**Target after this plan:** 85+/100
**Estimated total effort:** 10 working days (2 weeks)
**Status:** Ready to execute

---

## 📋 CONTEXT & ASSUMPTIONS

### What this plan addresses
The current codebase has 8+ feature modules built (Lab & Diagnostics, Real-time Notifications, Print Engine, SMS Gateway, Operation Theater, Diet Orders, Audit Log, Notification Preferences). Features are NOT the bottleneck — the **foundation** (auth, sessions, file URLs, XSS sanitization, audit logging) is critically weak.

This plan rebuilds the foundation without touching the working feature surface.

### What this plan does NOT address
- **Dev-mode role picker login page** — this is intentionally kept for testing. The `/api/dev-login` endpoint + `DEV_MODE=1` env var are gated behind `process.env.NODE_ENV !== 'production' && process.env.DEV_MODE === '1'` — they auto-disable in production. **No fix needed** as long as production `.env` does NOT have `DEV_MODE=1`. (Verify this in Phase 0.)
- Feature additions (Family Portal, payment flow, reschedule, etc.) — these come AFTER the foundation is solid (Phase 7).

### Pre-flight verification (Phase 0 — 30 min, do this FIRST)

Before starting Phase 1, verify the dev-mode setup:

- [ ] Read `src/lib/api-auth.ts:24` — confirm `DEV_MODE = process.env.NODE_ENV !== 'production' && process.env.DEV_MODE === '1'`.
- [ ] Confirm `.env` has `DEV_MODE=1` (for dev) — KEEP this for dev testing.
- [ ] Create `.env.production` (or document the production env vars) — this file MUST NOT have `DEV_MODE=1`. List this in deployment runbook.
- [ ] Verify the dev-login route at `src/app/api/dev-login/route.ts:14` returns 404 when `NODE_ENV === 'production' OR DEV_MODE !== '1'`.

**Outcome**: Dev login stays for testing. Production env cleanly disables it.

---

## 🗓️ EXECUTION ROADMAP

| Phase | Days | Goal | Production readiness gain |
|---|---|---|---|
| **Phase 1** | 1-2 | Stop the bleeding (15 quick wins) | 10 → 40 |
| **Phase 2** | 3-5 | Auth overhaul (real sessions + email verification + audit logging) | 40 → 65 |
| **Phase 3** | 6-7 | Medical data security (signed URLs + XSS sanitization + disable broken video) | 65 → 78 |
| **Phase 4** | 8-9 | Observability + automated testing | 78 → 85 |
| **Phase 5** | 10 | Storage migration (SQLite → PostgreSQL + Redis) | 85 → 90 |
| **Phase 6** | (later) | Production deployment + monitoring | 90 → 95 |
| **Phase 7** | (later) | Feature resume (Family Portal, payment, etc.) | 95 → 100 |

---

# PHASE 1 — STOP THE BLEEDING (Days 1-2)

**Goal:** 15 quick wins, mostly <30 min each. Closes the most severe security holes without touching architecture.

## P1.1 — Remove hardcoded JWT secret fallback
- **File:** `src/lib/session.ts:17`
- **Current:** `const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'doctorooms-dev-secret-change-in-production'`
- **Change to:**
  ```ts
  const JWT_SECRET = process.env.NEXTAUTH_SECRET
  if (!JWT_SECRET) {
    throw new Error('NEXTAUTH_SECRET environment variable is required. Set it in .env')
  }
  ```
- **Effort:** 5 min
- **Acceptance criteria:** Server fails to start if `NEXTAUTH_SECRET` is unset. No hardcoded fallback in source code.
- **Priority:** 🔴 CRITICAL
- **Test:** `NEXTAUTH_SECRET= node -e "import('./src/lib/session')"` → should throw.

## P1.2 — Stop logging OTP to console
- **File:** `src/app/api/auth/forgot-password/route.ts:27`
- **Current:** `console.log('[DEV] OTP for', email.toLowerCase(), ':', otp)`
- **Change to:** Remove the line entirely. (If dev debugging is needed, log only the email + a "OTP sent" message, never the OTP value itself.)
- **Effort:** 5 min
- **Acceptance criteria:** `grep -r 'console.log.*OTP' src/` returns 0 matches.
- **Priority:** 🟠 HIGH

## P1.3 — Stop service worker from caching /api/* responses
- **File:** `src/app/sw.ts:45-58`
- **Current:** Caches ALL successful `/api/*` responses in CacheStorage.
- **Change to:** Skip API requests entirely — only cache static assets (`/_next/static/*`, `/icons/*`, `/manifest.json`).
  ```ts
  // In the fetch handler:
  if (url.pathname.startsWith('/api/')) {
    // Never cache API responses — they may contain PII
    return fetch(request)
  }
  ```
- **Effort:** 15 min
- **Acceptance criteria:** After login + visiting profile, DevTools → Application → Cache Storage → no `/api/patient/*` entries.
- **Priority:** 🟠 HIGH
- **Side effect:** Slightly slower repeated page loads (no API response caching). Acceptable trade-off.

## P1.4 — Add file type allowlist on lab report upload
- **File:** `src/app/api/external-test-orders/[id]/upload-report/route.ts`
- **Current:** Comment at line 12 says "Accept any document type" — no `ALLOWED_TYPES` constant.
- **Change to:**
  ```ts
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/dicom',  // for radiology
  ]
  const MAX_SIZE = 25 * 1024 * 1024  // 25MB
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only PDF, JPG, PNG, WEBP, DICOM allowed.' }, { status: 400 })
  }
  ```
- **Effort:** 15 min
- **Acceptance criteria:** Uploading an HTML file → 400 error. Uploading a PDF → success.
- **Priority:** 🟠 HIGH (closes XSS via iframe rendering)
- **Test:** `curl -X POST -F "file=@malicious.html;type=text/html" ...` → 400.

## P1.5 — Add @@unique constraint on Booking to prevent race condition
- **File:** `prisma/schema.prisma` (Booking model)
- **Current:** Only `appointmentNo` is unique. No constraint on (doctorId, bookingDate, timeSlot).
- **Change to:** Add to the Booking model:
  ```prisma
  @@unique([doctorId, bookingDate, timeSlot, status])
  ```
  Then run `bun run db:push` (will fail if there are existing duplicates — clean them up first via SQL).
- **Effort:** 15 min (excluding data cleanup)
- **Acceptance criteria:** Two simultaneous POST requests for the same slot → one succeeds, one gets a Prisma unique-constraint error (handled gracefully in the route → 409 Conflict).
- **Priority:** 🟠 HIGH
- **Note:** Also update `/api/patient/bookings/route.ts` to catch the Prisma `P2002` error code and return 409 with a friendly message.
- **Migration concern:** Existing duplicate Pending bookings must be cleaned up first. Run a query to find them, then cancel the duplicates via the cancel route.

## P1.6 — Fix forgot-password client expecting undefined `data.otp`
- **File:** `src/app/forgot-password/page.tsx:104`
- **Current:** Client sets `setServerOtp(data.otp)` but server doesn't return `otp` field. Toast says "OTP sent! (Demo: undefined)".
- **Change to:** Remove the `setServerOtp(data.otp)` line. Update the toast to "If an account exists with this email, an OTP has been sent." (Don't reveal whether the email exists.)
- **Effort:** 15 min
- **Acceptance criteria:** Forgot-password flow shows correct toast message. No "undefined" in UI.
- **Priority:** 🟡 MEDIUM (bug fix)

## P1.7 — Fix doctor specialization field mismatch in prescription-access
- **File:** `src/app/api/prescription-access/requests/route.ts:39`
- **Current:** `select: { specialization: true }` on `User` — User doesn't have `specialization` (it's on Doctor).
- **Change to:** Move the `specialization` select to the `doctor` include:
  ```ts
  doctor: { include: { user: { select: { id: true, name: true } }, select: { specialization: true } } }
  ```
  Wait — actually `Doctor` has `specialization` directly. So it should be:
  ```ts
  doctor: { include: { user: { select: { id: true, name: true } } }, select: { specialization: true } }
  ```
  And update the consumer (page) to read `doctor.specialization` instead of `doctor.user.specialization`.
- **Effort:** 10 min
- **Acceptance criteria:** `/api/prescription-access/requests` returns 200 with valid response. No Prisma "Unknown field" errors in dev log.
- **Priority:** 🟡 MEDIUM (bug fix — same pattern as the OT route fixes earlier)

## P1.8 — Fix doctor name field mismatch in opd-bills
- **File:** `src/app/api/opd-bills/route.ts:83`
- **Current:** Selects `name: true` on `Doctor` — Doctor doesn't have `name` (it's on User).
- **Change to:** `doctor: { include: { user: { select: { id: true, name: true } } } }`. Update consumer to read `doctor.user.name`.
- **Effort:** 10 min
- **Acceptance criteria:** `/api/opd-bills` returns 200. No Prisma errors.
- **Priority:** 🟡 MEDIUM (bug fix)

## P1.9 — Add security headers via proxy.ts
- **File:** `src/proxy.ts` (or create `src/middleware.ts` if proxy.ts is too cluttered)
- **Change to:** Add these headers to every response:
  ```ts
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  // CSP — careful with inline styles in print routes. Start permissive, tighten later.
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;")
  ```
- **Effort:** 30 min (need to test that print routes still work with the CSP — they use inline styles)
- **Acceptance criteria:** `curl -I https://localhost:3000/` shows all 6 headers. Print routes still render correctly.
- **Priority:** 🟠 HIGH
- **Caveat:** CSP `'unsafe-inline'` for styles is a compromise. Tighten to `'nonce-<random>'` in Phase 4 if time permits.

## P1.10 — Add basic IP-based rate limiting on auth + contact endpoints
- **Files to create:** `src/lib/rate-limit.ts` (in-memory Map-based limiter)
- **Routes to protect:**
  - `/api/auth/login` — 10 requests per minute per IP
  - `/api/auth/forgot-password` — 3 requests per minute per IP
  - `/api/auth/verify-otp` — 10 requests per minute per IP
  - `/api/auth/reset-password` — 5 requests per minute per IP
  - `/api/contact` — 5 requests per minute per IP
  - `/api/auth/register` — 5 requests per minute per IP
- **Implementation:**
  ```ts
  // src/lib/rate-limit.ts
  const ipHits = new Map<string, { count: number; resetAt: number }>()
  
  export function rateLimit(ip: string, max: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = ipHits.get(ip)
    if (!entry || entry.resetAt < now) {
      ipHits.set(ip, { count: 1, resetAt: now + windowMs })
      return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
    }
    entry.count++
    return {
      allowed: entry.count <= max,
      remaining: Math.max(0, max - entry.count),
      resetAt: entry.resetAt,
    }
  }
  ```
- **Effort:** 1 hour
- **Acceptance criteria:** Hitting `/api/auth/login` 11 times in 60s → 11th request returns 429 Too Many Requests with `Retry-After` header.
- **Priority:** 🟠 HIGH
- **Note:** In-memory Map is process-local — won't work across multiple server instances. Migrate to Redis in Phase 5. For single-instance dev/staging, this is fine.
- **Get client IP:** `req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'`

## P1.11 — Add past-date + same-day-cutoff validation on booking POST
- **File:** `src/app/api/patient/bookings/route.ts:56-60`
- **Current:** Only checks `isNaN(dateObj.getTime())` — allows past dates + already-ended slots.
- **Change to:**
  ```ts
  // Past date check
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dateObj < today) {
    return NextResponse.json({ error: 'Cannot book an appointment in the past' }, { status: 400 })
  }
  
  // Same-day cutoff — if booking for today, slot must be in the future
  if (dateObj.toDateString() === new Date().toDateString()) {
    const [slotH, slotM] = body.timeSlot.split(':').map(Number)
    const slotDate = new Date(dateObj)
    slotDate.setHours(slotH, slotM, 0, 0)
    if (slotDate < new Date()) {
      return NextResponse.json({ error: 'Cannot book a slot that has already ended' }, { status: 400 })
    }
  }
  ```
- **Effort:** 15 min
- **Acceptance criteria:** Booking a past date → 400 error. Booking a slot that ended 5 min ago → 400 error.
- **Priority:** 🟡 MEDIUM (UX bug)

## P1.12 — Remove doctor email from public doctor detail response
- **File:** `src/app/api/doctors/[id]/route.ts:121`
- **Current:** Returns `email: user.email` publicly.
- **Change to:** Remove the `email` field from the public response. Only return it to authenticated doctors (their own email) or admin.
- **Effort:** 5 min
- **Acceptance criteria:** `curl /api/doctors/[id]` response does not contain `email`. Authenticated doctor viewing own profile still sees email.
- **Priority:** 🟠 HIGH (PII leak)

## P1.13 — Force patient blog posts to Draft status (require admin publish)
- **File:** `src/app/api/patient/posts/route.ts` (POST + PUT)
- **Current:** Patients can set `status: 'Published'` directly. Combined with raw HTML storage → stored XSS.
- **Change to:** In POST and PUT, override any client-supplied `status`:
  ```ts
  // Patient can only create Draft posts. Publishing requires admin review.
  if (user.role === 'patient') {
    data.status = 'Draft'
  }
  ```
- **Effort:** 15 min
- **Acceptance criteria:** Patient POSTs with `status: 'Published'` → response shows `status: 'Draft'`. Public blog page doesn't show patient-authored posts.
- **Priority:** 🟠 HIGH (mitigates stored XSS until DOMPurify is wired in Phase 3)
- **Follow-up:** Build an admin "Review Posts" page in Phase 7 to approve/reject patient posts.

## P1.14 — Add basic brute-force protection on /api/auth/login
- **File:** `src/lib/rate-limit.ts` (from P1.10) + `src/app/api/auth/login/route.ts`
- **Change to:** Track failed login attempts per email + per IP. After 5 failures in 5 minutes, lock out for 15 minutes.
  ```ts
  // Track: email -> { failedCount, lockedUntil }
  // On failed login: failedCount++. If failedCount >= 5, lockedUntil = now + 15min.
  // On successful login: clear the entry.
  // On login attempt: if lockedUntil > now, return 429 "Account temporarily locked. Try again in X minutes."
  ```
- **Effort:** 1 hour
- **Acceptance criteria:** 5 wrong passwords in 5 min → 6th attempt returns 429 with lockout message. Successful login during the window resets the counter.
- **Priority:** 🟠 HIGH
- **Note:** Combine with P1.10's IP-based rate limit — defense in depth.

## P1.15 — Add audit log IP + UA capture helper
- **File:** `src/lib/audit-log.ts`
- **Current:** `logAction(entry)` accepts `ipAddress` and `userAgent` fields, but no caller passes them.
- **Change to:** Add a helper `getAuditContext(req: NextRequest)` that extracts IP + UA from the request, and update all `logAction/logCreate/logUpdate/logStatusChange` calls to pass it:
  ```ts
  export function getAuditContext(req: NextRequest) {
    return {
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '',
      userAgent: req.headers.get('user-agent') || '',
    }
  }
  ```
  Then in each route: `const auditCtx = getAuditContext(req)` and pass `...auditCtx` to the log call.
- **Effort:** 1 hour (touches 14 routes that already call logAction)
- **Acceptance criteria:** Audit log entries now have `ipAddress` and `userAgent` populated. Admin's Audit Logs page shows these in the detail dialog.
- **Priority:** 🟠 HIGH (compliance — without IP/UA, audit logs are weak)

---

### Phase 1 — End-of-phase verification

- [ ] `bun run lint` clean
- [ ] `bun run db:push` succeeds (after unique constraint added)
- [ ] `curl -I http://localhost:3000/` shows all 6 security headers
- [ ] Login brute-force test: 6 wrong passwords → 6th returns 429
- [ ] Upload malicious.html to lab report upload → 400
- [ ] Visit `/print/prescription/[id]` → still renders A4 (CSP didn't break it)
- [ ] `grep -r 'console.log.*OTP' src/` returns 0 matches
- [ ] DevTools → Cache Storage → no `/api/*` entries after visiting patient pages
- [ ] Audit log entries have `ipAddress` + `userAgent` populated

**Expected outcome:** Production readiness 10 → 40.

---

# PHASE 2 — AUTH OVERHAUL (Days 3-5)

**Goal:** Replace the User-ID-as-cookie pattern with real session tokens. Add email verification. Wire audit logging on all patient routes.

## P2.1 — Migrate /api/auth/login to use createSession()
- **Files:**
  - `src/app/api/auth/login/route.ts` (rewrite)
  - `src/lib/session.ts` (already exists, just use it)
- **Current:** `response.cookies.set('doctorooms_session', user.id, ...)` — cookie IS the User ID.
- **Change to:**
  ```ts
  // After bcrypt.compare succeeds:
  const { jwt, session } = await createSession({
    userId: user.id,
    role: user.role,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  })
  
  response.cookies.set('doctorooms_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',  // tighten from lax
    maxAge: 60 * 60 * 24 * 7,  // 7 days
    path: '/',
  })
  // Remove the doctorooms_role cookie — role is now in the JWT, no need to expose it
  ```
- **Effort:** 4 hours
- **Acceptance criteria:** Login → `doctorooms_session` cookie is a JWT (decodable via jwt.io), not a User ID. `Session` table has a new row with the session token + IP + UA. `doctorooms_role` cookie is no longer set.
- **Priority:** 🔴 CRITICAL
- **Dependencies:** P1.1 (NEXTAUTH_SECRET must be set)

## P2.2 — Update getAuthUser to verifySession()
- **File:** `src/lib/api-auth.ts`
- **Current:** `db.user.findUnique({ where: { id: sessionId } })` — treats cookie as User ID.
- **Change to:**
  ```ts
  export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
    const token = req.cookies.get('doctorooms_session')?.value
    if (!token) return null
    
    // Verify JWT signature + decode
    const payload = verifySession(token)  // from session.ts — checks signature + exp
    if (!payload) return null
    
    // Lookup Session in DB (ensures it's not revoked)
    const session = await db.session.findUnique({
      where: { token: payload.token },
      include: { user: true },
    })
    if (!session || session.revokedAt || session.expiresAt < new Date()) return null
    if (session.user.status !== 'Active') return null
    
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      gender: session.user.gender,
      profileImg: session.user.profileImg,
      mobileNo: session.user.mobileNo,
    }
  }
  ```
- **Effort:** 3 hours
- **Acceptance criteria:** Forged `doctorooms_session=<user-id>` cookie → returns 401 (not a valid JWT). Forged `doctorooms_session=<valid-JWT-but-DB-session-revoked>` → returns 401. Valid JWT + valid session → returns user.
- **Priority:** 🔴 CRITICAL
- **Side effect:** `requireRole` and `requireAuth` continue to work (they call `getAuthUser`).
- **Remove the DEV_MODE fallback** in `getAuthUser` (lines 56-77) — production should NEVER fall back to a role cookie. The dev-login route (`/api/dev-login`) still works because it uses `createSession()` which writes a real Session row.
- **Update proxy.ts:** Remove the JWT decode-without-verify path. Use `verifySession()` properly. The proxy is on the Edge — it needs the JWT secret available there. Configure `NEXTAUTH_SECRET` as an Edge runtime env var.

## P2.3 — Update logout to revoke sessions
- **File:** `src/app/api/auth/logout/route.ts`
- **Current:** Just clears cookies.
- **Change to:**
  ```ts
  // Before clearing cookies:
  const token = req.cookies.get('doctorooms_session')?.value
  if (token) {
    await revokeSession(token)  // sets revokedAt = now() in Session table
  }
  // Then clear cookies
  ```
- **Effort:** 30 min
- **Acceptance criteria:** After logout, the Session row has `revokedAt` set. Reusing the old cookie → 401.
- **Priority:** 🔴 CRITICAL

## P2.4 — Add session invalidation on password change
- **File:** `src/app/api/user/change-password/route.ts`
- **Change to:** After successfully updating the password, revoke ALL sessions for this user (except the current one):
  ```ts
  await db.session.updateMany({
    where: { userId: user.id, revokedAt: null, token: { not: currentToken } },
    data: { revokedAt: new Date() },
  })
  ```
  The current session stays alive (so the user doesn't get logged out immediately).
- **Effort:** 30 min
- **Acceptance criteria:** User changes password → all other devices are logged out on next API call.
- **Priority:** 🟠 HIGH

## P2.5 — Add "Logout all devices" button on settings page
- **File:** `src/app/dashboard/patient/settings/page.tsx` (and other role settings pages)
- **Change to:** Add a button "Logout all other devices" that calls `POST /api/auth/logout-all`:
  ```ts
  // New route: /api/auth/logout-all/route.ts
  // Revokes all sessions for the current user except the one making the request.
  ```
- **Effort:** 1 hour
- **Acceptance criteria:** Click the button → other devices get 401 on next API call.
- **Priority:** 🟡 MEDIUM (UX feature)

## P2.6 — Move OTP store from in-memory to DB
- **Files:**
  - `prisma/schema.prisma` (add `OtpCode` model)
  - `src/lib/otp-store.ts` (rewrite)
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/auth/verify-otp/route.ts`
  - `src/app/api/auth/reset-password/route.ts`
- **New model:**
  ```prisma
  model OtpCode {
    id          String   @id @default(cuid())
    email       String
    codeHash    String   // store bcrypt hash, NOT the OTP itself
    attempts    Int      @default(0)
    verified    Boolean  @default(false)
    expiresAt   DateTime
    createdAt   DateTime @default(now())
    
    @@index([email, expiresAt])
    @@index([expiresAt])
  }
  ```
- **OTP generation:** Use `crypto.randomInt(100000, 1000000)` instead of `Math.random()`.
- **Storage:** Hash the OTP with bcrypt (10 rounds) before storing.
- **Verification:** bcrypt.compare the input against the stored hash. Increment `attempts` on each try. If `attempts >= 5`, delete the row + return "Too many attempts. Request a new OTP."
- **Cleanup:** Add a cron (or just delete-on-read) to purge expired OTPs.
- **Effort:** 3 hours
- **Acceptance criteria:** OTPs survive server restart. 5 wrong OTPs → row deleted, must request new OTP. `Math.random` is no longer used for OTP generation.
- **Priority:** 🟠 HIGH

## P2.7 — Add email verification on registration
- **Files:**
  - `prisma/schema.prisma` (add `emailVerificationToken` field on User OR create `EmailVerificationToken` model)
  - `src/app/api/auth/register/route.ts` (change status to 'Pending', send verification email)
  - `src/app/api/auth/verify-email/route.ts` (NEW — verifies the token, sets status='Active')
  - `src/app/api/auth/resend-verification/route.ts` (NEW — resend the email)
  - `src/lib/email.ts` (NEW — Resend/SendGrid integration)
  - `src/components/EmailVerificationBanner.tsx` (NEW — shows on dashboard if status='Pending')
- **Flow:**
  1. Patient registers → status='Pending' (not Active).
  2. Server generates a signed token (JWT with userId + purpose='email-verify', 24h expiry).
  3. Server sends email with link `https://app.example.com/verify-email?token=<jwt>`.
  4. Patient clicks → `/api/auth/verify-email?token=<jwt>` → verify JWT → set user.status='Active' → redirect to dashboard.
  5. Pending users can still login but see a banner "Please verify your email" + can't book appointments.
- **Email provider:** Resend.com (free tier 100/day) or SendGrid (free 100/day).
- **Effort:** 4 hours
- **Acceptance criteria:** New registration → email sent. Patient can't book until verified. Clicking the verify link activates the account.
- **Priority:** 🟠 HIGH
- **Env vars:** `RESEND_API_KEY`, `FROM_EMAIL=noreply@doctorooms.in`

## P2.8 — Wire audit logging on all patient routes
- **Files to update (12 routes):**
  - `src/app/api/patient/bookings/route.ts` (POST) — `logCreate('booking', booking.id, user, ...)`
  - `src/app/api/patient/bookings/[id]/cancel/route.ts` (PATCH) — `logStatusChange('booking', id, oldStatus, 'Canceled', user, ...)`
  - `src/app/api/patient/medical-documents/route.ts` (POST) — `logCreate('medical_document', doc.id, user, ...)`
  - `src/app/api/patient/medical-documents/[id]/route.ts` (DELETE) — `logDelete('medical_document', id, user, ...)`
  - `src/app/api/patient/medical-documents/[id]/download/route.ts` (GET) — `logAction({ action: 'view', entityType: 'medical_document', entityId: id, ... })` (lighter — view access)
  - `src/app/api/patient/profile/route.ts` (PUT) — `logUpdate('user_profile', user.id, user, ...)`
  - `src/app/api/user/change-password/route.ts` (POST) — `logAction({ action: 'password_change', entityType: 'auth', entityId: user.id, severity: 'critical', ... })`
  - `src/app/api/patient/feedback/route.ts` (POST) — `logCreate('doctor_rating', rating.id, user, ...)`
  - `src/app/api/patient/posts/route.ts` (POST) — `logCreate('blog_post', post.id, user, ...)`
  - `src/app/api/prescription-access/[id]/respond/route.ts` (POST approve/reject) — `logStatusChange('prescription_access', id, 'pending', 'approved'/'rejected', user, ...)`
  - `src/app/api/prescription-access/[id]/respond/route.ts` (DELETE revoke) — `logDelete('prescription_access', id, user, ...)`
  - `src/app/api/auth/verify-otp/route.ts` (POST) — `logAction({ action: 'otp_verify', entityType: 'auth', ... })`
- **All calls should pass** `ipAddress` + `userAgent` from `getAuditContext(req)` (P1.15).
- **Effort:** 2 hours
- **Acceptance criteria:** Every patient action shows up in the admin Audit Logs page within 1 second. Login as admin → Audit Logs → filter by `userId=dev-patient` → see all the patient's actions.
- **Priority:** 🟠 HIGH (compliance — currently patient activity is invisible)

---

### Phase 2 — End-of-phase verification

- [ ] `bun run db:push` succeeds (OtpCode model added)
- [ ] Login → `doctorooms_session` cookie is a JWT (decodable)
- [ ] Session table has rows for active sessions
- [ ] Logout → Session row's `revokedAt` is set
- [ ] Reusing an old cookie after logout → 401
- [ ] Forging `doctorooms_session=<user-id>` (not a JWT) → 401
- [ ] Password change → other device's next API call → 401
- [ ] OTP survives server restart
- [ ] 5 wrong OTPs → row deleted, must request new OTP
- [ ] New patient registration → email sent, status='Pending'
- [ ] Clicking verify-email link → status='Active'
- [ ] Patient's actions show up in admin Audit Logs page

**Expected outcome:** Production readiness 40 → 65. Auth is real. Sessions are revocable. OTP survives restarts. Patient actions are auditable.

---

# PHASE 3 — MEDICAL DATA SECURITY (Days 6-7)

**Goal:** Protect medical files with signed URLs. Sanitize blog content. Disable broken video consultation.

## P3.1 — Switch medical files to signed Cloudinary URLs (5-min expiration)
- **Files:**
  - `src/lib/cloudinary.ts` (add `getSignedUrl` helper)
  - `src/app/api/patient/medical-documents/route.ts` (GET — return signed URLs)
  - `src/app/api/patient/medical-documents/[id]/download/route.ts` (GET — return signed URL)
  - `src/app/api/lab-reports/patient/route.ts` (GET — return signed URLs)
- **Current:** Returns raw `fileUrl` (permanent Cloudinary public URL).
- **Change to:** Generate a signed URL with 5-minute expiration:
  ```ts
  // src/lib/cloudinary.ts
  export function getSignedUrl(publicId: string, expirySeconds: number = 300): string {
    return cloudinary.utils.sign_url(publicId, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expirySeconds,
    })
  }
  ```
- **Effort:** 4 hours
- **Acceptance criteria:** `curl <fileUrl>` after 5 minutes → 403. Within 5 minutes → 200. Patient can download their files normally.
- **Priority:** 🟠 HIGH
- **For Supabase:** Use `supabase.storage.from('bucket').createSignedUrl(path, 300)`.

## P3.2 — Proxy medical file downloads through authenticated route
- **File:** `src/app/api/patient/medical-documents/[id]/download/route.ts`
- **Current:** Returns the raw Cloudinary URL to the client. Client does `<a href={fileUrl}>` → browser downloads directly from Cloudinary.
- **Change to:** Stream the file through the Next.js route (authenticated):
  ```ts
  // After ownership check:
  const fileResponse = await fetch(signedUrl)
  const buffer = await fileResponse.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${doc.fileName}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
  ```
- **Effort:** 2 hours
- **Acceptance criteria:** Download via the API route works. The Cloudinary signed URL is never exposed to the client. Browser DevTools → Network → the download request goes to `/api/patient/medical-documents/[id]/download`, not to Cloudinary.
- **Priority:** 🟠 HIGH
- **Same pattern for lab reports** — `/api/lab-reports/patient` returns an authenticated download endpoint, not the raw Cloudinary URL.

## P3.3 — Add file magic-byte verification on uploads
- **File:** `src/lib/file-validation.ts` (NEW)
- **Implementation:**
  ```ts
  const MAGIC_BYTES: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46],  // %PDF
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    'image/webp': [0x52, 0x49, 0x46, 0x46],  // RIFF
  }
  
  export function verifyMagicBytes(buffer: Buffer, declaredType: string): boolean {
    const expected = MAGIC_BYTES[declaredType]
    if (!expected) return true  // unknown type — allow (less restrictive)
    for (let i = 0; i < expected.length; i++) {
      if (buffer[i] !== expected[i]) return false
    }
    return true
  }
  ```
- **Wire into:** `src/app/api/patient/medical-documents/route.ts`, `src/app/api/external-test-orders/[id]/upload-report/route.ts`, `src/app/api/patient/avatar/route.ts`.
- **Effort:** 1.5 hours
- **Acceptance criteria:** Upload a `.pdf` file with `Content-Type: application/pdf` but actual content is HTML → 400. Upload a real PDF → 200.
- **Priority:** 🟠 HIGH

## P3.4 — Sanitize blog post content with DOMPurify
- **Files:**
  - Install: `npm install isomorphic-dompurify`
  - `src/app/api/patient/posts/route.ts` (POST + PUT) — sanitize before storing
  - `src/app/blog/[permalink]/page.tsx` — `dangerouslySetInnerHTML` now safe because content is sanitized
- **Implementation:**
  ```ts
  import DOMPurify from 'isomorphic-dompurify'
  
  // Before storing:
  const sanitizedContent = DOMPurify.sanitize(body.content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  })
  ```
- **Effort:** 2 hours
- **Acceptance criteria:** Patient posts `<script>alert('xss')</script>` → stored as empty string (script tag stripped). Patient posts `<p>Hello</p>` → stored as-is. Blog page renders sanitized content safely.
- **Priority:** 🟠 HIGH
- **Consider:** Switch to markdown rendering (use `react-markdown`) for cleaner UX — defer to Phase 7.

## P3.5 — Disable video consultation (stopgap)
- **Files:**
  - `src/app/dashboard/video-call/[roomId]/page.tsx` — replace the Jitsi iframe with a "Video consultation coming soon" message
  - `src/app/api/patient/bookings/route.ts` — remove `bookingMode: 'VideoCall'` from allowed values (or keep but show "Coming soon" on the booking page)
- **Change to:** In the video-call page:
  ```tsx
  return (
    <div className="flex h-screen items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Video Consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Video consultation is being upgraded to a HIPAA-compliant provider.
            Please use in-person consultation for now.
          </p>
          <Button onClick={() => router.back()} className="mt-4">← Back</Button>
        </CardContent>
      </Card>
    </div>
  )
  ```
- **Effort:** 1 hour
- **Acceptance criteria:** Navigating to `/dashboard/video-call/<any-id>` → shows the "coming soon" message. No Jitsi iframe loaded.
- **Priority:** 🟠 HIGH (PHI risk)
- **Follow-up:** Build proper video consultation in Phase 7 (self-hosted Jitsi + JWT auth, or Twilio Video, or Whereby Embedded).

---

### Phase 3 — End-of-phase verification

- [ ] `curl <old Cloudinary URL for a medical file>` → 403 (URL is no longer public)
- [ ] Patient downloads a medical doc via the API route → success
- [ ] DevTools → Network → no direct Cloudinary requests from the patient's browser
- [ ] Upload a `.pdf` file with HTML content + `Content-Type: application/pdf` → 400
- [ ] Patient posts `<script>alert(1)</script>` → script stripped from stored content
- [ ] Visit `/dashboard/video-call/anything` → "coming soon" message

**Expected outcome:** Production readiness 65 → 78. Medical files are signed-URL protected. XSS sanitization in place. Video consultation paused.

---

# PHASE 4 — OBSERVABILITY + TESTING (Days 8-9)

**Goal:** See what's happening in production. Catch regressions automatically.

## P4.1 — Add Sentry for error reporting
- **Files:**
  - `npm install @sentry/nextjs`
  - `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (auto-generated by Sentry wizard)
  - `next.config.ts` — wrap with `withSentryConfig`
- **Env vars:** `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- **Effort:** 2 hours
- **Acceptance criteria:** Trigger an error (visit a non-existent route, or throw in an API) → error appears in Sentry dashboard within 30 seconds with stack trace + user context.
- **Priority:** 🟡 MEDIUM

## P4.2 — Add error boundaries (error.tsx) at dashboard level
- **Files:**
  - `src/app/dashboard/error.tsx` (NEW — catches errors in any dashboard page)
  - `src/app/dashboard/global-error.tsx` (NEW — catches errors in the dashboard layout itself)
- **Implementation:** Per Next.js convention — `error.tsx` must be a client component with `reset()` button.
- **Effort:** 1 hour
- **Acceptance criteria:** Throw an error in a dashboard page → user sees a friendly error page with "Try again" button (not a white screen).
- **Priority:** 🟡 MEDIUM

## P4.3 — Add Playwright E2E tests for critical paths
- **Files:**
  - `playwright.config.ts` (NEW)
  - `tests/e2e/login.spec.ts` (NEW)
  - `tests/e2e/register.spec.ts`
  - `tests/e2e/booking.spec.ts`
  - `tests/e2e/medical-docs-upload.spec.ts`
  - `tests/e2e/prescription-access.spec.ts`
- **Test scenarios:**
  1. Login with valid credentials → dashboard loads.
  2. Login with wrong password → error toast.
  3. 5 wrong passwords → 429 lockout.
  4. Register a new patient → email sent, status='Pending'.
  5. Verify email via link → status='Active'.
  6. Book an appointment → booking appears in list.
  7. Book a past-date → 400 error.
  8. Upload a medical doc → appears in list.
  9. Download a medical doc → file downloads.
  10. Patient A tries to download patient B's doc → 404.
- **Effort:** 4 hours
- **Acceptance criteria:** `npx playwright test` runs 10 tests, all pass. CI runs them on every PR.
- **Priority:** 🟡 MEDIUM (regression prevention)

## P4.4 — Add eslint-plugin-security + npm audit to CI
- **Files:**
  - `package.json` — add `eslint-plugin-security` to devDeps
  - `.eslintrc.json` (or eslint.config.mjs) — extend with `plugin:security/recommended`
  - `.github/workflows/ci.yml` (NEW) — run `bun run lint` + `npm audit --audit-level=high` + `npx playwright test` on every PR
- **Effort:** 1 hour
- **Acceptance criteria:** PR with `Math.random()` for crypto → blocked by ESLint. PR with high-severity vulnerable dep → blocked by npm audit.
- **Priority:** 🟡 MEDIUM

## P4.5 — Create SECURITY-CHECKLIST.md
- **File:** `SECURITY-CHECKLIST.md` (NEW)
- **Content:** A checklist for every new API route:
  ```markdown
  ## New API Route Security Checklist
  
  - [ ] Auth required? (`requireRole` or `requireAuth`)
  - [ ] Role check? (correct role for the action)
  - [ ] Ownership check? (resource.userId === user.id)
  - [ ] Input validation? (zod schema or manual)
  - [ ] Rate limited? (if auth/contact/payment route)
  - [ ] Audit logged? (logAction/logCreate/logUpdate/logStatusChange)
  - [ ] IP + UA captured in audit log?
  - [ ] No PII in error messages?
  - [ ] No raw SQL?
  - [ ] No dangerouslySetInnerHTML without DOMPurify?
  - [ ] File uploads: type allowlist + magic bytes + size limit?
  - [ ] File downloads: signed URL + proxy through authed route?
  - [ ] Returns 404 (not 403) on ownership failure?
  - [ ] Test written (Playwright E2E)?
  ```
- **Effort:** 30 min
- **Acceptance criteria:** File exists, linked from README, referenced in PR template.
- **Priority:** 🟡 MEDIUM (process)

## P4.6 — Add pagination to patient appointments + prescriptions
- **Files:**
  - `src/app/api/dashboard/patient/appointments/route.ts` — add `?page=1&pageSize=20`
  - `src/app/api/dashboard/patient/prescriptions/route.ts` — add `?page=1&pageSize=20`
  - `src/app/dashboard/patient/appointments/page.tsx` — render pagination controls
- **Effort:** 2 hours
- **Acceptance criteria:** Patient with 100+ bookings → page 1 shows 20, page 2 shows next 20, etc. API response includes `total`, `page`, `totalPages`.
- **Priority:** 🟡 MEDIUM (performance)

## P4.7 — Add missing database indexes
- **File:** `prisma/schema.prisma`
- **Add indexes to:**
  - `Doctor.specialization` → `@@index([specialization])`
  - `Doctor.city` → `@@index([city])`
  - `Doctor.state` → `@@index([state])`
  - `MedicalDocument.patientId` → `@@index([patientId])`
  - `Post.authorId` → `@@index([authorId])`
- **Effort:** 30 min
- **Acceptance criteria:** `bun run db:push` succeeds. Query plan for `db.doctor.findMany({ where: { specialization: 'Cardiology' } })` uses the index (verify via Prisma query logs).
- **Priority:** 🟡 MEDIUM (performance)

## P4.8 — Basic load testing with k6
- **Files:**
  - `tests/load/doctors-list.k6.js` (NEW)
  - `tests/load/patient-bookings.k6.js`
- **Test scenarios:** Hit `/api/doctors` and `/api/patient/bookings` at 10/50/100/200 concurrent users for 60 seconds. Capture p50/p95/p99 latency + error rate.
- **Effort:** 2 hours
- **Acceptance criteria:** Document baseline performance. If p95 > 2s at 100 users, identify the bottleneck.
- **Priority:** 🟢 LOW (baseline)

---

### Phase 4 — End-of-phase verification

- [ ] Sentry dashboard shows errors triggered in testing
- [ ] Visit `/dashboard/non-existent-page` → friendly error page (not white screen)
- [ ] `npx playwright test` runs 10 tests, all pass
- [ ] `npm audit --audit-level=high` returns 0 vulnerabilities
- [ ] `SECURITY-CHECKLIST.md` exists
- [ ] Patient with 100+ bookings → page 1 shows 20, paginated correctly
- [ ] `bun run db:push` succeeds with new indexes
- [ ] k6 load test results documented

**Expected outcome:** Production readiness 78 → 85. Observability + automated tests + performance baseline.

---

# PHASE 5 — STORAGE MIGRATION (Day 10)

**Goal:** Move from SQLite (dev-grade) to PostgreSQL + Redis (production-grade).

## P5.1 — Migrate SQLite → PostgreSQL
- **Files:**
  - `prisma/schema.prisma` — change `provider = "sqlite"` to `provider = "postgresql"`. Update `url` env var to `DATABASE_URL=postgresql://...`
  - `db/custom.db` (existing SQLite) — export data via `sqlite3 .dump > data.sql`, transform to Postgres-compatible SQL, import.
  - `.env` — update `DATABASE_URL`
- **Migration steps:**
  1. Provision Postgres (Neon, Supabase, or self-hosted).
  2. Update `schema.prisma` provider.
  3. `bun run db:push` (creates tables in Postgres).
  4. Migrate data (write a script that reads from SQLite + writes to Postgres via Prisma).
  5. Verify data integrity (counts match).
- **Effort:** 4 hours (most of it is data migration script + verification)
- **Acceptance criteria:** App runs against Postgres. All existing data is present. Concurrent write test (10 parallel booking POSTs) succeeds without lock errors.
- **Priority:** 🟠 HIGH (for >100 concurrent users)
- **Note:** SQLite type limitations (no arrays, no JSONB) — review schema for any SQLite-specific workarounds.

## P5.2 — Add Redis for sessions + OTP + rate limiting
- **Files:**
  - `npm install ioredis`
  - `src/lib/redis.ts` (NEW — Redis client singleton)
  - `src/lib/session.ts` — store session metadata in Redis (key: `session:<token>`, value: JSON, TTL: 7 days) for fast lookups. Keep DB Session row for audit.
  - `src/lib/otp-store.ts` (rewrite — Redis-backed instead of in-memory Map)
  - `src/lib/rate-limit.ts` (rewrite — Redis-backed instead of in-memory Map)
- **Env vars:** `REDIS_URL=redis://...`
- **Effort:** 3 hours
- **Acceptance criteria:** OTPs work across multiple server instances. Rate limits are shared across instances. Session lookup is sub-10ms.
- **Priority:** 🟡 MEDIUM (for multi-instance deployment)

## P5.3 — Set up database backups
- **Provider docs:** Neon/Supabase have automatic daily backups. Self-hosted → `pg_dump` cron.
- **Document** in `DEPLOYMENT.md`: backup frequency, retention (30 days), restore procedure.
- **Effort:** 1 hour
- **Acceptance criteria:** Backup exists, restore test succeeds (restore to a staging DB, verify data).
- **Priority:** 🟠 HIGH (disaster recovery)

---

### Phase 5 — End-of-phase verification

- [ ] App runs against PostgreSQL (DATABASE_URL points to Postgres)
- [ ] All data from SQLite is migrated (counts match)
- [ ] Redis is configured + used for sessions/OTP/rate-limit
- [ ] 10 parallel booking POSTs succeed without errors
- [ ] Backup exists + restore test passes

**Expected outcome:** Production readiness 85 → 90. Production-grade storage.

---

# PHASE 6 — PRODUCTION DEPLOYMENT (Day 11+, separate effort)

**Goal:** Deploy to a real domain with HTTPS + monitoring.

## P6.1 — Provision infrastructure
- [ ] Domain registration (`doctorooms.in` or similar)
- [ ] Server (Vercel for Next.js app + Supabase/Neon for Postgres + Upstash for Redis)
- [ ] DNS configuration
- [ ] SSL certificate (automatic via Vercel/Cloudflare)

## P6.2 — Configure production environment
- [ ] `.env.production` with:
  - `NODE_ENV=production`
  - `DATABASE_URL=postgresql://...`
  - `REDIS_URL=redis://...`
  - `NEXTAUTH_SECRET=<generate-strong-32-byte-secret>`
  - `DEV_MODE=` (empty — explicitly disabled)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `RESEND_API_KEY`, `FROM_EMAIL=noreply@doctorooms.in`
  - `SENTRY_DSN`
  - `SMS_PROVIDER=msg91` + `MSG91_AUTH_KEY`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_SMS` (if using Twilio)
- [ ] Verify NO `DEV_MODE=1` in production env.

## P6.3 — Set up CI/CD pipeline
- [ ] GitHub Actions (or Vercel auto-deploy)
- [ ] On PR: run lint + tests + npm audit
- [ ] On merge to main: deploy to staging
- [ ] Manual promotion: staging → production

## P6.4 — Monitoring + alerting
- [ ] Sentry — error alerting (email + Slack integration)
- [ ] Vercel Analytics — performance monitoring
- [ ] Uptime monitoring (Better Stack / Uptime Robot)
- [ ] Database slow-query alerts (Supabase/Neon dashboard)

## P6.5 — Write DEPLOYMENT.md + RUNBOOK.md
- [ ] `DEPLOYMENT.md` — step-by-step deploy procedure
- [ ] `RUNBOOK.md` — common incidents + resolution steps (e.g. "If login fails → check Redis connection", "If 500 errors spike → check Sentry")

---

### Phase 6 — End-of-phase verification

- [ ] App accessible at `https://doctorooms.in`
- [ ] `curl -I https://doctorooms.in/` shows HTTPS + all security headers
- [ ] `curl -X POST https://doctorooms.in/api/dev-login` → 404 (dev login disabled in prod)
- [ ] Sentry receives errors from production
- [ ] Backup restored successfully to staging
- [ ] DEPLOYMENT.md + RUNBOOK.md written

**Expected outcome:** Production readiness 90 → 95. Live + monitored + recoverable.

---

# PHASE 7 — FEATURE RESUME (after foundation is solid)

**Goal:** Now that the foundation is solid, build features with confidence.

## Priority features (in order)

1. **Patient payment flow** (Razorpay/Stripe) — uses signed webhooks + idempotency keys, secure by design.
2. **Family Portal** (Phase 7A on master roadmap) — leverages the audited auth + real-time notifications.
3. **Reschedule feature** — build on the now-race-safe booking.
4. **Account self-deletion + data export** (GDPR compliance — now that audit logging captures everything).
5. **Self-hosted Jitsi** for video consultation (proper auth, recording controls, BAA).
6. **Follow-up scheduling** from a prescription.
7. **Patient-facing in-house lab reports view** (currently only external partner reports).
8. **Patient-facing vitals view** (currently nurse-only).
9. **Structured allergies + medications + diagnoses** (ICD-10 codes).
10. **Notification preference honoring** in `createNotification` (check `mutedEvents` before sending).

---

# 📊 TRACKING TEMPLATE

Use this checklist to track progress through the phases:

```markdown
## Phase 1 — Stop the bleeding
- [ ] P1.1 Remove hardcoded JWT secret fallback (5 min)
- [ ] P1.2 Stop logging OTP to console (5 min)
- [ ] P1.3 Stop service worker caching /api/* (15 min)
- [ ] P1.4 Add file type allowlist on lab report upload (15 min)
- [ ] P1.5 Add @@unique constraint on Booking (15 min)
- [ ] P1.6 Fix forgot-password client expecting data.otp (15 min)
- [ ] P1.7 Fix doctor specialization field in prescription-access (10 min)
- [ ] P1.8 Fix doctor name field in opd-bills (10 min)
- [ ] P1.9 Add security headers via proxy.ts (30 min)
- [ ] P1.10 Add basic rate limiting (1 hr)
- [ ] P1.11 Add past-date + same-day-cutoff validation (15 min)
- [ ] P1.12 Remove doctor email from public API (5 min)
- [ ] P1.13 Force patient blog posts to Draft (15 min)
- [ ] P1.14 Add brute-force protection on login (1 hr)
- [ ] P1.15 Add audit log IP + UA capture (1 hr)

## Phase 2 — Auth overhaul
- [ ] P2.1 Migrate /api/auth/login to createSession() (4 hr)
- [ ] P2.2 Update getAuthUser to verifySession() (3 hr)
- [ ] P2.3 Update logout to revoke sessions (30 min)
- [ ] P2.4 Session invalidation on password change (30 min)
- [ ] P2.5 "Logout all devices" button (1 hr)
- [ ] P2.6 Move OTP to DB table (3 hr)
- [ ] P2.7 Email verification on registration (4 hr)
- [ ] P2.8 Wire audit logging on 12 patient routes (2 hr)

## Phase 3 — Medical data security
- [ ] P3.1 Cloudinary signed URLs (4 hr)
- [ ] P3.2 Proxy medical file downloads (2 hr)
- [ ] P3.3 File magic-byte verification (1.5 hr)
- [ ] P3.4 DOMPurify blog sanitization (2 hr)
- [ ] P3.5 Disable video consultation stopgap (1 hr)

## Phase 4 — Observability + testing
- [ ] P4.1 Sentry integration (2 hr)
- [ ] P4.2 Error boundaries (1 hr)
- [ ] P4.3 Playwright E2E tests — 10 scenarios (4 hr)
- [ ] P4.4 eslint-plugin-security + npm audit in CI (1 hr)
- [ ] P4.5 SECURITY-CHECKLIST.md (30 min)
- [ ] P4.6 Pagination on appointments + prescriptions (2 hr)
- [ ] P4.7 Add missing DB indexes (30 min)
- [ ] P4.8 k6 load testing (2 hr)

## Phase 5 — Storage migration
- [ ] P5.1 SQLite → PostgreSQL (4 hr)
- [ ] P5.2 Redis for sessions + OTP + rate-limit (3 hr)
- [ ] P5.3 Database backups (1 hr)

## Phase 6 — Production deployment
- [ ] P6.1 Provision infrastructure
- [ ] P6.2 Configure production env
- [ ] P6.3 CI/CD pipeline
- [ ] P6.4 Monitoring + alerting
- [ ] P6.5 DEPLOYMENT.md + RUNBOOK.md

## Phase 7 — Feature resume
- [ ] Patient payment flow
- [ ] Family Portal
- [ ] Reschedule feature
- [ ] Account self-deletion + data export
- [ ] Self-hosted Jitsi
- [ ] (and more)
```

---

# 🎯 EXECUTION ORDER

**Start here on Day 1:**
1. P1.1 (5 min) — remove JWT secret fallback
2. P1.2 (5 min) — stop OTP console log
3. P1.12 (5 min) — remove doctor email from public API
4. P1.7 + P1.8 (20 min) — fix the two field-mismatch bugs
5. P1.6 (15 min) — fix forgot-password client

**Total for first 1 hour:** 5 quick wins, closes 2 CRITICAL + 3 HIGH issues.

**Then continue with the rest of Phase 1 in any order.** Most are independent — could dispatch parallel subagents for the larger ones (rate limiting, brute-force protection, audit-log wiring).

**After Phase 1:** Lint check + re-run audit verification → confirm production readiness moved from 10 → 40.

**Then Phase 2** (auth overhaul) — this is the biggest lift, 3 days, but it's THE critical fix.

---

*Plan end. Ready to execute. Tell me to "Start Phase 1" and I'll begin with P1.1.*
