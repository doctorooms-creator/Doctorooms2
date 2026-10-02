import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            patientName: true,
            age: true,
            gender: true,
            bloodGroup: true,
            disease: true,
            timeSlot: true,
            bookingDate: true,
          },
        },
        doctor: {
          select: {
            id: true,
            // NOTE: contactNo/phoneNo live on the Doctor model, NOT on User.
            // (Selecting them under `user` caused "Unknown field `contactNo`" 500s.)
            contactNo: true,
            phoneNo: true,
            user: { select: { name: true, email: true, mobileNo: true } },
            specialization: true,
            address: true,
            city: true,
            state: true,
            registrationDetail: true,
          },
        },
        // PCo has NO relation to CoMaster (only raw coId), so we fetch the
        // CoMaster rows separately below and merge them into chiefComplaints.
        chiefComplaints: true,
        labels: true,
        medicines: true,
        suggestions: true,
        diagnosisTables: true,
      },
    })

    if (!prescription || prescription.doctorId !== prescription.doctor.id) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    // Hydrate chief complaints with their CoMaster details (client expects
    // chiefComplaints[].co.{coDetail, coDetailEn, ...}).
    const coIds = prescription.chiefComplaints.map((c) => c.coId).filter(Boolean)
    const coMasters = coIds.length
      ? await db.coMaster.findMany({ where: { id: { in: coIds } } })
      : []
    const coMap = new Map(coMasters.map((c) => [c.id, c]))

    const chiefComplaints = prescription.chiefComplaints.map((c) => {
      const co = coMap.get(c.coId)
      return {
        ...c,
        co: co
          ? { id: co.id, coDetail: co.coDetail, coDetailEn: co.coDetailEn, coCode: co.coCode }
          : null,
      }
    })

    // Map doctor-level phone fields into `doctor.user` so the client type
    // (step-6-finish.tsx expects doctor.user.contactNo/phoneNo) keeps working.
    const { doctor, ...rest } = prescription
    const mapped = {
      ...rest,
      chiefComplaints,
      doctor: {
        ...doctor,
        user: {
          name: doctor.user.name,
          email: doctor.user.email,
          contactNo: doctor.contactNo,
          phoneNo: doctor.phoneNo,
        },
      },
    }

    return NextResponse.json({ prescription: mapped })
  } catch (error) {
    console.error('Get prescription error:', error)
    return NextResponse.json({ error: 'Failed to load prescription' }, { status: 500 })
  }
}
