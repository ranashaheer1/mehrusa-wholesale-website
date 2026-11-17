import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { getProduct, products } from "@/data/products";
import { getCategory } from "@/data/categories";
import { getMaterial } from "@/data/materials";
import { t } from "@/i18n/strings";
import { fmtNum } from "@/lib/pricing";
import { useUI } from "@/store/list";
import { OrderTotals, TierProgress, TierTable, VariantMatrix, useOrderBuilder } from "../product/OrderBuilder";
import { Button } from "../ui/Button";
import { Badge } from "../ui/bits";
import { ProductImage } from "./ProductImage";
import { ShortlistButton } from "./ProductCard";

/** Build a full variant order without leaving the grid. */
export function QuickView() {
  const id = useUI((s) => s.quickView);
  const setId = useUI((s) => s.setQuickView);
  const p = getProduct(id ?? undefined) ?? products[0];
  const b = useOrderBuilder(p);
  const cat = getCategory(p.categorySlug);
  const close = () => setId(null);

  return (
    <RDialog.Root open={!!id} onOpenChange={(o) => !o && close()}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[80] bg-night-deep/65 data-[state=open]:animate-[fadeIn_382ms_var(--ease)]" />
        <RDialog.Content
          className="surface-light fixed inset-x-0 bottom-0 top-[6dvh] z-[81] flex flex-col border-t hairline-gold outline-none data-[state=open]:animate-[settle_618ms_var(--ease)] md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[90dvh] md:w-[min(1040px,calc(100%-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:border"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b rule px-5 py-2 md:hidden">
            <span className="eyebrow">Quick order</span>
            <RDialog.Close className="grid h-11 w-11 place-items-center" aria-label="Close"><X size={20} strokeWidth={1.4} aria-hidden /></RDialog.Close>
          </div>
          <div className="grid flex-1 overflow-y-auto md:grid-cols-[38.2fr_61.8fr]">
            <div className="hidden bg-sand md:block">
              <ProductImage texture={p.images[0]} glyph={cat?.glyph ?? "ring"} pid={p.id} alt={`${p.name}, placeholder image`} className="h-full" />
            </div>
            <div className="p-5 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap gap-1.5">{p.badges?.map((bd) => <Badge key={bd} kind={bd} />)}</div>
                  <RDialog.Title className="font-display text-h3">{p.name}</RDialog.Title>
                  <p className="num mt-1 text-[0.875rem] opacity-80">SKU {p.sku} · {getMaterial(p.material)?.name} · {p.wholesale.inStock === "made-to-order" ? "Made to order" : "In stock"}</p>
                </div>
                <div className="flex">
                  <ShortlistButton id={p.id} name={p.name} />
                  <RDialog.Close className="hidden h-11 w-11 place-items-center md:grid" aria-label="Close"><X size={20} strokeWidth={1.4} aria-hidden /></RDialog.Close>
                </div>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_200px]">
                <div>
                  <VariantMatrix b={b} />
                </div>
                <div className="hidden lg:block"><TierTable p={p} units={b.totalUnits} /></div>
              </div>
              <div className="mt-5"><OrderTotals b={b} /></div>
              <div className="mt-3"><TierProgress p={p} units={b.totalUnits} compact /></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t rule px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-8">
            <Link to={`/product/${p.id}`} onClick={close} className="link min-h-11 content-center text-[0.9375rem]">Full details</Link>
            <Button onClick={() => b.addAll(close)} disabled={b.totalUnits === 0}>{t.addToList}{b.totalUnits > 0 && <span className="num">· {fmtNum(b.totalUnits)}</span>}</Button>
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
