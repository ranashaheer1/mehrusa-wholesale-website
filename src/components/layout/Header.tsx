import { onScrollFrame } from "@/lib/scrollBus";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import * as RDialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUp, BookOpen, ChevronDown, HelpCircle, LayoutGrid, Menu, MessageCircle, Search, ShoppingBag, Sparkles, X, Zap } from "lucide-react";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { isConfirmed, site, terms } from "@/config/terms";
import { t } from "@/i18n/strings";
import { tex, textures } from "@/lib/images";
import { waLink } from "@/lib/message";
import { downloadCatalogue } from "@/lib/export";
import { scrollToTarget } from "@/lib/smooth";
import { useListCount, useUI } from "@/store/list";
import { Logo, Mark } from "../ui/Brand";
import { ButtonA, ButtonLink } from "../ui/Button";
import { CatalogueButton } from "../ui/CatalogueButton";
import { EASE, Urdu } from "../ui/bits";
import { cn } from "@/utils/cn";

const countIn = (slug: string) => products.filter((p) => p.categorySlug === slug).length;
const leftLinks = [
  { to: "/start", label: "Start here" },
  { to: "/quick-order", label: "Quick order" },
];
const utilLinks = [
  { to: "/story", label: "Our story" },
  { to: "/standards", label: "Standards" },
  { to: "/terms", label: "Terms" },
  { to: "/contact", label: "Contact" },
];

export function AnnouncementBar() {
  // Only real information. Hidden until the owner confirms a line.
  if (!isConfirmed(terms.announcement)) return null;
  return (
    <div className="surface-deep border-b rule py-2 text-center text-[0.8125rem] tracking-[0.04em]">
      <div className="container-x">{terms.announcement}</div>
    </div>
  );
}

/** Desktop utility bar (not sticky): reassurance + secondary links. */
export function UtilityBar() {
  return (
    <div className="surface-deep hidden border-b border-pearl/10 text-[0.8125rem] lg:block">
      <div className="container-x flex h-9 items-center justify-between">
        <p className="flex items-center gap-3 text-pearl/70">
          <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden />Wholesale for shops across Pakistan
          <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden />Enquiry first, no payment online
        </p>
        <nav aria-label="Utility" className="flex items-center gap-5">
          {utilLinks.map((l) => <NavLink key={l.to} to={l.to} className={({ isActive }) => cn("text-pearl/70 hover:text-gold", isActive && "text-gold")}>{l.label}</NavLink>)}
          <Link to="/apply" className="border-l border-pearl/15 pl-5 text-gold-light hover:text-gold">Apply for wholesale</Link>
        </nav>
      </div>
    </div>
  );
}

function IconButton({ label, onClick, children, className, ...rest }: { label: string; onClick: () => void; children: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cn("grid h-11 w-11 place-items-center transition-colors duration-[250ms] hover:text-gold", className)} {...rest}>
      {children}
    </button>
  );
}

