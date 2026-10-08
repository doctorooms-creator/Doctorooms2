# PLAN — RECEPTIONIST BOOKING FLOW CLEANUP (Owner Testing Feedback Round 2)
**Program:** Doctorooms HMS — post-P3 stabilization
**Status:** 📋 ANALYSIS COMPLETE — AWAITING OWNER "GO AHEAD" (NO development started)
**Date:** 2026-10-08 | **Author:** Z.ai
**Source:** Owner's live production testing (receptionist booking). Evidence: production DB queries + Vercel runtime logs + code trace.
**Related:** [PLAN-HOSPITAL-ADMIN-ROLE-CLEANUP.md](./PLAN-HOSPITAL-ADMIN-ROLE-CLEANUP.md) (Round 1)

---

## 🗣️ TL;DR (Owner ke liye — Hinglish)

Aapne receptionist se booking test ki. **Aapki 2 nahi, 2.5 bookings me se 2 kabhi bani hi nahi — aur ye system ne chupke se chhupa diya!**

- Aapne jo **Express Walk-in booking ki (patient "Aditya") wo SUCCESS hui thi** — token GEN-001 mila tha, DB me hai, prescription tak bani. Ye booking aapko "khali" isliye lag rahi thi kyunki (a) Express page pe list hoti hi nahi, (b) aapne visit complete kar di thi to wo live queue se nikal gayi.
- **Asli BUG:** "New Appointment" form (Appointments page) se aapne jo 2 booking try ki (patients "Rahul" + "Ramesh" — wo register hue the) — **wo bookings kabhi bani hi nahi.** Form hospital-mode me toota hai: department/doctor maangta hai jo form me hai hi nahi → request fail → **lekin screen pe "Appointment created successfully" ka JHOOTHA message dikhata hai.** Ye pakka bug hai.
- **3 modes (Express / Appointments / Walk-in) ka reason:** alag-alag design eras ki 3 pages hain. Aap sahi soch rahe ho — **1 unified banana chahiye.** Detail neeche.
- **Mobile-check + register ke 2 alag dialogs:** sirf purane Appointments page pe hai (5 clicks, 3 API calls, same fields 2 baar). Express/Walk-in me already better single-flow hai. Merge hone ke baad ye problem khud khatam ho jayegi.

---

## 🔬 FORENSIC TIMELINE — aapki aaj ki test session (production DB + Vercel logs se)

| Time (IST) | Event | Evidence |
|---|---|---|
| 11:38 AM | Hospital account "Aditya Joshi" register | prod users table |
| 12:14 PM | Doctor "Rajesh" self-register → onboarding ne **auto "Rajesh Clinic"** + doctor-link bana diya | Round-1 Issue-2 wala synthetic-clinic pattern |
| ~12:20 PM | Doctor ne time slots create kiye ✓ | aapne bataya |
| 1:57–2:00 PM | Staff banae: Sunita (receptionist), Sunil (assistant), Sonali (nurse), Sachin (pharmacist) | prod users table |
| 2:06 PM | Patient "Aditya" register (receptionist dialog se) | users table, auto-email pattern |
| **2:32 PM** | **EXPRESS BOOKING SUCCESS — "Aditya", token GEN-001, doctor Rajesh, GEN dept, status Approve** | bookings table `cmuzb5g3b...` |
| 2:32–3:00 PM | Clinical flow: status → Visited, **prescription bani** (RX wizard), | Vercel logs + DB |
| **2:41, 2:42 PM** | Patients "Rahul" + "Ramesh" register (New Appointment form se) — **BOOKING KABHI NAHI BANI** | patients hai, bookings me KOI row nahi |
| 3:01 PM | Booking status → Finish (visit complete) | Vercel log PUT |
| 3:04 PM | Aap Express / Appointments / Pending pages check kar rahe the | Vercel logs |

**Production DB me aaj receptionist se sirf 1 booking hai (Aditya). Rahul/Ramesh ki bookings exist nahi karti.**

---

## ISSUE 4 🔴 — "New Appointment" form hospital-mode me SILENT FAIL + FALSE SUCCESS TOAST

### Root cause (code)
1. **API requires dept+doc in hospital mode** — `src/app/api/dashboard/receptionist/appointments/route.ts:256-263`:
```ts
if (isHospitalMode) {
  const { departmentId, doctorId } = body
  if (!departmentId || !doctorId) {
    return NextResponse.json({ error: 'departmentId and doctorId are required in hospital mode' }, { status: 400 })
```
2. **Form me department/doctor field HAI HI NAHI** — `src/app/dashboard/receptionist/appointments/page.tsx:355-370` mutation body me `departmentId`/`doctorId` kabhi bhejta hi nahi (page pe grep karne pe zero match).
3. **Client error check hi nahi karta** — `page.tsx:189-221`:
```ts
fetch('/api/dashboard/receptionist/appointments', { method: 'POST', ... })
  .then((r) => r.json()),          // ← r.ok check NAHI
onSuccess: () => {
  toast.success('Appointment created successfully')   // ← 400 pe bhi fire hota hai!
```
**Result:** book click → 400 → dialog band + success toast → DB me kuch nahi. Owner ko laga booking ho gayi.

