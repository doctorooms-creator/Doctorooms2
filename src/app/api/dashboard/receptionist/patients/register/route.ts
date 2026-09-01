import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8)
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receptionist = await db.receptionist.findUnique({
      where: { userId: user.id },
    })

    if (!receptionist) {
      return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, mobile, gender } = body

    if (!name || !mobile || !gender) {
      return NextResponse.json(
        { error: 'Name, mobile, and gender are required' },
        { status: 400 },
      )
    }

    // Phone dedup (Phase 4 "Queue Resilience") — PRIMARY guard: the mobile
    // number is how walk-in/express booking links existing patients, so a
    // second account with the same number silently forks their history.
    // Empty mobiles never match (mobile is required + trimmed here).
    const trimmedMobile = String(mobile).trim()
    const existingByMobile = await db.user.findFirst({
      where: { mobileNo: trimmedMobile, role: 'patient' },
      select: { id: true, email: true },
    })
    if (existingByMobile) {
      return NextResponse.json(
        {
          error:
            'A patient with this mobile number already exists. Use the walk-in form to book for them, or register with a different number.',
        },
        { status: 409 },
      )
    }

    // Generated emails are DETERMINISTIC per mobile (was patient_<timestamp>
    // which made this email check vacuous — it could never fire). Explicit
    // emails are checked as-is.
    const generatedEmail =
      email || `patient_${trimmedMobile.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@doctorooms.com`

    // Email dedup (SECONDARY guard — the phone check above is primary).
    const existingUser = await db.user.findUnique({
      where: { email: generatedEmail },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A patient with this email already exists' },
        { status: 409 },
      )
    }

    const randomPassword = generateRandomPassword()
    const hashedPassword = await bcrypt.hashSync(randomPassword, 10)

    const newUser = await db.user.create({
      data: {
        name,
        email: generatedEmail.toLowerCase(),
        mobileNo: trimmedMobile,
        gender,
        role: 'patient',
        status: 'Active',
        password: hashedPassword,
        profileImg: 'default.png',
      },
    })

    return NextResponse.json(
      {
        success: true,
        patient: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          mobileNo: newUser.mobileNo,
          gender: newUser.gender,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Register patient error:', error)
    return NextResponse.json(
      { error: 'Failed to register patient' },
      { status: 500 },
    )
  }
}
