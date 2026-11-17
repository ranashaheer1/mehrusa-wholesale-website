import { scrollToTarget } from "@/lib/smooth";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Copy, Expand, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Lightbox } from "@/components/product/Lightbox";
import { useList, useUI } from "@/store/list";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getCategory } from "@/data/categories";
import { getProduct, products } from "@/data/products";
import { getMaterial } from "@/data/materials";
import type { Glyph } from "@/data/types";
import { site, terms } from "@/config/terms";
import { t } from "@/i18n/strings";
import { fmtNum, fmtPKR } from "@/lib/pricing";
import { productAskText, waLink } from "@/lib/message";
import { textures, type TextureKey } from "@/lib/images";
import { useMemory } from "@/store/memory";
import { ProductImage } from "@/components/catalogue/ProductImage";
import { ProductCard, ShortlistButton } from "@/components/catalogue/ProductCard";
import { MarginPlanner } from "@/components/product/MarginPlanner";
import { SizeGuide } from "@/components/product/SizeGuide";
import { CompareToggle } from "@/components/compare/Compare";
import { occasionLabel, starterKits } from "@/data/buyers";
import { OrderTotals, TierProgress, TierTable, VariantMatrix, useOrderBuilder } from "@/components/product/OrderBuilder";
import { Button, ButtonA } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/overlays";
import { Badge, Confirm, ConfirmText, EASE, Eyebrow, Val, usePageMeta } from "@/components/ui/bits";
import NotFound from "./NotFound";
import { cn } from "@/utils/cn";

