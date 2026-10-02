# Security Checklist for New API Routes

**Every new API route in Doctorooms MUST pass this checklist before merge.**

## Auth + Authorization

- [ ] **Auth required?** — Route calls `requireRole(req, '<role>')` or `requireAuth(req)`.
- [ ] **Role check correct?** — Only the minimum-necessary role(s) can access the route.
- [ ] **Ownership check?** — If the route takes a resource ID (booking ID, document ID, etc.), it verifies `resource.userId === user.id` (or equivalent per-role check).
- [ ] **IDOR-resistant?** — Returns **404** (not 403) on ownership failure — hides resource existence.
- [ ] **No privilege escalation?** — The route doesn't accept `role`, `userId`, or `status` fields from the client body (unless explicitly designed to, e.g. admin route).

## Input Validation

- [ ] **Required fields validated?** — Missing required fields → 400 with clear message.
- [ ] **Field types validated?** — Numbers are parsed, dates are valid, enums are checked against allowlist.
- [ ] **Max length enforced?** — String fields have a max length check (prevent DoS via huge payloads).
- [ ] **No raw SQL?** — Uses Prisma parameterized queries only. No `$queryRaw` or `$executeRaw` with user input.

## Rate Limiting

- [ ] **Rate-limited?** — If this is an auth/contact/payment/search route, calls `rateLimit()` from `@/lib/rate-limit`.
- [ ] **Brute-force protected?** — If this is a login/OTP/verification route, uses `recordLoginFailure()` + `isLoginLocked()`.

## File Uploads (if applicable)

- [ ] **Type allowlist?** — `ALLOWED_TYPES` array checked against `file.type`.
- [ ] **Extension allowlist?** — File extension checked as a fallback (browsers can send wrong MIME).
- [ ] **Magic bytes verified?** — `verifyMagicBytes(buffer, file.type)` from `@/lib/file-validation`.
- [ ] **Size limit enforced?** — `MAX_SIZE` constant checked against `file.size`.
- [ ] **Filename sanitized?** — `file.name.replace(/[^a-zA-Z0-9._-]/g, '_')` before using in storage path.
- [ ] **No path traversal?** — Storage path is constructed from `user.id` (cuid) + timestamp + sanitized filename — no user-controlled path segments.

## File Downloads (if applicable)

- [ ] **Proxy through API?** — Files are fetched server-side + streamed to client. Raw storage URLs are NEVER returned to the client.
- [ ] **Ownership check on download?** — The route verifies the requesting user owns the file before streaming it.
- [ ] **Cache-Control: no-store?** — Response headers include `Cache-Control: no-store, no-cache, must-revalidate` to prevent PII caching.

## Audit Logging

- [ ] **Action logged?** — Calls `logAction` / `logCreate` / `logUpdate` / `logDelete` / `logStatusChange` from `@/lib/audit-log`.
- [ ] **IP + UA captured?** — Passes `...getAuditContext(req)` to the log call.
- [ ] **Severity set correctly?** — `info` for normal actions, `warning` for rejections/cancellations, `critical` for financial/security actions (payments, password changes, role changes).

## Error Handling

- [ ] **try/catch wraps the handler?** — All DB/external calls are inside try/catch.
- [ ] **Generic error messages?** — Client sees `{ error: 'Failed to ...' }` — no stack traces, no DB error codes, no PII.
- [ ] **console.error for server logs?** — Detailed error is logged server-side via `console.error` for debugging.
- [ ] **Correct HTTP status codes?** — 400 (bad request), 401 (unauthorized), 403 (forbidden — rare), 404 (not found / ownership fail), 409 (conflict), 429 (rate limited), 500 (server error).

## Security Headers (handled by proxy.ts — just verify)

- [ ] **Response carries security headers?** — The proxy.ts middleware adds CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy to ALL responses. No action needed per-route — but verify with `curl -I` if testing.

## Testing

- [ ] **Playwright E2E test written?** — If this is a critical user path (login, booking, file upload, payment), a Playwright test exists in `tests/e2e/`.
- [ ] **Edge case tested?** — Double-submit, invalid ID, cross-user access, expired session.

---

## Quick Reference: Imports

```ts
import { requireRole, requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { logAction, logCreate, logUpdate, logDelete, logStatusChange } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { verifyMagicBytes, validateUploadedFile } from '@/lib/file-validation'
import { uploadToStorage } from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'
```
