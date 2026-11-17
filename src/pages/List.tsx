import { useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { decodeList } from "@/lib/share";
import { fmtNum } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { BuyerFields, ListActions, ListLines, ListSummary, PastEnquiries } from "@/components/list/ListContent";
import { PageHeader, Reveal, usePageMeta } from "@/components/ui/bits";
import { useList } from "@/store/list";
import { cn } from "@/utils/cn";

function Step({ n, title, done, children, id }: { n: number; title: string; done?: boolean; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="relative">
      <div className="mb-4 flex items-center gap-4">
        <span className={cn("num grid h-10 w-10 shrink-0 rotate-45 place-items-center border transition-colors duration-[618ms]", done ? "border-gold-deep bg-gold-deep" : "border-current/40")} aria-hidden>
          <span className={cn("-rotate-45 font-display", done && "text-pearl")}>{n}</span>
        </span>
        <h2 id={id} className="text-h4">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function ListPage() {
  usePageMeta("My enquiry list", "Review your wholesale enquiry and send it on WhatsApp or email, or download a line sheet.");
  const has = useList((s) => s.lines.length > 0);
  const buyer = useList((s) => s.buyer);
  const detailsDone = !!(buyer.business || buyer.name) && !!buyer.phone;
  const [params, setParams] = useSearchParams();
  const shared = useMemo(() => decodeList(params.get("shared") ?? ""), [params]);
  const restore = useList((s) => s.restore);
  const done = (msg?: string) => { setParams({}, { replace: true }); if (msg) toast(msg); };
  return (
    <>
      <PageHeader eyebrow="Enquiry list" title="My list" intro="Three steps: check your pieces, add your details, send. We reply on WhatsApp to confirm stock, shipping and the final price." />
      {shared.length > 0 && (
        <div className="surface-night border-b hairline-gold" role="region" aria-label="Shared list">
          <div className="container-x flex flex-wrap items-center gap-4 py-4">
            <p className="min-w-0 flex-1"><span className="eyebrow mr-3">Shared with you</span>A list of {new Set(shared.map((l) => l.productId)).size} pieces, <span className="num">{fmtNum(shared.reduce((a, l) => a + l.qty, 0))}</span> units.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => { restore(shared, has ? "merge" : "replace"); done(has ? "Added to your list." : "The shared list is now your list."); }}>{has ? "Add to my list" : "Use this list"}</Button>
              {has && <Button size="sm" variant="secondary" onClick={() => { restore(shared, "replace"); done("Your list was replaced."); }}>Replace mine</Button>}
              <Button size="sm" variant="ghost" onClick={() => done()}>Ignore</Button>
            </div>
          </div>
        </div>
      )}
      <section className="surface-pearl">
        <div className="container-x grid gap-12 py-10 lg:grid-cols-[61.8fr_38.2fr] lg:gap-14 lg:pb-[84px]">
          <div className="space-y-14">
            <Step n={1} id="s1" title="Review your pieces" done={has}>
              <ListLines />
            </Step>
            {has && (
              <Reveal>
                <Step n={2} id="s2" title="Your details" done={detailsDone}>
                  <BuyerFields />
                </Step>
              </Reveal>
            )}
            {has && <PastEnquiries />}
          </div>
          {has && (
            <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Summary and send">
              <Step n={3} id="s3" title="Send your enquiry">
                <div className="surface-light border rule p-5 lg:p-6">
                  <ListSummary />
                  <div className="mt-6"><ListActions /></div>
                </div>
              </Step>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
