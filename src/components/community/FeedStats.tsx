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
    <div className="mb-4 flex flex-wrap gap-y-1 justify-between text-sm text-muted-foreground">
      <span
        className={cn("block cursor-pointer", filter === "all" && "font-semibold text-primary")}
        onClick={() => onFilterChange("all")}
      >
        📦 {total} items
      </span>
      <span
        className={cn("block cursor-pointer", filter === "image" && "font-semibold text-primary")}
        onClick={() => onFilterChange("image")}
      >
        🖼️ {images} images
      </span>
      <span
        className={cn("block cursor-pointer", filter === "music" && "font-semibold text-primary")}
        onClick={() => onFilterChange("music")}
      >
        🎵 {music} music
      </span>
      <span
        className={cn("block cursor-pointer", filter === "prompt" && "font-semibold text-primary")}
        onClick={() => onFilterChange("prompt")}
      >
        💬 {prompts} prompts
      </span>
    </div>
  );
}
