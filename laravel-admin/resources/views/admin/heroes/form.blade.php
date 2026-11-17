@extends('admin.layout')

@section('title', $hero->exists ? 'Edit Hero' : 'New Hero')

@section('content')
<div class="card">
    <h1 style="margin-top:0;">{{ $hero->exists ? 'Edit Hero' : 'New Hero' }}</h1>
    <form method="POST" enctype="multipart/form-data"
          action="{{ $hero->exists ? route('admin.heroes.update', $hero) : route('admin.heroes.store') }}">
        @csrf
        @if($hero->exists) @method('PUT') @endif
        <div class="grid">
            <label>Admin name <input name="name" value="{{ old('name', $hero->name) }}" required></label>
            <label><span><input type="checkbox" name="is_active" value="1" @checked(old('is_active', $hero->is_active))> Active on website</span></label>
            <label>Eyebrow <input name="eyebrow" value="{{ old('eyebrow', $hero->eyebrow) }}"></label>
            <label>Figcaption <input name="figcaption" value="{{ old('figcaption', $hero->figcaption) }}"></label>
            <label>Headline line 1 <input name="headline_line_1" value="{{ old('headline_line_1', $hero->headline_line_1) }}" required></label>
            <label>Headline line 2 <input name="headline_line_2" value="{{ old('headline_line_2', $hero->headline_line_2) }}"></label>
            <label class="full">Supporting text <textarea name="supporting_text" rows="3" required>{{ old('supporting_text', $hero->supporting_text) }}</textarea></label>
            <label class="full">Supporting strong <input name="supporting_text_strong" value="{{ old('supporting_text_strong', $hero->supporting_text_strong) }}"></label>
            <label>Primary CTA label <input name="primary_cta_label" value="{{ old('primary_cta_label', $hero->primary_cta_label) }}" required></label>
            <label>Primary CTA URL <input name="primary_cta_url" value="{{ old('primary_cta_url', $hero->primary_cta_url) }}" required></label>
            <label>Secondary CTA label <input name="secondary_cta_label" value="{{ old('secondary_cta_label', $hero->secondary_cta_label) }}"></label>
            <label>Secondary CTA URL <input name="secondary_cta_url" value="{{ old('secondary_cta_url', $hero->secondary_cta_url) }}"></label>
            <label>Background image URL <input name="background_image_url" value="{{ old('background_image_url', $hero->background_image_url) }}"></label>
            <label>Upload background image <input type="file" name="background_image" accept="image/*"></label>
            <label class="full">Side image URL <input name="side_image_url" value="{{ old('side_image_url', $hero->side_image_url) }}"></label>
            <label class="full">Reasons (one per line) <textarea name="reasons_text" rows="4">{{ old('reasons_text', $reasonsText) }}</textarea></label>
            <label class="full">Ways JSON <textarea name="ways_json" rows="8">{{ old('ways_json', $waysJson) }}</textarea></label>
        </div>
        @if($hero->background_image_url)
            <p class="muted">Current image: <code>{{ $hero->background_image_url }}</code></p>
        @endif
        <button type="submit">Save Hero</button>
        <a class="btn btn-ghost" href="{{ route('admin.heroes.index') }}">Back</a>
    </form>
</div>
@endsection
