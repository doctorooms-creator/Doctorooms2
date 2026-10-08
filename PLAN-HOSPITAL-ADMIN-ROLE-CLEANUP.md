# PLAN — HOSPITAL ADMIN UX & ROLE CLEANUP (Owner Testing Feedback Round 1)
**Program:** Doctorooms HMS — post-P3 stabilization
**Status:** 📋 ANALYSIS COMPLETE — AWAITING OWNER "GO AHEAD" (NO development started)
**Date:** 2026-10-08 | **Author:** Z.ai
**Source:** Owner's live module testing (3 questions, all verified against code)

---

## 🗣️ TL;DR (Owner ke liye — Hinglish)

Aapne testing me 3 issue pakde — **teeno CONFIRMED hue code me.** Short version:

1. **Add Doctor search slow + confusing** — pakka bug mila: search har keystroke pe fire hota hai (debounce code toota hua hai), aur dropdown me sirf naam dikhta hai — do "Rajesh" me se kaunsa Rajesh, pata nahi chalta.
2. **Bina clinic wale doctors patient search me dikhte hain** — haan, koi bhi doctor khud register kare → turant patient-side listing me aa jata hai. Koi verification/approval gate **hai hi nahi**. System onboarding me khud ek **nakli "Dr. X Clinic"** bana deta hai!
3. **Hospital admin me operational kaam dikhte hain (IPD/OT/transfer/diet/discharge)** — **aap 5/5 sahi the.** Hospital admin = owner ka panel hona chahiye, lekin abhi usme surgery schedule, diet order, bed transfer, discharge jaise clinical kaam bhi hain — jabki doctor/nurse/reception ke paas ye missing ya adhoore hain. **Bonus bug:** hospital admin ka IPD link toota hua hai — khulta hai but data khaali (API receptionist ko hi allow karti hai).

Neeche har issue ka root cause + solution plan hai. **Development tab start hogi jab aap "Go ahead" bologe.**

---

## ISSUE 1 — Hospital Admin → Manage Doctors → "Add Doctor" autocomplete 🔴 CONFIRMED

### Owner ne kya dekha
- Add Doctor kholte hain → doctor naam likhne pe system **already-registered doctors** me se search karta hai aur unhe link kar deta hai ✓ (by design — account dobara banane se rokta hai)
- Search **bahut slow** hai
- Do doctors same naam "Rajesh" → **identify nahi kar payenge**

### Code evidence
| File | Problem |
|---|---|
| `src/app/dashboard/hospital/department-doctors/page.tsx:168-172` | **REAL BUG:** debounce `useMemo` me likha hai `useEffect` ki jagah — cleanup function kabhi call nahi hota → har keystroke pe naya timer → "rajesh" type karne pe 5 sequential API calls (`ra`, `raj`, `raje`, `rajes`, `rajesh`) |
| `src/app/api/dashboard/hospital/search-doctors/route.ts:20-44` | Global platform scan — koi scoping nahi; `ILIKE '%term%'` **leading wildcard** = index unusable; `User` table pe **zero indexes**; koi `orderBy` nahi (rare term pe poori table scan before giving up) |
| `department-doctors/page.tsx:584-601` | Dropdown me sirf **naam + specialization** render hota hai — `email` API se aata hai par UI me **kabhi dikhaya hi nahi**. City/registration number/mobile **API se bhi nahi aata** |

### Fix plan (batch P4-A)
1. **Debounce fix:** `useMemo` → `useEffect` (1-line fix, sabse bada speed win — API calls 5× → 1× kam)
2. **Dropdown identity upgrade:** har result me naam ke saath **email + city + specialization + registration number (agar hai)** — do same-naam doctors alag dikhenge
3. **Query tuning:** `orderBy: [{ user: { name: 'asc' } }]` add + search ko **prefix-priority** (pehle `startsWith` wale, phir `contains` wale) — common case fast ho jayega
4. **(Optional, prod-only)** Postgres `pg_trgm` GIN index on `users.name` — leading-wildcard ILIKE ko index-supported bana deta hai. Prod DDL script se chalega.
5. **Second search box bhi:** `hospital/doctors/page.tsx` (plain "Doctors" list) — wahan debounce hi nahi hai + API har doctor pe bookings count + ratings groupBy karta hai (sabse slow wala). Wahan bhi debounce + light endpoint.

**Estimate:** ~half day (chhota batch, sab UI/API level — schema change sirf optional trigram index).

---

## ISSUE 2 — Bina real clinic/hospital wala doctor patient search me dikhta hai 🔴 CONFIRMED

### Owner ne kya dekha
Doctor jo sirf kisi hospital me **kaam karta hai** (apna clinic nahi) — wo khud account banata hai → patient-side doctor listing me independent doctor ke roop me dikhne lagta hai, jabki uska koi apna practice location nahi hai.

