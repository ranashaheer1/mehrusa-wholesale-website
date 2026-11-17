import type { Occasion } from "./types";

/**
 * Buyer types and suggested opening assortments.
 * These are curated suggestions to make a first order easier, not sales data.
 * Quantities follow the placeholder MOQ (12) and should be reviewed by the owner.
 */
export type BuyerType = "boutique" | "online" | "gifting" | "market";

export const buyerTypes: { id: BuyerType; label: string; short: string; need: string; occasions: Occasion[] }[] = [
  { id: "boutique", label: "Boutique or modest-wear shop", short: "Boutique", need: "A small, considered range that sits well beside abayas and dupattas.", occasions: ["everyday", "workwear", "eid"] },
  { id: "online", label: "Online or Instagram store", short: "Online store", need: "Pieces that photograph clearly and post well, in a few easy colours.", occasions: ["everyday", "layering"] },
  { id: "gifting", label: "Gifting company or event planner", short: "Gifting", need: "Boxed sets and matched pieces that arrive ready to give.", occasions: ["gifting", "eid"] },
  { id: "market", label: "Market or exhibition seller", short: "Market stall", need: "A broad spread of quick-to-choose pieces across categories.", occasions: ["everyday", "eid", "gifting"] },
];

export type StarterKit = { id: string; buyer: BuyerType; title: string; why: string; lines: { productId: string; colour: string; option: string; qty: number }[] };

export const starterKits: StarterKit[] = [
  {
    id: "boutique-quiet", buyer: "boutique", title: "The quiet shelf",
    why: "Five everyday pieces in both colours, so a customer can match her outfit.",
    lines: [
      { productId: "slim-band-ring", colour: "Natural steel", option: "7", qty: 6 },
      { productId: "slim-band-ring", colour: "Gold-coloured", option: "7", qty: 6 },
      { productId: "diamond-shape-stud-earrings", colour: "Natural steel", option: "One size", qty: 6 },
      { productId: "diamond-shape-stud-earrings", colour: "Gold-coloured", option: "One size", qty: 6 },
      { productId: "fine-chain-necklace", colour: "Gold-coloured", option: "45 cm", qty: 12 },
      { productId: "arch-window-pendant", colour: "Natural steel", option: "45 cm", qty: 12 },
      { productId: "open-cuff-bracelet", colour: "Gold-coloured", option: "One size", qty: 12 },
    ],
  },
  {
    id: "online-layering", buyer: "online", title: "The layering edit",
    why: "Fine pieces that stack and layer, easy to show in one photograph.",
    lines: [
      { productId: "twist-band-ring", colour: "Gold-coloured", option: "7", qty: 12 },
      { productId: "layered-two-chain-necklace", colour: "Gold-coloured", option: "45 cm", qty: 12 },
      { productId: "teardrop-pendant", colour: "Natural steel", option: "40 cm", qty: 12 },
      { productId: "fine-chain-bracelet", colour: "Gold-coloured", option: "One size", qty: 12 },
    ],
  },
  {
    id: "gifting-boxed", buyer: "gifting", title: "Ready to give",
    why: "Boxed sets only. Nothing to match or pack on your side.",
    lines: [
      { productId: "crescent-gift-set", colour: "Gold-coloured", option: "One size", qty: 12 },
      { productId: "arch-everyday-set", colour: "Natural steel", option: "One size", qty: 12 },
      { productId: "initial-disc-pendant", colour: "Gold-coloured", option: "45 cm", qty: 12 },
    ],
  },
  {
    id: "market-spread", buyer: "market", title: "The full table",
    why: "One piece from each category, so every visitor finds something.",
    lines: [
      { productId: "crescent-stacking-ring", colour: "Gold-coloured", option: "7", qty: 12 },
      { productId: "small-hoop-earrings", colour: "Natural steel", option: "One size", qty: 12 },
      { productId: "fine-chain-necklace", colour: "Natural steel", option: "45 cm", qty: 12 },
      { productId: "crescent-pendant", colour: "Gold-coloured", option: "45 cm", qty: 12 },
      { productId: "thin-bangle-pair", colour: "Gold-coloured", option: "One size", qty: 12 },
      { productId: "arch-everyday-set", colour: "Gold-coloured", option: "One size", qty: 12 },
    ],
  },
];

export const occasionLabel: Record<Occasion, string> = {
  everyday: "Everyday",
  gifting: "Gifting",
  eid: "Eid",
  layering: "Layering",
  workwear: "Work and study",
};
