# 🤖 GLM 5.3 — Continuation Prompt for Doctorooms HMS

> **Copy the entire prompt below and paste it as the FIRST message to GLM 5.3.** This gives it full context to continue building the system.

---

## COPY EVERYTHING BELOW THIS LINE

---

You are continuing development on **Doctorooms** — a comprehensive Healthcare Management System (HMS) that automates a real hospital's daily operations (OPD + IPD + Lab + Pharmacy). The project is already 80% built. Your job is to complete the remaining 20% and fix critical bugs.

## FIRST: Read These 3 Documentation Files

Before writing ANY code, read these files in order:

1. **`DOCTOROOMS-HANDBOOK.md`** — Complete project overview: what it is, tech stack, 9 roles, 99 Prisma models, project structure, what's built, how to restart everything, coding conventions, real hospital flow, critical rules (mistakes to avoid).

2. **`NEXT-STEPS.md`** — Everything that needs to be built/fixed, with priority levels (🔴 Critical, 🟡 High, 🟢 Medium) and detailed fix instructions for each item.

3. **`worklog.md`** — Full history of 63+ completed tasks (3300+ lines). Read the last 500 lines to understand recent work. Each task has: Task ID, Agent, Task description, Work Log, Stage Summary.

## CRITICAL CONTEXT (don't skip)

### The Dev Environment (read or NOTHING works)
- **Sandbox has 4GB RAM** — Turbopack (default) uses 3.1GB and triggers OOM. MUST use webpack.
- **Always start dev server with this exact pattern:**
  ```bash
  cd /home/z/my-project
  pkill -9 -f "next" 2>/dev/null; sleep 2
  ( cd /home/z/my-project && export NODE_OPTIONS="--max-old-space-size=768" && exec node node_modules/next/dist/bin/next dev -p 3000 --webpack ) > /home/z/my-project/dev.log 2>&1 &
  disown
  # Wait for ready:
  for i in $(seq 1 40); do sleep 1; curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && break; done
  sleep 3
  ```
- **`.env` resets on sandbox boot** — code now uses `NODE_ENV !== 'production'` (not `DEV_MODE === '1'`) to survive this. Don't re-add `DEV_MODE` checks.
- **Database can disappear** — if `db/` directory is missing, recreate it:
  ```bash
  cd /home/z/my-project && mkdir -p db && bun run db:push && npx tsx src/scripts/seed-test-data.ts
  ```
- **Server dies between Bash commands** — the sandbox kills processes when commands exit. To keep the server alive, either:
  - Use the subshell pattern above (survives sometimes)
  - OR run a long command with `tail -f dev.log &` + `sleep 570` to keep the shell alive for 10 minutes
  - OR ask the user to test within 10 minutes of starting the server

### Tech Stack (NON-NEGOTIABLE)
- Next.js 16 App Router + TypeScript 5 + Tailwind CSS 4 + shadcn/ui (New York) + Prisma ORM + SQLite (dev)
- Zustand (client state) + TanStack Query (server state) + framer-motion + Socket.IO (real-time)
- JWT + DB sessions (custom auth — NOT NextAuth)

### The 9 User Roles
admin, doctor, patient, hospital, receptionist, assistant, pharmacist, nurse, lab_technician

### Dev Login (all roles work in dev)
```bash
# Login as doctor:
curl -s -X POST http://localhost:3000/api/dev-login -H "Content-Type: application/json" -d '{"role":"doctor","userId":"dev-doctor"}'
# Returns: { success, user } + sets cookies
# Other users: dev-patient, dev-admin, dev-hospital, dev-receptionist, dev-nurse, dev-lab-tech
# Also: dev-doctor-anita, dev-doctor-suresh, dev-assistant, dev-pharmacist
```

## YOUR TASK: Fix the 6 Prescription Wizard Bugs FIRST

The user said: **"ye prescription heart hai hamare system ka"** (this prescription is the heart of our system). The prescription wizard has 6 bugs that MUST be fixed before anything else. Details are in `NEXT-STEPS.md` Priority 1.

### Bug 1: Vitals Not All Saving
- File: `src/app/api/prescription/[id]/vitals/route.ts`
- Only saves weight, BP, temperature — missing pulse, SpO2 (stored as PLabel records but maybe not properly)
- Fix: Check if Prescription model needs `pulse`, `spo2` fields. If yes, add to schema + run `bun run db:push`. Update API to save all 5. Update print API + print view to show all 5.

