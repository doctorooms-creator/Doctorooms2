import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { provisionTrial } from '@/lib/plans'
import { logAction } from '@/lib/audit-log'
import { createNotification } from '@/lib/emit-notification'

/**
 * POST /api/admin/trial   body: { hospitalId, days? }
 * Admin ops tool: grant (or restart) a Pro trial for a hospital.
 * Default 14 days. Never downgrades a live paid subscription.
 * Also notifies the hospital owner so they know Pro unlocked.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, 'admin')
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const hospitalId = typeof body.hospitalId === 'string' ? body.hospitalId : ''
    const days = Math.min(Math.max(Number(body.days) || 14, 1), 60)

    if (!hospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 })
    }

    const hospital = await db.hospital.findUnique({
      where: { id: hospitalId },
      select: { id: true, hospitalName: true, userId: true },
    })
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    const result = await provisionTrial(hospitalId, { days, source: 'admin' })
    if (!result.ok) {
      return NextResponse.json(
        { error: 'Hospital already has an active paid subscription — trial not granted' },
        { status: 409 }
      )
    }

    // Tell the owner their Pro trial just started (DB row + live toast)
    if (hospital.userId) {
      await createNotification(
        hospital.userId,
        '🎁 Pro Trial Activated',
        `Aapke hospital "${hospital.hospitalName}" ke liye ${days}-din ka Pro trial activate ho gaya hai! WhatsApp reminders, recall campaigns, AI Copilot — sab kuch unlocked. Enjoy!`,
        {
          event: 'celebration',
          payload: {
            title: '🎁 Pro Trial Activated!',
            message: `${days} din ka full Pro access unlocked — enjoy!`,
            kind: 'trial',
          },
        }
      ).catch(() => {})
    }

    await logAction({
      userId: admin.id,
      userRole: admin.role,
      userName: admin.name,
      action: 'grant-trial',
      entityType: 'subscription',
      entityId: hospitalId,
      description: `Granted ${days}-day Pro trial to ${hospital.hospitalName}`,
      severity: 'info',
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      hospitalId,
      days,
      trialEndsAt: result.trialEndsAt?.toISOString(),
    })
  } catch (error) {
    console.error('[admin/trial] POST error:', error)
    return NextResponse.json({ error: 'Failed to grant trial' }, { status: 500 })
  }
}
