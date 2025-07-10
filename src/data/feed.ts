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
  },
]
