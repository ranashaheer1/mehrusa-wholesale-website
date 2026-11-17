import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ text, font: "Calibri", size: 22, ...opts.run })],
  });

const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Daily Work Report — Mehrusa Wholesale", bold: true, size: 32, font: "Calibri" })],
        }),
        p("Date: 11 November 2026"),
        p("Trainee task (as assigned today): Start development + Admin panel for Homepage Hero (editable data/images) and SEO Schema."),
        new Paragraph({
          spacing: { before: 200, after: 120 },
          children: [new TextRun({ text: "Work completed today", bold: true, size: 26, font: "Calibri" })],
        }),
        p("1. Created backend Admin API project (backend/) with SQLite database."),
        p("2. Built Admin Panel UI at /admin with login."),
        p("3. Homepage Hero module: admin can edit headline, text, CTAs, reasons, ways-to-start, image URLs, upload image, and set active hero."),
        p("4. SEO module: site defaults, page meta (title/description/OG), and schema.org JSON-LD blocks (Organization/WebSite etc.)."),
        p("5. Public APIs ready: GET /api/hero/public and GET /api/seo/public?route=home."),
        p("6. Seeded default hero + SEO content matching current Mehrusa homepage copy."),
        new Paragraph({
          spacing: { before: 200, after: 120 },
          children: [new TextRun({ text: "How to run / demo", bold: true, size: 26, font: "Calibri" })],
        }),
        p("cd backend → npm install → npm run dev"),
        p("Open http://localhost:4000/admin/"),
        p("Login: admin@mehrusa.com / admin123"),
        new Paragraph({
          spacing: { before: 200, after: 120 },
          children: [new TextRun({ text: "Note", bold: true, size: 26, font: "Calibri" })],
        }),
        p("Scope kept limited to what was asked today (Admin panel + Homepage Hero + SEO schema). Full catalogue/enquiry Laravel migration can follow after PHP/Laragon setup if required."),
        new Paragraph({
          spacing: { before: 280 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: "Status: Development started — Hero & SEO Admin ready for review.", italics: true, size: 22, font: "Calibri" })],
        }),
      ],
    },
  ],
});

const out = path.join(__dirname, "Daily_Work_Report_Hero_SEO_Admin.docx");
fs.writeFileSync(out, await Packer.toBuffer(doc));
console.log("Created", out);
