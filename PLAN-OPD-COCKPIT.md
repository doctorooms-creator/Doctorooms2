# PLAN — Doctor "Dashboard 2" (OPD Cockpit) 🩺

> **STATUS: PLANNING COMPLETE — AWAITING OWNER GO. NO CODE WRITTEN YET.**
> Created: 2026-10-24 · Owner decision: build new "Dashboard 2" alongside the existing dashboard, operate it FULL-SCREEN, judge it side-by-side, keep it only if it earns its place.

---

## 0. The One-Line Vision

> **Doctor kam se kam screen ko chhoo'e.** One doctor action (Save & Print) = six system updates. Between patients: zero clicks. During a patient: one screen. Numbers: never fake.

## 1. What the owner decided (this conversation)

| Decision | Detail |
|---|---|
| Existing dashboard | **UNCHANGED** — no edits to `/dashboard/doctor/page.tsx` for now |
| New entry | Sidebar item **"Dashboard 2"** for the doctor role |
| Operation mode | **FULL-SCREEN** — clicking it takes over the whole viewport (no sidebar/header/footer) |
| Trial model | Run both dashboards side-by-side → if the new one feels right, keep it |
| Feel | Smooth interactive elements + smooth animations; **professional, NOT AI-generated-looking**; easy to understand |
| Design authority | Two installed skills: `skills/impeccable` (pbakaus) + `skills/taste-skill` (leonxlnx) — see §3 |
| Crown-jewel automation | Save & Print → auto-open NEXT patient's full context (past Rx, reports, history) — ~80% plumbing already exists |

## 2. Where the ideas come from (traceability)

- **Worklog audits** (2 rounds): `doctor-dashboard-audit` (clutter post-mortem, fake stat trends, 15-20 clicks/patient) + `doctor-cockpit-automation-design` (16 scenarios, 16 automations, 1-action:6-updates thesis).
- **Engineering truth**: `notifyNextPatient()` fires on finalize (queue-notifications.ts:235); brief API aggregates lastRx medicines+doses+vitals history; draft auto-resume exists; auto-Finish on Save & Print exists (a9fa7b6). Missing wires: auto-flip next booking → Visited, auto-open chart, waiting-display sync.
- **Known gaps** (must fix during build): no allergy field in schema; no lab-report-arrival notification to doctor; pulse/SpO₂ not trended (live in labels JSON).

## 3. Design sources — how the two skills govern this build

| Skill | What we take from it |
|---|---|
| `skills/impeccable` | **Operate mode** doctrine ("the tool disappears into the task; earned familiarity beats expression"), craft-floor bans, animation timing tables (100-150ms feedback / 150-300ms state / 500-800ms authored), component states law (default/hover/focus/active/disabled/loading/error), browser surfaces theming |
| `skills/taste-skill` | **app-screens.md chapter** (the anti-template dashboard bible): color ~3% of pixels and ON DATA not chrome; KPIs are type not tiles (no icon circles, no sparklines); flat surfaces (1px border OR tone step, never both); nav recedes; tables = rules + alignment + tabular-nums, no zebra; honest zeros and dashes; deltas name their baseline and color = good/bad not up/down; ONE authored motion moment; no page-load choreography; empty states teach |

**Brand mapping (taste `--keep palette,type` path):** existing Doctorooms teal (`#0d9488` family) stays as THE single accent → on the main data element + the one primary action. Everything else: neutral greys from the taste default tokens (light theme; dark later). One type family, fixed rem scale, ratio ~1.16.

**During Phase B, optionally run:** `node skills/taste-skill/scripts/draw.mjs --app --kind overview --brief "…"` with `--keep palette,type` to deal style variants; and `node skills/taste-skill/scripts/inspect.mjs --app <url>` as the QA gate (0 FAIL required) + `lint.mjs --app`. Full checklist in `docs/opd-cockpit/04-TECH-IMPLEMENTATION.md` §7.

## 4. Files of this plan (read order)

| File | Contents |
|---|---|
| `PLAN-OPD-COCKPIT.md` (this) | Vision, phases, decisions, tracking |
| `docs/opd-cockpit/01-SCENARIOS.md` | 16 day-scenarios → cockpit behavior → acceptance criteria (becomes the E2E script) |
| `docs/opd-cockpit/02-DESIGN-SYSTEM.md` | Tokens, type, color, motion spec, component rules, bans |
| `docs/opd-cockpit/03-SCREEN-BLUEPRINT.md` | Zone map, 4 day-states, element-by-element spec, keyboard map, full-screen mechanics, safeguards |
| `docs/opd-cockpit/04-TECH-IMPLEMENTATION.md` | Routes, API contracts, file-level changes per phase, verification per phase |

## 5. Build phases (checkboxes = tracking)

- [x] **Phase A — Full-screen shell + entry** ✅ DONE (2026-10-25)
  Route `/opd` (outside dashboard layout), own auth guard (doctor role + onboarding gate), native Fullscreen API toggle, exit affordance (Esc×2 + Classic view button), sidebar item "Dashboard 2" for doctors only. Empty state names product + scope. Zero data work.
