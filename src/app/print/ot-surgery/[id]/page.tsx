import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { PrintLayout, InfoGrid, SectionTitle, Signatures } from '@/components/print/print-layout'
import { formatINR, formatDate, formatDateTime } from '@/lib/print-utils'

export const metadata = { title: 'OT Surgery — Print' }

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * /print/ot-surgery/[id]
 *   Printable OT surgery consent + report document.
 *   id = OtSchedule.id
 *   Any logged-in role can view (with authorization checks).
 */
export default async function PrintOtSurgeryPage({ params }: PageProps) {
  const { id } = await params

  // ─── Auth (server component pattern via cookies()) ──────────────────────
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('doctorooms_session')?.value
  if (!sessionId) {
    return <div className="p-8 text-center text-rose-600">Unauthorized. Please log in.</div>
  }
  const user = await db.user.findUnique({ where: { id: sessionId } })
  if (!user || user.status !== 'Active') {
    return <div className="p-8 text-center text-rose-600">Unauthorized. Please log in.</div>
  }

  // ─── Fetch schedule + related data ──────────────────────────────────────
  const schedule = await db.otSchedule.findUnique({
    where: { id },
    include: {
      ot: true,
      hospital: { select: { id: true, hospitalName: true, address: true, contactNo: true, email: true, website: true, city: true, state: true, pincode: true } },
      admission: {
        include: {
          patient: { select: { id: true, name: true, mobileNo: true, gender: true } },
          bed: { include: { ward: true } },
          attendingDoctor: { include: { user: { select: { id: true, name: true } } } },
        },
      },
      surgeon: { include: { user: { select: { id: true, name: true, mobileNo: true } } } },
    },
  })

  if (!schedule) {
    return <div className="p-8 text-center text-rose-600">Surgery schedule not found.</div>
  }

  // Authorization: doctor must be the assigned surgeon; OR admin; OR the patient themselves;
  // OR hospital / receptionist (for the owning hospital).
  const isAuthorized =
    user.role === 'admin' ||
    (user.role === 'doctor' && schedule.surgeon?.userId === user.id) ||
    (user.role === 'patient' && schedule.admission?.patient?.id === user.id) ||
    user.role === 'hospital' ||
    user.role === 'receptionist'
  if (!isAuthorized) {
    return <div className="p-8 text-center text-rose-600">Forbidden — you do not have access to this surgery record.</div>
  }

  // ─── Build letterhead from hospital ─────────────────────────────────────
  const h = schedule.hospital
  const addressBits = [
    h?.address,
    h?.city && h?.state ? `${h.city}, ${h.state}` : (h?.city || h?.state || ''),
    h?.pincode,
  ].filter(Boolean)
  const contactBits = [h?.contactNo, h?.email, h?.website].filter(Boolean)

  const letterhead = {
    name: h?.hospitalName || 'Hospital',
    subtitle: 'Operation Theater Schedule',
    address: addressBits.join('\n'),
    contact: contactBits.join('  •  '),
  }

  // ─── Parse assistantSurgeons JSON ──────────────────────────────────────
  let assistantNames: string[] = []
  try {
    const parsed = JSON.parse(schedule.assistantSurgeons || '[]')
    if (Array.isArray(parsed)) assistantNames = parsed.map((s: unknown) => String(s))
  } catch {
    // ignore
  }

  // ─── Title based on status ──────────────────────────────────────────────
  const title =
    schedule.status === 'Completed' ? 'OT SURGERY REPORT'
    : schedule.status === 'Cancelled' ? 'OT SURGERY CANCELLATION'
    : 'OT SURGERY CONSENT'

  // ─── Estimated start time + date ────────────────────────────────────────
  const scheduledTime = schedule.scheduledStartTime
    ? `${formatDate(schedule.scheduledDate)} at ${schedule.scheduledStartTime}`
    : formatDate(schedule.scheduledDate)

  return (
    <PrintLayout letterhead={letterhead} title={title} docNo={schedule.scheduleNo} date={schedule.scheduledDate}>
      {/* Patient info */}
      <SectionTitle>Patient Information</SectionTitle>
      <InfoGrid
        rows={[
          { label: 'Patient Name', value: schedule.patientName || schedule.admission?.patient?.name || '—' },
          { label: 'Age', value: schedule.patientAge ? `${schedule.patientAge} yrs` : '—' },
          { label: 'Gender', value: schedule.patientGender || schedule.admission?.patient?.gender || '—' },
          { label: 'IPD No', value: schedule.admission?.admissionNo || '—' },
          { label: 'Bed / Ward', value: schedule.admission?.bed ? `${schedule.admission.bed.bedNumber || schedule.admission.bed.id} / ${schedule.admission.bed.ward?.wardName || schedule.admission.bed.ward?.name || '—'}` : '—' },
          { label: 'Attending Doctor', value: schedule.admission?.attendingDoctor?.user?.name ? `Dr. ${schedule.admission.attendingDoctor.user.name}` : '—' },
        ]}
      />

      {/* Surgery details */}
      <SectionTitle>Surgery Details</SectionTitle>
      <InfoGrid
        rows={[
          { label: 'Surgery Name', value: schedule.surgeryName },
          { label: 'Category', value: schedule.surgeryCategory || '—' },
          { label: 'Type', value: schedule.surgeryType },
          { label: 'Operation Theater', value: `${schedule.ot.name} (${schedule.ot.otType}, ${schedule.ot.floorNo || '—'})` },
          { label: 'Scheduled Date / Time', value: scheduledTime },
          { label: 'Estimated Duration', value: schedule.estimatedDuration ? `${schedule.estimatedDuration} minutes` : '—' },
          { label: 'Surgeon', value: schedule.surgeon?.user?.name ? `Dr. ${schedule.surgeon.user.name}` : '—' },
          { label: 'Assistant Surgeons', value: assistantNames.length > 0 ? assistantNames.join(', ') : '—' },
          { label: 'Nurse', value: schedule.nurseId ? 'Assigned' : '—' },
          { label: 'OT Technician', value: schedule.otTechnician || '—' },
        ]}
      />

      {/* Actual timings (if InProgress or Completed) */}
      {(schedule.status === 'InProgress' || schedule.status === 'Completed') && (
        <>
          <SectionTitle>Actual Timings</SectionTitle>
          <InfoGrid
            rows={[
              { label: 'Actual Start', value: schedule.actualStartTime || '—' },
              { label: 'Actual End', value: schedule.actualEndTime || (schedule.status === 'InProgress' ? 'In progress…' : '—') },
              {
                label: 'Actual Duration',
                value: schedule.actualStartTime && schedule.actualEndTime
                  ? (() => {
                      try {
                        const [sh, sm] = schedule.actualStartTime.split(':').map(Number)
                        const [eh, em] = schedule.actualEndTime.split(':').map(Number)
                        const mins = (eh * 60 + em) - (sh * 60 + sm)
                        return mins > 0 ? `${mins} minutes` : '—'
                      } catch { return '—' }
                    })()
                  : (schedule.status === 'Completed' ? `${schedule.estimatedDuration} minutes (estimated)` : '—'),
              },
            ]}
          />
        </>
      )}

      {/* Status banner */}
      <div style={{
        margin: '16px 0',
        padding: '8px 12px',
        border: `1px solid ${
          schedule.status === 'Completed' ? '#166534' :
          schedule.status === 'InProgress' ? '#92400e' :
          schedule.status === 'Cancelled' ? '#991b1b' : '#475569'
        }`,
        background: `${
          schedule.status === 'Completed' ? '#dcfce7' :
          schedule.status === 'InProgress' ? '#fef3c7' :
          schedule.status === 'Cancelled' ? '#fee2e2' : '#f1f5f9'
        }`,
        color: '#000',
        fontSize: '12px',
      }}>
        <strong>Status: {schedule.status}</strong>
        {schedule.status === 'Cancelled' && schedule.cancellationReason && (
          <span style={{ marginLeft: '8px' }}>— Reason: {schedule.cancellationReason}</span>
        )}
      </div>

      {/* Notes / Pre-op + Post-op */}
      {schedule.notes && (
        <>
          <SectionTitle>Notes</SectionTitle>
          <p style={{ fontSize: '11px', lineHeight: 1.5, whiteSpace: 'pre-wrap', border: '1px solid #cbd5e1', padding: '8px', background: '#f8fafc' }}>
            {schedule.notes}
          </p>
        </>
      )}

      {/* Consent / signature block */}
      {schedule.status === 'Scheduled' && (
        <>
          <SectionTitle>Consent Declaration</SectionTitle>
          <p style={{ fontSize: '11px', lineHeight: 1.5, marginTop: 0 }}>
            I, <strong>{schedule.patientName || schedule.admission?.patient?.name || 'the patient'}</strong>,
            hereby give my consent to <strong>Dr. {schedule.surgeon?.user?.name || 'the surgeon'}</strong> and
            the surgical team at <strong>{schedule.hospital?.hospitalName || 'the hospital'}</strong> to perform the
            above-named surgery. I have been informed of the nature of the procedure, its risks, benefits,
            alternatives, and the expected recovery. I understand that the surgery may require general or
            regional anesthesia, the type and risks of which have been explained to me. I consent to the
            administration of such anesthesia as deemed necessary. I understand that in case of an unexpected
            finding during surgery, the surgeon may proceed with additional procedures necessary for my welfare.
          </p>
        </>
      )}

      <Signatures
        left="Patient / Attendant"
        right={schedule.surgeon?.user?.name ? `Dr. ${schedule.surgeon.user.name}` : 'Surgeon'}
      />
    </PrintLayout>
  )
}
