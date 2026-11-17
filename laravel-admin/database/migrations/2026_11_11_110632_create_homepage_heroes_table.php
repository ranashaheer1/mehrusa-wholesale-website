<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_heroes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default hero');
            $table->string('eyebrow')->nullable();
            $table->string('headline_line_1');
            $table->string('headline_line_2')->nullable();
            $table->text('supporting_text');
            $table->string('supporting_text_strong')->nullable();
            $table->string('primary_cta_label');
            $table->string('primary_cta_url');
            $table->string('secondary_cta_label')->nullable();
            $table->string('secondary_cta_url')->nullable();
            $table->string('background_image_url')->nullable();
            $table->string('side_image_url')->nullable();
            $table->string('figcaption')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('homepage_hero_reasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homepage_hero_id')->constrained()->cascadeOnDelete();
            $table->string('text');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('homepage_hero_ways', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homepage_hero_id')->constrained()->cascadeOnDelete();
            $table->string('label_key');
            $table->string('label_value');
            $table->string('link_url')->nullable();
            $table->boolean('is_accent')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_hero_ways');
        Schema::dropIfExists('homepage_hero_reasons');
        Schema::dropIfExists('homepage_heroes');
    }
};
