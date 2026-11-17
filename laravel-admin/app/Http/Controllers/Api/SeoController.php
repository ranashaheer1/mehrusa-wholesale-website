<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeoMeta;
use App\Models\SeoSchemaBlock;
use App\Models\SeoSiteDefault;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    public function public(Request $request)
    {
        $route = $request->query('route', 'home');

        return response()->json([
            'defaults' => SeoSiteDefault::query()->first(),
            'meta' => SeoMeta::query()->where('route_key', $route)->first(),
            'schemas' => SeoSchemaBlock::query()
                ->where('is_active', true)
                ->where(function ($q) use ($route) {
                    $q->where('page_scope', 'global')
                        ->orWhere(function ($q2) use ($route) {
                            $q2->where('page_scope', 'route')->where('route_key', $route);
                        });
                })
                ->orderBy('sort_order')
                ->get(),
        ]);
    }
}
