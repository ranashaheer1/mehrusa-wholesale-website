@extends('admin.layout')

@section('title', 'Dashboard')

@section('content')
<div class="card">
    <h1 style="margin-top:0;">Dashboard</h1>
    <p class="muted">Welcome, {{ auth()->user()->name }}. Scope: Homepage Hero + SEO admin.</p>

    <table>
        <tr><th>Module</th><th>Status</th><th></th></tr>
        <tr>
            <td>Homepage Heroes</td>
            <td>{{ $heroesCount }} total · Active: {{ $activeHero?->headline_line_1 ?? 'None' }}</td>
            <td><a href="{{ route('admin.heroes.index') }}">Open</a></td>
        </tr>
        <tr>
            <td>SEO Defaults</td>
            <td>{{ $seoDefaults ? 'Configured' : 'Missing' }}</td>
            <td><a href="{{ route('admin.seo.defaults') }}">Open</a></td>
        </tr>
        <tr>
            <td>Page SEO Meta</td>
            <td>{{ $metaCount }} routes</td>
            <td><a href="{{ route('admin.seo.meta') }}">Open</a></td>
        </tr>
        <tr>
            <td>SEO Schema blocks</td>
            <td>{{ $schemaCount }} blocks</td>
            <td><a href="{{ route('admin.seo.schema') }}">Open</a></td>
        </tr>
    </table>

    <p class="muted" style="margin-top:16px;">
        Public APIs:
        <code>/api/hero/public</code> ·
        <code>/api/seo/public?route=home</code>
    </p>
</div>
@endsection
