"use client"

import { Dialog, DialogContent, DialogClose } from "./dialog"
import { motion } from "framer-motion"
import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface GalleryItem {
  src: string
  alt?: string
  title?: string | null
  author?: string | null
}

interface ImageLightboxProps {
  src: string
  alt?: string
  children: React.ReactNode
  onOpen?: () => void
  images?: GalleryItem[]
  index?: number
}

export default function ImageLightbox({
  src,
  alt,
  children,
  onOpen,
  images,
  index = 0,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false)
  const [visibleImages, setVisibleImages] = useState<GalleryItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const startPos = useRef<{ x: number; y: number } | null>(null)

  const openDialog = () => {
    setVisibleImages(images && images.length ? images : [{ src, alt }])
    setCurrentIndex(index)
    setOpen(true)
    onOpen?.()
  }

  const closeDialog = useCallback(() => setOpen(false), [])
  const showNext = useCallback(
    () => setCurrentIndex((i) => Math.min(i + 1, visibleImages.length - 1)),
    [visibleImages.length]
  )
  const showPrev = useCallback(
    () => setCurrentIndex((i) => Math.max(i - 1, 0)),
    []
  )

  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'Escape') closeDialog()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, visibleImages, showNext, showPrev, closeDialog])

  useEffect(() => {
    if (!open) return
    const preload = (img?: GalleryItem) => {
      if (!img) return
      const i = new Image()
      i.src = img.src
    }
    preload(visibleImages[currentIndex - 1])
    preload(visibleImages[currentIndex + 1])
  }, [open, currentIndex, visibleImages])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    startPos.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!startPos.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - startPos.current.x
    const dy = t.clientY - startPos.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (dx < 0) showNext()
      else showPrev()
    } else if (Math.abs(dy) > 30 && dy > 0) {
      closeDialog()
    }
    startPos.current = null
  }

  const item = visibleImages[currentIndex] || { src, alt }

  return (
    <>
      <div onClick={openDialog} className="cursor-zoom-in">
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black/90 border-none shadow-none p-0 flex items-center justify-center fixed inset-0">
          <div
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {visibleImages.length > 1 && (
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {currentIndex + 1} / {visibleImages.length}
              </span>
            )}
            {visibleImages.length > 1 && (
              <button
                onClick={showPrev}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={item.src}
              alt={item.alt}
              onContextMenu={(e) => e.preventDefault()}
              className="max-h-full max-w-full rounded-lg select-none"
            />
            {visibleImages.length > 1 && (
              <button
                onClick={showNext}
                disabled={currentIndex >= visibleImages.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <DialogClose asChild>
              <button className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </DialogClose>
            {(item.title || item.author) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm text-center space-y-1">
                {item.title && <div>{item.title}</div>}
                {item.author && <div className="text-xs">{item.author}</div>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
