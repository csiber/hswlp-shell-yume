"use client"

import LiveMusicFeed from '@/components/live/LiveMusicFeed'
import LiveImageFeed from '@/components/live/LiveImageFeed'
import LiveStreamEmbed from '@/components/live/LiveStreamEmbed'

export default function LivePageClient() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Live közvetítés</h1>
      <LiveStreamEmbed />
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🎵 Élő zenék</h2>
        <LiveMusicFeed />
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🖼️ Élő képek</h2>
        <LiveImageFeed />
      </section>
    </div>
  )
}