### Code evidence — problem 3 layers me hai
| Layer | Evidence |
|---|---|
| **Patient listing API** | `src/app/api/doctors/route.ts:16-20` — filters sirf `role:'doctor'` + `status:'Active'`. **Koi hospital-link requirement nahi, koi profile-completeness gate nahi, koi verification flag nahi** |
| **Registration** | `src/app/api/auth/register/route.ts:86-92` — agar email service configured nahi → status **turant 'Active'**. Email verify bhi khud ko activate karta hai. **Koi admin approval step exist hi nahi karta** |
| **Model** | `prisma/schema.prisma` — `Doctor` aur `Hospital` dono me **koi `isVerified`/`approvalStatus`/KYC field nahi** |
| **Fake clinic** | `src/app/api/dashboard/doctor/onboarding/route.ts:119-195` — onboarding transaction me **khud `${user.name} Clinic` bana deta hai** (hospitalType:'Clinic', status:'Active') + DoctorHospital link. Matlab har self-registered doctor ke liye ek synthetic clinic row create hoti hai |
| **Fake trust badges** | `src/app/doctors/page.tsx:317` — `const isVerified = true` **hardcoded** — har card pe "Verified" shield dikhta hai jabki verification system hai hi nahi! Detail page pe bhi hardcoded Verified badge (`[id]/page.tsx:370-372`) |
| **Location data** | Patient ko dikhne wala address = doctor ka **self-declared free-text** `hospitalAddress` — real `DoctorHospital` link se derive nahi hota. Bonus: synthetic clinics **public hospitals directory me bhi pollute** kar rahi hain (`/api/hospitals` bhi koi type-check nahi karta) |

### Fix plan (batch P4-B) — 2-part approach

**Part 1 — "Hospital-employed doctor" path (aapka exact scenario):**
- Onboarding me ek sawaal add karo: **"Kya aap kisi hospital me practice karte hain?"** → Haan → hospital se search/link (existing `DoctorHospital` flow) → apna clinic **create nahi** hota, us hospital ka naam/address patient-side dikhta hai
- Nahi → tab apna clinic/practice location setup (current flow)

**Part 2 — Trust & directory hygiene:**
- `Doctor` me `verificationStatus` field add (`'unverified' | 'pending' | 'verified'`) — default unverified
- Patient listing me **rank** karo: verified + hospital-affiliated doctors upar, unverified niche (remove nahi — business impact)
- **Hardcoded "Verified" badges hatana** — jab tak real verification nahi, "New" badge dikhao unverified ke liye (honest UX)
- Hospitals directory me `hospitalType` filter — synthetic "Clinic" rows ko standalone hospital listing se alag karo
- Detail page pe **real affiliation** dikhao (`DoctorHospital` se hospital naam + address) self-declared text ki jagah

**Decision needed from owner (bologe tab):** Unverified doctors ko patient search me **dikhana hai ya nahi?** (Recommendation: dikhao lekin niche + "New" badge — naye doctors ko patients milna zaruri hai, warna unke liye product bekaar ho jayega.)

**Estimate:** ~1.5-2 days (schema + onboarding flow + listing API + UI).

---

## ISSUE 3 — Hospital admin (owner panel) me operational/clinical features 🔴 CONFIRMED — "Aap 5/5 sahi the"

### Owner ka point
Hospital admin = **hospital ke owner** ke paas hona chahiye. IPD admission (reception), OT (doctor), transfer (nurse), diet orders (doctor/nurse), discharge summary (doctor) — ye operational kaam owner panel me kya kar rahe hain?

### Verdict per feature (aapka intuition vs current code)
| Feature | Aapne bola | Code me reality | Verdict |
|---|---|---|---|
| IPD Admission | Reception ✅ | Reception ke paas hai ✓ **LEKIN hospital sidebar me bhi ek toota hua link hai** — receptionist page kholta hai jiski APIs hospital role ko **401** deti hain → admin ko **khaali page** dikhta hai | ✅ Aap sahi + **BONUS BUG mila** (broken link) |
| OT / Operation Theatre | Doctor ✅ | Doctor ke paas sirf apni surgeries start/complete; **hospital admin ke paas ZYADA power hai** — OT CRUD + surgery schedule + board. Ulta hai! | ✅ Aap sahi |
| Bed Transfer | Nurse ✅ | Nurse ke paas **ZERO access** — API (`/api/bed-transfers`) explicitly nurse ko exclude karti hai (route.ts:12-17). Abhi hospital+reception karta hai | ✅ Aap sahi |
| Diet Orders | Doctor ya Nurse ✅ | Doctor ke paas **koi UI hi nahi** (API allow karti hai par page nahi). Nurse sirf view/stop kar sakti hai. **Hospital admin clinical diet orders likh sakta hai** — galat | ✅ Aap sahi |
| Discharge Summary | Doctor ✅ | Doctor ke paas sahi hai (attending-doctor enforced) ✓. **Lekin ek dead API endpoint hospital admin ko bhi final diagnosis + summary likhne deta hai** (`complete-discharge`) | ✅ Aap sahi |

