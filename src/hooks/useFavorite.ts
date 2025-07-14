import { useState } from 'react'

export function useFavorite(initial: boolean, uploadId: string) {
  const [favorited, setFavorited] = useState(initial)

  async function toggle() {
    try {
      if (favorited) {
        const res = await fetch('/api/favorite', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upload_id: uploadId }),
        })
        if (res.ok) setFavorited(false)
      } else {
        const res = await fetch('/api/favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upload_id: uploadId }),
        })
        if (res.ok) setFavorited(true)
      }
    } catch {
      // ignore errors
    }
  }

  return { favorited, toggle }
}
