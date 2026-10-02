/**
 * GET /api/copilot/attachments/[id]
 *
 * Serves a copilot attachment image — but ONLY to the doctor who owns it.
 * Medical uploads never live in /public; this route is the single gate:
 *   1. session → ctx (RULE #1, no doctorId can be passed in)
 *   2. row.doctorId must equal ctx.doctorId
 *   3. file is streamed with immutable caching (ids are UUIDs)
 */

import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { db } from '@/lib/db'
import { getCtx } from '@/lib/copilot/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIME_MAP: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx(req)
  if (!ctx) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(id)) {
    return Response.json({ error: 'Bad id' }, { status: 400 })
  }

  const row = await db.copilotAttachment.findFirst({
    where: { id, doctorId: ctx.doctorId }, // ← ownership gate
    select: { filePath: true, mimeType: true, kind: true },
  })
  if (!row) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const buffer = await readFile(row.filePath)
    const ext = row.filePath.split('.').pop()?.toLowerCase() || ''
    const contentType = MIME_MAP[ext] || row.mimeType || 'application/octet-stream'

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=86400, immutable',
        'Content-Length': String(buffer.length),
      },
    })
  } catch {
    return Response.json({ error: 'File missing on disk' }, { status: 410 })
  }
}