### Current access matrix (code-verified) — kya galat hai
| Feature | Hospital Admin | Doctor | Nurse | Receptionist | Sahi hona chahiye |
|---|---|---|---|---|---|
| IPD admission | ⚠️ broken link | ❌ | ❌ | ✅ full | Reception only |
| OT | 🔴 full CRUD+schedule | 🟡 partial | ❌ | 🟡 API only | Doctor (schedule) + Reception (book slot) |
| Bed transfer | 🔴 full | ❌ | 🔴 **zero** | ✅ full | Nurse (+reception backup) |
| Diet orders | 🔴 full (clinical!) | ❌ no UI | 🟡 view/stop only | ✅ full | Doctor (order) + Nurse (view/stop/modify) |
| Discharge summary | 🟡 view + dead write API | ✅ full | print only | initiate | Doctor (write) + Reception (initiate/billing) |

### Fix plan (batch P4-C) — "Owner Console vs Operations" separation

**Principle:** Hospital admin panel = **owner dashboard** — stats, approvals, staff/departments, billing overview, settings. Operational clinical kaam uske role ke pages pe.

1. **Hospital sidebar cleanup** (`src/lib/sidebar-config.ts:110-172`):
   - ❌ Remove: IPD Admissions (broken duplicate), OT, Bed Transfer, Diet Orders, Discharge Summaries
   - ✅ Keep: Dashboard, Doctors (manage/link), Departments, Staff, Billing, Inquiries, Pack-related settings, Beds (view-only inventory makes sense for owner)
2. **IPD broken link fix:** removal se hi ho jayega (khaali page wala confusion khatam)
3. **Doctor diet orders:** doctor ke IPD patient detail page me Diet tab add (API already allows doctor role — sirf UI banana hai)
4. **Nurse bed transfer:** `/api/bed-transfers` guard me nurse add + nurse sidebar me entry + page (receptionist page jaisa hi re-use)
5. **OT balance:** hospital admin ka "schedule surgery" doctor ko dena mushkil hai (owner bookings karta hai business-wise) — **decision for owner:** OT scheduling owner-side rahe ya doctor-side? (Recommendation: scheduling doctor-side, OT-room CRUD owner-side — room management is admin work, surgery scheduling is clinical work)
6. **Dead endpoint seal:** `complete-discharge` API guard me se hospital hatana (receptionist + doctor only)
7. **Hospital admin overview:** jo remove hua uski jagah ek **"Operations Overview"** read-only section — owner sab dekh sake (live bed occupancy, aaj ki surgeries, active diets, pending discharges) **par kar na sake** — owner ko visibility chahiye hoti hai, control nahi

**Estimate:** ~1.5 days (sidebar + 2 new pages + guard fixes + overview section).

---

## 📦 Proposed execution order (jab aap "Go ahead" bolo)

| Batch | Kya | Kyun pehle | Estimate |
|---|---|---|---|
| **P4-A** | Issue 1 — Add Doctor search fix (debounce bug + identity fields + query tuning) | Sabse chhota, sabse rozzana irritating | ~half day |
| **P4-B** | Issue 3 — Role cleanup (sidebar + nurse transfer + doctor diet + dead API seal) | Clinical safety — galat role clinical action kar sakta hai | ~1.5 days |
| **P4-C** | Issue 2 — Doctor verification + hospital-affiliated onboarding | Sabse bada (schema + flows) + ek owner decision chahiye | ~1.5-2 days |

**Open decisions for owner (jab time ho, jawab de dena):**
1. Unverified doctors patient search me dikhayein? (Rec: haan, niche + "New" badge)
2. OT surgery scheduling — owner-side ya doctor-side? (Rec: doctor schedule kare, owner OT rooms manage kare)
3. Doctor self-registration pe admin-approval gate lagana hai ya nahi? (Rec: abhi nahi — friction se signup marega; verification badge se rank karo)

---

## ⚠️ Risks / Notes
- **Issue 3 fix me receptionist workflows test karne honge** — bed-transfer/diet-orders pages re-use hote hain, kuch baar change se side-effects possible (sandbox E2E full matrix chalana padega)
- **Issue 2 me schema change hai** → prod DDL script (pooler-safe, idempotent) banana padega — established pattern hai
- `admin/doctors` ratings wala pattern yaad rakhna — doctor listing APIs me `_count` misuse ka bug pehle mil chuka hai (fixed in P3-BATCH5), naye endpoints me same dhyan
- Production deploy flow same rahega: lint → sandbox E2E → commit/push → prod DDL (agar schema) → Vercel deploy → prod E2E

---

*Ye sirf analysis + plan hai. Koi code change NAHI hua hai. Development aapke "Go ahead" pe start hogi.*
