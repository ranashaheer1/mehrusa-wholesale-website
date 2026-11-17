import { scrollToTarget } from "@/lib/smooth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categories } from "@/data/categories";
import { t, ur } from "@/i18n/strings";
import { mailLink, waLink, whatsappReady } from "@/lib/message";
import { Button, ButtonA } from "@/components/ui/Button";
import { Confirm, PageHeader, Urdu, usePageMeta } from "@/components/ui/bits";
import { Mark } from "@/components/ui/Brand";

const sizes = ["Under 50 pieces", "50 to 150 pieces", "150 to 500 pieces", "Over 500 pieces", "Not sure yet"];
const sources = ["Instagram", "WhatsApp", "A friend or another shop", "Market or exhibition", "Search", "Other"];

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name so we know who to reply to."),
  business: z.string().trim().min(2, "Please enter your shop or business name. If you sell from home, your own name is fine."),
  city: z.string().trim().min(2, "Please enter your city so we can plan delivery."),
  country: z.string().trim().min(2, "Please enter your country."),
  phone: z.string().trim().regex(/^[+0-9 ()-]{10,18}$/, t.phoneError),
  online: z.string().trim().max(200, "Please keep this under 200 characters.").optional().or(z.literal("")),
  sells: z.string().trim().min(3, "Please tell us a little about what you sell, for example abayas, gifts or accessories."),
  interests: z.array(z.string()).min(1, "Please choose at least one category you are interested in."),
  orderSize: z.string().min(1, "Please choose an expected first order size. 'Not sure yet' is fine."),
  source: z.string().optional(),
  notes: z.string().max(1000, "Please keep notes under 1000 characters.").optional(),
});
type Form = z.infer<typeof schema>;

function FieldWrap({ id, label, error, hint, children, optional }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">{label}{optional && <span className="ml-2 text-[0.875rem] font-normal opacity-75">optional</span>}</label>
      {hint && <p id={`${id}-hint`} className="mb-2 text-[0.875rem] opacity-80">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-[0.9375rem] text-laal-deep" role="alert">{error}</p>}
    </div>
  );
}

const toText = (d: Form) =>
  [
    "Assalam o alaikum Mehrusa, I would like to apply for wholesale.",
    "",
    `Name: ${d.name}`,
    `Business: ${d.business}`,
    `City: ${d.city}, ${d.country}`,
    `Phone (WhatsApp): ${d.phone}`,
    d.online ? `Instagram / website: ${d.online}` : "",
    `What I sell: ${d.sells}`,
    `Interested in: ${d.interests.join(", ")}`,
    `Expected first order: ${d.orderSize}`,
    d.source ? `Heard about you through: ${d.source}` : "",
    d.notes ? `Notes: ${d.notes}` : "",
  ].filter(Boolean).join("\n");

