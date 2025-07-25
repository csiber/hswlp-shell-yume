import "server-only";
import { renderToStaticMarkup } from "react-dom/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM!;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Yume";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to,
        subject,
        html,
      }),
    });
    return;
  }

  if (BREVO_API_KEY) {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    return;
  }

  throw new Error("No email provider configured");
}

export function renderEmail(component: React.ReactElement): string {
  return renderToStaticMarkup(component);
}
