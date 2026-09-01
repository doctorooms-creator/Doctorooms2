import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { isCloudinaryUrl } from '@/lib/cloudinary'
import { readFile } from 'fs/promises'
import path from 'path'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/lab-reports/[id]/file
 *   Proxies a lab report file through the authenticated API route.
 *   The raw Cloudinary/Supabase URL is NEVER exposed to the client.
 *
 *   SECURITY (P3.1 + P3.2): All roles can access this route, but ownership
 *   is verified per-role:
 *     - patient: must own the report (externalOrder.patientId === user.id)
 *     - doctor: must be the ordering doctor (externalOrder.doctorId === doctor.id)
 *     - lab_technician: must own the lab partner (labPartnerId matches their profile)
 *     - admin: can access any report
 *
 *   Query:
 *     ?download=true  → Content-Disposition: attachment (forces browser download)
 *     (default)       → Content-Disposition: inline (renders in iframe/img)
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Fetch the report upload + its order + lab partner
    const report = await db.labReportUpload.findUnique({
      where: { id: id },
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
        labPartner: {
          select: { id: true, userId: true },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // ─── Ownership check per role ──────────────────────────────────────────
    const order = report.externalOrder
    let authorized = false

    if (user.role === 'admin') {
      authorized = true
    } else if (user.role === 'patient') {
      authorized = order.patientId === user.id
    } else if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      authorized = !!doctor && order.doctorId === doctor.id
    } else if (user.role === 'lab_technician') {
      authorized = report.labPartner?.userId === user.id
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!report.fileUrl) {
      return NextResponse.json({ error: 'No file attached' }, { status: 404 })
    }

    // ─── Fetch the file server-side ──────────────────────────────────────────
    let fileBuffer: Buffer

    if (isCloudinaryUrl(report.fileUrl) || report.fileUrl.startsWith('http')) {
      const fileResponse = await fetch(report.fileUrl, {
        signal: AbortSignal.timeout(30_000),
      })
      if (!fileResponse.ok) {
        console.error(`[lab-report/file] Storage returned ${fileResponse.status}`)
        return NextResponse.json({ error: 'File not available' }, { status: 502 })
      }
      fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
    } else if (report.fileUrl.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', report.fileUrl)
      try {
        fileBuffer = await readFile(localPath)
      } catch {
        return NextResponse.json({ error: 'File not found on server' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // ─── Stream back with proper headers ────────────────────────────────────
    const { searchParams } = new URL(req.url)
    const forceDownload = searchParams.get('download') === 'true'
    const disposition = forceDownload ? 'attachment' : 'inline'
    const fileName = report.fileName || 'lab-report'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': report.fileType || 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Lab report file proxy error:', error)
    return NextResponse.json({ error: 'Failed to load file' }, { status: 500 })
  }
}
