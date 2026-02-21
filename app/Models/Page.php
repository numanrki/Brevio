<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'seo_description',
        'is_published',
        'in_menu',
        'position',
        'lang',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'in_menu' => 'boolean',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeMenu(Builder $query): Builder
    {
        return $query->where('in_menu', true);
    }
}