export default function Apply() {
  usePageMeta("Apply for wholesale", "Apply to buy Mehrusa jewellery wholesale. Your application is sent to us on WhatsApp or email.");
  const [sent, setSent] = useState<Form | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { country: "Pakistan", interests: [], orderSize: "" },
  });
  const a = (k: keyof Form) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });

  if (sent) {
    const text = toText(sent);
    return (
      <section className="surface-night">
        <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <Mark variant="foil" size={48} />
          <Urdu display className="mt-6 text-h3 text-gold">{ur.thanks}</Urdu>
          <h1 className="mt-2 text-h2">Your application is ready to send.</h1>
          <p className="mt-4 max-w-[50ch] text-lead opacity-90">One more step: send it to us on WhatsApp or email. We will reply about the next steps.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonA href={waLink(text)} target="_blank" rel="noopener noreferrer">Send this application on WhatsApp</ButtonA>
            <ButtonA variant="secondary" href={mailLink(`Wholesale application: ${sent.business}`, text)}>Send by email instead</ButtonA>
          </div>
          {!whatsappReady() && <p className="mt-4"><Confirm label="[CONFIRM] WhatsApp number and email" /></p>}
          <p className="mt-6 max-w-[50ch] text-[0.875rem] opacity-80">{t.nothingStored}</p>
          <Button variant="ghost" className="mt-4" onClick={() => setSent(null)}>Edit my answers</Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Wholesale" title="Apply for wholesale" urdu={ur.welcome} intro="Tell us about your shop. It takes about two minutes. Labels marked optional can be left empty." />
      <section className="surface-pearl">
        <div className="container-x grid gap-12 py-12 lg:grid-cols-[61.8fr_38.2fr] lg:pb-[84px]">
          <form noValidate onSubmit={handleSubmit((d) => { setSent(d); scrollToTarget(0, { immediate: true }); })} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldWrap id="name" label="Your name" error={errors.name?.message}><input id="name" className="field" autoComplete="name" {...register("name")} {...a("name")} /></FieldWrap>
              <FieldWrap id="business" label="Shop or business name" error={errors.business?.message}><input id="business" className="field" autoComplete="organization" {...register("business")} {...a("business")} /></FieldWrap>
              <FieldWrap id="city" label="City" error={errors.city?.message}><input id="city" className="field" autoComplete="address-level2" {...register("city")} {...a("city")} /></FieldWrap>
              <FieldWrap id="country" label="Country" error={errors.country?.message}><input id="country" className="field" autoComplete="country-name" {...register("country")} {...a("country")} /></FieldWrap>
              <FieldWrap id="phone" label="Phone (WhatsApp)" hint="Include the country code, for example +92." error={errors.phone?.message}><input id="phone" type="tel" className="field" autoComplete="tel" inputMode="tel" {...register("phone")} {...a("phone")} /></FieldWrap>
              <FieldWrap id="online" label="Instagram or website" optional error={errors.online?.message}><input id="online" className="field" {...register("online")} {...a("online")} /></FieldWrap>
            </div>
            <FieldWrap id="sells" label="What you sell" error={errors.sells?.message}><input id="sells" className="field" {...register("sells")} {...a("sells")} /></FieldWrap>
            <fieldset aria-describedby={errors.interests ? "interests-error" : undefined}>
              <legend className="mb-2 font-medium">Which categories interest you</legend>
              <div className="grid gap-x-6 sm:grid-cols-2">
                {categories.map((c) => (
                  <label key={c.slug} className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="checkbox" value={c.name.en} {...register("interests")} className="h-5 w-5 accent-[#0F1938]" />
                    <span>{c.name.en}{c.status === "coming-soon" && <span className="ml-2 text-[0.8125rem] opacity-75">opening soon</span>}</span>
                  </label>
                ))}
              </div>
              {errors.interests && <p id="interests-error" className="mt-1.5 text-[0.9375rem] text-laal-deep" role="alert">{errors.interests.message}</p>}
            </fieldset>
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldWrap id="orderSize" label="Expected first order size" error={errors.orderSize?.message}>
                <select id="orderSize" className="field" {...register("orderSize")} {...a("orderSize")}><option value="">Choose one</option>{sizes.map((s) => <option key={s}>{s}</option>)}</select>
              </FieldWrap>
              <FieldWrap id="source" label="How you heard about us" optional>
                <select id="source" className="field" {...register("source")}><option value="">Choose one</option>{sources.map((s) => <option key={s}>{s}</option>)}</select>
              </FieldWrap>
            </div>
            <FieldWrap id="notes" label="Notes" optional error={errors.notes?.message}><textarea id="notes" className="field min-h-32" {...register("notes")} {...a("notes")} /></FieldWrap>
            <div>
              <Button type="submit">Review and send</Button>
              <p className="mt-3 text-[0.9375rem] opacity-85"><em>{t.nothingStored}</em></p>
            </div>
          </form>
          <aside className="lg:pt-8">
            <div className="surface-night p-6 lg:p-8">
              <p className="eyebrow mb-3">Who we work with</p>
              <ul className="space-y-2 opacity-90">
                <li>Boutiques and modest-wear shops</li>
                <li>Online resellers and Instagram stores</li>
                <li>Gifting companies and event planners</li>
                <li>Market and exhibition sellers</li>
              </ul>
              <p className="mt-6 text-[0.9375rem] opacity-85">Selling to individual customers <Confirm label="[CONFIRM] policy" /></p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
