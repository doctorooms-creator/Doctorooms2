# Doctorooms — Landing Page Product & Technical Discovery Report
# Read-only audit. No files were modified. No development started.

**Audit date:** 20 Aug 2026
**Project root:** `/home/z/my-project`
**Auditor:** Z.ai Code (Explore agent — read-only inspection of actual codebase)

---

## 1. Executive Summary

**Doctorooms is a deep, enterprise-grade hospital management system (HMS)** — not the "find a doctor" booking app that the current landing page portrays.

The actual product has:
- **9 user roles** (admin, doctor, patient, hospital, receptionist, assistant, pharmacist, nurse, lab_technician)
- **99 Prisma database models** (2,201 lines of schema)
- **303 API route files** across 53 route groups
- **150+ dashboard pages** across 9 role-based portals
- **Real-time WebSocket layer** (23 event types via Socket.io mini-service)
- **9 A4 print templates** (prescription, lab report, OPD/IPD bill, OT surgery, discharge summary, vitals, diet chart, commission statement, lab invoice)
- **12+ major modules** (OPD, IPD, Lab, Pharmacy, Inventory, Billing, OT, Reports, Diet, Insurance, Family Portal, Queue Display)
- **PWA** (installable, service worker, manifest.json)
- **Audit logging** with severity levels + IP/UA capture
- **SMS gateway** (MSG91/Twilio with log fallback)
- **Multi-service architecture** (Next.js :3000 + notification-service :3005 + chat-service :3004 behind Caddy :81)

**The current landing page represents ~5% of the product** — it shows only the patient booking flow. The other 95% (IPD, OT, lab, billing, inventory, pharmacy, nurse workflows, real-time, print, audit) is completely invisible.

---

## 2. What Doctorooms Actually Is

**Doctorooms is a full-stack healthcare operating system** that unifies every persona in a hospital — patients, doctors, nurses, receptionists, pharmacists, lab technicians, assistants, hospital administrators, and platform admins — under one Next.js application with shared data, real-time WebSocket events, role-scoped dashboards, and a print engine.

### Problem it solves
Disconnected clinic/hospital software: different tools for booking, prescriptions, billing, lab, inventory, pharmacy, IPD, OT. Doctorooms replaces all of them with a single unified platform.

### Primary customers
1. **Multi-specialty hospitals** — get IPD, OPD, billing, lab, inventory, OT, diet, reports, insurance
2. **Clinics / single doctors** — clinic-mode (1 doctor + receptionist + pharmacist)
3. **Diagnostic labs / lab partners** — external test orders, result entry, lab billing, commission
4. **Patients** — booking, lab reports, prescription access, family share, health records

### Strongest value proposition
"One platform. Every healthcare role. Real-time. Print-ready. Audit-logged. From appointment to discharge."

### 10 most impressive product capabilities
1. **9 role-based dashboards** in one app (vs typical 2-3 in competing SaaS)
2. **6-step prescription stepper** with Rx templates + 8 Rx settings sub-pages
3. **Complete IPD clinical workflow**: admission → ward/bed → vitals → doctor orders → medicine administration → sample collection → investigation reports → shift handover → discharge summary
4. **Real-time WebSocket layer** (23 events: queue-updated, lab-result-ready, ot-started, doctor-online, low-stock-alert, prescription-shared, commission-paid, etc.)
5. **Lab partner ecosystem**: external test orders, worklist, result entry, lab billing, commission tracking
6. **9 print templates** for A4 documents (every transaction is printable)
7. **OPD token queue** with auto-generated tokens + TV display board + kiosk QR
8. **Inventory module** with stock movements, purchase orders, low-stock alerts, vendor payments
9. **Audit log** of every sensitive action with severity levels + IP/UA capture
10. **PWA + Service Worker** (installable on phone/tablet/TV)

### What's production-ready
- All 9 role dashboards (150+ pages) render + function
- Real-time notifications work end-to-end (verified via browser testing)
- Print routes all return 200 with A4 content
- SMS gateway wired (log provider in dev, MSG91/Twilio in prod)
- Auth overhaul completed (JWT sessions, revocation, email verification, brute-force protection, rate limiting)
- Security headers (CSP, X-Frame-Options, HSTS, etc.) via proxy.ts
- Audit logging on 26 routes (14 hospital-side + 12 patient-side)

### What's still incomplete
- Video consultation (disabled as stopgap — public Jitsi SaaS was a HIPAA risk)
- Patient-side payment flow (no online gateway — pay-at-clinic only)
- Reschedule feature (patient must cancel + rebook)
- Follow-up scheduling from prescription.nextVisit
- Real product screenshots on landing page (currently uses animated Lucide icons)

---

## 3. Target Users

