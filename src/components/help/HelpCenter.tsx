import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as RDialog from "@radix-ui/react-dialog";
import { HelpCircle, MessageCircle, Search, X } from "lucide-react";
import Fuse from "fuse.js";
import { terms, isConfirmed } from "@/config/terms";
import { waLink } from "@/lib/message";
import { useUI } from "@/store/list";
import { usePrefs } from "@/store/prefs";
import { ButtonA } from "../ui/Button";
import { ShopChooser } from "../buyer/ShopChooser";
import { cn } from "@/utils/cn";

const tv = (v: string, fb: string) => (isConfirmed(v) ? v : fb);

/** Short answers to what buyers ask most. Long answers live on /faq. */
const answers = [
  { q: "How do I place an order?", a: "Add pieces to your list, then tap Send on WhatsApp. It is an enquiry: we confirm stock, shipping and price before you pay.", to: "/list" },
  { q: "What is the minimum order?", a: tv(terms.moqRule, "Each piece shows its minimum. You can mix colours and sizes to reach it. Final rule to be confirmed."), to: "/terms" },
  { q: "Can I mix colours and sizes?", a: "Yes. On each piece the minimum counts across all its colours and sizes together.", to: "/terms" },
  { q: "How do I order many SKUs quickly?", a: "Use the quick order pad. You can also paste SKUs and quantities from your own notes.", to: "/quick-order" },
  { q: "Not sure what to start with?", a: "Choose your kind of shop below and we suggest a small opening assortment you can adjust.", to: "/start" },
  { q: "Is it gold?", a: "No. It is stainless steel. Gold-coloured describes the colour of the finish only.", to: "/standards" },
  { q: "Can I get samples first?", a: `Yes, you can ask for a sample pack on WhatsApp. ${tv(terms.samplePackPrice, "Price to be confirmed.")}`, to: "/faq" },
  { q: "How do I pay?", a: tv(terms.paymentTerms, "Payment is agreed with you on WhatsApp after we confirm your order. Nothing is paid on this site."), to: "/terms" },
  { q: "When will it arrive?", a: tv(terms.leadTime, "We confirm dispatch and delivery times with your order."), to: "/terms" },
  { q: "Can I reorder a past list?", a: "Yes. Every list you send is remembered in this browser. Open My list and choose Order again.", to: "/list" },
  { q: "What sizes do the rings come in?", a: "Each ring page has a size guide with a standard chart you can share with your customers.", to: "/shop/rings" },
];
const fuse = new Fuse(answers, { keys: ["q", "a"], threshold: 0.4, ignoreLocation: true });

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-2">
      <span><span className="block font-medium">{label}</span><span className="block text-[0.8125rem] opacity-75">{hint}</span></span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className={cn("relative h-6 w-11 shrink-0 border transition-colors duration-[382ms] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]", checked ? "border-night bg-night" : "border-current/40")} aria-hidden>
        <span className={cn("absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 transition-[left,background] duration-[382ms]", checked ? "left-[24px] bg-gold" : "left-[6px] bg-current/50")} />
      </span>
    </label>
  );
}

