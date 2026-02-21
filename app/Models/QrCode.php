<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrCode extends Model
{
    protected $table = 'qr_codes';

    protected $fillable = [
        'user_id',
        'url_id',
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
}
