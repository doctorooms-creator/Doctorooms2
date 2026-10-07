import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, type AuthUser } from '@/lib/api-auth'
import { checkSeatWall, getEffectivePlan, getPlanUsage, getHospitalIdForUser } from '@/lib/plans'
import { logAction } from '@/lib/audit-log'
import { hash } from 'bcryptjs'

/**
 * Unified staff management API — hospital admin + solo doctor (clinic owner).
 *
 * Until now only the platform super-admin could create staff (admin route).
 * This route lets the hospital admin / doctor do it THEMSELVES, scoped to
 * their own hospital, with plan seat walls (Free 1+1+1 · Pro 3+3+3 ·
 * Hospital 15+15+10) enforced BEFORE any user row is created.
 *
 * GET  /api/dashboard/staff  → { staff, counts, seats, departments }
 * POST /api/dashboard/staff  → create staff (user + role row, rollback on failure)
 *
 * requireRole() takes a single role string, so authorization is
 * getAuthUser() + a manual 'hospital' | 'doctor' check.
 */

const STAFF_ROLES = ['receptionist', 'nurse', 'pharmacist', 'assistant', 'doctor'] as const
type StaffRole = (typeof STAFF_ROLES)[number]

const VALID_SHIFTS = ['Morning', 'Evening', 'Night']

