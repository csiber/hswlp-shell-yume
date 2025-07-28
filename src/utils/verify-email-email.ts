export interface VerifyEmailData {
  verifyUrl: string
  userName?: string
}

export function renderVerifyEmail({ verifyUrl, userName }: VerifyEmailData) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>Dear ${userName || 'user'},</p>
    <p>Please verify your email address using the link below:</p>
    <p><a href="${verifyUrl}">Verify email address</a></p>
    <p>If you did not sign up, please ignore this message.</p>
  </body>
</html>`
  const text = `Dear ${userName || 'user'},\n\nPlease verify your email address using the link below:\n${verifyUrl}\n\nIf you did not sign up, please ignore this message.`
  return { html, text }
}
