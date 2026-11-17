import { useEffect, useRef, useState } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import type { Glyph } from "@/data/types";
import type { TextureKey } from "@/lib/images";
import { ProductImage } from "../catalogue/ProductImage";
import { cn } from "@/utils/cn";

/** Full-screen viewer. Tap to zoom 2×, move to pan, arrows or swipe to change image. */
export function Lightbox({ open, onOpenChange, images, start, glyph, pid, name }: { open: boolean; onOpenChange: (o: boolean) => void; images: TextureKey[]; start: number; glyph: Glyph; pid: string; name: string }) {
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touchX = useRef<number | null>(null);
  useEffect(() => { if (open) { setI(start); setZoom(false); } }, [open, start]);
  const go = (d: number) => { setZoom(false); setI((x) => (x + d + images.length) % images.length); };

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Content
          className="surface-deep fixed inset-0 z-[90] flex flex-col outline-none data-[state=open]:animate-[fadeIn_382ms_var(--ease)]"
          aria-describedby={undefined}
          onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "z") setZoom((z) => !z); }}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <RDialog.Title className="truncate text-[0.9375rem]">{name} <span className="num ml-2 opacity-70">{i + 1} / {images.length}</span></RDialog.Title>
            <div className="flex">
              <button type="button" onClick={() => setZoom((z) => !z)} className="grid h-11 w-11 place-items-center" aria-label={zoom ? "Zoom out" : "Zoom in"} aria-pressed={zoom}>{zoom ? <ZoomOut size={20} strokeWidth={1.4} aria-hidden /> : <ZoomIn size={20} strokeWidth={1.4} aria-hidden />}</button>
              <RDialog.Close className="grid h-11 w-11 place-items-center" aria-label="Close viewer"><X size={22} strokeWidth={1.4} aria-hidden /></RDialog.Close>
            </div>
          </div>
          <div
            className={cn("relative flex flex-1 items-center justify-center overflow-hidden px-2", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); setZoom((z) => !z); }}
            onMouseMove={(e) => { if (!zoom) return; const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); }}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => { if (touchX.current === null || zoom) return; const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touchX.current = null; }}
          >
            <div className="h-full max-h-[calc(100dvh-160px)] aspect-[4/5] transition-transform duration-[382ms] ease-[var(--ease)]" style={{ transform: zoom ? "scale(2)" : "none", transformOrigin: origin }}>
              <ProductImage key={i} texture={images[i]} glyph={glyph} pid={pid} eager alt={`${name}, image ${i + 1}`} className="h-full w-full animate-[fadeIn_382ms_var(--ease)]" />
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-night-deep/70 hover:text-gold" aria-label="Previous image"><ChevronLeft size={22} strokeWidth={1.4} aria-hidden /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-night-deep/70 hover:text-gold" aria-label="Next image"><ChevronRight size={22} strokeWidth={1.4} aria-hidden /></button>
          </div>
          <div className="flex justify-center gap-2 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {images.map((img, idx) => (
              <button key={idx} type="button" onClick={() => { setZoom(false); setI(idx); }} aria-label={`Image ${idx + 1}`} aria-current={idx === i} className={cn("w-12 border", idx === i ? "border-gold" : "border-transparent opacity-60")}>
                <ProductImage texture={img} glyph={glyph} pid={pid} alt="" label={false} />
              </button>
            ))}
          </div>
          <p className="sr-only">Use left and right arrow keys to change image, and Z to zoom.</p>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
