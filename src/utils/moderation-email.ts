export interface ModerationEmailData {
  title: string;
}

export function renderModerationEmail({ title }: ModerationEmailData) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>A new image requires moderation.</p>
    <p>Title: ${title}</p>
    <p><a href="https://yumekai.app/moderate">Review now → yumekai.com/moderate</a></p>
  </body>
</html>`;
  const text = `A new image requires moderation.\nTitle: ${title}\nReview now → https://yumekai.app/moderate`;
  return { html, text };
}
