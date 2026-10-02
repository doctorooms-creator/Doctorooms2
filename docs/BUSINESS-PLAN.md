# Doctorooms — Pricing & Business Plan Structure

> Status: PLANNING DOCUMENT (approved direction, NOT yet implemented)
> Based on: live market research (Feb 2026) + product audit
> Goal: maximize doctor registrations first → convert → scale → profit

---

## 1. MARKET SNAPSHOT (Research Findings)

### 1.1 Competitor Pricing (India)

| Competitor | Positioning | Pricing | Free Tier |
|---|---|---|---|
| **HealthPlix** (market leader) | AI-powered EMR, 14,000+ doctors | Pro ₹11,999/yr · Elite ₹17,999/yr | Basic EMR free |
| **DocOn** | Doctor EMR app | ~₹7,000/yr ($83) | Free trial only |
| **CuraVerto** | Full clinic practice mgmt | From ₹9,999/yr | — |
| **MocDoc / Clinicea / KiviCare** | Clinic + hospital software | ₹16,999 → ₹1,00,000+/yr | — |
| **Practo Ray** | Doctor listing + clinic software | — | Doctors migrating away (lock-in complaints) |
| **Generic clinic CMS** | Basic booking/billing | ₹499–₹1,500/mo | — |

### 1.2 Market Size

- India digital health market: **$14.5B (2024) → $107B (2033)** — 25% CAGR
- Healthcare software: **$1.4B (2024) → $5.5B (2030)** — 24% CAGR
- Growth drivers: **ABDM mandates, DPDP Act 2023 compliance** pressure
- ~13 lakh registered doctors · ~2.5–3 lakh active private clinics · ~70k small hospitals/nursing homes
- TAM at our price points: clinic market ~₹3,000 Cr + hospital ~₹420 Cr
- Realistic 5-yr SOM (1–2% share): **₹15–25 Cr ARR potential**

### 1.3 Key Market Truths

1. **AI is now the #1 differentiator** — HealthPlix's entire marketing is "AI-powered EMR, Rx in 30 seconds, AI drug-interaction flags." We ALREADY have Dr. Copilot + 6-step Rx wizard → genuine parity/advantage.
2. **HealthPlix is clinic-only** — no real IPD/OT/hospital path. We have hospital-grade modules already built.
3. **Freemium benchmarks**: consumer 2–5% conversion, B2B SaaS 5–15%. Healthcare vertical with a strong free tier: expect **5–8%**.
4. **WhatsApp is the doctor's actual OS in India** — WhatsApp reminders/booking is a bigger hook than any feature list.
5. **ABDM/ABHA compliance = trust badge** — every serious competitor is getting certified. Needed by Phase 2.

---

## 2. POSITIONING

> **"HealthPlix se zyada, usse sasta. Clinic se hospital, ek hi platform."**
> More software than HealthPlix, cheaper than HealthPlix, clinic-to-hospital in one platform.

- **Vs HealthPlix (₹11,999/yr):** we give staff accounts (receptionist/nurse), OPD queue engine, hospital-grade upgrade path — at a lower price.
- **Vs MocDoc/others (hospital software):** modern UX + AI Copilot + WhatsApp-native, no ₹1L+ quote shock.
- **Wedding-cake strategy:** one unified hospital-grade codebase (already true in our architecture — clinic = 1-doctor hospital record, `Receptionist.doctorId` nullable handles both modes). Plans = pure limits layer on top. Zero architectural work.

---

## 3. THE 3 PLANS (Final Structure)

### 3.1 Plan Matrix

