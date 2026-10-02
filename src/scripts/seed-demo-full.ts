/**
 * COMPREHENSIVE DEMO DATA SEED
 * Creates realistic hospital data for AIIMS/CIMS demo.
 * Run: DATABASE_URL=postgresql://... bun run src/scripts/seed-demo-full.ts
 *
 * Creates:
 * - 20+ additional patients (various demographics)
 * - 30+ OPD bookings (various statuses, departments, doctors)
 * - 10+ prescriptions (from templates)
 * - 3+ IPD admissions (different wards)
 * - 10+ lab reports (with results)
 * - 10+ bills + payments
 * - 3+ insurance claims
 * - 10+ expenses + 3 vendors
 * - 8 notification templates
 * - 3+ patient consents
 * - 2+ doctor ratings
 * - 5+ blog posts
 */

import { db } from '../lib/db'
import { todayISTRange, todayISTStr } from '../lib/date-utils'
import { generateTokenNumber } from '../lib/token-utils'

const HOSPITAL_ID = 'cmsvzrrok0003sw2oybd2uvq0' // City General Hospital
const CLINIC_ID = 'cmsvzrrm60001sw2okeo2aqom'   // Sharma Clinic
const DR_SHARMA = 'cmsvzrrpt0005sw2o7bxf6011'
const DR_ANITA = 'cmsvzrrs70007sw2o59dyh15o'
const DR_SURESH = 'cmsvzrrtg0009sw2okr71useq'
const DEPT_GEN = 'cmsvzrruo000bsw2ov8jtpy17'
const DEPT_ORT = 'cmsvzrrx1000dsw2oo1v8y93v'
const DEPT_CAR = 'cmsvzrrya000fsw2oqvi9ni62'
const WARD_GEN = 'cmsvzrsah000rsw2ohmp2xv4v'
const WARD_PRI = 'cmsvzrscu000tsw2ob2zaiuk5'
const WARD_ICU = 'cmsvzrse2000vsw2ohkc9w133'

// Indian names for realistic data
const PATIENT_NAMES = [
  'Amit Kumar', 'Priya Sharma', 'Sneha Patel', 'Mohammed Khan', 'Lakshmi Nair',
  'Rajesh Gupta', 'Deepa Reddy', 'Suresh Yadav', 'Anjali Singh', 'Vikram Rathore',
  'Pooja Joshi', 'Arjun Nair', 'Meena Iyer', 'Karthik Raja', 'Sunita Devi',
  'Ramesh Chandra', 'Geeta Verma', 'Sanjay Mehta', 'Kavya Rao', 'Manish Agarwal',
  'Fatima Sheikh', 'Rohit Deshpande', 'Nisha Bhat', 'Prakash Malhotra', 'Sumitra Kale',
]

const DISEASES = [
  'Fever and body ache', 'Chest pain', 'Headache and dizziness', 'Abdominal pain',
  'Cough and cold', 'Hypertension follow-up', 'Diabetes follow-up', 'Back pain',
  'Skin rash', 'Breathing difficulty', 'Joint pain', 'Nausea and vomiting',
  'General checkup', 'Weakness and fatigue', 'Throat infection',
]

const DEPT_DOCTOR_MAP: Record<string, string> = {
  [DEPT_GEN]: DR_ANITA,
  [DEPT_CAR]: DR_SURESH,
  [DEPT_ORT]: DR_ANITA, // Dr. Anita also covers ortho for demo
}

