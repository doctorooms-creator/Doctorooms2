# 📋 Doctorooms — Master Change Plan
> **Status:** APPROVED IN DISCUSSION — development START nahi hui
> **Last updated:** 2026-08-30
> **Source:** User ke saath detailed discussion se final hui decisions (legacy software comparison + code verification)

---

## 0. FINAL ID MODEL (Sabse important decision)

| ID | Format | Kya hai | Kahan dikhega |
|---|---|---|---|
| **Appointment ID** | `DR-XXXXXXXX` (constant "DR" + 8-digit unique) | Har visit ka permanent record ID | Print/slip, doctor search, prescriptions |
| **Queue Token** | `DR-001` (3-digit sequence, per-hospital daily counter) | Aaj ki line ka number — system generated | Queue display board, aaj ka flow |
| ~~Doctorooms ID~~ | ❌ **DROPPED** | 3rd ID system banane se bach gaye | — |

**Token design decisions (user-confirmed):**
- Counter scope: **per HOSPITAL/CLINIC per day** (har facility apna apna 001 se start — abhi code me per-doctor hai, `token-utils.ts` change chahiye)
- Multi-doctor facility = entrance token machine style (ek shared sequence, doctor-wise queue position alag compute hota rahega)
- Emergency ka `EMR-` prefix retire — emergency ko bhi next `DR-0XX` milega, `isEmergency` flag se board pe EMERGENCY badge dikhega
- Department shortCode (GEN/SHARMA) tokens ke liye ab use NAHI hoga
- Dono ID me "DR-" brand consistent — appointment 8-digit vs token 3-digit (length se distinct)

**Golden Rules:**
1. **Mobile number = Patient identity.** Mobile search → us patient ki SAARI prescriptions (1-to-many)
2. **Appointment ID = Visit identity.** ID search → sirf US visit ki prescription (1-to-1)
3. **Mobile nahi hai** → account nahi banta → hard copy print (DR-ID prominent) patient sambhale rakhega → repeat visit pe receptionist wahi DR-ID search karega → purana record + direct queue → **doctor ke pass records hamesha rahega**
4. Patient apna account **appointment ID se bhi** bana sakta hai (future enhancement) — mobile na ho to bhi

---

## 1. 🔄 APPOINTMENT ID UNIFICATION (Sabse bada change)

**Problem (verified in DB):** Abhi 5 alag formats chal rahe hain:

| Source | Current format | File |
|---|---|---|
| Online (patient app) | `APT-1788092130885-nk6l` | `src/app/api/patient/bookings/route.ts` (line ~130) |
| Reception manual | `APT000001` (sequential) | `src/app/api/dashboard/receptionist/appointments/route.ts` (line ~279, ~334) |
| Walk-in | `DOC-CMTF-1788086617198` | `src/app/api/dashboard/receptionist/walk-in/route.ts` (line ~307, ~527) |
| Express walk-in | `EXP-...` | `src/app/api/dashboard/receptionist/express-walkin/route.ts` (line ~63) |
| Kiosk | `KSK-...` | `src/app/api/public/hospital/[hospitalId]/kiosk-book/route.ts` (line ~127) |

**Target:** Sab jagah **ek hi format → `DR-XXXXXXXX`**
- `DR` constant prefix + 8-digit unique number
- Google OTP ("G-7219") jaisa concept, par 8-digit permanent ID
- Collision-safe: DB unique constraint + retry loop (standard practice)
- Naya helper banao: `src/lib/appointment-id.ts` → `generateAppointmentId()` with retry

**Saath me:**
- Token counter bhi unify: `token-utils.ts` me per-doctor counter → **per-hospital daily counter**, prefix hamesha `DR-` (dept shortCode/EMR retire)
- Doctor search placeholder fix: `APMT-496` → `DR-XXXXXXXX` (`src/app/dashboard/doctor/page.tsx` line ~629)
- Purane records (APT-..., DOC-..., SHARMA-...) **as-is rahenge** — migration nahi, sirf nayi bookings naya format

---

## 2. 🖨️ MOBILE-LESS PATIENT FLOW (Naya)

- Bina mobile booking allowed (name-based walk-in — already works)
- **Print hard copy me DR-ID bada + prominent** dikhna chahiye (patient isse sambhalega)
- Repeat visit: receptionist DR-ID search → purana booking/prescription dikhe → nayi booking + direct queue
- Doctor: appointment ID search se purani prescription khud dekh lega (search-prescriptions API me already implemented ✅)

---

## 3. 👤 REGISTRATION / ACCOUNT FIXES

