export interface FirstPostEmailData {
  postUrl: string;
  likeCount?: number;
}

export function renderFirstPostEmail({ postUrl, likeCount }: FirstPostEmailData) {
  const likesText = likeCount && likeCount > 0
    ? `<p>M\u00e1r ${likeCount} ember kedvelte a posztodat.</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="hu">
  <body>
    <p>L\u00e1ttad m\u00e1r, h\u00e1nyan n\u00e9zt\u00e9k meg?</p>
    <p><a href="${postUrl}">${postUrl}</a></p>
    <p><a href="${postUrl}?share=1">Oszd meg m\u00e1sokkal is</a></p>
    ${likesText}
  </body>
</html>`;

  const text = `L\u00e1ttad m\u00e1r, h\u00e1nyan n\u00e9zt\u00e9k meg?\n${postUrl}\nOszd meg m\u00e1sokkal is: ${postUrl}?share=1${likeCount && likeCount > 0 ? `\nM\u00e1r ${likeCount} ember kedvelte a posztodat.` : ''}`;

  return { html, text };
}
