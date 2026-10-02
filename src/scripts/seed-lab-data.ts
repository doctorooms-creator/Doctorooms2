/**
 * ============================================================
 * SEED SCRIPT: Lab Module Demo Data — Doctorooms HMS
 * ============================================================
 *
 * Seeds the Lab Module (Phase 6) with realistic end-to-end demo data
 * so the lab pages are immediately populated.
 *
 *   LAB PARTNERS (3) — each backed by a User (role=lab_technician)
 *     1. City Diagnostics  — blood + pathology   (reuses existing dev-lab-tech User)
 *     2. Apex Radiology   — radiology + imaging  (new dev-lab-apex User)
 *     3. Sun Diagnostic Center — both           (new dev-lab-sun User)
 *
 *   LAB TEST CATALOGS (21) — the test master the doctor's "Order Tests" step picks from
 *     - City Diagnostics 8 (blood + pathology), Apex Radiology 6 (radiology),
 *       Sun Diagnostic Center 7 (both) — realistic Indian-market fees, all active.
 *
 *   DOCTOR ↔ LAB ASSOCIATIONS (3+2)
 *     - Dr. Rajesh Sharma (dev-doctor) → all 3 labs (10%, 12%, 8%)
 *     - Dr. Anita Desai (dev-doctor-anita, if exists) → City Diagnostics + Sun Diagnostic (10% each)
 *
 *   EXTERNAL TEST ORDERS (10) for Rahul Verma (dev-patient)
 *     - Spread across 3 labs, statuses Ordered/InProgress/Completed,
 *       urgency Normal/Urgent, staggered over last 14 days.
 *
 *   LAB REPORT UPLOADS (5) — one per Completed order
 *     - Mixed PDF / image files, blood-test reportData with parameters,
 *       2 verified-by-doctor, 1 abnormal-flagged note.
 *
 *   LAB BILLINGS (5) — one per Completed order (auto-generated style)
 *     - 3 Pending, 2 Paid (with paidAt + transactionRef).
 *
 * IDEMPOTENT:
 *   - deleteMany on all lab module tables in reverse FK order:
 *     CommissionPayment, LabBilling, LabReportUpload, ExternalTestOrder,
 *     DoctorLabAssociation, LabTestCatalog, LabPartner.
 *   - Does NOT delete User rows (only upserts dev-lab-apex / dev-lab-sun).
 *   - Does NOT delete existing LabTechnician rows (separate from LabPartner).
 *
 * Usage:
 *   bun run src/scripts/seed-lab-data.ts
 * ============================================================
 */

import { db } from '../lib/db';
import bcrypt from 'bcryptjs';

// ──────────────────────────────────────────────────────────────
// DATE HELPERS
// ──────────────────────────────────────────────────────────────

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), 10, 0, 0, 0);

/** Date N days ago at 10:00 local. */
function daysAgo(days: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d;
}

// ──────────────────────────────────────────────────────────────
// 1. CLEAR EXISTING LAB MODULE DATA (children first — reverse FK order)
// ──────────────────────────────────────────────────────────────

async function clearLabData() {
  console.log('🧹 Clearing existing Lab Module data (FK-safe order)...');
  await db.commissionPayment.deleteMany();
  await db.labBilling.deleteMany();
  await db.labReportUpload.deleteMany();
  await db.externalTestOrder.deleteMany();
  await db.doctorLabAssociation.deleteMany();
  await db.labTestCatalog.deleteMany();
  await db.labPartner.deleteMany();
  // NOTE: intentionally NOT deleting User rows or LabTechnician rows.
  console.log('  ✓ Lab Module tables cleared (Users + LabTechnician untouched)');
}

// ──────────────────────────────────────────────────────────────
// 2. ENSURE NEW LAB TECH USERS EXIST (upsert, do not touch existing passwords)
// ──────────────────────────────────────────────────────────────