### Kya dikhta tha isliye "khali"
- **Express page:** booking LIST hoti hi nahi (sirf form — `express/client.tsx` me koi list query nahi). Token toast sirf usi waqt dikhta tha.
- **Walk-in live queue:** `status: { in: ['Approve','Visited'] }` (`walk-in/route.ts:49`) — Aditya 'Finish' hone ke baad queue se gayab (by design sahi hai, lekin owner ko confusing).
- **Pending Bookings page:** sirf `status:'Pending' + bookingType:'By Self'` (`pending-bookings/route.ts:45-46`) — receptionist ki bookings kabhi nahi aati — correctly empty, par naam se galat expectation banti hai.
- **Appointments page:** `statusFilter='all'`, koi date filter default nahi — **Aditya yahan dikhna chahiye tha** (ye sahi kaam kar raha hai).

### Fix plan
1. `r.ok` + `data.success` check + error toast + dialog open hi rehna (data preserved) — **10 min ka fix, sabse pehle**
2. Hospital-mode me department + doctor selector add (GET API already `departments` return karta hai — `appointments/route.ts:99-104` — page use hi nahi karta!)
3. Express page me ek chhota "Last booking" confirmation card persist karna (token + patient + doctor) taaki baad me bhi dikhe
4. Walk-in queue me completed tab ("Aaj complete hui visits" collapsible) — Finish bookings dekhne ko milengi

---

## ISSUE 5 🟡 — 3 booking modes redundancy → 1 unified flow

### Current state (code-verified)
| | **Express Walk-in** | **Appointments** | **Walk-in** |
|---|---|---|---|
| Purpose | 5-sec speed lane | **legacy clinic-era form** | deliberate full booking |
| Department | ✓ required | ❌ **nahi hai** | ✓ required |
| Doctor | auto-assign (least-loaded) | ❌ **nahi hai** | ✓ picker |
| Slot | ❌ (queue tail) | ✓ date+time | ✓ live slot grid (optional) |
| Patient lookup | mobile auto-lookup ✓ | **manual check button + alag register dialog** | mobile auto-lookup ✓ |
| Token | ✓ | ❌ | ✓ |
| Video/InPerson | InPerson fixed | InPerson | toggle |
| Demographics | minimal | DOB/blood/height/weight... | medium |
| Hospital mode | ✓ kaam karta hai | **🔴 TOOTA HAI (Issue 4)** | ✓ kaam karta hai |

**Teeno me se 2 (Express + Walk-in) ek hi kaam karte hain** — bas optional cheezein strip karke. **Appointments page clinic-era ka relict hai** jo hospital-mode upgrade me chhoot gaya (wahi toota bhi hai). 3 pages = 3 create-APIs = 3 patient-lookup mechanisms = owner ka confusion.

### Fix plan — **"Book Patient" (ek unified page)**
```
┌─ Book Patient ────────────────────────────────────┐
│ Mobile [___________] ← auto-lookup (debounced)    │
│   ↳ naya patient? Name/Gender/Age INLINE khulega  │
│ Department [▼]  ☐ Auto-assign fastest doctor      │
│   ↳ ya Doctor [▼] + Slot [live grid, optional]    │
│ (＋ More details) ← DOB/blood/weight collapsible   │
│ [ Book & Print Token ]  Emergency toggle          │
└───────────────────────────────────────────────────┘
```
- Sidebar: 3 entries → **1 entry "Book Patient"** (+ existing queue/print pages)
- Express ki 5-second speed: sirf mobile+dept bharna = 3 fields, auto-assign on
- Appointments ka demographic detail: "More details" me, optional
- Purane routes redirect (bookmark/old habit safety)
- Backend: 1 create API (walk-in wala sabse robust — doctor required ya auto-assign flag)

**Owner decision (bologe tab):** 3→1 merge theek hai? Ya 2 rakhna hai (Quick + Full)? **Recommendation: 1 page, "quick mode" default.**

---

## ISSUE 6 🟡 — Mobile-check + register ke 2 alag dialogs (Appointments page only)

### Current flow (5 clicks, 3 round-trips, fields 2 baar)
1. Mobile type → **Check button pe CLICK** (manual! `appointments/page.tsx:509-523`)
2. `GET /patients?search=<mobile>` → "No patient found" amber + "Register New Patient" link (`:531-548`)
3. Link pe click → **DUSRA dialog** khulta hai (`:750-814`) — Name/Mobile(disabled)/Gender
4. Register → POST → dialog band → wapas booking form
5. Date/time → Book → (Issue-4 silent fail!)
- Mobile, gender, name — sab **do baar** poochhe jaate hain
- Lookup scope bug bhi: ye API sirf unhi patients ko dhoondhta hai jinki **is hospital/doctor pe booking ho chuki hai** (`patients/route.ts:37-44` `bookings: { some: ... }`) — abhi-ka-registered patient dobara check karne pe bhi "not found" dikha sakta hai!

