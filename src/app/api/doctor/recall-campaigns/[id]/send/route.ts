import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import {
  getDormantAudience,
  getDoctorRecallContext,
  getRecallPlanGate,
  renderRecallTemplate,
  buildWhatsappUrl,
  normalizeIndianPhone,
} from '@/lib/recall'

/**
 * POST /api/doctor/recall-campaigns/[id]/send
 *
 * Freezes the audience: renders the message per dormant patient, stores one
 * RecallCampaignRecipient row per patient (name + as-dialled digits + the
 * wa.me deep link), flips the campaign to SENT, and creates a DB Notification
 * for every patient (in-app bell — the $0 channel; the WhatsApp send itself
 * is manual, via the wa.me links in the results view).
 *
 * Realtime: DB-notification only — no existing whitelisted socket event fits
 * a recall message, and the spec prefers NOT adding new event names to the
 * realtime service.
 *
 * Plan gate: Free/Expired doctors may send their FIRST campaign only
 * (HTTP 402 + upgrade wall afterwards — soft-wall convention). Trialing +
 * Pro/Hospital send unlimited.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ctx = await getDoctorRecallContext(user.id)
    if (!ctx) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { id } = await params
    const campaign = await db.recallCampaign.findFirst({
      where: { id, doctorId: ctx.doctorRowId },
      select: { id: true, name: true, template: true, dormantDays: true, status: true },
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Yeh campaign already sent hai' }, { status: 400 })
    }

    // Plan gate (soft wall): free/expired = first campaign free, then 402.
    const gate = await getRecallPlanGate(user.id)
    if (!gate.canSend) {
      return NextResponse.json(
        {
          error: 'Free plan mein 1 recall campaign milta hai',
          upgrade: gate.upgrade,
        },
        { status: 402 }
      )
    }

    // Freeze the audience NOW (sent-time snapshot, not dialog-preview time).
    const { audience } = await getDormantAudience(ctx.doctorRowId, campaign.dormantDays)
    if (audience.length === 0) {
      return NextResponse.json(
        { error: 'Is window mein koi dormant patient nahi mila — window bada karein' },
        { status: 400 }
      )
    }

    const sentAt = new Date()

    // Render per-patient: message + wa.me link (digits-only phone, 91 prefix
    // for 10-digit Indian numbers, URL-encoded text).
    const recipientRows = audience.map((p) => {
      const message = renderRecallTemplate(campaign.template, {
        patientName: p.name,
        doctorName: ctx.doctorName,
        clinicName: ctx.clinicName,
      })
      return {
        campaignId: campaign.id,
        patientId: p.patientId,
        patientName: p.name,
        phone: normalizeIndianPhone(p.phone),
        whatsappUrl: buildWhatsappUrl(p.phone, message),
        sentAt,
      }
    })

    // In-app notifications for every patient (DB-only — see file header).
    const notificationRows = recipientRows.map((r) => ({
      userId: r.patientId,
      title: `${ctx.doctorName} ne aapko yaad dilaya hai`,
      message: renderRecallTemplate(campaign.template, {
        patientName: r.patientName,
        doctorName: ctx.doctorName,
        clinicName: ctx.clinicName,
      }),
    }))

    const updated = await db.$transaction(async (tx) => {
      await tx.recallCampaignRecipient.createMany({ data: recipientRows })
      await tx.notification.createMany({ data: notificationRows })
      return tx.recallCampaign.update({
        where: { id: campaign.id },
        data: { status: 'SENT', recipientCount: recipientRows.length, sentAt },
        select: {
          id: true,
          name: true,
          status: true,
          recipientCount: true,
          sentAt: true,
        },
      })
    })

    return NextResponse.json({
      campaign: updated,
      recipientsCreated: recipientRows.length,
      notificationsCreated: notificationRows.length,
    })
  } catch (error) {
    console.error('[recall-campaigns] send error:', error)
    return NextResponse.json({ error: 'Failed to send recall campaign' }, { status: 500 })
  }
}
