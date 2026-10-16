import { NextRequest, NextResponse } from 'next/server'
import { runSevikaTick } from '@/lib/sevika/schedule'
import { runAtursevaProactiveTick } from '@/lib/aturseva/scheduler'
import { createNotification } from '@/lib/emit-notification'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cron/sevika-tick   (header: x-cron-secret: <CRON_SECRET>)
 * Sevika's heartbeat — called by realtime-service every 5 minutes:
 *   1. due doses (last 15 min) → in-app notification + status Reminded
 *   2. overdue doses (> grace window) → one gentle follow-up + Missed
 *   3. finished schedules → Completed
 *
 * Idempotent + safe to curl manually for testing.
 * Auth: x-cron-secret or Bearer (same as referral-daily). When CRON_SECRET
 * is unset but DEV_MODE=1, the tick is allowed (dev sandbox convenience —
 * the realtime-service ticker needs no secret setup to work locally).
 */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const provided = req.headers.get('x-cron-secret')
    const auth = req.headers.get('authorization') || ''
    if (provided !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (process.env.DEV_MODE !== '1') {
    return NextResponse.json(
      { error: 'Cron not configured (CRON_SECRET missing)' },
      { status: 503 }
    )
  }

  try {
    const result = await runSevikaTick(async (p) => {
      await createNotification(p.userId, p.title, p.message, {
        event: p.event,
        payload: { message: p.message, title: p.title, doseId: p.doseId },
      })
    })
    // Phase 4: Aturseva scheduled proactivity (diet nudges + Sunday weekly
    // report). Fire-and-report — it NEVER throws (internally guarded).
    const aturseva = await runAtursevaProactiveTick()
    return NextResponse.json({ success: true, ...result, aturseva })
  } catch (err) {
    console.error('[cron/sevika-tick] error:', err)
    return NextResponse.json({ error: 'Sevika tick failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return handle(req)
}

export async function GET(req: NextRequest) {
  return handle(req)
}
