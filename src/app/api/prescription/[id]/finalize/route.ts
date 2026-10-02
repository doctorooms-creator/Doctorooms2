import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { sendQueueNotification, notifyApproachingPatient } from '@/lib/queue-notifications'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { nextVisit } = body

    // Verify prescription ownership
    const prescription = await db.prescription.findUnique({
      where: { id },
      select: { id: true, doctorId: true, bookingId: true },
    })
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const doctor = await db.doctor.findUnique({
      where: { id: prescription.doctorId, userId: user.id },
      select: {
        id: true,
        user: { select: { name: true } },
      },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update prescription status and next visit
    const updated = await db.prescription.update({
      where: { id },
      data: {
        status: 'Active',
        nextVisit: nextVisit ? new Date(nextVisit) : null,
      },
      include: {
        booking: { select: { id: true } },
        doctor: {
          select: {
            // contactNo/phoneNo live on the Doctor model, NOT on User
            // (selecting them under `user` caused PrismaClientValidationError 500s)
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
        // PCo has NO relation to CoMaster (only raw coId) — hydrated below
        chiefComplaints: true,
        labels: true,
        medicines: true,
        suggestions: true,
        diagnosisTables: true,
      },
    })

    // Hydrate chief complaints with their CoMaster details
    const coIds = updated.chiefComplaints.map((c) => c.coId).filter(Boolean)
    const coMasters = coIds.length
      ? await db.coMaster.findMany({ where: { id: { in: coIds } } })
      : []
    const coMap = new Map(coMasters.map((c) => [c.id, c]))
    const chiefComplaints = updated.chiefComplaints.map((c) => {
      const co = coMap.get(c.coId)
      return {
        ...c,
        co: co ? { coDetail: co.coDetail, coDetailEn: co.coDetailEn } : null,
      }
    })

    // Map doctor-level phone fields into `doctor.user` (client type expects them there)
    const { doctor: doc, ...restUpdated } = updated
    const mappedUpdated = {
      ...restUpdated,
      chiefComplaints,
      doctor: {
        ...doc,
        user: {
          name: doc.user.name,
          email: doc.user.email,
          contactNo: doc.contactNo,
          phoneNo: doc.phoneNo,
        },
      },
    }

    // Fetch booking details for notification before status change
    const bookingBeforeUpdate = await db.booking.findUnique({
      where: { id: prescription.bookingId },
      select: {
        id: true,
        status: true,
        userId: true,
        tokenNumber: true,
        tokenOrder: true,
        bookingDate: true,
        doctorId: true,
        departmentId: true,
      },
    })

    // Booking has no `department` relation — fetch the department name separately
    let departmentName: string | null = null
    if (bookingBeforeUpdate?.departmentId) {
      const dept = await db.department.findUnique({
        where: { id: bookingBeforeUpdate.departmentId },
        select: { name: true },
      })
      departmentName = dept?.name || null
    }

    // Update booking status to Visited
    await db.booking.update({
      where: { id: prescription.bookingId },
      data: { status: 'Visited' },
    })

    // Send notification only if booking wasn't already Visited/Finish
    if (bookingBeforeUpdate && bookingBeforeUpdate.status === 'Approve') {
      const doctorName = doctor.user.name.replace('Dr. ', '')
      await sendQueueNotification('consultation_started', {
        bookingId: bookingBeforeUpdate.id,
        doctorId: doctor.id,
        patientUserId: bookingBeforeUpdate.userId,
        doctorName,
        tokenNumber: bookingBeforeUpdate.tokenNumber,
        departmentName,
      })
      await notifyApproachingPatient(
        doctor.id,
        bookingBeforeUpdate.tokenOrder,
        bookingBeforeUpdate.bookingDate
      )
    }

    return NextResponse.json({ prescription: mappedUpdated })
  } catch (error) {
    console.error('Finalize prescription error:', error)
    return NextResponse.json({ error: 'Failed to finalize prescription' }, { status: 500 })
  }
}
