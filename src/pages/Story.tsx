import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { scrollToTarget } from "@/lib/smooth";
import type { MotionValue } from "motion/react";
import { site } from "@/config/terms";
import { ur } from "@/i18n/strings";
import { tex, type TextureKey } from "@/lib/images";
import { useUI } from "@/store/list";
import { Mark } from "@/components/ui/Brand";
import { ButtonLink } from "@/components/ui/Button";
import { LivingJali } from "@/components/home/LivingJali";
import { EASE, Eyebrow, Reveal, Urdu, usePageMeta } from "@/components/ui/bits";
import { cn } from "@/utils/cn";

const chapters: { ur: string; en: string; title: string; body: string; img: TextureKey }[] = [
  { ur: "مہر", en: "Mehr", title: "Love, the sun, the bridal gift.", body: "Mehr is warmth given freely. It is the sun on a winter courtyard, and the promise a bride is given and keeps.", img: "chaand-raat-sky" },
  { ur: "محروسہ", en: "Mahroosa", title: "Protected. Guarded. Kept.", body: "Mahroosa is what is looked after with care: a garden behind a jali, a letter folded and kept close.", img: "mahroosa-jali" },
  { ur: "حیا", en: "Haya", title: "Modesty is a shine of its own.", body: "We make for girls and women who wear their modesty with quiet confidence. Nothing loud. Nothing to prove.", img: "velvet-fabric" },
  { ur: "تاج", en: "Taj", title: "Protected first, then crowned.", body: "First the care, then the light. Every piece is meant to feel kept before it is ever worn.", img: "gold-foil" },
];

const vocabulary: [string, string, string][] = [
  ["Mehr", "مہر", "Love given freely; the bridal gift"],
  ["Mahroosa", "محروسہ", "Protected, guarded, kept"],
  ["Haya", "حیا", "Modesty, worn as a quiet shine"],
  ["Taj", "تاج", "The crown that comes after care"],
  ["Jali", "جالی", "A carved screen that lets light through"],
  ["Raat", "رات", "Night: our midnight ground colour"],
];

const markNotes = [
  { x: 50, y: 18, t: "The crown", d: "The diamond above: light that comes after care." },
  { x: 12, y: 50, t: "The wings", d: "Two sides that close in to guard what is kept." },
  { x: 50, y: 74, t: "The drop", d: "Haya at the heart: a single, quiet shine." },
  { x: 35, y: 42, t: "The arms", d: "An embrace that meets in the middle and holds." },
];

/** Words brighten one by one as the line scrolls through the viewport (opacity only). */
function LitWord({ word, progress, range, accent }: { word: string; progress: MotionValue<number>; range: [number, number]; accent?: boolean }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <motion.span style={{ opacity }} className={cn("mr-[0.25em] inline-block", accent && "text-gold-deep")}>{word}</motion.span>;
}

