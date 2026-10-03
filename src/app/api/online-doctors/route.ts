import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

/**
 * GET /api/online-doctors
 *   Any authenticated role: returns the list of currently-online doctors.
 *   Proxies to the notification mini-service's GET /online-doctors endpoint.
 *
 *   Response shape: { onlineDoctors: [{ userId, name, hospitalId }], count: number }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Proxy to the realtime service (merged chat+notif; env-driven URL so this
    // works in the sandbox AND on Vercel → Render). Server-to-server call uses
    // a direct URL (bypasses the gateway in dev).
    const res = await fetch(
      `${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006'}/online-doctors`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Short timeout — this is a real-time check
        signal: AbortSignal.timeout(3000),
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Notification service unavailable', onlineDoctors: [], count: 0 },
        { status: 503 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('online-doctors GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch online doctors', onlineDoctors: [], count: 0 },
      { status: 500 }
    )
  }
}
