import { flyToList } from "@/components/ui/FlyLayer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/data/types";
import { terms } from "@/config/terms";
import { t } from "@/i18n/strings";
import { activeTierIndex, fmtNum, fmtPKR, lineTotal, orderAxis, unitPriceFor } from "@/lib/pricing";
import { useList, useUI } from "@/store/list";
import { Confirm, ConfirmText, Stepper } from "../ui/bits";
import { cn } from "@/utils/cn";

const cellKey = (c: string, o: string) => `${c}|${o}`;

export type Builder = ReturnType<typeof useOrderBuilder>;

export function useOrderBuilder(p: Product) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const add = useList((s) => s.addMany);
  const openList = useUI((s) => s.setListOpen);
  useEffect(() => setQty({}), [p.id]);
  const axis = orderAxis(p);
  const totalUnits = Object.values(qty).reduce((a, b) => a + b, 0);
  const tierIdx = activeTierIndex(p, totalUnits);
  const unit = unitPriceFor(p, totalUnits);
  const total = lineTotal(unit, totalUnits);
  const moq = p.wholesale.minOrderQty;
  const short = totalUnits > 0 && totalUnits < moq;
  const cells = useMemo(() => p.colours.flatMap((c) => axis.options.map((o) => cellKey(c.name, o))), [p, axis.options]);

  const setCell = useCallback((c: string, o: string, n: number) => setQty((q) => ({ ...q, [cellKey(c, o)]: n })), []);
  const fillAll = (n: number) => setQty(Object.fromEntries(cells.map((k) => [k, n])));
  /** Spread the minimum as evenly as possible across every cell. */
  const spreadMoq = () => {
    const base = Math.floor(moq / cells.length);
    let rest = moq - base * cells.length;
    setQty(Object.fromEntries(cells.map((k) => [k, base + (rest-- > 0 ? 1 : 0)])));
  };
  const reset = () => setQty({});

  const addAll = (after?: () => void) => {
    if (totalUnits === 0) {
      toast("Choose a quantity in the table first.");
      return false;
    }
    add(Object.entries(qty).filter(([, n]) => n > 0).map(([k, n]) => {
      const [colour, option] = k.split("|");
      return { productId: p.id, colour, option, qty: n };
    }));
    flyToList();
    toast(t.added, { description: `${p.name}, ${fmtNum(totalUnits)} ${p.wholesale.unit}s`, action: { label: "View list", onClick: () => openList(true) } });
    reset();
    after?.();
    return true;
  };

  return { p, axis, qty, setCell, fillAll, spreadMoq, reset, addAll, totalUnits, tierIdx, unit, total, moq, short, get: (c: string, o: string) => qty[cellKey(c, o)] ?? 0 };
}

