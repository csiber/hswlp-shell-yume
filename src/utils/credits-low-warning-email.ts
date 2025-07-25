export interface CreditsLowWarningEmailData {
  userName?: string;
}

export function renderCreditsLowWarningEmail({ userName }: CreditsLowWarningEmailData) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>Dear ${userName || 'user'}!</p>
    <p>You currently have 0 credits. New images, badges and features have appeared...</p>
    <p><a href="https://yumekai.com/credits">Top up now → yumekai.com/credits</a></p>
  </body>
</html>`;
  const text = `Dear ${userName || 'user'}!\n\nYou currently have 0 credits. New images, badges and features have appeared...\nTop up now → https://yumekai.com/credits`;
  return { html, text };
}
