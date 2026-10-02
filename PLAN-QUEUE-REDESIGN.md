# Doctorooms — Queue & Booking System Redesign Plan
# "Zero-Conflict, Real-World Hospital Flow"

> **Goal:** Make the booking/queue system production-ready for AIIMS/CIMS-scale demos
> **Principle:** Act as a real hospital owner — patient experience #1, zero errors, flexible flow
> **Status:** PLAN ONLY — no development yet

---

## 🏥 REAL HOSPITAL SCENARIO (The Problem)

### Scene 1: AIIMS Reception Counter
```
10 receptionists sitting in a row. All booking for same doctors.
Receptionist A books "10:00 AM — Dr. Sharma" for Patient X
Receptionist B (2 seconds later) also books "10:00 AM — Dr. Sharma" for Patient Y
→ DOUBLE BOOKING. Patient X and Patient Y both show up at 10 AM.
→ Hospital embarrassed. Patients angry.
→ THIS CANNOT HAPPEN. Ever.
```

### Scene 2: Patient Psychology
```
Patient arrives. 10 people ahead in queue.
Current display: "10 patients ahead of you. Estimated wait: 150 minutes."
Patient feels: "150 minutes?! This is terrible."

What patient SHOULD see:
"You are #11 in queue"
(as each person gets called, display updates)
"You are #10" → "You are #9" → "You are #8"
Patient feels: "My number is coming down. I'll be seen soon."
→ PATIENT STAYS CALM. This is psychological design.
```

### Scene 3: Flexible Booking
```
Patient A: "I want 10:30 AM slot with Dr. Sharma" → books specific slot
Patient B: "I just want to see Dr. Sharma today, whenever" → no slot, goes to queue
Patient C: Walks in without appointment → receptionist adds directly

ALL THREE should work. Not every patient pre-selects a time.
The queue should handle both: slotted patients + unslotted patients.
```

### Scene 4: Per-Doctor Duration
```
Dr. Sharma (Physician): 10 min per patient → slots: 9:00, 9:10, 9:20, 9:30...
Dr. Gupta (Gynecologist): 20 min per patient → slots: 9:00, 9:20, 9:40, 10:00...
Dr. Khan (Pediatrician): 15 min per patient → slots: 9:00, 9:15, 9:30, 9:45...

Each doctor's schedule should auto-generate slots based on THEIR duration.
Already supported (DoctorSchedule.slotDuration) but needs UI to configure easily.
```

---

## 🔍 CURRENT STATE ANALYSIS

### What Already Works ✅

| Feature | Status | Where |
|---------|--------|-------|
| Per-doctor slot duration | ✅ `DoctorSchedule.slotDuration` (default 30 min) | `schema.prisma:456` |
| Slot generation from duration | ✅ `generateTimeSlots(start, end, duration)` | `api/doctors/[id]/schedule/route.ts:113` |
| Slot conflict check at booking | ✅ `findFirst` on same slot + doctor + date | `walk-in/route.ts:261`, `patient/bookings/route.ts:102` |
| Booked slots returned to UI | ✅ `bookedSlots` array in slots-availability API | `patient/bookings/slots-availability/route.ts:61` |
| Booking WITHOUT time slot | ✅ `timeSlot` is optional in both APIs | If no timeSlot passed, skips conflict check |
| Walk-in without slot → queue | ✅ Works (status: Approve, token assigned) | `walk-in/route.ts` |
| Queue position calculation | ✅ `patientsAhead + 1` | `patient/bookings/queue/route.ts` |

### What's Broken / Missing ❌

| Issue | Severity | Details |
|-------|----------|---------|
| **Race condition in slot booking** | 🔴 CRITICAL | `findFirst` check + `create` are NOT atomic. Two concurrent bookings can pass the check and both create. |
| **Patient sees "10 ahead" not "#11"** | 🟡 UX | Shows count of people ahead, not the patient's own position as a number |
| **No "Call Next" button on doctor dashboard** | 🔴 CRITICAL | Button exists but has no onClick (dead button) |
| **Token race condition** | 🔴 CRITICAL | `generateTokenNumber` uses `_max + 1` without unique constraint |
| **Sort order inconsistent** | 🟡 MEDIUM | Some routes sort by `createdAt`, some by `tokenOrder` — same patient shows different position |
| **No real-time slot update** | 🟡 MEDIUM | Slots-availability is fetched once on page load. If someone books while patient is choosing, they don't see it update. |
| **Slot duration not configurable per hospital-doctor link** | 🟡 MEDIUM | `DoctorSchedule.slotDuration` is per-doctor, but hospital-mode doctors (DoctorHospital) don't have their own duration |
| **No "unslotted" indicator in queue** | 🟡 LOW | Walk-in/no-slot patients show in queue but without a time — no visual distinction |

