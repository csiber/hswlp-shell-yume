'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeletionLogItem {
  id: string
  upload_id: string
  deleted_at: string
  title: string | null
  type: 'image' | 'music' | 'prompt' | null
}

interface DeletionResponse {
  success: boolean
  deletions: DeletionLogItem[]
}

export default function DeletionLogsPage() {
  const [logs, setLogs] = useState<DeletionLogItem[] | null>(null)

  useEffect(() => {
    fetch('/api/my-files/deletions')
      .then((res) => res.json() as Promise<DeletionResponse>)
      .then((data) => {
        if (data.success) {
          setLogs(data.deletions)
        }
      })
  }, [])

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Törlési napló</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs ? (
            <div className="flex justify-center items-center py-10 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Betöltés...
            </div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground">Még nincs törlés rögzítve.</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li key={log.id} className="text-sm">
                  <span className="font-medium">{log.title || '(ismeretlen fájl)'}</span>{' '}
                  – <span className="text-muted-foreground">{log.type}</span>{' '}
                  <span className="text-xs text-zinc-400">({new Date(log.deleted_at).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
