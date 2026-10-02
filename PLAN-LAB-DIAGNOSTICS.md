# Doctorooms — Lab & Diagnostics Module
# Complete Operations Plan

---

## 📋 ALL ENTITIES (7 new models)

### 1. LabPartner (External Diagnostic Center)
```
LabPartner {
  id              String   @id
  labName         String   // "City Diagnostics"
  ownerId         String   @unique  // User.id (role: lab_technician)
  email           String
  phone           String
  address         String
  city            String
  state           String
  gstNo           String   // GST number
  specialization  String   // "Blood Tests", "Radiology", "Both"
  testsAvailable  String   @default("[]")  // JSON: ["CBC","X-Ray","MRI"]
  commissionDefault Float  @default(10)  // default 10%
  status          String   @default("Active")
  createdBy       String   // User.id (admin or doctor)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### 2. DoctorLabAssociation (Doctor ↔ Lab M:N)
```
DoctorLabAssociation {
  id              String   @id
  doctorId        String   // Doctor.id
  labPartnerId    String   // LabPartner.id
  commissionPercent Float  @default(10)  // per doctor-lab %
  status          String   @default("Active")
  createdAt       DateTime

  @@unique([doctorId, labPartnerId])
}
```

### 3. ExternalTestOrder (Doctor → Lab order)
```
ExternalTestOrder {
  id              String   @id
  doctorId        String   // Doctor.id
  patientId       String   // User.id (patient)
  patientName     String
  patientAge      Int
  patientGender   String
  labPartnerId    String   // LabPartner.id
  bookingId       String?  // optional link to Booking
  prescriptionId  String?  // optional link to Prescription

  testName        String   // "CBC", "MRI Brain", "Chest X-Ray"
  testType        String   // Blood, Radiology, Pathology, Other
  testFee         Float    // ₹500, ₹3000
  commissionPercent Float  // 10%
  commissionAmount Float   // ₹50, ₹300 (auto-calculated)

  status          String   @default("Ordered")
  // Ordered → Accepted → InProgress → Completed → Rejected

  orderedAt       DateTime @default(now())
  acceptedAt      DateTime?
  completedAt     DateTime?
  rejectedReason  String   @default("")

  notes           String   @default("")  // doctor's notes for lab
  createdBy        String   // doctor's User.id
  createdAt       DateTime
  updatedAt       DateTime
}
```

### 4. LabReportUpload (Report file)
```
LabReportUpload {
  id              String   @id
  testOrderId     String   @unique  // 1 report per order
  fileName        String   // "CBC_Rahul_Verma.pdf"
  fileUrl         String   // Cloudinary/local URL
  fileType        String   // "application/pdf", "image/jpeg"
  fileSize        Int      // bytes
  uploadedBy      String   // lab_technician User.id
  uploadedAt      DateTime @default(now())
  remarks         String   @default("")  // lab tech notes
  isAbnormal      Boolean  @default(false)  // lab tech can flag
  // Multiple files? Make this 1:N (one order, multiple report files)
}
```

### 5. LabBilling (Bill + Commission per test)
```
LabBilling {
  id              String   @id
  billNo          String   @unique  // "LAB-BILL-2025-000001"
  testOrderId     String   @unique
  labPartnerId    String
  patientId       String
  doctorId        String

  testFee         Float    // ₹500
  commissionPercent Float  // 10%
  commissionAmount Float  // ₹50 (doctor's commission)
  labRevenue      Float    // ₹450 (lab's revenue = testFee - commission)

  status          String   @default("Generated")
  // Generated → Paid
  paymentMethod   String   @default("")
  paymentDate     DateTime?
  createdAt       DateTime
}
```

### 6. CommissionPayment (Monthly payout to doctor)
```
CommissionPayment {
  id              String   @id
  doctorId        String
  labPartnerId    String
  month           Int      // 1-12
  year            Int
  totalTests      Int
  totalCommission Float    // sum of all commissions
  totalRevenue    Float    // sum of test fees
  status          String   @default("Pending")
  // Pending → Paid
  paidAt          DateTime?
  paidBy          String   // admin User.id
  paymentRef      String   @default("")  // transaction ref
  notes           String   @default("")
  createdAt       DateTime

  @@unique([doctorId, labPartnerId, month, year])
}
```

---

## 📋 ALL OPERATIONS (Who does what)

### A. ADMIN OPERATIONS (10)

| # | Operation | Action | Page |
|---|-----------|--------|------|
| A1 | Create lab partner account | Register lab (name, email, phone, address, GST, specialization) | /dashboard/admin/lab-partners/new |
| A2 | View all lab partners | List with search + filter | /dashboard/admin/lab-partners |
| A3 | Edit lab partner | Update details, commission %, status | /dashboard/admin/lab-partners/[id] |
| A4 | Deactivate lab partner | Status → Inactive | Same page |
| A5 | View all doctor-lab associations | Which doctor → which labs | /dashboard/admin/lab-partners (tab) |
| A6 | Set default commission % | Global default (per lab or per test type) | Settings page |
| A7 | View commission report (ALL) | Doctor × Lab matrix — total tests, revenue, commission | /dashboard/admin/commission-report |
| A8 | Pay commission to doctor | Mark CommissionPayment as Paid | Same report page |
| A9 | View lab billing report | All bills — paid/pending | /dashboard/admin/lab-billing |
| A10 | Generate invoice for lab | Monthly invoice to lab partner | Same billing page |

### B. DOCTOR OPERATIONS (10)

| # | Operation | Action | Page |
|---|-----------|--------|------|
| B1 | Create lab partner account | Doctor creates own associated lab | /dashboard/doctor/lab-partners/new |
| B2 | Add existing lab to associated list | Select from admin-created labs | Same page |
| B3 | View associated labs | Dropdown list | /dashboard/doctor/lab-partners |
| B4 | Remove lab from list | Deactivate association | Same page |
| B5 | Order tests for patient | In prescription wizard → "Order Tests" tab → select test + select lab | 6-step wizard (new tab) |
| B6 | View test order status | Pending/Accepted/Completed | Wizard → "Reports" tab |
| B7 | View/download reports | Click report → view PDF/image | Same Reports tab |
| B8 | View own commission earnings | Per lab, per month, total | /dashboard/doctor/commission |
| B9 | View commission per lab | Breakdown by lab partner | Same commission page |
| B10 | Request commission payout | Request admin to pay | Same page |

### C. LAB PARTNER (lab_technician) OPERATIONS (8)

| # | Operation | Action | Page |
|---|-----------|--------|------|
| C1 | Login to dashboard | lab_technician role login | /login → right side |
| C2 | View incoming test orders | "Dr. Sharma sent you: Rahul Verma — CBC + X-Ray" | /dashboard/lab-technician (existing) + new section |
| C3 | View patient details | Name, age, gender, test requested, doctor notes | Same page |
| C4 | Accept test order | Status → Accepted | Same page button |
| C5 | Upload report | File upload (PDF/JPG/PNG/any) | /dashboard/lab-technician/upload/[orderId] |
| C6 | Flag abnormal | Mark report as abnormal | Same upload page |
| C7 | View own revenue | Total tests, revenue, commission paid | /dashboard/lab-technician/billing |
| C8 | View test history | All tests done, dates, doctors | Same page |

### D. PATIENT OPERATIONS (4)

| # | Operation | Action | Page |
|---|-----------|--------|------|
| D1 | View ordered tests | "Dr. Sharma ordered: CBC, X-Ray" | /dashboard/patient/reports |
| D2 | View/download reports | Click → view PDF/image → download | Same page |
| D3 | View lab bills | Test fee, commission, total | Same page or billing section |
| D4 | Get notification | SMS/WhatsApp: "Report ready" | Automatic |

### E. SYSTEM (Automatic Operations) (7)

| # | Trigger | Action |
|---|---------|--------|
| E1 | Doctor orders test | Lab partner dashboard updates + notification |
| E2 | Lab accepts order | Doctor sees "Accepted" status |
| E3 | Lab uploads report | → Doctor's wizard "Reports" tab updates |
| E4 | Lab uploads report | → Patient dashboard "Reports" section updates |
| E5 | Lab uploads report | → SMS/WhatsApp to patient: "Report ready" |
| E6 | Report uploaded | → LabBilling auto-generated (testFee + commission) |
| E7 | Month ends | → CommissionPayment auto-created (pending) |

---

## 📋 COMPLETE USER JOURNEY

### Journey 1: Doctor registers new lab + orders test

```
Step 1: Doctor login → dashboard
Step 2: Doctor → "Lab Partners" → "Add New Lab"
Step 3: Fill form:
  Lab Name: City Diagnostics
  Owner: Ramesh Patel
  Email: city@diag.com
  Phone: +91 9876543210
  Address: MG Road, Bengaluru
  GST: 29ABCDE1234F1Z5
  Specialization: Blood Tests + X-Ray
  Tests: CBC, LFT, KFT, Chest X-Ray
  Commission %: 10%
