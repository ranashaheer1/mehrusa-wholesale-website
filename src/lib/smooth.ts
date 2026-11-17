import Lenis from "lenis";

/**
 * Smooth wheel scrolling (desktop). Touch keeps native momentum.
 * Native scroll position is preserved, so sticky elements and IntersectionObserver keep working.
 * Off for prefers-reduced-motion and the "Calmer motion" setting.
 */
let lenis: Lenis | null = null;
let observer: MutationObserver | null = null;

export function startSmoothScroll() {
  if (lenis) return lenis;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || document.documentElement.classList.contains("calm")) return null;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.085, // a touch softer glide; frame-rate independent, never overshoots
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    syncTouch: false,
    allowNestedScroll: true,
    anchors: { offset: -96 },
    prevent: (node: HTMLElement) =>
      !!node.closest?.('[role="dialog"], [data-vaul-drawer], [data-lenis-prevent], [data-radix-popper-content-wrapper]'),
  });
  // Pause while a dialog or drawer locks the page (Radix/Vaul set data-scroll-locked on <body>)
  observer = new MutationObserver(() => {
    if (!lenis) return;
    if (document.body.hasAttribute("data-scroll-locked")) lenis.stop();
    else lenis.start();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked", "style"] });
  return lenis;
}

export function stopSmoothScroll() {
  observer?.disconnect();
  observer = null;
  lenis?.destroy();
  lenis = null;
}

/** Scroll helper that works with or without Lenis. */
export function scrollToTarget(target: number | HTMLElement, opts: { immediate?: boolean; offset?: number } = {}) {
  const offset = opts.offset ?? 0;
  if (lenis) {
    lenis.scrollTo(target, { immediate: opts.immediate, offset, force: true, duration: opts.immediate ? 0 : 1.1 });
    return;
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + offset;
  const calm = document.documentElement.classList.contains("calm") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: opts.immediate || calm ? ("instant" as ScrollBehavior) : "smooth" });
}
