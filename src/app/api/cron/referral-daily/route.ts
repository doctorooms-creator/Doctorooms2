import { NextRequest, NextResponse } from 'next/server'
import { runDailyReferralJobs } from '@/lib/referral'

/**
 * POST /api/cron/referral-daily   (header: x-cron-secret: <CRON_SECRET>)
 * Daily referral maintenance — idempotent, safe to re-run any time:
 *   a) auto-expire pending referrals > 90 days
 *   b) FIFO points-expiry materialization (18-month validity)
 *   c) stage-progression sweep (habit detection)
 *
 * Scheduled by mini-services/notification-service (runs it once after boot +
 * at most once per 20h). Protected by CRON_SECRET shared via .env — never
 * exposed to the browser.
 */
export const dynamic = 'force-dynamic'

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'Cron not configured (CRON_SECRET missing)' },
      { status: 503 }
    )
  }
  const provided = req.headers.get('x-cron-secret')
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runDailyReferralJobs()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[cron/referral-daily] error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return handle(req)
}

export async function GET(req: NextRequest) {
  return handle(req)
}
