# Task lab-phase4-labtech — Work Record

## Files Created (4 routes = 8 files)

- src/app/dashboard/lab-technician/incoming-orders/page.tsx (thin server wrapper, metadata)
- src/app/dashboard/lab-technician/incoming-orders/client.tsx
  - 4 stat cards (Total / New / In Progress / Completed)
  - Filter tabs: All | New | In Progress | Completed | Cancelled (client-side filter on full fetch)
  - Table: Order No | Patient (popover) | Gender | Test Name | Test Type | Doctor | Urgency | Ordered At | Status | Actions
  - Ordered rows → [Accept] (POST accept) + [Reject] (AlertDialog with reason textarea → POST reject)
  - InProgress rows → [Upload Report] navigates to `/dashboard/lab-technician/orders/[id]`
  - Completed rows → [View] navigates to `/dashboard/lab-technician/orders/[id]`
  - Urgency: Urgent=rose, Normal=zinc. Status: Ordered=amber, InProgress=violet, Completed=emerald, Cancelled=rose
  - Patient-name click → Popover with name/gender/mobile
  - Skeleton loaders, friendly empty card with Inbox icon
- src/app/dashboard/lab-technician/orders/[id]/page.tsx (async server, awaits `params: Promise<{ id: string }>`, passes `id` prop)
- src/app/dashboard/lab-technician/orders/[id]/client.tsx
  - Sticky header: Back button + orderNo code badge + status badge + patient name + urgency + testType
  - Patient Card (read-only: name, gender, mobile, email)
  - Order Card (testName, testType, orderedAt, completedAt, doctor name + specialization, doctor notes)
  - Test Fee & Commission Card: editable testFee input (defaults to order.testFee), commission % readonly, commission amount auto-computed = `Math.round(testFee × pct) / 100`, lab-revenue preview
  - Upload Report Card (only when status !== Completed && !== Cancelled): styled `<input type="file" accept="*/*">` label, remarks textarea, abnormal checkbox (rose), reportData JSON textarea with example placeholder, Submit button → FormData POST → on success toast.success('Report uploaded. Lab billing auto-generated.') + invalidate + redirect to incoming-orders
  - Existing Reports Card (when reportUploads.length > 0): each row shows fileName, fileType badge, file size, uploadedAt, uploadedBy (last 6 chars), notes, "Verified by Doctor" badge when verified, "View File" link (anchor asChild → opens fileUrl in new tab)
  - Completed/Cancelled banner with billing status
- src/app/dashboard/lab-technician/billing/page.tsx
- src/app/dashboard/lab-technician/billing/client.tsx
  - 5 stat cards (Total Bills / Total Revenue / Lab Revenue / Commission Paid / Commission Pending)
  - Filters: status (All/Pending/Paid), period (month input)
  - Table: Bill Date | Doctor | Patient | Test | Amount | Comm % | Commission | Lab Rev | Status | Paid At | Txn Ref
  - Export CSV button (client-side Blob download with proper escaping)

## Lint
`bun run lint` → exit 0 (clean). No errors, no warnings.

## Deviations / Notes
- Patient age is NOT available from `/api/external-test-orders` GET response (User schema has no `age` field; API select returns `{ id, name, gender, mobileNo }`). The incoming-orders table column shows Gender only (column header "Gender"); task description "Age/Gender" was adjusted accordingly. Mentioned in worklog.
- All other spec items implemented exactly as requested. No API routes / schema / sidebar / header modified.

## APIs consumed (built by lab-phase1)
- GET /api/external-test-orders → `{ orders: [...] }` (filtered to this lab)
- GET /api/external-test-orders/[id] → `{ order: {...patient, doctor.user, labPartner, reportUploads[], billing} }`
- POST /api/external-test-orders/[id]/accept → `{ order: updated }`
- POST /api/external-test-orders/[id]/reject with `{ reason }` → `{ order: updated }`
- POST /api/external-test-orders/[id]/upload-report (FormData: file, remarks, isAbnormal, reportData, testFee) → `{ upload, billing, order }`
- GET /api/lab-billing/report → `{ billings, summary }` (filtered to this lab)
