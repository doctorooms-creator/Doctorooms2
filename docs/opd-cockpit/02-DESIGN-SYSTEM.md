# 02 — Design System & Motion Spec

> Derived from `skills/impeccable` (Operate mode + craft floor + animate.md) and `skills/taste-skill` (app-screens chapter), mapped onto the existing Doctorooms brand (teal). **This file is the law during development — every PR/phase is checked against it.**

---

## 1. Mode & register

**Operate mode** (impeccable): the doctor completes a task, all day, in flow. Earned familiarity beats expression. The tool disappears into the task. Brand lives in precise details — not in decoration.

**Consequences:**
- No page-load choreography, no entrance sequences on data, no decorative motion (motion = feedback/state only, plus ONE authored moment)
- Consistency over surprise; standard affordances; density allowed where the task needs it
- Skeletons for loading (never centered spinners over content); empty states that teach

## 2. Tokens (light theme — build first)

Mapped from taste app-screen defaults + Doctorooms teal as the single accent. CSS custom properties, consumed by Tailwind arbitrary values or a small `opd.css`:

```css
:root {
  /* surfaces */
  --ground: #f7f8f8;        /* page ground, one step off white */
  --surface: #ffffff;       /* cards */
  --raised: #f1f2f2;        /* active rows, chips */
  --border: #e7e8e8;        /* card edges (1px) */
  --rule: #f0f1f1;          /* row rules inside cards */
  --control: #d2d6d6;       /* control borders */

  /* text — 3 tiers, all ≥4.5:1 */
  --text: #141515;          /* primary */
  --muted: #5a5f5f;         /* secondary */
  --faint: #6b6b6b;         /* meta/placeholder (lightest allowed) */

  /* the single accent: Doctorooms teal */
  --accent: #0d9488;        /* data + ONE primary action + current-selection */
  --accent-ink: #ffffff;    /* text on accent fill */
  --accent-pale: #e6f2f0;   /* pale tint fills (badges, selected row wash) */
  --accent-deep: #0f766e;   /* hover/pressed accent */

  /* primary action = near-black (teal reserved for data+selection) */
  --primary: #1d1f20;       /* the ONE filled button on screen (Call/Start Rx) */
  --primary-ink: #ffffff;

  /* status — pale pairs, text ≥4.5:1 */
  --positive: #247b50;      --pos-bg: #dcfae5;  --pos-ink: #04250e;
  --negative: #c4242a;      --neg-bg: #ffedea;  --neg-ink: #831c1e;
  --warning:  #92400e;      --warn-bg: #fffbeb; --warn-ink: #92400e; /* border #fde68a */
  --info:     #0f5f78;      /* emergency uses negative family */

  /* geometry — tight radius family (clinical precision) */
  --radius-card: 8px;  --radius-control: 6px;  --radius-chip: 4px;
  --gap: 16px;  --card-pad: 20px;  --pad: 24px;
  --nav-row: 34px;  --control-h: 32px;  --queue-row: 44px;

  /* type — ONE family, fixed rem scale, ratio ~1.16 */
  --font: var(--font-sans);          /* existing app family — no new font */
  --fs-title: 24px;   /* the one h1 */
  --fs-section: 16px; /* card/zone headers */
  --fs-kpi: 24px;     /* stat values (same size, NOT hero-sized) */
  --fs-body: 14px;
  --fs-small: 12px;   /* floor — nothing under 11px */
}
```

Dark theme (`[data-theme="dark"]`): Phase E+ — ground #0b0c0c, surfaces #141515, teal stays data-accent, positive #3fc07a on #172a1d. Not v1.

**Color budget (the anti-slop law):** ~3% colored pixels. Teal appears ONLY on: the main data element (current token / trend line), the active selection, and pale badge washes. The filled button is near-black. Status colors only on status. If a screenshot feels "colorful", it's wrong.

## 3. Type rules

