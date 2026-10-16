import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { todayISTStr } from '@/lib/date-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET/POST /api/dashboard/patient/aturseva/check-in — Phase 3 daily check-in
 * / symptom diary.
 *
 * GET  → { success, today: {day, mood, energy, symptoms[], note} | null, streak }
 *        The chat surfaces render the interactive CheckInCard nudge when
 *        `today === null` (daily check-in prompt, ChatGPT-style in-thread).
 *
 * POST — the HUMAN-TAP WRITE (same rail as POST /aturseva/book): the LLM can
 *        only prepare a confirm card (prepare_check_in tool); the row is
 *        written when the patient presses Save. Upsert semantics — resubmitting
 *        a day UPDATES it (diary can be revised until midnight IST).
 *
 *        After the write: a `check_in_saved` card + a deterministic
 *        mood-aware Aturseva reply are persisted into the thread, and
 *        lastReadAt is stamped (the patient is right here — no badge light).
 */

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MOOD_FACES: Record<number, string> = { 1: '😞', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' }

function dateLabel(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!m) return dateStr
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const utc = new Date(Date.UTC(y, mo - 1, d))
  const day = DAYS_EN[utc.getUTCDay()] || ''
  return `${day}, ${d} ${MONTHS_EN[mo - 1] || ''}`
}

async function streakFor(userId: string): Promise<number> {
  const rows = await db.atursevaCheckIn.findMany({
    where: { userId },
    orderBy: { day: 'desc' },
    take: 30,
    select: { day: true },
  })
  const daySet = new Set(rows.map((r) => r.day))
  let streak = 0
  const base = new Date(`${todayISTStr()}T00:00:00.000Z`)
  for (let i = 0; i < 30; i++) {
    const d = new Date(base.getTime() - i * 86400000).toISOString().slice(0, 10)
    if (daySet.has(d)) streak++
    else if (i > 0) break // today may legitimately be pending — gap only ends AFTER today
  }
  return streak
}

function serialize(r: { day: string; mood: number; energy: number; symptoms: string; note: string }) {
  return {
    day: r.day,
    dayLabel: dateLabel(r.day),
    mood: r.mood,
    moodFace: MOOD_FACES[r.mood] || '😐',
    energy: r.energy,
    symptoms: r.symptoms ? r.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : [],
    note: r.note,
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = await db.atursevaCheckIn.findUnique({
      where: { userId_day: { userId: user.id, day: todayISTStr() } },
    })

    return NextResponse.json({
      success: true,
      today: today ? serialize(today) : null,
      streak: await streakFor(user.id),
    })
  } catch (error) {
    console.error('[aturseva/check-in] GET error:', error)
    return NextResponse.json({ error: 'Check-in jaankari la nahi pa rahi' }, { status: 500 })
  }
}

const bodySchema = z.object({
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  symptoms: z.array(z.string().trim().min(1).max(24)).max(6).default([]),
  note: z.string().trim().max(300).default(''),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 422 }
      )
    }
    const { mood, energy, note } = parsed.data
    const symptoms = [...new Set(parsed.data.symptoms.map((s) => s.toLowerCase()))].slice(0, 6)
    const day = todayISTStr()

    // Upsert: one row per patient-day; a resubmit revises today's entry.
    const checkIn = await db.atursevaCheckIn.upsert({
      where: { userId_day: { userId: user.id, day } },
      create: { userId: user.id, day, mood, energy, symptoms: symptoms.join(','), note },
      update: { mood, energy, symptoms: symptoms.join(','), note },
    })

    // ── Persist into the conversation thread (card + deterministic reply) ──
    const streak = await streakFor(user.id)
    const card = {
      type: 'check_in_saved',
      title: 'Aaj ka check-in save ho gaya ✓',
      data: { ...serialize(checkIn), streak },
    }
    const reply = checkInReply(mood, energy, symptoms, streak)
    try {
      const conversation = await db.atursevaConversation.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: { updatedAt: new Date() },
      })
      await db.atursevaMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'action',
          content: '',
          actionType: card.type,
          actionJson: JSON.stringify({ title: card.title, data: card.data }),
        },
      })
      await db.atursevaMessage.create({
        data: { conversationId: conversation.id, role: 'aturseva', content: reply },
      })
      // The patient pressed Save in this very thread — these rows must NOT
      // light the unread badge.
      await db.atursevaConversation.update({
        where: { id: conversation.id },
        data: { lastReadAt: new Date() },
      })
    } catch (persistErr) {
      // The check-in itself is saved — thread persistence is best-effort.
      console.error('[aturseva/check-in] thread persistence failed:', persistErr)
    }

    return NextResponse.json({ success: true, checkIn: serialize(checkIn), card }, { status: 201 })
  } catch (error) {
    console.error('[aturseva/check-in] POST error:', error)
    return NextResponse.json({ error: 'Check-in save nahi ho paya — dobara try karein' }, { status: 500 })
  }
}

/** Deterministic mood-aware reply (no LLM — bedside manner is pure code). */
function checkInReply(mood: number, energy: number, symptoms: string[], streak: number): string {
  const streakLine = streak >= 3 ? ` Lagatar ${streak} din ka check-in — shabash! 🌟` : ''
  if (mood >= 4 && energy >= 4) {
    return `Thank you! Aaj to aap badiya lag rahe hain ${MOOD_FACES[mood]} Aise hi rehte rahiye — paani aur halki diet ka dhyan rakhein.${streakLine}`
  }
  if (mood <= 2 || energy <= 2) {
    const symp = symptoms.length ? ` (${symptoms.join(', ')})` : ''
    return `Note kar liya${symp}. Aaj thoda low lag raha hai — aaram kijiye, paani piyein, aur zaroorat ho to thodi der lete leyiye. Kal phir batayein kaisa raha. Tabiyat bigde ya koi badi dikkat ho to turant doctor se milne ki salah dungi. 🩺${streakLine}`
  }
  return `Save ho gaya ${MOOD_FACES[mood] || '😐'} Kal ka trend bhi isi diary me dikhega — roz chhota check-in karne se poora pattern saaf hota hai.${streakLine}`
}