async function ensureLabUsers() {
  console.log('\n👤 Ensuring lab technician Users exist...');

  // dev-lab-tech already exists from seed-test-data.ts (Amit Kumar).
  // Do NOT modify it — just confirm it exists.
  const existingLabTech = await db.user.findUnique({ where: { id: 'dev-lab-tech' } });
  if (existingLabTech) {
    console.log(`  ✓ dev-lab-tech already exists (${existingLabTech.name}) — reusing as City Diagnostics user`);
  } else {
    throw new Error('dev-lab-tech User not found. Run seed-test-data.ts first.');
  }

  // dev-lab-apex — new user; upsert to be idempotent.
  const apexHash = bcrypt.hashSync('lab12345', 10);
  const apexUser = await db.user.upsert({
    where: { id: 'dev-lab-apex' },
    update: {}, // do not modify existing rows
    create: {
      id: 'dev-lab-apex',
      name: 'Apex Radiology Center',
      email: 'apex.radiology@doctorooms.com',
      password: apexHash,
      gender: 'Male',
      role: 'lab_technician',
      status: 'Active',
      mobileNo: '+91 9876543221',
    },
  });
  console.log(`  ✓ dev-lab-apex ready (id=${apexUser.id}, name=${apexUser.name})`);

  // dev-lab-sun — new user; upsert to be idempotent.
  const sunHash = bcrypt.hashSync('lab12345', 10);
  const sunUser = await db.user.upsert({
    where: { id: 'dev-lab-sun' },
    update: {},
    create: {
      id: 'dev-lab-sun',
      name: 'Sun Diagnostic Center',
      email: 'sun.diagnostic@doctorooms.com',
      password: sunHash,
      gender: 'Male',
      role: 'lab_technician',
      status: 'Active',
      mobileNo: '+91 9876543222',
    },
  });
  console.log(`  ✓ dev-lab-sun ready (id=${sunUser.id}, name=${sunUser.name})`);

  return { apexUser, sunUser, labTechUser: existingLabTech };
}

// ──────────────────────────────────────────────────────────────
// 3. CREATE 3 LAB PARTNERS
// ──────────────────────────────────────────────────────────────

async function createLabPartners() {
  console.log('\n🧪 Creating 3 Lab Partners...');

  const cityDiagnostics = await db.labPartner.create({
    data: {
      userId: 'dev-lab-tech',
      hospitalId: null,
      labName: 'City Diagnostics',
      ownerName: 'Ramesh Patel',
      email: 'city.diagnostics@doctorooms.com',
      mobile: '+91 9876543220',
      altMobile: '+91 80 2345 6789',
      address: '45 MG Road, Indiranagar',
      state: 'Karnataka',
      city: 'Bengaluru',
      pincode: '560038',
      gstNo: '29ABCDE1234F1Z5',
      registrationNo: 'KAR-LAB-2018-0456',
      specializations: 'blood',
      testsAvailable: JSON.stringify([
        'CBC', 'LFT', 'KFT', 'Lipid Profile', 'Urine Routine',
        'Blood Sugar', 'Thyroid Profile', 'HbA1c',
      ]),
      status: 'Active',
      createdBy: 'dev-admin',
    },
  });
  console.log(`  ✓ City Diagnostics created (id=${cityDiagnostics.id}, userId=dev-lab-tech)`);

  const apexRadiology = await db.labPartner.create({
    data: {
      userId: 'dev-lab-apex',
      hospitalId: null,
      labName: 'Apex Radiology',
      ownerName: 'Sunita Rao',
      email: 'apex.radiology@doctorooms.com',
      mobile: '+91 9876543221',
      altMobile: '',
      address: '12 Residency Road, Ashok Nagar',
      state: 'Karnataka',
      city: 'Bengaluru',
      pincode: '560025',
      gstNo: '29PQRSU5678K1Z2',
      registrationNo: 'KAR-LAB-2019-0712',
      specializations: 'radiology',
      testsAvailable: JSON.stringify([
        'X-Ray Chest', 'MRI Brain', 'CT Scan Head',
        'Ultrasound Abdomen', 'ECG', 'Echocardiogram',
      ]),
      status: 'Active',
      createdBy: 'dev-admin',
    },
  });
  console.log(`  ✓ Apex Radiology created (id=${apexRadiology.id}, userId=dev-lab-apex)`);

  const sunDiagnostic = await db.labPartner.create({
    data: {
      userId: 'dev-lab-sun',
      hospitalId: null,
      labName: 'Sun Diagnostic Center',
      ownerName: 'Mohan Krishna',
      email: 'sun.diagnostic@doctorooms.com',
      mobile: '+91 9876543222',
      altMobile: '',
      address: '78 Brigade Road',
      state: 'Karnataka',
      city: 'Bengaluru',
      pincode: '560025',
      gstNo: '29LMNOP9012B1Z9',
      registrationNo: 'KAR-LAB-2020-0334',
      specializations: 'both',
      testsAvailable: JSON.stringify([
        'CBC', 'LFT', 'X-Ray Chest', 'Ultrasound',
        'Thyroid Profile', 'Vitamin D', 'Vitamin B12',
      ]),
      status: 'Active',
      createdBy: 'dev-admin',
    },
  });
  console.log(`  ✓ Sun Diagnostic Center created (id=${sunDiagnostic.id}, userId=dev-lab-sun)`);

  return { cityDiagnostics, apexRadiology, sunDiagnostic };
}

