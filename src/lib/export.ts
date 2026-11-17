import Papa from "papaparse";
import type { Buyer, ListLine } from "@/store/list";
import { resolveLines, summarise, variantLabel } from "./message";

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const stamp = () => new Date().toISOString().slice(0, 10);

export const downloadCSV = (lines: ListLine[], buyer: Buyer) => {
  const r = resolveLines(lines);
  const { units, subtotal } = summarise(r);
  const rows: Record<string, string | number>[] = r.map((l) => ({
    SKU: l.product.sku,
    Piece: l.product.name,
    Variant: variantLabel(l),
    Qty: l.qty,
    Unit: l.product.wholesale.unit,
    "Unit price PKR": l.unit ?? "CONFIRM",
    "Line total PKR": l.total ?? "CONFIRM",
  }));
  rows.push({ SKU: "", Piece: "TOTAL", Variant: "", Qty: units, Unit: "", "Unit price PKR": "", "Line total PKR": subtotal ?? "CONFIRM" });
  const meta = `Mehrusa wholesale enquiry,${stamp()}\nBusiness,${buyer.business}\nName,${buyer.name}\nCity,${buyer.city}\nPhone,${buyer.phone}\n\n`;
  download(new Blob(["\ufeff" + meta + Papa.unparse(rows)], { type: "text/csv;charset=utf-8" }), `mehrusa-line-sheet-${stamp()}.csv`);
};

/** The PDF renderer is imported only when the user taps download. */
export const downloadPDF = async (lines: ListLine[], buyer: Buyer) => {
  const [{ pdf }, { LineSheet }] = await Promise.all([import("@react-pdf/renderer"), import("@/pdf/LineSheet")]);
  const r = resolveLines(lines);
  const blob = await pdf(LineSheet({ lines: r, buyer, totals: summarise(r) })).toBlob();
  download(blob, `mehrusa-line-sheet-${stamp()}.pdf`);
};

/** Full-range catalogue PDF, generated in the browser on demand. */
export const downloadCatalogue = async () => {
  const [{ pdf }, { Catalogue }] = await Promise.all([import("@react-pdf/renderer"), import("@/pdf/Catalogue")]);
  const blob = await pdf(Catalogue()).toBlob();
  download(blob, `mehrusa-catalogue-${stamp()}.pdf`);
};
