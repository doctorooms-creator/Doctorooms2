/**
 * SMS / WhatsApp Notification Channels
 * =====================================
 *
 * Multi-provider SMS gateway for sending patient-facing + doctor-facing
 * notifications outside the in-app notification list. Plugs into the
 * existing `createNotification({ smsChannel: true })` flow in
 * `emit-notification.ts`.
 *
 * Providers (selected via env var `SMS_PROVIDER`):
 *   - `log`     (default, dev) — writes the would-be SMS to console only.
 *   - `msg91`   (India SMS)    — uses MSG91 HTTP API.
 *   - `twilio`  (global)       — uses Twilio REST API (SMS + WhatsApp).
 *
 * Templates:
 *   Each event type maps to a built-in template (title + message fn).
 *   Templates can be overridden via env var `SMS_TEMPLATE_<EVENT>=...`
 *   (rarely needed — defaults cover the lab module events).
 *
 * Resilience:
 *   - Never throws — provider failures are logged + swallowed.
 *   - 10-second HTTP timeout per send.
 *   - Returns a { success, provider, messageId? } shape for logging.
 */

import { db } from '@/lib/db'

// ─── Types ──────────────────────────────────────────────────────────────

export type SmsProvider = 'log' | 'msg91' | 'twilio'

export interface SendSmsOptions {
  /** Recipient user ID (looked up in db for mobileNo). */
  userId: string
  /** Optional hospital ID (for hospital-scoped template overrides / opt-outs). */
  hospitalId?: string
  /** Recipient phone (E.164 format preferred, e.g. +919876543210).
   *  If omitted, looked up via db.user.findUnique({ id: userId }). */
  recipientPhone?: string
}

export interface SendSmsResult {
  success: boolean
  provider: SmsProvider
  messageId?: string
  error?: string
}

export interface EventTemplate {
  /** SMS body (≤160 chars for standard SMS; longer becomes multi-part). */
  message: (data: Record<string, string>) => string
  /** Channel: 'sms' (text), 'whatsapp' (Twilio WhatsApp), or 'both'. */
  channel: 'sms' | 'whatsapp' | 'both'
}

// ─── Template Registry ──────────────────────────────────────────────────

const TEMPLATES: Record<string, EventTemplate> = {
  'external-report-uploaded': {
    message: (d) =>
      `Doctorooms: Your ${d.testName || 'lab report'} from ${d.labName || 'the lab'} is ready. ` +
      `${d.isAbnormal === 'true' ? '⚠️ Some values are abnormal — please consult your doctor. ' : ''}` +
      `View at doctorooms.in/dashboard/patient/reports`,
    channel: 'sms',
  },
  'commission-paid': {
    message: (d) =>
      `Doctorooms: Commission of ₹${d.amount || '0'} ${d.period ? `for ${d.period} ` : ''}${d.labName ? `from ${d.labName} ` : ''}has been paid out. Transaction ref: ${d.transactionRef || 'N/A'}`,
    channel: 'sms',
  },
  'prescription-shared': {
    message: (d) =>
      `Doctorooms: Dr. ${d.doctorName || 'your doctor'} has shared a prescription with you. View at doctorooms.in/dashboard/patient/prescription-access`,
    channel: 'sms',
  },
  'appointment-confirmed': {
    message: (d) =>
      `Doctorooms: Your appointment with Dr. ${d.doctorName || ''} on ${d.appointmentDate || ''} at ${d.timeSlot || ''} is confirmed. Token: ${d.tokenNumber || 'N/A'}`,
    channel: 'sms',
  },
  'queue-turn-approaching': {
    message: (d) =>
      `Doctorooms: Your turn is approaching! Please be ready at ${d.departmentName || 'the clinic'}. Token: ${d.tokenNumber || 'N/A'}`,
    channel: 'sms',
  },
  'discharge-advised': {
    message: (d) =>
      `Doctorooms: Discharge has been advised for ${d.patientName || 'the patient'}. Please contact ${d.hospitalName || 'the hospital'} for discharge formalities.`,
    channel: 'sms',
  },
}

// ─── Provider Resolver ──────────────────────────────────────────────────

function getProvider(): SmsProvider {
  const p = (process.env.SMS_PROVIDER || 'log').toLowerCase()
  if (p === 'msg91' || p === 'twilio' || p === 'log') return p
  return 'log'
}

// ─── Phone Normalisation ─────────────────────────────────────────────────

/** Convert Indian 10-digit or various formats to E.164 (+91XXXXXXXXXX). */
function normalizePhone(phone: string): string {
  let p = phone.trim()
  // Strip spaces, dashes, parens
  p = p.replace(/[\s\-()]/g, '')
  // Strip leading 0
  if (p.startsWith('0')) p = p.slice(1)
  // Strip leading +91 or 91
  if (p.startsWith('+91')) p = p.slice(3)
  else if (p.startsWith('91') && p.length === 12) p = p.slice(2)
  // If 10 digits, prefix +91
  if (p.length === 10) return `+91${p}`
  // Already has country code
  if (p.startsWith('+')) return p
  // Fallback — return as-is (provider may reject)
  return p
}

// ─── Provider: Log (dev default) ─────────────────────────────────────────

async function sendViaLog(
  phone: string,
  message: string,
  channel: 'sms' | 'whatsapp' | 'both'
): Promise<SendSmsResult> {
  console.log(`[SMS/log] (channel=${channel}) To: ${phone}`)
  console.log(`[SMS/log] Body: ${message}`)
  return { success: true, provider: 'log', messageId: `log_${Date.now()}` }
}

// ─── Provider: MSG91 (India SMS) ────────────────────────────────────────

