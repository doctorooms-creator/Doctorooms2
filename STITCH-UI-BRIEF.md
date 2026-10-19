# ATURSEVA PATIENT APP — COMPLETE UI/UX DESIGN BRIEF
### For Google Stitch — React Native Mobile App (Patient Side Only)
**Product:** Aturseva, a Doctorooms product · Indian healthcare app · Hinglish-friendly copy
**Platform:** Mobile (React Native) · Light theme primary + dark onboarding
**How to use this file:** Feed Section 2 (design system) once, then generate screens from Section 4 one-by-one (each screen block is a self-contained Stitch prompt). Use Section 5 to validate flows.

---

## 1. WHAT THIS APP IS

Aturseva is an AI health companion + hospital care app for Indian patients. The patient uses it to:
- Find doctors and book appointments (in-person or video)
- Track their live hospital queue position (token system, like Indian OPD queues)
- Chat with an AI nurse ("Aturseva") in Hinglish — with voice input/output
- Get medicine ("dawai") reminders with streaks and weekly reports
- View lab reports, prescriptions, medical history, health records
- Pay hospital bills online (Razorpay)
- Manage insurance, consents, blog, doctor ratings, profile

**Target user:** Indian patient, 18–70, mixed English/Hindi (Hinglish) comfort, phone-first.
**Logo:** Aturseva monochrome logo (geometric "A" mark) — renders in teal.
**Reference note:** Layout patterns may follow a modern healthcare reference (bottom tab bar, filter chips, doctor cards) but ALL colors/branding are Aturseva teal — never red.

---

## 2. DESIGN SYSTEM (feed this to Stitch first)

### Colors
| Token | Value | Usage |
|---|---|---|
| Primary | Teal `#0d9488` | Buttons, active tabs, links, brand accents |
| Primary Dark | Teal-700 `#0f766e` | Pressed states, gradient ends |
| Primary Deep | Teal-900 `#134e4a` | Onboarding gradient start, dark hero cards |
| Success | Emerald-600 `#059669` | Approved, Paid, Verified, Completed statuses |
| Warning | Amber-500 `#f59e0b` | Pending, In-Progress, snoozed statuses |
| Danger | Rose-600 `#e11d48` | Cancelled, Rejected, Failed, Abnormal flags |
| Info | Violet-600 `#7c3aed` | Token numbers, info badges |
| Background | `#F9FAFB` light gray | App background |
| Surface | `#FFFFFF` white | Cards |
| Text Primary | `#111827` near-black | Headings, body |
| Text Secondary | `#6B7280` medium gray | Metadata, captions, timestamps |

### Typography (clean sans-serif, e.g. Inter)
- H1 Screen title: 24–28px Bold
- H2 Section/Card title: 18px SemiBold
- H3/Name: 16px SemiBold
- Body: 14px Regular
- Caption/Meta: 11–12px Regular gray

### Components & Style
- **Cards:** white surface, 16px corner radius, soft shadow (2–4px, 8% opacity), 16px padding
- **Chips/Pills:** fully rounded, 12px text — filter chips (active = teal fill + white text; inactive = white fill + gray text + light border)
- **Status pills:** small rounded pills with tinted backgrounds (emerald/amber/rose/teal/violet, 10–12% tint + colored text)
- **Buttons:** primary = teal fill, white text, 14px radius, 48px min height; secondary = white fill, teal text + teal border; destructive = rose
- **Bottom navigation:** floating rounded pill bar (5 tabs), active tab = teal icon + teal fill circle behind icon + small label; center tab (Aturseva AI) is elevated/highlighted
- **List rows/cards:** avatar circle (40px) + name + subtitle + right-side status/meta
- **Touch targets:** minimum 44–48px
- **Safe area:** respect top notch + bottom home indicator
- **Micro-interactions:** subtle — shimmer skeletons while loading, gentle fade/slide on card appear
- **Empty states:** friendly icon + one-line title + one-line subtitle + CTA button
- **Chat bubbles:** patient = teal fill white text right-aligned; AI = white card left-aligned with small avatar; timestamps 10px gray