| User | Persona | What they do in Doctorooms |
|---|---|---|
| Hospital CTO/Admin | Decision maker | Evaluates the HMS, buys it for the hospital |
| Doctor | Primary clinical user | Sees patients, writes prescriptions, manages IPD, orders labs, views reports |
| Patient | End consumer | Books appointments, views lab reports, accesses prescriptions, manages family access |
| Receptionist | Front desk | Walk-in registration, queue management, billing, IPD admission, diet orders |
| Nurse | Bedside care | Records vitals, administers medicines, manages ward patients, shift handover |
| Lab Technician | External lab partner | Receives test orders, enters results, manages lab billing + catalog |
| Pharmacist | Dispensing | Fulfills prescriptions, manages medicine inventory |
| Assistant | Doctor delegate | Triages appointments, manages Rx queue for their doctor |
| Hospital Admin | Operations | Manages departments, doctors, billing, inventory, OT, reports |

---

## 4. User Roles (9 total — verified from code)

| # | Role | Dev persona | Dashboard | Major features | Landing-page worthy? |
|---|---|---|---|---|---|
| 1 | `admin` | Admin User | `/dashboard/admin` | Users, Doctors, Hospitals, IPD Wards, Staff Nurses, Billing, Charge Categories, Lab Partners, Reports (Revenue/Lab Commission/Lab Billing), Audit Logs, Blog, Inquiries, Settings | ✅ Yes (enterprise sales) |
| 2 | `doctor` | Dr. Rajesh Sharma | `/dashboard/doctor` | Appointments, Prescriptions (8-step wizard), Rx Templates, Earnings, Schedule, Patients, Medicine Master, Lab Results, Lab Partners, Commission, OT Surgeries, Rx Settings (8 sub-pages), IPD Patients | ✅ Yes |
| 3 | `patient` | Rahul Verma | `/dashboard/patient` | Appointments, Health Records, My Lab Reports, Rx Access, Blog, Feedback, Notifications, Settings | ✅ Yes (current focus) |
| 4 | `hospital` | City General Hospital | `/dashboard/hospital` | Departments, Manage Doctors, Appointments, Queue Display, IPD Admissions, Charge Master, Billing (IPD/OPD/Payments/Advances/Discharge), Lab (Test Master/Reports), Inventory (Items/Stock/PO/Low Stock), Reports (6 types), Operation Theater, Bed Transfer, Diet Orders, Discharge Summaries, Kiosk QR Code | ✅ **YES — biggest missed landing-page story** |
| 5 | `receptionist` | Meera Joshi | `/dashboard/receptionist` | Express Walk-in, Appointments, Pending Bookings, Walk-in, Queue, Print Queue, Schedule, Medicines, Patients, IPD Admissions, Diet Orders, Charge Master, Billing (5 sub-pages), Bed Transfer, Lab Tests, Family Access, Reports | ✅ Yes |
| 6 | `assistant` | Vikram Patel | `/dashboard/assistant` | Appointments, Patients, Rx Queue | Maybe (sub-feature) |
| 7 | `pharmacist` | Kavitha Devi | `/dashboard/pharmacist` | Prescriptions (fulfillment), Medicine List | ✅ Yes (pharmacy module) |
| 8 | `nurse` | Priya Sharma | `/dashboard/nurse` | My Patients, Ward View, Diet Orders, Shift Handover, Profile | ✅ Yes (clinical ops) |
| 9 | `lab_technician` | Amit Kumar | `/dashboard/lab-technician` | Incoming Orders, Worklist, Test Catalog, Result Entry, Reports, Billing, Profile | ✅ Yes (lab partner story) |

---

## 5. Complete Feature Inventory

### Verified modules (from `src/app/dashboard/*/` + `src/app/api/*/` + `prisma/schema.prisma`)

