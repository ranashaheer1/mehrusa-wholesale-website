import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { Drawer } from "vaul";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckSquare, Layers, ChevronDown, Columns3, Heart, LayoutGrid, Rows3, Search, SlidersHorizontal, Sparkles, Square, X } from "lucide-react";
import { categories, getCategory } from "@/data/categories";
import { getProduct, products } from "@/data/products";
import { getMaterial } from "@/data/materials";
import { occasionLabel } from "@/data/buyers";
import type { Occasion, Product } from "@/data/types";
import { ProductCard, ProductRow } from "@/components/catalogue/ProductCard";
import { ProductImage } from "@/components/catalogue/ProductImage";
import { GlanceStrip } from "@/components/catalogue/GlanceStrip";
import { CatalogueButton } from "@/components/ui/CatalogueButton";
import { Button, ButtonA } from "@/components/ui/Button";
import { EASE, Reveal, Urdu, usePageMeta } from "@/components/ui/bits";
import { flyToList } from "@/components/ui/FlyLayer";
import { useMemory } from "@/store/memory";
import { useList, useUI } from "@/store/list";
import { COMPARE_MAX, usePrefs } from "@/store/prefs";
import { tex } from "@/lib/images";
import { waLink } from "@/lib/message";
import { orderAxis } from "@/lib/pricing";
import { ComingSoon } from "./ComingSoon";
import NotFound from "./NotFound";
import { cn } from "@/utils/cn";

type Facet = { key: string; label: string; options: { value: string; label: string; hex?: string }[]; multi: boolean; match: (p: Product, values: string[]) => boolean };

const PAGE = 12;
const allColours = Array.from(new Map(products.flatMap((p) => p.colours.map((c) => [c.name, c.hex] as const))).entries());
const allMaterials = Array.from(new Set(products.map((p) => p.material)));
const allMoq = Array.from(new Set(products.map((p) => p.wholesale.minOrderQty))).sort((a, b) => a - b);
const priced = products.flatMap((p) => p.wholesale.tiers.map((t) => t.pricePKR).filter((x): x is number => x !== null));

const fuse = new Fuse(products, { keys: [{ name: "name", weight: 2 }, "sku", "categorySlug", "description", "colours.name"], threshold: 0.35, ignoreLocation: true });

const sorters: Record<string, { label: string; fn: (a: Product, b: Product) => number }> = {
  newest: { label: "Newest first", fn: (a, b) => b.addedAt.localeCompare(a.addedAt) },
  price: { label: "Price, low to high", fn: (a, b) => (a.wholesale.tiers[0]?.pricePKR ?? Infinity) - (b.wholesale.tiers[0]?.pricePKR ?? Infinity) },
  moq: { label: "Lowest minimum", fn: (a, b) => a.wholesale.minOrderQty - b.wholesale.minOrderQty },
  name: { label: "Name, A to Z", fn: (a, b) => a.name.localeCompare(b.name) },
};

const facetDefs = (withCategory: boolean): Facet[] => [
  ...(withCategory ? [{ key: "cat", label: "Category", multi: true, options: categories.filter((c) => c.status === "live").map((c) => ({ value: c.slug, label: c.name.en })), match: (p: Product, v: string[]) => v.includes(p.categorySlug) }] : []),
  { key: "for", label: "Good for", multi: true, options: (Object.keys(occasionLabel) as Occasion[]).map((o) => ({ value: o, label: occasionLabel[o] })), match: (p, v) => !!p.goodFor?.some((o) => v.includes(o)) },
  { key: "colour", label: "Colour", multi: true, options: allColours.map(([name, hex]) => ({ value: name, label: name, hex })), match: (p, v) => p.colours.some((c) => v.includes(c.name)) },
  { key: "stock", label: "Availability", multi: true, options: [{ value: "in", label: "In stock" }, { value: "mto", label: "Made to order" }], match: (p, v) => (p.wholesale.inStock === "made-to-order" ? v.includes("mto") : p.wholesale.inStock ? v.includes("in") : false) },
  { key: "moq", label: "Minimum order", multi: true, options: allMoq.map((m) => ({ value: String(m), label: `${m} pieces` })), match: (p, v) => v.includes(String(p.wholesale.minOrderQty)) },
  { key: "material", label: "Material", multi: true, options: allMaterials.map((m) => ({ value: m, label: getMaterial(m)?.name ?? m })), match: (p, v) => v.includes(p.material) },
  { key: "new", label: "New", multi: false, options: [{ value: "1", label: "New arrivals only" }], match: (p) => !!p.badges?.includes("new") },
];

