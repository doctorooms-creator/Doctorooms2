# Task: do-pages-print

## Files Created (5)
1. `src/app/print/diet-orders/[admissionId]/page.tsx` — server component, A4 Diet Chart print template
2. `src/app/dashboard/hospital/diet-orders/client.tsx` — main interactive UI (shared by all 3 roles)
3. `src/app/dashboard/hospital/diet-orders/page.tsx` — server wrapper, metadata
4. `src/app/dashboard/receptionist/diet-orders/page.tsx` — imports hospital client via `@/app/dashboard/hospital/diet-orders/client`
5. `src/app/dashboard/nurse/diet-orders/page.tsx` — imports hospital client via `@/app/dashboard/hospital/diet-orders/client`

## Key Decisions / Deviations

1. **Admission picker role handling** — The spec says "fetches `/api/dashboard/receptionist/ipd`". That endpoint requires `receptionist` role only (401 for hospital/nurse/admin users). To preserve the spec's intent AND make the same client.tsx work for all 3 roles, the Add dialog tries `/api/dashboard/receptionist/ipd?status=Admitted&limit=200` first; if that 401s or returns an empty array, falls back to `/api/dashboard/doctor/ipd?status=Admitted&limit=200`; if both fail, falls back to a free-form text Input where the user pastes an admission ID (same pattern as the existing OT client.tsx). Receptionist users see a Select with `<admissionNo> — <patientName> (<bedNumber>/<ward>)` labels exactly as the spec requires.

2. **Stop confirmation copy** — AlertDialog amber (not rose) since "Stopped" is not a destructive action (it's a planned clinical event). Used `bg-amber-600 hover:bg-amber-700` for the action button.

3. **Stat cards** — 4 cards per spec: "Active Diet Orders" (emerald), "Stopped Today" (zinc), "NPO Alerts" (amber), "Today's New Orders" (teal). NPO alert counts only Active NPO orders.

4. **Color discipline** — Teal accents, emerald (Active), zinc (Stopped), amber (NPO alerts), rose (NG tube badge). No blue/indigo anywhere.

## APIs Used
- `GET /api/diet-orders?status=All|Active|Stopped` — list, role-scoped
- `POST /api/diet-orders` — create (body: admissionId, dietType, mealType, instructions, startDate, endDate)
- `PUT /api/diet-orders/[id]` — update (dietType, mealType, instructions, endDate)
- `POST /api/diet-orders/[id]/stop` — stop with `{ reason }`
- `GET /api/dashboard/receptionist/ipd?status=Admitted&limit=200` (receptionist role) — fall back to `GET /api/dashboard/doctor/ipd?status=Admitted&limit=200` (doctor role) — fall back to text input

## Lint Status
`bun run lint` — exit 0 (clean, no warnings or errors).

## Patterns Mirrored
- `lp-test-catalog` (lab-technician/test-catalog/client.tsx) — shadcn Card+Table+Select+Skeleton patterns, motion stat-card row, filter bar, Add/Edit Dialog, AlertDialog destructive-action pattern.
- `pe-phase2c` (discharge-summary + vitals print templates) — PrintLayout/InfoGrid/SectionTitle/Signatures, cookies() auth, per-role authorization (doctor → attending/referring; hospital → hospitalId match; receptionist → hospitalId match; nurse → StaffNurse hospitalId match; admin → always), `avoid-break` rows, `formatDate`/`formatDateTime` from `@/lib/print-utils`.
