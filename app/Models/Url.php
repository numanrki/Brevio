<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Url extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'domain_id',
        'campaign_id',
        'url',
        'alias',
        'custom_alias',
        'title',
        'description',
        'og_image',
        'password',
        'expiry_date',
        'geo_targets',
        'device_targets',
        'language_targets',
        'ab_tests',
        'pixels',
        'overlay_id',
        'splash_id',
        'is_archived',
        'is_active',
        'total_clicks',
        'meta',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'geo_targets' => 'array',
            'device_targets' => 'array',
            'language_targets' => 'array',
            'ab_tests' => 'array',
            'pixels' => 'array',
            'meta' => 'array',
            'expiry_date' => 'datetime',
            'is_archived' => 'boolean',
            'is_active' => 'boolean',
            'custom_alias' => 'boolean',
        ];
    }

    /**
     * Check if the URL has expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function overlay(): BelongsTo
    {
        return $this->belongsTo(Overlay::class);
    }

    public function splash(): BelongsTo
    {
        return $this->belongsTo(SplashPage::class, 'splash_id');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(Click::class);
    }

    public function qrCodes(): HasMany
    {
        return $this->hasMany(QrCode::class);
    }
}
