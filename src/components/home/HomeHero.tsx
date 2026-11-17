import { Fragment, type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { t } from "@/i18n/strings";
import { tex } from "@/lib/images";
import { fetchActiveHero, mediaUrl, type ApiHero } from "@/lib/api";
import { useUI } from "@/store/list";
import { ButtonLink } from "../ui/Button";
import { HeroFacets } from "./HeroFacets";
import { LivingJali } from "./LivingJali";
import { cn } from "@/utils/cn";

const fallbackReasons = ["Mix colours and sizes to reach minimums", "Order on WhatsApp", "Pay only after we confirm"];

/**
 * Brand-first hero with marketing clarity.
 * Text/CTAs/reasons load from Laravel admin API when available.
 */
export function HomeHero({ footer }: { footer?: ReactNode }) {
  const openAssistant = useUI((s) => s.setAssistantOpen);
  const [hero, setHero] = useState<ApiHero | null>(null);

  useEffect(() => {
    let alive = true;
    fetchActiveHero().then((data) => {
      if (alive) setHero(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  const eyebrow = hero?.eyebrow || "Mehrusa Wholesale";
  const line1 = hero?.headline_line_1 || "Veiled in grace.";
  const line2 = hero?.headline_line_2 || "Crowned in light.";
  const support = hero?.supporting_text || "Modest stainless steel jewellery, made with care and boxed ready to sell.";
  const supportStrong =
    hero?.supporting_text_strong || "Wholesale for boutiques, online stores and gifting companies across Pakistan.";
  const primaryLabel = hero?.primary_cta_label || t.browse;
  const primaryUrl = hero?.primary_cta_url || "/shop";
  const secondaryLabel = hero?.secondary_cta_label || t.applyCta;
  const secondaryUrl = hero?.secondary_cta_url || "/apply";
  const reasonList = hero?.reasons?.length ? hero.reasons.map((r) => r.text) : fallbackReasons;
  const figcaption = hero?.figcaption || "Protected first, then crowned";
  const bg = mediaUrl(hero?.background_image_url) || tex("mahroosa-jali");

  const ways: { k: string; v: string; to?: string; onClick?: () => void; accent?: boolean }[] = hero?.ways?.length
    ? hero.ways.map((w) => ({
        k: w.label_key,
        v: w.label_value,
        to: w.link_url || undefined,
        accent: !!w.is_accent,
        onClick: !w.link_url ? () => openAssistant(true) : undefined,
      }))
    : [
        { k: "Know your SKUs?", v: "Quick order pad", to: "/quick-order" },
        { k: "Scanning the range?", v: "Line sheet view", to: "/shop?view=table" },
        { k: "First time buying?", v: "Build my first order", onClick: () => openAssistant(true), accent: true },
      ];

  return (
    <section className="surface-deep grain relative flex flex-col overflow-hidden lg:min-h-[calc(100vh-72px)]" aria-labelledby="hero-title">
      <img decoding="async" src={bg} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-[0.07]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_72%_38%,rgba(24,41,91,0.6)_0%,rgba(9,16,35,0)_62%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night-deep to-transparent" aria-hidden />
      <LivingJali />

      <div className="container-x relative grid flex-1 items-center gap-12 pb-12 pt-12 sm:pt-16 lg:grid-cols-[61.8fr_38.2fr] lg:py-16">
        <div>
          <p className="rise-in eyebrow flex items-center gap-3" style={{ animationDelay: "120ms" }}>
            <span className="h-px w-10 bg-gold" aria-hidden />
            {eyebrow}
          </p>

          <h1 id="hero-title" className="tagline mt-5 text-hero text-pearl" aria-label={`${line1} ${line2}`}>
            <span className="word-in mr-[0.25em]">{line1}</span>
            <br />
            <span className="word-in foil-text">{line2}</span>
          </h1>

          <p className="rise-in mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-pearl/85 sm:text-lead" style={{ animationDelay: "1150ms" }}>
            {support} <span className="text-pearl">{supportStrong}</span>
          </p>

          <div className="rise-in mt-9 grid gap-3 sm:flex sm:flex-wrap" style={{ animationDelay: "1300ms" }}>
            <ButtonLink to={primaryUrl} className="w-full sm:w-auto">
              {primaryLabel}
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </ButtonLink>
            <ButtonLink to={secondaryUrl} variant="secondary" className="w-full sm:w-auto">
              {secondaryLabel}
            </ButtonLink>
          </div>

          <ul
            className="rise-in mt-7 flex flex-col gap-2 text-[0.9375rem] text-pearl/75 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3"
            style={{ animationDelay: "1450ms" }}
            aria-label="Why shops order from us"
          >
            {reasonList.map((r, i) => (
              <Fragment key={`${r}-${i}`}>
                {i > 0 && <li aria-hidden className="hidden h-1.5 w-1.5 rotate-45 bg-gold sm:block" />}
                <li className="flex items-center gap-2.5">
                  <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold sm:hidden" />
                  {r}
                </li>
              </Fragment>
            ))}
          </ul>
        </div>

        <figure className="hidden lg:block">
          <HeroFacets />
          <figcaption className="rise-in mt-2 flex items-center justify-center gap-3 text-[0.8125rem] tracking-[0.08em] text-pearl/60" style={{ animationDelay: "1600ms" }}>
            <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden />
            {figcaption}
            <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden />
          </figcaption>
        </figure>
      </div>

      <nav aria-label="Ways to start" className="rise-in relative border-t border-pearl/12" style={{ animationDelay: "1700ms" }}>
        <div className="container-x grid sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          {ways.map((w, i) => {
            const inner = (
              <>
                <span className="text-[0.8125rem] text-pearl/60">{w.k}</span>
                <span className={cn("mt-0.5 inline-flex items-center gap-2", w.accent ? "text-gold-light group-hover:text-gold" : "text-pearl group-hover:text-gold")}>
                  {w.accent && <Sparkles size={15} strokeWidth={1.4} aria-hidden />}
                  {w.v}
                  <ArrowRight size={15} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" />
                </span>
              </>
            );
            const cls = cn(
              "group flex min-h-[72px] flex-col justify-center py-4 text-left transition-colors duration-[382ms] hover:bg-pearl/[0.03] sm:px-5 lg:px-6",
              i > 0 && "border-t border-pearl/12 sm:border-l sm:border-t-0",
              i === 0 && "sm:pl-0 lg:pl-0",
            );
            return w.to ? (
              <Link key={`${w.k}-${w.v}`} to={w.to} className={cls}>
                {inner}
              </Link>
            ) : (
              <button key={`${w.k}-${w.v}`} type="button" onClick={w.onClick} className={cls}>
                {inner}
              </button>
            );
          })}
          <div className="hidden items-center gap-3 border-l border-pearl/12 pl-6 text-[0.75rem] uppercase tracking-[0.12em] text-pearl/50 lg:flex" aria-hidden>
            <span className="relative block h-10 w-px overflow-hidden bg-pearl/15">
              <span className="scroll-draw absolute inset-x-0 top-0 h-full bg-gold" />
            </span>
            Scroll to explore
          </div>
        </div>
      </nav>
      {footer}
    </section>
  );
}
