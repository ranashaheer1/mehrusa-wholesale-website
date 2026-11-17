import type { TextureKey } from "@/lib/images";

export type Family = "jewellery" | "clothing";

export type Category = {
  slug: string;
  name: { en: string; ur?: string };
  family: Family;
  status: "live" | "coming-soon";
  intro: string;
  coverImage: TextureKey;
  /** Glyph used on placeholder imagery */
  glyph: Glyph;
};

export type Glyph = "ring" | "earring" | "necklace" | "pendant" | "bracelet" | "set" | "abaya" | "fabric";

export type Occasion = "everyday" | "gifting" | "eid" | "layering" | "workwear";

export type Badge = "new" | "limited-batch" | "eid-edit";

export type Product = {
  id: string;
  sku: string;
  name: string;
  categorySlug: string;
  material: string; // references materials.ts
  finish?: string; // only if verified
  colours: { name: string; hex?: string; image: TextureKey }[];
  images: TextureKey[]; // 4:5, first one is the card image
  description: string;
  specs: Record<string, string>;
  /** Jewellery: size or length options. Clothing (abayas) uses sizeRun. */
  variantAxis?: { label: string; options: string[] };
  sizeRun?: string[];
  fabricMeters?: number;
  retailPricePKR?: number | null;
  wholesale: {
    unit: "piece" | "dozen" | "set" | "suit";
    minOrderQty: number;
    /** pricePKR null = not yet confirmed by owner */
    tiers: { minQty: number; pricePKR: number | null }[];
    leadTimeDays?: number;
    inStock: boolean | "made-to-order";
  };
  badges?: Badge[];
  careNote?: string;
  /** Descriptive occasions the piece suits. Not a sales claim. */
  goodFor?: Occasion[];
  /** For sets: how many pieces one unit contains */
  piecesPerUnit?: number;
  /** Placeholder data flag. Shows a visible label until real products replace it. */
  placeholder?: boolean;
  /** Sort helper for "Most reordered". Placeholder ranking until real order data exists. */
  reorderRank?: number;
  addedAt: string; // ISO date, for "Newest"
};
