// One-off prod helper: create a Completed booking for the QA doctor
// (qa-prod-gas@doctorooms.test) so the RX wizard can be opened in prod E2E.
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const user = await db.user.findUnique({ where: { email: 'qa-prod-gas@doctorooms.test' } })
  if (!user) throw new Error('qa user not found')
  const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
  if (!doctor) throw new Error('qa doctor not found')
  let booking = await db.booking.findFirst({ where: { doctorId: doctor.id } })
  if (!booking) {
    booking = await db.booking.create({
      data: { doctorId: doctor.id, userId: user.id, patientName: 'QA Prod Patient', status: 'Completed', timeSlot: '10:00', state: 'GJ', city: 'Ahmedabad' },
    })
    console.log('created booking:', booking.id)
  } else {
    console.log('existing booking:', booking.id)
  }
  console.log('doctorId:', doctor.id)
}
main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
