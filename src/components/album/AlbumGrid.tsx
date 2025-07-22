"use client"
import AlbumImageCard, { type AlbumFile } from './AlbumImageCard'

export default function AlbumGrid({ files }: { files: AlbumFile[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {files.map(file => (
        <AlbumImageCard key={file.id} file={file} />
      ))}
    </div>
  )
}
