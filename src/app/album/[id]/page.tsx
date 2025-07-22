'use client'
import useSWR from 'swr'
import ImageLightbox from '@/components/ui/ImageLightbox'

interface FileItem {
  id: string
  title: string
  mime: string | null
  url: string
}

interface ApiResponse {
  album: { id: string; name: string; files: FileItem[] }
}

export default function AlbumPage({ params }: { params: { id: string } }) {
  const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<ApiResponse>)
  const { data } = useSWR<ApiResponse>(`/api/albums/${params.id}`, fetcher)
  if (!data) return <div className="p-4">Betöltés...</div>
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{data.album.name}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.album.files.map(f => (
          <ImageLightbox key={f.id} src={f.url} alt={f.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={f.title} className="object-cover w-full aspect-square rounded" />
          </ImageLightbox>
        ))}
      </div>
    </main>
  )
}
