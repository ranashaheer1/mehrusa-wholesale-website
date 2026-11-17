/**
 * One passive scroll listener for the whole site, throttled to one callback per animation frame.
 * Subscribers receive scrollY and a cached max scroll (no layout reads during scroll).
 */
type Sub = (y: number, max: number) => void;

const subs = new Set<Sub>();
let ticking = false;
let max = 0;
let started = false;

const measure = () => {
  max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
};

const flush = () => {
  ticking = false;
  const y = window.scrollY;
  subs.forEach((fn) => fn(y, max));
};

const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(flush);
};

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  measure();
  // Page height changes (images, route changes, accordions) are measured off the scroll path
  const ro = new ResizeObserver(() => { measure(); onScroll(); });
  ro.observe(document.body);
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
}

export function onScrollFrame(fn: Sub) {
  start();
  subs.add(fn);
  fn(window.scrollY, max);
  return () => { subs.delete(fn); };
}
