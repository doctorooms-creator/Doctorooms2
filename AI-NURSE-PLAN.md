# 🩺 ATURSEVA — "AI PERSONAL NURSE" — ARCHITECTURE & FEASIBILITY PLAN
> User ka idea: doctor prescription de → patient-side AI khud schedule samjhe → time pe davai reminder → AI diet recommendation → **"koi personal nurse ho" jaisa** behavior.
> Ye file = design/feasibility doc. **NO development** (user instruction active).
> Feature name (working title): **Sevika** (सेविका — nurse/female caretaker; AturSeva family word, branding-consistent).

---

## 0. SHORT ANSWER (seedha jawab)

**Possible?** — ✅ Haan, bilkul. Ye ek proven pattern hai (Medisafe, Practo ke features, Turing care apps).

**Agent banana padega?** — ❌ Pure "autonomous agent" ZAROORI NAHI hai — aur wo actually galat tool hai core reminder ke liye.
**Golden principle:** > **AI ko "dimag" ke liye use karo (samajhna), "ghadi" ke liye nahi (time pe trigger).**
> Reminder 3 baar/din patient ko bhejna = **deterministic scheduler (cron)** ka kaam — sasta (₹0), instant, 100% reliable.
> LLM ko har reminder pe call karna = mehanga + slow + kabhi-kabhi galat — bina kisi fayde ke.
> LLM ki asli value = prescription **samajhna**, diet **personalize karna**, patient se **baat karna**.

**Final architecture = "Nurse ka dimag + Nurse ka dil":**
- **Dimag (deterministic core):** DB + scheduler + rules → kab, kisko, kya bhejna
- **Dil (AI layer):** LLM/VLM → prescription parse, diet plan, empathetic baat, Hinglish tone

---

## 1. END-TO-END FLOW (patient ki nazar se)

```
[1] DOCTOR PRESCRIBES (app me structured form / paper RX photo)
        │
        ▼
[2] AI PARSE LAYER  ← LLM/VLM sirf YAHAN chalta hai (ek baar)
    • Photo RX → VLM text extract → LLM structured JSON me convert
    • JSON: {drug, dose, frequency: morning/afternoon/night,
            beforeFood/afterFood, din kitne, special instructions}
    • DOCTOR CONFIRMS (human-in-loop — 10 sec ka screen) → LOCK
        │
        ▼
[3] SCHEDULE ENGINE (pure code, koi AI nahi)
    • frequency → exact dose instances banata hai patient ke
      apne wake/sleep time pe (default 8AM/2PM/9PM, adjustable)
    • "khane se pehle" = food slot se 30 min pehle reminder
    • DB me rows: kal ka, agle 7 din ka — sab pre-generated
        │
        ▼
[4] REMINDER TICKER (cron, har 5 min)  ← "nurse ka heartbeat"
    • Due doses dhundta hai → notification bhejta hai
    • Channels: in-app push (Expo) → SMS → (future) WhatsApp
    • Message template + patient ki bhasha (Hinglish/Hindi/English)
        │
        ▼
[5] PATIENT ACTION
    • ✅ "Lee liya" / ⏰ "10 min snooze" / ❌ "Skip"
    • Sab log hota hai → AdherenceEvent
        │
        ▼
[6] AI DIL LAYER (yahin LLM wapas aata hai)
    • Skip hua → empathetic follow-up (LLM-generated, rules decide WHEN)
    • 3 consecutive miss → DOCTOR KO ALERT (rule, AI nahi — safety)
    • Diet plan: prescription + patient profile se LLM ne pehle hi bana rakha
    • Nurse chat: "shaam wali davai khane se pehle ya baad?" →
      LLM answers grounded in PATIENT'S OWN prescription (context injection)
```

---

## 2. COMPONENTS KA BREAKDOWN

### 2.1 Prescription Parsing (AI #1)
| Input | Method | Output |
|---|---|---|
| App me doctor ka structured form | **AI ki zaroorat NAHI** — form se seedha JSON | clean JSON |
| Paper RX photo upload | **VLM** (image → text) → **LLM normalize** | draft JSON → doctor confirm |

> Key insight: agar doctor hamare app me hi prescribe karta hai, to data **structured me hi aata hai** — parsing AI ki need hi nahi. VLM sirf un paper prescriptions ke liye jo patient/doctor upload kare. Dono path rakhna hai.