### Voice/AI affordances (unique to this app — must feel prominent)
- Mic button (voice input): circular teal button with mic icon; while recording shows waveform + timer (max 0:45)
- Speaker toggle "Bol kar jawab" (speak the answer): speaker icon toggle in chat header
- AI cards inside chat: white cards with teal left border, title + structured rows + action button

---

## 3. NAVIGATION ARCHITECTURE

### Bottom Tab Bar (5 tabs)
| Tab | Label | Icon | Notes |
|---|---|---|---|
| 1 | Home | House | Dashboard |
| 2 | Appointments | Calendar | List + booking entry |
| 3 | **Aturseva AI** | Sparkles | CENTER tab, elevated teal circle — full AI chat |
| 4 | Records | FileText | Lab reports, health records, history, Rx access |
| 5 | Profile | User | Profile, bills, insurance, consents, blog, settings |

### Global element
**Aturseva FAB (floating action button):** small circular teal button with sparkles icon, bottom-right above the tab bar, present on EVERY screen except the AI chat screen. Opens a mini AI chat sheet (bottom sheet, 70% height) sharing the same conversation.

### Screen hierarchy (~27 screens)
```
Onboarding → Login / Register / Forgot Password
Home: Dashboard, Notifications
Appointments: Doctor Search, Doctor Profile, Booking Flow (2 steps), Appointments List, Appointment Detail
Aturseva AI: AI Chat, Check-in Card (in chat), Weekly Report (in chat), Dawai Reminders Home
Records: Lab Reports Hub, Lab Report Detail, Health Records Vault, Medical History Timeline, Rx Access
Profile tab: Profile & Edit, My Bills, Payment Sheet, Insurance + Add Policy, Consents, My Blog + Editor, Feedback, Settings, Change Password
```

---

## 4. SCREEN-BY-SCREEN SPEC (each block = one Stitch prompt)

### 4.1 Onboarding / Splash
**Purpose:** First-open brand moment.
- Dark gradient background (teal-900 → teal-700)
- Aturseva logo (white "A" mark) center-top with app name + tagline
- Hero: soft illustration of a caring nurse/heart + subtle pulse line
- Headline: "Aapki Sehat, Apni Sevika" (Hinglish) with "Sevika" in lighter teal
- Sub: "AI nurse · doctor appointments · dawai reminders · reports — sab ek app mein"
- Primary CTA pill button: "Get Started →" (white/translucent with white border)
- Small links: "Login" / "Create Account"

### 4.2 Login
- Light background, logo top
- Email field, Password field (eye toggle)
- Primary button "Login"
- Links: "Forgot password?" · "New here? Create account"
- Error state: inline red text on wrong credentials + "account locked, try after 15 min" after repeated failures
- Loading: button spinner

### 4.3 Register
- Fields: Full name*, Email*, Mobile number* (10-digit, +91 prefix), Gender* (Female/Male/Other chips), Password* (≥6), Confirm password
- Optional: referral code field (collapsible "Have a referral code?")
- Primary button "Create Account"
- Note under mobile: "Isi number pe walk-in appointments bhi link honge"
- Success → auto-login → Dashboard

### 4.4 Forgot Password
- Email → "OTP bhej diya" state → OTP 6-digit boxes → New password → Success

### 4.5 HOME DASHBOARD
**Purpose:** The patient's daily home — "what's happening now".
Layout (top → bottom):
1. **Header row:** circular avatar (tap → Profile) + "Namaste, Aditya 👋" (H1 20px) + right side bell icon with red unread dot
2. **Next Appointment Hero Card** (teal gradient card, white text): doctor avatar circle + doctor name + specialization; "Next Appointment" label; row of chips: countdown ("Today at 18:00" / "Tomorrow" / "in 3 days"), date ("Mon, 21 Oct"), time ("10:00 – 10:30"), mode ("In Person" / "Video Call" with video icon); status pill (Pending=amber / Approved=emerald); buttons: "View Details" (white outline) + "Join Video Call" (white fill teal text, only when active)
3. **Live Queue Card** (white card, only on appointment day): big token tile "Your Token: 12" (violet), "#3 in queue" bold, "2 patients ahead", "~20 min wait" caption, thin teal progress bar (65%), step dots: Waiting → Next → Consulting (active step teal, done steps filled); special state: "🎉 It's your turn!" (emerald highlight)
4. **Stat grid (2×2):** Upcoming Appointments (4), Completed Visits (12), Total Doctors (3), Medical Documents (7) — white cards, teal icon, bold number, gray label
5. **Quick Actions row (4 circular buttons + labels):** Book Appointment (calendar-plus), Upload Document (upload), My Reports (file), Give Feedback (star)
6. **Upcoming Appointments list** (section header "Upcoming" + "View All →"): row cards — doctor avatar + name + specialization + disease chip + token badge + date + status pill; tap → Appointment Detail
7. **Recent Activity feed:** small rows with icon + "Appointment with Dr. Anita — Approved" + relative time ("2h ago")
**Empty state (no appointments):** dashed-border card "No upcoming appointments — Find a doctor and book your visit" + teal "Book Appointment" button