export function Gallery({ images, glyph, name, pid, onOpen }: { images: TextureKey[]; glyph: Glyph; name: string; pid?: string; onOpen?: (i: number) => void }) {
  const [ref, api] = useEmblaCarousel({ loop: false, duration: 30 });
  const [sel, setSel] = useState(0);
  useEffect(() => {
    if (!api) return;
    const on = () => setSel(api.selectedScrollSnap());
    api.on("select", on);
    on();
    return () => { api.off("select", on); };
  }, [api]);
  const go = useCallback((i: number) => api?.scrollTo(i), [api]);
  const sig = images.join("|");
  useEffect(() => { api?.reInit(); api?.scrollTo(0, true); }, [api, sig]);
  return (
    <div role="region" aria-roledescription="carousel" aria-label={`${name} images`} onKeyDown={(e) => { if (e.key === "ArrowLeft") api?.scrollPrev(); if (e.key === "ArrowRight") api?.scrollNext(); }}>
      <div className="relative">
        <div className="overflow-hidden" ref={ref}>
          <div className="flex">
            {images.map((img, i) => (
              <div key={i} className="min-w-0 shrink-0 grow-0 basis-full" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${images.length}`}>
                <button type="button" className="block w-full cursor-zoom-in" onClick={() => onOpen?.(i)} aria-label={`Open image ${i + 1} full screen`}>
                  <ProductImage texture={img} glyph={glyph} pid={pid} eager={i === 0} alt={`${name}, placeholder image ${i + 1} on ${textures[img].label.toLowerCase()}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <p className="num pointer-events-none absolute right-3 top-3 bg-pearl-light/90 px-2 py-0.5 text-[0.75rem] text-night" aria-hidden>{sel + 1} / {images.length}</p>
        <button type="button" onClick={() => onOpen?.(sel)} className="absolute bottom-3 left-3 inline-flex min-h-11 items-center gap-2 bg-pearl-light/90 px-3 text-[0.8125rem] text-night" aria-label="View full screen"><Expand size={15} strokeWidth={1.4} aria-hidden /> <span className="hidden sm:inline">Full screen</span></button>
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button type="button" onClick={() => api?.scrollPrev()} disabled={sel === 0} className="grid h-11 w-11 place-items-center bg-pearl-light/90 text-night disabled:opacity-40" aria-label="Previous image"><ChevronLeft size={18} strokeWidth={1.4} aria-hidden /></button>
          <button type="button" onClick={() => api?.scrollNext()} disabled={sel === images.length - 1} className="grid h-11 w-11 place-items-center bg-pearl-light/90 text-night disabled:opacity-40" aria-label="Next image"><ChevronRight size={18} strokeWidth={1.4} aria-hidden /></button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((img, i) => (
          <button key={i} type="button" onClick={() => go(i)} aria-label={`Show image ${i + 1}`} aria-current={sel === i} className={cn("border transition-colors duration-[382ms]", sel === i ? "border-gold" : "border-transparent")}>
            <ProductImage texture={img} glyph={glyph} pid={pid} alt="" label={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const p = getProduct(id);
  const viewed = useMemory((s) => s.viewed);
  const recentIds = useMemory((s) => s.recent);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelVisible, setPanelVisible] = useState(true);
  const [ci, setCi] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const inListLines = useList((s) => s.lines.filter((l) => l.productId === id));
  const openList = useUI((s) => s.setListOpen);
  useEffect(() => setCi(0), [id]);
  usePageMeta(p ? `${p.name} (${p.sku})` : "Piece not found", p?.description);
  useEffect(() => { if (p) viewed(p.id); }, [p, viewed]);

  // Sticky mobile bar appears once the add button scrolls out of view
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting || e.boundingClientRect.top > 0), { rootMargin: "0px 0px -60px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [id]);

  const fallback = products[0];
  const b = useOrderBuilder(p ?? fallback);
  const related = useMemo(() => {
    if (!p) return [];
    // Pieces that sit together in our curated assortments come first, then the same category
    const fromKits = starterKits.filter((k) => k.lines.some((l) => l.productId === p.id)).flatMap((k) => k.lines.map((l) => l.productId));
    const ids = [...new Set([...fromKits, ...products.filter((x) => x.categorySlug === p.categorySlug).map((x) => x.id)])].filter((x) => x !== p.id);
    return ids.slice(0, 4).map(getProduct).filter((x): x is NonNullable<typeof x> => !!x);
  }, [p]);
  const recent = recentIds.filter((x) => x !== id).map(getProduct).filter(Boolean).slice(0, 4);

  if (!p) return <NotFound />;
  const cat = getCategory(p.categorySlug);
  const mat = getMaterial(p.material);
  const colour = p.colours[ci] ?? p.colours[0];
  const galleryImages = [colour.image, ...p.images.filter((x) => x !== colour.image)].slice(0, 4);
  const siblings = products.filter((x) => x.categorySlug === p.categorySlug);
  const idx = siblings.findIndex((x) => x.id === p.id);
  const prev = siblings[(idx - 1 + siblings.length) % siblings.length];
  const next = siblings[(idx + 1) % siblings.length];
  const inListUnits = inListLines.reduce((a, l) => a + l.qty, 0);
  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${p.name} · Mehrusa wholesale`, url });
      else { await navigator.clipboard.writeText(url); toast("Link copied."); }
    } catch { /* closed */ }
  };
  const copySku = async () => { try { await navigator.clipboard.writeText(p.sku); toast(`${p.sku} copied.`); } catch { /* ignore */ } };
  const askChips = [
    `Is ${p.sku} ready to dispatch now?`,
    `What is the lead time for 100 of ${p.sku}?`,
    `Can ${p.sku} come in my own packaging?`,
    `Can I see a photo of ${p.sku} in hand?`,
  ];
  const sampleMsg = `Assalam o alaikum Mehrusa, I would like to request a sample pack. I am interested in ${p.name} (${p.sku}).`;

  return (
    <>
      <div className="surface-pearl">
        <div className="container-x flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-4">
          <nav aria-label="Breadcrumb" className="min-w-0 truncate text-[0.8125rem] opacity-80">
            <Link to="/shop" className="link">Shop</Link> <span aria-hidden>/</span> <Link to={`/shop/${p.categorySlug}`} className="link">{cat?.name.en}</Link> <span aria-hidden>/</span> <span aria-current="page">{p.name}</span>
          </nav>
          <div className="flex items-center text-[0.8125rem]">
            <Link to={`/product/${prev.id}`} className="inline-flex min-h-11 items-center gap-1 px-2 hover:text-gold-deep" aria-label={`Previous: ${prev.name}`}><ChevronLeft size={16} strokeWidth={1.4} aria-hidden /><span className="hidden sm:inline">Previous</span></Link>
            <span className="num px-1 opacity-60" aria-hidden>{idx + 1}/{siblings.length}</span>
            <Link to={`/product/${next.id}`} className="inline-flex min-h-11 items-center gap-1 px-2 hover:text-gold-deep" aria-label={`Next: ${next.name}`}><span className="hidden sm:inline">Next</span><ChevronRight size={16} strokeWidth={1.4} aria-hidden /></Link>
            <button type="button" onClick={share} className="ml-1 inline-flex min-h-11 items-center gap-1.5 border-l rule px-3 hover:text-gold-deep"><Share2 size={15} strokeWidth={1.4} aria-hidden /> Share</button>
          </div>
        </div>
        <div className="container-x grid gap-8 py-8 lg:grid-cols-[61.8fr_38.2fr] lg:gap-12 lg:pb-[84px]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Gallery images={galleryImages} glyph={cat?.glyph ?? "ring"} pid={p.id} name={`${p.name}, ${colour.name}`} onOpen={setLightbox} />
          </div>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">{p.badges?.map((bd) => <Badge key={bd} kind={bd} />)}{p.placeholder && <span className="border border-gold-deep px-2 py-0.5 text-[0.75rem] uppercase tracking-[0.08em] text-gold-deep">Placeholder listing</span>}</div>
              <ShortlistButton id={p.id} name={p.name} className="-mr-2 -mt-2" />
            </div>
            <h1 className="mt-3 text-h2">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[0.875rem]">
              <button type="button" onClick={copySku} className="num inline-flex min-h-9 items-center gap-1.5 opacity-80 hover:opacity-100" aria-label={`Copy SKU ${p.sku}`}>SKU {p.sku} <Copy size={13} strokeWidth={1.4} aria-hidden /></button>
              <span className="opacity-80">{mat?.name}</span>
            </div>
            <p className="mt-4 opacity-90">{p.description}</p>

            <dl className="num mt-6 grid grid-cols-2 border-l border-t rule text-[0.875rem] sm:grid-cols-4">
              {[
                ["Minimum", `${p.wholesale.minOrderQty} ${p.wholesale.unit}s`],
                ["Sold by", p.piecesPerUnit ? `${p.wholesale.unit} of ${p.piecesPerUnit}` : `the ${p.wholesale.unit}`],
                ["Availability", p.wholesale.inStock === "made-to-order" ? "Made to order" : "In stock"],
                ["Lead time", p.wholesale.leadTimeDays ? `${p.wholesale.leadTimeDays} days` : "To confirm"],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-r rule p-3">
                  <dt className="text-[0.75rem] uppercase tracking-[0.08em] text-accent">{k}</dt>
                  <dd className="mt-1 font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <nav aria-label="On this page" className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 text-[0.8125rem]">
              {[["price", "Price tiers"], ["order", "Build order"], ["margin", "Your margin"], ["details", "Details"]].map(([h, l]) => (
                <a key={h} href={`#/product/${p.id}`} onClick={(e) => { e.preventDefault(); const el = document.getElementById(h); if (el) scrollToTarget(el, { offset: -96 }); }} className="inline-flex min-h-9 shrink-0 items-center border rule px-3 hover:border-current">{l}</a>
              ))}
            </nav>

            {inListUnits > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-l-2 border-gold bg-pearl-light p-3 text-[0.9375rem]" role="status">
                <span><span className="num font-medium">{inListUnits}</span> already in your list ({inListLines.map((l) => `${l.colour}${l.option !== "One size" ? ` ${l.option}` : ""} ×${l.qty}`).join(", ")})</span>
                <button type="button" className="link text-[0.875rem]" onClick={() => openList(true)}>Edit in list</button>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {p.goodFor?.map((o) => <Link key={o} to={`/shop?for=${o}`} className="inline-flex min-h-9 items-center border rule px-3 text-[0.8125rem] hover:border-current">Good for {occasionLabel[o].toLowerCase()}</Link>)}
              {p.piecesPerUnit && <span className="inline-flex min-h-9 items-center bg-sand px-3 text-[0.8125rem]">1 {p.wholesale.unit} = {p.piecesPerUnit} pieces</span>}
              <CompareToggle id={p.id} name={p.name} className="ml-auto" />
            </div>

            <fieldset className="mt-6">
              <legend className="mb-2 text-[0.875rem]"><span className="font-medium">Colour:</span> {colour.name}</legend>
              <div className="flex gap-2">
                {p.colours.map((c, i) => (
                  <label key={c.name} className={cn("flex min-h-11 cursor-pointer items-center gap-2 border px-3 text-[0.875rem] transition-colors duration-[250ms] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus)]", ci === i ? "border-night" : "rule hover:border-current")}>
                    <input type="radio" name="colour" className="peer sr-only" checked={ci === i} onChange={() => setCi(i)} />
                    <span className="h-4 w-4 border border-night/30" style={{ background: c.hex }} aria-hidden />{c.name}
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-[0.75rem] opacity-70">Changes the pictures. Order both colours in the table below.</p>
            </fieldset>

            <div id="price" className="mt-8 scroll-mt-28">
              <div className="mb-3 flex items-center justify-between">
                <Eyebrow>Wholesale price</Eyebrow>
                {!terms.wholesaleNumbersVerified && <Confirm label="[CONFIRM] tiers" />}
              </div>
              <TierTable p={p} units={b.totalUnits} />
              {p.retailPricePKR !== undefined && <p className="mt-2 text-[0.875rem] opacity-80">Suggested retail: <ConfirmText text={fmtPKR(p.retailPricePKR)} /></p>}
            </div>

            <div id="order" className="mt-8 scroll-mt-28">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <Eyebrow>Build your order</Eyebrow>
                {p.categorySlug === "rings" || p.variantAxis?.label === "Size" ? <SizeGuide kind="ring" /> : p.variantAxis?.label === "Length" ? <SizeGuide kind="length" /> : <span className="text-[0.8125rem] opacity-75">Use + and − or type a number</span>}
              </div>
              <VariantMatrix b={b} />
              {p.colours.some((c) => c.name === "Gold-coloured") && <p className="mt-2 text-[0.8125rem] opacity-80">Gold-coloured means the colour of the finish. The piece is stainless steel, not gold. Finish process <Confirm /></p>}
              <div className="mt-5"><OrderTotals b={b} /></div>
              <div className="mt-4"><TierProgress p={p} units={b.totalUnits} /></div>
            </div>

            <div ref={panelRef} className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button onClick={() => b.addAll()}>{t.addToList}{b.totalUnits > 0 && <span className="num opacity-80">· {fmtNum(b.totalUnits)}</span>}</Button>
              <ButtonA variant="secondary" href={waLink(productAskText(p))} target="_blank" rel="noopener noreferrer">{t.askWhatsapp}</ButtonA>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-[0.8125rem] opacity-80">Quick questions, sent on WhatsApp:</p>
              <ul className="flex flex-wrap gap-2">
                {askChips.map((q) => (
                  <li key={q}><a href={waLink(`Assalam o alaikum Mehrusa, ${q.charAt(0).toLowerCase()}${q.slice(1)}`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center border rule bg-pearl-light px-3 text-[0.8125rem] hover:border-current">{q.replace(` ${p.sku}`, " this").replace(`of ${p.sku}`, "of this")}</a></li>
                ))}
              </ul>
            </div>
            <a href={waLink(sampleMsg)} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-flex min-h-11 items-center text-[0.9375rem]">Request a sample pack <span className="ml-2 opacity-80">(<ConfirmText text={terms.samplePackPrice} />)</span></a>

            <div id="margin" className="mt-6 scroll-mt-28"><MarginPlanner p={p} unitPrice={b.unit} units={b.totalUnits} /></div>

            <ul className="mt-6 grid gap-3 text-[0.875rem] sm:grid-cols-3" aria-label="Low-risk ways to start">
              <li className="border-l-2 border-gold pl-3"><span className="block font-medium">Mix to reach the minimum</span><span className="opacity-80">Across colours and sizes</span></li>
              <li className="border-l-2 border-gold pl-3"><span className="block font-medium">No payment here</span><span className="opacity-80">We confirm on WhatsApp first</span></li>
              <li className="border-l-2 border-gold pl-3"><span className="block font-medium">Samples first</span><span className="opacity-80">Ask for a sample pack</span></li>
            </ul>

            <div id="details" className="mt-8 scroll-mt-28">
              <Accordion defaultOpen={["details"]} items={[
                { id: "details", title: "Details", body: <dl className="num grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">{Object.entries(p.specs).map(([k, v]) => (<Fragment key={k}><dt className="opacity-80">{k}</dt><dd><ConfirmText text={v} /></dd></Fragment>))}</dl> },
                { id: "materials", title: "Materials and care", body: (
                  <div className="space-y-3">
                    <p>{mat?.summary}</p>
                    {site.showConfirm && <ul className="space-y-1 text-[0.9375rem]">{mat?.facts.filter((f) => !f.verified).map((f) => <li key={f.label}>{f.label}: <ConfirmText text={f.value} /></li>)}</ul>}
                    <ul className="list-disc space-y-1 pl-5">{mat?.care.filter((c) => c.verified || site.showConfirm).map((c) => <li key={c.text}><ConfirmText text={c.text} /></li>)}</ul>
                  </div>
                ) },
                { id: "dispatch", title: "Dispatch and lead time", body: (
                  <ul className="space-y-1">
                    <li>Availability: {p.wholesale.inStock === "made-to-order" ? "Made to order" : p.wholesale.inStock ? "In stock" : "Currently unavailable"}</li>
                    <li>Lead time: <Val v={p.wholesale.leadTimeDays ? `${p.wholesale.leadTimeDays} days` : p.wholesale.inStock === "made-to-order" ? terms.madeToOrderLeadTime : terms.leadTime} /></li>
                    <li>Shipping in Pakistan: <Val v={terms.shipping} /></li>
                  </ul>
                ) },
                { id: "packaging", title: "Packaging", body: <p>Each piece is sent in a pouch inside the midnight box, wrapped in pearl tissue with a thank-you card. <Link to="/packaging" className="link">See the packaging</Link>. Exact box and pouch counts per order <Confirm />.</p> },
              ]} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="surface-light section border-t rule" aria-labelledby="related">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="related" className="text-h3">Pairs well with</h2>
                <p className="mt-1 text-[0.875rem] opacity-75">Chosen from our suggested assortments, so they sit well together on a shelf.</p>
              </div>
              <Link to={`/shop/${p.categorySlug}`} className="link">All {cat?.name.en.toLowerCase()}</Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
              {related.map((r) => <li key={r.id}><ProductCard p={r} /></li>)}
            </ul>
          </div>
        </section>
      )}
      {recent.length > 0 && (
        <section className="surface-pearl section border-t rule" aria-labelledby="recent">
          <div className="container-x">
            <h2 id="recent" className="text-h3">Recently viewed</h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
              {recent.map((r) => r && <li key={r.id}><ProductCard p={r} /></li>)}
            </ul>
          </div>
        </section>
      )}

      <Lightbox open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)} images={galleryImages} start={lightbox ?? 0} glyph={cat?.glyph ?? "ring"} pid={p.id} name={`${p.name}, ${colour.name}`} />

      {/* Sticky mobile order bar */}
      <AnimatePresence>
        {!panelVisible && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16 }}
            transition={{ duration: 0.382, ease: EASE }}
            className="surface-light fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-40 border-t hairline-gold lg:hidden"
          >
            <div className="container-x flex items-center gap-3 py-2.5">
              <div className="num min-w-0 flex-1 text-[0.875rem]">
                <p className="truncate font-medium">{p.name}</p>
                <p className="opacity-80">{b.totalUnits ? `${fmtNum(b.totalUnits)} units` : `MOQ ${p.wholesale.minOrderQty}`} · <ConfirmText text={b.totalUnits ? fmtPKR(b.total) : fmtPKR(p.wholesale.tiers[0]?.pricePKR)} /></p>
              </div>
              {b.totalUnits > 0 ? (
                <Button size="sm" onClick={() => b.addAll()}>{t.addToList}</Button>
              ) : (
                <Button size="sm" onClick={() => panelRef.current && scrollToTarget(panelRef.current, { offset: -window.innerHeight / 3 })}>Choose quantities</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
