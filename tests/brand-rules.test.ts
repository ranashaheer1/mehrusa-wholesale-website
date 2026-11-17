import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css|html)$/.test(p) ? [p] : [];
  });

describe("brand honesty rules", () => {
  const files = [...walk("src"), "index.html"];
  it("never uses banned words (luxury, premium, elegant)", () => {
    const hits = files.flatMap((f) => {
      const txt = readFileSync(f, "utf8");
      return /\b(luxury|premium|elegant)\b/i.test(txt) ? [f] : [];
    });
    expect(hits).toEqual([]);
  });
  it("never makes unverified material claims in copy", () => {
    const claim = /\b(316L|surgical[- ]grade|waterproof|tarnish[- ]free|hypoallergenic|fine jewell?ery|precious)\b/i;
    const hits = files
      .filter((f) => !f.endsWith("materials.ts"))
      .flatMap((f) => readFileSync(f, "utf8").split("\n").filter((l) => claim.test(l) && !/not|never|\[CONFIRM\]/i.test(l)).map((l) => `${f}: ${l.trim()}`));
    expect(hits).toEqual([]);
  });
  it("uses no fake urgency", () => {
    const hits = files.flatMap((f) => (/only \d+ left|countdown|hurry/i.test(readFileSync(f, "utf8")) ? [f] : []));
    expect(hits).toEqual([]);
  });
});
