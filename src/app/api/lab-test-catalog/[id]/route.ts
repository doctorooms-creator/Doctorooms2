import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params { params: Promise<{ id: string }> }

// PUT — update test fields (partial update; undefined fields are skipped by Prisma)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
    if (!partner)
      return NextResponse.json(
        { error: 'Lab partner profile not found' },
        { status: 404 }
      )

    const { id } = await params
    const existing = await db.labTestCatalog.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.labPartnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const updated = await db.labTestCatalog.update({
      where: { id },
      data: {
        testName: body.testName?.trim() || undefined,
        testCategory: ['Blood', 'Radiology', 'Pathology', 'Other'].includes(
          body.testCategory
        )
          ? body.testCategory
          : undefined,
        fee:
          typeof body.fee === 'number'
            ? body.fee
            : body.fee
              ? parseFloat(body.fee)
              : undefined,
        sampleType: body.sampleType ?? undefined,
        turnaroundTime: body.turnaroundTime ?? undefined,
        isActive:
          typeof body.isActive === 'boolean' ? body.isActive : undefined,
      },
    })
    return NextResponse.json({ test: updated })
  } catch (error) {
    console.error('lab-test-catalog PUT error:', error)
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

// DELETE — hard delete (tests are usually just removed when no longer offered)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
    if (!partner)
      return NextResponse.json(
        { error: 'Lab partner profile not found' },
        { status: 404 }
      )

    const { id } = await params
    const existing = await db.labTestCatalog.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.labPartnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.labTestCatalog.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('lab-test-catalog DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
  }
}
