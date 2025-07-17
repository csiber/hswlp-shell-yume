export function formatTitle(name: string): string {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

export function guessMetaFromFilename(name: string): {
  title: string;
  artist: string | null;
} {
  const cleaned = formatTitle(name);
  const parts = cleaned.split(' - ');
  if (parts.length >= 2) {
    const artist = parts.shift()!.trim();
    const title = parts.join(' - ').trim();
    return { title, artist: artist || null };
  }
  return { title: cleaned, artist: null };
}
