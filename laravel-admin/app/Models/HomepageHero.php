<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HomepageHero extends Model
{
    protected $fillable = [
        'name',
        'eyebrow',
        'headline_line_1',
        'headline_line_2',
        'supporting_text',
        'supporting_text_strong',
        'primary_cta_label',
        'primary_cta_url',
        'secondary_cta_label',
        'secondary_cta_url',
        'background_image_url',
        'side_image_url',
        'figcaption',
        'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function reasons(): HasMany
    {
        return $this->hasMany(HomepageHeroReason::class)->orderBy('sort_order');
    }

    public function ways(): HasMany
    {
        return $this->hasMany(HomepageHeroWay::class)->orderBy('sort_order');
    }
}
