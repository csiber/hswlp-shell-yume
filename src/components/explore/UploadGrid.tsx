import { Card } from '@/components/ui/card'

export interface UploadItem {
  id: string
  type: 'image' | 'music' | 'prompt'
  url: string
  title: string | null
}

export default function UploadGrid({ items }: { items: UploadItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          {item.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.title || ''}
              className="h-48 w-full object-cover"
            />
          ) : item.type === 'music' ? (
            <audio controls src={item.url} className="w-full" />
          ) : (
            <div className="p-4 text-sm">{item.title}</div>
          )}
          {item.type !== 'prompt' && (
            <div className="p-2 text-sm text-center">{item.title}</div>
          )}
        </Card>
      ))}
    </div>
  )
}
