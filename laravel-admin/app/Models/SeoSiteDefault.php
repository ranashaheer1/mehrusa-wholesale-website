<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSiteDefault extends Model
{
    protected $fillable = [
        'site_name',
        'default_title',
        'title_separator',
        'title_suffix',
        'default_description',
        'default_keywords',
        'default_og_image_url',
        'robots_default',
        'canonical_base_url',
        'twitter_handle',
        'google_analytics_id',
        'robots_txt',
        'sitemap_enabled',
    ];

    protected function casts(): array
    {
        return ['sitemap_enabled' => 'boolean'];
    }
}
