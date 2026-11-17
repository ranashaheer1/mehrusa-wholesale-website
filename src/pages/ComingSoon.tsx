import type { Category } from "@/data/types";
import { tex } from "@/lib/images";
import { waLink } from "@/lib/message";
import { t, ur } from "@/i18n/strings";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Reveal, Urdu, usePageMeta } from "@/components/ui/bits";

/** Driven entirely by category data (status: "coming-soon"). No email is captured or stored. */
export function ComingSoon({ category }: { category: Category }) {
  usePageMeta(`${category.name.en}, opening soon`, category.intro);
  const msg = `Assalam o alaikum Mehrusa, please tell me when ${category.name.en.toLowerCase()} open for wholesale.`;
  return (
    <section className="surface-night relative overflow-hidden">
      <img decoding="async" src={tex(category.coverImage)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
      <div className="container-x relative grid min-h-[70vh] items-center gap-10 py-20 lg:grid-cols-[61.8fr_38.2fr]">
        <Reveal>
          <Eyebrow className="mb-4">{t.openingSoon}</Eyebrow>
          <h1 className="text-h1">{category.name.en}</h1>
          {category.name.ur && <Urdu display className="mt-2 text-left text-h3 text-gold">{category.name.ur}</Urdu>}
          <p className="mt-6 max-w-[52ch] text-lead opacity-90">{category.intro} We are taking the time to get the fabric, the stitching and the sizing right before we offer it to you.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonA href={waLink(msg)} target="_blank" rel="noopener noreferrer">{t.tellMe}</ButtonA>
            <ButtonLink to="/shop" variant="secondary">See the jewellery</ButtonLink>
          </div>
          <p className="mt-4 text-[0.875rem] opacity-75">This opens WhatsApp with a short message. Nothing is stored on this website.</p>
        </Reveal>
        <Reveal delay={0.15} className="hidden lg:block">
          <div className="border hairline-gold p-10 text-center">
            <Urdu display className="text-h3 text-gold">{ur.openingSoon}</Urdu>
            <p className="tagline mt-4 text-h4 text-gold-light">Stitched slowly. Sent with care.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
