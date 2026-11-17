import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Copy, Download, FileText, Link2, Mail, RotateCcw, Trash2, X } from "lucide-react";
import { shareUrl } from "@/lib/share";
import { getCategory } from "@/data/categories";
import { getProduct } from "@/data/products";
import { t } from "@/i18n/strings";
import { buildOrderText, buildOrderWaLink, emailReady, mailLink, resolveLines, summarise, whatsappReady, type ResolvedLine } from "@/lib/message";
import { downloadCSV, downloadPDF } from "@/lib/export";
import { fmtNum, fmtPKR } from "@/lib/pricing";
import { useList, useUI } from "@/store/list";
import { useMemory, type PastEnquiry } from "@/store/memory";
import { ProductImage } from "../catalogue/ProductImage";
import { TierProgress } from "../product/OrderBuilder";
import { Button, ButtonA, ButtonLink } from "../ui/Button";
import { Confirm, ConfirmText, Stepper } from "../ui/bits";
import { ConfirmDialog } from "../ui/overlays";

export function ListLines({ onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const lines = useList((s) => s.lines);
  const setQty = useList((s) => s.setQty);
  const remove = useList((s) => s.remove);
  const r = resolveLines(lines);
  if (!r.length) {
    return (
      <div className="py-10">
        <p className="text-lead">{t.emptyList}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/shop" onClick={onNavigate}>{t.browse}</ButtonLink>
          <Button variant="secondary" onClick={() => { onNavigate?.(); useUI.getState().setAssistantOpen(true); }}>Build my first order</Button>
        </div>
        <PastEnquiries onNavigate={onNavigate} />
      </div>
    );
  }
  // Group variant lines under their piece, so tiers and minimums read per piece
  const groups = r.reduce<Record<string, ResolvedLine[]>>((acc, l) => ((acc[l.productId] ??= []).push(l), acc), {});
  return (
    <ul className="border-t rule">
      {Object.values(groups).map((g) => {
        const p = g[0].product;
        const units = g[0].productUnits;
        const groupTotal = g.every((l) => l.total !== null) ? g.reduce((a, l) => a + (l.total ?? 0), 0) : null;
        return (
          <li key={p.id} className="border-b rule py-4">
            <div className="grid grid-cols-[56px_1fr] gap-4 sm:grid-cols-[72px_1fr]">
              <Link to={`/product/${p.id}`} onClick={onNavigate}>
                <ProductImage texture={p.images[0]} glyph={getCategory(p.categorySlug)?.glyph ?? "ring"} pid={p.id} alt={p.name} label={false} />
              </Link>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/product/${p.id}`} onClick={onNavigate} className="font-medium hover:underline">{p.name}</Link>
                    <p className="num text-[0.8125rem] opacity-75">{p.sku} · <ConfirmText text={fmtPKR(g[0].unit)} /> each</p>
                  </div>
                  <p className="num shrink-0 text-right text-[0.9375rem] font-medium">{fmtNum(units)} <span className="font-normal opacity-75">units</span><br /><span className="text-[0.8125rem] font-normal"><ConfirmText text={fmtPKR(groupTotal)} /></span></p>
                </div>
                <div className="mt-3"><TierProgress p={p} units={units} compact /></div>
              </div>
            </div>
            <ul className="mt-3 space-y-2 sm:pl-[88px]">
              {g.map((l) => (
                <li key={l.key} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
                    <span className="h-3 w-3 shrink-0 border border-current/30" style={{ background: p.colours.find((c) => c.name === l.colour)?.hex }} aria-hidden />
                    {l.colour}{l.option !== "One size" && <span className="opacity-75">/ {l.option}</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    <Stepper size="sm" value={l.qty} min={1} onChange={(n) => setQty(l.key, n)} label={`Quantity for ${p.name}, ${l.colour} ${l.option}`} />
                    <button type="button" onClick={() => { remove(l.key); toast(`Removed ${p.name}, ${l.colour}.`, { action: { label: "Undo", onClick: () => useList.getState().restore([{ key: l.key, productId: l.productId, colour: l.colour, option: l.option, qty: l.qty }], "merge") } }); }} className="grid h-11 w-11 place-items-center opacity-70 hover:opacity-100" aria-label={`Remove ${p.name}, ${l.colour} ${l.option}`}>
                      <Trash2 size={16} strokeWidth={1.4} aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

export function PastEnquiries({ onNavigate }: { onNavigate?: () => void }) {
  const history = useMemory((s) => s.history);
  const forget = useMemory((s) => s.forget);
  const restore = useList((s) => s.restore);
  if (!history.length) return null;
  const again = (h: PastEnquiry, mode: "replace" | "merge") => {
    const lines = h.lines.filter((l) => getProduct(l.productId));
    restore(lines, mode);
    toast(mode === "replace" ? "Your earlier list is back." : "Earlier pieces added to your list.");
    onNavigate?.();
  };
  return (
    <section className="mt-12" aria-labelledby="past">
      <h2 id="past" className="eyebrow mb-3">Order again</h2>
      <ul className="border-t rule">
        {history.slice(0, 5).map((h) => (
          <li key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b rule py-3">
            <span className="num min-w-0 flex-1 text-[0.9375rem]">
              {new Date(h.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {fmtNum(h.units)} units · {new Set(h.lines.map((l) => l.productId)).size} pieces
              <span className="block text-[0.8125rem] opacity-70">Sent by {h.via === "whatsapp" ? "WhatsApp" : h.via === "email" ? "email" : h.via.toUpperCase()}</span>
            </span>
            <button type="button" onClick={() => again(h, "replace")} className="inline-flex min-h-11 items-center gap-2 border rule px-3 text-[0.875rem] hover:border-current"><RotateCcw size={15} strokeWidth={1.4} aria-hidden />Order again</button>
            <button type="button" onClick={() => forget(h.id)} className="grid h-11 w-11 place-items-center opacity-60 hover:opacity-100" aria-label="Forget this enquiry"><X size={16} strokeWidth={1.4} aria-hidden /></button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.8125rem] opacity-70">Kept only in this browser.</p>
    </section>
  );
}

export function ListSummary() {
  const lines = useList((s) => s.lines);
  const r = resolveLines(lines);
  const { units, subtotal } = summarise(r);
  const pieces = new Set(r.map((l) => l.productId)).size;
  const under = new Set(r.filter((l) => l.productUnits < l.product.wholesale.minOrderQty).map((l) => l.productId)).size;
  return (
    <div className="space-y-2">
      <div className="num flex justify-between"><span>Pieces</span><span>{pieces}</span></div>
      <div className="num flex justify-between"><span>Total units</span><span>{fmtNum(units)}</span></div>
      <div className="num flex justify-between text-[1.125rem] font-medium"><span>Subtotal</span><span><ConfirmText text={fmtPKR(subtotal)} /></span></div>
      {under > 0 && <p className="text-[0.875rem] text-laal-deep">{under} {under === 1 ? "piece is" : "pieces are"} under the minimum. You can still send; we will talk it through.</p>}
      <p className="border-l-2 border-gold pl-3 pt-1 text-[0.9375rem] opacity-90">{t.enquiryNote}</p>
    </div>
  );
}

export function BuyerFields() {
  const buyer = useList((s) => s.buyer);
  const setBuyer = useList((s) => s.setBuyer);
  const fields: { k: keyof typeof buyer; label: string; type?: string; auto?: string }[] = [
    { k: "name", label: "Your name", auto: "name" },
    { k: "business", label: "Shop or business name", auto: "organization" },
    { k: "city", label: "City", auto: "address-level2" },
    { k: "phone", label: "Phone (WhatsApp)", type: "tel", auto: "tel" },
  ];
  return (
    <fieldset>
      <legend className="sr-only">Your details (optional)</legend>
      <p className="mb-4 text-[0.875rem] opacity-80">Optional, and kept only in this browser. Filled once, remembered next time.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.k} className="block">
            <span className="mb-1.5 block text-[0.875rem] font-medium">{f.label}</span>
            <input className="field" type={f.type ?? "text"} autoComplete={f.auto} value={buyer[f.k]} onChange={(e) => setBuyer({ [f.k]: e.target.value })} />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[0.875rem] font-medium">Notes</span>
          <textarea className="field min-h-24" placeholder="Delivery date, mix of colours, gift boxes..." value={buyer.notes} onChange={(e) => setBuyer({ notes: e.target.value })} />
        </label>
      </div>
    </fieldset>
  );
}

export function ListActions() {
  const lines = useList((s) => s.lines);
  const buyer = useList((s) => s.buyer);
  const clear = useList((s) => s.clear);
  const remember = useMemory((s) => s.remember);
  const setSentVia = useUI((s) => s.setSentVia);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!lines.length) return null;

  const wa = buildOrderWaLink(lines, buyer);
  const text = buildOrderText(lines, buyer);
  const units = lines.reduce((a, l) => a + l.qty, 0);
  const log = (via: PastEnquiry["via"]) => remember({ via, lines, units });

  const pdf = async () => {
    setBusy(true);
    try { await downloadPDF(lines, buyer); log("pdf"); toast("Line sheet downloaded."); } catch { toast("The PDF could not be made. Please try the CSV instead."); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      {wa.url ? (
        <ButtonA href={wa.url} target="_blank" rel="noopener noreferrer" className="w-full" onClick={() => { log("whatsapp"); setTimeout(() => setSentVia("whatsapp"), 700); }}>Send on WhatsApp</ButtonA>
      ) : (
        <div className="border border-laal/50 p-3 text-[0.9375rem]">
          This list is too long for one WhatsApp message. Please download the line sheet and send it on WhatsApp as a file.
          <Button className="mt-3 w-full" onClick={pdf} disabled={busy}>Download line sheet (PDF)</Button>
        </div>
      )}
      {wa.trimmed && wa.url && <p className="text-[0.8125rem] opacity-80">Your notes were shortened to fit in WhatsApp. The full notes are in the PDF.</p>}
      {!whatsappReady() && <p className="text-[0.8125rem]"><Confirm label="[CONFIRM] WhatsApp number" /> The link opens WhatsApp without a recipient until the number is added.</p>}
      <div className="grid grid-cols-2 gap-3">
        <ButtonA variant="secondary" size="sm" href={mailLink("Wholesale enquiry from " + (buyer.business || "a buyer"), text)} onClick={() => { log("email"); setTimeout(() => setSentVia("email"), 700); }}><Mail size={16} strokeWidth={1.4} aria-hidden />Email</ButtonA>
        <Button variant="secondary" size="sm" onClick={pdf} disabled={busy}><FileText size={16} strokeWidth={1.4} aria-hidden />{busy ? "Preparing..." : "PDF"}</Button>
        <Button variant="secondary" size="sm" onClick={() => { downloadCSV(lines, buyer); log("csv"); }}><Download size={16} strokeWidth={1.4} aria-hidden />CSV</Button>
        <Button variant="secondary" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(text); log("copy"); toast("Summary copied."); } catch { toast("Copy did not work here. Please use email or PDF."); } }}><Copy size={16} strokeWidth={1.4} aria-hidden />Copy</Button>
      </div>
      {!emailReady() && <p className="text-[0.8125rem]"><Confirm label="[CONFIRM] email address" /></p>}
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-center gap-2 border border-dashed border-current/40 text-[0.875rem] hover:border-current"
        onClick={async () => {
          const url = shareUrl(lines);
          try {
            if (navigator.share) await navigator.share({ title: "Mehrusa wholesale list", text: "Please review this list before we order.", url });
            else { await navigator.clipboard.writeText(url); toast("Link copied. Send it to your partner or manager."); }
          } catch { /* user closed the share sheet */ }
        }}
      >
        <Link2 size={16} strokeWidth={1.4} aria-hidden /> Share this list for review
      </button>
      <p className="-mt-1 text-center text-[0.75rem] opacity-70">The link carries pieces and quantities only, never your details.</p>
      <details className="text-[0.875rem]">
        <summary className="min-h-11 cursor-pointer content-center">Preview the message</summary>
        <pre className="num mt-2 max-h-64 overflow-auto whitespace-pre-wrap border rule bg-pearl p-3 font-sans text-[0.8125rem]">{text}</pre>
      </details>
      <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>Clear list</Button>
      <ConfirmDialog open={confirmClear} onOpenChange={setConfirmClear} title="Clear your list?" description="Every piece will be removed from this list. Your details stay saved." confirmLabel="Clear list" onConfirm={() => { const before = lines; clear(); toast("Your list is clear.", { action: { label: "Undo", onClick: () => useList.getState().restore(before, "replace") } }); }} />
    </div>
  );
}