function ScrollLit({ text, accentFrom }: { text: string; accentFrom: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  if (reduce) return <p className="tagline mx-auto max-w-[22ch] text-center text-[2rem] leading-[1.2] sm:text-h1">{text}</p>;
  return (
    <p ref={ref} className="tagline mx-auto max-w-[22ch] text-center text-[2rem] leading-[1.2] sm:text-h1" aria-label={text}>
      <span aria-hidden>
        {words.map((w, i) => <LitWord key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={i >= accentFrom} />)}
      </span>
    </p>
  );
}

const sections = [
  ["s-name", "Name"], ["s-chapters", "Chapters"], ["s-mark", "Mark"], ["s-words", "Words"], ["s-next", "Next"], ["s-colours", "Colours"], ["s-promises", "Promises"], ["s-note", "Note"],
] as const;

/** Sticky chapter index with scrollspy. */
function StoryIndex() {
  const [cur, setCur] = useState<string>("s-name");
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setCur(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-id="${cur}"]`);
    if (list && el) list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [cur]);
  return (
    <nav aria-label="Story sections" className="surface-deep sticky top-16 lg:top-[72px] follow-hdr z-20 border-b border-pearl/10 ">
      <ul ref={listRef} className="container-x no-scrollbar flex gap-1 overflow-x-auto">
        {sections.map(([id, label], i) => (
          <li key={id} className="shrink-0" data-id={id}>
            <a href={`#/story`} onClick={(e) => { e.preventDefault(); const el = document.getElementById(id); if (el) scrollToTarget(el, { offset: -110 }); }} aria-current={cur === id ? "true" : undefined}
              className={cn("relative inline-flex min-h-11 items-center gap-2 px-3 text-[0.8125rem] tracking-[0.04em] transition-colors duration-[382ms]", cur === id ? "text-pearl" : "text-pearl/55 hover:text-pearl/85")}>
              <span className="num text-[0.6875rem] text-gold/80">{String(i + 1).padStart(2, "0")}</span>{label}
              {cur === id && <motion.span layoutId="story-index" className="absolute inset-x-3 bottom-0 h-[2px] bg-gold" transition={{ duration: 0.382, ease: EASE }} />}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Chapter({ i, onActive }: { i: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => { if (inView) onActive(i); }, [inView, i, onActive]);
  const c = chapters[i];
  return (
    <div ref={ref} className="relative flex min-h-[72vh] flex-col justify-center py-14 lg:min-h-screen lg:py-20">
      {/* Calligraphy watermark */}
      <Urdu display as="span" className="pointer-events-none absolute -top-2 right-0 select-none text-[7rem] leading-none text-gold/[0.07] sm:text-[10rem] lg:text-[13rem]" aria-hidden>{c.ur}</Urdu>
      <Reveal>
        <p className="eyebrow flex items-center gap-3"><span className="num">{String(i + 1).padStart(2, "0")}</span><span className="h-px w-8 bg-gold" aria-hidden />{c.en}</p>
        <Urdu display className="mt-3 text-left text-[2.75rem] leading-[1.9] text-gold sm:text-h1" as="p">{c.ur}</Urdu>
        <h2 className="mt-1 font-display text-[1.875rem] leading-tight sm:text-h2">{c.title}</h2>
        <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-relaxed opacity-90 sm:text-lead">{c.body}</p>
      </Reveal>
      <div className="mt-8 aspect-[4/3] overflow-hidden lg:hidden"><img decoding="async" src={tex(c.img)} alt="" className="h-full w-full object-cover" loading="lazy" /></div>
    </div>
  );
}

export default function Story() {
  usePageMeta("Our story", "Mehrusa: from Mehr, love and the bridal gift, and Mahroosa, protected and kept. Veiled in grace. Crowned in light.");
  const [active, setActive] = useState(0);
  const [hue, setHue] = useState(0);
  const reduce = useReducedMotion();
  const openAssistant = useUI((s) => s.setAssistantOpen);
  const heroRef = useRef<HTMLElement>(null);
  const chaptersRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const markInView = useInView(markRef, { once: true, margin: "-20% 0px" });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroFade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 80]);
  const { scrollYProgress: chProg } = useScroll({ target: chaptersRef, offset: ["start center", "end center"] });
  const railH = useTransform(chProg, [0, 1], ["0%", "100%"]);

  const palette = [
    { name: "Raat Neelam", sub: "Midnight sapphire · ground", pct: 61.8, color: "#0F1938", role: "The night that holds everything. Our ground colour: the box, the pages, the quiet behind every piece." },
    { name: "Moti", sub: "Pearl ivory · space", pct: 23.6, color: "#F4F0E6", role: "Pearl is breathing room: tissue paper, the card, the calm space around words." },
    { name: "Sona", sub: "Antique gold · detail", pct: 9, color: "#C7A04D", role: "The only bright thing on the page. Used for fine rules, numbers and the mark, never poured on." },
    { name: "Laal", sub: "Ruby rose · heart", pct: 5.6, color: "#B54540", role: "The heart, used rarely: a seal, a single word, a moment of warmth." },
  ];
  const promises = [
    ["We say what it is.", "Stainless steel is stainless steel. We never call it gold, fine jewellery or precious."],
    ["We do not rush you.", "No ticking timers and no pressure about stock. If a batch is limited, we say so plainly."],
    ["We mark what we do not know yet.", "Until a fact is confirmed, it is shown as to be confirmed, not guessed."],
    ["Nothing is taken from you here.", "No payment, no account, no data stored. Your list goes to us only when you send it."],
  ];

  return (
    <>
      {/* 1. The name, as an equation */}
      <section id="s-name" ref={heroRef} className="surface-deep grain relative overflow-hidden" aria-labelledby="story-title">
        <img decoding="async" src={tex("mahroosa-jali")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.06]" />
        <LivingJali />
        <motion.div style={{ opacity: heroFade, y: heroY }} className="container-x relative flex min-h-[calc(100svh-64px)] flex-col justify-center py-16 lg:min-h-[calc(100vh-72px)]">
          <p className="rise-in eyebrow flex items-center gap-3" style={{ animationDelay: "100ms" }}><span className="h-px w-10 bg-gold" aria-hidden />Our story</p>
          <h1 id="story-title" className="sr-only">Mehr and Mahroosa make Mehrusa</h1>

          <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[1fr_auto_1fr] lg:items-end lg:gap-10" aria-hidden>
            <div className="rise-in" style={{ animationDelay: "300ms" }}>
              <Urdu display as="p" className="text-left text-[2rem] leading-[1.9] text-gold sm:text-h2">مہر</Urdu>
              <p className="font-display text-[3rem] leading-none text-pearl sm:text-[4.5rem] lg:text-[5.5rem]">Mehr</p>
              <p className="mt-3 text-[0.9375rem] tracking-[0.04em] text-pearl/70">love · the sun · the bridal gift</p>
            </div>
            <p className="rise-in font-display text-[2.5rem] leading-none text-gold lg:pb-10 lg:text-h1" style={{ animationDelay: "550ms" }}>+</p>
            <div className="rise-in" style={{ animationDelay: "750ms" }}>
              <Urdu display as="p" className="text-left text-[2rem] leading-[1.9] text-gold sm:text-h2">محروسہ</Urdu>
              <p className="font-display text-[3rem] leading-none text-pearl sm:text-[4.5rem] lg:text-[5.5rem]">Mahroosa</p>
              <p className="mt-3 text-[0.9375rem] tracking-[0.04em] text-pearl/70">protected · guarded · kept</p>
            </div>
          </div>

          <div className="rise-in mt-10 flex items-center gap-4 sm:mt-12" style={{ animationDelay: "1050ms" }} aria-hidden>
            <span className="h-px flex-1 bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0" />
            <span className="h-2 w-2 rotate-45 bg-gold" />
            <span className="h-px flex-1 bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0" />
          </div>

          <div className="rise-in mt-8 text-center sm:mt-10" style={{ animationDelay: "1300ms" }}>
            <p className="wordmark foil-text text-[2.75rem] leading-none sm:text-[4.5rem] lg:text-[6rem]" style={{ marginRight: "-0.2em" }} aria-hidden>MEHRUSA</p>
            <p className="tagline mt-5 text-[1.5rem] text-gold-light sm:text-h3">{site.tagline}</p>
          </div>
          <p className="rise-in mt-12 text-center text-[0.75rem] uppercase tracking-[0.14em] text-pearl/50" style={{ animationDelay: "1700ms" }}>Scroll to read</p>
        </motion.div>
      </section>

      <StoryIndex />

      {/* 2. Opening statement, lit word by word on scroll */}
      <section className="surface-pearl py-20 sm:py-24 lg:py-[140px]" aria-label="Who we make for">
        <div className="container-x">
          <ScrollLit text="We make for girls and women who see modesty as a shine of their own." accentFrom={10} />
          <Reveal><Urdu display className="mt-8 text-center text-h4 text-gold-deep">{ur.haya}</Urdu></Reveal>
        </div>
      </section>

      {/* 3. Chapters */}
      <section id="s-chapters" ref={chaptersRef} className="surface-night relative" aria-label="The meaning of the name">
        <div className="container-x grid lg:grid-cols-[38.2fr_61.8fr] lg:gap-16">
          <div className="hidden lg:block">
            <div className="sticky top-[116px] flex h-[calc(100vh-116px)] items-center gap-8">
              {/* Chapter rail */}
              <div className="relative h-[52vh] w-px bg-pearl/15" aria-hidden>
                <motion.div className="absolute inset-x-0 top-0 bg-gold" style={{ height: railH }} />
                {chapters.map((c, i) => (
                  <span key={c.en} className="absolute -left-[5px] flex items-center" style={{ top: `${(i / (chapters.length - 1)) * 100}%` }}>
                    <span className={cn("h-[11px] w-[11px] rotate-45 border transition-colors duration-[618ms]", i <= active ? "border-gold bg-gold" : "border-pearl/40 bg-night")} />
                    <span className={cn("ml-4 whitespace-nowrap text-[0.75rem] uppercase tracking-[0.12em] transition-opacity duration-[618ms]", i === active ? "opacity-100" : "opacity-40")}>{c.en}</span>
                  </span>
                ))}
              </div>
              <div className="relative ml-16 aspect-[4/5] flex-1 overflow-hidden border hairline-gold">
                <AnimatePresence mode="sync">
                  <motion.img key={active} src={tex(chapters[active].img)} alt="" initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: EASE }} className="absolute inset-0 h-full w-full object-cover" />
                </AnimatePresence>
                <div className="absolute inset-0 bg-night-deep/30" />
                <Urdu display as="span" className="absolute bottom-4 right-5 text-[2.5rem] leading-[1.8] text-gold-light" aria-hidden>{chapters[active].ur}</Urdu>
              </div>
            </div>
          </div>
          <div>{chapters.map((_, i) => <Chapter key={i} i={i} onActive={setActive} />)}</div>
        </div>
      </section>

      {/* 4. How we read the mark */}
      <section id="s-mark" className="surface-deep grain relative overflow-hidden py-16 sm:py-20 lg:py-[120px]" aria-labelledby="mark-title">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div ref={markRef} className="relative mx-auto w-full max-w-[420px]">
            <div className="relative p-[12%]">
              <span className="absolute inset-0 rotate-45 scale-[0.72] border border-gold/30" aria-hidden />
              <Mark variant="foil" size={420} fluid decorative={false} />
              {markNotes.map((n, i) => (
                <motion.span
                  key={n.t}
                  className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center"
                  style={{ left: `calc(12% + ${n.x * 0.76}%)`, top: `calc(12% + ${n.y * 0.76}%)` }}
                  initial={{ opacity: 0 }}
                  animate={markInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.618, delay: reduce ? 0 : 0.4 + i * 0.25, ease: EASE }}
                  aria-hidden
                >
                  <span className="absolute h-7 w-7 rotate-45 border border-pearl bg-night-deep/80" />
                  <span className="num relative text-[0.75rem] text-pearl">{i + 1}</span>
                </motion.span>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow className="mb-3">The mark</Eyebrow>
            <h2 id="mark-title" className="font-display text-[1.875rem] leading-tight sm:text-h2">How we read the mark</h2>
            <p className="mt-4 max-w-[48ch] opacity-85">One shape, two ideas: kept safe, then crowned in light.</p>
            <figure className="mt-6 border-l-2 border-gold pl-4">
              <Urdu display as="p" className="text-left text-[1.75rem] leading-[2] text-gold">{ur.protected}</Urdu>
              <figcaption className="text-[0.875rem] text-pearl/65">Protected first, then crowned.</figcaption>
            </figure>
            <ol className="mt-8 space-y-5">
              {markNotes.map((n, i) => (
                <Reveal key={n.t} delay={i * 0.06}>
                  <li className="flex gap-4 border-t border-pearl/12 pt-4">
                    <span className="relative mt-0.5 grid h-7 w-7 shrink-0 place-items-center" aria-hidden><span className="absolute h-6 w-6 rotate-45 border border-gold" /><span className="num relative text-[0.75rem] text-gold">{i + 1}</span></span>
                    <span><span className="block font-medium">{n.t}</span><span className="block text-[0.9375rem] opacity-80">{n.d}</span></span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5. A small vocabulary */}
      <section id="s-words" className="surface-pearl py-16 sm:py-20 lg:py-[84px]" aria-labelledby="vocab">
        <div className="container-x">
          <Eyebrow className="mb-3">A small vocabulary</Eyebrow>
          <h2 id="vocab" className="max-w-[20ch] font-display text-[1.875rem] leading-tight sm:text-h2">The words we keep close.</h2>
          <dl className="mt-10 grid grid-cols-1 border-l border-t rule sm:grid-cols-2 lg:grid-cols-3">
            {vocabulary.map(([en, u, d], i) => (
              <Reveal key={en} delay={(i % 3) * 0.06} className="border-b border-r rule">
                <div className="group flex h-full flex-col p-6 transition-colors duration-[618ms] hover:bg-pearl-light lg:p-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="font-display text-h3">{en}</dt>
                    <Urdu display as="span" className="text-[1.75rem] leading-[1.9] text-gold-deep">{u}</Urdu>
                  </div>
                  <dd className="mt-2 opacity-85">{d}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* 6. Now and next */}
      <section id="s-next" className="surface-night py-16 sm:py-20 lg:py-[84px]" aria-labelledby="next">
        <div className="container-x">
          <Eyebrow className="mb-3">Now and next</Eyebrow>
          <h2 id="next" className="max-w-[22ch] font-display text-[1.875rem] leading-tight sm:text-h2">Begun with jewellery. Growing with care.</h2>
          <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
            <span className="absolute left-[13px] top-2 bottom-2 w-px bg-pearl/15 md:left-0 md:right-0 md:top-[13px] md:bottom-auto md:h-px md:w-auto" aria-hidden />
            {[
              { t: "Jewellery", s: "Now", d: "Stainless steel rings, earrings, necklaces, pendants, bracelets and gift sets.", to: "/shop", live: true },
              { t: "Abayas", s: "Opening soon", d: "Abayas, stitched with care, in a considered size run.", to: "/shop/abayas" },
              { t: "Unstitched", s: "Opening soon", d: "Women's unstitched suits, sold by the suit and colourway.", to: "/shop/unstitched" },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 0.08}>
                <li className="relative pl-12 md:pl-0 md:pt-12">
                  <span className="absolute left-0 top-0 grid h-7 w-7 place-items-center" aria-hidden>
                    <span className={cn("absolute h-5 w-5 rotate-45 border", x.live ? "border-gold bg-gold" : "border-pearl/50 bg-night")} />
                  </span>
                  <p className={cn("text-[0.75rem] uppercase tracking-[0.12em]", x.live ? "text-gold" : "text-pearl/60")}>{x.s}</p>
                  <p className="mt-1 font-display text-h3">{x.t}</p>
                  <p className="mt-2 max-w-[34ch] opacity-80">{x.d}</p>
                  <Link to={x.to} className="group mt-3 inline-flex min-h-11 items-center gap-2 text-gold-light">{x.live ? "Shop the range" : "Tell me when it opens"}<ArrowRight size={15} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" /></Link>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Palette, interactive */}
      <section id="s-colours" className="surface-pearl py-16 sm:py-20 lg:py-[84px]" aria-labelledby="colours">
        <div className="container-x">
          <Eyebrow className="mb-3">Raat Neelam</Eyebrow>
          <h2 id="colours" className="max-w-[22ch] font-display text-[1.875rem] leading-tight sm:text-h2">A night sky, measured by the golden ratio.</h2>
          <p className="mt-4 max-w-[56ch] opacity-90 sm:text-lead">Every Mehrusa page follows the same proportion. Gold is the only bright thing on it. Tap a colour.</p>
          <div className="mt-10 flex h-24 w-full border rule sm:h-28 lg:h-36" role="tablist" aria-label="Brand colours">
            {palette.map((c, i) => (
              <motion.button
                key={c.name}
                type="button"
                role="tab"
                aria-selected={hue === i}
                aria-label={`${c.name}, ${c.pct}%`}
                onClick={() => setHue(i)}
                className="relative h-full origin-left outline-offset-[-3px]"
                style={{ width: `${c.pct}%`, background: c.color }}
                initial={{ scaleX: reduce ? 1 : 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.12, ease: EASE }}
              >
                {hue === i && <motion.span layoutId="hue-mark" className="absolute inset-x-0 -bottom-[7px] mx-auto h-3 w-3 rotate-45 border border-night bg-gold" transition={{ duration: 0.382, ease: EASE }} />}
              </motion.button>
            ))}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr] md:items-start" role="tabpanel" aria-live="polite">
            <div key={hue} className="animate-[settle_382ms_var(--ease)]">
              <p className="font-display text-h3">{palette[hue].name}</p>
              <p className="opacity-80">{palette[hue].sub}</p>
              <p className="num mt-1 text-h4 text-gold-deep">{palette[hue].pct}%</p>
            </div>
            <p key={`d-${hue}`} className="max-w-[56ch] animate-[settle_382ms_var(--ease)] opacity-90 sm:text-lead">{palette[hue].role}</p>
          </div>
        </div>
      </section>

      {/* 8. Promises */}
      <section id="s-promises" className="surface-light border-t rule py-16 sm:py-20 lg:py-[84px]" aria-labelledby="promises">
        <div className="container-x grid gap-10 lg:grid-cols-[38.2fr_61.8fr] lg:gap-12">
          <div>
            <Eyebrow className="mb-3">Our promises to you</Eyebrow>
            <h2 id="promises" className="font-display text-[1.875rem] leading-tight sm:text-h2">Quiet, careful, honest.</h2>
            <Urdu display className="mt-3 text-left text-h4 text-gold-deep">{ur.careKept}</Urdu>
          </div>
          <ol className="grid gap-8 sm:grid-cols-2">
            {promises.map(([title, d], i) => (
              <li key={title}>
                <Reveal delay={i * 0.06}>
                  <p className="num font-display text-h3 text-gold-deep">0{i + 1}</p>
                  <h3 className="mt-2 font-sans text-[1.125rem] font-medium">{title}</h3>
                  <p className="mt-2 opacity-90">{d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 9. A note from us, on pearl paper */}
      <section id="s-note" className="surface-pearl relative overflow-hidden py-16 sm:py-20 lg:py-[120px]" aria-labelledby="note">
        <img decoding="async" src={tex("pearl-cotton-paper")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" loading="lazy" />
        <div className="container-x relative">
          <Reveal>
            <article className="mx-auto max-w-2xl border hairline-gold bg-pearl-light/85 p-6 sm:p-10 lg:p-14">
              <Eyebrow className="mb-4">A note from us</Eyebrow>
              <h2 id="note" className="tagline text-[2rem] leading-tight sm:text-h2">To the shops who keep our pieces,</h2>
              <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed opacity-90">
                <p>We started Mehrusa for the woman who dresses with care and wants her jewellery to feel the same: quiet, honest, and hers.</p>
                <p>You know her better than we do. She walks into your shop, scrolls your page, asks you what is new. We want what you hand her to feel kept, from the pearl tissue to the midnight box.</p>
                <p>So we promise to tell you plainly what each piece is, to never rush you, and to answer you like family would.</p>
              </div>
              <div className="mt-8 flex items-center gap-4 border-t rule pt-6">
                <Mark variant="paper" size={36} />
                <div>
                  <p className="tagline text-[1.5rem] leading-none">With mehr,</p>
                  <p className="wordmark mt-1 text-[0.875rem]">Mehrusa</p>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* 10. Closing */}
      <section className="surface-deep grain relative overflow-hidden border-t rule">
        <div className="container-x flex flex-col items-center py-20 text-center lg:py-[120px]">
          <Mark variant="foil" size={44} />
          <p className="tagline mt-6 text-[2rem] text-gold-light sm:text-h2">{site.signOff}</p>
          <p className="mt-4 max-w-[44ch] opacity-85">If this feels like your shop's kind of jewellery, we would be glad to send it to you.</p>
          <div className="mt-8 grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap sm:justify-center">
            <ButtonLink to="/shop" className="w-full sm:w-auto">Browse the range</ButtonLink>
            <button type="button" onClick={() => openAssistant(true)} className="inline-flex min-h-12 items-center justify-center gap-2 border border-gold/50 px-5 text-[0.9375rem] text-gold-light transition-colors duration-[250ms] hover:border-gold hover:text-gold"><Sparkles size={16} strokeWidth={1.4} aria-hidden />Build my first order</button>
          </div>
          <button type="button" onClick={async () => { try { if (navigator.share) await navigator.share({ title: "The Mehrusa story", url: location.href }); else { await navigator.clipboard.writeText(location.href); toast("Link copied."); } } catch { /* closed */ } }} className="mt-6 inline-flex min-h-11 items-center gap-2 text-[0.875rem] text-pearl/70 hover:text-gold">
            <Share2 size={15} strokeWidth={1.4} aria-hidden />Share our story
          </button>
        </div>
      </section>
    </>
  );
}
