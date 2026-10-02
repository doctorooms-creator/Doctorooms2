/**
 * REAL-LIFE CLINIC SCENARIO — "Sunday Evening Rush at Sharma Clinic"
 *
 * Story: Dr. Rajesh Sharma runs a full-day Sunday clinic (09:00–20:00).
 * The evening session just started — 10 patients registered at the reception
 * desk between 15:02 and 15:29 IST. The doctor is currently consulting
 * patient #1 (SHARMA-001). Nine more are waiting in the reception area.
 *
 * Our test user (Rahul Verma, dev-patient) will now book an appointment
 * online from home and land at position #11 in the running queue.
 *
 * Setup performed by this script (idempotent — safe to re-run):
 *  1. "General Medicine" department inside Sharma Clinic (shortCode SHARMA)
 *  2. DoctorHospital link: Dr. Rajesh → Sharma Clinic / GEN dept (Active)
 *     → clinic bookings now get SHARMA-0XX queue tokens
 *  3. Sunday schedule 09:00–20:00 (30-min slots) so TODAY is bookable
 *  4. Clean slate: remove today's old test bookings for Dr. Rajesh
 *  5. Seed the 10 walk-in patients (tokens SHARMA-001…010, staggered
 *     registration times, realistic Indian names / ailments / ages)
 *
 * Run: bun run src/scripts/seed-clinic-scenario.ts
 */
import { db } from '@/lib/db'
import { generateTokenNumber } from '../lib/token-utils'

const DR_RAJESH = 'cmtffvm8p0005nnxl751a16o3'
const SHARMA_CLINIC = 'cmtffvm8l0001nnxlf3f6yokv'
const RECEPTIONIST_USER_ID = 'cmtffvm8w000lnnxlc3k8oor4' // Meera Joshi (userId on Receptionist row)

interface SeedPatient {
  name: string
  age: number
  gender: string
  disease: string
  mobile: string
  status: 'Visited' | 'Approve'
  minutesAgo: number
}

// The evening-session crowd — 10 walk-ins registered at the desk.
// #1 is already in consultation (Visited), the rest are waiting (Approve).
const PATIENTS: SeedPatient[] = [
  { name: 'Prakash Malhotra', age: 58, gender: 'Male', disease: 'Diabetes follow-up — sugar level check', mobile: '+91 9820014567', status: 'Visited', minutesAgo: 38 },
  { name: 'Sunita Devi', age: 46, gender: 'Female', disease: 'Knee pain since 2 weeks — difficult to walk', mobile: '+91 9845012390', status: 'Approve', minutesAgo: 35 },
  { name: 'Ramesh Gupta', age: 63, gender: 'Male', disease: 'High BP — dizziness in the morning', mobile: '+91 9986012457', status: 'Approve', minutesAgo: 32 },
  { name: 'Anjali Singh', age: 29, gender: 'Female', disease: 'Skin allergy — itching on arms and neck', mobile: '+91 9740125683', status: 'Approve', minutesAgo: 29 },
  { name: 'Mohammed Farooq', age: 51, gender: 'Male', disease: 'Acid reflux and gas problem after meals', mobile: '+91 9900147258', status: 'Approve', minutesAgo: 26 },
  { name: 'Kavita Joshi', age: 34, gender: 'Female', disease: 'Migraine — severe headache since yesterday', mobile: '+91 9632014758', status: 'Approve', minutesAgo: 23 },
  { name: 'Aditya Kulkarni', age: 22, gender: 'Male', disease: 'Fever and throat infection', mobile: '+91 9663012584', status: 'Approve', minutesAgo: 20 },
  { name: 'Lakshmi Nair', age: 67, gender: 'Female', disease: 'Arthritis check-up — joint stiffness', mobile: '+91 9845120369', status: 'Approve', minutesAgo: 17 },
  { name: 'Vikram Chauhan', age: 41, gender: 'Male', disease: 'Back pain after gym injury', mobile: '+91 9972014836', status: 'Approve', minutesAgo: 14 },
  { name: 'Priya Bansal', age: 8, gender: 'Female', disease: 'Stomach pain since morning (child)', mobile: '+91 9886013572', status: 'Approve', minutesAgo: 11 },
]

