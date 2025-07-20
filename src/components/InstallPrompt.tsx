"use client";
import usePwaPrompt from "@/hooks/usePwaPrompt";

export default function InstallPrompt() {
  const { promptEvent, showPrompt } = usePwaPrompt();

  if (!promptEvent) return null;

  return (
    <button
      onClick={showPrompt}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow"
    >
      Telepítsd a Yumekai appot
    </button>
  );
}
