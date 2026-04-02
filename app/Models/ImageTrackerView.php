<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImageTrackerView extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'image_tracker_id',
        'ip',
        'country',
        'city',
        'browser',
        'os',
        'device',
        'device_model',
        'referrer',
        'user_agent',
        'is_unique',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'is_unique' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function imageTracker(): BelongsTo
    {
        return $this->belongsTo(ImageTracker::class);
    }
}
