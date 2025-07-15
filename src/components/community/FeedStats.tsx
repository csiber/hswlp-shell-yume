export default function FeedStats({
  total,
  images,
  music,
  prompts,
}: {
  total: number;
  images: number;
  music: number;
  prompts: number;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-y-1 justify-between text-sm text-muted-foreground">
      <span className="block">📦 {total} elem</span>
      <span className="block">🖼️ {images} kép</span>
      <span className="block">🎵 {music} zene</span>
      <span className="block">💬 {prompts} prompt</span>
    </div>
  );
}
