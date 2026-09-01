/**
 * copilot-seed.ts — idempotent test data for Dr. Copilot QA.
 *
 * Uses doctors from seed-multispecialty:
 *   - Dr. Rajesh Kumar (rajesh@skinclinic.com, Dermatology)  → primary test doctor
 *   - Dr. Anita Desai  (anita.desai@zydus.com,  Neurology)   → isolation test doctor
 *
 * Creates per doctor:
 *   - 2 patients (User role=patient) with bookings + 1 past prescription each
 *   - TODAY's queue entries (Approve / Pending)
 *
 * Cleans ONLY data it previously created (tracked via known mobile numbers +
 * appointmentNo prefix COP-) plus all CopilotChat/CopilotAction rows.
 *
 * Run: bun copilot-seed.ts
 */

import { PrismaClient } from '@prisma/client'
import { generateTokenNumber } from './src/lib/token-utils'
import { todayISTRange } from './src/lib/date-utils'

const db = new PrismaClient()

const RAJESH_EMAIL = 'rajesh@skinclinic.com'
const ANITA_EMAIL = 'anita.desai@zydus.com'

interface SeedPatient {
  name: string
  mobile: string
  gender: string
  age: number
  disease: string
}

const RAJESH_PATIENTS: SeedPatient[] = [
  { name: 'Rahul Verma', mobile: '9811100001', gender: 'Male', age: 34, disease: 'Fungal infection - back' },
  { name: 'Sunita Devi', mobile: '9811100002', gender: 'Female', age: 45, disease: 'Eczema flare - hands' },
]

const ANITA_PATIENTS: SeedPatient[] = [
  { name: 'Meera Nair', mobile: '9822200001', gender: 'Female', age: 29, disease: 'Migraine with aura' },
]

/** Hour offset INTO the IST day (0-23). bookingDate lands inside todayISTRange. */
function istTodayAt(istHour: number, istMinute = 0) {
  const { start } = todayISTRange() // start = midnight IST
  const d = new Date(start.getTime() + (istHour * 60 + istMinute) * 60 * 1000)
  return d
}

function daysAgo(n: number, hour = 11) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 0, 0, 0)
  return d
}

