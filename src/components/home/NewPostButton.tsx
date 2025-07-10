"use client"
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewPostButton() {
  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg md:hidden"
    >
      <Plus className="size-5" />
      <span className="sr-only">Új poszt</span>
    </Button>
  )
}
