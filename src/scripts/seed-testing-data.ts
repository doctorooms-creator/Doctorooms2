/**
 * COMPREHENSIVE TESTING DATA — Clinic + Hospital
 * Creates realistic patients, bookings, prescriptions, IPD, lab, billing, etc.
 * Run: DATABASE_URL=postgresql://... bun run src/scripts/seed-testing-data.ts
 */

import { db } from '../lib/db'
import { generateTokenNumber } from '../lib/token-utils'
import { todayISTRange, todayISTStr, currentTimeIST } from '../lib/date-utils'

const HOSPITAL_ID = 'cmsvzrrok0003sw2oybd2uvq0'
const CLINIC_ID = 'cmsvzrrm60001sw2okeo2aqom'
const DR_SHARMA = 'cmsvzrrpt0005sw2o7bxf6011'
const DR_ANITA = 'cmsvzrrs70007sw2o59dyh15o'
const DR_SURESH = 'cmsvzrrtg0009sw2okr71useq'
const NURSE_ID = 'cmsvzrsys001rsw2odx4mae2q'
const DEPT_GEN = 'cmsvzrruo000bsw2ov8jtpy17'
const DEPT_CAR = 'cmsvzrrya000fsw2oqvi9ni62'
const DEPT_ORT = 'cmsvzrrx1000dsw2oo1v8y93v'
const WARD_GEN = 'cmsvzrsah000rsw2ohmp2xv4v'
const WARD_PRI = 'cmsvzrscu000tsw2ob2zaiuk5'
const WARD_ICU = 'cmsvzrse2000vsw2ohkc9w133'

const firstNames = ['Amit','Priya','Sneha','Mohammed','Lakshmi','Rajesh','Deepa','Suresh','Anjali','Vikram','Pooja','Arjun','Meena','Karthik','Sunita','Ramesh','Geeta','Sanjay','Kavya','Prakash','Fatima','Rohit','Nisha','Manish','Sumitra','Vinod','Sarita','Deepak','Mohan','Ravi','Sita','John','Lakshmi','Kartik','Meena']
const lastNames = ['Kumar','Sharma','Patel','Khan','Nair','Gupta','Reddy','Yadav','Singh','Rathore','Joshi','Nair','Iyer','Raja','Devi','Chandra','Verma','Mehta','Rao','Malhotra','Sheikh','Deshpande','Bhat','Agarwal','Kale','Kumar','Jain','Singh','Das','Kumar','Devi','Dsouza','Rao','Raja','Iyer']
const complaints = ['Fever and body ache','Chest pain','Headache and dizziness','Abdominal pain','Cough and cold','Hypertension follow-up','Diabetes follow-up','Back pain','Skin rash','Breathing difficulty','Joint pain','Nausea and vomiting','General checkup','Weakness and fatigue','Throat infection']
const statuses = ['Pending','Approve','Approve','Visited','Finish','Approve','Pending','Approve','Visited','Finish']
const bookingTypes = ['By Self','By Receptionist','By Self','By Receptionist','By Self']
const bookingModes = ['InPerson','VideoCall','InPerson','InPerson','InPerson']
const genders = ['Male','Female','Male','Female','Male','Female','Male','Female','Male','Female']