- ONE family (the app's existing sans). No display faces, no mono outside real data contexts — token numbers use `font-variant-numeric: tabular-nums`, which is data styling, not a mono costume.
- Fixed rem scale (no clamp/fluid). Sizes: 24 / 16 / 14 / 12 (+ chart labels 11px floor).
- Sentence case everywhere; no ALL-CAPS tracked labels (the classic AI tell).
- Line heights: 20px for 14px text; 24px for 16px.
- More space above a heading than below it (craft-floor rhythm).

## 4. Components — the laws

| Element | Law |
|---|---|
| **Cards/panels** | Flat. Separation = 1px `--border` OR one tone step — **never both, never shadows**. Shadows only on true floaters: menus, popovers, print overlay, toasts |
| **KPI/stat strip** | ONE container split by 1px dividers — NOT tile cards. Label above value (12px grey / 24px ink, weight 400). No icons, no icon circles, no sparklines, no tinted tiles. Zero prints "0". Missing = "–" |
| **Deltas** | 10–14px, window in words ("vs yesterday", "since 9:00"). Color = good/bad direction, never up/down reflex. Zero/undefined change = grey or "+4 (new)" |
| **Queue table** | 1px row rules, no zebra, no header bands. Numbers right-aligned tabular. Token column in ink weight 600. Row height 44px (dense-but-calm) |
| **Badges/chips** | Pale pairs (`--pos-bg/--pos-ink` etc.), radius 4px, 11–12px text. VIDEO = pale teal. EMERGENCY = negative family. Max ONE red mark per object (red is a signal, not texture) |
| **Buttons** | One primary on screen at a time (near-black fill). Secondary = 1px outline. Ghost = text-only. Height 32px (36px hero). All with default/hover/focus/active/disabled/loading states |
| **Focus ring** | 2px `--accent` offset ring — visible, consistent, keyboard-first |
| **Browser surfaces** | Theme them: `::selection` pale teal, caret teal, custom scrollbar thin neutral, tabular-nums on all data. (The cheapest "built, not assembled" signal) |
| **Empty states** | Teach, don't mourn: "No patients yet — the queue fills as reception books" + the first actionable thing |
| **Overlays** | Print overlay/toasts = the only shadowed floaters. Dialogs via portal, escape by Esc |

## 5. Motion spec (the smoothness contract)

**Philosophy (impeccable animate.md):** motion explains state, relationship, hierarchy — or it doesn't exist. Product mode: 150–250ms routine. Long feedback feels like latency.

### 5.1 Timing tokens

```css
--dur-feedback: 120ms;   /* press, hover, focus */
--dur-state:    200ms;   /* chips, tabs, row state flips */
--dur-layout:   320ms;   /* zone swaps, overlay in/out */
--dur-authored: 480ms;   /* THE one authored moment */
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);   /* confident arrivals */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);      /* exits — faster than entrances */
```

### 5.2 Feedback on EVERY control (non-negotiable)

- **Press:** scale(0.98) + tone step, 80–120ms — buttons, rows, chips
- **Hover:** background tone step (no lifts, no shadow growth, no translate)
- **Focus:** 2px accent ring, 120ms
- **Disabled:** 40% opacity + `cursor: not-allowed`, NO motion
- **Loading:** the control's label swaps to a 14px spinner INSIDE the same bounds (no layout shift)

### 5.3 THE authored moment — patient card swap (auto-advance)

The single rehearsed sequence the screen has earned (S5):
1. Print overlay fades/scales out (240ms, `--ease-in`)
2. Old patient card exits: rise 16px + fade, 180ms
3. New patient's chart enters: rise 20px + fade, 320ms `--ease-out`, content staggered 60ms (name → last-visit → trend → actions)
4. New token number counts up (tabular-nums, 360ms) — the "flip" feel of a physical token board
5. Queue strip: called row converts to a 1px-rule "done" row sliding to compact height (220ms); next row's wait-timer starts

Total felt time ≤ 700ms. Nothing else on the screen moves during it.

### 5.4 Supporting motions (quiet, all ≤ 250ms)

| Event | Motion |
|---|---|
| Queue row arrives (new booking) | slide-in x:12px + fade, 200ms, one per row (cap stagger at 3 rows / 120ms) |
| Stat number change | crossfade 160ms, tabular-nums (no odometer theatrics) |
| Report inbox appears | strip expands height (grid-template-rows trick, 220ms) + soft chime-less emphasis pulse ONCE on the count |
| Emergency row insertion | slide-down 200ms + one 2px negative left edge — NO pulsing, NO shaking |
| Search palette | scale 0.98→1 + fade, 180ms |
| Toast | slide-up 200ms, auto-dismiss 4s, exit 160ms |
| Pause state | hero crossfades to break card (240ms); PAUSED chip slides in from top bar |

### 5.5 Bans (motion)

- Page-load choreography / entrance cascades on data
- Parallax, drift loops, idle animations, blinking indicators
- Animating layout properties (width/height/top/left) — use transforms + FLIP where needed
- Bounce/elastic easings
- Any animation that hides content if JS fails (default = visible)

### 5.6 Accessibility

- `prefers-reduced-motion: reduce` → drop ALL travel (translate/scale), keep opacity-color-state changes ≤120ms; the authored moment becomes a 120ms crossfade; feedback stays legible
- Every motion interruption-safe (framer-motion handles naturally)
- Focus NEVER stolen by animation; focus moves only on explicit action

## 6. Layout laws

- Full-screen app: top bar (48px, ground-tinted, hairline bottom rule) / hero zone (fluid, ~55–60vh) / queue strip (fixed bottom rail or right column ≥1280px, bottom rail below) / footer facts strip (32px)
- ONE gutter value everywhere (16px); one left edge from title to last row
- Grid arithmetic written in a code comment at build time (e.g. `hero 1fr + rail 384px + gap 16 = 100vw - pad 48`)
- ≥1280px: hero left + 384px chart rail right (chart docks beside wizard context in future phases)
- <1280px: rail collapses to bottom strip; <768px: phone composition (queue = accordion, hero full-bleed, top bar condensed) — its OWN composition, not a shrunken desktop
- Cards that share a row share a bottom edge (no ragged rows); narrow content never spans full width (pair it)

## 7. The product's face (anti-"AI-generated" identity)

Per taste app-screens: a correct-but-generic screen still reads as a kit. Ours gets its face from:
1. **The token board motif** — tokens (GEN-014) are THE object of this product's world; the hero token number + queue token column set in tabular ink 600, like a clinic's physical number board. No other product in the category has this as its spine.
2. **Teal on the living data** — the currently-serving token, the vitals trend line, the active row wash. Nothing else is colored.
3. **Words of the trade** — "In OPD", "Called — walking in", "Reports ready", "Ruk raha hai / Still coming", "Queue opens 09:30". Never "Items", "Records", "Status: Active".
4. **One signature element** — the auto-advance card swap (5.3). Jurors in the taste study named the signature first, every time.
5. **Honest small numbers** — a new clinic shows "3 waiting", drawn at real size, no fake trends.

## 8. QA gates (per phase)

1. `node skills/taste-skill/scripts/lint.mjs --app <files>` — banned patterns scan
2. `node skills/taste-skill/scripts/inspect.mjs --app <url>` — 0 FAIL required (1440/768/390)
3. Screenshot review vs this file's laws (3 critique rounds max, fix top-3 each round)
4. impeccable craft-floor checklist: contrast, spacing rhythm, type floor, states coverage, browser surfaces
5. Reduced-motion screenshot: content complete, feedback legible
6. Console: zero new errors
