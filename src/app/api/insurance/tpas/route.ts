import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'hospital') || await requireRole(req, 'admin') || await requireRole(req, 'receptionist') || await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tpas = await db.tpaMaster.findMany({
      where: { status: 'Active' },
      orderBy: { name: 'asc' },
      include: { company: { select: { name: true, code: true } } },
    })

    return NextResponse.json({ tpas })
  } catch (error) {
    console.error('TPAs GET error:', error)
    return NextResponse.json({ error: 'Failed to load TPAs' }, { status: 500 })
  }
}