### 2.2 Schedule Engine (deterministic, ZERO AI)
```
Frequency decode:
  "1-0-1" (morning-night)  → slots [morning, night]
  "1-1-1" (3 baar)         → slots [morning, afternoon, night]
  "SOS"                    → no schedule, sirf info card
  "har 8 ghante"           → interval-based from first dose time

Slot times = patient profile se:
  wakeTime=7:30 → morning slot = 8:00±45min window
  lunchTime=13:00 → afternoon slot = 13:15±45min
  sleepTime=22:30 → night slot = 22:00±45min (thoda pehle — safety)

beforeFood → reminder = slot se 30 min pehle
Duration "5 din" → 15 dose instances (3×5) pre-generate
Missed dose window-end pe → 1 gentle follow-up (sirf 1, spam nahi)
```

### 2.3 Reminder Ticker (cron) — "nurse ka heartbeat"
- Options (hamare infra me):
  - **A)** Mini-service (bun, `mini-services/nurse-ticker/`) — `setInterval` har 5 min, apna port, `XTransformPort` se gateway — full control, restart-safe
  - **B)** Vercel cron → hamare Next.js API route pe hit
- Kaam: `SELECT * FROM dose WHERE dueWindow CONTAINS now() AND status='pending'` → send → log
- **Cost: ₹0** (LLM call nahi hota is step me — ye reliability ka secret hai)

### 2.4 AI Dil Layer — 4 AI touchpoints (sab z-ai-web-dev-sdk, backend-only)

| # | Feature | Kab chalega AI | Kya karega |
|---|---|---|---|
| 1 | **RX Parse** | prescription upload pe (1 baar) | VLM + LLM → structured JSON draft |
| 2 | **Diet Plan** | prescription lock pe (1 baar) + weekly refresh | Drugs + conditions + veg/nonveg + allergies → 7-din ka diet card, doctor-approve ke liye |
| 3 | **Empathetic Nudges** | skip/late event pe | LLM 2-line Hinglish message ("Aaram kijiye, sirf aadhi davai mat chhodiyega 🙏") — template + rules ke andar |
| 4 | **Nurse Chat (Sevika)** | patient jab chahe | Patient ke apne prescription + adherence + diet context inject karke grounded answers — galat dose suggest karne ki permission NAHI |

### 2.5 Adherence + Escalation (rules, AI nahi)
- Har dose: `taken / skipped / snoozed` + timestamp
- Patient ko: weekly scorecard ("is hafte 18/21 doses ✓")
- Doctor ko: 3-consecutive-miss → dashboard alert + optional SMS
- Report card LLM se human-readable summary banwana (weekly, 1 call)

---

## 3. DATA MODEL SKETCH (Prisma, jab development shuru ho)

```prisma
model Prescription {
  id, patientId, doctorId, createdAt, status(DRAFT/CONFIRMED)
  source(APP_FORM/PHOTO_UPLOAD)
  items        PrescriptionItem[]
  dietPlan     DietPlan?
}

model PrescriptionItem {
  id, prescriptionId
  drugName, doseMg, frequency(MORN_AFT_NIGHT / INTERVAL / SOS)
  foodRelation(BEFORE/AFTER/NA), durationDays, instructions
  doseInstances DoseInstance[]
}

model DoseInstance {          // pre-generated, ticker isi ko scan karta hai
  id, itemId, patientId
  dueAt DateTime, windowMinutes Int
  status(PENDING/SENT/TAKEN/SKIPPED/SNOOZED)
  remindedAt, actionAt
}

model AdherenceEvent { id, patientId, doseId, type, createdAt }

model DietPlan {
  id, prescriptionId, patientId
  planJson        // structured: day-wise meals + why-this-food notes
  aiGenerated Boolean, doctorApproved Boolean?
}

model NurseChatSession { id, patientId, messages NurseMessage[] }
model NurseMessage { id, sessionId, role, content, createdAt }

model PatientProfile {
  id, wakeTime, lunchTime, sleepTime,
  language(HINGLISH/HI/EN), vegPreference, allergies, conditions
}
```

---

## 4. AGENT vs PIPELINE — honest engineering call