---

## 📋 THE PLAN — 4 Workstreams

### WORKSTREAM 1: Zero-Conflict Slot Booking (CRITICAL)
*"5-10 receptionists booking simultaneously — zero double-booking"*

#### 1.1 Database-Level Slot Locking

**Add unique constraint to Booking:**
```prisma
// In Booking model:
@@unique([doctorId, bookingDate, timeSlot, status], name: "unique_active_slot")
// Note: This alone won't work because status varies. Better approach:
```

**Better approach — Add a dedicated `SlotLock` table:**
```prisma
model SlotLock {
  id          String   @id @default(cuid())
  doctorId    String
  hospitalId  String?
  bookingDate DateTime
  timeSlot    String
  lockedBy    String   // receptionist user ID or "kiosk" or "patient-{id}"
  lockedAt    DateTime @default(now())
  expiresAt   DateTime // 5-minute lock window
  
  @@unique([doctorId, bookingDate, timeSlot])  // ONLY ONE lock per slot
  @@index([expiresAt])  // for cleanup
}
```

**Flow:**
1. Patient/Receptionist selects a slot → `POST /api/slots/lock` with `{doctorId, bookingDate, timeSlot}`
2. API tries `SlotLock.create()` — if `@@unique` violation → slot is already locked by someone else → return 409 "Slot just taken"
3. If lock succeeds → slot is reserved for 5 minutes
4. Patient completes booking → `POST /api/bookings` → converts lock to a real booking → deletes lock
5. If patient abandons → lock auto-expires after 5 min → slot becomes available again
6. Background cleanup: delete expired locks every minute

**This guarantees:** Even if 10 receptionists click "10:00 AM" at the exact same millisecond, only ONE gets the lock. The other 9 get "Slot just taken, please choose another."

#### 1.2 Transaction-Level Booking with Lock Check

```typescript
// In booking POST route:
const booking = await db.$transaction(async (tx) => {
  // 1. Verify slot lock exists and belongs to this user
  const lock = await tx.slotLock.findUnique({
    where: { doctorId_bookingDate_timeSlot: { doctorId, bookingDate, timeSlot } },
  })
  if (!lock || lock.lockedBy !== currentUser) {
    throw new Error('Slot not locked by you. Lock it first.')
  }
  if (lock.expiresAt < new Date()) {
    throw new Error('Lock expired. Please re-select the slot.')
  }
  
  // 2. Double-check no active booking exists (belt + suspenders)
  const existing = await tx.booking.findFirst({
    where: { doctorId, bookingDate, timeSlot, status: { in: ['Approve', 'Visited', 'Finish'] } },
  })
  if (existing) {
    throw new Error('Slot already booked')
  }
  
  // 3. Create booking
  const booking = await tx.booking.create({ data: { ... } })
  
  // 4. Delete the lock (slot is now permanently booked)
  await tx.slotLock.delete({ where: { id: lock.id } })
  
  return booking
})
```

#### 1.3 Real-Time Slot Availability (WebSocket)

**Problem:** Patient opens slot picker at 9:00 AM. At 9:01 AM, someone else books 9:30 AM. Patient doesn't see it — still shows available. Patient clicks 9:30 → "Already booked" error.

**Fix:** Emit socket event when a slot is locked/booked:
```
// When slot is locked:
emitNotification('slot_locked', [hospitalRoom(hospitalId)], {
  doctorId, bookingDate, timeSlot, locked: true
})

// When slot is released (lock expired or booking canceled):
emitNotification('slot_available', [hospitalRoom(hospitalId)], {
  doctorId, bookingDate, timeSlot, locked: false
})
```

