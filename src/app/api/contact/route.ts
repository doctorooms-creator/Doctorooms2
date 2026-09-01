import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // SECURITY (P1.10): 5 contact form submissions per minute per IP.
    const clientIp = getClientIp(request)
    const rl = await rateLimit(`contact:ip:${clientIp}`, 5, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      )
    }
    const body = await request.json()
    const { name, email, phone, department, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    await db.hospitalInquiry.create({
      data: {
        name,
        email,
        phone: phone || '',
        department: department || '',
        subject: subject || '',
        message,
        status: 'Pending',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }
}
