<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Mehrusa Admin')</title>
    <style>
        :root { --ink:#0F1938; --gold:#B08D3C; --bg:#F4F2EE; --line:#E7E2D9; --card:#fff; --muted:#667085; }
        * { box-sizing: border-box; }
        body { margin:0; font-family:Segoe UI,system-ui,sans-serif; background:var(--bg); color:var(--ink); }
        .top { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 18px; background:var(--ink); color:#F7F4EF; }
        .top a { color:#F7F4EF; text-decoration:none; margin-right:12px; font-size:0.92rem; }
        .wrap { max-width:980px; margin:18px auto; padding:0 14px 40px; }
        .nav { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
        .nav a { padding:8px 12px; border:1px solid var(--line); background:#fff; color:var(--ink); text-decoration:none; font-size:0.9rem; }
        .nav a.active { background:var(--gold); color:#fff; border-color:var(--gold); }
        .card { background:var(--card); border:1px solid var(--line); padding:18px; }
        .flash { background:#e8f6ee; border:1px solid #b7e0c5; padding:10px 12px; margin-bottom:12px; }
        .error { color:#9b1c1c; }
        label { display:grid; gap:6px; margin-bottom:12px; font-size:0.92rem; }
        input, textarea, select, button { font:inherit; padding:10px 12px; border:1px solid var(--line); }
        button, .btn { background:var(--ink); color:#fff; border-color:var(--ink); cursor:pointer; text-decoration:none; display:inline-block; }
        .btn-ghost { background:#fff; color:var(--ink); }
        .btn-danger { background:#9b1c1c; border-color:#9b1c1c; color:#fff; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .full { grid-column:1 / -1; }
        table { width:100%; border-collapse:collapse; }
        th, td { border-bottom:1px solid var(--line); text-align:left; padding:10px 6px; font-size:0.92rem; }
        .muted { color:var(--muted); font-size:0.9rem; }
        .badge { display:inline-block; padding:2px 8px; background:#e8f6ee; color:#17663a; font-size:0.8rem; }
        .badge-off { background:#f3f3f3; color:#666; }
        @media (max-width:720px){ .grid{grid-template-columns:1fr;} .top{flex-direction:column; align-items:flex-start;} }
    </style>
</head>
<body>
<header class="top">
    <div>
        <strong>Mehrusa Admin</strong>
        <span class="muted" style="color:#c9c4b8; margin-left:8px;">Hero + SEO</span>
    </div>
    <div>
        @auth
            <span style="margin-right:10px;font-size:0.9rem;">{{ auth()->user()->name }}</span>
            <form action="{{ route('admin.logout') }}" method="POST" style="display:inline">@csrf<button class="btn-ghost" type="submit">Logout</button></form>
        @endauth
    </div>
</header>
<div class="wrap">
    @auth
        <nav class="nav">
            <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">Dashboard</a>
            <a href="{{ route('admin.heroes.index') }}" class="{{ request()->routeIs('admin.heroes.*') ? 'active' : '' }}">Homepage Hero</a>
            <a href="{{ route('admin.seo.defaults') }}" class="{{ request()->routeIs('admin.seo.defaults*') ? 'active' : '' }}">SEO Defaults</a>
            <a href="{{ route('admin.seo.meta') }}" class="{{ request()->routeIs('admin.seo.meta*') ? 'active' : '' }}">Page Meta</a>
            <a href="{{ route('admin.seo.schema') }}" class="{{ request()->routeIs('admin.seo.schema*') ? 'active' : '' }}">SEO Schema</a>
        </nav>
    @endauth

    @if(session('success'))
        <div class="flash">{{ session('success') }}</div>
    @endif

    @if($errors->any())
        <div class="flash" style="background:#fdecec;border-color:#f0b4b4;color:#9b1c1c;">
            {{ $errors->first() }}
        </div>
    @endif

    @yield('content')
</div>
</body>
</html>
