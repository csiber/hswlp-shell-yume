import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
        const res = await fetch("/api/upload", { method: "POST", body: formData });
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Feltöltés</h2>
      </CardHeader>
      <CardContent>
        <Input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Feltöltés..." : "Feltöltés"}
        </Button>
      </CardFooter>
    </Card>
  );
}
