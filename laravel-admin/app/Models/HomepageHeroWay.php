<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomepageHeroWay extends Model
{
    protected $fillable = [
        'homepage_hero_id', 'label_key', 'label_value',
        'link_url', 'is_accent', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_accent' => 'boolean'];
    }

    public function hero(): BelongsTo
    {
        return $this->belongsTo(HomepageHero::class, 'homepage_hero_id');
    }
}