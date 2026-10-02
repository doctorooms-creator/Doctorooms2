import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    let hospitalId: string | null = null
    if (user.role === 'receptionist') {
      const r = await db.receptionist.findFirst({ where: { userId: user.id }, select: { hospitalId: true } })
      hospitalId = r?.hospitalId || null
    } else if (user.role === 'hospital' || user.role === 'admin') {
      const h = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      hospitalId = h?.id || null
    }
    if (!hospitalId) return NextResponse.json({ departments: [] })
    const departments = await db.department.findMany({ where: { hospitalId, status: 'Active' }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, nameHi: true, shortCode: true, icon: true, floorNo: true, opdRoom: true } })
    return NextResponse.json({ departments })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
