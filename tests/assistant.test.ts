import { describe, expect, it } from "vitest";
import { suggestOrder, sizes } from "../src/lib/assistant";
import { getProduct } from "../src/data/products";

describe("order assistant", () => {
  for (const buyer of ["boutique", "online", "gifting", "market"] as const) {
    it(`builds a valid order for ${buyer}`, () => {
      const lines = suggestOrder({ buyer, size: "shelf", styles: [], colour: "both" });
      const per: Record<string, number> = {};
      lines.forEach((l) => (per[l.productId] = (per[l.productId] ?? 0) + l.qty));
      const ids = Object.keys(per);
      expect(ids.length).toBeGreaterThan(2);
      expect(ids.length).toBeLessThanOrEqual(sizes.shelf.n);
      ids.forEach((id) => expect(per[id]).toBeGreaterThanOrEqual(getProduct(id)!.wholesale.minOrderQty));
    });
  }
  it("respects colour choice and leans to sets for gifting", () => {
    const g = suggestOrder({ buyer: "gifting", size: "try", styles: ["gifting"], colour: "gold" });
    expect(g.every((l) => l.colour === "Gold-coloured")).toBe(true);
    expect(g.some((l) => getProduct(l.productId)!.categorySlug === "sets")).toBe(true);
  });
  it("scales with size", () => {
    const a = new Set(suggestOrder({ buyer: "market", size: "try", styles: [], colour: "steel" }).map((l) => l.productId)).size;
    const b = new Set(suggestOrder({ buyer: "market", size: "range", styles: [], colour: "steel" }).map((l) => l.productId)).size;
    expect(b).toBeGreaterThan(a);
  });
});
