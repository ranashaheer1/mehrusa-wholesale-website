import { flyToList } from "@/components/ui/FlyLayer";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { getCategory } from "@/data/categories";
import { getMaterial } from "@/data/materials";
import type { Product } from "@/data/types";
import { terms } from "@/config/terms";
import { fmtPKR, fromPriceLine, orderAxis } from "@/lib/pricing";
import { useList, useUI } from "@/store/list";
import { useMemory } from "@/store/memory";
import { Button } from "../ui/Button";
import { Badge, Confirm, ConfirmText } from "../ui/bits";
import { ProductImage } from "./ProductImage";
import { CompareToggle } from "../compare/Compare";
import { t } from "@/i18n/strings";
import { cn } from "@/utils/cn";

export function ShortlistButton({ id, name, className, onImage }: { id: string; name: string; className?: string; onImage?: boolean }) {
  const on = useMemory((s) => s.shortlist.includes(id));
  const toggle = useMemory((s) => s.toggleShort);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
      onClick={(e) => { e.preventDefault(); toggle(id); toast(on ? "Removed from your shortlist." : "Saved to your shortlist."); }}
      className={cn("grid h-11 w-11 place-items-center transition-colors duration-[382ms]", onImage && "bg-pearl-light/85 text-night hover:bg-pearl-light", className)}
    >
      <Heart size={18} strokeWidth={1.4} aria-hidden className={cn("transition-colors duration-[382ms]", on && "fill-laal stroke-laal")} />
    </button>
  );
}

