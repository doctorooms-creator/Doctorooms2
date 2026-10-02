# Task: prp-phase2-p2-8-audit-patient-routes

**Agent:** full-stack-developer
**Task:** Wire `logAction()` audit calls (with IP + UA capture via `getAuditContext(req)`) into 12 patient API routes.

## Work Log

### Pre-flight
- Read `/home/z/my-project/worklog.md` — reviewed:
  - `prp-phase1` (P1.15) entry: created `src/lib/audit-context.ts` with `getAuditContext(req)` → `{ ipAddress, userAgent }` extracted from `x-forwarded-for` / `x-real-ip` + `user-agent`. Login route was wired with this helper in Phase 1.
  - `al-wire-routes` entry (Phase 1): wired audit log calls into 14 hospital-side routes (auth login/logout/dev-login, external-test-orders CRUD, commission/pay, ot-schedules, diet-orders). Helpers used: `logAction`, `logCreate`, `logStatusChange`. All wrapped in try/catch defense-in-depth.
  - `al-np-complete` entry: shipped AuditLog table + `logAction/logCreate/logUpdate/logDelete/logStatusChange` helpers + admin Audit Logs page + NotificationPreferences module.
- Read `src/lib/audit-log.ts` + `src/lib/audit-context.ts` to verify helper signatures.
- Found that the helpers' `extra` parameter did NOT actually accept `ipAddress`/`userAgent` (only `hospitalId`/`severity`, and `logStatusChange` had `hospitalId`/`metadata`). Updated helpers additively so the spec pattern (`{ ...auditCtx }`) works — see Deviation #1 below.

### Helper update (additive — backward compatible)
- `src/lib/audit-log.ts`:
  - `logCreate(...)` extra type extended to `{ hospitalId?, severity?, ipAddress?, userAgent? }`. ipAddress + userAgent forwarded to `logAction`.
  - `logUpdate(...)` extra type extended to `{ hospitalId?, severity?, ipAddress?, userAgent? }`.
  - `logDelete(...)` extra type extended to `{ hospitalId?, severity?, ipAddress?, userAgent? }`.
  - `logStatusChange(...)` extra type extended to `{ hospitalId?, metadata?, severity?, ipAddress?, userAgent? }`. Severity is now `extra?.severity || (auto-inferred)` (was: always auto-inferred). Existing callers that don't pass `severity` are unaffected.
- Ran `bun run lint` after the helper update — exit 0 (no existing caller breaks; the changes are purely additive optional fields).

### Routes wired (12 routes total — 11 added + 1 verified)