| | 🆓 **STARTER** (Free forever) | 🏥 **CLINIC PRO** | 🏨 **HOSPITAL** |
|---|---|---|---|
| **Price** | ₹0 | **₹9,999/yr** (or ₹999/mo) | **₹59,999/yr** |
| **Positioning** | "Apna clinic digital karo, free" | Solo doctor ka complete setup | Multi-doctor / nursing home |
| **Trial** | 14-day FULL platform trial (no card) | — | 14-day + assisted onboarding |
| **Doctor seats** | 1 | 1 (+2 optional @ ₹2,999/seat/yr, max 3) | 10 (+₹4,999/seat beyond) |
| **Receptionist** | 1 | 3 | 15 |
| **Nurse** | 1 | 3 | 15 |
| **Pharmacist** | — | 1 | 5 |
| **Lab technician** | — | 1 | 5 |
| **Patients / bookings / queue** | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| **Rx wizard + print (6-step, templates)** | ✅ FULL | ✅ FULL | ✅ FULL |
| **AI Copilot credits** | 50/month | 500/month | 2,000/month |
| **Extra AI credits** | ₹499/500-pack | ₹499/500-pack | ₹499/500-pack |
| **Lab reports (in-house)** | ❌ | ✅ | ✅ |
| **External lab orders + commission** | ❌ (add later — see §4) | ✅ | ✅ |
| **IPD (beds/wards/admissions/transfers)** | ❌ | ❌ | ✅ |
| **OT surgeries** | ❌ | ❌ | ✅ |
| **Inventory + expenses** | ❌ | ✅ Basic | ✅ Full multi-store |
| **Billing** | ❌ | OPD billing + payments | OPD + IPD + insurance + charge master |
| **Blog + gallery + QR page (online presence)** | ❌ | ✅ | ✅ |
| **Analytics** | Today's view | Trends (30-day) | Advanced (revenue, dept-wise) |
| **WhatsApp reminders** | 50/month | 1,000/month | 5,000/month |
| **Support** | Email / community | Priority email | Phone + onboarding manager |
| **Data export (CSV/PDF)** | ✅ | ✅ | ✅ |

### 3.2 Why These Exact Numbers

