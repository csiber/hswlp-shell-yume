import { cn } from "@/lib/utils";

export type FeedFilter = "all" | "image" | "music" | "prompt";

interface Props {
  total: number;
  images: number;
  music: number;
  prompts: number;
  filter: FeedFilter;
  onFilterChange: (f: FeedFilter) => void;
}

export default function FeedStats({
  total,
  images,
  music,
  prompts,
  filter,
  onFilterChange,
}: Props) {
  return (
    <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
      <button
        className={cn(
          "pb-1", 
          filter === "all" && "border-b-2 border-yellow-500 text-yellow-300 font-semibold"
        )}
        onClick={() => onFilterChange("all")}
      >
        📦 {total} items
      </button>
      <button
        className={cn(
          "pb-1", 
          filter === "image" && "border-b-2 border-yellow-500 text-yellow-300 font-semibold"
        )}
        onClick={() => onFilterChange("image")}
      >
        🖼️ {images} images
      </button>
      <button
        className={cn(
          "pb-1",
          filter === "music" && "border-b-2 border-yellow-500 text-yellow-300 font-semibold"
        )}
        onClick={() => onFilterChange("music")}
      >
        🎵 {music} music
      </button>
      <button
        className={cn(
          "pb-1",
          filter === "prompt" && "border-b-2 border-yellow-500 text-yellow-300 font-semibold"
        )}
        onClick={() => onFilterChange("prompt")}
      >
        💬 {prompts} prompts
      </button>
    </div>
  );
}
