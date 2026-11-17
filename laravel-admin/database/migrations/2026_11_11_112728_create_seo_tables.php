<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_site_defaults', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Mehrusa');
            $table->string('default_title');
            $table->string('title_separator')->default('|');
            $table->string('title_suffix')->nullable();
            $table->string('default_description', 500);
            $table->string('default_keywords', 500)->nullable();
            $table->string('default_og_image_url')->nullable();
            $table->string('robots_default')->default('index,follow');
            $table->string('canonical_base_url')->default('https://mehrusa.com');
            $table->string('twitter_handle')->nullable();
            $table->string('google_analytics_id')->nullable();
            $table->text('robots_txt')->nullable();
            $table->boolean('sitemap_enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('seo_metas', function (Blueprint $table) {
            $table->id();
            $table->string('route_key')->unique();
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('meta_keywords', 500)->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('robots')->nullable();
            $table->string('og_title')->nullable();
            $table->string('og_description', 500)->nullable();
            $table->string('og_image_url')->nullable();
            $table->string('og_type')->default('website');
            $table->string('twitter_card')->default('summary_large_image');
            $table->string('focus_keyword')->nullable();
            $table->timestamps();
        });

        Schema::create('seo_schema_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('schema_type');
            $table->string('page_scope')->default('global');
            $table->string('route_key')->nullable();
            $table->json('json_ld');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_schema_blocks');
        Schema::dropIfExists('seo_metas');
        Schema::dropIfExists('seo_site_defaults');
    }
};
