# Doctorooms — Detailed Testing Plan
# Clinic Module + Hospital Module — Real-Life Scenarios

---

## 🏥 CLINIC MODULE — Dr. Sharma's Clinic

### Setup:
```
Doctor: Dr. Rajesh Sharma (MD - General Physician)
Clinic: Sharma Clinic, Indiranagar, Bengaluru
Staff: 1 Receptionist (Meera) + 1 Assistant (Vikram) + 1 Pharmacist (Kavitha)
Daily OPD: 15-20 patients
No IPD, No wards, No lab — sirf OPD + Pharmacy
```

### Patients (15 total — alag-alag scenarios):

#### A. Online Slot Booking wale (5 patients):

| # | Patient Name | Age/Gender | Complaint | Slot | Status Flow |
|---|-------------|-----------|-----------|------|------------|
| 1 | Amit Kumar | 35/M | Fever + body ache | 9:00 AM | Pending → Approve → Visited → Finish |
| 2 | Priya Sharma | 28/F | Migraine | 9:10 AM | Pending → Approve → Visited → Finish |
| 3 | Sneha Patel | 32/F | Skin allergy | 9:20 AM | Pending → Approve → Visited → Finish |
| 4 | Ramesh Chandra | 55/M | Diabetes follow-up | 10:00 AM | Pending → Approve → Visited → Finish |
| 5 | Geeta Verma | 45/F | Thyroid check | 10:30 AM | Pending → Approve → Visited → Finish |

**Testing要点:**
- Patient `/doctors` se Dr. Sharma ko search karega
- Available slots dekhega (9:00, 9:10, 9:20 — 10 min duration)
- 9:00 slot book karega → status: Pending
- Receptionist approve karegi → token: SHARMA-001
- Doctor "Call Next" click → consultation → prescription (template se)
- Patient dashboard pe position dekhega: #1 → "You are next!"

#### B. Walk-in wale (5 patients — no slot):

| # | Patient Name | Age/Gender | Complaint | Token | Status |
|---|-------------|-----------|-----------|-------|--------|
| 6 | Mohammed Khan | 40/M | Cough + cold | SHARMA-006 | Approve (direct queue) |
| 7 | Lakshmi Nair | 50/F | Joint pain | SHARMA-007 | Approve |
| 8 | Karthik Raja | 25/M | Stomach pain | SHARMA-008 | Approve |
| 9 | Sunita Devi | 60/F | BP check | SHARMA-009 | Approve |
| 10 | Sanjay Mehta | 38/M | Back pain | SHARMA-010 | Approve |

**Testing points:**
- Receptionist Express Walk-in se 5 sec mein register
- No slot — direct queue mein
- Token slip print hota hai
- Patient ko SMS jaata hai ( agar MSG91 configured)

#### C. Video Consultation (2 patients):

| # | Patient Name | Age/Gender | Complaint | Slot | Mode |
|---|-------------|-----------|-----------|------|------|
| 11 | Rahul Verma | 35/M | HTN follow-up | 11:00 AM | VideoCall |
| 12 | Pooja Joshi | 30/F | Medicine refill | 11:30 AM | VideoCall |

**Testing:**
- Online book with bookingMode: VideoCall
- Video call link generate
- Doctor dashboard se video call start
- Prescription update during/after call

#### D. Follow-up Patients (3 — purane patients):

| # | Patient Name | Age/Gender | Complaint | History |
|---|-------------|-----------|-----------|---------|
| 13 | Manish Agarwal | 48/M | DM follow-up | Last visit: 15 days ago, Metformin 500 |
| 14 | Fatima Sheikh | 52/F | HTN follow-up | Last visit: 1 month ago, Amlodipine 5 |
| 15 | Rohit Deshpande | 42/M | Asthma review | Last visit: 2 months ago, Foracort inhaler |

**Testing:**
- Mobile number type karte hi auto-detect
- Patient history auto-load (last visit, active meds, allergies)
- Doctor ko puri history dikhe
- Template apply: "Diabetes Follow-up" / "Hypertension Follow-up"

#### E. No-Show Patients (2 — booked but didn't come):

