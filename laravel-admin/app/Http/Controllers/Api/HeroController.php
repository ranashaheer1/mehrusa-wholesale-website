<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomepageHero;

class HeroController extends Controller
{
    public function public()
    {
        $hero = HomepageHero::query()
            ->with(['reasons', 'ways'])
            ->where('is_active', true)
            ->latest('id')
            ->first();

        if (! $hero) {
            return response()->json(['message' => 'No active homepage hero.'], 404);
        }

        return response()->json($hero);
    }
}
