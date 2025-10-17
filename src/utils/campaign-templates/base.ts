export interface CampaignEmailOptions {
  title: string;
  greeting?: string;
  intro: string;
  paragraphs?: string[];
  cta?: {
    label: string;
    url: string;
  };
  footer?: string;
}

export interface CampaignEmailContent {
  html: string;
  text: string;
}

export function renderCampaignEmail({
  title,
  greeting,
  intro,
  paragraphs = [],
  cta,
  footer = 'Ha nem szeretnél több hasonló e-mailt kapni, módosítsd az értesítési beállításaidat a profilodban.',
}: CampaignEmailOptions): CampaignEmailContent {
  const safeParagraphs = paragraphs.filter(Boolean);
  const textParts = [
    greeting,
    intro,
    ...safeParagraphs,
    cta ? `${cta.label}: ${cta.url}` : undefined,
    footer,
  ].filter(Boolean) as string[];

  const text = textParts.join('\n\n');

  const htmlBody = [
    greeting ? `<p>${greeting}</p>` : '',
    `<p>${intro}</p>`,
    ...safeParagraphs.map((paragraph) => `<p>${paragraph}</p>`),
    cta
      ? `<p style="margin: 24px 0"><a href="${cta.url}" style="background-color:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">${cta.label}</a></p>`
      : '',
    `<p style="color:#6b7280;font-size:12px;">${footer}</p>`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
  </head>
  <body style="font-family:Arial, Helvetica, sans-serif; color:#111827; background-color:#f9fafb; padding:24px;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 10px 25px rgba(15, 23, 42, 0.08);">
      <h1 style="font-size:24px; margin-top:0; color:#111827;">${title}</h1>
      ${htmlBody}
    </div>
  </body>
</html>`;

  return { html, text };
}
