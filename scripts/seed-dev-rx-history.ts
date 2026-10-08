// One-off sandbox helper: seed synthetic prescription history for dev-doctor
// so the RX-favorites "most prescribed" aggregation has data to work with.
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const doctorId = 'cmuyzs0u90007mod4350ozemb'
  let booking = await db.booking.findFirst({ where: { doctorId }, orderBy: { createdAt: 'desc' } })
  if (!booking) {
    booking = await db.booking.create({
      data: { doctorId, patientName: 'Seed Patient', status: 'Completed', timeSlot: '10:00' },
    })
    console.log('created booking', booking.id)
  }
  const complaints = await db.coMaster.findMany({ where: { doctorId }, take: 3, orderBy: { createdAt: 'asc' } })
  const meds = await db.doctorMedicine.findMany({ where: { userId: doctorId }, take: 3, orderBy: { createdAt: 'asc' } })
  for (let i = 0; i < 3; i++) {
    const rx = await db.prescription.create({
      data: { bookingId: booking.id, doctorId, status: 'Completed', patientName: 'Seed Patient', disease: 'Fever' },
    })
    const coSet = i === 0 ? [0, 1, 2] : i === 1 ? [0, 1] : [0]
    for (const ci of coSet) {
      const c = complaints[ci]
      if (!c) break
      await db.pCo.create({ data: { prescriptionId: rx.id, coId: c.id, createdById: 'dev-doctor' } })
    }
    const medSet = i === 0 ? [0, 1, 2] : i === 1 ? [0, 1] : [0]
    for (const mi of medSet) {
      const m = meds[mi]
      if (!m) break
      await db.pMedicine.create({
        data: { prescriptionId: rx.id, medicine: m.name, morning: m.morning, afternoon: m.afternoon, evening: m.evening, tab: m.tab, dose: '[]', description: '' },
      })
    }
  }
  console.log('seeded 3 prescriptions.')
  console.log('complaints used:', complaints.map((c) => c.coDetailEn))
  console.log('meds used:', meds.map((m) => m.name))
}
main().finally(() => db.$disconnect())
