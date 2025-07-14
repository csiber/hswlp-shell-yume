"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

interface UploadBoxProps {
  onSuccess?: () => void
}

export default function UploadBox({ onSuccess }: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [dragging, setDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!showSuccess) return
    const id = setTimeout(() => setShowSuccess(false), 2500)
    return () => clearTimeout(id)
  }, [showSuccess])

  function handleFiles(files: FileList | null) {
    const first = files?.[0]
    if (first) setFile(first)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  async function upload() {
    if (!file || !title.trim()) {
      toast.error("Hiányzó fájl vagy cím")
      return
    }
    startTransition(async () => {
      const form = new FormData()
      form.append("file", file)
      form.append("title", title)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (!res.ok) throw new Error("failed")
        setFile(null)
        setTitle("")
        if (fileInputRef.current) fileInputRef.current.value = ""
        setShowSuccess(true)
        toast.success("Sikeres feltöltés")
        if (onSuccess) onSuccess()
      } catch {
        toast.error("Feltöltés sikertelen")
      }
    })
  }

  return (
    <Card className="mb-4 shadow-lg">
      <CardHeader>
        <h2 className="text-xl font-semibold">Feltöltés</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Adj címet a feltöltésednek..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-sm transition-colors ${dragging ? "bg-primary/10" : "bg-muted"}`}
        >
          <p className="select-none text-muted-foreground">
            {file ? "Fájl kiválasztva" : "Húzd ide a fájlt vagy kattints"}
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
        {showSuccess && (
          <p className="text-center text-sm text-green-600">Sikeres feltöltés</p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={upload}
          disabled={isPending}
          className="w-full flex items-center justify-center"
        >
          {isPending ? (
            <>
              <Spinner size="small" className="mr-2" /> Feltöltés...
            </>
          ) : (
            "Feltöltés"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
