import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

/**
 * GET /api/notification-preferences
 *   Any logged-in user: fetch their own notification preferences.
 *   Auto-creates a default row if none exists yet (sound on, critical chime on, no muted events, no email digest).
 *
 * PUT /api/notification-preferences
 *   Any logged-in user: update their own preferences.
 *   Body: {
 *     mutedEvents?: string[],            // list of event types to mute (toast + sound suppressed)
 *     soundEnabled?: boolean,            // master sound toggle
 *     criticalChimeEnabled?: boolean,    // play chime on critical events
 *     emailDigest?: 'never' | 'daily' | 'weekly',
 *   }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Upsert — ensure a row exists for this user
    const pref = await db.notificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    })

    let mutedEvents: string[] = []
    try {
      const parsed = JSON.parse(pref.mutedEvents || '[]')
      if (Array.isArray(parsed)) mutedEvents = parsed.filter((e) => typeof e === 'string')
    } catch {
      // ignore parse errors
    }

    return NextResponse.json({
      preferences: {
        id: pref.id,
        userId: pref.userId,
        mutedEvents,
        soundEnabled: pref.soundEnabled,
        criticalChimeEnabled: pref.criticalChimeEnabled,
        emailDigest: pref.emailDigest,
        updatedAt: pref.updatedAt,
      },
    })
  } catch (error) {
    console.error('notification-preferences GET error:', error)
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { mutedEvents, soundEnabled, criticalChimeEnabled, emailDigest } = body

    const data: Record<string, unknown> = {}
    if (Array.isArray(mutedEvents)) {
      data.mutedEvents = JSON.stringify(mutedEvents.filter((e: unknown) => typeof e === 'string'))
    }
    if (typeof soundEnabled === 'boolean') data.soundEnabled = soundEnabled
    if (typeof criticalChimeEnabled === 'boolean') data.criticalChimeEnabled = criticalChimeEnabled
    if (['never', 'daily', 'weekly'].includes(emailDigest)) data.emailDigest = emailDigest

    const pref = await db.notificationPreference.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        mutedEvents: data.mutedEvents as string || '[]',
        soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
        criticalChimeEnabled: typeof data.criticalChimeEnabled === 'boolean' ? data.criticalChimeEnabled : true,
        emailDigest: typeof data.emailDigest === 'string' ? data.emailDigest : 'never',
      },
    })

    let mutedEventsArr: string[] = []
    try {
      const parsed = JSON.parse(pref.mutedEvents || '[]')
      if (Array.isArray(parsed)) mutedEventsArr = parsed.filter((e) => typeof e === 'string')
    } catch {}

    return NextResponse.json({
      preferences: {
        id: pref.id,
        userId: pref.userId,
        mutedEvents: mutedEventsArr,
        soundEnabled: pref.soundEnabled,
        criticalChimeEnabled: pref.criticalChimeEnabled,
        emailDigest: pref.emailDigest,
        updatedAt: pref.updatedAt,
      },
    })
  } catch (error) {
    console.error('notification-preferences PUT error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