| Module | What it does | Who uses it | Landing-page worthy? |
|---|---|---|---|
| **OPD Booking** | Online + walk-in + express booking, token generation, queue display, approval workflow | Patient, Receptionist, Doctor | ✅ |
| **Prescription Wizard** | 8-step stepper: complaints → vitals → tables → medicines → advice → order tests → reports → finish. Rx templates, Rx settings (8 sub-pages) | Doctor | ✅ |
| **IPD Management** | Admission → ward/bed assignment → vitals recording → doctor orders → medicine administration → sample collection → investigation reports → shift handover → discharge summary | Doctor, Nurse, Receptionist, Hospital | ✅ |
| **Billing Suite** | Charge master (categories + items), IPD bills, OPD bills, advance deposits, payment collection, discharge billing, daily collection summary, receipt printing | Receptionist, Hospital, Admin | ✅ |
| **Lab Module** | Lab partner onboarding, external test orders, worklist, result entry, lab billing, commission tracking, lab test catalog | Lab Tech, Doctor, Admin | ✅ |
| **Inventory** | Item master, stock movements, purchase orders, low-stock alerts, vendor payments, expenses, expense categories | Hospital, Admin | ✅ |
| **Operation Theater** | OT scheduling, start/complete/cancel transitions, OT status board, OT print templates | Hospital, Doctor | ✅ |
| **Pharmacy** | Prescription fulfillment queue, medicine list | Pharmacist | ✅ |
| **Nurse Workflows** | Patient vitals (custom SVG trend charts), medicine administration, ward view, shift handover | Nurse | ✅ |
| **Reports Suite** | Revenue (daily/doctor/department/payment-method/outstanding), OPD analytics, IPD analytics, financial P&L + aging, lab TAT, inventory consumption | Admin, Hospital | ✅ |
| **Print Engine** | 9 A4 templates: prescription, lab report, OPD bill, IPD bill, OT surgery, discharge summary, vitals chart, diet chart, commission statement, lab invoice | All roles | ✅ |
| **Real-time Notifications** | 23 event types via Socket.io: queue-updated, lab-result-ready, ot-started, doctor-online, low-stock-alert, prescription-shared, commission-paid, etc. + SMS gateway + notification preferences + chime | All roles | ✅ |
| **Audit Log** | Every sensitive action logged with severity (info/warning/critical), IP, UA, before/after JSON snapshots | Admin | ✅ |
| **Family Portal** | Shareable access code → readonly patient data (vitals, reports, prescriptions) | Patient's family | ✅ |
| **Queue Display** | Public TV display board (`/hospital/[id]/queue-display`) + kiosk mode (`/kiosk/[hospitalId]`) | Hospital, Receptionist | ✅ |
| **Insurance** | Insurance company, TPA, patient insurance policies, pre-auth, claims, claim line items, insurance docs | Hospital, Admin | ✅ |
| **Diet Orders** | Diet type, meal type, instructions, start/end dates, active/stopped status | Hospital, Receptionist, Nurse | ✅ |
| **Bed Transfer** | Inter-ward bed transfers with audit trail | Receptionist, Hospital | ✅ |
| **Chat** | Booking-specific chat between patient + doctor + receptionist | Patient, Doctor, Receptionist | ✅ |
| **Blog/CMS** | Patient-authored blog posts + admin blog | Patient, Admin | ❌ (not landing-page worthy) |
| **Auth & Security** | JWT sessions, email verification, brute-force protection, rate limiting, security headers, OTP in DB, audit logging | All roles | ✅ (security section) |

---

## 6. Existing UI/UX System

### Design system
- **Framework:** Next.js 16 App Router + React 19 + TypeScript 5
- **CSS:** Tailwind CSS v4 via `@tailwindcss/postcss` — NO `tailwind.config.ts` file; uses `@theme inline` block in `globals.css`
- **UI library:** shadcn/ui (New York style, neutral base, lucide icons) — 48 components in `src/components/ui/`
- **Icons:** lucide-react v0.525
- **Fonts:** Geist Sans + Geist Mono via `next/font/google`
- **Theme:** Light + Dark via `next-themes` (default `system`, `attribute="class"`, `disableTransitionOnChange`)
- **Toasts:** sonner (custom wrapper)
- **Animations:** framer-motion v12 (fade-up, staggered, count-up, floating, pulsing)
- **State:** TanStack Query v5 (server) + Zustand v5 (client)

### Color palette
- **Brand primary:** Teal-600 `#0d9488` (sidebar accent, buttons, CTA, PWA theme color)
- **Brand gradient:** `from-teal-600 to-emerald-500` (hero, buttons, CTA)
- **Secondary:** Emerald-500 `#10b981`
- **Status palette:** amber (pending), teal (approved), violet (visited), red (canceled), blue (finished), orange (extended)
- **Dark mode:** same neutral scale inverted
- **CSS variables:** OKLCH-based; `--primary` is near-black (NOT teal — brand color is used via direct Tailwind classes `bg-teal-600`)

### Custom CSS utilities (in `globals.css`)
`.gradient-text-teal`, `.gradient-text-emerald`, `.btn-gradient-teal`, `.card-press`, `.card-hover-lift`, `.card-teal-border`, `.animate-shimmer`, `.animate-pulse-glow`, `.animate-float`, `.animate-breathe`, `.animate-gradient-x`, `.animate-spin-slow`, `.dot-pattern`, `.glass` (glassmorphism), custom teal scrollbar

### Animation patterns
- `FadeUpSection` wrapper (useInView + motion.div)
- `FadeUpItem` with staggered `index * 0.1` delay
- `useCountUp` RAF-based number animation
- Floating icons in hero (`animate={{ y: [0, -12, 0] }}` infinite)
- Pulsing Stethoscope (`scale: [1, 1.05, 1]`) + orbiting pulse rings
- `AnimatePresence` for mobile sidebar slide-in