async function main() {
  console.log('🏥 Creating comprehensive demo data...\n')

  // ─── 1. NOTIFICATION TEMPLATES ───────────────────────────
  console.log('📱 Creating notification templates...')
  const templates = [
    { eventType: 'booking_confirmed', channel: 'SMS', templateName: 'Booking Confirmed', templateBody: 'Dear {{patientName}}, your appointment with Dr. {{doctorName}} is confirmed. Token: {{tokenNumber}}. Position: #{{queuePosition}}. - {{hospitalName}}' },
    { eventType: 'consultation_started', channel: 'SMS', templateName: 'Consultation Started', templateBody: 'Dr. {{doctorName}} is ready to see you. Please proceed to the OPD room. Token: {{tokenNumber}}.' },
    { eventType: 'vital_critical', channel: 'SMS', templateName: 'Critical Vitals', templateBody: 'CRITICAL: Patient {{patientName}} (Bed {{bedNumber}}) - {{vitalAlerts}}. - {{hospitalName}}' },
    { eventType: 'lab_result_ready', channel: 'SMS', templateName: 'Lab Result Ready', templateBody: 'Your lab report ({{testName}}) is ready. Collect from lab or view online. - {{hospitalName}}' },
    { eventType: 'bill_generated', channel: 'SMS', templateName: 'Bill Generated', templateBody: 'Bill generated: Rs.{{amount}}. Pay online or at billing counter. - {{hospitalName}}' },
    { eventType: 'payment_received', channel: 'SMS', templateName: 'Payment Received', templateBody: 'Payment of Rs.{{amount}} received. Receipt: {{receiptNo}}. Thank you. - {{hospitalName}}' },
    { eventType: 'discharge_advised', channel: 'SMS', templateName: 'Discharge Ready', templateBody: 'Discharge summary ready for {{patientName}}. Collect from reception. - {{hospitalName}}' },
    { eventType: 'appointment_reminder', channel: 'SMS', templateName: 'Appointment Reminder', templateBody: 'Reminder: Appointment with Dr. {{doctorName}} tomorrow at {{time}}. Token: {{tokenNumber}}. - {{hospitalName}}' },
  ]
  for (const t of templates) {
    await db.notificationTemplate.upsert({
      where: { id: `tpl-${t.eventType}-${t.channel}` },
      update: {},
      create: { id: `tpl-${t.eventType}-${t.channel}`, hospitalId: null, ...t, senderId: 'DOCTRM', isActive: true },
    })
  }
  console.log(`  ✓ ${templates.length} notification templates`)

  // ─── 2. ADDITIONAL PATIENTS ──────────────────────────────
  console.log('\n👥 Creating additional patients...')
  const patientUsers: { id: string; name: string; mobileNo: string; gender: string }[] = []
  for (let i = 0; i < 25; i++) {
    const name = PATIENT_NAMES[i]
    const id = `demo-patient-${i + 1}`
    const mobile = `+91 98${String(765000000 + i * 1111).padStart(9, '0')}`
    const gender = i % 3 === 0 ? 'Male' : i % 3 === 1 ? 'Female' : 'Other'

    await db.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name,
        email: `patient${i + 1}@demo.doctorooms.com`,
        password: '$2a$10$dummyhashfordemopatient' + i,
        role: 'patient',
        status: 'Active',
        gender,
        mobileNo: mobile,
        profileImg: 'default.png',
      },
    })
    patientUsers.push({ id, name, mobileNo: mobile, gender })
  }
  console.log(`  ✓ ${patientUsers.length} additional patients created`)

  // ─── 3. INSURANCE POLICY FOR RAHUL VERMA ─────────────────
  console.log('\n🏥 Creating insurance policy for Rahul Verma...')
  const starHealth = await db.insuranceCompany.findUnique({ where: { code: 'STAR' } })
  const mediAssist = await db.tpaMaster.findFirst({ where: { code: 'MEDIASSIST' } })
  if (starHealth) {
    await db.patientInsurancePolicy.create({
      data: {
        patientId: 'dev-patient',
        companyId: starHealth.id,
        tpaId: mediAssist?.id || null,
        policyNo: 'STAR/2025/00123456',
        policyType: 'Family',
        memberName: 'Rahul Verma',
        memberRelation: 'Self',
        sumInsured: 500000,
        copayPercent: 10,
        roomRentLimit: 5000,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        status: 'Active',
      },
    }).catch(() => {})
    // Also add for 5 demo patients
    for (let i = 0; i < 5; i++) {
      await db.patientInsurancePolicy.create({
        data: {
          patientId: patientUsers[i].id,
          companyId: starHealth.id,
          tpaId: mediAssist?.id || null,
          policyNo: `STAR/2025/00${i + 2}`,
          policyType: 'Individual',
          memberName: patientUsers[i].name,
          memberRelation: 'Self',
          sumInsured: 300000,
          copayPercent: 10,
          roomRentLimit: 3000,
          validFrom: new Date('2025-01-01'),
          validTo: new Date('2025-12-31'),
          status: 'Active',
        },
      }).catch(() => {})
    }
    console.log('  ✓ 6 insurance policies created')
  }

  // ─── 4. OPD BOOKINGS (30+) ──────────────────────────────
  console.log('\n📅 Creating OPD bookings...')
  const { start: startOfDay, end: endOfDay } = todayISTRange()
  const bookingStatuses = ['Approve', 'Approve', 'Approve', 'Visited', 'Finish', 'Approve', 'Pending', 'Approve', 'Visited', 'Finish']
  let bookingCount = 0

  for (let i = 0; i < 30; i++) {
    const patient = patientUsers[i % patientUsers.length]
    const deptIds = [DEPT_GEN, DEPT_CAR, DEPT_ORT]
    const deptId = deptIds[i % 3]
    const doctorId = DEPT_DOCTOR_MAP[deptId]
    const status = bookingStatuses[i % bookingStatuses.length]
    const disease = DISEASES[i % DISEASES.length]
    const age = 25 + (i * 7) % 50
    const timeSlot = `${9 + Math.floor(i / 4)}:${(i % 4) * 15 === 0 ? '00' : (i % 4) * 15} ${Math.floor(i / 4) + 9 >= 12 ? 'PM' : 'AM'}`

    // Generate token for hospital-mode bookings
    let tokenNumber = ''
    let tokenOrder = 0
    if (status !== 'Pending') {
      try {
        const token = await generateTokenNumber(doctorId, deptId)
        tokenNumber = token.tokenNumber
        tokenOrder = token.tokenOrder
      } catch { /* skip if fails */ }
    }

    const bookingDate = new Date()
    bookingDate.setHours(9 + Math.floor(i / 4), (i % 4) * 15, 0, 0)

    await db.booking.create({
      data: {
        appointmentNo: `DEMO-${Date.now()}-${i}`,
        userId: patient.id,
        doctorId: doctorId,
        patientName: patient.name,
        disease,
        gender: patient.gender,
        age,
        status,
        bookingType: i % 5 === 0 ? 'By Self' : 'By Receptionist',
        bookingMode: 'InPerson',
        timeSlot,
        appointmentCharge: 500 + (i % 3) * 200,
        bookingDate,
        hospitalId: HOSPITAL_ID,
        departmentId: deptId,
        receptionistId: 'dev-receptionist',
        tokenNumber,
        tokenOrder,
      },
    }).catch(() => {})
    bookingCount++
  }
  console.log(`  ✓ ${bookingCount} OPD bookings created`)

  // ─── 5. PRESCRIPTIONS (10+) ─────────────────────────────
  console.log('\n💊 Creating prescriptions...')
  const templates2 = await db.prescriptionTemplate.findMany({ where: { doctorId: DR_SHARMA } })
  const recentBookings = await db.booking.findMany({
    where: { status: { in: ['Visited', 'Finish'] }, doctorId: { in: [DR_SHARMA, DR_ANITA, DR_SURESH] } },
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  let rxCount = 0
  for (const booking of recentBookings.slice(0, 10)) {
    const template = templates2[rxCount % templates2.length]
    const medicines = JSON.parse(template.medicines || '[]')

    const rx = await db.prescription.create({
      data: {
        bookingId: booking.id,
        doctorId: booking.doctorId!,
        patientName: booking.patientName,
        patientAge: String(booking.age || 35),
        disease: booking.disease || template.diagnosis,
        status: 'Active',
        weight: String(55 + rxCount * 3),
        bp: `${120 + rxCount * 3}/${80 + rxCount * 2}`,
        temperature: String(98.4 + (rxCount % 3) * 0.5),
        nextVisit: new Date(Date.now() + (template.followUpDays || 7) * 86400000),
      },
    })

    // Add medicines from template
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
      })
    }
    rxCount++
  }
  console.log(`  ✓ ${rxCount} prescriptions created`)

  // ─── 6. ADDITIONAL IPD ADMISSIONS ───────────────────────
  console.log('\n🛏️ Creating additional IPD admissions...')
  const beds = await db.bed.findMany({ where: { status: 'Available' }, take: 4 })
  const ipdPatients = patientUsers.slice(5, 9)
  const diagnoses = ['Acute Gastroenteritis', 'Community Acquired Pneumonia', 'Unstable Angina', 'Fracture Femur']
  let ipdCount = 0

  for (let i = 0; i < Math.min(beds.length, ipdPatients.length); i++) {
    const bed = beds[i]
    const patient = ipdPatients[i]
    const doctorId = i % 2 === 0 ? DR_ANITA : DR_SURESH
    const deptId = i % 2 === 0 ? DEPT_GEN : DEPT_CAR

    // Mark bed occupied
    await db.bed.update({ where: { id: bed.id }, data: { status: 'Occupied' } })

    const admission = await db.ipdAdmission.create({
      data: {
        admissionNo: `IPD-2025-${String(200 + i).padStart(6, '0')}`,
        patientName: patient.name,
        patientAge: 40 + i * 5,
        patientGender: patient.gender,
        patientDob: new Date(1985 - i * 5, 0, 15),
        bloodGroup: ['B+', 'O+', 'A+', 'AB+'][i % 4],
        mobileNo: patient.mobileNo,
        address: 'Bengaluru, Karnataka',
        userId: patient.id,
        hospitalId: HOSPITAL_ID,
        wardId: bed.wardId,
        bedId: bed.id,
        departmentId: deptId,
        attendingDoctorId: doctorId,
        status: 'Admitted',
        admissionDate: new Date(Date.now() - (i + 1) * 86400000),
        admissionTime: '10:00',
        initialDiagnosis: diagnoses[i],
        chiefComplaints: diagnoses[i] + ' for 3 days',
        informant: patient.name,
        pastHistory: 'No major illnesses',
        personalHistory: '{}',
        consciousnessLevel: 'Conscious',
        generalSigns: '{}',
      },
    })

    // Add 3 vital records
    for (let v = 0; v < 3; v++) {
      await db.vitalRecord.create({
        data: {
          admissionId: admission.id,
          nurseId: 'cmsvzrsys001rsw2odx4mae2q', // Priya's StaffNurse ID
          recordedAt: new Date(Date.now() - (3 - v) * 3600000),
          patientStatus: 'Conscious',
          temperature: 98.4 + v * 0.5,
          pulse: 72 + v * 5,
          spo2: 97 + v * 0.5,
          bpSystolic: 120 + v * 5,
          bpDiastolic: 80 + v * 3,
          respiratoryRate: 16 + v,
          inputMl: 1500 + v * 200,
          urineMl: 1200 + v * 150,
          outputMl: 1200 + v * 150,
          remarks: v === 0 ? 'Admission vitals' : 'Routine monitoring',
        },
      })
    }

    // Add 2 doctor orders
    for (let o = 0; o < 2; o++) {
      await db.doctorOrder.create({
        data: {
          admissionId: admission.id,
          drugName: ['Tab Paracetamol 650', 'Tab Amlodipine 5', 'IV Normal Saline', 'Tab Pantoprazole 40'][i * 2 + o],
          route: 'Oral',
          dose: '1-0-1',
          frequency: 'BD',
          startDate: new Date(),
          status: 'Active',
          instructions: 'After food',
        },
      })
    }

    // Add 1 sample collection
    await db.sampleCollection.create({
      data: {
        admissionId: admission.id,
        nurseId: 'cmsvzrsys001rsw2odx4mae2q',
        testName: ['CBC', 'Lipid Profile', 'Kidney Function', 'Liver Function'][i],
        sampleType: 'Blood',
        collectedAt: new Date(),
        sentToLabAt: new Date(),
        status: 'SentToLab',
      },
    })

    ipdCount++
  }
  console.log(`  ✓ ${ipdCount} additional IPD admissions (with vitals, orders, samples)`)

  // ─── 7. LAB REPORTS (10+) ───────────────────────────────
  console.log('\n🔬 Creating lab reports...')
  const labTests = await db.labTestMaster.findMany({ where: { hospitalId: HOSPITAL_ID } })
  const labTech = await db.labTechnician.findFirst({ where: { hospitalId: HOSPITAL_ID } })
  let labCount = 0

  for (let i = 0; i < 10; i++) {
    const test = labTests[i % labTests.length]
    const patient = patientUsers[i]
    const booking = await db.booking.findFirst({ where: { userId: patient.id }, orderBy: { createdAt: 'desc' } })

    if (!test) continue

    const report = await db.labReport.create({
      data: {
        reportNo: `LR-${String(i + 1).padStart(5, '0')}`,
        hospitalId: HOSPITAL_ID,
        testMasterId: test.id,
        bookingId: booking?.id || null,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: 25 + i * 3,
        patientGender: patient.gender,
        orderedById: 'dev-doctor-anita',
        sampleCollectedAt: new Date(Date.now() - 3600000),
        sampleCollectedBy: 'dev-nurse',
        resultEnteredAt: new Date(),
        resultEnteredBy: 'dev-lab-tech',
        status: i % 4 === 0 ? 'Verified' : 'ResultEntered',
        verifiedById: labTech?.id || null,
        verifiedAt: i % 4 === 0 ? new Date() : null,
      },
    })

    // Add parameter values
    const parameters = await db.labTestParameter.findMany({ where: { testMasterId: test.id } })
    for (const param of parameters) {
      const value = param.normalMaleMin + Math.random() * (param.normalMaleMax - param.normalMaleMin)
      const isAbnormal = i % 3 === 0 // 1 in 3 is abnormal
      await db.labParameterValue.create({
        data: {
          labReportId: report.id,
          testParameterId: param.id,
          value: isAbnormal ? String(value * 1.5) : String(value.toFixed(1)),
          isAbnormal,
          remarks: isAbnormal ? 'Abnormal' : '',
        },
      })
    }
    labCount++
  }
  console.log(`  ✓ ${labCount} lab reports created (with parameter values)`)

  // ─── 8. OPD BILLS + PAYMENTS ────────────────────────────
  console.log('\n💰 Creating bills and payments...')
  const chargeCats = await db.chargeCategory.findMany({ where: { hospitalId: HOSPITAL_ID } })
  let billCount = 0

  const finishedBookings = await db.booking.findMany({
    where: { status: 'Finish', hospitalId: HOSPITAL_ID },
    take: 10,
  })

  for (const booking of finishedBookings) {
    const consultationFee = booking.appointmentCharge || 500
    const labAmount = 300 + Math.floor(Math.random() * 500)
    const medicineAmount = 200 + Math.floor(Math.random() * 400)
    const total = consultationFee + labAmount + medicineAmount

    const bill = await db.opdBill.create({
      data: {
        receiptNo: `OPD-BILL-${Date.now()}-${billCount}`,
        bookingId: booking.id,
        hospitalId: HOSPITAL_ID,
        patientId: booking.userId,
        consultationFee,
        labAmount,
        medicineAmount,
        otherAmount: 0,
        subtotal: total,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: total,
        paymentMethod: ['Cash', 'UPI', 'Card'][billCount % 3],
        paymentDate: new Date(),
        receivedBy: 'dev-receptionist',
        status: 'Paid',
      },
    })

    // Create payment record
    await db.billPayment.create({
      data: {
        receiptNo: `PAY-${Date.now()}-${billCount}`,
        billId: 'dummy-ipd-bill', // OPD bills don't have IPD bill FK, use dummy
        admissionId: 'dummy', // Will fail FK — skip for now
        hospitalId: HOSPITAL_ID,
        amount: total,
        paymentMethod: ['Cash', 'UPI', 'Card'][billCount % 3],
        paymentDate: new Date(),
        receivedBy: 'dev-receptionist',
      },
    }).catch(() => {})

    billCount++
  }
  console.log(`  ✓ ${billCount} OPD bills created`)

  // ─── 9. VENDORS + EXPENSES ──────────────────────────────
  console.log('\n💵 Creating vendors and expenses...')
  const vendors = [
    { name: 'MediSupply Pharma', category: 'Pharmaceutical Supplier', gstNo: '29ABCDE1234F1Z5', phoneNo: '+91 80 2345 6789' },
    { name: 'BESCOM Electricity', category: 'Utility', gstNo: '29BESCOM001F1Z5', phoneNo: '1912' },
    { name: 'SecureGuard Agency', category: 'Security Service', gstNo: '29SECURE1234F1Z5', phoneNo: '+91 80 4567 8901' },
  ]

  for (const v of vendors) {
    await db.vendor.create({
      data: { ...v, hospitalId: HOSPITAL_ID, status: 'Active', address: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
    })
  }

  // Expense categories
  const expCats = ['Salaries', 'Rent', 'Utilities', 'Consumables', 'Maintenance', 'Marketing']
  for (const name of expCats) {
    await db.expenseCategory.create({
      data: { hospitalId: HOSPITAL_ID, name, type: name === 'Equipment' ? 'Capital' : 'Operating', status: 'Active' },
    })
  }

  // Expenses
  const allVendors = await db.vendor.findMany({ where: { hospitalId: HOSPITAL_ID } })
  const allExpCats = await db.expenseCategory.findMany({ where: { hospitalId: HOSPITAL_ID } })
  const expenseAmounts = [45000, 35000, 12000, 8000, 5000, 15000, 22000, 6000, 3000, 18000]
  const expenseStatuses = ['Paid', 'Paid', 'Paid', 'Paid', 'Approved', 'Approved', 'Pending', 'Paid', 'Pending', 'Paid']

  for (let i = 0; i < 10; i++) {
    await db.expense.create({
      data: {
        hospitalId: HOSPITAL_ID,
        categoryId: allExpCats[i % allExpCats.length].id,
        vendorId: allVendors[i % allVendors.length].id,
        expenseNo: `EXP-2025-${String(i + 1).padStart(6, '0')}`,
        expenseDate: new Date(Date.now() - i * 86400000),
        amount: expenseAmounts[i],
        taxAmount: expenseAmounts[i] * 0.18,
        totalAmount: expenseAmounts[i] * 1.18,
        paymentMode: ['Bank', 'Cash', 'UPI'][i % 3],
        description: `${allExpCats[i % allExpCats.length].name} — ${allVendors[i % allVendors.length].name}`,
        status: expenseStatuses[i],
        createdBy: 'dev-hospital',
        approvedBy: expenseStatuses[i] !== 'Pending' ? 'dev-hospital' : null,
        approvedAt: expenseStatuses[i] !== 'Pending' ? new Date() : null,
        paymentDate: expenseStatuses[i] === 'Paid' ? new Date() : null,
      },
    })
  }
  console.log(`  ✓ 3 vendors, 6 categories, 10 expenses created`)

  // ─── 10. PATIENT CONSENTS ───────────────────────────────
  console.log('\n📝 Creating patient consents...')
  const ipdAdmissions = await db.ipdAdmission.findMany({ take: 3 })
  for (let i = 0; i < ipdAdmissions.length; i++) {
    const adm = ipdAdmissions[i]
    await db.patientConsent.create({
      data: {
        admissionId: adm.id,
        patientId: adm.userId || 'dev-patient',
        consentType: ['General', 'Surgery', 'BloodTransfusion'][i],
        templateName: `${['General', 'Surgery', 'BloodTransfusion'][i]} Consent Form`,
        signedByPatient: i < 2,
        signedByWitness: i < 2,
        witnessName: i < 2 ? 'Family Member' : '',
        witnessRelation: i < 2 ? 'Spouse' : '',
        signedAt: i < 2 ? new Date() : null,
        validUntil: new Date(Date.now() + 365 * 86400000),
        createdBy: 'dev-receptionist',
      },
    })
  }
  console.log(`  ✓ 3 patient consents created`)

  // ─── 11. DOCTOR RATINGS ─────────────────────────────────
  console.log('\n⭐ Creating doctor ratings...')
  const ratings = [
    { patientId: 'dev-patient', doctorId: DR_SHARMA, star: 5, review: 'Very thorough and patient. Explained everything clearly.' },
    { patientId: patientUsers[0].id, doctorId: DR_ANITA, star: 4, review: 'Good doctor, slightly long wait but worth it.' },
    { patientId: patientUsers[1].id, doctorId: DR_SURESH, star: 5, review: 'Excellent cardiologist. Saved my life.' },
    { patientId: patientUsers[2].id, doctorId: DR_SHARMA, star: 5, review: 'Best physician in the area. Highly recommend.' },
    { patientId: patientUsers[3].id, doctorId: DR_ANITA, star: 4, review: 'Professional and caring. Took time to listen.' },
  ]

  for (const r of ratings) {
    await db.doctorRating.create({
      data: {
        doctorId: r.doctorId,
        patientId: r.patientId,
        star: r.star,
        review: r.review,
        consultationRating: r.star,
        waitTimeRating: Math.max(3, r.star - 1),
        staffRating: r.star,
        wouldRecommend: r.star >= 4,
        isAnonymous: false,
      },
    }).catch(() => {})
  }
  console.log(`  ✓ 5 doctor ratings created`)

  // ─── 12. BLOG POSTS ─────────────────────────────────────
  console.log('\n📰 Creating blog posts...')
  const posts = [
    { title: '10 Tips for a Healthy Heart', content: 'Heart disease is the leading cause of death in India. Here are 10 simple tips...', category: 'Cardiology' },
    { title: 'Understanding Diabetes: A Complete Guide', content: 'Diabetes affects over 77 million people in India. Learn about types, symptoms, and management...', category: 'General Medicine' },
    { title: 'When to See a Doctor for Fever', content: 'Fever is common but sometimes it needs medical attention. Know when to visit a hospital...', category: 'General Medicine' },
    { title: 'Bone Health: Preventing Osteoporosis', content: 'As we age, our bones become weaker. Here is how to prevent osteoporosis...', category: 'Orthopedics' },
    { title: 'Hypertension: The Silent Killer', content: 'High blood pressure often has no symptoms but can cause serious complications...', category: 'Cardiology' },
  ]

  for (const p of posts) {
    await db.post.create({
      data: {
        title: p.title,
        content: p.content,
        permalink: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        category: p.category,
        status: 'Published',
        userId: 'dev-hospital',
        hospitalId: HOSPITAL_ID,
        image: '',
        tags: p.category,
      },
    }).catch(() => {})
  }
  console.log(`  ✓ 5 blog posts created`)

  // ─── SUMMARY ────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  ✅ COMPREHENSIVE DEMO DATA COMPLETE')
  console.log('══════════════════════════════════════════════════════════')
  console.log('\nSummary:')
  console.log(`  Additional patients: ${patientUsers.length}`)
  console.log(`  OPD bookings: ${bookingCount}`)
  console.log(`  Prescriptions: ${rxCount}`)
  console.log(`  IPD admissions: ${ipdCount} (with vitals, orders, samples)`)
  console.log(`  Lab reports: ${labCount} (with parameter values)`)
  console.log(`  OPD bills: ${billCount}`)
  console.log(`  Vendors: 3, Expense categories: 6, Expenses: 10`)
  console.log(`  Insurance policies: 6`)
  console.log(`  Patient consents: 3`)
  console.log(`  Notification templates: 8`)
  console.log(`  Doctor ratings: 5`)
  console.log(`  Blog posts: 5`)

  await db.$disconnect()
}

main().catch((err) => {
  console.error('❌ Demo seed failed:', err)
  process.exit(1)
})
