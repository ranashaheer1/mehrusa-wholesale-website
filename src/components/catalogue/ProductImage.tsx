import { textures, type TextureKey } from "@/lib/images";
import type { Glyph } from "@/data/types";
import { cn } from "@/utils/cn";
import { drawings } from "./drawings";

const paths: Record<Glyph, React.ReactNode> = {
  ring: (<><circle cx="50" cy="56" r="20" /><path d="M50 30 l6 6 -6 6 -6 -6z" /></>),
  earring: (<><path d="M38 24 q0 -8 8 -8 t8 8 v8" /><path d="M54 32 l10 14 -10 26 -10 -26z" /></>),
  necklace: (<><path d="M22 20 Q50 70 78 20" /><path d="M50 45 l7 8 -7 16 -7 -16z" /></>),
  pendant: (<><path d="M50 18 v16" /><path d="M50 34 l14 14 -14 30 -14 -30z" /></>),
  bracelet: (<><ellipse cx="50" cy="50" rx="28" ry="14" /><ellipse cx="50" cy="54" rx="28" ry="14" /></>),
  set: (<><path d="M24 20 Q50 58 76 20" /><circle cx="30" cy="70" r="9" /><circle cx="70" cy="70" r="9" /></>),
  abaya: (<><path d="M42 18 h16 l14 64 h-44z" /><path d="M42 18 l-12 30 M58 18 l12 30" /></>),
  fabric: (<><rect x="24" y="26" width="52" height="48" /><path d="M24 40 h52 M24 54 h52" /></>),
};

/**
 * Placeholder product image: brand texture + hairline drawing of the object.
 * 4:5, aspect reserved to avoid layout shift. Replace with real photography (AVIF/WebP, 3 widths).
 */
export function ProductImage({ texture, glyph, alt, className, label = true, eager, pid }: { texture: TextureKey; glyph: Glyph; alt: string; className?: string; label?: boolean; eager?: boolean; pid?: string }) {
  const t = textures[texture];
  const dark = t.tone === "dark";
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-sand", className)}>
      <img src={t.src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" width={900} height={1125} className="absolute inset-0 h-full w-full object-cover" />
      <div className={cn("absolute inset-0", dark ? "bg-night-deep/25" : "bg-pearl/30")} aria-hidden />
      <svg viewBox="0 0 100 100" aria-hidden className="absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2" fill="none" stroke={dark ? "#C7A04D" : "#816529"} strokeWidth="1.1" strokeLinejoin="miter" strokeLinecap="square" vectorEffect="non-scaling-stroke">
        {(pid && drawings[pid]) || paths[glyph]}
      </svg>
      {label && (
        <span className={cn("absolute bottom-2 left-2 px-2 py-0.5 text-[0.75rem] tracking-[0.06em]", dark ? "bg-night-deep/80 text-pearl" : "bg-pearl-light/90 text-night")}>
          {pid && drawings[pid] ? "Drawing · photo coming" : "Photo coming"}
        </span>
      )}
    </div>
  );
}
