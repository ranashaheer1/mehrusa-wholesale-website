import type { ReactNode } from "react";

/**
 * Hairline drawings, one per placeholder product (viewBox 0 0 100 100).
 * They describe the object honestly as a sketch until real photography exists.
 */
const crescent = (cx: number, cy: number, r: number) => `M${cx + r * 0.2} ${cy - r} A${r} ${r} 0 1 0 ${cx + r * 0.2} ${cy + r} A${r * 1.35} ${r * 1.35} 0 0 1 ${cx + r * 0.2} ${cy - r} Z`;
const arch = (cx: number, top: number, w: number, h: number) => `M${cx - w / 2} ${top + h} V${top + w / 2} A${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${top + w / 2} V${top + h} Z`;
const chain = "M18 18 Q50 78 82 18";
const hook = (x: number) => `M${x - 4} 22 q0 -8 6 -8 t6 8 v6`;

export const drawings: Record<string, ReactNode> = {
  "slim-band-ring": (<><ellipse cx="50" cy="56" rx="24" ry="9" /><path d="M26 56 v-4 M74 56 v-4" /><ellipse cx="50" cy="52" rx="24" ry="9" /></>),
  "arch-signet-ring": (<><ellipse cx="50" cy="62" rx="22" ry="8" /><ellipse cx="50" cy="59" rx="22" ry="8" /><path d={arch(50, 30, 16, 24)} /></>),
  "jali-cut-band-ring": (<><ellipse cx="50" cy="44" rx="24" ry="9" /><ellipse cx="50" cy="60" rx="24" ry="9" /><path d="M26 44 v16 M74 44 v16 M34 51 l6 8 6 -8 6 8 6 -8 6 8 M34 59 l6 -8 M46 59 l6 -8 M58 59 l6 -8" /></>),
  "crescent-stacking-ring": (<><ellipse cx="50" cy="60" rx="22" ry="8" /><path d={crescent(50, 42, 9)} /></>),
  "twist-band-ring": (<><ellipse cx="50" cy="55" rx="24" ry="9" /><path d="M26 55 q6 -6 12 0 t12 0 t12 0 t12 0" /></>),
  "small-hoop-earrings": (<><circle cx="36" cy="50" r="12" /><circle cx="66" cy="50" r="12" /><path d="M36 38 v-4 M66 38 v-4" /></>),
  "arch-drop-earrings": (<><path d={hook(34)} /><path d={hook(64)} /><path d={arch(36, 32, 14, 22)} /><path d={arch(66, 32, 14, 22)} /></>),
  "diamond-shape-stud-earrings": (<><path d="M36 38 l12 12 -12 12 -12 -12z" /><path d="M66 38 l12 12 -12 12 -12 -12z" /><path d="M36 44 l6 6 -6 6 -6 -6z M66 44 l6 6 -6 6 -6 -6z" opacity=".5" /></>),
  "crescent-drop-earrings": (<><path d={hook(34)} /><path d={hook(64)} /><path d="M36 28 v12 M66 28 v12" /><path d={crescent(36, 52, 9)} /><path d={crescent(66, 52, 9)} /></>),
  "fine-chain-necklace": (<><path d={chain} strokeDasharray="2 1.5" /><path d="M48 48 h4" /></>),
  "flat-snake-chain-necklace": (<><path d={chain} /><path d="M21 18 Q50 72 79 18" /></>),
  "bar-collar-necklace": (<><path d="M20 18 Q50 64 80 18" /><path d="M38 47 h24" strokeWidth="2.2" /></>),
  "layered-two-chain-necklace": (<><path d="M22 16 Q50 56 78 16" /><path d={chain} strokeDasharray="2 1.5" /><path d="M50 48 l4 4 -4 6 -4 -6z" /></>),
  "crescent-pendant": (<><path d="M20 14 Q50 66 80 14" /><path d="M50 40 v6" /><path d={crescent(50, 58, 10)} /></>),
  "arch-window-pendant": (<><path d="M20 14 Q50 66 80 14" /><path d="M50 40 v6" /><path d={arch(50, 46, 18, 26)} /><path d={arch(50, 50, 10, 18)} opacity=".5" /></>),
  "teardrop-pendant": (<><path d="M20 14 Q50 66 80 14" /><path d="M50 40 v6 M50 46 C40 60 42 72 50 72 C58 72 60 60 50 46Z" /></>),
  "initial-disc-pendant": (<><path d="M20 14 Q50 66 80 14" /><path d="M50 40 v6" /><circle cx="50" cy="58" r="11" /><path d="M45 62 v-8 l5 5 5 -5 v8" opacity=".6" /></>),
  "open-cuff-bracelet": (<><path d="M30 46 A24 12 0 1 1 70 46" /><path d="M30 54 A24 12 0 1 0 70 54" opacity=".35" /><circle cx="30" cy="50" r="1.5" /><circle cx="70" cy="50" r="1.5" /></>),
  "fine-chain-bracelet": (<><ellipse cx="50" cy="52" rx="26" ry="13" strokeDasharray="2.2 1.6" /><path d="M76 52 h8 M84 52 l2 2" /></>),
  "thin-bangle-pair": (<><ellipse cx="45" cy="50" rx="24" ry="11" /><ellipse cx="55" cy="54" rx="24" ry="11" /></>),
  "lattice-link-bracelet": (<><ellipse cx="50" cy="52" rx="27" ry="13" /><ellipse cx="50" cy="52" rx="21" ry="9" /><path d="M30 44 l4 4 M40 40 l3 4 M50 39 v4 M60 40 l-3 4 M70 44 l-4 4 M30 60 l4 -4 M40 64 l3 -4 M50 65 v-4 M60 64 l-3 -4 M70 60 l-4 -4" /></>),
  "crescent-gift-set": (<><path d="M18 34 h64 v44 h-64z M18 34 l8 -8 h48 l8 8" /><path d="M34 44 Q50 62 66 44" /><path d={crescent(50, 64, 6)} /><path d={crescent(28, 66, 4)} /><path d={crescent(72, 66, 4)} /></>),
  "arch-everyday-set": (<><path d="M18 34 h64 v44 h-64z M18 34 l8 -8 h48 l8 8" /><path d="M34 42 Q50 58 66 42" /><path d={arch(50, 54, 10, 16)} /><path d={arch(28, 58, 6, 10)} /><path d={arch(72, 58, 6, 10)} /></>),
  "stacking-ring-trio": (<><ellipse cx="50" cy="40" rx="22" ry="7" /><ellipse cx="50" cy="52" rx="22" ry="7" /><ellipse cx="50" cy="64" rx="22" ry="7" /></>),
};
