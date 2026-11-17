import { describe, expect, it } from "vitest";
import { pdf } from "@react-pdf/renderer";
import { Catalogue } from "../src/pdf/Catalogue";
import { decodeList, encodeList } from "../src/lib/share";

describe("catalogue + share", () => {
  it("renders the full catalogue", async () => {
    const blob = await pdf(Catalogue()).toBlob();
    expect(blob.size).toBeGreaterThan(2000);
  }, 30000);
  it("round-trips a shared list", () => {
    const lines = [{ key: "slim-band-ring|Gold-coloured|8", productId: "slim-band-ring", colour: "Gold-coloured", option: "8", qty: 24 }];
    const code = encodeList(lines);
    expect(code).toBe("MH-RG-01.1.2.24");
    expect(decodeList(code)).toEqual(lines);
    expect(decodeList("junk_MH-ZZ-1.0.0.4")).toEqual([]);
  });
});
