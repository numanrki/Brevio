<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $fillable = [
        'url_id',
        'reporter_email',
        'reason',
        'status',
        'admin_notes',
    ];

    public function url(): BelongsTo
    {
        return $this->belongsTo(Url::class);
    }
}