export function HelpCenter() {
  const open = useUI((s) => s.helpOpen);
  const setOpen = useUI((s) => s.setHelpOpen);
  const { largeText, calmMotion, setLargeText, setCalmMotion } = usePrefs();
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const list = useMemo(() => (q.trim() ? fuse.search(q.trim()).map((r) => r.item) : answers), [q]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="surface-night fixed bottom-6 right-6 z-40 hidden min-h-12 items-center gap-2 border hairline-gold px-4 text-[0.9375rem] hover:text-gold lg:inline-flex" aria-label="Help and questions">
        <HelpCircle size={18} strokeWidth={1.4} aria-hidden /> Help
      </button>
      <RDialog.Root open={open} onOpenChange={setOpen}>
        <RDialog.Portal>
          <RDialog.Overlay className="fixed inset-0 z-[80] bg-night-deep/55 data-[state=open]:animate-[fadeIn_382ms_var(--ease)]" />
          <RDialog.Content className="surface-light fixed inset-x-0 bottom-0 top-[8dvh] z-[81] flex flex-col border-t hairline-gold outline-none data-[state=open]:animate-[settle_382ms_var(--ease)] lg:inset-y-0 lg:left-auto lg:right-0 lg:top-0 lg:w-[420px] lg:border-l lg:border-t-0" aria-describedby={undefined}>
            <div className="flex items-center justify-between border-b rule px-5 py-2">
              <RDialog.Title className="font-display text-h4">How can we help?</RDialog.Title>
              <RDialog.Close className="grid h-11 w-11 place-items-center" aria-label="Close help"><X size={20} strokeWidth={1.4} aria-hidden /></RDialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <label className="relative block">
                <span className="sr-only">Search help</span>
                <Search size={17} strokeWidth={1.4} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" aria-hidden />
                <input className="field pl-10" placeholder="Ask a question, e.g. minimum" value={q} onChange={(e) => { setQ(e.target.value); setOpenIdx(0); }} />
              </label>
              <ul className="mt-4 border-t rule" aria-live="polite">
                {list.map((it, i) => (
                  <li key={it.q} className="border-b rule">
                    <button type="button" aria-expanded={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left font-medium">
                      {it.q}
                      <span className={cn("h-2 w-2 shrink-0 rotate-45 border border-current transition-colors duration-[382ms]", openIdx === i && "bg-gold-deep border-gold-deep")} aria-hidden />
                    </button>
                    {openIdx === i && (
                      <div className="pb-4 text-[0.9375rem] opacity-90 animate-[settle_382ms_var(--ease)]">
                        <p>{it.a}</p>
                        <Link to={it.to} onClick={() => setOpen(false)} className="link mt-2 inline-block text-[0.875rem]">Go there</Link>
                      </div>
                    )}
                  </li>
                ))}
                {list.length === 0 && <li className="py-4 text-[0.9375rem]">No quick answer for that yet. Ask us directly below, we are happy to help.</li>}
              </ul>

              <button type="button" onClick={() => { setOpen(false); setTimeout(() => useUI.getState().setAssistantOpen(true), 200); }} className="mt-6 flex w-full items-center gap-3 border hairline-gold bg-pearl-light p-4 text-left hover:bg-pearl">
                <span className="grid h-10 w-10 shrink-0 rotate-45 place-items-center border border-gold-deep"><span className="-rotate-45 text-gold-deep">✦</span></span>
                <span><span className="block font-medium">Build my first order</span><span className="block text-[0.875rem] opacity-80">Three questions, one suggested order</span></span>
              </button>
              <div className="surface-night mt-6 p-5">
                <p className="eyebrow">Talk to a person</p>
                <p className="mt-2 text-[0.9375rem] opacity-90">Ask anything about pieces, minimums or delivery.</p>
                <div className="mt-4 grid gap-2">
                  <ButtonA href={waLink(`Assalam o alaikum Mehrusa, I have a question${q ? `: ${q}` : "."}`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} strokeWidth={1.4} aria-hidden />Ask on WhatsApp</ButtonA>
                  <ButtonA variant="secondary" href={waLink("Assalam o alaikum Mehrusa, please call me back about wholesale. A good time to call is: ")} target="_blank" rel="noopener noreferrer">Ask for a call back</ButtonA>
                </div>
              </div>

              <div className="mt-6"><ShopChooser compact /></div>

              <section className="mt-6 border-t rule pt-4" aria-labelledby="comfort">
                <h2 id="comfort" className="eyebrow mb-1">Reading comfort</h2>
                <Toggle label="Larger text" hint="Makes all text a little bigger." checked={largeText} onChange={setLargeText} />
                <Toggle label="Calmer motion" hint="Turns off fades and movement." checked={calmMotion} onChange={setCalmMotion} />
              </section>
            </div>
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
    </>
  );
}
