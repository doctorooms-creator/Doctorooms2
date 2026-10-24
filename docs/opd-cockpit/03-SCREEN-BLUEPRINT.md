# 03 — Screen Blueprint (zones, states, interactions)

> The concrete layout of `/opd` — element by element: what it is, where data comes from, how it behaves, how it moves, what its states are. Companion to `02-DESIGN-SYSTEM.md` (laws) and `01-SCENARIOS.md` (behaviors).

---

## 1. Full-screen mechanics

```
Route:    /opd                (src/app/opd/page.tsx — OUTSIDE /dashboard/* layouts)
Entry:    Doctor sidebar item "Dashboard 2" (sidebar-config.ts, doctor role only)
Auth:     Own guard (reuse useAuthStore + /api/auth/me pattern; doctor role check; onboarding redirect like doctor layout)
Chrome:   NONE — no app sidebar, no dashboard header/footer, no copilot mount. This IS the point.
```

- **Native fullscreen:** "⤢ Fullscreen" toggle in top bar calls `document.documentElement.requestFullscreen()` (and ExitFullscreen). Doc icon tooltip: "Best experience — hides browser bars". On `fullscreenchange`, toggle icon state.
- **Exit affordances:** (a) "← Classic view" ghost button top-left (→ `/dashboard/doctor`), (b) Esc exits overlays first, then shows a small confirm to leave cockpit (avoid accidental Esc losing context), (c) session-persistent URL — doctor can bookmark `/opd` directly.
- **Title/meta:** `<title>OPD Cockpit — Doctorooms</title>`; the product's mark (teal monogram) + doctor name + hospital/department scope in the top bar — the screen must be nameable from a screenshot (taste law).

