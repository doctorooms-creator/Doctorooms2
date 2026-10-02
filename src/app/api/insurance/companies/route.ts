import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// GET: List all insurance companies
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'hospital') || await requireRole(req, 'admin') || await requireRole(req, 'receptionist') || await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companies = await db.insuranceCompany.findMany({
      where: { status: 'Active' },
      orderBy: { name: 'asc' },
      include: { _count: { select: { tpas: true, policies: true } } },
    })

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Insurance companies GET error:', error)
    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 })
  }
}

// POST: Create (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, code, type, contactNo, email, website, cashlessSupported } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 })
    }

    const company = await db.insuranceCompany.create({
      data: { name, code: code.toUpperCase(), type: type || 'General', contactNo, email, website, cashlessSupported: !!cashlessSupported },
    })

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    console.error('Insurance company POST error:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
