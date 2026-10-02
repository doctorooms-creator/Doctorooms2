# Task: PHASE-2-NOTIF-SETTINGS — Hospital Notification Settings

## Files Created / Modified

### New API Routes (5 files)
- `src/app/api/notifications/channel-status/route.ts` (GET) — returns `{sms, whatsapp}` config status using `isSmsConfigured()` / `isWhatsAppConfigured()`.
- `src/app/api/notifications/logs/route.ts` (GET) — `?limit=` (default 10, capped 100). Last N `NotificationLog` for hospital.
- `src/app/api/notifications/templates/route.ts` (GET, POST) — GET lists hospital + global templates; POST creates new (validates eventType, channel).
- `src/app/api/notifications/templates/[id]/route.ts` (PUT, DELETE) — ownership-checked updates / deletes.
- `src/app/api/notifications/test-send/route.ts` (POST) — body `{phone, message}`. Returns 400 if SMS not configured; otherwise calls `sendViaChannel` + reads back the latest log row for status.

### New UI (2 files)
- `src/app/dashboard/hospital/notification-settings/page.tsx` — server wrapper.
- `src/app/dashboard/hospital/notification-settings/client.tsx` — 3-tab UI (Channels / Templates / Test Send).

### Sidebar
- `src/lib/sidebar-config.ts` — added `{ label: 'Notification Settings', href: '/dashboard/hospital/notification-settings', icon: Bell }` to hospital role (Bell was already imported).

## Auth Pattern
Hospital role resolves `hospitalId` via `db.hospital.findUnique({ where: { userId: user.id } })`. Admin must pass `?hospitalId=` query param (validated against `Hospital` table). Both via `requireRole(req, 'hospital')` then fallback `requireRole(req, 'admin')`.

## Styling
- shadcn/ui + Tailwind only.
- Teal color theme throughout (no indigo/blue).
- sonner for toasts.
- TanStack Query (`useQuery` + `useMutation`) for data.
- Framer Motion row animations.
- Mobile-first responsive; long lists use `max-h-96 overflow-y-auto`.

## Verification
- `bun run lint` — clean.
- All endpoints tested via curl with dev-login session cookie:
  - `GET /api/notifications/channel-status` → 200
  - `GET /api/notifications/logs?limit=10` → 200 `{logs:[]}`
  - `GET /api/notifications/templates` → 200 `{templates:[]}`
  - `POST /api/notifications/templates` → 201
  - `PUT /api/notifications/templates/{id}` → 200
  - `DELETE /api/notifications/templates/{id}` → 200
  - `POST /api/notifications/test-send` → 400 (expected: MSG91_API_KEY not set)
  - `GET /dashboard/hospital/notification-settings` → 200
