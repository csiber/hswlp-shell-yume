export interface ModerationEmailData {
  title: string;
}

export function renderModerationEmail({ title }: ModerationEmailData) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>A new image requires moderation.</p>
    <p>Title: ${title}</p>
    <p><a href="https://yumekai.com/moderation">Review now → yumekai.com/moderation</a></p>
  </body>
</html>`;
  const text = `A new image requires moderation.\nTitle: ${title}\nReview now → https://yumekai.com/moderation`;
  return { html, text };
}