// ──────────────────────────────────────────────────────────────
// 4. LAB TEST CATALOGS (per lab — the test master doctors pick from)
// ──────────────────────────────────────────────────────────────

interface CatalogSpec {
  testName: string;
  testCategory: string;
  fee: number;
  sampleType: string;
  turnaroundTime: string;
}

type LabKey = 'cityDiagnostics' | 'apexRadiology' | 'sunDiagnostic';

const CATALOG_SPECS: Record<LabKey, CatalogSpec[]> = {
  cityDiagnostics: [
    // testName | testCategory | fee | sampleType | turnaroundTime
    { testName: 'CBC', testCategory: 'Blood', fee: 250, sampleType: 'EDTA Blood', turnaroundTime: '6 hours' },
    { testName: 'LFT', testCategory: 'Blood', fee: 450, sampleType: 'Serum', turnaroundTime: '24 hours' },
    { testName: 'KFT', testCategory: 'Blood', fee: 400, sampleType: 'Serum', turnaroundTime: '24 hours' },
    { testName: 'Lipid Profile', testCategory: 'Blood', fee: 300, sampleType: 'Serum (Fasting)', turnaroundTime: '12 hours' },
    { testName: 'Urine Routine', testCategory: 'Pathology', fee: 150, sampleType: 'Mid-stream Urine', turnaroundTime: '4 hours' },
    { testName: 'Blood Sugar (Fasting)', testCategory: 'Blood', fee: 80, sampleType: 'Fluoride Plasma', turnaroundTime: '2 hours' },
    { testName: 'Thyroid Profile', testCategory: 'Blood', fee: 350, sampleType: 'Serum', turnaroundTime: '24 hours' },
    { testName: 'HbA1c', testCategory: 'Blood', fee: 500, sampleType: 'EDTA Blood', turnaroundTime: '24 hours' },
  ],
  apexRadiology: [
    { testName: 'X-Ray Chest PA', testCategory: 'Radiology', fee: 400, sampleType: 'N/A', turnaroundTime: '2 hours' },
    { testName: 'MRI Brain', testCategory: 'Radiology', fee: 3000, sampleType: 'N/A', turnaroundTime: '24 hours' },
    { testName: 'CT Scan Head', testCategory: 'Radiology', fee: 1500, sampleType: 'N/A', turnaroundTime: '12 hours' },
    { testName: 'Ultrasound Abdomen', testCategory: 'Radiology', fee: 800, sampleType: 'N/A', turnaroundTime: 'Same day' },
    { testName: 'ECG', testCategory: 'Radiology', fee: 300, sampleType: 'N/A', turnaroundTime: 'Immediate' },
    { testName: 'Echocardiogram', testCategory: 'Radiology', fee: 1200, sampleType: 'N/A', turnaroundTime: 'Same day' },
  ],
  sunDiagnostic: [
    { testName: 'CBC', testCategory: 'Blood', fee: 220, sampleType: 'EDTA Blood', turnaroundTime: '6 hours' },
    { testName: 'LFT', testCategory: 'Blood', fee: 420, sampleType: 'Serum', turnaroundTime: '24 hours' },
    { testName: 'X-Ray Chest PA', testCategory: 'Radiology', fee: 380, sampleType: 'N/A', turnaroundTime: '2 hours' },
    { testName: 'Ultrasound Abdomen', testCategory: 'Radiology', fee: 700, sampleType: 'N/A', turnaroundTime: 'Same day' },
    { testName: 'Thyroid Profile', testCategory: 'Blood', fee: 330, sampleType: 'Serum', turnaroundTime: '24 hours' },
    { testName: 'Vitamin D', testCategory: 'Blood', fee: 500, sampleType: 'Serum', turnaroundTime: '48 hours' },
    { testName: 'Vitamin B12', testCategory: 'Blood', fee: 450, sampleType: 'Serum', turnaroundTime: '48 hours' },
  ],
};

