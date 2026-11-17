import { describe, expect, it } from "vitest";
import { starterKits, buyerTypes } from "../src/data/buyers";
import { getProduct } from "../src/data/products";
import { orderAxis } from "../src/lib/pricing";

describe("starter kits", () => {
  it("every line points to a real product, colour and option", () => {
    for (const k of starterKits) for (const l of k.lines) {
      const p = getProduct(l.productId);
      expect(p, `${k.id}: ${l.productId}`).toBeTruthy();
      expect(p!.colours.map((c) => c.name)).toContain(l.colour);
      expect(orderAxis(p!).options).toContain(l.option);
    }
  });
  it("every kit meets each piece's minimum", () => {
    for (const k of starterKits) {
      const per: Record<string, number> = {};
      k.lines.forEach((l) => (per[l.productId] = (per[l.productId] ?? 0) + l.qty));
      for (const [id, n] of Object.entries(per)) expect(n, `${k.id}/${id}`).toBeGreaterThanOrEqual(getProduct(id)!.wholesale.minOrderQty);
    }
  });
  it("every buyer type has at least one kit", () => {
    for (const b of buyerTypes) expect(starterKits.some((k) => k.buyer === b.id)).toBe(true);
  });
});