- **₹9,999/yr Clinic Pro** = anchors *just under* HealthPlix's ₹11,999 — "same budget, more software." Effective ₹833/mo on annual; ₹999 monthly option captures cash-flow-sensitive doctors.
- **₹59,999/yr Hospital** = mid-market (competitors: ₹16,999–₹1L+). With AI + WhatsApp + commission engine included, perceived value far exceeds generic HMS.
- **Free tier keeps the FULL Rx wizard + unlimited patients** — this is deliberate. The Rx-in-30-seconds experience is the addiction engine; prescriptions create patient history → data lock-in → future upgrade is one click. **Never gut the core OPD+Rx loop.**
- **50 AI credits/mo free** ≈ 2–3 Copilot uses/day — enough to build habit, small enough that heavy users feel the wall (that's the upgrade nudge).

### 3.3 Trial Mechanics (Slack/Notion model — approved)

1. Doctor registers → **14-day full-platform trial** (Hospital tier unlocked, no credit card).
2. Day 12–14: in-app + WhatsApp nudge — "Trial khatam hone wala hai. Launch offer: Clinic Pro ₹9,999/yr."
3. Trial ends → **auto-downgrade to Starter free. DATA IS NEVER DELETED.**
   - Deleting data = trust destruction = doctor gone forever.
   - Keeping data = upgrade friction ≈ zero when practice grows ("your 6 months of patient history is safe — one click to unlock IPD").
4. Win-back campaign at day 30 + day 90.
5. One free Starter per mobile number + ABHA ID (abuse guard).

---

## 4. MONETIZATION — 4 REVENUE LAYERS

| Layer | Type | When | Notes |
|---|---|---|---|
| 1. Subscriptions | Recurring | Day 1 | The 3 plans above. Predictable ARR core. |
| 2. AI credits | Usage | Day 1 | ₹499/500-pack overages. Margin ~80%. Copilot/voice-Rx/summaries consume credits. |
| 3. Lab test commission | Transaction | Phase 2 | External lab orders (module already built!) — 5–10% take rate via partner diagnostics (Dr Lal / Metropolis / local labs). **This monetizes even FREE doctors** — every test ordered by a free-tier doctor earns us commission. |
| 4. WhatsApp packs | Usage | Phase 2 | Beyond plan limits: usage-based pricing. |

**Layer 3 is the strategic sleeper** — a free-tier doctor ordering 200 tests/month at ₹8 avg commission = ₹1,600/mo revenue from a "free" user. Better than forcing upgrade.

---

## 5. PATH TO PROFITABILITY (Unit Economics)

### 5.1 Conversion Model (conservative)

Target Year 1: **10,000 free registrations** (GTM §7)

| Conversion | Users | Plan | Revenue |
|---|---|---|---|
| 4% → Clinic Pro | 400 | ₹9,999 | ₹40.0 L |
| 0.7% → Hospital | 70 | ₹59,999 | ₹42.0 L |
| AI credit overage (~15% of paid) | — | — | ₹6.0 L |
| Lab commission (Phase 2, 6 mo) | — | — | ₹4–8 L |
| **Year-1 revenue potential** | | | **≈ ₹92–96 L ARR** |

### 5.2 Cost Structure at That Scale

- Supabase (Pro + compute): ~$100–250/mo
- Cloudinary: ~$90–300/mo (upload volume driven)
- App hosting (Railway/VPS): ~$100–200/mo
- WhatsApp Business API: usage-based
- AI inference (Copilot): per-credit LLM cost
- **Total infra ≈ ₹15–22 L/yr → Gross margin 70–80%. Break-even ≈ 250–300 paying clinics or ~80 hospitals.**

### 5.3 Scale Vision

- Year 2: 30k registrations, 1,200 paid → ₹2.5–3.5 Cr ARR
- Year 3: 75k registrations, multi-city, lab network live → ₹7–10 Cr ARR
- 5-yr SOM: ₹15–25 Cr ARR (1–2% of addressable market)

---

## 6. FREE-TIER COST CONTROL & COMPLIANCE (Risk Section)

1. **Free-user infra cost ≈ ₹20–40/mo each** (rows are tiny; Cloudinary free-tier assets small). 10k free users ≈ manageable; still watch Cloudinary transformation costs — serve `f_auto,q_auto` optimized URLs.
2. **Abuse prevention:** 1 Starter per mobile + ABHA; staff-account creation requires plan check; rate-limit AI credits server-side.
3. **⚠️ DPDP Act 2023 (CRITICAL):** Indian health data must be stored in India. **Our current Supabase project is in Seoul (ap-northeast-2)** — fine for dev, NOT for commercial launch. Action before launch: create Supabase **Mumbai (ap-south-1)** project and migrate (pg_dump → restore; our pipeline is already proven). Flag early so it never becomes an emergency.
4. **ABDM/ABHA certification** by Phase 2 — NHA certified partner route. Table stakes for enterprise trust.
5. **NEXTAUTH_SECRET + dev-login lockdown** at production hardening (dev-login already NODE_ENV-gated).

---

## 7. GO-TO-MARKET (Max Registrations Engine)

**Phase 1 (Month 0–6): Ahmedabad beachhead** (seed data already Zydus/Shalby — home turf)
- Launch offer: "First 1,000 doctors — free forever + white-glove onboarding"
- Doctor-to-doctor referral: 1 month Clinic Pro free per converted referral
- Pharma MR partnerships (MRs visit 15 clinics/day — they become our distribution)
- Local diagnostic lab tie-ups (2–3) → commission layer live
- Target: 1,000 registrations, first 50 paying

**Phase 2 (Month 6–12): Gujarat + 1 more state**
- ABDM compliance badge, regional-language Rx print (Gujarati/Hindi)
- WhatsApp booking link per doctor (public page SEO: "free OPD queue software India")
- Target: 10k registrations, 500+ paying

**Phase 3 (Year 2+): Hospital enterprise motion**
- Dedicated sales for 20+ bed hospitals, insurance module push, multi-hospital groups

---

## 8. IMPLEMENTATION NOTES (For When Development Is Approved)

*Not started — architecture notes only:*

1. **3 new tables:** `Plan` (limits JSON config), `Subscription` (hospitalId, planId, status, trialEndsAt, seatsUsed), `UsageCounter` (AI credits, WhatsApp msgs per month).
2. **One guard layer:** `checkPlanLimit(hospitalId, feature|seat)` helper called in staff-creation + module API routes. Sidebar hides locked modules; 🔒 upgrade CTAs on locked pages.
3. **Registration flow:** doctor self-signup → auto Starter + 14-day trial flag → one `Hospital` row (clinic = 1-doctor hospital, already true).
4. **Billing:** Razorpay subscriptions (UPI-native) — Indian market standard.
5. **No schema surgery on existing tables** — pure additive migration.

---

## 9. OPEN DECISIONS (Need User's Call)

1. Clinic Pro seat model: **(A)** hard 1-doctor limit (simple, original framing) vs **(B)** 1 + 2 optional seats @ ₹2,999 (recommended — expansion revenue without plan-switch friction)?
2. External lab orders in free tier at Phase 2 (monetize free users) — yes/no?
3. Monthly billing option for Clinic Pro (₹999/mo) alongside annual — yes/no?
4. Launch city = Ahmedabad confirmation.
5. Supabase Mumbai migration timing (pre-launch hard requirement).

---

*Research sources: HealthPlix pricing page, Capterra/SoftwareSuggest listings, industry market reports (IMARC/MarketsandMarkets/Statista), RevenueCat & OpenView freemium benchmarks — retrieved Feb 2026 via web search.*