const CATALOG_LAB_NAMES: Record<LabKey, string> = {
  cityDiagnostics: 'City Diagnostics',
  apexRadiology: 'Apex Radiology',
  sunDiagnostic: 'Sun Diagnostic Center',
};

async function createTestCatalogs(labs: {
  cityDiagnostics: { id: string };
  apexRadiology: { id: string };
  sunDiagnostic: { id: string };
}) {
  console.log('\n📚 Creating Lab Test Catalogs (test master for Order Tests)...');

  for (const labKey of Object.keys(CATALOG_SPECS) as LabKey[]) {
    const specs = CATALOG_SPECS[labKey];
    const lab = labs[labKey];

    await db.labTestCatalog.createMany({
      data: specs!.map((s) => ({
        labPartnerId: lab.id,
        testName: s.testName,
        testCategory: s.testCategory,
        fee: s.fee,
        sampleType: s.sampleType,
        turnaroundTime: s.turnaroundTime,
        isActive: true,
      })),
    });
    console.log(`  ✓ ${CATALOG_LAB_NAMES[labKey]} — ${specs!.length} catalog tests created (all isActive)`);
  }
}

// ──────────────────────────────────────────────────────────────
// 5. DOCTOR ↔ LAB ASSOCIATIONS
// ──────────────────────────────────────────────────────────────

async function createAssociations(labs: {
  cityDiagnostics: { id: string };
  apexRadiology: { id: string };
  sunDiagnostic: { id: string };
}) {
  console.log('\n🤝 Creating Doctor ↔ Lab Associations...');

  // Dr. Rajesh Sharma — doctor row
  const drSharma = await db.doctor.findUnique({ where: { userId: 'dev-doctor' } });
  if (!drSharma) throw new Error('Doctor row for dev-doctor not found. Run seed-test-data.ts first.');
  console.log(`  ✓ Dr. Rajesh Sharma (Doctor.id=${drSharma.id})`);

  const a1 = await db.doctorLabAssociation.create({
    data: {
      doctorId: drSharma.id,
      labPartnerId: labs.cityDiagnostics.id,
      commissionPercent: 10,
      isActive: true,
      associatedAt: daysAgo(30),
      notes: 'Standard blood work partnership',
    },
  });
  console.log(`  ✓ Dr. Sharma ↔ City Diagnostics @ 10% (id=${a1.id})`);

  const a2 = await db.doctorLabAssociation.create({
    data: {
      doctorId: drSharma.id,
      labPartnerId: labs.apexRadiology.id,
      commissionPercent: 12,
      isActive: true,
      associatedAt: daysAgo(28),
      notes: 'Radiology partnership — higher margin on imaging',
    },
  });
  console.log(`  ✓ Dr. Sharma ↔ Apex Radiology @ 12% (id=${a2.id})`);

  const a3 = await db.doctorLabAssociation.create({
    data: {
      doctorId: drSharma.id,
      labPartnerId: labs.sunDiagnostic.id,
      commissionPercent: 8,
      isActive: true,
      associatedAt: daysAgo(25),
      notes: 'Multi-specialty diagnostic center',
    },
  });
  console.log(`  ✓ Dr. Sharma ↔ Sun Diagnostic @ 8% (id=${a3.id})`);

  // Dr. Anita Desai (best-effort, silent skip if not present)
  try {
    const drAnita = await db.doctor.findFirst({
      where: { user: { name: { contains: 'Anita' } } },
    });
    if (drAnita) {
      console.log(`  ✓ Dr. Anita Desai found (Doctor.id=${drAnita.id}) — adding associations`);

      const a4 = await db.doctorLabAssociation.create({
        data: {
          doctorId: drAnita.id,
          labPartnerId: labs.cityDiagnostics.id,
          commissionPercent: 10,
          isActive: true,
          associatedAt: daysAgo(20),
          notes: 'Blood work partnership',
        },
      });
      console.log(`    ✓ Dr. Anita ↔ City Diagnostics @ 10% (id=${a4.id})`);

      const a5 = await db.doctorLabAssociation.create({
        data: {
          doctorId: drAnita.id,
          labPartnerId: labs.sunDiagnostic.id,
          commissionPercent: 10,
          isActive: true,
          associatedAt: daysAgo(18),
          notes: 'Multi-specialty partnership',
        },
      });
      console.log(`    ✓ Dr. Anita ↔ Sun Diagnostic @ 10% (id=${a5.id})`);
    } else {
      console.log('  ℹ Dr. Anita Desai not found — skipping her associations');
    }
  } catch (err) {
    console.log(`  ℹ Could not add Dr. Anita associations (skipped silently): ${(err as Error).message}`);
  }

  return { drSharma };
}

