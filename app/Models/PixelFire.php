<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PixelFire extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'pixel_id',
        'deep_link_id',
        'ip',
        'country',
        'city',
        'browser',
        'os',
        'device',
        'referrer',
        'user_agent',
        'params',
        'is_unique',
    ];

    protected function casts(): array
    {
        return [
            'params' => 'array',
            'is_unique' => 'boolean',
        ];
    }

    public function pixel(): BelongsTo
    {
        return $this->belongsTo(Pixel::class);
    }

    public function deepLink(): BelongsTo
    {
        return $this->belongsTo(DeepLink::class);
    }
}
