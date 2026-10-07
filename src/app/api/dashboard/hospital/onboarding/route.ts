import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { logAction } from '@/lib/audit-log'
import { getEffectivePlan } from '@/lib/plans'

/**
 * ONBOARDING-1: Hospital/clinic self-serve onboarding.
 *
 * GET  → { exists, hospital?: { hospitalName, city, hospitalType }, planKey? }
 *        (planKey via getEffectivePlan — the Subscription row is the source of truth)
 *
 * POST → validates + creates, in ONE transaction:
 *   a. Hospital row (userId unique — one per owner account)
 *   b. Default "General Medicine" department (mirrors seed-clinic-scenario.ts)
 *   c. Subscription row — 'free' (active) or 'pro_trial' (pro, trialing,
 *      14-day trial, no card)
 * Audit: 'hospital_onboarded'. 409 if already onboarded, 400 on bad input.
 */

const HOSPITAL_TYPES = ['Clinic', 'Multi-Specialty', 'Single-Specialty', 'Diagnostic'] as const
const PLAN_CHOICES = ['free', 'pro_trial'] as const
const TRIAL_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

export async function GET(req: NextRequest) {
  const user = await requireRole(req, 'hospital')
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized — hospital login required' },
      { status: 401 }
    )
  }

  try {
    const hospital = await db.hospital.findUnique({
      where: { userId: user.id },
      select: { id: true, hospitalName: true, city: true, hospitalType: true },
    })

    if (!hospital) {
      return NextResponse.json({ success: true, exists: false })
    }

    const eff = await getEffectivePlan(hospital.id)
    return NextResponse.json({
      success: true,
      exists: true,
      hospital: {
        hospitalName: hospital.hospitalName,
        city: hospital.city,
        hospitalType: hospital.hospitalType,
      },
      planKey: eff.planKey,
    })
  } catch (error) {
    console.error('[hospital-onboarding] GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const user = await requireRole(req, 'hospital')
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized — hospital login required' },
      { status: 401 }
    )
  }

  try {
    const existing = await db.hospital.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Your hospital is already set up.' },
        { status: 409 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const hospitalName = typeof body.hospitalName === 'string' ? body.hospitalName.trim() : ''
    const hospitalType =
      typeof body.hospitalType === 'string' && (HOSPITAL_TYPES as readonly string[]).includes(body.hospitalType)
        ? body.hospitalType
        : 'Multi-Specialty'
    const address = typeof body.address === 'string' ? body.address.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const state = typeof body.state === 'string' ? body.state.trim() : ''
    const pincode = typeof body.pincode === 'string' ? body.pincode.trim() : ''
    const contactNo = typeof body.contactNo === 'string' ? body.contactNo.trim() : ''
    const about = typeof body.about === 'string' ? body.about.trim() : ''
    const planChoice =
      typeof body.planChoice === 'string' && (PLAN_CHOICES as readonly string[]).includes(body.planChoice)
        ? body.planChoice
        : 'free'

    // ── Validation (clear, actionable messages) ───────────────────────────
    if (!hospitalName) {
      return NextResponse.json(
        { success: false, message: 'Hospital name is required' },
        { status: 400 }
      )
    }
    if (hospitalName.length < 3 || hospitalName.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Hospital name must be between 3 and 100 characters' },
        { status: 400 }
      )
    }
    if (!city) {
      return NextResponse.json(
        { success: false, message: 'City is required' },
        { status: 400 }
      )
    }

    // ── One transaction: Hospital + default GEN department + Subscription ──
    const created = await db.$transaction(async (tx) => {
      const hospital = await tx.hospital.create({
        data: {
          userId: user.id,
          hospitalName,
          hospitalType,
          address,
          city,
          state,
          pincode,
          contactNo,
          about,
          email: user.email,
          status: 'Active',
        },
      })

      // Default OPD department — every downstream feature (DoctorHospital
      // links, receptionists, appointments) needs at least one department.
      const department = await tx.department.create({
        data: {
          hospitalId: hospital.id,
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

      const subscription =
        planChoice === 'pro_trial'
          ? await tx.subscription.create({
              data: {
                hospitalId: hospital.id,
                planKey: 'pro',
                status: 'trialing',
                trialEndsAt: new Date(Date.now() + TRIAL_MS),
                source: 'signup_trial',
              },
            })
          : await tx.subscription.create({
              data: {
                hospitalId: hospital.id,
                planKey: 'free',
                status: 'active',
                source: 'signup',
              },
            })

      return { hospital, department, subscription }
    })

    // Audit log (fire-and-forget style — never throws)
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'hospital_onboarded',
        entityType: 'hospital',
        entityId: created.hospital.id,
        description: `Hospital onboarded: ${created.hospital.hospitalName} (${created.hospital.hospitalType}, ${created.hospital.city}) — plan: ${planChoice === 'pro_trial' ? 'Pro 14-day trial' : 'Free'}`,
        severity: 'info',
        hospitalId: created.hospital.id,
        ipAddress: req.headers.get('x-forwarded-for') || '',
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[audit-log] hospital_onboarded capture failed:', auditErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Hospital created successfully!',
        hospital: {
          id: created.hospital.id,
          hospitalName: created.hospital.hospitalName,
          hospitalType: created.hospital.hospitalType,
          city: created.hospital.city,
          state: created.hospital.state,
          status: created.hospital.status,
        },
        department: { id: created.department.id, name: created.department.name },
        subscription: {
          planKey: created.subscription.planKey,
          status: created.subscription.status,
          trialEndsAt: created.subscription.trialEndsAt?.toISOString() ?? null,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[hospital-onboarding] POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