/** Pearl-style card used on the catalogue. */
export function ProductCard({ p, size = "md", selectable, selected, onSelect }: { p: Product; size?: "md" | "lg"; selectable?: boolean; selected?: boolean; onSelect?: () => void }) {
  const openQV = useUI((s) => s.setQuickView);
  const openList = useUI((s) => s.setListOpen);
  const inList = useList((s) => s.lines.filter((l) => l.productId === p.id).reduce((a, l) => a + l.qty, 0));
  const [colour, setColour] = useState(0);
  const swipe = useRef<HTMLDivElement>(null);
  const add = useList((s) => s.add);
  const pickColour = (i: number) => {
    setColour(i);
    const el = swipe.current;
    if (el && el.offsetParent !== null) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };
  const quickAdd = () => {
    const axis = orderAxis(p).options;
    const option = axis[Math.floor((axis.length - 1) / 2)];
    add({ productId: p.id, colour: p.colours[colour].name, option, qty: p.wholesale.minOrderQty });
    flyToList();
    toast(t.added, { description: `${p.name}, ${p.wholesale.minOrderQty} × ${p.colours[colour].name}${option !== "One size" ? ` / ${option}` : ""}`, action: { label: "View list", onClick: () => openList(true) } });
  };
  const cat = getCategory(p.categorySlug);
  const mat = getMaterial(p.material);
  const glyph = cat?.glyph ?? "ring";
  const main = p.colours[colour]?.image ?? p.images[0];
  const hover = colour === 0 ? p.images[1] : p.images[0];
  const tiers = p.wholesale.tiers.map((t) => `${t.minQty}+`).join(" · ");

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
        {/* Phones and tablets: swipe between colours */}
        <div
          ref={swipe}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:hidden"
          onScroll={(e) => { const el = e.currentTarget; const i = Math.round(el.scrollLeft / el.clientWidth); if (i !== colour && p.colours[i]) setColour(i); }}
        >
          {p.colours.map((c) => (
            <Link key={c.name} to={`/product/${p.id}`} className="block w-full shrink-0 snap-start" aria-label={`${p.name} in ${c.name.toLowerCase()}, view details`}>
              <ProductImage texture={c.image} glyph={glyph} pid={p.id} alt={`${p.name} in ${c.name.toLowerCase()}`} label={false} />
            </Link>
          ))}
        </div>
        {p.colours.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5 lg:hidden" aria-hidden>
            {p.colours.map((c, i) => <span key={c.name} className={cn("h-1.5 transition-all duration-[382ms]", i === colour ? "w-4 bg-pearl" : "w-1.5 bg-pearl/50")} />)}
          </div>
        )}
        {/* Desktop: hover shows a second image */}
        <Link to={`/product/${p.id}`} className="hidden lg:block" aria-label={`${p.name}, view details`}>
          <ProductImage key={main} texture={main} glyph={glyph} pid={p.id} alt={`${p.name} in ${p.colours[colour]?.name.toLowerCase()}, drawing on ${main.replace(/-/g, " ")}`} className="animate-[fadeIn_382ms_var(--ease)]" />
          <ProductImage texture={hover} glyph={glyph} pid={p.id} alt="" label={false} className="absolute inset-0 hidden opacity-0 transition-opacity duration-[618ms] ease-[var(--ease)] group-hover:opacity-100 lg:block" />
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">{!selectable && p.badges?.map((b) => <Badge key={b} kind={b} />)}</div>
        {selectable && (
          <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`${selected ? "Unselect" : "Select"} ${p.name}`} className={cn("absolute inset-0 z-[3] flex items-start justify-start p-2 transition-colors duration-[250ms]", selected ? "bg-night/25 outline outline-2 -outline-offset-2 outline-gold-deep" : "bg-transparent hover:bg-night/10")}>
            <span className={cn("grid h-7 w-7 place-items-center border-2", selected ? "border-gold-deep bg-night" : "border-pearl bg-pearl-light/90")} aria-hidden>
              {selected && <span className="h-2.5 w-2.5 rotate-45 bg-gold" />}
            </span>
          </button>
        )}
        <ShortlistButton id={p.id} name={p.name} onImage className="absolute right-2 top-2" />
        {inList > 0 && (
          <span className="num pointer-events-none absolute bottom-6 right-2 z-[1] bg-night lg:bottom-2 px-2 py-0.5 text-[0.75rem] text-pearl lg:group-hover:opacity-0">
            <span className="mr-1 inline-block h-1.5 w-1.5 rotate-45 bg-gold align-middle" aria-hidden />In your list · {inList}
          </span>
        )}
        <button
          type="button"
          onClick={() => openQV(p.id)}
          className="absolute inset-x-2 bottom-2 z-[2] hidden min-h-11 items-center justify-center bg-night/90 text-[0.875rem] font-medium tracking-[0.04em] text-pearl opacity-0 transition-opacity duration-[382ms] focus-visible:opacity-100 group-hover:opacity-100 lg:flex"
        >
          Quick view
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("font-sans font-medium leading-snug", size === "lg" ? "text-[1.125rem]" : "text-[1rem]")}>
            <Link to={`/product/${p.id}`} className="hover:underline hover:decoration-gold hover:underline-offset-4">{p.name}</Link>
          </h3>
          <span className="num shrink-0 pt-0.5 text-[0.75rem] opacity-70">{p.sku}</span>
        </div>
        <p className="text-[0.875rem] opacity-80">{mat?.name}{p.placeholder && <span className="ml-2 text-[0.75rem] uppercase tracking-[0.08em] text-accent">{t.placeholder}</span>}</p>
        <p className="num text-[0.9375rem]"><ConfirmText text={fromPriceLine(p)} /></p>
        {size === "lg" && <p className="num text-[0.8125rem] opacity-75">Price tiers {tiers}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="num border rule px-2 py-0.5 text-[0.75rem]">MOQ {p.wholesale.minOrderQty}</span>
          {!terms.wholesaleNumbersVerified && <Confirm />}
          {p.wholesale.inStock === "made-to-order" && <span className="text-[0.75rem] opacity-80">Made to order</span>}
        </div>
        <div className="mt-1 flex items-center gap-1" role="radiogroup" aria-label={`Colour for ${p.name}`}>
          {p.colours.map((c, i) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={colour === i}
              aria-label={c.name}
              title={c.name}
              onClick={() => pickColour(i)}
              onMouseEnter={() => setColour(i)}
              onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); pickColour((colour + (e.key === "ArrowRight" ? 1 : -1) + p.colours.length) % p.colours.length); } }}
              tabIndex={colour === i ? 0 : -1}
              className="grid h-9 w-9 place-items-center"
            >
              <span className={cn("h-4 w-4 border transition-[outline-color] duration-[250ms]", colour === i ? "border-night outline outline-1 outline-offset-2 outline-gold-deep" : "border-night/30")} style={{ background: c.hex }} />
            </button>
          ))}
          <span className="ml-1 truncate text-[0.8125rem] opacity-75">{p.colours[colour]?.name}</span>
        </div>
        {p.piecesPerUnit && <p className="text-[0.8125rem] opacity-80">Sold as a {p.wholesale.unit} of {p.piecesPerUnit}</p>}
        <CompareToggle id={p.id} name={p.name} className="-mb-1 hidden lg:inline-flex" />
        <div className="mt-auto flex gap-2 pt-3">
          <Button variant="secondary" size="sm" className="min-w-0 flex-1" onClick={() => openQV(p.id)} aria-label={`Quick order ${p.name}`}>
            {inList > 0 ? "Order more" : "Quick order"}
          </Button>
          <button type="button" onClick={quickAdd} title={`Add ${p.wholesale.minOrderQty} in ${p.colours[colour].name}`} aria-label={`Add the minimum of ${p.wholesale.minOrderQty} ${p.name} in ${p.colours[colour].name} to your list`} className="num inline-flex min-h-11 shrink-0 items-center gap-1 border border-night bg-night px-2.5 text-[0.8125rem] text-pearl transition-colors duration-[250ms] hover:bg-night-light">
            <Plus size={14} strokeWidth={1.6} aria-hidden />{p.wholesale.minOrderQty}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Dense line-sheet row for scanning many SKUs. */
