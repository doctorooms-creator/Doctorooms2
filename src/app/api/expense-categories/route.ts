import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

async function getAuth(request: NextRequest) {
  let user = await requireRole(request, 'hospital')
  if (!user) user = await requireRole(request, 'admin')
  if (!user) return null

  if (user.role === 'admin') {
    const url = new URL(request.url)
    const hospitalId = url.searchParams.get('hospitalId')
    return { user, hospitalId: hospitalId || null, isAdmin: true }
  }

  const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
  if (!hospital) return null
  return { user, hospitalId: hospital.id, isAdmin: false }
}

// GET /api/expense-categories — list
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { hospitalId } = auth

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined

    const where: Record<string, unknown> = {}
    if (hospitalId) where.hospitalId = hospitalId
    if (status) where.status = status
    if (type) where.type = type

    const categories = await db.expenseCategory.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { expenses: true } } },
    })

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error('Expense categories GET error:', error)
    return NextResponse.json({ error: 'Failed to load expense categories' }, { status: 500 })
  }
}

// POST /api/expense-categories — create
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { hospitalId, isAdmin } = auth

    const body = await request.json()
    const targetHospitalId = isAdmin ? body.hospitalId : hospitalId
    if (!targetHospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 })
    }
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const type = body.type === 'Capital' ? 'Capital' : 'Operating'

    const category = await db.expenseCategory.create({
      data: {
        hospitalId: targetHospitalId,
        name: body.name.trim(),
        type,
        description: typeof body.description === 'string' ? body.description.trim() : '',
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    console.error('Expense categories POST error:', error)
    return NextResponse.json({ error: 'Failed to create expense category' }, { status: 500 })
  }
}
