<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class QrCode extends Model
{
    protected $table = 'qr_codes';

    protected $fillable = [
        'user_id',
        'url_id',
        'bio_id',
        'name',
        'type',
        'data',
        'style',
        'file_path',
        'scans',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'style' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function url(): BelongsTo
    {
        return $this->belongsTo(Url::class);
    }

    public function bio(): BelongsTo
    {
        return $this->belongsTo(Bio::class);
    }

    public function visits(): MorphMany
    {
        return $this->morphMany(Visit::class, 'visitable');
    }
}