| Approach | Kab sahi | Problem |
|---|---|---|
| **Pure autonomous agent** (LLM khud decide kare kab kya bheje) | Kabhi nahi, is use-case me | Cost (har din 3+ LLM calls/patient), latency, hallucination risk = **missed dose = medical risk**. Nurse ki ghadi AI pe nahi, quartz pe chalti hai |
| **Pure pipeline + cron** (AI zero) | MVP ke liye kaafi | Diet personalization + empathetic tone + chat missing — "nurse feel" nahi aata |
| **⭐ Hybrid (recommended)** | HAMESHA | Deterministic core (reliability) + AI edges (intelligence). Ye industry standard hai |

**Agent pattern KAHAN sahi hai (phase 3+):**
- Adaptive rescheduling: patient bole "main so gaya tha" → agent bateye "koi baat nahi, aadha ghanta ruk kar le lijiye, agli 8 baje wali pakki hai" — **lekin reschedule bhi rules ke andar** (max window, no double-dose)
- Weekly check-in conversation (symptom diary → doctor ko summary)
- Voice-first elderly mode (ASR input + TTS output — dono skills hamare paas hain)

---

## 5. SAFETY RAILS (health product = non-negotiable)

1. **LLM kabhi bhi dose/timing CHANGE nahi karega** — reminders sirf structured prescription data se generate hote hain. AI sirf *baat* karta hai, *faisla* nahi
2. Diet plan pe label: *"AI suggestion — doctor approval pending"* + doctor dashboard me approve/edit toggle (human-in-loop)
3. Nurse chat answers me hardcoded guardrails: "dose badalna ho to doctor se puchein" — system prompt me enforced + keyword tripwires (overdose/stop-medicine type queries pe doctor-escalation card)
4. Skip-escalation **rule-based** (AI sentiment pe nahi) — 3 consecutive miss = doctor alert, bas
5. Reminder spam cap: max 1 follow-up per missed dose, max 3 nudges/day — patient trust > compliance theater

---

## 6. STACK MAPPING (sab kuch hamare maujuda infra me)

| Need | Solution (already available) |
|---|---|
| RX photo parse | **VLM skill** (z-ai-web-dev-sdk, backend) |
| Diet plan + nudges + chat | **LLM skill** (z-ai-web-dev-sdk, backend) |
| Voice reminders (elderly) | **TTS skill** — "Didi, davai ka samay ho gaya" 😄 |
| Voice confirm | **ASR skill** |
| Scheduler | Mini-service (bun) ya Vercel cron → API route |
| DB | Prisma (schema sketch Section 3 me) |
| Push | Patient app (Expo push — free tier, app store plan pending) |
| SMS | Provider abhi `log` stub — real provider baad me |
| WhatsApp | Phase 4 — WhatsApp Business API (India ka killer channel) |

**Naya vendor sirf tab chahiye jab: WhatsApp / real SMS — baaki sab ₹0 me chal sakta hai.**

---

## 7. PHASED ROLLOUT (jab user "GO" bole tab)

| Phase | Deliverable | Effort est. |
|---|---|---|
| **P1 — MVP "Yaad dilane wali nurse"** | Structured RX → schedule → ticker → in-app/SMS-stub reminder + basic diet card (1 LLM call) | ~2-3 dev sessions |
| **P2 — "Samajhne wali nurse"** | Photo RX VLM parse + adherence log + weekly report + doctor alerts | ~2 sessions |
| **P3 — "Baat karne wali nurse (Sevika)"** | Nurse chat (context-grounded) + adaptive reschedule + empathetic nudges polish | ~2-3 sessions |
| **P4 — "Har ghar tak nurse"** | WhatsApp channel + voice mode (TTS/ASR) + escalation workflows | after app-store launch |

---

## 8. COMPETITIVE EDGE (kya alag hoga)

- **Medisafe/Practo:** patient ko khud schedule karna padta hai → humara: doctor ke prescription se **auto-derive** + doctor in-loop
- **Generic reminder apps:** dumb alarm → humara: diet + adherence + doctor dashboard + Hinglish empathy
- **Naming synergy:** *AturSeva = jo bimari me hai uski seva* — AI Nurse = is naam ka product-level proof. **Sevika** sub-brand hone chahiye ("Sevika by AturSeva")

---
*Cross-ref: NAMING-5.md (AturSeva) • LOGO-PROMPTS.md (brand) • worklog BRANDING-1, ARCH-1*
*Status: DESIGN ONLY — no code, no schema, no routes. Development user ke "GO" pe shuru.*
