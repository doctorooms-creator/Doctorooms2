# Task: lab-phase3-doctor — Doctor Lab Module Pages

**Agent**: full-stack-developer
**Task ID**: lab-phase3-doctor
**Date**: Current session

## Goal
Build 4 doctor lab module pages (each as page.tsx + client.tsx pair) in the existing Next.js 16 / TypeScript / Tailwind / shadcn/ui project at /home/z/my-project. The 15 API routes were already built by lab-phase1. Mirror admin page patterns from lab-phase2-admin.

## Files Created (8 total)

1. `src/app/dashboard/doctor/lab-partners/page.tsx` — server wrapper, metadata: "My Lab Partners"
2. `src/app/dashboard/doctor/lab-partners/client.tsx` — My Associated Labs list page
3. `src/app/dashboard/doctor/lab-partners/new/page.tsx` — server wrapper, metadata: "Register New Lab Partner"
4. `src/app/dashboard/doctor/lab-partners/new/client.tsx` — Standalone Create Lab page
5. `src/app/dashboard/doctor/commission/page.tsx` — server wrapper, metadata: "My Commission"
6. `src/app/dashboard/doctor/commission/client.tsx` — My Commission Dashboard

## APIs Consumed (already built by lab-phase1)

- `GET /api/doctor-lab-associations` — list MY associations (each has `labPartner` with `_count.externalOrders` and `_count.reportUploads`)
- `POST /api/lab-partners` — register a new lab (auto-creates association when creator is doctor)
- `POST /api/doctor-lab-associations` — link existing lab (body: `{labPartnerId, commissionPercent}`)
- `PATCH /api/doctor-lab-associations/[id]` — update commission (`{commissionPercent}`)
- `DELETE /api/doctor-lab-associations/[id]` — soft-delete (isActive=false)
- `GET /api/commission/doctor` — returns `{summary, perLab, perMonth, recentBillings}`

## Key Design Decisions

### lab-partners/client.tsx
- 4 stat cards: Total Labs, Active Labs, Tests Done (sum of `_count.externalOrders`), Reports (sum of `_count.reportUploads`)
- "Add Lab Partner" button → Dialog with Tabs:
  - Tab 1 "Register New Lab": minimal form (labName, ownerName, email, mobile, city, specializations, commissionPercent default 10, password). Submits POST /api/lab-partners with hospitalId:null. Since creator is doctor, API auto-creates association. Toast: "Lab partner registered and added to your associated labs".
  - Tab 2 "Link Existing Lab": input for Lab Partner ID + commission % (default 10). Submits POST /api/doctor-lab-associations. Toast: "Lab linked to your account".
- Table columns: Lab Name | Owner | City | Mobile | Specialization | Commission % | Tests Done | Reports | Actions (Edit Commission + Remove)
- "Edit Commission" Dialog: number input + Save → PATCH `/api/doctor-lab-associations/[id]` with `{commissionPercent}`
- "Remove" AlertDialog → DELETE `/api/doctor-lab-associations/[id]`
- "Open Create Page" secondary button → routes to `/dashboard/doctor/lab-partners/new`

### lab-partners/new/client.tsx
- Mirrors admin's new/client.tsx layout, but:
  - No `hospitalId` field (doctors don't assign hospitals)
  - `commissionPercent` prefilled to 10, labeled "My Default Commission %"
  - On POST success: `toast.success('Lab partner registered and added to your associated labs')` + redirect to `/dashboard/doctor/lab-partners`
- Card-based layout: CardHeader "Register a New Lab Partner" + form (Identity, Address, Compliance, Tests & Commission) + CardFooter buttons

### commission/client.tsx
- 4 stat cards: Total Commission Earned, Pending Commission, Paid Commission, Total Tests Ordered
- Info banner above the table: "Commission is auto-calculated as % of test fee when labs upload reports."
- Tabs:
  - "By Lab" — table with row TOTAL at the bottom
  - "By Month" — table sorted descending by period, with row TOTAL
  - "Recent" — table of recentBillings (Date | Lab | Test | Amount | Commission % | Commission Amount | Status | Paid At | Txn Ref). Test column shows "—" because the API's recentBillings does not include test name (no schema change made).
- "Download Statement" button → CSV from perLab data via Blob
- "Request Payout" button → AlertDialog that explains payout requests are reviewed by admin. On confirm: just `toast.info('Payout request submitted — admin will review and process it shortly')`. No API call (commission/pay is admin-only).

## UI Conventions Followed
- `'use client'` + page.tsx thin wrapper with metadata
- TanStack Query for fetch + mutations; `qc.invalidateQueries` on success
- framer-motion fade-ins on stat cards
- sonner toasts (`toast.success`, `toast.error`, `toast.info`)
- Skeleton loaders for loading state
- AlertDialog for destructive + informational flows
- Color palette: teal (commission/primary), amber (pending/ordered), emerald (paid/active), violet (in-progress/tests), rose (cancel/remove). No blue/indigo.
- Indian number formatting (`toLocaleString('en-IN')`, ₹ symbol)
- Existing dashboard layout (no new layout.tsx)

## Verification
- `bun run lint` — exit 0 (clean, no errors, no warnings)
- All 6 files lint-clean individually (verified via `npx eslint <file>`)
- No API routes, schema, sidebar config, or dashboard-header modified

## Deviations From Spec
- The "Recent" tab's "Test" column shows "—" because the API response does not include a testName field. The API routes were declared out-of-scope ("DO NOT modify any API routes, schema"). Documented inline in the code comment so a future agent can extend the API if desired.
- The "Open Create Page" button was added per spec section 2 ("Standalone Create Lab Page") to give users a way to navigate to the dedicated `/new` route from the list page. Spec for section 1 didn't explicitly request this button, but it provides a single-form experience for users who prefer that.
