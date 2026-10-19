# Doctorooms Patient Module — Full User-Side Audit
### Deliverable for React Native App UI Design (Google Stitch reference) — NO development started
**Audit date:** 19 Oct 2026 · **Scope:** Everything a PATIENT can do in the real app TODAY (not future features) · **Backend/DB = unchanged, will be reused by the RN app**

---

## 0. Executive Summary

- Patient web app = **17 navigation sections + public pages + a global AI-nurse (Aturseva/Sevika) FAB on every page**.
- Patient identity = `User` row with `role='patient'` (**no separate Patient table** — `patientId == User.id`). Real-world linkage key = **mobile number**.
- Backend is **already mobile-ready** ("P5-MOBILE" rail): login returns JWT in body → RN stores in `expo-secure-store` → sends `Authorization: Bearer <jwt>`; every patient API accepts it. Socket auth endpoint (`/api/auth/socket-token`) exists. A previous `PATIENT-APP-PROMPT.md` (Expo + expo-router plan) already exists at repo root.
- Patient-facing consumer brand = **"Aturseva, a Doctorooms product"** (AI nurse + health saathi). Logo: `upload/Aturseva_Primary_With_Tagline (1).svg` (monochrome/currentColor). Web theme color: **teal `#0d9488`**.
- Status: app currently runs on sandbox only (prod deploy pending), but ALL features below are implemented & working in the codebase.

---

## 1. Patient Identity & Auth (current system)

| Item | Detail |
|---|---|
| Self signup | `POST /api/auth/register` — patient/doctor/hospital roles only; password ≥6; email unique; **mobile dedup for patients** (same mobile ⇒ one patient account, links walk-in bookings); status Pending+email-verify (if Resend configured) else Active; optional referral code claim |
| Login | `POST /api/auth/login` — IP rate-limit 10/min, brute-force lock (5 fails/5min → 15min lock), bcrypt, status gate (Block/Pending rejected) → returns `{user, sessionExpiresAt, token}` + sets httpOnly `doctorooms_session` JWT cookie (7d, DB-persisted `Session` row, revocable) |
| Mobile auth (RN) | Same login → **`token` in response body** → Bearer header on every API call (identical signature + DB-session verification as cookie) |
| Session revoke | `POST /api/auth/logout` (revoke+clear), `POST /api/auth/logout-all` (revoke all other devices) |
| Socket auth | `GET /api/auth/socket-token` → 5-min JWT for socket.io handshake |
| Route guard | Edge proxy allows public routes; `/dashboard/*` needs cookie; APIs accept cookie OR Bearer JWT |
| OTP | `OtpCode` model exists (email OTP for forgot-password) — reusable later for mobile OTP login |

---

## 2. Navigation Map (what the patient sees in the web app today)

Sidebar (`sidebarConfig.patient`) — 17 items:

| # | Label | Route | Live badge |
|---|---|---|---|
| 1 | Dashboard | `/dashboard/patient` | — |
| 2 | Appointments | `/dashboard/patient/appointments` | — |
| 3 | **Aturseva — AI Sahayika** | `/dashboard/patient/aturseva` | unread AI msgs |
| 4 | **Dawai Reminders** (Sevika) | `/dashboard/patient/sevika` | — |
| 5 | Health Records | `/dashboard/patient/health-records` | — |
| 6 | My Lab Reports | `/dashboard/patient/reports` | report count |
| 7 | Medical History | `/dashboard/patient/medical-history` | — |
| 8 | Rx Access | `/dashboard/patient/prescription-access` | — |
| 9 | My Bills | `/dashboard/patient/bills` | — |
| 10 | My Insurance | `/dashboard/patient/insurance` | — |
| 11 | My Consents | `/dashboard/patient/consents` | — |
| 12 | My Blog | `/dashboard/patient/blog` | — |
| 13 | Feedback | `/dashboard/patient/feedback` | — |
| 14 | Notifications | `/dashboard/patient/notifications` | unread count |
| 15 | Profile | `/dashboard/patient/profile` | — |
| 16 | Settings | `/dashboard/patient/settings` | — |
| 17 | Change Password | `/dashboard/change-password` | — |

**Public (pre-login) pages patient uses:** `/doctors` (search/filter), `/doctors/[id]` (profile + Book), `/login`, `/register`, `/book`, `/dashboard/video-call/[roomId]`.
**Global element:** Sevika AI-nurse floating chat FAB mounted on **every** patient dashboard page (right-side sheet, same persistent thread as full chat page).

