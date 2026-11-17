import { toast } from "sonner";
import { Dialog } from "../ui/overlays";
import { Button, ButtonLink } from "../ui/Button";
import { useList, useUI } from "@/store/list";
import { buildOrderText } from "@/lib/message";
import { downloadPDF } from "@/lib/export";
import { isConfirmed, terms } from "@/config/terms";
import { Confirm } from "../ui/bits";

/** After sending: reassure, set expectations, and offer a way out if WhatsApp did not open. */
export function SentDialog() {
  const via = useUI((s) => s.sentVia);
  const setVia = useUI((s) => s.setSentVia);
  const lines = useList((s) => s.lines);
  const buyer = useList((s) => s.buyer);
  const clear = useList((s) => s.clear);
  const steps = [
    { t: "We read your list", d: "Your message arrives with every piece, colour and quantity." },
    { t: "We reply", d: isConfirmed(terms.replyPromise) ? `We reply ${terms.replyPromise}.` : "We reply to confirm stock, shipping and the final price." },
    { t: "You confirm and pay", d: "Only after you agree. Nothing is charged on this site." },
    { t: "Packed and sent", d: "Wrapped in pearl tissue and boxed in midnight." },
  ];
  return (
    <Dialog open={!!via} onOpenChange={(o) => !o && setVia(null)} title="Your enquiry is on its way" description={via === "whatsapp" ? "WhatsApp should have opened with your message ready. Press send there." : "Your email app should have opened with your message ready. Press send there."}>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.t} className="grid grid-cols-[28px_1fr] gap-3">
            <span className="num mt-0.5 grid h-7 w-7 rotate-45 place-items-center border border-gold-deep"><span className="-rotate-45 text-[0.8125rem]">{i + 1}</span></span>
            <span><span className="block font-medium">{s.t}</span><span className="block text-[0.9375rem] opacity-85">{s.d}</span></span>
          </li>
        ))}
      </ol>
      {!isConfirmed(terms.replyPromise) && <p className="mt-2 text-[0.8125rem]"><Confirm label="[CONFIRM] reply time" /></p>}
      <div className="mt-6 border-t rule pt-4">
        <p className="text-[0.9375rem] font-medium">Did it not open?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(buildOrderText(lines, buyer)); toast("Message copied. Paste it into WhatsApp."); } catch { toast("Copy did not work here. Try the PDF."); } }}>Copy message</Button>
          <Button size="sm" variant="secondary" onClick={() => downloadPDF(lines, buyer).catch(() => toast("The PDF could not be made."))}>Download PDF</Button>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => { clear(); setVia(null); toast("List cleared. It is saved under Order again."); }}>Start a new list</Button>
        <ButtonLink variant="ghost" to="/list" onClick={() => setVia(null)}>Keep this list</ButtonLink>
      </div>
    </Dialog>
  );
}
