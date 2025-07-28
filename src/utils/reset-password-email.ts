export interface ResetPasswordEmailData {
  resetUrl: string
  userName?: string
}

export function renderResetPasswordEmail({ resetUrl, userName }: ResetPasswordEmailData) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>Dear ${userName || 'user'},</p>
    <p>You can set a new password using the link below:</p>
    <p><a href="${resetUrl}">Reset password</a></p>
    <p>If you didn't request this, please ignore this message.</p>
  </body>
</html>`
  const text = `Dear ${userName || 'user'},\n\nYou can set a new password using the link below:\n${resetUrl}\n\nIf you didn't request this, please ignore this message.`
  return { html, text }
}
