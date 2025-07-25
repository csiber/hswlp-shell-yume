"use client";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ShowNewcomerToast() {
  useEffect(() => {
    const flag = localStorage.getItem("newcomer_badge_toast");
    if (flag) {
      toast.success(
        "🎉 Welcome to Yumekai!\nYou've earned your first badge: 🔰 Newcomer"
      );
      localStorage.removeItem("newcomer_badge_toast");
    }
  }, []);

  return null;
}
