import { buyerTypes, type BuyerType } from "@/data/buyers";
import { products } from "@/data/products";
import type { Occasion, Product } from "@/data/types";
import type { ListLine } from "@/store/list";
import { orderAxis } from "./pricing";

export type AssistantInput = {
  buyer: BuyerType;
  size: "try" | "shelf" | "range";
  styles: Occasion[];
  colour: "steel" | "gold" | "both";
};

export const sizes = {
  try: { label: "Trying you out", sub: "3 to 4 pieces", n: 4 },
  shelf: { label: "A proper shelf", sub: "6 to 8 pieces", n: 7 },
  range: { label: "A full range", sub: "10 to 12 pieces", n: 11 },
} as const;

const middle = (opts: string[]) => opts[Math.floor((opts.length - 1) / 2)];

/**
 * Picks pieces by how well they suit the chosen styles and shop, then spreads
 * across categories so the assortment feels complete. Every piece meets its minimum.
 * A suggestion, not sales data.
 */
export function suggestOrder(input: AssistantInput): Omit<ListLine, "key">[] {
  const b = buyerTypes.find((x) => x.id === input.buyer)!;
  const wanted = new Set<Occasion>([...input.styles, ...(input.styles.length ? [] : b.occasions)]);
  const score = (p: Product) =>
    (p.goodFor ?? []).reduce((a, o) => a + (wanted.has(o) ? 3 : 0) + (b.occasions.includes(o) ? 1 : 0), 0) +
    (input.buyer === "gifting" && p.categorySlug === "sets" ? 4 : 0) +
    (p.badges?.includes("new") ? 0.5 : 0);

  const ranked = [...products].filter((p) => p.wholesale.inStock !== false).sort((a, c) => score(c) - score(a) || a.name.localeCompare(c.name));
  // Round-robin across categories in rank order for variety
  const byCat = new Map<string, Product[]>();
  ranked.forEach((p) => byCat.set(p.categorySlug, [...(byCat.get(p.categorySlug) ?? []), p]));
  const cats = [...byCat.keys()].sort((a, c) => score(byCat.get(c)![0]) - score(byCat.get(a)![0]));
  const picked: Product[] = [];
  const n = sizes[input.size].n;
  while (picked.length < n && [...byCat.values()].some((l) => l.length)) {
    for (const c of cats) {
      const next = byCat.get(c)!.shift();
      if (next && score(next) > 0 && picked.length < n) picked.push(next);
    }
    if (cats.every((c) => !byCat.get(c)!.length || score(byCat.get(c)![0]) <= 0)) break;
  }

  return picked.flatMap((p) => {
    const moq = p.wholesale.minOrderQty;
    const opt = middle(orderAxis(p).options);
    const steel = p.colours.find((c) => c.name === "Natural steel")?.name ?? p.colours[0].name;
    const gold = p.colours.find((c) => c.name === "Gold-coloured")?.name ?? p.colours[p.colours.length - 1].name;
    if (input.colour === "steel") return [{ productId: p.id, colour: steel, option: opt, qty: moq }];
    if (input.colour === "gold") return [{ productId: p.id, colour: gold, option: opt, qty: moq }];
    const half = Math.ceil(moq / 2);
    return [
      { productId: p.id, colour: steel, option: opt, qty: half },
      { productId: p.id, colour: gold, option: opt, qty: moq - half },
    ];
  });
}
