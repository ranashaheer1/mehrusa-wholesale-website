import { describe, expect, it } from "vitest";
import { parsePaste } from "../src/pages/QuickOrder";
import { useList } from "../src/store/list";

describe("paste SKUs", () => {
  it("reads sku, colour, size and quantity", () => {
    const [a, b, c, d] = parsePaste("MH-RG-01, gold, 7, 24\nmh-er-02 12\nMH-NK-01 45 cm 18\nhello 5");
    expect(a.ok && a.add?.key).toBe("slim-band-ring|Gold-coloured|7");
    expect(a.add?.qty).toBe(24);
    expect(b.ok && b.add?.qty).toBe(12);
    expect(c.add?.key).toBe("fine-chain-necklace|Natural steel|45 cm");
    expect(d.ok).toBe(false);
  });
  it("rejects unknown skus and missing quantities", () => {
    expect(parsePaste("MH-ZZ-99 4")[0].ok).toBe(false);
    expect(parsePaste("MH-RG-01")[0].ok).toBe(false);
  });
});

describe("list store", () => {
  it("merges addMany and restores", () => {
    const s = useList.getState();
    s.clear();
    s.addMany([{ productId: "slim-band-ring", colour: "Natural steel", option: "6", qty: 6 }, { productId: "slim-band-ring", colour: "Natural steel", option: "6", qty: 6 }]);
    expect(useList.getState().lines).toHaveLength(1);
    expect(useList.getState().lines[0].qty).toBe(12);
    const saved = useList.getState().lines;
    s.clear();
    useList.getState().restore(saved, "replace");
    expect(useList.getState().lines[0].qty).toBe(12);
  });
});
