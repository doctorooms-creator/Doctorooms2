# 04 — Technical Implementation Plan

> File-level changes, API contracts, data flow, and per-phase verification. **Read `worklog.md` first every session** (env rules, sandbox discipline). Nothing here starts until the owner says go.

---

## 0. Environment & discipline (unchanged from worklog)

- Dev: `:3000` via `bash start-all.sh` (restart on OOM); realtime `:3006`.
- DB E2E: `bash scripts/sandbox-sqlite.sh` → seed via tmp-scripts → **restore `scripts/deploy-schema-restore.sh` before ANY commit**.
- NEVER: `bun run build` · `prisma/seed.ts` · commit secrets · commit sqlite schema.
- Login: POST `/api/dev-login` `{"role":"doctor","userId":"<from seed>"}`.
- Prod: push to origin/main → Vercel auto-deploys (~3.5 min).

## 1. Route & file map (Phase A)

```
src/app/opd/
  layout.tsx          # minimal: metadata (title "OPD Cockpit — Doctorooms"), no chrome
  page.tsx            # 'use client' shell: auth guard → <OpdCockpit doctorId/>
src/app/opd/opd.css   # tokens (02-DESIGN-SYSTEM §2) + browser-surface theming

src/components/opd/
  opd-cockpit.tsx     # zone orchestrator (top bar + hero + rail + queue + facts)
  top-bar.tsx
  hero-patient-card.tsx
  chart-rail.tsx
  queue-strip.tsx
  facts-strip.tsx
  day-states/ (morning.tsx, break.tsx, day-end.tsx, empty-queue.tsx)
  use-opd-data.ts     # TanStack Query hook: ['opd-cockpit'] + 15s poll + socket push
  use-keyboard.ts     # keyboard map (03 §5)

src/lib/sidebar-config.ts   # +1 item: { label: 'Dashboard 2', href: '/opd', icon: LayoutDashboard } (doctor section, 2nd position)
```

**Why `/opd` and not `/dashboard/doctor/opd`:** verified — `src/app/dashboard/layout.tsx` mounts sidebar+header+footer for ALL `/dashboard/*`; doctor layout adds copilot+onboarding gate. Full-screen requires escaping both → route outside that tree, with its own guard (copy the auth-check pattern from dashboard layout; doctor role assert; redirect `/login` or `/dashboard/doctor/onboarding` per onboarding-status).

## 2. API contracts

### 2.1 NEW — `GET /api/opd/cockpit` (Phase B)

One aggregate, one poll, single source of truth for the whole screen. Doctor-scoped via session (same guard as other doctor APIs).

```ts
Response {
  doctor: { id, name, specialization, queuePaused }
  scope:  { hospitalName, departmentName, shortCode, floorNo, opdRoom, opdTimings, closesAt }
  queue: Array<{
    id, tokenNumber, tokenOrder, patientName, patientImg,
    age?, gender?, disease, bookingMode?, isEmergency?, timeSlot?,
    status: 'Approve'|'Visited'|'Finish'|'NoShow',
    calledAt?: string,          // for wait/no-show timers
    waitingSeconds: number,     // computed server-side (IST-safe)
    bookingType
  }>            // FIFO + emergency tier — REUSE slotAwareSort/queue query from /api/queue/doctor/[doctorId]
  stats: { done: number, waiting: number, inConsultation: 0|1, backlogMinutes: number }  // all computed
  currentServing: { id, tokenNumber, patientName, calledAt } | null
  nextUp: { id, tokenNumber, patientName } | null
  reportsInbox: Array<{ labReportId, patientName, testName, value?, unit?, flag?: 'normal'|'abnormal', previousValue?, previousDate?, readyAt }>  // Phase D fills values; Phase B = counts only
  pendingApprovals: number
  draftsOpen: Array<{ bookingId, patientName, updatedAt }>     // Phase D visual
  videoUpcoming: { bookingId, patientName, timeSlot, minutesUntil } | null
  autoAdvance: boolean          // doctor setting (2.3)
}
```

Implementation: new route file, internally composing existing queries (doctor queue query + sent-for-tests + LabReport + booking counts) — no duplication of business logic, imports only. Cache: none (15s poll is the cache). Auth: same session guard pattern as `/api/dashboard/doctor/*`.