---

## 3. End-to-End User Journey (the real lifecycle)

1. **Register/Login** → lands on patient dashboard.
2. **Dashboard** — next-appointment hero banner (countdown chip: Today/Tomorrow/in N days, mode chip, status badge, View Details, Join Video Call), 4 stat cards (Upcoming Appointments, Completed Visits, Total Doctors, Medical Documents), upcoming list with **live token-queue cards** (position #N, "X ahead · ~N min wait", progress bar, "You are next!"), quick actions, recent activity feed. Empty states funnel to doctor discovery.
3. **Find doctor** (public) — debounced search + specialization/city/state filters → doctor profile (ratings, reviews, schedule, fees) → **Book**.
4. **Booking flow** (`/dashboard/patient/book/[doctorId]`) — Step 1: calendar (past/non-schedule days disabled, holiday banner) → Step 2: live slot grid (30s refresh, free/taken/past, auto-picks next free slot, re-picks on race-conflict with toast, **queue-tail option** "No fixed time — join queue") + mode toggle **In Person / Video Call** → Confirm card: summary (doctor, date, time, mode, ₹fee) + form (Gender*, Reason/Disease*, State, City, Notes) → `POST /api/patient/bookings` → status **Pending** → redirect to appointments.
5. **Await approval** — doctor/reception approves → **Approve** + token number assigned → notification + `aturseva-push` socket event.
6. **Day of visit** — countdown banner; live queue (Waiting → Next → Consulting, currently-serving token, doctor/department/hospital info with floor & OPD room); **chat with doctor** (10s poll, per-booking thread, typing via socket, read receipts); **join video call** when doctor opens room (patient can only join, never start).
7. **Consultation** — doctor marks **Visited** → prescription written (Draft → finalized; patient sees only non-drafts).
8. **Post-visit** — status **Finish** → view/print prescription (vitals, medicines with M/A/E badges, advice, diagnosis tables), **Rate This Visit** (5-star overall + consultation/wait-time/staff sub-ratings, review, wouldRecommend, anonymous), re-book with same doctor.
9. **Records & results** — lab tests (doctor-ordered) flow to My Lab Reports (internal: Ordered → Sample Collected → Result Entered → Verified, with parameter tables + normal ranges + abnormal flags; external partner uploads with viewer/download/print); Health Records = patient's own document vault (upload ≤5MB PDF/JPG/PNG/DOC/DOCX with magic-byte validation, categories, download, delete) + past prescriptions; Medical History = unified timeline (appointments + prescriptions + lab reports + hospital stays, filter chips, ≤100 events).
10. **Consent & payments** — Rx Access: approve/reject/revoke doctor requests to see patient's prescriptions; My Bills: IPD bills (Draft/Final/Partial/Paid, balance due, **pay online via Razorpay**) + OPD bills (read-only) + gateway transaction history.
11. **Daily ongoing** — Dawai reminders (take/snooze/skip/shift, catch-up window), Aturseva chat (Hinglish, voice in/out, GPS nearby doctors, booking via chat with human-confirm card, daily check-in diary), notifications center, blog (patient can write posts), profile/avatar, settings (theme + 3 notification toggles + logout-all-devices).

---

## 4. Feature Inventory — what the patient CAN do TODAY (master list)

### A. Discovery & Booking
- Browse/search public doctor directory (text + specialization + city + state filters)
- View doctor profile: ratings aggregate, reviews, weekly schedule, fees, experience, hospital address
- Live slot inventory per date (free/taken/past, next-free-slot, 30s freshness, race-safe re-pick)
- Book **In Person** or **Video Call** appointment (fixed slot OR queue-tail walk-in)
- See ₹ fee before confirm; booking creates status `Pending` ("Waiting for confirmation")
- **Cancel** own appointment (only Pending/Approve, with confirmation dialog)
- **Re-book** same doctor (one tap from finished appointment)
- Live **queue tracking**: token number, position, patients ahead, est. wait (~10 min/pt heuristic), currently-serving token, progress bar, step dots, department floor/OPD room, hospital address
- **Chat with doctor** per booking (messages ≤2000 chars, own booking only)
- **Join video call** (doctor-initiated room)

### B. AI Nurse — Aturseva / Sevika (the flagship differentiator)
- **Persistent Hinglish chat** (same thread on full page + global FAB sheet), SSE streaming replies
- **11 agent tools** (all ownership-scoped): search_doctors, get_my_bookings, get_queue_position, get_doctor_slots, find_nearby_doctors (GPS 30km), prepare_booking, get_my_symptom_log, prepare_check_in, get_my_lab_reports (explained, never diagnosed), get_my_diet_plan, get_my_weekly_report
- **Rich action cards** in chat (doctor results, slot pickers, booking confirm, check-in, queue, lab reports, diet, weekly report)
- **Human-in-the-loop booking**: AI prepares → patient taps "Confirm & Book" → server re-validates + serializable-tx claim
- **Voice in (ASR):** record ≤45s WAV 16kHz → transcript placed in composer for review (never auto-sent)
- **Voice out (TTS):** "Bol kar jawab" toggle auto-speaks each reply (voice `tongtong`), per-bubble replay
- **Photo-RX parse (VLM):** photograph a prescription → AI extracts medicines → patient reviews/edits drafts → confirmed items become reminder schedules
- **Daily check-in diary:** mood 1–5, energy 1–5, symptom tags, note (one per day, revisable, streak + top symptoms trend)
- **Dawai (medicine adherence):** today's dose timeline (सुबह/दोपहर/रात with personalised slot times), mark **taken/snooze 10m/skip/shift-to-slot**, 2h **catch-up** ("Abhi Le Li"), streak, 7-day adherence %, weekly report (score, day bars, AI narrative)
- **Medicine onboarding:** manual add (name/dose/instructions/M-A-E flags/duration 1–90 days), import from any doctor's prescription, photo-RX
- **AI diet plan:** 7-day ghar-ka-khana plan generated from active medicines (deterministic fallback if LLM busy), meal-time nudges
- **Proactive pushes:** booking approved/rejected, "aapki baari" (your turn), consultation started, diet nudges, Sunday ≥18:00 weekly report (only if thread exists; 90s dedup)
- Safety rails: never diagnoses, never suggests starting/stopping/changing meds, no guilt-tripping, never claims to be AI, replies in patient's language

### C. Records & Results
- **My Lab Reports**: internal hospital reports with parameter tables (result + unit, gender/age-specific normal range, Abnormal/Normal flag, remarks, clinical notes, print) + external lab uploads (PDF/image inline viewer, download via authed proxy, print page, Abnormal badge) + pending tests table (type/urgency/status/fee)
- **Health Records**: upload own documents (≤5MB, MIME whitelist + magic-byte check, 6 categories: Lab Report/Prescription/Test Results/Scan-X-Ray/Vaccination Record/Other), category filter tabs with counts, download, delete, description
- **Medical History**: unified timeline (4 event types + Hospital Stays), filter chips, stat cards
- **Rx Access**: see/approve/reject/revoke doctors' cross-doctor prescription-access requests (Pending/Approved/Rejected/Revoked)
- **Prescription view + print** (per appointment): vitals grid (BP/Temp/Weight/Pulse/SpO2 + custom), medicines with M/A/E + "Nx dose", additional measurements, doctor's advice Q/A pairs

### D. Billing & Insurance
- View IPD bills: amounts grid (Total/Already Paid/Advance Adjusted/Balance Due), status (Draft→Final→Partial→Paid), payment history chips
- **Pay IPD balance online via Razorpay** (create-order → checkout → HMAC verify), success/failure toasts, transaction history (Captured/Pending/Failed/Refunded)
- View OPD bills (read-only — payable at desk)
- **Insurance:** add own policy (company, policyNo, type Individual/Family/Group/Corporate, sum insured, copay %, validUntil), Active/Expired badges, cashless badge
- **Consents:** view consent records (Active/Pending/Expired logic) — read-only

### E. Engagement & Account
- **Rate doctors** (overall + 3 sub-dimensions + review + recommend + anonymous; one rating per booking)
- **Blog:** write/edit/delete own posts (title, content, YouTube link, image URL, Draft/Published, auto permalink) — patients ARE authors
- **Notifications center:** unread badge, tap-to-read, mark-all-read, color-coded by event type
- **Profile:** edit name/mobile/gender, avatar upload (≤2MB jpeg/png/webp), email read-only, member-since
- **Settings:** theme Light/Dark/System, 3 notification toggles (persisted in `User.settingsJson`), logout-all-devices, change password

---

## 5. Status Machines (visible to patient)

| Domain | Flow |
|---|---|
| Appointment | `Pending → Approve → Visited → Finish` (+ `Canceled` [patient/reception], `Rejected`, `NoShow`) |
| Internal lab report | `Ordered → SampleCollected → ResultEntered → Verified` |
| External lab order | `Ordered → InProgress → Completed` (+ `Cancelled`) |
| IPD bill | `Draft → Final → PartiallyPaid → Paid` |
| Gateway txn | `Created → Captured | Failed | Refunded` |
| Rx access request | `Pending → Approved | Rejected`; `Approved → Revoked` |
| Sevika dose | `Pending → Reminded → Taken | Skipped | Snoozed | Missed` |
| Sevika schedule | `Active → Completed | Stopped` |

---

## 6. Realtime & Notification Architecture (patient-relevant)

- **Socket.io service** (port 3006, namespaces `/notif` + `/chat`), rooms `user:{id}`, `role:patient`; 5-min JWT handshake via `/api/auth/socket-token`
- Patient events: `med-reminder`, `dose-missed`, `aturseva-push`, `doctor-online/offline`, `queue-updated`, `queue-paused`, `video-call-started`, `prescription-shared`, `external-report-uploaded`, `referral-reward`, `celebration`
- In-app `Notification` rows + live socket toasts + optional SMS/WhatsApp channels (Twilio-style, per-event templates) + `NotificationLog` telemetry
- Booking chat has its own socket namespace with typing/read receipts
- **No FCM/APNs push backend yet** (RN plan = `expo-notifications` local reminders; server push = future work)
- Web currently polls some data (queue 30s, chat 10s, slots 30s) — RN should prefer sockets

---

## 7. What the patient CANNOT do (by design — keep these constraints in the RN app too)

- No **reschedule** — cancel + re-book only
- No **editing** a booking after creation (disease/slot/mode)
- No booking for family members from patient UI (API accepts relation/age/bloodGroup/weight but web form doesn't expose; reception walk-in uses them)
- Cannot **start** video calls — doctor opens room, patient joins
- Cannot **pay OPD bills online** (Razorpay = IPD only)
- Cannot **create lab orders** — doctor-initiated; patient consumes results
- Cannot see draft prescriptions, other patients' queue names (only tokens), doctor email, lab fee/commission on printouts
- Chat restricted to per-booking threads
- AI never writes data without a human tap; AI cannot cancel bookings (by design)
- Cannot sign/revoke consents (staff-side signing), cannot edit insurance policy in UI (add-only), cannot change email

---

## 8. Known Bugs / Gaps found during THIS audit (fix-before-RN list)

1. **Diet page broken as wired** — `/api/diet-orders` authorizes staff roles only (patient → 401) AND returns `{dietOrders}` while page expects `{diets}`. Needs patient-scoped endpoint + shape fix.
2. **Consents**: patient page is view-only; signing routes authorize staff only (product decision needed: patient e-sign in app?).
3. **Insurance**: no edit/delete in UI (API exists); no patient view of claims/pre-auths.
4. **Two preference systems**: `User.settingsJson` toggles (Settings page) are cosmetic — the notification pipeline actually gates on `NotificationPreference` (separate page). Unify for RN.
5. Blog image = URL-only, no upload; posts publish with no moderation.
6. Notifications page: no pagination UI, no delete/dismiss.
7. Appointments page: no pagination UI (API paginates at 20 default); NoShow has no filter tab.
8. Health Records delete has **no confirmation dialog**.
9. Queue est. wait = flat 10 min/patient heuristic (not schedule-derived).
10. Bills "Contact hospital" link points to appointments page (placeholder UX).
11. Print flows are browser-centric (`window.print()`) — RN needs server-side PDF or share-sheet approach; `/print/lab-report/[id]` is a server-rendered page (reusable via WebView).
12. Razorpay uses web checkout.js — RN must use the Razorpay React Native SDK against same `create-order`/`verify` endpoints.

---

## 9. React Native Readiness (backend reuse — already built-in)

| Concern | Status |
|---|---|
| Auth | ✅ JWT in login response body → Bearer header accepted everywhere (identical verification) |
| Session revoke | ✅ DB-backed sessions — logout-all works for app too |
| APIs | ✅ All patient endpoints are JSON in/out, ownership-scoped (IDOR-resistant 401/403/404) |
| Files | ✅ Authed binary proxy routes (`/api/lab-reports/[id]/file`, `/api/patient/medical-documents/[id]/download`) — RN uses fetch+blob; in-app viewers needed |
| Realtime | ✅ socket-token endpoint exists; `NEXT_PUBLIC_REALTIME_URL` env-driven |
| Voice | ✅ ASR (base64 WAV ≤8MB) + TTS (WAV binary → `expo-av`) REST endpoints |
| AI chat | ✅ SSE streaming (RN: `fetch` + ReadableStream or `react-native-sse`) |
| Payments | ⚠️ Razorpay RN SDK needed (endpoints reusable) |
| Push | ❌ No FCM/APNs backend (future: `expo-notifications` + server push) |
| Existing plan | `PATIENT-APP-PROMPT.md` at repo root (Expo + expo-router + NativeWind + TanStack Query + Zustand + expo-secure-store; prod base URL `https://doctorooms-hms.vercel.app`) |

---

## 10. Recommended Mobile App Screen Map (for Google Stitch design)

> Reference: the uploaded "CardioLife" screenshot (3 screens: dark onboarding hero → light appointment dashboard w/ bottom tabs → doctor detail w/ booking timeline). **Keep its structure & layout patterns; replace red with Doctorooms teal `#0d9488` + Aturseva logo.**

### Bottom tab bar (5 tabs) — mirrors CardioLife pattern
1. **Home** 2. **Appointments** 3. **Aturseva AI** (center, elevated) 4. **Reports/Records** 5. **Profile**

### Screens to design (grouped)

**Onboarding & Auth (3)** — Splash/Onboarding hero (dark teal gradient, logo, "Get Started"); Login (email/password + future mobile OTP hint); Register.

**Home (2)** — Dashboard (greeting + avatar + bell, next-appointment hero card w/ countdown + Join Call CTA, stat grid, quick actions, live queue card, recent activity); Notifications center (list + unread states).

**Appointments (5)** — Doctor search (filters chips + cards); Doctor profile (info, ratings, reviews, schedule, fees, Book CTA); Booking flow (calendar → live slot grid + InPerson/Video toggle + queue-tail option → confirm summary form); Appointments list (status tabs + date filter + cards w/ cancel); Appointment detail (doctor/patient info, **live queue tracker** (token tile, progress, Waiting→Next→Consulting), chat thread, prescription cards, status timeline, rate visit, re-book, video-call banner).

**Aturseva AI (4)** — Full chat window (thread + rich action cards + voice mic + TTS toggle + GPS chip + confirm-to-book card); Check-in card (mood/energy/symptoms); Weekly report (score, day bars, narrative); **Dawai reminders home** (today timeline सुबह/दोपहर/रात, dose actions, catch-up banner, streak, adherence %, medicines list, add/import/photo-RX, slot times, diet plan card).

**Records (5)** — Lab reports hub (stats, hospital reports w/ Verified results + parameter table w/ abnormal flags, external uploads viewer/download, pending tests); Health records vault (upload sheet w/ category picker, document grid, filter chips); Medical history timeline; Rx access requests (approve/reject/revoke); Prescription view (vitals + medicines + advice, share/print).

**Billing (2)** — Bills hub (outstanding/paid summary, IPD bill cards w/ Pay Balance, OPD table, transactions); Payment sheet (Razorpay RN).

**More (6)** — Insurance (policy cards + add policy sheet); Consents (read-only cards); Blog (my posts + editor); Feedback (rating dialog w/ sub-ratings); Profile (edit + avatar); Settings (theme, notification prefs, change password, logout all devices).

**Total ≈ 27 unique screens + global FAB chat sheet (Aturseva mini-chat available on every screen).**

### Design tokens (Doctorooms/Aturseva)
- Primary: **teal `#0d9488`** (web theme color) · hover/dark: teal-700 · accents: emerald (success), amber (pending/warning), rose (danger), violet (token/info)
- Backgrounds: `#F9FAFB` light gray; cards pure white; dark onboarding gradient (teal-900 → teal-700)
- Typography: clean sans (Inter/SF Pro style); H1 28–32 bold, H2 18–20 semibold, body 14, caption 11–12
- Cards: 16px radius, soft shadow; chips pill-shaped; min 44px touch targets; safe-area padding
- Language: UI copy Hinglish-friendly (Sevika/Aturseva speaks Hinglish)

---

*Audit sources: full read of all 33 patient page files, 40+ API routes, `src/lib/aturseva/*` (agent/tools/context/proactive/scheduler/voice), `src/lib/api-auth.ts`, `src/proxy.ts`, `prisma/schema.prisma`, `src/lib/sidebar-config.ts`, realtime-service. Zero files modified — research only.*
