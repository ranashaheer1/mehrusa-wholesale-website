/**
 * All interface strings live here, keyed by language, so a full Urdu toggle
 * can be added later without refactoring. Urdu entries marked [CONFIRM] need a native review.
 */
export const strings = {
  en: {
    tagline: "Veiled in grace. Crowned in light.",
    signOff: "Made with care. Kept close.",
    nav: { shop: "Shop", standards: "Standards", packaging: "Packaging", terms: "Terms", apply: "Apply", faq: "FAQ", contact: "Contact", journal: "Journal", list: "My list" },
    browse: "Browse the range",
    applyCta: "Apply for wholesale",
    addToList: "Add to list",
    added: "Added to your list.",
    askWhatsapp: "Ask on WhatsApp",
    emptyList: "Your list is empty. Start with a piece that caught your eye.",
    enquiryNote: "This is an enquiry, not a payment. We confirm availability, shipping and final price on WhatsApp.",
    nothingStored: "Nothing is stored by this website. Your message goes to us through WhatsApp or email.",
    phoneError: "Please enter a phone number so we can reply about your order.",
    photoComing: "Photo coming",
    placeholder: "Placeholder",
    notFound: "This page has slipped away. Let us take you somewhere kept.",
    openingSoon: "Opening soon",
    tellMe: "Tell me when it opens",
  },
  ur: {
    tagline: "حیا میں لپٹی، روشنی کا تاج",
    haya: "حیا کی اپنی چمک ہے",
    welcome: "خوش آمدید",
    protected: "پہلے حفاظت، پھر تاج",
    careKept: "محبت سے بنایا، سنبھال کر رکھا",
    openingSoon: "جلد آ رہا ہے",
    thanks: "شکریہ",
    standards: "ہمارا معیار",
    packaging: "سنبھال کر بھیجا",
  },
} as const;

export const t = strings.en;
export const ur = strings.ur;
