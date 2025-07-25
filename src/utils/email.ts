import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { SITE_NAME, SITE_DOMAIN } from '@/constants'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const { env } = getCloudflareContext()
  const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('Resend API key missing')
    return
  }

  const from = `${SITE_NAME} <no-reply@${SITE_DOMAIN}>`
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text
      })
    })
  } catch (err) {
    console.error('Failed to send email:', err)
  }
}
