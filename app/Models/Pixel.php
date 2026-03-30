<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pixel extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'provider',
        'pixel_id',
        'type',
        'token',
        'is_active',
        'total_fires',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fires(): HasMany
    {
        return $this->hasMany(PixelFire::class);
    }

    public function deepLinks(): BelongsToMany
    {
        return $this->belongsToMany(DeepLink::class, 'deep_link_pixel');
    }
}
