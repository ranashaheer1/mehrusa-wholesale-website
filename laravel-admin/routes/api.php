<?php

use App\Http\Controllers\Api\HeroController;
use App\Http\Controllers\Api\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/hero/public', [HeroController::class, 'public']);
Route::get('/seo/public', [SeoController::class, 'public']);
