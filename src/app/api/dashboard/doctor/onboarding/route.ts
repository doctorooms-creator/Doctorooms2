import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { logAction } from '@/lib/audit-log'
import { installPack } from '@/lib/specialty-packs/install'

/**
 * ONBOARDING-1: Doctor self-serve onboarding (solo practice, FREE plan —
 * the "registration play": every solo doctor gets the full clinic engine).
 *
 * GET  → { exists, doctor?: { specialization, city, fees } }
 *
 * POST → validates + creates, in ONE transaction:
 *   a. Clinic Hospital row (hospitalType 'Clinic' — 1-doctor clinic engine)
 *   b. Default "General Medicine" department (DoctorHospital requires one)
 *   c. Doctor profile row
 *   d. DoctorHospital link (Consultant, Active)
 *   e. Subscription { planKey: 'free', status: 'active', source: 'signup' }
 * Audit: 'doctor_onboarded'. 409 if already onboarded, 400 on bad input.
 */

// Onboarding creates clinic+dept+doctor+link+subscription AND installs the
// specialty starter pack (500+ rows, ~40-60s on the serverless pooler).
// maxDuration=60 guarantees the install never truncates on slow DB rounds.
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const user = await requireRole(req, 'doctor')
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized — doctor login required' },
      { status: 401 }
    )
  }

  try {
    const doctor = await db.doctor.findFirst({
      where: { userId: user.id },
      select: { specialization: true, city: true, fees: true },
    })

    return NextResponse.json({
      success: true,
      exists: Boolean(doctor),
      ...(doctor
        ? { doctor: { specialization: doctor.specialization, city: doctor.city, fees: doctor.fees } }
        : {}),
    })
  } catch (error) {
    console.error('[doctor-onboarding] GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const user = await requireRole(req, 'doctor')
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized — doctor login required' },
      { status: 401 }
    )
  }

  try {
    const existing = await db.doctor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Your doctor profile is already set up.' },
        { status: 409 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const specialization =
      typeof body.specialization === 'string' ? body.specialization.trim() : ''
    const education = typeof body.education === 'string' ? body.education.trim() : ''
    const experience = typeof body.experience === 'string' ? body.experience.trim() : ''
    const registrationDetail =
      typeof body.registrationDetail === 'string' ? body.registrationDetail.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const state = typeof body.state === 'string' ? body.state.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const clinicNameRaw =
      typeof body.clinicName === 'string' && body.clinicName.trim() ? body.clinicName.trim() : ''

    let fees = 300
    if (body.fees !== undefined && body.fees !== null && body.fees !== '') {
      const parsed = Number(body.fees)
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json(
          { success: false, message: 'Consultation fees must be a number of 0 or more' },
          { status: 400 }
        )
      }
      fees = parsed
    }
    const clinicName = clinicNameRaw || `${user.name} Clinic`

    // ── Validation (clear, actionable messages) ───────────────────────────
    if (!specialization) {
      return NextResponse.json(
        { success: false, message: 'Specialization is required' },
        { status: 400 }
      )
    }
    if (!city) {
      return NextResponse.json(
        { success: false, message: 'City is required' },
        { status: 400 }
      )
    }

    // ── One transaction: clinic + dept + doctor + link + subscription ─────
    const created = await db.$transaction(async (tx) => {
      // a. The doctor's own clinic (Hospital row, type 'Clinic')
      const clinic = await tx.hospital.create({
        data: {
          userId: user.id,
          hospitalName: clinicName,
          hospitalType: 'Clinic',
          address: '',
          city,
          state,
          contactNo: user.mobileNo || '',
          email: user.email,
          status: 'Active',
        },
      })

      // b. Default GEN department — DoctorHospital.departmentId is REQUIRED
      //    (this is why the clinic needs a department before the link).
      const department = await tx.department.create({
        data: {
          hospitalId: clinic.id,
          name: 'General Medicine',
          nameHi: 'सामान्य चिकित्सा',
          shortCode: 'GEN',
          description: 'Default OPD department',
          icon: 'stethoscope',
          floorNo: 'Ground',
          opdRoom: 'OPD-1',
          status: 'Active',
          sortOrder: 1,
        },
      })

      // c. Doctor profile row (most fields have schema defaults)
      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          specialization,
          education,
          experience: String(experience ?? ''),
          registrationDetail,
          city,
          state,
          description,
          fees,
          hospitalId: clinic.id,
          contactNo: user.mobileNo || '',
        },
      })

      // d. DoctorHospital link (departmentId required — GEN dept above)
      const link = await tx.doctorHospital.create({
        data: {
          doctorId: doctor.id,
          hospitalId: clinic.id,
          departmentId: department.id,
          designation: 'Consultant',
          fees,
          status: 'Active',
          isAvailable: true,
        },
      })

      // e. FREE plan subscription — solo doctors get the full clinic engine
      //    (1 doctor + 1 receptionist + 1 nurse seats, see src/lib/plans.ts)
      const subscription = await tx.subscription.create({
        data: {
          hospitalId: clinic.id,
          planKey: 'free',
          status: 'active',
          source: 'signup',
        },
      })

      return { clinic, department, doctor, link, subscription }
    })

    // ── Specialty Starter Pack (P0): auto-install on launch. Non-blocking —
    // onboarding NEVER fails because of pack issues (docs/specialty-packs/03 §6 T1).
    let pack: Awaited<ReturnType<typeof installPack>> = null
    try {
      pack = await installPack({
        userId: user.id,
        doctorId: created.doctor.id,
        specialization,
        installedById: null, // system install
      })
    } catch (packErr) {
      console.error('[doctor-onboarding] starter pack install failed (non-blocking):', packErr)
    }

    // Audit log (fire-and-forget style — never throws)
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'doctor_onboarded',
        entityType: 'doctor',
        entityId: created.doctor.id,
        description: `Doctor onboarded: ${user.name} (${specialization}, ${city}) — clinic: ${created.clinic.hospitalName} on Free plan${pack && pack.ok ? `; starter pack ${pack.packCode} v${pack.version} installed (${pack.summary})` : ''}`,
        severity: 'info',
        hospitalId: created.clinic.id,
        ipAddress: req.headers.get('x-forwarded-for') || '',
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[audit-log] doctor_onboarded capture failed:', auditErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Doctor profile created successfully!',
        doctor: {
          id: created.doctor.id,
          specialization: created.doctor.specialization,
          city: created.doctor.city,
          fees: created.doctor.fees,
        },
        clinic: {
          id: created.clinic.id,
          hospitalName: created.clinic.hospitalName,
          hospitalType: created.clinic.hospitalType,
          city: created.clinic.city,
        },
        subscription: {
          planKey: created.subscription.planKey,
          status: created.subscription.status,
        },
        ...(pack && pack.ok
          ? {
              starterPack: {
                code: pack.packCode,
                version: pack.version,
                title: pack.title,
                summary: pack.summary,
                skipped: pack.skipped,
                unverifiedDoses: pack.unverified,
              },
            }
          : {}),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[doctor-onboarding] POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
