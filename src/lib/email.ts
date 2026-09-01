/**
 * Email sending helper.
 *
 * SECURITY (P2.7): Wraps the Resend.com API (or any email provider).
 * In dev mode (no RESEND_API_KEY), falls back to logging the email content
 * to console — so devs can see what would be sent without configuring a provider.
 *
 * To enable real email:
 *   1. Sign up at https://resend.com (free 100 emails/day)
 *   2. Set RESEND_API_KEY in .env
 *   3. Set FROM_EMAIL=noreply@yourdomain.com (must be a verified sender)
 *   4. Optionally set FROM_NAME="Doctorooms"
 */

interface EmailParams {
  to: string
  subject: string
  html: string
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@doctorooms.in'
const FROM_NAME = process.env.FROM_NAME || 'Doctorooms'
const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function sendEmail({ to, subject, html }: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Dev fallback: log to console if no API key
  if (!RESEND_API_KEY) {
    console.log('[email/dev] To:', to)
    console.log('[email/dev] Subject:', subject)
    console.log('[email/dev] Body (first 200 chars):', html.slice(0, 200))
    return { success: true, messageId: `dev_${Date.now()}` }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `Email API returned ${res.status}: ${err.slice(0, 200)}` }
    }
    const data = await res.json() as { id?: string }
    return { success: true, messageId: data.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}

/**
 * Send the email-verification email with a signed-token URL.
 * The token is a JWT carrying { userId, purpose: 'email-verify', exp: 24h }.
 */
export async function sendVerificationEmail(to: string, verificationToken: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0d9488; font-size: 22px; margin: 0;">Doctorooms</h1>
        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0;">Your Health, Our Priority</p>
      </div>
      <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 12px;">Verify your email</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">Welcome to Doctorooms! Click the button below to verify your email address and activate your account.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #0d9488; color: white; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Verify Email</a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">Or copy this link into your browser:</p>
      <p style="color: #0d9488; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="color: #94a3b8; font-size: 11px;">This link expires in 24 hours. If you didn't create an account with Doctorooms, you can safely ignore this email.</p>
    </div>
  `

  const result = await sendEmail({ to, subject: 'Verify your Doctorooms account', html })
  if (!result.success) {
    console.error('[email] Failed to send verification email:', result.error)
  }
}
