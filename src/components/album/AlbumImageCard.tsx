"use client"
import ImageLightbox from '@/components/ui/ImageLightbox'
import WatermarkedImage from '@/components/ui/WatermarkedImage'

export interface AlbumFile {
  id: string
  title: string
  mime: string | null
  url: string
}

export default function AlbumImageCard({ file }: { file: AlbumFile }) {
  return (
    <ImageLightbox src={file.url} alt={file.title}>
      <WatermarkedImage
        src={file.url}
        alt={file.title}
        className="object-cover w-full aspect-square rounded"
      />
    </ImageLightbox>
  )
}
