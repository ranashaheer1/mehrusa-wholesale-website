@extends('admin.layout')

@section('title', 'SEO Defaults')

@section('content')
<div class="card">
    <h1 style="margin-top:0;">SEO Site Defaults</h1>
    <p class="muted">Site-wide title, description, robots.txt and analytics defaults.</p>
    <form method="POST" action="{{ route('admin.seo.defaults.update') }}">
        @csrf
        @method('PUT')
        <div class="grid">
            <label>Site name <input name="site_name" value="{{ old('site_name', $defaults->site_name) }}" required></label>
            <label>Default title <input name="default_title" value="{{ old('default_title', $defaults->default_title) }}" required></label>
            <label>Title suffix <input name="title_suffix" value="{{ old('title_suffix', $defaults->title_suffix) }}"></label>
            <label>Title separator <input name="title_separator" value="{{ old('title_separator', $defaults->title_separator) }}" required></label>
            <label class="full">Default description <textarea name="default_description" rows="3" required>{{ old('default_description', $defaults->default_description) }}</textarea></label>
            <label class="full">Keywords <input name="default_keywords" value="{{ old('default_keywords', $defaults->default_keywords) }}"></label>
            <label>Canonical base URL <input name="canonical_base_url" value="{{ old('canonical_base_url', $defaults->canonical_base_url) }}" required></label>
            <label>Robots default <input name="robots_default" value="{{ old('robots_default', $defaults->robots_default) }}" required></label>
            <label>Twitter handle <input name="twitter_handle" value="{{ old('twitter_handle', $defaults->twitter_handle) }}"></label>
            <label>Google Analytics ID <input name="google_analytics_id" value="{{ old('google_analytics_id', $defaults->google_analytics_id) }}"></label>
            <label class="full">Default OG image URL <input name="default_og_image_url" value="{{ old('default_og_image_url', $defaults->default_og_image_url) }}"></label>
            <label><span><input type="checkbox" name="sitemap_enabled" value="1" @checked(old('sitemap_enabled', $defaults->sitemap_enabled))> Sitemap enabled</span></label>
            <label class="full">robots.txt <textarea name="robots_txt" rows="5">{{ old('robots_txt', $defaults->robots_txt) }}</textarea></label>
        </div>
        <button type="submit">Save SEO Defaults</button>
    </form>
</div>
@endsection
