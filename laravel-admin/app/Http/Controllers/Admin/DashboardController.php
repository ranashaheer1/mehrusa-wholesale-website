<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageHero;
use App\Models\SeoMeta;
use App\Models\SeoSchemaBlock;
use App\Models\SeoSiteDefault;

class DashboardController extends Controller
{
    public function index()
    {
        return view('admin.dashboard', [
            'heroesCount' => HomepageHero::count(),
            'activeHero' => HomepageHero::query()->where('is_active', true)->first(),
            'seoDefaults' => SeoSiteDefault::query()->exists(),
            'metaCount' => SeoMeta::count(),
            'schemaCount' => SeoSchemaBlock::count(),
        ]);
    }
}
