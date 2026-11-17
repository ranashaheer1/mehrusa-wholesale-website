import { scrollToTarget } from "@/lib/smooth";
import { Link } from "react-router-dom";
import { materials } from "@/data/materials";
import { site, terms } from "@/config/terms";
import { ur } from "@/i18n/strings";
import { tex, textures, type TextureKey } from "@/lib/images";
import { mailLink, waLink, whatsappReady, emailReady } from "@/lib/message";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/overlays";
import { Confirm, ConfirmText, Eyebrow, PageHeader, Reveal, Urdu, Val, usePageMeta } from "@/components/ui/bits";
import { Mark } from "@/components/ui/Brand";

/* ---------------- Standards ---------------- */
export function Standards() {
  usePageMeta("Our standards", "What Mehrusa jewellery is made of, how it is finished and checked, and how to care for it. Facts only.");
  return (
    <>
      <PageHeader eyebrow="Transparency" title="Our standards" urdu={ur.standards} intro="We say what a material is, plainly. If a fact is not yet confirmed, it is marked as such and not claimed." />
      <section className="surface-pearl section">
        <div className="container-x grid gap-14">
          {materials.map((m) => (
            <Reveal key={m.slug}>
              <div className="grid gap-8 lg:grid-cols-[38.2fr_61.8fr] lg:gap-14">
                <div>
                  <Eyebrow className="mb-3">Material</Eyebrow>
                  <h2 className="text-h3">{m.name}</h2>
                  <p className="mt-4 opacity-90">{m.summary}</p>
                </div>
                <div>
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">{m.name} facts</caption>
                    <tbody>
                      {m.facts.filter((f) => f.verified || site.showConfirm).map((f) => (
                        <tr key={f.label} className="border-b rule">
                          <th scope="row" className="w-2/5 py-3 pr-4 align-top font-medium">{f.label}</th>
                          <td className="py-3"><ConfirmText text={f.value} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3 className="mt-8 font-sans text-[1.0625rem] font-medium">Care</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {m.care.filter((c) => c.verified || site.showConfirm).map((c) => <li key={c.text}><ConfirmText text={c.text} /></li>)}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="surface-night section">
        <div className="container-x grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Finishing", "How edges, surfaces and clasps are finished. [CONFIRM]"],
            ["Quality checks", "What is checked before a piece is boxed, and by whom. [CONFIRM]"],
            ["What we never say", "We do not call stainless steel gold, fine jewellery or precious. We do not claim a grade or test we cannot show."],
            ["Damaged on arrival", "How to report a damaged piece and what happens next. [CONFIRM]"],
          ].map(([h, b]) => (
            <div key={h} className="border-t hairline-gold pt-5">
              <h2 className="font-display text-h4">{h}</h2>
              <p className="mt-2 opacity-90"><ConfirmText text={b} /></p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------------- Packaging ---------------- */
export function Packaging() {
  usePageMeta("Packaging", "The Mehrusa unboxing: midnight box, pearl tissue, thank-you card and branded mailer.");
  const steps: { title: string; body: string; img: TextureKey }[] = [
    { title: "The branded mailer", body: "Your order arrives in a plain, sturdy mailer marked with the Mehrusa mark. Mailer material and size [CONFIRM].", img: "lime-wash" },
    { title: "Pearl tissue", body: "Inside, pieces are wrapped in pearl tissue so nothing rubs in transit.", img: "pearl-cotton-paper" },
    { title: "The midnight box", body: "Each piece, or each set, sits in a midnight box ready for your shelf or for gifting. Box per piece or per set [CONFIRM].", img: "black-sapphire-stone" },
    { title: "The thank-you card", body: "A small card with our sign-off: Made with care. Kept close. Space for your own shop's note [CONFIRM].", img: "gold-foil" },
  ];
  return (
    <>
      <PageHeader tone="night" eyebrow="Unboxing" title="Packed to be kept" urdu={ur.packaging} intro="What your customers open matters as much as what they wear. This is how every order is sent." />
      <section className="surface-night pb-[84px]">
        <div className="container-x grid gap-16">
          {steps.map((s, i) => (
            <Reveal key={s.title}>
              <div className={`grid items-center gap-8 lg:grid-cols-[61.8fr_38.2fr] lg:gap-14 ${i % 2 ? "lg:[&>*:first-child]:order-2 lg:grid-cols-[38.2fr_61.8fr]" : ""}`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img decoding="async" src={tex(s.img)} alt={`${textures[s.img].label}, placeholder for the ${s.title.toLowerCase()} photograph`} loading="lazy" className="h-full w-full object-cover" />
                  {s.img === "black-sapphire-stone" && <div className="absolute inset-0 grid place-items-center"><div className="grid aspect-square w-1/3 place-items-center border hairline-gold bg-night"><Mark variant="foil" size={56} /></div></div>}
                  <span className="absolute bottom-3 left-3 bg-night-deep/80 px-2 py-0.5 text-[0.75rem]">Photo coming</span>
                </div>
                <div>
                  <p className="num font-display text-h3 text-gold">0{i + 1}</p>
                  <h2 className="mt-2 text-h3">{s.title}</h2>
                  <p className="mt-3 text-lead opacity-90"><ConfirmText text={s.body} /></p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------------- Terms ---------------- */
export function Terms() {
  usePageMeta("Wholesale terms", "Mehrusa wholesale terms: minimum order, price tiers, payment, shipping, lead times, returns and sample pack.");
  const rows: [string, string][] = [
    ["Minimum order per piece", terms.moqRule],
    ["Minimum order value", terms.orderMinimum],
    ["Price tiers", terms.tierNote],
    ["Payment", terms.paymentTerms],
    ["Shipping in Pakistan", terms.shipping],
    ["Shipping outside Pakistan", terms.shippingInternational],
    ["Lead time, in stock", terms.leadTime],
    ["Lead time, made to order", terms.madeToOrderLeadTime],
    ["Returns and damage", terms.returnsDamage],
    ["Sample pack price", terms.samplePackPrice],
    ["Sample pack contents", terms.samplePackContents],
  ];
  return (
    <>
      <PageHeader eyebrow="Wholesale" title="Terms" intro="The plain rules of buying from us. Anything not yet confirmed is marked, and nothing here is final until we confirm your order on WhatsApp." />
      <section className="surface-pearl section">
        <div className="container-x grid gap-12 lg:grid-cols-[61.8fr_38.2fr]">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Wholesale terms</caption>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b rule">
                  <th scope="row" className="w-2/5 py-4 pr-4 align-top font-medium">{k}</th>
                  <td className="py-4"><Val v={v} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <aside className="surface-night h-fit p-6 lg:p-8">
            <p className="eyebrow mb-3">How an order works</p>
            <ol className="list-decimal space-y-2 pl-5 opacity-90">
              <li>Build a list on this site.</li>
              <li>Send it on WhatsApp or email.</li>
              <li>We confirm stock, shipping and the final price.</li>
              <li>You pay as agreed, and we pack and send.</li>
            </ol>
            <p className="mt-6 text-[0.9375rem] opacity-85">No payment is taken on this website.</p>
            <ButtonLink to="/shop" className="mt-6">Browse the range</ButtonLink>
          </aside>
        </div>
      </section>
    </>
  );
}

/* ---------------- FAQ ---------------- */
export function FAQ() {
  usePageMeta("Questions", "Answers about buying Mehrusa jewellery wholesale: ordering, materials, payment, shipping and samples.");
  const groups: { title: string; items: [string, React.ReactNode][] }[] = [
    { title: "Buying wholesale", items: [
      ["Do you sell to individual customers?", <>This site is for shops and resellers. Our policy for individual buyers <Confirm />.</>],
      ["What is the minimum order?", <Val v={terms.moqRule} />],
      ["Can I mix colours and sizes?", <>On each product page the minimum is counted across all its colours and sizes. Final mixing rules <Confirm />.</>],
      ["How do price tiers work?", <>The more of one piece you order, the lower the unit price. The tier table on each product shows the bands. Prices <Confirm />.</>],
    ] },
    { title: "Ordering and payment", items: [
      ["Is there a faster way to order many pieces?", <>Yes. The <Link to="/quick-order" className="link">quick order pad</Link> shows every SKU on one sheet, and you can paste SKUs and quantities straight from your notes. Press / anywhere to search.</>],
      ["Can I reorder a past enquiry?", "Yes. Every list you send is remembered in this browser. Open My list and choose Order again."],
      ["Do I pay on this website?", "No. Your list is an enquiry. We confirm availability, shipping and final price on WhatsApp, then agree payment with you."],
      ["What payment methods do you take?", <Val v={terms.paymentTerms} />],
      ["Can I get a sample pack first?", <>Yes, you can ask for one. Price: <Val v={terms.samplePackPrice} />. Contents: <Val v={terms.samplePackContents} />.</>],
    ] },
    { title: "Materials", items: [
      ["Is the jewellery gold?", "No. It is stainless steel. Some pieces are gold-coloured; that is the colour of the finish, not the metal. We will name the finish process once confirmed."],
      ["What grade of steel is it?", <>Grade <Confirm />. We will not state a grade until we can show it.</>],
      ["How should my customers care for it?", "Wipe with a soft dry cloth and store each piece in its pouch. Further advice will follow once the finish is confirmed."],
    ] },
    { title: "Delivery", items: [
      ["How long does dispatch take?", <Val v={terms.leadTime} />],
      ["Do you ship outside Pakistan?", <Val v={terms.shippingInternational} />],
      ["What if something arrives damaged?", <Val v={terms.returnsDamage} />],
    ] },
  ];
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Questions, answered" intro="If your question is not here, ask us on WhatsApp." />
      <section className="surface-pearl section">
        <div className="container-x grid gap-12 lg:grid-cols-[38.2fr_61.8fr]">
          <nav aria-label="Question groups" className="hidden lg:block">
            <ul className="sticky top-28 space-y-2">{groups.map((g) => <li key={g.title}><a className="link" href={`#/faq`} onClick={(e) => { e.preventDefault(); const el = document.getElementById(g.title); if (el) scrollToTarget(el, { offset: -96 }); }}>{g.title}</a></li>)}</ul>
          </nav>
          <div className="space-y-12">
            {groups.map((g) => (
              <div key={g.title} id={g.title} className="scroll-mt-28">
                <h2 className="mb-4 text-h3">{g.title}</h2>
                <Accordion type="single" items={g.items.map(([q, a], i) => ({ id: `${g.title}-${i}`, title: q, body: a }))} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- Contact ---------------- */
export function Contact() {
  usePageMeta("Contact", "Contact Mehrusa wholesale on WhatsApp or by email.");
  return (
    <>
      <PageHeader tone="night" eyebrow="Contact" title="Talk to us" urdu="بات کیجیے" intro="WhatsApp is the fastest way to reach us. Email works too." />
      <section className="surface-pearl section">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <div className="border hairline-gold p-6 lg:p-10">
            <p className="eyebrow">First choice</p>
            <h2 className="mt-2 text-h3">WhatsApp</h2>
            <p className="num mt-3 text-lead"><Val v={terms.whatsappNumber} fallback="Number" /></p>
            <ButtonA href={waLink("Assalam o alaikum Mehrusa, I have a wholesale question.")} target="_blank" rel="noopener noreferrer" className="mt-6">Message on WhatsApp</ButtonA>
            {!whatsappReady() && <p className="mt-3 text-[0.875rem] opacity-80">The button opens WhatsApp without a recipient until the number is added.</p>}
          </div>
          <div className="border rule p-6 lg:p-10">
            <p className="eyebrow">Also</p>
            <h2 className="mt-2 text-h3">Email</h2>
            <p className="mt-3 text-lead"><Val v={terms.email} fallback="Address" /></p>
            <ButtonA variant="secondary" href={mailLink("Wholesale question", "Assalam o alaikum Mehrusa,\n\n")} className="mt-6">Write an email</ButtonA>
            {!emailReady() && <p className="mt-3 text-[0.875rem] opacity-80">The email opens without a recipient until the address is added.</p>}
          </div>
          <dl className="grid gap-4 md:col-span-2 md:grid-cols-3">
            <div><dt className="eyebrow">Hours</dt><dd className="mt-1"><Val v={terms.businessHours} /></dd></div>
            <div><dt className="eyebrow">Based in</dt><dd className="mt-1"><Val v={terms.city} /></dd></div>
            <div><dt className="eyebrow">Instagram</dt><dd className="mt-1"><Val v={terms.instagram} /></dd></div>
          </dl>
        </div>
      </section>
    </>
  );
}

/* ---------------- Journal (placeholder route, removable) ---------------- */
export function Journal() {
  usePageMeta("Journal", "Notes from Mehrusa.");
  return (
    <section className="surface-night">
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Eyebrow>Journal</Eyebrow>
        <h1 className="mt-3 text-h2">Notes, kept for later.</h1>
        <Urdu display className="mt-3 text-h4 text-gold">{ur.careKept}</Urdu>
        <p className="mt-4 max-w-[46ch] opacity-85">Stories about materials, packing and the women who wear our pieces will live here.</p>
        <Link to="/shop" className="link mt-8">Browse the range meanwhile</Link>
      </div>
    </section>
  );
}
