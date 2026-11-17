import { onScrollFrame } from "@/lib/scrollBus";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, FlaskConical, Layers, MessageCircle, Shuffle, Sparkles, Store, Zap } from "lucide-react";
import { buyerTypes } from "@/data/buyers";
import { getProduct, products } from "@/data/products";
import { terms } from "@/config/terms";
import { ur } from "@/i18n/strings";
import { tex } from "@/lib/images";
import { waLink } from "@/lib/message";
import { scrollToTarget } from "@/lib/smooth";
import { usePrefs } from "@/store/prefs";
import { useList, useUI } from "@/store/list";
import { useMemory } from "@/store/memory";
import { ShopChooser, StarterKitCard, kitsFor } from "@/components/buyer/ShopChooser";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/overlays";
import { ConfirmText, EASE, Eyebrow, Reveal, Urdu, usePageMeta } from "@/components/ui/bits";
import { cn } from "@/utils/cn";

const go = (id: string) => { const el = document.getElementById(id); if (el) scrollToTarget(el, { offset: -120 }); };

/** Live checklist, derived from what the buyer has actually done (all in this browser). */
function useChecklist() {
  const buyer = usePrefs((s) => s.buyer);
  const lines = useList((s) => s.lines);
  const details = useList((s) => s.buyer);
  const history = useMemory((s) => s.history);
  const per: Record<string, number> = {};
  lines.forEach((l) => (per[l.productId] = (per[l.productId] ?? 0) + l.qty));
  const meetsMin = lines.length > 0 && Object.entries(per).every(([id, n]) => n >= (getProduct(id)?.wholesale.minOrderQty ?? 0));
  const openList = useUI((s) => s.setListOpen);
  const items = [
    { t: "Tell us your kind of shop", done: !!buyer, act: () => go("step-1"), cta: "Choose" },
    { t: "Add pieces to your list", done: lines.length > 0, act: () => go("step-2"), cta: "See suggestions" },
    { t: "Every piece meets its minimum", done: meetsMin, act: () => openList(true), cta: "Check list" },
    { t: "Add your shop name and phone", done: !!(details.name || details.business) && !!details.phone, to: "/list", cta: "Add details" },
    { t: "Send your list on WhatsApp", done: history.length > 0, to: "/list", cta: "Send" },
  ];
  return { items, done: items.filter((i) => i.done).length };
}

function Checklist({ tone = "night" }: { tone?: "night" | "light" }) {
  const { items, done } = useChecklist();
  const next = items.findIndex((i) => !i.done);
  const pct = (done / items.length) * 100;
  return (
    <section aria-labelledby="checklist-title" className={cn("border p-5 sm:p-6", tone === "night" ? "border-gold/40 bg-night-deep/70" : "surface-light hairline-gold")}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="checklist-title" className="font-display text-h4">Your first order</h2>
        <p className="num text-[0.875rem] opacity-80">{done} of {items.length} done</p>
      </div>
      <div className="mt-3 h-1 bg-current/10" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Checklist progress">
        <div className="h-full bg-gold transition-[width] duration-[618ms] ease-[var(--ease)]" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-4 space-y-1">
        {items.map((it, i) => (
          <li key={it.t} className={cn("flex min-h-11 items-center gap-3", i === next && "font-medium")}>
            <span className={cn("grid h-6 w-6 shrink-0 place-items-center border transition-colors duration-[382ms]", it.done ? "border-gold bg-gold" : i === next ? "border-gold" : "border-current/30")} aria-hidden>
              {it.done ? <Check size={13} strokeWidth={2.2} className="text-night-deep" /> : <span className="num text-[0.6875rem] opacity-70">{i + 1}</span>}
            </span>
            <span className={cn("min-w-0 flex-1 text-[0.9375rem]", it.done && "line-through decoration-gold/70 opacity-65")}>{it.t}<span className="sr-only">{it.done ? ", done" : ", to do"}</span></span>
            {i === next && (it.to
              ? <Link to={it.to} className="inline-flex shrink-0 items-center gap-1 text-[0.875rem] text-gold-light hover:text-gold">{it.cta}<ArrowRight size={14} strokeWidth={1.4} aria-hidden /></Link>
              : <button type="button" onClick={it.act} className="inline-flex shrink-0 items-center gap-1 text-[0.875rem] text-gold-light hover:text-gold">{it.cta}<ArrowRight size={14} strokeWidth={1.4} aria-hidden /></button>)}
          </li>
        ))}
      </ol>
      {done === items.length && <p className="mt-3 text-[0.9375rem] text-gold-light">Thank you. Your first order is on its way to us.</p>}
      <p className="mt-3 text-[0.75rem] opacity-60">Updates as you go. Kept only in this browser.</p>
    </section>
  );
}

