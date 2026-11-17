<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomepageHeroReason extends Model
{
    protected $fillable = ['homepage_hero_id', 'text', 'sort_order'];

    public function hero(): BelongsTo
    {
        return $this->belongsTo(HomepageHero::class, 'homepage_hero_id');
    }
}