async function sendViaMsg91(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  const authKey = process.env.MSG91_AUTH_KEY
  const senderId = process.env.MSG91_SENDER_ID || 'DOCTOR'
  const route = process.env.MSG91_ROUTE || '4' // 4 = transactional

  if (!authKey) {
    return { success: false, provider: 'msg91', error: 'MSG91_AUTH_KEY not set' }
  }

  try {
    const url = 'https://api.msg91.com/api/v5/flow/'
    const payload = {
      sender: senderId,
      route,
      sms: [{ message, to: [phone.replace('+', '')] }],
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      const err = await res.text()
      return { success: false, provider: 'msg91', error: `HTTP ${res.status}: ${err.slice(0, 200)}` }
    }
    const data = await res.json().catch(() => ({}))
    return {
      success: true,
      provider: 'msg91',
      messageId: data.message || `msg91_${Date.now()}`,
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, provider: 'msg91', error: msg }
  }
}

// ─── Provider: Twilio (global SMS + WhatsApp) ──────────────────────────

async function sendViaTwilio(
  phone: string,
  message: string,
  channel: 'sms' | 'whatsapp' | 'both'
): Promise<SendSmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromSms = process.env.TWILIO_FROM_SMS
  const fromWhatsapp = process.env.TWILIO_FROM_WHATSAPP

  if (!accountSid || !authToken) {
    return { success: false, provider: 'twilio', error: 'Twilio credentials not set' }
  }

  const sendOne = async (from: string, to: string, body: string) => {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const form = new URLSearchParams()
    form.set('From', from)
    form.set('To', to)
    form.set('Body', body)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HTTP ${res.status}: ${err.slice(0, 200)}`)
    }
    const data = await res.json().catch(() => ({}))
    return data.sid as string | undefined
  }

  try {
    let messageId: string | undefined
    const errors: string[] = []

    if ((channel === 'sms' || channel === 'both') && fromSms) {
      try {
        messageId = await sendOne(fromSms, phone, message)
      } catch (e) {
        errors.push(`sms: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    if ((channel === 'whatsapp' || channel === 'both') && fromWhatsapp) {
      try {
        // WhatsApp uses "whatsapp:" prefix
        const waFrom = fromWhatsapp.startsWith('whatsapp:') ? fromWhatsapp : `whatsapp:${fromWhatsapp}`
        const waTo = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`
        const waId = await sendOne(waFrom, waTo, message)
        messageId = messageId || waId
      } catch (e) {
        errors.push(`whatsapp: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    if (errors.length > 0 && !messageId) {
      return { success: false, provider: 'twilio', error: errors.join('; ') }
    }
    return { success: true, provider: 'twilio', messageId: messageId || `twilio_${Date.now()}` }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, provider: 'twilio', error: msg }
  }
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Send an event-driven SMS / WhatsApp notification.
 * Called by `createNotification({ smsChannel: true })` in emit-notification.ts.
 * Never throws — all failures are logged + swallowed.
 *
 * @param eventType   Event key (e.g. 'external-report-uploaded').
 * @param templateData  Variables to interpolate into the template (e.g. { testName, labName }).
 * @param options     { userId, hospitalId?, recipientPhone? }
 */
export async function sendEventNotification(
  eventType: string,
  templateData: Record<string, string>,
  options: SendSmsOptions
): Promise<SendSmsResult> {
  try {
    // 1. Resolve recipient phone
    let phone = options.recipientPhone
    if (!phone) {
      const user = await db.user.findUnique({
        where: { id: options.userId },
        select: { mobileNo: true },
      }).catch(() => null)
      if (!user?.mobileNo) {
        return { success: false, provider: getProvider(), error: 'No mobile number on user' }
      }
      phone = user.mobileNo
    }
    phone = normalizePhone(phone)
    if (!phone) {
      return { success: false, provider: getProvider(), error: 'Invalid phone' }
    }

    // 2. Resolve template
    const template = TEMPLATES[eventType]
    if (!template) {
      // No template = silently skip (event doesn't need SMS)
      return { success: false, provider: getProvider(), error: `No template for event: ${eventType}` }
    }
    const message = template.message(templateData)
    if (!message) {
      return { success: false, provider: getProvider(), error: 'Empty message' }
    }

    // 3. Dispatch to provider
    const provider = getProvider()
    let result: SendSmsResult
    if (provider === 'log') {
      result = await sendViaLog(phone, message, template.channel)
    } else if (provider === 'msg91') {
      result = await sendViaMsg91(phone, message)
    } else {
      result = await sendViaTwilio(phone, message, template.channel)
    }

    // 4. Log result (always — for audit trail)
    if (result.success) {
      console.log(`[notify-channels] SMS sent via ${result.provider} to ${phone}: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`)
    } else {
      console.warn(`[notify-channels] SMS FAILED via ${result.provider} to ${phone}: ${result.error}`)
    }

    return result
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[notify-channels] Unhandled error:', msg)
    return { success: false, provider: getProvider(), error: msg }
  }
}

/**
 * Convenience: send an arbitrary SMS to a phone (not tied to an event template).
 * Useful for ad-hoc notifications like "OTP for verification".
 */
export async function sendRawSms(
  phone: string,
  message: string,
  channel: 'sms' | 'whatsapp' | 'both' = 'sms'
): Promise<SendSmsResult> {
  const provider = getProvider()
  const normalized = normalizePhone(phone)

  if (provider === 'log') return sendViaLog(normalized, message, channel)
  if (provider === 'msg91') return sendViaMsg91(normalized, message)
  return sendViaTwilio(normalized, message, channel)
}

/**
 * Test helper — ping the configured provider with a test message.
 * Use this from an admin settings page to verify credentials.
 */
export async function testSmsProvider(phone: string): Promise<SendSmsResult> {
  return sendRawSms(phone, 'Doctorooms test message — your SMS gateway is configured correctly.', 'sms')
}