async function main() {
  console.log('🏥 Creating comprehensive testing data...\n')
  const { start: startOfDay, end: endOfDay } = todayISTRange()
  const today = todayISTStr()

  // ─── 1. ADD 2 NEW DEPARTMENTS ─────────────────────────
  console.log('🏥 Adding Nephrology + Neurology departments...')
  const deptNEP = await db.department.create({
    data: { hospitalId: HOSPITAL_ID, name: 'Nephrology', nameHi: 'वृक्क रोग', shortCode: 'NEP', icon: ' Droplet', floorNo: 'Floor 3', opdRoom: 'OPD-401', status: 'Active', sortOrder: 4 }
  }).catch(() => null)
  const deptNEU = await db.department.create({
    data: { hospitalId: HOSPITAL_ID, name: 'Neurology', nameHi: 'तंत्रिका रोग', shortCode: 'NEU', icon: 'Brain', floorNo: 'Floor 3', opdRoom: 'OPD-402', status: 'Active', sortOrder: 5 }
  }).catch(() => null)
  const DEPT_NEP = deptNEP?.id || ''
  const DEPT_NEU = deptNEU?.id || ''
  console.log(`  ✓ Departments: Nephrology (${DEPT_NEP.slice(0,8)}), Neurology (${DEPT_NEU.slice(0,8)})`)

  // ─── 2. ADD 2 NEW DOCTORS (Ortho + Nephro) ────────────
  console.log('👨‍⚕️ Adding Dr. Arjun Reddy (Ortho) + Dr. Priya Nair (Nephro)...')
  const drArjunUser = await db.user.create({
    data: { id: 'dev-doctor-arjun', name: 'Dr. Arjun Reddy', email: 'arjun.reddy@doctorooms.com', password: '$2a$10$dummy', role: 'doctor', status: 'Active', gender: 'Male', mobileNo: '+91 9876543301', profileImg: 'default.png' }
  }).catch(() => null)
  const drPriyaUser = await db.user.create({
    data: { id: 'dev-doctor-priya', name: 'Dr. Priya Nair', email: 'priya.nair@doctorooms.com', password: '$2a$10$dummy', role: 'doctor', status: 'Active', gender: 'Female', mobileNo: '+91 9876543302', profileImg: 'default.png' }
  }).catch(() => null)

  const drArjun = await db.doctor.create({
    data: { userId: 'dev-doctor-arjun', specialization: 'Orthopedics', fees: 800, dailyLimit: 30, experience: '12 years', registrationDetail: 'KMC-ORT-2012', address: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', contactNo: '+91 9876543301' }
  }).catch(() => null)
  const drPriya = await db.doctor.create({
    data: { userId: 'dev-doctor-priya', specialization: 'Nephrology', fees: 1200, dailyLimit: 20, experience: '15 years', registrationDetail: 'KMC-NEP-2009', address: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', contactNo: '+91 9876543302' }
  }).catch(() => null)

  // Link to hospital
  if (drArjun) await db.doctorHospital.create({ data: { doctorId: drArjun.id, hospitalId: HOSPITAL_ID, departmentId: DEPT_ORT, designation: 'Senior Consultant', fees: 800, isAvailable: true, status: 'Active' } }).catch(() => {})
  if (drPriya) await db.doctorHospital.create({ data: { doctorId: drPriya.id, hospitalId: HOSPITAL_ID, departmentId: DEPT_NEP || DEPT_GEN, designation: 'Senior Consultant', fees: 1200, isAvailable: true, status: 'Active' } }).catch(() => {})

  // Schedules
  if (drArjun) await db.doctorSchedule.create({ data: { doctorId: drArjun.id, day: 'Tuesday', startTime: '11:00', endTime: '15:00', slotDuration: 15 } }).catch(() => {})
  if (drPriya) await db.doctorSchedule.create({ data: { doctorId: drPriya.id, day: 'Monday', startTime: '09:00', endTime: '12:00', slotDuration: 20 } }).catch(() => {})

  const DR_ARJUN = drArjun?.id || ''
  const DR_PRIYA = drPriya?.id || ''
  console.log(`  ✓ Dr. Arjun Reddy (${DR_ARJUN.slice(0,8)}), Dr. Priya Nair (${DR_PRIYA.slice(0,8)})`)

  // ─── 3. CREATE PATIENTS (35 total) ─────────────────────
  console.log('\n👥 Creating 35 patients...')
  const patients: { id: string; name: string; mobile: string; gender: string; age: number }[] = []
  for (let i = 0; i < 35; i++) {
    const id = `test-pt-${i + 1}`
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`
    const mobile = `+91 98${String(76500000 + i * 1234).padStart(8, '0')}`
    const gender = genders[i % genders.length]
    const age = 25 + (i * 7) % 50
    await db.user.create({
      data: { id, name, email: `testpt${i+1}@doctorooms.com`, password: '$2a$10$dummy', role: 'patient', status: 'Active', gender, mobileNo: mobile, profileImg: 'default.png' }
    }).catch(() => {})
    patients.push({ id, name, mobile, gender, age })
  }
  console.log(`  ✓ ${patients.length} patients created`)

  // ─── 4. CLINIC BOOKINGS (15) ───────────────────────────
  console.log('\n🏥 Creating 15 clinic bookings...')
  const clinicDepts = await db.department.findFirst({ where: { hospitalId: CLINIC_ID } })
  const clinicDeptId = clinicDepts?.id || ''

  // A) 5 Online Slot Bookings (Pending → Approve → Visited → Finish)
  for (let i = 0; i < 5; i++) {
    const p = patients[i]
    const status = statuses[i]
    const slot = `${9 + Math.floor(i / 2)}:${(i % 2) * 10 === 0 ? '00' : '10'} ${9 + Math.floor(i / 2) >= 12 ? 'PM' : 'AM'}`
    let tokenNumber = '', tokenOrder = 0
    if (status !== 'Pending') {
      try { const t = await generateTokenNumber(DR_SHARMA, clinicDeptId); tokenNumber = t.tokenNumber; tokenOrder = t.tokenOrder } catch {}
    }
    await db.booking.create({
      data: {
        appointmentNo: `CLINIC-ONLINE-${i + 1}-${Date.now()}`,
        doctorId: DR_SHARMA,
        userId: p.id,
        patientName: p.name,
        disease: complaints[i],
        gender: p.gender,
        age: p.age,
        status,
        bookingType: 'By Self',
        bookingMode: 'InPerson',
        timeSlot: slot,
        appointmentCharge: 500,
        bookingDate: new Date(),
        hospitalId: CLINIC_ID,
        departmentId: clinicDeptId,
        tokenNumber,
        tokenOrder,
      }
    }).catch(() => {})
  }

  // B) 5 Walk-in (no slot, Express)
  for (let i = 0; i < 5; i++) {
    const p = patients[5 + i]
    let tokenNumber = '', tokenOrder = 0
    try { const t = await generateTokenNumber(DR_SHARMA, clinicDeptId); tokenNumber = t.tokenNumber; tokenOrder = t.tokenOrder } catch {}
    await db.booking.create({
      data: {
        appointmentNo: `CLINIC-WALKIN-${i + 1}-${Date.now()}`,
        doctorId: DR_SHARMA,
        userId: p.id,
        patientName: p.name,
        disease: complaints[5 + i],
        gender: p.gender,
        age: p.age,
        status: 'Approve',
        bookingType: 'By Receptionist',
        bookingMode: 'InPerson',
        timeSlot: currentTimeIST(),
        appointmentCharge: 500,
        bookingDate: new Date(),
        hospitalId: CLINIC_ID,
        departmentId: clinicDeptId,
        receptionistId: 'dev-receptionist',
        tokenNumber,
        tokenOrder,
      }
    }).catch(() => {})
  }

  // C) 2 Video Consultations
  for (let i = 0; i < 2; i++) {
    const p = patients[10 + i]
    await db.booking.create({
      data: {
        appointmentNo: `CLINIC-VIDEO-${i + 1}-${Date.now()}`,
        doctorId: DR_SHARMA,
        userId: p.id,
        patientName: p.name,
        disease: i === 0 ? 'HTN follow-up' : 'Medicine refill',
        gender: p.gender,
        age: p.age,
        status: 'Approve',
        bookingType: 'By Self',
        bookingMode: 'VideoCall',
        timeSlot: `11:${i === 0 ? '00' : '30'} AM`,
        appointmentCharge: 700,
        bookingDate: new Date(),
        hospitalId: CLINIC_ID,
        departmentId: clinicDeptId,
      }
    }).catch(() => {})
  }

  // D) 3 Follow-up patients (with history)
  for (let i = 0; i < 3; i++) {
    const p = patients[12 + i]
    let tokenNumber = '', tokenOrder = 0
    try { const t = await generateTokenNumber(DR_SHARMA, clinicDeptId); tokenNumber = t.tokenNumber; tokenOrder = t.tokenOrder } catch {}
    await db.booking.create({
      data: {
        appointmentNo: `CLINIC-FOLLOWUP-${i + 1}-${Date.now()}`,
        doctorId: DR_SHARMA,
        userId: p.id,
        patientName: p.name,
        disease: ['DM follow-up', 'HTN follow-up', 'Asthma review'][i],
        gender: p.gender,
        age: p.age + 10,
        status: 'Approve',
        bookingType: 'By Receptionist',
        bookingMode: 'InPerson',
        timeSlot: '',
        appointmentCharge: 300,
        bookingDate: new Date(),
        hospitalId: CLINIC_ID,
        departmentId: clinicDeptId,
        tokenNumber,
        tokenOrder,
      }
    }).catch(() => {})
  }

  // E) 2 No-Show (Canceled)
  for (let i = 0; i < 2; i++) {
    const p = patients[15 + i]
    await db.booking.create({
      data: {
        appointmentNo: `CLINIC-NOSHOW-${i + 1}-${Date.now()}`,
        doctorId: DR_SHARMA,
        userId: p.id,
        patientName: p.name,
        disease: complaints[10 + i],
        gender: p.gender,
        age: p.age,
        status: 'Canceled',
        bookingType: 'By Self',
        bookingMode: 'InPerson',
        timeSlot: `${9 + i}:30 AM`,
        appointmentCharge: 500,
        bookingDate: new Date(),
        hospitalId: CLINIC_ID,
        departmentId: clinicDeptId,
      }
    }).catch(() => {})
  }
  console.log('  ✓ 15 clinic bookings (5 online + 5 walk-in + 2 video + 3 follow-up + 2 no-show)')

  // ─── 5. HOSPITAL OPD BOOKINGS (30) ────────────────────
  console.log('\n🏥 Creating 30 hospital OPD bookings...')
  const deptDoctorMap = [
    { deptId: DEPT_CAR, doctorId: DR_SURESH, count: 10, prefix: 'CAR' },
    { deptId: DEPT_GEN, doctorId: DR_ANITA, count: 10, prefix: 'GEN' },
    { deptId: DEPT_ORT, doctorId: DR_ARJUN || DR_ANITA, count: 5, prefix: 'ORT' },
    { deptId: DEPT_NEP || DEPT_GEN, doctorId: DR_PRIYA || DR_ANITA, count: 5, prefix: 'NEP' },
  ]

  let hospitalBookingCount = 0
  for (const config of deptDoctorMap) {
    if (!config.doctorId) continue
    for (let i = 0; i < config.count; i++) {
      const p = patients[15 + hospitalBookingCount % 20]
      const status = statuses[i % statuses.length]
      let tokenNumber = '', tokenOrder = 0
      if (status !== 'Pending') {
        try { const t = await generateTokenNumber(config.doctorId, config.deptId); tokenNumber = t.tokenNumber; tokenOrder = t.tokenOrder } catch {}
      }
      const isKiosk = i % 6 === 0
      await db.booking.create({
        data: {
          appointmentNo: isKiosk ? `KSK-${Date.now()}-${hospitalBookingCount}` : `HOSP-${config.prefix}-${i + 1}-${Date.now()}`,
          doctorId: config.doctorId,
          userId: p.id,
          patientName: p.name,
          disease: complaints[hospitalBookingCount % complaints.length],
          gender: p.gender,
          age: p.age,
          status,
          bookingType: isKiosk ? 'By Self' : bookingTypes[i % bookingTypes.length],
          bookingMode: 'InPerson',
          timeSlot: status !== 'Pending' ? `${9 + Math.floor(i / 4)}:${(i % 4) * 15 === 0 ? '00' : (i % 4) * 15} ${9 + Math.floor(i / 4) >= 12 ? 'PM' : 'AM'}` : '',
          appointmentCharge: config.prefix === 'CAR' ? 1000 : config.prefix === 'NEP' ? 1200 : config.prefix === 'ORT' ? 800 : 700,
          bookingDate: new Date(),
          hospitalId: HOSPITAL_ID,
          departmentId: config.deptId,
          receptionistId: 'dev-receptionist',
          tokenNumber,
          tokenOrder,
        }
      }).catch(() => {})
      hospitalBookingCount++
    }
  }
  console.log(`  ✓ ${hospitalBookingCount} hospital OPD bookings (Cardiology, Gen Med, Ortho, Nephro)`)

  // ─── 6. CLINIC PRESCRIPTIONS (10) ──────────────────────
  console.log('\n💊 Creating 10 clinic prescriptions...')
  const clinicBookings = await db.booking.findMany({
    where: { doctorId: DR_SHARMA, status: { in: ['Visited', 'Finish'] } },
    take: 10,
  })
  const templates = await db.prescriptionTemplate.findMany({ where: { doctorId: DR_SHARMA } })

  for (let i = 0; i < clinicBookings.length; i++) {
    const booking = clinicBookings[i]
    const template = templates[i % templates.length]
    const medicines = JSON.parse(template.medicines || '[]')
    const rx = await db.prescription.create({
      data: {
        bookingId: booking.id,
        doctorId: DR_SHARMA,
        patientName: booking.patientName,
        patientAge: String(booking.age || 35),
        disease: template.diagnosis || booking.disease,
        status: 'Active',
        weight: String(55 + i * 3),
        bp: `${120 + i * 2}/${80 + i}`,
        temperature: String(98.4 + (i % 3) * 0.5),
        nextVisit: new Date(Date.now() + (template.followUpDays || 7) * 86400000),
      },
    }).catch(() => null)
    if (rx) {
      for (const med of medicines.slice(0, 3)) {
        await db.pMedicine.create({
          data: {
            prescriptionId: rx.id,
            medicine: med.name || '',
            dose: med.dose || '',
            morning: med.dose?.includes('1') ? 1 : 0,
            afternoon: med.dose?.includes('1-1') ? 1 : 0,
            evening: med.dose?.includes('1') ? 1 : 0,
            tab: 3,
            description: med.instructions || '',
          },
        }).catch(() => {})
      }
      // Fulfillment status
      if (i < 4) {
        await db.prescription.update({ where: { id: rx.id }, data: { fulfillmentStatus: i < 2 ? 'Dispensed' : 'Packed', packedBy: 'dev-pharmacist', packedAt: new Date() } }).catch(() => {})
      }
    }
  }
  console.log('  ✓ 10 prescriptions with medicines + fulfillment status')

  // ─── 7. IPD ADMISSIONS (5) ─────────────────────────────
  console.log('\n🛏️ Creating 5 IPD admissions...')
  const availableBeds = await db.bed.findMany({ where: { status: 'Available' }, take: 4 })
  const ipdPatients = patients.slice(20, 25)
  const ipdData = [
    { patient: ipdPatients[0], doctor: DR_ANITA, ward: WARD_GEN, bed: availableBeds[0], diagnosis: 'Acute Gastroenteritis', insurance: true },
    { patient: ipdPatients[1], doctor: DR_SURESH, ward: WARD_ICU, bed: availableBeds[1], diagnosis: 'Acute MI', insurance: true, critical: true },
    { patient: ipdPatients[2], doctor: DR_ARJUN || DR_ANITA, ward: WARD_PRI, bed: availableBeds[2], diagnosis: 'Fracture Femur', insurance: true },
    { patient: ipdPatients[3], doctor: DR_PRIYA || DR_ANITA, ward: WARD_GEN, bed: availableBeds[3], diagnosis: 'CKD Stage 4', insurance: false },
    { patient: ipdPatients[4], doctor: DR_SURESH, ward: WARD_PRI, bed: null, diagnosis: 'Unstable Angina', insurance: true, discharged: true },
  ]

  for (let i = 0; i < ipdData.length; i++) {
    const data = ipdData[i]
    if (!data.patient) continue
    const bed = data.bed
    if (bed) await db.bed.update({ where: { id: bed.id }, data: { status: 'Occupied' } }).catch(() => {})

    const admission = await db.ipdAdmission.create({
      data: {
        admissionNo: `IPD-2025-${String(300 + i).padStart(6, '0')}`,
        patientName: data.patient.name,
        patientAge: 40 + i * 5,
        patientGender: data.patient.gender,
        patientDob: new Date(1985 - i * 5, 0, 15),
        bloodGroup: ['B+', 'O+', 'A+', 'AB+', 'B+'][i],
        mobileNo: data.patient.mobile,
        address: 'Bengaluru, Karnataka',
        userId: data.patient.id,
        hospitalId: HOSPITAL_ID,
        wardId: data.ward,
        bedId: bed?.id || null,
        departmentId: data.doctor === DR_SURESH ? DEPT_CAR : data.doctor === DR_ARJUN ? DEPT_ORT : DEPT_NEP || DEPT_GEN,
        attendingDoctorId: data.doctor,
        status: data.discharged ? 'Discharged' : 'Admitted',
        admissionDate: new Date(Date.now() - (i + 1) * 86400000),
        admissionTime: '10:00',
        initialDiagnosis: data.diagnosis,
        chiefComplaints: data.diagnosis + ' for 3 days',
        informant: data.patient.name,
        pastHistory: 'No major illnesses',
        personalHistory: '{}',
        consciousnessLevel: 'Conscious',
        generalSigns: '{}',
      },
    }).catch(() => null)

    if (!admission) continue

    // Vitals (3 per admission)
    for (let v = 0; v < 3; v++) {
      const isCritical = data.critical && v === 0
      await db.vitalRecord.create({
        data: {
          admissionId: admission.id,
          nurseId: NURSE_ID,
          recordedAt: new Date(Date.now() - (3 - v) * 3600000),
          patientStatus: 'Conscious',
          temperature: 98.0 + v * 0.5,
          pulse: isCritical ? 92 : 72 + v * 5,
          spo2: isCritical ? 88 : 97 + v * 0.5,
          bpSystolic: isCritical ? 160 : 120 + v * 5,
          bpDiastolic: isCritical ? 100 : 80 + v * 3,
          respiratoryRate: isCritical ? 22 : 16 + v,
          inputMl: 1500 + v * 200,
          urineMl: 1200 + v * 150,
          outputMl: 1200 + v * 150,
          remarks: v === 0 ? 'Admission vitals' : 'Routine monitoring',
        },
      }).catch(() => {})
    }

    // Doctor orders (2 per admission)
    for (let o = 0; o < 2; o++) {
      await db.doctorOrder.create({
        data: {
          admissionId: admission.id,
          doctorId: data.doctor,
          drugName: ['Tab Paracetamol 650', 'IV Normal Saline', 'Tab Amlodipine 5', 'Tab Pantoprazole 40'][i * 2 + o] || 'Tab Paracetamol 500',
          route: o === 0 ? 'Oral' : 'IV',
          dose: '1-0-1',
          frequency: 'BD',
          startDate: new Date(),
          status: 'Active',
          instructions: 'After food',
        },
      }).catch(() => {})
    }

    // Nurse assignment
    await db.nursePatientAssignment.create({
      data: { nurseId: NURSE_ID, admissionId: admission.id, bedId: bed?.id || '', wardId: data.ward, shiftDate: new Date(), shiftType: 'Morning', status: 'Active' }
    }).catch(() => {})

    // Doctor visit
    await db.doctorVisit.create({
      data: {
        admissionId: admission.id,
        doctorId: data.doctor,
        visitDate: new Date(),
        visitTime: '10:00',
        examinationFindings: 'Patient stable. Vitals monitoring.',
        currentDiagnosis: data.diagnosis,
        newOrders: '[]',
        stoppedOrders: '[]',
        advise: 'Continue current treatment.',
      },
    }).catch(() => {})

    // Diet order
    await db.dietOrder.create({
      data: { admissionId: admission.id, hospitalId: HOSPITAL_ID, orderedById: data.doctor, dietType: data.critical ? 'Liquid' : 'Soft', mealType: 'All', instructions: `${data.critical ? 'Clear liquids' : 'Soft diet'} as per condition`, startDate: new Date(), status: 'Active' }
    }).catch(() => {})

    // Sample collection
    await db.sampleCollection.create({
      data: { admissionId: admission.id, nurseId: NURSE_ID, doctorId: data.doctor, testName: ['CBC', 'Troponin I', 'X-Ray', 'KFT', 'ECG'][i], sampleType: 'Blood', collectedAt: new Date(), sentToLabAt: new Date(), status: 'SentToLab' }
    }).catch(() => {})

    // Patient consent
    await db.patientConsent.create({
      data: { admissionId: admission.id, patientId: data.patient.id, consentType: ['General', 'Surgery', 'BloodTransfusion', 'General', 'General'][i], templateName: 'Standard Consent', signedByPatient: i < 3, signedByWitness: i < 3, witnessName: i < 3 ? 'Family Member' : '', witnessRelation: i < 3 ? 'Spouse' : '', signedAt: i < 3 ? new Date() : null, validUntil: new Date(Date.now() + 365 * 86400000), createdBy: 'dev-receptionist' }
    }).catch(() => {})
  }
  console.log('  ✓ 5 IPD admissions (with vitals, orders, visits, diet, samples, consent, nurse assignment)')

  // ─── 8. LAB REPORTS (10) ──────────────────────────────
  console.log('\n🔬 Creating 10 lab reports...')
  const labTests = await db.labTestMaster.findMany({ where: { hospitalId: HOSPITAL_ID } })
  const labTech = await db.labTechnician.findFirst({ where: { hospitalId: HOSPITAL_ID } })

  for (let i = 0; i < 10; i++) {
    const test = labTests[i % labTests.length]
    const patient = patients[20 + i % 15]
    if (!test) continue
    const isAbnormal = i % 3 === 0
    const status = i < 5 ? 'Verified' : i < 8 ? 'ResultEntered' : 'Ordered'

    const report = await db.labReport.create({
      data: {
        reportNo: `LR-TEST-${String(i + 1).padStart(5, '0')}`,
        hospitalId: HOSPITAL_ID,
        testMasterId: test.id,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        orderedById: 'dev-doctor-anita',
        sampleCollectedAt: status !== 'Ordered' ? new Date(Date.now() - 3600000) : null,
        sampleCollectedBy: status !== 'Ordered' ? 'dev-nurse' : null,
        resultEnteredAt: status === 'Verified' || status === 'ResultEntered' ? new Date() : null,
        resultEnteredBy: status === 'Verified' || status === 'ResultEntered' ? 'dev-lab-tech' : null,
        verifiedById: status === 'Verified' ? labTech?.id : null,
        verifiedAt: status === 'Verified' ? new Date() : null,
        status,
      },
    }).catch(() => null)

    if (report) {
      const parameters = await db.labTestParameter.findMany({ where: { testMasterId: test.id } })
      for (const param of parameters) {
        const value = param.normalMaleMin + Math.random() * (param.normalMaleMax - param.normalMaleMin)
        await db.labParameterValue.create({
          data: {
            labReportId: report.id,
            testParameterId: param.id,
            value: isAbnormal ? String((value * 1.5).toFixed(1)) : String(value.toFixed(1)),
            isAbnormal,
            remarks: isAbnormal ? 'Abnormal — above normal range' : 'Within normal limits',
          },
        }).catch(() => {})
      }
    }
  }
  console.log('  ✓ 10 lab reports (5 verified, 3 result entered, 2 ordered — 3 abnormal)')

  // ─── 9. OT SCHEDULES (3) ──────────────────────────────
  console.log('\n🔬 Creating 3 OT schedules...')
  const ot = await db.operationTheater.findFirst({ where: { hospitalId: HOSPITAL_ID } })
  const ipdAdmissions = await db.ipdAdmission.findMany({ take: 3 })
  if (ot && ipdAdmissions.length >= 3) {
    const surgeries = [
      { name: 'ORIF Femur', type: 'Elective', duration: 120, status: 'Scheduled', surgeon: DR_ARJUN || DR_ANITA },
      { name: 'Angiography', type: 'Elective', duration: 90, status: 'Scheduled', surgeon: DR_SURESH },
      { name: 'Stent Placement', type: 'Elective', duration: 60, status: 'Completed', surgeon: DR_SURESH },
    ]
    for (let i = 0; i < 3; i++) {
      await db.otSchedule.create({
        data: {
          otId: ot.id,
          hospitalId: HOSPITAL_ID,
          admissionId: ipdAdmissions[i].id,
          surgeonId: surgeries[i].surgeon,
          nurseId: NURSE_ID,
          surgeryName: surgeries[i].name,
          surgeryType: surgeries[i].type,
          scheduledDate: new Date(Date.now() + (i + 1) * 86400000),
          estimatedDuration: surgeries[i].duration,
          status: surgeries[i].status,
        },
      }).catch(() => {})
    }
    console.log('  ✓ 3 OT schedules (2 scheduled, 1 completed)')
  }

  // ─── 10. IPD BILLS (5) ────────────────────────────────
  console.log('\n💰 Creating IPD bills...')
  const allIpdAdmissions = await db.ipdAdmission.findMany()
  const chargeItems = await db.chargeItem.findMany({ where: { hospitalId: HOSPITAL_ID } })
  for (let i = 0; i < Math.min(5, allIpdAdmissions.length); i++) {
    const adm = allIpdAdmissions[i]
    const roomRent = 5000 * 3
    const consultation = 2000
    const labAmt = 3000 + i * 500
    const medAmt = 2000
    const subtotal = roomRent + consultation + labAmt + medAmt
    const tax = subtotal * 0.05
    const total = subtotal + tax
    const isPaid = i < 3

    const bill = await db.ipdBill.create({
      data: {
        billNo: `IPD-BILL-TEST-${String(300 + i).padStart(6, '0')}`,
        admissionId: adm.id,
        hospitalId: HOSPITAL_ID,
        roomRentAmount: roomRent,
        serviceAmount: consultation,
        labAmount: labAmt,
        medicineAmount: medAmt,
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        netPayable: total,
        status: isPaid ? 'Paid' : 'Draft',
        generatedAt: new Date(),
        finalizedAt: isPaid ? new Date() : null,
        generatedBy: 'dev-receptionist',
      },
    }).catch(() => null)

    if (bill && isPaid) {
      await db.billPayment.create({
        data: {
          receiptNo: `PAY-TEST-${String(300 + i).padStart(6, '0')}`,
          billId: bill.id,
          admissionId: adm.id,
          hospitalId: HOSPITAL_ID,
          amount: total,
          paymentMethod: ['Cash', 'UPI', 'Card'][i % 3],
          paymentDate: new Date(),
          receivedBy: 'dev-receptionist',
        },
      }).catch(() => {})
    }
  }
  console.log('  ✓ 5 IPD bills (3 paid, 2 draft)')

  // ─── 11. EXPENSES (10) ─────────────────────────────────
  console.log('\n💵 Creating expenses...')
  const vendors = await db.vendor.findMany({ where: { hospitalId: HOSPITAL_ID } })
  const expCats = await db.expenseCategory.findMany({ where: { hospitalId: HOSPITAL_ID } })
  const expAmounts = [45000, 35000, 12000, 8000, 5000, 15000, 22000, 6000, 3000, 18000]
  for (let i = 0; i < 10; i++) {
    await db.expense.create({
      data: {
        hospitalId: HOSPITAL_ID,
        categoryId: expCats[i % expCats.length].id,
        vendorId: vendors[i % vendors.length].id,
        expenseNo: `EXP-TEST-${String(300 + i).padStart(6, '0')}`,
        expenseDate: new Date(Date.now() - i * 86400000),
        amount: expAmounts[i],
        taxAmount: expAmounts[i] * 0.18,
        totalAmount: expAmounts[i] * 1.18,
        paymentMode: ['Bank', 'Cash', 'UPI'][i % 3],
        description: `${expCats[i % expCats.length].name} — ${vendors[i % vendors.length].name}`,
        status: i < 4 ? 'Paid' : i < 7 ? 'Approved' : 'Pending',
        createdBy: 'dev-hospital',
        approvedBy: i < 7 ? 'dev-hospital' : null,
        approvedAt: i < 7 ? new Date() : null,
        paymentDate: i < 4 ? new Date() : null,
      },
    }).catch(() => {})
  }
  console.log('  ✓ 10 expenses (4 paid, 3 approved, 3 pending)')

  // ─── 12. DOCTOR RATINGS (10) ──────────────────────────
  console.log('\n⭐ Creating doctor ratings...')
  const doctorUsers = [
    { id: 'dev-doctor', name: 'Dr. Rajesh Sharma' },
    { id: 'dev-doctor-anita', name: 'Dr. Anita Desai' },
    { id: 'dev-doctor-suresh', name: 'Dr. Suresh Iyer' },
    { id: 'dev-doctor-arjun', name: 'Dr. Arjun Reddy' },
    { id: 'dev-doctor-priya', name: 'Dr. Priya Nair' },
  ]
  for (let i = 0; i < 10; i++) {
    const doc = doctorUsers[i % 5]
    const patient = patients[i % 10]
    await db.doctorRating.create({
      data: {
        doctorId: doc.id,
        patientId: patient.id,
        star: [5, 4, 5, 3, 5, 4, 5, 4, 5, 5][i],
        review: ['Excellent doctor!','Good experience.','Highly recommend.','Average service.','Very caring.','Professional.','Outstanding!','Satisfactory.','Best doctor.','Very helpful.'][i],
        consultationRating: [5, 4, 5, 3, 5, 4, 5, 4, 5, 5][i],
        waitTimeRating: [4, 3, 5, 2, 4, 3, 4, 2, 5, 4][i],
        staffRating: [4, 4, 5, 3, 5, 4, 4, 3, 5, 5][i],
        wouldRecommend: true,
        isAnonymous: i % 5 === 0,
      },
    }).catch(() => {})
  }
  console.log('  ✓ 10 doctor ratings')

  // ─── 13. STOCK MOVEMENTS (10) ─────────────────────────
  console.log('\n📦 Creating stock movements...')
  const invItems = await db.inventoryItem.findMany({ where: { hospitalId: HOSPITAL_ID } })
  for (let i = 0; i < Math.min(10, invItems.length); i++) {
    await db.stockMovement.create({
      data: { itemId: invItems[i].id, hospitalId: HOSPITAL_ID, movementType: i % 2 === 0 ? 'IN' : 'OUT', quantity: i % 2 === 0 ? 50 : 10, referenceNo: `SM-TEST-${i}`, fromLocation: i % 2 === 0 ? 'Supplier' : 'Store', toLocation: i % 2 === 0 ? 'Store' : 'OPD', notes: 'Test movement', movedBy: 'dev-pharmacist' }
    }).catch(() => {})
  }
  console.log('  ✓ 10 stock movements')

  // ─── SUMMARY ──────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  ✅ TESTING DATA COMPLETE')
  console.log('══════════════════════════════════════════════════════════')
  console.log('\nClinic Module:')
  console.log('  15 bookings (5 online + 5 walk-in + 2 video + 3 follow-up + 2 no-show)')
  console.log('  10 prescriptions (with medicines + fulfillment)')
  console.log('\nHospital Module:')
  console.log('  2 new doctors (Ortho + Nephro) + 2 new departments')
  console.log('  30 OPD bookings (Cardio 10 + GenMed 10 + Ortho 5 + Nephro 5)')
  console.log('  5 IPD admissions (with vitals, orders, visits, diet, samples, consent)')
  console.log('  10 lab reports (5 verified, 3 result entered, 2 ordered — 3 abnormal)')
  console.log('  3 OT schedules (2 scheduled, 1 completed)')
  console.log('  5 IPD bills (3 paid, 2 draft)')
  console.log('  10 expenses (4 paid, 3 approved, 3 pending)')
  console.log('  10 doctor ratings + 10 stock movements')
  console.log(`  Total new patients: ${patients.length}`)

  await db.$disconnect()
}

main().catch((err) => {
  console.error('❌ Testing data seed failed:', err.message?.substring(0, 300))
  process.exit(1)
})
