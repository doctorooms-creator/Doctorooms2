# ⏳ DEPLOY-PENDING — Aturseva production rollout, final 2 steps

**Status (verified live 2026-10-16):** Steps 1–5 of the single-DB Supabase migration are DONE
and verified — Vercel prod runs the new landing + full Aturseva UI (Phases 1–5), Supabase has
all 6 Aturseva tables + shared data, GitHub `origin/main` = `705e655` (in sync).

**What is still broken on production (both need owner-supplied credentials):**

| # | Symptom on prod | Root cause | Fix |
|---|---|---|---|
| 1 | Aturseva chat replies with fallback "abhi jawab nahi de pa rahi", 🔊 Sunein → 500 "Awaaz generate nahi ho payi" | `z-ai-web-dev-sdk` reads credentials from a `.z-ai-config` FILE that doesn't exist on Vercel. The repo already has the plumbing (`scripts/zai-config.js` writes it at build time from `ZAI_*` env vars; `next.config.ts` `outputFileTracingIncludes` bundles it into the 9 SDK routes) — but the Vercel project is missing (a) the `ZAI_*` env vars and (b) the updated buildCommand, and needs one redeploy. | Steps A–C below |
| 2 | Aturseva proactive pushes (toast/unread live update) rejected; Sevika scheduler (diet nudges / weekly report) dead on prod | Render realtime service still runs the Oct-3 build: `aturseva-push` not in VALID_EVENTS + no Sevika ticker. Stopgap currently active: the sandbox realtime-service ticks `sevika-tick` against the same Supabase DB, so nudges/reports still land in the shared DB (patients see them on next load — just no live toast). | Step D below |

Sandbox dev server (port 3000) + realtime (3006) are both live on the same Supabase DB and fully
working — the app code is proven correct; only the two deploy targets above are stale.

---

## A. Set the 5 ZAI_* env vars on Vercel (values from the sandbox)

Read the values in the sandbox with:

```bash
cat /etc/.z-ai-config
```

Set on the Vercel project `doctorooms-hms` (Dashboard → Settings → Environment Variables, or API):

| Vercel env var | Value source (key in /etc/.z-ai-config) |
|---|---|
| `ZAI_BASE_URL` | `baseUrl` |
| `ZAI_API_KEY` | `apiKey` |
| `ZAI_TOKEN` | `token` |
| `ZAI_CHAT_ID` | `chatId` |
| `ZAI_USER_ID` | `userId` |

## B. Update the Vercel buildCommand

Dashboard → Settings → General → Build Command, change:

```
prisma generate && next build --webpack
```

to:

```
node scripts/zai-config.js && prisma generate && next build --webpack
```

(`scripts/zai-config.js` writes `.z-ai-config` into the project root right before `next build`.)

## C. Deploy + verify

```bash
cd /home/z/my-project
bunx vercel deploy --prod --yes --token=<FRESH_VERCEL_TOKEN>
```

Verify after Ready (~3 min):

```bash
# login (patient qa-recall-aiims4@test.dev / 123456 — password upserted 2026-10-16)
curl -s -X POST https://doctorooms-hms.vercel.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa-recall-aiims4@test.dev","password":"123456"}' -c /tmp/pc.txt
# chat must stream a REAL LLM reply (not the "abhi jawab nahi de pa rahi" fallback):
curl -s -N -X POST https://doctorooms-hms.vercel.app/api/dashboard/patient/aturseva/chat \
  -H 'Content-Type: application/json' -b /tmp/pc.txt \
  -d '{"message":"Namaste! Meri dawai ka time kya hai?"}'
# TTS must return 200 audio/wav (not 500):
curl -s -X POST https://doctorooms-hms.vercel.app/api/dashboard/patient/aturseva/voice/speak \
  -H 'Content-Type: application/json' -b /tmp/pc.txt -d '{"text":"Namaste"}' -o /tmp/t.wav -w '%{http_code}'
```

## D. Redeploy Render realtime (service `doctorooms-realtime`, srv-db0dple0tbcc73fd472g)

Render does NOT auto-deploy on git push (webhook never fired). Trigger manually — Render
Dashboard → doctorooms-realtime → "Manual Deploy" → "Deploy latest commit", or with an API key:

```bash
curl -X POST https://api.render.com/api/v1/services/srv-db0dple0tbcc73fd472g/deploys \
  -H 'Authorization: Bearer <RENDER_API_KEY>' -H 'Content-Type: application/json' -d '{}'
```

The service env (Dashboard → Environment) must contain (existing 8 vars + 3 new):

| Env var | Value |
|---|---|
| `DATABASE_URL` | Supabase **transaction pooler** `...supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` (already set) |
| `NEXTAUTH_SECRET` | must hash-match the Vercel value (already set) |
| `REALTIME_STRICT_AUTH` | `1` (already set) |
| `REALTIME_EMIT_SECRET` | must match Vercel (already set) |
| `REALTIME_ALLOWED_ORIGINS` | `https://doctorooms-hms.vercel.app` (already set) |
| `PORT` | leave unset / Render-injected (already set) |
| `CRON_URL` | `https://doctorooms-hms.vercel.app/api/cron/referral-daily` (already set) |
| `CRON_SECRET` | must match Vercel CRON_SECRET (already set) |
| **`SEVIKA_TICK_URL`** (NEW) | `https://doctorooms-hms.vercel.app/api/cron/sevika-tick` |
| `SELF_PING_URL` | keep as-is (self-ping keep-alive) |

(`SEVIKA_TICK_URL` is the only truly new var — the Sevika 5-min ticker. If omitted it defaults
to localhost and the prod scheduler stays dead.)

Verify after deploy finishes:

```bash
curl -s https://doctorooms-realtime.onrender.com/health
# uptimeSec must be small (fresh boot), db: up
# then within ~6 min, prod Supabase AtursevaMessage rows gain diet-nudge/weekly-report rows
# (check dev sandbox: POST localhost:3000/api/cron/sevika-tick returns counts)
```

After Render is redeployed, the sandbox stopgap ticker becomes redundant but harmless
(both tickers are idempotent — DB-level dedup on nudges/reports).

---

### Already-done evidence (2026-10-16)

- Prod landing title: "Aturseva — See the doctor. Aturseva stays." (`GET /` 200)
- Prod `/api/public/stats`: `{"doctorCount":97,"hospitalCount":13,"patientCount":27,"bookingCount":28}`
- Prod patient login + dashboard + appointments + Aturseva page all render (agent-browser,
  screenshots `download/aturseva-qa/qa-restore2-01..04-prod-*.png`); Phase-5 voice UI present
  (Sunein buttons); socket CONNECTED; SW registered; zero console errors
- Supabase: all 6 Aturseva tables present; booking-E2E data verified
  (`qa-supabase-01-booking-e2e.png` — Dr. Amit Shah booking + check-in card)
- Sandbox chat on the same Supabase DB streams real LLM replies → app code correct,
  prod failure is env-config only