### Bug 2: Vitals Under "Lab Results" Heading
- File: `src/components/prescription/print-view.tsx` (line ~419) + `src/app/print/prescription/[id]/page.tsx`
- The labels section is titled "Lab Results" — but vitals should be under "Vitals" only.
- Fix: REMOVE the "Lab Results" section entirely. Merge vital labels into the "Vitals" section. Non-vital labels (blood sugar, cholesterol) → separate "Investigations" heading.

### Bug 3: Medicines Count Mismatch
- Files: `src/app/api/prescription/[id]/medicines/route.ts` (save) + `src/app/api/prescription/[id]/print/route.ts` (fetch) + `src/components/prescription/print-view.tsx` (display)
- 5 medicines added, not all show in print.
- Fix: Verify save API saves ALL medicines. Verify print API returns ALL. Verify print view renders ALL (`.map()` over full array).

### Bug 4: Diagnosis Table Cell Values Empty
- File: `src/app/api/prescription/[id]/tables/route.ts`
- Saves table structure (rows, cols, headers) but NOT cell values the doctor typed.
- Fix: Add `cellValues` field (JSON string) to `PDignoTable` model. Update API to save. Update print API to return. Update print view to render. Update Step 3 to send.

### Bug 5: Next Visit Date Not Saving
- File: `src/app/api/prescription/[id]/finalize/route.ts` + `src/components/prescription/stepper/step-6-finish.tsx`
- Finalize API has the code but nextVisit might not be sent from frontend, or format is wrong.
- Fix: Check Step 6 sends `nextVisit` as ISO date. Add console.log in API to verify. Ensure Zustand store passes it.

### Bug 6: Suggestions Missing + C/O→Suggestions Mapping (THE BIG ONE)
- File: `src/components/prescription/stepper/step-5-suggestions.tsx` (redesign) + `src/app/api/prescription/[id]/suggestions/route.ts`
- Current: Step 5 shows generic suggestions, NOT linked to complaints from Step 1.
- Desired: Step 5 shows complaints from Step 1 as accordion/cards. For each complaint, show linked questions → suggestions. Doctor selects which suggestions to include. Only selected ones go in prescription.
- Fix: See detailed instructions in `NEXT-STEPS.md` Bug 6. May need to add `coId` to `PSuggestion` model.

## WORKFLOW (follow this for every bug)

1. **Start the dev server** (use the exact pattern above)
2. **Read the current code** for the bug you're fixing (use Read tool, not memory)
3. **Make the fix** (Edit/Write tools)
4. **Run `bun run lint`** — must be 0 errors
5. **Test via curl:**
   ```bash
   # Login
   curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/api/dev-login -H "Content-Type: application/json" -d '{"role":"doctor","userId":"dev-doctor"}'
   # Test the fixed API
   curl -s -b /tmp/cookies.txt http://localhost:3000/api/prescription/{id}/print
   ```
6. **Test via Agent Browser** (if UI changed):
   ```bash
   agent-browser open http://localhost:3000/login
   agent-browser snapshot -i
   # Set cookies, navigate, verify
   ```
7. **Append to worklog.md:**
   ```markdown
   ---
   Task ID: bug-N-fix
   Agent: GLM 5.3
   Task: Fix Bug N — [description]

   Work Log:
   - [step 1]
   - [step 2]

   Stage Summary:
   - [results]
   ```

## AFTER BUGS: Queue System + IPD Flow

After all 6 bugs are fixed and verified, proceed to:

### Queue System (Priority 2)
- Add drag-and-drop reordering (using @dnd-kit/sortable, already installed)
- Add priority tokens for emergency/senior patients
- Polish the real-time display board

### IPD System (Priority 3)
- Complete the daily routine: admission → vitals → rounds → orders → discharge → bill
- Create missing API routes (see NEXT-STEPS.md section 3)
- Create discharge summary print template

## CRITICAL RULES (from experience — DO NOT repeat these mistakes)