// ──────────────────────────────────────────────────────────────
// 6. EXTERNAL TEST ORDERS (10) — Rahul Verma (dev-patient) by Dr. Sharma
// ──────────────────────────────────────────────────────────────

interface OrderSpec {
  testName: string;
  testType: string;
  testFee: number;
  labKey: 'cityDiagnostics' | 'apexRadiology' | 'sunDiagnostic';
  status: 'Ordered' | 'InProgress' | 'Completed';
  urgency: 'Normal' | 'Urgent';
  orderedDaysAgo: number;
  completedDaysAgo?: number; // only for Completed
  notes: string;
}

const ORDER_SPECS: OrderSpec[] = [
  // 1. CBC @ City Diagnostics — Ordered (2 days ago)
  {
    testName: 'CBC',
    testType: 'Blood',
    testFee: 250,
    labKey: 'cityDiagnostics',
    status: 'Ordered',
    urgency: 'Normal',
    orderedDaysAgo: 2,
    notes: 'Check for anemia — patient reports fatigue',
  },
  // 2. Lipid Profile @ City Diagnostics — Ordered (4 days ago)
  {
    testName: 'Lipid Profile',
    testType: 'Blood',
    testFee: 300,
    labKey: 'cityDiagnostics',
    status: 'Ordered',
    urgency: 'Normal',
    orderedDaysAgo: 4,
    notes: 'Routine health check — annual screening',
  },
  // 3. MRI Brain @ Apex Radiology — InProgress (urgent, 5 days ago)
  {
    testName: 'MRI Brain',
    testType: 'Radiology',
    testFee: 3000,
    labKey: 'apexRadiology',
    status: 'InProgress',
    urgency: 'Urgent',
    orderedDaysAgo: 5,
    notes: 'Suspected stroke — urgent MRI ordered. Patient presented with sudden-onset headache and slurred speech.',
  },
  // 4. CT Scan Head @ Apex Radiology — Completed (7 days ago, completed 5 days ago)
  {
    testName: 'CT Scan Head',
    testType: 'Radiology',
    testFee: 1500,
    labKey: 'apexRadiology',
    status: 'Completed',
    urgency: 'Normal',
    orderedDaysAgo: 7,
    completedDaysAgo: 5,
    notes: 'Follow-up on headache evaluation',
  },
  // 5. X-Ray Chest @ Apex Radiology — Completed (8 days ago, completed 6 days ago)
  {
    testName: 'X-Ray Chest',
    testType: 'Radiology',
    testFee: 400,
    labKey: 'apexRadiology',
    status: 'Completed',
    urgency: 'Normal',
    orderedDaysAgo: 8,
    completedDaysAgo: 6,
    notes: 'Persistent cough — rule out pneumonia',
  },
  // 6. Ultrasound Abdomen @ Sun Diagnostic — InProgress (6 days ago)
  {
    testName: 'Ultrasound Abdomen',
    testType: 'Radiology',
    testFee: 800,
    labKey: 'sunDiagnostic',
    status: 'InProgress',
    urgency: 'Normal',
    orderedDaysAgo: 6,
    notes: 'Evaluate epigastric discomfort',
  },
  // 7. Thyroid Profile @ Sun Diagnostic — Completed (10 days ago, completed 8 days ago)
  {
    testName: 'Thyroid Profile',
    testType: 'Blood',
    testFee: 350,
    labKey: 'sunDiagnostic',
    status: 'Completed',
    urgency: 'Normal',
    orderedDaysAgo: 10,
    completedDaysAgo: 8,
    notes: 'Follow-up on thyroid medication — check TSH response',
  },
  // 8. Vitamin D @ Sun Diagnostic — Ordered (3 days ago)
  {
    testName: 'Vitamin D',
    testType: 'Blood',
    testFee: 500,
    labKey: 'sunDiagnostic',
    status: 'Ordered',
    urgency: 'Normal',
    orderedDaysAgo: 3,
    notes: 'Vitamin deficiency screen — generalised muscle aches',
  },
  // 9. Vitamin B12 @ City Diagnostics — Completed (12 days ago, completed 10 days ago)
  {
    testName: 'Vitamin B12',
    testType: 'Blood',
    testFee: 450,
    labKey: 'cityDiagnostics',
    status: 'Completed',
    urgency: 'Normal',
    orderedDaysAgo: 12,
    completedDaysAgo: 10,
    notes: 'Vitamin deficiency screen — tingling in fingers',
  },
  // 10. Urine Routine @ City Diagnostics — Completed (14 days ago, completed 12 days ago)
  {
    testName: 'Urine Routine',
    testType: 'Blood',
    testFee: 250,
    labKey: 'cityDiagnostics',
    status: 'Completed',
    urgency: 'Normal',
    orderedDaysAgo: 14,
    completedDaysAgo: 12,
    notes: 'Routine health check',
  },
];