| # | Route | Handler | Helper used | Notes |
|---|-------|---------|-------------|-------|
| 1 | `/api/patient/bookings/route.ts` | POST | `logCreate('booking', ...)` | After `db.booking.create` + patient/doctor/receptionist notifications. `user` (AuthUser) from `requireRole('patient')`. `doctor.user.name` for Dr name. `booking.bookingDate.toISOString()` for the afterJson. |
| 2 | `/api/patient/bookings/[id]/cancel/route.ts` | PATCH | `logStatusChange('booking', oldStatus, 'Canceled', ...)` | Captured `oldStatus = booking.status` BEFORE the `db.booking.update` call (additive const). Metadata: `{ reason: 'Patient-initiated cancel' }`. hospitalId from `booking.hospitalId` (nullable → `undefined` to keep type happy). |
| 3 | `/api/patient/medical-documents/route.ts` | POST | `logCreate('medical_document', ...)` | Route stores the created doc in variable named `document` (not `doc` as in spec). Used `document.title`/`fileName`/`fileSize`/`mimeType`. No name clash with global `document` (server-side, `document` is undefined globally). |
| 4 | `/api/patient/medical-documents/[id]/route.ts` | DELETE | `logDelete('medical_document', ...)` | Used existing `doc` variable (fetched for ownership check). After `db.medicalDocument.delete`. beforeJson: `{ title, fileName }`. |
| 5 | `/api/patient/medical-documents/[id]/download/route.ts` | GET | `logAction({ action: 'view', ... })` | View (read) action — not a mutation. Added on the http URL branch only (not the 404 fallback path). Placed BEFORE the `return NextResponse.json({ url, fileName, mimeType })`. |
| 6 | `/api/patient/profile/route.ts` | PUT | `logUpdate('user_profile', user.id, ...)` | Added a `db.user.findUnique` for the before snapshot (purely additive — needed for `before` arg). Selects `id, name, mobileNo, gender` (no password). afterJson mirrors same fields from the `updated` result. |
| 7 | `/api/user/change-password/route.ts` | PATCH | (already wired) | VERIFIED existing audit log call at lines 92-108 (added in P1.15, extended in P2.4). Uses `logAction({ ..., action: 'password_change', severity: 'critical', ipAddress: clientIp, userAgent: req.headers.get('user-agent') })`. No changes needed. |
| 8 | `/api/patient/feedback/route.ts` | POST | `logCreate('doctor_rating', ...)` | Added on the CREATE path only (after `db.doctorRating.create`), NOT on the UPDATE path (existing rating update at line 87-99 is left untouched). Route has `doctorUserId` (the doctor's User.id) + `star` — not `doctorName` or `starCount`. Added a `db.user.findUnique({ where: { id: doctorUserId } })` lookup to enrich the audit message with the doctor's display name (wrapped in try/catch, falls back to the raw `doctorUserId` if lookup fails). |
| 9 | `/api/patient/posts/route.ts` | POST | `logCreate('blog_post', ...)` | After `db.post.create`. afterJson: `{ title, permalink }`. Description notes the Draft status + admin-review requirement (matches P1.13 security control). |
| 10 | `/api/prescription-access/[id]/respond/route.ts` | POST | `logStatusChange('prescription_access', 'Pending', newStatus, ...)` | After the access request is updated + notification + emit. Used `accessRequest.requestingDoctor.user.name` as the doctor name. `newStatus` is `Approved` or `Rejected` (computed from `body.action`). |
| 11 | `/api/prescription-access/[id]/respond/route.ts` | DELETE | `logDelete('prescription_access', id, ...)` | Added `originalDoctor: { include: { user: { select: { name: true } } } }` to the existing Prisma include (additive — purely for audit context). Used `accessRequest.originalDoctor?.user?.name` as `originalDoctorName` (matches spec variable name). Falls back to `'Unknown'` if relation is missing. |
| 12 | `/api/auth/verify-otp/route.ts` | POST | `logAction({ action: 'otp_verify', ... })` | No user context yet (pre-auth). `userId: undefined`, `userRole: ''`, `userName: ''`. `entityId: normalizedEmail`. Also normalized the email usage (route previously called `email.toLowerCase()` inline; refactored to `const normalizedEmail = email.toLowerCase()` so the audit log uses the same value). |

### Conventions followed
- Each audit log call placed AFTER business logic + emit calls succeed, BEFORE the final `NextResponse.json(...)` return. Purely additive — no business logic, emit calls, response shape, or status codes modified in any route.
- Each audit log call wrapped in its own `try { ... } catch (auditErr) { console.error('[audit-log] ... capture failed:', auditErr) }` for defense in depth (the helper itself already swallows errors, but the outer try/catch protects auxiliary DB lookups like the doctor-name fetch in the feedback route).
- All audit calls use `await` (helper signature returns `Promise<void>`).
- All calls pass `...auditCtx` (spread of `{ ipAddress, userAgent }` from `getAuditContext(req)`) into the helper's `extra` arg — IP + UA now captured on every patient-side audit entry.

### Verification
- `cd /home/z/my-project && bun run lint` — exit 0 (clean) after:
  - helper update (audit-log.ts)
  - routes 1 + 2 (patient bookings POST + cancel PATCH)
  - routes 3-5 (medical documents POST + DELETE + download GET)
  - routes 6-9 (profile PUT + change-password verify + feedback POST + posts POST)
  - routes 10-12 (prescription-access POST + DELETE + auth/verify-otp POST)
- `bun run build` was NOT run (per instructions).
- Dev server (`bun run dev`) was NOT restarted (per instructions). Verified healthy by reading `dev.log` tail — only `200` responses + `✓ Compiled in Xms` messages, no errors or warnings.

### Deviations (5)
1. **Updated `src/lib/audit-log.ts` helpers** to accept `ipAddress`/`userAgent` (and `severity` for `logStatusChange`) in their `extra` parameter. The spec asserted "ALL helpers accept an `extra?: { hospitalId?, severity?, ipAddress?, userAgent? }` field" but the actual code did NOT — TypeScript's excess-property check on object literals would have rejected `{ ...auditCtx }` spreads. The change is purely additive + backward-compatible (all 13 existing audit-logged routes from `al-wire-routes` continue to compile + work unchanged). Verified by running lint after the helper update alone (before touching any route).
2. **`/api/patient/medical-documents/route.ts` POST**: spec used variable `doc` but the route stores the created record in `document`. Used the existing `document` variable name (renaming would be a business-logic-affecting change). No name clash with global `document` since the route runs server-side.
3. **`/api/patient/medical-documents/[id]/route.ts` DELETE**: spec used variable `existing` but the route uses `doc` (fetched for ownership check). Used the existing `doc` variable.
4. **`/api/patient/profile/route.ts` PUT**: spec called for `before` + `after` snapshots but the original route did not capture a before snapshot (it just called `db.user.update` and returned). Added a `db.user.findUnique` for the before snapshot BEFORE the update (purely additive read, doesn't change business logic). Selects only safe fields (`id, name, mobileNo, gender` — no password/email).
5. **`/api/patient/feedback/route.ts` POST**: spec referenced `doctorName` + `starCount` variables but the route has `doctorUserId` + `star`. Added a `db.user.findUnique` lookup for the doctor's display name (wrapped in try/catch, falls back to the raw `doctorUserId`). Used `star` (the route's actual variable) instead of `starCount`.
6. **`/api/prescription-access/[id]/respond/route.ts` DELETE**: spec referenced `originalDoctorName` but the DELETE handler's existing Prisma include did NOT fetch `originalDoctor`. Added `originalDoctor: { include: { user: { select: { name: true } } } }` to the include (purely additive — doesn't change the response shape since the response only returns `{ success, message }`). Falls back to `'Unknown'` if the relation is missing.
7. **`/api/auth/verify-otp/route.ts` POST**: refactored `email.toLowerCase()` inline call to a `const normalizedEmail = email.toLowerCase()` so the audit log captures the same normalized email used for verification. Doesn't change behavior — `verifyOTP` still receives the same lowercased email.