### 4.6 NOTIFICATIONS
- Header "Notifications" + "Mark all read" text button
- Cards: icon + title + message + relative time; unread = teal left border + soft teal tint; tap → mark read (tint fades)
- Color coding: Consultation Started (teal), Consultation Complete (emerald), Turn Approaching (amber "Aapki baari aa rahi hai!"), Wait Extended (orange), Cancelled (rose), Medicine Reminder (violet)
- Empty state: bell icon + "No notifications yet"

### 4.7 DOCTOR SEARCH
- Header "Find Doctors" + search bar (rounded, search icon, debounce)
- Filter chips row (horizontal scroll): Specialization (All, Cardiologist, Pediatrician, Dermatologist…), City, State
- Doctor result cards: avatar + name + specialization + city + "₹500 · 12 yrs exp" + star rating (4.6 ★) + teal "Book" chip button
- Loading: shimmer cards; Empty: "No doctors found — try changing filters"

### 4.8 DOCTOR PROFILE
- Hero: large avatar, name, specialization, city
- Info card: experience, fees (₹), hospital name + address, languages
- Rating card: 4.6 big + star distribution + review list (patient name/avatar + stars + text + date)
- Weekly schedule card: day rows (Mon–Sat) with time ranges
- Sticky bottom bar: "Book Appointment" (primary teal, full width)

### 4.9 BOOKING FLOW — STEP 1: SELECT DATE
- Header "Book Appointment" + back arrow
- Doctor mini-card (avatar + name + ₹ fee)
- Month calendar grid: past dates + non-working days disabled (strikethrough); today outlined; selected date = teal circle
- Holiday warning banner (amber): "Doctor is on holiday on this date"
- Continue button (disabled until date picked)

### 4.10 BOOKING FLOW — STEP 2: SELECT SLOT & MODE
- Doctor mini-card + selected date chip
- **Mode toggle:** two segmented chips — "In Person" (building icon) / "Video Call" (video icon), teal active
- **Slot grid:** time chips (e.g. 09:00, 09:30…) in 3–4 columns — free = white + teal border (tap = teal fill), taken = gray struck-through, past = faded; auto-picked next free slot shows tiny "Auto" amber tag
- Alternative option card: "No fixed time — join queue" (hourglass icon) with note "Token milega, queue ke hisaab se"
- Live availability note: "Max 20 patients/day · 8 left"
- Sticky summary card (bottom): doctor, date, time/mode, ₹500 + "Confirm & Book" primary button
- Race toast: "Your selected time was just booked — picked the next free slot"

### 4.11 BOOKING CONFIRM FORM (same screen, below summary)
- Gender* (segmented chips, prefilled from profile)
- Reason/Disease* (text input, required)
- State, City (optional dropdowns)
- Additional Notes (multiline)
- Submit → success toast "Appointment booked! Waiting for confirmation." → Appointments List

### 4.12 APPOINTMENTS LIST
- Header "My Appointments"
- Tab chips with counts (horizontal scroll): All (18) · Pending (2) · Approved (3) · Visited (8) · Rejected (1) · Canceled (4)
- Date filter row: From / To date fields + Clear
- Appointment cards: doctor avatar + name + specialization + disease chip + date + status pill (Pending=amber "Waiting for approval", Approved=teal, Visited=emerald, Canceled=rose, Rejected=rose, Finished=gray)
- Token badge on approved cards: violet pill "Token #12"
- Video visit hint: "Your doctor will start the call at your appointment time"
- Actions per card: tap → detail; X cancel button (only Pending/Approved) → confirmation dialog "Cancel this appointment? This cannot be undone." [Keep it / Cancel Appointment]; prescription icon if Rx exists
- Empty state per tab: "No pending appointments — Book your first appointment"

