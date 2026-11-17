import { CONFIRM } from "@/config/terms";
import type { Product } from "@/data/types";

export const fmtPKR = (n: number | null | undefined): string =>
  n === null || n === undefined ? `PKR ${CONFIRM}` : `PKR ${n.toLocaleString("en-PK")}`;

export const fmtNum = (n: number) => n.toLocaleString("en-PK");

/** Active tier index for a quantity (the highest tier whose minQty <= qty). -1 if under first tier. */
export const activeTierIndex = (p: Product, qty: number): number => {
  let idx = -1;
  p.wholesale.tiers.forEach((t, i) => {
    if (qty >= t.minQty) idx = i;
  });
  return idx;
};

/** Unit price used for a quantity. Falls back to the first tier when under the minimum. */
export const unitPriceFor = (p: Product, qty: number): number | null => {
  const i = activeTierIndex(p, qty);
  const tier = p.wholesale.tiers[Math.max(0, i)];
  return tier ? tier.pricePKR : null;
};

export const lineTotal = (unit: number | null, qty: number): number | null => (unit === null ? null : unit * qty);

export const sumOrNull = (vals: (number | null)[]): number | null =>
  vals.some((v) => v === null) ? null : vals.reduce<number>((a, b) => a + (b ?? 0), 0);

export const fromPriceLine = (p: Product): string => {
  const first = p.wholesale.tiers[0];
  if (!first) return "Price on request";
  const known = p.wholesale.tiers.filter((t) => t.pricePKR !== null);
  if (known.length === 0) return `${fmtPKR(null)} at ${first.minQty}+`;
  const lowest = known[known.length - 1];
  return `from ${fmtPKR(lowest.pricePKR)} at ${lowest.minQty}+`;
};

/** Order axis depends on family: jewellery sizes/lengths, abaya size run, unstitched colourway only. */
export const orderAxis = (p: Product): { label: string; options: string[] } => {
  if (p.sizeRun?.length) return { label: "Size", options: p.sizeRun };
  if (p.variantAxis) return p.variantAxis;
  if (p.fabricMeters) return { label: "Suit", options: [`${p.fabricMeters} m`] };
  return { label: "Size", options: ["One size"] };
};

export const unitLabel = (p: Product, n = 2) => {
  const u = p.wholesale.unit;
  return n === 1 ? u : u === "dozen" ? "dozens" : `${u}s`;
};
