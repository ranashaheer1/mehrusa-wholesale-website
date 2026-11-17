import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ListLine } from "./list";

export type PastEnquiry = { id: string; at: string; via: "whatsapp" | "email" | "pdf" | "csv" | "copy"; lines: ListLine[]; units: number };

type MemoryState = {
  shortlist: string[];
  recent: string[];
  history: PastEnquiry[];
  toggleShort: (id: string) => void;
  viewed: (id: string) => void;
  remember: (e: Omit<PastEnquiry, "id" | "at">) => void;
  forget: (id: string) => void;
};

/** Browser-only memory: shortlist, recently viewed, past enquiries. Nothing leaves the device. */
export const useMemory = create<MemoryState>()(
  persist(
    (set) => ({
      shortlist: [],
      recent: [],
      history: [],
      toggleShort: (id) => set((s) => ({ shortlist: s.shortlist.includes(id) ? s.shortlist.filter((x) => x !== id) : [id, ...s.shortlist] })),
      viewed: (id) => set((s) => ({ recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) })),
      remember: (e) =>
        set((s) => {
          const sig = JSON.stringify(e.lines.map((l) => [l.key, l.qty]));
          // Avoid duplicate entries when the same list is sent several ways in a row
          if (s.history[0] && JSON.stringify(s.history[0].lines.map((l) => [l.key, l.qty])) === sig) return s;
          return { history: [{ ...e, id: Math.random().toString(36).slice(2, 9), at: new Date().toISOString() }, ...s.history].slice(0, 10) };
        }),
      forget: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
    }),
    { name: "mehrusa-memory", version: 1 },
  ),
);
