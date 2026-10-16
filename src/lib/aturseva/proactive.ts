/**
 * Aturseva — Phase 3 PROACTIVE WATCHER.
 *
 * The plan's pillar 3: "AI batati hai" — status changes (booking approved /
 * rejected, consultation started, aapki baari) must arrive IN the patient's
 * Aturseva conversation, not just as app notifications. This module is the
 * single write rail for those unsolicited pushes:
 *
 *   pushAtursevaMessage({ userId, text?, card? })
 *     1. upserts the patient's conversation
 *     2. persists the card (role 'action') and/or text (role 'aturseva')
 *     3. emits `aturseva-push` over the realtime service to the patient's
 *        user room → global toast (RealtimeNotification) + live chat refresh
 *        (query invalidation) + sidebar unread badge.
 *
 * Safety rails:
 *   - NEVER throws: callers wrap business logic; a failed push logs and dies
 *     silently (the booking/appointment state change itself must never break).
 *   - SPAM CAP (AI-NURSE-PLAN): an in-memory 90s dedup keyed by
 *     `userId:kind:refId` blocks duplicate pushes for the same logical event
 *     (route retries, double-fires). One event → one chat message.
 *   - Only called from server-side status-change hooks (approve / reject /
 *     doctor status transitions) — never from anything the patient taps
 *     themselves in the chat (those write directly via POST endpoints).
 */

import { db } from '@/lib/db'
import { emitNotification, userRoom, type EmitPayload } from '@/lib/emit-notification'

export interface AtursevaPushCard {
  type: string // e.g. 'booking_update'
  title: string
  data: Record<string, unknown>
}

export interface AtursevaPushOptions {
  userId: string
  /** Prose message in Aturseva's voice (role 'aturseva'). */
  text?: string
  /** Rich card (role 'action' row) — optional. */
  card?: AtursevaPushCard
  /** Dedup bucket, e.g. 'booking-approve'. Defaults to 'generic'. */
  kind?: string
  /** Dedup ref — usually the bookingId the event is about. */
  refId?: string
  /** Short preview for the toast (defaults to `text`). */
  toastMessage?: string
}

// ─── Spam cap: 90s dedup per (userId, kind, refId) ──────────────────────────

const DEDUP_TTL_MS = 90 * 1000
const lastPushAt = new Map<string, number>()

// Opportunistic sweep so the map never grows unbounded in a long-lived server.
function sweepDedup(now: number) {
  if (lastPushAt.size < 256) return
  for (const [k, t] of lastPushAt) {
    if (now - t > DEDUP_TTL_MS) lastPushAt.delete(k)
  }
}

/**
 * Push an unsolicited Aturseva message into the patient's thread + emit the
 * live `aturseva-push` socket event. Fire-safe: never throws.
 * Returns TRUE when a message was actually persisted (FALSE when the spam-cap
 * dedup swallowed a duplicate — callers use this for honest push counts).
 */
export async function pushAtursevaMessage(opts: AtursevaPushOptions): Promise<boolean> {
  const { userId, text, card, kind = 'generic', refId = '', toastMessage } = opts
  if (!userId) return false
  if (!text && !card) return false

  try {
    // ── Spam cap ──
    const now = Date.now()
    sweepDedup(now)
    const key = `${userId}:${kind}:${refId}`
    const prev = lastPushAt.get(key)
    if (prev && now - prev < DEDUP_TTL_MS) return false
    lastPushAt.set(key, now)

    // ── Persist into the conversation thread ──
    const conversation = await db.atursevaConversation.upsert({
      where: { userId },
      create: { userId },
      update: { updatedAt: new Date() },
    })

    if (card) {
      await db.atursevaMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'action',
          content: '',
          actionType: card.type,
          actionJson: JSON.stringify({ title: card.title, data: card.data }),
        },
      })
    }
    if (text) {
      await db.atursevaMessage.create({
        data: { conversationId: conversation.id, role: 'aturseva', content: text },
      })
    }

    // ── Live push (toast + query invalidation + unread badge) ──
    const payload: EmitPayload = {
      message: toastMessage || text || card?.title || 'Aturseva ne ek update bheja hai.',
      cardType: card?.type,
      title: card?.title,
      kind,
    }
    emitNotification('aturseva-push', [userRoom(userId)], payload)
    return true
  } catch (err) {
    // Business logic must NEVER break because of a chat push.
    console.error('[aturseva/proactive] push failed:', err)
    return false
  }
}
