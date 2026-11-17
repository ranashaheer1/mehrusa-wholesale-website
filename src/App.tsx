import { onScrollFrame } from "@/lib/scrollBus";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { HashRouter, Outlet, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { QuickView } from "@/components/catalogue/QuickView";
import { CommandSearch } from "@/components/search/CommandSearch";
import { HelpCenter } from "@/components/help/HelpCenter";
import { CompareTray } from "@/components/compare/Compare";
import { SentDialog } from "@/components/list/SentDialog";
import { OrderAssistant } from "@/components/assistant/OrderAssistant";
import { usePrefs } from "@/store/prefs";
import { scrollToTarget, startSmoothScroll, stopSmoothScroll } from "@/lib/smooth";
import "lenis/dist/lenis.css";
import { AnnouncementBar, BottomBar, Footer, Header, UtilityBar } from "@/components/layout/Header";
import { ListDrawer } from "@/components/list/ListDrawer";
import { site } from "@/config/terms";
import Home from "@/pages/Home";

/* Route-level code splitting. (With the single-file build these are inlined; on a normal
   static deploy, remove vite-plugin-singlefile and they become separate chunks.) */
const Shop = lazy(() => import("@/pages/Shop"));
const ProductPage = lazy(() => import("@/pages/Product"));
const ListPage = lazy(() => import("@/pages/List"));
const QuickOrder = lazy(() => import("@/pages/QuickOrder"));
const Start = lazy(() => import("@/pages/Start"));
const Story = lazy(() => import("@/pages/Story"));
import { FlyLayer } from "@/components/ui/FlyLayer";
const Apply = lazy(() => import("@/pages/Apply"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const content = () => import("@/pages/Content");
const Standards = lazy(() => content().then((m) => ({ default: m.Standards })));
const Packaging = lazy(() => content().then((m) => ({ default: m.Packaging })));
const Terms = lazy(() => content().then((m) => ({ default: m.Terms })));
const FAQ = lazy(() => content().then((m) => ({ default: m.FAQ })));
const Contact = lazy(() => content().then((m) => ({ default: m.Contact })));
const Journal = lazy(() => content().then((m) => ({ default: m.Journal })));

/** New pages start at the top; Back/Forward returns to where the buyer was. */
const scrollMemory = new Map<string, number>();
function ScrollTop() {
  const loc = useLocation();
  const nav = useNavigationType();
  const lastPath = useRef(loc.pathname);
  useEffect(() => {
    const key = loc.key;
    const off = onScrollFrame((y) => scrollMemory.set(key, y));
    return () => { scrollMemory.set(key, window.scrollY); off(); };
  }, [loc.key]);
  useEffect(() => {
    const pathChanged = lastPath.current !== loc.pathname;
    lastPath.current = loc.pathname;
    if (nav !== "POP") { if (pathChanged) scrollToTarget(0, { immediate: true }); return; }
    const target = scrollMemory.get(loc.key) ?? 0;
    let tries = 0;
    const tick = () => {
      scrollToTarget(target, { immediate: true });
      if (Math.abs(window.scrollY - target) > 4 && tries++ < 20) setTimeout(tick, 50);
    };
    setTimeout(tick, 280);
  }, [loc.key, nav]);
  return null;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let cur = false;
    return onScrollFrame((y) => { const next = y > 1400; if (next !== cur) { cur = next; setShow(next); } });
  }, []);
  return (
    <button type="button" onClick={() => scrollToTarget(0)} aria-label="Back to top" tabIndex={show ? 0 : -1}
      className={`surface-night fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 z-30 grid h-11 w-11 place-items-center border hairline-gold transition-opacity duration-[382ms] lg:bottom-24 lg:right-6 ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <ArrowUp size={18} strokeWidth={1.4} aria-hidden />
    </button>
  );
}

function Page() {
  const { pathname } = useLocation();
  return (
    <>
    <motion.div key={`bar-${pathname}`} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[99] h-[2px] w-full origin-left bg-gradient-to-r from-gold-deep via-gold-light to-gold" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: [1, 1, 0] }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], times: [0, 0.7, 1] }} />
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
        <Outlet />
      </motion.div>
    </AnimatePresence>
    </>
  );
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to content</a>
      <AnnouncementBar />
      <UtilityBar />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<div className="surface-pearl min-h-[60vh]" aria-busy="true" />}>
          <Page />
        </Suspense>
      </main>
      <Footer />
      <BottomBar />
      <ListDrawer />
      <QuickView />
      <CommandSearch />
      <HelpCenter />
      <CompareTray />
      <SentDialog />
      <FlyLayer />
      <OrderAssistant />
      <ScrollTop />
      <BackToTop />
    </div>
  );
}

export default function App() {
  const largeText = usePrefs((s) => s.largeText);
  const calm = usePrefs((s) => s.calmMotion);
  useEffect(() => {
    if (site.season === "eid") document.documentElement.dataset.season = "eid";
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("large-text", largeText);
    document.documentElement.classList.toggle("calm", calm);
    if (calm) stopSmoothScroll(); else startSmoothScroll();
    return () => stopSmoothScroll();
  }, [largeText, calm]);
  return (
    <MotionConfig reducedMotion={calm ? "always" : "user"}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/:slug" element={<Shop />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="list" element={<ListPage />} />
            <Route path="quick-order" element={<QuickOrder />} />
            <Route path="start" element={<Start />} />
            <Route path="story" element={<Story />} />
            <Route path="apply" element={<Apply />} />
            <Route path="standards" element={<Standards />} />
            <Route path="packaging" element={<Packaging />} />
            <Route path="terms" element={<Terms />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contact" element={<Contact />} />
            <Route path="journal" element={<Journal />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster position="bottom-center" offset={84} duration={3200} toastOptions={{ className: "mehrusa-toast" }} />
    </MotionConfig>
  );
}
