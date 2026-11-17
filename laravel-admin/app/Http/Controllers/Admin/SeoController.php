<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoMeta;
use App\Models\SeoSchemaBlock;
use App\Models\SeoSiteDefault;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    public function defaults()
    {
        $defaults = SeoSiteDefault::query()->first();
        if (! $defaults) {
            $defaults = SeoSiteDefault::query()->create([
                'site_name' => 'Mehrusa',
                'default_title' => 'Mehrusa Wholesale',
                'title_separator' => '|',
                'title_suffix' => 'Mehrusa Wholesale',
                'default_description' => 'Stainless steel jewellery wholesale in Pakistan.',
                'robots_default' => 'index,follow',
                'canonical_base_url' => 'https://mehrusa.com',
                'robots_txt' => "User-agent: *\nAllow: /\n",
                'sitemap_enabled' => true,
            ]);
        }

        return view('admin.seo.defaults', compact('defaults'));
    }

    public function updateDefaults(Request $request)
    {
        $defaults = SeoSiteDefault::query()->firstOrFail();
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:160'],
            'default_title' => ['required', 'string', 'max:180'],
            'title_separator' => ['required', 'string', 'max:10'],
            'title_suffix' => ['nullable', 'string', 'max:80'],
            'default_description' => ['required', 'string', 'max:500'],
            'default_keywords' => ['nullable', 'string', 'max:500'],
            'default_og_image_url' => ['nullable', 'string', 'max:255'],
            'robots_default' => ['required', 'string', 'max:80'],
            'canonical_base_url' => ['required', 'string', 'max:255'],
            'twitter_handle' => ['nullable', 'string', 'max:80'],
            'google_analytics_id' => ['nullable', 'string', 'max:40'],
            'robots_txt' => ['nullable', 'string'],
            'sitemap_enabled' => ['nullable', 'boolean'],
        ]);
        $data['sitemap_enabled'] = $request->boolean('sitemap_enabled');
        $defaults->update($data);

        return back()->with('success', 'SEO defaults saved.');
    }

    public function meta()
    {
        $metas = SeoMeta::query()->orderBy('route_key')->get();
        $selected = request('route', 'home');
        $meta = $metas->firstWhere('route_key', $selected) ?? SeoMeta::query()->firstOrCreate(
            ['route_key' => $selected],
            [
                'meta_title' => 'Mehrusa Wholesale',
                'meta_description' => 'Wholesale jewellery for boutiques in Pakistan.',
            ]
        );

        return view('admin.seo.meta', compact('metas', 'meta'));
    }

    public function updateMeta(Request $request)
    {
        $data = $request->validate([
            'route_key' => ['required', 'string', 'max:120'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'canonical_url' => ['nullable', 'string', 'max:255'],
            'robots' => ['nullable', 'string', 'max:80'],
            'og_title' => ['nullable', 'string', 'max:180'],
            'og_description' => ['nullable', 'string', 'max:500'],
            'og_image_url' => ['nullable', 'string', 'max:255'],
            'og_type' => ['nullable', 'string', 'max:40'],
            'focus_keyword' => ['nullable', 'string', 'max:120'],
        ]);

        SeoMeta::query()->updateOrCreate(
            ['route_key' => $data['route_key']],
            $data
        );

        return redirect()->route('admin.seo.meta', ['route' => $data['route_key']])
            ->with('success', 'Page SEO meta saved.');
    }

    public function schema()
    {
        $blocks = SeoSchemaBlock::query()->orderBy('sort_order')->orderBy('id')->get();
        $block = $blocks->first() ?? new SeoSchemaBlock([
            'name' => 'Global Organization',
            'schema_type' => 'Organization',
            'page_scope' => 'global',
            'is_active' => true,
            'sort_order' => 0,
            'json_ld' => [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => 'Mehrusa',
                'slogan' => 'Veiled in grace. Crowned in light.',
                'url' => 'https://mehrusa.com',
            ],
        ]);

        return view('admin.seo.schema', compact('blocks', 'block'));
    }

    public function editSchema(SeoSchemaBlock $seo_schema_block)
    {
        $blocks = SeoSchemaBlock::query()->orderBy('sort_order')->orderBy('id')->get();
        $block = $seo_schema_block;

        return view('admin.seo.schema', compact('blocks', 'block'));
    }

    public function storeSchema(Request $request)
    {
        $this->saveSchema($request, new SeoSchemaBlock());

        return redirect()->route('admin.seo.schema')->with('success', 'Schema block created.');
    }

    public function updateSchema(Request $request, SeoSchemaBlock $seo_schema_block)
    {
        $this->saveSchema($request, $seo_schema_block);

        return redirect()->route('admin.seo.schema.edit', $seo_schema_block)
            ->with('success', 'Schema block updated.');
    }

    public function destroySchema(SeoSchemaBlock $seo_schema_block)
    {
        $seo_schema_block->delete();

        return redirect()->route('admin.seo.schema')->with('success', 'Schema block deleted.');
    }

    private function saveSchema(Request $request, SeoSchemaBlock $block): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'schema_type' => ['required', 'string', 'max:80'],
            'page_scope' => ['required', 'in:global,route'],
            'route_key' => ['nullable', 'string', 'max:120'],
            'json_ld' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $decoded = json_decode($data['json_ld'], true);
        if (! is_array($decoded)) {
            abort(422, 'JSON-LD must be valid JSON.');
        }

        $block->fill([
            'name' => $data['name'],
            'schema_type' => $data['schema_type'],
            'page_scope' => $data['page_scope'],
            'route_key' => $data['route_key'] ?? null,
            'json_ld' => $decoded,
            'is_active' => $request->boolean('is_active'),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ])->save();
    }
}
