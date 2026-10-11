import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const actionSchema = z.object({
  action: z.enum(['taken', 'skipped', 'snooze']),
})

/**
 * PATCH /api/dashboard/patient/sevika/doses/[id]
 * Patient marks a dose: taken / skipped / snooze (+10 min).
 * Snooze keeps the dose Pending with a new dueAt — the ticker will
 * gently remind again in 10 minutes (max 2 snoozes are practical;
 * after that the grace window auto-misses).
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const dose = await db.sevikaDose.findFirst({
      where: { id, userId: user.id },
    })
    if (!dose) return NextResponse.json({ error: 'Dose not found' }, { status: 404 })

    const body = await req.json().catch(() => null)
    const parsed = actionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const now = new Date()
    let data: { status: string; actionAt?: Date; dueAt?: Date }

    switch (parsed.data.action) {
      case 'taken':
        data = { status: 'Taken', actionAt: now }
        break
      case 'skipped':
        data = { status: 'Skipped', actionAt: now }
        break
      case 'snooze':
      default:
        data = { status: 'Pending', dueAt: new Date(now.getTime() + 10 * 60 * 1000) }
        break
    }

    const updated = await db.sevikaDose.update({
      where: { id: dose.id },
      data,
    })

    return NextResponse.json({ dose: updated })
  } catch (err) {
    console.error('[sevika/doses/[id] PATCH] error:', err)
    return NextResponse.json({ error: 'Failed to update dose' }, { status: 500 })
  }
}
