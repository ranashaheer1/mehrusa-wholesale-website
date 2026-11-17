import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BuyerType } from "@/data/buyers";

type Prefs = {
  buyer: BuyerType | null;
  setBuyer: (b: BuyerType | null) => void;
  largeText: boolean;
  calmMotion: boolean;
  setLargeText: (v: boolean) => void;
  setCalmMotion: (v: boolean) => void;
  compare: string[];
  toggleCompare: (id: string) => "added" | "removed" | "full";
  clearCompare: () => void;
};

export const COMPARE_MAX = 3;

/** Customer preferences. Stored only in this browser. */
export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      buyer: null,
      setBuyer: (buyer) => set({ buyer }),
      largeText: false,
      calmMotion: false,
      setLargeText: (largeText) => set({ largeText }),
      setCalmMotion: (calmMotion) => set({ calmMotion }),
      compare: [],
      toggleCompare: (id) => {
        const c = get().compare;
        if (c.includes(id)) { set({ compare: c.filter((x) => x !== id) }); return "removed"; }
        if (c.length >= COMPARE_MAX) return "full";
        set({ compare: [...c, id] });
        return "added";
      },
      clearCompare: () => set({ compare: [] }),
    }),
    { name: "mehrusa-prefs", version: 1 },
  ),
);
