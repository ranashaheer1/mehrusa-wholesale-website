/**
 * Wholesale terms. Every value starts as "[CONFIRM]".
 * Replace with the owner's confirmed answers. Nothing here should be guessed.
 */
export const CONFIRM = "[CONFIRM]" as const;

export const isConfirmed = (v: unknown): boolean =>
  v !== undefined && v !== null && v !== "" && !(typeof v === "string" && v.includes(CONFIRM));

export const terms = {
  /** Digits only, international format, no "+". Example: "923001234567" */
  whatsappNumber: CONFIRM as string,
  email: CONFIRM as string,
  moqRule: CONFIRM as string, // e.g. "12 pieces per design, mixed colours allowed"
  orderMinimum: CONFIRM as string, // e.g. "PKR 25,000 per order"
  tierNote: CONFIRM as string, // how price tiers work
  paymentTerms: CONFIRM as string,
  shipping: CONFIRM as string,
  shippingInternational: CONFIRM as string,
  leadTime: CONFIRM as string,
  madeToOrderLeadTime: CONFIRM as string,
  returnsDamage: CONFIRM as string,
  samplePackPrice: CONFIRM as string,
  samplePackContents: CONFIRM as string,
  replyPromise: CONFIRM as string, // e.g. "within one working day"
  businessHours: CONFIRM as string,
  city: CONFIRM as string,
  instagram: CONFIRM as string,
  /** Announcement bar line. Leave as CONFIRM to hide the bar. */
  announcement: CONFIRM as string,
  /** Set true once owner confirms the placeholder tier quantities and MOQs on products. */
  wholesaleNumbersVerified: false,
};

export const site = {
  name: "Mehrusa",
  tagline: "Veiled in grace. Crowned in light.",
  signOff: "Made with care. Kept close.",
  urduLine: "حیا کی اپنی چمک ہے",
  /**
   * Show [CONFIRM] markers. On in development and in this preview build so the owner
   * can see every open question. Set VITE_SHOW_CONFIRM=false for launch.
   */
  showConfirm: import.meta.env.DEV || import.meta.env.VITE_SHOW_CONFIRM !== "false",
  /** Eid / 14 August theme. Off by default. */
  season: "off" as "off" | "eid",
};
