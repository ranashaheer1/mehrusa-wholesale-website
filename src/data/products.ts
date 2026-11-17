import type { TextureKey } from "@/lib/images";
import type { Badge, Occasion, Product } from "./types";

/**
 * 24 PLACEHOLDER products. Names describe the object. Prices are null (not confirmed).
 * MOQ and tier quantities follow the brief's example (12 / 36 / 100) and are marked
 * [CONFIRM] in the UI until terms.wholesaleNumbersVerified is true.
 */
const STEEL = { name: "Natural steel", hex: "#B9BCC2" };
const GOLDC = { name: "Gold-coloured", hex: "#C7A04D" };

const placeholderTiers = [
  { minQty: 12, pricePKR: null },
  { minQty: 36, pricePKR: null },
  { minQty: 100, pricePKR: null },
];

type Seed = {
  name: string;
  cat: string;
  imgs: [TextureKey, TextureKey];
  axis?: Product["variantAxis"];
  badges?: Badge[];
  mto?: boolean;
  unit?: Product["wholesale"]["unit"];
  desc: string;
  good?: Occasion[];
  ppu?: number;
};

const RING_SIZES = { label: "Size", options: ["6", "7", "8", "9"] };
const LENGTHS = { label: "Length", options: ["40 cm", "45 cm"] };

const seeds: Seed[] = [
  { name: "Slim band ring", good: ["everyday","layering"], cat: "rings", imgs: ["velvet-fabric", "satin"], axis: RING_SIZES, badges: ["new"], desc: "A narrow, plain band. Wears well alone or stacked." },
  { name: "Arch signet ring", good: ["everyday","workwear"], cat: "rings", imgs: ["satin", "velvet-fabric"], axis: RING_SIZES, desc: "A flat top shaped like a soft arch, taken from old doorways." },
  { name: "Jali cut band ring", good: ["gifting"], cat: "rings", imgs: ["black-sapphire-stone", "velvet-fabric"], axis: RING_SIZES, badges: ["limited-batch"], desc: "A wider band with a cut-through lattice pattern." },
  { name: "Crescent stacking ring", good: ["eid","layering"], cat: "rings", imgs: ["chaand-raat-sky", "satin"], axis: RING_SIZES, badges: ["eid-edit"], desc: "A thin band with a small crescent on top." },
  { name: "Twist band ring", good: ["everyday","layering"], cat: "rings", imgs: ["velvet-fabric", "pearl-cotton-paper"], axis: RING_SIZES, desc: "Two fine strands twisted into one band." },
  { name: "Small hoop earrings", good: ["everyday","workwear"], cat: "earrings", imgs: ["satin", "pearl-cotton-paper"], badges: ["new"], desc: "Small round hoops with a hinged closure." },
  { name: "Arch drop earrings", good: ["gifting","eid"], cat: "earrings", imgs: ["velvet-fabric", "satin"], desc: "A small arch hanging from a short hook." },
  { name: "Diamond-shape stud earrings", good: ["everyday","workwear"], cat: "earrings", imgs: ["black-sapphire-stone", "satin"], desc: "Flat studs cut in a square turned on its corner, like the mark." },
  { name: "Crescent drop earrings", good: ["eid","gifting"], cat: "earrings", imgs: ["chaand-raat-sky", "velvet-fabric"], badges: ["eid-edit"], desc: "A small crescent moon on a fine chain drop." },
  { name: "Fine chain necklace", good: ["everyday","layering"], cat: "necklaces", imgs: ["black-sapphire-stone", "satin"], axis: LENGTHS, desc: "A thin cable chain with a lobster clasp." },
  { name: "Flat snake chain necklace", good: ["workwear","everyday"], cat: "necklaces", imgs: ["satin", "black-sapphire-stone"], axis: LENGTHS, badges: ["new"], desc: "A smooth, flat chain that lies close to the neck." },
  { name: "Bar collar necklace", good: ["workwear"], cat: "necklaces", imgs: ["velvet-fabric", "black-sapphire-stone"], axis: LENGTHS, desc: "A short straight bar set on a fine chain." },
  { name: "Layered two-chain necklace", good: ["layering","gifting"], cat: "necklaces", imgs: ["pearl-cotton-paper", "satin"], axis: LENGTHS, badges: ["limited-batch"], desc: "Two chains of different lengths on one clasp." },
  { name: "Crescent pendant", good: ["eid","gifting"], cat: "pendants", imgs: ["chaand-raat-sky", "black-sapphire-stone"], axis: LENGTHS, badges: ["eid-edit"], desc: "A crescent moon pendant on a fine chain." },
  { name: "Arch window pendant", good: ["everyday","gifting"], cat: "pendants", imgs: ["velvet-fabric", "chaand-raat-sky"], axis: LENGTHS, desc: "An open arch outline, like a small window." },
  { name: "Teardrop pendant", good: ["everyday","layering"], cat: "pendants", imgs: ["satin", "chaand-raat-sky"], axis: LENGTHS, desc: "A single smooth drop on a fine chain." },
  { name: "Initial disc pendant", good: ["gifting"], cat: "pendants", imgs: ["pearl-cotton-paper", "velvet-fabric"], axis: LENGTHS, mto: true, desc: "A small round disc, engraved with one letter on order." },
  { name: "Open cuff bracelet", good: ["everyday","workwear"], cat: "bracelets", imgs: ["pearl-cotton-paper", "satin"], desc: "A slim open cuff that eases onto the wrist." },
  { name: "Fine chain bracelet", good: ["everyday","layering"], cat: "bracelets", imgs: ["satin", "pearl-cotton-paper"], badges: ["new"], desc: "A light chain with an adjustable extender." },
  { name: "Thin bangle pair", good: ["eid","layering"], ppu: 2, cat: "bracelets", imgs: ["velvet-fabric", "pearl-cotton-paper"], unit: "set", desc: "Two plain thin bangles sold as a pair." },
  { name: "Lattice link bracelet", good: ["gifting"], cat: "bracelets", imgs: ["black-sapphire-stone", "pearl-cotton-paper"], badges: ["limited-batch"], desc: "Flat links with a small cut-out pattern." },
  { name: "Crescent gift set", good: ["eid","gifting"], ppu: 2, cat: "sets", imgs: ["laal-whisper", "chaand-raat-sky"], unit: "set", badges: ["eid-edit"], desc: "Crescent pendant and matching drop earrings, boxed together." },
  { name: "Arch everyday set", good: ["gifting","everyday"], ppu: 2, cat: "sets", imgs: ["laal-whisper", "velvet-fabric"], unit: "set", desc: "Arch drop earrings and arch pendant, boxed together." },
  { name: "Stacking ring trio", good: ["layering","gifting"], ppu: 3, cat: "sets", imgs: ["laal-whisper", "satin"], unit: "set", axis: RING_SIZES, mto: true, desc: "Three fine bands sold together as one set." },
];