/** One-tap presets: the filters buyers reach for most. */
const presets: { label: string; key: string; value: string }[] = [
  { label: "New arrivals", key: "new", value: "1" },
  { label: "Eid", key: "for", value: "eid" },
  { label: "Gifting", key: "for", value: "gifting" },
  { label: "Everyday", key: "for", value: "everyday" },
  { label: "Gold-coloured", key: "colour", value: "Gold-coloured" },
  { label: "Natural steel", key: "colour", value: "Natural steel" },
  { label: "In stock", key: "stock", value: "in" },
];

function EditorialBreak({ eyebrow, title, sub, img, to, cta, onClick, urdu }: { eyebrow: string; title: string; sub: string; img: Parameters<typeof tex>[0]; to?: string; cta: string; onClick?: () => void; urdu?: string }) {
  const inner = (
    <>
      <img decoding="async" src={tex(img)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease)] group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-r from-night-deep via-night-deep/80 to-night-deep/20" />
      <span className="absolute inset-3 border border-gold/0 transition-colors duration-[618ms] group-hover:border-gold/60" aria-hidden />
      <div className="relative flex h-full flex-col justify-center gap-2 p-6 text-left text-pearl sm:p-8 lg:p-10">
        <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-gold" aria-hidden />{eyebrow}</p>
        <div className="flex flex-wrap items-baseline gap-x-4">
          <p className="font-display text-[1.75rem] leading-tight sm:text-h2">{title}</p>
          {urdu && <Urdu display as="span" className="text-[1.5rem] leading-[2] text-gold">{urdu}</Urdu>}
        </div>
        <p className="max-w-[46ch] text-[0.9375rem] text-pearl/85 sm:text-[1.0625rem]">{sub}</p>
        <span className="mt-2 inline-flex items-center gap-2 text-[0.9375rem] text-gold-light">{cta}<ArrowRight size={16} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" /></span>
      </div>
    </>
  );
  const cls = "group relative block min-h-[220px] w-full overflow-hidden sm:min-h-[240px]";
  return (
    <Reveal>
      {to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>}
    </Reveal>
  );
}

