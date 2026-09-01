# Doctorooms — Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, verify ALL of these are done:

### Code
- [ ] `DEV_MODE` is NOT set (or empty) in production `.env`
- [ ] `NEXTAUTH_SECRET` is set (32+ hex chars — `openssl rand -hex 32`)
- [ ] `DATABASE_URL` points to PostgreSQL (NOT SQLite)
- [ ] `REDIS_URL` is set (for multi-instance rate limiting)
- [ ] `CLOUDINARY_*` env vars are set
- [ ] `RESEND_API_KEY` + `FROM_EMAIL` are set (for email verification)
- [ ] `SMS_PROVIDER` is set to `msg91` or `twilio` (NOT `log`)
- [ ] `SENTRY_DSN` is set
- [ ] `NEXT_PUBLIC_APP_URL` is set to the production domain

### Infrastructure
- [ ] PostgreSQL database provisioned (Neon, Supabase, or self-hosted)
- [ ] Redis instance provisioned (Upstash, Redis Cloud, or self-hosted)
- [ ] Domain registered + DNS configured
- [ ] HTTPS certificate (automatic via Caddy, Vercel, or Cloudflare)
- [ ] Cloudinary account configured (for medical file storage)
- [ ] Resend.com account configured (for email verification)
- [ ] MSG91 or Twilio account configured (for SMS notifications)
- [ ] Sentry project created (for error reporting)

### Database
- [ ] Schema switched from SQLite to PostgreSQL in `prisma/schema.prisma`
- [ ] `bun run db:push` executed against PostgreSQL
- [ ] Data migrated from SQLite using `bun run src/scripts/migrate-to-postgres.ts`
- [ ] Verify row counts match between SQLite and PostgreSQL
- [ ] Backup taken of the PostgreSQL database after migration

### Tests
- [ ] `bun run lint` passes
- [ ] Playwright E2E tests pass: `npx playwright test`
- [ ] k6 load test baseline captured: `k6 run tests/load/doctors-list.k6.js`
- [ ] Manual smoke test of critical paths (login, booking, file upload, print)

---

## Deployment Steps (Vercel + Neon + Upstash)

