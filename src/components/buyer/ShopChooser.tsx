import { flyToList } from "@/components/ui/FlyLayer";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Gift, ShoppingBag, Store, Tent } from "lucide-react";
import { buyerTypes, starterKits, type BuyerType, type StarterKit } from "@/data/buyers";
import { getProduct } from "@/data/products";
import { getCategory } from "@/data/categories";
import { fmtNum } from "@/lib/pricing";
import { useList, useUI } from "@/store/list";
import { usePrefs } from "@/store/prefs";
import { ProductImage } from "../catalogue/ProductImage";
import { Button, ButtonLink } from "../ui/Button";
import { cn } from "@/utils/cn";

const icons: Record<BuyerType, typeof Store> = { boutique: Store, online: ShoppingBag, gifting: Gift, market: Tent };

/** Non-blocking: a choice in the page, never a pop-up. Skippable and changeable at any time. */
export function ShopChooser({ compact }: { compact?: boolean }) {
  const buyer = usePrefs((s) => s.buyer);
  const setBuyer = usePrefs((s) => s.setBuyer);
  return (
    <fieldset>
      <legend className={cn("mb-4", compact ? "eyebrow" : "font-display text-h3")}>{compact ? "Your shop" : "What kind of shop are you buying for?"}</legend>
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {buyerTypes.map((b) => {
          const Icon = icons[b.id];
          const on = buyer === b.id;
          return (
            <label key={b.id} className={cn("group relative flex cursor-pointer flex-col gap-2 border p-4 transition-colors duration-[382ms]", on ? "border-gold-deep bg-pearl-light" : "rule hover:border-current")}>
              <input type="radio" name={compact ? "buyer-c" : "buyer"} value={b.id} checked={on} onChange={() => setBuyer(b.id)} className="peer sr-only" />
              <span className="pointer-events-none absolute inset-0 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]" aria-hidden />
              <span className="flex items-center justify-between">
                <Icon size={22} strokeWidth={1.25} className="text-accent" aria-hidden />
                <span className={cn("h-3 w-3 rotate-45 border transition-colors duration-[382ms]", on ? "border-gold-deep bg-gold-deep" : "border-current/40")} aria-hidden />
              </span>
              <span className="font-medium">{compact ? b.short : b.label}</span>
              {!compact && <span className="text-[0.875rem] opacity-80">{b.need}</span>}
            </label>
          );
        })}
      </div>
      {buyer && !compact && <button type="button" className="link mt-3 min-h-11 text-[0.875rem]" onClick={() => setBuyer(null)}>Clear my choice</button>}
    </fieldset>
  );
}

export function kitUnits(k: StarterKit) {
  return k.lines.reduce((a, l) => a + l.qty, 0);
}

export function StarterKitCard({ kit, tone = "light" }: { kit: StarterKit; tone?: "light" | "night" }) {
  const addMany = useList((s) => s.addMany);
  const openList = useUI((s) => s.setListOpen);
  const ids = [...new Set(kit.lines.map((l) => l.productId))];
  const pieces = ids.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <article className={cn("flex flex-col border p-5 lg:p-6", tone === "night" ? "surface-night rule" : "surface-light hairline-gold")}>
      <p className="eyebrow">Suggested opening order</p>
      <h3 className="mt-2 font-display text-h3">{kit.title}</h3>
      <p className="mt-2 opacity-90">{kit.why}</p>
      <ul className="mt-5 grid grid-cols-4 gap-2" aria-label="Pieces in this assortment">
        {pieces.slice(0, 4).map((p) => (
          <li key={p.id} title={p.name}>
            <Link to={`/product/${p.id}`} aria-label={p.name}><ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt="" label={false} /></Link>
          </li>
        ))}
      </ul>
      <ul className="mt-4 space-y-1 text-[0.875rem] opacity-90">
        {pieces.map((p) => {
          const u = kit.lines.filter((l) => l.productId === p.id).reduce((a, l) => a + l.qty, 0);
          return <li key={p.id} className="num flex justify-between gap-3"><span className="truncate">{p.name}</span><span>{u}</span></li>;
        })}
      </ul>
      <p className="num mt-3 border-t rule pt-3 text-[0.9375rem]"><span className="font-medium">{pieces.length} pieces · {fmtNum(kitUnits(kit))} units</span> <span className="opacity-75">· meets each minimum</span></p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Button size="sm" onClick={() => { addMany(kit.lines); flyToList(); toast(`"${kit.title}" added to your list.`, { action: { label: "View list", onClick: () => openList(true) } }); }}>Add all</Button>
        <ButtonLink size="sm" variant="secondary" to={`/quick-order?kit=${kit.id}`}>Adjust first</ButtonLink>
      </div>
    </article>
  );
}

export function kitsFor(b: BuyerType | null) {
  return b ? starterKits.filter((k) => k.buyer === b) : starterKits;
}
