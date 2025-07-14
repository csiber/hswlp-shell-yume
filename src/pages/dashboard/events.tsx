import type { GetServerSideProps } from 'next'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import EventGrid from '@/components/events/EventGrid'
import Head from 'next/head'

export const runtime = 'experimental-edge'

interface EventsPageProps {
  events: {
    id: string
    title: string
    slug: string
    description: string
    date: string
    location: string
    cover_url?: string | null
  }[]
}

export const getServerSideProps: GetServerSideProps<EventsPageProps> = async () => {
  const { env } = getCloudflareContext()
  const result = await env.DB.prepare(
    `SELECT id, title, slug, description, date, location, cover_url
     FROM events
     WHERE is_public = 1 AND date >= CURRENT_TIMESTAMP
     ORDER BY date ASC
     LIMIT 20`
  ).all<Record<string, string>>()

  const events = (result.results || []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    date: row.date,
    location: row.location,
    cover_url: row.cover_url || null,
  }))

  return { props: { events } }
}

export default function EventsPage({ events }: EventsPageProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Head>
        <title>Események</title>
      </Head>
      <h1 className="mb-4 text-3xl font-bold">Események</h1>
      <EventGrid events={events} />
    </div>
  )
}
