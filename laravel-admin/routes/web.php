<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HeroController;
use App\Http\Controllers\Admin\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect('/admin/login'));

Route::get('/admin/login', [AuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AuthController::class, 'login'])->name('admin.login.submit');
Route::post('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');

Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/heroes', [HeroController::class, 'index'])->name('admin.heroes.index');
    Route::get('/heroes/create', [HeroController::class, 'create'])->name('admin.heroes.create');
    Route::post('/heroes', [HeroController::class, 'store'])->name('admin.heroes.store');
    Route::get('/heroes/{hero}/edit', [HeroController::class, 'edit'])->name('admin.heroes.edit');
    Route::put('/heroes/{hero}', [HeroController::class, 'update'])->name('admin.heroes.update');
    Route::post('/heroes/{hero}/activate', [HeroController::class, 'activate'])->name('admin.heroes.activate');

    Route::get('/seo/defaults', [SeoController::class, 'defaults'])->name('admin.seo.defaults');
    Route::put('/seo/defaults', [SeoController::class, 'updateDefaults'])->name('admin.seo.defaults.update');
    Route::get('/seo/meta', [SeoController::class, 'meta'])->name('admin.seo.meta');
    Route::put('/seo/meta', [SeoController::class, 'updateMeta'])->name('admin.seo.meta.update');
    Route::get('/seo/schema', [SeoController::class, 'schema'])->name('admin.seo.schema');
    Route::post('/seo/schema', [SeoController::class, 'storeSchema'])->name('admin.seo.schema.store');
    Route::get('/seo/schema/{seo_schema_block}/edit', [SeoController::class, 'editSchema'])->name('admin.seo.schema.edit');
    Route::put('/seo/schema/{seo_schema_block}', [SeoController::class, 'updateSchema'])->name('admin.seo.schema.update');
    Route::delete('/seo/schema/{seo_schema_block}', [SeoController::class, 'destroySchema'])->name('admin.seo.schema.destroy');
});