| # | Patient Name | Slot | Action |
|---|-------------|------|--------|
| 16 | Kavya Rao | 9:30 AM | Booked → didn't come → Cancel |
| 17 | Prakash Malhotra | 12:00 PM | Booked → didn't come → Cancel |

**Testing:**
- Receptionist "Cancel" mark karegi
- Slot wapas available ho jayega
- Next patient us slot mein adjust ho jayega

### Clinic Prescriptions (10):

| # | Patient | Template | Medicines | Status |
|---|---------|----------|-----------|--------|
| 1 | Amit Kumar | Viral Fever | Paracetamol + Cetirizine + Vit C | Active |
| 2 | Priya Sharma | Migraine | Naxdom + Domperidone | Active |
| 3 | Sneha Patel | (Custom) | Cetrizine + Calamine lotion | Active |
| 4 | Ramesh Chandra | Diabetes Follow-up | Metformin + Glimepiride | Active |
| 5 | Geeta Verma | (Custom) | Thyronorm 50mcg | Active |
| 6 | Mohammed Khan | Acute Bronchitis | Azithromycin + Cough syrup | Active |
| 7 | Lakshmi Nair | (Custom) | Diclofenac + Calcium | Active |
| 8 | Rahul Verma | HTN Follow-up | Amlodipine + Aspirin | Active |
| 9 | Manish Agarwal | Diabetes Follow-up | Metformin + Glimepiride | Active |
| 10 | Fatima Sheikh | HTN Follow-up | Amlodipine + Aspirin | Active |

### Clinic Pharmacy Fulfillment:

| # | Prescription | Patient | Status |
|---|-------------|---------|--------|
| 1 | Rx #1 | Amit Kumar | Dispensed |
| 2 | Rx #2 | Priya Sharma | Dispensed |
| 3 | Rx #3 | Sneha Patel | Packed |
| 4 | Rx #4 | Ramesh Chandra | Packed |
| 5 | Rx #5 | Geeta Verma | Pending |
| 6 | Rx #6 | Mohammed Khan | Pending |

### Clinic Testing Flow (Step-by-step):

```
1. Patient dashboard se:
   → Appointment book karo (slot select)
   → Express walk-in se register karo
   → Queue position dekho (#3 → #2 → #1 → "You are next!")
   
2. Receptionist dashboard se:
   → 5 pending bookings approve karo
   → Express walk-in se 5 patients register karo
   → 2 no-show cancel karo
   → Print token slip
   
3. Doctor dashboard se:
   → "Call Next Patient (SHARMA-001)" click
   → Patient history dekho
   → Template apply karo: "Viral Fever"
   → Prescription save → patient ko notification
   → Next patient call karo
   
4. Assistant dashboard se:
   → Prescription queue dekho
   → Patient reports dekho
   
5. Pharmacist dashboard se:
   → 6 prescriptions aayi
   → 2 pack karo → 2 dispense karo → 2 pending
   → Medicine inventory check karo
   
6. Patient exit:
   → Prescription dekho online
   → Next appointment reminder
   → Doctor rating do
```

---

## 🏥 HOSPITAL MODULE — City General Hospital

### Setup:
```
Hospital: City General Hospital, Shivajinagar, Bengaluru
Departments: General Medicine, Cardiology, Orthopedics, Nephrology, Neurology
Doctors: 4 (different specializations)
Wards: General (8 beds), Private (4 beds), ICU (3 beds)
Staff: Receptionist, 1 Nurse, 1 Lab Tech, Pharmacists
Beds: 15 total
```

### Doctors (4 — alag-alag specialization):

| # | Doctor Name | Specialization | Dept | OPD Days | Slot Duration | Fees |
|---|------------|---------------|------|----------|--------------|------|
| 1 | Dr. Anita Desai | General Medicine | GEN | Mon-Sat 9-1 | 15 min | ₹700 |
| 2 | Dr. Suresh Iyer | Cardiology | CAR | Mon-Wed-Fri 10-2 | 20 min | ₹1000 |
| 3 | Dr. Arjun Reddy | Orthopedics | ORT | Tue-Thu-Sat 11-3 | 15 min | ₹800 |
| 4 | Dr. Priya Nair | Nephrology | NEP | Mon-Thu 9-12 | 20 min | ₹1200 |

### Departments (5):

