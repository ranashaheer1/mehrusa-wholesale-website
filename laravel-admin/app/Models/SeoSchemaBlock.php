<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSchemaBlock extends Model
{
    protected $fillable = [
        'name', 'schema_type', 'page_scope', 'route_key',
        'json_ld', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'json_ld' => 'array',
            'is_active' => 'boolean',
        ];
    }
}