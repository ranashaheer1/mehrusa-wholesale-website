import { motion, useReducedMotion } from "motion/react";
import { Mark } from "../ui/Brand";
import { tex } from "@/lib/images";
import markFoil from "@/assets/brand/mehrusa-mark-foil.svg";

/**
 * Decorative hairline diamonds that turn slowly and lock at 45° (the allowed "facets locking" motion).
 * The mark itself is the supplied SVG, untouched, with clear space.
 */
export function HeroFacets() {
  const reduce = useReducedMotion();
  const rings = [1, 0.78, 0.56];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
      <div className="absolute inset-[18%] overflow-hidden" style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }}>
        <img decoding="async" src={tex("velvet-fabric")} alt="" className="h-full w-full scale-110 object-cover opacity-80" />
        <div className="absolute inset-0 bg-night-deep/40" />
      </div>
      {rings.map((s, i) => (
        <motion.div
          key={s}
          className="absolute left-1/2 top-1/2 border border-gold"
          style={{ width: `${s * 70.7}%`, height: `${s * 70.7}%`, x: "-50%", y: "-50%", opacity: 0.9 - i * 0.22 }}
          initial={{ rotate: reduce ? 45 : 45 - 18 - i * 9, opacity: 0 }}
          animate={{ rotate: 45, opacity: 0.9 - i * 0.22 }}
          transition={{ duration: reduce ? 0.3 : 1, delay: reduce ? 0 : 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[1px] w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.6 }}
        transition={{ duration: reduce ? 0.3 : 1, delay: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-[22px]"
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.3 : 1, delay: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="sheen-auto relative" style={{ WebkitMaskImage: `url(${markFoil})`, maskImage: `url(${markFoil})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }}>
          <Mark variant="foil" size={92} />
        </div>
      </motion.div>
    </div>
  );
}
