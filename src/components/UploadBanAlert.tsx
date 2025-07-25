"use client";

import { ShieldX } from "lucide-react";
import { Alert } from "@heroui/react";
import { useSessionStore } from "@/state/session";
import { formatDateHu } from "@/utils/format-date";

export default function UploadBanAlert() {
  const uploadBanUntil = useSessionStore((s) => s.session?.user?.uploadBanUntil);
  const uploadBanReason = useSessionStore((s) => s.session?.user?.uploadBanReason);

  if (!uploadBanUntil) return null;
  const until = new Date(uploadBanUntil);
  if (until <= new Date()) return null;

  return (
    <Alert color="danger" className="mb-4 flex items-start">
      <ShieldX className="mr-2 h-4 w-4 mt-0.5" />
      <div>
        <p className="font-bold">Uploads disabled</p>
        <p>
          You cannot upload new content until <strong>{formatDateHu(until)}</strong>.
        </p>
        {uploadBanReason && (
          <p className="text-sm text-muted-foreground mt-1">Reason: {uploadBanReason}</p>
        )}
      </div>
    </Alert>
  );
}
