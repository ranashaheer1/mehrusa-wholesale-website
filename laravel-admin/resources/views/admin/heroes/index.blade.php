@extends('admin.layout')

@section('title', 'Homepage Heroes')

@section('content')
<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <h1 style="margin:0;">Homepage Heroes</h1>
        <a class="btn" href="{{ route('admin.heroes.create') }}">New Hero</a>
    </div>
    <p class="muted">Only one hero should be Active. Website shows the active hero via API.</p>
    <table>
        <thead>
            <tr><th>ID</th><th>Name</th><th>Headline</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
        @forelse($heroes as $hero)
            <tr>
                <td>{{ $hero->id }}</td>
                <td>{{ $hero->name }}</td>
                <td>{{ $hero->headline_line_1 }}</td>
                <td>
                    @if($hero->is_active)
                        <span class="badge">ACTIVE</span>
                    @else
                        <span class="badge badge-off">draft</span>
                    @endif
                </td>
                <td>
                    <a href="{{ route('admin.heroes.edit', $hero) }}">Edit</a>
                    @unless($hero->is_active)
                        <form style="display:inline" method="POST" action="{{ route('admin.heroes.activate', $hero) }}">
                            @csrf
                            <button class="btn-ghost" type="submit">Activate</button>
                        </form>
                    @endunless
                </td>
            </tr>
        @empty
            <tr><td colspan="5">No heroes yet. Create one.</td></tr>
        @endforelse
        </tbody>
    </table>
</div>
@endsection
