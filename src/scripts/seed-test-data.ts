/**
 * ============================================================
 * SEED SCRIPT: Comprehensive Test Data — Doctorooms HMS
 * ============================================================
 *
 * Seeds the entire database with realistic end-to-end test data:
 *
 *   CLINIC SIDE (Dr. Sharma's Clinic)
 *     - Dr. Rajesh Sharma (dev-doctor) + Doctor profile + Sharma Clinic Hospital
 *     - Meera Joshi (dev-receptionist) + Receptionist profile
 *     - Vikram Patel (dev-assistant) + DoctorAssistant link
 *     - Kavitha Devi (dev-pharmacist) + DoctorPharmacist link
 *     - DoctorSchedule (Mon-Sat, 9-13h, 30-min)
 *     - DoctorMedicine × 16
 *     - CategoryMaster × 8, CoMaster × 8, QuestionsMaster × 16, SuggestionsMaster × 32+
 *     - FindingsMaster × 8 + FindingsMedicine links
 *     - LabelMaster × 6, TableTemplateMaster × 3, POtherSetting × 1
 *
 *   HOSPITAL SIDE (City General Hospital)
 *     - City General Hospital (dev-hospital) + Hospital profile
 *     - Departments × 3 (GEN, ORT, CAR)
 *     - Dr. Anita Desai (dev-doctor-anita) + DoctorHospital → General Medicine
 *     - Dr. Suresh Iyer (dev-doctor-suresh) + DoctorHospital → Cardiology
 *     - Priya Sharma (dev-nurse) + StaffNurse profile
 *     - Amit Kumar (dev-lab-tech) + LabTechnician profile
 *     - Wards × 3 + Beds × 15 (8+4+3)
 *     - LabTestMaster × 5 + LabTestParameter × ~23
 *     - ChargeCategory × 4 + ChargeItem × ~14
 *     - InventoryItem × 12
 *     - OperationTheater × 1
 *
 *   TEST DATA (tracing a patient through both flows)
 *     - Rahul Verma (dev-patient)
 *     - 2 Bookings (clinic + hospital OPD), status "Approve", today
 *     - 1 Prescription (PMedicine × 3, PLabel × 3, PSuggestion × 2)
 *     - 1 IPD Admission (General Ward B1) + bed marked Occupied
 *     - VitalRecord × 4, DoctorOrder × 3, SampleCollection × 1,
 *       InvestigationReport × 1, DoctorVisit × 1
 *
 * Usage:
 *   bun run src/scripts/seed-test-data.ts
 *
 * Notes:
 *   - Clears all existing data first (deleteMany in correct FK order).
 *   - User IDs match DEV_USERS in src/lib/api-auth.ts.
 *   - All passwords hashed with bcryptjs (dev password: <role>123).
 * ============================================================
 */

import { db } from '../lib/db';
import bcrypt from 'bcryptjs';

// ──────────────────────────────────────────────────────────────
// DATE HELPERS
// ──────────────────────────────────────────────────────────────

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), 0, 0, 0, 0);

/** Build a Date for today at given hour/minute (local time). */
function todayAt(hour: number, minute = 0): Date {
  return new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), hour, minute, 0, 0);
}

/** Date N days from today (negative = past). */
function daysFromNow(days: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d;
}

/** Date N months from today. */
function monthsFromNow(months: number): Date {
  const d = new Date(TODAY);
  d.setMonth(d.getMonth() + months);
  return d;
}

// ──────────────────────────────────────────────────────────────
// 1. CLEAR EXISTING DATA (children first — reverse FK order)
// ──────────────────────────────────────────────────────────────

async function clearAllData() {
  console.log('🧹 Clearing existing data (FK-safe order)...');

  // Lab
  await db.labParameterValue.deleteMany();
  await db.labReport.deleteMany();
  await db.labTestParameter.deleteMany();
  await db.labTestMaster.deleteMany();

  // Billing
  await db.billLineItem.deleteMany();
  await db.billPayment.deleteMany();
  await db.patientAdvance.deleteMany();
  await db.ipdBill.deleteMany();
  await db.opdBill.deleteMany();
  await db.chargeItem.deleteMany();
  await db.chargeCategory.deleteMany();

  // Inventory
  await db.stockMovement.deleteMany();
  await db.purchaseOrderItem.deleteMany();
  await db.purchaseOrder.deleteMany();
  await db.inventoryItem.deleteMany();

  // OT
  await db.otSchedule.deleteMany();
  await db.operationTheater.deleteMany();

  // IPD sub-records (children of IpdAdmission)
  await db.investigationReport.deleteMany();
  await db.sampleCollection.deleteMany();
  await db.medicineAdministration.deleteMany();
  await db.doctorOrder.deleteMany();
  await db.doctorVisit.deleteMany();
  await db.vitalRecord.deleteMany();
  await db.nursePatientAssignment.deleteMany();
  await db.bedTransfer.deleteMany();
  await db.dietOrder.deleteMany();
  await db.familyAccess.deleteMany();
  await db.ipdAdmission.deleteMany();

  // Prescription
  await db.prescriptionAccessRequest.deleteMany();
  await db.pDignoTable.deleteMany();
  await db.pCo.deleteMany();
  await db.pMedicine.deleteMany();
  await db.pLabel.deleteMany();
  await db.pSuggestion.deleteMany();
  await db.prescription.deleteMany();

  // Booking + ratings/chat
  await db.doctorRating.deleteMany();
  await db.bookingChat.deleteMany();
  await db.booking.deleteMany();

  // Doctor masters
  await db.doctorHoliday.deleteMany();
  await db.doctorSchedule.deleteMany();
  await db.findingsMedicine.deleteMany();
  await db.findingsMaster.deleteMany();
  await db.doctorMedicine.deleteMany();
  await db.coMaster.deleteMany();
  await db.questionsMaster.deleteMany();
  await db.suggestionsMaster.deleteMany();
  await db.labelMaster.deleteMany();
  await db.tableTemplateMaster.deleteMany();
  await db.pOtherSetting.deleteMany();
  await db.doctorGallery.deleteMany();
  await db.categoryMaster.deleteMany();

  // Doctor relations
  await db.doctorAssistant.deleteMany();
  await db.doctorPharmacist.deleteMany();
  await db.receptionist.deleteMany();
  await db.doctorHospital.deleteMany();

  // Shift handover
  await db.shiftHandover.deleteMany();

  // Ward & Bed
  await db.bed.deleteMany();
  await db.ward.deleteMany();

  // Staff
  await db.staffNurse.deleteMany();
  await db.labTechnician.deleteMany();

  // Department
  await db.department.deleteMany();

  // Doctor & Hospital (parents)
  await db.doctor.deleteMany();
  await db.hospital.deleteMany();

  // User-related (must be before User)
  await db.medicalDocument.deleteMany();
  await db.hospitalInquiry.deleteMany();
  await db.post.deleteMany();
  await db.notification.deleteMany();

  // Standalone tables
  await db.doctorTypeMaster.deleteMany();
  await db.diseaseMaster.deleteMany();
  await db.slider.deleteMany();
  await db.systemSettings.deleteMany();

  // User (last)
  await db.user.deleteMany();

  console.log('  ✓ All tables cleared');
}

// ──────────────────────────────────────────────────────────────
// MAIN SEED
// ──────────────────────────────────────────────────────────────

