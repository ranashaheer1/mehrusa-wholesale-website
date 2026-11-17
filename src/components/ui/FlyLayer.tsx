import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Flight = { id: number; x0: number; y0: number; x1: number; y1: number };
const EVT = "mehrusa:fly";

let lastTap: { el: Element; at: number } | null = null;
if (typeof window !== "undefined") window.addEventListener("pointerdown", (e) => { lastTap = { el: e.target as Element, at: Date.now() }; }, { capture: true, passive: true });

/** Call after adding to the list. Starts from the tapped (or focused) element. */
export function flyToList(from?: Element | null) {
  const recent = lastTap && Date.now() - lastTap.at < 1500 ? lastTap.el : null;
  const src = (from ?? recent ?? document.activeElement) as HTMLElement | null;
  if (!src || src === document.body) return;
  window.dispatchEvent(new CustomEvent(EVT, { detail: src.getBoundingClientRect() }));
}

/** A small gold diamond glides to "My list". Opacity and position only; no bounce. */
export function FlyLayer() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const reduce = useReducedMotion();
  useEffect(() => {
    const on = (e: Event) => {
      if (reduce || document.documentElement.classList.contains("calm")) return;
      const r = (e as CustomEvent<DOMRect>).detail;
      const target = [...document.querySelectorAll<HTMLElement>("[data-list-target]")].find((el) => el.offsetParent !== null);
      if (!target) return;
      const t = target.getBoundingClientRect();
      const f = { id: Date.now() + Math.random(), x0: r.left + r.width / 2, y0: r.top + r.height / 2, x1: t.left + t.width / 2, y1: t.top + t.height / 2 };
      setFlights((x) => [...x, f]);
      setTimeout(() => setFlights((x) => x.filter((y) => y.id !== f.id)), 900);
    };
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, [reduce]);
  return (
    <div className="pointer-events-none fixed inset-0 z-[95]" aria-hidden>
      <AnimatePresence>
        {flights.map((f) => (
          <motion.span
            key={f.id}
            className="absolute h-3 w-3 rotate-45 bg-gold"
            style={{ left: -6, top: -6, boxShadow: "0 0 0 1px #816529" }}
            initial={{ x: f.x0, y: f.y0, opacity: 0 }}
            animate={{ x: [f.x0, (f.x0 + f.x1) / 2, f.x1], y: [f.y0, Math.min(f.y0, f.y1) - 80, f.y1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], times: [0, 0.5, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
