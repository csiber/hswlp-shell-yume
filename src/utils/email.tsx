import 'server-only'
import { renderToStaticMarkup } from 'react-dom/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

interface SendEmailParams {
  to: string
  subject: string
  component: React.ReactElement
}

export async function sendEmail({ to, subject, component }: SendEmailParams) {
  const { env } = await getCloudflareContext({ async: true })
  const html = renderToStaticMarkup(component)

  const from = env.EMAIL_FROM
  const fromName = env.EMAIL_FROM_NAME
  const replyTo = env.EMAIL_REPLY_TO

  if (env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${from}>`,
        to,
        subject,
        html,
        reply_to: replyTo
      })
    })
  } else if (env.BREVO_API_KEY) {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: from, name: fromName },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        replyTo: { email: replyTo }
      })
    })
  } else {
    console.error('No email provider configured')
  }
}
