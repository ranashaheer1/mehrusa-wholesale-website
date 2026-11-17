import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  ShadingType,
} from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NAVY = "0F1938";
const GOLD = "C7A04D";
const PEARL = "F7F4EF";
const WHITE = "FFFFFF";
const MUTED = "5A5A5A";

const thin = { style: BorderStyle.SINGLE, size: 4, color: "D0D0D0" };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(text, opts = {}) {
  const {
    bold = false,
    fill = WHITE,
    width = 2340,
    color = "1A1A1A",
    align = AlignmentType.LEFT,
    fontSize = 18,
  } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text,
            bold,
            color,
            size: fontSize,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function headerCell(text, width = 2340) {
  return cell(text, { bold: true, fill: NAVY, color: WHITE, width, fontSize: 18 });
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({ text, bold: true, size: 26, color: NAVY, font: "Calibri" }),
    ],
  });
}

function body(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text, size: 20, color: "222222", font: "Calibri" }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: `•  ${text}`, size: 20, color: "222222", font: "Calibri" }),
    ],
  });
}

function tableTitle(name, purpose) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({ text: name, bold: true, size: 22, color: NAVY, font: "Consolas" }),
      new TextRun({ text: `  —  ${purpose}`, size: 20, color: MUTED, font: "Calibri" }),
    ],
  });
}

function fieldTable(rows) {
  const header = new TableRow({
    children: [
      headerCell("Column", 2200),
      headerCell("Type", 2200),
      headerCell("Notes", 4920),
    ],
  });
  const bodyRows = rows.map(([col, type, notes], i) =>
    new TableRow({
      children: [
        cell(col, { width: 2200, fill: i % 2 ? PEARL : WHITE, bold: true, fontSize: 17 }),
        cell(type, { width: 2200, fill: i % 2 ? PEARL : WHITE, fontSize: 17, color: MUTED }),
        cell(notes, { width: 4920, fill: i % 2 ? PEARL : WHITE, fontSize: 17 }),
      ],
    }),
  );
  return new Table({
    width: { size: 9320, type: WidthType.DXA },
    columnWidths: [2200, 2200, 4920],
    rows: [header, ...bodyRows],
  });
}

function summaryTable(items) {
  const header = new TableRow({
    children: [
      headerCell("#", 700),
      headerCell("Table", 3200),
      headerCell("Purpose", 5420),
    ],
  });
  const bodyRows = items.map(([n, name, purpose], i) =>
    new TableRow({
      children: [
        cell(String(n), { width: 700, fill: i % 2 ? PEARL : WHITE, align: AlignmentType.CENTER }),
        cell(name, { width: 3200, fill: i % 2 ? PEARL : WHITE, bold: true, fontSize: 17 }),
        cell(purpose, { width: 5420, fill: i % 2 ? PEARL : WHITE, fontSize: 17 }),
      ],
    }),
  );
  return new Table({
    width: { size: 9320, type: WidthType.DXA },
    columnWidths: [700, 3200, 5420],
    rows: [header, ...bodyRows],
  });
}

