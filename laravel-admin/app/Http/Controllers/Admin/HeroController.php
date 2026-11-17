<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageHero;
use Illuminate\Http\Request;

class HeroController extends Controller
{
    public function index()
    {
        $heroes = HomepageHero::query()->latest('id')->get();

        return view('admin.heroes.index', compact('heroes'));
    }

    public function create()
    {
        return view('admin.heroes.form', [
            'hero' => new HomepageHero([
                'name' => 'New hero',
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
            ]),
            'reasonsText' => "Mix colours and sizes to reach minimums\nOrder on WhatsApp\nPay only after we confirm",
            'waysJson' => json_encode([
                ['label_key' => 'Know your SKUs?', 'label_value' => 'Quick order pad', 'link_url' => '/quick-order', 'is_accent' => false],
                ['label_key' => 'Scanning the range?', 'label_value' => 'Line sheet view', 'link_url' => '/shop?view=table', 'is_accent' => false],
                ['label_key' => 'First time buying?', 'label_value' => 'Build my first order', 'link_url' => '/start', 'is_accent' => true],
            ], JSON_PRETTY_PRINT),
        ]);
    }

    public function edit(HomepageHero $hero)
    {
        $hero->load(['reasons', 'ways']);

        return view('admin.heroes.form', [
            'hero' => $hero,
            'reasonsText' => $hero->reasons->pluck('text')->implode("\n"),
            'waysJson' => json_encode($hero->ways->map(fn ($w) => [
                'label_key' => $w->label_key,
                'label_value' => $w->label_value,
                'link_url' => $w->link_url,
                'is_accent' => $w->is_accent,
            ])->values(), JSON_PRETTY_PRINT),
        ]);
    }

    public function store(Request $request)
    {
        $hero = $this->save($request, new HomepageHero());

        return redirect()->route('admin.heroes.edit', $hero)->with('success', 'Hero created.');
    }

    public function update(Request $request, HomepageHero $hero)
    {
        $this->save($request, $hero);

        return redirect()->route('admin.heroes.edit', $hero)->with('success', 'Hero updated.');
    }

    public function activate(HomepageHero $hero)
    {
        HomepageHero::query()->update(['is_active' => false]);
        $hero->update(['is_active' => true]);

        return back()->with('success', 'Hero activated for website.');
    }

    private function save(Request $request, HomepageHero $hero): HomepageHero
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'headline_line_1' => ['required', 'string', 'max:200'],
            'headline_line_2' => ['nullable', 'string', 'max:200'],
            'supporting_text' => ['required', 'string'],
            'supporting_text_strong' => ['nullable', 'string', 'max:255'],
            'primary_cta_label' => ['required', 'string', 'max:80'],
            'primary_cta_url' => ['required', 'string', 'max:255'],
            'secondary_cta_label' => ['nullable', 'string', 'max:80'],
            'secondary_cta_url' => ['nullable', 'string', 'max:255'],
            'background_image_url' => ['nullable', 'string', 'max:255'],
            'side_image_url' => ['nullable', 'string', 'max:255'],
            'figcaption' => ['nullable', 'string', 'max:200'],
            'is_active' => ['nullable', 'boolean'],
            'reasons_text' => ['nullable', 'string'],
            'ways_json' => ['nullable', 'string'],
            'background_image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('background_image')) {
            $path = $request->file('background_image')->store('heroes', 'public');
            $data['background_image_url'] = '/storage/'.$path;
        }

        $ways = json_decode($data['ways_json'] ?? '[]', true);
        if (! is_array($ways)) {
            abort(422, 'Ways JSON is invalid.');
        }

        if (! empty($data['is_active'])) {
            HomepageHero::query()->update(['is_active' => false]);
        }

        $hero->fill([
            'name' => $data['name'],
            'eyebrow' => $data['eyebrow'] ?? null,
            'headline_line_1' => $data['headline_line_1'],
            'headline_line_2' => $data['headline_line_2'] ?? null,
            'supporting_text' => $data['supporting_text'],
            'supporting_text_strong' => $data['supporting_text_strong'] ?? null,
            'primary_cta_label' => $data['primary_cta_label'],
            'primary_cta_url' => $data['primary_cta_url'],
            'secondary_cta_label' => $data['secondary_cta_label'] ?? null,
            'secondary_cta_url' => $data['secondary_cta_url'] ?? null,
            'background_image_url' => $data['background_image_url'] ?? $hero->background_image_url,
            'side_image_url' => $data['side_image_url'] ?? null,
            'figcaption' => $data['figcaption'] ?? null,
            'is_active' => ! empty($data['is_active']),
        ])->save();

        $hero->reasons()->delete();
        $lines = preg_split("/\r\n|\n|\r/", $data['reasons_text'] ?? '') ?: [];
        foreach (array_values(array_filter(array_map('trim', $lines))) as $i => $text) {
            $hero->reasons()->create(['text' => $text, 'sort_order' => $i + 1]);
        }

        $hero->ways()->delete();
        foreach (array_values($ways) as $i => $way) {
            if (empty($way['label_key']) || empty($way['label_value'])) {
                continue;
            }
            $hero->ways()->create([
                'label_key' => $way['label_key'],
                'label_value' => $way['label_value'],
                'link_url' => $way['link_url'] ?? null,
                'is_accent' => ! empty($way['is_accent']),
                'sort_order' => $i + 1,
            ]);
        }

        return $hero->fresh(['reasons', 'ways']);
    }
}
