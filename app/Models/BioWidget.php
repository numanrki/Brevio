<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BioWidget extends Model
{
    protected $fillable = [
        'bio_id',
        'type',
        'content',
        'position',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function bio(): BelongsTo
    {
        return $this->belongsTo(Bio::class);
    }
}