async function main() {
  console.log('=== REAL-LIFE CLINIC SCENARIO SETUP ===')
  console.log('Server time:', new Date().toString())

  // ── 1. Department: General Medicine @ Sharma Clinic (shortCode SHARMA) ──
  let dept = await db.department.findFirst({
    where: { hospitalId: SHARMA_CLINIC, shortCode: 'SHARMA' },
  })
  if (!dept) {
    dept = await db.department.create({
      data: {
        hospitalId: SHARMA_CLINIC,
        name: 'General Medicine',
        nameHi: 'सामान्य चिकित्सा',
        shortCode: 'SHARMA',
        description: 'Sharma Clinic OPD — General Physician',
        icon: 'stethoscope',
        floorNo: 'Ground',
        opdRoom: 'OPD-1',
        status: 'Active',
        sortOrder: 1,
      },
    })
    console.log('✓ Created department SHARMA (General Medicine) in Sharma Clinic')
  } else {
    console.log('✓ Department SHARMA already exists')
  }

  // ── 2. DoctorHospital link: Dr. Rajesh → Sharma Clinic / SHARMA dept ──
  let link = await db.doctorHospital.findFirst({
    where: { doctorId: DR_RAJESH, hospitalId: SHARMA_CLINIC },
  })
  if (!link) {
    link = await db.doctorHospital.create({
      data: {
        doctorId: DR_RAJESH,
        hospitalId: SHARMA_CLINIC,
        departmentId: dept.id,
        designation: 'Consultant Physician',
        fees: 500,
        opdTimings: 'Mon–Sun 09:00–20:00',
        status: 'Active',
      },
    })
    console.log('✓ Linked Dr. Rajesh → Sharma Clinic (GEN dept, Active)')
  } else {
    link = await db.doctorHospital.update({
      where: { id: link.id },
      data: { departmentId: dept.id, status: 'Active', designation: 'Consultant Physician' },
    })
    console.log('✓ Dr. Rajesh → Sharma Clinic link refreshed')
  }

  // ── 3. Sunday schedule 09:00–20:00 (today must be bookable) ──
  const slots: string[] = []
  for (let h = 9; h < 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`, `${String(h).padStart(2, '0')}:30`)
  }
  const sunday = await db.doctorSchedule.findFirst({
    where: { doctorId: DR_RAJESH, day: 'Sunday' },
  })
  if (sunday) {
    await db.doctorSchedule.update({
      where: { id: sunday.id },
      data: { startTime: '09:00', endTime: '20:00', slotDuration: 30, timeSlots: JSON.stringify(slots) },
    })
    console.log('✓ Sunday schedule updated (09:00–20:00, 22 slots)')
  } else {
    await db.doctorSchedule.create({
      data: {
        doctorId: DR_RAJESH,
        day: 'Sunday',
        startTime: '09:00',
        endTime: '20:00',
        slotDuration: 30,
        timeSlots: JSON.stringify(slots),
      },
    })
    console.log('✓ Sunday schedule created (09:00–20:00, 22 slots)')
  }

  // ── 4. Clean slate: remove today's old test bookings for Dr. Rajesh ──
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
  const istDateStr = istNow.toISOString().substring(0, 10)
  const dayStart = new Date(`${istDateStr}T00:00:00+05:30`)
  const dayEnd = new Date(`${istDateStr}T23:59:59+05:30`)

  const oldBookings = await db.booking.findMany({
    where: { doctorId: DR_RAJESH, bookingDate: { gte: dayStart, lte: dayEnd } },
    select: { id: true, tokenNumber: true, patientName: true },
  })
  for (const ob of oldBookings) {
    await db.prescription.deleteMany({ where: { bookingId: ob.id } })
    await db.bookingChat.deleteMany({ where: { bookingId: ob.id } })
    await db.opdBill.deleteMany({ where: { bookingId: ob.id } })
    await db.externalTestOrder.deleteMany({ where: { bookingId: ob.id } })
    await db.ipdAdmission.deleteMany({ where: { opdBookingId: ob.id } })
    await db.booking.delete({ where: { id: ob.id } })
    console.log(`  🗑 Removed old booking ${ob.tokenNumber} (${ob.patientName})`)
  }
  if (oldBookings.length === 0) console.log('✓ No old bookings to clean')

  // ── 5. Seed the 10 walk-in patients ──
  console.log('\n--- Seeding 10 walk-in patients (evening session) ---')
  for (const p of PATIENTS) {
    const createdAt = new Date(Date.now() - p.minutesAgo * 60 * 1000)
    // Token from the REAL race-safe counter (per doctor per IST day)
    const token = await generateTokenNumber(DR_RAJESH, dept.id)
    const appointmentNo = `DOC-${DR_RAJESH.slice(0, 4).toUpperCase()}-${Math.floor(createdAt.getTime() / 1000)}`

    await db.booking.create({
      data: {
        appointmentNo,
        doctorId: DR_RAJESH,
        userId: null,
        patientName: p.name,
        disease: p.disease,
        description: `Walk-in registration at Sharma Clinic reception. Contact: ${p.mobile}`,
        gender: p.gender,
        age: p.age,
        bloodGroup: '',
        relationWithMe: 'Self',
        status: p.status,
        bookingType: 'By Receptionist',
        bookingMode: 'InPerson',
        timeSlot: '',
        appointmentCharge: 500,
        bookingDate: createdAt,
        hospitalId: SHARMA_CLINIC,
        departmentId: dept.id,
        receptionistId: RECEPTIONIST_USER_ID,
        state: 'Karnataka',
        city: 'Bengaluru',
        tokenNumber: token.tokenNumber,
        tokenOrder: token.tokenOrder,
        createdAt,
        updatedAt: new Date(),
      },
    })
    const badge = p.status === 'Visited' ? '🩺 IN CONSULTATION' : '⏳ WAITING'
    console.log(`  ✓ ${token.tokenNumber}  #${token.tokenOrder}  ${p.name} (${p.age}/${p.gender}) — ${p.disease.substring(0, 40)} ${badge}`)
  }

  // ── Summary ──
  const todayCount = await db.booking.count({
    where: {
      doctorId: DR_RAJESH,
      bookingDate: { gte: dayStart, lte: dayEnd },
      status: { in: ['Approve', 'Visited', 'Finish'] },
    },
  })
  console.log(`\n=== SCENARIO READY ===`)
  console.log(`Queue running at Sharma Clinic: ${todayCount} patients (1 in consultation + 9 waiting)`)
  console.log(`Test user Rahul Verma (dev-patient) will now book online → position #${todayCount + 1}`)
  console.log('Expected token on approval: SHARMA-0' + String(todayCount + 1).padStart(2, '0'))
}

main()
  .catch((e) => {
    console.error('Scenario seed failed:', e)
    process.exitCode = 1
  })
  .finally(() => process.exit(0))
