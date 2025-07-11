"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function UploadClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Sikeres feltöltés')
        router.push('/dashboard')
      } else {
        toast.error(data.error || 'Hiba történt')
      }
    } catch (err) {
      console.error(err)
      toast.error('Hiba történt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <Input name="title" placeholder="Cím" required />
      <select name="type" className="w-full border rounded px-2 py-1" required>
        <option value="image">Kép</option>
        <option value="music">Zene</option>
        <option value="prompt">Prompt</option>
      </select>
      <Input type="file" name="file" required />
      <Button type="submit" disabled={loading}>
        Feltöltés
      </Button>
    </form>
  )
}
