# PLAN — RX WIZARD PERFORMANCE (Owner Testing Feedback Round 3)
**Program:** Doctorooms HMS — post-P3 stabilization
**Status:** 📋 ANALYSIS COMPLETE — AWAITING OWNER "GO AHEAD" (NO development started)
**Date:** 2026-10-08 | **Author:** Z.ai
**Source:** Owner's live production testing — "booking detail khulne me bahut time, har step save me bahut time, doctor kaam se zyada time system pe kharch karega"
**Evidence:** REAL production timings measured today (QA account, warm requests) + full code trace
**Related:** Round-1 [PLAN-HOSPITAL-ADMIN-ROLE-CLEANUP.md](./PLAN-HOSPITAL-ADMIN-ROLE-CLEANUP.md) · Round-2 [PLAN-RECEPTIONIST-BOOKING-FLOW.md](./PLAN-RECEPTIONIST-BOOKING-FLOW.md)

---

## 🗣️ TL;DR (Owner ke liye — Hinglish)

**Aap bilkul sahi the — maine production pe ghadi laga ke nap liya:**

| Aap kya karte ho | Kitna time lagta hai (measured) |
|---|---|
| Booking click karke RX wizard khulna | **~15-25 second** ⏳ |
| Har step ka "Save & Continue" | **~5.3 second** ⏳ |
| Step 5 (Advice) khulna | **+5 second** (377 KB data download!) |
| Final Save (prescription banane ka) | **~8-12 second** |
| **Poora consultation (6 steps + save)** | **~60-90 second SIRF WAITING** 😱 |

**Asli wajah (sabse badi): HUMARA SERVER AMERICA ME HAI, DATABASE SEOUL ME.** Har chhoti-moti database query ko America → Seoul → America travel karna padta hai = har query ~0.5-0.7 second. Aur ek consultation me system **~140-150 queries** chalata hai — hisaab laga lo: 150 × 0.6 sec ≈ **90 second ka safar!**

**Sabse bada fix 1 line ka hai:** server ko Seoul (database ke bagal me) le jao — `vercel.json` me `regions: ["icn1"]`. Isse har query 0.6s → ~0.05s. **Total waiting 60-90s → ~10-15s. Ek line me 5× speed!**

Uske baad code-level fixes (saves ko batch karna, duplicate data fetch hatana, 377KB wali payload chhoti karna) se **~5-8s total** tak le ja sakte hain.

---

## 🔬 MEASURED EVIDENCE (production, today, warm requests)

QA account se login karke har API ko curl se time kiya (`doctorooms-hms.vercel.app`):

| API Call | Time | Payload | DB Queries (approx) |
|---|---|---|---|
| `/` landing page (static) | **0.10s** ✓ network fast hai | — | 0 |
| `/api/auth/me` | **1.6s** | chhota | 2 |
| Booking detail | **3.4-3.6s** | chhota | 3 |
| Labels master | **3.4s** | 10KB | 3-4 |
| Complaints master | **4.0s** | 52KB | 4-5 |
| Medicines master | **4.0s** | 79KB | 4-5 |
| Findings master | **4.4s** | **133KB** | 5-6 (nested medicines!) |
| **Step-1 save (complaints)** — KHAALI list bhi! | **5.3s** | chhota | **7 sequential** |
| Full-Rx GET (step khulne pe) | **5.5s** | 8KB | ~8 (6 relations include) |
| Suggestions (step 5) | **5.2s** | **377KB (!!)** | ~5 |
| **RX-favorites (P3-BATCH3 wala)** | **8.5-8.8s** — sabse slow | 717B | **~10 sequential** |

**Perfect linear pattern:** `time ≈ 0.6s floor + (queries × 0.6s)`. Har sequential DB query ~0.6s — ye hi killer hai.

### Region proof
- Response header: `x-vercel-id: hkg1::iad1::...` → **lambda = iad1 (Washington DC, USA)**
- Database: `aws-0-ap-northeast-2.pooler.supabase.com` = **Seoul**
- `vercel.json` me `regions` set NAHI hai → Vercel default US me deploy karta hai
- US↔Seoul network RTT ~160ms + pgbouncer transaction-mode overhead + `connection_limit=1` queuing = **~0.6s per sequential query**

---

## ROOT CAUSES (4 levels, sab code-verified)

### Level 1 🔴 — Infra: Server US me, DB Seoul me (SABSE BADA)
- `vercel.json` = sirf crons, no regions → default iad1
- `src/lib/db.ts:7-11` — bare PrismaClient, pool settings URL pe chhodte hain: `?pgbouncer=true&connection_limit=1` → **poore deployment ki 1 connection**

### Level 2 🔴 — Architecture: har action bahut saari sequential queries
- **Har step-save = 7 sequential queries, NO transaction** (`api/prescription/[id]/complaints/route.ts:24-61`): session(1) + ownership(2) + deleteMany + createMany + read-back findMany + hydrate findMany. Ek dose badalne pe bhi saari rows delete + reinsert!
- **Finalize = 13-15 sequential queries** (`finalize/route.ts:42-149`) — heavy update with 6 includes + **awaited** notification fan-out (response path me hi 5 extra queries)
- **RX-favorites = ~10 queries** (`rx-favorites/route.ts:100-155` — pins, hydrate ×2, 2 groupBy, full doctorMedicine scan, hydrate) — step 1 aur step 4 dono pe chalta hai
- **Full-Rx GET = 6-7 baar fetch hota hai per consultation** — har step apne `useEffect` me raw `fetch()` (`step-1:150`, `step-2:63`, `step-3:75`, `step-4:143`, `step-5:136` + stepper me duplicate at open) — koi cache nahi