function ListButton({ className }: { className?: string }) {
  const count = useListCount();
  const open = useUI((s) => s.setListOpen);
  return (
    <button type="button" data-list-target onClick={() => open(true)} className={cn("group relative inline-flex min-h-11 items-center gap-2.5 border border-pearl/30 pl-4 pr-3 text-[0.875rem] font-medium transition-colors duration-[250ms] hover:border-gold", className)} aria-label={`My list, ${count} units`}>
      <ShoppingBag size={17} strokeWidth={1.4} aria-hidden />
      <span>{t.nav.list}</span>
      <span key={count} className={cn("num grid h-6 min-w-6 place-items-center px-1.5 text-[0.75rem] animate-[settle_382ms_var(--ease)]", count ? "bg-gold text-night-deep" : "border border-pearl/25 text-pearl/70")}>{count}</span>
    </button>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  const live = categories.filter((c) => c.status === "live");
  const soon = categories.filter((c) => c.status === "coming-soon");
  const [hover, setHover] = useState(live[0]);
  const openAssistant = useUI((s) => s.setAssistantOpen);
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -8 }}
      transition={{ duration: 0.382, ease: EASE }}
      className="surface-night absolute inset-x-0 top-full border-y rule shadow-[0_32px_64px_-32px_rgba(9,16,35,0.8)]"
      onMouseLeave={onClose}
    >
      <div className="container-x grid grid-cols-12 gap-8 py-10">
        <div className="col-span-3">
          <p className="eyebrow mb-4">Jewellery</p>
          <ul>
            <li><Link to="/shop" onClick={onClose} className="group flex items-center justify-between py-2 hover:text-gold">All pieces <span className="num text-[0.8125rem] opacity-60">{products.length}</span></Link></li>
            {live.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop/${c.slug}`} onClick={onClose} onMouseEnter={() => setHover(c)} onFocus={() => setHover(c)} className={cn("group flex items-center justify-between py-2 transition-colors duration-[250ms]", hover.slug === c.slug ? "text-gold" : "hover:text-gold")}>
                  <span className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rotate-45 transition-colors duration-[250ms]", hover.slug === c.slug ? "bg-gold" : "bg-transparent")} aria-hidden />
                    {c.name.en}
                  </span>
                  <span className="num text-[0.8125rem] opacity-60">{countIn(c.slug)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mb-3 mt-7">Clothing</p>
          <ul>
            {soon.map((c) => (
              <li key={c.slug}><Link to={`/shop/${c.slug}`} onClick={onClose} onMouseEnter={() => setHover(c)} className="flex items-center justify-between py-1.5 hover:text-gold">{c.name.en}<span className="text-[0.75rem] opacity-60">soon</span></Link></li>
            ))}
          </ul>
        </div>

        <div className="col-span-3">
          <p className="eyebrow mb-4">Shop by</p>
          <ul className="text-[0.9375rem]">
            {[["/shop?new=1", "New arrivals"], ["/shop/sets", "Gift sets"], ["/shop?for=eid", "Eid"], ["/shop?for=everyday", "Everyday"], ["/shop?colour=Gold-coloured", "Gold-coloured"], ["/shop?colour=Natural+steel", "Natural steel"]].map(([to, l]) => (
              <li key={to}><Link to={to} onClick={onClose} className="block py-1.5 hover:text-gold">{l}</Link></li>
            ))}
          </ul>
          <p className="eyebrow mb-3 mt-7">For buyers</p>
          <ul className="space-y-1 text-[0.9375rem]">
            <li><button type="button" onClick={() => { onClose(); openAssistant(true); }} className="flex items-center gap-2 py-1.5 text-gold-light hover:text-gold"><Sparkles size={15} strokeWidth={1.4} aria-hidden />Build my first order</button></li>
            <li><Link to="/quick-order" onClick={onClose} className="flex items-center gap-2 py-1.5 hover:text-gold"><Zap size={15} strokeWidth={1.4} aria-hidden />Quick order pad</Link></li>
            <li><Link to="/shop?view=table" onClick={onClose} className="flex items-center gap-2 py-1.5 hover:text-gold"><LayoutGrid size={15} strokeWidth={1.4} aria-hidden />Line sheet view</Link></li>
            <li><button type="button" onClick={() => downloadCatalogue()} className="flex items-center gap-2 py-1.5 hover:text-gold"><BookOpen size={15} strokeWidth={1.4} aria-hidden />Download catalogue</button></li>
          </ul>
        </div>

        {/* Live preview of the hovered category */}
        <Link to={`/shop/${hover.slug}`} onClick={onClose} className="group col-span-6 grid grid-cols-[1.2fr_1fr] gap-6">
          <div className="relative aspect-[4/5] overflow-hidden">
            <AnimatePresence mode="sync" initial={false}>
              <motion.img key={hover.slug} src={tex(hover.coverImage)} alt={`${hover.name.en}: ${textures[hover.coverImage].label.toLowerCase()}`} initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.618, ease: EASE }} className="absolute inset-0 h-full w-full object-cover" />
            </AnimatePresence>
            <span className="absolute inset-3 border border-gold/0 transition-colors duration-[618ms] group-hover:border-gold/70" aria-hidden />
          </div>
          <div className="flex flex-col justify-end pb-2">
            {hover.name.ur && <Urdu display as="p" className="text-left text-[1.75rem] leading-[2] text-gold">{hover.name.ur}</Urdu>}
            <p className="font-display text-h3">{hover.name.en}</p>
            <p className="mt-2 text-[0.9375rem] opacity-80">{hover.intro}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] text-gold-light">
              {hover.status === "live" ? `Shop ${countIn(hover.slug)} pieces` : "Opening soon"}
              <ArrowRight size={16} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" />
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const setSearch = useUI((s) => s.setSearchOpen);
  const setAssistant = useUI((s) => s.setAssistantOpen);
  const reduce = useReducedMotion();
  useEffect(() => setOpen(false), [loc.pathname, loc.search]);
  const item = (i: number) => ({ initial: { opacity: 0, y: reduce ? 0 : 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: reduce ? 0 : 0.05 + i * 0.035, ease: EASE } });
  const later = (fn: () => void) => { setOpen(false); setTimeout(fn, 250); };

  return (
    <RDialog.Root open={open} onOpenChange={setOpen}>
      <RDialog.Trigger className="grid h-11 w-11 place-items-center lg:hidden" aria-label="Open menu">
        <Menu size={22} strokeWidth={1.4} aria-hidden />
      </RDialog.Trigger>
      <RDialog.Portal>
        <RDialog.Content className="surface-deep fixed inset-0 z-[70] flex flex-col overflow-y-auto data-[state=open]:animate-[fadeIn_382ms_var(--ease)]" aria-describedby={undefined}>
          <RDialog.Title className="sr-only">Menu</RDialog.Title>
          <div className="container-x flex h-16 shrink-0 items-center justify-between border-b rule">
            <Logo />
            <RDialog.Close className="grid h-11 w-11 place-items-center" aria-label="Close menu"><X size={22} strokeWidth={1.4} aria-hidden /></RDialog.Close>
          </div>
          <nav className="container-x flex-1 py-6" aria-label="Mobile">
            <motion.div {...item(0)} className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => later(() => setSearch(true))} className="flex min-h-12 items-center gap-2 border border-pearl/20 px-3 text-[0.9375rem]"><Search size={17} strokeWidth={1.4} aria-hidden />Search</button>
              <button type="button" onClick={() => later(() => setAssistant(true))} className="flex min-h-12 items-center gap-2 border border-gold/50 px-3 text-[0.9375rem] text-gold-light"><Sparkles size={17} strokeWidth={1.4} aria-hidden />First order</button>
            </motion.div>

            <motion.p {...item(1)} className="eyebrow mb-3 mt-8">Shop</motion.p>
            <ul className="grid grid-cols-2 gap-2">
              {categories.map((c, i) => (
                <motion.li key={c.slug} {...item(2 + i)}>
                  <Link to={`/shop/${c.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                    <img decoding="async" src={tex(c.coverImage)} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <span className="absolute inset-0 bg-gradient-to-t from-night-deep/90 to-night-deep/10" />
                    <span className="absolute bottom-2 left-3 right-3">
                      <span className="block font-display text-[1.125rem] leading-tight">{c.name.en}</span>
                      <span className="num block text-[0.75rem] text-pearl/75">{c.status === "live" ? `${countIn(c.slug)} pieces` : t.openingSoon}</span>
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div {...item(10)}><Link to="/shop" className="mt-3 flex min-h-12 items-center justify-between border-b rule text-[1.0625rem]">All pieces <ArrowRight size={16} strokeWidth={1.4} aria-hidden /></Link></motion.div>

            <ul className="mt-6 grid grid-cols-2 gap-x-4">
              {[...leftLinks, { to: "/apply", label: "Apply" }, ...utilLinks, { to: "/packaging", label: "Packaging" }, { to: "/faq", label: "FAQ" }].map((l, i) => (
                <motion.li key={l.to} {...item(11 + i)} className="border-b rule"><Link to={l.to} className="block py-3.5 text-[1rem]">{l.label}</Link></motion.li>
              ))}
            </ul>
          </nav>
          <div className="container-x border-t rule py-5 pb-[max(20px,env(safe-area-inset-bottom))]">
            <ButtonA href={waLink("Assalam o alaikum Mehrusa, I have a wholesale question.")} target="_blank" rel="noopener noreferrer" className="w-full"><MessageCircle size={16} strokeWidth={1.4} aria-hidden />Message us on WhatsApp</ButtonA>
            <p className="tagline mt-5 text-center text-[1.25rem] text-gold-light">{site.tagline}</p>
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

function DeskLink({ to, children, onMouseEnter }: { to: string; children: React.ReactNode; onMouseEnter?: () => void }) {
  return (
    <NavLink to={to} onMouseEnter={onMouseEnter} className={({ isActive }) => cn("relative inline-flex min-h-11 items-center px-3 text-[0.9375rem] transition-colors duration-[250ms] hover:text-gold", isActive && "text-gold")}>
      {({ isActive }) => (
        <>
          {children}
          {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-3 bottom-1.5 h-px bg-gold" transition={{ duration: 0.382, ease: EASE }} />}
        </>
      )}
    </NavLink>
  );
}

export function Header() {
  const [mega, setMega] = useState(false);
  const loc = useLocation();
  const timer = useRef<number>(undefined);
  const progress = useRef<HTMLSpanElement>(null);
  const setSearch = useUI((s) => s.setSearchOpen);
  const setHelp = useUI((s) => s.setHelpOpen);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setMega(false), [loc.pathname, loc.search]);

  useEffect(() => {
    let last = window.scrollY;
    let hiddenNow = false;
    let scrolledNow = false;
    return onScrollFrame((y, max) => {
      // Only touch React state when a threshold is actually crossed
      let nextHidden = hiddenNow;
      if (y > last + 4 && y > 200) nextHidden = true;
      else if (y < last - 4 || y < 80) nextHidden = false;
      if (nextHidden !== hiddenNow) { hiddenNow = nextHidden; setHidden(nextHidden); }
      const nextScrolled = y > 24;
      if (nextScrolled !== scrolledNow) { scrolledNow = nextScrolled; setScrolled(nextScrolled); }
      // Compositor-only write: transform on a 1px line
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      last = y;
    });
  }, []);
  useEffect(() => { setHidden(false); }, [loc.pathname]);
  const isHidden = hidden && !mega;
  // A data attribute (targeted restyle) instead of a root CSS variable (full-page restyle)
  useEffect(() => {
    if (isHidden) document.documentElement.dataset.hdr = "hidden";
    else delete document.documentElement.dataset.hdr;
  }, [isHidden]);

  return (
    <header
      className={cn("surface-night sticky top-0 z-50 transition-transform duration-[382ms] ease-[var(--ease)] will-change-transform", isHidden && "-translate-y-full", scrolled && "shadow-[0_12px_32px_-20px_rgba(9,16,35,0.9)]")}
      onFocus={() => setHidden(false)}
      onKeyDown={(e) => e.key === "Escape" && setMega(false)}
    >
      <div className="container-x relative grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-[72px]">
        {/* Left */}
        <div className="flex items-center gap-1">
          <MobileMenu />
          <nav aria-label="Main" className="hidden items-center lg:flex">
            <div
              className="flex items-center"
              onMouseEnter={() => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setMega(true), 120); }}
              onMouseLeave={() => window.clearTimeout(timer.current)}
            >
              <DeskLink to="/shop">{t.nav.shop}</DeskLink>
              <button type="button" className="-ml-2 grid h-11 w-7 place-items-center hover:text-gold" aria-expanded={mega} aria-label="Show shop menu" onClick={() => setMega((m) => !m)}>
                <ChevronDown size={14} strokeWidth={1.5} aria-hidden className={cn("transition-transform duration-[382ms]", mega && "rotate-180")} />
              </button>
            </div>
            {leftLinks.map((l) => <DeskLink key={l.to} to={l.to} onMouseEnter={() => setMega(false)}>{l.label}</DeskLink>)}
          </nav>
        </div>

        {/* Centre: the mark and wordmark */}
        <Logo />

        {/* Right */}
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <button type="button" onClick={() => setSearch(true)} className="hidden min-h-11 items-center gap-2 px-3 text-[0.875rem] text-pearl/80 transition-colors duration-[250ms] hover:text-gold xl:inline-flex" aria-keyshortcuts="Control+K Meta+K /">
            <Search size={18} strokeWidth={1.4} aria-hidden />Search<kbd className="ml-1 border border-pearl/25 px-1.5 text-[0.6875rem] opacity-70">⌘K</kbd>
          </button>
          <IconButton label="Search the range" onClick={() => setSearch(true)} className="xl:hidden"><Search size={19} strokeWidth={1.4} aria-hidden /></IconButton>
          <IconButton label="Help and questions" onClick={() => setHelp(true)} className="hidden lg:grid"><HelpCircle size={19} strokeWidth={1.4} aria-hidden /></IconButton>
          <ListButton className="ml-1 hidden lg:inline-flex" />
        </div>
      </div>

      {/* Hairlines: base rule + gold reading progress */}
      <span className="absolute inset-x-0 bottom-0 h-px bg-pearl/10" aria-hidden />
      <span ref={progress} className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold-deep via-gold to-gold-light" aria-hidden />

      <AnimatePresence>{mega && <div className="hidden lg:block"><MegaMenu onClose={() => setMega(false)} /></div>}</AnimatePresence>
    </header>
  );
}