1. **`createdById` is NOT on Prescription model** — don't add to `db.prescription.create()`
2. **`PCo` has no `co` relation to CoMaster** — only `coId`. Fetch CoMaster manually + merge.
3. **`User` has no `specialization`** (on Doctor), no `contactNo`/`phoneNo` (use `mobileNo`)
4. **`ListClock` icon doesn't exist** — use `Clock4`
5. **Order Tests dialog**: URL is `/appointments/` not `/bookings/`, method is `PUT` not `PATCH`
6. **Booking dates**: set to IST start of day (not UTC midnight)
7. **`LabTestMaster` API** returns `testMasters` key, not `tests`
8. **Print view**: `body * { visibility: hidden }` in print CSS — only inline styles survive. Don't use Tailwind classes for print components.
9. **Prisma schema**: primitive types can NOT be lists — use `String` with JSON.stringify
10. **`.env` resets** — code uses `NODE_ENV` not `DEV_MODE` — don't re-add DEV_MODE checks
11. **Server dies** without subshell pattern — use `( cd ... && exec node ... ) & disown`
12. **OOM kill** with Turbopack — always use `--webpack` + `--max-old-space-size=768`
13. **Never** write `http://localhost:3000` in fetch — use relative paths only
14. **Footer** must be sticky — already in layout, don't break it
15. **API URLs**: use `?XTransformPort=PORT` for cross-service requests (mini-services)
16. **Never** use indigo or blue colors (user preference) — use teal (the project's accent color)

## TESTING STANDARDS

After every fix:
1. `bun run lint` — 0 errors
2. Test the API with curl
3. If UI changed, test with Agent Browser (agent-browser CLI)
4. Verify the full flow works end-to-end
5. Append to worklog.md

## WHEN IN DOUBT

- Read the code first (use Read/Grep/Glob tools — NOT memory)
- Check the Prisma schema for field names (`prisma/schema.prisma`)
- Check existing patterns (e.g., look at how other API routes are structured)
- Read the worklog.md for context on why things were done a certain way
- If something seems broken, check if `.env` reset or DB is missing (see Handbook section 8)

## START HERE

1. Read `DOCTOROOMS-HANDBOOK.md`
2. Read `NEXT-STEPS.md`
3. Read last 500 lines of `worklog.md`
4. Start the dev server (exact pattern above)
5. Verify login works: `curl -s -X POST http://localhost:3000/api/dev-login -H "Content-Type: application/json" -d '{"role":"doctor","userId":"dev-doctor"}'`
6. If login fails (404/500), check `.env` and `db/` directory (see Handbook section 8)
7. Begin fixing Bug 1 (Vitals not all saving)
8. Work through Bugs 2-6 in order
9. After all 6 bugs are fixed + verified, proceed to Queue System + IPD

## QUESTIONS TO ASK THE USER

If you're unsure about anything, ask the user BEFORE making changes:
- "Should I add `pulse` and `spo2` fields to the Prescription model, or keep them as PLabel records?"
- "For the suggestions redesign, do you want complaints shown as accordion (expandable) or always-visible cards?"
- "For the queue drag-and-drop, should only the doctor see it, or also the receptionist?"

But DON'T ask questions that are answered in the documentation files. Read first, ask only if truly unclear.

---

## END OF PROMPT — Copy everything above this line

---

## 📌 Notes for the Human (you, the user)

### How to Use This Prompt

1. Open a new GLM 5.3 chat session
2. Copy everything between "COPY EVERYTHING BELOW THIS LINE" and "END OF PROMPT"
3. Paste it as the first message
4. GLM 5.3 will read the 3 files and start working

### Files Created for Handoff

| File | Purpose | Lines |
|------|---------|-------|
| `DOCTOROOMS-HANDBOOK.md` | Master document — everything about the project | ~600 |
| `NEXT-STEPS.md` | Pending work with priorities + fix instructions | ~400 |
| `GLM-PROMPT.md` | The prompt to give GLM 5.3 (this file) | ~250 |

### What GLM 5.3 Will Do (expected order)

1. Read 3 documentation files (~10 min)
2. Start dev server + verify login works (~5 min)
3. Fix Bug 1: Vitals not all saving (~30 min)
4. Fix Bug 2: "Lab Results" heading removal (~15 min)
5. Fix Bug 3: Medicines count mismatch (~15 min)
6. Fix Bug 4: Table cell values empty (~45 min — needs schema change)
7. Fix Bug 5: Next visit date (~15 min)
8. Fix Bug 6: Suggestions redesign (~90 min — the big one)
9. Queue system enhancements (~2 hours)
10. IPD system flow (~4 hours)
11. Testing + QA (~2 hours)

**Total estimated time: ~10-12 hours of AI work**

### What to Tell GLM 5.3 if It Gets Stuck

- "Read DOCTOROOMS-HANDBOOK.md section 8 — how to restart everything"
- "Check if .env has DEV_MODE=1 and db/custom.db exists"
- "Start the server with the exact pattern in GLM-PROMPT.md"
- "The server dies between Bash commands — that's normal. Restart it."
- "Use webpack not Turbopack or you'll get OOM killed"
- "Read worklog.md for the history of what was done"

### Push Updates to GitHub

After GLM 5.3 finishes work, push to GitHub:
```bash
cd /home/z/my-project
git add -A
git commit -m "Fix 6 prescription bugs + queue + IPD enhancements"
git push origin main
```

The remote is already configured: `https://github.com/doctorooms-creator/Doctorooms2.git`

---

*End of GLM-PROMPT.md*