async function main() {
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Doctorooms HMS — Comprehensive Test Data Seed');
  console.log('══════════════════════════════════════════════════════════\n');

  await clearAllData();

  // Hash dev password once
  const passwordHash = await bcrypt.hash('dev123', 10);
  console.log('\n🔐 Password hash generated for dev users');

  // ───────────────────────────────────────────────────────────
  // USERS (all 11)
  // ───────────────────────────────────────────────────────────
  console.log('\n👤 Creating users...');

  await db.user.create({
    data: {
      id: 'dev-admin',
      name: 'Admin User',
      email: 'admin@doctorooms.com',
      password: passwordHash,
      gender: 'Male',
      role: 'admin',
      status: 'Active',
      mobileNo: '+91 9876543216',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-doctor',
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@doctorooms.com',
      password: passwordHash,
      gender: 'Male',
      role: 'doctor',
      status: 'Active',
      mobileNo: '+91 9876543211',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-doctor-anita',
      name: 'Dr. Anita Desai',
      email: 'anita.desai@doctorooms.com',
      password: passwordHash,
      gender: 'Female',
      role: 'doctor',
      status: 'Active',
      mobileNo: '+91 9820011221',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-doctor-suresh',
      name: 'Dr. Suresh Iyer',
      email: 'suresh.iyer@doctorooms.com',
      password: passwordHash,
      gender: 'Male',
      role: 'doctor',
      status: 'Active',
      mobileNo: '+91 9820011222',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-receptionist',
      name: 'Meera Joshi',
      email: 'meera.joshi@doctorooms.com',
      password: passwordHash,
      gender: 'Female',
      role: 'receptionist',
      status: 'Active',
      mobileNo: '+91 9876543212',
    },
  });

  // Hospital-mode receptionist (City General ONLY — exercises the hospital
  // walk-in branch: department/doctor pickers + slot grid per selected doctor)
  await db.user.create({
    data: {
      id: 'dev-receptionist-hospital',
      name: 'Sunita Rao',
      email: 'sunita.rao@doctorooms.com',
      password: passwordHash,
      gender: 'Female',
      role: 'receptionist',
      status: 'Active',
      mobileNo: '+91 9876543290',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-assistant',
      name: 'Vikram Patel',
      email: 'vikram.p@doctorooms.com',
      password: passwordHash,
      gender: 'Male',
      role: 'assistant',
      status: 'Active',
      mobileNo: '+91 9876543214',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-pharmacist',
      name: 'Kavitha Devi',
      email: 'kavitha.d@doctorooms.com',
      password: passwordHash,
      gender: 'Female',
      role: 'pharmacist',
      status: 'Active',
      mobileNo: '+91 9876543215',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-hospital',
      name: 'City General Hospital',
      email: 'city.hospital@doctorooms.com',
      password: passwordHash,
      gender: 'Male',
      role: 'hospital',
      status: 'Active',
      mobileNo: '+91 9876543213',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-nurse',
      name: 'Priya Sharma',
      email: 'priya.sharma@doctorooms.com',
      password: passwordHash,
      gender: 'Female',
      role: 'nurse',
      status: 'Active',
      mobileNo: '+91 9876543217',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-lab-tech',
      name: 'Amit Kumar',
      email: 'lab@doctorooms.com',
      password: passwordHash,
      gender: 'Male',
      role: 'lab_technician',
      status: 'Active',
      mobileNo: '+91 9876543218',
    },
  });

  await db.user.create({
    data: {
      id: 'dev-patient',
      name: 'Rahul Verma',
      email: 'rahul.v@doctorooms.com',
      password: passwordHash,
      gender: 'Male',
      role: 'patient',
      status: 'Active',
      mobileNo: '+91 9876543210',
    },
  });

  console.log('  ✓ 11 users created (admin, doctor ×3, receptionist, assistant, pharmacist, hospital, nurse, lab-tech, patient)');

  // ───────────────────────────────────────────────────────────
  // HOSPITALS
  // ───────────────────────────────────────────────────────────
  console.log('\n🏥 Creating hospitals...');

  // Sharma Clinic — owned by dev-doctor (clinic-mode doctor)
  const sharmaClinic = await db.hospital.create({
    data: {
      userId: 'dev-doctor',
      hospitalName: 'Sharma Clinic',
      address: '12, MG Road, Indiranagar',
      state: 'Karnataka',
      city: 'Bengaluru',
      pincode: '560038',
      email: 'rajesh.sharma@doctorooms.com',
      contactNo: '+91 80 2345 6789',
      website: 'https://sharmaclinic.in',
      hospitalType: 'Clinic',
      establishedYear: 2015,
      bedCount: 0,
      accreditation: '',
      facilities: '["Pharmacy","Lab Collection"]',
      lat: 12.9716,
      longi: 77.5946,
      status: 'Active',
    },
  });
  console.log(`  ✓ Sharma Clinic (id: ${sharmaClinic.id})`);

  // City General Hospital — owned by dev-hospital
  const cityGeneral = await db.hospital.create({
    data: {
      userId: 'dev-hospital',
      hospitalName: 'City General Hospital',
      address: '45, Hospital Road, Shivajinagar',
      state: 'Karnataka',
      city: 'Bengaluru',
      pincode: '560001',
      email: 'city.hospital@doctorooms.com',
      contactNo: '+91 80 2222 3333',
      website: 'https://citygeneral.in',
      hospitalType: 'Multi-Specialty',
      establishedYear: 1995,
      bedCount: 150,
      accreditation: 'NABH',
      facilities: '["ICU","MRI","CT Scan","Modular OT","24x7 Pharmacy","Emergency"]',
      lat: 12.9352,
      longi: 77.6245,
      status: 'Active',
    },
  });
  console.log(`  ✓ City General Hospital (id: ${cityGeneral.id})`);

  // ───────────────────────────────────────────────────────────
  // DOCTORS
  // ───────────────────────────────────────────────────────────
  console.log('\n👨‍⚕️ Creating doctor profiles...');

  const drSharma = await db.doctor.create({
    data: {
      userId: 'dev-doctor',
      hospitalId: sharmaClinic.id,
      doctorType: 'General Physician',
      specialization: 'General Medicine',
      education: 'MBBS, MD (Internal Medicine)',
      experience: '15 Years',
      city: 'Bengaluru',
      state: 'Karnataka',
      address: '12, MG Road, Indiranagar, Bengaluru 560038',
      hospitalAddress: 'Sharma Clinic, Indiranagar, Bengaluru',
      fees: 500,
      emergencyCharge: 1000,
      registrationDetail: 'KMC-2015-MD-98765',
      contactNo: '+91 9876543211',
      phoneNo: '+91 80 2345 6789',
      lat: 12.9716,
      longi: 77.5946,
      bookingDays: 180,
      dailyLimit: 50,
      description: 'General Physician with 15+ years of experience in family medicine.',
      awardAndRecognition: 'Best Doctor Award 2022 — Bengaluru Medical Association',
    },
  });
  console.log(`  ✓ Dr. Rajesh Sharma (id: ${drSharma.id})`);

  const drAnita = await db.doctor.create({
    data: {
      userId: 'dev-doctor-anita',
      hospitalId: cityGeneral.id,
      doctorType: 'General Physician',
      specialization: 'General Medicine',
      education: 'MBBS, MD (Internal Medicine)',
      experience: '12 Years',
      city: 'Bengaluru',
      state: 'Karnataka',
      address: 'Hostel Block, City General Hospital Campus',
      hospitalAddress: 'City General Hospital, Shivajinagar, Bengaluru',
      fees: 700,
      emergencyCharge: 1200,
      registrationDetail: 'KMC-2012-MD-45678',
      contactNo: '+91 9820011221',
      phoneNo: '+91 80 2222 3333',
      lat: 12.9352,
      longi: 77.6245,
      bookingDays: 90,
      dailyLimit: 30,
      description: 'Senior Consultant in General Medicine at City General Hospital.',
    },
  });
  console.log(`  ✓ Dr. Anita Desai (id: ${drAnita.id})`);

  const drSuresh = await db.doctor.create({
    data: {
      userId: 'dev-doctor-suresh',
      hospitalId: cityGeneral.id,
      doctorType: 'Cardiologist',
      specialization: 'Cardiology',
      education: 'MBBS, MD (Medicine), DM (Cardiology)',
      experience: '18 Years',
      city: 'Bengaluru',
      state: 'Karnataka',
      address: 'Doctors Quarters, City General Hospital Campus',
      hospitalAddress: 'City General Hospital, Shivajinagar, Bengaluru',
      fees: 1200,
      emergencyCharge: 2500,
      registrationDetail: 'KMC-2008-DM-12345',
      contactNo: '+91 9820011222',
      phoneNo: '+91 80 2222 3333',
      lat: 12.9352,
      longi: 77.6245,
      bookingDays: 90,
      dailyLimit: 20,
      description: 'Senior Interventional Cardiologist with 18 years of experience.',
    },
  });
  console.log(`  ✓ Dr. Suresh Iyer (id: ${drSuresh.id})`);

  // ───────────────────────────────────────────────────────────
  // DEPARTMENTS (City General Hospital)
  // ───────────────────────────────────────────────────────────
  console.log('\n🏛️ Creating departments at City General...');

  const deptGenMed = await db.department.create({
    data: {
      hospitalId: cityGeneral.id,
      name: 'General Medicine',
      nameHi: 'सामान्य चिकित्सा',
      shortCode: 'GEN',
      description: 'General Medicine & Internal Medicine OPD',
      icon: 'Stethoscope',
      floorNo: 'Ground Floor',
      opdRoom: 'OPD Room 101',
      status: 'Active',
      sortOrder: 1,
    },
  });

  const deptOrtho = await db.department.create({
    data: {
      hospitalId: cityGeneral.id,
      name: 'Orthopedics',
      nameHi: 'हड्डी रोग',
      shortCode: 'ORT',
      description: 'Orthopedics & Joint Replacement',
      icon: 'Bone',
      floorNo: 'Floor 1',
      opdRoom: 'OPD Room 203',
      status: 'Active',
      sortOrder: 2,
    },
  });

  const deptCard = await db.department.create({
    data: {
      hospitalId: cityGeneral.id,
      name: 'Cardiology',
      nameHi: 'हृदय रोग',
      shortCode: 'CAR',
      description: 'Cardiology & Cardiac Surgery',
      icon: 'HeartPulse',
      floorNo: 'Floor 2',
      opdRoom: 'OPD Room 305',
      status: 'Active',
      sortOrder: 3,
    },
  });
  console.log('  ✓ 3 departments (General Medicine, Orthopedics, Cardiology)');

  // ───────────────────────────────────────────────────────────
  // DOCTOR-HOSPITAL LINKS (Anita + Suresh at City General)
  // ───────────────────────────────────────────────────────────
  console.log('\n🔗 Creating DoctorHospital links...');

  await db.doctorHospital.create({
    data: {
      doctorId: drAnita.id,
      hospitalId: cityGeneral.id,
      departmentId: deptGenMed.id,
      designation: 'Senior Consultant',
      fees: 700,
      opdTimings: 'Mon-Sat 09:00-13:00',
      isAvailable: true,
      status: 'Active',
    },
  });

  await db.doctorHospital.create({
    data: {
      doctorId: drSuresh.id,
      hospitalId: cityGeneral.id,
      departmentId: deptCard.id,
      designation: 'Senior Consultant & HOD',
      fees: 1200,
      opdTimings: 'Mon/Wed/Fri 10:00-14:00',
      isAvailable: true,
      status: 'Active',
    },
  });
  console.log('  ✓ Dr. Anita → General Medicine, Dr. Suresh → Cardiology');

  // ───────────────────────────────────────────────────────────
  // CLINIC STAFF (Receptionist, Assistant, Pharmacist)
  // ───────────────────────────────────────────────────────────
  console.log('\n👥 Creating clinic staff profiles...');

  await db.receptionist.create({
    data: {
      userId: 'dev-receptionist',
      doctorId: drSharma.id,
      hospitalId: sharmaClinic.id,
      address: 'Indiranagar, Bengaluru',
    },
  });
  console.log('  ✓ Receptionist Meera Joshi (linked to Dr. Sharma + Sharma Clinic)');

  await db.receptionist.create({
    data: {
      userId: 'dev-receptionist-hospital',
      hospitalId: cityGeneral.id,
      address: 'CBD Belur, Bengaluru',
    },
  });
  console.log('  ✓ Receptionist Sunita Rao (hospital-mode, City General only)');

  await db.doctorAssistant.create({
    data: {
      userId: 'dev-assistant',
      doctorId: drSharma.id,
      description: 'Senior Assistant — 5 years experience',
      address: 'Bengaluru',
    },
  });
  console.log('  ✓ Assistant Vikram Patel (linked to Dr. Sharma)');

  await db.doctorPharmacist.create({
    data: {
      userId: 'dev-pharmacist',
      doctorId: drSharma.id,
      description: 'Clinic Pharmacist — handles dispensing',
      address: 'Bengaluru',
      dlNo: 'KA-B-21-987654',
    },
  });
  console.log('  ✓ Pharmacist Kavitha Devi (linked to Dr. Sharma)');

  // ───────────────────────────────────────────────────────────
  // WARDS + BEDS (City General Hospital)
  // ───────────────────────────────────────────────────────────
  console.log('\n🛏️ Creating wards and beds...');

  const generalWard = await db.ward.create({
    data: {
      hospitalId: cityGeneral.id,
      name: 'General Ward',
      nameHi: 'सामान्य वार्ड',
      wardType: 'General',
      floorNo: 'Ground Floor',
      totalBeds: 8,
      nurseRatio: 6,
      status: 'Active',
    },
  });

  const privateRoom = await db.ward.create({
    data: {
      hospitalId: cityGeneral.id,
      name: 'Private Room',
      nameHi: 'प्राइवेट रूम',
      wardType: 'Private',
      floorNo: 'Floor 1',
      totalBeds: 4,
      nurseRatio: 4,
      status: 'Active',
    },
  });

  const icu = await db.ward.create({
    data: {
      hospitalId: cityGeneral.id,
      name: 'ICU',
      nameHi: 'आईसीयू',
      wardType: 'ICU',
      floorNo: 'Floor 2',
      totalBeds: 3,
      nurseRatio: 2,
      status: 'Active',
    },
  });

  const bedTypeFor = (wardType: string): string => {
    if (wardType === 'ICU') return 'ICU_NonVentilator';
    if (wardType === 'Private') return 'Private';
    return 'General';
  };
  const rateFor = (wardType: string): number => {
    if (wardType === 'ICU') return 5000;
    if (wardType === 'Private') return 2500;
    return 800;
  };

  const bedIdsGeneral: string[] = [];
  for (let i = 1; i <= 8; i++) {
    const bed = await db.bed.create({
      data: {
        wardId: generalWard.id,
        bedNumber: `B${i}`,
        bedType: bedTypeFor('General'),
        dailyRate: rateFor('General'),
        status: 'Available',
      },
    });
    bedIdsGeneral.push(bed.id);
  }

  for (let i = 1; i <= 4; i++) {
    await db.bed.create({
      data: {
        wardId: privateRoom.id,
        bedNumber: `P${i}`,
        bedType: bedTypeFor('Private'),
        dailyRate: rateFor('Private'),
        status: 'Available',
      },
    });
  }

  for (let i = 1; i <= 3; i++) {
    await db.bed.create({
      data: {
        wardId: icu.id,
        bedNumber: `I${i}`,
        bedType: bedTypeFor('ICU'),
        dailyRate: rateFor('ICU'),
        status: 'Available',
      },
    });
  }
  console.log('  ✓ 3 wards + 15 beds (8 General + 4 Private + 3 ICU)');

  // ───────────────────────────────────────────────────────────
  // STAFF NURSE + LAB TECHNICIAN (City General)
  // ───────────────────────────────────────────────────────────
  console.log('\n👩‍⚕️ Creating nurse & lab technician profiles...');

  const nursePriya = await db.staffNurse.create({
    data: {
      userId: 'dev-nurse',
      hospitalId: cityGeneral.id,
      wardId: generalWard.id,
      employeeId: 'NUR-001',
      qualification: 'BSc Nursing',
      designation: 'Staff Nurse',
      shift: 'Morning',
      phoneNo: '+91 9876543217',
      address: 'Bengaluru',
    },
  });
  console.log(`  ✓ StaffNurse Priya Sharma (id: ${nursePriya.id}, Morning shift, General Ward)`);

  await db.labTechnician.create({
    data: {
      userId: 'dev-lab-tech',
      hospitalId: cityGeneral.id,
      employeeId: 'LAB-001',
      qualification: 'BSc MLT',
      specialization: 'Clinical Pathology',
      phoneNo: '+91 9876543218',
      status: 'Active',
    },
  });
  console.log('  ✓ LabTechnician Amit Kumar');

  // ───────────────────────────────────────────────────────────
  // DOCTOR SCHEDULE (Dr. Sharma — Mon-Sat, 9-13h, 30-min)
  // ───────────────────────────────────────────────────────────
  console.log('\n📅 Creating doctor schedule (Dr. Sharma)...');

  // Build 30-min slots 09:00 → 13:00
  const slots: string[] = [];
  for (let h = 9; h < 13; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  const slotsJson = JSON.stringify(slots);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (const day of days) {
    await db.doctorSchedule.create({
      data: {
        doctorId: drSharma.id,
        day,
        startTime: '09:00',
        endTime: '13:00',
        slotDuration: 30,
        timeSlots: slotsJson,
      },
    });
  }
  console.log(`  ✓ 6 days × 8 slots (9:00 AM – 1:00 PM, 30-min)`);

  // Evening slots 17:00 → 21:00 (for Dr. Suresh Iyer's Friday clinic)
  const eveSlots: string[] = [];
  for (let h = 17; h < 21; h++) {
    eveSlots.push(`${String(h).padStart(2, '0')}:00`);
    eveSlots.push(`${String(h).padStart(2, '0')}:30`);
  }
  const eveSlotsJson = JSON.stringify(eveSlots);

  console.log('📅 Creating doctor schedules (Dr. Desai + Dr. Iyer)...');
  // Dr. Anita Desai (dev-doctor-anita) — Mon-Fri mornings
  const anitaDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  for (const day of anitaDays) {
    await db.doctorSchedule.create({
      data: {
        doctorId: drAnita.id,
        day,
        startTime: '09:00',
        endTime: '13:00',
        slotDuration: 30,
        timeSlots: slotsJson,
      },
    });
  }
  console.log(`  ✓ Dr. Desai: 5 days × 8 slots (9:00 AM – 1:00 PM)`);

  // Dr. Suresh Iyer (dev-doctor-suresh) — Friday evenings + Saturday mornings
  await db.doctorSchedule.create({
    data: {
      doctorId: drSuresh.id,
      day: 'Friday',
      startTime: '17:00',
      endTime: '21:00',
      slotDuration: 30,
      timeSlots: eveSlotsJson,
    },
  });
  await db.doctorSchedule.create({
    data: {
      doctorId: drSuresh.id,
      day: 'Saturday',
      startTime: '09:00',
      endTime: '13:00',
      slotDuration: 30,
      timeSlots: slotsJson,
    },
  });
  console.log(`  ✓ Dr. Iyer: Fri 5–9 PM + Sat 9 AM–1 PM`);

  // ───────────────────────────────────────────────────────────
  // DOCTOR MEDICINES (16 common medicines)
  // ───────────────────────────────────────────────────────────
  console.log('\n💊 Creating doctor medicines (Dr. Sharma)...');

  interface MedSeed {
    name: string;
    composition: string;
    morning?: number;
    afternoon?: number;
    evening?: number;
    dose: string[];
    tab: number;
    description: string;
  }

  const MEDICINES: MedSeed[] = [
    { name: 'Paracetamol', composition: 'Paracetamol 500mg', morning: 1, afternoon: 0, evening: 1, dose: ['500mg', '650mg'], tab: 5, description: 'For fever and pain relief' },
    { name: 'Amoxicillin', composition: 'Amoxicillin 500mg', morning: 1, afternoon: 1, evening: 1, dose: ['250mg', '500mg'], tab: 7, description: 'Antibiotic — bacterial infections' },
    { name: 'Omeprazole', composition: 'Omeprazole 20mg', morning: 1, afternoon: 0, evening: 0, dose: ['10mg', '20mg', '40mg'], tab: 14, description: 'Proton pump inhibitor — acidity' },
    { name: 'Metformin', composition: 'Metformin 500mg', morning: 1, afternoon: 0, evening: 1, dose: ['500mg', '850mg', '1000mg'], tab: 30, description: 'Anti-diabetic — Type 2 diabetes' },
    { name: 'Amlodipine', composition: 'Amlodipine 5mg', morning: 1, afternoon: 0, evening: 0, dose: ['2.5mg', '5mg', '10mg'], tab: 30, description: 'Calcium channel blocker — hypertension' },
    { name: 'Azithromycin', composition: 'Azithromycin 500mg', morning: 1, afternoon: 0, evening: 0, dose: ['250mg', '500mg'], tab: 5, description: 'Macrolide antibiotic — respiratory' },
    { name: 'Cetirizine', composition: 'Cetirizine 10mg', morning: 0, afternoon: 0, evening: 1, dose: ['5mg', '10mg'], tab: 5, description: 'Antihistamine — allergy' },
    { name: 'Ibuprofen', composition: 'Ibuprofen 400mg', morning: 1, afternoon: 0, evening: 1, dose: ['200mg', '400mg', '600mg'], tab: 5, description: 'NSAID — pain & inflammation' },
    { name: 'Pantoprazole', composition: 'Pantoprazole 40mg', morning: 1, afternoon: 0, evening: 0, dose: ['20mg', '40mg'], tab: 14, description: 'PPI — GERD, peptic ulcer' },
    { name: 'Ciprofloxacin', composition: 'Ciprofloxacin 500mg', morning: 1, afternoon: 0, evening: 1, dose: ['250mg', '500mg', '750mg'], tab: 7, description: 'Fluoroquinolone — UTI, infections' },
    { name: 'Ranitidine', composition: 'Ranitidine 150mg', morning: 1, afternoon: 0, evening: 1, dose: ['150mg', '300mg'], tab: 14, description: 'H2 blocker — acidity' },
    { name: 'Ofloxacin', composition: 'Ofloxacin 200mg', morning: 1, afternoon: 0, evening: 1, dose: ['100mg', '200mg', '400mg'], tab: 7, description: 'Fluoroquinolone antibiotic' },
    { name: 'Diclofenac', composition: 'Diclofenac 50mg', morning: 1, afternoon: 0, evening: 1, dose: ['25mg', '50mg', '75mg'], tab: 5, description: 'NSAID — pain, arthritis' },
    { name: 'Levocetirizine', composition: 'Levocetirizine 5mg', morning: 0, afternoon: 0, evening: 1, dose: ['2.5mg', '5mg'], tab: 5, description: 'Antihistamine — non-drowsy allergy relief' },
    { name: 'Roxithromycin', composition: 'Roxithromycin 150mg', morning: 1, afternoon: 0, evening: 1, dose: ['150mg', '300mg'], tab: 5, description: 'Macrolide antibiotic — respiratory' },
    { name: 'Aspirin', composition: 'Aspirin 75mg', morning: 1, afternoon: 0, evening: 0, dose: ['75mg', '150mg'], tab: 30, description: 'Anti-platelet — cardiac protection' },
  ];

  const medIds: Record<string, string> = {};
  for (const m of MEDICINES) {
    const med = await db.doctorMedicine.create({
      data: {
        name: m.name,
        morning: m.morning ?? 0,
        afternoon: m.afternoon ?? 0,
        evening: m.evening ?? 0,
        dose: JSON.stringify(m.dose),
        tab: m.tab,
        description: `${m.composition}. ${m.description}`,
        status: 'Active',
        userId: drSharma.id,
        createdById: 'dev-doctor',
      },
    });
    medIds[m.name] = med.id;
  }
  console.log(`  ✓ ${MEDICINES.length} medicines created`);

  // ───────────────────────────────────────────────────────────
  // CATEGORY MASTER (8 categories)
  // ───────────────────────────────────────────────────────────
  console.log('\n📂 Creating category masters...');

  const CATEGORIES = [
    { name: 'Fever', nameEn: 'Fever' },
    { name: 'Pain', nameEn: 'Pain' },
    { name: 'Infection', nameEn: 'Infection' },
    { name: 'Respiratory', nameEn: 'Respiratory' },
    { name: 'GI', nameEn: 'Gastrointestinal' },
    { name: 'Diabetes', nameEn: 'Diabetes' },
    { name: 'Hypertension', nameEn: 'Hypertension' },
    { name: 'Skin', nameEn: 'Skin' },
  ];

  const catIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await db.categoryMaster.create({
      data: {
        name: c.name,
        nameEn: c.nameEn,
        status: 'Active',
        doctorId: drSharma.id,
        createdById: 'dev-doctor',
      },
    });
    catIds[c.name] = cat.id;
  }
  console.log(`  ✓ ${CATEGORIES.length} categories created`);

  // ───────────────────────────────────────────────────────────
  // FINDINGS MASTER + FINDINGS_MEDICINE (8 findings)
  // ───────────────────────────────────────────────────────────
  console.log('\n🩺 Creating findings + medicine links...');

  interface FindingSeed {
    name: string;
    nameEn: string;
    meds: { name: string; morning?: number; evening?: number; tab?: number }[];
  }

  const FINDINGS: FindingSeed[] = [
    { name: 'Viral Fever', nameEn: 'Viral Fever', meds: [
      { name: 'Paracetamol', morning: 1, evening: 1, tab: 5 },
      { name: 'Cetirizine', evening: 1, tab: 5 },
    ]},
    { name: 'UTI', nameEn: 'Urinary Tract Infection', meds: [
      { name: 'Ciprofloxacin', morning: 1, evening: 1, tab: 7 },
      { name: 'Paracetamol', morning: 1, evening: 1, tab: 3 },
    ]},
    { name: 'Acute Bronchitis', nameEn: 'Acute Bronchitis', meds: [
      { name: 'Azithromycin', morning: 1, tab: 5 },
      { name: 'Roxithromycin', morning: 1, evening: 1, tab: 5 },
    ]},
    { name: 'GERD', nameEn: 'Gastroesophageal Reflux Disease', meds: [
      { name: 'Pantoprazole', morning: 1, tab: 14 },
      { name: 'Ranitidine', morning: 1, evening: 1, tab: 14 },
    ]},
    { name: 'Type 2 Diabetes', nameEn: 'Type 2 Diabetes Mellitus', meds: [
      { name: 'Metformin', morning: 1, evening: 1, tab: 30 },
    ]},
    { name: 'Hypertension', nameEn: 'Hypertension', meds: [
      { name: 'Amlodipine', morning: 1, tab: 30 },
    ]},
    { name: 'Migraine', nameEn: 'Migraine', meds: [
      { name: 'Ibuprofen', morning: 1, evening: 1, tab: 5 },
      { name: 'Paracetamol', morning: 1, evening: 1, tab: 5 },
    ]},
    { name: 'Asthma', nameEn: 'Asthma', meds: [
      { name: 'Levocetirizine', evening: 1, tab: 14 },
      { name: 'Azithromycin', morning: 1, tab: 3 },
    ]},
  ];

  for (const f of FINDINGS) {
    const finding = await db.findingsMaster.create({
      data: {
        name: f.name,
        nameEn: f.nameEn,
        status: 'Active',
        doctorId: drSharma.id,
        createdById: 'dev-doctor',
      },
    });
    for (const fm of f.meds) {
      if (!medIds[fm.name]) continue;
      await db.findingsMedicine.create({
        data: {
          findingId: finding.id,
          medicineId: medIds[fm.name],
          morning: fm.morning ?? 0,
          afternoon: 0,
          evening: fm.evening ?? 0,
          tab: fm.tab ?? 0,
          dose: '',
          description: '',
        },
      });
    }
  }
  console.log(`  ✓ ${FINDINGS.length} findings + ${FINDINGS.reduce((n, f) => n + f.meds.length, 0)} findings-medicine links`);

  // ───────────────────────────────────────────────────────────
  // CO MASTER (8 chief complaints) + QUESTIONS + SUGGESTIONS
  // ───────────────────────────────────────────────────────────
  console.log('\n📝 Creating chief complaints + questions + suggestions...');

  interface ComplaintSeed {
    coCode: string;
    coDetail: string;
    coDetailEn: string;
    category: string; // key in catIds
    questions: { q: string; qEn: string; suggestions: { s: string; sEn: string }[] }[];
  }

  const COMPLAINTS: ComplaintSeed[] = [
    {
      coCode: 'CC01', coDetail: 'Headache', coDetailEn: 'Headache', category: 'Pain',
      questions: [
        { q: 'Since when do you have a headache?', qEn: 'Since when do you have a headache?', suggestions: [
          { s: 'Rest in a quiet, dark room', sEn: 'Rest in a quiet, dark room' },
          { s: 'Drink plenty of water', sEn: 'Drink plenty of water' },
        ]},
        { q: 'Is the headache one-sided or all over?', qEn: 'Is the headache one-sided or all over?', suggestions: [
          { s: 'Take Paracetamol 500mg as needed', sEn: 'Take Paracetamol 500mg as needed' },
        ]},
      ],
    },
    {
      coCode: 'CC02', coDetail: 'Fever', coDetailEn: 'Fever', category: 'Fever',
      questions: [
        { q: 'What is your temperature?', qEn: 'What is your temperature?', suggestions: [
          { s: 'Take Paracetamol 500mg for fever', sEn: 'Take Paracetamol 500mg for fever' },
          { s: 'Drink warm fluids', sEn: 'Drink warm fluids' },
        ]},
        { q: 'How many days have you had fever?', qEn: 'How many days have you had fever?', suggestions: [
          { s: 'Complete bed rest for 3 days', sEn: 'Complete bed rest for 3 days' },
        ]},
        { q: 'Any chills or rigors?', qEn: 'Any chills or rigors?', suggestions: [
          { s: 'Monitor temperature every 4 hours', sEn: 'Monitor temperature every 4 hours' },
        ]},
      ],
    },
    {
      coCode: 'CC03', coDetail: 'Cough', coDetailEn: 'Cough', category: 'Respiratory',
      questions: [
        { q: 'Is the cough dry or productive?', qEn: 'Is the cough dry or productive?', suggestions: [
          { s: 'Take warm water with honey', sEn: 'Take warm water with honey' },
        ]},
        { q: 'Is there any blood in sputum?', qEn: 'Is there any blood in sputum?', suggestions: [
          { s: 'Consult doctor immediately', sEn: 'Consult doctor immediately' },
        ]},
      ],
    },
    {
      coCode: 'CC04', coDetail: 'Abdominal Pain', coDetailEn: 'Abdominal Pain', category: 'GI',
      questions: [
        { q: 'Where exactly is the pain?', qEn: 'Where exactly is the pain?', suggestions: [
          { s: 'Avoid spicy food', sEn: 'Avoid spicy food' },
        ]},
        { q: 'Is the pain related to meals?', qEn: 'Is the pain related to meals?', suggestions: [
          { s: 'Eat small, frequent meals', sEn: 'Eat small, frequent meals' },
        ]},
      ],
    },
    {
      coCode: 'CC05', coDetail: 'Chest Pain', coDetailEn: 'Chest Pain', category: 'Pain',
      questions: [
        { q: 'Describe the type of pain', qEn: 'Describe the type of pain', suggestions: [
          { s: 'Seek emergency care if severe', sEn: 'Seek emergency care if severe' },
        ]},
        { q: 'Does pain radiate to arm or jaw?', qEn: 'Does pain radiate to arm or jaw?', suggestions: [
          { s: 'Take Aspirin 75mg immediately', sEn: 'Take Aspirin 75mg immediately' },
        ]},
      ],
    },
    {
      coCode: 'CC06', coDetail: 'Body Pain', coDetailEn: 'Body Pain', category: 'Pain',
      questions: [
        { q: 'Since when do you have body pain?', qEn: 'Since when do you have body pain?', suggestions: [
          { s: 'Take Ibuprofen 400mg', sEn: 'Take Ibuprofen 400mg' },
        ]},
        { q: 'Any associated fever?', qEn: 'Any associated fever?', suggestions: [
          { s: 'Rest and hydrate', sEn: 'Rest and hydrate' },
        ]},
      ],
    },
    {
      coCode: 'CC07', coDetail: 'Sore Throat', coDetailEn: 'Sore Throat', category: 'Respiratory',
      questions: [
        { q: 'Difficulty swallowing?', qEn: 'Difficulty swallowing?', suggestions: [
          { s: 'Gargle with warm salt water', sEn: 'Gargle with warm salt water' },
        ]},
        { q: 'Fever present?', qEn: 'Fever present?', suggestions: [
          { s: 'Take Azithromycin 500mg OD', sEn: 'Take Azithromycin 500mg OD' },
        ]},
      ],
    },
    {
      coCode: 'CC08', coDetail: 'Dizziness', coDetailEn: 'Dizziness', category: 'Pain',
      questions: [
        { q: 'When does dizziness occur?', qEn: 'When does dizziness occur?', suggestions: [
          { s: 'Stand up slowly', sEn: 'Stand up slowly' },
        ]},
        { q: 'Any blackout episodes?', qEn: 'Any blackout episodes?', suggestions: [
          { s: 'Avoid driving', sEn: 'Avoid driving' },
        ]},
      ],
    },
  ];

  let totalQ = 0;
  let totalS = 0;
  for (const c of COMPLAINTS) {
    const co = await db.coMaster.create({
      data: {
        coCode: c.coCode,
        coDetail: c.coDetail,
        coDetailEn: c.coDetailEn,
        categoryId: catIds[c.category] ?? null,
        status: 'Active',
        doctorId: drSharma.id,
        createdById: 'dev-doctor',
      },
    });
    for (const q of c.questions) {
      const qm = await db.questionsMaster.create({
        data: {
          question: q.q,
          questionEn: q.qEn,
          explanation: '',
          coId: co.id,
          status: 'Active',
          doctorId: drSharma.id,
          createdById: 'dev-doctor',
        },
      });
      totalQ++;
      for (const s of q.suggestions) {
        await db.suggestionsMaster.create({
          data: {
            questionId: qm.id,
            suggestions: s.s,
            suggestionsEn: s.sEn,
            status: 'Active',
            doctorId: drSharma.id,
            createdById: 'dev-doctor',
          },
        });
        totalS++;
      }
    }
  }
  console.log(`  ✓ ${COMPLAINTS.length} complaints, ${totalQ} questions, ${totalS} suggestions`);

  // ───────────────────────────────────────────────────────────
  // LABEL MASTER (6 additional measurements)
  // ───────────────────────────────────────────────────────────
  console.log('\n🏷️ Creating label masters...');

  // NOTE: Weight/BP/Temperature/Pulse/SpO2 are NOT here — they are the
  // wizard's 5 common vital fields (duplicating them as labels made the
  // prescription print show them twice). Labels below are ADDITIONAL
  // measurements that print under "Vitals & Measurements".
  const LABELS = [
    { label: 'Respiratory Rate', labelEn: 'Respiratory Rate', unit: '/min' },
    { label: 'RBS', labelEn: 'Random Blood Sugar', unit: 'mg/dL' },
    { label: 'Blood Sugar', labelEn: 'Fasting Blood Sugar', unit: 'mg/dL' },
    { label: 'HbA1c', labelEn: 'Glycated Hemoglobin', unit: '%' },
    { label: 'Height', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'Body Mass Index (BMI)', unit: 'kg/m²' },
  ];

  for (const l of LABELS) {
    await db.labelMaster.create({
      data: {
        label: l.label,
        labelEn: l.labelEn,
        unit: l.unit,
        showUnit: true,
        status: 'Active',
        doctorId: drSharma.id,
        createdById: 'dev-doctor',
      },
    });
  }
  console.log(`  ✓ ${LABELS.length} labels created`);

  // ───────────────────────────────────────────────────────────
  // TABLE TEMPLATE MASTER (3 templates)
  // ───────────────────────────────────────────────────────────
  console.log('\n📋 Creating table templates...');

  await db.tableTemplateMaster.create({
    data: {
      name: 'Systemic Examination',
      rows: 5,
      cols: 2,
      headerLabel: JSON.stringify(['System', 'Findings']),
      colsLabel: JSON.stringify(['CVS', 'RS', 'CNS', 'P/A', 'Locomotor']),
      footerLabel: JSON.stringify([]),
      extraLabel: '',
      status: 'Active',
      doctorId: drSharma.id,
      createdById: 'dev-doctor',
    },
  });

  await db.tableTemplateMaster.create({
    data: {
      name: 'Cardiovascular Exam',
      rows: 4,
      cols: 2,
      headerLabel: JSON.stringify(['Parameter', 'Value']),
      colsLabel: JSON.stringify(['Heart Sound', 'Murmur', 'Pulse', 'JVP']),
      footerLabel: JSON.stringify([]),
      extraLabel: '',
      status: 'Active',
      doctorId: drSharma.id,
      createdById: 'dev-doctor',
    },
  });

  await db.tableTemplateMaster.create({
    data: {
      name: 'Respiratory Exam',
      rows: 4,
      cols: 2,
      headerLabel: JSON.stringify(['Parameter', 'Value']),
      colsLabel: JSON.stringify(['Air Entry', 'Percussion', 'Auscultation', 'Vocal Resonance']),
      footerLabel: JSON.stringify([]),
      extraLabel: '',
      status: 'Active',
      doctorId: drSharma.id,
      createdById: 'dev-doctor',
    },
  });
  console.log('  ✓ 3 table templates created');

  // ───────────────────────────────────────────────────────────
  // POTHER SETTING (prescription print config)
  // ───────────────────────────────────────────────────────────
  console.log('\n⚙️ Creating POtherSetting (prescription print config)...');

  await db.pOtherSetting.create({
    data: {
      doctorId: drSharma.id,
      logo: '',
      time: JSON.stringify({ start: '09:00', end: '13:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }),
      header: 'Sharma Clinic',
      fullHeader: 'Dr. Rajesh Sharma, MBBS, MD\nSharma Clinic, 12 MG Road, Indiranagar, Bengaluru 560038\nPhone: +91 80 2345 6789 | Reg: KMC-2015-MD-98765',
      isFullHeader: true,
      footer: 'Follow-up in 5 days. Take medicines as prescribed. Contact for any adverse reaction.',
      showCoInPrint: true,
      showNextVisit: true,
      printLayout: 'standard',
      createdById: 'dev-doctor',
    },
  });
  console.log('  ✓ POtherSetting created');

  // ───────────────────────────────────────────────────────────
  // LAB TEST MASTER + PARAMETERS (5 tests)
  // ───────────────────────────────────────────────────────────
  console.log('\n🧪 Creating lab test masters + parameters...');

  interface ParamSeed {
    name: string; unit: string;
    maleMin: number; maleMax: number;
    femaleMin: number; femaleMax: number;
    childMin: number; childMax: number;
    sortOrder: number;
  }
  interface TestSeed {
    name: string; shortCode: string; category: string; specimen: string; rate: number; reportDays: number;
    params: ParamSeed[];
  }

  const TESTS: TestSeed[] = [
    {
      name: 'Complete Blood Count', shortCode: 'CBC', category: 'Hematology', specimen: 'Whole Blood (EDTA)', rate: 250, reportDays: 1,
      params: [
        { name: 'Hemoglobin (Hb)', unit: 'g/dL', maleMin: 13.5, maleMax: 17.5, femaleMin: 12.0, femaleMax: 15.5, childMin: 11.0, childMax: 14.0, sortOrder: 1 },
        { name: 'Total WBC Count', unit: '/cmm', maleMin: 4000, maleMax: 11000, femaleMin: 4000, femaleMax: 11000, childMin: 5000, childMax: 15000, sortOrder: 2 },
        { name: 'RBC Count', unit: 'million/cmm', maleMin: 4.7, maleMax: 6.1, femaleMin: 4.2, femaleMax: 5.4, childMin: 4.0, childMax: 5.5, sortOrder: 3 },
        { name: 'Platelet Count', unit: 'lakh/cmm', maleMin: 1.5, maleMax: 4.5, femaleMin: 1.5, femaleMax: 4.5, childMin: 1.5, childMax: 4.5, sortOrder: 4 },
        { name: 'Hematocrit (PCV)', unit: '%', maleMin: 41, maleMax: 53, femaleMin: 36, femaleMax: 46, childMin: 35, childMax: 45, sortOrder: 5 },
      ],
    },
    {
      name: 'Lipid Profile', shortCode: 'LIPID', category: 'Biochemistry', specimen: 'Serum', rate: 600, reportDays: 1,
      params: [
        { name: 'Total Cholesterol', unit: 'mg/dL', maleMin: 125, maleMax: 200, femaleMin: 125, femaleMax: 200, childMin: 120, childMax: 200, sortOrder: 1 },
        { name: 'HDL Cholesterol', unit: 'mg/dL', maleMin: 40, maleMax: 60, femaleMin: 50, femaleMax: 60, childMin: 40, childMax: 60, sortOrder: 2 },
        { name: 'LDL Cholesterol', unit: 'mg/dL', maleMin: 0, maleMax: 130, femaleMin: 0, femaleMax: 130, childMin: 0, childMax: 110, sortOrder: 3 },
        { name: 'Triglycerides', unit: 'mg/dL', maleMin: 0, maleMax: 150, femaleMin: 0, femaleMax: 150, childMin: 0, childMax: 100, sortOrder: 4 },
      ],
    },
    {
      name: 'Liver Function Test', shortCode: 'LFT', category: 'Biochemistry', specimen: 'Serum', rate: 500, reportDays: 1,
      params: [
        { name: 'SGPT (ALT)', unit: 'U/L', maleMin: 10, maleMax: 40, femaleMin: 7, femaleMax: 35, childMin: 5, childMax: 30, sortOrder: 1 },
        { name: 'SGOT (AST)', unit: 'U/L', maleMin: 10, maleMax: 40, femaleMin: 8, femaleMax: 35, childMin: 5, childMax: 30, sortOrder: 2 },
        { name: 'Total Bilirubin', unit: 'mg/dL', maleMin: 0.2, maleMax: 1.2, femaleMin: 0.2, femaleMax: 1.2, childMin: 0.2, childMax: 1.0, sortOrder: 3 },
        { name: 'Alkaline Phosphatase', unit: 'U/L', maleMin: 30, maleMax: 120, femaleMin: 30, femaleMax: 120, childMin: 50, childMax: 380, sortOrder: 4 },
      ],
    },
    {
      name: 'Kidney Function Test', shortCode: 'KFT', category: 'Biochemistry', specimen: 'Serum', rate: 450, reportDays: 1,
      params: [
        { name: 'Urea', unit: 'mg/dL', maleMin: 15, maleMax: 40, femaleMin: 15, femaleMax: 40, childMin: 10, childMax: 40, sortOrder: 1 },
        { name: 'Creatinine', unit: 'mg/dL', maleMin: 0.7, maleMax: 1.3, femaleMin: 0.6, femaleMax: 1.1, childMin: 0.3, childMax: 0.7, sortOrder: 2 },
        { name: 'Uric Acid', unit: 'mg/dL', maleMin: 3.5, maleMax: 7.2, femaleMin: 2.6, femaleMax: 6.0, childMin: 2.0, childMax: 5.5, sortOrder: 3 },
      ],
    },
    {
      name: 'Urine Routine', shortCode: 'URINE', category: 'Pathology', specimen: 'Urine', rate: 150, reportDays: 0,
      params: [
        { name: 'Color', unit: '', maleMin: 0, maleMax: 0, femaleMin: 0, femaleMax: 0, childMin: 0, childMax: 0, sortOrder: 1 },
        { name: 'pH', unit: '', maleMin: 5, maleMax: 8, femaleMin: 5, femaleMax: 8, childMin: 5, childMax: 8, sortOrder: 2 },
        { name: 'Specific Gravity', unit: '', maleMin: 1.005, maleMax: 1.030, femaleMin: 1.005, femaleMax: 1.030, childMin: 1.005, childMax: 1.030, sortOrder: 3 },
        { name: 'Protein', unit: '', maleMin: 0, maleMax: 0, femaleMin: 0, femaleMax: 0, childMin: 0, childMax: 0, sortOrder: 4 },
        { name: 'Sugar', unit: '', maleMin: 0, maleMax: 0, femaleMin: 0, femaleMax: 0, childMin: 0, childMax: 0, sortOrder: 5 },
      ],
    },
  ];

  const labTestIds: Record<string, string> = {};
  for (const t of TESTS) {
    const tm = await db.labTestMaster.create({
      data: {
        hospitalId: cityGeneral.id,
        name: t.name,
        shortCode: t.shortCode,
        category: t.category,
        description: `${t.name} — ${t.specimen}`,
        specimenType: t.specimen,
        reportDays: t.reportDays,
        rate: t.rate,
        status: 'Active',
        sortOrder: 0,
      },
    });
    labTestIds[t.shortCode] = tm.id;
    for (const p of t.params) {
      await db.labTestParameter.create({
        data: {
          testMasterId: tm.id,
          paramName: p.name,
          shortCode: t.shortCode,
          unit: p.unit,
          normalMaleMin: p.maleMin,
          normalMaleMax: p.maleMax,
          normalFemaleMin: p.femaleMin,
          normalFemaleMax: p.femaleMax,
          normalChildMin: p.childMin,
          normalChildMax: p.childMax,
          sortOrder: p.sortOrder,
        },
      });
    }
  }
  console.log(`  ✓ ${TESTS.length} tests, ${TESTS.reduce((n, t) => n + t.params.length, 0)} parameters`);

  // ───────────────────────────────────────────────────────────
  // CHARGE CATEGORIES + CHARGE ITEMS (4 categories)
  // ───────────────────────────────────────────────────────────
  console.log('\n💰 Creating charge categories + items...');

  const chargeCatRoom = await db.chargeCategory.create({
    data: { hospitalId: cityGeneral.id, name: 'Room Rent', description: 'Daily room charges', isTaxable: false, taxPercent: 0, status: 'Active', sortOrder: 1 },
  });
  const chargeCatConsult = await db.chargeCategory.create({
    data: { hospitalId: cityGeneral.id, name: 'Consultation', description: 'Doctor consultation fees', isTaxable: false, taxPercent: 0, status: 'Active', sortOrder: 2 },
  });
  const chargeCatLab = await db.chargeCategory.create({
    data: { hospitalId: cityGeneral.id, name: 'Lab Charges', description: 'Laboratory tests', isTaxable: false, taxPercent: 0, status: 'Active', sortOrder: 3 },
  });
  const chargeCatProc = await db.chargeCategory.create({
    data: { hospitalId: cityGeneral.id, name: 'Procedure Charges', description: 'Surgical & medical procedures', isTaxable: true, taxPercent: 5, status: 'Active', sortOrder: 4 },
  });

  const chargeItems = [
    { cat: chargeCatRoom.id, name: 'General Ward Per Day', shortCode: 'GW-DAY', unitType: 'Per Day', rate: 800, taxable: false },
    { cat: chargeCatRoom.id, name: 'Private Room Per Day', shortCode: 'PR-DAY', unitType: 'Per Day', rate: 2500, taxable: false },
    { cat: chargeCatRoom.id, name: 'ICU Per Day', shortCode: 'ICU-DAY', unitType: 'Per Day', rate: 5000, taxable: false },
    { cat: chargeCatConsult.id, name: 'General Consultation', shortCode: 'CON-GEN', unitType: 'Per Service', rate: 500, taxable: false },
    { cat: chargeCatConsult.id, name: 'Specialist Consultation', shortCode: 'CON-SPC', unitType: 'Per Service', rate: 1000, taxable: false },
    { cat: chargeCatConsult.id, name: 'Follow-up Consultation', shortCode: 'CON-FUP', unitType: 'Per Service', rate: 300, taxable: false },
    { cat: chargeCatLab.id, name: 'CBC', shortCode: 'LAB-CBC', unitType: 'Per Service', rate: 250, taxable: false },
    { cat: chargeCatLab.id, name: 'Lipid Profile', shortCode: 'LAB-LIPID', unitType: 'Per Service', rate: 600, taxable: false },
    { cat: chargeCatLab.id, name: 'Liver Function Test', shortCode: 'LAB-LFT', unitType: 'Per Service', rate: 500, taxable: false },
    { cat: chargeCatLab.id, name: 'Kidney Function Test', shortCode: 'LAB-KFT', unitType: 'Per Service', rate: 450, taxable: false },
    { cat: chargeCatLab.id, name: 'Urine Routine', shortCode: 'LAB-URINE', unitType: 'Per Service', rate: 150, taxable: false },
    { cat: chargeCatProc.id, name: 'Minor Procedure', shortCode: 'PROC-MIN', unitType: 'Per Service', rate: 2500, taxable: true },
    { cat: chargeCatProc.id, name: 'Major Procedure', shortCode: 'PROC-MAJ', unitType: 'Per Service', rate: 15000, taxable: true },
  ];

  for (const ci of chargeItems) {
    await db.chargeItem.create({
      data: {
        categoryId: ci.cat,
        hospitalId: cityGeneral.id,
        name: ci.name,
        shortCode: ci.shortCode,
        unitType: ci.unitType,
        rate: ci.rate,
        isTaxable: ci.taxable,
        taxPercent: ci.taxable ? 5 : 0,
        status: 'Active',
      },
    });
  }
  console.log(`  ✓ 4 categories, ${chargeItems.length} charge items`);

  // ───────────────────────────────────────────────────────────
  // INVENTORY ITEMS (12)
  // ───────────────────────────────────────────────────────────
  console.log('\n📦 Creating inventory items...');

  interface InvSeed {
    name: string; category: string; generic?: string; manufacturer: string; unit: string;
    stock: number; minStock: number; unitPrice: number; sellPrice: number; location: string;
    expiry?: Date;
  }

  const INV_ITEMS: InvSeed[] = [
    { name: 'Normal Saline 500ml', category: 'IV Fluids', generic: 'Sodium Chloride 0.9%', manufacturer: 'Baxter', unit: 'Bottle', stock: 120, minStock: 30, unitPrice: 35, sellPrice: 50, location: 'Store A1', expiry: monthsFromNow(18) },
    { name: 'Ringer Lactate 500ml', category: 'IV Fluids', generic: 'Lactated Ringer Solution', manufacturer: 'Baxter', unit: 'Bottle', stock: 80, minStock: 25, unitPrice: 40, sellPrice: 60, location: 'Store A1', expiry: monthsFromNow(18) },
    { name: 'Dextrose 5% 500ml', category: 'IV Fluids', generic: 'Dextrose 5% in Water', manufacturer: 'Baxter', unit: 'Bottle', stock: 60, minStock: 20, unitPrice: 38, sellPrice: 55, location: 'Store A1', expiry: monthsFromNow(18) },
    { name: 'Amoxicillin 500mg (Strip of 10)', category: 'Antibiotics', generic: 'Amoxicillin', manufacturer: 'Cipla', unit: 'Strip', stock: 200, minStock: 50, unitPrice: 45, sellPrice: 70, location: 'Pharmacy A2', expiry: monthsFromNow(24) },
    { name: 'Ciprofloxacin 500mg (Strip of 10)', category: 'Antibiotics', generic: 'Ciprofloxacin', manufacturer: 'Sun Pharma', unit: 'Strip', stock: 150, minStock: 40, unitPrice: 50, sellPrice: 75, location: 'Pharmacy A2', expiry: monthsFromNow(20) },
    { name: 'Surgical Sutures Vicryl 2-0', category: 'Surgical', generic: 'Polyglactin 910', manufacturer: 'Ethicon', unit: 'Packet', stock: 50, minStock: 15, unitPrice: 120, sellPrice: 180, location: 'OT Store', expiry: monthsFromNow(36) },
    { name: 'Sterile Surgical Gloves (Size 7.5)', category: 'Surgical', generic: 'Latex Powdered', manufacturer: 'Surgeon', unit: 'Pair', stock: 300, minStock: 80, unitPrice: 15, sellPrice: 25, location: 'OT Store', expiry: monthsFromNow(36) },
    { name: 'N95 Masks', category: 'Consumables', generic: 'N95 Respirator', manufacturer: '3M', unit: 'Piece', stock: 500, minStock: 100, unitPrice: 25, sellPrice: 40, location: 'Store B1', expiry: monthsFromNow(36) },
    { name: 'Disposable Syringe 5ml', category: 'Consumables', generic: 'Single-use Syringe', manufacturer: 'Hindustan Syringes', unit: 'Piece', stock: 1000, minStock: 200, unitPrice: 5, sellPrice: 9, location: 'Store B1', expiry: monthsFromNow(60) },
    { name: 'Cotton Roll 100g', category: 'Consumables', generic: 'Absorbent Cotton', manufacturer: 'Creon', unit: 'Roll', stock: 80, minStock: 20, unitPrice: 30, sellPrice: 45, location: 'Store B1', expiry: monthsFromNow(36) },
    { name: 'Crepe Bandage 4 inch', category: 'Consumables', generic: 'Elastic Bandage', manufacturer: 'Universal', unit: 'Roll', stock: 100, minStock: 30, unitPrice: 35, sellPrice: 55, location: 'Store B1', expiry: monthsFromNow(60) },
    { name: 'Dettol Antiseptic Liquid 250ml', category: 'Consumables', generic: 'Chloroxylenol', manufacturer: 'Reckitt', unit: 'Bottle', stock: 60, minStock: 15, unitPrice: 75, sellPrice: 110, location: 'Store B1', expiry: monthsFromNow(36) },
  ];

  for (const it of INV_ITEMS) {
    await db.inventoryItem.create({
      data: {
        hospitalId: cityGeneral.id,
        name: it.name,
        category: it.category,
        genericName: it.generic ?? '',
        manufacturer: it.manufacturer,
        batchNo: '',
        expiryDate: it.expiry ?? null,
        unit: it.unit,
        unitPrice: it.unitPrice,
        sellingPrice: it.sellPrice,
        currentStock: it.stock,
        minStockLevel: it.minStock,
        maxStockLevel: 1000,
        reorderQty: 100,
        hsnCode: '',
        gstPercent: 0,
        storeLocation: it.location,
        status: 'Active',
      },
    });
  }
  console.log(`  ✓ ${INV_ITEMS.length} inventory items created`);

  // ───────────────────────────────────────────────────────────
  // OPERATION THEATER
  // ───────────────────────────────────────────────────────────
  console.log('\n🏥 Creating operation theater...');

  await db.operationTheater.create({
    data: {
      hospitalId: cityGeneral.id,
      name: 'OT 1 — Main',
      otType: 'Major',
      floorNo: 'Floor 2',
      status: 'Available',
    },
  });
  console.log('  ✓ OT 1 — Main created');

  // ───────────────────────────────────────────────────────────
  // BOOKINGS (2 — clinic + hospital OPD)
  // ───────────────────────────────────────────────────────────
  console.log('\n📅 Creating test bookings for Rahul Verma...');

  // Clinic booking with Dr. Sharma — today 10:00 AM
  const clinicBooking = await db.booking.create({
    data: {
      appointmentNo: 'CLINIC-0001',
      doctorId: drSharma.id,
      userId: 'dev-patient',
      state: 'Karnataka',
      city: 'Bengaluru',
      bookingDate: TODAY,
      patientName: 'Rahul Verma',
      disease: 'Fever and body pain for 2 days',
      description: 'Patient complains of mild fever, body ache and headache since 2 days. No cough. No comorbidities.',
      gender: 'Male',
      dateOfBirth: new Date(1990, 4, 15), // 15 May 1990
      age: 35,
      relationWithMe: 'Self',
      bloodGroup: 'B+',
      weight: 70,
      height: 175,
      physicallyChallenged: 'No',
      status: 'Approve',
      timeSlot: '10:00',
      bookingMode: 'InPerson',
      bookingType: 'By Self',
      appointmentCharge: 500,
      tokenNumber: 'SHARMA-001',
      tokenOrder: 1,
    },
  });
  console.log(`  ✓ Clinic booking (id: ${clinicBooking.id}, apptNo: CLINIC-0001, 10:00 AM with Dr. Sharma)`);

  // Hospital OPD booking with Dr. Anita at City General — today 11:30 AM
  const opdBooking = await db.booking.create({
    data: {
      appointmentNo: 'GEN-0001',
      doctorId: drAnita.id,
      userId: 'dev-patient',
      state: 'Karnataka',
      city: 'Bengaluru',
      bookingDate: TODAY,
      patientName: 'Rahul Verma',
      disease: 'Abdominal pain and acidity — OPD review',
      description: 'Patient referred for OPD review of abdominal discomfort and recurrent acidity.',
      gender: 'Male',
      dateOfBirth: new Date(1990, 4, 15),
      age: 35,
      relationWithMe: 'Self',
      bloodGroup: 'B+',
      weight: 70,
      height: 175,
      physicallyChallenged: 'No',
      status: 'Approve',
      timeSlot: '11:30',
      bookingMode: 'InPerson',
      bookingType: 'By Hospital',
      appointmentCharge: 700,
      hospitalId: cityGeneral.id,
      departmentId: deptGenMed.id,
      tokenNumber: 'GEN-001',
      tokenOrder: 1,
    },
  });
  console.log(`  ✓ Hospital OPD booking (id: ${opdBooking.id}, apptNo: GEN-0001, 11:30 AM with Dr. Anita)`);

  // ───────────────────────────────────────────────────────────
  // PRESCRIPTION (for clinic booking)
  // ───────────────────────────────────────────────────────────
  console.log('\n📄 Creating prescription for clinic booking...');

  const prescription = await db.prescription.create({
    data: {
      bookingId: clinicBooking.id,
      doctorId: drSharma.id,
      patientName: 'Rahul Verma',
      patientAge: '35',
      disease: 'Viral Fever',
      weight: '70',
      bp: '120/80',
      temperature: '101.2',
      description: 'Viral fever with body ache. Advised rest and symptomatic treatment. Follow-up if fever persists beyond 3 days.',
      status: 'Active',
      fulfillmentStatus: 'Dispensed',
      nextVisit: daysFromNow(5),
      assistantId: 'dev-assistant',
      packedBy: 'dev-pharmacist',
      packedAt: todayAt(10, 30),
    },
  });

  // PMedicine × 3
  await db.pMedicine.create({
    data: {
      prescriptionId: prescription.id,
      medicine: 'Paracetamol 500mg',
      morning: 1, afternoon: 0, evening: 1,
      tab: 5,
      dose: '500mg',
      description: 'For fever — SOS if temp > 100°F',
      createdById: 'dev-doctor',
    },
  });
  await db.pMedicine.create({
    data: {
      prescriptionId: prescription.id,
      medicine: 'Ibuprofen 400mg',
      morning: 1, afternoon: 0, evening: 1,
      tab: 5,
      dose: '400mg',
      description: 'For body pain — after meals',
      createdById: 'dev-doctor',
    },
  });
  await db.pMedicine.create({
    data: {
      prescriptionId: prescription.id,
      medicine: 'Cetirizine 10mg',
      morning: 0, afternoon: 0, evening: 1,
      tab: 5,
      dose: '10mg',
      description: 'At bedtime — for symptomatic relief',
      createdById: 'dev-doctor',
    },
  });

  // PLabel × 3
  await db.pLabel.create({
    data: {
      prescriptionId: prescription.id,
      label: 'BP', labelEn: 'Blood Pressure',
      value: '120/80', labelUnit: 'mmHg', showUnit: true,
      createdById: 'dev-doctor',
    },
  });
  await db.pLabel.create({
    data: {
      prescriptionId: prescription.id,
      label: 'Temperature', labelEn: 'Temperature',
      value: '101.2', labelUnit: '°F', showUnit: true,
      createdById: 'dev-doctor',
    },
  });
  await db.pLabel.create({
    data: {
      prescriptionId: prescription.id,
      label: 'Pulse', labelEn: 'Pulse Rate',
      value: '88', labelUnit: '/min', showUnit: true,
      createdById: 'dev-doctor',
    },
  });

  // PSuggestion × 2
  await db.pSuggestion.create({
    data: {
      prescriptionId: prescription.id,
      question: 'Take adequate rest and hydrate well',
      questionEn: 'Take adequate rest and hydrate well',
      suggestions: 'Drink at least 3 litres of water daily. Complete bed rest for 2-3 days.',
      suggestionsEn: 'Drink at least 3 litres of water daily. Complete bed rest for 2-3 days.',
      createdById: 'dev-doctor',
    },
  });
  await db.pSuggestion.create({
    data: {
      prescriptionId: prescription.id,
      question: 'Diet advice',
      questionEn: 'Diet advice',
      suggestions: 'Light, easily digestible food. Avoid spicy and oily food. Take warm fluids.',
      suggestionsEn: 'Light, easily digestible food. Avoid spicy and oily food. Take warm fluids.',
      createdById: 'dev-doctor',
    },
  });

  console.log('  ✓ Prescription + 3 medicines + 3 labels + 2 suggestions');

  // ───────────────────────────────────────────────────────────
  // IPD ADMISSION (Rahul Verma in General Ward B1)
  // ───────────────────────────────────────────────────────────
  console.log('\n🛌 Creating IPD admission for Rahul Verma...');

  const admissionBedId = bedIdsGeneral[0]; // B1 of General Ward
  const admission = await db.ipdAdmission.create({
    data: {
      admissionNo: 'IPD-2025-0001',
      hospitalId: cityGeneral.id,
      wardId: generalWard.id,
      bedId: admissionBedId,
      departmentId: deptGenMed.id,
      attendingDoctorId: drAnita.id,
      referringDoctorId: null,
      userId: 'dev-patient',
      // Demographics
      patientName: 'Rahul Verma',
      patientAge: 35,
      patientGender: 'Male',
      patientDob: new Date(1990, 4, 15),
      bloodGroup: 'B+',
      maritalStatus: 'Married',
      occupation: 'Software Engineer',
      education: 'Graduate',
      religion: 'Hindu',
      aadharNo: 'XXXX-XXXX-1234',
      mobileNo: '+91 9876543210',
      idMarks: 'Scar on left forearm',
      fatherName: 'Suresh Verma',
      motherName: 'Lakshmi Verma',
      husbandWifeName: '',
      contactPersonName: 'Suresh Verma',
      contactPersonMobile: '+91 9876543200',
      contactPersonRelation: 'Father',
      address: '42, Jayanagar 4 Block, Bengaluru 560011',
      village: '',
      taluka: 'Bengaluru South',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pinCode: '560011',
      // Medical
      mlcCase: false,
      previousHospitalization: 'None',
      mediClaimDetails: 'Cash',
      initialDiagnosis: 'Acute Gastroenteritis with dehydration — for IV fluids and observation',
      // History
      chiefComplaints: 'Abdominal pain, vomiting and loose stools since 1 day',
      informant: 'Patient himself',
      pastHistory: 'No diabetes, no hypertension, no prior surgery',
      personalHistory: '{}',
      habits: '{"smoking": false, "alcohol": "occasional", "tobacco": false}',
      femaleHistory: '{}',
      drugHistory: 'No regular medications',
      // Examination
      consciousnessLevel: 'Conscious',
      obeyingCommands: true,
      respondingToDPS: true,
      oriented: true,
      speech: 'Normal',
      examinationNotes: 'Mild dehydration. Abdomen soft, mild tenderness in periumbilical region. No guarding/rigidity.',
      generalSigns: '{"pallor": "no", "iceterus": "no", "cyanosis": "no", "edema": "no"}',
      // Status
      admissionDate: TODAY,
      admissionTime: '09:30',
      status: 'Admitted',
      // Billing
      roomRentDays: 1,
      advanceAmount: 5000,
      estimatedBill: 12000,
      paymentStatus: 'Pending',
      admittedBy: 'dev-receptionist',
    },
  });
  console.log(`  ✓ IpdAdmission created (id: ${admission.id}, bed B1 of General Ward, Dr. Anita attending)`);

  // Mark bed B1 as Occupied
  await db.bed.update({
    where: { id: admissionBedId },
    data: { status: 'Occupied' },
  });
  console.log('  ✓ Bed B1 marked as Occupied');

  // ───────────────────────────────────────────────────────────
  // VITAL RECORDS (4 entries — at different times today)
  // ───────────────────────────────────────────────────────────
  console.log('\n💓 Creating vital records...');

  const vitals = [
    { time: todayAt(10, 0), temp: 100.4, pulse: 92, spo2: 97, sys: 122, dia: 80, rr: 18, rbs: 110, urine: 250, input: 500, remarks: 'On admission — mild dehydration' },
    { time: todayAt(12, 0), temp: 99.8, pulse: 88, spo2: 98, sys: 118, dia: 78, rr: 17, rbs: 105, urine: 200, input: 600, remarks: 'After IV fluids' },
    { time: todayAt(14, 0), temp: 99.2, pulse: 84, spo2: 99, sys: 116, dia: 76, rr: 16, rbs: 100, urine: 300, input: 750, remarks: 'Stable' },
    { time: todayAt(16, 0), temp: 98.6, pulse: 80, spo2: 99, sys: 114, dia: 74, rr: 16, rbs: 95, urine: 250, input: 700, remarks: 'Afebrile, comfortable' },
  ];

  for (const v of vitals) {
    await db.vitalRecord.create({
      data: {
        admissionId: admission.id,
        nurseId: nursePriya.id,
        recordedAt: v.time,
        patientStatus: 'Conscious',
        ventilatorOn: false,
        oxygenLiters: 0,
        infusionPump: 'NS 500ml',
        rbs: v.rbs,
        temperature: v.temp,
        pulse: v.pulse,
        spo2: v.spo2,
        bpSystolic: v.sys,
        bpDiastolic: v.dia,
        respiratoryRate: v.rr,
        inputMl: v.input,
        urineMl: v.urine,
        outputMl: v.urine,
        remarks: v.remarks,
      },
    });
  }
  console.log(`  ✓ ${vitals.length} vital records created`);

  // ───────────────────────────────────────────────────────────
  // DOCTOR ORDERS (3)
  // ───────────────────────────────────────────────────────────
  console.log('\n💉 Creating doctor orders...');

  await db.doctorOrder.create({
    data: {
      admissionId: admission.id,
      doctorId: drAnita.id,
      drugName: 'Normal Saline 500ml',
      route: 'IV',
      dose: '500ml',
      frequency: 'STAT',
      scheduledTime: '10:00',
      startDate: TODAY,
      instructions: 'Over 30 minutes',
      isPrn: false,
      isStat: true,
      status: 'Active',
    },
  });

  await db.doctorOrder.create({
    data: {
      admissionId: admission.id,
      doctorId: drAnita.id,
      drugName: 'Ondansetron 4mg',
      route: 'IV',
      dose: '4mg',
      frequency: 'BD',
      scheduledTime: '08:00, 20:00',
      startDate: TODAY,
      instructions: 'For nausea/vomiting',
      isPrn: false,
      isStat: false,
      status: 'Active',
    },
  });

  await db.doctorOrder.create({
    data: {
      admissionId: admission.id,
      doctorId: drAnita.id,
      drugName: 'Pantoprazole 40mg',
      route: 'IV',
      dose: '40mg',
      frequency: 'OD',
      scheduledTime: '08:00',
      startDate: TODAY,
      instructions: 'Before breakfast',
      isPrn: false,
      isStat: false,
      status: 'Active',
    },
  });
  console.log('  ✓ 3 doctor orders created');

  // ───────────────────────────────────────────────────────────
  // SAMPLE COLLECTION + INVESTIGATION REPORT (CBC)
  // ───────────────────────────────────────────────────────────
  console.log('\n🧪 Creating sample collection + investigation report...');

  const sample = await db.sampleCollection.create({
    data: {
      admissionId: admission.id,
      nurseId: nursePriya.id,
      doctorId: drAnita.id,
      testName: 'Complete Blood Count',
      sampleType: 'Blood',
      collectedAt: todayAt(10, 15),
      sentToLabAt: todayAt(10, 30),
      status: 'SentToLab',
      remarks: 'CBC for fever workup',
    },
  });

  await db.investigationReport.create({
    data: {
      admissionId: admission.id,
      sampleCollectionId: sample.id,
      testName: 'Complete Blood Count',
      reportDate: todayAt(12, 0),
      resultData: JSON.stringify({
        'Hemoglobin (Hb)': '14.2',
        'Total WBC Count': '11200',
        'RBC Count': '5.1',
        'Platelet Count': '2.4',
        'Hematocrit (PCV)': '42',
      }),
      normalRange: JSON.stringify({
        'Hemoglobin (Hb)': '13.5-17.5 g/dL',
        'Total WBC Count': '4000-11000 /cmm',
        'RBC Count': '4.7-6.1 million/cmm',
        'Platelet Count': '1.5-4.5 lakh/cmm',
        'Hematocrit (PCV)': '41-53 %',
      }),
      isAbnormal: true,
      reportedBy: 'dev-lab-tech',
      reviewedBy: drAnita.id,
      reviewedAt: todayAt(13, 0),
      remarks: 'WBC count mildly elevated — consistent with infection',
    },
  });
  console.log('  ✓ 1 sample collection + 1 investigation report');

  // ───────────────────────────────────────────────────────────
  // DOCTOR VISIT (1)
  // ───────────────────────────────────────────────────────────
  console.log('\n👨‍⚕️ Creating doctor visit...');

  await db.doctorVisit.create({
    data: {
      admissionId: admission.id,
      doctorId: drAnita.id,
      visitDate: todayAt(11, 0),
      visitTime: '11:00',
      examinationFindings: 'Patient conscious, oriented. Mild dehydration corrected. Abdomen soft, mild tenderness in periumbilical region. Bowel sounds present.',
      currentDiagnosis: 'Acute Gastroenteritis — improving',
      newOrders: JSON.stringify(['Continue IV fluids', 'Repeat CBC if fever spikes']),
      stoppedOrders: JSON.stringify([]),
      advise: 'Continue current management. Oral fluids as tolerated. Monitor urine output.',
      isMobileVisit: false,
    },
  });
  console.log('  ✓ 1 doctor visit created');

  // ───────────────────────────────────────────────────────────
  // SYSTEM SETTINGS (singleton)
  // ───────────────────────────────────────────────────────────
  await db.systemSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      hospitalName: 'City General Hospital',
      hospitalAddress: '45, Hospital Road, Shivajinagar, Bengaluru 560001',
      hospitalPhone: '+91 80 2222 3333',
      hospitalEmail: 'city.hospital@doctorooms.com',
      hospitalGstNo: '29ABCDE1234F1Z5',
      hospitalRegNo: 'KAR-HSP-1995-001',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Asia/Kolkata',
    },
  });

  // ───────────────────────────────────────────────────────────
  // PRESCRIPTION TEMPLATES (Quick Rx for Dr. Sharma)
  // ───────────────────────────────────────────────────────────
  console.log('\n⚡ Creating prescription templates...');
  const commonTemplates = [
    {
      name: 'Viral Fever',
      diagnosis: 'Viral Fever with body ache',
      medicines: [
        { name: 'Tab Paracetamol 650', dose: '1-0-1', duration: '3 days', instructions: 'After food' },
        { name: 'Tab Cetirizine 10', dose: '0-0-1', duration: '5 days', instructions: 'At bedtime' },
        { name: 'Tab Vitamin C 500', dose: '1-1-1', duration: '7 days', instructions: 'After food' },
      ],
      labs: ['CBC', 'ESR'],
      advice: 'Rest, plenty of fluids, avoid cold drinks. Return if fever > 5 days.',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Hypertension Follow-up',
      diagnosis: 'Essential Hypertension — controlled',
      medicines: [
        { name: 'Tab Amlodipine 5', dose: '1-0-0', duration: '30 days', instructions: 'Morning' },
        { name: 'Tab Aspirin 75', dose: '0-1-0', duration: '30 days', instructions: 'After lunch' },
      ],
      labs: ['Lipid Profile', 'Serum Creatinine'],
      advice: 'Low salt diet, regular exercise, check BP weekly.',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Diabetes Follow-up',
      diagnosis: 'Type 2 Diabetes Mellitus',
      medicines: [
        { name: 'Tab Metformin 500', dose: '1-0-1', duration: '30 days', instructions: 'After food' },
        { name: 'Tab Glimepiride 1', dose: '1-0-0', duration: '30 days', instructions: 'Before breakfast' },
      ],
      labs: ['Fasting Blood Sugar', 'HbA1c', 'Lipid Profile'],
      advice: 'Diabetic diet, regular exercise, check blood sugar daily.',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Acute Bronchitis',
      diagnosis: 'Acute Bronchitis',
      medicines: [
        { name: 'Tab Azithromycin 500', dose: '1-0-0', duration: '3 days', instructions: 'Empty stomach' },
        { name: 'Syp Cough Linctus', dose: '2 tsp TDS', duration: '5 days', instructions: '' },
        { name: 'Tab Levocetirizine 5', dose: '0-0-1', duration: '5 days', instructions: 'At bedtime' },
      ],
      labs: ['Chest X-Ray', 'CBC'],
      advice: 'Steam inhalation twice daily, warm fluids, avoid cold air.',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'UTI',
      diagnosis: 'Acute Uncomplicated UTI',
      medicines: [
        { name: 'Tab Nitrofurantoin 100', dose: '1-0-1', duration: '5 days', instructions: 'After food' },
        { name: 'Syp Citralka', dose: '2 tsp TDS', duration: '7 days', instructions: 'In water' },
      ],
      labs: ['Urine Routine', 'Urine Culture'],
      advice: 'Plenty of water, maintain hygiene, return if burning persists.',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'GERD',
      diagnosis: 'Gastroesophageal Reflux Disease',
      medicines: [
        { name: 'Cap Pantoprazole 40', dose: '1-0-0', duration: '14 days', instructions: 'Before breakfast' },
        { name: 'Tab Domperidone 10', dose: '1-0-1', duration: '7 days', instructions: 'Before food' },
      ],
      labs: [],
      advice: 'Avoid spicy food, late meals, alcohol. Eat small frequent meals.',
      followUpDays: 14,
      isCommon: true,
    },
  ];

  for (const t of commonTemplates) {
    await db.prescriptionTemplate.create({
      data: {
        doctorId: drSharma.id,
        name: t.name,
        diagnosis: t.diagnosis,
        medicines: JSON.stringify(t.medicines),
        labs: JSON.stringify(t.labs),
        advice: t.advice,
        followUpDays: t.followUpDays,
        isCommon: t.isCommon,
      },
    });
  }
  console.log(`  ✓ ${commonTemplates.length} prescription templates created`);

  // ───────────────────────────────────────────────────────────
  // DONE
  // ───────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  ✅ SEED COMPLETE');
  console.log('══════════════════════════════════════════════════════════');
  console.log('\nSummary:');
  console.log('  Users: 12 (admin, 3 doctors, 2 receptionists, assistant, pharmacist, hospital, nurse, lab-tech, patient)');
  console.log('  Hospitals: 2 (Sharma Clinic, City General Hospital)');
  console.log('  Departments: 3, DoctorHospital links: 2');
  console.log('  Clinic staff: 1 receptionist, 1 assistant, 1 pharmacist + 1 hospital-mode receptionist (Sunita)');
  console.log('  Hospital staff: 1 nurse, 1 lab technician');
  console.log('  Wards: 3, Beds: 15 (8 General, 4 Private, 3 ICU)');
  console.log('  Lab Tests: 5 with ~21 parameters');
  console.log('  Charge Categories: 4, Charge Items: 13');
  console.log('  Inventory Items: 12, OT: 1');
  console.log('  Doctor Schedule: 6 days × 8 slots');
  console.log('  Doctor Medicines: 16, Categories: 8, Complaints: 8');
  console.log('  Questions: 19, Suggestions: 35, Findings: 8, Labels: 9, Table Templates: 3');
  console.log('  Bookings: 2 (clinic + hospital OPD), Prescription: 1 (3 meds, 3 labels, 2 suggestions)');
  console.log('  IPD Admission: 1 with 4 vitals, 3 orders, 1 sample+report, 1 visit');
  console.log('\n  Dev login (any role): password = "dev123"');
}

// ──────────────────────────────────────────────────────────────
// BOOTSTRAP
// ──────────────────────────────────────────────────────────────

main()
  .catch((err) => {
    console.error('\n❌ SEED FAILED:', err);
    console.error(err.stack);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    console.log('\n🔌 Database disconnected.');
  });