/** Mobile bottom bar: four thumb-sized tabs; the list is always one tap away. */
export function BottomBar() {
  const count = useListCount();
  const loc = useLocation();
  const openList = useUI((s) => s.setListOpen);
  const help = useUI((s) => s.setHelpOpen);
  const search = useUI((s) => s.setSearchOpen);
  const onShop = loc.pathname.startsWith("/shop") || loc.pathname.startsWith("/product");
  const tab = "relative flex min-h-[58px] flex-col items-center justify-center gap-1 text-[0.6875rem] tracking-[0.04em]";
  return (
    <nav aria-label="Quick actions" className="surface-deep fixed inset-x-0 bottom-0 z-40 border-t rule pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-4">
        <Link to="/shop" className={cn(tab, onShop ? "text-gold" : "text-pearl/80")} aria-current={onShop ? "page" : undefined}>
          {onShop && <span className="absolute top-0 h-[2px] w-8 bg-gold" aria-hidden />}
          <LayoutGrid size={19} strokeWidth={1.4} aria-hidden />Shop
        </Link>
        <button type="button" onClick={() => search(true)} className={cn(tab, "text-pearl/80")}><Search size={19} strokeWidth={1.4} aria-hidden />Search</button>
        <button type="button" data-list-target onClick={() => openList(true)} className={cn(tab, "text-pearl")} aria-label={`My list, ${count} units`}>
          <span className="relative">
            <ShoppingBag size={19} strokeWidth={1.4} aria-hidden />
            {count > 0 && <span key={count} className="num absolute -right-3 -top-2 grid h-[18px] min-w-[18px] place-items-center bg-gold px-1 text-[0.625rem] font-medium text-night-deep animate-[settle_382ms_var(--ease)]">{count > 999 ? "999+" : count}</span>}
          </span>
          My list
        </button>
        <button type="button" onClick={() => help(true)} className={cn(tab, "text-pearl/80")}><MessageCircle size={19} strokeWidth={1.4} aria-hidden />Help</button>
      </div>
    </nav>
  );
}

