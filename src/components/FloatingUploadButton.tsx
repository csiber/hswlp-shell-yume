"use client";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function FloatingUploadButton() {
  return (
    <Link
      href="/upload"
      className="fixed bottom-16 right-4 z-40 rounded-full bg-primary p-4 text-primary-foreground shadow-lg"
    >
      <Upload className="w-5 h-5" />
    </Link>
  );
}
