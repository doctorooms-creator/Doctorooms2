# 01 — Scenarios & Acceptance Criteria (the E2E script)

> Doctor's real day as 16 scenarios. Each: the situation → current friction → Dashboard 2 behavior → **testable acceptance criteria**. These become agent-browser E2E scripts per phase. Sources: worklog audits `doctor-dashboard-audit` + `doctor-cockpit-automation-design`.

---

## S1 — Pre-flight (8:55 AM, screen opens)

**Situation:** Doctor opens Dashboard 2 before OPD. Reception has been booking since 8:40; some online bookings may still be Pending; a lab report may have landed overnight.

**Today:** Doctor discovers mid-OPD that 3 patients were never approved (queue was silently incomplete).

**Dashboard 2 (Morning state):** One glance answers: today's approved count, first patient + time, pending approvals warning (reception-notified, doctor just sees truth), reports awaiting review, upcoming video slots.

**AC:**
- [ ] Opening `/opd` with 12 approved + 3 pending shows: "12 in queue · first 09:30 (GEN-001)" + "⚠ 3 bookings pending approval" strip
- [ ] Pending strip is informational (no approve button in v1 — reception's job); clicking it navigates to the old appointments page
- [ ] With 0 reports pending, the reports line is absent (not an empty box)
- [ ] Queue empty + 0 pending = clean "OPD opens with the first booking — 09:30, GEN-001, Suresh Yadav" message

## S2 — Cold start, first patient (9:00)

**Dashboard 2:** Hero shows first patient card. "Call First Patient" = today's Call Next, relocated as the single primary action.

**AC:**
- [ ] "Call" flips booking Approve→Visited via existing `/api/dashboard/doctor/appointments/[id]/status` (reuse, don't reinvent)
- [ ] Patient notified (existing notifyNextPatient / consultation_started pipeline)
- [ ] Hero transitions to "in consultation" state (S4)

## S3 — The golden window (20–30 s after call)

**Situation:** Patient walks from waiting room to chair. Doctor's eyes are free.

**Today:** Doctor hunts for the patient's row to click into the wizard.

**Dashboard 2:** Hero already shows the patient's pre-loaded chart: today's complaint, last visit (date + diagnosis + meds with doses), vitals trend, alerts, visit count. A "Start Rx" primary button (Enter key) sits on the card.

**AC:**
- [ ] Chart data from `/api/copilot/brief/[bookingId]` (already aggregates lastRx + doses + vitals history)
- [ ] Revisit patient (has history): chart renders Last Visit block + vitals trend + visit count within 1s of call (prefetched on call)
- [ ] First-visit patient: chart shows clean "First visit — no history with you" + mobile-not-found note; NO empty boxes
- [ ] Enter key = Start Rx → wizard opens (existing `/dashboard/doctor/prescriptions/new?bookingId=` route, opens in normal chrome — v1; wizard-in-cockpit is Phase F+)

## S4 — Rx writing (60–120 s)

**Dashboard 2 v1:** Wizard as today (full 8 steps) — untouched. Cockpit keeps the queue visible when the doctor returns. **v2 (Phase F):** Quick-Rx one-screen for simple cases.

**AC (v1):**
- [ ] Finishing in wizard and returning to `/opd` shows updated queue (patient gone, slot freed) within one 15s poll or immediately via cache invalidation
- [ ] No duplicate "Mark Visit Complete" — finalize already stamps Finish (a9fa7b6); overlay's extra button hidden when status already Finish

## S5 — ★ Auto-advance (the crown jewel — Phase C)

**Situation:** Doctor hits Save & Print.

**Today:** 4 steps between patients (print overlay → close → dashboard → Call Next → find row).

**Dashboard 2:** ONE action → six system updates: ① booking Finish (exists) ② print overlay (exists) ③ next patient called/notified (partially exists) ④ waiting display updates ⑤ doctor's screen shows next patient's chart ⑥ reports inbox refreshes.

**AC:**
- [ ] With autoAdvance ON + queue NOT paused + no in-consultation patient: finalize response includes `nextBooking {id, token, name}` AND server flips that booking Approve→Visited + fires consultation_started + patient notification
- [ ] Cockpit hero swaps to next patient's chart within 500ms of print-overlay close (the ONE authored animation, see 02 §5)
- [ ] Queue paused: NO auto-call; hero shows "Break — GEN-013 ready when you are ☕" + Resume
- [ ] Another patient mid-consultation: no auto-call (impossible by rule — only one in consultation)
- [ ] autoAdvance OFF (setting): hero shows next patient as "Next up" with the Call button (today's behavior)
- [ ] Doctor's print overlay close returns to cockpit, never to old dashboard
- [ ] Waiting-room display (`/dashboard/hospital/queue-display`) reflects the new currently-serving within its refresh cycle (no code change expected — verify)

## S6 — Revisit / chronic patient (30% of OPD)

**AC (Phase D):**
- [ ] Chart detects repeat pattern (same complaint within N days OR ≥3 past visits) → renders "⏩ Repeat last Rx" suggestion chip
- [ ] Chip opens wizard pre-seeded from last Rx (clone meds/doses/advice as DRAFT — editable, never auto-printed)
- [ ] 30-second path measurable: call → Repeat chip → adjust vitals → Save & Print

## S7 — First-visit patient

**AC:** covered in S3 (clean first-visit mode). Extra:
- [ ] Hospital mode: "1 visit with Dr. Anita (Sep) — [Expand]" collapsed line, only when a cross-doctor visit exists (Phase D, D6 decision)

## S8 — Report returns mid-day (11:20)

**AC (Phase D):**
- [ ] LabReport entering "completed" state fires doctor notification (new event — today missing)
- [ ] Reports inbox strip appears in queue footer: "2 reports ready — Suresh (HbA1c 6.8 ↑ from 6.2) · Rahul (CBC normal)"
- [ ] Abnormal vs normal distinguishable by tone + glyph, values show delta vs previous where both exist
- [ ] Clicking a report entry opens the report (existing lab report view) with back-return to /opd

## S9 — Emergency mid-Rx (12:45)

**AC:**
- [ ] Emergency booking (isEmergency) renders rose-tier row pinned at queue top (existing tiering preserved)
- [ ] "Send In Now" on the emergency row: flips it → Visited immediately even mid-another-consultation (reception creates emergency; doctor's call)
- [ ] Yellow strip on cockpit: "GEN-009 Rx draft paused — resume" persists until resumed or discarded (draft API exists — visualize it)

## S10 — Video slot (12:00)

**AC:**
- [ ] Countdown chip in top bar from T-10min: "Priya · video · in 8 min"
- [ ] When a VideoCall booking is called (auto or manual): hero shows "Join Call" primary (existing videoRoomId flow)
- [ ] VIDEO badge on queue rows (exists — carry over)

## S11 — No-show (1:10)

**AC:**
- [ ] Called patient with no finalize for 3 min → soft prompt: "GEN-012 — 3 min, no show? [Yes] [Still coming]" (never auto-marks)
- [ ] Two-click No-show preserved (existing pattern)

## S12 — Pause / lunch (1:00)

**AC:**
- [ ] Pause toggle in top bar (existing queue-pause API)
- [ ] Paused: auto-advance sleeps (S5), hero shows break state, Resume = one tap
- [ ] PAUSED chip visible at all times while paused

## S13 — Pending-approval leak (all day)

**AC:** covered in S1 — persistent strip while count > 0. Reception notified once (existing notification lib).

## S14 — OPD-end overrun (1:50)

**AC (Phase F):**
- [ ] T-30min before OPD end with >0 waiting: "OPD closes 2:00 — 6 waiting (~75 min). Shift to tomorrow? → tell reception" (informational + one action: notify reception)

## S15 — Day end (2:30)

**AC (Phase F):**
- [ ] Queue empty + past end time → Day Summary state: patients seen / no-shows / reports pending / drafts open / tomorrow's first booking + patient name; "Done for today" acknowledgment exits to old dashboard
- [ ] All figures computed from DB — no hardcoded trends (the fake-stats lesson)

## S16 — Search any patient (any time)

**AC:**
- [ ] "/" or Ctrl+K focuses the search field (top bar)
- [ ] Searches mobile / name / token via existing patient-search + search-prescriptions APIs; result rows open chart or Rx (existing destinations)
- [ ] Esc closes search; typing resumes focus

---

## Not in v1 (parked — revisit after Phase G)

- Solo-clinic auto-approve of online bookings (S13 extreme)
- Nurse-side vitals pre-fill (needs nurse workflow surface)
- Medicine personal top-N ranking engine (data exists; needs ranking aggregation)
- OPD Mode = wizard embedded inside cockpit hero (Phase F+ candidate)
- Business mood screen ("Practice" — earnings/reviews/campaigns live behind a separate door, out of OPD sight)
