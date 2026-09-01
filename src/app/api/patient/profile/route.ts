import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { logUpdate } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNo: true,
        gender: true,
        profileImg: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Patient profile error:', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, mobileNo, gender } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Capture the pre-update profile snapshot for the audit log (P2.8)
    const before = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, mobileNo: true, gender: true },
    })

    const updated = await db.user.update({
      where: { id: user.id },
      data: { name, mobileNo: mobileNo || '', gender: gender || 'Male' },
      select: { id: true, name: true, email: true, mobileNo: true, gender: true, profileImg: true },
    })

    // AUDIT (P2.8): Record patient profile update.
    try {
      const auditCtx = getAuditContext(req)
      await logUpdate(
        'user_profile',
        user.id,
        user,
        'Updated profile (name/mobile/gender)',
        before
          ? { id: before.id, name: before.name, mobileNo: before.mobileNo, gender: before.gender }
          : undefined,
        { id: updated.id, name: updated.name, mobileNo: updated.mobileNo, gender: updated.gender },
        { ...auditCtx }
      )
    } catch (auditErr) {
      console.error('[audit-log] profile update capture failed:', auditErr)
    }

    return NextResponse.json({ profile: updated })
  } catch (error) {
    console.error('Patient profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
