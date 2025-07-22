import AlbumClient from './album.client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AlbumPage({ params }: PageProps) {
  const { id } = await params
  return <AlbumClient id={id} />
}
