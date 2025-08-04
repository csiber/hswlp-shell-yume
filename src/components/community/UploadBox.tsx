"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimpleID3Data } from "@/utils/simple-id3";
import { v4 as uuidv4 } from 'uuid'
import { formatTitle } from "@/utils/music";
import { MAX_ALBUM_UPLOAD } from "@/constants";
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
  CheckCircle,
} from "lucide-react";
import AudioWaveform from "@/components/AudioWaveform";
import "./UploadBox.css";
import { useSessionStore } from "@/state/session";
import UploadBanAlert from "@/components/UploadBanAlert";
import useSWR from 'swr'
import { Progress } from "@/components/ui/progress";
import WatermarkedImage from '@/components/ui/WatermarkedImage'
import Link from "next/link"

function detectType(file: File): "image" | "music" | "prompt" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "music";
  if (file.type.startsWith("text/")) return "prompt";
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "image";
  if (["mp3", "wav", "ogg"].includes(ext)) return "music";
  if (["txt", "prompt", "md"].includes(ext)) return "prompt";
  return "prompt";
}

export default function UploadBox({ onUpload }: { onUpload?: () => void }) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [albumName, setAlbumName] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const parseBlobRef = useRef<((file: Blob) => Promise<SimpleID3Data | null>) | null>(null);
  const uploadBanUntil = useSessionStore((s) => s.session?.user?.uploadBanUntil);
  const sessionUser = useSessionStore((s) => s.session?.user)
  const isAdmin = sessionUser?.role === 'admin'
  const [asUser, setAsUser] = useState('')
  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    import('@/utils/simple-id3').then((mod) => {
      parseBlobRef.current = async (file: Blob) => mod.parseID3(await file.arrayBuffer());
    });
  }, []);

  useEffect(() => {
    if (!isAdmin || asUser.trim().length < 2) {
      setUserOptions([]);
      return;
    }
    const controller = new AbortController();
    const loadUsers = async () => {
      try {
        const res = await fetch(
          `/api/admin/user-search?q=${encodeURIComponent(asUser)}`,
          { signal: controller.signal },
        );
        const data: { items: { id: string; name: string }[] } = res.ok
          ? await res.json()
          : { items: [] };
        setUserOptions(data.items || []);
      } catch {
        // ignore
      }
    };
    loadUsers();
    return () => controller.abort();
  }, [asUser, isAdmin]);

  const fetchQuota = async (u: string) => {
    try {
      const res = await fetch(u, { credentials: 'include' })
      if (!res.ok) throw new Error('failed')
      const data = (await res.json()) as { used?: unknown; limit?: unknown }
      return {
        used: Number(data.used) || 0,
        limit: Number(data.limit) || 0,
      }
    } catch (err) {
      console.warn('Failed to fetch quota', err)
      return {
        used: Number(sessionUser?.usedStorageMb) || 0,
        limit: Number(sessionUser?.uploadLimitMb) || 0,
      }
    }
  }

  const {
    data: quota,
    mutate: mutateQuota,
  } = useSWR<{ used: number; limit: number }>(
    sessionUser ? '/api/storage-quota' : null,
    fetchQuota
  )

  useEffect(() => {
    if (!sessionUser?.id) return
    mutateQuota().catch((err) => console.warn('Failed to refresh quota', err))
  }, [sessionUser?.id, mutateQuota])
  const usedMb = Number(quota?.used ?? sessionUser?.usedStorageMb ?? 0)
  const limitMb = Number(quota?.limit ?? sessionUser?.uploadLimitMb ?? 0)
  const percent =
    Number.isFinite(usedMb) && Number.isFinite(limitMb) && limitMb > 0
      ? (usedMb / limitMb) * 100
      : 0

  if (uploadBanUntil && new Date(uploadBanUntil) > new Date()) {
    return <UploadBanAlert />;
  }

  const prepareTitles = async (files: FileList) => {
    const entries: Record<string, string> = {};
    for (const file of Array.from(files)) {
      const type = detectType(file);
      if (type === 'image') {
        entries[file.name] = '';
      } else if (type === 'music') {
        try {
          const parseBlob = parseBlobRef.current;
          if (parseBlob) {
            const meta = await parseBlob(file);
            const t = meta?.title ? formatTitle(meta.title) : formatTitle(file.name);
            entries[file.name] = meta?.artist ? `${meta.artist} - ${t}` : t;
          } else {
            entries[file.name] = formatTitle(file.name);
          }
        } catch {
          entries[file.name] = formatTitle(file.name);
        }
      } else {
        entries[file.name] = formatTitle(file.name);
      }
    }
    setTitles(entries);
  };

  const handleUpload = async () => {
    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service");
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("No file selected");
      return;
    }

    if (selectedFiles.length > MAX_ALBUM_UPLOAD) {
      toast.error(`You can upload at most ${MAX_ALBUM_UPLOAD} files at once`);
      return;
    }

    const isAlbum =
      selectedFiles.length >= 2 &&
      selectedFiles.length <= MAX_ALBUM_UPLOAD &&
      Array.from(selectedFiles).every((f) => detectType(f) === "image");

    let currentAlbumId = albumId;
    let currentAlbumName = albumName;
    if (isAlbum && !currentAlbumId) {
      const name = window.prompt("Album name:")?.trim();
      if (!name) {
        toast.error("Album name is required");
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
      formData.append("title", title);
      formData.append("type", detectType(file));
      formData.append("file", file);
      if (isAlbum && currentAlbumId) {
        formData.append("album_id", currentAlbumId);
        if (currentAlbumName) formData.append("album_name", currentAlbumName);
      }
      if (isAdmin && asUser.trim()) {
        formData.append('as_user', asUser.trim());
      }

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { success: boolean; error?: string; status?: string };
        if (res.ok && data.success) {
          success = true;
          const msg = data.status === 'approved'
            ? `${file.name} uploaded and approved`
            : `${file.name} uploaded, awaiting moderation`;
          toast.success(msg);
          await mutateQuota();
        } else {
          toast.error(data.error || `Error uploading ${file.name}`);
        }
      } catch {
        toast.error(`Network error: ${file.name}`);
      }
    }

    setLoading(false);
    setSelectedFiles(null);
    setTitles({});
    setAlbumId(null);
    setAlbumName(null);
    if (isAdmin) setAsUser('');
    if (success) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
      await mutateQuota();
      if (onUpload) onUpload();
    }
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
        <h2 className="text-2xl font-bold tracking-tight">Upload</h2>
      </CardHeader>
      <CardContent>
        <div
          ref={dropRef}
          className="upload-dropzone relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:bg-yellow-400/10 hover:border-yellow-400/40 dark:border-gray-700"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Drag your files here or
            <label
              className="ml-1 cursor-pointer font-medium underline"
              onClick={(e) => e.stopPropagation()}
            >
              choose
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,audio/mp3,text/plain"
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
                        placeholder="Image title (optional)"
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
                  {/* cannot convert to next/image */}
                  {isImage && (
                    <WatermarkedImage
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
        {isAdmin && (
          <div className="mt-4">
            <input
              type="text"
              list="user-search-list"
              className="w-full border rounded px-1 text-sm"
              placeholder="Upload for user ID or email"
              value={asUser}
              onChange={(e) => setAsUser(e.target.value)}
            />
            <datalist id="user-search-list">
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </datalist>
          </div>
        )}
        {sessionUser && (
          <>
            <Progress className="mt-2" value={percent} />
            <p className="text-xs text-muted-foreground text-center mt-1">
              {`${
                Number.isFinite(usedMb) ? Math.round(usedMb) : 0
              } MB / ${Number.isFinite(limitMb) ? limitMb : 0} MB`}
            </p>
            {percent >= 100 && (
              <p className="mt-2 text-center text-sm animate-pulse">
                👉 Need more storage? Buy it on the Marketplace!
              </p>
            )}
            <div className="flex items-center gap-2 mt-4">
              <input
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <label htmlFor="acceptTerms" className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="font-medium underline hover:text-primary">
                  Terms of Service
                </Link>
              </label>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="w-full relative">
          <AnimatePresence>
            {uploadSuccess && (
              <>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-2 left-0 right-0 h-1 rounded-t-md bg-gradient-to-r from-purple-500 to-green-500 origin-left"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-7 right-2 text-green-400"
                >
                  <CheckCircle className="h-5 w-5" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <button
            onClick={handleUpload}
            disabled={loading || percent >= 100 || !acceptedTerms}
            className={clsx(
              "upload-button relative inline-flex h-12 min-w-[160px] items-center justify-center overflow-hidden rounded-md px-8 text-base font-semibold text-gray-900 dark:text-white shadow transition-all duration-300 w-full mt-3 sm:w-auto sm:mt-0",
              loading
                ? "bg-gray-300 dark:bg-gray-600"
                : "bg-gradient-to-r from-white via-gray-200 to-white hover:brightness-110 dark:from-black dark:via-gray-800 dark:to-black",
            )}
          >
            <span className="z-10">{loading ? "Uploading..." : "Upload"}</span>
            {!loading && <span className="upload-wave-glow" />}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
