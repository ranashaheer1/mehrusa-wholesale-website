import { decodeList } from "@/lib/share";
import { flyToList } from "@/components/ui/FlyLayer";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { starterKits } from "@/data/buyers";
import { toast } from "sonner";
import Fuse from "fuse.js";
import { CornerDownLeft, Plus } from "lucide-react";
import { Check, ChevronDown, ChevronsDownUp, ChevronsUpDown, ClipboardPaste, FileUp, History, Rows3, Search, Trash2, Wand2, X } from "lucide-react";
import { useMemory } from "@/store/memory";
import { products } from "@/data/products";
import { categories, getCategory } from "@/data/categories";
import type { Product } from "@/data/types";
import { fmtNum, fmtPKR, orderAxis, sumOrNull, unitPriceFor } from "@/lib/pricing";
import { useList, useUI } from "@/store/list";
import { ProductImage } from "@/components/catalogue/ProductImage";
import { Button } from "@/components/ui/Button";
import { ConfirmText, Eyebrow, Stepper, usePageMeta } from "@/components/ui/bits";
import { tex } from "@/lib/images";
import { cn } from "@/utils/cn";

const k = (id: string, c: string, o: string) => `${id}|${c}|${o}`;

type ParseResult = { line: string; ok: boolean; msg: string; add?: { key: string; qty: number } };

/** Accepts lines like "MH-RG-01 24", "MH-RG-01, gold, 7, 24" or "MH-NK-02 45 cm x 12". */
export function parsePaste(text: string): ParseResult[] {
  return text.split(/\n+/).map((raw) => raw.trim()).filter(Boolean).map((line) => {
    const skuMatch = line.match(/MH-[A-Z]{2}-\d{2}/i);
    if (!skuMatch) return { line, ok: false, msg: "No SKU found. SKUs look like MH-RG-01." };
    const p = products.find((x) => x.sku.toLowerCase() === skuMatch[0].toLowerCase());
    if (!p) return { line, ok: false, msg: `${skuMatch[0].toUpperCase()} is not in the range.` };
    const rest = line.replace(skuMatch[0], " ").toLowerCase();
    const nums = rest.match(/\d+/g) ?? [];
    if (!nums.length) return { line, ok: false, msg: "Add a quantity at the end, for example 24." };
    const qty = parseInt(nums[nums.length - 1], 10);
    const before = rest.slice(0, rest.lastIndexOf(nums[nums.length - 1]));
    const colour = p.colours.find((c) => c.name.toLowerCase().split(/[\s-]+/).some((w) => w.length > 3 && before.includes(w))) ?? p.colours[0];
    const axis = orderAxis(p);
    const option = axis.options.find((o) => new RegExp(`(^|\\D)${o.replace(/\D+/g, "")}(\\D|$)`).test(before) && /\d/.test(o)) ?? axis.options[0];
    return { line, ok: true, msg: `${p.name} · ${colour.name}${option !== "One size" ? ` / ${option}` : ""} · ${qty}`, add: { key: k(p.id, colour.name, option), qty } };
  });
}

const fuse = new Fuse(products, { keys: [{ name: "sku", weight: 2 }, { name: "name", weight: 2 }, "categorySlug"], threshold: 0.35, ignoreLocation: true });
const middle = (o: string[]) => o[Math.floor((o.length - 1) / 2)];

