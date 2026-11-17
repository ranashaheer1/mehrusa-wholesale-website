import { useId, useState } from "react";
import { Calculator } from "lucide-react";
import type { Product } from "@/data/types";
import { fmtNum } from "@/lib/pricing";
import { cn } from "@/utils/cn";

/**
 * Helps a retailer see her own margin. Uses the confirmed wholesale price when there is one;
 * until then she can type the price we quote her. Nothing is sent or stored.
 */
export function MarginPlanner({ p, unitPrice, units }: { p: Product; unitPrice: number | null; units: number }) {
  const id = useId();
  const [cost, setCost] = useState<string>("");
  const [retail, setRetail] = useState<string>(p.retailPricePKR ? String(p.retailPricePKR) : "");
  const c = unitPrice ?? (cost ? Number(cost) : null);
  const r = retail ? Number(retail) : null;
  const ok = c !== null && r !== null && c > 0 && r > 0;
  const profit = ok ? r! - c! : 0;
  const margin = ok ? (profit / r!) * 100 : 0;
  const markup = ok ? r! / c! : 0;
  const qty = Math.max(units, p.wholesale.minOrderQty);

  return (
    <section aria-labelledby={`${id}-t`} className="border rule p-4 lg:p-5">
      <div className="flex items-center gap-2">
        <Calculator size={18} strokeWidth={1.3} className="text-accent" aria-hidden />
        <h2 id={`${id}-t`} className="font-sans text-[1rem] font-medium">Plan your margin</h2>
      </div>
      <p className="mt-1 text-[0.875rem] opacity-80">See what you keep at your own selling price. Many shops sell at around twice the wholesale price.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[0.8125rem] font-medium">Your cost per {p.wholesale.unit}</span>
          {unitPrice !== null ? (
            <span className="field num flex items-center bg-transparent">PKR {fmtNum(unitPrice)}</span>
          ) : (
            <input className="field num" inputMode="numeric" placeholder="Price we quote" value={cost} onChange={(e) => setCost(e.target.value.replace(/\D/g, ""))} aria-describedby={`${id}-cost`} />
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-[0.8125rem] font-medium">Your selling price</span>
          <input className="field num" inputMode="numeric" placeholder="PKR" value={retail} onChange={(e) => setRetail(e.target.value.replace(/\D/g, ""))} />
        </label>
      </div>
      {unitPrice === null && <p id={`${id}-cost`} className="mt-2 text-[0.8125rem] opacity-75">Wholesale prices are being confirmed. Type the price we quote you on WhatsApp.</p>}
      {c !== null && c > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Quick selling prices">
          {[2, 2.5, 3].map((m) => (
            <button key={m} type="button" onClick={() => setRetail(String(Math.round((c * m) / 10) * 10))} className={cn("num min-h-11 border px-3 text-[0.8125rem]", Math.abs(markup - m) < 0.05 ? "border-night bg-night text-pearl" : "rule hover:border-current")}>
              ×{m} · PKR {fmtNum(Math.round((c * m) / 10) * 10)}
            </button>
          ))}
        </div>
      )}
      <dl className="num mt-4 grid grid-cols-3 gap-3 border-t rule pt-4 text-center" aria-live="polite">
        <div><dt className="text-[0.75rem] opacity-75">Margin</dt><dd className="text-h4">{ok ? `${Math.round(margin)}%` : "–"}</dd></div>
        <div><dt className="text-[0.75rem] opacity-75">Profit each</dt><dd className="text-h4">{ok ? fmtNum(profit) : "–"}</dd></div>
        <div><dt className="text-[0.75rem] opacity-75">On {fmtNum(qty)} sold</dt><dd className="text-h4">{ok ? fmtNum(profit * qty) : "–"}</dd></div>
      </dl>
      {ok && profit < 0 && <p className="mt-2 text-[0.875rem] text-laal-deep">At this price you would sell below cost.</p>}
      <p className="mt-3 text-[0.75rem] opacity-70">An estimate in PKR, before your own costs such as delivery and packaging. Not stored or sent.</p>
    </section>
  );
}
