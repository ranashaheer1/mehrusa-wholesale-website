import { useMemo, useState } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Gift, ShoppingBag, Sparkles, Store, Tent, X } from "lucide-react";
import { toast } from "sonner";
import { buyerTypes, occasionLabel, type BuyerType } from "@/data/buyers";
import { getProduct } from "@/data/products";
import { getCategory } from "@/data/categories";
import type { Occasion } from "@/data/types";
import { sizes, suggestOrder, type AssistantInput } from "@/lib/assistant";
import { encodeList } from "@/lib/share";
import { fmtNum } from "@/lib/pricing";
import { useList, useUI } from "@/store/list";
import { usePrefs } from "@/store/prefs";
import { ProductImage } from "../catalogue/ProductImage";
import { Button } from "../ui/Button";
import { EASE } from "../ui/bits";
import { flyToList } from "../ui/FlyLayer";
import { cn } from "@/utils/cn";

const icons: Record<BuyerType, typeof Store> = { boutique: Store, online: ShoppingBag, gifting: Gift, market: Tent };
const steps = ["Your shop", "Size and colour", "Style", "Your order"];

function Choice({ on, onClick, title, sub, icon: Icon }: { on: boolean; onClick: () => void; title: string; sub?: string; icon?: typeof Store }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn("group flex min-h-[72px] w-full items-center gap-4 border p-4 text-left transition-colors duration-[382ms]", on ? "border-night bg-night text-pearl" : "rule bg-pearl-light hover:border-night")}>
      {Icon && <Icon size={22} strokeWidth={1.25} className={on ? "text-gold" : "text-gold-deep"} aria-hidden />}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        {sub && <span className={cn("block text-[0.875rem]", on ? "opacity-85" : "opacity-75")}>{sub}</span>}
      </span>
      <span className={cn("h-3 w-3 shrink-0 rotate-45 border transition-colors duration-[382ms]", on ? "border-gold bg-gold" : "border-current/40")} aria-hidden />
    </button>
  );
}