- [x] **Phase B — Cockpit v1 (read-only truth)** ✅ DONE (2026-10-25)
  `GET /api/opd/cockpit` aggregate (queue+stats+reports+pending+drafts+video+scope, ALL computed). Screen: honest facts strip (1 container, 1px dividers), hero card (6 day-states), chart rail (brief), queue strip (rules+tabular), search (Ctrl+K + / + Esc), all empty/zero/loading/error states. VLM verdict 8.5/10 "real deployed healthcare product, not AI-generated". Responsive verified 1440/768/390.
- [x] **Phase C — Auto-advance engine** ✅ DONE (2026-10-25)
  `src/lib/queue-lifecycle.ts` (callNextPatient race-safe via updateMany-where-Approve + firstWaitingPatient + anyInConsultation). Finalize: after Finish-transaction → cookie-pref (default ON) + !paused + zero-in-consultation → auto-calls next + returns nextBooking (tail's notifyNextPatient skipped when auto-called, no double-ping). Top-bar Auto toggle (cookie v1). Step-6 stashes nextBooking in cache; FinishPrintOverlay gets returnTo=/opd → "Next: GEN-XXX →" button → /opd?advanced=1 → authored hero swap. E2E: EMR finish → GEN-001 auto-called + notified ✓; paused → no call ✓; midnight IST rollover (accidental day-boundary test) ✓.
- [ ] **Phase D — Pre-loaded chart depth** (1-1.5 days)
  Hero chart expands brief: last visit Rx with doses (exists), vitals trend incl. pulse/SpO₂ (extend brief API), reports inbox with abnormal flags + trend arrows (new lab-arrival notification event + LabReport query), allergy field (schema addition — `Patient.allergies String?` + capture in wizard Step 2 + chart alert), draft-resume yellow strip, repeat-visit pattern detection → "Repeat Last Rx" suggestion (suggest, never auto-execute).
- [ ] **Phase E — Motion & polish pass** (1 day)
  Every element gets feedback states per the motion spec (press 80ms scale, hover tone step, focus ring); the authored auto-advance card-swap; queue row arrival slide; print overlay transition; `prefers-reduced-motion` path; browser surfaces (selection, caret, scrollbar, focus ring) themed; impeccable polish checklist run; 3 critique rounds max.
- [ ] **Phase F — Quick-Rx / Full-Rx split + day bookends** (1-1.5 days, separate go)
  Quick-Rx mode (Diagnosis + Meds + Advice on ONE screen, 3 taps to print), pre-flight check (morning state: pending approvals warning, reports due, today's first slot), day-end summary state (counts, tomorrow's first patient). Sidebar diet for doctor nav (24→5 + "More") — opt-in, owner decision.
- [ ] **Phase G — Judge & keep** (owner)
  Side-by-side trial 1-2 weeks on dev → prod; owner demo checklist (see 04 §8); decide: keep / iterate / park. If keep: rename sidebar label, redirect old dashboard → /opd or keep both.

## 6. Decision log

| # | Decision | Status |
|---|---|---|
| D1 | New route outside dashboard layout (`/opd`) for true full-screen | ✅ settled (verified: `/dashboard/layout.tsx` wraps sidebar+header+footer for ALL `/dashboard/*` routes, so `/opd` is the only clean escape) |
| D2 | Label in sidebar = "Dashboard 2" (working label; rename at Phase G) | ✅ owner's words |
| D3 | Auto-advance default ON with Pause-awareness + manual override | ✅ proposed (safeguard trio) — confirm at Phase C |
| D4 | Quick-Rx default mode vs Full-Rx default | ⏳ open (Phase F) — recommendation: Quick-Rx default, "Full Rx" toggle on hero |
| D5 | Repeat-Last-Rx = suggest + one-tap clone into wizard, never auto-print | ✅ safeguard (medical liability) |
| D6 | Cross-doctor history in chart: collapsed "1 visit with Dr. Anita [Expand]" | ✅ proposed — confirm hospital-mode consent stance at Phase D |
| D7 | Allergy field: `Patient.allergies` free-text (v1) vs structured | ⏳ open — v1 free-text is honest and cheap; structured later if insurance/pharmacy needs it |
| D8 | Theme: light first (clinic = daylight rooms, glare), dark later | ✅ settled |
| D9 | Existing dashboard untouched during A-E | ✅ owner decision |

## 7. Guardrails (every phase)

1. **Zero risk to the current dashboard** — separate route, no shared mutable components without extraction; existing pages keep compiling untouched.
2. **No fake numbers, ever** — every figure computed from DB; zero prints as 0; missing = grey dash; deltas name their baseline.
3. **Pause is sacred** — auto-advance sleeps while queue paused; breaks are guilt-free.
4. **Medical decisions stay in doctor hands** — system suggests, doctor executes.
5. **Every automation has a manual override** — Call Next button never disappears.
6. **Sandbox E2E per phase** (`scripts/sandbox-sqlite.sh`, restore before commit); lint clean; never `bun run build`; never commit secrets; sqlite schema never committed.
7. **Animations respect `prefers-reduced-motion`** and never hide content when JS fails (data visible by default).

## 8. Definition of Done (per phase)

- Phase QA checklist in `04-TECH-IMPLEMENTATION.md` §7 all green (agent-browser E2E + taste inspect 0 FAIL + screenshots at 3 widths + reduced-motion check).
- Worklog updated; `bun run lint` clean; dev.log no new errors.
- Demo-able to owner in Preview Panel without console errors.

---

*Next action: owner says "go" → Phase A begins. Order: A → B → C (the crown jewel) → D → E → F → G.*