const tables = [
  {
    name: "users",
    purpose: "Admin / staff accounts",
    fields: [
      ["id", "BIGINT PK", "Auto increment"],
      ["name", "VARCHAR(120)", "Staff name"],
      ["email", "VARCHAR(190) UNIQUE", "Login email"],
      ["password", "VARCHAR(255)", "Hashed password"],
      ["role", "ENUM", "admin | staff"],
      ["is_active", "BOOLEAN", "Account enabled flag"],
      ["timestamps", "TIMESTAMP", "created_at, updated_at"],
    ],
  },
  {
    name: "buyers",
    purpose: "Wholesale customers / leads",
    fields: [
      ["id", "BIGINT PK", "Auto increment"],
      ["buyer_type", "ENUM", "boutique | online | gifting | market"],
      ["name", "VARCHAR(120)", "Contact person"],
      ["business_name", "VARCHAR(160)", "Shop / business"],
      ["city / country", "VARCHAR", "Location"],
      ["phone", "VARCHAR(32)", "WhatsApp preferred (E.164)"],
      ["online_presence", "VARCHAR(200)", "Instagram or website"],
      ["status", "ENUM", "lead | pending | approved | rejected | inactive"],
      ["notes_internal", "TEXT", "Staff-only notes"],
    ],
  },
  {
    name: "materials",
    purpose: "Product materials (e.g. stainless steel)",
    fields: [
      ["id", "BIGINT PK", "Auto increment"],
      ["slug", "VARCHAR(80) UNIQUE", "URL / code key"],
      ["name", "VARCHAR(120)", "Display name"],
      ["summary", "TEXT", "Public safe summary"],
    ],
  },
  {
    name: "material_facts",
    purpose: "Material specifications with verification",
    fields: [
      ["material_id", "FK → materials", "Parent material"],
      ["label / value", "VARCHAR", "Fact label and value"],
      ["verified", "BOOLEAN", "Only verified facts shown publicly"],
    ],
  },
  {
    name: "categories",
    purpose: "Catalogue categories",
    fields: [
      ["slug", "VARCHAR UNIQUE", "rings, earrings, necklaces, …"],
      ["name_en / name_ur", "VARCHAR", "Bilingual labels"],
      ["family", "ENUM", "jewellery | clothing"],
      ["status", "ENUM", "live | coming_soon | hidden"],
      ["intro / glyph", "TEXT / VARCHAR", "Intro copy and icon key"],
    ],
  },
  {
    name: "products",
    purpose: "Core catalogue items",
    fields: [
      ["category_id", "FK → categories", "Parent category"],
      ["material_id", "FK → materials", "Material link"],
      ["slug / sku", "VARCHAR UNIQUE", "URL slug and SKU (e.g. MH-RG-01)"],
      ["name / description", "VARCHAR / TEXT", "Product copy"],
      ["wholesale_unit", "ENUM", "piece | dozen | set | suit"],
      ["min_order_qty", "INT", "MOQ (e.g. 12)"],
      ["stock_mode", "ENUM", "in_stock | out_of_stock | made_to_order"],
      ["retail_price_pkr", "DECIMAL NULL", "Optional retail reference"],
      ["pieces_per_unit", "INT NULL", "For sets"],
      ["is_placeholder", "BOOLEAN", "Placeholder listings flag"],
      ["is_published", "BOOLEAN", "Public visibility"],
      ["deleted_at", "TIMESTAMP NULL", "Soft delete"],
    ],
  },
  {
    name: "product_colours",
    purpose: "Colourways per product",
    fields: [
      ["product_id", "FK → products", "Parent product"],
      ["name", "VARCHAR(80)", "e.g. Natural steel, Gold-coloured"],
      ["hex", "VARCHAR(7)", "Optional swatch"],
      ["image_path", "VARCHAR", "Colour image"],
    ],
  },
  {
    name: "product_images",
    purpose: "Product gallery",
    fields: [
      ["product_id", "FK → products", "Parent product"],
      ["path", "VARCHAR", "Storage path / URL"],
      ["is_primary", "BOOLEAN", "Card / primary image"],
      ["sort_order", "INT", "Display order"],
    ],
  },
  {
    name: "product_specs",
    purpose: "Key/value product specifications",
    fields: [
      ["product_id", "FK → products", "Parent product"],
      ["spec_key / spec_value", "VARCHAR", "e.g. Band width → 2 mm"],
      ["verified", "BOOLEAN", "Confirmed by owner"],
    ],
  },
  {
    name: "product_price_tiers",
    purpose: "Wholesale quantity price tiers",
    fields: [
      ["product_id", "FK → products", "Parent product"],
      ["min_qty", "INT", "Tier threshold (12 / 36 / 100)"],
      ["price_pkr", "DECIMAL NULL", "NULL = price on request"],
    ],
  },
  {
    name: "product_variant_axes",
    purpose: "Size / length axis label",
    fields: [
      ["product_id", "FK UNIQUE", "One axis per product"],
      ["label", "VARCHAR", "Size, Length, Suit, …"],
    ],
  },
  {
    name: "product_variant_options",
    purpose: "Variant option values",
    fields: [
      ["axis_id", "FK → axes", "Parent axis"],
      ["value", "VARCHAR", "e.g. 6, 7, 45 cm, One size"],
    ],
  },
  {
    name: "product_occasions",
    purpose: "Occasion tags",
    fields: [
      ["product_id", "FK → products", "Parent product"],
      ["occasion", "ENUM", "everyday | gifting | eid | layering | workwear"],
    ],
  },
  {
    name: "product_badges",
    purpose: "Marketing badges",
    fields: [
      ["product_id", "FK → products", "Parent product"],
      ["badge", "ENUM", "new | limited_batch | eid_edit"],
    ],
  },
  {
    name: "starter_kits",
    purpose: "Curated first-order assortments",
    fields: [
      ["slug", "VARCHAR UNIQUE", "Kit key"],
      ["buyer_type", "ENUM", "Target buyer type"],
      ["title / why", "VARCHAR / TEXT", "Kit title and rationale"],
      ["is_active", "BOOLEAN", "Published flag"],
    ],
  },
  {
    name: "starter_kit_lines",
    purpose: "Lines inside a starter kit",
    fields: [
      ["starter_kit_id", "FK → starter_kits", "Parent kit"],
      ["product_id", "FK → products", "Included product"],
      ["colour / option_value", "VARCHAR", "Variant selection"],
      ["qty", "INT", "Suggested quantity"],
    ],
  },
  {
    name: "wholesale_applications",
    purpose: "Apply-for-wholesale form submissions",
    fields: [
      ["buyer_id", "FK NULL", "Linked after approval"],
      ["name / business_name", "VARCHAR", "Applicant details"],
      ["city / country / phone", "VARCHAR", "Contact & location"],
      ["what_they_sell", "TEXT", "Business description"],
      ["expected_order_size", "VARCHAR", "First order size band"],
      ["source", "VARCHAR", "How they heard about Mehrusa"],
      ["status", "ENUM", "pending | needs_info | approved | rejected"],
      ["reviewed_by / reviewed_at", "FK / TIMESTAMP", "Staff review"],
    ],
  },
  {
    name: "wholesale_application_interests",
    purpose: "Categories of interest on applications",
    fields: [
      ["application_id", "FK → applications", "Parent application"],
      ["category_id", "FK → categories", "Interested category"],
    ],
  },
  {
    name: "enquiries",
    purpose: "Wholesale enquiry / order intake (not payment)",
    fields: [
      ["enquiry_number", "VARCHAR UNIQUE", "e.g. MH-ENQ-2026-00041"],
      ["buyer_id", "FK NULL", "Linked buyer if known"],
      ["buyer_* snapshot", "VARCHAR / TEXT", "Name, business, city, phone, notes"],
      ["channel", "ENUM", "whatsapp | email | api | admin"],
      ["status", "ENUM", "received → quoted → confirmed → fulfilled / cancelled"],
      ["total_units", "INT", "Sum of line quantities"],
      ["subtotal_pkr", "DECIMAL NULL", "NULL if any price unknown"],
      ["assigned_to", "FK → users", "Staff owner"],
    ],
  },
  {
    name: "enquiry_lines",
    purpose: "Enquiry line items with price snapshot",
    fields: [
      ["enquiry_id", "FK → enquiries", "Parent enquiry"],
      ["product_id", "FK NULL", "Live product link"],
      ["product_sku / product_name", "VARCHAR", "Snapshot at submit time"],
      ["colour / option_value", "VARCHAR", "Selected variant"],
      ["qty", "INT", "Quantity ordered"],
      ["unit_price_pkr / line_total_pkr", "DECIMAL NULL", "Resolved at submit"],
    ],
  },
  {
    name: "enquiry_status_logs",
    purpose: "Audit trail for enquiry status changes",
    fields: [
      ["enquiry_id", "FK → enquiries", "Parent enquiry"],
      ["from_status / to_status", "VARCHAR", "Transition"],
      ["changed_by", "FK → users", "Who changed it"],
      ["note", "TEXT", "Optional comment"],
    ],
  },
  {
    name: "contact_messages",
    purpose: "Contact page messages",
    fields: [
      ["name / phone / email", "VARCHAR", "Sender details"],
      ["subject / message", "VARCHAR / TEXT", "Message body"],
      ["status", "ENUM", "new | read | replied | archived"],
    ],
  },
  {
    name: "site_settings",
    purpose: "Wholesale terms & public settings",
    fields: [
      ["setting_key", "VARCHAR UNIQUE", "e.g. whatsapp_number, moq_rule"],
      ["setting_value", "TEXT", "Value (may be unconfirmed)"],
      ["is_public", "BOOLEAN", "Safe for public API"],
      ["verified", "BOOLEAN", "Owner-confirmed"],
    ],
  },
  {
    name: "media_assets",
    purpose: "Shared media library (hero, blogs, SEO, products)",
    fields: [
      ["path / filename", "VARCHAR", "Stored file location"],
      ["mime_type / size", "VARCHAR / INT", "File metadata"],
      ["alt_text", "VARCHAR", "Accessibility / SEO alt"],
      ["folder", "VARCHAR", "hero | blog | products | seo"],
      ["uploaded_by", "FK → users", "Admin uploader"],
    ],
  },
  {
    name: "homepage_heroes",
    purpose: "Admin-editable home hero (text + images)",
    fields: [
      ["eyebrow / headlines", "VARCHAR", "Brand + tagline lines"],
      ["supporting_text", "TEXT", "Hero supporting copy"],
      ["primary/secondary CTA", "VARCHAR", "Labels + URLs editable by admin"],
      ["background_media_id", "FK → media_assets", "Hero background image"],
      ["side_media_id", "FK → media_assets", "Desktop side / facet image"],
      ["is_active", "BOOLEAN", "Only one active hero served publicly"],
    ],
  },
  {
    name: "homepage_hero_reasons",
    purpose: "Hero reason bullets under CTAs",
    fields: [
      ["hero_id", "FK → homepage_heroes", "Parent hero"],
      ["text", "VARCHAR", "e.g. Order on WhatsApp"],
      ["sort_order", "INT", "Display order"],
    ],
  },
  {
    name: "homepage_hero_ways",
    purpose: "Ways-to-start bar items",
    fields: [
      ["hero_id", "FK → homepage_heroes", "Parent hero"],
      ["label_key / label_value", "VARCHAR", "Prompt + action label"],
      ["link_url", "VARCHAR", "Destination path"],
      ["is_accent", "BOOLEAN", "Highlight first-time CTA"],
    ],
  },
  {
    name: "homepage_hero_images",
    purpose: "Additional hero gallery / facet images",
    fields: [
      ["hero_id", "FK → homepage_heroes", "Parent hero"],
      ["media_id", "FK → media_assets", "Image file"],
      ["role", "ENUM", "background | side | facet | mobile | gallery"],
    ],
  },
  {
    name: "blog_categories",
    purpose: "Journal / blog categories",
    fields: [
      ["slug / name", "VARCHAR UNIQUE", "Category identity"],
      ["description", "TEXT", "Optional category intro"],
      ["is_active", "BOOLEAN", "Visibility"],
    ],
  },
  {
    name: "blog_tags",
    purpose: "Blog tags",
    fields: [
      ["slug / name", "VARCHAR UNIQUE", "Tag identity"],
    ],
  },
  {
    name: "blog_posts",
    purpose: "Blog / Journal articles",
    fields: [
      ["blog_category_id", "FK NULL", "Optional category"],
      ["author_id", "FK → users", "Staff author"],
      ["slug / title", "VARCHAR", "URL + headline"],
      ["excerpt / body_html", "TEXT / LONGTEXT", "Card + full article"],
      ["cover_media_id", "FK → media_assets", "Cover image"],
      ["status", "ENUM", "draft | scheduled | published | archived"],
      ["is_featured", "BOOLEAN", "Featured on journal home"],
      ["published_at", "TIMESTAMP", "Publish schedule"],
    ],
  },
  {
    name: "blog_post_tag",
    purpose: "Post ↔ tag pivot",
    fields: [
      ["blog_post_id", "FK → blog_posts", "Post"],
      ["blog_tag_id", "FK → blog_tags", "Tag"],
    ],
  },
  {
    name: "content_pages",
    purpose: "Static CMS pages (Standards, Packaging, Story…)",
    fields: [
      ["slug / title", "VARCHAR", "Page identity"],
      ["body_html", "LONGTEXT", "Page content"],
      ["template_key", "VARCHAR", "standards | packaging | story | custom"],
      ["is_published", "BOOLEAN", "Visibility"],
    ],
  },
  {
    name: "seo_site_defaults",
    purpose: "Global SEO + analytics defaults",
    fields: [
      ["default_title / description", "VARCHAR", "Site-wide meta defaults"],
      ["title_suffix / separator", "VARCHAR", "Title template pieces"],
      ["default_og_image_id", "FK → media_assets", "Default social share image"],
      ["robots_default / robots_txt", "VARCHAR / TEXT", "Crawler rules"],
      ["canonical_base_url", "VARCHAR", "https://mehrusa.com"],
      ["GA / GTM / pixels", "VARCHAR", "Analytics IDs"],
      ["search_console_code", "VARCHAR", "Google verification"],
      ["sitemap_enabled", "BOOLEAN", "XML sitemap toggle"],
    ],
  },
  {
    name: "seo_meta",
    purpose: "Per-page / per-entity SEO meta (polymorphic)",
    fields: [
      ["seoable_type / seoable_id", "VARCHAR / BIGINT", "product, blog_post, category, …"],
      ["route_key", "VARCHAR", "home, shop, apply, journal, …"],
      ["meta_title / description / keywords", "VARCHAR", "HTML meta tags"],
      ["canonical_url / robots", "VARCHAR", "Canonical + index rules"],
      ["og_* / twitter_*", "VARCHAR + media FKs", "Open Graph + Twitter cards"],
      ["focus_keyword", "VARCHAR", "Primary SEO keyword"],
    ],
  },
  {
    name: "seo_schema_blocks",
    purpose: "schema.org JSON-LD structured data",
    fields: [
      ["schema_type", "VARCHAR", "Organization | WebSite | Product | Article | FAQPage | BreadcrumbList"],
      ["page_scope", "ENUM", "global | route | entity"],
      ["route_key / seoable_*", "VARCHAR / FK-like", "Where this block appears"],
      ["json_ld", "JSON", "Valid schema.org payload"],
      ["is_active", "BOOLEAN", "Toggle without delete"],
    ],
  },
  {
    name: "seo_redirects",
    purpose: "SEO URL redirects",
    fields: [
      ["from_path / to_path", "VARCHAR UNIQUE", "Old → new path"],
      ["status_code", "SMALLINT", "301 or 302"],
      ["is_active / hit_count", "BOOLEAN / INT", "Control + analytics"],
    ],
  },
];

