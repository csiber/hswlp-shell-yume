import { getCloudflareContext } from '@opennextjs/cloudflare';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const { env } = getCloudflareContext();

  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured');
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text
    })
  });
}
