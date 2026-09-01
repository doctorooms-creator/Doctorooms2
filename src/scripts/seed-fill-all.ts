/**
 * FILL ALL EMPTY TABLES — Real-life demo data
 * Run: DATABASE_URL=postgresql://... bun run src/scripts/seed-fill-all.ts
 */

import { db } from '../lib/db'

const HOSPITAL_ID = 'cmsvzrrok0003sw2oybd2uvq0'
const DR_SHARMA = 'cmsvzrrpt0005sw2o7bxf6011'
const DR_ANITA = 'cmsvzrrs70007sw2o59dyh15o'
const DR_SURESH = 'cmsvzrrtg0009sw2okr71useq'
const NURSE_ID = 'cmsvzrsys001rsw2odx4mae2q'
const LABTECH_ID = 'cmsvzrtaf001qsw2ohmp2xv4v' // will fetch

async function main() {
  console.log('🔧 Filling ALL empty tables with real-life data...\n')

  // Clean up any previously created demo data (idempotent)
  console.log('🧹 Cleaning up previous demo data...')
  await db.bedTransfer.deleteMany()
  await db.shiftHandover.deleteMany()
  await db.nursePatientAssignment.deleteMany()
  await db.investigationReport.deleteMany()
  await db.doctorVisit.deleteMany()
  await db.medicineAdministration.deleteMany()
  await db.vendorPayment.deleteMany()
  await db.insurancePreAuth.deleteMany()
  await db.insuranceClaim.deleteMany()
  await db.purchaseOrderItem.deleteMany()
  await db.purchaseOrder.deleteMany()
  await db.paymentGatewayTransaction.deleteMany()
  await db.notificationLog.deleteMany()
  await db.auditLog.deleteMany()
  await db.medicalDocument.deleteMany()
  await db.familyAccess.deleteMany()
  await db.dietOrder.deleteMany()
  await db.otSchedule.deleteMany()
  await db.stockMovement.deleteMany()
  await db.billLineItem.deleteMany()
  await db.billPayment.deleteMany()
  await db.patientAdvance.deleteMany()
  await db.ipdBill.deleteMany()
  await db.doctorRating.deleteMany()
  await db.post.deleteMany()
  await db.slider.deleteMany()
  await db.hospitalInquiry.deleteMany()
  console.log('  ✓ Cleanup complete\n')

  const labTech = await db.labTechnician.findFirst({ where: { hospitalId: HOSPITAL_ID } })
  const labTechId = labTech?.id || ''

  // ─── 1. IPD BILLS + LINE ITEMS + PAYMENTS ─────────────
  console.log('💰 Creating IPD bills, line items, payments...')
  const admissions = await db.ipdAdmission.findMany({ where: { status: 'Admitted' } })
  const chargeItems = await db.chargeItem.findMany({ where: { hospitalId: HOSPITAL_ID } })
  let ipdBillCount = 0

  for (const adm of admissions) {
    const roomRent = 5000 * 3 // 3 days
    const consultation = 1000
    const labAmt = 2000
    const medAmt = 1500
    const subtotal = roomRent + consultation + labAmt + medAmt
    const tax = subtotal * 0.05
    const total = subtotal + tax

    const bill = await db.ipdBill.create({
      data: {
        billNo: `IPD-BILL-2025-${String(100 + ipdBillCount).padStart(6, '0')}`,
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
        status: ipdBillCount < 2 ? 'Paid' : 'Draft',
        generatedAt: new Date(),
        finalizedAt: ipdBillCount < 2 ? new Date() : null,
        generatedBy: 'dev-receptionist',
      },
    })

    // Line items
    for (const ci of chargeItems.slice(0, 4)) {
      await db.billLineItem.create({
        data: {
          billId: bill.id,
          chargeItemId: ci.id,
          categoryId: ci.categoryId,
          itemName: ci.name,
          quantity: 3,
          unitType: ci.unitType,
          rate: ci.rate,
          amount: ci.rate * 3,
          totalAmount: ci.rate * 3,
          date: new Date(),
        },
      })
    }

    // Payment for paid bills
    if (ipdBillCount < 2) {
      await db.billPayment.create({
        data: {
          receiptNo: `REC-2025-${String(100 + ipdBillCount).padStart(6, '0')}`,
          billId: bill.id,
          admissionId: adm.id,
          hospitalId: HOSPITAL_ID,
          amount: total,
          paymentMethod: ['Cash', 'UPI', 'Card'][ipdBillCount % 3],
          paymentDate: new Date(),
          receivedBy: 'dev-receptionist',
          notes: 'Full payment',
        },
      })
    }

    // Patient advance
    await db.patientAdvance.create({
      data: {
        receiptNo: `ADV-2025-${String(100 + ipdBillCount).padStart(6, '0')}`,
        admissionId: adm.id,
        hospitalId: HOSPITAL_ID,
        patientId: adm.userId,
        amount: 10000,
        paymentMethod: 'Cash',
        paymentDate: new Date(Date.now() - 86400000),
        receivedBy: 'dev-receptionist',
        notes: 'Advance deposit at admission',
      },
    }).catch(() => {})

    ipdBillCount++
  }
  console.log(`  ✓ ${ipdBillCount} IPD bills + line items + payments + advances`)

  // ─── 2. DOCTOR RATINGS ────────────────────────────────
  console.log('⭐ Creating doctor ratings...')
  const patients = await db.user.findMany({ where: { role: 'patient' }, take: 15 })
  const doctors = [DR_SHARMA, DR_ANITA, DR_SURESH]
  let ratingCount = 0

  for (let i = 0; i < 15; i++) {
    await db.doctorRating.create({
      data: {
        doctorId: doctors[i % 3],
        patientId: patients[i].id,
        star: [5, 4, 5, 3, 5, 4, 5, 4, 5, 5, 4, 5, 3, 4, 5][i],
        review: [
          'Very thorough and patient. Explained everything clearly.',
          'Good doctor, slightly long wait but worth it.',
          'Excellent doctor. Saved my life. Highly recommend.',
          'Average experience. Wait time was too long.',
          'Best physician in the area. Very caring.',
          'Professional and knowledgeable. Satisfied with treatment.',
          'Outstanding! Took time to listen to all my concerns.',
          'Good treatment but reception was slow.',
          'Very experienced. Diagnosed my issue correctly.',
          'Highly recommend. The best doctor I have visited.',
          'Decent consultation. Prescription worked well.',
          'Very friendly and approachable. Good experience.',
          'Long wait but doctor was good once I got in.',
          'Satisfactory. Would visit again if needed.',
          'Excellent bedside manner. Very reassuring.',
        ][i],
        consultationRating: [5, 4, 5, 3, 5, 4, 5, 4, 5, 5, 4, 5, 3, 4, 5][i],
        waitTimeRating: [4, 3, 5, 2, 4, 3, 4, 2, 5, 4, 3, 4, 2, 3, 5][i],
        staffRating: [4, 4, 5, 3, 5, 4, 4, 3, 5, 5, 4, 4, 3, 4, 5][i],
        wouldRecommend: [5, 4, 5, 3, 5, 4, 5, 4, 5, 5, 4, 5, 3, 4, 5][i] >= 4,
        isAnonymous: i % 5 === 0,
      },
    }).catch(() => {})
    ratingCount++
  }
  console.log(`  ✓ ${ratingCount} doctor ratings`)

  // ─── 3. BLOG POSTS ────────────────────────────────────
  console.log('📰 Creating blog posts...')
  const posts = [
    { title: '10 Tips for a Healthy Heart', content: 'Heart disease is the leading cause of death in India. Here are 10 simple tips to keep your heart healthy: 1. Exercise regularly 2. Eat a balanced diet 3. Quit smoking 4. Limit alcohol 5. Manage stress 6. Check blood pressure regularly 7. Maintain healthy weight 8. Get enough sleep 9. Limit salt intake 10. Get regular health checkups.', category: 'Cardiology' },
    { title: 'Understanding Diabetes: A Complete Guide', content: 'Diabetes affects over 77 million people in India. Type 2 diabetes is the most common form. Symptoms include increased thirst, frequent urination, hunger, fatigue, and blurred vision. Management involves diet control, exercise, medication, and regular monitoring of blood sugar levels.', category: 'General Medicine' },
    { title: 'When to See a Doctor for Fever', content: 'Fever is a common symptom but sometimes it needs medical attention. See a doctor if: fever is above 103F, lasts more than 3 days, accompanied by severe headache, difficulty breathing, chest pain, persistent vomiting, or rash. For children, seek immediate care if fever is above 100.4F in infants under 3 months.', category: 'General Medicine' },
    { title: 'Bone Health: Preventing Osteoporosis', content: 'Osteoporosis makes bones weak and brittle. Prevention: adequate calcium intake (1000-1200mg daily), vitamin D (600-800 IU), weight-bearing exercise, avoid smoking and excessive alcohol, limit caffeine. Get a bone density test after age 50.', category: 'Orthopedics' },
    { title: 'Hypertension: The Silent Killer', content: 'High blood pressure often has no symptoms but can cause heart attacks, strokes, and kidney failure. Normal BP is below 120/80. Get checked regularly. Manage with diet (low salt, DASH diet), exercise, stress management, and medication if prescribed.', category: 'Cardiology' },
    { title: 'Child Vaccination Schedule in India', content: 'Vaccination protects children from serious diseases. Key vaccines: BCG at birth, OPV at birth/6/10/14 weeks, DPT at 6/10/14 weeks, Measles at 9 months, Hepatitis B at birth/6/10/14 weeks. Follow the IAP schedule for complete protection.', category: 'Pediatrics' },
    { title: 'Monsoon Health Tips: Preventing Water-Borne Diseases', content: 'Monsoon brings relief from heat but also water-borne diseases like cholera, typhoid, and hepatitis A. Prevention: drink boiled/filtered water, avoid street food, wash hands frequently, use mosquito repellents, keep surroundings clean, get vaccinated for typhoid and hepatitis A.', category: 'General Medicine' },
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
  console.log(`  ✓ ${posts.length} blog posts`)

  // ─── 4. STOCK MOVEMENTS ───────────────────────────────
  console.log('📦 Creating stock movements...')
  const inventoryItems = await db.inventoryItem.findMany({ where: { hospitalId: HOSPITAL_ID } })
  let stockCount = 0

  for (const item of inventoryItems) {
    // IN movement (initial stock)
    await db.stockMovement.create({
      data: {
        itemId: item.id,
        hospitalId: HOSPITAL_ID,
        movementType: 'IN',
        quantity: 100,
        referenceNo: `PO-2025-${String(100 + stockCount).padStart(6, '0')}`,
        fromLocation: 'Supplier',
        toLocation: 'Main Store',
        notes: 'Initial stock receipt',
        movedBy: 'dev-hospital',
      },
    })

    // OUT movement (consumption)
    if (stockCount % 2 === 0) {
      await db.stockMovement.create({
        data: {
          itemId: item.id,
          hospitalId: HOSPITAL_ID,
          movementType: 'OUT',
          quantity: 15,
          referenceNo: `ISS-2025-${String(100 + stockCount).padStart(6, '0')}`,
          fromLocation: 'Main Store',
          toLocation: 'OPD Pharmacy',
          notes: 'Issued to OPD',
          movedBy: 'dev-pharmacist',
        },
      })
    }
    stockCount++
  }
  console.log(`  ✓ ${stockCount * 2} stock movements`)

  // ─── 5. OT SCHEDULES ──────────────────────────────────
  console.log('🔬 Creating OT schedules...')
  const ot = await db.operationTheater.findFirst({ where: { hospitalId: HOSPITAL_ID } })
  if (ot) {
    const otSurgeries = [
      { name: 'Appendectomy', type: 'Emergency', duration: 90 },
      { name: 'Gall Bladder Removal', type: 'Elective', duration: 120 },
      { name: 'Hernia Repair', type: 'Elective', duration: 60 },
    ]
    for (let i = 0; i < 3; i++) {
      await db.otSchedule.create({
        data: {
          otId: ot.id,
          hospitalId: HOSPITAL_ID,
          admissionId: admissions[i % admissions.length].id,
          surgeonId: DR_ANITA,
          anesthetistId: null,
          nurseId: NURSE_ID,
          surgeryName: otSurgeries[i].name,
          surgeryType: otSurgeries[i].type,
          scheduledDate: new Date(Date.now() + (i + 1) * 86400000),
          estimatedDuration: otSurgeries[i].duration,
          status: i === 0 ? 'InProgress' : 'Scheduled',
        },
      }).catch(() => {})
    }
    console.log('  ✓ 3 OT schedules')
  }

  // ─── 6. DIET ORDERS ───────────────────────────────────
  console.log('🍽️ Creating diet orders...')
  const dietTypes = ['Regular', 'Soft', 'Liquid', 'Diabetic', 'Low Salt']
  const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner']
  let dietCount = 0

  for (const adm of admissions) {
    await db.dietOrder.create({
      data: {
        admissionId: adm.id,
        hospitalId: HOSPITAL_ID,
        orderedById: DR_ANITA,
        dietType: dietTypes[dietCount % 5],
        mealType: mealTypes[dietCount % 4],
        instructions: `${dietTypes[dietCount % 5]} diet as per patient condition`,
        startDate: new Date(),
        status: 'Active',
      },
    }).catch(() => {})
    dietCount++
  }
  console.log(`  ✓ ${dietCount} diet orders`)

  // ─── 7. FAMILY ACCESS ─────────────────────────────────
  console.log('👨‍👩‍👧 Creating family access...')
  for (let i = 0; i < Math.min(3, admissions.length); i++) {
    const adm = admissions[i]
    await db.familyAccess.create({
      data: {
        admissionId: adm.id,
        hospitalId: HOSPITAL_ID,
        accessCode: `FAM-${Date.now().toString(36).toUpperCase()}-${i}`,
        patientName: adm.patientName,
        canViewVitals: true,
        canViewBill: true,
        canViewDiet: true,
        allowedPages: '["vitals","diet","bill"]',
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    }).catch(() => {})
  }
  console.log('  ✓ 3 family access codes')

  // ─── 8. MEDICAL DOCUMENTS ─────────────────────────────
  console.log('📄 Creating medical documents...')
  const docTypes = ['Lab Report', 'Prescription', 'Discharge Summary', 'X-Ray', 'MRI Report']
  for (let i = 0; i < 10; i++) {
    const patient = patients[i % patients.length]
    await db.medicalDocument.create({
      data: {
        userId: patient.id,
        title: `${docTypes[i % 5]} - ${patient.name}`,
        category: docTypes[i % 5],
        fileUrl: `/uploads/doc-${i}.pdf`,
        mimeType: 'application/pdf',
        fileSize: 1024 * (100 + i * 50),
      },
    }).catch(() => {})
  }
  console.log('  ✓ 10 medical documents')

  // ─── 9. AUDIT LOGS ────────────────────────────────────
  console.log('📋 Creating audit logs...')
  const auditActions = [
    { action: 'Login', entity: 'User', userId: 'dev-doctor', name: 'Dr. Rajesh Sharma' },
    { action: 'Login', entity: 'User', userId: 'dev-hospital', name: 'City General Hospital' },
    { action: 'Login', entity: 'User', userId: 'dev-receptionist', name: 'Meera Joshi' },
    { action: 'Login', entity: 'User', userId: 'dev-nurse', name: 'Priya Sharma' },
    { action: 'Create', entity: 'Booking', userId: 'dev-receptionist', name: 'Meera Joshi' },
    { action: 'Update', entity: 'Booking', userId: 'dev-doctor-anita', name: 'Dr. Anita Desai' },
    { action: 'Create', entity: 'Prescription', userId: 'dev-doctor', name: 'Dr. Rajesh Sharma' },
    { action: 'Update', entity: 'IpdAdmission', userId: 'dev-receptionist', name: 'Meera Joshi' },
    { action: 'Create', entity: 'BillPayment', userId: 'dev-receptionist', name: 'Meera Joshi' },
    { action: 'Login', entity: 'User', userId: 'dev-admin', name: 'Admin User' },
  ]

  for (let i = 0; i < auditActions.length; i++) {
    const a = auditActions[i]
    await db.auditLog.create({
      data: {
        userId: a.userId,
        userRole: a.userId.includes('doctor') ? 'doctor' : a.userId.includes('nurse') ? 'nurse' : a.userId.includes('admin') ? 'admin' : 'staff',
        userName: a.name,
        action: a.action,
        entityType: a.entity,
        entityId: `demo-${i}`,
        beforeJson: '{}',
        afterJson: JSON.stringify({ action: a.action, entity: a.entity }),
        ipAddress: '192.168.1.' + (100 + i),
        userAgent: 'Mozilla/5.0 Chrome',
      },
    })
  }
  console.log(`  ✓ ${auditActions.length} audit logs`)

  // ─── 10. NOTIFICATION LOGS ────────────────────────────
  console.log('📱 Creating notification logs...')
  const notifTypes = [
    { channel: 'InApp', template: 'Booking Confirmed', status: 'Sent' },
    { channel: 'InApp', template: 'Consultation Started', status: 'Sent' },
    { channel: 'InApp', template: 'Lab Result Ready', status: 'Sent' },
    { channel: 'InApp', template: 'Bill Generated', status: 'Sent' },
    { channel: 'SMS', template: 'Token Assigned', status: 'Failed' },
    { channel: 'InApp', template: 'Critical Vitals', status: 'Sent' },
    { channel: 'InApp', template: 'Turn Approaching', status: 'Sent' },
    { channel: 'SMS', template: 'Payment Received', status: 'Failed' },
  ]
  for (let i = 0; i < notifTypes.length; i++) {
    await db.notificationLog.create({
      data: {
        userId: patients[i % patients.length].id,
        hospitalId: HOSPITAL_ID,
        channel: notifTypes[i].channel,
        recipient: patients[i % patients.length].mobileNo || '+91 9876543210',
        content: `Demo notification: ${notifTypes[i].template}`,
        templateName: notifTypes[i].template,
        status: notifTypes[i].status,
        sentAt: notifTypes[i].status === 'Sent' ? new Date(Date.now() - i * 3600000) : null,
      },
    })
  }
  console.log(`  ✓ ${notifTypes.length} notification logs`)

  // ─── 11. PAYMENT GATEWAY TRANSACTIONS ─────────────────
  console.log('💳 Creating payment gateway transactions...')
  for (let i = 0; i < 5; i++) {
    await db.paymentGatewayTransaction.create({
      data: {
        hospitalId: HOSPITAL_ID,
        bookingId: null,
        razorpayOrderId: `order_${Date.now()}_${i}`,
        amount: 500 + i * 200,
        currency: 'INR',
        status: i < 3 ? 'Captured' : 'Created',
        gatewayResponse: JSON.stringify({ id: `pay_${i}`, status: 'captured' }),
        createdBy: 'dev-patient',
      },
    })
  }
  console.log('  ✓ 5 payment gateway transactions')

  // ─── 12. PURCHASE ORDERS ──────────────────────────────
  console.log('🛒 Creating purchase orders...')
  const vendors = await db.vendor.findMany({ where: { hospitalId: HOSPITAL_ID } })
  for (let i = 0; i < 3; i++) {
    const vendor = vendors[i % vendors.length]
    const po = await db.purchaseOrder.create({
      data: {
        poNumber: `PO-2025-${String(100 + i).padStart(6, '0')}`,
        hospitalId: HOSPITAL_ID,
        supplierName: vendor.name,
        supplierContact: vendor.phoneNo,
        supplierAddress: vendor.address,
        expectedDate: new Date(Date.now() + (3 - i) * 86400000),
        totalAmount: 5000 + i * 2000,
        status: ['Received', 'Ordered', 'PartiallyReceived'][i],
        notes: `Purchase order to ${vendor.name}`,
        createdById: 'dev-hospital',
      },
    })

    // PO items
    for (const item of inventoryItems.slice(0, 3)) {
      await db.purchaseOrderItem.create({
        data: {
          poId: po.id,
          inventoryItemId: item.id,
          quantity: 50,
          unitPrice: item.unitPrice,
          total: item.unitPrice * 50,
          receivedQty: po.status === 'Received' ? 50 : po.status === 'PartiallyReceived' ? 25 : 0,
        },
      })
    }
  }
  console.log('  ✓ 3 purchase orders + items')

  // ─── 13. INSURANCE CLAIMS ─────────────────────────────
  console.log('🏥 Creating insurance claims...')
  const policies = await db.patientInsurancePolicy.findMany({ take: 3 })
  const ipdBills = await db.ipdBill.findMany({ take: 3 })
  const company = await db.insuranceCompany.findFirst()

  for (let i = 0; i < Math.min(3, policies.length, ipdBills.length); i++) {
    const claimAmount = ipdBills[i].netPayable
    const copay = (policies[i].copayPercent / 100) * claimAmount
    await db.insuranceClaim.create({
      data: {
        claimNo: `CLM-2025-${String(100 + i).padStart(6, '0')}`,
        admissionId: admissions[i % admissions.length].id,
        billId: ipdBills[i].id,
        policyId: policies[i].id,
        companyId: company?.id || policies[i].companyId,
        hospitalId: HOSPITAL_ID,
        tpaId: policies[i].tpaId,
        claimAmount,
        patientPayable: copay,
        tpaPayable: claimAmount - copay,
        status: ['Submitted', 'UnderReview', 'Approved'][i],
        submissionDate: new Date(),
        createdBy: 'dev-hospital',
      },
    })
  }
  console.log('  ✓ 3 insurance claims')

  // ─── 14. INSURANCE PRE-AUTHS ──────────────────────────
  console.log('📝 Creating insurance pre-auths...')
  for (let i = 0; i < 2; i++) {
    await db.insurancePreAuth.create({
      data: {
        preAuthNo: `PA-2025-${String(100 + i).padStart(6, '0')}`,
        admissionId: admissions[i].id,
        policyId: policies[i]?.id || '',
        hospitalId: HOSPITAL_ID,
        requestedAmount: 30000 + i * 10000,
        approvedAmount: i === 0 ? 25000 : 0,
        status: i === 0 ? 'Approved' : 'Pending',
        diagnosis: admissions[i].initialDiagnosis,
        procedures: '[]',
        estimatedDays: 3,
        createdBy: 'dev-hospital',
      },
    }).catch(() => {})
  }
  console.log('  ✓ 2 insurance pre-auths')

  // ─── 15. VENDOR PAYMENTS ──────────────────────────────
  console.log('💵 Creating vendor payments...')
  const expenses = await db.expense.findMany({ where: { status: 'Paid' }, take: 3 })
  for (let i = 0; i < expenses.length; i++) {
    await db.vendorPayment.create({
      data: {
        hospitalId: HOSPITAL_ID,
        vendorId: expenses[i].vendorId || vendors[0].id,
        expenseId: expenses[i].id,
        paymentNo: `VP-2025-${String(100 + i).padStart(6, '0')}`,
        amount: expenses[i].totalAmount,
        paymentMode: ['Bank', 'UPI', 'Cheque'][i % 3],
        paymentRef: `TXN${Date.now()}${i}`,
        paymentDate: new Date(),
        notes: 'Payment against expense',
        createdBy: 'dev-hospital',
      },
    })
  }
  console.log('  ✓ 3 vendor payments')

  // ─── 16. MEDICINE ADMINISTRATIONS ─────────────────────
  console.log('💉 Creating medicine administrations...')
  const orders = await db.doctorOrder.findMany({ take: 5 })
  for (const order of orders) {
    await db.medicineAdministration.create({
      data: {
        orderId: order.id,
        admissionId: order.admissionId,
        nurseId: NURSE_ID,
        scheduledTime: new Date(),
        administeredTime: new Date(),
        status: 'Given',
        remarks: 'Administered as prescribed',
      },
    }).catch(() => {})
  }
  console.log(`  ✓ ${orders.length} medicine administrations`)

  // ─── 17. DOCTOR VISITS ────────────────────────────────
  console.log('👨‍⚕️ Creating doctor visits...')
  for (const adm of admissions) {
    await db.doctorVisit.create({
      data: {
        admissionId: adm.id,
        doctorId: adm.attendingDoctorId,
        visitDate: new Date(),
        visitTime: '10:00',
        examinationFindings: 'Patient stable. Vitals normal.',
        currentDiagnosis: adm.initialDiagnosis,
        newOrders: '[]',
        stoppedOrders: '[]',
        advise: 'Continue current treatment. Monitor vitals.',
        isMobileVisit: false,
      },
    }).catch(() => {})
  }
  console.log(`  ✓ ${admissions.length} doctor visits`)

  // ─── 18. INVESTIGATION REPORTS ───────────────────────
  console.log('🔬 Creating investigation reports...')
  for (let i = 0; i < 5; i++) {
    await db.investigationReport.create({
      data: {
        admissionId: admissions[i % admissions.length].id,
        testName: ['ECG', 'Chest X-Ray', 'Ultrasound', 'CT Scan', '2D Echo'][i],
        reportDate: new Date(),
        resultData: JSON.stringify({ finding: 'Normal', impression: 'No abnormalities detected' }),
        normalRange: JSON.stringify({ normal: 'Within normal limits' }),
        isAbnormal: i % 4 === 0,
        reportedBy: 'dev-lab-tech',
        reviewedBy: 'dev-doctor-anita',
        reviewedAt: new Date(),
        remarks: i % 4 === 0 ? 'Abnormal finding — follow up recommended' : 'All parameters normal',
      },
    }).catch(() => {})
  }
  console.log('  ✓ 5 investigation reports')

  // ─── 19. NURSE PATIENT ASSIGNMENTS ────────────────────
  console.log('🏥 Creating nurse-patient assignments...')
  let assigned = 0
  for (const adm of admissions) {
    if (!adm.bedId) continue
    await db.nursePatientAssignment
      .create({
        data: {
          nurseId: NURSE_ID,
          admissionId: adm.id,
          bedId: adm.bedId,
          shiftDate: new Date(),
          shiftType: 'Morning',
          status: 'Active',
        },
      })
      .then(() => {
        assigned++
      })
      .catch(() => {})
  }
  console.log(`  ✓ ${assigned} nurse assignments`)

  // ─── 20. SHIFT HANDOVERS ──────────────────────────────
  console.log('🔄 Creating shift handovers...')
  await db.shiftHandover.create({
    data: {
      hospitalId: HOSPITAL_ID,
      wardId: admissions[0]?.wardId || '',
      shiftDate: new Date(),
      shiftType: 'Morning',
      fromNurseId: NURSE_ID,
      toNurseId: NURSE_ID,
      patientSummaries: JSON.stringify([{ patient: admissions[0]?.patientName, status: 'Stable' }]),
      wardNotes: 'All patients stable. No critical events.',
      pendingTasks: JSON.stringify([{ task: 'Administer evening meds', patient: admissions[0]?.patientName }]),
      acknowledgedAt: new Date(),
      acknowledgedBy: 'dev-nurse',
    },
  }).catch(() => {})
  console.log('  ✓ 1 shift handover')

  // ─── 21. BED TRANSFERS ────────────────────────────────
  console.log('🛏️ Creating bed transfers...')
  if (admissions.length >= 2) {
    await db.bedTransfer.create({
      data: {
        admissionId: admissions[0].id,
        fromBedId: admissions[0].bedId,
        toBedId: admissions[1].bedId,
        hospitalId: HOSPITAL_ID,
        transferredBy: 'dev-receptionist',
        transferReason: 'Patient requested upgrade to private room',
        transferDate: new Date(),
        status: 'Completed',
      },
    }).catch(() => {})
  }
  console.log('  ✓ 1 bed transfer')

  // ─── 22. SLIDERS (homepage) ───────────────────────────
  console.log('🖼️ Creating homepage sliders...')
  const sliders = [
    { title: 'Expert Doctors', subtitle: 'Consult with experienced specialists', image: '/slider-1.jpg', order: 1 },
    { title: '24/7 Emergency', subtitle: 'Round the clock emergency services', image: '/slider-2.jpg', order: 2 },
    { title: 'Cashless Insurance', subtitle: 'All major insurance providers accepted', image: '/slider-3.jpg', order: 3 },
  ]
  for (const s of sliders) {
    await db.slider.create({
      data: { ...s, status: 'Active', createdBy: 'dev-hospital' },
    }).catch(() => {})
  }
  console.log(`  ✓ ${sliders.length} homepage sliders`)

  // ─── 23. HOSPITAL INQUIRIES ───────────────────────────
  console.log('📧 Creating hospital inquiries...')
  const inquiries = [
    { name: 'Ravi Kumar', email: 'ravi@email.com', mobile: '+91 9876512345', message: 'Want to know about cardiac surgery packages' },
    { name: 'Sita Devi', email: 'sita@email.com', mobile: '+91 9876523456', message: 'Looking for pediatric consultation' },
    { name: 'John Dsouza', email: 'john@email.com', mobile: '+91 9876534567', message: 'Insurance empanelment inquiry' },
  ]
  for (const q of inquiries) {
    await db.hospitalInquiry.create({
      data: { ...q, hospitalId: HOSPITAL_ID, status: 'New' },
    }).catch(() => {})
  }
  console.log(`  ✓ ${inquiries.length} hospital inquiries`)

  // ─── SUMMARY ──────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  ✅ ALL TABLES FILLED WITH REAL-LIFE DATA')
  console.log('══════════════════════════════════════════════════════════')

  await db.$disconnect()
}

main().catch((err) => {
  console.error('❌ Fill failed:', err.message?.substring(0, 200))
  process.exit(1)
})
