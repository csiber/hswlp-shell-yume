import { jsonResponse } from '@/utils/api'
import { forgotPasswordSchema } from '@/schemas/forgot-password.schema'
import { getDB } from '@/db'
import { userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { getKV } from '@/utils/kv-session'
import { sendEmail } from '@/utils/email'
import { renderResetPasswordEmail } from '@/utils/reset-password-email'
import { getResetTokenKey } from '@/utils/auth-utils'
import { withRateLimit, RATE_LIMITS } from '@/utils/with-rate-limit'
import { validateTurnstileToken } from '@/utils/validate-captcha'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return withRateLimit(async () => {
    const parse = forgotPasswordSchema.safeParse(await req.json().catch(() => null))
    if (!parse.success) {
      return jsonResponse({ success: false, error: 'Invalid data' }, { status: 400 })
    }
    const { email, captchaToken } = parse.data
    if (captchaToken && !(await validateTurnstileToken(captchaToken))) {
      return jsonResponse({ success: false, error: 'Captcha failed' }, { status: 400 })
    }
    const db = await getDB()
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.email, email),
      columns: { id: true, firstName: true, lastName: true, nickname: true, email: true }
    })
    // Always respond success to avoid enumeration
    if (!user) {
      return jsonResponse({ success: true })
    }
    const token = createId()
    const kv = await getKV()
    await kv.put(getResetTokenKey(token), user.id, { expirationTtl: 3600 })
    const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || ''
    const resetUrl = `${baseUrl}/reset-password?token=${token}`
    const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.nickname || user.email
    const { html, text } = renderResetPasswordEmail({ resetUrl, userName })
    await sendEmail({
      to: user.email!,
      subject: '🔑 Reset your password',
      html,
      text
    })
    return jsonResponse({ success: true })
  }, RATE_LIMITS.FORGOT_PASSWORD)
}
