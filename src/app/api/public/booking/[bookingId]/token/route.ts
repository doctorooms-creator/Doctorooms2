import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params
    const booking = await db.booking.findUnique({ where: { id: bookingId }, select: { id: true, tokenNumber: true, tokenOrder: true, patientName: true, age: true, gender: true, disease: true, bookingDate: true, status: true, departmentId: true, doctorId: true, hospitalId: true, createdAt: true } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    let department = null; if (booking.departmentId) department = await db.department.findUnique({ where: { id: booking.departmentId }, select: { name: true, shortCode: true, floorNo: true, opdRoom: true } })
    let doctor = null; if (booking.doctorId) { const d = await db.doctor.findUnique({ where: { id: booking.doctorId }, include: { user: { select: { name: true } } } }); if (d) doctor = { name: d.user.name, specialization: d.specialization } }
    let hospital = null; if (booking.hospitalId) hospital = await db.hospital.findUnique({ where: { id: booking.hospitalId }, select: { hospitalName: true, address: true, city: true, contactNo: true } })
    let queuePosition = 0
    if (booking.tokenOrder > 0) {
      const istOffset = 5.5 * 60 * 60 * 1000; const istDate = new Date(booking.bookingDate.getTime() + istOffset)
      const y = istDate.getUTCFullYear(), m = istDate.getUTCMonth(), d = istDate.getUTCDate()
      const start = new Date(Date.UTC(y, m, d, 0, 0, 0) - istOffset), end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - istOffset)
      const ahead = await db.booking.count({ where: { doctorId: booking.doctorId!, bookingDate: { gte: start, lte: end }, status: { in: ['Approve', 'Visited'] }, id: { not: booking.id }, OR: [{ tokenOrder: { lt: booking.tokenOrder } }, { tokenOrder: booking.tokenOrder, createdAt: { lt: booking.createdAt } }] } })
      queuePosition = ahead + 1
    }
    return NextResponse.json({ token: { bookingId: booking.id, tokenNumber: booking.tokenNumber, tokenOrder: booking.tokenOrder, patientName: booking.patientName, age: booking.age, gender: booking.gender, disease: booking.disease, date: booking.bookingDate.toISOString(), status: booking.status, queuePosition, department, doctor, hospital: hospital ? { name: hospital.hospitalName, address: hospital.address, city: hospital.city, contactNo: hospital.contactNo } : null } })
  } catch (error) { console.error('Token print API error:', error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
