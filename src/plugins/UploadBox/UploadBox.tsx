"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface UploadBoxProps {
  onSuccess?: () => void
}

export default function UploadBox({ onSuccess }: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [downloadPoints, setDownloadPoints] = useState<number | null>(null)

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
    setUploading(true)
    setUploadProgress(0)
    const form = new FormData()
    form.append("file", file)
    form.append("title", title)
    try {
      const res = await axios.post("/api/upload", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total)
            setUploadProgress(percent)
          }
        },
      })
      const data = res.data as { download_points?: number }
      setFile(null)
      setTitle("")
      if (fileInputRef.current) fileInputRef.current.value = ""
      setShowSuccess(true)
      setDownloadPoints(data.download_points ?? null)
      toast.success("Sikeres feltöltés, moderációra vár")
      if (onSuccess) onSuccess()
    } catch (e) {
      console.error(e)
      toast.error("Feltöltés sikertelen")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
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
          <p className="text-center text-sm text-green-600">
            Sikeres feltöltés – moderációra vár
            {downloadPoints !== null ? ` – a fájl értéke: ${downloadPoints} pont` : ''}
          </p>
        )}
        {uploading && (
          <>
            <Progress value={uploadProgress} />
            <p className="text-center text-sm text-muted-foreground">
              {uploadProgress}%
            </p>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={upload}
          disabled={uploading}
          className="w-full flex items-center justify-center"
        >
          {uploading ? (
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
