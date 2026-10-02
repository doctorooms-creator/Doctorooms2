# 🧠 DR. COPILOT — Comprehensive Development Plan
> **Project:** Doctorooms Doctor AI Copilot (Textile-ERP style AI sandbox for doctors)
> **Status:** PLAN ONLY — development START nahi hui
> **Created:** 2026-08-30 | **Companion file:** REFINEMENT-PART-1.md (ID system + registration fixes)
> **Source:** User ke textile ERP (56 agents + sandbox + DB-connected AI) concept ka clinic translation

---

# ⛔ RULE #1 — DATA ISOLATION (Ye plan ka FOUNDATION hai)

## User ka mandate (word-for-word samjha gaya):
> "AI bhi vhi data access karta hai jo vo doctor apna batata hai — dusri doctor ka data ka backend me access nahi milega"

## Matlab:
```
Doctor A ka Copilot → Doctor A ka data ONLY (patients, RX, queue, earnings)
Doctor B ka Copilot → Doctor B ka data ONLY
Doctor B AI se pooche "patient 9876543210 ka data dikhao"
  → Agar patient ne Doctor B se kabhi visit NAHI kiya → AI ko "not found" hi milega
  → Doctor A ka ek bhi record LLM tak pahunchega hi nahi (prompt me jayega hi nahi)
```

## 4-LAYER ENFORCEMENT (prompt pe trust nahi, BACKEND pe lock):

| Layer | Kya | Kaise | Kaise fail nahi hota |
|---|---|---|---|
| **L1: Session Identity** | Doctor kaun hai | NextAuth session → `requireRole(req,'doctor')` → `doctor.id` SESSION se aata hai, user input se KABHI nahi | AI request me doctorId bhejne ka option hi nahi — server khud session se nikalta hai |
| **L2: Scoped Repository** | Har DB query pe doctorId filter | Naya `src/lib/copilot/repo.ts` — har function me `where: { doctorId }` COMPILED hai. AI function choose kar sakta hai, doctorId CHANGE nahi kar sakta | Free-form SQL GENERATE HI NAHI HOTA — AI sirf pre-built parameterized functions call karta hai |
| **L3: LLM Context Firewall** | LLM ko wahi data jata hai jo L2 se aaya | Prompt building me sirf scoped results inject hote hain. LLM ka DB connection HI nahi hai | LLM "guess" karke dusre doctor ka data nahi likh sakta — usne kabhi dekha hi nahi |
| **L4: Audit + Test Guard** | Har AI read/write log + isolation test suite | AuditLog entry har copilot action pe + QA me "cross-doctor leak test" MANDATORY case | Regression pakka jaye |

## ❌ EXPLICIT BAN-LIST (architecture decisions):
1. **AI free-form SQL GENERATE karega → BANNED.** (SQL injection + scope-bypass dono ka darwaza). Sirf parameterized repo functions.
2. **AI ko raw Prisma client dena → BANNED.** Sirf `copilot/repo.ts` ke ~30 safe functions.
3. **doctorId request body/query se lena → BANNED.** Session-only.
4. **Admin/debug mode jisme AI sab dekhe → BANNED.** Debug ke liye developer manually DB khol sakta hai, AI nahi.

---

# 🏗️ SYSTEM ARCHITECTURE

```
┌───────────────────────────────────────────────────────────────┐
│ DOCTOR DASHBOARD (/dashboard/doctor)                          │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ 🤖 COPILOT PANEL (slide-in, right side, black theme)    │   │
│ │ • Chat sandbox (ChatGPT-style)                          │   │
│ │ • Approve Cards (AI writes → doctor ✅ → API call)       │   │
│ │ • Auto-Brief sidebar (queue-connected)                  │   │
│ │ • 🎙️ Voice button (Hindi/Hinglish ASR)                  │   │
│ └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬────────────────────────────────────┘
                           │ HTTPS (session cookie — Wahi NextAuth)
┌──────────────────────────▼────────────────────────────────────┐
│ NEXT.JS API LAYER — /api/copilot/* (NAYA)                     │
│ • POST /chat        → message bhejo, stream answer            │
│ • POST /action      → approve-card execute (existing APIs)    │
│ • GET  /history     → past chats (scoped)                     │
│ • L1+L2 yahan enforce hota hai                                │
└──────────────┬───────────────────────────┬────────────────────┘
               │                           │
┌──────────────▼──────────┐   ┌────────────▼─────────────────┐
│ AGENT ORCHESTRATOR      │   │ z-ai-web-dev-sdk (backend)   │
│ src/lib/copilot/        │   │ • LLM chat (GLM) — reasoning │
│ • router.ts (intent)    │──▶│ • ASR — voice → text         │
│ • agents/*.ts (10)      │   │ • (TTS optional Phase C+)    │
│ • repo.ts (SCOPED data) │   └───────────────────────────────┘
│ • guard.ts (ban rules)  │
└──────────────┬──────────┘
               │ Prisma (doctorId FILTERED queries)
┌──────────────▼───────────────────────────────────────────────┐
│ SQLITE DB — wahi real data (Bookings, RX, Medicines, Vitals)  │
│ + NAYA: CopilotChat, CopilotAction models (niche dekho)      │
└───────────────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────┐
│ EXISTING socket.io (notification-service :3001 / chat :3004)  │
│ • Real-time streaming (token-by-token answer)                 │
│ • Pre-visit auto-brief push (queue event se trigger)          │
└───────────────────────────────────────────────────────────────┘
```