function FooterGroup({ title, links }: { title: string; links: { label: string; to?: string; onClick?: () => void; href?: string }[] }) {
  const [open, setOpen] = useState(false);
  const id = `fg-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <nav aria-labelledby={`${id}-h`} className="border-b border-pearl/10 md:border-0">
      <h2 id={`${id}-h`} className="m-0">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id} className="flex min-h-14 w-full items-center justify-between md:pointer-events-none md:min-h-0 md:pb-4">
          <span className="eyebrow">{title}</span>
          <ChevronDown size={16} strokeWidth={1.4} aria-hidden className={cn("transition-transform duration-[382ms] md:hidden", open && "rotate-180")} />
        </button>
      </h2>
      <ul id={id} className={cn("space-y-1 pb-4 text-[0.9375rem] md:block md:pb-0", open ? "block" : "hidden")}>
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? <Link to={l.to} className="group inline-flex min-h-9 items-center gap-2 text-pearl/80 hover:text-gold"><span className="h-px w-0 bg-gold transition-[width] duration-[382ms] group-hover:w-3" aria-hidden />{l.label}</Link>
              : l.href ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-9 items-center gap-2 text-pearl/80 hover:text-gold"><span className="h-px w-0 bg-gold transition-[width] duration-[382ms] group-hover:w-3" aria-hidden />{l.label}</a>
              : <button type="button" onClick={l.onClick} className="group inline-flex min-h-9 items-center gap-2 text-left text-pearl/80 hover:text-gold"><span className="h-px w-0 bg-gold transition-[width] duration-[382ms] group-hover:w-3" aria-hidden />{l.label}</button>}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const openAssistant = useUI((s) => s.setAssistantOpen);
  const openHelp = useUI((s) => s.setHelpOpen);
  const reduce = useReducedMotion();
  const promises = [
    ["We say what it is", "Stainless steel, never called gold"],
    ["No pressure", "No timers, no stock games"],
    ["Enquiry first", "Pay only after we confirm"],
    ["Nothing stored", "Your list stays in your browser"],
  ];

  return (
    <footer className="surface-deep grain relative overflow-hidden pb-[76px] lg:pb-0">
      {/* Call to action, on every page */}
      <section className="border-y border-pearl/10" aria-labelledby="footer-cta">
        <div className="container-x grid items-center gap-8 py-12 lg:grid-cols-[61.8fr_38.2fr] lg:py-16">
          <div>
            <p className="eyebrow mb-3">Ready to stock Mehrusa?</p>
            <h2 id="footer-cta" className="max-w-[22ch] font-display text-[1.875rem] leading-tight sm:text-h2">Start with one list. We will take care of the rest.</h2>
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap lg:justify-end">
            <ButtonLink to="/shop" className="w-full sm:w-auto">{t.browse}</ButtonLink>
            <button type="button" onClick={() => openAssistant(true)} className="inline-flex min-h-12 items-center justify-center gap-2 border border-gold/50 px-5 text-[0.9375rem] text-gold-light transition-colors duration-[250ms] hover:border-gold hover:text-gold"><Sparkles size={16} strokeWidth={1.4} aria-hidden />Build my first order</button>
          </div>
        </div>
      </section>

      {/* Promises */}
      <ul className="container-x grid grid-cols-2 gap-x-6 gap-y-5 border-b border-pearl/10 py-8 lg:grid-cols-4" aria-label="Our promises">
        {promises.map(([h, d]) => (
          <li key={h} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rotate-45 border border-gold" aria-hidden />
            <span><span className="block text-[0.9375rem] font-medium">{h}</span><span className="block text-[0.8125rem] text-pearl/65">{d}</span></span>
          </li>
        ))}
      </ul>

      {/* Columns */}
      <div className="container-x grid gap-x-8 py-10 md:grid-cols-4 md:gap-y-10 lg:grid-cols-12 lg:py-14">
        <div className="pb-8 md:col-span-4 lg:col-span-4 lg:pb-0">
          <div className="flex items-center gap-3"><Mark variant="foil" size={40} /><span className="wordmark text-[1.25rem]">Mehrusa</span></div>
          <p className="tagline mt-5 text-[1.5rem] text-gold-light">{site.tagline}</p>
          <p className="mt-3 max-w-[40ch] text-[0.9375rem] text-pearl/75">Modest stainless steel jewellery, wholesale for boutiques, online stores and gifting companies. Abayas and unstitched, opening soon.</p>
          <CatalogueButton className="mt-4 text-gold-light" />
        </div>
        <div className="md:col-span-1 lg:col-span-2"><FooterGroup title="Shop" links={[{ label: "All pieces", to: "/shop" }, ...categories.map((c) => ({ label: c.status === "live" ? c.name.en : `${c.name.en} (soon)`, to: `/shop/${c.slug}` }))]} /></div>
        <div className="md:col-span-1 lg:col-span-2"><FooterGroup title="Buying" links={[{ label: "Start here", to: "/start" }, { label: "Build my first order", onClick: () => openAssistant(true) }, { label: "Quick order pad", to: "/quick-order" }, { label: "My list", to: "/list" }, { label: "Apply for wholesale", to: "/apply" }, { label: "Terms", to: "/terms" }]} /></div>
        <div className="md:col-span-1 lg:col-span-2"><FooterGroup title="Mehrusa" links={[{ label: "Our story", to: "/story" }, { label: "Our standards", to: "/standards" }, { label: "Packaging", to: "/packaging" }, { label: "Journal", to: "/journal" }]} /></div>
        <div className="md:col-span-1 lg:col-span-2"><FooterGroup title="Help" links={[{ label: "Questions", to: "/faq" }, { label: "Contact", to: "/contact" }, { label: "Ask on WhatsApp", href: waLink("Assalam o alaikum Mehrusa, I have a wholesale question.") }, { label: "Reading comfort", onClick: () => openHelp(true) }]} /></div>
      </div>

      {/* The wordmark rises into view, letter by letter */}
      <div className="container-x overflow-hidden" aria-hidden>
        <p className="wordmark flex select-none justify-center whitespace-nowrap text-[15vw] leading-[0.85] lg:text-[12.5vw]" style={{ letterSpacing: "0.2em", marginRight: "-0.2em" }}>
          {"MEHRUSA".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="foil-text inline-block opacity-40"
              initial={{ y: reduce ? 0 : "60%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 0.4 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 1, delay: reduce ? 0 : i * 0.06, ease: EASE }}
            >
              {ch}
            </motion.span>
          ))}
        </p>
      </div>

      {/* Base */}
      <div className="container-x flex flex-col gap-3 border-t border-pearl/10 py-6 text-[0.8125rem] text-pearl/65 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Mehrusa · {site.signOff}</p>
        <p>Stainless steel jewellery. Not gold, not precious metal.</p>
        <button type="button" onClick={() => scrollToTarget(0)} className="inline-flex min-h-11 items-center gap-2 self-start hover:text-gold md:self-auto">Back to top <ArrowUp size={14} strokeWidth={1.4} aria-hidden /></button>
      </div>
    </footer>
  );
}
