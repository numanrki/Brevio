<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Bio extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'alias',
        'avatar',
        'theme',
        'custom_css',
        'seo_title',
        'seo_description',
        'is_active',
        'is_default',
        'views',
    ];

    protected function casts(): array
    {
        return [
            'theme' => 'array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function widgets(): HasMany
    {
        return $this->hasMany(BioWidget::class);
    }

    public function visits(): MorphMany
    {
        return $this->morphMany(Visit::class, 'visitable');
    }
}
