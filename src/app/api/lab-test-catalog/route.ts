import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// GET — list this lab's tests. Optional ?category=Blood to filter; ?activeOnly=true.
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
    if (!partner)
      return NextResponse.json(
        { error: 'Lab partner profile not found' },
        { status: 404 }
      )

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || ''
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: Record<string, unknown> = { labPartnerId: partner.id }
    if (category) where.testCategory = category
    if (activeOnly) where.isActive = true

    const tests = await db.labTestCatalog.findMany({
      where,
      orderBy: [{ testCategory: 'asc' }, { testName: 'asc' }],
    })
    return NextResponse.json({ tests })
  } catch (error) {
    console.error('lab-test-catalog GET error:', error)
    return NextResponse.json({ error: 'Failed to load test catalog' }, { status: 500 })
  }
}

// POST — create a new test in this lab's catalog
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
    if (!partner)
      return NextResponse.json(
        { error: 'Lab partner profile not found' },
        { status: 404 }
      )

    const body = await req.json()
    const { testName, testCategory, fee, sampleType, turnaroundTime, isActive } = body

    if (!testName || !testName.trim()) {
      return NextResponse.json({ error: 'testName is required' }, { status: 400 })
    }
    if (
      !testCategory ||
      !['Blood', 'Radiology', 'Pathology', 'Other'].includes(testCategory)
    ) {
      return NextResponse.json(
        { error: 'testCategory must be Blood/Radiology/Pathology/Other' },
        { status: 400 }
      )
    }

    // Prevent duplicates within the same lab (case-insensitive test name).
    // NOTE: SQLite does not honor Prisma's `mode: 'insensitive'`, so we fetch
    // the lab's tests and compare names in JS — robust + intent-preserving.
    const existingTests = await db.labTestCatalog.findMany({
      where: { labPartnerId: partner.id },
      select: { id: true, testName: true },
    })
    const dup = existingTests.find(
      (t) => t.testName.toLowerCase() === testName.trim().toLowerCase()
    )
    if (dup) {
      return NextResponse.json(
        { error: 'A test with this name already exists in your catalog' },
        { status: 400 }
      )
    }

    const test = await db.labTestCatalog.create({
      data: {
        labPartnerId: partner.id,
        testName: testName.trim(),
        testCategory,
        fee: typeof fee === 'number' ? fee : parseFloat(fee) || 0,
        sampleType: sampleType || '',
        turnaroundTime: turnaroundTime || '',
        isActive: isActive !== false,
      },
    })
    return NextResponse.json({ test }, { status: 201 })
  } catch (error) {
    console.error('lab-test-catalog POST error:', error)
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}