async function main() {
  console.log('🧹 Cleaning previous copilot seed data…')

  // Copilot chat/action data (test artifact — safe to wipe fully)
  await db.copilotAction.deleteMany({})
  await db.copilotChat.deleteMany({})

  // Prior seed artifacts (idempotency): bookings by appointmentNo prefix
  await db.pMedicine.deleteMany({ where: { prescription: { booking: { appointmentNo: { startsWith: 'COP-' } } } } })
  await db.prescription.deleteMany({ where: { booking: { appointmentNo: { startsWith: 'COP-' } } } })
  await db.booking.deleteMany({ where: { appointmentNo: { startsWith: 'COP-' } } })
  await db.user.deleteMany({ where: { mobileNo: { in: ['9811100001', '9811100002', '9822200001'] } } })

  const rajesh = await db.user.findUnique({ where: { email: RAJESH_EMAIL } })
  const anita = await db.user.findUnique({ where: { email: ANITA_EMAIL } })
  if (!rajesh || !anita) {
    throw new Error('Run prisma/seed-multispecialty.ts first — doctor users not found')
  }
  const rajeshDoctor = await db.doctor.findUnique({ where: { userId: rajesh.id } })
  const anitaDoctor = await db.doctor.findUnique({ where: { userId: anita.id } })
  if (!rajeshDoctor || !anitaDoctor) throw new Error('Doctor profiles missing')

  // Department for tokens comes from the doctor's hospital link
  async function deptFor(doctorId: string): Promise<string | null> {
    const link = await db.doctorHospital.findFirst({ where: { doctorId }, select: { departmentId: true } })
    return link?.departmentId ?? null
  }

  console.log(`👨‍⚕️ Rajesh doctorId: ${rajeshDoctor.id}`)
  console.log(`👩‍⚕️ Anita doctorId:  ${anitaDoctor.id}`)

  const seeds: { doctorId: string; departmentId: string | null; patients: SeedPatient[]; meds: { medicine: string; dose: string; morning: number; afternoon: number; evening: number; tab: number }[] }[] = [
    {
      doctorId: rajeshDoctor.id,
      departmentId: await deptFor(rajeshDoctor.id),
      patients: RAJESH_PATIENTS,
      meds: [
        { medicine: 'Paracetamol 650mg', dose: '650mg', morning: 1, afternoon: 0, evening: 1, tab: 5 },
        { medicine: 'Cetirizine 10mg', dose: '10mg', morning: 0, afternoon: 0, evening: 1, tab: 7 },
        { medicine: 'Clotrimazole cream', dose: 'apply BD', morning: 1, afternoon: 0, evening: 1, tab: 1 },
      ],
    },
    {
      doctorId: anitaDoctor.id,
      departmentId: await deptFor(anitaDoctor.id),
      patients: ANITA_PATIENTS,
      meds: [
        { medicine: 'Naproxen 250mg', dose: '250mg', morning: 1, afternoon: 0, evening: 1, tab: 5 },
        { medicine: 'Betahistine 16mg', dose: '16mg', morning: 1, afternoon: 1, evening: 1, tab: 10 },
      ],
    },
  ]

  let seq = 0
  for (const s of seeds) {
    for (const p of s.patients) {
      seq++
      // Patient user
      const user = await db.user.create({
        data: {
          email: `patient_${p.mobile}@test.doctorooms.local`,
          mobileNo: p.mobile,
          name: p.name,
          role: 'patient',
          gender: p.gender,
          status: 'Active',
          password: 'seed-only',
        },
      })

      // PAST visit (12 days ago, Finished) + prescription with medicines
      const pastBooking = await db.booking.create({
        data: {
          appointmentNo: `COP-PAST-${seq}-${Date.now()}`,
          userId: user.id,
          doctorId: s.doctorId,
          patientName: p.name,
          disease: p.disease,
          gender: p.gender,
          age: p.age,
          status: 'Finish',
          bookingType: 'By Receptionist',
          bookingMode: 'InPerson',
          timeSlot: '11:00 AM',
          appointmentCharge: 500,
          bookingDate: daysAgo(12),
          departmentId: s.departmentId ?? undefined,
        },
      })

      const rx = await db.prescription.create({
        data: {
          bookingId: pastBooking.id,
          doctorId: s.doctorId,
          patientName: p.name,
          patientAge: String(p.age),
          disease: p.disease,
          weight: '70',
          bp: '120/80',
          temperature: '98.6',
          description: 'Follow-up in 2 weeks. Maintain hygiene, avoid scratching.',
          status: 'Finalized',
          fulfillmentStatus: 'Pending',
          nextVisit: daysAgo(-9), // ~9 days in future
        },
      })
      for (const m of s.meds) {
        await db.pMedicine.create({ data: { prescriptionId: rx.id, ...m } })
      }

      // TODAY's queue entry
      let tokenNumber = ''
      let tokenOrder = 0
      try {
        const t = await generateTokenNumber(s.doctorId, s.departmentId || 'none', istTodayAt(10))
        tokenNumber = t.tokenNumber
        tokenOrder = t.tokenOrder
      } catch {
        /* token optional in seed */
      }
      await db.booking.create({
        data: {
          appointmentNo: `COP-TODAY-${seq}-${Date.now()}`,
          userId: user.id,
          doctorId: s.doctorId,
          patientName: p.name,
          disease: p.disease,
          gender: p.gender,
          age: p.age,
          status: seq % 2 === 1 ? 'Approve' : 'Pending',
          bookingType: 'By Self',
          bookingMode: 'InPerson',
          timeSlot: seq % 2 === 1 ? '10:00 AM' : '10:30 AM',
          appointmentCharge: 500,
          bookingDate: istTodayAt(10, seq % 2 === 1 ? 0 : 30),
          departmentId: s.departmentId ?? undefined,
          tokenNumber,
          tokenOrder,
        },
      })

      console.log(`  ✓ ${p.name} (${p.mobile}) → past rx ${rx.id.slice(-6)} + today's booking (token ${tokenNumber || '—'})`)
    }
  }

  // ─── Lab partner + association (for lab_order approve-flow) ──────────
  console.log('🔬 Seeding lab partner…')
  let labPartner = await db.labPartner.findFirst({ where: { labName: 'CityPath Labs' } })
  if (!labPartner) {
    const labUser = await db.user.create({
      data: {
        email: 'lab@citypath.test.doctorooms.local',
        mobileNo: '9833300001',
        name: 'CityPath Labs',
        role: 'lab_partner',
        status: 'Active',
        password: 'seed-only',
      },
    })
    labPartner = await db.labPartner.create({
      data: {
        userId: labUser.id,
        labName: 'CityPath Labs',
        ownerName: 'S. Iyer',
        email: 'lab@citypath.test.doctorooms.local',
        mobile: '9833300001',
        city: 'Ahmedabad',
        state: 'Gujarat',
        specializations: 'both',
        testsAvailable: JSON.stringify(['CBC', 'Lipid Profile', 'HbA1c', 'Thyroid Profile', 'Vitamin D', 'Liver Function Test']),
        createdBy: rajesh.id,
      },
    })
  }
  for (const doctor of [rajeshDoctor, anitaDoctor]) {
    const exists = await db.doctorLabAssociation.findFirst({ where: { doctorId: doctor.id, labPartnerId: labPartner.id } })
    if (!exists) {
      await db.doctorLabAssociation.create({
        data: { doctorId: doctor.id, labPartnerId: labPartner.id, commissionPercent: 10 },
      })
    }
  }
  console.log(`  ✓ CityPath Labs associated with both doctors (${labPartner.id.slice(-6)})`)

  console.log('✅ copilot-seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
