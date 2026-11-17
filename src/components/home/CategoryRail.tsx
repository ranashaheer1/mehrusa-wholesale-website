import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { tex, textures } from "@/lib/images";
import { Reveal, Urdu } from "../ui/bits";
import { cn } from "@/utils/cn";

/**
 * Mobile-first category grid. No scroll hijacking.
 * - Phones (base): 2 columns; the first category is featured full-width.
 * - Tablets (md, 768+): 6 columns; featured spans 6, others span 3 (or 2 in the 3-up row).
 * - Desktop (lg, 1024+): 12-column editorial layout following 61.8 / 38.2.
 */
const layout = [
  // [base, md, lg] classes per live category, in order
  { cell: "col-span-2 md:col-span-6 lg:col-span-7 lg:row-span-2", img: "aspect-[4/3] md:aspect-[16/8] lg:aspect-auto lg:h-full", big: true },
  { cell: "col-span-1 md:col-span-3 lg:col-span-5", img: "aspect-[4/5] md:aspect-[4/3] lg:aspect-auto lg:h-full" },
  { cell: "col-span-1 md:col-span-3 lg:col-span-5", img: "aspect-[4/5] md:aspect-[4/3] lg:aspect-auto lg:h-full" },
  { cell: "col-span-1 md:col-span-2 lg:col-span-4", img: "aspect-[4/5] lg:aspect-auto lg:h-full" },
  { cell: "col-span-1 md:col-span-2 lg:col-span-4", img: "aspect-[4/5] lg:aspect-auto lg:h-full" },
  { cell: "col-span-2 md:col-span-2 lg:col-span-4", img: "aspect-[16/9] md:aspect-[4/5] lg:aspect-auto lg:h-full" },
];

function Tile({ c, i }: { c: (typeof categories)[number]; i: number }) {
  const l = layout[i] ?? layout[3];
  const n = products.filter((p) => p.categorySlug === c.slug).length;
  return (
    <li className={l.cell}>
      <Reveal delay={(i % 3) * 0.05} className="h-full">
        <Link to={`/shop/${c.slug}`} className="group relative block h-full overflow-hidden bg-night-deep">
          <div className={cn("relative w-full", l.img)}>
            <img
              src={tex(c.coverImage)}
              alt={`${c.name.en}: ${textures[c.coverImage].label.toLowerCase()}, photo coming`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-[var(--ease)] group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night-deep/90 via-night-deep/25 to-transparent" />
            <span className="absolute inset-3 border border-transparent transition-colors duration-[618ms] group-hover:border-gold/70 lg:inset-4" aria-hidden />
            <div className="absolute inset-0 flex flex-col justify-between p-3 text-pearl sm:p-4 lg:p-6">
              <div className="flex items-start justify-between gap-2">
                <span className="num font-display text-[0.9375rem] text-gold sm:text-[1.0625rem]">{String(i + 1).padStart(2, "0")}</span>
                {c.name.ur && l.big && <Urdu display as="span" className="text-[1.25rem] leading-[1.8] text-gold-light lg:text-[1.75rem]">{c.name.ur}</Urdu>}
              </div>
              <div>
                <p className={cn("font-display leading-tight", l.big ? "text-[1.75rem] sm:text-h3 lg:text-h2" : "text-[1.25rem] sm:text-h4")}>{c.name.en}</p>
                {l.big && <p className="mt-1.5 hidden max-w-[40ch] text-[0.9375rem] text-pearl/85 sm:block">{c.intro}</p>}
                <p className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] text-pearl/90">
                  <span className="num">{n} pieces</span>
                  <ArrowRight size={14} strokeWidth={1.4} aria-hidden className="transition-transform duration-[382ms] group-hover:translate-x-1" />
                </p>
              </div>
            </div>
          </div>
        </Link>
      </Reveal>
    </li>
  );
}

export function CategoryRail() {
  const live = categories.filter((c) => c.status === "live");
  const soon = categories.filter((c) => c.status === "coming-soon");
  return (
    <section className="surface-night py-14 md:py-16 lg:py-[84px]" aria-labelledby="cats">
      <div className="container-x">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-2 sm:mb-3">The range</p>
            <h2 id="cats" className="max-w-[20ch] text-[1.75rem] leading-tight sm:text-h2">Jewellery now. Abayas and unstitched, soon.</h2>
          </div>
          <Link to="/shop" className="link inline-flex min-h-11 items-center self-start text-[0.9375rem] sm:self-auto">See all pieces</Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-6 md:gap-4 lg:mt-10 lg:grid-cols-12 lg:auto-rows-[220px] lg:gap-5 xl:auto-rows-[250px]">
          {live.map((c, i) => <Tile key={c.slug} c={c} i={i} />)}
        </ul>

        <ul className="mt-2.5 grid gap-2.5 sm:mt-3 sm:grid-cols-2 sm:gap-3 md:mt-4 md:gap-4 lg:mt-5 lg:gap-5">
          {soon.map((c) => (
            <li key={c.slug}>
              <Link to={`/shop/${c.slug}`} className="group flex min-h-[72px] items-center gap-4 border rule p-4 transition-colors duration-[382ms] hover:border-gold sm:min-h-[88px] lg:p-5">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden sm:h-14 sm:w-14">
                  <img decoding="async" src={tex(c.coverImage)} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.125rem] sm:text-h4">{c.name.en}</span>
                  <span className="block text-[0.8125rem] opacity-75">Opening soon · tell me when</span>
                </span>
                {c.name.ur && <Urdu display as="span" className="hidden text-[1.25rem] leading-[1.8] text-gold sm:inline">{c.name.ur}</Urdu>}
                <ArrowRight size={16} strokeWidth={1.4} aria-hidden className="shrink-0 transition-transform duration-[382ms] group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
