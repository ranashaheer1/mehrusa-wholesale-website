import { useEffect, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { CONFIRM, isConfirmed, site } from "@/config/terms";
import type { Badge as BadgeT } from "@/data/types";
import { cn } from "@/utils/cn";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Visible marker for anything the owner must confirm. */
export function Confirm({ label = CONFIRM }: { label?: string }) {
  if (!site.showConfirm) return null;
  return <span className="confirm" title="Owner to confirm">{label}</span>;
}

/** Renders a value, or a [CONFIRM] marker when unknown. */
export function Val({ v, fallback }: { v: string; fallback?: string }) {
  if (isConfirmed(v)) return <>{v}</>;
  const rest = v.replace(CONFIRM, "").trim();
  return (
    <>
      {fallback ?? rest} <Confirm />
    </>
  );
}

/** Replaces [CONFIRM] tokens inside text with the visual marker */
export function ConfirmText({ text }: { text: string }) {
  if (!text.includes(CONFIRM)) return <>{text}</>;
  const parts = text.split(CONFIRM);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <Confirm />}
        </span>
      ))}
    </>
  );
}

const badgeText: Record<BadgeT, string> = { new: "New arrival", "limited-batch": "Limited batch", "eid-edit": "Eid edit" };

export function Badge({ kind, className }: { kind: BadgeT; className?: string }) {
  return (
    <span className={cn("inline-block border border-current/40 bg-pearl-light/90 px-2 py-0.5 text-[0.75rem] font-medium tracking-[0.06em] text-night", kind === "eid-edit" && "season-accent", className)}>
      {badgeText[kind]}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function Urdu({ children, display, className, as: As = "p" }: { children: ReactNode; display?: boolean; className?: string; as?: "p" | "span" | "h2" | "h1" }) {
  return (
    <As lang="ur" dir="rtl" className={cn(display && "urdu-display", className)}>
      {children}
    </As>
  );
}

export function Stepper({ value, onChange, min = 0, max = 9999, label, size = "md" }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string; size?: "md" | "sm" }) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
  const h = size === "sm" ? "h-11" : "h-12";
  return (
    <div className={cn("inline-flex items-stretch border rule", h)} role="group" aria-label={label}>
      <button type="button" className="grid w-11 place-items-center hover:bg-current/5 disabled:opacity-35" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>
        <Minus size={16} strokeWidth={1.5} aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(clamp(parseInt(e.target.value || "0", 10)))}
        onFocus={(e) => e.target.select()}
        className="num w-12 border-x rule bg-transparent text-center [appearance:textfield] focus-visible:outline-offset-[-2px] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className="grid w-11 place-items-center hover:bg-current/5 disabled:opacity-35" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>
        <Plus size={16} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}

/** Slow opacity reveal with a gentle upward settle. Opacity only when reduced motion is on. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.618, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Per-route title + description (SPA). */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Mehrusa Wholesale` : "Mehrusa Wholesale";
    const set = (sel: string, attr: string, val: string) => {
      const el = document.head.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    if (description) {
      set('meta[name="description"]', "content", description);
      set('meta[property="og:description"]', "content", description);
    }
    set('meta[property="og:title"]', "content", document.title);
  }, [title, description]);
}

export function PageHeader({ eyebrow, title, intro, urdu, tone = "pearl", children }: { eyebrow?: string; title: string; intro?: ReactNode; urdu?: string; tone?: "pearl" | "night"; children?: ReactNode }) {
  return (
    <header className={cn(tone === "night" ? "surface-night" : "surface-pearl", "border-b rule")}>
      <div className="container-x py-12 lg:py-[68px]">
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h1 className="text-h1 max-w-[18ch]">{title}</h1>
        {urdu && <Urdu display className="mt-2 text-h4 opacity-90 text-left" >{urdu}</Urdu>}
        {intro && <div className="mt-5 max-w-[60ch] text-lead opacity-90">{intro}</div>}
        {children}
      </div>
    </header>
  );
}