**Kyun yahi architecture:**
- z-ai SDK **backend-only** rule follow (client me kabhi nahi)
- Streaming ke liye existing socket.io infra reuse (naya service nahi banana)
- Writes existing APIs se hi hote hain (approve-card → wahi POST /prescriptions) — isliye business logic DUPLICATE nahi hota

---

# 🗄️ DB SCHEMA CHANGES (Prisma)

```prisma
model CopilotChat {
  id        String   @id @default(cuid())
  doctorId  String                    // ← scope key (index + har query me filter)
  role      String                    // 'user' | 'assistant'
  content   String                    // text
  agentName String   @default("")     // kaunsa agent jawab de raha tha
  metaJson  String   @default("{}")   // citations (bookingIds), latency, tokens
  createdAt DateTime @default(now())
  @@index([doctorId, createdAt])      // ← scoped history fast fetch
}

model CopilotAction {                 // approve-card ki lifecycle
  id         String   @id @default(cuid())
  doctorId   String                    // ← scope key
  chatId     String?                   // kis conversation se aaya
  kind       String                    // 'rx_draft' | 'lab_order' | 'followup' | 'template'
  payloadJson String  @default("{}")   // draft ka structured content (DIFF ready)
  status     String   @default("pending") // pending | approved | rejected | expired
  actedAt    DateTime?
  createdAt  DateTime @default(now())
  @@index([doctorId, status])
}
```
- `doctorId` dono me — **chat history bhi isolated** (Doctor B, A ki chat history kabhi nahi khol sakta — L2 scoped repo se hi aati hai)
- AuditLog me bhi entry: `action: 'copilot_action'`, before/after JSON

---

# 🔌 API SPECIFICATION (naye routes)

| Route | Method | Kaam | Isolation |
|---|---|---|---|
| `/api/copilot/chat` | POST | `{ message, voiceText? }` → streamed answer + citations | L1 session → L2 repo → L3 prompt |
| `/api/copilot/action/[id]` | POST | `{ decision: 'approve' \| 'reject' }` | Card doctorId se match — doosre ka card 404 |
| `/api/copilot/history` | GET | Past N messages | `where: { doctorId: session }` |
| `/api/copilot/brief/[bookingId]` | GET | Pre-visit auto-brief card | booking doctorId scoped |
| `/api/copilot/voice` | POST | audio blob → ASR text | wahi session |

**Streaming:** SSE fallback + socket.io primary (token stream). Voice: audio → `/api/copilot/voice` → ASR → text message → normal chat flow.

---

# 🤖 10 AGENTS — DETAILED SPECS

> Common contract: har agent = `run(input, ctx)` jahan `ctx = { doctorId, doctorName, todayIST }` — **ctx SESSION se banta hai, AI modify nahi kar sakta**

### 1. `router.ts` — Intent Router (entry point)
- LLM se intent classify: query / summary / rx_draft / analytics / pattern / smalltalk
- Confidence < 70% → clarify question (kabhi guess nahi)
- Output: `{ agent, parsedIntent }` — agla agent chunta hai

### 2. `agents/query.ts` — Live Data Q&A (READ-ONLY)
- Pooche: "aaj kitne pending?" / "SHARMA-013 kaun hai?" / "is hafte kitni RX bani?"
- Repo functions: `todayQueue()`, `findPatientByToken()`, `rxCountThisWeek()`, `earningsThisMonth()` (~15 functions)
- Jawab me HAMESHA citation: `📖 SHARMA-013, booking DR-...`

### 3. `agents/summary.ts` — Patient Clinical Summary
- "9462005835 ka summary" → saari us doctor wali visits: RX list, vitals trends (BP/sugar graph data), allergies, last notes
- Output: structured brief + **trend line** ("HbA1c 8.2→7.1→6.9 — improving")
- Ye hi engine Pre-Visit Auto-Brief me bhi use hota hai (same code reuse)

