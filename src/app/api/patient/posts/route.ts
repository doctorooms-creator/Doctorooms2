import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { logCreate } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'
import DOMPurify from 'isomorphic-dompurify'

// SECURITY (P3.4): Sanitize all user-supplied HTML content before storing.
// Strips <script>, event handlers (onerror, onclick, etc.), javascript: URLs,
// and any other XSS vectors. Allows safe formatting tags (p, h2, ul, a, img, etc.).
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  })
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function generateUniquePermalink(title: string): Promise<string> {
  let slug = slugify(title)
  if (!slug) slug = `post-${Date.now()}`
  let exists = await db.post.findUnique({ where: { permalink: slug } })
  if (!exists) return slug
  for (let i = 1; i <= 99; i++) {
    const candidate = `${slug}-${i}`
    exists = await db.post.findUnique({ where: { permalink: candidate } })
    if (!exists) return candidate
  }
  return `${slug}-${Math.floor(Math.random() * 99)}`
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await db.post.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        title: true,
        permalink: true,
        status: true,
        blogImg: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Patient posts list error:', error)
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, content, blogImg, videoLink, status } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const permalink = await generateUniquePermalink(title)

    const post = await db.post.create({
      data: {
        title: title || '',
        permalink,
        content: sanitizeHtml(content), // SECURITY (P3.4): sanitize before storing
        blogImg: blogImg || '',
        videoLink: videoLink || '',
        type: 'Blog',
        // SECURITY (P1.13): Patients can only create Draft posts.
        // Combined with raw HTML content (until DOMPurify is wired in Phase 3),
        // allowing patient-published posts would be a stored-XSS vector.
        // Admin review is required to publish patient-authored posts.
        status: 'Draft',
        authorId: user.id,
      },
    })

    // AUDIT (P2.8): Record patient-authored blog post.
    try {
      const auditCtx = getAuditContext(req)
      await logCreate(
        'blog_post',
        post.id,
        user,
        `Authored blog post "${post.title}" (status: Draft — requires admin review to publish)`,
        { title: post.title, permalink: post.permalink },
        { ...auditCtx }
      )
    } catch (auditErr) {
      console.error('[audit-log] blog post create capture failed:', auditErr)
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Patient post create error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