**Frontend:** Slot picker subscribes to these events and updates the UI in real-time. If a slot gets locked while the patient is looking at it, it instantly shows "🔒 Just booked" with a strikethrough.

---

### WORKSTREAM 2: Per-Doctor Slot Duration (Flexible Scheduling)
*"Pediatrician 10 min, Gynecologist 20 min — each doctor configures their own"*

#### 2.1 Current State
`DoctorSchedule.slotDuration` already exists and defaults to 30 min. The `generateTimeSlots()` function already uses it. **This already works — the gap is UI.**

#### 2.2 What's Missing

**Doctor schedule UI** (`/dashboard/doctor/schedule`) needs:
- A "Slot Duration" dropdown: 5, 10, 15, 20, 30, 45, 60 minutes
- Visual preview: "With 10-min slots from 9 AM to 1 PM, you'll have 24 slots"
- Per-day duration override (e.g., Monday 10 min, Wednesday 20 min for procedures)

**Hospital-mode doctor schedule** (`DoctorHospital.opdTimings`):
- Currently `opdTimings` is a free-text string
- Should be structured: `{ startTime, endTime, slotDuration, days: ['Mon','Wed','Fri'] }`
- Hospital admin can configure per-doctor-per-hospital schedule

#### 2.3 Slot Duration Presets

Add a quick-select in the schedule UI:
```
Quick Presets:
[ physician ] 10 min  →  9:00, 9:10, 9:20, 9:30, 9:40, 9:50, 10:00...
[ specialist ] 15 min  →  9:00, 9:15, 9:30, 9:45, 10:00, 10:15...
[ gynecologist ] 20 min → 9:00, 9:20, 9:40, 10:00, 10:20, 10:40...
[ procedure ] 30 min  →  9:00, 9:30, 10:00, 10:30, 11:00, 11:30...
[ consultation ] 45 min → 9:00, 9:45, 10:30, 11:15, 12:00, 12:45...
[ long consult ] 60 min → 9:00, 10:00, 11:00, 12:00, 1:00, 2:00...
```

#### 2.4 Break/Lunch Handling

Add break slots to the schedule:
```
Morning: 9:00 AM - 1:00 PM (10-min slots)
  ↳ Break: 11:00 - 11:15 (no slots)
Afternoon: 2:00 PM - 5:00 PM (15-min slots)
  ↳ Break: 3:30 - 3:45
```

**Schema change:**
```prisma
// Add to DoctorSchedule:
breakStart   String   @default("")  // "11:00"
breakEnd     String   @default("")  // "11:15"
maxSlots     Int      @default(0)   // 0 = unlimited, else cap per day
```

---

### WORKSTREAM 3: Flexible Booking Modes
*"Patient can book with time slot, without time slot, or walk-in — all go to queue"*

#### 3.1 Three Booking Modes

| Mode | Who | Time Slot | Status Flow | Queue Entry |
|------|-----|-----------|-------------|-------------|
| **Slotted** | Patient online / Kiosk | ✅ Selected | Pending → Approve | Token assigned at approval |
| **Unslotted** | Patient online / Kiosk | ❌ None ("Anytime today") | Pending → Approve | Token assigned at approval |
| **Walk-in** | Receptionist | ❌ or ✅ | Approve (direct) | Token assigned immediately |

#### 3.2 "Anytime Today" Option

In the patient/kiosk booking flow, add a third option alongside time slot selection:
```
┌─────────────────────────────────────────┐
│  How would you like to book?            │
│                                         │
│  ○ Select a specific time slot          │
│    [9:00] [9:10] [9:20] [9:30] ...     │
│                                         │
│  ○ Anytime today (first available)      │
│    You'll be added to the queue.        │
│    Token assigned when receptionist     │
│    approves your request.               │
│                                         │
│  ○ Walk-in (report to reception)        │
│    No pre-registration needed.          │
└─────────────────────────────────────────┘
```

**Backend:** `POST /api/bookings` already accepts empty `timeSlot`. The slot conflict check is skipped when `timeSlot` is empty. **This already works — just needs UI.**

#### 3.3 Mixed Queue (Slotted + Unslotted)