export default function Shop() {
  const { slug } = useParams();
  const cat = getCategory(slug);
  const [params, setParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ material: true, moq: true });
  const [shown, setShown] = useState(PAGE);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const shortlist = useMemory((s) => s.shortlist);
  const recentIds = useMemory((s) => s.recent);
  const addMany = useList((s) => s.addMany);
  const openList = useUI((s) => s.setListOpen);
  const setAssistant = useUI((s) => s.setAssistantOpen);
  const view = params.get("view") === "table" ? "table" : "grid";
  const size = params.get("size") === "lg" ? "lg" : "md";
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "newest";
  const maxPrice = params.get("max");
  const saved = params.get("saved") === "1";
  const reduce = useReducedMotion();

  usePageMeta(cat ? `${cat.name.en} wholesale` : "Shop the range", cat?.intro ?? "Stainless steel jewellery for wholesale: rings, earrings, necklaces, pendants, bracelets and sets.");
  useEffect(() => { if (params.get("focus") === "search") searchRef.current?.focus(); }, [params]);

  const facets = useMemo(() => facetDefs(!slug), [slug]);
  const pkey = params.toString();
  useEffect(() => setShown(PAGE), [pkey, slug]);
  useEffect(() => { setSelecting(false); setSelected([]); }, [slug]);

  const base = useMemo(() => {
    let list: Product[] = q ? fuse.search(q).map((r) => r.item) : [...products];
    if (slug) list = list.filter((p) => p.categorySlug === slug);
    if (saved) list = list.filter((p) => shortlist.includes(p.id));
    if (maxPrice) list = list.filter((p) => (p.wholesale.tiers[0]?.pricePKR ?? 0) <= Number(maxPrice));
    return list;
  }, [q, slug, saved, shortlist, maxPrice]);

  const applyFacets = (list: Product[], except?: string) =>
    facets.reduce((acc, f) => {
      if (f.key === except) return acc;
      const v = params.getAll(f.key);
      return v.length ? acc.filter((p) => f.match(p, v)) : acc;
    }, list);

  const results = useMemo(() => {
    const list = [...applyFacets(base)];
    if (!q || params.get("sort")) list.sort(sorters[sort]?.fn ?? sorters.newest.fn);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, pkey]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    facets.forEach((f) => {
      const pool = applyFacets(base, f.key);
      f.options.forEach((o) => (out[`${f.key}:${o.value}`] = pool.filter((p) => f.match(p, [o.value])).length));
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, pkey, facets]);

  if (slug && !cat) return <NotFound />;
  if (cat?.status === "coming-soon") return <ComingSoon category={cat} />;

  const update = (fn: (n: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    fn(next);
    next.delete("focus");
    setParams(next, { replace: true });
  };
  const toggle = (key: string, value: string, multi: boolean) =>
    update((next) => {
      const cur = next.getAll(key);
      next.delete(key);
      if (multi) (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]).forEach((v) => next.append(key, v));
      else if (!cur.includes(value)) next.set(key, value);
    });
  const setParam = (k: string, v: string) => update((next) => (v ? next.set(k, v) : next.delete(k)));
  const chips = facets.flatMap((f) => params.getAll(f.key).map((v) => ({ f, v, label: f.options.find((o) => o.value === v)?.label ?? v })));
  const clearAll = () => update((next) => { facets.forEach((f) => next.delete(f.key)); next.delete("max"); next.delete("saved"); });
  const totalInScope = slug ? products.filter((p) => p.categorySlug === slug).length : products.length;
  const filtered = chips.length > 0 || !!q || saved;
  const recent = recentIds.map(getProduct).filter((p): p is Product => !!p).slice(0, 6);
  const visible = results.slice(0, shown);
  const grouped = !slug && !filtered && view === "grid" && !params.get("sort") && params.get("flat") !== "1";
  const liveCats = categories.filter((c) => c.status === "live");
  const giftBreak = <EditorialBreak eyebrow="For gifting" title="Gift sets, boxed and ready" urdu="سیٹ" sub="Matched pieces in the midnight box. Nothing to pair or pack on your side." img="laal-whisper" to="/shop/sets" cta="Shop gift sets" />;
  const eidBreak = <EditorialBreak eyebrow="Seasonal" title="The Eid edit" sub="Crescents, drops and stacking pieces, chosen for the season's gifting." img="chaand-raat-sky" to="/shop?for=eid" cta="See the Eid edit" />;
  const helpBreak = <EditorialBreak eyebrow="Not sure where to start?" title="Get a ready first order" sub="Answer three questions about your shop. We suggest pieces that meet every minimum." img="velvet-fabric" onClick={() => setAssistant(true)} cta="Build my first order" />;
  const cardsGrid = size === "lg" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const addSelected = () => {
    const ps = selected.map(getProduct).filter((p): p is Product => !!p);
    addMany(ps.map((p) => ({ productId: p.id, colour: p.colours[0].name, option: orderAxis(p).options[Math.floor((orderAxis(p).options.length - 1) / 2)], qty: p.wholesale.minOrderQty })));
    flyToList();
    toast(`${ps.length} pieces added at their minimum.`, { description: "Change colours and sizes in your list.", action: { label: "View list", onClick: () => openList(true) } });
    setSelected([]);
    setSelecting(false);
  };
  const compareSelected = () => {
    const prefs = usePrefs.getState();
    prefs.clearCompare();
    selected.slice(0, COMPARE_MAX).forEach((id) => prefs.toggleCompare(id));
    if (selected.length > COMPARE_MAX) toast(`Comparing the first ${COMPARE_MAX}. You can swap pieces in the tray.`);
  };

  const facetList = (idPrefix: string) => (
    <div className="space-y-1">
      {facets.map((f) => {
        const isCollapsed = collapsed[f.key] && !params.getAll(f.key).length;
        const activeN = params.getAll(f.key).length;
        return (
          <fieldset key={f.key} className="border-b rule pb-2">
            <legend className="w-full">
              <button type="button" onClick={() => setCollapsed((c) => ({ ...c, [f.key]: !isCollapsed }))} aria-expanded={!isCollapsed} className="flex min-h-12 w-full items-center justify-between">
                <span className="eyebrow">{f.label}{activeN > 0 && <span className="num ml-2 normal-case tracking-normal">({activeN})</span>}</span>
                <ChevronDown size={16} strokeWidth={1.4} aria-hidden className={cn("transition-transform duration-[382ms]", !isCollapsed && "rotate-180")} />
              </button>
            </legend>
            {!isCollapsed && (
              <ul className="animate-[settle_382ms_var(--ease)]">
                {f.options.map((o) => {
                  const id = `${idPrefix}-${f.key}-${o.value}`;
                  const checked = params.getAll(f.key).includes(o.value);
                  const n = counts[`${f.key}:${o.value}`] ?? 0;
                  const empty = n === 0 && !checked;
                  return (
                    <li key={o.value}>
                      <label htmlFor={id} className={cn("flex min-h-11 items-center gap-3", empty ? "cursor-not-allowed opacity-40" : "cursor-pointer")}>
                        <input id={id} type="checkbox" checked={checked} disabled={empty} onChange={() => toggle(f.key, o.value, f.multi)} className="peer sr-only" />
                        <span className={cn("grid h-5 w-5 shrink-0 place-items-center border border-night/50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-deep", checked && "border-night bg-night")} aria-hidden>
                          {checked && <span className="h-2 w-2 rotate-45 bg-gold" />}
                        </span>
                        {o.hex && <span className="h-3.5 w-3.5 shrink-0 border border-night/30" style={{ background: o.hex }} aria-hidden />}
                        <span className="flex-1">{o.label}</span>
                        <span className="num text-[0.8125rem] opacity-70" aria-label={`${n} pieces`}>{n}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </fieldset>
        );
      })}
      <fieldset className="pt-3">
        <legend className="eyebrow mb-2">Price range</legend>
        {priced.length ? (
          <label className="block">
            <span className="text-[0.875rem]">Up to PKR {Number(maxPrice ?? Math.max(...priced)).toLocaleString("en-PK")}</span>
            <input type="range" min={Math.min(...priced)} max={Math.max(...priced)} value={maxPrice ?? Math.max(...priced)} onChange={(e) => setParam("max", e.target.value)} className="mt-2 w-full accent-[#0F1938]" />
          </label>
        ) : (
          <p className="text-[0.875rem] opacity-80">Prices are being confirmed. This filter opens once they are listed.</p>
        )}
      </fieldset>
    </div>
  );

  const helpCard = (
    <li key="help-card" className={cn(size === "lg" ? "col-span-1" : "col-span-2 md:col-span-1")}>
      <div className="surface-night grain relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden border hairline-gold p-5">
        <div>
          <Sparkles size={22} strokeWidth={1.2} className="text-gold" aria-hidden />
          <p className="mt-4 eyebrow">Not sure where to start?</p>
          <p className="mt-2 font-display text-h4 leading-snug">Answer three questions. Get a ready first order.</p>
        </div>
        <div className="mt-6 grid gap-2">
          <Button size="sm" onClick={() => setAssistant(true)}>Build my first order</Button>
          <ButtonA size="sm" variant="ghost" href={waLink("Assalam o alaikum Mehrusa, please help me choose pieces for my shop.")} target="_blank" rel="noopener noreferrer">Or ask us to choose</ButtonA>
        </div>
      </div>
    </li>
  );

  const bannerImg = cat ? cat.coverImage : "velvet-fabric";

  return (
    <>
      {/* Editorial header */}
      <header className="surface-deep grain relative overflow-hidden">
        <img decoding="async" src={tex(bannerImg)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 md:left-auto md:w-[55%] md:opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-night-deep via-night-deep/85 to-night-deep/30 md:via-night-deep/90 md:to-transparent" aria-hidden />
        <div className="container-x relative py-8 sm:py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 text-[0.8125rem] text-pearl/70">
            <Link to="/" className="hover:text-gold">Home</Link> <span aria-hidden className="mx-1">/</span> {cat ? <><Link to="/shop" className="hover:text-gold">Shop</Link> <span aria-hidden className="mx-1">/</span> <span aria-current="page" className="text-pearl">{cat.name.en}</span></> : <span aria-current="page" className="text-pearl">Shop</span>}
          </nav>
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-gold" aria-hidden />{cat ? "Jewellery" : "The wholesale range"}<span className="num normal-case tracking-normal text-pearl/60">· {totalInScope} pieces</span></p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-5">
              <h1 className="font-display text-[2.5rem] leading-[1.05] text-pearl sm:text-h1">{cat?.name.en ?? "All pieces"}</h1>
              {cat?.name.ur && <Urdu display as="span" className="text-[1.75rem] leading-[2] text-gold sm:text-h3">{cat.name.ur}</Urdu>}
            </div>
            <p className="mt-3 max-w-[52ch] text-[1.0625rem] text-pearl/85 sm:text-lead">{cat?.intro ?? "Stainless steel jewellery, made with care and sent in the midnight box. Mix colours and sizes to reach each minimum."}</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[0.9375rem]">
              <Link to="/quick-order" className="inline-flex min-h-11 items-center gap-2 text-gold-light hover:text-gold">Quick order pad <ArrowRight size={15} strokeWidth={1.4} aria-hidden /></Link>
              <CatalogueButton className="text-pearl/85 hover:text-gold" label="Download the catalogue" />
            </div>
          </div>
        </div>
      </header>

      {/* Category tabs */}
      <nav aria-label="Categories" className="surface-pearl border-b rule">
        <ul className="container-x no-scrollbar flex gap-1 overflow-x-auto">
          {[{ slug: "", name: { en: "All" }, status: "live" as const }, ...categories].map((c) => {
            const active = (slug ?? "") === c.slug;
            const n = c.slug ? products.filter((p) => p.categorySlug === c.slug).length : products.length;
            return (
              <li key={c.slug || "all"} className="shrink-0">
                <Link to={{ pathname: c.slug ? `/shop/${c.slug}` : "/shop", search: view === "table" ? "?view=table" : "" }} aria-current={active ? "page" : undefined} className={cn("relative inline-flex min-h-12 items-center gap-1.5 px-3 text-[0.9375rem] transition-opacity duration-[250ms]", active ? "font-medium" : "opacity-70 hover:opacity-100")}>
                  {c.name.en}
                  <span className="num text-[0.75rem] opacity-70">{c.status === "coming-soon" ? "soon" : n}</span>
                  {active && <motion.span layoutId="cat-tab" className="absolute inset-x-3 bottom-0 h-[2px] bg-gold" transition={{ duration: 0.382, ease: EASE }} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sticky toolbar: search first on phones, then actions */}
      <div className="surface-pearl sticky top-16 lg:top-[72px] follow-hdr z-30 border-b rule shadow-[0_8px_24px_-20px_rgba(9,16,35,0.5)] ">
        <div className="container-x flex flex-wrap items-center gap-2 py-2.5 sm:gap-3 sm:py-3">
          <label className="relative order-1 w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
            <span className="sr-only">Search in {cat?.name.en ?? "the range"}</span>
            <Search size={16} strokeWidth={1.4} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" aria-hidden />
            <input ref={searchRef} type="search" className="field min-h-11 pl-9 pr-9" placeholder={`Search ${cat ? cat.name.en.toLowerCase() : "by name or SKU"}`} value={q} onChange={(e) => setParam("q", e.target.value)} />
            {q && <button type="button" onClick={() => setParam("q", "")} className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center opacity-70 hover:opacity-100" aria-label="Clear search"><X size={15} aria-hidden /></button>}
          </label>
          <div className="order-2 flex w-full items-center gap-2 sm:order-none sm:w-auto">
            <button type="button" onClick={() => setSheet(true)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-night px-3 text-[0.875rem] font-medium sm:flex-none lg:hidden">
              <SlidersHorizontal size={16} strokeWidth={1.4} aria-hidden />Filter{chips.length ? <span className="num grid h-5 min-w-5 place-items-center bg-night px-1 text-[0.6875rem] text-pearl">{chips.length}</span> : null}
            </button>
            <label className="flex min-w-0 flex-1 items-center gap-2 text-[0.875rem] sm:flex-none">
              <span className="hidden md:inline">Sort</span>
              <select className="field min-h-11 w-full py-2 sm:w-auto" value={sort} onChange={(e) => setParam("sort", e.target.value)} aria-label="Sort pieces">
                {Object.entries(sorters).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
            </label>
            <button type="button" aria-pressed={saved} onClick={() => setParam("saved", saved ? "" : "1")} className={cn("inline-flex min-h-11 shrink-0 items-center gap-2 border px-3 text-[0.875rem]", saved ? "border-night bg-night text-pearl" : "rule hover:border-night")} aria-label={`Shortlist, ${shortlist.length}`}>
              <Heart size={15} strokeWidth={1.4} aria-hidden className={cn(saved && "fill-laal stroke-laal")} /><span className="hidden lg:inline">Shortlist</span><span className="num">{shortlist.length}</span>
            </button>
            <div className="flex shrink-0 border rule" role="group" aria-label="View">
              <button type="button" aria-pressed={view === "grid" && size === "md"} onClick={() => update((n) => { n.delete("view"); n.delete("size"); })} className={cn("grid h-11 w-11 place-items-center", view === "grid" && size === "md" && "bg-night text-pearl")} aria-label="Grid" title="Grid"><LayoutGrid size={17} strokeWidth={1.4} aria-hidden /></button>
              <button type="button" aria-pressed={view === "grid" && size === "lg"} onClick={() => update((n) => { n.delete("view"); n.set("size", "lg"); })} className={cn("grid h-11 w-11 place-items-center", view === "grid" && size === "lg" && "bg-night text-pearl")} aria-label="Larger cards" title="Larger"><Square size={16} strokeWidth={1.4} aria-hidden /></button>
              <button type="button" aria-pressed={view === "table"} onClick={() => update((n) => { n.set("view", "table"); n.delete("size"); })} className={cn("hidden h-11 w-11 place-items-center sm:grid", view === "table" && "bg-night text-pearl")} aria-label="Line sheet table" title="Line sheet"><Rows3 size={17} strokeWidth={1.4} aria-hidden /></button>
            </div>
          </div>
        </div>
        {chips.length > 0 && (
          <div className="container-x no-scrollbar flex items-center gap-2 overflow-x-auto pb-2.5">
            {chips.map(({ f, v, label }) => (
              <button key={f.key + v} type="button" onClick={() => toggle(f.key, v, f.multi)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-night/40 bg-pearl-light px-3 text-[0.8125rem] hover:border-night" aria-label={`Remove filter ${label}`}>
                {label} <X size={14} strokeWidth={1.5} aria-hidden />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="link min-h-9 shrink-0 px-2 text-[0.8125rem]">Clear all</button>
          </div>
        )}
      </div>

      <GlanceStrip />

      <section className="surface-pearl">
        <div className="container-x grid grid-cols-4 gap-6 py-6 md:grid-cols-8 lg:grid-cols-12 lg:py-10">
          <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters">
            <div data-lenis-prevent className="sticky top-[152px] follow-hdr max-h-[calc(100vh-170px)] overflow-y-auto pr-4">
              <div className="mb-1 flex items-baseline justify-between">
                <p className="font-display text-h4">Filter</p>
                {chips.length > 0 && <button type="button" onClick={clearAll} className="link text-[0.8125rem]">Clear all</button>}
              </div>
              {facetList("rail")}
            </div>
          </aside>

          <div className="col-span-4 md:col-span-8 lg:col-span-9">
            {/* Presets + result line + select mode */}
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Popular filters">
              {presets.map((p) => {
                const on = params.getAll(p.key).includes(p.value);
                const n = counts[`${p.key}:${p.value}`];
                if (!on && n === 0) return null;
                return (
                  <button key={p.label} type="button" aria-pressed={on} onClick={() => toggle(p.key, p.value, p.key !== "new")} className={cn("inline-flex min-h-10 shrink-0 items-center gap-1.5 border px-3.5 text-[0.875rem] transition-colors duration-[250ms]", on ? "border-night bg-night text-pearl" : "rule bg-pearl-light hover:border-night")}>
                    {on && <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden />}{p.label}
                  </button>
                );
              })}
            </div>

            <div className="mb-5 mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="num text-[0.9375rem]" aria-live="polite">
                {filtered ? <>Showing <strong className="font-medium">{results.length}</strong> of {totalInScope} pieces{q && <> for "<span className="font-medium">{q}</span>"</>}</> : <><strong className="font-medium">{results.length}</strong> pieces</>}
                {saved && <span className="opacity-75"> · from your shortlist</span>}
              </p>
              <div className="flex items-center gap-1">
              {!slug && !filtered && view === "grid" && !params.get("sort") && (
                <button type="button" onClick={() => setParam("flat", grouped ? "1" : "")} aria-pressed={grouped} className="inline-flex min-h-10 items-center gap-2 px-2 text-[0.875rem] opacity-80 hover:opacity-100">
                  <Layers size={16} strokeWidth={1.4} aria-hidden />{grouped ? "One grid" : "Group by category"}
                </button>
              )}
              {view === "grid" && results.length > 0 && (
                <button type="button" onClick={() => { setSelecting((s) => !s); setSelected([]); }} aria-pressed={selecting} className={cn("inline-flex min-h-10 items-center gap-2 px-2 text-[0.875rem]", selecting ? "text-night" : "opacity-80 hover:opacity-100")}>
                  <CheckSquare size={16} strokeWidth={1.4} aria-hidden />{selecting ? "Done selecting" : "Select several"}
                </button>
              )}
              </div>
            </div>

            {results.length > 0 && view === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">Line sheet</caption>
                  <thead>
                    <tr className="border-b border-night text-[0.8125rem]">
                      <th scope="col" className="py-2"><span className="sr-only">Image</span></th>
                      <th scope="col" className="py-2 pr-3 font-medium">Piece</th>
                      <th scope="col" className="hidden py-2 pr-3 font-medium md:table-cell">Variants</th>
                      <th scope="col" className="py-2 pr-3 font-medium">MOQ</th>
                      <th scope="col" className="hidden py-2 pr-3 font-medium sm:table-cell">From</th>
                      <th scope="col" className="hidden py-2 pr-3 font-medium lg:table-cell">Availability</th>
                      <th scope="col" className="py-2 text-right font-medium"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>{visible.map((p) => <ProductRow key={p.id} p={p} />)}</tbody>
                </table>
              </div>
            ) : results.length > 0 && grouped ? (
              <div className="space-y-14 lg:space-y-16">
                {liveCats.map((c, ci) => {
                  const items = results.filter((p) => p.categorySlug === c.slug);
                  if (!items.length) return null;
                  const perRow = size === "lg" ? 3 : 4;
                  return (
                    <Fragment key={c.slug}>
                      <section aria-labelledby={`grp-${c.slug}`}>
                        <div className="mb-6 flex items-end justify-between gap-4 border-b rule pb-3">
                          <div className="min-w-0">
                            <p className="num font-display text-[0.9375rem] text-gold-deep">{String(ci + 1).padStart(2, "0")}</p>
                            <div className="flex flex-wrap items-baseline gap-x-3">
                              <h2 id={`grp-${c.slug}`} className="font-display text-[1.5rem] leading-tight sm:text-h3">{c.name.en}</h2>
                              {c.name.ur && <Urdu display as="span" className="text-[1.25rem] leading-[2] text-gold-deep">{c.name.ur}</Urdu>}
                            </div>
                            <p className="mt-1 hidden max-w-[56ch] text-[0.9375rem] opacity-80 sm:block">{c.intro}</p>
                          </div>
                          <Link to={`/shop/${c.slug}`} className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.9375rem] hover:text-gold-deep">
                            See all <span className="num">{items.length}</span><ArrowRight size={15} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" />
                          </Link>
                        </div>
                        <ul className={cn("grid gap-x-3 gap-y-9 sm:gap-x-4 lg:gap-x-6", cardsGrid)}>
                          {items.slice(0, perRow).map((p, i) => (
                            <li key={p.id}><Reveal delay={i * 0.05} className="h-full"><ProductCard p={p} size={size} selectable={selecting} selected={selected.includes(p.id)} onSelect={() => toggleSelect(p.id)} /></Reveal></li>
                          ))}
                        </ul>
                      </section>
                      {ci === 1 && giftBreak}
                      {ci === 3 && helpBreak}
                    </Fragment>
                  );
                })}
              </div>
            ) : results.length > 0 ? (
              <ul className={cn("grid gap-x-3 gap-y-9 sm:gap-x-4 lg:gap-x-6", cardsGrid)}>
                <AnimatePresence initial={false}>
                  {visible.flatMap((p, i) => {
                    const card = (
                      <motion.li key={p.id} layout={reduce ? false : "position"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.382, ease: EASE }}>
                        <ProductCard p={p} size={size} selectable={selecting} selected={selected.includes(p.id)} onSelect={() => toggleSelect(p.id)} />
                      </motion.li>
                    );
                    const extra: React.ReactNode[] = [];
                    if (!filtered && !selecting && i === 5) extra.push(helpCard);
                    if (!filtered && !selecting && i === 7) extra.push(<li key="gift-break" className="col-span-full">{giftBreak}</li>);
                    if (!filtered && !selecting && i === 15) extra.push(<li key="eid-break" className="col-span-full">{eidBreak}</li>);
                    return [card, ...extra];
                  })}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="border rule bg-pearl-light p-6 lg:p-10">
                <p className="font-display text-h3">Nothing matches all of these yet.</p>
                <p className="mt-2 max-w-[52ch] opacity-90">Try removing one filter, or let us help you find what your customers are asking for.</p>
                {chips.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {chips.map(({ f, v, label }) => (
                      <li key={f.key + v}><button type="button" onClick={() => toggle(f.key, v, f.multi)} className="inline-flex min-h-11 items-center gap-2 border rule px-3 text-[0.875rem] hover:border-night">Remove "{label}" <X size={14} aria-hidden /></button></li>
                    ))}
                  </ul>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>Show every piece</Button>
                  <ButtonA variant="ghost" href={waLink(`Assalam o alaikum Mehrusa, I am looking for${q ? ` "${q}"` : " a piece"}. Can you help?`)} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</ButtonA>
                </div>
              </div>
            )}

            {!grouped && results.length > shown && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="num text-[0.875rem] opacity-75">Showing {Math.min(shown, results.length)} of {results.length}</p>
                <div className="h-px w-48 bg-night/10"><div className="h-full bg-gold-deep transition-[width] duration-[618ms]" style={{ width: `${(Math.min(shown, results.length) / results.length) * 100}%` }} /></div>
                <Button variant="secondary" onClick={() => setShown((s) => s + PAGE)}>Show {Math.min(PAGE, results.length - shown)} more</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {recent.length > 1 && (
        <section className="surface-light border-t rule py-10" aria-labelledby="recent-shop">
          <div className="container-x">
            <h2 id="recent-shop" className="eyebrow mb-4">Recently viewed</h2>
            <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4">
              {recent.map((p) => (
                <li key={p.id} className="w-32 shrink-0 sm:w-40">
                  <Link to={`/product/${p.id}`} className="group block">
                    <ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt="" label={false} />
                    <p className="mt-2 truncate text-[0.875rem] group-hover:underline">{p.name}</p>
                    <p className="num text-[0.75rem] opacity-70">{p.sku}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Bulk action bar for select mode */}
      <AnimatePresence>
        {selecting && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.382, ease: EASE }} className="surface-night fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-40 border-t hairline-gold lg:bottom-0" role="region" aria-label="Selected pieces">
            <div className="container-x flex flex-wrap items-center gap-3 py-3 lg:pr-[132px]">
              <p className="num text-[0.9375rem]"><strong className="font-medium text-gold">{selected.length}</strong> selected</p>
              {selected.length === 0 && <p className="text-[0.875rem] text-pearl/70">Tap pieces to select them</p>}
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={compareSelected} disabled={selected.length < 2} className="hidden min-h-11 items-center gap-2 border border-pearl/30 px-3 text-[0.875rem] disabled:opacity-40 sm:inline-flex"><Columns3 size={15} strokeWidth={1.4} aria-hidden />Compare</button>
                <Button size="sm" onClick={addSelected} disabled={!selected.length}>Add {selected.length || ""} at minimum</Button>
                <button type="button" onClick={() => { setSelecting(false); setSelected([]); }} className="grid h-11 w-11 place-items-center" aria-label="Cancel selecting"><X size={18} strokeWidth={1.4} aria-hidden /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer.Root open={sheet} onOpenChange={setSheet}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[60] bg-night-deep/60" />
          <Drawer.Content className="surface-light fixed inset-x-0 bottom-0 z-[61] flex max-h-[90dvh] flex-col border-t hairline-gold outline-none" aria-describedby={undefined}>
            <div className="mx-auto mt-3 h-1 w-12 bg-night/25" aria-hidden />
            <div className="flex items-center justify-between border-b rule px-5 py-3">
              <Drawer.Title className="font-display text-h4">Filter</Drawer.Title>
              <Drawer.Close className="grid h-11 w-11 place-items-center" aria-label="Close filters"><X size={20} strokeWidth={1.4} aria-hidden /></Drawer.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3" data-vaul-no-drag data-lenis-prevent>{facetList("sheet")}</div>
            <div className="grid grid-cols-[auto_1fr] gap-3 border-t rule px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              <Button variant="secondary" onClick={clearAll}>Clear</Button>
              <Button onClick={() => setSheet(false)}>Show {results.length} {results.length === 1 ? "piece" : "pieces"}</Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
