import type { Category } from "./types";

/** Adding a category = adding an object here. No component changes needed. */
export const categories: Category[] = [
  { slug: "rings", name: { en: "Rings", ur: "انگوٹھیاں" }, family: "jewellery", status: "live", glyph: "ring", coverImage: "velvet-fabric",
    intro: "Small circles, kept close. Bands and stacking rings in stainless steel." },
  { slug: "earrings", name: { en: "Earrings", ur: "بالیاں" }, family: "jewellery", status: "live", glyph: "earring", coverImage: "satin",
    intro: "Quiet studs and drops that sit softly under a dupatta or hijab." },
  { slug: "necklaces", name: { en: "Necklaces", ur: "ہار" }, family: "jewellery", status: "live", glyph: "necklace", coverImage: "black-sapphire-stone",
    intro: "Fine chains and collars, made to be worn every day." },
  { slug: "pendants", name: { en: "Pendants", ur: "لاکٹ" }, family: "jewellery", status: "live", glyph: "pendant", coverImage: "chaand-raat-sky",
    intro: "One shape on a chain: a crescent, an arch, a single drop." },
  { slug: "bracelets", name: { en: "Bracelets", ur: "کنگن" }, family: "jewellery", status: "live", glyph: "bracelet", coverImage: "pearl-cotton-paper",
    intro: "Cuffs, bangles and chain bracelets for the wrist." },
  { slug: "sets", name: { en: "Sets", ur: "سیٹ" }, family: "jewellery", status: "live", glyph: "set", coverImage: "laal-whisper",
    intro: "Matched pieces, boxed together. Easy to gift, easy to sell." },
  { slug: "abayas", name: { en: "Abayas", ur: "عبایا" }, family: "clothing", status: "coming-soon", glyph: "abaya", coverImage: "mahroosa-jali",
    intro: "Abayas, stitched with care. Opening soon for wholesale." },
  { slug: "unstitched", name: { en: "Unstitched", ur: "ان سلے سوٹ" }, family: "clothing", status: "coming-soon", glyph: "fabric", coverImage: "zardozi-lattice",
    intro: "Women's unstitched suits by the metre. Opening soon for wholesale." },
];

export const getCategory = (slug?: string) => categories.find((c) => c.slug === slug);
export const liveCategories = categories.filter((c) => c.status === "live");