async function createExternalOrders(labs: {
  cityDiagnostics: { id: string };
  apexRadiology: { id: string };
  sunDiagnostic: { id: string };
}, drSharma: { id: string }) {
  console.log('\n📋 Creating 10 External Test Orders for Rahul Verma...');

  const createdOrders: Array<{
    id: string;
    orderNo: string;
    spec: OrderSpec;
    labPartnerId: string;
    commissionPercent: number;
    completedAt: Date | null;
  }> = [];

  // Per-lab commission % (mirrors Dr. Sharma's associations created above)
  const commissionByLab: Record<string, number> = {
    cityDiagnostics: 10,
    apexRadiology: 12,
    sunDiagnostic: 8,
  };

  for (let i = 0; i < ORDER_SPECS.length; i++) {
    const spec = ORDER_SPECS[i]!;
    const lab = labs[spec.labKey];
    const commissionPercent = commissionByLab[spec.labKey]!;
    const orderedAt = daysAgo(spec.orderedDaysAgo);
    const completedAt = spec.completedDaysAgo != null ? daysAgo(spec.completedDaysAgo) : null;

    const order = await db.externalTestOrder.create({
      data: {
        doctorId: drSharma.id,
        patientId: 'dev-patient',
        labPartnerId: lab.id,
        bookingId: null,
        testName: spec.testName,
        testType: spec.testType,
        testFee: spec.testFee,
        status: spec.status,
        urgency: spec.urgency,
        orderedAt,
        completedAt,
        notes: spec.notes,
      },
    });
    console.log(
      `  ✓ Order ${i + 1}/10: ${spec.testName} @ ${spec.labKey} — ${spec.status}` +
      ` (${spec.urgency}) ordered ${spec.orderedDaysAgo}d ago` +
      (spec.completedDaysAgo != null ? ` completed ${spec.completedDaysAgo}d ago` : '') +
      ` (id=${order.id}, orderNo=${order.orderNo})`
    );

    createdOrders.push({
      id: order.id,
      orderNo: order.orderNo,
      spec,
      labPartnerId: lab.id,
      commissionPercent,
      completedAt,
    });
  }

  return { createdOrders };
}

// ──────────────────────────────────────────────────────────────
// 7. LAB REPORT UPLOADS (5 — one per Completed order)
// ──────────────────────────────────────────────────────────────

interface ReportSpec {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  reportData: string; // JSON string
  verifiedByDoctor: boolean;
  notes: string;
}

