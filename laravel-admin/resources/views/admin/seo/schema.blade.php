@extends('admin.layout')

@section('title', 'SEO Schema')

@section('content')
<div class="card">
    <h1 style="margin-top:0;">SEO Schema (JSON-LD)</h1>
    <p class="muted">schema.org structured data for Google (Organization, WebSite, etc.).</p>

    <table>
        <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Scope</th><th>Active</th><th></th></tr></thead>
        <tbody>
        @forelse($blocks as $b)
            <tr>
                <td>{{ $b->id }}</td>
                <td>{{ $b->name }}</td>
                <td>{{ $b->schema_type }}</td>
                <td>{{ $b->page_scope }} {{ $b->route_key }}</td>
                <td>{{ $b->is_active ? 'YES' : 'no' }}</td>
                <td><a href="{{ route('admin.seo.schema.edit', $b) }}">Edit</a></td>
            </tr>
        @empty
            <tr><td colspan="6">No schema blocks yet.</td></tr>
        @endforelse
        </tbody>
    </table>

    <h2>{{ $block->exists ? 'Edit block' : 'Create block' }}</h2>
    <form method="POST" action="{{ $block->exists ? route('admin.seo.schema.update', $block) : route('admin.seo.schema.store') }}">
        @csrf
        @if($block->exists) @method('PUT') @endif
        <div class="grid">
            <label>Name <input name="name" value="{{ old('name', $block->name) }}" required></label>
            <label>Schema type <input name="schema_type" value="{{ old('schema_type', $block->schema_type ?: 'Organization') }}" required></label>
            <label>Page scope
                <select name="page_scope">
                    <option value="global" @selected(old('page_scope', $block->page_scope) === 'global')>global</option>
                    <option value="route" @selected(old('page_scope', $block->page_scope) === 'route')>route</option>
                </select>
            </label>
            <label>Route key <input name="route_key" value="{{ old('route_key', $block->route_key) }}"></label>
            <label>Sort order <input type="number" name="sort_order" value="{{ old('sort_order', $block->sort_order ?? 0) }}"></label>
            <label><span><input type="checkbox" name="is_active" value="1" @checked(old('is_active', $block->is_active ?? true))> Active</span></label>
            <label class="full">JSON-LD
                <textarea name="json_ld" rows="12" required>{{ old('json_ld', json_encode($block->json_ld ?: ['@context'=>'https://schema.org','@type'=>'Organization','name'=>'Mehrusa'], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES)) }}</textarea>
            </label>
        </div>
        <button type="submit">Save Schema Block</button>
        <a class="btn btn-ghost" href="{{ route('admin.seo.schema') }}">New</a>
        @if($block->exists)
            <button form="delete-schema" class="btn-danger" type="submit" onclick="return confirm('Delete this schema block?')">Delete</button>
        @endif
    </form>
    @if($block->exists)
        <form id="delete-schema" method="POST" action="{{ route('admin.seo.schema.destroy', $block) }}">@csrf @method('DELETE')</form>
    @endif
</div>
@endsection
