-- =============================================================================
-- Mehrusa Wholesale — MySQL Schema (Laravel-ready)
-- Engine: InnoDB | Charset: utf8mb4
-- Compatible with Laravel migrations (timestamps, soft deletes, enums as strings)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- Auth / staff (extends typical Laravel users)
-- -----------------------------------------------------------------------------

CREATE TABLE users (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(190) NOT NULL,
  email_verified_at TIMESTAMP NULL DEFAULT NULL,
  password          VARCHAR(255) NOT NULL,
  role              ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  is_active         TINYINT(1) NOT NULL DEFAULT 1,
  remember_token    VARCHAR(100) NULL DEFAULT NULL,
  created_at        TIMESTAMP NULL DEFAULT NULL,
  updated_at        TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE personal_access_tokens (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id   BIGINT UNSIGNED NOT NULL,
  name           VARCHAR(255) NOT NULL,
  token          VARCHAR(64) NOT NULL,
  abilities      TEXT NULL,
  last_used_at   TIMESTAMP NULL DEFAULT NULL,
  expires_at     TIMESTAMP NULL DEFAULT NULL,
  created_at     TIMESTAMP NULL DEFAULT NULL,
  updated_at     TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY personal_access_tokens_token_unique (token),
  KEY personal_access_tokens_tokenable_index (tokenable_type, tokenable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Buyers (wholesale customers / applicants)
-- -----------------------------------------------------------------------------

CREATE TABLE buyers (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  buyer_type      ENUM('boutique','online','gifting','market') NULL DEFAULT NULL,
  name            VARCHAR(120) NOT NULL,
  business_name   VARCHAR(160) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  country         VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
  phone           VARCHAR(32) NOT NULL COMMENT 'Prefer E.164 e.g. +923001234567',
  phone_normalized VARCHAR(20) NULL DEFAULT NULL,
  online_presence VARCHAR(200) NULL DEFAULT NULL COMMENT 'Instagram or website',
  what_they_sell  TEXT NULL,
  status          ENUM('lead','pending','approved','rejected','inactive') NOT NULL DEFAULT 'lead',
  notes_internal  TEXT NULL COMMENT 'Staff-only notes',
  created_at      TIMESTAMP NULL DEFAULT NULL,
  updated_at      TIMESTAMP NULL DEFAULT NULL,
  deleted_at      TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY buyers_phone_index (phone),
  KEY buyers_status_index (status),
  KEY buyers_city_index (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Catalogue: materials, categories, products
-- -----------------------------------------------------------------------------

CREATE TABLE materials (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug       VARCHAR(80) NOT NULL,
  name       VARCHAR(120) NOT NULL,
  summary    TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY materials_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE material_facts (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  material_id BIGINT UNSIGNED NOT NULL,
  label       VARCHAR(120) NOT NULL,
  value       VARCHAR(255) NOT NULL,
  verified    TINYINT(1) NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NULL DEFAULT NULL,
  updated_at  TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY material_facts_material_id_foreign (material_id),
  CONSTRAINT material_facts_material_id_foreign
    FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE material_care_notes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  material_id BIGINT UNSIGNED NOT NULL,
  text        VARCHAR(500) NOT NULL,
  verified    TINYINT(1) NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NULL DEFAULT NULL,
  updated_at  TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY material_care_notes_material_id_foreign (material_id),
  CONSTRAINT material_care_notes_material_id_foreign
    FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(80) NOT NULL,
  name_en      VARCHAR(120) NOT NULL,
  name_ur      VARCHAR(120) NULL DEFAULT NULL,
  family       ENUM('jewellery','clothing') NOT NULL,
  status       ENUM('live','coming_soon','hidden') NOT NULL DEFAULT 'live',
  intro        TEXT NULL,
  glyph        VARCHAR(40) NULL DEFAULT NULL COMMENT 'ring, earring, necklace, ...',
  cover_image  VARCHAR(255) NULL DEFAULT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY categories_slug_unique (slug),
  KEY categories_family_status_index (family, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id      BIGINT UNSIGNED NOT NULL,
  material_id      BIGINT UNSIGNED NULL DEFAULT NULL,
  slug             VARCHAR(160) NOT NULL,
  sku              VARCHAR(40) NOT NULL,
  name             VARCHAR(160) NOT NULL,
  description      TEXT NOT NULL,
  finish           VARCHAR(120) NULL DEFAULT NULL,
  wholesale_unit   ENUM('piece','dozen','set','suit') NOT NULL DEFAULT 'piece',
  min_order_qty    INT UNSIGNED NOT NULL DEFAULT 12,
  lead_time_days   INT UNSIGNED NULL DEFAULT NULL,
  stock_mode       ENUM('in_stock','out_of_stock','made_to_order') NOT NULL DEFAULT 'in_stock',
  retail_price_pkr DECIMAL(12,2) NULL DEFAULT NULL,
  pieces_per_unit  INT UNSIGNED NULL DEFAULT NULL COMMENT 'For sets: pieces in one unit',
  fabric_meters    DECIMAL(8,2) NULL DEFAULT NULL COMMENT 'For unstitched suits',
  care_note        VARCHAR(500) NULL DEFAULT NULL,
  is_placeholder   TINYINT(1) NOT NULL DEFAULT 0,
  reorder_rank     INT NULL DEFAULT NULL,
  is_published     TINYINT(1) NOT NULL DEFAULT 1,
  published_at     TIMESTAMP NULL DEFAULT NULL,
  created_at       TIMESTAMP NULL DEFAULT NULL,
  updated_at       TIMESTAMP NULL DEFAULT NULL,
  deleted_at       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY products_slug_unique (slug),
  UNIQUE KEY products_sku_unique (sku),
  KEY products_category_id_foreign (category_id),
  KEY products_material_id_foreign (material_id),
  KEY products_published_index (is_published, published_at),
  KEY products_stock_mode_index (stock_mode),
  CONSTRAINT products_category_id_foreign
    FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT products_material_id_foreign
    FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_colours (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   BIGINT UNSIGNED NOT NULL,
  name         VARCHAR(80) NOT NULL,
  hex          VARCHAR(7) NULL DEFAULT NULL,
  image_path   VARCHAR(255) NULL DEFAULT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY product_colours_product_id_foreign (product_id),
  UNIQUE KEY product_colours_product_name_unique (product_id, name),
  CONSTRAINT product_colours_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_images (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   BIGINT UNSIGNED NOT NULL,
  path         VARCHAR(255) NOT NULL,
  alt_text     VARCHAR(255) NULL DEFAULT NULL,
  is_primary   TINYINT(1) NOT NULL DEFAULT 0,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY product_images_product_id_foreign (product_id),
  CONSTRAINT product_images_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_specs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   BIGINT UNSIGNED NOT NULL,
  spec_key     VARCHAR(80) NOT NULL,
  spec_value   VARCHAR(255) NOT NULL,
  verified     TINYINT(1) NOT NULL DEFAULT 0,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY product_specs_product_id_foreign (product_id),
  CONSTRAINT product_specs_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_price_tiers (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   BIGINT UNSIGNED NOT NULL,
  min_qty      INT UNSIGNED NOT NULL,
  price_pkr    DECIMAL(12,2) NULL DEFAULT NULL COMMENT 'NULL = price on request / not confirmed',
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY product_price_tiers_product_id_foreign (product_id),
  UNIQUE KEY product_price_tiers_product_min_qty_unique (product_id, min_qty),
  CONSTRAINT product_price_tiers_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variant axis e.g. Size: 6/7/8/9 or Length: 40 cm / 45 cm; or clothing size run
CREATE TABLE product_variant_axes (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   BIGINT UNSIGNED NOT NULL,
  label        VARCHAR(80) NOT NULL COMMENT 'Size, Length, Suit, ...',
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_variant_axes_product_id_unique (product_id),
  CONSTRAINT product_variant_axes_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_variant_options (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  axis_id      BIGINT UNSIGNED NOT NULL,
  value        VARCHAR(80) NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY product_variant_options_axis_id_foreign (axis_id),
  UNIQUE KEY product_variant_options_axis_value_unique (axis_id, value),
  CONSTRAINT product_variant_options_axis_id_foreign
    FOREIGN KEY (axis_id) REFERENCES product_variant_axes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_occasions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   BIGINT UNSIGNED NOT NULL,
  occasion     ENUM('everyday','gifting','eid','layering','workwear') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_occasions_unique (product_id, occasion),
  CONSTRAINT product_occasions_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_badges (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   BIGINT UNSIGNED NOT NULL,
  badge        ENUM('new','limited_batch','eid_edit') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_badges_unique (product_id, badge),
  CONSTRAINT product_badges_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Starter kits (opening assortments by buyer type)
-- -----------------------------------------------------------------------------

CREATE TABLE starter_kits (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(80) NOT NULL,
  buyer_type   ENUM('boutique','online','gifting','market') NOT NULL,
  title        VARCHAR(160) NOT NULL,
  why          TEXT NOT NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY starter_kits_slug_unique (slug),
  KEY starter_kits_buyer_type_index (buyer_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE starter_kit_lines (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  starter_kit_id BIGINT UNSIGNED NOT NULL,
  product_id     BIGINT UNSIGNED NOT NULL,
  colour         VARCHAR(80) NOT NULL,
  option_value   VARCHAR(80) NOT NULL DEFAULT 'One size',
  qty            INT UNSIGNED NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NULL DEFAULT NULL,
  updated_at     TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY starter_kit_lines_kit_id_foreign (starter_kit_id),
  KEY starter_kit_lines_product_id_foreign (product_id),
  CONSTRAINT starter_kit_lines_kit_id_foreign
    FOREIGN KEY (starter_kit_id) REFERENCES starter_kits (id) ON DELETE CASCADE,
  CONSTRAINT starter_kit_lines_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Wholesale applications
-- -----------------------------------------------------------------------------

CREATE TABLE wholesale_applications (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  buyer_id          BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Linked after approval / match',
  name              VARCHAR(120) NOT NULL,
  business_name     VARCHAR(160) NOT NULL,
  city              VARCHAR(100) NOT NULL,
  country           VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
  phone             VARCHAR(32) NOT NULL,
  online_presence   VARCHAR(200) NULL DEFAULT NULL,
  what_they_sell    TEXT NOT NULL,
  expected_order_size VARCHAR(80) NOT NULL COMMENT 'e.g. Under 50 pieces',
  source            VARCHAR(80) NULL DEFAULT NULL COMMENT 'How they heard about us',
  notes             TEXT NULL,
  status            ENUM('pending','needs_info','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by       BIGINT UNSIGNED NULL DEFAULT NULL,
  reviewed_at       TIMESTAMP NULL DEFAULT NULL,
  review_notes      TEXT NULL,
  created_at        TIMESTAMP NULL DEFAULT NULL,
  updated_at        TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY wholesale_applications_buyer_id_foreign (buyer_id),
  KEY wholesale_applications_reviewed_by_foreign (reviewed_by),
  KEY wholesale_applications_status_index (status),
  CONSTRAINT wholesale_applications_buyer_id_foreign
    FOREIGN KEY (buyer_id) REFERENCES buyers (id) ON DELETE SET NULL,
  CONSTRAINT wholesale_applications_reviewed_by_foreign
    FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wholesale_application_interests (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  category_id    BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY wholesale_application_interests_unique (application_id, category_id),
  KEY wholesale_application_interests_category_id_foreign (category_id),
  CONSTRAINT wholesale_application_interests_application_id_foreign
    FOREIGN KEY (application_id) REFERENCES wholesale_applications (id) ON DELETE CASCADE,
  CONSTRAINT wholesale_application_interests_category_id_foreign
    FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Enquiries (wholesale order enquiries — not payments)
-- -----------------------------------------------------------------------------

CREATE TABLE enquiries (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enquiry_number   VARCHAR(32) NOT NULL COMMENT 'Human-readable e.g. MH-ENQ-2026-00041',
  buyer_id         BIGINT UNSIGNED NULL DEFAULT NULL,
  buyer_name       VARCHAR(120) NULL DEFAULT NULL,
  buyer_business   VARCHAR(160) NULL DEFAULT NULL,
  buyer_city       VARCHAR(100) NULL DEFAULT NULL,
  buyer_phone      VARCHAR(32) NULL DEFAULT NULL,
  buyer_notes      TEXT NULL,
  channel          ENUM('whatsapp','email','api','admin') NOT NULL DEFAULT 'api',
  status           ENUM('received','quoted','confirmed','fulfilled','cancelled') NOT NULL DEFAULT 'received',
  total_units      INT UNSIGNED NOT NULL DEFAULT 0,
  subtotal_pkr     DECIMAL(14,2) NULL DEFAULT NULL COMMENT 'NULL if any line price unknown',
  currency         CHAR(3) NOT NULL DEFAULT 'PKR',
  assigned_to      BIGINT UNSIGNED NULL DEFAULT NULL,
  admin_notes      TEXT NULL,
  submitted_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at       TIMESTAMP NULL DEFAULT NULL,
  updated_at       TIMESTAMP NULL DEFAULT NULL,
  deleted_at       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY enquiries_enquiry_number_unique (enquiry_number),
  KEY enquiries_buyer_id_foreign (buyer_id),
  KEY enquiries_assigned_to_foreign (assigned_to),
  KEY enquiries_status_index (status),
  KEY enquiries_submitted_at_index (submitted_at),
  CONSTRAINT enquiries_buyer_id_foreign
    FOREIGN KEY (buyer_id) REFERENCES buyers (id) ON DELETE SET NULL,
  CONSTRAINT enquiries_assigned_to_foreign
    FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enquiry_lines (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enquiry_id       BIGINT UNSIGNED NOT NULL,
  product_id       BIGINT UNSIGNED NULL DEFAULT NULL,
  product_sku      VARCHAR(40) NOT NULL,
  product_name     VARCHAR(160) NOT NULL COMMENT 'Snapshot at time of enquiry',
  colour           VARCHAR(80) NOT NULL,
  option_value     VARCHAR(80) NOT NULL DEFAULT 'One size',
  qty              INT UNSIGNED NOT NULL,
  unit_price_pkr   DECIMAL(12,2) NULL DEFAULT NULL,
  line_total_pkr   DECIMAL(14,2) NULL DEFAULT NULL,
  wholesale_unit   ENUM('piece','dozen','set','suit') NOT NULL DEFAULT 'piece',
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NULL DEFAULT NULL,
  updated_at       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY enquiry_lines_enquiry_id_foreign (enquiry_id),
  KEY enquiry_lines_product_id_foreign (product_id),
  CONSTRAINT enquiry_lines_enquiry_id_foreign
    FOREIGN KEY (enquiry_id) REFERENCES enquiries (id) ON DELETE CASCADE,
  CONSTRAINT enquiry_lines_product_id_foreign
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enquiry_status_logs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enquiry_id   BIGINT UNSIGNED NOT NULL,
  from_status  VARCHAR(40) NULL DEFAULT NULL,
  to_status    VARCHAR(40) NOT NULL,
  changed_by   BIGINT UNSIGNED NULL DEFAULT NULL,
  note         TEXT NULL,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY enquiry_status_logs_enquiry_id_foreign (enquiry_id),
  KEY enquiry_status_logs_changed_by_foreign (changed_by),
  CONSTRAINT enquiry_status_logs_enquiry_id_foreign
    FOREIGN KEY (enquiry_id) REFERENCES enquiries (id) ON DELETE CASCADE,
  CONSTRAINT enquiry_status_logs_changed_by_foreign
    FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Contact messages (optional contact page)
-- -----------------------------------------------------------------------------

CREATE TABLE contact_messages (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(120) NOT NULL,
  phone        VARCHAR(32) NULL DEFAULT NULL,
  email        VARCHAR(190) NULL DEFAULT NULL,
  subject      VARCHAR(200) NULL DEFAULT NULL,
  message      TEXT NOT NULL,
  status       ENUM('new','read','replied','archived') NOT NULL DEFAULT 'new',
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY contact_messages_status_index (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Site settings / wholesale terms (key-value)
-- -----------------------------------------------------------------------------

CREATE TABLE site_settings (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key  VARCHAR(100) NOT NULL,
  setting_value TEXT NULL,
  is_public    TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = safe to expose on public API',
  verified     TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_unique (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example keys (insert via seeder, not required for CREATE):
-- whatsapp_number, email, moq_rule, order_minimum, payment_terms, shipping,
-- shipping_international, lead_time, made_to_order_lead_time, returns_damage,
-- sample_pack_price, sample_pack_contents, reply_promise, business_hours,
-- city, instagram, announcement, season, wholesale_numbers_verified

-- -----------------------------------------------------------------------------
-- Media library (shared by hero, blogs, SEO OG images, products)
-- -----------------------------------------------------------------------------

CREATE TABLE media_assets (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  disk           VARCHAR(40) NOT NULL DEFAULT 'public',
  path           VARCHAR(255) NOT NULL,
  filename       VARCHAR(255) NOT NULL,
  mime_type      VARCHAR(100) NULL DEFAULT NULL,
  size_bytes     INT UNSIGNED NULL DEFAULT NULL,
  width          INT UNSIGNED NULL DEFAULT NULL,
  height         INT UNSIGNED NULL DEFAULT NULL,
  alt_text       VARCHAR(255) NULL DEFAULT NULL,
  folder         VARCHAR(80) NULL DEFAULT NULL COMMENT 'hero, blog, products, seo, ...',
  uploaded_by    BIGINT UNSIGNED NULL DEFAULT NULL,
  created_at     TIMESTAMP NULL DEFAULT NULL,
  updated_at     TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY media_assets_folder_index (folder),
  KEY media_assets_uploaded_by_foreign (uploaded_by),
  CONSTRAINT media_assets_uploaded_by_foreign
    FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Homepage hero CMS (Admin panel can change text + images)
-- -----------------------------------------------------------------------------

CREATE TABLE homepage_heroes (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                  VARCHAR(120) NOT NULL DEFAULT 'Default hero' COMMENT 'Admin label',
  eyebrow               VARCHAR(120) NULL DEFAULT NULL COMMENT 'e.g. Mehrusa Wholesale',
  headline_line_1       VARCHAR(200) NOT NULL COMMENT 'e.g. Veiled in grace.',
  headline_line_2       VARCHAR(200) NULL DEFAULT NULL COMMENT 'e.g. Crowned in light.',
  supporting_text       TEXT NOT NULL,
  supporting_text_strong VARCHAR(255) NULL DEFAULT NULL COMMENT 'Emphasised trailing sentence',
  primary_cta_label     VARCHAR(80) NOT NULL,
  primary_cta_url       VARCHAR(255) NOT NULL,
  secondary_cta_label   VARCHAR(80) NULL DEFAULT NULL,
  secondary_cta_url     VARCHAR(255) NULL DEFAULT NULL,
  background_media_id   BIGINT UNSIGNED NULL DEFAULT NULL,
  side_media_id         BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Desktop facet / side visual',
  overlay_opacity       DECIMAL(3,2) NULL DEFAULT 0.07,
  figcaption            VARCHAR(200) NULL DEFAULT NULL,
  is_active             TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Only one should be active',
  published_at          TIMESTAMP NULL DEFAULT NULL,
  created_by            BIGINT UNSIGNED NULL DEFAULT NULL,
  updated_by            BIGINT UNSIGNED NULL DEFAULT NULL,
  created_at            TIMESTAMP NULL DEFAULT NULL,
  updated_at            TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY homepage_heroes_is_active_index (is_active),
  KEY homepage_heroes_background_media_id_foreign (background_media_id),
  KEY homepage_heroes_side_media_id_foreign (side_media_id),
  KEY homepage_heroes_created_by_foreign (created_by),
  KEY homepage_heroes_updated_by_foreign (updated_by),
  CONSTRAINT homepage_heroes_background_media_id_foreign
    FOREIGN KEY (background_media_id) REFERENCES media_assets (id) ON DELETE SET NULL,
  CONSTRAINT homepage_heroes_side_media_id_foreign
    FOREIGN KEY (side_media_id) REFERENCES media_assets (id) ON DELETE SET NULL,
  CONSTRAINT homepage_heroes_created_by_foreign
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT homepage_heroes_updated_by_foreign
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homepage_hero_reasons (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hero_id      BIGINT UNSIGNED NOT NULL,
  text         VARCHAR(200) NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY homepage_hero_reasons_hero_id_foreign (hero_id),
  CONSTRAINT homepage_hero_reasons_hero_id_foreign
    FOREIGN KEY (hero_id) REFERENCES homepage_heroes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homepage_hero_ways (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hero_id      BIGINT UNSIGNED NOT NULL,
  label_key    VARCHAR(120) NOT NULL COMMENT 'e.g. Know your SKUs?',
  label_value  VARCHAR(160) NOT NULL COMMENT 'e.g. Quick order pad',
  link_url     VARCHAR(255) NULL DEFAULT NULL,
  is_accent    TINYINT(1) NOT NULL DEFAULT 0,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY homepage_hero_ways_hero_id_foreign (hero_id),
  CONSTRAINT homepage_hero_ways_hero_id_foreign
    FOREIGN KEY (hero_id) REFERENCES homepage_heroes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homepage_hero_images (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hero_id      BIGINT UNSIGNED NOT NULL,
  media_id     BIGINT UNSIGNED NOT NULL,
  role         ENUM('background','side','facet','mobile','gallery') NOT NULL DEFAULT 'gallery',
  caption      VARCHAR(255) NULL DEFAULT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY homepage_hero_images_hero_id_foreign (hero_id),
  KEY homepage_hero_images_media_id_foreign (media_id),
  CONSTRAINT homepage_hero_images_hero_id_foreign
    FOREIGN KEY (hero_id) REFERENCES homepage_heroes (id) ON DELETE CASCADE,
  CONSTRAINT homepage_hero_images_media_id_foreign
    FOREIGN KEY (media_id) REFERENCES media_assets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Blogs / Journal
-- -----------------------------------------------------------------------------

CREATE TABLE blog_categories (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(120) NOT NULL,
  name         VARCHAR(160) NOT NULL,
  description  TEXT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY blog_categories_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_tags (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(120) NOT NULL,
  name         VARCHAR(120) NOT NULL,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY blog_tags_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_posts (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  blog_category_id BIGINT UNSIGNED NULL DEFAULT NULL,
  author_id        BIGINT UNSIGNED NULL DEFAULT NULL,
  slug             VARCHAR(180) NOT NULL,
  title            VARCHAR(220) NOT NULL,
  excerpt          TEXT NULL,
  body_html        LONGTEXT NOT NULL,
  cover_media_id   BIGINT UNSIGNED NULL DEFAULT NULL,
  status           ENUM('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  published_at     TIMESTAMP NULL DEFAULT NULL,
  reading_minutes  INT UNSIGNED NULL DEFAULT NULL,
  created_at       TIMESTAMP NULL DEFAULT NULL,
  updated_at       TIMESTAMP NULL DEFAULT NULL,
  deleted_at       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY blog_posts_slug_unique (slug),
  KEY blog_posts_status_published_index (status, published_at),
  KEY blog_posts_blog_category_id_foreign (blog_category_id),
  KEY blog_posts_author_id_foreign (author_id),
  KEY blog_posts_cover_media_id_foreign (cover_media_id),
  CONSTRAINT blog_posts_blog_category_id_foreign
    FOREIGN KEY (blog_category_id) REFERENCES blog_categories (id) ON DELETE SET NULL,
  CONSTRAINT blog_posts_author_id_foreign
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT blog_posts_cover_media_id_foreign
    FOREIGN KEY (cover_media_id) REFERENCES media_assets (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_post_tag (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  blog_post_id BIGINT UNSIGNED NOT NULL,
  blog_tag_id  BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY blog_post_tag_unique (blog_post_id, blog_tag_id),
  KEY blog_post_tag_blog_tag_id_foreign (blog_tag_id),
  CONSTRAINT blog_post_tag_blog_post_id_foreign
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
  CONSTRAINT blog_post_tag_blog_tag_id_foreign
    FOREIGN KEY (blog_tag_id) REFERENCES blog_tags (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Static CMS pages (Standards, Packaging, Story, Terms copy, etc.)
CREATE TABLE content_pages (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(120) NOT NULL,
  title        VARCHAR(200) NOT NULL,
  body_html    LONGTEXT NULL,
  template_key VARCHAR(80) NULL DEFAULT NULL COMMENT 'standards, packaging, story, custom',
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY content_pages_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- SEO: site defaults, per-entity meta, schema.org JSON-LD, redirects
-- -----------------------------------------------------------------------------

CREATE TABLE seo_site_defaults (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_name             VARCHAR(160) NOT NULL DEFAULT 'Mehrusa',
  default_title         VARCHAR(180) NOT NULL,
  title_separator       VARCHAR(10) NOT NULL DEFAULT '|',
  title_suffix          VARCHAR(80) NULL DEFAULT 'Mehrusa Wholesale',
  default_description   VARCHAR(320) NOT NULL,
  default_keywords      VARCHAR(500) NULL DEFAULT NULL,
  default_og_image_id   BIGINT UNSIGNED NULL DEFAULT NULL,
  robots_default        VARCHAR(80) NOT NULL DEFAULT 'index,follow',
  canonical_base_url    VARCHAR(255) NOT NULL COMMENT 'e.g. https://mehrusa.com',
  twitter_handle        VARCHAR(80) NULL DEFAULT NULL,
  google_analytics_id   VARCHAR(40) NULL DEFAULT NULL,
  google_tag_manager_id VARCHAR(40) NULL DEFAULT NULL,
  facebook_pixel_id     VARCHAR(40) NULL DEFAULT NULL,
  search_console_code   VARCHAR(255) NULL DEFAULT NULL COMMENT 'Google site verification meta',
  bing_verification     VARCHAR(255) NULL DEFAULT NULL,
  sitemap_enabled       TINYINT(1) NOT NULL DEFAULT 1,
  robots_txt            TEXT NULL COMMENT 'Full robots.txt body editable by admin',
  created_at            TIMESTAMP NULL DEFAULT NULL,
  updated_at            TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY seo_site_defaults_default_og_image_id_foreign (default_og_image_id),
  CONSTRAINT seo_site_defaults_default_og_image_id_foreign
    FOREIGN KEY (default_og_image_id) REFERENCES media_assets (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Polymorphic SEO meta for any page/entity (home, product, category, blog, content page)
CREATE TABLE seo_meta (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  seoable_type      VARCHAR(80) NOT NULL COMMENT 'home, product, category, blog_post, content_page, custom_route',
  seoable_id        BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'NULL for route-only rows e.g. home',
  route_key         VARCHAR(120) NULL DEFAULT NULL COMMENT 'e.g. home, shop, apply, journal',
  meta_title        VARCHAR(180) NULL DEFAULT NULL,
  meta_description  VARCHAR(320) NULL DEFAULT NULL,
  meta_keywords     VARCHAR(500) NULL DEFAULT NULL,
  canonical_url     VARCHAR(255) NULL DEFAULT NULL,
  robots            VARCHAR(80) NULL DEFAULT NULL COMMENT 'index,follow / noindex,nofollow',
  og_title          VARCHAR(180) NULL DEFAULT NULL,
  og_description    VARCHAR(320) NULL DEFAULT NULL,
  og_image_id       BIGINT UNSIGNED NULL DEFAULT NULL,
  og_type           VARCHAR(40) NULL DEFAULT 'website',
  twitter_card      VARCHAR(40) NULL DEFAULT 'summary_large_image',
  twitter_title     VARCHAR(180) NULL DEFAULT NULL,
  twitter_description VARCHAR(320) NULL DEFAULT NULL,
  twitter_image_id  BIGINT UNSIGNED NULL DEFAULT NULL,
  focus_keyword     VARCHAR(120) NULL DEFAULT NULL,
  created_at        TIMESTAMP NULL DEFAULT NULL,
  updated_at        TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY seo_meta_entity_unique (seoable_type, seoable_id, route_key),
  KEY seo_meta_route_key_index (route_key),
  KEY seo_meta_og_image_id_foreign (og_image_id),
  KEY seo_meta_twitter_image_id_foreign (twitter_image_id),
  CONSTRAINT seo_meta_og_image_id_foreign
    FOREIGN KEY (og_image_id) REFERENCES media_assets (id) ON DELETE SET NULL,
  CONSTRAINT seo_meta_twitter_image_id_foreign
    FOREIGN KEY (twitter_image_id) REFERENCES media_assets (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Structured data / schema.org JSON-LD blocks (Organization, Product, Article, FAQ, Breadcrumb…)
CREATE TABLE seo_schema_blocks (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL COMMENT 'Admin label',
  schema_type    VARCHAR(80) NOT NULL COMMENT 'Organization, WebSite, Product, Article, FAQPage, BreadcrumbList, LocalBusiness',
  page_scope     ENUM('global','route','entity') NOT NULL DEFAULT 'global',
  route_key      VARCHAR(120) NULL DEFAULT NULL,
  seoable_type   VARCHAR(80) NULL DEFAULT NULL,
  seoable_id     BIGINT UNSIGNED NULL DEFAULT NULL,
  json_ld        JSON NOT NULL COMMENT 'Valid schema.org JSON-LD object/array',
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NULL DEFAULT NULL,
  updated_at     TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY seo_schema_blocks_scope_index (page_scope, route_key),
  KEY seo_schema_blocks_entity_index (seoable_type, seoable_id),
  KEY seo_schema_blocks_type_index (schema_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEO redirects (old URL → new URL)
CREATE TABLE seo_redirects (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_path    VARCHAR(255) NOT NULL,
  to_path      VARCHAR(255) NOT NULL,
  status_code  SMALLINT UNSIGNED NOT NULL DEFAULT 301,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  hit_count    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NULL DEFAULT NULL,
  updated_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY seo_redirects_from_path_unique (from_path),
  KEY seo_redirects_is_active_index (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- End of schema
-- =============================================================================
