import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

async function getAuth(request: NextRequest) {
  let user = await requireRole(request, 'hospital')
  if (!user) user = await requireRole(request, 'admin')
  if (!user) return null

  if (user.role === 'admin') {
    return { user, hospitalId: null as string | null, isAdmin: true }
  }

  const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
  if (!hospital) return null
  return { user, hospitalId: hospital.id, isAdmin: false }
}

// GET /api/expense-categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const category = await db.expenseCategory.findUnique({
      where: { id },
      include: { _count: { select: { expenses: true } } },
    })
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!auth.isAdmin && category.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('Expense category GET error:', error)
    return NextResponse.json({ error: 'Failed to load expense category' }, { status: 500 })
  }
}

// PUT /api/expense-categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.expenseCategory.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!auth.isAdmin && existing.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const updated = await db.expenseCategory.update({
      where: { id },
      data: {
        name: typeof body.name === 'string' ? body.name.trim() : undefined,
        type: body.type === 'Capital' ? 'Capital' : body.type === 'Operating' ? 'Operating' : undefined,
        description: typeof body.description === 'string' ? body.description.trim() : undefined,
        status: typeof body.status === 'string' ? body.status : undefined,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Expense category PUT error:', error)
    return NextResponse.json({ error: 'Failed to update expense category' }, { status: 500 })
  }
}
