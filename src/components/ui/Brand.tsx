import markPrimary from "@/assets/brand/mehrusa-mark-primary.svg";
import markPaper from "@/assets/brand/mehrusa-mark-paper.svg";
import markFoil from "@/assets/brand/mehrusa-mark-foil.svg";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

const marks = { primary: markPrimary, paper: markPaper, foil: markFoil };

/**
 * The supplied SVG mark, never redrawn or recoloured.
 * Clear space = height of the top diamond (~37.5% of mark height) is applied as padding.
 * Minimum 16px.
 */
export function Mark({ variant = "primary", size = 28, className, decorative = true, fluid }: { variant?: keyof typeof marks; size?: number; className?: string; decorative?: boolean; fluid?: boolean }) {
  const s = Math.max(16, size);
  return (
    <img
      src={marks[variant]}
      width={s}
      height={s}
      alt={decorative ? "" : "Mehrusa mark"}
      className={cn("block shrink-0", className)}
      style={fluid ? { width: "100%", height: "auto", minWidth: 16 } : { width: s, height: s }}
      decoding="async"
    />
  );
}

export function Logo({ tone = "night", className }: { tone?: "night" | "pearl"; className?: string }) {
  // Clear space around the mark = top diamond height (0.375 * 28 ≈ 10px)
  return (
    <Link to="/" className={cn("inline-flex items-center gap-[10px] py-[10px] pr-1", className)} aria-label="Mehrusa wholesale, home">
      <Mark variant={tone === "night" ? "primary" : "paper"} size={28} />
      <span className="wordmark text-[1.0625rem] leading-none">Mehrusa</span>
    </Link>
  );
}
