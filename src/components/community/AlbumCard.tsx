"use client";
import WatermarkedImage from '@/components/ui/WatermarkedImage'

export default function AlbumCard({ album }: { album: { id: string; name: string; images: string[]; author: string } }) {
  return (
    <div className="p-2 border rounded shadow relative">
      <div className="relative h-32">
        {album.images.slice(0,3).map((img, i) => (
          <WatermarkedImage
            key={i}
            src={img}
            alt={album.name}
            width={80}
            height={80}
            className={`absolute w-20 h-20 object-cover rounded ${i===0?'z-30 top-0 left-0':'z-20 top-2 left-2'} ${i===2?'z-10 top-4 left-4':''}`}
          />
        ))}
      </div>
      <div className="mt-24 text-sm font-bold">
        {album.name} ({album.images.length} images)
      </div>
      <div className="text-xs text-muted-foreground">{album.author}</div>
    </div>
  )
}