### Better pattern JO PEHLE SE EXISTS (Express/Walk-in)
`express/client.tsx:28-38`, `walk-in/page.tsx:142-175`: mobile type karte hi **debounced auto-lookup** (global endpoint `express-walkin?mobile=`) → naya patient ho to **same form me** name/gender fields khul jaate hain → ek hi "Book" click. 1 dialog, 1 click, 1 request.

### Fix plan
Issue-5 ke unified page me Express wala pattern hi use hoga — ye issue merge me automatically solve. Alag se sirf 2 cheezein:
- Global mobile lookup endpoint ko sab jagah use karna (hospital-scoped legacy lookup retire)
- Register API ka deterministic-email pattern rakhna (wo theek hai)

---

## 🔧 BONUS FIXES is round me mile (chhote, important)
1. **Timezone bug (Appointments create, clinic+hospital dono)** — `route.ts:280-282,334-336`: `new Date(\`${date}T${time}\`)` server-local(UTC) parse karta hai → **shaam 7:30 baje ki IST appointment agle din ki ho jaati hai** (19:30Z = 01:00 IST). `nowIST()` bhi +5:30 future-shifted instant store karta hai. Express/Walk-in ka `new Date()` pattern hi sahi hai. Fix: IST-anchored date construction.
2. **Status vocabulary inconsistent hai** — `Approve / Visited / Finish / Completed / Pending / Canceled / Extend` — 7 values, koi doc nahi, kai jagah UI me raw string dikhta hai. Unified page ke saath ek **status matrix** banna chahiye (Pending → Approve → Visited → Finish/Completed, cancel kahan se ho sakta hai kaun kar sakta hai).
3. **Payment:** receptionist booking me payment step **hai hi nahi** (Booking model me paymentStatus field nahi) — payment OPD billing me hota hai jo `status==='Visited'` maangta hai (`opd-bills/route.ts:145`). Owner ne "do payment" try kiya tha — us point pe booking 'Finish' thi isliye billing nahi bani. **Booking lifecycle me billing ka point clearly document/display karna hoga.**

---

## 📦 Proposed execution order (jab aap "Go ahead" bolo)

| Batch | Kya | Kyun | Estimate |
|---|---|---|---|
| **P4-A (Round-1 wala)** | Add-Doctor search fix | roz ka irritation | ~half day |
| **P4-D 🔥** | **False-success bug fix + New Appointment form me dept/doctor** | **DATA LOSS — receptionist booking kabhi bina bina pata create nahi hoti** | ~half day |
| **P4-E** | Unified "Book Patient" page (3→1 merge) + timezone fix + status matrix | UX consolidation — owner ka exact point | ~1.5-2 days |
| **P4-B (Round-1 wala)** | Hospital admin role cleanup | clinical safety | ~1.5 days |
| **P4-C (Round-1 wala)** | Doctor verification + affiliation | trust layer | ~1.5-2 days |

**P4-D ko maine sabse upar recommend kiya hai kyunki ye silently data lose kar raha hai — har din jo receptionist "New Appointment" se book karegi wo kabhi create hi nahi hogi.**

**Open decisions for owner:**
1. 3 modes → 1 "Book Patient" (recommendation) ya 2 (Quick + Full)?
2. Express ka auto-assign doctor feature unified page me "Auto-assign fastest doctor" checkbox rahe? (Recommendation: haan — rush-hour me 5-second booking ka superpower hai)
3. Booking me upfront fees/payment karna hai ya visit ke baad OPD billing (current)? (Recommendation: current rakhо — India me reception pe bharna hi normal hai; sirf UI me clearly likhna "Fees: OPD billing ke time")

---

## ⚠️ Risks / Notes
- Unified page bana to **3 create APIs ke callers** (sirf inhi 3 pages) migrate karne honge — koi aur module in APIs ko use nahi karta (verified via grep) — safe merge
- Queue/token logic dono pages me same hai (tokenNumber/tokenOrder) — merge me reuse hoga
- Sandbox me reproduce karke E2E: hospital-mode receptionist → New Appointment → **abhi 400 aata hai** → fix ke baad booking create + queue me visible + false-toast gone
- Prod QA residue: Aditya booking + prescription (aapki test) — re-test ke liye Rahul/Ramesh fir se book karke dekh sakte ho fix ke baad

---

*Ye sirf analysis + plan hai. Koi code change NAHI hua hai. Development aapke "Go ahead" pe start hogi.*
