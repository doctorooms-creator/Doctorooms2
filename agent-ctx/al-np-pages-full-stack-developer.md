---
Task ID: al-np-pages
Agent: full-stack-developer
Task: Build Audit Logs admin page + Notification Preferences page + Web Audio chime helper

Work Log:
- Read /home/z/my-project/worklog.md — confirmed `lp-test-catalog` (CRUD list pattern) and `do-pages-print` (server-page + client.tsx pattern) as the most recent comparable pages. Also read `ot-phase1` to confirm the 22-event real-time notification registry in RealtimeNotification.tsx.
- Read existing infrastructure:
  * `src/app/api/audit-logs/route.ts` (GET with `page/pageSize/userId/action/entityType/entityId/severity/hospitalId/startDate/endDate/search` filters, returns `{logs,total,page,pageSize,totalPages,filters:{actions,entityTypes,severities}}`).
  * `src/app/api/notification-preferences/route.ts` (GET auto-upserts a row; PUT accepts `mutedEvents/soundEnabled/criticalChimeEnabled/emailDigest`).
  * `prisma/schema.prisma` — `AuditLog` (severity=info|warning|critical; action=create|update|delete|status_change|login|logout) + `NotificationPreference` (userId unique, mutedEvents JSON string, soundEnabled + criticalChimeEnabled booleans, emailDigest=never|daily|weekly).
  * `src/components/shared/RealtimeNotification.tsx` — confirmed 22 events in EVENT_CONFIG with per-role filter + per-event icon + color.
  * `src/lib/sidebar-config.ts` — `ScrollText` already imported; admin sidebar already had `Settings` + `Change Password` at the end.
  * `src/components/dashboard/dashboard-header.tsx` — `routeTitles` map pattern + bell-popover footer pattern (single "View all notifications" button).
  * `src/app/dashboard/lab-technician/test-catalog/client.tsx` — shadcn Card/Table/Skeleton/Badge/Button/Input/Label/Select/AlertDialog + motion stat-card row + empty state + filter bar pattern.
  * `src/lib/print-utils.ts` — `formatDateTime` (returns "15 Aug 2026, 10:30 AM").
- Created `src/lib/play-chime.ts` — Web Audio API 2-note chime (C5 523.25Hz + E5 659.25Hz, 0.35s/0.45s, sine wave with soft attack + exponential decay envelope). Lazy-creates AudioContext on first call, resumes if suspended (browser autoplay policy). Safe to call repeatedly; silent failure on SSR (`typeof window === 'undefined'` guard). No asset file needed.
- Created `src/app/dashboard/admin/audit-logs/page.tsx` — server wrapper (`export const metadata = { title: 'Audit Logs' }`) that imports + renders `<AuditLogsClient />` from `./client`.
- Created `src/app/dashboard/admin/audit-logs/client.tsx` — interactive admin audit-log viewer:
  * Header: "Audit Logs" heading with ScrollText icon (teal) + subtitle.
  * 4 stat cards (motion fade-in + hover-lift):
    - Total Logs (7d) — teal, fetches `/api/audit-logs?pageSize=1&startDate=7d-ago` and reads `total`.
    - Critical (7d) — rose, fetches with `severity=critical&startDate=7d-ago`.
    - Warnings (7d) — amber, fetches with `severity=warning&startDate=7d-ago`.
    - Active Users (24h) — emerald, fetches `pageSize=200&startDate=24h-ago` and computes distinct userId client-side.
  * Sticky filter bar (sticky top-16): debounced Search (300ms via setTimeout+useEffect) on userName/description, Action Select (All + 6 known + any extras from `filters.actions`), Entity Type Select (All + `filters.entityTypes`), Severity Select (All + 3 known + any extras), Start Date + End Date (`<Input type="date">`), Clear Filters button (appears only when filters active). Filter count Badge in top-right.
  * Paginated table: Timestamp | User (name + role badge) | Action (badge — create=emerald, update=teal, delete=rose, status_change=violet, login/logout=zinc) | Entity Type | Entity ID (truncated with Copy button) | Description (line-clamp-2) | Severity (badge — info=zinc, warning=amber, critical=rose) | Details (Eye icon → Popover showing Before/After/Metadata JSON + IP).
  * Row click → opens full Dialog showing all 12 fields (log ID with copy button, timestamp, severity, action, userName, userRole, userId, hospitalId, entityType, entityId, ipAddress, userAgent) + description + Before/After/Metadata JSON blocks (formatted with `JSON.stringify(_, null, 2)`).
  * Pagination footer: "Rows per page" Select (20/50/100/200), Prev button, "Page X of Y (Z total)" label, Next button. `isFetching` spinner when refreshing between page changes. Uses `placeholderData: keepPreviousData` so the table doesn't flash empty on page change.
  * Empty state: friendly ScrollText icon + "No audit logs match the current filters." + Clear Filters button.
  * Reset-to-page-1 effect whenever any filter changes.
  * Toast (sonner) on fetch errors + clipboard copy.
  * Color discipline: teal/emerald/rose/amber/violet/zinc only — NO blue/indigo.