/** Phones: a slim bar that always shows the one next thing to do. */
function NextStepPill() {
  const { items, done } = useChecklist();
  const next = items.find((i) => !i.done);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let cur = false;
    return onScrollFrame((y) => { const next = y > 520; if (next !== cur) { cur = next; setShow(next); } });
  }, []);
  if (!next) return null;
  const body = (
    <>
      <span className="num grid h-7 w-7 shrink-0 place-items-center border border-gold text-[0.75rem] text-gold">{done + 1}</span>
      <span className="min-w-0 flex-1"><span className="block text-[0.6875rem] uppercase tracking-[0.1em] text-pearl/60">Next step · {done} of {items.length} done</span><span className="block truncate text-[0.9375rem]">{next.t}</span></span>
      <ArrowRight size={16} strokeWidth={1.4} aria-hidden className="shrink-0 text-gold" />
    </>
  );
  const cls = "flex w-full items-center gap-3 px-4 py-2.5 text-left";
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.382, ease: EASE }} className="surface-deep fixed inset-x-0 bottom-[calc(58px+env(safe-area-inset-bottom))] z-30 border-t hairline-gold lg:hidden">
          {next.to ? <Link to={next.to} className={cls}>{body}</Link> : <button type="button" onClick={next.act} className={cls}>{body}</button>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Sticky step tracker with live ticks. */
function StepNav() {
  const buyer = usePrefs((s) => s.buyer);
  const lines = useList((s) => s.lines.length);
  const [cur, setCur] = useState("step-1");
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setCur(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    ["step-1", "step-2", "step-3"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  const steps = [
    { id: "step-1", t: "Your shop", done: !!buyer },
    { id: "step-2", t: "Your first order", done: lines > 0 },
    { id: "step-3", t: "Low risk", done: false },
  ];
  return (
    <nav aria-label="Steps" className="surface-pearl sticky top-16 lg:top-[72px] follow-hdr z-20 border-b rule shadow-[0_8px_24px_-20px_rgba(9,16,35,0.4)] ">
      <ol className="container-x grid grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.id}>
            <a href="#/start" onClick={(e) => { e.preventDefault(); go(s.id); }} aria-current={cur === s.id ? "step" : undefined} className={cn("relative flex min-h-12 items-center justify-center gap-2 px-1 text-[0.8125rem] sm:justify-start sm:text-[0.9375rem]", cur === s.id ? "font-medium" : "opacity-70 hover:opacity-100")}>
              <span className={cn("grid h-5 w-5 shrink-0 place-items-center border", s.done ? "border-gold-deep bg-gold-deep text-pearl" : "border-current/40")} aria-hidden>{s.done ? <Check size={11} strokeWidth={2.2} /> : <span className="num text-[0.625rem]">{i + 1}</span>}</span>
              <span className="truncate">{s.t}</span>
              {cur === s.id && <motion.span layoutId="start-step" className="absolute inset-x-1 bottom-0 h-[2px] bg-gold" transition={{ duration: 0.382, ease: EASE }} />}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function Start() {
  usePageMeta("Start here", "New to Mehrusa wholesale? Tell us about your shop, see a suggested first order, and learn how minimums, margins and samples work.");
  const buyer = usePrefs((s) => s.buyer);
  const b = buyerTypes.find((x) => x.id === buyer);
  const kits = kitsFor(buyer);
  const picks = b ? products.filter((p) => p.goodFor?.some((o) => b.occasions.includes(o))).slice(0, 4) : [];
  const openAssistant = useUI((s) => s.setAssistantOpen);

  const reducers = [
    { icon: FlaskConical, t: "Try a sample pack", d: <>See and feel the pieces before a full order. <ConfirmText text={terms.samplePackPrice} /></>, href: waLink("Assalam o alaikum Mehrusa, I would like a sample pack before my first order."), label: "Request samples" },
    { icon: Shuffle, t: "Mix to reach minimums", d: "Each minimum counts across all colours and sizes of a piece, so you can test what sells.", to: "/quick-order", label: "Open the order pad" },
    { icon: Layers, t: "Better price as you grow", d: "Every piece has price tiers. A meter shows how close you are to the next one.", to: "/terms", label: "How tiers work" },
    { icon: MessageCircle, t: "Nothing paid upfront here", d: "Your list is an enquiry. We confirm everything with you on WhatsApp first.", to: "/faq", label: "Read questions" },
  ];
  const faqs = [
    { id: "a", q: "How small can my first order be?", a: <>Each piece has a minimum, shown on its page. You can mix colours and sizes to reach it. Overall order minimum: <ConfirmText text={terms.orderMinimum} /></> },
    { id: "b", q: "Can I change my order after sending it?", a: "Yes. Your list is an enquiry, so nothing is fixed until we agree it with you on WhatsApp." },
    { id: "c", q: "How long until it arrives?", a: <>We confirm dispatch with your order. Lead time: <ConfirmText text={terms.leadTime} /></> },
    { id: "d", q: "What if a piece arrives damaged?", a: <><ConfirmText text={terms.returnsDamage} /></> },
  ];

  return (
    <>
      {/* Hero */}
      <header className="surface-deep grain relative overflow-hidden">
        <img decoding="async" src={tex("satin")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-night-deep via-night-deep/90 to-night-deep/60" aria-hidden />
        <div className="container-x relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <p className="rise-in eyebrow flex items-center gap-3"><span className="h-px w-8 bg-gold" aria-hidden />New to Mehrusa</p>
            <h1 className="rise-in mt-4 font-display text-[2.5rem] leading-[1.05] text-pearl sm:text-h1" style={{ animationDelay: "120ms" }}>Your first order, <span className="foil-text">made easy.</span></h1>
            <div className="rise-in mt-2" style={{ animationDelay: "240ms" }}><Urdu display as="p" className="text-left text-[1.75rem] leading-[2] text-gold">{ur.welcome}</Urdu></div>
            <p className="rise-in mt-3 max-w-[50ch] text-[1.0625rem] text-pearl/85 sm:text-lead" style={{ animationDelay: "360ms" }}>Tell us about your shop, pick a suggested first order or build your own, and send it on WhatsApp. We confirm everything before you pay.</p>

            <p className="rise-in mt-5 text-[0.875rem] text-pearl/65" style={{ animationDelay: "480ms" }}>Choose the way that fits you · nothing to sign up for</p>
            <ul className="rise-in mt-4 grid gap-2 sm:grid-cols-3 sm:gap-3" style={{ animationDelay: "600ms" }} aria-label="Choose your path">
              {[
                { icon: Sparkles, t: "Brand new to us", d: "Get a suggested order", on: () => openAssistant(true), accent: true },
                { icon: Store, t: "I know my shop", d: "Pick from starter kits", on: () => go("step-2") },
                { icon: Zap, t: "I know my SKUs", d: "Use the quick order pad", to: "/quick-order" },
              ].map(({ icon: Icon, t, d, on, to, accent }) => {
                const inner = (
                  <>
                    <Icon size={20} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                    <span className="min-w-0 flex-1"><span className="block font-medium text-pearl">{t}</span><span className="block text-[0.875rem] text-pearl/70">{d}</span></span>
                    <ArrowRight size={15} strokeWidth={1.4} aria-hidden className="mt-1 shrink-0 text-pearl/60 transition-transform duration-[382ms] group-hover:translate-x-1 group-hover:text-gold" />
                  </>
                );
                const cls = cn("group flex h-full w-full items-start gap-3 border p-4 text-left transition-colors duration-[250ms] hover:border-gold", accent ? "border-gold/50" : "border-pearl/15");
                return <li key={t}>{to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" onClick={on} className={cls}>{inner}</button>}</li>;
              })}
            </ul>
          </div>
          <div className="rise-in" style={{ animationDelay: "500ms" }}><Checklist /></div>
        </div>
      </header>

      <StepNav />

      {/* How it works, in 60 seconds */}
      <section className="surface-light border-b rule py-12 sm:py-14" aria-labelledby="how-start">
        <div className="container-x">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="how-start" className="font-display text-[1.5rem] sm:text-h3">How it works, in 60 seconds</h2>
            <p className="text-[0.875rem] opacity-70">No account, no payment online</p>
          </div>
          <ol className="relative mt-8 grid gap-6 sm:grid-cols-4 sm:gap-4">
            <span className="absolute bottom-3 left-[15px] top-3 w-px bg-night/15 sm:bottom-auto sm:left-4 sm:right-4 sm:top-[15px] sm:h-px sm:w-auto" aria-hidden />
            {[
              ["Choose", "Pieces, colours and sizes"],
              ["Send", "Your list on WhatsApp"],
              ["We confirm", "Stock, shipping, final price"],
              ["Receive", "Boxed and ready to sell"],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <li className="relative flex gap-4 sm:block">
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center" aria-hidden><span className="absolute h-6 w-6 rotate-45 border border-gold-deep bg-pearl-light" /><span className="num relative text-[0.75rem] text-gold-deep">{i + 1}</span></span>
                  <span className="sm:mt-4 sm:block"><span className="block font-medium">{t}</span><span className="block text-[0.9375rem] opacity-75">{d}</span></span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Step 1 */}
      <section id="step-1" className="surface-pearl scroll-mt-32 py-14 sm:py-16 lg:py-[84px]" aria-labelledby="s1">
        <div className="container-x">
          <p className="eyebrow mb-2">Step 1</p>
          <h2 id="s1" className="sr-only">Your shop</h2>
          <ShopChooser />
          <AnimatePresence>
            {b && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.382, ease: EASE }} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-l-2 border-gold bg-pearl-light p-4" role="status">
                <span className="text-[0.9375rem]">Lovely. Step 2 now shows suggestions for a <strong className="font-medium">{b.short.toLowerCase()}</strong>.</span>
                <button type="button" onClick={() => go("step-2")} className="link inline-flex min-h-10 items-center gap-1.5 text-[0.9375rem]">See them <ArrowRight size={15} strokeWidth={1.4} aria-hidden /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Step 2 */}
      <section id="step-2" className="surface-light scroll-mt-32 border-t rule py-14 sm:py-16 lg:py-[84px]" aria-labelledby="kits">
        <div className="container-x">
          <p className="eyebrow mb-2">Step 2</p>
          <h2 id="kits" className="font-display text-[1.875rem] leading-tight sm:text-h2">{b ? `A first order for your ${b.short.toLowerCase()}` : "Pick a first order, or build your own"}</h2>
          <p className="mt-3 max-w-[60ch] opacity-90">{b ? b.need : "Small assortments that already meet each piece's minimum. Add one as it is, or adjust it first."}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {kits.map((k, i) => <Reveal key={k.id} delay={i * 0.06}><StarterKitCard kit={k} /></Reveal>)}
            <Reveal delay={kits.length * 0.06}>
              <button type="button" onClick={() => openAssistant(true)} className="surface-night grain group relative flex h-full min-h-[320px] w-full flex-col justify-between overflow-hidden border hairline-gold p-6 text-left">
                <div>
                  <Sparkles size={24} strokeWidth={1.2} className="text-gold" aria-hidden />
                  <p className="mt-4 eyebrow">Made for you</p>
                  <p className="mt-2 font-display text-h3 leading-snug">Build your own in three taps</p>
                  <p className="mt-2 text-[0.9375rem] opacity-80">Your shop, the size of order and the feeling you want. We suggest pieces that meet every minimum.</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-gold-light">Start <ArrowRight size={16} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" /></span>
              </button>
            </Reveal>
          </div>
          {b && <button type="button" className="link mt-6 min-h-11" onClick={() => usePrefs.getState().setBuyer(null)}>See suggestions for every kind of shop</button>}
          <p className="mt-4 text-[0.8125rem] opacity-75">Suggestions to help you start, not sales figures. Quantities follow the current minimums, which are still being confirmed.</p>

          {picks.length > 0 && b && (
            <div className="mt-14">
              <h3 className="font-display text-h3">Pieces that suit a {b.short.toLowerCase()}</h3>
              <ul className="no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:gap-6">
                {picks.map((p) => <li key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-auto"><ProductCard p={p} /></li>)}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Step 3 */}
      <section id="step-3" className="surface-night scroll-mt-32 py-14 sm:py-16 lg:py-[84px]" aria-labelledby="risk">
        <div className="container-x">
          <p className="eyebrow mb-2">Step 3</p>
          <h2 id="risk" className="max-w-[22ch] font-display text-[1.875rem] leading-tight sm:text-h2">We keep your first order low-risk.</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {reducers.map(({ icon: Icon, t, d, href, to, label }, i) => (
              <li key={t}>
                <Reveal delay={i * 0.06} className="h-full">
                  <div className="flex h-full flex-col border border-pearl/12 p-5 transition-colors duration-[382ms] hover:border-gold/50 lg:p-6">
                    <span className="grid h-11 w-11 place-items-center border border-gold/50"><Icon size={20} strokeWidth={1.3} className="text-gold" aria-hidden /></span>
                    <h3 className="mt-5 font-sans text-[1.0625rem] font-medium">{t}</h3>
                    <p className="mt-2 flex-1 text-[0.9375rem] opacity-80">{d}</p>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="group mt-4 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-gold-light">{label}<ArrowRight size={15} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" /></a>
                    ) : (
                      <Link to={to!} className="group mt-4 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-gold-light">{label}<ArrowRight size={15} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" /></Link>
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* First-order questions + checklist again */}
      <section className="surface-pearl py-14 sm:py-16 lg:py-[84px]" aria-labelledby="first-q">
        <div className="container-x grid gap-10 lg:grid-cols-[61.8fr_38.2fr] lg:gap-14">
          <div>
            <Eyebrow className="mb-2">Before your first order</Eyebrow>
            <h2 id="first-q" className="font-display text-[1.875rem] leading-tight sm:text-h2">First-order questions</h2>
            <div className="mt-8"><Accordion type="single" defaultOpen={["a"]} items={faqs.map((f) => ({ id: f.id, title: f.q, body: <p>{f.a}</p> }))} /></div>
            <Link to="/faq" className="link mt-5 inline-flex min-h-11 items-center">All questions</Link>
          </div>
          <div className="lg:sticky lg:top-40 lg:self-start"><Checklist tone="light" /></div>
        </div>
      </section>

      <NextStepPill />

      {/* Talk to a person */}
      <section className="surface-deep grain relative overflow-hidden border-t rule">
        <div className="container-x flex flex-col items-center py-16 text-center lg:py-[84px]">
          <p className="eyebrow">Still deciding?</p>
          <p className="mt-3 max-w-[24ch] font-display text-[1.875rem] leading-tight sm:text-h2">Tell us about your shop. We will help you choose.</p>
          <div className="mt-8 grid w-full gap-3 sm:flex sm:w-auto sm:justify-center">
            <ButtonA href={waLink("Assalam o alaikum Mehrusa, I am new and would like help choosing my first order.")} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto"><MessageCircle size={16} strokeWidth={1.4} aria-hidden />Help me choose on WhatsApp</ButtonA>
            <ButtonLink to="/apply" variant="secondary" className="w-full sm:w-auto">Apply for wholesale</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
