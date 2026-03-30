<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeepLink extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'alias',
        'fallback_url',
        'is_active',
        'expiry_date',
        'total_clicks',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expiry_date' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rules(): HasMany
    {
        return $this->hasMany(DeepLinkRule::class)->orderByDesc('priority');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(DeepLinkClick::class);
    }

    public function pixels(): BelongsToMany
    {
        return $this->belongsToMany(Pixel::class, 'deep_link_pixel');
    }
}
