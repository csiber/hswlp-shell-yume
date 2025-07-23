"use client"
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function CreateAlbumDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const create = async () => {
    if (!name.trim()) return
    const res = await fetch('/api/albums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (res.ok) {
      toast.success('Album létrehozva')
      setName('')
      setOpen(false)
      onCreated?.()
    } else {
      toast.error('Hiba történt')
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Új album</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Új album létrehozása</DialogTitle>
        </DialogHeader>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Album neve" className="mb-4" />
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">Mégsem</Button>
          </DialogClose>
          <Button onClick={create}>Létrehozás</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
