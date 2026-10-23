import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * Receptionist Booking Desk preferences — per-receptionist "desk memory".
 * Stored inside User.settingsJson under the `receptionBookingPrefs` key so it
 * survives devices/browsers without a new table.
 *
 * Shape:
 *   {
 *     departmentId?: string   // last-used department (hospital mode)
 *     doctorId?: string       // last-used doctor
 *     autoPrint?: boolean     // auto-print the token slip on every booking
 *   }
 */

type BookingPrefs = {
  departmentId?: string
  doctorId?: string
  autoPrint?: boolean
}

const PREFS_KEY = 'receptionBookingPrefs'

async function readPrefs(userId: string): Promise<BookingPrefs> {
  const userData = await db.user.findUnique({
    where: { id: userId },
    select: { settingsJson: true },
  })
  if (!userData?.settingsJson) return {}
  try {
    const parsed = JSON.parse(userData.settingsJson)
    const prefs = parsed?.[PREFS_KEY]
    return prefs && typeof prefs === 'object' ? (prefs as BookingPrefs) : {}
  } catch {
    return {}
  }
}

async function writePrefs(userId: string, updates: BookingPrefs) {
  const userData = await db.user.findUnique({
    where: { id: userId },
    select: { settingsJson: true },
  })
  let root: Record<string, unknown> = {}
  if (userData?.settingsJson) {
    try {
      root = JSON.parse(userData.settingsJson) || {}
    } catch {
      root = {}
    }
  }
  const merged: BookingPrefs = { ...(root[PREFS_KEY] || {}), ...updates }
  // Never store empty strings — undefined means "not set"
  if (!merged.departmentId) delete merged.departmentId
  if (!merged.doctorId) delete merged.doctorId
  root[PREFS_KEY] = merged
  await db.user.update({
    where: { id: userId },
    data: { settingsJson: JSON.stringify(root) },
  })
  return merged
}

// GET — fetch prefs (called once when the Booking Desk mounts)
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const prefs = await readPrefs(user.id)
    return NextResponse.json({ prefs })
  } catch (error) {
    console.error('Get booking prefs error:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// PUT — merge-update prefs (fire-and-forget from the desk: last-used dept/doctor,
// auto-print toggle). Values are validated; unknown keys are ignored.
export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(req, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json().catch(() => ({}))
    const updates: BookingPrefs = {}
    // '' (empty string) = explicit CLEAR of the remembered value (JSON.stringify
    // drops undefined keys, so the client sends '' when it wants to forget).
    if (typeof body.departmentId === 'string') updates.departmentId = body.departmentId.trim() || undefined
    if (typeof body.doctorId === 'string') updates.doctorId = body.doctorId.trim() || undefined
    if (typeof body.autoPrint === 'boolean') updates.autoPrint = body.autoPrint

    const prefs = await writePrefs(user.id, updates)
    return NextResponse.json({ prefs })
  } catch (error) {
    console.error('Update booking prefs error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
