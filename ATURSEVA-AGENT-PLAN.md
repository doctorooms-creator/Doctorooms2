# ATURSEVA AGENT — ARCHITECTURE & PHASED PLAN (v1, LOCKED)

> Owner GO: "Go ahead" (after audit-aturseva-user-side-1/2 + vision pillars).
> Mission: convert the product from FORM-FIRST (AI as side Sheet) to **AI-FIRST**
> (Aturseva agent window as the patient's primary interface), without rebuilding
> the backend that already works.

---

## 0. Owner vision → 5 pillars (locked)

1. **AI window = primary interface** (ChatGPT-style, full page) — services flow through it
2. **Conversational discovery + booking** — "nearby doctor nikal ke book kar do"
3. **Proactive status** — AI batati hai "approve hua ki nai", token number, queue
4. **AI holds the patient's data** — prescription-guided davai + doctor-completed tasks surfaced
5. **Persistent history** — ek agent hai; sab conversation + actions save

## 0.1 Delegated decisions (owner's "Go ahead" = my documented recommendations)

| # | Decision | Locked choice |
|---|---|---|
| D1 | UI scope | Phase-wise: NEW full-page chat window at `/dashboard/patient/aturseva` + keep FAB Sheet (quick access, shared history). Forms/pages stay for now (retire decision later). |
| D2 | Nearby search | Phase 1 = city/specialization/query search via agent tool (Doctor.city exists; lat/longi already in schema for Phase 2 geo). |
| D3 | History scope | **Actions as messages** — tool results persist as role `action` messages, rendered as rich cards. Single continuous thread per patient (ChatGPT-like), paginated. |
| D4 | Proactivity | Phase 1 = context-aware greeting + live toasts (med-reminder/dose-missed into EVENT_CONFIG). No unsolicited chat pushes yet (Phase 3 watcher, with AI-NURSE-PLAN spam caps). |
| D5 | Naming | User-visible **Sevika → Aturseva** everywhere patient touches (sidebar, pages, chat, notification signatures, doctor board label). Internal code/DB names (lib/sevika, SevikaSchedule…) stay (invisible; retire later). Platform chrome stays "Doctorooms". |

---

## 1. Architecture (agent layer on existing rails)

```
 Patient UI                         Next.js API (patient-only)              Prisma
┌────────────────────┐   POST msg   ┌──────────────────────────┐          ┌──────────────────┐
│ /dashboard/patient │ ───────────► │ /api/.../aturseva/chat   │ ───────► │ AtursevaConversation
│ /aturseva (FULL    │ ◄──SSE────── │  L1 session userId       │          │ AtursevaMessage   │
│ PAGE, agent home)  │  delta/action│  L2 buildAtursevaContext │          │  (user/aturseva/  │
│ + FAB Sheet        │  /done/error │     = sevika ctx +       │          │   action rows)    │
│ (shared history)   │              │       bookings + queue   │          └──────────────────┘
└────────────────────┘              │  L3 system prompt +      │
                                    │     TOOL protocol        │──► z-ai-web-dev-sdk (GLM)
                                    │ tools: search_doctors,  │      stream:true, thinking:off
                                    │ get_my_bookings,        │
                                    │ get_queue_position      │
                                    └──────────────────────────┘
```

**Tool protocol (prompt-based, streaming-safe):** if the model needs a tool it must
start its ENTIRE reply with exactly `[[TOOL]]{"tool":"name","args":{...}}` and nothing
else. Server buffers the first ~12 chars: prefix detected → swallow stream → execute
tool → persist `action` message → SSE `action` event → second LLM call with
TOOL RESULT block → stream final answer. No prefix → flush buffer, stream through.
Fast path = 1 LLM call; tool path = 2.

**Safety rails (unchanged + extended):** data-block-only knowledge; NEVER dose
changes/diagnosis; tool results are read-only queries; booking creation via chat is
NOT in Phase 1 (patient confirms on the existing book flow — landing honesty rule:
replays/answers only, actions keep human confirmation where money/appointments move).

## 2. API contract (this is what the frontend consumes)

### `GET /api/dashboard/patient/aturseva/chat`
→ `{ success, sessionExists, greeting: {…} | null, messages: [{id, role: 'user'|'aturseva'|'action', content, actionJson?: {type, title, data}, createdAt}] }`
- messages oldest→newest, last 200. `greeting` (only when thread empty): deterministic
  context-aware intro built server-side from live data (doses, next booking, queue).

### `POST /api/dashboard/patient/aturseva/chat`  body `{ message: string(≤1000) }`
SSE events:
- `delta` `{ text }` — many
- `action` `{ id, type, title, data }` — 0..2 per turn; render rich card
- `done` `{ messageId }`
- `error` `{ message }`
Server persists: user msg → (action msgs) → aturseva msg. History from DB (no client echo).

### `DELETE /api/dashboard/patient/aturseva/chat`
→ clears thread (new conversation), `{ success: true }`.

### Action card types (Phase 1)
- `doctor-search` — `data: { doctors: [{id, name, specialization, city, fees, experience, profileImg}] }` → each card links Book → `/dashboard/patient/book/[doctorId]`
- `bookings-status` — `data: { bookings: [{id, doctor, specialization, dateIST, timeSlot, mode, status, tokenNumber}] }` → status badges
- `queue-position` — `data: { tokenNumber, position, patientsAhead, estimatedWaitMinutes, doctor, dateIST, timeSlot }`

## 3. Prisma (new models; additive only)

```prisma
model AtursevaConversation {
  id        String   @id @default(cuid())
  userId    String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(...)
  messages  AtursevaMessage[]
}
model AtursevaMessage {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // 'user' | 'aturseva' | 'action'
  content        String   // text (empty for action rows)
  actionType     String?  // doctor-search | bookings-status | queue-position
  actionJson     String?  // JSON payload for the card
  createdAt      DateTime @default(now())
  @@index([conversationId, createdAt])
}
```

## 4. Files (Phase 1)

| New | Purpose |
|---|---|
| `src/lib/aturseva/context.ts` | superset context: sevika block + bookings + queue + profile |
| `src/lib/aturseva/tools.ts` | 3 tools + executors (db, ownership-scoped) |
| `src/lib/aturseva/agent.ts` | system prompt + TOOL protocol + streaming turn runner |
| `src/app/api/dashboard/patient/aturseva/chat/route.ts` | GET/POST/DELETE |
| `src/app/dashboard/patient/aturseva/page.tsx + client.tsx` | FULL chat window (agent home) |

| Modified | Change |
|---|---|
| `prisma/schema.prisma` | + 2 models (+ User relation back-field) |
| `src/lib/sidebar-config.ts` | patient: + 'Aturseva — AI Sahayika'; sevika page → 'Dawai Reminders' label; doctor board → '(Aturseva)' |
| `src/app/dashboard/patient/sevika/{client,page,chat}.tsx` | visible copy Sevika→Aturseva; FAB sheet rewires to new API (shared history) |
| `src/lib/sevika/nudge.ts` | signatures → "— Aturseva, aapki nurse 🩺" |
| `src/components/shared/RealtimeNotification.tsx` | EVENT_CONFIG += `med-reminder`, `dose-missed` (patient toasts, chime) |

## 5. Phases (roadmap of record)

- **Phase 1 (NOW):** models + agent (3 tools, read-only) + full chat page + rename + live toasts + greeting. E2E with agent-browser.
- **Phase 2:** booking THROUGH chat (doctor → slots via tool → confirm card → POST /api/patient/bookings) with explicit confirm step; geolocation "nearby" (browser GPS + Doctor lat/longi haversine); unread badge.
- **Phase 3:** proactive watcher (status changes, leave-now BAARI nudge) — notification → conversation message; daily check-in; symptom diary.
- **Phase 4:** report/lab explainers grounded in own reports; diet nudge scheduling; weekly report in-chat.
- **Phase 5:** voice mode (TTS/ASR), WhatsApp/SMS channels (P4 of AI-NURSE-PLAN), forms retirement review, home-visit honesty fix (landing CTAs vs product — owner decision), orphaned pages sidebar fix (bills/insurance/consents).

## 6. QA checklist (Phase 1 done-definition)
1. Register/login patient → sidebar shows "Aturseva — AI Sahayika" → opens full window
2. Empty thread → context-aware greeting (doses/booking/queue facts correct vs DB)
3. "Indore me doctor dikhao" → action card (doctor-search) + streamed Hinglish answer; Book link works
4. "Mera booking status?" → bookings-status card, statuses match dashboard
5. "Mera queue number kya hai?" → queue-position card matches /api/patient/bookings/queue
6. "Aaj ki dawai?" → text answer from sevika context (no tool)
7. Refresh → history intact (DB-persisted); FAB sheet shows SAME history
8. Dose reminder tick → live toast (med-reminder in EVENT_CONFIG)
9. Old flows regression: sevika dose page works, lint clean, no console errors
