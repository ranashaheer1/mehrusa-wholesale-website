import { describe, expect, it } from "vitest";
import { pdf } from "@react-pdf/renderer";
import { LineSheet } from "../src/pdf/LineSheet";
import { resolveLines, summarise } from "../src/lib/message";
import { products } from "../src/data/products";

describe("line sheet PDF", () => {
  it("renders", async () => {
    const r = resolveLines([{ key: "a", productId: products[0].id, colour: "Natural steel", option: "6", qty: 12 }]);
    const blob = await pdf(LineSheet({ lines: r, buyer: { name: "A", business: "B", city: "C", phone: "1", notes: "n" }, totals: summarise(r) })).toBlob();
    expect(blob.size).toBeGreaterThan(1000);
  }, 30000);
});