| # | Department | ShortCode | Floor | OPD Room | Doctor Count |
|---|-----------|-----------|-------|----------|-------------|
| 1 | General Medicine | GEN | Ground Floor | OPD-101 | 1 (Dr. Anita) |
| 2 | Cardiology | CAR | Floor 2 | OPD-305 | 1 (Dr. Suresh) |
| 3 | Orthopedics | ORT | Floor 1 | OPD-203 | 1 (Dr. Arjun) |
| 4 | Nephrology | NEP | Floor 3 | OPD-401 | 1 (Dr. Priya) |
| 5 | Neurology | NEU | Floor 3 | OPD-402 | 0 (vacant — add later) |

### Hospital Patients (30 — department-wise):

#### Cardiology Patients (10):

| # | Patient | Age/Gender | Complaint | Booking Type | Token | Status |
|---|---------|-----------|-----------|-------------|-------|--------|
| 1 | Rajesh Gupta | 55/M | Chest pain | Online slot | CAR-001 | Finish |
| 2 | Meena Iyer | 62/F | Palpitation | Walk-in | CAR-002 | Visited |
| 3 | Vinod Kumar | 48/M | BP check | Kiosk | CAR-003 | Approve |
| 4 | Sarita Jain | 58/F | Post-MI follow-up | Online | CAR-004 | Approve |
| 5 | Deepak Singh | 45/M | Breathlessness | Walk-in | CAR-005 | Approve |
| 6 | Anjali Rao | 50/F | Swelling legs | Online | CAR-006 | Pending |
| 7 | Mohan Das | 65/M | Chest pain | Kiosk | CAR-007 | Pending |
| 8 | Kavya Reddy | 35/F | Heart murmur | Online | CAR-008 | Pending |
| 9 | Prakash Jain | 70/M | Syncope | Walk-in | CAR-009 | Canceled |
| 10 | Sumitra Kale | 60/F | HTN review | Online | CAR-010 | Finish |

#### General Medicine Patients (10):

| # | Patient | Age/Gender | Complaint | Booking Type | Token | Status |
|---|---------|-----------|-----------|-------------|-------|--------|
| 11 | Amit Kumar | 35/M | Fever | Online | GEN-001 | Finish |
| 12 | Priya Sharma | 28/F | UTI | Walk-in | GEN-002 | Visited |
| 13 | Vikram Singh | 40/M | Gastritis | Kiosk | GEN-003 | Approve |
| 14 | Nisha Bhat | 32/F | Thyroid | Online | GEN-004 | Approve |
| 15 | Suresh Yadav | 50/M | Diabetes | Walk-in | GEN-005 | Approve |
| 16 | Arjun Nair | 25/M | Viral fever | Kiosk | GEN-006 | Pending |
| 17 | Pooja Mehta | 30/F | Pregnancy check | Online | GEN-007 | Pending |
| 18 | Ravi Kumar | 45/M | Jaundice | Walk-in | GEN-008 | Pending |
| 19 | Sita Devi | 55/F | Arthritis | Online | GEN-009 | Canceled |
| 20 | John Dsouza | 38/M | Dengue | Kiosk | GEN-010 | Finish |

#### Orthopedics Patients (5):

| # | Patient | Age/Gender | Complaint | Booking Type | Token | Status |
|---|---------|-----------|-----------|-------------|-------|--------|
| 21 | Arjun Reddy Jr | 50/M | Knee pain | Online | ORT-001 | Visited |
| 22 | Lakshmi Rao | 45/F | Back pain | Walk-in | ORT-002 | Approve |
| 23 | Kartik Raja | 30/M | Fracture arm | Kiosk | ORT-003 | Pending |
| 24 | Meena Iyer | 60/F | Hip pain | Online | ORT-004 | Pending |
| 25 | Sanjay Mehta | 42/M | Shoulder injury | Walk-in | ORT-005 | Finish |

#### Nephrology Patients (5):

| # | Patient | Age/Gender | Complaint | Booking Type | Token | Status |
|---|---------|-----------|-----------|-------------|-------|--------|
| 26 | Ramesh Chandra | 55/M | CKD stage 3 | Online | NEP-001 | Visited |
| 27 | Fatima Sheikh | 48/F | Kidney stones | Walk-in | NEP-002 | Approve |
| 28 | Nisha Bhat | 35/F | Recurrent UTI | Kiosk | NEP-003 | Pending |
| 29 | Vikram Rathore | 60/M | Dialysis review | Online | NEP-004 | Pending |
| 30 | Geeta Verma | 50/F | Proteinuria | Walk-in | NEP-005 | Finish |