export function ProductRow({ p }: { p: Product }) {
  const openQV = useUI((s) => s.setQuickView);
  const add = useList((s) => s.add);
  const cat = getCategory(p.categorySlug);
  const axis = p.variantAxis?.options ?? p.sizeRun ?? ["One size"];
  return (
    <tr className="border-b rule align-middle hover:bg-pearl-light">
      <td className="w-16 py-2 pr-3">
        <Link to={`/product/${p.id}`} aria-hidden tabIndex={-1}><ProductImage texture={p.images[0]} glyph={cat?.glyph ?? "ring"} pid={p.id} alt="" label={false} /></Link>
      </td>
      <td className="py-2 pr-3">
        <Link to={`/product/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
        <p className="num text-[0.8125rem] opacity-75">{p.sku} · {cat?.name.en}{p.badges?.length ? ` · ${p.badges.map((b) => (b === "new" ? "New" : b === "eid-edit" ? "Eid edit" : "Limited batch")).join(", ")}` : ""}</p>
      </td>
      <td className="num hidden py-2 pr-3 md:table-cell">{p.colours.length} × {axis.length}</td>
      <td className="num py-2 pr-3">{p.wholesale.minOrderQty}</td>
      <td className="num hidden py-2 pr-3 sm:table-cell"><ConfirmText text={fmtPKR(p.wholesale.tiers[0]?.pricePKR)} /></td>
      <td className="hidden py-2 pr-3 text-[0.875rem] lg:table-cell">{p.wholesale.inStock === "made-to-order" ? "Made to order" : "In stock"}</td>
      <td className="py-2 text-right">
        <div className="flex justify-end gap-1">
          <button type="button" onClick={() => { add({ productId: p.id, colour: p.colours[0].name, option: axis[0], qty: p.wholesale.minOrderQty }); flyToList(); toast(t.added, { description: `${p.name}, ${p.wholesale.minOrderQty} × ${p.colours[0].name}${axis[0] !== "One size" ? ` / ${axis[0]}` : ""}` }); }} className="hidden min-h-11 border rule px-3 text-[0.8125rem] hover:border-night sm:inline-flex sm:items-center" aria-label={`Add minimum of ${p.name} to list`}>+ MOQ</button>
          <button type="button" onClick={() => openQV(p.id)} className="inline-flex min-h-11 items-center bg-night px-3 text-[0.8125rem] text-pearl hover:bg-night-light" aria-label={`Quick order ${p.name}`}>Order</button>
        </div>
      </td>
    </tr>
  );
}
