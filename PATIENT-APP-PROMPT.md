# Doctorooms Patient — React Native App (Android + iOS)

> **This file is the complete build prompt.** Hand it to the Z.ai CLI as the task description.
> The backend already exists, is live in production, and is **mobile-ready** (verified today with
> real Bearer-token API calls). You are building ONLY the patient-side mobile app. There is NO
> database, NO auth server, and NO image storage in this project — everything comes from the
> hosted Doctorooms backend over HTTPS.

---

## 1. What you are building

**Doctorooms Patient** — a modern, aesthetic React Native app for patients of the Doctorooms
healthcare platform (India). Patients use it to book appointments, track their live queue
position at hospitals, view prescriptions/lab reports/medical documents, pay & review bills,
receive notifications, and manage their health profile + family members.

The doctor/hospital/staff side already exists as a web app — do NOT rebuild any of it. This app
speaks to the same production database through a documented REST API (Section 6).

**Target:** Android + iOS from one codebase, modern aesthetic (Section 5), production-quality.

---

## 2. Product context (must respect)

- **Market:** India. Currency **₹** (format with `en-IN` locale — e.g. ₹1,23,456). Timezone **IST
  (Asia/Calcutta)** — all appointment dates/times shown are IST; the API returns ISO strings.
- **Bilingual flavor:** The platform serves Hindi + English content side by side (e.g. a complaint
  shows "सीने में दर्द / Chest Pain"). Show `*En` fields when present, fall back gracefully.
  UI chrome is English; do not machine-translate.
- **Trust tone:** medical, calm, clean. Friendly microcopy, no dark patterns. Hinglish is part of
  the brand voice on the web (e.g. success toasts like "lag gaya!") — use sparingly, only in
  success/empty-state copy.
- **Roles:** This app is for `role === 'patient'` accounts ONLY. If login returns any other role,
  show "This app is for patients only" and do not proceed.

---

## 3. Architecture

```
┌──────────────────────────┐        HTTPS (JSON, multipart)        ┌──────────────────────────┐
│  Doctorooms Patient app  │ ────────────────────────────────────► │  Doctorooms HMS backend  │
│  Expo (React Native)     │   Authorization: Bearer <jwt>         │  (Next.js, already live)  │
│  Android + iOS           │ ◄──────────────────────────────────── │  Postgres + Cloudinary   │
└──────────────────────────┘        JSON responses                 └──────────────────────────┘
```

- **Backend base URL (prod):** `https://doctorooms-hms.vercel.app`
  All API calls go to `${BASE_URL}/api/...`. Native apps are not subject to browser CORS.
- **No local database.** Use React Query cache + `AsyncStorage` persistence for offline reads.
- **Cloudinary:** the backend uploads to Cloudinary FOR you (signed, server-side). You send
  multipart to our API routes; you never see a Cloudinary key. Media URLs returned by the API are
  plain `https://res.cloudinary.com/...` URLs — render them directly.

---

## 4. Non-negotiable tech stack

| Concern            | Choice                                              |
|--------------------|-----------------------------------------------------|
| Framework          | **Expo SDK (latest stable), managed workflow**      |
| Navigation         | **expo-router** (file-based, typed routes)          |
| Language           | **TypeScript, strict mode**                         |
| Styling            | **NativeWind v4** (Tailwind syntax in RN)           |
| Server state       | **TanStack Query v5** (staleTime 60s default, retry 1) |
| Client state       | **Zustand** (auth/session store, persisted)         |
| Secret storage     | **expo-secure-store** (JWT only)                    |
| Animations         | **react-native-reanimated** + moti                 |
| Icons              | **lucide-react-native**                             |
| Realtime           | **socket.io-client** (optional, feature-flagged — see 6.4) |
| Notifications      | **expo-notifications** (push; local reminders)      |
| Builds             | **EAS Build** (Android app bundle + iOS archive)    |

Do not introduce Redux, Firebase, or any local SQLite/Prisma — the data lives in the hosted backend.

---

## 5. Design system — "modern aesthetic" mandate

This must look like a 2025-grade consumer health app (think Titan/OneMedical/Practo quality bar).

