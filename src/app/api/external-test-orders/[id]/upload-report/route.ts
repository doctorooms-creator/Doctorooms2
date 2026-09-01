import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { uploadToStorage } from '@/lib/cloudinary'
import { emitToUserWithNotify } from '@/lib/emit-notification'
import { logCreate } from '@/lib/audit-log'

interface Params {
  params: Promise<{ id: string }>
}

// SECURITY (P1.4): Restrict upload to known-safe document types.
// Reject HTML/JS/executable files which could be rendered as XSS via the
// iframe viewer in /dashboard/patient/reports/client.tsx.
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/dicom',          // for radiology DICOM files
  'application/octet-stream',   // some DICOM senders use this; allow but flag
]
const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png|webp|dcm|dicom)$/i

const MAX_SIZE = 25 * 1024 * 1024 // 25MB (allow large radiology images)
const BUCKET = 'lab-reports'

/**
 * POST /api/external-test-orders/[id]/upload-report
 *   Lab Technician: upload a report file for this order.
 *   Auto-creates a LabBilling entry with commission, marks order as Completed.
 *
 * Form fields:
 *   - file: File (PDF, JPG, PNG, DOCX, etc.)
 *   - remarks?: string  (lab tech notes)
 *   - reportData?: string  (JSON string of typed parameter results for blood tests)
 *   - isAbnormal?: 'true' | 'false'
 *   - testFee?: string  (final test fee charged — used to compute commission & billing)
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
    if (!partner) return NextResponse.json({ error: 'Lab partner profile not found' }, { status: 404 })

    const { id } = await params
    const order = await db.externalTestOrder.findUnique({
      where: { id },
      include: { doctor: { select: { id: true, userId: true } } },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.labPartnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (order.status === 'Completed') {
      return NextResponse.json({ error: 'Order already completed' }, { status: 400 })
    }

    // Fetch commission percent from the doctor-lab association (the order itself doesn't store it)
    const association = await db.doctorLabAssociation.findUnique({
      where: { doctorId_labPartnerId: { doctorId: order.doctorId, labPartnerId: partner.id } },
    })
    const commissionPercent = association?.commissionPercent ?? 10

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 })

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
    }

    // SECURITY (P1.4): Reject unknown file types — protects against XSS via
    // iframe rendering in the patient report viewer.
    const isAllowedType = ALLOWED_TYPES.includes(file.type)
    const isAllowedExt = ALLOWED_EXTENSIONS.test(file.name)
    if (!isAllowedType && !isAllowedExt) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF, JPG, PNG, WEBP, and DICOM files are allowed.',
        },
        { status: 400 }
      )
    }

    const remarks = (formData.get('remarks') as string) || ''
    const reportDataRaw = (formData.get('reportData') as string) || '[]'
    const isAbnormalStr = (formData.get('isAbnormal') as string) || 'false'
    const isAbnormalCheckbox = isAbnormalStr === 'true' || isAbnormalStr === 'on'
    const testFeeStr = (formData.get('testFee') as string) || ''
    const finalTestFee = testFeeStr ? parseFloat(testFeeStr) : order.testFee

    // ─── Auto-detect abnormal values from reportData JSON ──────────────────
    // The lab tech's "Flag as Abnormal" checkbox is just a hint — we also
    // inspect the typed reportData (used for blood tests with structured
    // results) for any explicit `abnormal: true` flags OR any `value`
    // outside the `normal` range string. If either is found, the upload is
    // marked abnormal regardless of the checkbox.
    let autoAbnormal = false
    const abnormalParams: string[] = []
    try {
      const parsed = JSON.parse(reportDataRaw)
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          if (!entry || typeof entry !== 'object') continue
          const e = entry as Record<string, unknown>
          const paramName = String(e.param || e.name || e.test || 'value')
          // 1. Explicit abnormal flag
          if (e.abnormal === true || e.isAbnormal === true) {
            autoAbnormal = true
            abnormalParams.push(paramName)
            continue
          }
          // 2. Value outside the normal range string (best-effort parse)
          //    Supports normal ranges like "13-17", "13.5 - 16.5", "< 100", "> 40"
          const value = typeof e.value === 'string' ? e.value : String(e.value ?? '')
          const normal = String(e.normal || e.normalRange || e.referenceRange || '')
          const numValue = parseFloat(value)
          if (!isNaN(numValue) && normal) {
            const rangeMatch = normal.match(/(\d*\.?\d+)\s*[-–]\s*(\d*\.?\d+)/)
            const ltMatch = normal.match(/<\s*(\d*\.?\d+)/)
            const gtMatch = normal.match(/>\s*(\d*\.?\d+)/)
            if (rangeMatch) {
              const lo = parseFloat(rangeMatch[1])
              const hi = parseFloat(rangeMatch[2])
              if (!isNaN(lo) && !isNaN(hi) && (numValue < lo || numValue > hi)) {
                autoAbnormal = true
                abnormalParams.push(`${paramName}=${value} (normal ${normal})`)
              }
            } else if (ltMatch) {
              const threshold = parseFloat(ltMatch[1])
              if (!isNaN(threshold) && numValue >= threshold) {
                autoAbnormal = true
                abnormalParams.push(`${paramName}=${value} (normal < ${threshold})`)
              }
            } else if (gtMatch) {
              const threshold = parseFloat(gtMatch[1])
              if (!isNaN(threshold) && numValue <= threshold) {
                autoAbnormal = true
                abnormalParams.push(`${paramName}=${value} (normal > ${threshold})`)
              }
            }
          }
        }
      }
    } catch {
      // reportData wasn't valid JSON — ignore, fall back to the checkbox value
    }

    // Final abnormal flag: checkbox OR auto-detected
    const isAbnormal = isAbnormalCheckbox || autoAbnormal

    // Build notes: include lab tech remarks + auto-detected abnormal params
    const autoAbnormalNote = autoAbnormal && abnormalParams.length > 0
      ? `⚠️ Abnormal values detected: ${abnormalParams.join(', ')}`
      : ''
    const finalNotes = [remarks, autoAbnormalNote].filter(Boolean).join(' | ') || (isAbnormal ? '⚠️ Abnormal — flagged by lab' : '')

    // Upload file to storage (Cloudinary or local)
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${partner.id}/${order.id}/${timestamp}_${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // SECURITY (P3.3): Verify magic bytes — don't trust the browser-supplied MIME type.
    const { verifyMagicBytes } = await import('@/lib/file-validation')
    if (!verifyMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'File content does not match its declared type. Possible file type spoofing.' },
        { status: 400 }
      )
    }

    const fileUrl = await uploadToStorage(BUCKET, storagePath, buffer, file.type)

    // Create LabReportUpload record
    const upload = await db.labReportUpload.create({
      data: {
        externalTestOrderId: order.id,
        labPartnerId: partner.id,
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        reportData: reportDataRaw,
        uploadedBy: user.id,
        verifiedByDoctor: false,
        notes: finalNotes,
      },
    })

    // Auto-generate LabBilling (testFee + commission)
    const commissionAmount = Math.round(finalTestFee * commissionPercent) / 100
    const billing = await db.labBilling.create({
      data: {
        labPartnerId: partner.id,
        doctorId: order.doctorId,
        patientId: order.patientId,
        testOrderId: order.id,
        amount: finalTestFee,
        commissionAmount,
        commissionPercent,
        paymentStatus: 'Pending',
        notes: `Auto-generated on report upload`,
      },
    })

    // Mark order as Completed
    const updatedOrder = await db.externalTestOrder.update({
      where: { id },
      data: {
        status: 'Completed',
        completedAt: new Date(),
        testFee: finalTestFee,
      },
    })

    // Notify the order's doctor AND the patient that the report is ready.
    try {
      const doctor = await db.doctor.findUnique({
        where: { id: order.doctorId },
        include: { user: { select: { id: true, name: true } } },
      })
      const patientName =
        (await db.user.findUnique({ where: { id: order.patientId }, select: { name: true } }))?.name ||
        'Patient'
      if (doctor?.user) {
        await emitToUserWithNotify(doctor.user.id, 'external-report-uploaded', {
          orderId: order.id,
          orderNo: order.orderNo,
          testName: order.testName,
          patientName,
          labName: partner.labName,
          isAbnormal,
          fileUrl,
          message: '',
        })
      }
      await emitToUserWithNotify(order.patientId, 'external-report-uploaded', {
        orderId: order.id,
        orderNo: order.orderNo,
        testName: order.testName,
        patientName: 'You',
        labName: partner.labName,
        isAbnormal,
        fileUrl,
        message: '',
      }, {
        // Patient gets an SMS — they may not be actively on the dashboard.
        // The lab's letterhead info isn't included in SMS (template handles it).
        smsChannel: true,
      })
    } catch (e) {
      console.error('emit failed:', e)
    }

    // Audit log: report upload (critical when abnormal)
    try {
      await logCreate(
        'lab_report_upload',
        upload.id,
        user,
        `Uploaded ${file.name} (${file.type}, ${file.size} bytes) for ${order.testName} — ${isAbnormal ? '⚠️ ABNORMAL' : 'normal'}`,
        {
          orderId: order.id,
          fileName: file.name,
          fileSize: file.size,
          isAbnormal,
          testFee: finalTestFee,
          commissionAmount,
          labPartnerId: partner.id,
        },
        { severity: isAbnormal ? 'critical' : 'info' }
      )
    } catch (auditErr) {
      console.error('[audit-log] upload-report capture failed:', auditErr)
    }

    return NextResponse.json({
      upload,
      billing,
      order: updatedOrder,
    }, { status: 201 })
  } catch (error) {
    console.error('upload-report error:', error)
    return NextResponse.json({ error: 'Failed to upload report' }, { status: 500 })
  }
}
