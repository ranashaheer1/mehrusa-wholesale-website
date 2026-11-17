import { ButtonLink } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Brand";
import { Urdu, usePageMeta } from "@/components/ui/bits";
import { t } from "@/i18n/strings";

export default function NotFound() {
  usePageMeta("Page not found");
  return (
    <section className="surface-night">
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <Mark variant="foil" size={56} />
        <p className="eyebrow mt-8">404</p>
        <h1 className="mt-3 text-h2">Not here, but not lost.</h1>
        <p className="mt-4 max-w-[44ch] text-lead opacity-90">{t.notFound}</p>
        <Urdu display className="mt-3 text-h4 text-gold">راستہ یہاں سے ہے</Urdu>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/">Go home</ButtonLink>
          <ButtonLink to="/shop" variant="secondary">{t.browse}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