### Color tokens (align with the web brand)
- **Primary:** teal `#0d9488` (teal-600) · hover/press `#0f766e` (teal-700)
- **Accent:** emerald `#10b981` (success/confirm), amber `#f59e0b` (warnings), rose `#f43f5e` (errors/danger)
- **Light theme:** bg `#fafaf9` (stone-50), surface white, text `#0c0a09` (stone-900), muted `#78716c`
- **Dark theme:** bg `#0c0a09` (stone-950), surface `#1c1917` (stone-900), text `#fafaf9`, borders `#292524`
- **NEVER use indigo/blue as primary** — the brand is teal.
- Support light + dark via `useColorScheme()`, default follow system, override in Settings.

### Typography & shape
- Font: **Inter** (400/500/600/700/800). Numeric font-feature for stats (tabular-nums).
- Display headings 28/24, screen titles 20/700, body 15/400, captions 12.5.
- Corner radius: cards **24** (rounded-3xl), inputs/buttons **14** (rounded-2xl), chips full-round.
- Cards: 1px border (stone-200 / stone-800) + soft shadow (light only, `shadowColor:#0c0a09, opacity:0.06, radius:16, offsetY:4`). No heavy drop shadows.

### Layout & components
- **Bottom tab bar:** floating pill style (inset 16, rounded-full, blur/`experimental_backgroundIon` glass effect), 5 tabs — **Home · Appointments · Reports · Alerts · Profile**. Active tab = teal icon + pill highlight. Hide on auth/onboarding screens.
- Touch targets ≥ **48px**. All interactive elements have pressed states (scale 0.97–0.98 + opacity).
- Inputs: 14px radius, leading icon (lucide), focus ring = teal 2px border, floating label.
- Buttons: primary (teal, white text, 800 weight label), secondary (tinted teal-50/dark equivalent), destructive (rose). Height 52. Loading = inline spinner + label, never disable silently.
- Lists: staggered entrance (60ms/item, fade+translateY 12), pull-to-refresh wired to React Query `refetch`.
- Loading: **shimmer skeletons** matching final layout (not spinners) for lists/cards.
- Empty states: centered SVG illustration (simple, teal line-art), one-line title, one-line hint, one CTA button.
- Toasts: top-positioned, icon + message, auto-dismiss 3s, haptic feedback (light) on success/error.
- Status badges: pill, 10% tinted backgrounds (teal=confirmed, amber=pending, rose=cancelled, slate=completed, violet=visited).

### Motion
- Screen transitions: shared-element style where cheap; default fade+slide (reanimated springs, damping 18).
- Number counters on Home stats (weight/points) animate up on mount.
- Queue position changes animate (spring scale pulse).
- Keep everything ≥60fps; use `runOnUI`; no layout-thrashing JS-driven animation.

---

## 6. API contracts (VERIFIED against production today)

Auth format for every protected endpoint:
```
Authorization: Bearer <jwt-from-login>
Content-Type: application/json
```

### 6.1 Auth (public)

| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/api/auth/register` | POST | `{name, email, mobileNo, gender, password, role:'patient', referralCode?}` | `{success, user}` |
| `/api/auth/login` | POST | `{email, password}` | `{success, user{id,name,email,role,gender,profileImg,mobileNo}, sessionExpiresAt, token}` |
| `/api/auth/forgot-password` | POST | `{email}` | `{success, message}` (OTP flow) |
| `/api/auth/verify-otp` | POST | `{email, otp}` | `{success}` |
| `/api/auth/reset-password` | POST | `{email, otp, password}` | `{success}` |
| `/api/auth/me` | GET | — (Bearer) | `{success, user{...}}` |

**Auth rules:**
- Persist `token` in **expo-secure-store**, `user` + `sessionExpiresAt` in Zustand (AsyncStorage).
- Attach Bearer via a central `apiFetch()` wrapper. On **401**: clear store, navigate to login
  (session revoked or expired — 7-day expiry, `sessionExpiresAt` tells you exactly when).
- Rate limits exist server-side (login ~10/min/IP). Show the server's `message` verbatim on 429.
- Registration does NOT auto-login → route to Login after success.
- Login errors come as `{success:false, message}` with 401/403/429 — surface `message`.

### 6.2 Patient data (Bearer)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/patient/profile` | GET/PATCH | Profile get/update |
| `/api/patient/settings` | GET/PATCH | App settings (notifications prefs etc.) |
| `/api/patient/avatar` | POST (multipart, field `avatar`) | Upload avatar → backend → Cloudinary |
| `/api/patient/bookings` | POST | **Create appointment** — body: `{doctorId, bookingDate, timeSlot, bookingMode, disease, description, gender, age, bloodGroup, weight, relationWithMe, state, city, hospitalId, departmentId}` |
| `/api/patient/bookings/check-slot` | GET `?doctorId&date&timeSlot` | Slot availability check before submit |
| `/api/patient/bookings/slots-availability` | GET `?doctorId&date` | Day's open slots |
| `/api/patient/bookings/queue` | GET `?bookingId` | **Live queue position** (poll every 30s while on screen) |
| `/api/patient/bookings/[id]/cancel` | POST | Cancel appointment |
| `/api/dashboard/patient/appointments` | GET | Appointment list + `counts` + pagination |
| `/api/dashboard/patient/appointments/[id]` | GET | Appointment detail |
| `/api/dashboard/patient/stats` | GET | Home dashboard numbers |
| `/api/dashboard/patient/prescriptions` | GET | Prescriptions list (Rx history) |
| `/api/lab-reports/patient` | GET | Lab reports list |
| `/api/patient/medical-documents` | GET/POST | Documents list; POST = multipart upload |
| `/api/patient/medical-documents/[id]/download` | GET | File download (Cloudinary URL) |
| `/api/patient/medical-history` | GET | Medical history |
| `/api/patient/bills` | GET | Bills list |
| `/api/patient/notifications` | GET | Notification list |
| `/api/patient/notifications/[id]/read` | POST | Mark one read |
| `/api/patient/notifications/read-all` | POST | Mark all read |
| `/api/patient/feedback` | POST/GET | Submit consultation feedback |
| `/api/patient/feedback/check` | GET | Already-rated check (post-visit prompt) |
| `/api/patient-insurance` | GET/POST | Insurance policies CRUD |
| `/api/patient/admissions` | GET | Admission records |
| `/api/patient-consent` | GET | Consent requests |
| `/api/patient-consent/[id]/sign` | POST | Sign consent |
| `/api/patient-consent/[id]/revoke` | POST | Revoke consent |
| `/api/patient/posts` | GET | Health blog/feed |

### 6.3 Public discovery (no auth)

| Endpoint | Purpose |
|---|---|
| `/api/doctors` | Doctor directory (search/filter) |
| `/api/hospitals` | Hospital directory |
| `/api/public/hospital/[hospitalId]/departments` | Hospital departments |
| `/api/public/hospital/[hospitalId]/department/[departmentId]/doctors` | Dept doctors + fees |
| `/api/public/hospital/[hospitalId]/queue` | Public queue board |
| `/api/referral/validate?code=XXXX` | Referral code validation (onboarding) |

### 6.4 Realtime (optional, ship dark)

- `GET /api/auth/socket-token` (Bearer) → short-lived JWT.
- Connect `socket.io-client` to `${REALTIME_URL}/notif` namespace with that token. The hosted
  realtime service URL is **not live yet** — put `REALTIME_URL` behind a remote config/env flag
  (empty = feature off) and degrade silently: queue screen falls back to 30s polling, which works
  TODAY via `/api/patient/bookings/queue`.

### 6.5 QA account (for your E2E testing — clearly-labeled test data, safe to use)

```
email:    qa-mobile-app@doctorooms.test
password: QaMobile@123          (role: patient, verified working on prod)
```
Register throwaway `qa-*@doctorooms.test` patients freely if you need more. Never touch other
accounts. There is real production data in this backend — treat every write as careful.

---

## 7. Screens & flows

### Auth stack (no tab bar)
1. **Splash** → auto-login check (SecureStore token + `/api/auth/me` verify) → Home or Login.
2. **Login** (email+password, forgot-password flow with OTP), **Register** (patient fields +
   optional referral code with `/api/referral/validate` badge), **Onboarding carousel** (3 slides,
   only on first launch) — skip-able.

### Tabs (5)
1. **Home** — greeting + avatar; stats row (from `/api/dashboard/patient/stats`); "Next
   appointment" card with countdown + live queue chip (if today); quick actions (Book, Reports,
   Documents, Bills); recent notifications preview; health feed card (`/api/patient/posts`).
2. **Appointments** — segmented list (Upcoming / Completed / Cancelled, counts from the API);
   appointment cards with status badge, doctor, hospital, date-time (IST), fee; actions: view
   detail, **live queue view**, cancel (confirm sheet), post-visit feedback prompt (via
   `/api/patient/feedback/check`).
