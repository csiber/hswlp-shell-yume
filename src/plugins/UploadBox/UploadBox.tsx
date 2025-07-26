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
    if (!file) {
      toast.error("Missing file")
      return
    }
    startTransition(async () => {
      const form = new FormData()
      form.append("file", file)
      form.append("title", title)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (!res.ok) throw new Error("failed")
        const data = await res.json() as { download_points?: number }
        setFile(null)
        setTitle("")
        if (fileInputRef.current) fileInputRef.current.value = ""
        setShowSuccess(true)
        setDownloadPoints(data.download_points ?? null)
        toast.success("Upload successful, pending moderation")
        if (onSuccess) onSuccess()
      } catch {
        toast.error("Upload failed")
      }
    })
  }

  return (
    <Card className="mb-4 shadow-lg">
      <CardHeader>
        <h2 className="text-xl font-semibold">Upload</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Add a title to your upload... (optional)"
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
            {file ? "File selected" : "Drag file here or click"}
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
            Upload successful – awaiting moderation
            {downloadPoints !== null ? ` – file value: ${downloadPoints} credits` : ''}
          </p>
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
              <Spinner size="small" className="mr-2" /> Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
