---
Task ID: pe-phase2a-prescription-labreport
Agent: full-stack-developer
Task: Build prescription + lab report print templates

Work Log:
- Read /home/z/my-project/worklog.md for prior context — confirmed pe-phase1 delivered the print foundation (PrintLayout/InfoGrid/SectionTitle/Signatures server component, PrintOnMount client auto-trigger, print-utils formatters, /print route group + print.css). Confirmed lab-phase1 + lab-phase2-admin + lab-phase4-labtech built the lab module whose data we print (ExternalTestOrder, LabReportUpload, LabBilling, DoctorLabAssociation models + 15 API routes).
- Re-read src/components/print/print-layout.tsx, src/components/print/print-on-mount.tsx, src/lib/print-utils.ts, src/app/print/layout.tsx, src/styles/print.css to understand the building blocks and constraints (PrintLayout's Signatures takes plain `string` left/right props — no multi-line support, so doctor details are joined with ' • ' separators).
- Read prisma/schema.prisma for Prescription (id/bookingId/patientName/patientAge/disease/weight/bp/temperature/description/nextVisit/createdAt + relations: booking, doctor, assistant (User? directly, not wrapped), medicines (PMedicine[]), labels (PLabel[]), suggestions (PSuggestion[])). PMedicine fields confirmed: morning/afternoon/evening/tab/dose/description — NO `night` field (deviated from spec, see below). Doctor model confirmed: has hospitalId + hospitalLinks but NO direct `hospital` relation — must fetch hospital separately via db.hospital.findUnique. POtherSetting has `logo`.
- Read prisma/schema.prisma for LabPartner (labName/ownerName/email/mobile/altMobile/address/state/city/pincode/gstNo/registrationNo/userId), ExternalTestOrder (orderNo/doctorId/patientId/labPartnerId/bookingId/testName/testType/testFee/status/urgency/orderedAt/completedAt/notes + relations: doctor/patient/labPartner/booking/reportUploads/billing), LabReportUpload (externalTestOrderId/labPartnerId/fileUrl/fileName/fileType/fileSize/reportData(JSON string)/uploadedAt/uploadedBy/verifiedByDoctor/verifiedAt/notes), LabBilling (amount/commissionAmount/commissionPercent/paymentStatus/paidAt).
- Read src/scripts/seed-lab-data.ts to confirm the reportData JSON shape: `{ param, value, unit, normal, abnormal }[]`. Built the parameters table accordingly with defensive parsing.
- Read src/app/api/prescription/[id]/print/route.ts to learn the established authorization pattern (doctor who owns it / patient who owns the booking / admin) and the medicine dose-parsing pattern (dose may be JSON array string, pick first item).
- Read src/app/api/external-test-orders/[id]/route.ts to learn the lab order authorization pattern (doctor who ordered / patient who owns / lab tech who owns the partner / admin) and the DoctorLabAssociation lookup for commission %.

## Files created

### 1. `src/app/print/prescription/[id]/page.tsx` — Printable Prescription
- Server component (no 'use client'), async, awaits `params: Promise<{ id: string }>`.
- Auth via `cookies()` from `next/headers` — reads `doctorooms_session` cookie, looks up `db.user.findUnique`, checks `status === 'Active'`. (Per task's "CRITICAL auth note", avoided getAuthUser which needs a NextRequest.)
- Fetch: `db.prescription.findUnique({ where: { id }, include: { booking: true, doctor: { include: { user: { select: {id,name,email,mobileNo,phoneNo} }, otherSettings: true } }, medicines: { orderBy: createdAt asc }, labels: { orderBy: createdAt asc }, suggestions: { orderBy: createdAt asc }, assistant: { select: {id,name,mobileNo} } } })`.
- Authorization: admin OR prescription.doctor.userId === user.id OR prescription.booking.userId === user.id. Else returns AuthError card.
- Doctor's hospital fetched separately via `db.hospital.findUnique({ where: { id: prescription.doctor.hospitalId } })` because the Doctor model has `hospitalId` but no direct `hospital` relation (only `hospitalLinks` M:N).
- Letterhead: name = hospital.hospitalName || `Dr. ${docUser.name}`; subtitle = specialization • education; address = hospital.address || doctor.hospitalAddress || doctor.address + city/state + pincode; contact = hospital.contactNo || doctor.phoneNo || user.mobileNo • hospital.email • website; logoUrl = otherSettings.logo || hospital.image; registrationNo = doctor.registrationDetail.
- Patient info grid (InfoGrid): Name, Age, Gender, Blood Group, Weight, BP, Temperature, Appointment Date, Time Slot.
- Clinical Notes section: prescription.disease (Complaint/Disease) + prescription.description (Clinical Notes).
- Vitals & Investigation Labels table: Label | Value | Unit — renders prescription.labels (uses labelEn || label, value, labelUnit when showUnit).
- Medicines (℞) table: S.No | Medicine | Morning | Afternoon | Evening | Tab | Dose | Notes. Dose parsed defensively (if JSON array string, take first item; else use as-is). DEVIATION: spec said "Morning | Afternoon | Evening | Night" but schema has no `night` field — used the 3 schema timing slots + Tab + Dose + Notes. Noted in worklog.
- Advice / Suggestions: ordered list, each item = question (bold) + suggestions (slate).
- Follow-up: prescription.nextVisit formatted with formatDate.
- Assistant attribution line if prescription.assistant exists.
- Signatures: left = "Patient / Attendant", right = `Dr. ${name} • ${specialization} • Reg: ${registrationDetail}` (joined with bullets because Signatures component takes a plain string and doesn't render newlines).

### 2. `src/app/print/lab-report/[id]/page.tsx` — Printable Lab Report
- Server component (no 'use client'), async. Route param is the ExternalTestOrder id.
- Auth via `cookies()` + `db.user.findUnique` (same pattern as prescription).
- Fetch: `db.externalTestOrder.findUnique({ where: { id }, include: { doctor: { include: { user: { select: {id,name,email,mobileNo} } } }, patient: { select: {id,name,gender,mobileNo,email} }, labPartner: true, booking: true, reportUploads: { orderBy: uploadedAt desc, take: 1 }, billing: true } })`.
- Authorization: admin OR order.doctor.userId === user.id OR order.patientId === user.id OR order.labPartner.userId === user.id. Else AuthError.
- Picks the most recent upload: `const upload = order.reportUploads[0] || null`.
- Fetches DoctorLabAssociation separately for commission % (the order model itself doesn't store it).
- Fetches the uploader's name via `db.user.findUnique({ where: { id: upload.uploadedBy } })` for attribution + signature context.
- Letterhead: name = lab.labName; subtitle = `Owner: ${ownerName}`; address = lab.address + city/state + pincode; contact = mobile • altMobile • email; gstNo = lab.gstNo; registrationNo = lab.registrationNo.
- If no upload exists: renders patient info grid + order info grid + a dashed "⏳ Report Not Yet Uploaded" notice (with order.status) + Signatures (left "Lab Technician", right "Dr. {name}").
- If upload exists:
  - Patient info grid: Name, Gender, Mobile, Test Name, Test Type, Urgency, Order Status.
  - Order info grid: Order No, Referring Doctor (Dr. name), Ordered On, Completed On, Lab Partner.
  - Test Fee & Commission section (HIDDEN for patient viewers — only admin/doctor/lab tech): Test Fee (formatINR), Commission % (from billing or association, default 10), Commission Amount (formatINR), Lab Revenue (test fee − commission, highlighted teal), Billing Payment Status if billing record exists.
  - "✓ Verified by Doctor" stamp (rotated -3deg, teal border) if upload.verifiedByDoctor, with verifiedAt date.
  - Test Parameters table (if reportData JSON parses to a non-empty array): Parameter | Value | Unit | Normal Range | Flag. Abnormal rows highlighted rose (#fef2f2 bg, #991b1b text). Flag column shows "Abnormal" (rose badge) or "Normal" (green badge) per row.
  - Overall abnormal warning banner if any parameter has abnormal=true.
  - Lab Remarks section (upload.notes, whiteSpace pre-line).
  - Attached Report File section: shows fileName + size. If PDF → `<iframe>` (60vh); if image → `<img>` (max 60vh); else download link button.
  - "Report uploaded by: {name} on {date}" attribution line.
  - Signatures: left "Lab Technician", right `Dr. ${order.doctor.user.name}`. (Kept as plain strings since Signatures component doesn't render newlines — the uploader name is already shown in the attribution line above.)

## Shared patterns
- Both templates import PrintLayout, InfoGrid, SectionTitle, Signatures from `@/components/print/print-layout` and formatters from `@/lib/print-utils`.
- Both use inline styles (CSSProperties) for print-specific styling — Tailwind classes don't reliably survive print.css's `body * { visibility: hidden }` rule, so table cells / badges / banners use inline `style={{}}`.
- Both render the AuthError inside a `.print-area` wrapper so it still gets the A4 page styling on screen.
- Both use `makeReceiptNo(prefix, id)` for the doc no (RX-XXXXXXXX for prescriptions, LAB-XXXXXXXX for lab reports).

## Lint
- `npx eslint src/app/print/prescription/[id]/page.tsx src/app/print/lab-report/[id]/page.tsx` → EXIT 0, no warnings/errors.
- (Full `bun run lint` on the whole project was attempted but timed out due to the large codebase + concurrent eslint processes; targeted lint on the two new files passed cleanly.)

## Deviations from spec
1. Medicines table columns: spec said "S.No | Medicine | Morning | Afternoon | Evening | Night | Tab | Dose | Notes" but the PMedicine schema has no `night` field (only morning/afternoon/evening). Dropped the Night column. Used: S.No | Medicine | Morning | Afternoon | Evening | Tab | Dose | Notes.
2. Signatures multi-line: the Signatures component (Phase P1, immutable) takes `left`/`right` as plain `string` props and renders them in a div without `whiteSpace: pre-line`, so newlines collapse. Doctor details on the right side are joined with ' • ' separators instead of newlines (e.g. `Dr. Rajesh Sharma • Cardiology • Reg: MCI-12345`). The lab technician's uploader name is shown in a separate attribution paragraph above the signatures rather than in the signature line.
3. Doctor's hospital: the task spec said "doctor.hospital if set" but the Doctor model in prisma schema has `hospitalId` (String?) + `hospitalLinks` (M:N) — no direct `hospital` relation. Fetched the hospital separately via `db.hospital.findUnique({ where: { id: prescription.doctor.hospitalId } })` when hospitalId is set.

Stage Summary:
- Two print templates created: `/print/prescription/[id]` (printable prescription on doctor's clinic/hospital letterhead) and `/print/lab-report/[id]` (printable lab report on lab partner's letterhead, with "not yet uploaded" fallback for pending orders).
- Both follow the Phase P1 foundation (PrintLayout + InfoGrid + SectionTitle + Signatures + print-utils), use the cookies()-based server-component auth pattern, and pass `npx eslint` cleanly.
- Three minor deviations from the written spec (medicines Night column dropped, Signatures multi-line joined with bullets, hospital fetched separately) — all forced by the underlying schema/P1-component constraints, all documented above.
- No changes to PrintLayout, PrintOnMount, print-utils, print.css, dashboard pages, API routes, or prisma schema (per Phase P2 ground rules). No Print buttons added to existing pages (that's Phase P3's job).
