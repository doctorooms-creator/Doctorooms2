import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { logAction } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'
import { isCloudinaryUrl } from '@/lib/cloudinary'
import { readFile } from 'fs/promises'
import path from 'path'

export const BUCKET = 'medical-docs'

/**
 * GET /api/patient/medical-documents/[id]/download
 *
 * SECURITY (P3.1 + P3.2): Proxies the file through the authenticated API route.
 * The raw Cloudinary/Supabase URL is NEVER exposed to the client.
 *
 * Flow:
 *   1. Auth check (patient role + ownership check).
 *   2. Fetch the file from Cloudinary (server-side) or read from local filesystem.
 *   3. Stream the file content back with Content-Type + Content-Disposition headers.
 *
 * The client sees only this endpoint — no raw storage URLs.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params

    const doc = await db.medicalDocument.findUnique({
      where: { id },
    })

    // IDOR-resistant: return 404 (not 403) if not found or not owned
    if (!doc || doc.patientId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!doc.fileUrl || !doc.fileName) {
      return NextResponse.json(
        { error: 'No file attached to this document' },
        { status: 404 }
      )
    }

    // AUDIT (P2.8): Record patient document view/download.
    try {
      const auditCtx = getAuditContext(req)
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'view',
        entityType: 'medical_document',
        entityId: doc.id,
        description: `Downloaded medical document "${doc.title}"`,
        severity: 'info',
        ...auditCtx,
      })
    } catch (auditErr) {
      console.error('[audit-log] medical document view capture failed:', auditErr)
    }

    // P3.1 + P3.2: Fetch the file server-side, stream back to browser.
    let fileBuffer: Buffer

    if (isCloudinaryUrl(doc.fileUrl) || doc.fileUrl.startsWith('http')) {
      // Cloudinary or other remote URL — fetch server-side
      const fileResponse = await fetch(doc.fileUrl, {
        signal: AbortSignal.timeout(30_000),
      })
      if (!fileResponse.ok) {
        console.error(`[download] Storage returned ${fileResponse.status} for ${doc.fileUrl.slice(0, 50)}...`)
        return NextResponse.json({ error: 'File not available' }, { status: 502 })
      }
      fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
    } else if (doc.fileUrl.startsWith('/uploads/')) {
      // Local fallback — read from filesystem
      const localPath = path.join(process.cwd(), 'public', doc.fileUrl)
      try {
        fileBuffer = await readFile(localPath)
      } catch {
        return NextResponse.json({ error: 'File not found on server' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Stream the file content back with proper headers
    // Content-Disposition: attachment → browser downloads the file
    // Content-Type: the stored mimeType → browser knows how to handle it
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': doc.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
