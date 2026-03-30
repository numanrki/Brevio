<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeepLinkRule extends Model
{
    protected $fillable = [
        'deep_link_id',
        'priority',
        'type',
        'value',
        'destination_url',
    ];

    public function deepLink(): BelongsTo
    {
        return $this->belongsTo(DeepLink::class);
    }
}