// Per-order report specs keyed by index in ORDER_SPECS (1-based)
const REPORT_SPECS: Record<number, ReportSpec> = {
  // Order 4 — CT Scan Head (radiology) — verified, normal
  4: {
    fileUrl: '/uploads/lab-reports/sample-1.pdf',
    fileName: 'CT_Scan_Head_Rahul_Verma_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 482000,
    reportData: '[]',
    verifiedByDoctor: true,
    notes: 'Test completed. Results within normal range.',
  },
  // Order 5 — X-Ray Chest (radiology) — unverified, normal
  5: {
    fileUrl: '/uploads/lab-reports/sample-2.jpg',
    fileName: 'X-Ray_Chest_Rahul_Verma.jpg',
    fileType: 'image/jpeg',
    fileSize: 318000,
    reportData: '[]',
    verifiedByDoctor: false,
    notes: 'Test completed. Results within normal range.',
  },
  // Order 7 — Thyroid Profile (blood) — verified, normal
  7: {
    fileUrl: '/uploads/lab-reports/sample-3.pdf',
    fileName: 'Thyroid_Profile_Rahul_Verma_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 267500,
    reportData: JSON.stringify([
      { param: 'TSH', value: '3.2', unit: 'mIU/L', normal: '0.4-4.0', abnormal: false },
      { param: 'T3', value: '120', unit: 'ng/dL', normal: '80-200', abnormal: false },
      { param: 'T4', value: '8.5', unit: 'µg/dL', normal: '5.0-12.0', abnormal: false },
    ]),
    verifiedByDoctor: true,
    notes: 'Test completed. Results within normal range. Continue current thyroxine dose.',
  },
  // Order 9 — Vitamin B12 (blood) — unverified, ABNORMAL (Hb 8.5 demo)
  9: {
    fileUrl: '/uploads/lab-reports/sample-4.jpg',
    fileName: 'Vitamin_B12_Rahul_Verma.jpg',
    fileType: 'image/jpeg',
    fileSize: 295000,
    reportData: JSON.stringify([
      { param: 'Vitamin B12', value: '210', unit: 'pg/mL', normal: '200-900', abnormal: false },
      { param: 'Hb', value: '8.5', unit: 'g/dL', normal: '13-17', abnormal: true },
      { param: 'Hct', value: '28.1', unit: '%', normal: '40-50', abnormal: true },
    ]),
    verifiedByDoctor: false,
    notes: '⚠️ Abnormal — Hb 8.5 (low). Patient may have iron-deficiency anemia. Recommend iron supplement.',
  },
  // Order 10 — Urine Routine (blood) — unverified, normal
  10: {
    fileUrl: '/uploads/lab-reports/sample-5.pdf',
    fileName: 'Urine_Routine_Rahul_Verma_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 254000,
    reportData: JSON.stringify([
      { param: 'Colour', value: 'Pale Yellow', unit: '', normal: 'Pale Yellow', abnormal: false },
      { param: 'pH', value: '6.0', unit: '', normal: '5.0-8.0', abnormal: false },
      { param: 'Specific Gravity', value: '1.020', unit: '', normal: '1.005-1.030', abnormal: false },
      { param: 'Protein', value: 'Nil', unit: '', normal: 'Nil', abnormal: false },
    ]),
    verifiedByDoctor: false,
    notes: 'Test completed. Results within normal range.',
  },
};

async function createReportUploads(createdOrders: Array<{
  id: string;
  orderNo: string;
  spec: OrderSpec;
  labPartnerId: string;
  completedAt: Date | null;
}>) {
  console.log('\n📄 Creating Lab Report Uploads (one per Completed order)...');

  const completed = createdOrders.filter(
    (o, idx) => o.spec.status === 'Completed' && REPORT_SPECS[idx + 1] != null,
  );

  // Map labPartnerId → user (uploadedBy) — the lab partner's own User.id
  const labUserByPartnerId: Record<string, string> = {};
  const partners = await db.labPartner.findMany({ select: { id: true, userId: true } });
  for (const p of partners) labUserByPartnerId[p.id] = p.userId;

  const createdUploads: Array<{
    id: string;
    orderId: string;
    labPartnerId: string;
    uploadedBy: string;
    completedAt: Date;
    spec: ReportSpec;
  }> = [];

  for (const ord of completed) {
    const idx = createdOrders.indexOf(ord) + 1;
    const spec = REPORT_SPECS[idx]!;
    const uploadedBy = labUserByPartnerId[ord.labPartnerId] ?? 'dev-lab-tech';
    const completedAt = ord.completedAt ?? new Date();

    const upload = await db.labReportUpload.create({
      data: {
        externalTestOrderId: ord.id,
        labPartnerId: ord.labPartnerId,
        fileUrl: spec.fileUrl,
        fileName: spec.fileName,
        fileType: spec.fileType,
        fileSize: spec.fileSize,
        reportData: spec.reportData,
        uploadedAt: completedAt,
        uploadedBy,
        verifiedByDoctor: spec.verifiedByDoctor,
        verifiedAt: spec.verifiedByDoctor
          ? new Date(completedAt.getTime() + 24 * 60 * 60 * 1000) // verified 1 day after upload
          : null,
        notes: spec.notes,
      },
    });
    const abnormalTag = spec.notes.startsWith('⚠️') ? ' [ABNORMAL]' : '';
    console.log(
      `  ✓ Report for Order #${idx} (${ord.spec.testName}): ${spec.fileName}` +
      ` (${spec.fileType}, ${Math.round(spec.fileSize / 1000)} KB)` +
      ` verified=${spec.verifiedByDoctor}${abnormalTag} (id=${upload.id})`
    );
    createdUploads.push({
      id: upload.id,
      orderId: ord.id,
      labPartnerId: ord.labPartnerId,
      uploadedBy,
      completedAt,
      spec,
    });
  }

  return { createdUploads, completedOrders: completed };
}

