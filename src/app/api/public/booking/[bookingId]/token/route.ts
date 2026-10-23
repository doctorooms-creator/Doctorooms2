import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slotAwareSort } from '@/lib/queue-ordering'
import { istDateRange, istDateStrFromDate } from '@/lib/date-utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params
    const booking = await db.booking.findUnique({ where: { id: bookingId }, select: { id: true, tokenNumber: true, tokenOrder: true, patientName: true, age: true, gender: true, disease: true, bookingDate: true, status: true, departmentId: true, doctorId: true, hospitalId: true, createdAt: true, isEmergency: true } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    let department = null; if (booking.departmentId) department = await db.department.findUnique({ where: { id: booking.departmentId }, select: { name: true, shortCode: true, floorNo: true, opdRoom: true } })
    let doctor = null; if (booking.doctorId) { const d = await db.doctor.findUnique({ where: { id: booking.doctorId }, include: { user: { select: { name: true } } } }); if (d) doctor = { name: d.user.name, specialization: d.specialization } }
    let hospital = null; if (booking.hospitalId) hospital = await db.hospital.findUnique({ where: { id: booking.hospitalId }, select: { hospitalName: true, address: true, city: true, contactNo: true } })
    // Queue position via slotAwareSort — the SAME ordering the Queue page /
    // TV board use, so the printed slip's position matches what the patient
    // sees (emergencies jump to the top, slotted patients sort by time).
    let queuePosition = 0
    if (booking.tokenOrder > 0 || booking.isEmergency) {
      const { start, end } = istDateRange(istDateStrFromDate(booking.bookingDate))
      const dayQueue = await db.booking.findMany({
        where: { doctorId: booking.doctorId!, bookingDate: { gte: start, lte: end }, status: { in: ['Approve', 'Visited'] } },
        select: { id: true, timeSlot: true, tokenOrder: true, createdAt: true, isEmergency: true },
      })
      const sorted = slotAwareSort(dayQueue)
      const idx = sorted.findIndex((b) => b.id === booking.id)
      queuePosition = idx >= 0 ? idx + 1 : 0
    }
    return NextResponse.json({ token: { bookingId: booking.id, tokenNumber: booking.tokenNumber, tokenOrder: booking.tokenOrder, patientName: booking.patientName, age: booking.age, gender: booking.gender, disease: booking.disease, date: booking.bookingDate.toISOString(), status: booking.status, queuePosition, department, doctor, hospital: hospital ? { name: hospital.hospitalName, address: hospital.address, city: hospital.city, contactNo: hospital.contactNo } : null } })
  } catch (error) { console.error('Token print API error:', error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