## Stage Summary
- 12 patient API routes wired with audit log calls (11 newly wired + 1 verified as already done):
  * `src/app/api/patient/bookings/route.ts` (POST — logCreate booking)
  * `src/app/api/patient/bookings/[id]/cancel/route.ts` (PATCH — logStatusChange to Canceled)
  * `src/app/api/patient/medical-documents/route.ts` (POST — logCreate medical_document)
  * `src/app/api/patient/medical-documents/[id]/route.ts` (DELETE — logDelete medical_document)
  * `src/app/api/patient/medical-documents/[id]/download/route.ts` (GET — logAction view)
  * `src/app/api/patient/profile/route.ts` (PUT — logUpdate user_profile)
  * `src/app/api/user/change-password/route.ts` (PATCH — VERIFIED existing audit log)
  * `src/app/api/patient/feedback/route.ts` (POST — logCreate doctor_rating)
  * `src/app/api/patient/posts/route.ts` (POST — logCreate blog_post)
  * `src/app/api/prescription-access/[id]/respond/route.ts` (POST — logStatusChange + DELETE — logDelete)
  * `src/app/api/auth/verify-otp/route.ts` (POST — logAction otp_verify)
- Each audit entry captures: userId, userRole, userName (where applicable), action, entityType, entityId, description, beforeJson/afterJson/metadata (where applicable), ipAddress, userAgent, severity, hospitalId (where applicable).
- Helpers `logCreate`/`logUpdate`/`logDelete`/`logStatusChange` extended (additively) to accept `ipAddress`+`userAgent` (and `severity` for logStatusChange) in their `extra` parameter — all 13 existing audit-logged routes continue to compile + work unchanged.
- `bun run lint` clean (exit 0) after every batch of edits. Dev server healthy on port 3000.
- No business logic, emit calls, response shapes, status codes, schemas, sidebar, dashboard-header, or frontend files modified — purely additive audit log calls.
