import PostClient from './post.client'
import type { Metadata } from 'next'

interface ApiResponse {
  post: {
    id: string
    title: string
    description?: string | null
    url: string
    is_nsfw: boolean
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const canonicalUrl = `https://yumekai.com/post/${id}`

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/post/${id}`)
    if (!res.ok) throw new Error('Failed to load post')
    const data = (await res.json()) as ApiResponse
    const { post } = data

    const title = `${post.title || 'Untitled'} \u2013 Yumekai`
    const description = post.description?.slice(0, 150) ?? ''
    const image = post.is_nsfw
      ? 'https://yumekai.com/nsfw-placeholder.png'
      : post.url

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: 'article',
        url: canonicalUrl,
        title,
        description,
        images: [image],
      },
    }
  } catch {
    return {
      title: 'Untitled \u2013 Yumekai',
      alternates: { canonical: canonicalUrl },
    }
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  return <PostClient id={id} />
}