### Level 3 🟡 — Payload bloat + no caching
- **Suggestions API: SAARI ~400 rows (377KB) download hoti hain** client pe filter karne ke liye jabki 10 chahiye (`suggestions/route.ts:45-53` + `step-5-suggestions.tsx:75-81`)
- Findings: 133KB nested medicine trees
- Masters ka staleTime sirf 60s + `refetchOnWindowFocus` **on** hai globally (`providers.tsx:11`) — tab switch karo to sab refetch
- Step-4 medicine dropdown **saare results render** karta hai, koi cap/virtualization nahi (`step-4-medicines.tsx:469-509`)

### Level 4 🟡 — Per-request/session tax
- Har API call pe **1 session-lookup query** (`api-auth.ts:48`) — ~30 requests/session = 30 wasted queries
- Har navigation pe `onboarding-status` re-fetch (`layout.tsx:35-57`) + full-screen gate
- Consultation ke dauran 60-second commission polling (`sidebar-badge.tsx:67`)

### Total per consultation (measured model se)
**~30 HTTP requests + ~140-150 sequential DB queries × 0.6s ≈ 60-90s pure waiting** — exactly jo aapne mehsoos kiya.

---

## FIX PLAN

### Batch P4-F 🔥 — "Speed Emergency" (sabse bada win, sabse chhota effort)
1. **`vercel.json` me `"regions": ["icn1"]`** (Seoul — DB ke paas) → per-query 0.6s → ~0.05s
   - Expected: wizard open 15-25s → **~3-5s**, har save 5.3s → **~1s**, total consultation 60-90s → **~10-15s**
   - ⚠️ Deploy pe verify: Hobby plan single region allow karta hai (allowed, but confirm icn1 available)
2. **Global `refetchOnWindowFocus: false`** (`providers.tsx`) — 1 line
3. **Masters staleTime 60s → 5 min** (consultation ke दौरान masters change nahi hote)
4. **Suggestions server-side filter** — `?questionIds=` support (377KB → ~15KB)
5. **Duplicate full-Rx fetch hatana** — ek baar store me load, steps wahi se padhein (6-7 GET → 1)

**Estimate: ~half day (code) + deploy + verify. Impact: ~5-6× speedup sab pe.**

### Batch P4-G — Structural fixes (P4-F ke baad)
1. **5 step-saves ko `$transaction` me batch** — 7 sequential queries → 1-2 RTT; read-back findMany hatao (client already jaanta hai kya save hua)
2. **RX-favorites optimization** — 10 queries → 2-3 (pins + ek groupBy + ek IN-hydrate), 60s cache
3. **Finalize: notifications fire-and-forget** (response bhejne ke BAAD), heavy update → lean update + 1 select
4. **Session cache** — token→user 30s in-memory cache (har request ki hidden query khatam)
5. Onboarding-status sessionStorage cache (login tak hi refetch)
6. Step-4 dropdown cap/virtualize

**Expected end state: wizard open ~2-3s, save <0.7s, finalize ~1-2s, poora consultation ~6-10s.**

---

## 📦 Updated master batch order (teeno rounds ke saath)

| Order | Batch | Kya | Kyun | Est |
|---|---|---|---|---|
| 1 | **P4-F** 🔥 | Region + speed quick-wins | 1 line config = 5× speed; owner ka sabse bada roz ka pain | ~half day |
| 2 | **P4-D** 🔴 | Silent booking fail fix (R2) | Data loss — receptionist ki booking chupke fail hoti hai | ~half day |
| 3 | P4-A | Add-Doctor search fix (R1) | roz ka irritation | ~half day |
| 4 | P4-G | Wizard structural (transactions) | P4-F ke baad remaining slowness | ~1 day |
| 5 | P4-E | Unified Book Patient page (R2) | 3 modes → 1 | ~1.5-2 days |
| 6 | P4-B | Hospital admin role cleanup (R1) | clinical safety | ~1.5 days |
| 7 | P4-C | Doctor verification (R1) | trust layer | ~1.5-2 days |

---

## ⚠️ Risks / Notes
- Region change pe **deploy ke baad timing re-verify** karna hoga (yaad hai: `x-vercel-id` header se region confirm hota hai)
- `connection_limit=1` Seoul me bhi rakh sakte hain (RTT ~2ms ho jayega), ya 3-5 tak try — pgbouncer transaction mode me safe
- Step-save transactions banate waqt **draft/resume flow test** karna hoga (P3 me RX favorites quick-add workflow bhi)
- Ye analysis **production QA account** se measure hui — sandbox dev-server timings alag hote hain (local DB, no network RTT) — isliye sandbox me ye problem "invisible" thi, sirf production pe dikhti hai
- P3-BATCH3 ka rx-favorites production me sabse slow endpoint nikla (8.8s) — region fix ke baad ~1.5s, P4-G ke baad <0.7s. Honest note: mera feature bhi issue me contributor tha (10 sequential queries)

---

*Ye sirf analysis + plan hai. Koi code change NAHI hua hai. Development aapke "Go ahead" pe start hogi.*
