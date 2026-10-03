import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { buildUpgradeWall } from '@/lib/plans'
import {
  getDormantAudience,
  getDoctorRecallContext,
  getRecallPlanGate,
  DORMANT_MIN,
  DORMANT_MAX,
  FREE_SENT_CAMPAIGN_LIMIT,
} from '@/lib/recall'

/**
 * GET /api/doctor/recall-campaigns/audience?dormantDays=90
 *
 * The dormant-patient audience: patients whose latest REAL booking
 * (Approve/Visited/Finish/Completed) with this doctor is older than N days.
 * In-memory cached for 60s per (doctor, window) — the groupBy pass over
 * bookings is the expensive part.
 *
 * Plan treatment (lost-revenue teaser convention):
 *   - EVERY plan sees the true count + withoutPhone count (the pain must be
 *     visible to convert).
 *   - Free/Expired: patient list capped at PREVIEW_CAP_FREE rows + wall hint.
 *   - Trialing/Pro/Hospital: list capped at PREVIEW_CAP_PRO (UI perf only).
 */
const PREVIEW_CAP_FREE = 5
const PREVIEW_CAP_PRO = 50

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dormantDays = Number(searchParams.get('dormantDays') || 90)
    if (!Number.isFinite(dormantDays) || dormantDays < DORMANT_MIN || dormantDays > DORMANT_MAX) {
      return NextResponse.json(
        { error: `dormantDays ${DORMANT_MIN}-${DORMANT_MAX} ke beech hona chahiye` },
        { status: 400 }
      )
    }

    const ctx = await getDoctorRecallContext(user.id)
    if (!ctx) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const [{ audience, withoutPhone, cached }, gate] = await Promise.all([
      getDormantAudience(ctx.doctorRowId, Math.round(dormantDays)),
      getRecallPlanGate(user.id),
    ])

    const cap = gate.gated ? PREVIEW_CAP_FREE : PREVIEW_CAP_PRO
    const sample = audience.slice(0, cap)

    return NextResponse.json({
      dormantDays: Math.round(dormantDays),
      count: audience.length,
      withoutPhone,
      patients: sample,
      sampleSize: sample.length,
      listCapped: audience.length > sample.length,
      gated: gate.gated,
      canSend: gate.canSend,
      plan: { key: gate.planKey, status: gate.status, name: gate.planName },
      upgrade: gate.gated ? buildUpgradeWall('recall_campaigns', gate.sentCampaignCount, FREE_SENT_CAMPAIGN_LIMIT, 'free') : null,
      context: { doctorName: ctx.doctorName, clinicName: ctx.clinicName },
      cached,
    })
  } catch (error) {
    console.error('[recall-audience] error:', error)
    return NextResponse.json({ error: 'Failed to build dormant audience' }, { status: 500 })
  }
}