Step 4: [Register] → Lab account created → login credentials sent
Step 5: Lab auto-added to doctor's "Associated Labs" dropdown

Step 6: Doctor opens patient's prescription wizard
Step 7: New tab in wizard: "Order Tests"
Step 8: Select tests:
  Test 1: CBC → Lab: [City Diagnostics ▼]  ← dropdown
  Test 2: MRI Brain → Lab: [Apex Radiology ▼]
Step 9: [Send Orders] → orders sent to respective labs
Step 10: Lab gets notification → sees order → accepts → does test → uploads report
Step 11: Doctor's wizard "Reports" tab → report appears
Step 12: Patient dashboard → report appears → SMS sent
Step 13: LabBilling auto-generated: ₹500 test fee, ₹50 commission
Step 14: Doctor's commission dashboard: +₹50 from City Diagnostics
```

### Journey 2: Lab partner receives order + uploads report

```
Step 1: Lab partner login (lab_technician role)
Step 2: Dashboard: "Incoming Orders" section
Step 3: Sees: "Dr. Sharma → Rahul Verma → CBC"
Step 4: Click → patient details:
  Name: Rahul Verma, 35/M
  Test: CBC (Complete Blood Count)
  Doctor notes: "Check for anemia"
  Fee: ₹500, Commission: 10%
