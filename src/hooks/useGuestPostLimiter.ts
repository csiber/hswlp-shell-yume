"use client"

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'guest_post_views'
const LIMIT = 30
const DAY_MS = 24 * 60 * 60 * 1000

export default function useGuestPostLimiter(isGuest: boolean) {
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    if (!isGuest) return

    const now = Date.now()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      let count = 1
      let expires = now + DAY_MS

      if (stored) {
        const data = JSON.parse(stored) as { count: number; expires: number }
        if (data.expires > now) {
          count = data.count + 1
          expires = data.expires
        }
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ count, expires })
      )

      setLimitReached(count > LIMIT)
    } catch {
      // ignore JSON errors
    }
  }, [isGuest])

  return limitReached
}
