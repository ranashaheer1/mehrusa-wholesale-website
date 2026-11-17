import { Link } from "react-router-dom";
import { products } from "@/data/products";
import { ur } from "@/i18n/strings";
import { tex, textures } from "@/lib/images";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Brand";
import { ConfirmText, Eyebrow, Reveal, Urdu, usePageMeta } from "@/components/ui/bits";
import { ArrowRight, Boxes, Gift, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { Accordion } from "@/components/ui/overlays";
import { cn } from "@/utils/cn";
import { CategoryRail } from "@/components/home/CategoryRail";
import { useUI } from "@/store/list";
import { useListCount } from "@/store/list";
import { useMemory } from "@/store/memory";
import { getProduct } from "@/data/products";
import { ShopChooser, StarterKitCard, kitsFor } from "@/components/buyer/ShopChooser";
import { usePrefs } from "@/store/prefs";
import { buyerTypes } from "@/data/buyers";
import { useEffect } from "react";
import { fetchSeo } from "@/lib/api";

function StartSection() {
  const buyer = usePrefs((s) => s.buyer);
  const b = buyerTypes.find((x) => x.id === buyer);
  const kits = kitsFor(buyer).slice(0, buyer ? 1 : 2);
  return (
    <section className="surface-pearl section" aria-labelledby="start-title">
      <div className="container-x grid gap-10 lg:grid-cols-[61.8fr_38.2fr] lg:gap-14">
        <div>
          <Eyebrow className="mb-3">Not sure where to start?</Eyebrow>
          <h2 id="start-title" className="max-w-[20ch] text-h2">{b ? `A first order for your ${b.short.toLowerCase()}.` : "Tell us about your shop. We will suggest a first order."}</h2>
          <p className="mt-4 max-w-[52ch] text-lead opacity-90">Pick the one that fits. The suggestions change to suit you, and your choice stays in this browser only.</p>
          <div className="mt-8"><ShopChooser /></div>
          <Link to="/start" className="link mt-6 inline-block">More help for first-time buyers</Link>
        </div>
        <div className="grid gap-6 lg:pt-10">
          {kits.map((k) => <StarterKitCard key={k.id} kit={k} />)}
        </div>
      </div>
    </section>
  );
}

/** Returning buyers pick up where they left off. */
function ContinueBand() {
  const count = useListCount();
  const recent = useMemory((s) => s.recent);
  const last = recent.map(getProduct).find(Boolean);
  if (!count && !last) return null;
  return (
    <div className="relative border-t border-pearl/15 bg-night-deep/60">
      <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-[0.9375rem]">
        <span className="eyebrow">Welcome back</span>
        {count > 0 && <Link to="/list" className="link">Your list has <span className="num">{count}</span> units. Continue</Link>}
        {last && <Link to={`/product/${last.id}`} className="link opacity-90">Last viewed: {last.name}</Link>}
      </div>
    </div>
  );
}

const edits = [
  { to: "/shop?new=1", title: "New arrivals", sub: "The latest pieces", img: "satin" as const },
  { to: "/shop/sets", title: "For gifting", sub: "Boxed, matched sets", img: "laal-whisper" as const },
  { to: "/shop?colour=Gold-coloured", title: "Gold-coloured", sub: "Finish on stainless steel", img: "gold-foil" as const },
  { to: "/shop?colour=Natural+steel", title: "Natural steel", sub: "Quiet, everyday", img: "black-sapphire-stone" as const },
];

const steps = [
  { n: "01", title: "Browse and build a list", body: "Pick pieces, colours and sizes. Quantities add up as you go, with the price tier shown." },
  { n: "02", title: "Send it on WhatsApp", body: "One tap sends your list to us. No payment, no account, nothing stored on this site." },
  { n: "03", title: "We confirm", body: "We reply with stock, shipping and the final price, and answer any questions." },
  { n: "04", title: "Packed and sent", body: "Each piece is wrapped, boxed in midnight and sent to your shop." },
];

const standards = [
  { title: "Craft", img: "velvet-fabric" as const, body: "How each piece is made and checked will be set down here in plain words, once confirmed. [CONFIRM]" },
  { title: "Quality", img: "black-sapphire-stone" as const, body: "We say exactly what a piece is made of: stainless steel. Grade and finish details are listed only once confirmed." },
  { title: "Packaging", img: "satin" as const, body: "A midnight box, pearl tissue and a thank-you card. Ready to sell or give." },
  { title: "Dispatch", img: "pearl-cotton-paper" as const, body: "Orders are packed with care. Carriers, areas and times are confirmed with you on WhatsApp. [CONFIRM]" },
];

const benefits = [
  { icon: Boxes, t: "Minimums that flex", d: "Mix colours and sizes to reach each piece's minimum." },
  { icon: MessageCircle, t: "Order on WhatsApp", d: "Send your list in one tap. We reply to confirm." },
  { icon: ShieldCheck, t: "Pay after we confirm", d: "Nothing is charged on this website." },
  { icon: Gift, t: "Ready to sell", d: "Boxed in midnight with pearl tissue." },
];

const faqs = [
  { id: "f1", q: "Do I have to pay on the website?", a: "No. Your list is an enquiry. We confirm stock, shipping and the final price on WhatsApp, and you pay only after you agree." },
  { id: "f2", q: "Can I mix colours and sizes?", a: "Yes. The minimum on each piece counts across all its colours and sizes together, so you can test what sells." },
  { id: "f3", q: "Is the jewellery gold?", a: "No. It is stainless steel. Gold-coloured describes the colour of the finish only, and we will always say so." },
  { id: "f4", q: "Can I get samples first?", a: "Yes. Ask for a sample pack on WhatsApp before your first full order." },
];

export default function Home() {
  usePageMeta("", "Mehrusa wholesale: modest stainless steel jewellery for boutiques, online stores and gifting companies in Pakistan. Mix to reach minimums, order on WhatsApp, pay after we confirm.");
  const newArrivals = products.filter((p) => p.badges?.includes("new")).concat(products.filter((p) => !p.badges?.includes("new"))).slice(0, 4);
  const openAssistant = useUI((s) => s.setAssistantOpen);

  useEffect(() => {
    let alive = true;
    fetchSeo("home").then((seo) => {
      if (!alive || !seo) return;
      const title = (seo.meta?.meta_title as string) || (seo.defaults?.default_title as string);
      const description = (seo.meta?.meta_description as string) || (seo.defaults?.default_description as string);
      if (title) document.title = title.includes("Mehrusa") ? title : `${title} | Mehrusa Wholesale`;
      if (description) {
        const el = document.querySelector('meta[name="description"]');
        if (el) el.setAttribute("content", description);
      }
      document.querySelectorAll('script[data-mehrusa-seo-schema]').forEach((n) => n.remove());
      (seo.schemas || []).forEach((block, i) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.mehrusaSeoSchema = String(i);
        script.textContent = JSON.stringify(block.json_ld);
        document.head.appendChild(script);
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <HomeHero footer={<ContinueBand />} />

      {/* Why shops choose us: the four answers buyers look for first */}
      <section className="surface-light border-b rule" aria-label="Why order from Mehrusa">
        <ul className="container-x grid grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, t: title, d }, i) => (
            <li key={title} className={cn("flex flex-col gap-2 py-6 pr-3 sm:flex-row sm:items-start sm:gap-4 sm:py-8 lg:pr-6", i % 2 === 1 && "border-l rule pl-4 lg:pl-6", i === 2 && "border-t rule lg:border-l lg:border-t-0 lg:pl-6", i === 3 && "border-t rule lg:border-t-0")}>
              <Icon size={24} strokeWidth={1.2} className="shrink-0 text-gold-deep" aria-hidden />
              <span>
                <span className="block font-medium leading-snug">{title}</span>
                <span className="mt-1 block text-[0.875rem] leading-snug opacity-80">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <CategoryRail />

      {/* New arrivals */}
      <section className="surface-pearl py-14 md:py-16 lg:py-[84px]" aria-labelledby="new">
        <div className="container-x">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow className="mb-2 sm:mb-3">Just in</Eyebrow>
              <h2 id="new" className="text-[1.75rem] leading-tight sm:text-h2">New arrivals</h2>
            </div>
            <Link to="/shop?new=1" className="link inline-flex min-h-11 items-center self-start sm:self-auto">See all new pieces</Link>
          </div>
          <ul className="no-scrollbar -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:gap-6">
            {newArrivals.map((p) => <li key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-auto"><ProductCard p={p} /></li>)}
          </ul>
        </div>
      </section>

      {/* How wholesale works */}
      <section className="surface-night py-14 md:py-16 lg:py-[84px]" aria-labelledby="how">
        <div className="container-x">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow className="mb-2 sm:mb-3">How wholesale works</Eyebrow>
              <h2 id="how" className="max-w-[20ch] text-[1.75rem] leading-tight sm:text-h2">From your list to your shelf, in four quiet steps.</h2>
            </div>
            <button type="button" onClick={() => openAssistant(true)} className="link inline-flex min-h-11 items-center gap-2 self-start text-gold-light"><Sparkles size={16} strokeWidth={1.4} aria-hidden />Build my first order</button>
          </div>
          <ol className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.n}>
                <Reveal delay={i * 0.06}>
                  <div className="flex gap-4 border-t hairline-gold pt-5 sm:block">
                    <p className="num font-display text-h3 leading-none text-gold">{s.n}</p>
                    <div>
                      <h3 className="font-sans text-[1.0625rem] font-medium sm:mt-3">{s.title}</h3>
                      <p className="mt-1.5 text-[0.9375rem] opacity-85">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <StartSection />

      {/* Margin: what retailers care about most */}
      <section className="surface-deep grain relative overflow-hidden py-14 md:py-16 lg:py-[84px]" aria-labelledby="margin">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[61.8fr_38.2fr]">
          <div>
            <Eyebrow className="mb-2 sm:mb-3">Room for your margin</Eyebrow>
            <h2 id="margin" className="max-w-[22ch] text-[1.75rem] leading-tight sm:text-h2">Know what you keep before you order.</h2>
            <p className="mt-4 max-w-[54ch] text-lead opacity-90">Many shops sell at around twice the wholesale price. Every piece has a margin planner: type your selling price and see your margin, profit per piece and profit on the whole order.</p>
            <ButtonLink to="/shop" className="mt-8 w-full sm:w-auto">Find a piece and plan it</ButtonLink>
          </div>
          <div className="border border-gold/40 p-5 sm:p-6" aria-hidden>
            <p className="eyebrow">Example, your numbers will differ</p>
            <dl className="num mt-4 grid grid-cols-3 gap-3 text-center">
              {[["×2", "Selling at"], ["50%", "Margin"], ["Per piece", "Profit shown"]].map(([v, k]) => (
                <div key={k} className="border-t border-pearl/15 pt-3"><dd className="font-display text-h3 text-gold">{v}</dd><dt className="mt-1 text-[0.75rem] opacity-75">{k}</dt></div>
              ))}
            </dl>
            <p className="mt-4 text-[0.8125rem] opacity-75">Wholesale prices are being confirmed. Until then, type the price we quote you.</p>
          </div>
        </div>
      </section>

      {/* Shop by */}
      <section className="surface-pearl py-14 md:py-16 lg:py-[84px]" aria-labelledby="edits">
        <div className="container-x">
          <Eyebrow className="mb-2 sm:mb-3">Shop by</Eyebrow>
          <h2 id="edits" className="text-[1.75rem] leading-tight sm:text-h2">Edits for your shelf</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-6">
            {edits.map((e, i) => (
              <li key={e.to}>
                <Reveal delay={i * 0.05}>
                  <Link to={e.to} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img decoding="async" src={tex(e.img)} alt={`${e.title}: ${textures[e.img].label.toLowerCase()}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1000ms] ease-[var(--ease)] group-hover:scale-[1.03]" />
                      <span className="absolute inset-3 border border-transparent transition-colors duration-[618ms] group-hover:border-gold" aria-hidden />
                    </div>
                    <p className="mt-3 flex items-center justify-between font-display text-[1.125rem] sm:text-h4">{e.title}<ArrowRight size={16} strokeWidth={1.25} aria-hidden className="text-gold-deep transition-transform duration-[382ms] group-hover:translate-x-1" /></p>
                    <p className="text-[0.875rem] opacity-80">{e.sub}</p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our Standards */}
      <section className="surface-light border-t rule py-14 md:py-16 lg:py-[84px]" aria-labelledby="standards">
        <div className="container-x">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow className="mb-2 sm:mb-3">Our standards</Eyebrow>
              <h2 id="standards" className="text-[1.75rem] leading-tight sm:text-h2">Protected first, then crowned.</h2>
            </div>
            <Urdu display className="text-h4 text-gold-deep">{ur.standards}</Urdu>
          </div>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {standards.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={i * 0.06}>
                  <div className="aspect-[16/10] overflow-hidden sm:aspect-[4/3]"><img decoding="async" src={tex(s.img)} alt={textures[s.img].label} loading="lazy" className="h-full w-full object-cover" /></div>
                  <h3 className="mt-4 font-display text-h4">{s.title}</h3>
                  <p className="mt-1.5 opacity-90"><ConfirmText text={s.body} /></p>
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-x-8">
            <Link to="/standards" className="link inline-flex min-h-11 items-center">Read our standards in full</Link>
            <Link to="/story" className="link inline-flex min-h-11 items-center">Why we are called Mehrusa</Link>
          </div>
        </div>
      </section>

      {/* Packaging */}
      <section className="surface-night py-14 md:py-16 lg:py-[84px]" aria-labelledby="pack">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[38.2fr_61.8fr] lg:gap-16">
          <Reveal>
            <Eyebrow className="mb-2 sm:mb-3">Packaging</Eyebrow>
            <h2 id="pack" className="text-[1.75rem] leading-tight sm:text-h2">The midnight box.</h2>
            <Urdu display className="mt-2 text-left text-h4 text-gold">{ur.packaging}</Urdu>
            <p className="mt-4 max-w-[46ch] text-lead opacity-90">Every piece is wrapped in pearl tissue, laid in a midnight box and sent with a thank-you card. Your customers open something kept.</p>
            <ButtonLink to="/packaging" variant="secondary" className="mt-8 w-full sm:w-auto">See the unboxing</ButtonLink>
          </Reveal>
          <div className="grid grid-cols-[61.8fr_38.2fr] gap-3 sm:gap-4">
            <div className="relative aspect-[4/5] overflow-hidden"><img decoding="async" src={tex("black-sapphire-stone")} alt="Midnight stone texture, placeholder for the box photograph" loading="lazy" className="h-full w-full object-cover" /><div className="absolute inset-0 grid place-items-center"><div className="grid aspect-square w-1/2 place-items-center border hairline-gold bg-night"><Mark variant="foil" size={44} /></div></div></div>
            <div className="grid gap-3 sm:gap-4">
              <div className="aspect-square overflow-hidden"><img decoding="async" src={tex("pearl-cotton-paper")} alt="Pearl cotton paper, as used for tissue" loading="lazy" className="h-full w-full object-cover" /></div>
              <div className="aspect-square overflow-hidden"><img decoding="async" src={tex("gold-foil")} alt="Gold foil texture, as used on the card" loading="lazy" className="h-full w-full object-cover" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions before ordering */}
      <section className="surface-pearl py-14 md:py-16 lg:py-[84px]" aria-labelledby="faq-home">
        <div className="container-x grid gap-8 lg:grid-cols-[38.2fr_61.8fr] lg:gap-16">
          <div>
            <Eyebrow className="mb-2 sm:mb-3">Before you order</Eyebrow>
            <h2 id="faq-home" className="text-[1.75rem] leading-tight sm:text-h2">Questions shops ask us</h2>
            <Link to="/faq" className="link mt-4 inline-flex min-h-11 items-center">All questions</Link>
          </div>
          <Accordion type="single" defaultOpen={["f1"]} items={faqs.map((f) => ({ id: f.id, title: f.q, body: <p>{f.a}</p> }))} />
        </div>
      </section>

    </>
  );
}
