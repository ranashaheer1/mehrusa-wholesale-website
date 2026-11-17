<?php

namespace Database\Seeders;

use App\Models\HomepageHero;
use App\Models\SeoMeta;
use App\Models\SeoSchemaBlock;
use App\Models\SeoSiteDefault;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@mehrusa.com'],
            [
                'name' => 'Mehrusa Admin',
                'password' => 'admin123',
            ]
        );

        SeoSiteDefault::query()->updateOrCreate(
            ['id' => 1],
            [
                'site_name' => 'Mehrusa',
                'default_title' => 'Mehrusa Wholesale',
                'title_separator' => '|',
                'title_suffix' => 'Mehrusa Wholesale',
                'default_description' => 'Stainless steel jewellery for boutiques, resellers and gifting companies in Pakistan.',
                'default_keywords' => 'mehrusa, wholesale jewellery, pakistan',
                'robots_default' => 'index,follow',
                'canonical_base_url' => 'https://mehrusa.com',
                'robots_txt' => "User-agent: *\nAllow: /\nSitemap: https://mehrusa.com/sitemap.xml\n",
                'sitemap_enabled' => true,
            ]
        );

        SeoMeta::query()->updateOrCreate(
            ['route_key' => 'home'],
            [
                'meta_title' => 'Mehrusa Wholesale | Veiled in grace. Crowned in light.',
                'meta_description' => 'Mehrusa wholesale: modest stainless steel jewellery for boutiques, online stores and gifting companies in Pakistan.',
                'og_title' => 'Mehrusa Wholesale',
                'og_description' => 'Stainless steel jewellery wholesale for Pakistan boutiques and gifting companies.',
                'focus_keyword' => 'wholesale jewellery pakistan',
            ]
        );

        SeoSchemaBlock::query()->updateOrCreate(
            ['name' => 'Global Organization', 'schema_type' => 'Organization'],
            [
                'page_scope' => 'global',
                'json_ld' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'Organization',
                    'name' => 'Mehrusa',
                    'slogan' => 'Veiled in grace. Crowned in light.',
                    'description' => 'Pakistani modest-fashion and stainless steel jewellery brand, wholesale.',
                    'url' => 'https://mehrusa.com',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        SeoSchemaBlock::query()->updateOrCreate(
            ['name' => 'Global WebSite', 'schema_type' => 'WebSite'],
            [
                'page_scope' => 'global',
                'json_ld' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'WebSite',
                    'name' => 'Mehrusa Wholesale',
                    'url' => 'https://mehrusa.com',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        if (! HomepageHero::query()->exists()) {
            $hero = HomepageHero::query()->create([
                'name' => 'Default hero',
                'eyebrow' => 'Mehrusa Wholesale',
                'headline_line_1' => 'Veiled in grace.',
                'headline_line_2' => 'Crowned in light.',
                'supporting_text' => 'Modest stainless steel jewellery, made with care and boxed ready to sell.',
                'supporting_text_strong' => 'Wholesale for boutiques, online stores and gifting companies across Pakistan.',
                'primary_cta_label' => 'Browse the range',
                'primary_cta_url' => '/shop',
                'secondary_cta_label' => 'Apply for wholesale',
                'secondary_cta_url' => '/apply',
                'figcaption' => 'Protected first, then crowned',
                'is_active' => true,
            ]);

            foreach ([
                'Mix colours and sizes to reach minimums',
                'Order on WhatsApp',
                'Pay only after we confirm',
            ] as $i => $text) {
                $hero->reasons()->create(['text' => $text, 'sort_order' => $i + 1]);
            }

            $hero->ways()->createMany([
                ['label_key' => 'Know your SKUs?', 'label_value' => 'Quick order pad', 'link_url' => '/quick-order', 'is_accent' => false, 'sort_order' => 1],
                ['label_key' => 'Scanning the range?', 'label_value' => 'Line sheet view', 'link_url' => '/shop?view=table', 'is_accent' => false, 'sort_order' => 2],
                ['label_key' => 'First time buying?', 'label_value' => 'Build my first order', 'link_url' => '/start', 'is_accent' => true, 'sort_order' => 3],
            ]);
        }
    }
}
