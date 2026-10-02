# Task: al-wire-routes

**Agent:** full-stack-developer
**Task:** Wire `logAction()` / `logCreate()` / `logStatusChange()` audit calls into 11 (13 with bonus) critical API routes.

## Context
Previous task `al-np-pages` built the Audit Logs admin page + the `logAction()` helper at `src/lib/audit-log.ts` (fire-and-forget, never throws). This task wires that helper into every meaningful state-changing API route so the audit table actually has data to display.

## Approach
For each route:
1. Read the file FIRST to verify variable names in scope (some routes use different names than the spec — e.g. the upload-report route stores the new order in `updatedOrder` not `order`).
2. Add the `import { logAction|logCreate|logStatusChange } from '@/lib/audit-log'` line at the top.
3. Insert the audit call AFTER business logic + emit calls succeed, BEFORE the final `NextResponse.json(...)` return.
4. Wrap each audit call in its own try/catch (defensive — though `logAction` itself already swallows errors, the outer try/catch protects any auxiliary DB lookups I do to enrich the log message).
5. Run `bun run lint` after every batch of edits.

## Files modified (13 routes)
1. `src/app/api/auth/login/route.ts` — POST, `logAction({ action: 'login', ... })` after session cookie creation. Wrapped in try/catch so audit failures never block login.
2. `src/app/api/auth/logout/route.ts` — POST. Was previously a no-op cookie clearer with no `req` arg. Now accepts `req: NextRequest`, calls `getAuthUser(req)` BEFORE clearing cookies, then `logAction({ action: 'logout', ... })`. The user is still authenticated at audit-time (cookie not yet cleared).
3. `src/app/api/dev-login/route.ts` — POST, `logAction({ action: 'login', ..., metadata: { method: 'dev', role } })` after session cookie creation.
4. `src/app/api/external-test-orders/route.ts` — POST. Loops over `created[]`, fetches each order's `partner.labName` by `order.labPartnerId`, calls `logCreate('external_test_order', order.id, user, ...)` per order (granular per-order audit trail).
5. `src/app/api/external-test-orders/[id]/accept/route.ts` — POST. `logStatusChange('external_test_order', order.id, 'Ordered', 'InProgress', user, ...)`.
6. `src/app/api/external-test-orders/[id]/reject/route.ts` — POST. `logStatusChange(..., order.status, 'Cancelled', ...)` with `severity: 'warning'`.
7. `src/app/api/external-test-orders/[id]/upload-report/route.ts` — POST. `logCreate('lab_report_upload', upload.id, user, ...)` with `severity: isAbnormal ? 'critical' : 'info'`.
8. `src/app/api/commission/pay/route.ts` — POST, BOTH branches:
   - Single: `logCreate('commission_payment', b.id, user, ...)` with `severity: 'critical'`. Placed INSIDE the existing `if (doctor?.user)` block so `doctor.user.name` + `labPartner?.labName` are both in scope.
   - Bulk: Captured `const commissionPayment = await db.commissionPayment.create({...})` (was previously unassigned), then `logCreate('commission_payment', commissionPayment.id, ...)` inside the existing `if (doctor?.user)` block.
9. `src/app/api/ot-schedules/route.ts` — POST. `logCreate('ot_schedule', schedule.id, user, ...)` with `severity: 'critical'`. Uses `schedule.scheduledDate.toISOString()` for the snapshot.
10. `src/app/api/ot-schedules/[id]/start/route.ts` — POST. `logStatusChange('ot_schedule', schedule.id, 'Scheduled', 'InProgress', user, ...)` with `metadata: { otName, actualStartTime }`.
11. `src/app/api/ot-schedules/[id]/complete/route.ts` — POST. `logStatusChange(..., 'InProgress', 'Completed', ...)` with `metadata: { otName, actualEndTime, actualDuration }`.
12. `src/app/api/ot-schedules/[id]/cancel/route.ts` — POST. `logStatusChange(..., schedule.status, 'Cancelled', ...)` with `severity: 'warning'` + `metadata: { reason, otName }`.
13. `src/app/api/diet-orders/route.ts` — POST (bonus). `logCreate('diet_order', order.id, user, ...)`.
14. `src/app/api/diet-orders/[id]/stop/route.ts` — POST (bonus). `logStatusChange('diet_order', id, 'Active', 'Stopped', ...)`.

## Deviations from spec
1. **Logout route**: The spec implied the `user` variable was "already in scope" — but the original `/api/auth/logout/route.ts` had no `req` parameter and didn't authenticate. I added `req: NextRequest` and a `getAuthUser(req)` call before clearing cookies. This is a small but necessary structural change to be able to populate `userId` / `userRole` / `userName` on the audit entry. If the user isn't authenticated (cookie already invalid), the audit log is skipped silently.
2. **Commission/pay bulk branch**: The spec said "after `db.commissionPayment.create()`" but the existing code didn't capture the create result. I changed `await db.commissionPayment.create({...})` to `const commissionPayment = await db.commissionPayment.create({...})`. Purely additive (the returned value was previously discarded). Needed so I have an `entityId` for `logCreate`.
3. **Commission/pay both branches**: The spec message format referenced `doctor.user.name` + `labPartner?.labName`. These variables are scoped to the existing `try { ... }` emit blocks. I placed the audit log calls INSIDE the `if (doctor?.user)` block right after the `emitToUserWithNotify` call. This guarantees both variables are non-null when the audit message renders. The trade-off: if the doctor lookup returns null (rare edge case for valid billing records), the audit log is skipped. Since this is an admin-only path on already-validated billings, this is acceptable.
4. **External-test-orders POST loop**: The spec message format references `partner.labName` but `partner` is only fetched inside the existing emit-block grouping loop. I do a fresh `db.labPartner.findUnique({ where: { id: order.labPartnerId } })` lookup per order in my audit loop. This adds N small DB queries (one per created order, typically 1–3). Acceptable for granular audit + gives meaningful lab-name context.

## Verification
- `bun run lint` → exit 0 (clean) after all 13 edits.
- Dev server log shows clean compiles (`✓ Compiled in Xms`) — no errors.
- All audit log calls are wrapped in try/catch with `console.error('[audit-log] ... capture failed:', auditErr)`. Even if the auxiliary lookup (e.g. partner) fails, the audit log helper itself is non-throwing — business logic is never affected.