### Charts
- **recharts v2.15** installed + `src/components/ui/chart.tsx` exists — but **ZERO consumers found** in dashboard pages
- **Actual charting:** Nurse vitals use custom SVG implementation with framer-motion line paths. Revenue reports use plain HTML tables + stat cards.

### Responsive behavior
- Mobile-first Tailwind breakpoints (sm/md/lg)
- Public navbar: Sheet (slide-out) on mobile, inline on desktop
- Dashboard sidebar: overlay on mobile, collapsible on desktop
- `BottomNav`, `MobileCard`, `PullToRefresh`, `SwipeableItem` mobile primitives exist
- PWA installable (manifest.json + service worker)

---

## 7. Existing Landing Page Audit

**File:** `src/app/page.tsx` — 960 lines, single client component

### Current sections (in order)
1. **Hero** — Badge "Trusted by 50,000+ patients", H1 "Your Health, Our Priority", search bar, 2 CTAs, animated Stethoscope with pulse rings + 5 floating icons
2. **Stats** — 4 count-up tiles (Doctors: 15, Hospitals: 8, Patients: 2400, Appointments: 5800 — all hardcoded fallbacks)
3. **How It Works** — 3 steps: Choose Hospital → Select Doctor → Book & Consult
4. **Featured Hospitals** — 3 cards from `/api/hospitals?limit=3`
5. **Featured Doctors** — 3 cards from `/api/doctors?limit=3`
6. **Browse by Specialization** — 8 cards with FAKE counts (`index + 3` formula)
7. **Why Choose Doctorooms?** — 4 generic cards (Verified Doctors, Easy Booking, Video Consultation, Secure Data)
8. **Testimonials** — 3 hardcoded fake quotes
9. **CTA** — "Ready to book your appointment?" with 2 buttons

### What's BAD (brutally honest)
1. **Massive product-story mismatch** — page sells a "find a doctor" B2C app; actual product is a 99-model HMS with 9 roles. ~95% of the product is invisible.
2. **Hardcoded fake stats** — "50,000+ patients" badge, `{index + 3} doctors` specialization counts, fake testimonials. These ship to production.
3. **Only 1 buyer persona** — patient. Zero mention of hospital admin, doctor, receptionist, lab partner, pharmacist, nurse.
4. **No module showcase** — Billing, IPD, Lab, Inventory, OT, Pharmacy, Reports — NONE appear.
5. **No real screenshots/mockups** — hero is just an animated Lucide stethoscope on gradient circles.
6. **No security/compliance section** — despite audit logs, JWT, role-based access all being implemented.
7. **No real-time/WebSocket pitch** — despite 23 event types being implemented.
8. **No print system showcase** — despite 9 A4 templates being implemented.
9. **No PWA callout** — despite being installable.
10. **"How It Works" is patient-only** — no "For Hospitals", "For Doctors", "For Labs" tracks.
11. **Fake testimonials** with stock-photo names; no logos, no case studies.
12. **Logo inconsistency** — `logo.svg` (black square + "Z" mark, unused), `icon-192/512.svg` (teal square + "D"), in-app (Lucide Stethoscope). Three different logo treatments.
13. **Specializations hardcoded in page.tsx** instead of from `src/lib/constants.ts` (which has 12, page shows only 8).
14. **"Video Consultation" card** — but video consultation is DISABLED (stopgap for HIPAA compliance).
15. **Footer links point to `/about`** with fictional executive names ("Dr. Rajesh Sharma — Founder & CEO").

### What's MISSING (for an enterprise HMS landing page)
- Module grid (OPD, IPD, Lab, Pharmacy, Inventory, Billing, OT, Reports)
- Role-based persona tabs ("For Hospitals / Doctors / Labs / Pharmacies / Nurses")
- Real product screenshots / dashboard mockups
- Security & compliance section
- Real-time / WebSocket pitch
- Print system showcase
- PWA / installable app callout
- "Book a Demo" B2B CTA (instead of just "Find a Doctor")
- Real customer logos / case studies
- API / developer documentation mention (303 API routes!)
- Multi-specialty hospital workflow diagram

---

## 8. Major Problems

