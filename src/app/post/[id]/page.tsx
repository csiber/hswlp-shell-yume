import PostClient from './post.client'
import type { Metadata } from 'next'

interface ApiResponse {
  post: {
    id: string
    title: string
    url: string
    is_nsfw: boolean
    author: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const canonicalUrl = `https://yumekai.app/post/${id}`

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/post/${id}`)
    if (!res.ok) throw new Error('Failed to load post')
    const data = (await res.json()) as ApiResponse
    const { post } = data

    const title = post.title || 'Untitled Post'
    const description = `Created by ${post.author}`
    const image = post.is_nsfw
      ? 'https://yumekai.app/nsfw-placeholder.png'
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
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    }
  } catch {
    return {
      title: 'Untitled Post',
      alternates: { canonical: canonicalUrl },
    }
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  return <PostClient id={id} />
}
