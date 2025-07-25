export interface NewBadgeEmailData {
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
}

export function renderNewBadgeEmail({ badgeName, badgeDescription, badgeIcon }: NewBadgeEmailData) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>You earned the ${badgeName} badge! This means...</p>
    <p>${badgeIcon} ${badgeDescription}</p>
    <p><a href="https://yumekai.com/profile">View your profile → yumekai.com/profile</a></p>
  </body>
</html>`;

  const text = `You earned the ${badgeName} badge! This means...\n${badgeIcon} ${badgeDescription}\nView your profile → https://yumekai.com/profile`;

  return { html, text };
}
