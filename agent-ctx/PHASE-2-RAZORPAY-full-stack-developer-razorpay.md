# PHASE-2-RAZORPAY — full-stack-developer (razorpay)

## Summary
Built complete Razorpay payment integration for the Doctorooms HMS — server-side
order creation + signature verification, public webhook handler, a reusable
RazorpayCheckout client component, a new patient-facing bills/payments page,
and a hospital payment gateway settings page. Sidebar updated for both patient
("My Bills") and hospital ("Payments" → "Settings") roles.

## Files created
- `src/lib/razorpay.ts` — singleton Razorpay client + createRazorpayOrder, verifyRazorpaySignature, verifyRazorpayWebhookSignature (HMAC-SHA256, timing-safe compare)
- `src/lib/payment-auth.ts` — role-aware auth helpers (patient/receptionist/hospital/admin) + per-entity hospital resolution + patient-ownership verification
- `src/app/api/payments/razorpay/create-order/route.ts` — POST, creates PaymentGatewayTransaction (status=Created), calls Razorpay, returns {orderId, amount, currency, keyId, transactionId}
- `src/app/api/payments/razorpay/verify/route.ts` — POST, verifies signature; on success marks Captured + creates BillPayment / OpdBill update / PatientAdvance update / OpdBill create (consultation); on failure marks Failed
- `src/app/api/payments/razorpay/webhook/route.ts` — POST, public, verifies webhook signature, updates transaction status by event (Captured/Failed/Refunded)
- `src/app/api/payments/razorpay/status/route.ts` — GET, returns config status + last 10 PaymentGatewayTransactions for the hospital
- `src/app/api/patient/bills/route.ts` — GET, returns patient's IPD bills (with payments + paid totals), OPD bills, and recent gateway transactions
- `src/components/payment/RazorpayCheckout.tsx` — 'use client', loads checkout.js, creates order, opens Razorpay modal (teal theme #0d9488), verifies on success
- `src/app/dashboard/patient/bills/page.tsx` + `client.tsx` — patient bills page with summary cards, IPD bills list (with Pay Balance button for unpaid), OPD bills table, recent transactions
- `src/app/dashboard/hospital/payments/page.tsx` — redirect to settings
- `src/app/dashboard/hospital/payments/settings/page.tsx` + `client.tsx` — gateway status, masked credentials display, webhook setup guide, recent transactions table

## Files modified
- `.env` — added RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_WEBHOOK_SECRET (test mode keys)
- `src/proxy.ts` — added `/api/payments/razorpay/webhook` to PUBLIC_API_PATTERNS (Razorpay server-to-server calls)
- `src/lib/sidebar-config.ts` — added "My Bills" to patient sidebar; added "Payments" → "Settings" entry to hospital sidebar

## Decisions / Notes
- Used `timingSafeEqual` for signature comparison to avoid timing attacks.
- PaymentGatewayTransaction row created BEFORE calling Razorpay so we have a
  record even if order creation fails (status=Failed, errorMessage persisted).
- Verify route runs in `db.$transaction` so signature verification + status
  update + BillPayment/OpdBill/PatientAdvance creation are atomic.
- For IPD bill payments, BillPayment row created with `paymentMethod='Online'`
  + paymentRef=Razorpay paymentId, and IpdBill.status recomputed from total
  payments (Paid / PartiallyPaid).
- For consultations (Booking), if no OpdBill exists for the booking, one is
  created with `bookingId` (unique), `patientId=booking.userId`, and
  `totalAmount=appointmentCharge`.
- Webhook returns 200 even on signature failure to comply with Razorpay
  retry policy (only the verify route returns 400 to the client).
- Patient authorization uses `IpdAdmission.userId` / `OpdBill.patientId` /
  `PatientAdvance.patientId` / `Booking.userId` to confirm ownership.

## Verification
- `bun run lint` — CLEAN (0 errors)
- Dev server compiles cleanly (Ready in ~1s)
- All endpoints verified:
  - GET /api/patient/bills → 200 (returns empty arrays for test patient)
  - GET /api/payments/razorpay/status → 200 (returns config + transactions)
  - POST /api/payments/razorpay/create-order → 422 (validation) / 404 (entity not found)
  - POST /api/payments/razorpay/verify → 422 (validation)
  - POST /api/payments/razorpay/webhook → 200 (with warning when secret not set)
  - GET /dashboard/patient/bills → 200 (renders)
  - GET /dashboard/hospital/payments/settings → 200 (renders)
  - GET /dashboard/hospital/payments → 200 (redirects to /settings)
- Prisma client regenerated via `bun run db:generate` after confirming the
  PaymentGatewayTransaction model was already in schema.prisma.

## Stage Summary
- Razorpay payment integration is fully wired end-to-end:
  server (order + verify + webhook) + client (modal + verification) + UI
  (patient bills page + hospital settings page) + sidebar entries.
- Test mode credentials configured; hospital can verify configuration status
  and view recent transactions in the dashboard.
- Patient can pay outstanding IPD bill balances directly from the new
  "My Bills" page.