Step 5: [Accept Order] → status: Accepted
Step 6: Lab performs CBC test
Step 7: [Upload Report] → select file (PDF)
  → FileName: CBC_Rahul_Verma.pdf
  → Remarks: "Hb: 8.5 (low) — Anemia"
  → Is Abnormal: ✓ (checked)
Step 8: [Submit]
  → System automatically:
    a. Doctor's wizard → report appears
    b. Patient dashboard → report appears
    c. SMS to patient: "CBC report ready"
    d. LabBilling generated: ₹500, ₹50 commission
    e. Doctor commission dashboard: +₹50
Step 9: Lab's billing dashboard: +₹450 revenue (₹500 - ₹50 commission)
```

### Journey 3: Patient returns for follow-up

```
Step 1: Patient comes back → queue → token
Step 2: Doctor "Call Next Patient" → wizard opens
Step 3: Wizard tabs:
  [Complaints] [Vitals] [Tables] [Medicines] [Suggestions] [Reports] [Finish]
                                                    ↑ NEW
Step 4: Click "Reports" tab:
  ┌──────────────────────────────────────────┐
  │  REPORTS — Rahul Verma                    │
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │ CBC Report — ✅ Ready              │  │
  │  │ Lab: City Diagnostics              │  │
  │  │ Date: 15 Aug 2025                  │  │
  │  │ ⚠️ ABNORMAL: Hb 8.5 (low)         │  │
  │  │ [View Report] [Download]           │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │ MRI Brain — ⏳ Pending              │  │
  │  │ Lab: Apex Radiology                 │  │
  │  │ Ordered: 15 Aug 2025                │  │
  │  │ Status: Accepted — In Progress      │  │
  │  └────────────────────────────────────┘  │
  └──────────────────────────────────────────┘

