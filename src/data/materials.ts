/**
 * Material facts. NOTHING here is verified yet.
 * Rule: a fact with verified:false must never be shown as a claim to buyers.
 * It renders as a [CONFIRM] marker while site.showConfirm is on, and is hidden otherwise.
 */
export type MaterialFact = { label: string; value: string; verified: boolean };

export type Material = {
  slug: string;
  name: string; // plain name, always true
  summary: string; // safe, plain statement
  facts: MaterialFact[];
  care: { text: string; verified: boolean }[];
};

export const materials: Material[] = [
  {
    slug: "stainless-steel",
    name: "Stainless steel",
    summary:
      "Our current jewellery is made from stainless steel. It is not gold, silver or a precious metal, and we will always say so.",
    facts: [
      { label: "Steel grade", value: "[CONFIRM] grade, e.g. 304 or 316L", verified: false },
      { label: "Finish process (coloured pieces)", value: "[CONFIRM] e.g. PVD or plating, and its thickness", verified: false },
      { label: "Water and sweat", value: "[CONFIRM] how the finish behaves with water", verified: false },
      { label: "Skin sensitivity", value: "[CONFIRM] nickel content or test result", verified: false },
      { label: "Where it is made", value: "[CONFIRM] country and workshop", verified: false },
    ],
    care: [
      { text: "Wipe with a soft dry cloth after wearing.", verified: true },
      { text: "Keep each piece in its pouch, apart from other pieces, so surfaces do not scratch.", verified: true },
      { text: "[CONFIRM] Perfume, water and cleaning advice for the finish.", verified: false },
    ],
  },
  {
    slug: "fabric-tbc",
    name: "Fabric (opening soon)",
    summary: "Abaya and unstitched fabrics will be listed here with their real composition once confirmed.",
    facts: [
      { label: "Composition", value: "[CONFIRM]", verified: false },
      { label: "GSM", value: "[CONFIRM]", verified: false },
    ],
    care: [{ text: "[CONFIRM] Washing and pressing advice.", verified: false }],
  },
];

export const getMaterial = (slug: string) => materials.find((m) => m.slug === slug);
