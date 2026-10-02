import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// GET: List doctor's prescription templates
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const templates = await db.prescriptionTemplate.findMany({
      where: { doctorId: doctor.id },
      orderBy: [{ isCommon: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        diagnosis: t.diagnosis,
        medicines: JSON.parse(t.medicines || '[]'),
        labs: JSON.parse(t.labs || '[]'),
        advice: t.advice,
        followUpDays: t.followUpDays,
        isCommon: t.isCommon,
        createdAt: t.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Rx templates GET error:', error)
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 })
  }
}

// POST: Create a new template
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, diagnosis, medicines, labs, advice, followUpDays, isCommon } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    const template = await db.prescriptionTemplate.create({
      data: {
        doctorId: doctor.id,
        name: name.trim(),
        diagnosis: diagnosis || '',
        medicines: JSON.stringify(medicines || []),
        labs: JSON.stringify(labs || []),
        advice: advice || '',
        followUpDays: followUpDays || 7,
        isCommon: !!isCommon,
      },
    })

    return NextResponse.json({ template: { id: template.id } }, { status: 201 })
  } catch (error) {
    console.error('Rx template POST error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
