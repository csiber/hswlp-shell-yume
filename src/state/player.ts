import { create } from "zustand";
import { combine } from "zustand/middleware";

export const usePlayerStore = create(
  combine(
    {
      isPlayerVisible: false,
    },
    (set) => ({
      setPlayerVisible: (isPlayerVisible: boolean) => set({ isPlayerVisible }),
    })
  )
);
