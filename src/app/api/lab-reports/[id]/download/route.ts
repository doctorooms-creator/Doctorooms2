import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { isCloudinaryUrl } from '@/lib/cloudinary'
import { readFile } from 'fs/promises'
import path from 'path'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/lab-reports/[id]/download
 *
 * SECURITY (P3.1 + P3.2): Proxies lab report files through the authenticated
 * API route. The raw Cloudinary/Supabase URL is NEVER exposed to the client.
 *
 * Auth: patient (own reports only), doctor (linked patient reports), lab tech
 * (own lab's reports), admin (all).
 *
 * The route checks ownership based on the LabReportUpload → ExternalTestOrder
 * → patientId / doctorId / labPartnerId chain.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'patient')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'lab_technician')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Fetch the report upload + the associated order
    const upload = await db.labReportUpload.findUnique({
      where: { id },
      include: {
        externalOrder: {
          select: {
            id: true,
            patientId: true,
            doctorId: true,
            labPartnerId: true,
            testName: true,
          },
        },
      },
    })

    if (!upload) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Ownership check per role
    const order = upload.externalOrder
    if (user.role === 'patient') {
      if (order.patientId !== user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    } else if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor || order.doctorId !== doctor.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    } else if (user.role === 'lab_technician') {
      const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
      if (!partner || order.labPartnerId !== partner.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }
    // Admin: no ownership check

    if (!upload.fileUrl) {
      return NextResponse.json({ error: 'No file attached' }, { status: 404 })
    }

    // P3.1 + P3.2: Fetch the file server-side, stream back to browser.
    let fileBuffer: Buffer

    if (isCloudinaryUrl(upload.fileUrl) || upload.fileUrl.startsWith('http')) {
      const fileResponse = await fetch(upload.fileUrl, {
        signal: AbortSignal.timeout(30_000),
      })
      if (!fileResponse.ok) {
        console.error(`[lab-report download] Storage returned ${fileResponse.status}`)
        return NextResponse.json({ error: 'File not available' }, { status: 502 })
      }
      fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
    } else if (upload.fileUrl.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', upload.fileUrl)
      try {
        fileBuffer = await readFile(localPath)
      } catch {
        return NextResponse.json({ error: 'File not found on server' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileName = upload.fileName || `lab_report_${upload.id.slice(-8)}.pdf`

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': upload.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Lab report download error:', error)
    return NextResponse.json({ error: 'Failed to download report' }, { status: 500 })
  }
}
