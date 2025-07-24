import { getCloudflareContext } from '@opennextjs/cloudflare'
import { jsonResponse } from '@/utils/api'
import { updateUserCredits, logTransaction } from '@/utils/credits'
import { CREDIT_TRANSACTION_TYPE } from '@/db/schema'
import { CREDITS_EXPIRATION_YEARS } from '@/constants'
import ms from 'ms'

async function verifySignature(body: string, signatureHeader: string, secret: string) {
  const parts: Record<string, string> = {}
  for (const item of signatureHeader.split(',')) {
    const [key, val] = item.split('=')
    parts[key] = val
  }
  const timestamp = parts['t']
  const signature = parts['v1']
  if (!timestamp || !signature) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const data = encoder.encode(`${timestamp}.${body}`)
  const digest = await crypto.subtle.sign('HMAC', key, data)
  const expected = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')

  if (expected.length !== signature.length) return false
  let result = 0
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return result === 0
}

export async function POST(req: Request) {
  const { env } = getCloudflareContext()
  const secret = env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const sig = req.headers.get('Stripe-Signature')
  if (!sig) {
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()
  const valid = await verifySignature(body, sig, secret)
  if (!valid) {
    return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(body)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as {
      id: string
      metadata?: Record<string, string>
    }
    const userId = paymentIntent.metadata?.userId
    const credits = parseInt(paymentIntent.metadata?.credits || '0', 10)
    if (userId && credits > 0) {
      await updateUserCredits(userId, credits)
      await logTransaction({
        userId,
        amount: credits,
        description: `Megvásároltál ${credits} kreditet.`,
        type: CREDIT_TRANSACTION_TYPE.PURCHASE,
        expirationDate: new Date(Date.now() + ms(`${CREDITS_EXPIRATION_YEARS} év`)),
        paymentIntentId: paymentIntent.id
      })
    }
  }

  return jsonResponse({ received: true })
}
