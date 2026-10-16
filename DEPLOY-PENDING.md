# ⏳ DEPLOY-PENDING — Aturseva production rollout

**Last updated 2026-10-16 (after Vercel token session + provider abstraction deploy).**

## ✅ DONE since last update

- **Vercel redeploy executed** (token worked): prod now runs commit `3905be6` — the
  landing + full Aturseva UI + voice + the new **LLM provider abstraction**. Build green
  (custom buildCommand `node scripts/zai-config.js && prisma generate && next build --webpack`,
  `.z-ai-config` written with real values, 439 static pages, `/leaderboard` exports cleanly).
- **Mis-link incident fixed**: `vercel deploy --yes` had silently re-linked to a junk project
  "my-project" (created Oct 7 by an earlier session, no env vars — caused two failed builds).
  `.vercel/project.json` now pins `doctorooms-hms` **with the `projectName` field** (prevents
  recurrence). Deploy commands MUST include `--scope aditya-2b2c`.
- **Sandbox hard-reset #7 recovered**: env fully reconstructed by **decrypting the Vercel
  project's env vars via API** (DATABASE_URL transformed transaction→session pooler). This is
  the recovery playbook for future resets.

## 🔴 P0 — Production AI brain needs ONE thing from the owner: a public LLM API key

**Why:** `z-ai-web-dev-sdk` talks to `internal-api.z.ai` — PRIVATE z.ai-network IPs
(172.25.x.x), unreachable from Vercel/Render (verified live in runtime logs: ConnectTimeout).
The public `api.z.ai` rejects the sandbox JWT (401). This is a platform boundary: the SDK is
a sandbox dev tool, not a production API.

**The fix is already deployed** (`src/lib/aturseva/llm-provider.ts`): the app now supports any
OpenAI-compatible public provider via env vars — chat streaming, TTS, and ASR all switch
automatically. The sandbox keeps using the SDK (zero behavior change there).

### Owner steps (Vercel Dashboard → doctorooms-hms → Settings → Environment Variables):

| Env var | Value |
|---|---|
| `LLM_BASE_URL` | e.g. `https://api.z.ai/api/paas/v4` (z.ai open platform) or any OpenAI-compatible base |
| `LLM_API_KEY` | your API key from that provider |
| `LLM_MODEL` | e.g. `glm-4.6` (z.ai) or the provider's model id |

Optional (voice mode on prod — without these, chat works but 🔊/🎤 degrade gracefully):

| Env var | Value |
|---|---|
| `TTS_BASE_URL` | OpenAI-compatible base with `/audio/speech` (OpenAI: `https://api.openai.com/v1`) |
| `TTS_API_KEY` | provider key |
| `TTS_MODEL` | e.g. `tts-1` / `gpt-4o-mini-tts` |
| `TTS_VOICE` | provider voice id (e.g. `alloy`) — maps Aturseva's voice on prod |
| `ASR_BASE_URL` | OpenAI-compatible base with `/audio/transcriptions` |
| `ASR_API_KEY` | provider key |
| `ASR_MODEL` | e.g. `whisper-1` |

**Then redeploy** (Dashboard → Deployments → latest → ⋯ → Redeploy — no CLI token needed;
env vars only take effect on a new deployment). Verify:

```bash
curl -s -X POST https://doctorooms-hms.vercel.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa-recall-aiims4@test.dev","password":"123456"}' -c /tmp/pc.txt
curl -s -N -X POST https://doctorooms-hms.vercel.app/api/dashboard/patient/aturseva/chat \
  -H 'Content-Type: application/json' -b /tmp/pc.txt \
  -d '{"message":"Namaste! Meri dawai ka time kya hai?"}'
# → must stream a real reply (today it returns the honest fallback:
#   "Aturseva abhi jawab nahi de pa rahi" — expected until the key is set)
```

## 🟠 P1 — Render realtime redeploy (needs owner Render API key `rnd_...`)

Service `doctorooms-realtime` (`srv-db0dple0tbcc73fd472g`) still runs the Oct-3 build:
`aturseva-push` socket event rejected + no Sevika scheduler on prod. Render does NOT
auto-deploy on git push. Trigger manually (Dashboard → doctorooms-realtime → Manual Deploy →
Deploy latest commit) and add ONE new env var:

| Env var | Value |
|---|---|
| `SEVIKA_TICK_URL` | `https://doctorooms-hms.vercel.app/api/cron/sevika-tick` |

(The other 8 vars are already set. The sandbox's own 5-min ticker keeps writing diet nudges
+ weekly reports into the SHARED Supabase DB as a working stopgap — both tickers are
DB-idempotent, so overlap is safe.)

## 🧹 Cleanup pending (safe, low priority)

- Junk Vercel project **"my-project"** (`prj_DrI4cUuH1FX2u07KG5INXyTtJRvy`, domain
  `my-project-ivory-ten-47.vercel.app`, zero traffic) — deletable via Dashboard →
  Settings → Delete, or: `curl -X DELETE https://api.vercel.com/v9/projects/prj_DrI4cUuH1FX2u07KG5INXyTtJRvy?teamId=team_hZdjcz6cYZF3uarVVRwDtrgN -H "Authorization: Bearer <token>"`

## Already-verified evidence (2026-10-16)

- Prod landing/login/dashboard/appointments/Aturseva page all render (qa-restore2-01..04
  screenshots); Phase-5 voice UI present; socket CONNECTED; zero console errors
- Build log: `[zai-config] wrote .z-ai-config (baseUrl set: true)` → SDK config file
  plumbing WORKS on Vercel; the failure is purely the internal endpoint's network boundary
- Sandbox E2E through the new provider abstraction: chat streams real LLM replies, TTS 200
  (456KB canonical WAV), ASR round-trip transcribes — SDK path unchanged
