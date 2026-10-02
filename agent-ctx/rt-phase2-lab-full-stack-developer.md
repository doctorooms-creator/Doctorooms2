# Task: rt-phase2-lab — Wire real-time emits into 5 lab module API routes

## Goal
Wire the 5 new lab event types (from Phase R1) into the 5 lab API routes that
trigger them, using `emitToUserWithNotify` so a `Notification` row is persisted
AND a socket event fires to the user's personal room.

## Files edited (5 only — no schema/page/emit-notification changes)
1. `src/app/api/external-test-orders/route.ts` — POST: after `created` loop,
   group orders by `labPartnerId`, fetch each partner's `userId` + `labName`,
   emit `external-test-ordered` with `{orderId, orderNo, testName, patientName,
   doctorName, urgency, labName, count}` (testName collapses to
   `${count} tests` when multiple orders go to the same lab).
2. `src/app/api/external-test-orders/[id]/accept/route.ts` — POST: after
   InProgress update, fetch doctor + doctor.user, fetch patient's name,
   emit `external-test-accepted` to doctor's userId.
3. `src/app/api/external-test-orders/[id]/reject/route.ts` — POST: after
   Cancelled update, fetch doctor + user, emit `external-test-rejected`
   with `reason: reason || 'No reason provided'`.
4. `src/app/api/external-test-orders/[id]/upload-report/route.ts` — POST:
   after `updatedOrder` (Completed), fetch doctor + user, resolve patient
   name, emit `external-report-uploaded` to BOTH doctor's userId AND
   `order.patientId` (patient copy uses `patientName: 'You'`).
5. `src/app/api/commission/pay/route.ts` — POST: in BOTH the single-billing
   branch (`body.billingId`) and the bulk branch
   (`body.doctorId + body.labPartnerId + body.period`), after the billing(s)
   are marked Paid, fetch doctor + user, resolve labName via `db.labPartner.
   findUnique`, emit `commission-paid` with `{amount, period, transactionRef,
   labName?}`.

## Conventions followed
- Import: `import { emitToUserWithNotify } from '@/lib/emit-notification'`
- Every emit wrapped in `try { ... } catch (e) { console.error('emit failed:', e) }`
  so emit failures never break the API response.
- Emits `await`ed (route has finished its main work and is about to return).
- No client-side files, no schema changes, no emit-notification.ts edits.
- Lint passes (exit 0) after each edit. Final `bun run lint` also exit 0.

## Deviations from spec
- None. All 5 events fire with the exact payload field set specified.
- Used `emitToUserWithNotify` (DB-persisting variant) for all 5 user-targeted
  events including `external-test-ordered` to the lab tech — per the explicit
  instruction in the task brief ("For external-test-ordered → lab tech, also
  use emitToUserWithNotify so it shows in the lab tech's notification list").
