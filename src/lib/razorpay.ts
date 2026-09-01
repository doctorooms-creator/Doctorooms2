import Razorpay from 'razorpay'
import crypto from 'crypto'

/**
 * Singleton Razorpay client (server-side only).
 * Reads credentials from env vars set during deployment.
 */
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

/**
 * Create a Razorpay order for the given amount (in INR).
 * Amount is converted to paise (× 100) and rounded.
 */
export async function createRazorpayOrder(
  amount: number,
  receipt: string,
  notes: Record<string, string>
) {
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt,
    notes,
  })
}

/**
 * Verify the signature returned by Razorpay after a payment.
 * Razorpay signs `${orderId}|${paymentId}` with HMAC-SHA256 using the key secret.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  // Use timingSafeEqual to avoid timing attacks when both have the same length
  if (expected.length !== signature.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

/**
 * Verify the signature of a Razorpay webhook payload.
 * Razorpay signs the raw body with HMAC-SHA256 and puts the result in the
 * `X-Razorpay-Signature` header.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  if (expected.length !== signature.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}