// ──────────────────────────────────────────────────────────────
// 8. LAB BILLINGS (5 — one per Completed order)
// ──────────────────────────────────────────────────────────────

async function createLabBillings(
  createdOrders: Array<{
    id: string;
    orderNo: string;
    spec: OrderSpec;
    labPartnerId: string;
    commissionPercent: number;
    completedAt: Date | null;
  }>,
  drSharma: { id: string },
) {
  console.log('\n💸 Creating Lab Billings (one per Completed order)...');

  const completed = createdOrders.filter((o) => o.spec.status === 'Completed');

  // Pick 2 of the 5 to mark Paid (the oldest two: Vitamin B12 #9, Urine Routine #10).
  // Use a Set of order-spec.testName for clarity.
  const paidTestNames = new Set(['Vitamin B12', 'Urine Routine']);

  let billCounter = 0;
  const createdBillings: Array<{ id: string; orderId: string; paid: boolean }> = [];

  for (const ord of completed) {
    billCounter++;
    const amount = ord.spec.testFee;
    const commissionAmount = Math.round((amount * ord.commissionPercent) / 100);
    const billedAt = ord.completedAt ?? new Date();
    const isPaid = paidTestNames.has(ord.spec.testName);
    const paidAt = isPaid
      ? new Date(billedAt.getTime() + 3 * 24 * 60 * 60 * 1000) // billedAt + 3 days
      : null;
    const transactionRef = isPaid
      ? `BANK-TRF-2025-${String(billCounter).padStart(3, '0')}`
      : '';

    const billing = await db.labBilling.create({
      data: {
        labPartnerId: ord.labPartnerId,
        doctorId: drSharma.id,
        patientId: 'dev-patient',
        testOrderId: ord.id,
        amount,
        commissionAmount,
        commissionPercent: ord.commissionPercent,
        paymentStatus: isPaid ? 'Paid' : 'Pending',
        billedAt,
        paidAt,
        transactionRef,
        notes: 'Auto-generated on report upload',
      },
    });
    console.log(
      `  ✓ Billing for ${ord.spec.testName}: ₹${amount} (commission ₹${commissionAmount} @ ${ord.commissionPercent}%) — ${isPaid ? 'Paid' : 'Pending'}` +
      (isPaid ? ` ref=${transactionRef}` : '') +
      ` (id=${billing.id})`
    );
    createdBillings.push({ id: billing.id, orderId: ord.id, paid: isPaid });
  }

  return { createdBillings };
}

// ──────────────────────────────────────────────────────────────
// 9. SUMMARY
// ──────────────────────────────────────────────────────────────

async function printSummary() {
  const [labs, catalogs, assoc, orders, reports, billings, payments] = await Promise.all([
    db.labPartner.count(),
    db.labTestCatalog.count(),
    db.doctorLabAssociation.count(),
    db.externalTestOrder.count(),
    db.labReportUpload.count(),
    db.labBilling.count(),
    db.commissionPayment.count(),
  ]);

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  Lab Module Seed Complete — Summary');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Lab Partners              : ${labs}`);
  console.log(`  Lab Test Catalogs         : ${catalogs}`);
  console.log(`  Doctor-Lab Associations   : ${assoc}`);
  console.log(`  External Test Orders      : ${orders}`);
  console.log(`  Lab Report Uploads        : ${reports}`);
  console.log(`  Lab Billings              : ${billings}`);
  console.log(`  Commission Payments       : ${payments}  (not seeded — admin pays out later)`);
  console.log('══════════════════════════════════════════════════════════\n');
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────

async function main() {
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Doctorooms HMS — Lab Module Demo Data Seed');
  console.log('══════════════════════════════════════════════════════════\n');

  await clearLabData();
  await ensureLabUsers();
  const labs = await createLabPartners();
  await createTestCatalogs(labs);
  const { drSharma } = await createAssociations(labs);
  const { createdOrders } = await createExternalOrders(labs, drSharma);
  await createReportUploads(createdOrders);
  await createLabBillings(createdOrders, drSharma);
  await printSummary();

  console.log('✅ Lab module demo data seeded successfully.');
}

main().catch((err) => {
  console.error('❌ Lab module seed failed:', err);
  console.error(err instanceof Error ? err.stack : err);
}).finally(async () => {
  await db.$disconnect();
});