### 1. Provision infrastructure
- **PostgreSQL**: Sign up at [Neon](https://neon.tech) (free tier: 3GB). Create a database → copy connection string.
- **Redis**: Sign up at [Upstash](https://upstash.com) (free tier: 10k commands/day). Create a Redis DB → copy URL.
- **Cloudinary**: Already configured (check `.env` for credentials).
- **Resend**: Sign up at [resend.com](https://resend.com) → verify your domain → get API key.
- **Sentry**: Sign up at [sentry.io](https://sentry.io) → create a Next.js project → get DSN.

### 2. Update schema for PostgreSQL
```bash
# In prisma/schema.prisma, change:
#   datasource db {
#     provider = "sqlite"
#     url      = env("DATABASE_URL")
#   }
# To:
#   datasource db {
#     provider = "postgresql"
#     url      = env("DATABASE_URL")
#   }
```

### 3. Set production env vars
Set these in Vercel (Settings → Environment Variables) or your hosting platform:
```
NODE_ENV=production
DEV_MODE=                          # MUST BE EMPTY
NEXTAUTH_SECRET=<your-32-byte-hex-secret>
DATABASE_URL=postgresql://...      # Neon connection string
REDIS_URL=rediss://...             # Upstash URL (note: rediss:// for TLS)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
FROM_EMAIL=noreply@yourdomain.com
SMS_PROVIDER=msg91                # or twilio
MSG91_AUTH_KEY=...
SENTRY_DSN=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Migrate data
```bash
# Set DATABASE_URL to PostgreSQL connection string
export DATABASE_URL="postgresql://..."

# Push schema to PostgreSQL
bun run db:push

# Migrate data from SQLite to PostgreSQL
bun run src/scripts/migrate-to-postgres.ts

# Verify row counts
```

### 5. Deploy
```bash
# Deploy to Vercel
vercel --prod

# Or push to git → auto-deploy via CI/CD
```

### 6. Post-deploy verification
```bash
# Verify the app is up
curl -I https://yourdomain.com/
# → Should return 200 with security headers

# Verify dev-login is disabled in production
curl -X POST https://yourdomain.com/api/dev-login -H "Content-Type: application/json" -d '{"role":"admin"}'
# → Should return 404

# Verify rate limiting
for i in $(seq 1 12); do curl -o /dev/null -w "%{http_code}\n" -X POST https://yourdomain.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"x"}'; done
# → Should see 429 after 10 attempts
```

---

## Backup + Restore

### PostgreSQL Backup
```bash
# Daily backup (run via cron at 2 AM)
pg_dump $DATABASE_URL > backups/doctorooms-$(date +%Y%m%d).sql

# Or use Neon's automatic daily backups (Dashboard → Backups)
# Or use Supabase's automatic daily backups (Dashboard → Database → Backups)
```

### PostgreSQL Restore
```bash
# Restore from backup file
psql $DATABASE_URL < backups/doctorooms-20260819.sql

# Or restore from Neon/Supabase dashboard (point-in-time recovery)
```

### Redis Backup
- Upstash: automatic daily backups (Dashboard → Backups)
- Self-hosted: `redis-cli BGSAVE` → copy `dump.rdb`

### Cloudinary Backup
- Cloudinary does NOT provide automatic backups
- Critical medical files should also be backed up to S3/Supabase Storage
- TODO (Phase 7): implement a Cloudinary → S3 sync script

---

## Rollback Procedure

If the production deployment has issues:

1. **Roll back the code**: `vercel --rollback` (Vercel) or redeploy the previous git commit.
2. **Roll back the database**: Restore from the last backup via `psql $DATABASE_URL < backups/doctorooms-YYYYMMDD.sql` (or Neon/Supabase point-in-time recovery).
3. **Switch DNS**: If the domain is broken, point it to the old deployment via your DNS provider.

---

## Monitoring + Alerting

### Sentry
- Errors → Sentry dashboard (email alerts on new errors)
- Setup: `npx @sentry/wizard@latest -i nextjs` → follow the wizard

### Uptime
- Use [Better Stack](https://betterstack.com) or [UptimeRobot](https://uptimerobot.com) → monitor `https://yourdomain.com/api/auth/me` (should return 200 or 401)

### Database
- Neon/Supabase: built-in slow query monitoring
- Self-hosted: enable `pg_stat_statements` extension

### Redis
- Upstash: built-in command analytics + latency monitoring

---

## Runbook (Common Incidents)

### "Patients can't login"
1. Check Sentry for errors → look for `[auth/login]` or `[session]` errors
2. Check if `NEXTAUTH_SECRET` is set → `echo $NEXTAUTH_SECRET` on the server
3. Check if `DATABASE_URL` is reachable → `psql $DATABASE_URL -c "SELECT 1"`
4. Check if `REDIS_URL` is reachable → `redis-cli -u $REDIS_URL ping`
5. If sessions are being revoked unexpectedly → check if `DEV_MODE` is accidentally set in production env

### "Rate limiting not working"
1. Check if `REDIS_URL` is set → if not, rate limiting falls back to in-memory (single-instance only)
2. Check Redis connection → `redis-cli -u $REDIS_URL ping` should return `PONG`
3. Check Redis memory → `redis-cli -u $REDIS_URL info memory` → `used_memory` should be < 80% of max

### "Medical files not downloading"
1. Check Cloudinary credentials → `CLOUDINARY_*` env vars
2. Check if the proxy route returns 401 → auth issue
3. Check if Cloudinary is reachable → `curl https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/ping`

### "Email verification not sending"
1. Check `RESEND_API_KEY` is set
2. Check `FROM_EMAIL` domain is verified in Resend dashboard
3. Check Resend logs → dashboard → Logs tab

### "SMS not sending"
1. Check `SMS_PROVIDER` env var (should be `msg91` or `twilio`, NOT `log`)
2. Check `MSG91_AUTH_KEY` or `TWILIO_*` credentials
3. Check provider dashboard for delivery reports