The queue should display both types:
```
Dr. Sharma's Queue Today:
┌──────────────────────────────────────────────┐
│ #  │ Token   │ Time Slot │ Patient           │ Status   │
│────│─────────│───────────│───────────────────│──────────│
│ 1  │ CARD-01 │ 9:00 AM   │ Rahul Verma       │ Visited  │
│ 2  │ CARD-02 │ 9:10 AM   │ Priya Singh       │ Approve  │
│ 3  │ CARD-03 │ (anytime) │ Amit Kumar        │ Approve  │
│ 4  │ CARD-04 │ 9:20 AM   │ Sneha Patel       │ Approve  │
│ 5  │ CARD-05 │ (anytime) │ Mohan Das         │ Approve  │
└──────────────────────────────────────────────┘
```

**Logic:** Slotted patients are sorted by timeSlot. Unslotted patients are interleaved by creation order. The doctor sees the full sequence and calls patients in order.

**Queue sort order (FINAL, consistent everywhere):**
```sql
ORDER BY 
  CASE WHEN timeSlot IS NOT NULL AND timeSlot != '' THEN 0 ELSE 1 END,  -- slotted first
  timeSlot ASC NULLS LAST,                                               -- by slot time
  createdAt ASC                                                          -- tiebreaker
```

Wait — actually the user wants unslotted patients to also flow naturally. Better approach:
- Token order is assigned at approval time (sequence 1, 2, 3, 4...)
- Queue is sorted by `tokenOrder ASC` (simple, consistent)
- Receptionist can see which patients have slots vs unslotted (visual badge)
- Doctor calls by token order, not by time slot

**This means:** Time slot is for the PATIENT's convenience (they know approximately when to come), but the QUEUE is purely token-based. This is how real hospitals work — the token is the source of truth, not the appointment time.

#### 3.4 Receptionist Approval for Unslotted

When receptionist approves an unslotted booking:
1. They CAN assign a time slot (optional) — "We can fit you at 10:30"
2. Or they can just approve without slot — "Go to waiting area, you're #5"
3. Token is generated in either case

---

### WORKSTREAM 4: Patient Psychology — Reverse Countdown Display
*"Patient sees #11 → #10 → #9 → feels progress"*

#### 4.1 Current Display
```
Current: "10 patients ahead of you"
         "Estimated wait: 150 minutes"
Patient feels: overwhelmed
```

#### 4.2 New Display (Countdown Style)

```
┌───────────────────────────────────────┐
│                                       │
│         YOUR POSITION                 │
│                                       │
│            ┌─────┐                    │
│            │ 11  │   ← big number     │
│            └─────┘                    │
│                                       │
│   Dr. Rajesh Sharma                   │
│   Cardiology · OPD Room 3             │
│                                       │
│   Currently Serving: CARD-06          │
│                                       │
│   ┌─────────────────────────────┐     │
│   │ ████████████░░░░░░░  54%    │     │ ← progress bar
│   └─────────────────────────────┘     │
│                                       │
│   Est. wait: ~45 min                  │
│                                       │
│   ┌─────────────────────────────┐     │
│   │ Queue Movement:             │     │
│   │  #11 → #10  (2 min ago)     │     │ ← live updates
│   │  #10 → #9   (just now)      │     │
│   └─────────────────────────────┘     │
│                                       │
│   [🔔 Notify me when I'm #3]          │
│                                       │
└───────────────────────────────────────┘
```

**Key changes:**
1. **Big position number** (`#11`) instead of "10 ahead"
2. **Progress bar** — visualizes how close they are (position / total)
3. **Movement log** — shows the queue is moving ("#11 → #10")
4. **"Notify me when I'm #3"** button — patient opts in for SMS/push when they're 3rd in line
5. **Currently serving** — shows which token is in consultation (transparency)

#### 4.3 Position Display Logic

```typescript
// Patient queue position API response:
{
  myPosition: 11,           // "You are #11" (not "10 ahead")
  totalInQueue: 15,         // total patients waiting
  progressPercent: 27,      // (15-11)/15 * 100 = 27% done
  currentlyServing: "CARD-06",
  currentlyServingToken: 6,
  myToken: "CARD-016",
  estimatedWaitMinutes: 45,
  queueMovement: [
    { from: 12, to: 11, timestamp: "2025-01-15T10:30:00Z" },
    { from: 13, to: 12, timestamp: "2025-01-15T10:15:00Z" },
  ],
  notifyAtPosition: 3,      // patient opted in for notification at position 3
}
```

