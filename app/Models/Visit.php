<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Visit extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'visitable_type',
        'visitable_id',
        'event_type',
        'ip',
        'country',
        'city',
        'browser',
        'os',
        'device',
        'referrer',
        'language',
        'is_unique',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'is_unique' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function visitable(): MorphTo
    {
        return $this->morphTo();
    }
}
