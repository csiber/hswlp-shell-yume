"use client"
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Item { id: string; prompt: string; style: string; offered_credits: number; status: string }

const fetcher = (url:string) => fetch(url).then(res => res.json() as Promise<{ items: Item[] }>)

export default function MyRequestsClient() {
  const { data, mutate } = useSWR('/api/my-requests', fetcher)

  const approve = async (reqId: string, subId: string) => {
    const res = await fetch(`/api/requests/${reqId}/approve/${subId}`, { method: 'POST' })
    if (res.ok) {
      toast.success('Approved')
      mutate()
    } else {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {data?.items?.length ? (
        data.items.map(it => (
          <div key={it.id} className="border p-2 rounded space-y-2">
            <p className="font-medium">{it.prompt}</p>
            <p className="text-sm">{it.style} – {it.offered_credits} credits – {it.status}</p>
            {it.status === 'open' && (
              <Submissions requestId={it.id} onApprove={approve} />
            )}
          </div>
        ))
      ) : (
        <p>You have no requests.</p>
      )}
    </div>
  )
}

interface Submission { id: string; file_url: string; is_approved: boolean }
const fetchSubmissions = (url: string) => fetch(url).then(res => res.json() as Promise<{ items: Submission[] }>)

function Submissions({ requestId, onApprove }: { requestId: string; onApprove: (r: string, s: string) => void }) {
  const { data } = useSWR<{ items: Submission[] }>(`/api/my-requests/${requestId}`, fetchSubmissions)
  if (!data?.items?.length) return null
  return (
    <div className="space-y-2">
      {data.items.map(s => (
        <div key={s.id} className="flex justify-between items-center border p-2 rounded">
          <span>{s.file_url}</span>
          {!s.is_approved && <Button size="sm" onClick={() => onApprove(requestId, s.id)}>Approve</Button>}
        </div>
      ))}
    </div>
  )
}
