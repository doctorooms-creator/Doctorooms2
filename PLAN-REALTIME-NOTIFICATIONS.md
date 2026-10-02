# Doctorooms — Real-time Notifications & Live Updates
# Detailed Implementation Plan

---

## 📋 EXECUTIVE SUMMARY

### What's Already Built (Phase 8A — DONE)
- `mini-services/notification-service/` — Socket.io server on port 3005.
- `src/hooks/useSocket.ts` — client hook with auth handshake + auto-reconnect.
- `src/lib/emit-notification.ts` — `emitNotification(event, rooms, payload)`, `roleRoom(role)`, `hospitalRoom(hospitalId)`, `createNotification(userId, ...)` helpers (server-side).
- `src/components/shared/RealtimeNotification.tsx` — global toast listener mounted in `RootLayout`.
- 9 pre-defined events: `new-admission`, `vital-recorded`, `sample-ordered`, `lab-result-ready`, `bill-generated`, `payment-received`, `discharge-advised`, `ot-scheduled`, `low-stock-alert`.
- ~12 existing API routes already emit (ipd discharge, opd bills, lab reports, bill payments, nurse vitals, etc.).

### What's Missing (Phase 8B — THIS PLAN)
1. **Lab Module emits zero events** — doctor orders test → lab tech never sees it in real-time. Lab uploads report → doctor/patient never get a push. Commission paid → doctor not notified. This is the biggest immediate gap because the lab module is the freshest, most-active code path.
2. **No sidebar badge counts** — even when a notification fires, the sidebar link "Incoming Orders (3)" doesn't update live.
3. **No TanStack Query auto-invalidation on socket events** — pages feel stale until manual refresh.
4. **No event for: external-test-ordered, external-test-accepted, external-test-rejected, external-report-uploaded, commission-paid, queue-updated, bed-status-changed, doctor-online, prescription-shared.**
5. **`RealtimeNotification.tsx` only handles 9 events** — needs to handle the new lab + queue events.
6. **No "online status" indicator** for doctors (useful for patient booking).

