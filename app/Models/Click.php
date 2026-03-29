<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Click extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'url_id',
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
    ];

    protected function casts(): array
    {
        return [
            'is_unique' => 'boolean',
        ];
    }

    public function url(): BelongsTo
    {
        return $this->belongsTo(Url::class);
    }
}
