"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import clsx from "clsx";
import { UploadCloud } from "lucide-react";
import "./UploadBox.css";

function detectType(file: File): "image" | "music" | "prompt" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "music";
  if (file.type.startsWith("text/")) return "prompt";
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp3", "wav", "ogg"].includes(ext)) return "music";
  if (["txt", "prompt", "md"].includes(ext)) return "prompt";
  return "image";
}

export default function UploadBox({ onUpload }: { onUpload?: () => void }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast.error("Nincs kiválasztott fájl");
      return;
    }

    setLoading(true);
    let success = false;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("title", file.name);
      formData.append("type", detectType(file));
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { success: boolean; error?: string };
        if (res.ok && data.success) {
          success = true;
          toast.success(`Feltöltve: ${file.name}`);
        } else {
          toast.error(data.error || `Hiba a(z) ${file.name} feltöltésekor`);
        }
      } catch {
        toast.error(`Hálózati hiba: ${file.name}`);
      }
    }

    setLoading(false);
    setFiles(null);
    if (success && onUpload) onUpload();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFiles(e.dataTransfer.files);
    dropRef.current?.classList.remove("dragover");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropRef.current?.classList.add("dragover");
  };

  const handleDragLeave = () => {
    dropRef.current?.classList.remove("dragover");
  };

  return (
    <Card className="mb-6 animate-fade-in rounded-xl border bg-white shadow dark:bg-gray-900">
      <CardHeader>
        <h2 className="text-2xl font-bold tracking-tight">Feltöltés</h2>
      </CardHeader>
      <CardContent>
        <div
          ref={dropRef}
          className="upload-dropzone relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-black dark:border-gray-700 dark:hover:border-white"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Húzd ide a fájlokat vagy
            <label className="ml-1 cursor-pointer font-medium underline">
              válassz ki
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
              />
            </label>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={loading}
          className={clsx(
            "upload-button relative inline-flex h-12 min-w-[160px] items-center justify-center overflow-hidden rounded-md px-8 text-base font-semibold text-white shadow transition-all duration-300",
            loading
              ? "bg-gray-600"
              : "bg-gradient-to-r from-black via-gray-800 to-black hover:brightness-110"
          )}
        >
          <span className="z-10">{loading ? "Feltöltés..." : "Feltöltés"}</span>
          {!loading && <span className="upload-wave-glow" />}
        </button>
      </CardFooter>
    </Card>
  );
}