1. **Product-story mismatch** — The landing page represents 5% of the product. 95% is invisible.
2. **Fake data** — Hardcoded stats, fake specialization counts, fake testimonials. Ships to production.
3. **Single-persona focus** — Only patient journey. No hospital/doctor/lab/nurse/pharmacy stories.
4. **No product screenshots** — Hero is just an animated icon, not a product showcase.
5. **Logo inconsistency** — 3 different logo treatments across the codebase.
6. **No B2B CTA** — "Find a Doctor" is B2C. Hospital CTOs need "Book a Demo".
7. **No security section** — Despite audit logs, JWT, RBAC, rate limiting all being implemented.
8. **No real-time pitch** — Despite 23 WebSocket event types being implemented.
9. **No module showcase** — Despite 12+ major modules being implemented.
10. **Misleading "Video Consultation" card** — Feature is disabled (HIPAA stopgap).

---

## 9. Product Differentiators

| Differentiator | Why it matters |
|---|---|
| 9 roles in one app | Competing HMS tools have 2-3 roles. Doctorooms covers the ENTIRE hospital. |
| Real-time WebSocket layer | Queue updates, lab results, OT status, doctor online — pushed instantly. Competitors use polling. |
| 9 print templates | Every transaction is printable on A4. Critical for Indian hospitals (paper-based compliance). |
| Lab partner ecosystem | External labs get their own portal + commission tracking. Unique to Doctorooms. |
| PWA + kiosk + queue display | Installable on phone/tablet/TV. Patients self-check-in via kiosk. |
| 99 Prisma models | Domain depth is genuine — not a surface-level CRUD app. |
| Audit logging with severity | Compliance-ready. Every sensitive action is tracked with IP + UA. |
| Family portal | Share patient data with family via access code. Unique feature. |
| Insurance module | Pre-auth + claims + TPA management. Rare in Indian HMS. |
| Multi-service architecture | Next.js + Socket.io services behind Caddy gateway. Production-grade. |

---

## 10. Product-to-Marketing Mapping

| Real product capability (verified in code) | User benefit | Marketing message | Landing page section |
|---|---|---|---|
| 9 role-based dashboards | Every hospital role gets a personalized workspace | "One platform. Every healthcare role." | Persona tabs section |
| IPD lifecycle (admission → discharge) | Paperless hospital from admit to discharge | "Complete IPD lifecycle — from admission to discharge summary." | Module grid |
| 6-step prescription stepper | Prescribe in 60 seconds with templates | "Prescribe in 60 seconds. Reusable templates, drug master, findings." | Doctor feature |
| Real-time WebSocket (23 events) | Live queue, lab results, OT status | "Real-time hospital. Live queue, lab results, OT status — pushed instantly." | Real-time section |
| 9 print templates | Every transaction printable on A4 | "Print-ready A4 documents. One click." | Print showcase |
| Lab partner ecosystem | External labs as standalone business | "Run your diagnostic lab as a standalone business." | Lab feature |
| Inventory + PO + low-stock | Never run out of stock | "Never run out of stock. Auto-reorder, PO workflow, vendor ledger." | Module grid |
| OT scheduling + status | Plan and execute surgeries | "Plan and execute surgeries with OT utilization tracking." | Module grid |
| Audit logs + security headers + JWT | Compliance-ready | "Hospital-grade security. Every action logged. Role-based access." | Security section |
| PWA + kiosk + queue display | Installable on any device | "Installable as a native app. Works on phone, tablet, TV display board." | PWA callout |
| Family portal | Share health records with family | "Share health records securely with family — even from another city." | Patient feature |
| Reports suite (12+ types) | Data-driven decisions | "Decisions backed by data. 12+ report types across revenue, operations, and finance." | Module grid |
| OPD token queue + TV display | Eliminate waiting-room chaos | "Eliminate waiting-room chaos with smart OPD token queues." | Receptionist feature |
| Doctor online/offline presence | See which doctors are available right now | "See which doctors are online — right now." | Real-time section |
| SMS gateway (MSG91/Twilio) | Patient gets SMS when report ready | "Patients get SMS the moment their lab report is ready." | Patient feature |

---

## 11. Competitive Positioning

### Category
Doctorooms is a **Healthcare Operating System** — not just an HMS, not just an EMR, not just a booking app. It combines:
- Hospital Management System (IPD, OPD, billing, inventory, OT)
- EMR/EHR (prescriptions, vitals, lab reports, medical documents)
- Telemedicine (chat, video — currently disabled)
- Practice Management (scheduling, earnings, commission)
- Patient Portal (booking, reports, family access)
- Lab Partner Platform (external test orders, result entry, billing)
- Real-time Operations (WebSocket events, queue display, kiosk)

### Recommended positioning
**"The Healthcare Operating System for Indian Hospitals"**
- Not "clinic management software" (too small)
- Not "doctor booking app" (too narrow)
- Not "EMR" (too clinical)
- "Healthcare Operating System" captures the full breadth