## 2. Zone map (desktop ≥1280px)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR 48px  [← Classic] [⌘ Doctorooms · Dr. Rajesh · GEN/OPD-1]          │
│             [🔍 search………  / ]        [📹 video in 8m] [⏸ Pause] [⤢] [D2 ⓘ] │
├──────────────────────────────────────────────┬─────────────────────────────┤
│ HERO ZONE (fluid, ~60vh)                     │ CHART RAIL 384px            │
│                                              │                             │
│  ┌────────────────────────────────────────┐  │  (During "called" state:)   │
│  │ CURRENT/NEXT PATIENT CARD              │  │  Pre-visit brief:           │
│  │  GEN-006 (token, tabular 600)          │  │   · Today's complaint      │
│  │  Rahul Sharma · 24 · M                 │  │   · Last visit + Rx+doses  │
│  │  "Called — walking in" / "In OPD"      │  │   · Vitals trend (sparkline)│
│  │  ─ context line (1-visit summary) ─    │  │   · Reports + deltas       │
│  │  [ ▶ Start Rx (Enter) ]  [No-show]     │  │   · Alerts (allergy)       │
│  └────────────────────────────────────────┘  │   · Visit count / first-visit│
│  (state-dependent: morning / waiting /      │                             │
│   break / day-end variants — see §4)        │  (Idle: today at a glance)  │
├──────────────────────────────────────────────┴─────────────────────────────┤
│ QUEUE STRIP (fixed height ~200px, scroll 5 rows visible)                   │
│  GEN-007  Rahul · 24 · fever        waiting 14m   [No-show]                │
│  🚨 EMR-008  chest pain             waiting 2m    [Send In Now]            │
│  GEN-009  Aditya · 📹 video · 12:00  waiting 0m                            │
├────────────────────────────────────────────────────────────────────────────┤
│ FACTS STRIP 32px:  23 done · 5 waiting · ~40 min backlog · 2 reports ready │
│                   ⚠ 3 pending approvals · OPD closes 14:00                 │
└────────────────────────────────────────────────────────────────────────────┘
```

Below 1280px: chart rail collapses — brief content folds INTO the hero card (accordion sections). Below 768px: hero full-bleed, queue = collapsible drawer (sheet), facts strip wraps to 2 lines. Phone is its OWN composition.

## 3. Element-by-element spec

### 3.1 Top bar

| Element | Data | Interaction | Motion |
|---|---|---|---|
| `← Classic view` | — | click → `/dashboard/doctor` | press 98% |
| Product mark + scope | auth + hospital-links API | none (identity) | none |
| Search field | — | `/` or Ctrl+K focuses; searches mobile/name/token; arrows navigate; Enter opens | palette opens 180ms scale-fade |
| Video countdown chip | queue items where bookingMode=VideoCall + timeSlot within 10min | click = focus that queue row | chip slides in when <10min |
| Pause toggle | queue-pause API (exists) | two-state; PAUSED chip persists | 200ms state swap |
| Fullscreen toggle | Fullscreen API | click toggles | icon crossfade |
| Settings (⚙) | autoAdvance on/off, sound cues | popover (portal) | popover 180ms |

### 3.2 Hero patient card (the screen's heart)

**States:** `morning` (no patients called yet) → `called` (golden window; primary = "Start Rx ⏎") → `in-opd` (wizard open elsewhere / chart rail mode) → `break` (paused) → `day-end` (summary) → `empty-queue` (between calls when queue drained).

| Element | Data source | Notes |
|---|---|---|
| Token number | booking.tokenNumber | tabular 600, 24–28px, ink — the board motif |
| Name · age · gender | booking | 16px/600 |
| Status line | booking.status → human words ("Called — walking in", "In OPD") | 12px muted; teal pale wash chip |
| Context line | computed: "4th visit · last 12 Oct · HbA1c 6.8 ↑" | ONE line, only real facts |
| Start Rx button | → existing wizard route with bookingId | near-black primary; Enter keybound; press feedback |
| No-show | existing status API | two-click confirm (existing pattern) |
| Repeat Rx chip (Phase D) | repeat-pattern detection | suggestion only — opens wizard pre-seeded |

**Golden-window behavior (S3):** on `called`, the chart rail pre-loads the brief (prefetch on call action fires). Doctor reads while patient walks.

### 3.3 Chart rail (≥1280px)

Renders `/api/copilot/brief/[bookingId]` data (exists) + Phase D extensions (allergy alert, reports deltas, pulse/SpO₂ trend):
- **Today's complaint** (reception-noted / online booking field)
- **Last visit** block: date · diagnosis · meds WITH doses (one line each, 3 max + "+2 more")
- **Vitals trend**: sparkline BP + weight (exists) + pulse/SpO₂ (Phase D) — flat teal line, no chart chrome, no legend; last value labeled
- **Reports**: value + delta glyph + baseline in words ("6.8 vs 6.2 in Mar")
- **Alerts**: allergy (Phase D) in warning pale pair — one per patient max displayed prominently
- **First visit**: "First visit with you — no history" + (hospital mode) collapsed cross-doctor line
- Idle (no called patient): today-at-a-glance (first slot, expected load, pending count)

### 3.4 Queue strip

- Existing FIFO + emergency tier + VIDEO badge data (queue API — reuse)
- Columns: token (600 tabular) · name/age/gender · complaint (muted, 1 line) · wait time (live mm counter, tabular, right-aligned) · badges (VIDEO/EMERGENCY) · row actions ([No-show] on waiting rows; [Send In Now] on emergency)
- Row: 44px, 1px rules, hover = tone step, called row → compact "done" row (green check glyph, 32px height)
- New row arrives: slide-in 200ms (cap stagger 3 rows)
- Scroll: custom thin scrollbar (themed); 5 rows visible, gradient-free fade edge (mask)

### 3.5 Facts strip (the honest KPI line)

ONE container, 1px dividers, NO tiles/icons/sparklines: `done today · waiting · est. backlog (~min) · reports ready · ⚠ pending approvals · closes 14:00`.
- All computed from the aggregate API payload — zero hardcoded trends (the fake-stats lesson is THE founding scar of this screen)
- Delta words name baseline ("23 done · 5 since 11:00")
- Reports/pending values are links (scroll/focus their surfaces)

## 4. Day-states (screen morphs by time + queue state)

| State | Trigger | Hero shows | Primary action |
|---|---|---|---|
| **Morning** | before first call, queue has items | "OPD opens — 12 booked · first GEN-001 09:30 Suresh Yadav" + reports/pending warnings | `Call First Patient` |
| **Mid-day** | default | current patient card + chart rail | `Start Rx ⏎` / auto-advanced chart |
| **Reports-return** | reports-ready > 0 (any time) | facts strip link + rail section emphasis; if doctor idle → hero variant "2 reports ready — review now" | `Review` |
| **Break** | queuePaused | "Break — GEN-013 ready when you are" + ☕ + today-so-far line | `Resume Queue` |
| **Day-end** | queue empty + past close | summary: seen / no-shows / reports pending / drafts / tomorrow's first | `Done for today` → classic dashboard |

State transitions: 240–320ms crossfade, content-stable (no full-screen choreography).

## 5. Keyboard map (keyboard-first promise)

| Key | Action |
|---|---|
| `Enter` | hero primary (Call / Start Rx / Resume / Done) |
| `/` or `Ctrl+K` | focus search |
| `N` | Call Next (manual override — always available) |
| `P` | Pause/Resume queue |
| `↑/↓` | move through queue rows (selection = 1px accent wash) |
| `Esc` | close overlay → confirm-exit (last) |
| `?` | keyboard help popover (discoverability) |

## 6. Safeguards built into the UI (not just backend)

1. **Pause-aware auto-advance** — break state is visually unmistakable; auto-call impossible while paused
2. **Suggest-never-execute** — Repeat Rx chip opens a DRAFT; nothing prints without doctor's Save & Print
3. **Manual override always visible** — "Call Next (N)" lives in the top bar even when auto-advance is on
4. **One in consultation, ever** — hero is a single-patient surface; parallel consults structurally impossible
5. **Draft memory** — interrupted Rx = persistent yellow strip until resolved (S9)
6. **No fake urgency** — no red pulsing, no blinking; red = one mark on the one fact that needs it

## 7. Empty / zero / loading / error states (per taste laws)

| Surface | Empty | Loading | Error |
|---|---|---|---|
| Queue | "No patients yet — the queue fills as reception books. First slot 09:30." | 3 skeleton rows (44px, shimmer-free pulse) | inline strip + retry — queue NEVER blank |
| Chart rail | first-visit teaching state | skeleton lines matching final layout | "History unavailable — [retry]" (consultation continues offline) |
| Facts | real zeros ("0 waiting") | dashes | dashes + toast |
| Reports inbox | absent (no empty box) | absent | absent |
| Aggregate API | — | full-page skeleton preserving zone geometry (NO spinner) | full-screen honest error + retry + "Classic view still works →" |

JS-failure law: server-rendered shell + data default-visible; animations only enhance, never gate content.

## 8. What this screen deliberately does NOT have

Stat card grids · icon circles · sparkline KPIs · hero-metric template · reviews/earnings/ratings · lost-revenue banner · "Welcome back, Dr." greeting · page-load choreography · zebra tables · ALL-CAPS labels · gradient anything · glass panels · emoji as UI (☕ in break copy is text-tone, not interface chrome) · a second sidebar.
