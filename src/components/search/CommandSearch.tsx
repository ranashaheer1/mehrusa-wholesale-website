import { useEffect, useMemo, useRef, useState } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { products } from "@/data/products";
import { categories, getCategory } from "@/data/categories";
import { useUI } from "@/store/list";
import { useMemory } from "@/store/memory";
import { ProductImage } from "../catalogue/ProductImage";
import { cn } from "@/utils/cn";

type Item = { id: string; kind: "Piece" | "Category" | "Page"; title: string; sub: string; to: string; productId?: string };

const pages: Item[] = [
  ["Quick order pad", "Order many SKUs at once", "/quick-order"],
  ["My list", "Review and send your enquiry", "/list"],
  ["Apply for wholesale", "Open a trade account", "/apply"],
  ["Wholesale terms", "MOQ, payment, shipping", "/terms"],
  ["Our standards", "Materials and care", "/standards"],
  ["Packaging", "The midnight box", "/packaging"],
  ["Questions", "FAQ", "/faq"],
  ["Contact", "WhatsApp and email", "/contact"],
].map(([title, sub, to]) => ({ id: to, kind: "Page", title, sub, to }));

const all: Item[] = [
  ...products.map((p) => ({ id: p.id, kind: "Piece" as const, title: p.name, sub: `${p.sku} · ${getCategory(p.categorySlug)?.name.en}`, to: `/product/${p.id}`, productId: p.id })),
  ...categories.map((c) => ({ id: c.slug, kind: "Category" as const, title: c.name.en, sub: c.status === "live" ? c.intro : "Opening soon", to: `/shop/${c.slug}` })),
  ...pages,
];
const fuse = new Fuse(all, { keys: [{ name: "title", weight: 2 }, "sub", "id"], threshold: 0.38, ignoreLocation: true });

/** ⌘K / Ctrl+K or "/" opens. Arrow keys move, Enter opens. */
export function CommandSearch() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const recent = useMemory((s) => s.recent);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => { if (!open) { setQ(""); setI(0); } }, [open]);

  const results = useMemo<Item[]>(() => {
    if (q.trim()) return fuse.search(q.trim()).slice(0, 10).map((r) => r.item);
    const rec = recent.map((id) => all.find((a) => a.productId === id)).filter((x): x is Item => !!x).slice(0, 4);
    return [...rec, ...pages.slice(0, 4)];
  }, [q, recent]);

  useEffect(() => setI(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${i}"]`)?.scrollIntoView({ block: "nearest" });
  }, [i]);

  const go = (it?: Item) => {
    if (!it) return;
    setOpen(false);
    nav(it.to);
  };

  return (
    <RDialog.Root open={open} onOpenChange={setOpen}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[90] bg-night-deep/70 data-[state=open]:animate-[fadeIn_250ms_var(--ease)]" />
        <RDialog.Content className="surface-night fixed left-1/2 top-[8dvh] z-[91] w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 border hairline-gold outline-none data-[state=open]:animate-[settle_382ms_var(--ease)]" aria-describedby={undefined}>
          <RDialog.Title className="sr-only">Search Mehrusa</RDialog.Title>
          <div className="flex items-center gap-3 border-b rule px-4">
            <Search size={20} strokeWidth={1.4} className="text-gold" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(results.length - 1, x + 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
                if (e.key === "Enter") { e.preventDefault(); if (results[i]) go(results[i]); else if (q) { setOpen(false); nav(`/shop?q=${encodeURIComponent(q)}`); } }
              }}
              placeholder="Search pieces, SKUs or pages"
              aria-label="Search pieces, SKUs or pages"
              role="combobox"
              aria-expanded="true"
              aria-controls="cmd-results"
              aria-activedescendant={results[i] ? `cmd-${results[i].kind}-${results[i].id}` : undefined}
              className="min-h-16 flex-1 bg-transparent text-[1.125rem] text-pearl outline-none placeholder:text-pearl/55"
            />
            <kbd className="hidden border border-pearl/30 px-1.5 text-[0.75rem] opacity-70 sm:inline">Esc</kbd>
          </div>
          <p className="eyebrow px-4 pb-1 pt-3">{q ? `${results.length} results` : recent.length ? "Recently viewed and shortcuts" : "Shortcuts"}</p>
          <ul id="cmd-results" role="listbox" ref={listRef} className="max-h-[58dvh] overflow-y-auto pb-2">
            {results.map((it, idx) => {
              const p = it.productId ? products.find((x) => x.id === it.productId) : undefined;
              return (
                <li
                  key={it.kind + it.id}
                  id={`cmd-${it.kind}-${it.id}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={idx === i}
                  onMouseMove={() => setI(idx)}
                  onClick={() => go(it)}
                  className={cn("mx-2 flex cursor-pointer items-center gap-3 px-2 py-2", idx === i && "bg-night-light")}
                >
                  <span className="w-10 shrink-0">
                    {p ? <ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt="" label={false} /> : <span className="grid aspect-[4/5] place-items-center border border-pearl/20"><span className="h-2 w-2 rotate-45 bg-gold" /></span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{it.title}</span>
                    <span className="num block truncate text-[0.8125rem] opacity-70">{it.sub}</span>
                  </span>
                  <span className="text-[0.75rem] uppercase tracking-[0.08em] text-gold">{it.kind}</span>
                  {idx === i ? <CornerDownLeft size={15} strokeWidth={1.4} aria-hidden className="text-gold" /> : <ArrowRight size={15} strokeWidth={1.4} aria-hidden className="opacity-30" />}
                </li>
              );
            })}
            {q && results.length === 0 && <li className="px-4 py-6 opacity-80">Nothing found for "{q}". Try a SKU like MH-RG-01, or a word like crescent.</li>}
          </ul>
          <div className="hidden justify-between border-t rule px-4 py-2 text-[0.75rem] opacity-70 sm:flex">
            <span>↑ ↓ to move · Enter to open</span>
            <span>⌘K or / anywhere</span>
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
