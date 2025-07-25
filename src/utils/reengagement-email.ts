export interface ReengagementEmailData {
  userName?: string;
}

export function renderReengagementEmail({ userName }: ReengagementEmailData) {
  const html = `<!DOCTYPE html>
<html lang="hu">
  <body>
    <p>Szia ${userName || 'felhasználó'}! 7 napja nem jártál nálunk. Ezalatt sok minden történt!</p>
    <p>🎴 Új képek kerültek fel a galériába – köztük egy csomó NSFW is.</p>
    <p><a href="https://yumekai.com/explore">Nézd meg most → yumekai.com/explore</a></p>
    <p>Ne szeretnél több ilyen levelet? Állítsd be az értesítéseidet itt.</p>
  </body>
</html>`;
  const text = `Szia ${userName || 'felhasználó'}! 7 napja nem jártál nálunk. Ezalatt sok minden történt!\n\n🎴 Új képek kerültek fel a galériába – köztük egy csomó NSFW is.\nNézd meg most → https://yumekai.com/explore\n\nNe szeretnél több ilyen levelet? Állítsd be az értesítéseidet itt.`;
  return { html, text };
}
