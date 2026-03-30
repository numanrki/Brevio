<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeepLinkClick extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'deep_link_id',
        'rule_id',
        'ip',
        'country',
        'city',
        'browser',
        'os',
        'device',
        'referrer',
        'language',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'is_unique',
        'destination_url',
    ];

    protected function casts(): array
    {
        return [
            'is_unique' => 'boolean',
        ];
    }

    public function deepLink(): BelongsTo
    {
        return $this->belongsTo(DeepLink::class);
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(DeepLinkRule::class, 'rule_id');
    }
}