### Goals
- Every meaningful state change in the **lab module** pushes a notification to the right role(s) within 1 second.
- Sidebar badges update live (e.g. lab tech's "Incoming Orders (2)").
- TanStack Query caches auto-invalidate when an event arrives, so list/detail pages re-fetch.
- Lay the same pattern down for queue + bed + prescription events so future modules plug in trivially.

---

## 📋 ARCHITECTURE

```
┌───────────────────────────────────────────────────────────────┐
│  Browser (Patient / Doctor / Lab Tech / Admin)              │
│                                                               │
│  useSocket() ──connect──► io('/?XTransformPort=3005')        │
│  RealtimeNotification ─► toast() + invalidateQueries()      │
│  SidebarBadge ─► subscribes to room, live count              │
└───────────────────────────┬───────────────────────────────────┘
                            │ websocket (port 3005 via gateway)
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  mini-services/notification-service/index.ts  (port 3005)   │
│                                                               │
│  Rooms: user:<id>, role:<role>, hospital:<id>                │
│  HTTP POST /emit  ◄── called by Next.js API routes           │
└───────────────────────────▲───────────────────────────────────┘
                            │ fetch POST /emit?XTransformPort=3005
                            │
┌──────────────────────────────────────────────────────────────┐
│  Next.js API Routes  (port 3000)                            │
│                                                              │
│  /api/external-test-orders POST  → emitNotification(...)     │
│  /api/external-test-orders/[id]/accept POST                  │
│  /api/external-test-orders/[id]/reject POST                  │
│  /api/external-test-orders/[id]/upload-report POST            │
│  /api/commission/pay POST                                     │
└──────────────────────────────────────────────────────────────┘
```

**Gateway rule reminder** — frontend calls `io('/?XTransformPort=3005')` (no port in URL). Server-side `fetch` from API routes also uses `?XTransformPort=3005` query param. NEVER write `http://localhost:3005`.

---

## 📋 NEW EVENT TYPES (10 new)

### Lab Module Events (5)
| Event | Emitted By | Sent To (rooms) | Payload |
|-------|-----------|-----------------|---------|
| `external-test-ordered` | `POST /api/external-test-orders` | `user:<lab-tech-userId>`, `role:lab_technician` | `{ orderId, orderNo, testName, patientName, doctorName, urgency }` |
| `external-test-accepted` | `POST /api/external-test-orders/[id]/accept` | `user:<doctorId>` | `{ orderId, orderNo, testName, patientName, labName }` |
| `external-test-rejected` | `POST /api/external-test-orders/[id]/reject` | `user:<doctorId>` | `{ orderId, orderNo, testName, labName, reason }` |
| `external-report-uploaded` | `POST /api/external-test-orders/[id]/upload-report` | `user:<doctorId>`, `user:<patientId>` | `{ orderId, orderNo, testName, patientName, labName, isAbnormal, fileUrl }` |
| `commission-paid` | `POST /api/commission/pay` | `user:<doctorId>` | `{ amount, period, transactionRef, labName? }` |

### General System Events (5)
| Event | Emitted By | Sent To | Payload |
|-------|-----------|---------|---------|
| `queue-updated` | `POST /api/bookings/[id]/approve`, `POST /api/receptionist/walk-in`, queue mutations | `role:receptionist`, `role:doctor`, `hospital:<id>` | `{ doctorId, queueLength, nextPatientName }` |
| `bed-status-changed` | `POST /api/ipd-admissions`, `POST /api/ipd-admissions/[id]/discharge`, `POST /api/bed-transfer` | `role:receptionist`, `role:nurse`, `hospital:<id>` | `{ bedId, wardName, oldStatus, newStatus, patientName? }` |
| `prescription-shared` | `POST /api/prescription-access/requests/[id]/approve` | `user:<patientId>` | `{ prescriptionId, doctorName }` |
| `doctor-online` / `doctor-offline` | socket connection / disconnection handler in `notification-service` | `role:patient` (only patients currently on booking flow) | `{ doctorId, doctorName, isOnline }` |
| `low-stock-alert` (already exists) — extend payload | inventory-item update | `role:pharmacist`, `role:admin`, `hospital:<id>` | `{ itemId, itemName, currentStock, reorderLevel }` |

---

## 📋 BACKEND CHANGES

### A. `mini-services/notification-service/index.ts` (EDIT)

1. **Extend `VALID_EVENTS` array** to include the 10 new events.
2. **Add `doctor-online` / `doctor-offline` broadcast logic** in the `io.on('connection')` and `socket.on('disconnect')` handlers — when a doctor connects, broadcast `doctor-online` to `role:patient` room. Same for disconnect with a 5-second debounce (in case of network blips).
3. **Add `connectedClients` API** — expose `GET /online-doctors` HTTP endpoint on the service so the patient booking page can fetch the list of currently-online doctors (without subscribing to a socket room).
4. **Add `GET /stats`** — for debugging: returns counts of connected clients per role + per hospital. Useful during development.

### B. `src/lib/emit-notification.ts` (EDIT — extend)

Currently exports `emitNotification`, `roleRoom`, `hospitalRoom`, `createNotification`. Add:

```ts
// New helpers
export function userRoom(userId: string): string {
  return `user:${userId}`
}

export async function emitToUser(userId: string, event: string, payload: Record<string, unknown>): Promise<void> {
  // Convenience: emit + persist a Notification row for that user
  await Promise.all([
    emitNotification(event, [userRoom(userId)], payload),
    createNotification(userId, { /* title, message derived from event */ }),
  ])
}

export async function emitToRole(role: string, event: string, payload: Record<string, unknown>): Promise<void> {
  await emitNotification(event, [roleRoom(role)], payload)
  // No DB persistence — role-wide broadcasts are ephemeral
}

export async function emitToHospital(hospitalId: string, event: string, payload: Record<string, unknown>): Promise<void> {
  await emitNotification(event, [hospitalRoom(hospitalId)], payload)
}

// Title/message resolver — maps event → human-readable Notification row
const EVENT_TITLES: Record<string, { title: string; messageFn: (p: Record<string, unknown>) => string }> = {
  'external-test-ordered': {
    title: 'New Test Order',
    messageFn: (p) => `Dr. ${p.doctorName} ordered ${p.testName} for ${p.patientName}`,
  },
  'external-test-accepted': {
    title: 'Order Accepted',
    messageFn: (p) => `${p.labName} accepted your order for ${p.testName} (${p.patientName})`,
  },
  // ... etc
}
```

### C. Lab Module API Routes — Add emit calls (5 routes)

#### `POST /api/external-test-orders` (EDIT)
After creating all orders in the loop, group by lab partner and emit one `external-test-ordered` event per lab:

```ts
// After created[] loop:
const byLab = new Map<string, typeof created>()
for (const o of created) {
  if (!byLab.has(o.labPartnerId)) byLab.set(o.labPartnerId, [])
  byLab.get(o.labPartnerId)!.push(o)
}
for (const [labPartnerId, orders] of byLab) {
  const partner = await db.labPartner.findUnique({ where: { id: labPartnerId }, select: { userId: true, labName: true } })
  if (!partner) continue
  await emitToUser(partner.userId, 'external-test-ordered', {
    orderId: orders[0].id,
    orderNo: orders[0].orderNo,
    testName: orders.length === 1 ? orders[0].testName : `${orders.length} tests`,
    patientName: patient.name,
    doctorName: user.name,
    urgency: orders[0].urgency,
    labName: partner.labName,
    count: orders.length,
  })
}
```

#### `POST /api/external-test-orders/[id]/accept` (EDIT)
After updating order status to InProgress:

```ts
const doctor = await db.doctor.findUnique({
  where: { id: order.doctorId },
  include: { user: { select: { id: true, name: true } } },
})
if (doctor) {
  await emitToUser(doctor.user.id, 'external-test-accepted', {
    orderId: order.id,
    orderNo: order.orderNo,
    testName: order.testName,
    patientName: patientNameFromOrder,
    labName: partner.labName,
  })
}
```

#### `POST /api/external-test-orders/[id]/reject` (EDIT)
Same pattern, event `external-test-rejected`, payload includes `reason`.

#### `POST /api/external-test-orders/[id]/upload-report` (EDIT)
**Two emits** — one to the doctor, one to the patient:

```ts
const doctor = await db.doctor.findUnique({
  where: { id: order.doctorId },
  include: { user: { select: { id: true, name: true } } },
})
if (doctor) {
  await emitToUser(doctor.user.id, 'external-report-uploaded', {
    orderId: order.id,
    orderNo: order.orderNo,
    testName: order.testName,
    patientName: (await db.user.findUnique({ where: { id: order.patientId } }))?.name || 'Patient',
    labName: partner.labName,
    isAbnormal,
    fileUrl,
  })
}
await emitToUser(order.patientId, 'external-report-uploaded', {
  orderId: order.id,
  orderNo: order.orderNo,
  testName: order.testName,
  patientName: 'You',  // patient-facing
  labName: partner.labName,
  isAbnormal,
  fileUrl,
})
```

#### `POST /api/commission/pay` (EDIT)
After marking billing(s) as Paid:

```ts
const doctor = await db.doctor.findUnique({
  where: { id: body.doctorId /* or billing.doctorId */ },
  include: { user: { select: { id: true, name: true } } },
})
if (doctor) {
  await emitToUser(doctor.user.id, 'commission-paid', {
    amount: totalAmountPaid,
    period: body.period || '',
    transactionRef,
    labName: labNameForBulkPayout,
  })
}
```

### D. General System API Routes — Add emit calls (4 routes)

#### `POST /api/bookings/[id]/approve` (EDIT — add `queue-updated`)
Already emits some events; add a `queue-updated` emit to `role:receptionist` + `role:doctor` + `hospital:<id>` with `{ doctorId, queueLength, nextPatientName }`. Compute queue length via `db.booking.count({ where: { doctorId, status: 'Approve', bookingDate: today } })`.

#### `POST /api/receptionist/walk-in` (EDIT — add `queue-updated`)
Same as above.

#### `POST /api/ipd-admissions` (EDIT — add `bed-status-changed`)
After admission creates + bed marked Occupied:

```ts
await emitToRole('receptionist', 'bed-status-changed', { bedId, wardName, oldStatus: 'Available', newStatus: 'Occupied', patientName })
await emitToHospital(hospitalId, 'bed-status-changed', { ... })
```

#### `POST /api/ipd-admissions/[id]/discharge` (EDIT — add `bed-status-changed`)
After discharge + bed marked Available:

```ts
await emitToRole('receptionist', 'bed-status-changed', { bedId, wardName, oldStatus: 'Occupied', newStatus: 'Available' })
await emitToHospital(hospitalId, 'bed-status-changed', { ... })
```

#### `POST /api/prescription-access/requests/[id]/approve` (EDIT — add `prescription-shared`)
After granting access:

```ts
await emitToUser(request.patientId, 'prescription-shared', { prescriptionId, doctorName: granterName })
```

---

## 📋 FRONTEND CHANGES

### E. `src/components/shared/RealtimeNotification.tsx` (EDIT — extend event config)

Add the 10 new events to `EVENT_CONFIG`:

```ts
const EVENT_CONFIG: Record<string, EventConfig> = {
  // ... existing 9 events ...
  'external-test-ordered': {
    title: 'New Lab Test Order',
    icon: FlaskConical,
    color: 'text-amber-600',
    roles: ['lab_technician'],
  },
  'external-test-accepted': {
    title: 'Lab Order Accepted',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    roles: ['doctor'],
  },
  'external-test-rejected': {
    title: 'Lab Order Rejected',
    icon: XCircle,
    color: 'text-rose-600',
    roles: ['doctor'],
  },
  'external-report-uploaded': {
    title: 'Lab Report Ready',
    icon: FileText,
    color: 'text-teal-600',
    roles: ['doctor', 'patient', 'lab_technician'],
  },
  'commission-paid': {
    title: 'Commission Paid',
    icon: IndianRupee,
    color: 'text-emerald-600',
    roles: ['doctor'],
  },
  'queue-updated': {
    title: 'Queue Updated',
    icon: ListOrdered,
    color: 'text-violet-600',
    roles: ['receptionist', 'doctor', 'hospital'],
  },
  'bed-status-changed': {
    title: 'Bed Status Changed',
    icon: BedDouble,
    color: 'text-teal-600',
    roles: ['receptionist', 'nurse', 'hospital'],
  },
  'prescription-shared': {
    title: 'Prescription Shared',
    icon: FileText,
    color: 'text-violet-600',
    roles: ['patient'],
  },
  'doctor-online': {
    title: 'Doctor Online',
    icon: Stethoscope,
    color: 'text-emerald-600',
    roles: ['patient'],
  },
  'doctor-offline': {
    title: 'Doctor Offline',
    icon: Stethoscope,
    color: 'text-muted-foreground',
    roles: ['patient'],
  },
}
```

Also: when an event arrives, **invalidate the relevant TanStack Query keys** so list pages auto-refresh. Add a `queryKeysToInvalidate` per event:

```ts
const QUERY_INVALIDATION: Record<string, string[]> = {
  'external-test-ordered': ['lab-tech-incoming-orders', 'lab-tech-dashboard'],
  'external-test-accepted': ['external-test-orders', 'doctor-prescription-wizard'],
  'external-test-rejected': ['external-test-orders', 'doctor-prescription-wizard'],
  'external-report-uploaded': ['patient-lab-reports', 'doctor-commission', 'external-test-orders', 'lab-billing'],
  'commission-paid': ['doctor-commission', 'admin-commission-report', 'lab-billing'],
  'queue-updated': ['receptionist-queue', 'doctor-appointments'],
  'bed-status-changed': ['ipd-admissions', 'wards', 'beds'],
  'prescription-shared': ['patient-rx-access'],
}
```

Use the `useQueryClient` from `@tanstack/react-query` — pass it via React context (or use the `QueryClient` directly imported).

### F. Sidebar Badge Counts — Live Update (NEW COMPONENT)

Create `src/components/dashboard/sidebar-badge.tsx`:

```tsx
'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/hooks/useSocket'
import { useEffect } from 'react'

interface SidebarBadgeProps {
  href: string  // matches the sidebar item href
  queryKey: string[]
  fetchUrl: string
  eventTriggers: string[]  // events that should invalidate this badge's count
}

export function SidebarBadge({ href, queryKey, fetchUrl, eventTriggers }: SidebarBadgeProps) {
  const { data } = useQuery({
    queryKey,
    queryFn: () => fetch(fetchUrl).then((r) => r.json()),
    refetchInterval: 60000,  // fallback polling
  })
  const qc = useQueryClient()

  // Listen to socket events and invalidate
  const socket = useSocket({ enabled: false /* just subscribe, no emit */ })
  useEffect(() => {
    if (!socket) return
    const handler = () => qc.invalidateQueries({ queryKey })
    eventTriggers.forEach((evt) => socket.on(evt, handler))
    return () => eventTriggers.forEach((evt) => socket.off(evt, handler))
  }, [socket, qc, queryKey, eventTriggers])

  const count = data?.count ?? 0
  if (count === 0) return null
  return (
    <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
```

Then in `sidebar.tsx` — for selected items, render the badge:

```tsx
// in the sidebar item render:
{item.href === '/dashboard/lab-technician/incoming-orders' && (
  <SidebarBadge
    href={item.href}
    queryKey={['lab-tech-incoming-orders-count']}
    fetchUrl="/api/external-test-orders?status=Ordered&countOnly=1"
    eventTriggers={['external-test-ordered', 'external-test-accepted', 'external-test-rejected', 'external-report-uploaded']}
  />
)}
```

Add badges for:
- Lab tech "Incoming Orders" — count of Ordered orders
- Doctor "Lab Partners" — no badge (read-only list)
- Doctor "My Commission" — count of pending payouts > 0 (subtle "•" indicator, not a count)
- Patient "My Lab Reports" — count of new reports since last visit (track via Notification table status=UNREAD for `external-report-uploaded` events)
- Admin "Lab Partners" — no badge
- Receptionist "Pending Bookings" — count of pending approvals
- Nurse "My Patients" — count of admissions with unread vitals
- All roles "Notifications" — count of UNREAD notifications

### G. Patient "Doctor Online" Indicator (NEW COMPONENT)

On the patient booking page `/dashboard/patient/book/[doctorId]`, fetch `GET /api/online-doctors` (which proxies to the mini-service's `/online-doctors` endpoint). Show a small green dot next to the doctor's name if online.

Actually simpler: have the patient booking page subscribe to `doctor-online` / `doctor-offline` events filtered by the specific doctor's userId. Show the green dot accordingly.

### H. Doctor Wizard — Auto-refresh on Socket Events (EDIT `prescription-stepper.tsx`)

When the wizard is open on Step 7 (Order Tests) and an `external-test-accepted` or `external-report-uploaded` event arrives for the current patient, auto-invalidate the existing-orders and reports queries. The TanStack Query `refetchOnMount` + `refetchOnWindowFocus` already help, but live socket invalidation gives true real-time.

---

## 📋 BUILD ORDER (5 phases)

### Phase R1 — Backend emit infrastructure (parallel, ~2 hrs)
- [ ] Edit `mini-services/notification-service/index.ts` — extend `VALID_EVENTS` + add doctor-online/offline broadcast + add `GET /online-doctors` + `GET /stats`.
- [ ] Edit `src/lib/emit-notification.ts` — add `userRoom`, `emitToUser`, `emitToRole`, `emitToHospital`, `EVENT_TITLES` resolver.
- [ ] Add API routes: `GET /api/online-doctors` (proxies to mini-service), `GET /api/notifications/unread-count`.

**[PARALLEL]**

### Phase R2 — Lab module emit wiring (parallel, ~3 hrs)
Five API routes get emit calls added at the end of their POST handlers:
- [ ] `/api/external-test-orders` POST → `external-test-ordered` (one per lab).
- [ ] `/api/external-test-orders/[id]/accept` POST → `external-test-accepted`.
- [ ] `/api/external-test-orders/[id]/reject` POST → `external-test-rejected`.
- [ ] `/api/external-test-orders/[id]/upload-report` POST → `external-report-uploaded` (×2: doctor + patient).
- [ ] `/api/commission/pay` POST → `commission-paid`.

### Phase R3 — General system emit wiring (parallel, ~2 hrs)
- [ ] `/api/bookings/[id]/approve` POST → add `queue-updated`.
- [ ] `/api/receptionist/walk-in` POST → add `queue-updated`.
- [ ] `/api/ipd-admissions` POST → add `bed-status-changed`.
- [ ] `/api/ipd-admissions/[id]/discharge` POST → add `bed-status-changed`.
- [ ] `/api/prescription-access/requests/[id]/approve` POST → add `prescription-shared`.

### Phase R4 — Frontend listener extensions (parallel, ~3 hrs)
- [ ] Extend `RealtimeNotification.tsx` EVENT_CONFIG with 10 new events + add `QUERY_INVALIDATION` map + wire `useQueryClient`.
- [ ] Create `src/components/dashboard/sidebar-badge.tsx`.
- [ ] Edit `src/components/dashboard/sidebar.tsx` to render `SidebarBadge` on 6-8 selected items.
- [ ] Edit `src/components/prescription/stepper/prescription-stepper.tsx` to subscribe to `external-test-*` and `external-report-uploaded` events and invalidate queries.
- [ ] Add "Online" indicator dot on patient's `book/[doctorId]` page.

### Phase R5 — Testing & polish (sequential, ~2 hrs)
- [ ] Verify all 10 events fire end-to-end (browser + dev server log).
- [ ] Verify sidebar badges update live (no manual refresh).
- [ ] Verify TanStack Query auto-invalidates.
- [ ] Verify patient sees report-ready toast within 2 seconds of lab upload.
- [ ] Verify doctor's commission page updates within 2 seconds of admin payout.
- [ ] `bun run lint` clean.

---

## 📋 FILE MANIFEST

### New Files (4)
| File | Purpose |
|------|---------|
| `src/components/dashboard/sidebar-badge.tsx` | Live badge count component for sidebar items |
| `src/components/dashboard/online-doctor-dot.tsx` | "Online" indicator for patient booking page |
| `src/app/api/online-doctors/route.ts` | GET proxy to mini-service's online-doctors endpoint |
| `src/app/api/notifications/unread-count/route.ts` | GET count of UNREAD notifications for current user |

### Modified Files (12)
| File | Change |
|------|--------|
| `mini-services/notification-service/index.ts` | Extend VALID_EVENTS + doctor-online/offline broadcast + GET /online-doctors + GET /stats |
| `src/lib/emit-notification.ts` | Add userRoom, emitToUser, emitToRole, emitToHospital, EVENT_TITLES |
| `src/components/shared/RealtimeNotification.tsx` | Add 10 events to EVENT_CONFIG + QUERY_INVALIDATION map + useQueryClient wiring |
| `src/components/dashboard/sidebar.tsx` | Render SidebarBadge on 6-8 selected items |
| `src/app/api/external-test-orders/route.ts` | POST → emit `external-test-ordered` |
| `src/app/api/external-test-orders/[id]/accept/route.ts` | POST → emit `external-test-accepted` |
| `src/app/api/external-test-orders/[id]/reject/route.ts` | POST → emit `external-test-rejected` |
| `src/app/api/external-test-orders/[id]/upload-report/route.ts` | POST → emit `external-report-uploaded` × 2 |
| `src/app/api/commission/pay/route.ts` | POST → emit `commission-paid` |
| `src/app/api/bookings/[id]/approve/route.ts` | Add `queue-updated` emit |
| `src/app/api/receptionist/walk-in/route.ts` | Add `queue-updated` emit |
| `src/app/api/ipd-admissions/route.ts` + `/[id]/discharge/route.ts` | Add `bed-status-changed` emit |
| `src/app/api/prescription-access/requests/[id]/approve/route.ts` | Add `prescription-shared` emit |
| `src/app/dashboard/patient/book/[doctorId]/client.tsx` | Show online dot + react to `doctor-online` / `doctor-offline` socket events |

### No schema changes — `Notification` model already supports everything we need (title, message, status, userId).

---

## 📋 TESTING CHECKLIST (Post-Build)

### Lab Module Real-time (5 tests)
1. **Order placed** — login as Dr. Sharma, open wizard Order Tests tab, send an order. In another browser tab (logged in as lab tech Amit Kumar) → "Incoming Orders" badge count should tick +1 within 2 seconds, no manual refresh. Toast: "New Lab Test Order — Dr. Rajesh Sharma ordered CBC for Rahul Verma".
2. **Order accepted** — switch to lab tech tab, click "Accept". In doctor tab (open on lab-partners page or commission page) → toast: "Lab Order Accepted — City Diagnostics accepted your order for CBC".
3. **Report uploaded** — in lab tech tab, click Upload Report, submit. Both doctor tab and patient tab (Rahul Verma) should toast: "Lab Report Ready — CBC report from City Diagnostics". Patient's "My Lab Reports" badge should tick +1.
4. **Abnormal flag toast** — repeat test 3 with the "Flag as Abnormal" checkbox checked. Toast should include a rose ⚠️ indicator.
5. **Commission paid** — login as admin, open commission-report page, click "Pay Now" on a doctor row. In doctor tab → toast: "Commission Paid — ₹326 for August 2026". Doctor's "My Commission" page should auto-refresh with updated paid/pending totals.

### General System Real-time (4 tests)
6. **Queue update** — login as receptionist, approve a pending booking. The doctor's appointment list page should auto-refresh (count badge +1) within 2 seconds. Receptionist's queue page should re-order.
7. **Bed status** — admit a patient to bed B1. Receptionist + nurse + hospital admin should all see toast "Bed Status Changed — B1 (General Ward): Available → Occupied".
8. **Prescription shared** — patient requests Rx access from Dr. Sharma. Doctor approves. Patient's "Rx Access" badge should tick +1, toast: "Prescription Shared — Dr. Sharma granted access".
9. **Doctor online** — login as Dr. Sharma in one browser tab. Login as patient Rahul Verma in another, navigate to `/dashboard/patient/book/<doctorId>`. The doctor's profile should show a green "Online" dot. Logout Dr. Sharma → dot turns grey within 5 seconds.

### Performance / Resilience (3 tests)
10. **Mini-service restart** — kill `bun run dev` in `mini-services/notification-service/` then restart. All connected clients should auto-reconnect within 5 seconds; no toasts lost during reconnect.
11. **High event rate** — admin pays out 20 commissions in rapid succession. Doctor should see 20 toasts (capped at 5 visible, rest queued) + 1 unread notification per payout.
12. **Cross-hospital isolation** — login as Dr. Sharma (Sharma Clinic hospital) and Dr. Anita (City General hospital). Have Dr. Sharma's lab upload a report. Dr. Anita should NOT see the toast (hospital room isolation).

---

## 📋 OUT OF SCOPE (Future Work)

- **WhatsApp / SMS gateway** — actually send SMS to patient's phone when `external-report-uploaded` fires. Requires Twilio / MSG91 integration. Future phase.
- **Email digest** — daily email summary of notifications for users who were offline. Requires email service.
- **Notification preferences** — per-user toggle to mute specific event types. Needs a `UserNotificationPreference` table.
- **Sound alerts** — play a chime when a critical event (urgent test order, abnormal report) fires.
- **Browser push notifications** — using the Web Notifications API + service worker (the project already has a service worker; extend it to show OS-level notifications when the tab is in the background).

---

**Estimated effort: ~12 hours** (across the 5 build phases; ~2/3/2/3/2 hrs).
**Single developer or 2 parallel agents can finish in 1-2 sessions.**
**Zero schema migrations required.** All existing infrastructure is reused.

---

*Status: Ready for execution. Pick the phase order that suits — Phase R1 must run first (others depend on the new helpers), but R2/R3/R4 can run in parallel after R1.*