const catCode: Record<string, string> = { rings: "RG", earrings: "ER", necklaces: "NK", pendants: "PD", bracelets: "BR", sets: "ST" };
const counters: Record<string, number> = {};

const specFor = (cat: string): Record<string, string> => {
  const base: Record<string, string> = { Material: "Stainless steel", "Finish": "[CONFIRM]" };
  if (cat === "rings") return { ...base, "Band width": "[CONFIRM] mm", "Sizes": "[CONFIRM] size system" };
  if (cat === "earrings") return { ...base, "Drop length": "[CONFIRM] mm", Closure: "[CONFIRM]" };
  if (cat === "necklaces" || cat === "pendants") return { ...base, "Chain length": "[CONFIRM]", Clasp: "[CONFIRM]", "Pendant size": cat === "pendants" ? "[CONFIRM] mm" : "n/a" };
  if (cat === "bracelets") return { ...base, "Inner size": "[CONFIRM]", Closure: "[CONFIRM]" };
  return { ...base, Contents: "[CONFIRM]", Box: "Midnight gift box [CONFIRM]" };
};

export const products: Product[] = seeds.map((s, i) => {
  counters[s.cat] = (counters[s.cat] ?? 0) + 1;
  const n = String(counters[s.cat]).padStart(2, "0");
  const sku = `MH-${catCode[s.cat]}-${n}`;
  const id = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id,
    sku,
    name: s.name,
    categorySlug: s.cat,
    material: "stainless-steel",
    colours: [
      { ...STEEL, image: s.imgs[0] },
      { ...GOLDC, image: s.imgs[1] },
    ],
    images: [s.imgs[0], s.imgs[1], "pearl-cotton-paper", "lime-wash"],
    description: `${s.desc} Placeholder listing: final measurements, finish and photos to be confirmed.`,
    specs: specFor(s.cat),
    variantAxis: s.axis,
    retailPricePKR: null,
    wholesale: {
      unit: s.unit ?? "piece",
      minOrderQty: 12,
      tiers: placeholderTiers,
      inStock: s.mto ? "made-to-order" : true,
    },
    badges: s.badges,
    careNote: "Wipe with a soft dry cloth and store in the pouch.",
    goodFor: s.good,
    piecesPerUnit: s.ppu,
    placeholder: true,
    reorderRank: ((i * 7) % 24) + 1,
    addedAt: new Date(Date.UTC(2025, 0, 1 + ((i * 11) % 60))).toISOString(),
  };
});

export const getProduct = (id?: string) => products.find((p) => p.id === id);
