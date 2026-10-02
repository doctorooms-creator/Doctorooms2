# Task: lp-test-catalog — Lab Test Catalog management UI + 2 API routes

**Agent**: full-stack-developer
**Task ID**: lp-test-catalog
**Date**: auto

## Goal
Build the lab-technician-facing Test Catalog CRUD UI + supporting REST API
routes for the `LabTestCatalog` Prisma model (already exists in schema).

## Inputs / Context
- Read `/home/z/my-project/worklog.md` — confirmed `lab-phase1` delivered:
  * `LabTestCatalog` model in `prisma/schema.prisma` with fields: id, labPartnerId,
    testName, testCategory (Blood/Radiology/Pathology/Other), fee (Float),
    sampleType, turnaroundTime, isActive (default true), createdAt, updatedAt.
  * `requireRole(req, 'lab_technician')` from `@/lib/api-auth` + pattern
    `db.labPartner.findFirst({ where: { userId: user.id } })` to resolve
    the current lab partner's id.
  * Sidebar entry + dashboard-header route title for
    `/dashboard/lab-technician/test-catalog` already added by main agent.
- Style references: `lab-technician/billing/client.tsx` + `lab-technician/incoming-orders/client.tsx`
  — shadcn/ui Card+Table+Select+Skeleton, Framer Motion stat cards, sonner
  toasts, TanStack Query.

## Files Created (4)

### 1. `src/app/api/lab-test-catalog/route.ts` — GET + POST
- **GET** — list the current lab partner's tests. Query params:
  - `?category=Blood` (filter by category)
  - `?activeOnly=true` (only active tests)
  - Ordered by `[testCategory asc, testName asc]`.
- **POST** — create a new test in this lab's catalog. Validates testName
  (required) + testCategory (must be Blood/Radiology/Pathology/Other).
  Rejects case-insensitive duplicate testName within the same lab.

### 2. `src/app/api/lab-test-catalog/[id]/route.ts` — PUT + DELETE
- **PUT** — partial update; only writes fields that are present + valid.
  Enforces ownership: returns 403 if the test belongs to another lab.
- **DELETE** — hard delete. Enforces ownership too.
- Both follow the `params: Promise<{ id: string }>` Next.js 16 pattern.

### 3. `src/app/dashboard/lab-technician/test-catalog/page.tsx`
- 8-line server wrapper that renders `<TestCatalogClient />` + sets metadata
  title.

### 4. `src/app/dashboard/lab-technician/test-catalog/client.tsx`
- `'use client'` component. Layout:
  - **Header**: "Test Catalog" heading (FlaskConical icon, teal) + subtitle +
    top-right "Add Test" button (teal).
  - **4 stat cards** (motion fade-in + hover-lift): Total Tests, Blood Tests,
    Radiology Tests, Other Tests (Pathology + Other combined). Icons:
    ListChecks / Droplet / ScanLine / Boxes.
  - **Filter bar**: Category Select (All/Blood/Radiology/Pathology/Other),
    search Input (filter by testName, case-insensitive, client-side),
    Active-Only Switch, Clear button.
  - **Table**: Test Name | Category (color-coded Badge) | Fee (₹ INR) |
    Sample Type | Turnaround | Status (Active=emerald / Inactive=zinc) |
    Actions (Edit / Activate-or-Deactivate / Delete).
  - **Empty state**: FlaskConical icon + "No tests in your catalog yet.
    Add your first test to start receiving orders via the test name
    suggestions." + CTA button. Different copy when filters yield 0.
  - **Loading**: 6 Skeleton rows.
  - **Add/Edit Dialog**: shared form with Test Name*, Category*, Fee ₹,
    Sample Type, Turnaround Time, Active Switch. Save button disabled
    while pending / when testName empty. Spinner (Loader2) inside button.
  - **Delete**: AlertDialog confirmation, destructive action.
  - Toasts via `sonner` for success/error on every mutation.
  - INR formatting via `Intl.NumberFormat('en-IN', { style: 'currency',
    currency: 'INR', maximumFractionDigits: 0 })`.
  - Colors: teal accents, emerald (active), zinc (inactive), rose
    (Blood category + delete), violet (Radiology), amber (Pathology).
    NO blue/indigo used.

## Deviations from spec
1. **POST duplicate check** — spec used `testName: { equals, mode: 'insensitive' }`.
   SQLite does not honor Prisma's `mode: 'insensitive'` (it's a PostgreSQL-only
   feature). To preserve the *intent* (case-insensitive duplicate detection)
   robustly on SQLite, I fetch the lab's existing tests and compare names in
   JS via `.toLowerCase()`. This is bulletproof across DB providers and
   keeps the spec's behavior identical. No other behavior changed.

## Lint / Build
- `cd /home/z/my-project && bun run lint` → exit 0 (clean), no warnings.
- Did NOT run `bun run build` (per rules). Did NOT restart the dev server.

## Status
✅ All 4 files created and lint-clean. Ready for end-user testing via the
`/dashboard/lab-technician/test-catalog` route (sidebar entry already added
by main agent).
