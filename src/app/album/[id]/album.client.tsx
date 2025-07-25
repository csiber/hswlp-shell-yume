"use client"
import useSWR from 'swr'
import AlbumHeader from '@/components/album/AlbumHeader'
import AlbumGrid from '@/components/album/AlbumGrid'

interface FileItem {
  id: string
  title: string
  mime: string | null
  url: string
}

interface ApiResponse {
  album: {
    id: string
    name: string
    user_id: string
    created_at: string
    author?: string | null
    files: FileItem[]
  }
}

interface AlbumClientProps {
  id: string
}

export default function AlbumClient({ id }: AlbumClientProps) {
  const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<ApiResponse>)
  const { data } = useSWR<ApiResponse>(`/api/albums/${id}`, fetcher)
  if (!data) return <div className="p-4">Loading...</div>
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <AlbumHeader
        album={{
          id: data.album.id,
          name: data.album.name,
          user_id: data.album.user_id,
          created_at: data.album.created_at,
          author: data.album.author,
          fileCount: data.album.files.length,
        }}
      />
      <AlbumGrid files={data.album.files} />
    </main>
  )
}
