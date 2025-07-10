export interface FeedPost {
  id: number
  type: 'question' | 'idea' | 'news' | 'poll' | 'update' | 'community'
  author: string
  avatar?: string
  title: string
  description: string
  date: string
  tags: string[]
  comments: number
  likes: number
  /** Optional visual layout variation */
  layout?: 'default' | 'reverse' | 'compact'
}

export const feedPosts: FeedPost[] = [
  {
    id: 1,
    type: 'idea',
    author: 'Anna Kovacs',
    title: 'Keresek tesztelőket egy új pluginhoz',
    description: 'Ha érdekel a korai hozzáférés, jelentkezz!',
    date: new Date(Date.now() - 5 * 3600_000).toISOString(),
    tags: ['plugin', 'tesztelés'],
    comments: 5,
    likes: 20,
    layout: 'reverse',
  },
  {
    id: 2,
    type: 'update',
    author: 'Team Yume',
    title: 'Megérkezett a dark mode',
    description: 'Mostantól válthatsz világos és sötét téma között.',
    date: new Date().toISOString(),
    tags: ['frissítés', 'dark mode'],
    comments: 3,
    likes: 12,
    layout: 'compact',
  },
  {
    id: 3,
    type: 'question',
    author: 'Béla',
    title: 'Napi kérdés: melyik plugin a kedvencetek?',
    description: 'Osszátok meg a tapasztalataitokat a kommentek között!',
    date: new Date(Date.now() - 2 * 3600_000).toISOString(),
    tags: ['kérdés', 'plugins'],
    comments: 17,
    likes: 9,
    layout: 'default',
  },
  {
    id: 4,
    type: 'poll',
    author: 'Yume Devs',
    title: 'Szavazás: melyik funkciót fejlesszük tovább?',
    description: '1. Integrációk 2. Személyre szabható UI 3. Mobil app',
    date: new Date(Date.now() - 6 * 3600_000).toISOString(),
    tags: ['szavazás', 'fejlesztés'],
    comments: 8,
    likes: 13,
    layout: 'default',
  },
  {
    id: 5,
    type: 'news',
    author: 'HírBot',
    title: 'Pluginverseny indul!',
    description: 'Mutasd meg te is, mire vagy képes a Yume plugin API-jával.',
    date: new Date(Date.now() - 8 * 3600_000).toISOString(),
    tags: ['verseny', 'hír'],
    comments: 2,
    likes: 10,
    layout: 'default',
  },
  {
    id: 6,
    type: 'community',
    author: 'Admin',
    title: 'Heti közösségi frissítés',
    description: 'Összefoglaljuk a legérdekesebb bejegyzéseket a héten.',
    date: new Date(Date.now() - 12 * 3600_000).toISOString(),
    tags: ['közösség', 'update'],
    comments: 1,
    likes: 5,
    layout: 'reverse',
  },
  {
    id: 7,
    type: 'news',
    author: 'Yume Hírek',
    title: 'Új partnerség a Cloudflare-rel',
    description:
      'Örömmel jelentjük be, hogy a Yume hivatalos Cloudflare partnerré vált.',
    date: new Date(Date.now() - 14 * 3600_000).toISOString(),
    tags: ['partner', 'hír'],
    comments: 4,
    likes: 22,
    layout: 'compact',
  },
  {
    id: 8,
    type: 'idea',
    author: 'Csilla',
    title: 'Pluginverseny ötlet: AI asszisztens',
    description:
      'Mit szólnátok egy olyan pluginhoz, ami AI segítségével ír kódot?',
    date: new Date(Date.now() - 16 * 3600_000).toISOString(),
    tags: ['plugin', 'ai'],
    comments: 6,
    likes: 18,
    layout: 'default',
  },
]
