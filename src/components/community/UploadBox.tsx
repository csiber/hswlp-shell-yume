"use client";

import { useState, useRef } from "react";
import { v4 as uuidv4 } from 'uuid'
import { parseBlob } from "music-metadata-browser";
import { formatTitle } from "@/utils/music";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import clsx from "clsx";
import {
  UploadCloud,
  File as FileIcon,
  Image as ImageIcon,
  Music as MusicIcon,
} from "lucide-react";
import AudioWaveform from "@/components/AudioWaveform";
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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [albumName, setAlbumName] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const prepareTitles = async (files: FileList) => {
    const entries: Record<string, string> = {}
    for (const file of Array.from(files)) {
      const type = detectType(file)
      if (type === 'image') {
        entries[file.name] = ''
      } else if (type === 'music') {
        try {
          const meta = await parseBlob(file)
          const common = meta.common || {}
          const t = common.title ? formatTitle(common.title) : formatTitle(file.name)
          entries[file.name] = common.artist ? `${common.artist} - ${t}` : t
        } catch {
          entries[file.name] = formatTitle(file.name)
        }
      } else {
        entries[file.name] = formatTitle(file.name)
      }
    }
    setTitles(entries)
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Nincs kiválasztott fájl");
      return;
    }

    if (selectedFiles.length > 10) {
      toast.error("Legfeljebb 10 fájlt tölthetsz fel egyszerre");
      return;
    }

    const isAlbum =
      selectedFiles.length >= 2 &&
      selectedFiles.length <= 10 &&
      Array.from(selectedFiles).every((f) => detectType(f) === "image");

    let currentAlbumId = albumId;
    let currentAlbumName = albumName;
    if (isAlbum && !currentAlbumId) {
      const name = window.prompt("Album neve:")?.trim();
      if (!name) {
        toast.error("Album név kötelező");
        return;
      }
      currentAlbumName = name;
      currentAlbumId = `alb_${uuidv4()}`;
      setAlbumId(currentAlbumId);
      setAlbumName(currentAlbumName);
    }

    setLoading(true);
    let success = false;
    for (const file of Array.from(selectedFiles)) {
      const formData = new FormData();
      const title = titles[file.name] ?? formatTitle(file.name);
      if (detectType(file) === "image" && !title.trim()) {
        toast.error(`Adj címet a képnek: ${file.name}`);
        continue;
      }
      formData.append("title", title);
      formData.append("type", detectType(file));
      formData.append("file", file);
      if (isAlbum && currentAlbumId) {
        formData.append("album_id", currentAlbumId);
        if (currentAlbumName) formData.append("album_name", currentAlbumName);
      }

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
    setSelectedFiles(null);
    setTitles({});
    setAlbumId(null);
    setAlbumName(null);
    if (success && onUpload) onUpload();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(e.dataTransfer.files);
      await prepareTitles(e.dataTransfer.files);
    }
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
                onChange={async (e) => {
                  if (e.target.files) {
                    setSelectedFiles(e.target.files)
                    await prepareTitles(e.target.files)
                  }
                }}
              />
            </label>
          </p>
        </div>
        {selectedFiles && selectedFiles.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {Array.from(selectedFiles).map((file) => {
              const url = URL.createObjectURL(file);
              const isImage = file.type.startsWith("image/");
              const isAudio = file.type.startsWith("audio/");
              return (
                <li
                  key={file.name}
                  className="rounded bg-gray-100 p-2 text-sm dark:bg-gray-800"
                >
                  <div className="flex items-center gap-1">
                    {isImage ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : isAudio ? (
                      <MusicIcon className="h-4 w-4" />
                    ) : (
                      <FileIcon className="h-4 w-4" />
                    )}
                    {isImage ? (
                      <input
                        type="text"
                        placeholder="Kép címe"
                        className="border rounded px-1 text-sm flex-1"
                        value={titles[file.name] ?? ''}
                        onChange={(e) =>
                          setTitles({ ...titles, [file.name]: e.target.value })
                        }
                      />
                    ) : (
                      <span className="truncate max-w-[120px]">
                        {titles[file.name] || formatTitle(file.name)}
                      </span>
                    )}
                  </div>
                  {isImage && (
                    <img
                      src={url}
                      alt="preview"
                      className="mt-1 max-w-[150px] rounded border"
                    />
                  )}
                  {isAudio && (
                    <div className="mt-1 w-full">
                      <AudioWaveform src={url} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={loading}
          className={clsx(
            "upload-button relative inline-flex h-12 min-w-[160px] items-center justify-center overflow-hidden rounded-md px-8 text-base font-semibold text-white shadow transition-all duration-300 w-full mt-3 sm:w-auto sm:mt-0",
            loading
              ? "bg-gray-600"
              : "bg-gradient-to-r from-black via-gray-800 to-black hover:brightness-110",
          )}
        >
          <span className="z-10">{loading ? "Feltöltés..." : "Feltöltés"}</span>
          {!loading && <span className="upload-wave-glow" />}
        </button>
      </CardFooter>
    </Card>
  );
}