/** Point-of-sale style entry: SKU or name → colour, size, quantity → Enter. */
function QuickAdd({ onAdd }: { onAdd: (p: Product, colour: string, option: string, qty: number) => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Product | null>(null);
  const [hi, setHi] = useState(0);
  const [focused, setFocused] = useState(false);
  const [colour, setColour] = useState("");
  const [option, setOption] = useState("");
  const [qty, setQty] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const results = q.trim() && !sel ? fuse.search(q.trim()).slice(0, 6).map((r) => r.item) : [];
  const showList = focused && results.length > 0;

  const choose = (p: Product) => {
    setSel(p);
    setQ(`${p.sku} · ${p.name}`);
    setColour(p.colours[0].name);
    setOption(middle(orderAxis(p).options));
    setQty(p.wholesale.minOrderQty);
    setTimeout(() => qtyRef.current?.select(), 0);
  };
  const reset = () => { setSel(null); setQ(""); setHi(0); setQty(0); inputRef.current?.focus(); };
  const submit = () => {
    if (!sel) { if (results[hi]) choose(results[hi]); return; }
    if (qty <= 0) { qtyRef.current?.focus(); return; }
    onAdd(sel, colour, option, qty);
    reset();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mb-6 border border-night bg-pearl-light p-3 sm:p-4" aria-label="Quick add by SKU">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-gold-deep">Quick add</p>
        <p className="hidden items-center gap-1.5 text-[0.75rem] opacity-60 sm:flex">Type, then press <kbd className="border rule px-1">Enter</kbd></p>
      </div>
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] md:items-end">
        <div className="relative">
          <label htmlFor="qa-sku" className="sr-only">SKU or name</label>
          <Search size={16} strokeWidth={1.4} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" aria-hidden />
          <input
            ref={inputRef}
            id="qa-sku"
            role="combobox"
            aria-expanded={showList}
            aria-controls="qa-list"
            aria-autocomplete="list"
            aria-activedescendant={showList ? `qa-${results[hi]?.id}` : undefined}
            autoComplete="off"
            className="field min-h-12 pl-9 pr-9"
            placeholder="SKU or name, e.g. MH-RG-01 or crescent"
            value={q}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onChange={(e) => { setQ(e.target.value); setSel(null); setHi(0); }}
            onKeyDown={(e) => {
              if (!showList) return;
              if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(results.length - 1, h + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
              if (e.key === "Escape") setFocused(false);
            }}
          />
          {q && <button type="button" onClick={reset} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center opacity-60 hover:opacity-100" aria-label="Clear"><X size={15} aria-hidden /></button>}
          {showList && (
            <ul id="qa-list" role="listbox" className="surface-light absolute inset-x-0 top-full z-20 mt-1 border border-night shadow-[0_16px_32px_-16px_rgba(9,16,35,0.5)]" data-lenis-prevent>
              {results.map((p, i) => (
                <li key={p.id} id={`qa-${p.id}`} role="option" aria-selected={i === hi} onMouseDown={(e) => { e.preventDefault(); choose(p); }} onMouseMove={() => setHi(i)} className={cn("flex cursor-pointer items-center gap-3 px-3 py-2", i === hi && "bg-sand/70")}>
                  <span className="w-9 shrink-0"><ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt="" label={false} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[0.9375rem]">{p.name}</span><span className="num block text-[0.75rem] opacity-70">{p.sku} · MOQ {p.wholesale.minOrderQty}</span></span>
                  {i === hi && <CornerDownLeft size={14} strokeWidth={1.4} className="text-gold-deep" aria-hidden />}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-[1fr_1fr_88px] gap-2 md:contents">
          <label className="block">
            <span className="mb-1 block text-[0.75rem] opacity-70 md:sr-only">Colour</span>
            <select className="field min-h-12 md:w-40" value={colour} onChange={(e) => setColour(e.target.value)} disabled={!sel} aria-label="Colour">
              {sel ? sel.colours.map((c) => <option key={c.name}>{c.name}</option>) : <option>Colour</option>}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[0.75rem] opacity-70 md:sr-only">Size</span>
            <select className="field min-h-12 md:w-32" value={option} onChange={(e) => setOption(e.target.value)} disabled={!sel} aria-label="Size or length">
              {sel ? orderAxis(sel).options.map((o) => <option key={o}>{o}</option>) : <option>Size</option>}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[0.75rem] opacity-70 md:sr-only">Qty</span>
            <input ref={qtyRef} type="number" inputMode="numeric" min={0} className="field num min-h-12 text-center md:w-24" value={qty || ""} placeholder="Qty" onChange={(e) => setQty(Math.max(0, parseInt(e.target.value || "0", 10)))} disabled={!sel} aria-label="Quantity" />
          </label>
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={!sel && !results.length}><Plus size={16} strokeWidth={1.6} aria-hidden />Add</Button>
      </div>
      {sel && <p className="mt-2 text-[0.8125rem] opacity-70">Minimum for this piece is {sel.wholesale.minOrderQty}, mixed across colours and sizes.</p>}
    </form>
  );
}

const DRAFT = "mehrusa-pad-draft";
const EXAMPLE = "MH-RG-01, gold, 7, 24\nMH-ER-02 12\nMH-NK-01 45 cm 18\nMH-ST-01, steel, 12";

export default function QuickOrder() {
  usePageMeta("Quick order pad", "Order many Mehrusa SKUs at once: a dense line sheet with steppers, or paste and upload a list of SKUs and quantities.");
  const [params] = useSearchParams();
  const kit = starterKits.find((x) => x.id === params.get("kit"));
  const padLines = params.get("pad") ? decodeList(params.get("pad")!) : [];
  const seed = kit?.lines ?? padLines;
  const history = useMemory((s) => s.history);
  const [restored, setRestored] = useState(false);
  const [pad, setPad] = useState<Record<string, number>>(() => {
    if (seed.length) return Object.fromEntries(seed.map((l) => [k(l.productId, l.colour, l.option), l.qty]));
    try { const d = JSON.parse(localStorage.getItem(DRAFT) ?? "{}"); if (Object.keys(d).length) { setTimeout(() => setRestored(true)); return d; } } catch { /* ignore */ }
    return {};
  });
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(Object.keys(pad).map((key) => [key.split("|")[0], true])));
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [onlyPad, setOnlyPad] = useState(false);
  const [paste, setPaste] = useState("");
  const [parsed, setParsed] = useState<ParseResult[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState<string[]>([]);
  const flashRows = (ids: string[]) => { setFlash(ids); setTimeout(() => setFlash([]), 1400); };
  const quickAdd = (p: Product, colour: string, option: string, qty: number) => {
    const key = k(p.id, colour, option);
    setPad((s) => ({ ...s, [key]: (s[key] ?? 0) + qty }));
    setOpen((o) => ({ ...o, [p.id]: true }));
    if (cat !== "all" && cat !== p.categorySlug) setCat("all");
    flashRows([p.id]);
    toast(`${qty} × ${p.name} added to the pad.`, { description: `${colour}${option !== "One size" ? ` / ${option}` : ""}` });
  };
  const addMany = useList((s) => s.addMany);
  const openList = useUI((s) => s.setListOpen);

  // Auto-save the draft in this browser
  useEffect(() => {
    const clean = Object.fromEntries(Object.entries(pad).filter(([, n]) => n > 0));
    if (Object.keys(clean).length) localStorage.setItem(DRAFT, JSON.stringify(clean));
    else localStorage.removeItem(DRAFT);
  }, [pad]);

  const unitsFor = (p: Product) => Object.entries(pad).filter(([key]) => key.startsWith(p.id + "|")).reduce((a, [, n]) => a + n, 0);
  const touched = products.filter((p) => unitsFor(p) > 0);
  const totalUnits = touched.reduce((a, p) => a + unitsFor(p), 0);
  const under = touched.filter((p) => unitsFor(p) < p.wholesale.minOrderQty);
  const subtotal = sumOrNull(touched.map((p) => { const u = unitPriceFor(p, unitsFor(p)); return u === null ? null : u * unitsFor(p); }));
  const rows = useMemo(
    () => products.filter((p) => (cat === "all" || p.categorySlug === cat) && (!q || `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) && (!onlyPad || Object.entries(pad).some(([key, n]) => n > 0 && key.startsWith(p.id + "|")))),
    [cat, q, onlyPad, pad],
  );
  const allOpen = rows.length > 0 && rows.every((p) => open[p.id]);

  const set = (key: string, n: number) => setPad((s) => ({ ...s, [key]: n }));
  const fillMinimum = (p: Product) => {
    const opts = orderAxis(p).options;
    const option = opts[Math.floor((opts.length - 1) / 2)];
    const need = Math.max(0, p.wholesale.minOrderQty - unitsFor(p));
    if (!need) return;
    const key = k(p.id, p.colours[0].name, option);
    setPad((s) => ({ ...s, [key]: (s[key] ?? 0) + need }));
    setOpen((o) => ({ ...o, [p.id]: true }));
  };
  const fillAllShort = () => { under.forEach(fillMinimum); toast("Every piece now meets its minimum."); };

  const runParse = (text = paste) => {
    const r = parsePaste(text);
    setParsed(r);
    const good = r.filter((x) => x.ok && x.add);
    if (good.length) {
      setPad((s) => {
        const next = { ...s };
        good.forEach((g) => { next[g.add!.key] = (next[g.add!.key] ?? 0) + g.add!.qty; });
        return next;
      });
      setOpen((o) => ({ ...o, ...Object.fromEntries(good.map((g) => [g.add!.key.split("|")[0], true])) }));
      flashRows(good.map((g) => g.add!.key.split("|")[0]));
      toast(`${good.length} ${good.length === 1 ? "line" : "lines"} added to the pad.`);
    }
  };
  const onFile = async (f?: File) => {
    if (!f) return;
    const text = (await f.text()).replace(/\r/g, "");
    setPaste(text);
    runParse(text);
  };
  const loadLast = () => {
    const h = history[0];
    if (!h) return;
    setPad(Object.fromEntries(h.lines.map((l) => [k(l.productId, l.colour, l.option), l.qty])));
    setOpen(Object.fromEntries(h.lines.map((l) => [l.productId, true])));
    toast("Your last enquiry is on the pad.");
  };
  const clearPad = () => {
    const before = pad;
    setPad({});
    toast("Pad cleared.", { action: { label: "Undo", onClick: () => setPad(before) } });
  };
  const commit = () => {
    const lines = Object.entries(pad).filter(([, n]) => n > 0).map(([key, qty]) => {
      const [productId, colour, option] = key.split("|");
      return { productId, colour, option, qty };
    });
    if (!lines.length) return;
    addMany(lines);
    flyToList();
    setPad({});
    setParsed([]);
    toast(`Added ${fmtNum(totalUnits)} units to your list.`, { action: { label: "View list", onClick: () => openList(true) } });
  };

  const pastePanel = (
    <div className="surface-night p-5 lg:p-6">
      <div className="flex items-center gap-2"><ClipboardPaste size={18} strokeWidth={1.4} className="text-gold" aria-hidden /><Eyebrow>Paste or upload SKUs</Eyebrow></div>
      <p className="mt-2 text-[0.9375rem] opacity-85">One piece per line: SKU, then colour and size if needed, then quantity.</p>
      <label htmlFor="paste" className="sr-only">Paste SKUs and quantities</label>
      <textarea id="paste" value={paste} onChange={(e) => setPaste(e.target.value)} rows={5} className="field num mt-4 font-sans" placeholder={EXAMPLE} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => runParse()} disabled={!paste.trim()}>Add to pad</Button>
        <button type="button" className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[0.875rem] text-gold-light hover:text-gold" onClick={() => setPaste(EXAMPLE)}><Wand2 size={15} strokeWidth={1.4} aria-hidden />Try an example</button>
        <button type="button" className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[0.875rem] text-pearl/80 hover:text-gold" onClick={() => fileRef.current?.click()}><FileUp size={15} strokeWidth={1.4} aria-hidden />Upload CSV</button>
        <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} aria-label="Upload a CSV or text file" />
        {paste && <button type="button" className="ml-auto min-h-11 px-2 text-[0.875rem] text-pearl/70 hover:text-pearl" onClick={() => { setPaste(""); setParsed([]); }}>Clear</button>}
      </div>
      {parsed.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-pearl/10 pt-3 text-[0.875rem]" aria-live="polite">
          {parsed.map((r, i) => (
            <li key={i} className="flex gap-2"><span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45", r.ok ? "bg-gold" : "bg-laal-light")} aria-hidden /><span><span className="sr-only">{r.ok ? "Added: " : "Problem: "}</span>{r.ok ? r.msg : <><span className="opacity-70">{r.line}:</span> {r.msg}</>}</span></li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {/* Header */}
      <header className="surface-deep grain relative overflow-hidden">
        <img decoding="async" src={tex("satin")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-night-deep via-night-deep/90 to-night-deep/60" aria-hidden />
        <div className="container-x relative py-10 sm:py-14 lg:py-16">
          <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-gold" aria-hidden />{kit ? `Adjusting "${kit.title}"` : padLines.length ? "Adjusting your suggested order" : "For buyers who know what they want"}</p>
          <h1 className="mt-3 font-display text-[2.5rem] leading-[1.05] text-pearl sm:text-h1">Quick order pad</h1>
          <p className="mt-3 max-w-[56ch] text-[1.0625rem] text-pearl/85 sm:text-lead">{kit || padLines.length ? "Your suggested pieces are filled in below. Change any number, add more, then add everything to your list." : "Every piece on one sheet. Set quantities by colour and size, paste from your notes, or pick up your last order."}</p>
          <ul className="mt-8 grid gap-2 sm:grid-cols-3 sm:gap-3" aria-label="Ways to fill the pad">
            <li className="flex items-start gap-3 border border-pearl/15 p-4"><Rows3 size={20} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" aria-hidden /><span><span className="block font-medium text-pearl">Tap and set</span><span className="block text-[0.875rem] text-pearl/70">Open a row, use + and −</span></span></li>
            <li className="flex items-start gap-3 border border-pearl/15 p-4"><ClipboardPaste size={20} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" aria-hidden /><span><span className="block font-medium text-pearl">Paste or upload</span><span className="block text-[0.875rem] text-pearl/70">SKUs from notes or a CSV</span></span></li>
            <li>
              <button type="button" onClick={loadLast} disabled={!history.length} className="flex h-full w-full items-start gap-3 border border-gold/40 p-4 text-left transition-colors duration-[250ms] hover:border-gold disabled:border-pearl/15 disabled:opacity-60">
                <History size={20} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                <span><span className="block font-medium text-pearl">Order again</span><span className="block text-[0.875rem] text-pearl/70">{history.length ? "Load your last enquiry" : "Your past enquiries appear here"}</span></span>
              </button>
            </li>
          </ul>
          {restored && <p className="mt-4 inline-flex items-center gap-2 text-[0.875rem] text-gold-light" role="status"><Check size={15} strokeWidth={1.6} aria-hidden />Your saved draft is back on the pad.</p>}
        </div>
      </header>

      {/* Sticky toolbar */}
      <div className="surface-pearl sticky top-16 lg:top-[72px] follow-hdr z-30 border-b rule shadow-[0_8px_24px_-20px_rgba(9,16,35,0.5)] ">
        <div className="container-x flex flex-wrap items-center gap-2 py-2.5">
          <label className="relative w-full sm:w-auto sm:min-w-[220px] sm:flex-1">
            <span className="sr-only">Filter by name or SKU</span>
            <Search size={16} strokeWidth={1.4} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" aria-hidden />
            <input type="search" className="field min-h-11 pl-9 pr-9" placeholder="Filter by name or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button type="button" onClick={() => setQ("")} className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center opacity-70" aria-label="Clear filter"><X size={15} aria-hidden /></button>}
          </label>
          <div className="no-scrollbar -mx-4 flex w-[calc(100%+32px)] gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:px-0" role="group" aria-label="Category">
            {[{ slug: "all", name: { en: "All" } }, ...categories.filter((c) => c.status === "live")].map((c) => (
              <button key={c.slug} type="button" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)} className={cn("min-h-11 shrink-0 border px-3 text-[0.875rem] transition-colors duration-[250ms]", cat === c.slug ? "border-night bg-night text-pearl" : "rule hover:border-night")}>{c.name.en}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button type="button" aria-pressed={onlyPad} onClick={() => setOnlyPad((v) => !v)} className={cn("min-h-11 border px-3 text-[0.875rem]", onlyPad ? "border-night bg-night text-pearl" : "rule hover:border-night")}>In pad <span className="num">({touched.length})</span></button>
            <button type="button" onClick={() => setOpen(allOpen ? {} : Object.fromEntries(rows.map((p) => [p.id, true])))} className="grid h-11 w-11 place-items-center border rule hover:border-night" aria-label={allOpen ? "Close all rows" : "Open all rows"} title={allOpen ? "Close all" : "Open all"}>
              {allOpen ? <ChevronsDownUp size={17} strokeWidth={1.4} aria-hidden /> : <ChevronsUpDown size={17} strokeWidth={1.4} aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      <section className="surface-pearl pb-36 lg:pb-24">
        <div className="container-x grid gap-8 py-6 lg:grid-cols-[61.8fr_38.2fr] lg:gap-12 lg:py-10">
          <div>
            {/* Phones: paste panel folds above the sheet */}
            <details className="mb-6 lg:hidden">
              <summary className="flex min-h-12 cursor-pointer items-center justify-between border border-night px-4 text-[0.9375rem] font-medium"><span className="flex items-center gap-2"><ClipboardPaste size={16} strokeWidth={1.4} aria-hidden />Paste or upload SKUs</span><ChevronDown size={16} aria-hidden /></summary>
              <div className="mt-2">{pastePanel}</div>
            </details>

            <QuickAdd onAdd={quickAdd} />

            <table className="w-full border-collapse text-left">
              <caption className="sr-only">All pieces with quantities</caption>
              <thead>
                <tr className="border-b border-night text-[0.8125rem]">
                  <th scope="col" className="py-2 pr-3 font-medium">Piece</th>
                  <th scope="col" className="hidden py-2 pr-3 font-medium sm:table-cell">Unit price</th>
                  <th scope="col" className="hidden py-2 pr-3 font-medium md:table-cell">Quick quantity</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Units</th>
                  <th scope="col" className="w-12 py-2"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, ri) => {
                  const units = unitsFor(p);
                  const showHead = cat === "all" && !q && !onlyPad && (ri === 0 || rows[ri - 1].categorySlug !== p.categorySlug);
                  const defKey = k(p.id, p.colours[0].name, middle(orderAxis(p).options));
                  const isOpen = !!open[p.id];
                  const axis = orderAxis(p);
                  const moq = p.wholesale.minOrderQty;
                  const ok = units >= moq;
                  return (
                    <Fragment key={p.id}>
                      {showHead && (
                        <tr>
                          <th colSpan={5} scope="colgroup" className={cn("pb-2 text-left", ri === 0 ? "pt-2" : "pt-8")}>
                            <span className="flex items-baseline gap-3"><span className="font-display text-h4">{getCategory(p.categorySlug)?.name.en}</span><span className="num text-[0.8125rem] font-normal opacity-60">{rows.filter((x) => x.categorySlug === p.categorySlug).length} pieces</span></span>
                          </th>
                        </tr>
                      )}
                      <tr className={cn("border-b rule transition-colors duration-[618ms]", flash.includes(p.id) ? "bg-gold/20" : isOpen ? "bg-pearl-light" : "hover:bg-pearl-light/60")}>
                        <td className="py-2 pr-3">
                          <button type="button" onClick={() => setOpen((o) => ({ ...o, [p.id]: !isOpen }))} className="flex w-full items-center gap-3 text-left" aria-expanded={isOpen} aria-controls={`row-${p.id}`}>
                            <span className="w-11 shrink-0"><ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt="" label={false} /></span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{p.name}</span>
                              <span className="num block text-[0.8125rem] opacity-75">{p.sku} · MOQ {moq}</span>
                            </span>
                          </button>
                        </td>
                        <td className="num hidden py-2 pr-3 text-[0.9375rem] sm:table-cell"><ConfirmText text={fmtPKR(unitPriceFor(p, units))} /></td>
                        <td className="hidden py-2 pr-3 md:table-cell">
                          <Stepper size="sm" value={pad[defKey] ?? 0} onChange={(n) => set(defKey, n)} label={`${p.name}, ${p.colours[0].name}, ${middle(orderAxis(p).options)}`} />
                          <span className="mt-0.5 block text-[0.6875rem] opacity-60">{p.colours[0].name}{middle(orderAxis(p).options) !== "One size" ? ` · ${middle(orderAxis(p).options)}` : ""}</span>
                        </td>
                        <td className="num py-2 pr-3 text-right">
                          <span className={cn("inline-flex min-w-12 items-center justify-center gap-1 px-2 py-0.5", units === 0 ? "opacity-45" : !ok ? "border border-laal text-laal-deep" : "bg-night text-pearl")}>
                            {ok && <Check size={12} strokeWidth={2} className="text-gold" aria-hidden />}{fmtNum(units)}
                          </span>
                        </td>
                        <td className="py-2">
                          <button type="button" onClick={() => setOpen((o) => ({ ...o, [p.id]: !isOpen }))} aria-expanded={isOpen} aria-controls={`row-${p.id}`} aria-label={`${isOpen ? "Close" : "Open"} quantities for ${p.name}`} className="grid h-11 w-11 place-items-center">
                            <ChevronDown size={18} strokeWidth={1.4} aria-hidden className={cn("transition-transform duration-[382ms]", isOpen && "rotate-180")} />
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr id={`row-${p.id}`} className="border-b rule bg-pearl-light">
                          <td colSpan={5} className="px-2 pb-4 pt-1">
                            <div className="overflow-x-auto animate-[settle_382ms_var(--ease)]">
                              <table className="min-w-max border-collapse">
                                <thead><tr className="text-[0.75rem]"><th className="py-1 pr-3 text-left font-medium">Colour</th>{axis.options.map((o) => <th key={o} className="px-1 py-1 text-left font-medium">{o}</th>)}</tr></thead>
                                <tbody>
                                  {p.colours.map((c) => (
                                    <tr key={c.name}>
                                      <th scope="row" className="py-1.5 pr-3 text-left text-[0.875rem] font-normal"><span className="flex items-center gap-2"><span className="h-3 w-3 border border-night/30" style={{ background: c.hex }} aria-hidden />{c.name}</span></th>
                                      {axis.options.map((o) => (
                                        <td key={o} className="px-1 py-1.5"><Stepper size="sm" value={pad[k(p.id, c.name, o)] ?? 0} onChange={(n) => set(k(p.id, c.name, o), n)} label={`${p.name}, ${c.name}, ${o}`} /></td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.875rem]">
                              {!ok ? (
                                <>
                                  <span className="text-laal-deep">{units ? `Add ${moq - units} more to reach the minimum of ${moq}.` : `Minimum ${moq}, mixed across colours and sizes.`}</span>
                                  <button type="button" onClick={() => fillMinimum(p)} className="link min-h-10">Fill minimum</button>
                                </>
                              ) : <span className="inline-flex items-center gap-1.5"><Check size={14} strokeWidth={1.8} className="text-gold-deep" aria-hidden />Minimum reached</span>}
                              <Link to={`/product/${p.id}`} className="link ml-auto min-h-10 content-center opacity-80">Details</Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <p className="py-10">{onlyPad ? "The pad is empty. Open a row or paste some SKUs." : "No pieces match. Try another SKU or clear the filter."}</p>}
          </div>

          {/* Desktop: summary + paste */}
          <aside className="hidden lg:block">
            <div data-lenis-prevent className="sticky top-[148px] follow-hdr max-h-[calc(100vh-170px)] space-y-5 overflow-y-auto">
              <div className="surface-light border hairline-gold p-5 lg:p-6">
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-h4">Your pad</p>
                  {touched.length > 0 && <button type="button" onClick={clearPad} className="inline-flex min-h-10 items-center gap-1.5 text-[0.8125rem] opacity-70 hover:opacity-100"><Trash2 size={14} strokeWidth={1.4} aria-hidden />Clear</button>}
                </div>
                {touched.length === 0 ? (
                  <p className="mt-3 text-[0.9375rem] opacity-80">Nothing yet. Open a row and use + and −, or paste SKUs below.</p>
                ) : (
                  <ul className="mt-4 max-h-[34vh] space-y-2 overflow-y-auto border-t rule pt-3" data-lenis-prevent>
                    {touched.map((p) => {
                      const u = unitsFor(p);
                      const ok = u >= p.wholesale.minOrderQty;
                      return (
                        <li key={p.id} className="flex items-center gap-3 text-[0.875rem]">
                          <span className={cn("grid h-5 w-5 shrink-0 place-items-center", ok ? "bg-night" : "border border-laal")} aria-hidden>{ok ? <Check size={11} strokeWidth={2} className="text-gold" /> : <span className="h-1 w-1 bg-laal" />}</span>
                          <button type="button" onClick={() => { setOpen((o) => ({ ...o, [p.id]: true })); setTimeout(() => document.getElementById(`row-${p.id}`)?.scrollIntoView({ block: "center" }), 60); }} className="min-w-0 flex-1 truncate text-left hover:underline">{p.name}</button>
                          <span className={cn("num shrink-0", !ok && "text-laal-deep")}>{fmtNum(u)}{!ok && ` / ${p.wholesale.minOrderQty}`}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <dl className="num mt-4 space-y-1.5 border-t rule pt-4 text-[0.9375rem]">
                  <div className="flex justify-between"><dt>Pieces</dt><dd>{touched.length}</dd></div>
                  <div className="flex justify-between"><dt>Units</dt><dd>{fmtNum(totalUnits)}</dd></div>
                  <div className="flex justify-between font-medium"><dt>Subtotal</dt><dd><ConfirmText text={fmtPKR(subtotal)} /></dd></div>
                </dl>
                {under.length > 0 && (
                  <p className="mt-3 text-[0.875rem] text-laal-deep">{under.length} under minimum. <button type="button" onClick={fillAllShort} className="link">Fill them all</button></p>
                )}
                <Button className="mt-5 w-full" onClick={commit} disabled={totalUnits === 0}>Add all to list</Button>
                <p className="mt-2 text-center text-[0.75rem] opacity-70">Saved as a draft in this browser.</p>
              </div>
              {pastePanel}
            </div>
          </aside>
        </div>
      </section>

      {/* Phones: sticky pad summary */}
      <div className="surface-deep fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-40 border-t hairline-gold lg:hidden">
        <div className="container-x flex items-center gap-3 py-2.5">
          <div className="num min-w-0 flex-1 text-[0.875rem]">
            <p><span className="text-gold">{touched.length}</span> pieces · <span className="text-gold">{fmtNum(totalUnits)}</span> units</p>
            {under.length > 0 ? <button type="button" onClick={fillAllShort} className="text-[0.8125rem] text-laal-light underline underline-offset-2">{under.length} under minimum · fill</button> : <p className="text-[0.8125rem] text-pearl/65">Draft saved</p>}
          </div>
          <Button size="sm" onClick={commit} disabled={totalUnits === 0}>Add all</Button>
        </div>
      </div>
    </>
  );
}