const summaryItems = tables.map((t, i) => [i + 1, t.name, t.purpose]);

const children = [
  // Cover-ish header block
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "MEHRUSA WHOLESALE", bold: true, size: 36, color: NAVY, font: "Calibri" }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({ text: "Backend Database Schema", size: 28, color: GOLD, font: "Calibri" }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "Laravel  •  MySQL / MariaDB  •  InnoDB  •  utf8mb4", size: 18, color: MUTED, font: "Calibri" }),
    ],
  }),
  new Table({
    width: { size: 9320, type: WidthType.DXA },
    columnWidths: [3100, 6220],
    rows: [
      new TableRow({
        children: [
          cell("Document type", { width: 3100, fill: PEARL, bold: true }),
          cell("Architecture & Schema Deliverable", { width: 6220, fill: PEARL }),
        ],
      }),
      new TableRow({
        children: [
          cell("Project", { width: 3100, bold: true }),
          cell("Mehrusa Wholesale Platform", { width: 6220 }),
        ],
      }),
      new TableRow({
        children: [
          cell("Stack", { width: 3100, fill: PEARL, bold: true }),
          cell("Laravel (API) + SQL relational database", { width: 6220, fill: PEARL }),
        ],
      }),
      new TableRow({
        children: [
          cell("Status", { width: 3100, bold: true }),
          cell("Design / Schema (pre-implementation)", { width: 6220 }),
        ],
      }),
    ],
  }),

  sectionTitle("1. Purpose"),
  body("This document defines the relational database schema for the Mehrusa wholesale backend. It covers catalogue, wholesale applications, enquiry intake, pricing, starter kits, site settings, admin-editable homepage hero, blogs/journal, and full SEO (meta, Open Graph, schema.org JSON-LD, redirects). The design mirrors the existing React storefront so the frontend can connect to a Laravel API without changing business rules."),

  sectionTitle("2. Design principles"),
  bullet("Enquiry-first wholesale flow (no online payment tables in v1)."),
  bullet("Nullable prices where owner confirmation is still pending."),
  bullet("Verified flags on material facts / specs / settings for public safety."),
  bullet("Enquiry line snapshots so catalogue edits do not rewrite history."),
  bullet("Homepage hero text and images are CMS-driven from Admin panel."),
  bullet("Blogs/Journal are first-class content with categories, tags and SEO."),
  bullet("Polymorphic SEO meta + schema.org JSON-LD for site-wide and per-page control."),
  bullet("Soft deletes on products, buyers, enquiries and blog posts."),
  bullet("Foreign keys + indexes for integrity and lookup performance."),

  sectionTitle("3. Table summary"),
  summaryTable(summaryItems),

  sectionTitle("4. Detailed table definitions"),
  body("Each table below lists the main columns used for Laravel Eloquent models and migrations."),
];