#### 4.4 SMS Notifications at Key Positions

Wire SMS (MSG91) to fire at these moments:
| Event | SMS Template | When |
|-------|-------------|------|
| Token assigned | "Your token is CARD-016. Dr. Sharma, Cardiology. You are #11 in queue." | At approval |
| Position #5 | "Update: You are now #5 in queue. Dr. Sharma. Please be ready." | When position drops to 5 |
| Position #3 | "You are #3! Please proceed to OPD Room 3. Dr. Sharma will see you shortly." | When position drops to 3 |
| Turn approaching | "Your turn now! Token CARD-016. Please enter OPD Room 3." | When doctor calls next |

**This is the psychological design the user described** — patient sees their number decreasing, feels progress, stays calm.

---

## 🎯 PRIORITY ORDER FOR DEMO

### Must-Fix Before Demo (3 days)

| # | Task | Time | Impact |
|---|------|------|--------|
| 1 | **Wire "Call Next Patient" button** on doctor dashboard | 1 hour | Doctor can call next patient with one click (critical for demo) |
| 2 | **Fix token race condition** — add `@@unique([doctorId, bookingDate, tokenOrder])` | 2 hours | No duplicate tokens |
| 3 | **Add DB indexes** — `(doctorId, bookingDate, status)`, `(hospitalId, bookingDate, status)` | 1 hour | Fast queries at scale |
| 4 | **Standardize sort order** — all queue APIs use `tokenOrder ASC, createdAt ASC` | 2 hours | Consistent positions everywhere |
| 5 | **Patient position display** — show "#11" not "10 ahead" + progress bar | 3 hours | Psychological comfort |
| 6 | **Fix notification bug** — `notifyNextPatient` uses `tokenOrder: { gt: current }` not exact `+1` | 1 hour | No missing notifications |

### Demo-Winning Features (5-7 days)