- Created `src/app/dashboard/notifications/preferences/page.tsx` — server wrapper for the Notification Preferences page.
- Created `src/app/dashboard/notifications/preferences/client.tsx` — interactive personal settings page:
  * Header: "Notification Preferences" with Bell icon (teal) + subtitle.
  * Card 1 — Sound Settings: Master Sound Switch (`soundEnabled`), Critical Chime Only Switch (`criticalChimeEnabled`, disabled when master off), Test Sound button (calls `playChime()`).
  * Card 2 — Muted Events: Mute All / Unmute All buttons + "X / 22 muted" badge. Grid of all 22 events from `EVENT_CONFIG` (imported directly from RealtimeNotification.tsx) — each item is a label containing Checkbox + icon (uses event's own icon + color from EVENT_CONFIG) + title + event id (mono). Muted events get amber-tinted border to visually highlight. Mutating the checkbox updates local state; server save happens on Save button.
  * Card 3 — Email Digest: Select (Never/Daily/Weekly) + helper text explaining email gateway dependency.
  * Card 4 — Browser Push (placeholder): Switch that calls `Notification.requestPermission()` when toggled ON, shows permission status (granted/denied/default) with appropriate color. UI-only — toggle state is local, not persisted (would need a separate column on NotificationPreference to persist).
  * Sticky Save bar at bottom: "Unsaved changes" indicator (amber) + Save button (teal, disabled when not dirty or pending). `isDirty` computed by diffing local form state vs server-loaded state. Save → `PUT /api/notification-preferences` with the full prefs object → `toast.success("Preferences saved")` + invalidates the GET query.
  * Loading state: 4 Skeleton cards.
  * Last saved timestamp footer (formats `updatedAt` via `toLocaleString`).
- Exported `EVENT_CONFIG` from `src/components/shared/RealtimeNotification.tsx` (was previously module-private) so the preferences page can read the canonical 22-event registry. Single-word change: `const EVENT_CONFIG` → `export const EVENT_CONFIG`. No other change to RealtimeNotification logic — still works as before for the toast emission.
- Edited `src/lib/sidebar-config.ts` — added `{ label: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: ScrollText }` to the admin sidebar AFTER "Settings" (and before "Change Password"). `ScrollText` was already imported.
- Edited `src/components/dashboard/dashboard-header.tsx`:
  * Added 2 entries to `routeTitles`: `/dashboard/admin/audit-logs` → "Audit Logs" + `/dashboard/notifications/preferences` → "Notification Preferences".
  * Modified the bell popover footer: replaced the single "View all notifications" button with a 2-button row: "View all notifications" + a "·" separator + "Preferences" (with Settings icon). The Preferences link navigates to `/dashboard/notifications/preferences`. Since this is in the bell popover (visible to all roles with notifications), no per-role sidebar entry needed — but the page is reachable for every authenticated role via the bell icon.
- Ran `cd /home/z/my-project && bun run lint` → exit 0 (clean, no warnings/errors). Verified that no lint rule objected to the `Notification` browser API usage in `preferences/client.tsx` (typed as `NotificationPermission` from the DOM lib).
- Verified dev server is healthy: dev.log shows successful compiles including the new files. Only log message of note is a "Fast Refresh had to perform a full reload when RealtimeNotification.tsx changed" — expected, because I added the `export` keyword. No actual errors.

Stage Summary:
- 5 files created:
  * `src/lib/play-chime.ts` — Web Audio API 2-note chime (no audio asset needed).
  * `src/app/dashboard/admin/audit-logs/page.tsx` — server wrapper.
  * `src/app/dashboard/admin/audit-logs/client.tsx` — interactive admin audit-log viewer (4 stat cards + sticky filter bar + paginated table + row click Dialog + metadata Popover + pagination footer).
  * `src/app/dashboard/notifications/preferences/page.tsx` — server wrapper.
  * `src/app/dashboard/notifications/preferences/client.tsx` — interactive personal notification settings page (Sound Settings + Muted Events + Email Digest + Browser Push placeholder + sticky Save bar).
- 3 files modified:
  * `src/components/shared/RealtimeNotification.tsx` — added `export` to `EVENT_CONFIG` (single keyword change, behavior preserved).
  * `src/lib/sidebar-config.ts` — added `Audit Logs` to admin sidebar after Settings.
  * `src/components/dashboard/dashboard-header.tsx` — added 2 route titles + bell-popover Preferences link.
- `bun run lint` clean (exit 0). No `bun run build`. No dev server restart (auto-managed).
- Deviations:
  1. "Active Users (24h)" stat is computed client-side by fetching the most recent 200 audit-log entries with `startDate=24h-ago` and counting distinct `userId`. The existing API doesn't expose a distinct-user count endpoint, and the spec said "use the API". 200 is the API's max pageSize — for very active deployments this under-counts, but for normal hospital traffic it's accurate enough. Documented in this work record.
  2. Browser Push card is UI-only as specified — the toggle state is local-only and not persisted server-side because `NotificationPreference` schema doesn't have a `browserPushEnabled` column. The spec said "persist the toggle in metadata for now" but the API only accepts the 4 documented fields (mutedEvents/soundEnabled/criticalChimeEnabled/emailDigest); I chose not to widen the schema (forbidden per task rules) so the toggle resets on page reload. The Permission status display (granted/denied/default) is still useful since it reflects the browser's actual state, not a server-stored preference. Documented for a future schema-widening pass.
  3. The "Notification Preferences" page is reachable via the bell-icon dropdown (Preferences link) for every authenticated role, not via per-role sidebar entries. The bell icon is visible in `dashboard-header.tsx` for all dashboard layouts. This satisfies the spec's "if no notifications dropdown exists, just add the route title" guidance — but a dropdown does exist, so I added the Preferences link to it as well.