export function TierTable({ p, units }: { p: Product; units: number }) {
  const idx = activeTierIndex(p, units);
  return (
    <div>
      <table className="num w-full border-collapse text-left">
        <caption className="sr-only">Unit price by quantity</caption>
        <thead>
          <tr className="border-b border-current text-[0.8125rem]"><th scope="col" className="py-2 font-medium">Quantity</th><th scope="col" className="py-2 text-right font-medium">Unit price</th></tr>
        </thead>
        <tbody>
          {p.wholesale.tiers.map((tier, i) => {
            const next = p.wholesale.tiers[i + 1];
            const active = i === idx;
            return (
              <tr key={tier.minQty} className={cn("border-b rule transition-colors duration-[382ms]", active && "bg-sand/70 text-night")} aria-current={active ? "true" : undefined}>
                <td className="py-3 pl-2">
                  <span className={cn("mr-2 inline-block h-1.5 w-1.5 rotate-45 align-middle transition-opacity duration-[382ms]", active ? "bg-gold-deep opacity-100" : "opacity-0")} aria-hidden />
                  {next ? `${tier.minQty}–${next.minQty - 1}` : `${tier.minQty}+`} {p.wholesale.unit}s
                  {active && <span className="sr-only"> (your current tier)</span>}
                </td>
                <td className="py-3 pr-2 text-right"><ConfirmText text={fmtPKR(tier.pricePKR)} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Visual meter: progress to the minimum, then to each price tier. */
export function TierProgress({ p, units, compact }: { p: Product; units: number; compact?: boolean }) {
  const tiers = p.wholesale.tiers;
  const moq = p.wholesale.minOrderQty;
  const top = (tiers[tiers.length - 1]?.minQty ?? moq) * 1.12;
  const pct = (n: number) => Math.min(100, (n / top) * 100);
  const idx = activeTierIndex(p, units);
  const next = tiers[idx + 1];
  let msg: string;
  if (units === 0) msg = `Minimum ${moq} ${p.wholesale.unit}s, mixed across colours and sizes.`;
  else if (units < moq) msg = `Add ${moq - units} more to reach the minimum of ${moq}.`;
  else if (next) msg = `Add ${next.minQty - units} more to reach the ${next.minQty}+ tier.`;
  else msg = `You are on the best tier (${tiers[tiers.length - 1].minQty}+).`;

  return (
    <div className={compact ? "" : "mt-1"}>
      <div className="relative h-[6px] bg-current/10" role="meter" aria-valuemin={0} aria-valuemax={Math.round(top)} aria-valuenow={units} aria-label="Order quantity towards price tiers">
        <div className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-[618ms] ease-[var(--ease)]" style={{ width: `${pct(units)}%` }} />
        {tiers.map((tier) => (
          <span key={tier.minQty} className="absolute -top-[3px] h-3 w-3 -translate-x-1/2 rotate-45 border border-current/50 bg-pearl-light transition-colors duration-[382ms]" style={{ left: `${pct(tier.minQty)}%`, background: units >= tier.minQty ? "#816529" : undefined, borderColor: units >= tier.minQty ? "#816529" : undefined }} aria-hidden />
        ))}
      </div>
      {!compact && (
        <div className="num relative mt-2 h-4 text-[0.75rem] opacity-75" aria-hidden>
          {tiers.map((tier) => <span key={tier.minQty} className="absolute -translate-x-1/2" style={{ left: `${pct(tier.minQty)}%` }}>{tier.minQty}+</span>)}
        </div>
      )}
      <p className={cn("mt-2 text-[0.9375rem]", units > 0 && units < moq ? "text-laal-deep" : "")} role="status" aria-live="polite">
        {msg}{!terms.wholesaleNumbersVerified && <> <Confirm /></>}
      </p>
    </div>
  );
}

export function VariantMatrix({ b }: { b: Builder }) {
  const { p, axis } = b;
  const [fill, setFill] = useState(0);
  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-max border-collapse">
          <caption className="sr-only">Quantity for each colour and {axis.label.toLowerCase()}</caption>
          <thead>
            <tr className="text-[0.8125rem]">
              <th scope="col" className="py-2 pr-3 text-left font-medium">Colour</th>
              {axis.options.map((o) => <th key={o} scope="col" className="px-1 py-2 text-left font-medium">{axis.options.length > 1 ? `${axis.label} ${o}` : o}</th>)}
            </tr>
          </thead>
          <tbody>
            {p.colours.map((c) => (
              <tr key={c.name} className="border-t rule">
                <th scope="row" className="py-3 pr-3 text-left font-normal">
                  <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 shrink-0 border border-current/30" style={{ background: c.hex }} aria-hidden />{c.name}</span>
                </th>
                {axis.options.map((o) => (
                  <td key={o} className="px-1 py-3">
                    <Stepper size="sm" value={b.get(c.name, o)} onChange={(n) => b.setCell(c.name, o, n)} label={`${c.name}, ${axis.label} ${o}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.875rem]">
        <button type="button" className="link min-h-11" onClick={b.spreadMoq}>Spread the minimum evenly</button>
        <span className="flex items-center gap-2">
          <label htmlFor={`fill-${p.id}`}>Same in every cell</label>
          <input id={`fill-${p.id}`} type="number" min={0} max={999} value={fill} onChange={(e) => setFill(Math.max(0, parseInt(e.target.value || "0", 10)))} className="field num min-h-11 w-16 px-2 py-1 text-center" />
          <button type="button" className="link min-h-11" onClick={() => b.fillAll(fill)}>Fill</button>
        </span>
        {b.totalUnits > 0 && <button type="button" className="link min-h-11" onClick={b.reset}>Reset</button>}
      </div>
    </div>
  );
}

export function OrderTotals({ b }: { b: Builder }) {
  return (
    <div className="num flex items-end justify-between border-t border-current pt-4" aria-live="polite">
      <div>
        <p className="text-[0.875rem] opacity-80">Total units</p>
        <p className="text-h4">{fmtNum(b.totalUnits)}</p>
      </div>
      <div className="text-right">
        <p className="text-[0.875rem] opacity-80">Estimated subtotal</p>
        <p className="text-h4">{b.totalUnits ? <ConfirmText text={fmtPKR(b.total)} /> : "PKR 0"}</p>
      </div>
    </div>
  );
}