| # | Task | Time | Impact |
|---|------|------|--------|
| 7 | **Slot locking system** (SlotLock table + transaction) | 1 day | Zero double-booking — demo this to AIIMS |
| 8 | **QR Self-Check-in kiosk** (5-step wizard) | 3 days | "No more lines" pitch |
| 9 | **Real-time slot availability** (WebSocket) | 1 day | Slots update live as others book |
| 10 | **"Anytime today" booking option** | half day | Flexible booking without time |
| 11 | **SMS notifications** (token assigned + position #3 + turn approaching) | 1 day | Patient gets SMS at key moments |
| 12 | **Per-doctor slot duration UI** (presets + visual preview) | 1 day | Pediatrician 10 min, Gynec 20 min |

### Nice-to-Have (post-demo)

| # | Task | Time |
|---|------|------|
| 13 | Queue movement log (live updates on patient screen) | 1 day |
| 14 | "Notify me at position #X" opt-in button | half day |
| 15 | Break/lunch slot handling in schedule | 1 day |
| 16 | Hospital-mode doctor schedule (DoctorHospital structured timings) | 2 days |

---

## 📐 DETAILED QUEUE FLOW (Final Design)

```
                         ┌──────────────────────┐
                         │   PATIENT ARRIVES    │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              Scan QR           Use Kiosk        Walk to
              (own phone)        (tablet)       Reception
                    │               │               │
                    └───────┬───────┘               │
                            │                       │
                    ┌───────▼───────┐               │
                    │ KIOSK WIZARD  │               │
                    │ 1. Details    │               │
                    │ 2. Department │               │
                    │ 3. Doctor     │               │
                    │ 4. Time slot  │               │
                    │    OR Anytime │               │
                    │ 5. Confirm    │               │
                    └───────┬───────┘               │
                            │                       │
                            ▼                       ▼
                    ┌───────────────────────────────────┐
                    │   BOOKING CREATED (status: Pending)│
                    │   bookingType: 'By Self'           │
                    └───────────────┬───────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────────┐
                    │  RECEPTIONIST PENDING LIST         │
                    │  "New request: Rahul, Cardiology"  │
                    │  [Approve] [Reject] [Assign Slot]  │
                    └───────────────┬───────────────────┘
                                    │ Approve
                                    ▼
                    ┌───────────────────────────────────┐
                    │  TOKEN ASSIGNED (status: Approve)  │
                    │  Token: CARD-016                   │
                    │  Position: #11                     │
                    │  SMS sent to patient               │
                    └───────────────┬───────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────────┐
                    │  PATIENT IN WAITING AREA           │
                    │  Sees on phone/TV:                 │
                    │  "You are #11" → "#10" → "#9"     │
                    │  Progress bar: ████░░░░ 45%       │
                    └───────────────┬───────────────────┘
                                    │ Position drops to #3
                                    ▼
                    ┌───────────────────────────────────┐
                    │  SMS: "You are #3! Proceed to      │
                    │  OPD Room 3. Dr. Sharma."          │
                    └───────────────┬───────────────────┘
                                    │ Doctor clicks "Call Next"
                                    ▼
                    ┌───────────────────────────────────┐
                    │  CONSULTATION (status: Visited)    │
                    │  Token CARD-016 called             │
                    │  Next patient notified             │
                    └───────────────┬───────────────────┘
                                    │ Doctor finishes
                                    ▼
                    ┌───────────────────────────────────┐
                    │  COMPLETED (status: Finish)        │
                    │  Prescription written              │
                    │  Patient sees prescription online  │
                    └───────────────────────────────────┘
```

---

## 🔒 ZERO-CONFLICT GUARANTEE

### The 4-Layer Protection

```
Layer 1: Slot Lock (5-min reservation)
  → Patient/receptionist "locks" a slot before filling the form
  → Unique constraint: one lock per (doctor, date, slot)
  → Other users instantly see "🔒 Locked"

Layer 2: Transaction with Lock Verification  
  → Booking creation verifies lock ownership inside $transaction
  → If lock expired/missing → transaction fails → "Slot no longer available"

Layer 3: Booking-level Unique Check
  → Even without lock, $transaction checks for existing active booking
  → Belt + suspenders: lock + check = double protection

Layer 4: DB-level Unique Constraint (future)
  → @@unique([doctorId, date, timeSlot]) on active bookings
  → Would require partial index (only for non-canceled) — PostgreSQL supports this
  → Ultimate guarantee: database itself rejects duplicates
```

**Result:** Even if 10 receptionists click the exact same slot at the exact same millisecond, only ONE succeeds. The other 9 get "Slot just taken, please choose another." **Zero double-booking. Guaranteed.**

---

## 📊 DEMO SCRIPT FOR AIIMS/CIMS

### 5-Minute Demo Flow

```
1. "Patient walks in, scans QR at entrance" (show kiosk landing)
   → Fill: Name, Mobile, Age, Chief Complaint
   
2. "Patient chooses Cardiology → Dr. Sharma" 
   → See available slots (10-min intervals, Dr. Sharma's config)
   → OR choose "Anytime today"
   
3. "Request lands at reception" (show receptionist pending list)
   → Receptionist clicks Approve
   → Token CARD-016 assigned instantly
   
4. "Patient gets SMS: You are #11" (show SMS simulation)
   → Patient sees on phone: big "#11" + progress bar
   
5. "Doctor clicks 'Call Next'" (show doctor dashboard)
   → Token CARD-015 → Visited
   → Patient #11 becomes #10 → #9 → ...
   → At #3: SMS "Proceed to OPD Room 3"
   
6. "Meanwhile, 5 receptionists booking simultaneously"
   → Show zero conflicts (slot locking demo)
   → "This is how AIIMS with 10 counters works — zero double-booking"
```

---

## WHAT TO BUILD FIRST

**My recommendation — build in this order:**

1. **Bug fixes** (Day 1): Call Next button, token race, sort order, indexes
2. **Patient position display** (Day 2): "#11" + progress bar
3. **Slot locking** (Day 3-4): Zero-conflict guarantee
4. **QR Kiosk** (Day 5-7): Self-check-in wizard
5. **SMS wiring** (Day 8): Token + position notifications
6. **Per-doctor duration UI** (Day 9): Schedule presets

**Total: 9 days to demo-ready**

---

## NEXT STEP

Start with **Day 1 bug fixes** — they're the foundation. Then slot locking (the "zero-conflict" guarantee that wins the demo). Then QR kiosk.