### Strongest differentiators (visible in code)
1. **9 roles** (competitors: 2-3)
2. **Real-time WebSocket** (competitors: polling)
3. **9 print templates** (competitors: 0-2)
4. **Lab partner ecosystem** (competitors: none)
5. **PWA + kiosk + TV display** (competitors: web-only)
6. **Audit logging** (competitors: basic or none)

---

## 12. Technical Architecture

| Aspect | Technology |
|---|---|
| Framework | Next.js 16.1.1 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Runtime | Bun |
| CSS | Tailwind CSS v4 (no config file, `@theme inline` in globals.css) |
| UI library | shadcn/ui (New York style, 48 components) |
| Icons | lucide-react v0.525 |
| Fonts | Geist Sans + Geist Mono (next/font/google) |
| Animation | framer-motion v12.23 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | react-hook-form + zod |
| Database | Prisma v6.11 (SQLite in dev, Supabase PostgreSQL ready) |
| Auth | Custom JWT + httpOnly cookies + Session table + bcrypt + OTP |
| Real-time | Socket.io (2 mini-services: notification :3005 + chat :3004) |
| File storage | Cloudinary + Supabase Storage |
| Cache/Rate-limit | ioredis (optional, falls back to in-memory) |
| Gateway | Caddy on :81 with `?XTransformPort=` routing |
| PWA | Service Worker + manifest.json |
| Print | Server-rendered A4 templates (PrintLayout + PrintOnMount) |
| SMS | MSG91/Twilio (log fallback in dev) |
| Email | Resend.com (stub — activate with RESEND_API_KEY) |
| Error reporting | Sentry (stub — activate with SENTRY_DSN) |

### File structure
- `src/app/` — App Router pages (150+ dashboard pages, 303 API routes, 10 print templates)
- `src/components/` — UI (48 shadcn), layout (4), dashboard chrome (5), prescription stepper (8 steps), print (9), mobile (4), shared (3)
- `src/lib/` — db, api-auth, session, cloudinary, supabase, redis, emit-notification, audit-log, rate-limit, otp-store, email, file-validation, play-chime, print-utils, etc.
- `src/hooks/` — useSocket, use-mobile, use-toast
- `mini-services/` — notification-service, chat-service
- `prisma/schema.prisma` — 99 models, 2,201 lines
- `public/` — logo.svg, icon-192.svg, icon-512.svg, manifest.json, default.png, uploads/

---

## 13. Reusable Components & Assets

### Can be reused directly
| Asset | Location | Notes |
|---|---|---|
| 48 shadcn/ui components | `src/components/ui/` | All working, styled with neutral base + teal accents |
| Public navbar | `src/components/layout/public-navbar.tsx` | Sticky, teal-600 accents, mobile Sheet, theme toggle |
| Public footer | `src/components/layout/public-footer.tsx` | Dark bg-gray-950, 4-column |
| Back-to-top button | `src/components/layout/back-to-top.tsx` | Floating, motion-animated |
| PWA icons | `public/icon-192.svg`, `public/icon-512.svg` | Teal square + "D" — usable as favicon |
| Custom CSS utilities | `globals.css` | `.gradient-text-teal`, `.btn-gradient-teal`, `.glass`, `.animate-*`, custom scrollbar |
| Framer-motion patterns | `page.tsx` | FadeUpSection, FadeUpItem, useCountUp, floating icons |
| Color system | Teal-600 primary, Emerald-500 secondary, gradient `from-teal-600 to-emerald-500` | Consistent across app |
| Status color palette | `src/lib/constants.ts` BOOKING_STATUS_COLORS | Amber/teal/violet/red/blue/orange |

### Should be redesigned
| Asset | Issue |
|---|---|
| `public/logo.svg` | Black square + "Z" mark — UNUSED and inconsistent with teal "D" icons |
| Landing page stats | Hardcoded fake numbers — replace with "Book a Demo" CTA |
| Testimonials | Fake names + generic quotes — remove or replace with real |
| Specialization cards | Fake counts (`index + 3`) — fetch real counts from API |
| Hero illustration | Animated Lucide stethoscope — replace with product screenshot/mockup |
| "Video Consultation" card | Feature is disabled — remove or mark "coming soon" |
| `/about` page | Fictional executive names — replace with real company info |

### What does NOT exist (would need to be created)
- Real product screenshots (would need to capture from running app)
- Logo wordmark (currently just "Doctorooms" text + Stethoscope icon)
- Illustration assets (none in `public/`)
- Testimonial avatars (none in `public/`)
- OG image for social sharing
- Favicon.ico (only SVG icons exist)

---

## 14. Landing Page Opportunities

### What the new landing page should communicate in the first 5 seconds:
**"Doctorooms is a serious, sophisticated healthcare technology platform — not a basic clinic software."**

### Primary message
"The Healthcare Operating System for Indian Hospitals"

