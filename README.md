# Doctorooms2

A comprehensive **Hospital Management System (HMS)** built with Next.js 16 — featuring role-based dashboards for patients, doctors, receptionists, nurses, and administrators, a full PWA experience, real-time notifications, and an AI-powered Doctor Copilot.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style) + Lucide icons
- **Database**: SQLite via Prisma ORM
- **State**: Zustand (client) + TanStack Query (server)
- **Auth**: Custom httpOnly cookie auth (role-based: patient / doctor / reception / nurse / admin)
- **Realtime**: Socket.io mini-services (chat + notifications)
- **PWA**: Service worker with offline support & installable app
- **AI**: Dr Copilot (LLM + vision), TTS/ASR integrations

## Core Modules

### Patient Portal
- Dashboard with appointment stats & history
- Doctor search & appointment booking (slot-based)
- Walk-in registration, health records, blog/posts
- Profile management with avatar upload
- Video call integration

### Doctor Dashboard
- Earnings & analytics dashboard
- Schedule & slot management
- Patient queue with live status
- **6-Step Prescription Wizard** — C/O complaints → Vitals → Diagnosis tables → Medicines → Advice/Suggestions → Print & finalize
- **RX Settings** — master data factory (categories, complaints, questions, suggestions, findings ↔ medicine links, labels, table templates, print layout)
- **Dr Copilot** — AI assistant for clinical summaries & analysis

### Reception & Admin
- Appointment & queue management
- Doctor onboarding & department management
- Holiday / availability calendar
- Lab & diagnostics module

### Realtime & PWA
- Live notification service (unread badges, toasts)
- Chat service (doctor ↔ patient)
- Installable PWA with offline fallback page

## Project Structure

```
src/
  app/            # App Router pages + API routes
  components/     # UI components (shadcn/ui + feature components)
  lib/            # Utilities, db client, auth, socket
prisma/           # Schema & migrations
mini-services/    # Socket.io services (chat :3004, notifications :3005)
public/           # Static assets, PWA manifest, service worker
```

## Getting Started

```bash
# Install dependencies
bun install

# Push database schema
bun run db:push

# Start dev server (port 3000)
bun run dev
```

## Environment

Configuration lives in `.env` (not committed). See `.gitignore` for excluded paths (database, uploads, secrets).

---

**Doctorooms2** — built with ❤️ for modern clinics.