Step 5: Doctor views CBC report → sees Hb 8.5 (anemia)
Step 6: Doctor goes to "Medicines" tab → prescribes iron supplement
Step 7: Doctor "Finish" → prescription saved
Step 8: Patient phone: prescription + CBC report — sab available
```

### Journey 4: Admin views commission report

```
Step 1: Admin login → dashboard
Step 2: "Lab Partners" → "Commission Report"
Step 3: Dashboard:

┌──────────────────────────────────────────────────────────────┐
│  COMMISSION REPORT — August 2025                              │
│                                                              │
│  Filter: [All Labs ▼] [All Doctors ▼] [Month: Aug 2025]    │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              │ City     │ Apex     │ Sun      │ TOTAL    │ │
│  │              │ Diag     │ Radio   │ Diag     │          │ │
│  ├──────────────┼──────────┼──────────┼──────────┼──────────┤ │
│  │ Dr. Sharma   │ 15/₹750  │ 8/₹2400 │ 5/₹400  │ 28/₹3550│ │
│  │ Dr. Anita    │ 22/₹1100 │ 5/₹1500 │ 8/₹640  │ 35/₹3240│ │
│  │ Dr. Suresh   │ 8/₹400   │ 12/₹3600│ 3/₹240  │ 23/₹4240│ │
│  ├──────────────┼──────────┼──────────┼──────────┼──────────┤ │
│  │ TOTAL        │ 45/₹2250 │ 25/₹7500│ 16/₹1280│ 86/₹11030│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Commission Pending:                                         │
│  ├── Dr. Sharma: ₹3,550 [Pay Now]                           │
│  ├── Dr. Anita: ₹3,240 [Pay Now]                            │
│  └── Dr. Suresh: ₹4,240 [Pay Now]                           │
│                                                              │
│  Lab Revenue (Lab's share):                                  │
│  ├── City Diagnostics: ₹2,025 (₹2,250 - ₹225 commission)  │
│  ├── Apex Radiology: ₹6,750 (₹7,500 - ₹750 commission)   │
│  └── Sun Diagnostic: ₹1,152 (₹1,280 - ₹128 commission)    │
│                                                              │
│  [Export PDF] [Export Excel]                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 PAGES TO BUILD (12 new + 3 modify)

| # | Page | Route | Role | Type |
|---|------|-------|------|------|
| 1 | Lab Partners List | /dashboard/admin/lab-partners | Admin | New |
| 2 | Create Lab Partner | /dashboard/admin/lab-partners/new | Admin | New |
| 3 | Edit Lab Partner | /dashboard/admin/lab-partners/[id] | Admin | New |
| 4 | Commission Report | /dashboard/admin/commission-report | Admin | New |
| 5 | Lab Billing Report | /dashboard/admin/lab-billing | Admin | New |
| 6 | My Associated Labs | /dashboard/doctor/lab-partners | Doctor | New |
| 7 | Add Lab Partner | /dashboard/doctor/lab-partners/new | Doctor | New |
| 8 | My Commission | /dashboard/doctor/commission | Doctor | New |
| 9 | Incoming Orders | /dashboard/lab-technician/incoming | Lab Tech | New |
| 10 | Upload Report | /dashboard/lab-technician/upload/[orderId] | Lab Tech | New |
| 11 | Lab Billing | /dashboard/lab-technician/billing | Lab Tech | New |
| 12 | Patient Reports | /dashboard/patient/reports | Patient | New |
| 13 | **Order Tests tab** (in wizard) | Modify 6-step wizard | Doctor | **Modify** |
| 14 | **Reports tab** (in wizard) | Modify 6-step wizard | Doctor | **Modify** |
| 15 | **Lab Tech Dashboard** (add section) | Modify existing | Lab Tech | **Modify** |

---

## 📋 API ROUTES (15 new)

| # | Method | Route | Auth | Purpose |
|---|--------|-------|------|---------|
| 1 | GET, POST | /api/lab-partners | Admin, Doctor | List/Create lab partner |
| 2 | GET, PUT, DELETE | /api/lab-partners/[id] | Admin | CRUD lab partner |
| 3 | GET, POST | /api/doctor-lab-association | Doctor | List/Add associated labs |
| 4 | DELETE | /api/doctor-lab-association/[id] | Doctor | Remove association |
| 5 | GET | /api/doctor-lab-association/my-labs | Doctor | My labs dropdown |
| 6 | POST | /api/external-test-orders | Doctor | Order tests (per test + per lab) |
| 7 | GET | /api/external-test-orders | Doctor, Lab Tech | List orders (role-filtered) |
| 8 | GET | /api/external-test-orders/[id] | Doctor, Lab Tech | Get order detail |
| 9 | POST | /api/external-test-orders/[id]/accept | Lab Tech | Accept order |
| 10 | POST | /api/external-test-orders/[id]/reject | Lab Tech | Reject order |
| 11 | POST | /api/external-test-orders/[id]/upload-report | Lab Tech | Upload report file |
| 12 | GET | /api/external-test-orders/[id]/report | Doctor, Patient | Get report |
| 13 | GET | /api/patient/reports | Patient | List my reports |
| 14 | GET | /api/doctor/commission | Doctor | My commission report |
| 15 | GET | /api/admin/commission-report | Admin | All doctors × all labs |

---

## 📋 SIDEBAR UPDATES

### Admin sidebar — add:
```
{ label: 'Lab Partners', href: '/dashboard/admin/lab-partners', icon: FlaskConical }
{ label: 'Commission Report', href: '/dashboard/admin/commission-report', icon: IndianRupee }
```

### Doctor sidebar — add:
```
{ label: 'Lab Partners', href: '/dashboard/doctor/lab-partners', icon: Building2 }
{ label: 'My Commission', href: '/dashboard/doctor/commission', icon: IndianRupee }
```

### Lab Technician sidebar — add:
```
{ label: 'Incoming Orders', href: '/dashboard/lab-technician/incoming', icon: ClipboardList }
{ label: 'Lab Billing', href: '/dashboard/lab-technician/billing', icon: Receipt }
```

### Patient sidebar — add:
```
{ label: 'My Reports', href: '/dashboard/patient/reports', icon: FileText }
```

---

## 📋 BUILD ORDER (Phases)

### Phase 1: Schema + APIs (Day 1-2)
1. Add 6 models to schema.prisma
2. Add back-relations to User, Doctor, Hospital
3. db push + generate
4. Create all 15 API routes
5. Lint pass

### Phase 2: Admin pages (Day 2-3)
1. Lab Partners list + create + edit
2. Commission report (doctor × lab matrix)
3. Lab billing report
4. Pay commission button

### Phase 3: Doctor pages (Day 3-4)
1. Associated labs list + add new
2. Prescription wizard — "Order Tests" tab
3. Prescription wizard — "Reports" tab
4. My commission dashboard

### Phase 4: Lab Partner pages (Day 4-5)
1. Incoming orders list
2. Order detail + accept/reject
3. Upload report (file upload — PDF/JPG/any)
4. Lab billing dashboard

### Phase 5: Patient pages (Day 5)
1. My Reports — list + view + download
2. Lab bills section

### Phase 6: Wire notifications (Day 6)
1. Test ordered → lab tech notification
2. Report uploaded → doctor + patient notification
3. SMS/WhatsApp to patient
4. Auto-generate LabBilling

### Phase 7: Seed data + test (Day 6-7)
1. Create 3 lab partners (City Diag, Apex Radio, Sun Diag)
2. Associate with doctors
3. Create 10 test orders (various statuses)
4. Upload 5 reports
5. Generate billing + commission
6. Test all flows end-to-end

---

## 📋 FILE UPLOAD STRATEGY

```
Report upload options:
1. Cloudinary (already integrated) — cloud storage, CDN, auto-optimize
2. Local filesystem — /uploads/reports/ directory
3. Supabase Storage — already have Supabase credentials

Recommendation: Use Cloudinary (already configured)
  → Upload file to Cloudinary
  → Get URL
  → Store URL in LabReportUpload.fileUrl
  → Patient/doctor access via URL

Supported formats:
  ✅ PDF (lab reports — typed)
  ✅ JPG/PNG (X-ray, MRI, CT images)
  ✅ DICOM (if radiology sends DICOM)
  ✅ DOC/DOCX (if lab sends Word file)
  ✅ Any format — no restriction
```
