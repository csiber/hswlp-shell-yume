import { useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<{ online: number }>)

export default function useOnlineCount() {
  const { data, mutate } = useSWR('/api/presence', fetcher, {
    refreshInterval: 30000,
  })

  useEffect(() => {
    let sessionId = sessionStorage.getItem('presence_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('presence_session_id', sessionId)
    }

    let interval = setInterval(() => {
      fetch(`/api/presence?session_id=${sessionId}`, { method: 'PUT' })
    }, 30000)

    fetch(`/api/presence?session_id=${sessionId}`, { method: 'PUT' })

    const onVisibility = () => {
      if (document.hidden) {
        clearInterval(interval)
      } else {
        interval = setInterval(() => {
          fetch(`/api/presence?session_id=${sessionId}`, { method: 'PUT' })
          mutate()
        }, 30000)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [mutate])

  return data?.online ?? 0
}