### 4. `agents/rx-draft.ts` — Prescription Drafter (WRITE via approve-card)
- Voice/text se: "metformin 500 BD 30 din, sugar 280" → structured RX JSON (medicines, dose, duration, instructions)
- Doctor ke RxTemplates + Pattern Agent se match karta hai
- Output: **CopilotAction (pending)** + UI card — kabhi direct save NAHI

### 5. `agents/safety.ts` — Clinical Safety Checker
- RX draft pe: drug-interaction rules (metformin + contrast dye, etc.), allergy cross-check (patient history se), dose sanity (pediatric/geriatric age se), duplicate therapy
- Red/amber/green flags card pe — doctor ko pehle dikhe, phir approve
- Rule source: static curated rules file (Phase B me ~50 rules) + patient history dynamic check

### 6. `agents/voice.ts` — Voice Intake (ASR wrapper)
- Audio → z-ai ASR → Hinglish text normalize (medical terms dict: "sugar"→RBS, "BP high"→HTN)
- Doctor bole → text + rx-draft agent chain

### 7. `agents/language.ts` — Patient Instructions Translator
- RX instructions → simple Hindi/Gujarati (patient bhasha) for print
- Template: "aavi table lesva" style — doctor editable preview ke saath

### 8. `agents/analytics.ts` — Natural Language Charts
- "last 3 mahine disease-wise split" → grouped data → frontend chart (existing chart components)
- READ-ONLY aggregation queries (scoped)

### 9. `agents/pattern.ts` — RX Pattern Learner
- Doctor ke past RX analyze → common combos detect → "80% DM patients pe ye combo — template banau?"
- Template save bhi approve-card se (existing rx-templates API)

### 10. `agents/audit.ts` — Logger (har agent ke saath chalta hai)
- Har AI response + action AuditLog me + CopilotChat.metaJson me citations

---

# 🖥️ UI SPECIFICATION (Copilot Panel)

- **Entry:** doctor dashboard right-side slide-in (collapsible), black/deep theme (ChatGPT sandbox feel), mobile pe full-screen sheet
- **Chat area:** messages, markdown render, citation chips (click → booking/RX detail khule)
- **Approve Card UI:** left = draft, right = flags/diff, buttons `[✅ Approve] [✏️ Edit] [❌ Reject]` — approve → existing API → toast + audit
- **Auto-Brief sidebar:** queue "Call Next" hote hi socket event → brief card auto-populate (summarize agent)
- **Voice button:** hold-to-talk mic, waveform animation, Hinglish me bolein
- **Safety:** loading states, error toasts, "AI suggestion — not medical advice" subtle disclaimer footer

---

# 📅 PHASES — DETAILED TASK BREAKDOWN

## PHASE A — Foundation + Read-Only Copilot (MVP, ~2 weeks equivalent)
| # | Task | Files |
|---|---|---|
| A1 | Prisma models (CopilotChat, CopilotAction) + push | `prisma/schema.prisma` |
| A2 | Scoped repo layer — 15 read functions, har me doctorId | `src/lib/copilot/repo.ts` |
| A3 | Guard module (ban rules, ctx builder from session) | `src/lib/copilot/guard.ts` |
| A4 | z-ai LLM integration (backend, system prompt + isolation rules) | `src/lib/copilot/llm.ts` |
| A5 | Router + Query + Summary agents | `src/lib/copilot/router.ts`, `agents/query.ts`, `agents/summary.ts` |
| A6 | Chat API (SSE stream) + history API | `src/app/api/copilot/chat/route.ts`, `history/route.ts` |
| A7 | Copilot panel UI (chat + citations) | `src/components/copilot/panel.tsx` + doctor page integration |
| A8 | Audit logging + isolation test (cross-doctor leak QA) | `agents/audit.ts` + QA checklist |
| **Exit criteria** | Doctor apna live data pooch sakta hai; doosre doctor ka data 100% invisible (verified) | |

## PHASE B — Writes via Approve-Cards + Safety (~2 weeks)
| # | Task |
|---|---|
| B1 | CopilotAction API (approve/reject → existing endpoints proxy) |
| B2 | rx-draft agent + Safety agent (50 interaction rules v1) |
| B3 | Approve-card UI (diff + flags) |
| B4 | Audit before/after JSON snapshots |
| **Exit** | Voiceless full RX draft→review→approve flow chalta hai |

## PHASE C — Voice + Language (~1.5 weeks)
| # | Task |
|---|---|
| C1 | /api/copilot/voice (ASR) + medical terms normalizer |
| C2 | Hold-to-talk UI |
| C3 | language agent (Hindi/Gujarati instructions preview) |
| **Exit** | Doctor bolega → draft + translated instructions |

