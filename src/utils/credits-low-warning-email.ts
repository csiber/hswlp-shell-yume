export interface CreditsLowWarningEmailData {
  userName?: string;
}

export function renderCreditsLowWarningEmail({ userName }: CreditsLowWarningEmailData) {
  const html = `<!DOCTYPE html>
<html lang="hu">
  <body>
    <p>Kedves ${userName || 'felhasználó'}!</p>
    <p>Jelenleg 0 pontod van. Azóta új képek, badge-ek, funkciók jelentek meg...</p>
    <p><a href="https://yumekai.com/credits">Tölts fel pontot most → yumekai.com/credits</a></p>
  </body>
</html>`;
  const text = `Kedves ${userName || 'felhasználó'}!\n\nJelenleg 0 pontod van. Azóta új képek, badge-ek, funkciók jelentek meg...\nTölts fel pontot most → https://yumekai.com/credits`;
  return { html, text };
}
