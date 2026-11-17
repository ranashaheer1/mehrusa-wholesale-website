import { useEffect, useRef, useState } from "react";

/**
 * Geometric jali (8-point star lattice) in hairline gold.
 * Performance: the lattice is one tiled background image (rasterised once).
 * The "light" is a small 520px layer moved with translate3d (GPU-composited);
 * only its own background-position changes, so the hero never repaints while scrolling.
 * Touch devices and reduced motion get the static lattice only.
 */
const tile = (stroke: string, width: number, opacity: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='${stroke}' stroke-width='${width}' opacity='${opacity}'><path d='M23 23H57V57H23Z'/><path d='M40 16L64 40L40 64L16 40Z'/><path d='M40 0V16M80 40H64M40 80V64M0 40H16'/><path d='M0 0L23 23M80 0L57 23M80 80L57 57M0 80L23 57'/><circle cx='40' cy='40' r='5'/></g></svg>`,
  )}")`;

const BASE = tile("#C7A04D", 0.6, 0.2);
const BRIGHT = tile("#F0E5CE", 0.9, 1);
const LAMP = 520;

export function LivingJali() {
  const lamp = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("calm");
    setInteractive(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const el = lamp.current;
    const host = wrap.current?.parentElement;
    if (!el || !host) return;
    let raf = 0;
    let tx = host.clientWidth * 0.62, ty = host.clientHeight * 0.45, x = tx, y = ty;
    const place = () => {
      const lx = x - LAMP / 2, ly = y - LAMP / 2;
      el.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
      el.style.backgroundPosition = `0 0, ${-lx}px ${-ly}px`;
    };
    place();
    const step = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      place();
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(step);
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    return () => { host.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [interactive]);

  return (
    <div ref={wrap} className="jali-fade pointer-events-none absolute inset-0 overflow-hidden" aria-hidden style={{ contain: "strict" }}>
      <div className="absolute inset-0" style={{ backgroundImage: BASE, backgroundSize: "80px 80px" }} />
      {interactive && (
        <div
          ref={lamp}
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: LAMP,
            height: LAMP,
            backgroundImage: `radial-gradient(closest-side, rgba(199,160,77,0.16), transparent), ${BRIGHT}`,
            backgroundSize: "100% 100%, 80px 80px",
            WebkitMaskImage: "radial-gradient(closest-side, #000 0%, rgba(0,0,0,.6) 45%, transparent 100%)",
            maskImage: "radial-gradient(closest-side, #000 0%, rgba(0,0,0,.6) 45%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
