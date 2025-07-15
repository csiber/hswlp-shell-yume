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
    <div className="mb-4 flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
      <span>📦 Összes elem: {total}</span>
      <span>🖼️ Képek: {images}</span>
      <span>🎵 Zenék: {music}</span>
      <span>💬 Promptek: {prompts}</span>
    </div>
  );
}
