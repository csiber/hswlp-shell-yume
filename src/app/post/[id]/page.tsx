import PostClient from './post.client'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    alternates: { canonical: `https://yumekai.com/post/${id}` },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  return <PostClient id={id} />
}
