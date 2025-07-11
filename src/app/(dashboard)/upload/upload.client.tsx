"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ShinyButton from '@/components/ui/shiny-button'
import { Spinner } from '@/components/ui/spinner'
import { UploadCloud } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function UploadClient() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim() || !type || !file) {
      setMessage({ type: 'error', text: 'Minden mező kitöltése kötelező' })
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('type', type)
    formData.append('file', file)
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('🎉 Feltöltés sikeres! Visszairányítunk a dashboardra...')
        setMessage({ type: 'success', text: '🎉 Feltöltés sikeres! Visszairányítunk a dashboardra...' })
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        toast.error(data.error || 'Hiba történt')
        setMessage({ type: 'error', text: data.error || 'Hiba történt' })
      }
    } catch (err) {
      console.error(err)
      toast.error('Hiba történt')
      setMessage({ type: 'error', text: 'Hiba történt' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Fájl feltöltése</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              placeholder="Cím"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select value={type} onValueChange={(v) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Típus kiválasztása" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Kép</SelectItem>
                <SelectItem value="music">Zene</SelectItem>
                <SelectItem value="prompt">Prompt</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <ShinyButton
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Spinner size="small" className="mr-2" /> Feltöltés...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" /> Feltöltés
                </>
              )}
            </ShinyButton>
          </form>
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`mt-4 rounded-md px-3 py-2 text-sm ${
                  message.type === 'success'
                    ? 'bg-green-500/20 text-green-600'
                    : 'bg-red-500/20 text-red-600'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