for (const t of tables) {
  children.push(tableTitle(t.name, t.purpose));
  children.push(fieldTable(t.fields));
}

children.push(
  sectionTitle("5. Key relationships"),
  bullet("categories 1—N products 1—N product_colours / images / specs / price_tiers"),
  bullet("products 1—1 product_variant_axes 1—N product_variant_options"),
  bullet("buyers 1—N wholesale_applications and enquiries"),
  bullet("enquiries 1—N enquiry_lines (with product snapshots)"),
  bullet("starter_kits 1—N starter_kit_lines → products"),
  bullet("media_assets → homepage_heroes / blog_posts / seo_meta (shared library)"),
  bullet("homepage_heroes 1—N reasons, ways, images (Admin CMS)"),
  bullet("blog_categories 1—N blog_posts N—N blog_tags"),
  bullet("seo_meta polymorphic → home, product, category, blog_post, content_page"),
  bullet("seo_schema_blocks scoped as global / route / entity JSON-LD"),

  sectionTitle("6. Business rules reflected in schema"),
  bullet("MOQ stored on products.min_order_qty."),
  bullet("Wholesale tiers stored in product_price_tiers (min_qty → price_pkr)."),
  bullet("Tier pricing aggregates quantity across colour/size variants of the same product."),
  bullet("Application statuses: pending → needs_info → approved / rejected."),
  bullet("Enquiry statuses: received → quoted → confirmed → fulfilled / cancelled."),
  bullet("Only one homepage_heroes.is_active = 1 is served to the storefront."),
  bullet("Blog posts follow draft → scheduled → published → archived."),
  bullet("SEO defaults + per-page meta + schema.org + redirects are all admin-managed."),
  bullet("site_settings holds WhatsApp number, MOQ copy, shipping, payment terms, season flags."),

  sectionTitle("7. Suggested seed order"),
  body("1) users  →  2) media_assets  →  3) materials  →  4) categories  →  5) products (+ children)  →  6) starter kits  →  7) site_settings  →  8) homepage hero (active)  →  9) sample blogs  →  10) seo_site_defaults + Organization/WebSite schema"),

  sectionTitle("8. Notes for implementation"),
  body("Full executable DDL is available in schema.sql (InnoDB, utf8mb4). Laravel migrations can be generated table-by-table from this design. Public API should expose only verified / published fields. Admin panel manages homepage hero, blogs and SEO without frontend redeploy. Admin routes remain protected via Laravel Sanctum roles (admin / staff)."),

  new Paragraph({
    spacing: { before: 400 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "— End of Schema Document —", italics: true, size: 18, color: MUTED, font: "Calibri" }),
    ],
  }),
);

const doc = new Document({
  creator: "Mehrusa Wholesale",
  title: "Mehrusa Wholesale — Backend Database Schema",
  description: "Professional SQL schema design for Laravel + MySQL backend",
  styles: {
    default: {
      document: {
        styles: [{ id: "Normal", run: { font: "Calibri", size: 20 } }],
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Mehrusa Wholesale", bold: true, size: 16, color: NAVY, font: "Calibri" }),
                new TextRun({ text: "  |  Backend Database Schema", size: 16, color: MUTED, font: "Calibri" }),
              ],
            }),
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 4 } },
              children: [],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "D0D0D0", space: 6 } },
              children: [
                new TextRun({ text: "Confidential  •  For internal / internship submission  •  Page ", size: 14, color: MUTED, font: "Calibri" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 14, color: MUTED, font: "Calibri" }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const out = path.join(__dirname, "Mehrusa_Wholesale_Backend_Schema.docx");
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(out, buffer);
console.log("Created:", out);
