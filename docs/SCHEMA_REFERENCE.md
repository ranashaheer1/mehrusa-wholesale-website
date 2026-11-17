# Mehrusa Wholesale — Schema Reference

Quick table guide for reviewers. Full DDL: [`schema.sql`](./schema.sql). Architecture: [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md).

---

## Table summary

| # | Table | Purpose |
|---|--------|---------|
| 1 | `users` | Admin / staff accounts |
| 2 | `personal_access_tokens` | Laravel Sanctum API tokens |
| 3 | `buyers` | Wholesale customers / leads |
| 4 | `materials` | Stainless steel, fabrics, etc. |
| 5 | `material_facts` | Spec facts with verified flag |
| 6 | `material_care_notes` | Care instructions |
| 7 | `categories` | Rings, earrings, abayas, … |
| 8 | `products` | Core catalogue items |
| 9 | `product_colours` | Colourways per product |
| 10 | `product_images` | Gallery images |
| 11 | `product_specs` | Key/value specs |
| 12 | `product_price_tiers` | Wholesale qty → price |
| 13 | `product_variant_axes` | Size / length axis label |
| 14 | `product_variant_options` | Axis option values |
| 15 | `product_occasions` | everyday, eid, … |
| 16 | `product_badges` | new, limited_batch, eid_edit |
| 17 | `starter_kits` | Curated first-order kits |
| 18 | `starter_kit_lines` | Kit line items |
| 19 | `wholesale_applications` | Apply-for-wholesale form |
| 20 | `wholesale_application_interests` | Categories of interest |
| 21 | `enquiries` | Enquiry / order intake header |
| 22 | `enquiry_lines` | Enquiry line items (snapshots) |
| 23 | `enquiry_status_logs` | Status change history |
| 24 | `contact_messages` | Contact form |
| 25 | `site_settings` | Terms, WhatsApp, MOQ copy |
| 26 | `media_assets` | Shared media library |
| 27 | `homepage_heroes` | Admin-editable home hero |
| 28 | `homepage_hero_reasons` | Hero reason bullets |
| 29 | `homepage_hero_ways` | “Ways to start” links |
| 30 | `homepage_hero_images` | Extra hero images |
| 31 | `blog_categories` | Journal categories |
| 32 | `blog_tags` | Blog tags |
| 33 | `blog_posts` | Blog / journal articles |
| 34 | `blog_post_tag` | Post ↔ tag pivot |
| 35 | `content_pages` | Static CMS pages |
| 36 | `seo_site_defaults` | Global SEO + analytics |
| 37 | `seo_meta` | Per-page / per-entity meta |
| 38 | `seo_schema_blocks` | schema.org JSON-LD |
| 39 | `seo_redirects` | 301/302 redirects |

---

## Core relationships

| Parent | Child | Relationship |
|--------|-------|--------------|
| `categories` | `products` | 1 : N |
| `materials` | `products` | 1 : N |
| `products` | `product_colours` | 1 : N |
| `products` | `product_price_tiers` | 1 : N |
| `products` | `product_variant_axes` | 1 : 1 |
| `product_variant_axes` | `product_variant_options` | 1 : N |
| `buyers` | `wholesale_applications` | 1 : N |
| `buyers` | `enquiries` | 1 : N |
| `enquiries` | `enquiry_lines` | 1 : N |
| `starter_kits` | `starter_kit_lines` | 1 : N |
| `media_assets` | `homepage_heroes` | 1 : N (bg / side) |
| `homepage_heroes` | reasons / ways / images | 1 : N |
| `blog_categories` | `blog_posts` | 1 : N |
| `blog_posts` | `blog_tags` | N : N |
| `seo_meta` | entities / routes | polymorphic |
| `seo_schema_blocks` | global / route / entity | scoped JSON-LD |

---

## Mapping from current frontend → SQL

| Frontend source | Backend tables |
|-----------------|----------------|
| `src/data/types.ts` → `Product` | `products` + child tables |
| `src/data/categories.ts` | `categories` |
| `src/data/materials.ts` | `materials`, `material_facts`, `material_care_notes` |
| `src/data/buyers.ts` → buyer types / kits | `buyers.buyer_type`, `starter_kits`, `starter_kit_lines` |
| `src/store/list.ts` → list lines + buyer | `enquiries`, `enquiry_lines` |
| `src/pages/Apply.tsx` form | `wholesale_applications`, `wholesale_application_interests` |
| `src/config/terms.ts` | `site_settings` |
| `src/lib/pricing.ts` tiers | `product_price_tiers` |
| `src/components/home/HomeHero.tsx` | `homepage_heroes` + reasons / ways / images |
| `src/pages/Content.tsx` → Journal | `blog_posts`, `blog_categories`, `blog_tags` |
| `index.html` + `usePageMeta` SEO | `seo_site_defaults`, `seo_meta`, `seo_schema_blocks` |

---

## Homepage hero (Admin panel)

Admin can change without redeploying frontend:

1. Headline + supporting copy  
2. Primary / secondary CTA labels and URLs  
3. Background and side images (`media_assets`)  
4. Reason bullets  
5. “Ways to start” bar  

Only one `homepage_heroes.is_active = 1` row is served publicly.

---

## Blogs

- Draft → scheduled → published → archived  
- Cover image from media library  
- Categories + tags  
- Soft delete on posts  
- Each post links to `seo_meta` + optional Article `seo_schema_blocks`

---

## SEO coverage

| Need | How |
|------|-----|
| Title / description / keywords | `seo_meta` |
| Open Graph + Twitter cards | `seo_meta` + media FKs |
| Organization / Product / Article JSON-LD | `seo_schema_blocks.json_ld` |
| robots.txt / GA / GTM / Search Console | `seo_site_defaults` |
| Old URL fixes | `seo_redirects` |
| Sitemap | Generated; toggle `sitemap_enabled` |

---

## Important design choices

1. **Enquiry snapshots** — `enquiry_lines` store SKU/name/prices at submit time.  
2. **Nullable prices** — tiers may be `NULL` until owner confirms.  
3. **Verified flags** — unconfirmed facts stay off public claims.  
4. **Hero CMS** — home hero text and images are admin-driven, not hardcoded.  
5. **Polymorphic SEO** — one `seo_meta` pattern for home, products, blogs, pages.  
6. **No payment tables in v1** — enquiry → WhatsApp/email flow.

---

## Suggested seed order

1. `users` (admin)  
2. `media_assets` (placeholder hero / OG images)  
3. `materials` (+ facts / care)  
4. `categories`  
5. `products` (+ colours, images, specs, tiers, variants, badges, occasions)  
6. `starter_kits` + lines  
7. `site_settings`  
8. `homepage_heroes` (+ reasons, ways, images) — mark one active  
9. `blog_categories` / sample `blog_posts`  
10. `seo_site_defaults` + global Organization / WebSite schema blocks  
