import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { todayISTRange } from '@/lib/date-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'pharmacist')

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pharmacist = await db.doctorPharmacist.findUnique({
      where: { userId: user.id },
      select: { doctorId: true, hospitalId: true },
    })

    if (!pharmacist) {
      return NextResponse.json({ error: 'Pharmacist not found' }, { status: 404 })
    }

    const isHospitalMode = !!pharmacist.hospitalId && !pharmacist.doctorId
    const { start: todayStart, end: todayEnd } = todayISTRange()

    if (isHospitalMode) {
      // Hospital mode: get all doctor IDs linked to this hospital
      const hospitalDoctorLinks = await db.doctorHospital.findMany({
        where: { hospitalId: pharmacist.hospitalId },
        select: { doctorId: true },
      })
      const hospitalDoctorIds = hospitalDoctorLinks.map((d) => d.doctorId)

      const [hospital, totalPrescriptions, todayPrescriptions, pendingFulfillments, recentPrescriptions] =
        await Promise.all([
          db.hospital.findUnique({
            where: { id: pharmacist.hospitalId },
            include: { user: { select: { name: true, profileImg: true } } },
          }),
          db.prescription.count({
            where: { doctorId: { in: hospitalDoctorIds } },
          }),
          db.prescription.count({
            where: {
              doctorId: { in: hospitalDoctorIds },
              createdAt: { gte: todayStart, lte: todayEnd },
            },
          }),
          db.prescription.count({
            where: {
              doctorId: { in: hospitalDoctorIds },
              createdAt: { gte: todayStart, lte: todayEnd },
              fulfillmentStatus: 'Pending',
            },
          }),
          db.prescription.findMany({
            where: { doctorId: { in: hospitalDoctorIds } },
            orderBy: { createdAt: 'desc' },
            take: 8,
            include: {
              medicines: true,
              labels: true,
              booking: {
                select: {
                  tokenNumber: true,
                  appointmentNo: true,
                  age: true,
                  gender: true,
                },
              },
              doctor: {
                select: {
                  user: { select: { name: true } },
                  doctorHospitals: {
                    where: { hospitalId: pharmacist.hospitalId },
                    select: {
                      department: { select: { name: true } },
                    },
                    take: 1,
                  },
                },
              },
            },
          }),
        ])

      return NextResponse.json({
        isHospitalMode: true,
        totalPrescriptions,
        todayPrescriptions,
        pendingFulfillments,
        hospital: hospital
          ? {
              id: hospital.id,
              name: hospital.hospitalName,
              profileImg: hospital.image || null,
              hospitalType: hospital.hospitalType,
              address: hospital.address,
              city: hospital.city,
            }
          : null,
        doctor: null,
        recentPrescriptions: recentPrescriptions.map((rx) => ({
          id: rx.id,
          patientName: rx.patientName,
          patientAge: rx.booking?.age ? String(rx.booking.age) : rx.patientAge || '',
          patientGender: rx.booking?.gender || '',
          // Queue token — the searchable patient ID shown on the printed Rx
          tokenNumber: rx.booking?.tokenNumber || '',
          disease: rx.disease,
          description: rx.description,
          weight: rx.weight,
          bp: rx.bp,
          temperature: rx.temperature,
          createdAt: rx.createdAt,
          medicineCount: rx.medicines.length,
          fulfillmentStatus: rx.fulfillmentStatus,
          doctorName: rx.doctor.user.name,
          departmentName: rx.doctor.doctorHospitals[0]?.department?.name || null,
          medicines: rx.medicines.map((m) => ({
            id: m.id,
            medicine: m.medicine,
            morning: m.morning,
            afternoon: m.afternoon,
            evening: m.evening,
            tab: m.tab,
            dose: m.dose,
            description: m.description,
          })),
          labels: rx.labels.map((l) => ({
            id: l.id,
            label: l.label,
            labelEn: l.labelEn,
            value: l.value,
            labelUnit: l.labelUnit,
            showUnit: l.showUnit,
          })),
        })),
      })
    }

    // Clinic mode: original behavior
    const [totalPrescriptions, todayPrescriptions, pendingFulfillments, recentPrescriptions, doctor] =
      await Promise.all([
        db.prescription.count({
          where: { doctorId: pharmacist.doctorId! },
        }),
        db.prescription.count({
          where: {
            doctorId: pharmacist.doctorId!,
            createdAt: { gte: todayStart, lte: todayEnd },
          },
        }),
        db.prescription.count({
          where: {
            doctorId: pharmacist.doctorId!,
            createdAt: { gte: todayStart, lte: todayEnd },
            fulfillmentStatus: 'Pending',
          },
        }),
        db.prescription.findMany({
          where: { doctorId: pharmacist.doctorId! },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: {
            medicines: true,
            labels: true,
            booking: {
              select: {
                tokenNumber: true,
                appointmentNo: true,
                age: true,
                gender: true,
              },
            },
          },
        }),
        db.doctor.findUnique({
          where: { id: pharmacist.doctorId! },
          include: { user: { select: { name: true, profileImg: true } } },
        }),
      ])

    return NextResponse.json({
      isHospitalMode: false,
      totalPrescriptions,
      todayPrescriptions,
      pendingFulfillments,
      doctor: doctor
        ? {
            id: doctor.id,
            name: doctor.user.name,
            profileImg: doctor.user.profileImg,
            specialization: doctor.specialization,
          }
        : null,
      hospital: null,
      recentPrescriptions: recentPrescriptions.map((rx) => ({
        id: rx.id,
        patientName: rx.patientName,
        patientAge: rx.booking?.age ? String(rx.booking.age) : rx.patientAge || '',
        patientGender: rx.booking?.gender || '',
        // Queue token — the searchable patient ID shown on the printed Rx
        tokenNumber: rx.booking?.tokenNumber || '',
        disease: rx.disease,
        description: rx.description,
        weight: rx.weight,
        bp: rx.bp,
        temperature: rx.temperature,
        createdAt: rx.createdAt,
        medicineCount: rx.medicines.length,
        fulfillmentStatus: rx.fulfillmentStatus,
        medicines: rx.medicines.map((m) => ({
          id: m.id,
          medicine: m.medicine,
          morning: m.morning,
          afternoon: m.afternoon,
          evening: m.evening,
          tab: m.tab,
          dose: m.dose,
          description: m.description,
        })),
        labels: rx.labels.map((l) => ({
          id: l.id,
          label: l.label,
          labelEn: l.labelEn,
          value: l.value,
          labelUnit: l.labelUnit,
          showUnit: l.showUnit,
        })),
      })),
    })
  } catch (error) {
    console.error('Pharmacist stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
