export interface ReengagementEmailData {
  userName?: string;
}

export function renderReengagementEmail({ userName }: ReengagementEmailData) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>Hi ${userName || 'user'}! You haven't visited us for 7 days and a lot has happened!</p>
    <p>🎴 New images have been added to the gallery – including plenty of NSFW.</p>
    <p><a href="https://yumekai.com/explore">Check them out → yumekai.com/explore</a></p>
    <p>Don't want more emails like this? Update your notifications here.</p>
  </body>
</html>`;
  const text = `Hi ${userName || 'user'}! You haven't visited us for 7 days and a lot has happened!\n\n🎴 New images have been added to the gallery – including plenty of NSFW.\nCheck them out → https://yumekai.com/explore\n\nDon't want more emails like this? Update your notifications here.`;
  return { html, text };
}