| Point | Status | Action |
|---|---|---|
| Auto email `patient_<mobile>@doctorooms.com` | ✅ Already hai | As-is |
| Duplicate mobile block (409 error) | ✅ Already hai | As-is (history fork prevention) |
| Reception lookup: number → phone button → auto-fill / "Register New Patient" | ✅ Already hai | As-is |
| **⚠️ Password GAP**: random password generate hota hai par KISI KO nahi dikhta | ❌ Bug | **✅ DECIDED (user-confirmed):** (1) Reception registration → system-generated random password → **SMS direct patient ko** (receptionist ko kabhi nahi dikhega). (2) Patient khud login kare → mobile number dale → **OTP SMS** → OTP verify → **khud apna password set** kare. SMS infra (msg91/twilio) + OTP store + verify/reset APIs already exist — mostly wiring |
| Lookup scope inconsistency: walk-in/express lookup **global** hai (cross-hospital autofill ✅) par appointments page ka lookup **scoped** hai (sirf us hospital ke patients) | ⚠️ Inconsistent | Appointments page ka lookup bhi GLOBAL karo — patient kahin bhi registered ho, number dalo → naam auto-fill (cross-hospital first visit pe bhi) |

---

## 4. 🔒 DATA ISOLATION (Zyada tar already DONE — verified in code)

| Requirement | Status |
|---|---|
| Doctor B, patient X ka phone dale → sirf APNI (Doctor B wali) prescriptions dikhe | ✅ Verified — query me `doctorId: doctor.id` scoped |
| Appointment ID search → sirf 1 visit ki RX | ✅ Verified |
| Hospital X ka data Hospital Y me na dikhe | ✅ Booking pe `hospitalId` stamped, scoped queries |
| Patient dashboard me **clinic-wise grouped** data (X ka X me, Y ka Y me) | 🔲 TODO — Booking.hospitalId se grouping |
| **Consent-based access**: Doctor B → patient ko request → patient approve kare tabhi purana data dikhe | 🔲 FUTURE (ABDM-style consent) |

---

## 5. 🏥 CLINIC vs HOSPITAL MODULES (Future phase)

**Current reality (verified):** Doctor/Receptionist dashboard clinic-hospital SHARED hai — clinic doctor ko bhi IPD/OT/beds jaise hospital features dikhte hain.

**Plan:** `hospitalType === "Clinic"` check se feature gating — clinic ke liye IPD, OT surgeries, bed-transfer, insurance, discharge summaries jaise menu HIDE karo (doctor + receptionist sidebar).

---

## 6. 🐛 BUGS (Pending)

1. **Auto-reload:** Dev server memory threshold cross → Next.js khud restart → page reconnect hokar refresh. Dev-log me verified: `⚠ Server is approaching the used memory threshold, restarting...`. Fix: dev memory usage kam karna (background services/config optimization). Production me ye issue nahi hoga.
2. **White blank space** screen ke niche (posts ke niche): CSS/layout fix chahiye.

---

## 7. 📌 PRE-EXISTING TASKS (Pehle se documented, abhi tak pending)

1. Mark as Visited button → dashboard pe redirect ho jaye (abhi hota hai — fix)
2. Patient-side prescriptions me doctor ka REAL data fetch (abhi fake dikhta hai)
3. Prescription print me patient ID + contact number add karo
4. Prescription print me queue-generated unique token ID dikhao
5. Pharmacy medicine view — naye page ki jagah DIALOG/pop-up me kholo
6. Real clinic test scenario: queue running + 10 patients seed + Hamna (11th, appointment se) + reception pe request display + phir aggressive testing (emergency insert, no-show, pause/resume, repeat visits, old patient search)

---

## 8. 📐 SUGGESTED BUILD ORDER (jab development shuru karein)

| Phase | Kya | Kyun pehle |
|---|---|---|
| **1. Foundation** | #1 ID unification + #2 print hard copy + #3 password fix + lookup alignment | Saari baaki cheezein ID pe depend karti hain |
| **2. UX Tasks** | #7 ke tasks 1–5 (visited redirect, real RX data, ID+phone on RX, token on RX, pharmacy dialog) | |
| **3. Testing** | #7 ka task 6 — clinic scenario seed + aggressive testing + bugs #6 | |
| **4. Enhancements** | Clinic gating (#5), clinic-wise grouping (#4), consent access (#4 future) | |

---
*Ye document sirf PLAN hai — isme se kuch bhi implement NAHI hua hai. Development user ke bolne pe hi start hogi.*
