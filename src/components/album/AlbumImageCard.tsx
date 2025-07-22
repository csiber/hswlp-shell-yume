"use client"
import ImageLightbox from '@/components/ui/ImageLightbox'

export interface AlbumFile {
  id: string
  title: string
  mime: string | null
  url: string
}

export default function AlbumImageCard({ file }: { file: AlbumFile }) {
  return (
    <ImageLightbox src={file.url} alt={file.title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={file.url}
        alt={file.title}
        className="object-cover w-full aspect-square rounded"
      />
    </ImageLightbox>
  )
}