### 4.13 APPOINTMENT DETAIL (the richest screen)
Sections (scrollable):
1. **Header:** back arrow + "Appointment Details" + appointment no ("DR-12345678") + status pill
2. **Doctor card:** avatar, name, specialization, hospital address, experience + "View Profile →"
3. **Live Queue Tracker card** (when token exists): big token tile "Your Token: 12" (violet) + "#3 in queue · 2 patients ahead · ~20 min wait"; "Currently Serving: 9" row; teal progress bar; step indicator dots with labels Waiting → Next → Consulting; venue info rows: Department (General Medicine, Floor 2, OPD Room 5), Hospital (name + address); video-consult note card: "This is a video consultation — Join button will appear when the doctor starts the call"
4. **Patient info card:** name, Gender, Blood group, Age, Weight
5. **Appointment info card:** Date, Time (or "Walk-in (queue tail)"), Disease, Notes
6. **Chat with Doctor card:** mini message thread (patient bubbles right teal / doctor left white) + input row + send; empty: "No messages yet — say hello 👋"
7. **Prescriptions section** (cards): "Latest" badge + timestamp; vitals grid (BP 120/80, Temp 98.6°F, Weight 70kg, Pulse 72, SpO2 98%); medicines list — name + dose badges "M · A · E" (teal/amber/violet dots) + "5× dose"; doctor's advice pairs (Q → A); actions: "Print" / "Share"
8. **Status timeline** (vertical): dots + labels + dates — Booked (Pending) → Approved by Doctor → Consultation Completed → Finished
9. **Rate This Visit card** (when Finished): 5 stars filled + "Excellent" label + date, or CTA "Rate This Visit"
10. **Book Again button:** "Book Again with Dr. Anita" (secondary)
11. **Join Video Call banner** (emerald, when active): "Doctor has started the call — Join Now"

### 4.14 ATURSEVA AI CHAT (center tab — the flagship screen)
- Header: Aturseva avatar (nurse icon in teal circle) + "Aturseva · AI Sahayika" + "online" green dot + speaker toggle button "🔊 Bol kar jawab" + overflow menu (Clear chat)
- Message thread: AI bubbles (white card + small teal avatar) / user bubbles (teal fill, right)
- **Rich AI cards inside thread** (rendered as styled cards):
  - Doctor results card: 2–3 doctor rows (avatar/name/spec/fee) + "See more"
  - Slot picker card: date chips + time slot chips + mode toggle + "Confirm & Book" teal button
  - Check-in card: mood faces 1–5 (😀 selectable), energy 1–5, symptom chips (Fever, Headache, Fatigue…), note field, "Save Check-in" button
  - Queue card: token + position + progress bar
  - Lab report card: test name + status + "View Report →"
  - Diet plan card: day chips (Day 1–7) + meals list
  - Weekly report card: adherence score ring (85%), day bars (M–S), streak flame 🔥7, AI narrative text
- **Voice input:** big circular teal mic button left of text input; recording state = red dot + waveform + "0:12 / 0:45" + stop button; transcript lands in composer for review (never auto-sends)
- Composer: rounded input + attach button (for Rx photo) + mic + send (teal circle)
- Typing indicator: three pulsing dots "Aturseva type kar rahi hai…"
- Quick chips before first message: "Nearby doctors" 📍 · "Meri baari kab hai?" · "Dawai reminder" · "Diet plan banao"
- GPS chip in header area: "📍 Nearby — 30 km" toggle
- Streaming text appears word-by-word in AI bubble
- Error/fallback bubble: soft gray card "Aturseva abhi jawab nahi de pa rahi — thodi der baad try karein" + "Retry" chip

