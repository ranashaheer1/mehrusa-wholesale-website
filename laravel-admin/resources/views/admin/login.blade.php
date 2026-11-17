@extends('admin.layout')

@section('title', 'Admin Login')

@section('content')
<div class="card" style="max-width:420px;margin:10vh auto;">
    <h1 style="margin-top:0;">Mehrusa Admin</h1>
    <p class="muted">Login to manage Homepage Hero and SEO</p>
    <form method="POST" action="{{ route('admin.login.submit') }}">
        @csrf
        <label>Email
            <input type="email" name="email" value="{{ old('email', 'admin@mehrusa.com') }}" required>
        </label>
        <label>Password
            <input type="password" name="password" required>
        </label>
        @error('email') <p class="error">{{ $message }}</p> @enderror
        <button type="submit">Login</button>
    </form>
</div>
@endsection
