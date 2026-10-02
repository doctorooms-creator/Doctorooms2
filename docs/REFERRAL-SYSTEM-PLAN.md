# Doctorooms — Referral & Points System (Implementation Plan)

> Status: PLANNING DOCUMENT (detailed, ready-to-build — development NOT started)
> Origin: User's idea — "Ek doctor apne reference se layak doctor laye to usko 2,000 points mil jaye, jo use ho sake account upgrade mein."
> Extends: PRICING-STRATEGY.md §5 (replaces the simple "both get 1 month" mechanic with a full points economy)
> Core mental model to market: **"Har genuine referral = 1 mahina Pro FREE"** (2,000 pts ≈ ₹1,000 ≈ 1 month Pro)

---

## 0. WHY THIS SYSTEM (Strategic Justification)

1. **CAC killer:** Doctor-friend trust is ICP trigger #5 (see PRICING-STRATEGY §1.2). A referral costs us points (₹0.50/pt marginal cost ≈ subscription extension) vs ₹500–2,000 paid ads CAC.
2. **Registration engine (user's stated goal):** Referrer is rewarded for ACTIVE free referrals too (staged awards), not just paid ones — so doctors hunt for signups, not sales.
3. **Payment-friction killer for upgrade:** A doctor with 2,000 points redeems Pro month with ₹0 — first taste of Pro without card. Habit → renewal with cash.
4. **Lock-in flywheel:** Referrer's points balance = switching cost. Leaving Doctorooms = abandoning points.
5. **Lab-commission synergy:** Referred free doctors ordering lab tests earn us commission — so rewarding free referrals is ROI-positive, not charity.

---

## 1. POINTS ECONOMY (The Rules of Money)

### 1.1 Basics
| Rule | Value |
|---|---|
| Point base value | **1 point = ₹0.50** |
| Full referral reward | **2,000 points** (≈ ₹1,000) |
| Point validity | **18 months** from earn date (FIFO expiry) |
| Annual earn cap | **60,000 points/user/year** (30 referrals — anti-farming) |
| Clawback | If referee takes 60-day refund → conversion award (1,000) reversed; negative balance allowed, next earnings offset |

### 1.2 Staged Award (2,000 total — "layak" = genuine usage, not just signup)

| Stage | Referee must... | Points | Why staged |
|---|---|---|---|
| **1. ACTIVATED** | Complete 1st booking (queue mein pehla patient) | **+300** | Fake signups filtered — patient book kiya matlab real clinic |
| **2. HABIT** | Reach 20 bookings (≈ 1 month active practice) | **+700** | Confirms genuine ongoing usage |
| **3. CONVERTED** | Becomes paying customer (any plan, first payment success) | **+1,000** | Revenue moment — biggest reward |
| Total | | **+2,000** | |

> Free-but-active referrals (stages 1+2) = 1,000 pts. **Do active referrals = 1 month Pro free.** This is deliberate — it rewards exactly the registration-maximization behavior we want (and those users still earn us lab commission later).

### 1.3 Milestone Bonuses (gamification layer)
| Milestone (converted referrals, rolling 12 mo) | Bonus |
|---|---|
| 5th conversion | +2,000 pts |
| 10th conversion | +5,000 pts ("Referral Champion" badge on public clinic page) |

### 1.4 Redemption Catalog (points kharch karne ke tarike)

| Item | Points | Cash value | Notes |
|---|---|---|---|
| **Pro — 1 month** | 2,000 | ₹999 | Works for FREE users (points-only upgrade path!) & active Pro users (extends period) |
| **Pro — 12 months** | 20,000 | ₹9,999 | 10 successful referrals = free year |
| **Extra doctor seat — 1 yr** | 5,000 | ₹2,499 | For Pro users |
| **AI Copilot pack — 500 credits** | 1,000 | ₹499 | Universal |
| **WhatsApp pack — 1,000 reminders** | 1,000 | ₹499 | Universal |
| **Hospital Pro — 1 month** | 10,000 | ₹4,999 | Aspirational ladder for growing doctors |

*(Catalog is DB-driven — prices tunable without code deploys.)*

### 1.5 Referee (new doctor) welcome gift — double-sided
- Extended **30-day full trial** (vs standard 14) when signing up via referral link
- Cost: ₹0. Clean reciprocity: "Aapko 30 din, mujhe points."

---

## 2. USER FLOWS (UX Blueprint)

### 2.1 Referrer journey
1. Doctor sidebar → **"Referral"** page (icon: Gift)
2. Sees: personal code (e.g. `DR-AMIT-4821`), WhatsApp share button (prefilled Hinglish message), copy-link button
   - Share text: *"Main apna clinic Doctorooms pe digital chalata hoon — digital Rx 30 sec mein, OPD queue, WhatsApp reminders. Is link se signup karo, aapko 30 din ka full access milega: {link}"*
3. **Referral tracker table:** each referee, masked name ("Dr. M****a"), stage badge (🔔 Activated / ⚡ Habit / 💳 Paid), points earned per row
4. **Points wallet card:** balance, expiry warnings ("3,000 pts March mein expire honge"), catalog with Redeem buttons
5. Live toasts: *"🎉 Dr. Mehta ne pehla patient book kiya — 300 points mile!"*

### 2.2 Referee journey (signup)
1. Lands via `https://…/r/DR-AMIT-4821` → referral code stored in sessionStorage → carried into registration form (prefilled, editable, "Referral code (optional)")
2. `GET /api/referral/validate?code=` → live badge "✓ Dr. Amit Shah ka referral — 30 din full trial milega"
3. On successful registration → Referral row created (`pending`)
4. Their 1st booking fires Stage 1 award (referrer gets toast + points)

### 2.3 Redemption flow (upgrade with points)
1. Anywhere upgrade CTA exists → payment sheet shows 2 options: **"Pay ₹999"** | **"2,000 points se free"**
2. Points selected → confirm modal ("Balance: 4,500 → 2,500 bacha rahega") → `POST /api/referral/redeem`
3. Success: subscription period extended / feature unlocked + confirmation toast + ledger entry
4. Insufficient points → shows shortfall + "2 referrals aur = free month" progress nudge

---

## 3. DATABASE SCHEMA (Prisma — additive only, no changes to existing tables)

```prisma
model ReferralCode {
  id        String   @id @default(cuid())
  userId    String   @unique              // referrer (doctor)
  code      String   @unique              // DR-{NAME}-{4 digits}
  clicks    Int      @default(0)
  createdAt DateTime @default(now())
}

model Referral {
  id             String    @id @default(cuid())
  referrerUserId String
  refereeUserId  String    @unique         // 1 claim per new user, immutable
  code           String
  status         String    @default("pending") // pending|activated|habit|converted|expired
  activatedAt    DateTime?
  habitAt        DateTime?
  convertedAt    DateTime?
  expiredAt      DateTime?                  // auto-expire pending after 90 days
  createdAt      DateTime  @default(now())
  // relations to User x2 (referrer, referee)
}

model PointsLedger {
  id           String    @id @default(cuid())
  userId       String
  type         String    // earn_activated|earn_habit|earn_converted|earn_milestone|redeem_pro_month|redeem_ai_pack|...|clawback|expire|adjust
  points       Int       // signed: +earn / -spend
  balanceAfter Int
  refId        String?   // Referral.id | Redemption.id
  expiresAt    DateTime? // 18 months from earn (FIFO)
  createdAt    DateTime  @default(now())
}

model Redemption {
  id          String   @id @default(cuid())
  userId      String
  itemType    String   // pro_month|pro_year|seat_year|ai_500pack|whatsapp_1000pack|hospital_month
  pointsSpent Int
  status      String   @default("applied") // applied|reverted
  appliedAt   DateTime @default(now())
}
```

**Invariant:** `SUM(PointsLedger.points WHERE userId) = current balance` — ledger is source of truth, balance is derived (cached on User or computed).

---

## 4. API SURFACE

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/referral/validate` | GET | public | Validate code at signup → referrer name for badge |
| `/api/referral/claim` | POST | registration flow | Link referee (idempotent, once-only, self-referral blocked) |
| `/api/referral/me` | GET | doctor | Code, wallet balance, referrals table, catalog, stats |
| `/api/referral/redeem` | POST | doctor | Redeem item (guards: balance, cap, active-sub state) |
| `/api/referral/share-track` | POST | doctor | Increment code clicks (analytics only) |
| **internal `awardPoints()`** | — | server | Transaction-safe: ledger append + balance recompute + notification emit |
| **Razorpay webhook hook** | — | server | On `payment.captured` (first payment of a user w/ referral) → mark converted + award 1,000 |
| **cron (daily)** | — | server | (a) expire pending referrals >90d; (b) FIFO points expiry; (c) habit-milestone check (count bookings of referees) |
| `/api/admin/referrals` | GET | admin | K-factor, funnel, fraud flags, manual `adjust` ledger entries |

**Stage triggers (where the hooks live):**
- Stage 1: existing booking-creation route (post-success) → check `user.referredBy` → award
- Stage 2: daily cron counts bookings per referee (cheaper + simpler than per-booking counting)
- Stage 3: Razorpay webhook (authoritative payment success — never trust frontend)

---

## 5. ANTI-FRAUD RULES (Points = Money, So Guard It Like Money)

| # | Rule |
|---|---|
| 1 | Referral link claimable **only during signup** (stored code in sessionStorage; no post-hoc "credit me" claims) |
| 2 | **Self-referral blocked:** referee mobile ≠ referrer mobile; ABHA ID check when present; same-device (fingerprint/localStorage marker) rejected |
| 3 | Points **pending 15 days** before spendable (reversal window for flagged accounts) |
| 4 | Annual earn cap 60,000 pts + alert on >10 referrals/user/month (manual review queue) |
| 5 | Clawback on referee 60-day refund (ledger `clawback` entry, negative balance allowed) |
| 6 | All awards server-side only; ledger append-only (no UPDATE/DELETE — corrections via `adjust` entries, admin-only) |
| 7 | Referee must be **new user** (unique mobile + unique ABHA + no prior account) |

---

## 6. FRONTEND COMPONENTS (Inventory)

| Component | Location | Notes |
|---|---|---|
| Referral dashboard page | `dashboard/doctor/referral` | Code + share + tracker + wallet + catalog (Tabs: Invite / Wallet) |
| Share buttons | referral page | WhatsApp deep-link, copy link, QR code (reuse existing QR lib from hospital module) |
| Referral code input | registration flow | + validate badge (green check + referrer name) |
| Points badge | sidebar (under profile) + billing page | `🎁 4,500 pts` chip → links to wallet |
| "Pay with points" option | every upgrade modal | Dual-button payment sheet (₹ vs pts) |
| Award toasts | global (RealtimeNotification event) | New socket event: `referral-reward` (add to notif-service whitelist) |
| Upgrade nudges | wallet empty state | "2 active referrals = free month" progress bar |
| Leaderboard (Phase 3) | public/blog | "Top referring doctors" — social proof engine |

---

## 7. SOCKET/NOTIFICATION INTEGRATION

Add `referral-reward` to `VALID_EVENTS` in `mini-services/notification-service/index.ts` (one line) → client `RealtimeNotification.tsx` config: title "Referral Reward 🎉", icon Gift, roles ['doctor'], toast on referrer when any stage awards. Server API routes emit via existing `POST /emit` pattern (no new infra).

---

## 8. ANALYTICS & KPIs

| Metric | Target | Instrument |
|---|---|---|
| Share rate (referral page visitors who share) | 30% | share-track events |
| **Viral coefficient K** | ≥ 0.3 (1 referring doctor → 0.3 new doctors) | referral funnel |
| Referred-signup → activation | 50% (2x cold traffic — trust pre-installed) | stage timestamps |
| Referred → paid conversion | 8–12% (vs 5–8% cold) | conversion stage |
| Points redeemed (not hoarded) | 60% within 6 months | ledger |
| Revenue per referred doctor (LTV incl. lab commission) | > 2x points cost | finance view |

**Funnel events to instrument:** `ref_shared, ref_link_opened, ref_code_validated, ref_signup_completed, ref_stage1/2/3_awarded, pts_redeemed{item}, pts_expired`.

---

## 9. IMPLEMENTATION PHASES (Build Order)

### Phase 1 — Core loop (ship first, ~all user value)
1. Prisma: 4 new tables → `db:push`
2. Code generation (on first Referral page visit / registration) + `/r/{code}` landing redirect → signup w/ code
3. Claim at signup + validation API
4. Referral dashboard (invite tab: code, share, tracker) + sidebar entry
5. Stage 1 award hook (booking route) + ledger + wallet balance API
6. Redeem API + catalog (pro_month + ai_500pack only) + "pay with points" in upgrade modal
7. `referral-reward` socket event + toasts
8. Admin: `/api/admin/referrals` basic stats

### Phase 2 — Automation & gamification
1. Daily cron: pending-expiry, FIFO points expiry, stage-2 habit detection
2. Milestone bonuses + champion badge
3. Razorpay webhook → stage 3 + clawback logic
4. Pending-15-days spendability + fraud heuristics + review queue
5. Full catalog (seat, WhatsApp pack, hospital month)

### Phase 3 — Scale
1. Public leaderboard + referral landing page SEO
2. A/B: 2,000 vs 2,500 points reward size; message variants
3. K-factor dashboard in admin; campaign工具 (premade WhatsApp creatives: image + text)

---

## 10. EDGE CASES (Pre-decided)

| Case | Decision |
|---|---|
| Referee never books | Referral auto-expires at 90 days (`expired`) — no points, code reusable for others |
| Referee refunds within 60-day guarantee | Clawback 1,000 conversion pts (ledger may go negative) |
| Points spent, then clawback → negative balance | Next earnings offset first; catalog blocked while negative |
| Redeeming pro_month while annual Pro active | Extends `currentPeriodEnd` by 30 days |
| FREE user redeems pro_month | Creates Pro subscription with `pointsOnly: true` source, 30-day period, no Razorpay |
| Referrer deletes account | Points forfeited (ledger archived); referrals remain (converted referees unaffected) |
| Two codes tried at signup | Last valid code wins; claim is final on registration |
| Hospital admin refers (not doctor) | Phase 1: doctors only; hospitals later |
| Points expiry during pending redemptions | Redemption always consumes oldest-expiring points first (FIFO) |

---

## 11. ROLLBACK & SAFETY
- Entire system = 4 additive tables + new routes + 1 sidebar link. Kill-switch: hide sidebar entry + catalog (features flags `REFERRAL_ENABLED`) — core app untouched.
- Ledger append-only → full audit trail for any dispute ("aapke 2,000 points kahan gaye?" has a exact answer).

---

## 12. OPEN DECISIONS (User's call before build)
1. Stage split 300/700/1,000 — theek, ya flat 2,000 on conversion only? (Recommend staged — rewards active free referrals too)
2. Points expiry 18 months — ya no expiry? (Recommend 18 — redemption urgency)
3. Referee welcome = 30-day trial — ya kuch aur (500 starter points to referee)?
4. Leaderboard public in Phase 3 — haan/na?
5. Phase 1 catalog minimal (2 items) vs full (6 items)?
