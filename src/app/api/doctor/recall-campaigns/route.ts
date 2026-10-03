import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import {
  getRecallPlanGate,
  DORMANT_MIN,
  DORMANT_MAX,
  TEMPLATE_MIN,
  TEMPLATE_MAX,
} from '@/lib/recall'

/**
 * GET /api/doctor/recall-campaigns
 * List the logged-in doctor's recall campaigns (+ recipient counts) and the
 * plan-gate state (Free = max 1 SENT campaign; Trialing/Pro = unlimited).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const [campaigns, gate] = await Promise.all([
      db.recallCampaign.findMany({
        where: { doctorId: doctor.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          template: true,
          dormantDays: true,
          status: true,
          recipientCount: true,
          createdAt: true,
          sentAt: true,
        },
      }),
      getRecallPlanGate(user.id),
    ])

    return NextResponse.json({
      campaigns,
      plan: { key: gate.planKey, status: gate.status, name: gate.planName },
      sentCampaignCount: gate.sentCampaignCount,
      canSend: gate.canSend,
      gated: gate.gated,
      upgrade: gate.upgrade,
    })
  } catch (error) {
    console.error('[recall-campaigns] list error:', error)
    return NextResponse.json({ error: 'Failed to load recall campaigns' }, { status: 500 })
  }
}

/**
 * POST /api/doctor/recall-campaigns
 * Create a DRAFT campaign. Drafts are unlimited on every plan — the plan gate
 * fires on SEND (and on the audience preview list), matching the
 * lost-revenue teaser convention.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => null)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const template = typeof body?.template === 'string' ? body.template.trim() : ''
    const dormantDays = Number(body?.dormantDays)

    if (!name || name.length > 80) {
      return NextResponse.json({ error: 'Campaign name chahiye (1-80 characters)' }, { status: 400 })
    }
    if (template.length < TEMPLATE_MIN || template.length > TEMPLATE_MAX) {
      return NextResponse.json(
        { error: `Message ${TEMPLATE_MIN}-${TEMPLATE_MAX} characters ka hona chahiye` },
        { status: 400 }
      )
    }
    if (!Number.isFinite(dormantDays) || dormantDays < DORMANT_MIN || dormantDays > DORMANT_MAX) {
      return NextResponse.json(
        { error: `Dormant days ${DORMANT_MIN} se ${DORMANT_MAX} ke beech hona chahiye` },
        { status: 400 }
      )
    }

    const campaign = await db.recallCampaign.create({
      data: { doctorId: doctor.id, name, template, dormantDays: Math.round(dormantDays) },
      select: {
        id: true,
        name: true,
        template: true,
        dormantDays: true,
        status: true,
        recipientCount: true,
        createdAt: true,
        sentAt: true,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('[recall-campaigns] create error:', error)
    return NextResponse.json({ error: 'Failed to create recall campaign' }, { status: 500 })
  }
}