### IPD Admissions (5):

| # | Patient | Age/Gender | Doctor | Ward | Bed | Diagnosis | Insurance | Status |
|---|---------|-----------|--------|------|-----|-----------|-----------|--------|
| 1 | Rahul Verma | 35/M | Dr. Anita | General Ward | B1 | Acute Gastro | Star Health ₹5L | Admitted |
| 2 | Sunita Devi | 60/F | Dr. Suresh | ICU | I1 | Acute MI | HDFC ERGO ₹10L | Admitted |
| 3 | Arjun Nair | 50/M | Dr. Arjun | Private Room | P1 | Fracture Femur | ICICI ₹3L | Admitted |
| 4 | Ramesh Chandra | 55/M | Dr. Priya | General Ward | B3 | CKD Stage 4 | Cash | Admitted |
| 5 | Meena Iyer | 62/F | Dr. Suresh | Private Room | P2 | Unstable Angina | Bajaj ₹5L | Discharged |

### IPD Vitals (15 — 3 per admission):

| Admission | Time | Temp | BP | Pulse | SpO2 | Alert? |
|-----------|------|------|-----|-------|------|--------|
| Rahul (B1) | 10 AM | 98.6 | 120/80 | 72 | 98% | Normal |
| Rahul (B1) | 12 PM | 99.1 | 118/78 | 75 | 97% | Normal |
| Rahul (B1) | 2 PM | 98.4 | 122/82 | 70 | 99% | Normal |
| Sunita (I1) | 10 AM | 98.0 | 160/100 | 92 | 88% | 🔴 CRITICAL SpO2 |
| Sunita (I1) | 12 PM | 98.2 | 150/95 | 88 | 92% | ⚠️ Warning |
| Sunita (I1) | 2 PM | 98.0 | 145/90 | 85 | 94% | ⚠️ Warning |
| Arjun (P1) | 11 AM | 98.6 | 130/85 | 78 | 97% | Normal |
| Arjun (P1) | 1 PM | 98.8 | 128/82 | 76 | 98% | Normal |
| Arjun (P1) | 3 PM | 98.4 | 125/80 | 74 | 99% | Normal |
| Ramesh (B3) | 9 AM | 97.8 | 140/90 | 80 | 96% | Normal |
| Ramesh (B3) | 11 AM | 98.0 | 138/88 | 78 | 97% | Normal |
| Ramesh (B3) | 1 PM | 98.2 | 135/85 | 76 | 98% | Normal |
| Meena (P2) | 9 AM | 98.4 | 155/95 | 90 | 95% | Normal |
| Meena (P2) | 11 AM | 98.6 | 148/90 | 85 | 96% | Normal |
| Meena (P2) | 1 PM | 98.4 | 140/85 | 80 | 97% | Normal |

### Lab Reports (10 — different tests + abnormal results):

| # | Patient | Test | Result | Status | Abnormal? |
|---|---------|------|--------|--------|-----------|
| 1 | Rahul Verma | CBC | Hb: 14.2, WBC: 6800 | Verified | Normal |
| 2 | Sunita Devi | Troponin I | 0.8 ng/mL | Verified | 🔴 Abnormal (high) |
| 3 | Sunita Devi | Lipid Profile | LDL: 165 | Verified | ⚠️ Abnormal |
| 4 | Arjun Nair | X-Ray | Fracture femur | Verified | Abnormal |
| 5 | Ramesh Chandra | KFT | Creatinine: 3.2 | Verified | 🔴 Abnormal |
| 6 | Meena Iyer | ECG | ST depression | Verified | ⚠️ Abnormal |
| 7 | Amit Kumar | CBC | Hb: 13.5 | ResultEntered | Normal |
| 8 | Priya Sharma | Urine Routine | Pus cells: 15-20 | ResultEntered | ⚠️ Abnormal |
| 9 | Suresh Yadav | HbA1c | 7.8% | ResultEntered | ⚠️ Abnormal |
| 10 | Vinod Kumar | ECG | Normal sinus | Verified | Normal |