### 2.2 EXTEND — `POST /api/prescription/[id]/finalize` (Phase C)

After existing Finish + notifyNextPatient block, add auto-advance (server-side atomic-ish, after the transaction):

```ts
// pseudo — inside finalize, post-commit
if (doctorSettings.autoAdvance && !doctor.queuePaused && inConsultationCount === 0) {
  next = firstWaitingBooking()             // same FIFO+tier as queue API
  if (next) {
    flip next → 'Visited'                  // same transition code as doctor status route (extract shared helper to lib to avoid 3rd copy)
    fire consultation_started + notifyNextPatient(next)
    response.nextBooking = { id, tokenNumber, patientName }
  }
}
```

Rules: respects Pause · only when zero in-consultation · returns nextBooking so the cockpit swaps hero without waiting for poll · failures in auto-advance NEVER fail finalize (try/catch, log, continue).

**Refactor note:** the Approve→Visited transition + notifications currently live in the doctor status route; extract `callNextPatient(bookingId)` into `src/lib/queue-lifecycle.ts` used by BOTH the status route and finalize (single source, 4th place token lesson learned).

### 2.3 Doctor setting — `autoAdvance` (Phase C)

- v1: `localStorage 'opd:autoAdvance'` (default ON) read by finalize?? — NO: finalize is server-side; setting must be server-visible.
- Correct v1: store on `Doctor` model? Check schema for existing settings/JSON field (e.g. `queuePaused` precedent — queue-pause route PUT persists on doctor). Follow the SAME pattern: `PUT /api/opd/settings { autoAdvance }` → persisted on Doctor row (`autoAdvance Boolean @default(true)` migration — sandbox-test the migration first).
- Cockpit settings popover reads/writes it; included in cockpit GET response.

### 2.4 NEW — lab-report-arrival event (Phase D)

In the lab result-entry completion path (find the route that stamps LabReport `status → Complete` / `resultEnteredAt`): fire doctor notification via existing notification lib ("Report ready: {test} — {patient}") + realtime push if `:3006` up. No schema change needed (doctorId exists on LabReport).

### 2.5 EXTEND — brief API (Phase D)

`/api/copilot/brief/[bookingId]`: add pulse/SpO₂ to vitals history (from labels JSON per past Rx), add allergies (schema §2.6), add reports-with-deltas (LabReport by patient+doctor), add repeat-pattern flag (same disease within 30d OR ≥3 visits).

### 2.6 Schema addition (Phase D)

```prisma
model Patient { allergies String? }   // free-text v1 (D7)
model Doctor  { autoAdvance Boolean @default(true) }
```
Sandbox-first migration; prod via `prisma db push` on deploy branch per established flow.

## 3. Data flow

```
[opd-cockpit query] --15s poll--> GET /api/opd/cockpit -----> all zones
        │                                                   (single payload = single truth)
        ├── on 'call' action --> PUT status (existing) --> invalidate ['opd-cockpit']
        ├── on wizard finalize <-- nextBooking in response --> hero swap (authored motion)
        └── optional: useSocket :3006 'queue:update' push --> invalidate (prod falls back to poll silently)
```

No new state library — TanStack Query (in stack) + local useState for UI states. Framer Motion (in stack) for all motion per 02 §5.

## 4. Phase checklists (files touched)

**A (shell):** `src/app/opd/{layout,page}.tsx` · `opd.css` · `sidebar-config.ts` (+1 line) · guard component. ~6 files, zero data.
**B (v1 truth):** `/api/opd/cockpit/route.ts` · `src/components/opd/*` (7 components + 2 hooks) · reuse: queue queries, status APIs, brief API. ~12 files.
**C (auto-advance):** `finalize/route.ts` + `src/lib/queue-lifecycle.ts` (extract) + doctor status route (use helper) + settings route + schema (autoAdvance) + hero swap motion. ~6 files.
**D (chart depth):** brief route + lab completion route (event) + schema (allergies) + wizard Step 2 (allergy capture) + chart-rail sections + repeat-chip + draft strip. ~8 files.
**E (polish):** all opd components (states+motion) + `opd.css` browser surfaces + reduced-motion audit + dark tokens (optional). ~10 file touches, no logic.
**F (quick-rx + bookends):** wizard quick-mode (biggest single item — separate detailed plan before starting) + morning/day-end states + sidebar diet (owner opt-in).

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Auto-advance calls patient while doctor away (post-print distraction) | ① Pause exists ② autoAdvance toggle ③ patient notification is "your turn" — same as today's Call Next, doctor isn't forced to Start Rx ④ manual Call Next remains |
| Double-call race (finalize auto-advance vs doctor pressing N simultaneously) | Server-side single transition guard (status must be 'Approve'; Prisma updateMany with where-status → 0 rows = already called, ignore) |
| Aggregate API slow (many queries) | Compose with Promise.all; reuse existing queue query shape; measure — target <300ms p95; 15s poll absorbs |
| Old dashboard regression | Zero shared-file edits in A/B; C touches finalize + status route — covered by existing E2E scripts + sandbox day-simulation rerun |
| Fullscreen API blocked (iframe policies) | Feature-detect; button hides; layout is already chrome-free — native fullscreen is enhancement, not dependency |
| Vercel prod: no websocket | Poll-only design (like today); socket = progressive enhancement |

