import { CONFIRM, isConfirmed, terms } from "@/config/terms";
import { getProduct } from "@/data/products";
import type { Product } from "@/data/types";
import type { Buyer, ListLine } from "@/store/list";
import { fmtNum, fmtPKR, lineTotal, sumOrNull, unitPriceFor } from "./pricing";

export type ResolvedLine = ListLine & { product: Product; unit: number | null; total: number | null; productUnits: number };

/** Tier pricing is decided by total units of the same product across variants. */
export const resolveLines = (lines: ListLine[]): ResolvedLine[] => {
  const perProduct: Record<string, number> = {};
  lines.forEach((l) => (perProduct[l.productId] = (perProduct[l.productId] ?? 0) + l.qty));
  return lines.flatMap((l) => {
    const product = getProduct(l.productId);
    if (!product) return [];
    const productUnits = perProduct[l.productId];
    const unit = unitPriceFor(product, productUnits);
    return [{ ...l, product, unit, total: lineTotal(unit, l.qty), productUnits }];
  });
};

export const summarise = (r: ResolvedLine[]) => ({
  units: r.reduce((a, l) => a + l.qty, 0),
  subtotal: sumOrNull(r.map((l) => l.total)),
});

export const variantLabel = (l: Pick<ListLine, "colour" | "option">) =>
  [l.colour, l.option !== "One size" ? l.option : null].filter(Boolean).join(" / ");

export const buildOrderText = (lines: ListLine[], buyer: Buyer, opts: { maxNotes?: number } = {}) => {
  const r = resolveLines(lines);
  const { units, subtotal } = summarise(r);
  const out: string[] = [];
  out.push("Assalam o alaikum Mehrusa,");
  out.push("I would like to enquire about this wholesale order:");
  out.push("");
  if (buyer.business) out.push(`Business: ${buyer.business}`);
  if (buyer.name) out.push(`Name: ${buyer.name}`);
  if (buyer.city) out.push(`City: ${buyer.city}`);
  if (buyer.phone) out.push(`Phone: ${buyer.phone}`);
  if (buyer.business || buyer.name || buyer.city || buyer.phone) out.push("");
  r.forEach((l, i) => {
    out.push(`${i + 1}. ${l.product.name} (${l.product.sku})`);
    out.push(`   ${variantLabel(l)} | Qty ${fmtNum(l.qty)} | ${fmtPKR(l.unit)} each | ${fmtPKR(l.total)}`);
  });
  out.push("");
  out.push(`Total units: ${fmtNum(units)}`);
  out.push(`Subtotal: ${fmtPKR(subtotal)}`);
  const notes = buyer.notes.trim();
  if (notes && (opts.maxNotes ?? Infinity) > 0) {
    const max = opts.maxNotes ?? Infinity;
    out.push("");
    out.push(`Notes: ${notes.length > max ? notes.slice(0, max) + "..." : notes}`);
  }
  out.push("");
  out.push("I understand this is an enquiry, not a payment.");
  return out.join("\n");
};

export const whatsappReady = () => isConfirmed(terms.whatsappNumber);
export const emailReady = () => isConfirmed(terms.email);

/** wa.me links over ~2000 chars fail on some phones and browsers. */
export const WA_LIMIT = 2000;

export const waLink = (text: string) => {
  const num = whatsappReady() ? terms.whatsappNumber.replace(/\D/g, "") : "";
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
};

export const buildOrderWaLink = (lines: ListLine[], buyer: Buyer): { url: string | null; trimmed: boolean } => {
  for (const maxNotes of [Infinity, 200, 0]) {
    const url = waLink(buildOrderText(lines, buyer, { maxNotes }));
    if (url.length <= WA_LIMIT) return { url, trimmed: maxNotes !== Infinity && buyer.notes.trim().length > 0 };
  }
  return { url: null, trimmed: true };
};

export const mailLink = (subject: string, body: string) =>
  `mailto:${emailReady() ? terms.email : ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const productAskText = (p: Product) =>
  `Assalam o alaikum Mehrusa, I would like to ask about ${p.name} (${p.sku}) for wholesale.`;

export const CONTACT_MISSING = `WhatsApp number ${CONFIRM}`;