### OT Schedules (3):

| # | Patient | Surgery | Doctor | OT | Date | Duration | Status |
|---|---------|---------|--------|-----|------|----------|--------|
| 1 | Arjun Nair | ORIF Femur | Dr. Arjun | OT-1 | Tomorrow | 120 min | Scheduled |
| 2 | Sunita Devi | Angiography | Dr. Suresh | OT-1 | Day after | 90 min | Scheduled |
| 3 | Meena Iyer | Stent placement | Dr. Suresh | OT-1 | Completed | 60 min | Completed |

### IPD Bills (5):

| # | Patient | Room Rent | Consultation | Lab | Medicine | Total | Insurance | Patient Pay | Status |
|---|---------|-----------|-------------|-----|----------|-------|-----------|-------------|--------|
| 1 | Rahul | 15,000 | 2,000 | 3,000 | 2,000 | 22,000 | 19,800 (90%) | 2,200 | Paid |
| 2 | Sunita | 45,000 | 5,000 | 8,000 | 5,000 | 63,000 | 56,700 (90%) | 6,300 | Pending |
| 3 | Arjun | 20,000 | 8,000 | 2,000 | 3,000 | 33,000 | 29,700 (90%) | 3,300 | Draft |
| 4 | Ramesh | 15,000 | 3,000 | 5,000 | 2,000 | 25,000 | 0 (Cash) | 25,000 | Paid |
| 5 | Meena | 20,000 | 5,000 | 3,000 | 2,000 | 30,000 | 27,000 (90%) | 3,000 | Paid |

### Insurance Claims (3):

| # | Patient | Claim No | Amount | TPA | Status |
|---|---------|---------|--------|-----|--------|
| 1 | Rahul | CLM-001 | 19,800 | Medi Assist | Approved |
| 2 | Sunita | CLM-002 | 56,700 | Medi Assist | Submitted |
| 3 | Arjun | CLM-003 | 29,700 | Vidal Health | UnderReview |

### Kiosk Requests (5 — pending for receptionist):

| # | Patient | Dept | Doctor | Complaint | Status |
|---|---------|------|--------|-----------|--------|
| 1 | Demo Kiosk Patient | GEN | Dr. Anita | Fever | Pending |
| 2 | New Kiosk Patient 1 | CAR | Dr. Suresh | Chest pain | Pending |
| 3 | New Kiosk Patient 2 | ORT | Dr. Arjun | Knee pain | Pending |
| 4 | New Kiosk Patient 3 | NEP | Dr. Priya | Swelling | Pending |
| 5 | New Kiosk Patient 4 | GEN | Dr. Anita | Headache | Pending |

### Hospital Testing Flow (Step-by-step):

```
1. Kiosk Testing:
   → /kiosk/[hospitalId] open karo
   → 5 patients self-register karo (alag-alag dept + doctor)
   → 5 requests receptionist pending list mein aayengi
   
2. Receptionist Testing:
   → 5 kiosk requests approve karo
   → 5 express walk-in patients register karo
   → 3 IPD admissions karo (bed assign, insurance)
   → 2 bills generate karo
   → Queue dekho (per-doctor, per-department)
   
3. Doctor Testing (Dr. Anita — General Medicine):
   → "Call Next Patient (GEN-001)" click
   → Patient history dekho
   → Template: "Viral Fever" apply → 10 sec mein prescription
   → Next patient call → Repeat
   → IPD patient (Rahul Verma) ke vitals dekho
   → Lab results review → diagnosis update
   
4. Doctor Testing (Dr. Suresh — Cardiology):
   → ICU patient (Sunita Devi) — CRITICAL SpO2 88%
   → AI alert dekho → doctor ko notification
   → Doctor order: Oxygen + IV fluids
   → OT schedule dekho (Angiography tomorrow)
   
5. Nurse Testing:
   → Ward view: 5 admitted patients
   → Vitals record karo (3 per patient)
   → 1 critical alert (Sunita — SpO2 88%)
   → Medicine administration: 2 Given, 1 Missed
   → Shift handover: Morning → Evening
   
6. Lab Tech Testing:
   → Worklist: 10 tests
   → 3 collect sample
   → 5 enter results (2 abnormal)
   → 2 verify
   → Doctor ko notification: results ready
   
7. Hospital Admin Testing:
   → Revenue dashboard: ₹4,52,500 today
   → Doctor performance: top 5
   → Department load: cardiology overloaded
   → Expenses: 10 (approve 2 pending)
   → Insurance: 3 claims (1 approved, 1 submitted, 1 review)
   → OT: 3 schedules
   
8. Patient Testing:
   → Appointment book karo (online + slot)
   → Queue position dekho (#4 → #3 → #2 → #1)
   → Prescription dekho (medicines, advice)
   → Bill dekho + pay karo (Razorpay test)
   → Lab report dekho (abnormal highlighted)
   → Insurance claim status dekho
   → Doctor rating do (5 stars)
```