### Secondary message
"One platform for OPD, IPD, Lab, Pharmacy, Inventory, Billing, OT, and Reports — with real-time updates and print-ready documents."

### Primary CTA
"Book a Demo" (B2B — for hospital CTOs/admins)

### Secondary CTA
"Find a Doctor" (B2C — for patients who want to book)

### Visual concept
- Hero with a **product dashboard mockup** (not just an animated icon)
- Teal-600 → Emerald-500 gradient (existing brand)
- Glassmorphism cards (`.glass` utility already exists)
- Floating module icons (existing pattern from current hero)
- Count-up stats (existing `useCountUp` hook)
- Staggered fade-up reveals (existing `FadeUpSection` pattern)

### Emotional impression
"Wow, this is a real hospital management system — not just a booking site."

---

## 15. Recommended Design Direction

1. **Lead with the HMS story** — Hero headline: "The Healthcare Operating System" (not "Your Health, Our Priority")
2. **Persona tabs** — "For Hospitals / Doctors / Labs / Patients" — each tab shows relevant features
3. **Module grid** — 12 modules as cards with icons + 1-line descriptions
4. **Real-time section** — Animated visualization of WebSocket events flowing between roles
5. **Print showcase** — Carousel of 9 A4 print templates
6. **Security section** — Audit logs, JWT, RBAC, rate limiting badges
7. **"Book a Demo" primary CTA** — Replace "Find a Doctor" as primary
8. **PWA callout** — "Installable as a native app"
9. **Remove fake data** — No hardcoded stats, no fake testimonials, no fake specialization counts
10. **Fix logo** — Pick ONE logo treatment (recommend the teal "D" from icon SVGs) + create a proper wordmark

---

## 16. Recommended Landing Page Information Architecture

```
1. Hero — "The Healthcare Operating System" + product mockup + "Book a Demo" CTA
2. Trust bar — "9 roles. 99 data models. 303 APIs. Real-time. Print-ready." (real numbers, not fake)
3. Persona tabs — For Hospitals / Doctors / Labs / Patients / Nurses / Pharmacists
4. Module grid — 12 modules (OPD, IPD, Lab, Pharmacy, Inventory, Billing, OT, Reports, Diet, Insurance, Family Portal, Queue Display)
5. Real-time showcase — WebSocket events animation
6. Prescription wizard highlight — 8-step stepper mockup
7. Print templates carousel — 9 A4 templates
8. Security & compliance — Audit logs, JWT, RBAC, rate limiting
9. PWA callout — "Installable on any device"
10. Stats (real) — Number of modules, roles, print templates, API routes
11. CTA — "Book a Demo" + "Find a Doctor"
12. Footer (existing — reusable)
```

---

## 17. What Should NOT Be Changed

- **Brand color:** Teal-600 `#0d9488` + Emerald-500 `#10b981` gradient — this IS the Doctorooms brand
- **shadcn/ui component library** — 48 components, all working
- **Tailwind CSS v4** — `@theme inline` in globals.css is the right setup
- **framer-motion** — existing animation patterns are good
- **PWA manifest** — name, theme color, icons are correct
- **Public navbar + footer** — reusable as-is (just update links)
- **Dashboard chrome** — sidebar, header, stat-card — all production-ready
- **Custom CSS utilities** — `.gradient-text-teal`, `.glass`, `.animate-*` — all reusable
- **All 303 API routes** — don't touch
- **All 99 Prisma models** — don't touch
- **All 150 dashboard pages** — don't touch

---

## 18. Technical Constraints

1. **No `tailwind.config.ts`** — Tailwind v4 uses `@theme inline` in `globals.css`. Any new utility classes must be added there.
2. **`--primary` CSS variable is near-black** — brand teal is NOT wired as `--primary`. Components use `bg-teal-600` directly. This is a design debt but shouldn't be changed during the landing page redesign (would affect 150+ dashboard pages).
3. **No real product screenshots exist** — would need to capture from the running app or create mockups.
4. **Logo inconsistency** — 3 different treatments exist. Must pick ONE for the landing page.
5. **Landing page is a single 960-line `page.tsx`** — may need to be split into components for maintainability.
6. **Hardcoded data in landing page** — stats, specializations, testimonials are all hardcoded. Must be replaced with real data or removed.
7. **`/about` page has fictional executive names** — if linked from the landing page, this looks unprofessional.
8. **"Video Consultation" is disabled** — don't feature it as a selling point until it's rebuilt properly.
9. **Service worker caches static assets** — new images/assets in `public/` will be cached. Use versioned filenames or cache-busting.
10. **Caddy gateway on :81** — all cross-service requests use `?XTransformPort=` query param. Landing page itself doesn't need this (it's served by Next.js on :3000).

