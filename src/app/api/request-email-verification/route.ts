import { getSessionFromCookie } from '@/utils/auth'
import { jsonResponse } from '@/utils/api'
import { getKV } from '@/utils/kv-session'
import { createId } from '@paralleldrive/cuid2'
import { getVerificationTokenKey } from '@/utils/auth-utils'
import { sendEmail } from '@/utils/email'
import { renderVerifyEmail } from '@/utils/verify-email-email'
import { withRateLimit, RATE_LIMITS } from '@/utils/with-rate-limit'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return withRateLimit(async () => {
    const session = await getSessionFromCookie()
    if (!session || !session.user?.email) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.emailVerified) {
      return jsonResponse({ success: true })
    }
    const token = createId()
    const kv = await getKV()
    await kv.put(getVerificationTokenKey(token), session.user.id, { expirationTtl: 86400 })
    const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || ''
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`
    const userName = session.user.firstName ? `${session.user.firstName} ${session.user.lastName || ''}`.trim() : session.user.nickname || session.user.email
    const { html, text } = renderVerifyEmail({ verifyUrl, userName })
    await sendEmail({
      to: session.user.email,
      subject: '📧 Verify your email address',
      html,
      text
    })
    return jsonResponse({ success: true })
  }, RATE_LIMITS.EMAIL)
}
