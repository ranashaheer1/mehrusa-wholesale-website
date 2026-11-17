import { useState } from "react";
import { Link } from "react-router-dom";
import * as RDialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { Columns3, X } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/data/products";
import { getCategory } from "@/data/categories";
import { getMaterial } from "@/data/materials";
import { occasionLabel } from "@/data/buyers";
import type { Product } from "@/data/types";
import { fmtPKR, orderAxis } from "@/lib/pricing";
import { COMPARE_MAX, usePrefs } from "@/store/prefs";
import { useUI } from "@/store/list";
import { ProductImage } from "../catalogue/ProductImage";
import { Button } from "../ui/Button";
import { ConfirmText, EASE } from "../ui/bits";
import { cn } from "@/utils/cn";

export function CompareToggle({ id, name, className }: { id: string; name: string; className?: string }) {
  const on = usePrefs((s) => s.compare.includes(id));
  const toggle = usePrefs((s) => s.toggleCompare);
  return (
    <label className={cn("inline-flex min-h-11 cursor-pointer items-center gap-2 text-[0.8125rem]", className)}>
      <input
        type="checkbox"
        checked={on}
        onChange={() => {
          const r = toggle(id);
          if (r === "full") toast(`You can compare up to ${COMPARE_MAX} pieces. Remove one first.`);
        }}
        className="h-4 w-4 accent-[#0F1938]"
        aria-label={`Compare ${name}`}
      />
      Compare
    </label>
  );
}

const rows: { label: string; get: (p: Product) => React.ReactNode }[] = [
  { label: "SKU", get: (p) => p.sku },
  { label: "Category", get: (p) => getCategory(p.categorySlug)?.name.en },
  { label: "Material", get: (p) => getMaterial(p.material)?.name },
  { label: "Colours", get: (p) => p.colours.map((c) => c.name).join(", ") },
  { label: "Sizes or lengths", get: (p) => orderAxis(p).options.join(", ") },
  { label: "Sold by", get: (p) => (p.piecesPerUnit ? `${p.wholesale.unit} of ${p.piecesPerUnit}` : p.wholesale.unit) },
  { label: "Minimum", get: (p) => `${p.wholesale.minOrderQty} ${p.wholesale.unit}s` },
  { label: "Unit price", get: (p) => <ConfirmText text={p.wholesale.tiers.map((t) => `${t.minQty}+: ${fmtPKR(t.pricePKR)}`).join(" · ")} /> },
  { label: "Availability", get: (p) => (p.wholesale.inStock === "made-to-order" ? "Made to order" : "In stock") },
  { label: "Good for", get: (p) => p.goodFor?.map((o) => occasionLabel[o]).join(", ") ?? "–" },
];

export function CompareTray() {
  const ids = usePrefs((s) => s.compare);
  const toggle = usePrefs((s) => s.toggleCompare);
  const clear = usePrefs((s) => s.clearCompare);
  const openQV = useUI((s) => s.setQuickView);
  const [open, setOpen] = useState(false);
  const items = ids.map(getProduct).filter((p): p is Product => !!p);

  return (
    <>
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.382, ease: EASE }} className="surface-night fixed bottom-[calc(66px+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 border hairline-gold lg:bottom-24" role="region" aria-label="Compare tray">
            <div className="flex items-center gap-3 p-2 pl-3">
              <Columns3 size={18} strokeWidth={1.3} className="shrink-0 text-gold" aria-hidden />
              <ul className="flex min-w-0 flex-1 gap-2">
                {items.map((p) => (
                  <li key={p.id} className="relative w-10 shrink-0">
                    <ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt={p.name} label={false} />
                    <button type="button" onClick={() => toggle(p.id)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center bg-pearl text-night" aria-label={`Remove ${p.name} from compare`}><X size={12} aria-hidden /></button>
                  </li>
                ))}
                {Array.from({ length: COMPARE_MAX - items.length }).map((_, i) => <li key={i} className="aspect-[4/5] w-10 border border-dashed border-pearl/30" aria-hidden />)}
              </ul>
              <Button size="sm" onClick={() => setOpen(true)} disabled={items.length < 2}>{items.length < 2 ? "Pick one more" : `Compare ${items.length}`}</Button>
              <button type="button" onClick={clear} className="grid h-11 w-11 shrink-0 place-items-center opacity-75 hover:opacity-100" aria-label="Clear compare"><X size={18} strokeWidth={1.4} aria-hidden /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RDialog.Root open={open} onOpenChange={setOpen}>
        <RDialog.Portal>
          <RDialog.Overlay className="fixed inset-0 z-[80] bg-night-deep/65" />
          <RDialog.Content className="surface-light fixed inset-x-0 bottom-0 top-[5dvh] z-[81] flex flex-col border-t hairline-gold outline-none data-[state=open]:animate-[settle_618ms_var(--ease)] md:inset-x-6 md:top-[6dvh] md:bottom-6 md:mx-auto md:max-w-5xl md:border" aria-describedby={undefined}>
            <div className="flex items-center justify-between border-b rule px-5 py-2">
              <RDialog.Title className="font-display text-h4">Compare pieces</RDialog.Title>
              <RDialog.Close className="grid h-11 w-11 place-items-center" aria-label="Close"><X size={20} strokeWidth={1.4} aria-hidden /></RDialog.Close>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <table className="w-full min-w-[560px] table-fixed border-collapse text-left">
                <caption className="sr-only">Side by side comparison</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-36"><span className="sr-only">Detail</span></th>
                    {items.map((p) => (
                      <th key={p.id} scope="col" className="px-3 pb-4 align-top font-normal">
                        <ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt="" label={false} className="max-w-[160px]" />
                        <Link to={`/product/${p.id}`} onClick={() => setOpen(false)} className="mt-2 block font-medium hover:underline">{p.name}</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const vals = items.map((p) => String(typeof r.get(p) === "string" ? r.get(p) : ""));
                    const differs = new Set(vals).size > 1;
                    return (
                      <tr key={r.label} className="border-t rule">
                        <th scope="row" className="py-3 pr-3 align-top text-[0.875rem] font-medium">{r.label}{differs && <span className="ml-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold-deep align-middle" title="Differs" aria-label="differs" />}</th>
                        {items.map((p) => <td key={p.id} className="num px-3 py-3 align-top text-[0.9375rem]">{r.get(p)}</td>)}
                      </tr>
                    );
                  })}
                  <tr className="border-t rule">
                    <th scope="row" />
                    {items.map((p) => <td key={p.id} className="px-3 py-4"><Button size="sm" variant="secondary" className="w-full" onClick={() => { setOpen(false); openQV(p.id); }}>Quick order</Button></td>)}
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-[0.8125rem] opacity-75"><span className="mr-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold-deep align-middle" aria-hidden />marks rows where the pieces differ.</p>
            </div>
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
    </>
  );
}