---

## 📊 TESTING CHECKLIST — Har Role Kya Test Karega

### Clinic Module (8 tests):

| # | Test | Role | Expected Result |
|---|------|------|-----------------|
| 1 | Online slot book karo | Patient | Booking Pending → token assigned at approval |
| 2 | Express walk-in register | Receptionist | 5 sec → token print → queue mein |
| 3 | Pending booking approve | Receptionist | Token assigned → patient notified |
| 4 | Call Next Patient | Doctor | Patient status → Visited → queue updates |
| 5 | Prescription (template) | Doctor | 1-click → medicines auto-fill → 10 sec |
| 6 | Pharmacy fulfillment | Pharmacist | Pending → Packed → Dispensed |
| 7 | No-show cancel | Receptionist | Booking Canceled → slot free |
| 8 | Patient history | Doctor | Mobile type → auto-detect → history loads |

### Hospital Module (15 tests):

| # | Test | Role | Expected Result |
|---|------|------|-----------------|
| 1 | QR kiosk self-check-in | Patient | 5 steps → request → receptionist pending |
| 2 | Kiosk request approve | Receptionist | Token assigned → SMS to patient |
| 3 | Express walk-in | Receptionist | Auto-assign doctor → token → print |
| 4 | IPD admission | Receptionist | Bed assigned → insurance → pre-auth |
| 5 | Call Next Patient | Doctor | Token → Visited → queue position updates |
| 6 | Critical vital alert | Nurse | SpO2 < 90% → red alert → doctor notified |
| 7 | Lab test → result | Lab Tech | Sample → result → abnormal flagged → doctor notified |
| 8 | OT schedule | Doctor/Hospital | Surgery scheduled → patient → OT assigned |
| 9 | IPD bill generate | Receptionist | Room rent + services + lab → total → insurance split |
| 10 | Insurance claim submit | Hospital | Claim filed → TPA → settlement tracking |
| 11 | Online payment | Patient | Razorpay → bill → Paid status |
| 12 | Revenue dashboard | Hospital Admin | Real-time revenue + doctor performance |
| 13 | Expense approve | Hospital Admin | Pending → Approved → Paid |
| 14 | Shift handover | Nurse | Summary → pending tasks → next nurse |
| 15 | Discharge | Receptionist | Bill final → bed free → discharge summary → WhatsApp |

---

## 📁 DATA SUMMARY

### Clinic Module Data:
```
15 patients (5 online slot + 5 walk-in + 2 video + 3 follow-up + 2 no-show)
10 prescriptions (6 from template, 4 custom)
6 pharmacy fulfillments (2 dispensed + 2 packed + 2 pending)
5 doctor ratings
16 medicines in inventory
```

### Hospital Module Data:
```
4 doctors (4 specializations: Gen Med, Cardiology, Ortho, Nephro)
5 departments (Gen Med, Cardio, Ortho, Nephro, Neuro)
30 OPD patients (10 per major dept, 5 per minor)
5 IPD admissions (General 2 + Private 2 + ICU 1)
15 vitals (3 per admission, 1 critical)
10 lab reports (5 normal, 3 abnormal, 2 pending)
3 OT schedules (1 scheduled, 1 completed, 1 tomorrow)
5 IPD bills (3 paid, 1 pending, 1 draft)
3 insurance claims (1 approved, 1 submitted, 1 review)
10 OPD bills (all paid)
10 expenses (mix of statuses)
5 kiosk requests (pending)
```