export function OrderAssistant() {
  const open = useUI((s) => s.assistantOpen);
  const setOpen = useUI((s) => s.setAssistantOpen);
  const savedBuyer = usePrefs((s) => s.buyer);
  const setBuyerPref = usePrefs((s) => s.setBuyer);
  const addMany = useList((s) => s.addMany);
  const openList = useUI((s) => s.setListOpen);
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [input, setInput] = useState<Partial<AssistantInput>>({ colour: "both", styles: [] });
  const [removed, setRemoved] = useState<string[]>([]);
  const buyer = input.buyer ?? savedBuyer ?? undefined;

  const result = useMemo(() => (step === 3 && buyer && input.size ? suggestOrder({ buyer, size: input.size, styles: input.styles ?? [], colour: input.colour ?? "both" }) : []), [step, buyer, input]);
  const lines = result.filter((l) => !removed.includes(l.productId));
  const pieceIds = [...new Set(lines.map((l) => l.productId))];
  const units = lines.reduce((a, l) => a + l.qty, 0);

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const reset = () => { setStep(0); setInput({ colour: "both", styles: [] }); setRemoved([]); };
  const canNext = step === 0 ? !!buyer : step === 1 ? !!input.size : true;

  const add = () => {
    addMany(lines);
    flyToList();
    toast(`${pieceIds.length} pieces added to your list.`, { action: { label: "View list", onClick: () => openList(true) } });
    setOpen(false);
    setTimeout(reset, 400);
  };
  const adjust = () => {
    const code = encodeList(lines.map((l) => ({ ...l, key: `${l.productId}|${l.colour}|${l.option}` })));
    setOpen(false);
    nav(`/quick-order?pad=${code}`);
    setTimeout(reset, 400);
  };

  return (
    <RDialog.Root open={open} onOpenChange={setOpen}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[85] bg-night-deep/70 data-[state=open]:animate-[fadeIn_382ms_var(--ease)]" />
        <RDialog.Content className="surface-light fixed inset-x-0 bottom-0 top-[4dvh] z-[86] flex flex-col border-t hairline-gold outline-none data-[state=open]:animate-[settle_618ms_var(--ease)] md:inset-auto md:left-1/2 md:top-1/2 md:h-[min(760px,92dvh)] md:w-[min(720px,calc(100%-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:border" aria-describedby={undefined}>
          <div className="flex items-center gap-3 border-b rule px-5 py-3">
            {step > 0 ? (
              <button type="button" onClick={() => go(step - 1)} className="grid h-11 w-11 place-items-center" aria-label="Back"><ArrowLeft size={20} strokeWidth={1.4} aria-hidden /></button>
            ) : <Sparkles size={20} strokeWidth={1.3} className="mx-3 text-gold-deep" aria-hidden />}
            <RDialog.Title className="flex-1 font-display text-h4">Build my first order</RDialog.Title>
            <RDialog.Close className="grid h-11 w-11 place-items-center" aria-label="Close"><X size={20} strokeWidth={1.4} aria-hidden /></RDialog.Close>
          </div>
          <ol className="flex items-center gap-2 px-5 pt-4" aria-label="Steps">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2" aria-current={i === step ? "step" : undefined}>
                <span className={cn("h-2.5 w-2.5 shrink-0 rotate-45 border transition-colors duration-[618ms]", i <= step ? "border-gold-deep bg-gold-deep" : "border-current/30")} aria-hidden />
                <span className={cn("hidden text-[0.75rem] sm:inline", i === step ? "font-medium" : "opacity-60")}>{s}</span>
                {i < steps.length - 1 && <span className={cn("h-px flex-1 transition-colors duration-[618ms]", i < step ? "bg-gold-deep" : "bg-current/15")} aria-hidden />}
              </li>
            ))}
          </ol>

          <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-5 py-6">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={step} initial={{ opacity: 0, x: reduce ? 0 : dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : dir * -24 }} transition={{ duration: 0.382, ease: EASE }}>
                {step === 0 && (
                  <div>
                    <h2 className="font-display text-h3">Who are you buying for?</h2>
                    <p className="mt-1 opacity-80">We will suggest pieces that suit your customers.</p>
                    <div className="mt-6 grid gap-3">
                      {buyerTypes.map((b) => <Choice key={b.id} on={buyer === b.id} icon={icons[b.id]} title={b.label} sub={b.need} onClick={() => { setInput((x) => ({ ...x, buyer: b.id })); setBuyerPref(b.id); setTimeout(() => go(1), 220); }} />)}
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <h2 className="font-display text-h3">How big a first order?</h2>
                    <p className="mt-1 opacity-80">You can change every number afterwards.</p>
                    <div className="mt-6 grid gap-3">
                      {(Object.keys(sizes) as (keyof typeof sizes)[]).map((k) => <Choice key={k} on={input.size === k} title={sizes[k].label} sub={sizes[k].sub} onClick={() => setInput((x) => ({ ...x, size: k }))} />)}
                    </div>
                    <h3 className="mt-8 font-sans text-[1rem] font-medium">Which colour do your customers reach for?</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Colour">
                      {([["steel", "Natural steel", "#B9BCC2"], ["gold", "Gold-coloured", "#C7A04D"], ["both", "Both", ""]] as const).map(([k, l, hex]) => (
                        <button key={k} type="button" aria-pressed={input.colour === k} onClick={() => setInput((x) => ({ ...x, colour: k }))} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 border text-[0.875rem]", input.colour === k ? "border-night bg-night text-pearl" : "rule bg-pearl-light hover:border-night")}>
                          <span className="flex gap-1" aria-hidden>{hex ? <span className="h-3.5 w-3.5 border border-current/30" style={{ background: hex }} /> : <><span className="h-3.5 w-3.5 bg-[#B9BCC2]" /><span className="h-3.5 w-3.5 bg-gold" /></>}</span>{l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h2 className="font-display text-h3">What feeling should it have?</h2>
                    <p className="mt-1 opacity-80">Choose any that fit, or skip and we will follow your shop type.</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {(Object.keys(occasionLabel) as Occasion[]).map((o) => {
                        const on = input.styles?.includes(o);
                        return <button key={o} type="button" aria-pressed={on} onClick={() => setInput((x) => ({ ...x, styles: on ? x.styles!.filter((y) => y !== o) : [...(x.styles ?? []), o] }))} className={cn("min-h-12 border px-5 text-[0.9375rem]", on ? "border-night bg-night text-pearl" : "rule bg-pearl-light hover:border-night")}>{occasionLabel[o]}</button>;
                      })}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <p className="eyebrow">Suggested for you</p>
                    <h2 className="mt-1 font-display text-h3">{pieceIds.length} pieces, <span className="num">{fmtNum(units)}</span> units</h2>
                    <p className="mt-1 opacity-80">Each meets its minimum. Remove anything that does not feel right.</p>
                    <ul className="mt-5 border-t rule">
                      {pieceIds.map((id) => {
                        const p = getProduct(id)!;
                        const ls = lines.filter((l) => l.productId === id);
                        return (
                          <li key={id} className="flex items-center gap-3 border-b rule py-3 animate-[settle_382ms_var(--ease)]">
                            <span className="w-12 shrink-0"><ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt="" label={false} /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{p.name}</span>
                              <span className="num block text-[0.8125rem] opacity-75">{ls.map((l) => `${l.colour}${l.option !== "One size" ? ` ${l.option}` : ""} ×${l.qty}`).join(" · ")}</span>
                            </span>
                            <button type="button" onClick={() => setRemoved((r) => [...r, id])} className="grid h-11 w-11 place-items-center opacity-70 hover:opacity-100" aria-label={`Remove ${p.name}`}><X size={16} strokeWidth={1.4} aria-hidden /></button>
                          </li>
                        );
                      })}
                    </ul>
                    {removed.length > 0 && <button type="button" className="link mt-3 min-h-11 text-[0.875rem]" onClick={() => setRemoved([])}>Bring back removed pieces ({removed.length})</button>}
                    <p className="mt-4 text-[0.75rem] opacity-70">A suggestion based on your answers and how pieces are described, not on sales figures.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t rule px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {step < 3 ? (
              <>
                <span className="text-[0.8125rem] opacity-70">Step {step + 1} of 3</span>
                <div className="flex gap-2">
                  {step === 2 && <Button variant="ghost" onClick={() => { setInput((x) => ({ ...x, styles: [] })); go(3); }}>Skip</Button>}
                  <Button onClick={() => go(step + 1)} disabled={!canNext}>{step === 2 ? "Show my order" : "Next"}</Button>
                </div>
              </>
            ) : (
              <>
                <button type="button" className="link min-h-11 text-[0.875rem]" onClick={reset}>Start over</button>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={adjust} disabled={!lines.length}>Adjust numbers</Button>
                  <Button onClick={add} disabled={!lines.length}>Add all to my list</Button>
                </div>
              </>
            )}
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