## PHASE D — Proactive Layer (~2 weeks)
| # | Task |
|---|---|
| D1 | Pre-visit auto-brief (queue "call next" socket hook → summary agent) |
| D2 | analytics agent + NL charts |
| D3 | pattern agent + template suggest approve-card |
| D4 | End-of-day digest (notification-service SMS hook optional) |
| **Exit** | Copilot proactive — doctor na poochhe tab bhi ready |

---

# 🧪 TESTING / QA PLAN (isolation sabse pehle)

1. **Cross-Doctor Leak Test (MANDATORY, har phase):** 2 doctors, 2 patients, patient-1 sirf doc-A se mila → doc-B copilot se patient-1 ka mobile/naam/RX poochho → **"not found" hi aana chahiye, zero leak**
2. Citation accuracy: jawab me diye gaye booking IDs khul ke check — data match ho
3. Approve-card flow: reject → kuch save nahi; approve → exactly wahi data jo card pe tha
4. Voice: Hinglish samples (10 recorded phrases) → expected structured RX
5. Load: 50 concurrent chats, streaming stable
6. Audit completeness: 100% copilot actions AuditLog me

# ⚠️ RISK REGISTER
| Risk | Mitigation |
|---|---|
| LLM hallucination | Citations + read-only start + approve-cards (RULE 2) |
| Scope leak via agent bug | L2 compiled filters + leak test suite har phase |
| Medical liability | AI kabhi final authority nahi; disclaimer; audit trail |
| Latency (multiple agents) | Parallel agent calls + streaming + context caching |
| Hinglish ASR accuracy | Medical dictionary + doctor-specific vocabulary learning (D3+) |

# 🎯 SUCCESS METRICS
- Doctor time/patient ↓ (baseline vs copilot week)
- RX drafting time ↓ 50% (voice flow)
- Copilot weekly active doctors + queries/doctor
- Zero isolation incidents (hard requirement)

---
*Is document se KUCH BHI implement nahi hua — ye comprehensive plan hai. Development user ke "start" bolne par Phase A1 se shuru hogi. REFINEMENT-PART-1.md (ID system + registration) se pehle/parallel/baad — order user decide karega.*

---

## STATUS LOG

### ✅ Phase A — READ-ONLY MVP (COMPLETE, browser-verified)
- Chat SSE stream + intent router (11 intents) + scoped repo (15 read fns) + L3 firewall prompt + audit
- Cross-doctor isolation verified (test patient under Dr. Anita invisible to Dr. Rajesh)

### ✅ Phase B — APPROVE-CARD ACTION SYSTEM (COMPLETE, browser-verified 2026-08-31)
- **Model**: AI PROPOSES → doctor approves → server executes via production pathways. AI never writes directly.
- `src/lib/copilot/agents/safety.ts` — deterministic rule checker (ok/warning/blocked):
  structural blocks (empty/dupe meds, freq>3, qty>60, past follow-up dates) + cautions
  (paediatric/elderly/pregnancy-range, high-alert meds, 6 interaction pairs, duplicate therapy
  vs last Rx, antibiotic stewardship)
- `src/lib/copilot/agents/actions.ts` — LLM extracts draft (structure only) → patient resolved
  ONLY via scoped repo (mobile/name/token/appointmentNo) → safety check → pending CopilotAction
- Router: new `action_request` intent + regex fast-path (no LLM call for obvious requests)
- `/api/copilot/action/[id]` POST approve|reject — L2 re-verification of every row before write:
  - rx_draft → reuses/creates Draft prescription (init flow) + replaces PMedicine rows (medicines API flow)
  - lab_order → ExternalTestOrder rows via doctor's active DoctorLabAssociation
  - followup → sets nextVisit on the patient's latest prescription (this doctor's)
  - reject/approve patches the chat message metaJson so history reload shows true status
- Panel: approve-cards with kind icons, safety banners (amber cautions / rose blocked + disabled
  Approve), approve/reject with loading, result + deep link after approval; cards restored from history
- Actions get NO conversation history (one-shot commands — prevents stale-draft bleed)
- Citation chips now link to `/dashboard/doctor/appointments?highlight=<appointmentNo>` →
  auto "All" tab + scroll + 3× teal flash ring (`copilot-flash`)
- Copilot launcher moved from dashboard page → doctor LAYOUT (available on all doctor pages)
- Panel race-guard: history load can no longer clobber in-flight sends

### NEXT (unstarted)
- Phase C: voice ASR + Hindi (user said "voice wala rehna do abhi" — deferred)
- Phase D: pre-visit brief, analytics/pattern agents