/** Authorize hospital/doctor + resolve their hospitalId. */
async function authorizeAndResolve(
  request: NextRequest
): Promise<{ user: AuthUser; hospitalId: string } | { error: NextResponse }> {
  const user = await getAuthUser(request)
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (user.role !== 'hospital' && user.role !== 'doctor') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  if (user.role === 'hospital') {
    const hospital = await db.hospital.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!hospital) {
      return {
        error: NextResponse.json(
          { error: 'Hospital profile not found — complete onboarding first' },
          { status: 404 }
        ),
      }
    }
    return { user, hospitalId: hospital.id }
  }

  // Doctor → clinic via Doctor.hospitalId, then first active DoctorHospital link
  const hospitalId = await getHospitalIdForUser(user)
  if (!hospitalId) {
    return { error: NextResponse.json({ error: 'Practice setup incomplete' }, { status: 404 }) }
  }
  return { user, hospitalId }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAndResolve(request)
    if ('error' in auth) return auth.error
    const { hospitalId } = auth

    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role') || ''
    const search = searchParams.get('search') || ''

    // 1. Receptionists for this hospital
    const receptionists = await db.receptionist.findMany({
      where: { hospitalId },
      include: {
        user: { select: { name: true, email: true, gender: true, status: true, mobileNo: true, profileImg: true, createdAt: true } },
        department: { select: { name: true } },
      },
    })

    // 2. Nurses for this hospital
    const nurses = await db.staffNurse.findMany({
      where: { hospitalId },
      include: {
        user: { select: { name: true, email: true, gender: true, status: true, mobileNo: true, profileImg: true, createdAt: true } },
        ward: { select: { name: true } },
      },
    })

    // 3. Pharmacists for this hospital
    const pharmacists = await db.doctorPharmacist.findMany({
      where: { hospitalId },
      include: {
        user: { select: { name: true, email: true, gender: true, status: true, mobileNo: true, profileImg: true, createdAt: true } },
      },
    })

    // 4. Assistants whose doctor is linked to this hospital
    const doctorHospitalLinks = await db.doctorHospital.findMany({
      where: { hospitalId },
      select: { doctorId: true },
    })
    const linkedDoctorIds = doctorHospitalLinks.map((d) => d.doctorId)

    let assistants: {
      userId: string
      doctorId: string
      user: { name: string; email: string; gender: string; status: string; mobileNo: string; profileImg: string; createdAt: Date }
      doctor: { user: { name: string } }
    }[] = []

    if (linkedDoctorIds.length > 0) {
      assistants = await db.doctorAssistant.findMany({
        where: { doctorId: { in: linkedDoctorIds } },
        include: {
          user: { select: { name: true, email: true, gender: true, status: true, mobileNo: true, profileImg: true, createdAt: true } },
          doctor: { select: { user: { select: { name: true } } } },
        },
      })
    }

    // 5. Doctors linked to this hospital
    const doctorLinks = await db.doctorHospital.findMany({
      where: { hospitalId },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, email: true, gender: true, status: true, mobileNo: true, profileImg: true, createdAt: true } },
          },
        },
      },
    })

    // 6. Build unified staff array (newest first)
    const staff = [
      ...receptionists.map((r) => ({
        userId: r.userId,
        name: r.user.name,
        email: r.user.email,
        role: 'receptionist' as const,
        gender: r.user.gender,
        status: r.user.status,
        mobileNo: r.user.mobileNo,
        profileImg: r.user.profileImg,
        createdAt: r.user.createdAt,
        departmentName: r.department?.name || null,
      })),
      ...nurses.map((n) => ({
        userId: n.userId,
        name: n.user.name,
        email: n.user.email,
        role: 'nurse' as const,
        gender: n.user.gender,
        status: n.user.status,
        mobileNo: n.user.mobileNo,
        profileImg: n.user.profileImg,
        createdAt: n.user.createdAt,
        employeeId: n.employeeId || null,
        qualification: n.qualification || null,
        shift: n.shift || null,
        wardName: n.ward?.name || null,
      })),
      ...pharmacists.map((p) => ({
        userId: p.userId,
        name: p.user.name,
        email: p.user.email,
        role: 'pharmacist' as const,
        gender: p.user.gender,
        status: p.user.status,
        mobileNo: p.user.mobileNo,
        profileImg: p.user.profileImg,
        createdAt: p.user.createdAt,
      })),
      ...assistants.map((a) => ({
        userId: a.userId,
        name: a.user.name,
        email: a.user.email,
        role: 'assistant' as const,
        gender: a.user.gender,
        status: a.user.status,
        mobileNo: a.user.mobileNo,
        profileImg: a.user.profileImg,
        createdAt: a.user.createdAt,
        doctorName: a.doctor.user.name,
      })),
      ...doctorLinks.map((d) => ({
        userId: d.doctor.userId,
        name: d.doctor.user.name,
        email: d.doctor.user.email,
        role: 'doctor' as const,
        gender: d.doctor.user.gender,
        status: d.doctor.user.status,
        mobileNo: d.doctor.user.mobileNo,
        profileImg: d.doctor.user.profileImg,
        createdAt: d.doctor.user.createdAt,
        designation: d.designation,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 7. Apply filters (admin route pattern)
    let filtered = staff
    if (roleFilter) {
      filtered = filtered.filter((s) => s.role === roleFilter)
    }
    if (search) {
      const lowerSearch = search.toLowerCase()
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(lowerSearch) || s.email.toLowerCase().includes(lowerSearch)
      )
    }

    // 8. Seat usage snapshot (actual row counts — same counting as checkSeatWall)
    const eff = await getEffectivePlan(hospitalId)
    const usage = await getPlanUsage(hospitalId, eff)

    // 9. Departments (for the receptionist department select in the add dialog)
    const departments = await db.department.findMany({
      where: { hospitalId, status: 'Active' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      staff: filtered,
      counts: {
        receptionists: receptionists.length,
        nurses: nurses.length,
        pharmacists: pharmacists.length,
        assistants: assistants.length,
        doctors: doctorLinks.length,
      },
      seats: {
        planKey: eff.planKey,
        planName: eff.plan.name,
        receptionistSeats: usage.receptionistSeats,
        nurseSeats: usage.nurseSeats,
        doctorSeats: usage.doctorSeats,
      },
      departments,
    })
  } catch (error) {
    console.error('List staff error:', error)
    return NextResponse.json({ error: 'Failed to load staff' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeAndResolve(request)
    if ('error' in auth) return auth.error
    const { user, hospitalId } = auth

    const body = await request.json()
    const {
      role,
      name,
      email,
      password,
      gender,
      mobileNo,
      departmentId,
      doctorEmail,
      qualification,
      shift,
      employeeId,
    } = body

    // ── Validate required fields ──
    if (!role || !name || !email || !password) {
      return NextResponse.json(
        { error: 'role, name, email, and password are required' },
        { status: 400 }
      )
    }
    if (!STAFF_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${STAFF_ROLES.join(', ')}` },
        { status: 400 }
      )
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    if (shift && !VALID_SHIFTS.includes(shift)) {
      return NextResponse.json(
        { error: `Invalid shift. Must be one of: ${VALID_SHIFTS.join(', ')}` },
        { status: 400 }
      )
    }
    if (role === 'assistant' && user.role === 'hospital' && !doctorEmail) {
      return NextResponse.json(
        { error: 'doctorEmail is required for assistant role' },
        { status: 400 }
      )
    }

    // ── Plan seat walls FIRST (before any user create) ──
    // Growth-celebration framing per PRICING-STRATEGY §3.3 (never "denied").
    const seatRole =
      role === 'receptionist'
        ? 'receptionist_seats'
        : role === 'nurse'
          ? 'nurse_seats'
          : role === 'doctor'
            ? 'doctor_seats'
            : null
    if (seatRole) {
      const seat = await checkSeatWall(hospitalId, seatRole)
      if (seat.blocked && seat.wall) {
        return NextResponse.json({ error: seat.wall.message, upgrade: seat.wall }, { status: 402 })
      }
    }

    // ── Email uniqueness ──
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // ── Nurse employee ID uniqueness (when provided) ──
    if (role === 'nurse' && employeeId) {
      const existingEmployee = await db.staffNurse.findFirst({ where: { employeeId } })
      if (existingEmployee) {
        return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 })
      }
    }

    // ── Hash + create the user ──
    const hashedPassword = await hash(password, 10)
    const createdUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: 'Active',
        gender: gender || 'Male',
        mobileNo: mobileNo || '',
      },
    })

    // Rollback helper — admin route pattern: on role-row failure delete the user
    const rollbackUser = async () => {
      try {
        await db.user.delete({ where: { id: createdUser.id } })
      } catch (e) {
        console.error('Staff create rollback failed:', e)
      }
    }

    // ── Create role-specific profile record ──
    try {
      switch (role as StaffRole) {
        case 'receptionist': {
          if (departmentId) {
            const dept = await db.department.findFirst({
              where: { id: departmentId, hospitalId },
            })
            if (!dept) {
              await rollbackUser()
              return NextResponse.json(
                { error: 'Department not found in this hospital' },
                { status: 400 }
              )
            }
          }
          await db.receptionist.create({
            data: {
              userId: createdUser.id,
              hospitalId,
              departmentId: departmentId || null,
            },
          })
          break
        }

        case 'nurse': {
          await db.staffNurse.create({
            data: {
              userId: createdUser.id,
              hospitalId,
              employeeId: employeeId || `NUR-${Date.now().toString(36).toUpperCase()}`,
              qualification: qualification || '',
              designation: 'Staff Nurse',
              shift: shift || 'Morning',
              phoneNo: mobileNo || '',
              address: '',
            },
          })
          break
        }

        case 'pharmacist': {
          await db.doctorPharmacist.create({
            data: {
              userId: createdUser.id,
              hospitalId,
            },
          })
          break
        }

        case 'assistant': {
          let doctorId: string

          if (user.role === 'doctor') {
            // Doctor requester → assistant attaches to the requester themselves
            const ownDoctor = await db.doctor.findFirst({
              where: { userId: user.id },
              select: { id: true },
            })
            if (!ownDoctor) {
              await rollbackUser()
              return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
            }
            doctorId = ownDoctor.id
          } else {
            // Hospital requester → resolve the doctor by email (admin pattern)
            const doctorUser = await db.user.findUnique({ where: { email: doctorEmail } })
            if (!doctorUser || doctorUser.role !== 'doctor') {
              await rollbackUser()
              return NextResponse.json(
                { error: 'Doctor not found with the given email' },
                { status: 404 }
              )
            }
            const doctor = await db.doctor.findUnique({ where: { userId: doctorUser.id } })
            if (!doctor) {
              await rollbackUser()
              return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
            }
            doctorId = doctor.id
          }

          await db.doctorAssistant.create({
            data: {
              userId: createdUser.id,
              doctorId,
            },
          })
          break
        }

        case 'doctor': {
          const newDoctor = await db.doctor.create({
            data: {
              userId: createdUser.id,
              hospitalId,
            },
          })

          try {
            // Ensure the default GEN department exists
            let genDept = await db.department.findFirst({
              where: { hospitalId, shortCode: 'GEN' },
              select: { id: true },
            })
            if (!genDept) {
              genDept = await db.department.create({
                data: {
                  hospitalId,
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
            }

            // Link the doctor to the hospital — the piece the admin route forgot.
            // Without this the new doctor never appears in the hospital's doctor list.
            await db.doctorHospital.create({
              data: {
                doctorId: newDoctor.id,
                hospitalId,
                departmentId: genDept.id,
                designation: 'Consultant',
                status: 'Active',
                isAvailable: true,
              },
            })
          } catch (linkError) {
            console.error('Doctor link creation failed:', linkError)
            try {
              await db.doctor.delete({ where: { id: newDoctor.id } })
            } catch {
              // user delete below cascades anyway
            }
            await rollbackUser()
            return NextResponse.json({ error: 'Failed to link doctor to hospital' }, { status: 500 })
          }
          break
        }
      }
    } catch (roleError) {
      console.error('Role profile creation failed:', roleError)
      await rollbackUser()
      return NextResponse.json({ error: 'Failed to create staff profile' }, { status: 500 })
    }

    // ── Audit (fire-and-forget — never throws) ──
    await logAction({
      userId: user.id,
      userRole: user.role,
      userName: user.name,
      action: 'staff_created',
      entityType: 'staff',
      entityId: createdUser.id,
      description: `Created ${role} staff ${name} <${email}>`,
      metadata: {
        requesterId: user.id,
        requesterRole: user.role,
        createdEmail: email,
        role,
      },
      hospitalId,
    })

    return NextResponse.json(
      {
        userId: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create staff error:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
