/**
 * POST /api/copilot/attachments
 *
 * Doctor-scoped image upload for the Copilot Studio (Report Lens mode).
 * Accepts multipart/form-data with one "file" field (image, ≤ 8 MB).
 *
 * RULE #1: the attachment row is bound to ctx.doctorId (session-resolved) —
 * the file is stored OUTSIDE /public and can only be read back through
 * GET /api/copilot/attachments/[id], which re-verifies ownership.
 */

import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { getCtx } from '@/lib/copilot/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'copilot')

export async function POST(req: NextRequest) {
  const ctx = await getCtx(req)
  if (!ctx) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'Missing file field' }, { status: 400 })
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return Response.json({ error: 'Only JPEG, PNG or WebP images are supported' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'Image is larger than 8 MB' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const id = randomUUID()
    const filename = `${id}.${ext}`

    await mkdir(UPLOAD_DIR, { recursive: true })
    const filePath = path.join(UPLOAD_DIR, filename)
    await writeFile(filePath, buffer)

    const row = await db.copilotAttachment.create({
      data: {
        id,
        doctorId: ctx.doctorId,
        kind: 'image',
        filePath,
        originalName: file.name.slice(0, 120) || 'report-image',
        mimeType: file.type,
        sizeBytes: file.size,
      },
    })

    return Response.json(
      {
        attachment: {
          id: row.id,
          kind: row.kind,
          name: row.originalName,
          mimeType: row.mimeType,
          sizeBytes: row.sizeBytes,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[copilot/attachments] upload failed:', err)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