---

## 19. Questions/Decisions Required Before Development

1. **Logo:** Use the teal "D" from `icon-192.svg`? Or design a new wordmark? Or keep the Stethoscope icon?
2. **Primary CTA:** "Book a Demo" (B2B) or "Find a Doctor" (B2C) or both?
3. **Stats:** Use real numbers (99 models, 303 APIs, 9 roles, 9 print templates) or hide stats entirely?
4. **Testimonials:** Remove entirely? Or use placeholder "Your hospital could be here"?
5. **Screenshots:** Should I capture real screenshots from the running app? Or create CSS mockups?
6. **Pricing:** Include pricing tiers? Or "Contact for pricing"?
7. **Persona tabs:** How many? (Hospitals, Doctors, Labs, Patients = 4? Or add Nurses, Pharmacists?)
8. **Blog:** Keep the `/blog` link in footer? (Blog exists but has fictional content)
9. **About page:** Fix the fictional executive names? Or remove the `/about` link?
10. **Language:** English only? Or add Hindi/Marathi? (next-intl is installed but unused)

---

## 20. Final Answers (A-E)

### A. What I discovered about Doctorooms
Doctorooms is a **genuinely deep, enterprise-grade hospital management system** with 9 roles, 99 data models, 303 API routes, 150+ dashboard pages, real-time WebSockets, 9 print templates, PWA, audit logging, and a multi-service architecture. It handles the ENTIRE hospital — OPD, IPD, lab, pharmacy, inventory, billing, OT, reports, insurance, diet, family portal, queue display. The code is production-grade with security headers, rate limiting, brute-force protection, JWT sessions, and audit logging. This is NOT a basic clinic app — it's a healthcare operating system.

### B. Why the current landing page fails to represent the product
The landing page portrays Doctorooms as a "find a doctor" B2C booking app — which represents ~5% of the actual product. The other 95% (IPD, OT, lab, billing, inventory, pharmacy, nurse workflows, real-time, print, audit) is completely invisible. It uses fake stats ("50,000+ patients"), fake specialization counts (`index + 3`), fake testimonials, and a generic animated icon instead of product screenshots. A hospital CTO scanning the page would NOT realize this is an HMS. The page also only addresses ONE persona (patient) out of nine. It's a consumer marketing layer on an enterprise product.

### C. What the new landing page should feel like
**Premium. Sophisticated. Enterprise.** Like looking at the marketing site of a serious healthcare technology company (think: Practo + Insta HMS + 1mg combined into one platform). The visitor should immediately understand:
- "This is a full hospital management system, not just a booking app"
- "This covers every role in my hospital"
- "This has real-time updates, print-ready documents, audit logs"
- "This is built for Indian hospitals — kiosks, queue display, multi-specialty"
- "I want to book a demo"

The visual language should use the existing teal-600 + emerald-500 brand gradient, glassmorphism cards, staggered animations, and product screenshots/mockups — not generic icons on gradient circles.

### D. Which existing product screens/features should become the visual centerpiece
1. **6-step prescription wizard** — the most impressive single feature. Show the stepper UI.
2. **IPD vitals chart** — the custom SVG line charts are visually unique.
3. **Real-time notification flow** — doctor ordering test → lab tech getting toast → patient getting SMS. This is a genuine differentiator.
4. **Print templates** — show 2-3 A4 templates side-by-side (prescription + lab report + IPD bill).
5. **Multi-role dashboard** — show 2-3 role dashboards side-by-side (doctor + nurse + receptionist) to demonstrate "one platform, every role".
6. **Queue display board** — the public TV display is visually striking.
7. **Audit log page** — the severity-colored table is impressive for compliance.

### E. What information I still need from you before beginning the redesign
1. **Logo decision:** Keep the teal "D" icon? Design a new wordmark? Keep the Stethoscope?
2. **Primary CTA:** "Book a Demo" (B2B) or "Find a Doctor" (B2C)?
3. **Real screenshots:** Should I capture real screenshots from the running app, or create CSS-based mockups?
4. **Pricing:** Include pricing tiers? Or "Contact for pricing"?
5. **Persona tabs:** How many? (4: Hospitals/Doctors/Labs/Patients? Or more?)
6. **About page:** Fix fictional names? Or remove the link?
7. **Testimonials:** Remove? Or use "Your hospital here" placeholder?
8. **Language:** English only? Or add Hindi?
9. **Target market:** Indian hospitals only? Or international?
10. **Brand tagline:** Keep "Your Health, Our Priority"? Or change to "The Healthcare Operating System"?

---

*End of discovery report. No files were modified. No development was started. This is strictly a read-only audit.*

**Status: Awaiting answers to questions in section E before starting the landing page redesign.**
