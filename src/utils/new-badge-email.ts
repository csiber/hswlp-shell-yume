export interface NewBadgeEmailData {
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
}

export function renderNewBadgeEmail({ badgeName, badgeDescription, badgeIcon }: NewBadgeEmailData) {
  const html = `<!DOCTYPE html>
<html lang="hu">
  <body>
    <p>Megszerezted a(z) ${badgeName} rangot! Ez azt jelenti, hogy...</p>
    <p>${badgeIcon} ${badgeDescription}</p>
    <p><a href="https://yumekai.com/profile">Nézd meg profilod → yumekai.com/profile</a></p>
  </body>
</html>`;

  const text = `Megszerezted a(z) ${badgeName} rangot! Ez azt jelenti, hogy...\n${badgeIcon} ${badgeDescription}\nNézd meg profilod → https://yumekai.com/profile`;

  return { html, text };
}
