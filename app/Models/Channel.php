<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Channel extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
        'is_starred',
    ];

    protected function casts(): array
    {
        return [
            'is_starred' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function urls(): MorphToMany
    {
        return $this->morphedByMany(Url::class, 'channelable');
    }

    public function bios(): MorphToMany
    {
        return $this->morphedByMany(Bio::class, 'channelable');
    }

    public function qrCodes(): MorphToMany
    {
        return $this->morphedByMany(QrCode::class, 'channelable');
    }
}
