"use client"

import { Dialog, DialogContent } from "./dialog"
import { motion } from "framer-motion"
import { useState } from "react"

interface ImageLightboxProps {
  src: string
  alt?: string
  children: React.ReactNode
}

export default function ImageLightbox({ src, alt, children }: ImageLightboxProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-zoom-in">
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-transparent border-none shadow-none p-0 flex items-center justify-center">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={src}
            alt={alt}
            className="max-h-[90vh] w-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
