import { describe, expect, it, vi } from "vitest";
vi.stubGlobal("import.meta", {});
import { products } from "../src/data/products";
import { activeTierIndex, orderAxis } from "../src/lib/pricing";
import { buildOrderText, buildOrderWaLink, resolveLines, summarise } from "../src/lib/message";

const p = products[0];
describe("order logic", () => {
  it("has 24 placeholder products with unique ids and skus", () => {
    expect(products).toHaveLength(24);
    expect(new Set(products.map((x) => x.id)).size).toBe(24);
    expect(new Set(products.map((x) => x.sku)).size).toBe(24);
  });
  it("picks the active tier", () => {
    expect(activeTierIndex(p, 5)).toBe(-1);
    expect(activeTierIndex(p, 12)).toBe(0);
    expect(activeTierIndex(p, 40)).toBe(1);
    expect(activeTierIndex(p, 100)).toBe(2);
  });
  it("totals units across variants and shows unknown prices honestly", () => {
    const lines = [
      { key: "a", productId: p.id, colour: "Natural steel", option: orderAxis(p).options[0], qty: 10 },
      { key: "b", productId: p.id, colour: "Gold-coloured", option: orderAxis(p).options[1], qty: 30 },
    ];
    const r = resolveLines(lines);
    expect(r[0].productUnits).toBe(40);
    expect(summarise(r)).toEqual({ units: 40, subtotal: null });
    const text = buildOrderText(lines, { name: "A", business: "Noor Boutique", city: "Lahore", phone: "+92 300", notes: "" });
    expect(text).toContain("Noor Boutique");
    expect(text).toContain(p.sku);
    expect(text).toContain("PKR [CONFIRM]");
    expect(buildOrderWaLink(lines, { name: "", business: "", city: "", phone: "", notes: "" }).url).toMatch(/^https:\/\/wa\.me\//);
  });
  it("trims long notes, then falls back when the list is too long", () => {
    const lines = [{ key: "a", productId: p.id, colour: "Natural steel", option: "6", qty: 12 }];
    const r = buildOrderWaLink(lines, { name: "", business: "", city: "", phone: "", notes: "x".repeat(3000) });
    expect(r.url).not.toBeNull();
    expect(r.trimmed).toBe(true);
    const many = products.flatMap((x) => [0, 1, 2].map((i) => ({ key: x.id + i, productId: x.id, colour: "Natural steel", option: String(i), qty: 12 })));
    expect(buildOrderWaLink(many, { name: "", business: "", city: "", phone: "", notes: "" }).url).toBeNull();
  });
});
