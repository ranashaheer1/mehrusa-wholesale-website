import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListLine = {
  key: string; // productId|colour|option
  productId: string;
  colour: string;
  option: string;
  qty: number;
};

export type Buyer = { name: string; business: string; city: string; phone: string; notes: string };

type ListState = {
  lines: ListLine[];
  buyer: Buyer;
  add: (l: Omit<ListLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  restore: (lines: ListLine[], mode: "replace" | "merge") => void;
  addMany: (ls: Omit<ListLine, "key">[]) => void;
  setBuyer: (b: Partial<Buyer>) => void;
};

const makeKey = (l: Pick<ListLine, "productId" | "colour" | "option">) => `${l.productId}|${l.colour}|${l.option}`;

export const useList = create<ListState>()(
  persist(
    (set) => ({
      lines: [],
      buyer: { name: "", business: "", city: "", phone: "", notes: "" },
      add: (l) =>
        set((s) => {
          if (l.qty <= 0) return s;
          const key = makeKey(l);
          const existing = s.lines.find((x) => x.key === key);
          if (existing) return { lines: s.lines.map((x) => (x.key === key ? { ...x, qty: x.qty + l.qty } : x)) };
          return { lines: [...s.lines, { ...l, key }] };
        }),
      setQty: (key, qty) =>
        set((s) => ({ lines: s.lines.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(9999, qty)) } : x)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((x) => x.key !== key) })),
      clear: () => set({ lines: [] }),
      restore: (incoming, mode) =>
        set((s) => {
          if (mode === "replace") return { lines: incoming.map((l) => ({ ...l })) };
          const map = new Map(s.lines.map((l) => [l.key, { ...l }]));
          incoming.forEach((l) => { const e = map.get(l.key); if (e) e.qty += l.qty; else map.set(l.key, { ...l }); });
          return { lines: [...map.values()] };
        }),
      addMany: (ls) =>
        set((s) => {
          const map = new Map(s.lines.map((l) => [l.key, { ...l }]));
          ls.filter((l) => l.qty > 0).forEach((l) => {
            const key = makeKey(l);
            const e = map.get(key);
            if (e) e.qty += l.qty; else map.set(key, { ...l, key });
          });
          return { lines: [...map.values()] };
        }),
      setBuyer: (b) => set((s) => ({ buyer: { ...s.buyer, ...b } })),
    }),
    { name: "mehrusa-enquiry-list", version: 1 },
  ),
);

export const useListCount = () => useList((s) => s.lines.reduce((a, l) => a + l.qty, 0));

type UIState = {
  listOpen: boolean;
  setListOpen: (o: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
  quickView: string | null;
  setQuickView: (id: string | null) => void;
  helpOpen: boolean;
  setHelpOpen: (o: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (o: boolean) => void;
  sentVia: null | "whatsapp" | "email";
  setSentVia: (v: null | "whatsapp" | "email") => void;
};
export const useUI = create<UIState>()((set) => ({
  listOpen: false,
  setListOpen: (listOpen) => set({ listOpen }),
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  quickView: null,
  setQuickView: (quickView) => set({ quickView }),
  helpOpen: false,
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  assistantOpen: false,
  setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
  sentVia: null,
  setSentVia: (sentVia) => set({ sentVia }),
}));