3. **Book flow (modal stack)** — find doctor/hospital (public directory) → department → doctor
   (fees/specialization) → date picker → slot grid (`slots-availability`) → patient details form
   (self or family member via `relationWithMe`) → `check-slot` → confirm → success animation +
   booking summary + "Add to calendar" option.
4. **Reports** — segmented: Prescriptions | Lab Reports | Documents. Detail screens render
   full data; documents open/download via Cloudinary URLs; share sheet (native) on each.
5. **Alerts** — notification list with read/unread, mark-all-read, deep-link on tap to the
   relevant screen.
6. **Profile** — profile header (avatar upload via multipart), edit profile, family members,
   insurance, medical history, consents, settings (theme, language flavor, notification prefs),
   bills & payments, about + logout (confirm), delete-account note.

### Quality bar per screen
- Loading = skeleton; Error = friendly retry card; Empty = illustrated empty state.
- Every list has pull-to-refresh; every mutation has optimistic or immediate feedback + rollback on error.
- All dates `Asia/Calcutta`; all money `en-IN` ₹.

---

## 8. Build phases (deliver in this order)

**Phase 1 — Foundation (must be complete & verified):** project scaffold (Expo + expo-router +
NativeWind + TS strict), design tokens, `apiFetch` + auth store + SecureStore, Login/Register/
Forgot flows, tab shell, Home + Appointments list, Profile get/update + avatar upload. E2E with
the QA account against the real backend.

**Phase 2 — Core value:** full Book flow (directory → slots → confirm), appointment detail +
cancel + live queue polling, Reports tab (prescriptions + lab + documents with viewer/share),
Alerts + read state, bills.

**Phase 3 — Depth & polish:** feedback flow, insurance CRUD, consents (sign/revoke), family
members in booking, dark mode audit, haptics, animations pass, offline cache (persisted React
Query), 401/429/error audit.

**Phase 4 — Ship prep:** EAS config + build profiles (Android `.aab`, iOS archive), app icons +
splash (teal brand, generate via image tool), `expo-notifications` push token registration
(display-only stub — backend push endpoint comes later), deep links (`doctorooms://`), Play/App
Store screenshots, README with build instructions.

---

## 9. Acceptance criteria (definition of done)

1. Login → Home → Appointments → Book → Queue → Cancel all work against
   `https://doctorooms-hms.vercel.app` with the QA patient account — **no mocks anywhere**.
2. Kill the app mid-session → relaunch → still logged in (SecureStore + `/api/auth/me` verify).
3. Forced logout on 401; graceful "too many attempts" on 429; network errors show retry UI.
4. Light + dark themes; teal brand; no indigo/blue.
5. Android + iOS parity (test via Expo Go on both, or emulator/simulator).
6. TypeScript strict passes; ESLint clean; no console errors; 60fps scroll on lists.
7. Every screen has loading/error/empty states and ≥48px touch targets.

---

## 10. Hard constraints

- **Backend is read-only for you** — never modify it, never call undocumented endpoints, never
  bypass auth. If an endpoint returns 405/404, re-read Section 6 (e.g. `/api/patient/bookings`
  is POST-create only; the LIST is `/api/dashboard/patient/appointments`).
- No mock data, no fake images of real people, no fabricated medical content.
- No test-code files (per CLI defaults) — verify with the QA account instead.
- Do not build doctor/staff/admin features even though the API supports them — patient only.
- Never embed Cloudinary/DB credentials (there are none to embed — uploads go through our API).
- Use only the stack in Section 4; justify any additional package in the README.

---

## 11. Context for the orchestrator (Z.ai CLI session)

- Read this file fully, then break work into the four phases; after each phase update your
  worklog/README and run the acceptance checks for that phase before moving on.
- The backend team (web repo) is actively shipping — endpoints in Section 6 are stable and
  contract-tested, but new patient endpoints may appear; treat `message` fields as the source of
  user-facing error copy.
- Dev note: the backend deployment region is Seoul (fast in India); typical API latency
  150–500ms — design skeletons accordingly (shimmer after 150ms).
- Brand assets: logo = teal (#0d9488) wordmark "Doctorooms". App name: **Doctorooms Patient**.
  Bundle ids: `com.doctorooms.patient` (Android), `com.doctorooms.patient` (iOS).
