import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { todayISTRange } from '@/lib/date-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receptionist = await db.receptionist.findUnique({
      where: { userId: user.id },
    })

    if (!receptionist) {
      return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 })
    }

    const { start: todayStart, end: todayEnd } = todayISTRange()

    // ── Hospital Mode: receptionist has hospitalId but no doctorId ──
    const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

    if (isHospitalMode) {
      // Get all doctor IDs linked to this hospital
      const hospitalDoctors = await db.doctorHospital.findMany({
        where: { hospitalId: receptionist.hospitalId, status: 'Active' },
        select: { doctorId: true },
      })
      const doctorIds = hospitalDoctors.map((d) => d.doctorId)

      const [todayAppointments, todayVisited, pendingApprovals, todayAppointmentsList] = await Promise.all([
        db.booking.count({
          where: {
            doctorId: { in: doctorIds },
            hospitalId: receptionist.hospitalId,
            bookingDate: { gte: todayStart, lte: todayEnd },
          },
        }),
        db.booking.count({
          where: {
            doctorId: { in: doctorIds },
            hospitalId: receptionist.hospitalId,
            status: 'Visited',
            bookingDate: { gte: todayStart, lte: todayEnd },
          },
        }),
        db.booking.count({
          where: {
            doctorId: { in: doctorIds },
            hospitalId: receptionist.hospitalId,
            status: 'Pending',
          },
        }),
        db.booking.findMany({
          where: {
            doctorId: { in: doctorIds },
            hospitalId: receptionist.hospitalId,
            bookingDate: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            doctor: {
              include: { user: { select: { name: true, profileImg: true } } },
            },
            user: { select: { name: true, profileImg: true } },
          },
        }),
      ])

      // Get hospital info
      const hospital = await db.hospital.findUnique({
        where: { id: receptionist.hospitalId! },
      })

      // Get department counts for today
      const deptCounts = await db.booking.groupBy({
        by: ['departmentId'],
        where: {
          hospitalId: receptionist.hospitalId,
          bookingDate: { gte: todayStart, lte: todayEnd },
        },
        _count: true,
      })

      // ── Enrich departments for the dashboard cards (crash fix: the page
      // expects id/name/shortCode/todayCount/activeDoctors — previously the
      // API only returned {departmentId, count}, so dept.shortCode was
      // undefined and .toUpperCase() crashed the whole dashboard in
      // Hospital Mode) ──
      const deptIds = deptCounts.map((d) => d.departmentId).filter((id): id is string => !!id)
      const [deptInfos, activeDoctorLinks] = await Promise.all([
        db.department.findMany({
          where: { id: { in: deptIds } },
          select: { id: true, name: true, shortCode: true, icon: true },
        }),
        db.doctorHospital.findMany({
          where: { hospitalId: receptionist.hospitalId, status: 'Active' },
          select: { departmentId: true },
        }),
      ])
      const deptInfoMap = new Map(deptInfos.map((d) => [d.id, d]))
      const activeDoctorsByDept = new Map<string, number>()
      for (const link of activeDoctorLinks) {
        if (!link.departmentId) continue
        activeDoctorsByDept.set(
          link.departmentId,
          (activeDoctorsByDept.get(link.departmentId) || 0) + 1
        )
      }
      const departments = deptCounts
        .map((d) => {
          const info = d.departmentId ? deptInfoMap.get(d.departmentId) : undefined
          return {
            id: d.departmentId || 'unassigned',
            name: info?.name || 'General OPD',
            shortCode: info?.shortCode || 'OPD',
            icon: info?.icon || '',
            todayCount: d._count,
            activeDoctors: d.departmentId
              ? activeDoctorsByDept.get(d.departmentId) || 0
              : hospitalDoctors.length,
          }
        })
        .filter((d) => d.todayCount > 0)

      return NextResponse.json({
        todayAppointments,
        todayVisited,
        pendingApprovals,
        isHospitalMode: true,
        hospital: hospital
          ? {
              hospitalName: hospital.hospitalName,
              address: hospital.address,
              city: hospital.city,
              state: hospital.state,
              contactNo: hospital.contactNo,
            }
          : null,
        doctor: null,
        departments,
        todayAppointmentsList: todayAppointmentsList.map((b) => ({
          id: b.id,
          appointmentNo: b.appointmentNo,
          patientName: b.patientName || b.user?.name || 'Walk-in',
          patientImg: b.user?.profileImg,
          doctorName: b.doctor?.user?.name || 'Unknown',
          date: b.bookingDate,
          status: b.status,
          disease: b.disease,
          charge: b.appointmentCharge,
        })),
      })
    }

    // ── Clinic Mode: receptionist has a specific doctorId ──
    const [todayAppointments, todayVisited, pendingApprovals, todayAppointmentsList, doctor] =
      await Promise.all([
        db.booking.count({
          where: {
            doctorId: receptionist.doctorId,
            bookingDate: { gte: todayStart, lte: todayEnd },
          },
        }),
        db.booking.count({
          where: {
            doctorId: receptionist.doctorId,
            status: 'Visited',
            bookingDate: { gte: todayStart, lte: todayEnd },
          },
        }),
        db.booking.count({
          where: {
            doctorId: receptionist.doctorId,
            status: 'Pending',
          },
        }),
        db.booking.findMany({
          where: {
            doctorId: receptionist.doctorId,
            bookingDate: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              include: { user: { select: { name: true, profileImg: true } } },
            },
            user: { select: { name: true, profileImg: true } },
          },
        }),
        db.doctor.findUnique({
          where: { id: receptionist.doctorId! },
          include: {
            user: { select: { name: true, profileImg: true } },
          },
        }),
      ])

    return NextResponse.json({
      todayAppointments,
      todayVisited,
      pendingApprovals,
      isHospitalMode: false,
      doctor: doctor
        ? {
            id: doctor.id,
            name: doctor.user.name,
            profileImg: doctor.user.profileImg,
            specialization: doctor.specialization,
            contactNo: doctor.contactNo,
            hospitalAddress: doctor.hospitalAddress,
            city: doctor.city,
            state: doctor.state,
          }
        : null,
      hospital: doctor
        ? {
            hospitalName: doctor.hospitalAddress ? 'Clinic / Hospital' : '',
            address: doctor.hospitalAddress,
            city: doctor.city,
            state: doctor.state,
            contactNo: doctor.contactNo,
          }
        : null,
      todayAppointmentsList: todayAppointmentsList.map((b) => ({
        id: b.id,
        appointmentNo: b.appointmentNo,
        patientName: b.patientName || b.user?.name || 'Walk-in',
        patientImg: b.user?.profileImg,
        doctorName: b.doctor?.user?.name || 'Unknown',
        date: b.bookingDate,
        status: b.status,
        disease: b.disease,
        charge: b.appointmentCharge,
      })),
    })
  } catch (error) {
    console.error('Receptionist stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
