# Task lab-phase5-patient — Patient Lab Reports page

## Files Created
- `src/app/dashboard/patient/reports/page.tsx` — server wrapper, metadata `My Lab Reports`.
- `src/app/dashboard/patient/reports/client.tsx` — full client UI (~890 lines).

## Route
`/dashboard/patient/reports` (patient role; sidebar entry "My Lab Reports" was added by lab-phase1).

## Data
`useQuery(['patient-lab-reports']) → GET /api/lab-reports/patient` returns `{ reports: LabReportUpload[] }` (each with externalOrder {testName, testType, testFee, status, urgency, orderedAt, completedAt, notes, doctor.user} and labPartner {labName, city, mobile}).

## Layout
- Header + subtitle.
- 3 stat cards: Total Reports (teal), Reports Ready (emerald), Pending Tests (amber).
- Filter chips: All | Ready | Pending.
- Section 1 — Reports Ready grid (cards: file-type icon, test name, lab+city, doctor, completed date, abnormal badge if notes mention "Abnormal"/start with ⚠️, View Report + Download buttons).
- Section 2 — Pending Tests table (Test | Lab | Doctor | Type | Urgency | Ordered At | Status | Fee).
- `ReportViewerDialog` (`max-w-4xl h-[80vh]`): DialogHeader with test/lab/doctor/date; Lab Remarks banner if notes; inline viewer — `<img>` for image/*, `<iframe>` for application/pdf, fallback message + Download for other types; DialogFooter Close + Download (anchor with download attr).

## Conventions
- 'use client' + thin server page.tsx wrapper.
- TanStack Query, framer-motion, shadcn/ui (Card, Button, Badge, Skeleton, Table, Dialog).
- Color palette: teal/emerald/amber/violet/rose — NO blue/indigo.
- Indian number formatting (`toLocaleString('en-IN')` + ₹).
- date-fns for date formatting.
- Empty states with icon + message; loading Skeleton cards / rows; error card with refetch.
- Mobile-first responsive grid + horizontal-scroll table.

## Lint
- `bun run lint` exit 0 after fix.
- Initial error: `react-hooks/static-components` flagging `const FileIcon = fileIcon(fileType)` + `<FileIcon />`. Refactored to `renderFileIcon(fileType, className)` returning JSX inline.
