import { products } from "@/data/products";
import type { ListLine } from "@/store/list";
import { orderAxis } from "./pricing";

/**
 * Compact, readable share code: "MH-RG-01.1.2.24_MH-ER-02.0.0.12"
 * (SKU . colour index . option index . quantity). No personal details are included.
 */
export const encodeList = (lines: ListLine[]) =>
  lines
    .map((l) => {
      const p = products.find((x) => x.id === l.productId);
      if (!p) return null;
      const c = p.colours.findIndex((x) => x.name === l.colour);
      const o = orderAxis(p).options.indexOf(l.option);
      return `${p.sku}.${Math.max(0, c)}.${Math.max(0, o)}.${l.qty}`;
    })
    .filter(Boolean)
    .join("_");

export const decodeList = (code: string): ListLine[] =>
  code
    .split("_")
    .map((part) => {
      const [sku, ci, oi, q] = part.split(".");
      const p = products.find((x) => x.sku === sku);
      const qty = parseInt(q, 10);
      if (!p || !Number.isFinite(qty) || qty <= 0) return null;
      const colour = p.colours[parseInt(ci, 10)]?.name ?? p.colours[0].name;
      const option = orderAxis(p).options[parseInt(oi, 10)] ?? orderAxis(p).options[0];
      return { key: `${p.id}|${colour}|${option}`, productId: p.id, colour, option, qty: Math.min(qty, 9999) };
    })
    .filter((x): x is ListLine => !!x);

export const shareUrl = (lines: ListLine[]) => `${location.origin}${location.pathname}#/list?shared=${encodeList(lines)}`;
