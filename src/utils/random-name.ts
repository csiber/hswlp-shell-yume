export function generateRandomName(): string {
  const adjectives = [
    'magical',
    'silent',
    'crimson',
    'lucky',
    'mystic',
    'bright',
    'silver',
    'shadow',
  ]
  const nouns = [
    'forest',
    'dream',
    'sky',
    'ocean',
    'flower',
    'river',
    'cloud',
    'star',
  ]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 1000)
  return `${adj}-${noun}-${num}`
}