### 4.15 DAWAI REMINDERS HOME (AI tab sub-screen / shortcut)
- Header "Dawai Reminders" + nurse icon + "+ Add Medicine" button
- **Stat row (4 cards):** Today 2/3 taken (progress ring), Streak 🔥 7 days, 7-day adherence 85%, Active medicines 4
- **Catch-up banner** (amber, when missed): "Ek dose miss ho gaya — Abhi Le Li (2 ghante tak)" + "Take Now" button
- **Today's timeline** (grouped sections with time headers):
  - 🌅 **सुबह · Morning — 8:00 AM**: medicine cards — name (Dolo 650), dose (1 tablet), instructions (khane ke baad), status pill; actions row: ✓ Taken (emerald) · Snooze 10m (amber) · Skip (gray) · Shift (violet)
  - ☀️ **दोपहर · Afternoon — 2:00 PM**: same
  - 🌙 **रात · Night — 9:00 PM**: same
  - Taken state: card fades, green check overlay, "Taken at 8:05 AM"
- **Active medicines list:** rows — name, dose, "1-0-1 × 5 days", source badge (Manual / From Dr. Anita's Rx), stop button
- **Add Medicine sheet (bottom sheet):** tabs "Manual" / "Import Rx" / "📸 Photo"
  - Manual: Name*, Dose, Instructions, time checkboxes (M/A/E), Duration (1–90 days stepper)
  - Import Rx: list of prescriptions (doctor + disease + date) → pick → duration
  - Photo: camera/gallery → "Scanning…" shimmer → AI-extracted medicine drafts (editable rows) → "Add N Medicines" confirm
- **Weekly Report card:** score ring + day bars + streak + "Aturseva says: 'Is hafte 85% doses — bahut badhiya!'" + disclaimer caption
- **Diet Plan card:** "AI Diet Plan" + Day chips 1–7 + selected day shows 5 meals (Breakfast/Lunch/Snacks/Dinner + note) + "Ghar ka khana, aapki dawai ke hisaab se" + disclaimer

### 4.16 LAB REPORTS HUB (Records tab)
- Header "My Lab Reports"
- Stat row: Total Reports (9) · Ready (6) · Pending (3)
- **Section: Hospital Reports** — cards: Report No, test name + category chip, status pill (Ordered=gray / Sample Collected=amber / Result Entered=amber / **Verified=emerald**), ordered date; Verified → "View Results" teal button; else "In progress — check back later" caption
- **Section: Reports Ready (external labs)** — cards: file icon (PDF/image), red "Abnormal" badge if flagged, test name, lab name + city, "Referred by Dr. X", completed date; actions: View / Download / Print icons
- **Section: Pending Tests** — rows: test name, lab, doctor, type chip (Blood/Radiology/Pathology/Other), urgency chip (Urgent=rose / Normal=gray), status, fee ₹
- Filter chips: All / Ready / Pending

### 4.17 LAB REPORT DETAIL (dialog/full sheet)
- Header: Report No + test name + "Verified ✓ emerald" pill
- Patient summary: name, age/gender, ordered date, category
- Clinical notes card (if any)
- **Parameters table:** rows — Parameter (+ short code) | Result + unit | Normal Range | flag pill (Abnormal=rose / Normal=emerald) | Remarks; abnormal rows tinted rose-50
- Gender/age-specific ranges note caption
- Buttons: Print Report / Share

### 4.18 HEALTH RECORDS VAULT (Records tab)
- Header "Health Records" + "Upload" primary button
- Stat row: Total Visits (12) · Last Visit (5d ago) · Doctors (3) · Prescriptions (8)
- **Past Prescriptions list:** rows — doctor + disease chip + date + "4 medicines" + View →
- **My Documents:** filter chips (All 7 · Lab Report 3 · Prescription 2 · Test Results 1 · Scan/X-Ray 1 · Vaccination 0 · Other 0)
- Document grid (2 columns): category-colored icon, title (2-line clamp), description, category badge, file size ("412 KB"), date; tap → actions sheet: Download / Delete (rose, with confirm)
- **Upload sheet:** file picker (≤5MB, PDF/JPG/PNG/DOC), Title* (auto-filled from filename), Category dropdown (6 options), Description; progress bar during upload

### 4.19 MEDICAL HISTORY TIMELINE (Records tab)
- Header "Medical History"
- Stat row: Events (28) · Appointments (12) · Prescriptions (8) · Lab Reports (6) · Hospital Stays (2)
- Filter chips with counts: All 28 · Appointments 12 · Prescriptions 8 · Lab Reports 6 · Stays 2
- **Vertical timeline** (left rail with colored dots + connecting line):
  - Appointment (teal calendar dot): "Appointment with Dr. Anita" + disease · time · hospital + status pill + date
  - Prescription (violet pill dot): "Prescription from Dr. Anita" + "4 medicines · Fever" + date
  - Lab Report (amber flask dot): "CBC — Complete Blood Count" + report no · hospital + Verified pill + date
  - Hospital Stay (rose bed dot): "Hospital Stay ADM-004" + ward · Bed 12 · diagnosis + "Discharged" badge + date
- Empty state: "No medical events yet"

### 4.20 RX ACCESS (Records tab)
- Header "Rx Access" + caption "Doctors request permission to view your prescriptions — you control it"
- Tabs: Pending (2🔔) / Approved (3) / History
- Request cards: requesting doctor avatar + name + specialization + status pill; context: prescription disease ("General consultation"), "Prescribed by Dr. Suresh", date; "Requested 2h ago"
- Pending actions: "Accept" (teal) / "Reject" (rose outline)
- Approved card action: "Revoke Access" (rose outline) → confirm dialog "Are you sure? Doctor will lose access immediately."
- Empty: "When doctors request access to your prescriptions, they'll appear here"

### 4.21 MY BILLS (Profile tab)
- Header "My Bills" + refresh icon
- Summary row (3 cards): Outstanding ₹2,400 (rose) · Total Paid ₹18,500 (emerald) · Bills Settled 4/6
- **IPD Bills section:** cards — bill no + status pill (Draft=gray "payment after finalization" caption / Final=teal / Partial=amber / Paid=emerald), hospital + ward, "Admission: ADM-004", generated date; amounts grid: Total ₹12,000 / Already Paid ₹8,000 / Advance ₹1,600 / **Balance Due ₹2,400** (bold); payment history chips (UPI · ₹4,000 · 2 Oct); **"Pay Balance" teal button** (when Final/Partial & balance > 0)
- **OPD Bills section** (read-only rows): receipt no, doctor, hospital, amount, method chip (Cash/UPI/Card), date, status
- **Transactions section:** rows — order id (short), amount, status pill (Captured=emerald / Pending=amber / Failed=rose / Refunded=violet), date
- Help card: "Need help with a bill? Contact the hospital"

### 4.22 PAYMENT SHEET (Razorpay)
- Sheet: bill summary (hospital, bill no, balance) + amount big
- Payment methods: UPI apps (GPay/PhonePe/Paytm), Card, Netbanking rows
- "Pay ₹2,400 Securely" button + lock icon
- States: processing spinner → success screen (big green check, "Payment Successful 🎉", payment ID, "Done") / failure (rose, "Payment Failed — Retry")
- Cancel toast: "Payment cancelled"

### 4.23 INSURANCE (Profile tab)
- Header "My Insurance" + "Add Policy" button
- Policy cards: company logo circle, company name, policy no, type chip (Individual/Family/Group/Corporate), sum insured "₹5,00,000", copay "10%", TPA (if any), valid until, status pill (Active=emerald / Expired=gray), "Cashless Available" badge
- **Add Policy sheet:** company dropdown, policy no*, type chips, sum insured*, copay %, valid until date
- Empty: "No policies yet — add one for cashless convenience"

### 4.24 CONSENTS (Profile tab)
- Header "My Consents" — read-only
- Cards: consent type (Procedure Consent / Admission Consent), template name, status pill (Active=emerald "signed & valid" / Pending=amber "awaiting signature" / Expired=gray), signed-on date, witness (name + relation), valid until
- Info caption: "Consents are signed at the hospital — yahan sirf records dikhte hain"

### 4.25 MY BLOG (Profile tab)
- Header "My Blog" + "+ New Post"
- Stats: Total (5) · Published (3) · Drafts (2)
- Post cards: cover image, title, status pill (Published=emerald / Draft=gray), date, Edit + Delete icons
- **Editor screen:** Title*, Content (multiline), YouTube link (optional), Image URL (optional), Publish/Draft toggle chips, Save button

### 4.26 FEEDBACK (Profile tab)
- Header "Feedback"
- Grid of completed-visit cards: doctor avatar + name, disease, date, "Rated ✓" badge or "Rate" button
- **Rating sheet:** doctor header; Overall stars 1–5 (big, teal, with labels Poor→Excellent); sub-ratings (star rows): Consultation, Wait Time, Staff; review text area; toggles: "Would you recommend?" "Post as anonymous"; Submit
- One rating per visit (already-rated shows read-only stars + review)

### 4.27 PROFILE (Profile tab root)
- Hero card: large avatar with camera overlay badge (tap → change photo), name, email (read-only, gray), "Member since Aug 2026", mobile
- Edit form: Full name, Mobile, Gender (chips) + Save
- Menu list (rows with chevrons): My Bills · My Insurance · My Consents · My Blog · Feedback · Change Password · Settings

### 4.28 SETTINGS
- **Appearance card:** theme chips (Light ☀️ / Dark 🌙 / System)
- **Notifications card:** toggles — Email notifications, Booking reminders, Marketing emails
- **Privacy card:** data-privacy copy + "Logout all other devices" (rose outline, confirm dialog)
- **About card:** version, Aturseva/Doctorooms branding

### 4.29 CHANGE PASSWORD
- Current password, New password (strength meter), Confirm → Save

---

## 5. COMPLETE USER FLOWS (step-by-step, validate designs against these)

### FLOW 1 — First-time user → First booking (the golden path)
1. Onboarding → Get Started → Register (name/email/mobile/gender/password) → Dashboard (empty state)
2. Empty-state CTA → Doctor Search → filters → Doctor Profile → Book Appointment
3. Calendar (pick date; past/holiday blocked) → Slot grid (auto next-free; or "join queue") → Mode toggle → Confirm form (gender prefilled, disease*) → Confirm & Book
4. Success toast → Appointments List shows Pending card ("Waiting for approval")
5. Notification arrives → status Approved + token number → card shows "Token #12"
6. Day of visit: Dashboard hero card + Live Queue card (position updates) → "It's your turn!" → consultation → status Visited
7. After: prescription appears in appointment detail (vitals + medicines) → status Finished → Rate This Visit (stars + review) → optional Book Again

### FLOW 2 — Live queue tracking (India-specific USP)
Dashboard/Appointment Detail → token tile → progress bar updates as patients ahead finish → "Aapki baari" amber push notification at T-1 → "It's your turn!" emerald state → consultation

### FLOW 3 — Video consultation
Booking (Video Call mode) → approved → day-of: appointment detail shows video banner note → doctor starts call → "Doctor has started the call — Join Now" (emerald) → Join → call screen (external) → back → status Visited

### FLOW 4 — Chat with doctor
Appointment Detail → Chat card → type message (≤2000 chars) → bubble right → doctor reply bubble left → notification on reply

### FLOW 5 — AI nurse daily loop (Aturseva)
Open AI tab (or FAB anywhere) → greeting with live data ("Aaj 3 dawaiyan hain, pehli 8 baje") → ask in Hinglish ("mere liye skin doctor dhundo") → AI card with doctors → tap slot → Confirm & Book card → book done → daily check-in card (mood/energy/symptoms) → save → AI encouragement reply

### FLOW 6 — Voice conversation
Tap mic → recording (waveform, max 0:45) → stop → transcript in composer → patient edits/reviews → send → AI streams reply → "Bol kar jawab" ON → reply auto-speaks → replay button per bubble

### FLOW 7 — Photo prescription → reminders
Dawai page → Add → Photo tab → capture Rx → "Scanning…" → editable medicine drafts → confirm → medicines appear in today's timeline → dose reminders fire (notification + AI push) → patient marks Taken (or Snooze/Skip/Shift) → missed dose → catch-up banner "Abhi Le Li" (2h window) → Sunday evening weekly report card (score, bars, streak, narrative)

### FLOW 8 — Lab results journey
Doctor orders test (during visit) → Pending Tests row appears (Ordered) → Sample Collected → Result Entered → **Verified** → notification "external-report-uploaded" / report ready → Lab Reports Hub → View Results → parameters table with Abnormal flags → patient asks Aturseva "CBC report samjhao" → AI explains (never diagnoses)

### FLOW 9 — Health record upload
Health Records → Upload → pick file (≤5MB) → title auto-filled → category → description → upload progress → document card in vault → filter by category → download

### FLOW 10 — Rx access consent
Notification "Dr. Suresh requested access" → Rx Access → Pending tab → review doctor + prescription context → Accept (emerald) / Reject → later: Revoke from Approved tab (confirm dialog)

### FLOW 11 — Pay hospital bill
My Bills → IPD card (Balance Due ₹2,400) → Pay Balance → Razorpay sheet → UPI/Card → success check screen → bill status → Paid (emerald), payment chip added to history

### FLOW 12 — Insurance add
Profile → My Insurance → Add Policy → company/type/sum insured/copay/validity → save → Active policy card

### FLOW 13 — Blog + feedback + profile maintenance (self-serve)
Blog editor (draft/publish) → Feedback rating sheet (sub-ratings + anonymous) → Profile edit (avatar upload with camera overlay) → Settings (theme, notification toggles, logout-all-devices)

---

## 6. STATUS SYSTEMS (color + label mapping — use everywhere consistently)

| Domain | Status | Pill color |
|---|---|---|
| Appointment | Pending ("Waiting for approval") | amber |
| | Approved | teal/emerald |
| | Visited / Finished | emerald / gray |
| | Canceled / Rejected / No-Show | rose |
| Lab report | Ordered / Sample Collected / Result Entered | amber |
| | Verified | emerald |
| Bill | Draft | gray |
| | Final | teal |
| | Partially Paid | amber |
| | Paid | emerald |
| Payment txn | Captured | emerald |
| | Pending | amber |
| | Failed | rose |
| | Refunded | violet |
| Dose | Pending / Reminded | amber |
| | Taken | emerald |
| | Snoozed | amber |
| | Skipped / Missed | rose / gray |
| Rx access | Pending | amber |
| | Approved | emerald |
| | Rejected / Revoked | rose / gray |
| Insurance | Active / Expired | emerald / gray |
| Consent | Active / Pending / Expired | emerald / amber / gray |
| Lab parameter | Abnormal / Normal | rose / emerald |

---

## 7. GLOBAL UI ELEMENTS

1. **Aturseva FAB** — every screen (except AI chat): teal circle + sparkles icon, bottom-right above tab bar; opens 70% bottom-sheet chat (same thread)
2. **Realtime toasts** — top slide-in pills: queue updates ("Aapki baari aa rahi hai!"), dose reminders, booking approved, report uploaded
3. **Pull-to-refresh** on all list screens
4. **Skeleton shimmer** loading on cards/lists (never spinners on full screens)
5. **Notification bell** on dashboard header with red unread dot
6. **Offline/empty/error states** — every list has: friendly empty + error card with "Try Again" chip

---

## 8. HARD CONSTRAINTS (what NOT to design — patient can't do these)

- ❌ No reschedule/edit of a booked appointment (only Cancel → re-book)
- ❌ Patient cannot start video calls (doctor starts; patient only joins)
- ❌ No online payment for OPD bills (cash desk only; IPD bills payable online)
- ❌ Patient cannot order lab tests (doctor-initiated)
- ❌ No family-member booking inside the app (self only)
- ❌ AI never auto-writes anything — every AI action needs an explicit patient tap (Confirm & Book, Save Check-in)
- ❌ AI never diagnoses or changes medicines — it explains, reminds, nudges
- ❌ Patient cannot edit prescriptions/bills/consents (view-only, generated by hospital)

---

## 9. COPY TONE (Hinglish examples to use in designs)

- Greeting: "Namaste, Aditya 👋"
- AI: "Aaj aapki 3 dawaiyan hain — pehli 8 baje ki hai"
- Queue: "Aapki baari aa rahi hai!" · "Aap next hain! 🎉"
- Reminders: "Dawai lena mat bhooliye" · catch-up: "Abhi Le Li"
- Empty states: "Abhi koi appointment nahi — pehla appointment book karein"
- Success: "Appointment booked! Approval ka intezaar karein"
- Fallback: "Aturseva abhi jawab nahi de pa rahi — thodi der baad try karein"

---

*Brief grounded in the live codebase audit (PATIENT-MODULE-AUDIT.md, 33 pages + 40 API routes). All features listed exist and work in the production backend today — no speculative features included.*
