import { usePlayerStore } from "@/state/player";

export default function usePlayerVisible() {
  return usePlayerStore((s) => s.isPlayerVisible);
}