## 6. Verification per phase (agent-browser, sandbox sqlite day-seed)

Standard loop after each phase: seed day (5 patients incl. 1 video + 1 emergency + 1 revisit with history) → run scenario ACs from `01-SCENARIOS.md` for that phase → screenshots (1440/768/390 + reduced-motion) → `bun run lint` → dev.log tail → worklog append → restore postgres schema → commit.

**Phase-specific:**
- A: `/opd` loads post-dev-login (doctor); sidebar link visible for doctor ONLY (receptionist/patient navs unchanged); Esc/exit works; fullscreen toggles; unauthenticated → login redirect.
- B: all 16 scenarios' READ-side ACs; every number cross-checked against a SQL count (zero fakery); empty/zero/loading/error states exercised (empty queue seed variant).
- C: S5 all 7 ACs incl. paused/no-toggle/race-guard; day-simulation rerun proves no stuck In-OPD patients (the reallife-e2e regression suite).
- D: S3/S6/S7/S8/S9 ACs; allergy renders on chart when set; report-arrival fires notification; repeat chip suggests-not-executes.
- E: taste `inspect.mjs --app` 0 FAIL + `lint.mjs --app` clean + keyboard-only full patient loop (Call→Start→…→Save&Print→auto-advance) with ZERO mouse.
- F: S1/S14/S15 ACs + Quick-Rx 3-tap path timing.

## 7. QA tooling notes

- taste scripts: `node skills/taste-skill/scripts/inspect.mjs --app http://localhost:3000/opd` (needs the day-seed running + dev-login cookie in that browser context — run via agent-browser session or export cookie; if the inspector can't auth, screenshot via agent-browser and run the critique checklist manually — document honestly per taste report rules).
- impeccable: run its craft-floor checklist manually against screenshots (its binary launcher is `skills/impeccable/scripts/impeccable`); use `polish` reference as the final-pass checklist.
- Both skills' full references are installed locally: `skills/impeccable/reference/*` · `skills/taste-skill/references/*` — READ the relevant one before each phase (animate.md before E; app-screens.md §2.7/§11 before B states).

## 8. Owner demo checklist (Phase G judgement)

Run on dev → then prod:
1. Subah: open `/opd` → morning state truthful (pending warnings real)
2. Call first patient → chart appears during walk-in → Enter → wizard
3. Save & Print → print → **screen itself advanced to next patient** (the wow moment — time it: <1s)
4. Lunch: Pause → break state → Resume
5. Emergency lands → row pins top → Send In Now
6. Report arrives (lab tech completes) → inbox strip appears
7. Day end → summary + tomorrow's first
8. Whole loop keyboard-only, no mouse
9. Side-by-side: old dashboard untouched, still works
10. The honest question: "Does this make my OPD day easier?" — if not, we iterate before keeping.

## 9. Rollout & keep/park decision

- Phase A–E merge behind normal commits (feature is a NEW route — zero risk to existing users).
- Owner trials on dev → prod behind the sidebar link (no announcement) → 1–2 weeks side-by-side → Phase G decision.
- If KEEP: rename label ("OPD Cockpit" or keep "Dashboard 2"), consider redirecting old dashboard → `/opd` for doctors, archive this plan's completed checkboxes.
- If PARK: sidebar item removed in one line; code stays dormant for the next attempt; lessons → worklog.
