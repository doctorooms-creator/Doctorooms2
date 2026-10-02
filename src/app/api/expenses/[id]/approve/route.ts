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

// POST /api/expenses/[id]/approve — set status=Approved, approvedBy, approvedAt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.expense.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!auth.isAdmin && existing.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (existing.status !== 'Pending') {
      return NextResponse.json(
        { error: `Expense is in ${existing.status} state — only Pending expenses can be approved` },
        { status: 400 }
      )
    }

    const updated = await db.expense.update({
      where: { id },
      data: {
        status: 'Approved',
        approvedBy: auth.user.id,
        approvedAt: new Date(),
      },
      include: {
        category: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Expense approve error:', error)
    return NextResponse.json({ error: 'Failed to approve expense' }, { status: 500 })
  }
}
