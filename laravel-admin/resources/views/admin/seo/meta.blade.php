@extends('admin.layout')

@section('title', 'Page SEO Meta')

@section('content')
<div class="card">
    <h1 style="margin-top:0;">Page SEO Meta</h1>
    <p class="muted">
        Routes:
        @foreach($metas as $m)
            <a href="{{ route('admin.seo.meta', ['route' => $m->route_key]) }}">{{ $m->route_key }}</a>@if(!$loop->last), @endif
        @endforeach
    </p>
    <form method="POST" action="{{ route('admin.seo.meta.update') }}">
        @csrf
        @method('PUT')
        <div class="grid">
            <label>Route key <input name="route_key" value="{{ old('route_key', $meta->route_key) }}" required></label>
            <label>Focus keyword <input name="focus_keyword" value="{{ old('focus_keyword', $meta->focus_keyword) }}"></label>
            <label class="full">Meta title <input name="meta_title" value="{{ old('meta_title', $meta->meta_title) }}"></label>
            <label class="full">Meta description <textarea name="meta_description" rows="3">{{ old('meta_description', $meta->meta_description) }}</textarea></label>
            <label class="full">Meta keywords <input name="meta_keywords" value="{{ old('meta_keywords', $meta->meta_keywords) }}"></label>
            <label>Canonical URL <input name="canonical_url" value="{{ old('canonical_url', $meta->canonical_url) }}"></label>
            <label>Robots <input name="robots" value="{{ old('robots', $meta->robots) }}"></label>
            <label>OG title <input name="og_title" value="{{ old('og_title', $meta->og_title) }}"></label>
            <label>OG type <input name="og_type" value="{{ old('og_type', $meta->og_type ?: 'website') }}"></label>
            <label class="full">OG description <textarea name="og_description" rows="2">{{ old('og_description', $meta->og_description) }}</textarea></label>
            <label class="full">OG image URL <input name="og_image_url" value="{{ old('og_image_url', $meta->og_image_url) }}"></label>
        </div>
        <button type="submit">Save Page Meta</button>
    </form>
</div>
@endsection
